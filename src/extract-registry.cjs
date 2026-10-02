'use strict';
// Runs INSIDE one skill repo (cwd = that repo's root) and prints the registry's tool list to
// stdout as JSON. Zero deps: node builtins plus the repo's own modules, which is why this works
// on a bare `git clone` with no `npm install` (all seven MCP skill repos expose a registry that
// requires nothing external).
//
// The registry is AUTHORITATIVE: listAllTools() already applies host-only exclusion and any
// repo-level filtering, so this file never re-decides which tools exist. Requiring the registry
// rather than parsing source is the whole point — a regex over `name:` would happily invent tools
// that are never served and miss ones that are.
//
// What this adds on top of the registry is FILE-LEVEL GROUPING. Only the core registry tags each
// tool with `module`; the six sibling registries do not attribute their tools to a file, so a
// names-only catalog would collapse 151 of 280 tools into one flat group per repo. We recover the
// file by requiring each tools/*.js and intersecting its exported keys with the authoritative set.
// Requiring every module is safe: each repo's own `npm run check` does exactly this to prove the
// modules load.

const fs = require('fs');
const path = require('path');

const REGISTRY = process.env.EXTRACT_REGISTRY || 'src/mcp-skills/registry.js';
const TOOLS_DIR = process.env.EXTRACT_TOOLS_DIR || 'src/mcp-skills/tools';

// Skill repos use two module shapes. Six of them export `tools` as a NAME→def map; the
// engineering repo exports a flat array of already-shaped tool objects instead, so a single
// module can also be one tool. Both shapes have to resolve to a list of tool names.
function exportedToolNames(mod) {
  if (!mod || typeof mod !== 'object') return [];
  if (mod.tools && typeof mod.tools === 'object' && !Array.isArray(mod.tools)) {
    return Object.keys(mod.tools);
  }
  const names = [];
  if (typeof mod.name === 'string') names.push(mod.name);
  if (Array.isArray(mod.tools)) {
    for (const t of mod.tools) if (t && typeof t.name === 'string') names.push(t.name);
  } else if (Array.isArray(mod)) {
    for (const t of mod) if (t && typeof t.name === 'string') names.push(t.name);
  }
  return names;
}

function main() {
  const registry = require(path.resolve(REGISTRY));
  const tools = typeof registry.listAllTools === 'function' ? registry.listAllTools() : registry.listTools();

  const byName = new Map();
  for (const t of tools) {
    if (!t || typeof t.name !== 'string') continue;
    byName.set(t.name, {
      name: t.name,
      description: typeof t.description === 'string' ? t.description : '',
      module: t.module || null,
      file: null,
      hasSchema: !!(t.inputSchema && t.inputSchema.properties),
    });
  }

  if (fs.existsSync(TOOLS_DIR)) {
    for (const file of fs.readdirSync(TOOLS_DIR).slice().sort()) {
      if (!file.endsWith('.js')) continue;
      let mod;
      try {
        mod = require(path.resolve(TOOLS_DIR, file));
      } catch {
        continue;
      }
      for (const name of exportedToolNames(mod)) {
        const rec = byName.get(name);
        if (rec && !rec.file) rec.file = file;
      }
    }
  }

  const list = [...byName.values()];
  const ungrouped = list.filter((t) => !t.module && !t.file).map((t) => t.name);
  process.stdout.write(JSON.stringify({ tools: list, ungrouped }));
}

main();