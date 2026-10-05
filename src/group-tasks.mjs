#!/usr/bin/env node
// Extracts the corpus phrasings that belong to one confusable group.
//
// `--limit N` slices the first N lines, which is no use when the question is "did merging THIS
// group help" — the phrasings for one group are scattered through the file. A full corpus run is
// 1579 calls; a group is 10–20. This makes the narrow measurement the default and keeps the full
// run for the final number.
//
//   node src/group-tasks.mjs --group auto-3-gdrive_list_files
//   node src/group-tasks.mjs --tools gdrive_list_files,gdrive_status
//
// The phrasings are copied verbatim — this never regenerates the corpus and never rewrites what a
// phrasing asks for. `--remap` is the one exception and it exists for a measured reason: when a group
// is resolved by MERGING, the tool a phrasing was written for no longer exists, so the correct answer
// for that phrasing becomes the surviving tool. Holding the phrasings fixed and moving only the
// expected answer is what makes the before/after comparable.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}

const CORPUS = arg('corpus', path.join(ROOT, 'tasks', 'corpus.v1.jsonl'));
const GROUPS_FILE = arg('groups', path.join(ROOT, 'tasks', 'confusable-groups.auto.json'));
// old=surviving,new=absorbed — "gdrive_public_folder=gdrive_list_files"
const REMAP = new Map(
  arg('remap', '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [from, to] = s.split('=');
      return [from, to];
    })
);

function groupNames() {
  const byTools = arg('tools', '');
  if (byTools) return byTools.split(',').map((s) => s.trim()).filter(Boolean);
  const id = arg('group', '');
  if (!id) {
    console.error('[group-tasks] pass --group <id> or --tools a,b,c');
    process.exit(2);
  }
  const payload = JSON.parse(fs.readFileSync(GROUPS_FILE, 'utf8'));
  const found = payload.groups.find((g) => g.id === id);
  if (!found) {
    console.error(`[group-tasks] no group ${id} in ${path.relative(ROOT, GROUPS_FILE)}`);
    console.error(`[group-tasks] ids: ${payload.groups.map((g) => g.id).join(', ')}`);
    process.exit(2);
  }
  return found.names;
}

function main() {
  const names = groupNames();
  const members = new Set(names);
  const lines = fs.readFileSync(CORPUS, 'utf8').trim().split('\n').map(JSON.parse);

  const picked = [];
  for (const t of lines) {
    const tool = t.tool || (t.accept && t.accept[0]);
    if (!members.has(tool)) continue;
    const task = { ...t };
    if (t.accept && t.accept.length === 1 && REMAP.has(t.accept[0])) {
      const to = REMAP.get(t.accept[0]);
      task.accept = [to];
      task.remappedFrom = t.accept[0];
    }
    picked.push(task);
  }

  const perTool = new Map();
  for (const t of picked) {
    const key = (t.accept && t.accept[0]) || '?';
    perTool.set(key, (perTool.get(key) || 0) + 1);
  }

  const id = arg('group', arg('out', path.join(ROOT, 'tasks', 'groups', `${names[0]}.jsonl`)).replace(/\.jsonl$/, ''));
  const out = arg('out', path.join(ROOT, 'tasks', 'groups', `${id || names[0]}.jsonl`));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, picked.map((t) => JSON.stringify(t)).join('\n') + '\n');

  const remapped = picked.filter((t) => t.remappedFrom).length;
  console.error(`[group-tasks] ${names.join(' / ')} → ${picked.length} phrasings (${remapped} remapped)`);
  for (const [k, n] of [...perTool].sort()) console.error(`  ${String(n).padStart(4)}  → ${k}`);
  console.error(`[group-tasks] ${out}`);
}

main();