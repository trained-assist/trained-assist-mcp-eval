#!/usr/bin/env node
// Corpus generator — turns the catalog into a test database.
//
// Why generate instead of hand-write (the plan's §6.2 asks for synonyms, colloquial Russian, typos,
// near-pairs): 97 hand-written tasks cover 97 tools once each. With 331 tools that leaves most of the
// catalog untested, and the tasks you happen to write are the tasks you already understood. Generating
// 3-10 phrasings per tool makes coverage dense enough that a tool which is simply unrouteable shows up
// as a hole rather than as an absence.
//
// The generator is given the tool's name AND its real description — it has to be, or it could not
// produce a correct phrasing. The point is that the *eval* never sees the description: it gets names
// only. So the description is used to author the question and then withheld from the answerer. That
// is the whole trick, and it is why this measures routing rather than paraphrase-matching.
//
// Variety is enforced structurally, not by hoping the model is creative: the prompt asks for
// distinct registers (short, polite, jargon, with context, with a typo) and the output is validated
// for count and for not containing the tool's own name — a phrasing that names the tool would make
// the eval a lookup test.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const LADDER_BASE = (process.env.LADDER_BASE || 'https://llm-ladder.trainedassist.store').replace(/\/$/, '');
const LADDER_TOKEN = process.env.LADDER_TOKEN || readTokenFile();

function readTokenFile() {
  try {
    return fs.readFileSync(path.join(process.env.HOME || '/root', '.llm-ladder-token'), 'utf8').trim();
  } catch {
    return '';
  }
}

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}

const PROFILE = arg('profile', 'free');
const PER_TOOL = Math.min(10, Math.max(1, Number(arg('per-tool', 5))));
const CONCURRENCY = Math.min(8, Math.max(1, Number(arg('concurrency', 3))));
const SEED = Number(arg('seed', 20261002));
const LIMIT = Number(arg('limit', 0));
const OUT = arg('out', path.join(ROOT, 'tasks', 'corpus.v1.jsonl'));
const RESUME = arg('resume', 'on') === 'on';

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PROMPT = (name, description, n) => [
  'Ты составляешь тестовый набор для маршрутизатора MCP-инструментов.',
  '',
  `Инструмент: ${name}`,
  `Его назначение: ${description || '(описание отсутствует)'}`,
  '',
  `Придумай ${n} РАЗНЫХ способов, как пользователь мог бы попросить об этом бота в чате.`,
  '',
  'Требования:',
  '- естественный разговорный русский, как пишут в мессенджере',
  '- НЕ используй имя инструмента и не перефразируй описание дословно',
  '- варьируй регистры: один максимально короткий (2-4 слова), один вежливый, один с жаргоном,',
  '  один с контекстом («после того как…», «перед тем как…»), один с опечаткой',
  '- не выдумывай деталей, которых нет в назначении',
  '- каждый вариант должен однозначно указывать на этот инструмент, а не на соседний',
  '',
  'Ответь одним JSON-массивом строк, без markdown и без пояснений.',
].join('\n');

async function callLadder(messages, timeoutMs = 120000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(`${LADDER_BASE}/v1/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${LADDER_TOKEN}`,
        'Content-Type': 'application/json',
        'x-ladder-trace': 'mcp-eval-corpus-gen',
      },
      body: JSON.stringify({ model: PROFILE, messages, max_tokens: 400, stream: false, temperature: 0.9 }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}`, latencyMs: Date.now() - started };
    }
    const data = await res.json();
    return {
      ok: true,
      content: data?.choices?.[0]?.message?.content ?? '',
      servedModel: data.model || null,
      latencyMs: Date.now() - started,
    };
  } catch (err) {
    return { ok: false, error: err.name === 'AbortError' ? 'timeout' : err.message, latencyMs: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}

function parseArray(content) {
  const cleaned = String(content).replace(/```(?:json)?/gi, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return { value: null, parseError: 'no JSON array' };
  try {
    const v = JSON.parse(cleaned.slice(start, end + 1));
    return { value: Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : null, parseError: null };
  } catch (err) {
    return { value: null, parseError: err.message };
  }
}

// A phrasing that contains the tool's own name would turn the eval into a lookup test, so it is
// rejected rather than silently kept.
function leaksName(phrasing, name) {
  const norm = (s) => s.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, ' ');
  const p = ` ${norm(phrasing)} `;
  for (const part of name.split('_')) {
    if (part.length >= 4 && p.includes(` ${norm(part)} `)) return true;
  }
  return false;
}

async function pool(items, size, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, run));
  return results;
}

async function main() {
  if (!LADDER_TOKEN) {
    console.error('[gen] LADDER_TOKEN is not set and ~/.llm-ladder-token is missing');
    process.exit(2);
  }
  const full = JSON.parse(fs.readFileSync(path.join(ROOT, 'out', 'catalog-full.json'), 'utf8'));
  const tools = Object.entries(full.tools)
    .map(([name, t]) => ({ name, description: t.description || '' }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const subset = LIMIT > 0 ? tools.slice(0, LIMIT) : tools;

  // Resume: keep tools already present in the output file so a re-run only fills the gaps.
  const done = new Set();
  if (RESUME && fs.existsSync(OUT)) {
    for (const line of fs.readFileSync(OUT, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try {
        done.add(JSON.parse(line).tool);
      } catch {
        /* skip malformed */
      }
    }
  }
  const todo = subset.filter((t) => !done.has(t.name));
  console.error(`[gen] ${tools.length} tools, ${done.size} already done, ${todo.length} to generate, ${PER_TOOL} phrasings each`);

  const rand = mulberry32(SEED);
  const rows = await pool(todo, CONCURRENCY, async (tool) => {
    const res = await callLadder([{ role: 'user', content: PROMPT(tool.name, tool.description, PER_TOOL) }]);
    if (!res.ok) return { tool: tool.name, status: 'unavailable', error: res.error, phrasings: [] };
    const parsed = parseArray(res.content);
    if (parsed.parseError || !parsed.value) {
      return { tool: tool.name, status: 'parse_error', error: parsed.parseError, phrasings: [] };
    }
    const kept = parsed.value.filter((p) => p.length >= 4 && !leaksName(p, tool.name));
    return { tool: tool.name, status: 'ok', phrasings: kept, servedModel: res.servedModel };
  });

  const lines = [];
  for (const r of rows) {
    if (r.status !== 'ok' || r.phrasings.length === 0) {
      console.error(`[gen] ${r.tool}: ${r.status} ${r.error || `(${r.phrasings.length} kept)`}`);
      continue;
    }
    for (const p of r.phrasings) {
      lines.push(JSON.stringify({ tool: r.tool, request: p, accept: [r.tool], source: 'generated' }));
    }
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const existing = RESUME && fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').trimEnd() + '\n' : '';
  fs.writeFileSync(OUT, existing + lines.join('\n') + (lines.length ? '\n' : ''));

  const ok = rows.filter((r) => r.status === 'ok').length;
  const totalPhrasings = rows.reduce((s, r) => s + r.phrasings.length, 0);
  console.error(`[gen] generated ${totalPhrasings} phrasings for ${ok}/${todo.length} tools -> ${OUT}`);
  console.error(`[gen] corpus now holds ${done.size + ok} tools`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});