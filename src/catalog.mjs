#!/usr/bin/env node
// Builds the names-only tool catalog that the cheap router LLM is supposed to choose from.
//
// Why a builder at all (issue trained-agent-architecture#124 §1, §3): every MCP skill repo already
// has a working registry, but there is no single place that enumerates all of them, so "the full
// catalog" has never been one artifact. This produces it — deterministically, offline, from a bare
// clone of each public repo. No server, no credentials, no product endpoint.
//
// Three views, all derived from ONE pass so they cannot drift (the plan's central invariant):
//   catalog.json        names-only, grouped — what the router LLM sees (§1 stage 1)
//   catalog-full.json   names + descriptions + schema presence — for diffing and for humans
//   collisions.json     hard name duplicates and ungrouped leftovers — the machine-checkable part
//                       of §5. Semantic near-duplication is deliberately NOT here: that needs an
//                       LLM and belongs to the eval, not to a deterministic gate.
//
// Determinism: sources are visited in `sources.json` order, tools are sorted by name inside each
// group, groups are sorted by name. Re-running on unchanged commits produces a byte-identical file,
// which is what lets a PR diff the catalog and lets a rename be reviewed as a rename.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const EXTRACTOR = path.join(HERE, 'extract-registry.cjs');

// Same chars/4 heuristic the rest of the org uses (trained-assist-agent src/prompt-audit.js
// estimateTokens, and src/mcp-tool-tokens.js for MCP tool weight). An approximation on purpose:
// §7 wants the token budget measured and compared before/after a rename, not billed exactly.
const estimateTokens = (s) => Math.ceil(s.length / 4);

function repoDir(repo) {
  const name = repo.split('/')[1];
  return process.env.CATALOG_REPO_ROOT
    ? path.join(process.env.CATALOG_REPO_ROOT, name)
    : path.join(ROOT, '..', name);
}

function headCommit(dir) {
  try {
    return execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function extractSource(src) {
  const dir = repoDir(src.repo);
  if (!fs.existsSync(dir)) {
    return { src, ok: false, reason: `checkout missing: ${dir}`, commit: null, tools: [], ungrouped: [] };
  }
  let raw;
  try {
    raw = execFileSync(process.execPath, [EXTRACTOR], {
      cwd: dir,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
      env: {
        ...process.env,
        EXTRACT_REGISTRY: src.registry,
        EXTRACT_TOOLS_DIR: src.toolsDir,
        // Never inherit a live user context: an empty USER_ID keeps readiness-gated tools in the
        // authoritative list instead of dropping them, which is what a catalog wants.
        USER_ID: '',
      },
    });
  } catch (err) {
    return { src, ok: false, reason: `extractor failed: ${err.message.split('\n')[0]}`, commit: headCommit(dir), tools: [], ungrouped: [] };
  }
  const parsed = JSON.parse(raw);
  return { src, ok: true, reason: null, commit: headCommit(dir), tools: parsed.tools, ungrouped: parsed.ungrouped };
}

function groupKey(tool) {
  if (tool.module) return String(tool.module).replace(/\.js$/, '');
  if (tool.file) return String(tool.file).replace(/\.js$/, '');
  return 'ungrouped';
}

function main() {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'sources.json'), 'utf8'));
  const results = cfg.sources.map(extractSource);

  const missing = results.filter((r) => !r.ok);
  for (const r of missing) {
    console.error(`[catalog] SKIP ${r.src.repo}: ${r.reason}`);
  }

  // ---- duplicate detection across sources (plan §5, deterministic part) ----
  const owner = new Map();
  for (const r of results) {
    for (const t of r.tools) {
      if (!owner.has(t.name)) owner.set(t.name, []);
      owner.get(t.name).push(r.src.id);
    }
  }
  const duplicates = [...owner.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([name, ids]) => ({ name, sources: ids.sort() }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // ---- assemble the grouped view ----
  const groups = [];
  const byName = {};
  for (const r of results) {
    if (!r.ok) continue;
    const byGroup = new Map();
    for (const t of r.tools) {
      const key = groupKey(t);
      if (!byGroup.has(key)) byGroup.set(key, []);
      byGroup.get(key).push(t);
    }
    for (const key of [...byGroup.keys()].sort()) {
      const tools = byGroup.get(key).sort((a, b) => a.name.localeCompare(b.name));
      groups.push({
        group: r.src.group,
        subgroup: key,
        source: r.src.id,
        repo: r.src.repo,
        commit: r.commit,
        tools: tools.map((t) => t.name),
      });
    }
    for (const t of r.tools) {
      byName[t.name] = {
        source: r.src.id,
        group: r.src.group,
        subgroup: groupKey(t),
        description: t.description,
        hasSchema: t.hasSchema,
      };
    }
  }
  groups.sort((a, b) => a.group.localeCompare(b.group) || a.subgroup.localeCompare(b.subgroup));

  const names = groups.flatMap((g) => g.tools);
  const catalog = {
    generatedFrom: results
      .filter((r) => r.ok)
      .map((r) => ({ id: r.src.id, repo: r.src.repo, commit: r.commit, tools: r.tools.length })),
    totalTools: names.length,
    totalGroups: groups.length,
    groups,
  };

  const full = {
    ...catalog,
    tools: Object.fromEntries(Object.entries(byName).sort(([a], [b]) => a.localeCompare(b))),
  };

  const ungrouped = results.flatMap((r) => (r.ok ? r.ungrouped.map((n) => ({ source: r.src.id, name: n })) : []));
  const collisions = {
    hardDuplicates: duplicates,
    ungroupedTools: ungrouped,
    note: 'Semantic near-duplication is not detected here — it needs an LLM and lives in tasks/ + src/eval-select.mjs.',
  };

  const outDir = path.join(ROOT, 'out');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
  fs.writeFileSync(path.join(outDir, 'catalog-full.json'), JSON.stringify(full, null, 2) + '\n');
  fs.writeFileSync(path.join(outDir, 'collisions.json'), JSON.stringify(collisions, null, 2) + '\n');

  // The names-only catalog as the router would receive it. This is the artifact whose size the
  // plan's §7 token budget is about — measured, not promised.
  const asRouterSees = groups.map((g) => `${g.group}/${g.subgroup}: ${g.tools.join(', ')}`).join('\n');
  fs.writeFileSync(path.join(outDir, 'catalog.names-only.txt'), asRouterSees + '\n');

  console.log(`[catalog] tools=${catalog.totalTools} groups=${catalog.totalGroups} sources=${results.filter((r) => r.ok).length}/${results.length}`);
  console.log(`[catalog] names-only catalog: ${asRouterSees.length} chars ~ ${estimateTokens(asRouterSees)} tokens (chars/4)`);
  const fullChars = JSON.stringify(full.tools).length;
  console.log(`[catalog] full (names+descriptions): ${fullChars} chars ~ ${estimateTokens(JSON.stringify(full.tools))} tokens`);
  if (duplicates.length) {
    console.log(`[catalog] HARD DUPLICATES: ${duplicates.map((d) => `${d.name} [${d.sources.join('+')}]`).join(', ')}`);
  }
  if (ungrouped.length) console.log(`[catalog] ungrouped tools: ${ungrouped.map((u) => u.name).join(', ')}`);
  if (missing.length) {
    console.error(`[catalog] ${missing.length} source(s) unavailable — catalog is incomplete`);
    process.exitCode = 1;
  }
}

main();