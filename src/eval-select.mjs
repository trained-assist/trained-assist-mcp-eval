#!/usr/bin/env node
// Level-2 selection eval (issue trained-agent-architecture#124 §6.2): a cheap LLM picks a tool from
// the NAMES-ONLY catalog — no descriptions, no argument schemas. This is the measurement the plan
// requires before any rename, because renaming without it is blind: you would be changing 280 names
// with no way to tell whether the new set is better or worse than the old one.
//
// Design constraints, all from the plan:
//   §6.2  several free profiles, up to five isolated parallel runs
//   §6.2  record the model that actually served the call — a silent fallback must not change the score
//   §6.2  provider/limit errors are `unavailable`, never a selection error
//   §7    permutation of order and added distractors must not be the thing that makes the model pass
//
// The catalog is shuffled per task and per run. A model that only works because the right answer sits
// at a fixed position fails here, which is exactly the failure mode §7 asks to rule out.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { arg, callLadder as callLadderApi, requireToken, resolveRung } from './ladder-free.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

// A pinned rung, not the `free` alias: the alias's first rungs are a paid subscription. See
// src/ladder-free.mjs and RUNNING-EVALS-WITHOUT-SPENDING-MONEY.md.
const RUNG = resolveRung();
const TASKS_FILE = arg('tasks', path.join(ROOT, 'tasks', 'selection.v1.jsonl'));
const RUNS = Math.min(5, Math.max(1, Number(arg('runs', 1))));
const CONCURRENCY = Math.min(8, Math.max(1, Number(arg('concurrency', 3))));
const DISTRACTORS = Math.max(0, Number(arg('distractors', 0)));
const LIMIT = Number(arg('limit', 0));
// Results directory for this run. Empty = out/eval.v1.*, the full-corpus baseline.
const OUT_DIR = arg('out', '');
const SEED = Number(arg('seed', 20261002));
const SHUFFLE = arg('shuffle', 'on') !== 'off';

// Deterministic PRNG so a run is reproducible from its seed — §7 wants the same corpus and the same
// catalog before/after a rename, and a shuffle you cannot reproduce is not a comparison.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function readJsonl(file) {
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

function buildPrompt(catalog, task, rand) {
  const groups = SHUFFLE ? shuffle(catalog.groups, rand) : catalog.groups.slice();
  const lines = groups.map((g) => `${g.group}/${g.subgroup}: ${g.tools.join(', ')}`);

  // Distractors: plausible-looking names that do not exist. §7 — the model must not pass by
  // pattern-matching a familiar prefix onto a real tool.
  if (DISTRACTORS > 0) {
    const fake = [];
    for (let i = 0; i < DISTRACTORS; i++) fake.push(`zzz_distractor_${i}_${Math.floor(rand() * 1e6)}`);
    lines.push(`core/distractors: ${fake.join(', ')}`);
  }

  return [
    'Ты — маршрутизатор инструментов. Ниже — полный каталог доступных инструментов в формате',
    '«группа/подгруппа: имена через запятую». Описаний и схем аргументов намеренно нет — выбирай только по именам.',
    '',
    'Правила:',
    '1. Выбери ровно один инструмент, если он есть в каталоге.',
    '2. Если подходящего инструмента нет — ответь {"tool": null, "reason": "нет подходящего инструмента"}.',
    '3. Если запрос неоднозначен и угадывать нельзя — ответь {"tool": null, "reason": "нужно уточнить запрос"}.',
    '4. Не выдумывай имена. Не выбирай инструмент только потому, что он похож по префиксу.',
    '5. Ответь строго одним JSON-объектом, без пояснений и без markdown.',
    '',
    'КАТАЛОГ:',
    ...lines,
    '',
    'ЗАПРОС ПОЛЬЗОВАТЕЛЯ:',
    task.request,
    '',
    'Ответ:',
  ].join('\n');
}

async function callLadder(prompt, timeoutMs = 120000) {
  return callLadderApi(RUNG, {
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 200,
    trace: 'mcp-eval-selection',
    temperature: 0,
    timeoutMs,
  });
}

// A model asked to pick from a grouped catalog often answers with the path it was shown —
// `documents/50-gdrive:gdrive_list_files` — rather than the bare name. That is a correct routing
// decision scored as wrong: the corpus stores bare names, so the qualified form matches nothing.
// Strip the group prefix instead. A leading group path with no tool part is left alone, since that
// is a refusal-shaped answer and `score` already treats `null` as "no tool".
function normalizeToolName(name) {
  if (typeof name !== 'string') return null;
  const s = name.trim();
  const colon = s.lastIndexOf(':');
  if (colon === -1) return s || null;
  const tail = s.slice(colon + 1).trim();
  return tail || s;
}

function parseAnswer(content) {
  const cleaned = String(content).replace(/```(?:json)?/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return { tool: null, raw: cleaned, parseError: 'no JSON object' };
  try {
    const obj = JSON.parse(cleaned.slice(start, end + 1));
    const tool = typeof obj.tool === 'string' ? normalizeToolName(obj.tool) : null;
    return { tool, reason: typeof obj.reason === 'string' ? obj.reason : '', raw: cleaned, parseError: null };
  } catch (err) {
    return { tool: null, raw: cleaned, parseError: err.message };
  }
}

function score(task, answer) {
  if (answer.parseError) return 'parse_error';
  if (task.expect === 'none') return answer.tool === null ? 'correct' : 'wrong';
  if (task.expect === 'clarify') return answer.tool === null ? 'correct' : 'wrong';
  if (task.expect === 'ambiguous') return task.accept.includes(answer.tool) ? 'correct' : 'wrong';
  return task.accept.includes(answer.tool) ? 'correct' : 'wrong';
}

async function runOne(catalog, task, runIndex) {
  const rand = mulberry32(SEED + runIndex * 100003 + hash(task.id || task.tool));
  const prompt = buildPrompt(catalog, task, rand);
  const res = await callLadder(prompt);
  if (!res.ok) {
    return {
      taskId: task.id || `gen:${task.tool}`,
      tool: task.tool || null,
      run: runIndex,
      category: task.category,
      request: task.request,
      expected: task.accept,
      expect: task.expect || 'tool',
      actual: null,
      status: 'unavailable',
      error: res.error,
      servedModel: null,
      latencyMs: res.latencyMs,
      tokens: null,
    };
  }
  const answer = parseAnswer(res.content);
  return {
    taskId: task.id || `gen:${task.tool}`,
    tool: task.tool || null,
    run: runIndex,
    category: task.category,
    request: task.request,
    expected: task.accept,
    expect: task.expect || 'tool',
    actual: answer.tool,
    reason: answer.reason,
    status: score(task, answer),
    parseError: answer.parseError,
    servedModel: res.servedModel,
    latencyMs: res.latencyMs,
    tokens: res.usage?.total_tokens ?? null,
  };
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
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

function summarize(rows) {
  const byCat = {};
  const byTool = {};
  const byModel = {};
  let unavailable = 0;
  let parseErrors = 0;
  let totalLatency = 0;
  let latencyN = 0;
  let totalTokens = 0;
  let tokenN = 0;

  for (const r of rows) {
    byCat[r.category] = byCat[r.category] || { total: 0, correct: 0, wrong: 0, unavailable: 0 };
    byCat[r.category].total++;
    if (r.status === 'correct') byCat[r.category].correct++;
    else if (r.status === 'wrong') byCat[r.category].wrong++;
    else if (r.status === 'unavailable') byCat[r.category].unavailable++;
    const key = r.taskId.startsWith('gen:') ? r.taskId : r.taskId;
    byTool[key] = byTool[key] || { total: 0, correct: 0, wrong: 0, unavailable: 0 };
    byTool[key].total++;
    if (r.status === 'correct') byTool[key].correct++;
    else if (r.status === 'wrong') byTool[key].wrong++;
    else if (r.status === 'unavailable') byTool[key].unavailable++;
    if (r.status === 'unavailable') unavailable++;
    if (r.parseError) parseErrors++;
    if (r.servedModel) {
      byModel[r.servedModel] = (byModel[r.servedModel] || 0) + 1;
    }
    if (r.latencyMs != null) {
      totalLatency += r.latencyMs;
      latencyN++;
    }
    if (r.tokens != null) {
      totalTokens += r.tokens;
      tokenN++;
    }
  }

  const scored = rows.filter((r) => r.status !== 'unavailable');
  const correct = scored.filter((r) => r.status === 'correct').length;
  return {
    total: rows.length,
    scored: scored.length,
    correct,
    wrong: scored.length - correct,
    accuracy: scored.length ? correct / scored.length : null,
    unavailable,
    parseErrors,
    byCategory: byCat,
    byTool,
    byModel,
    avgLatencyMs: latencyN ? Math.round(totalLatency / latencyN) : null,
    avgTokens: tokenN ? Math.round(totalTokens / tokenN) : null,
  };
}

function markdownReport(meta, summary, rows) {
  const pct = (n, d) => (d ? `${((100 * n) / d).toFixed(1)}%` : 'n/a');
  const lines = [];
  lines.push(`# Level-2 selection eval — ${meta.profile} profile`);
  lines.push('');
  lines.push(`Run: ${meta.at} · seed ${meta.seed} · runs ${meta.runs} · concurrency ${meta.concurrency} · shuffle ${meta.shuffle} · distractors ${meta.distractors}`);
  lines.push(`Catalog: ${meta.catalogTools} tools / ${meta.catalogGroups} groups, names-only (~${meta.catalogTokens} tokens)`);
  lines.push(`Corpus: ${meta.tasks} tasks`);
  lines.push('');
  lines.push('## Итог');
  lines.push('');
  lines.push(`| Метрика | Значение |`);
  lines.push(`|---|---|`);
  lines.push(`| Оценено (без unavailable) | ${summary.scored} / ${summary.total} |`);
  lines.push(`| Точность выбора | ${pct(summary.correct, summary.scored)} (${summary.correct}/${summary.scored}) |`);
  lines.push(`| Недоступные провайдеры | ${summary.unavailable} |`);
  lines.push(`| Ошибки парсинга ответа | ${summary.parseErrors} |`);
  lines.push(`| Средняя задержка | ${summary.avgLatencyMs ?? 'n/a'} мс |`);
  lines.push(`| Средние токены на ответ | ${summary.avgTokens ?? 'n/a'} |`);
  lines.push('');
  lines.push('## По категориям');
  lines.push('');
  lines.push(`| Категория | Всего | Верно | Ошибка | Недоступно | Точность |`);
  lines.push(`|---|---|---|---|---|---|`);
  for (const [cat, s] of Object.entries(summary.byCategory).sort()) {
    const scored = s.total - s.unavailable;
    lines.push(`| ${cat} | ${s.total} | ${s.correct} | ${s.wrong} | ${s.unavailable} | ${pct(s.correct, scored)} |`);
  }
  lines.push('');
  lines.push('## Какие модели реально отвечали');
  lines.push('');
  lines.push('Фиксируем фактически отработавшую модель: незаметный fallback не должен менять оценку.');
  lines.push('');
  lines.push(`| Модель | Ответов |`);
  lines.push(`|---|---|`);
  for (const [m, n] of Object.entries(summary.byModel).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${m} | ${n} |`);
  }
  lines.push('');
  lines.push('## Худшие инструменты');
  lines.push('');
  lines.push('Инструменты, которые маршрутизируются хуже всех. Это и есть список на переименование:');
  lines.push('не «красивое имя», а имя, по которому маршрутизатор не может понять назначение.');
  lines.push('');
  lines.push(`| Инструмент | Попыток | Верно | Точность |`);
  lines.push(`|---|---|---|---|`);
  const toolRows = Object.entries(summary.byTool)
    .map(([id, s]) => ({ id, ...s, scored: s.total - s.unavailable }))
    .filter((t) => t.scored > 0)
    .sort((a, b) => a.correct / a.scored - b.correct / b.scored || b.scored - a.scored);
  for (const t of toolRows.slice(0, 40)) {
    lines.push(`| ${t.id} | ${t.scored} | ${t.correct} | ${pct(t.correct, t.scored)} |`);
  }
  lines.push('');
  lines.push('## Ошибки выбора');
  lines.push('');
  lines.push(`| Задача | Категория | Запрос | Ожидалось | Получено |`);
  lines.push(`|---|---|---|---|---|`);
  for (const r of rows.filter((x) => x.status === 'wrong')) {
    lines.push(`| ${r.taskId} | ${r.category} | ${r.request.replace(/\|/g, '\\|')} | ${(r.expected || []).join(', ') || r.expect} | ${r.actual ?? '—'} |`);
  }
  lines.push('');
  lines.push('## Недоступные');
  lines.push('');
  for (const r of rows.filter((x) => x.status === 'unavailable')) {
    lines.push(`- ${r.taskId} (run ${r.run}): ${r.error}`);
  }
  lines.push('');
  return lines.join('\n');
}

async function main() {
  requireToken();

  const catalogFile = path.join(ROOT, 'out', 'catalog.json');
  if (!fs.existsSync(catalogFile)) {
    console.error('[eval] out/catalog.json is missing — run `node src/catalog.mjs` first');
    process.exit(2);
  }
  const catalog = JSON.parse(fs.readFileSync(catalogFile, 'utf8'));
  const allTasks = readJsonl(TASKS_FILE);
  const tasks = LIMIT > 0 ? allTasks.slice(0, LIMIT) : allTasks;

  const jobs = [];
  for (let run = 0; run < RUNS; run++) {
    for (const task of tasks) jobs.push({ task, run });
  }

  console.error(`[eval] ${tasks.length} tasks × ${RUNS} run(s) = ${jobs.length} calls, rung=${RUNG}, concurrency=${CONCURRENCY}`);
  const rows = await pool(jobs, CONCURRENCY, (job) => runOne(catalog, job.task, job.run));

  const summary = summarize(rows);
  // `--out NAME` keeps one run's rows from overwriting another's. Comparing a renamed group against
  // its own before-state needs both results on disk at once; `out/eval.v1.*` is the full-corpus
  // baseline and a 15-call group run must not clobber it.
  const outDir = OUT_DIR ? path.resolve(ROOT, OUT_DIR) : path.join(ROOT, 'out');
  const suffix = OUT_DIR ? '' : '.v1';
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `eval${suffix}.json`), JSON.stringify(rows, null, 2) + '\n');

  const meta = {
    at: new Date().toISOString(),
    rung: RUNG,
    seed: SEED,
    runs: RUNS,
    concurrency: CONCURRENCY,
    shuffle: SHUFFLE,
    distractors: DISTRACTORS,
    catalogTools: catalog.totalTools,
    catalogGroups: catalog.totalGroups,
    catalogTokens: Math.ceil(
      fs.readFileSync(path.join(ROOT, 'out', 'catalog.names-only.txt'), 'utf8').length / 4
    ),
    tasks: tasks.length,
  };
  fs.writeFileSync(path.join(outDir, `eval${suffix}.meta.json`), JSON.stringify(meta, null, 2) + '\n');
  fs.writeFileSync(path.join(outDir, `eval${suffix}.md`), markdownReport(meta, summary, rows));

  console.error(`[eval] accuracy=${summary.accuracy == null ? 'n/a' : (100 * summary.accuracy).toFixed(1) + '%'} (${summary.correct}/${summary.scored}) unavailable=${summary.unavailable} parseErrors=${summary.parseErrors}`);
  console.error(`[eval] models: ${Object.entries(summary.byModel).map(([m, n]) => `${m}×${n}`).join(', ')}`);
  console.error(`[eval] report: ${path.relative(ROOT, path.join(outDir, `eval${suffix}.md`))}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});