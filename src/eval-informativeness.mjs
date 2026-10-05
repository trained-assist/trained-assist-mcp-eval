#!/usr/bin/env node
// Name-informativeness eval — the property the selection eval does NOT measure.
//
// src/eval-select.mjs answers "did the model pick the right name". That is matching. A name can be
// unique and still say nothing: `process_document` collides with nothing and tells you nothing. The
// property the plan actually needs (§2 «название отражает действие») is that the name alone lets a
// reader work out what the tool does. Two independent probes:
//
//   Probe A — reconstruction. Show ONLY the name, ask what the tool does, then have a judge compare
//              the guess against the tool's real description. A name that is informative produces a
//              guess that matches; an opaque name produces a fluent, plausible, wrong guess.
//
//   Probe B — discrimination. For a group of k confusable names, show the real descriptions and ask
//              which description belongs to which name. Chance is 1/k, so a 4-way group is a far
//              sharper instrument than a pair. This is the direct test of the errors in FINDINGS.md:
//              if `hh_evaluate_resume` and `hh_evaluate_candidate` are indistinguishable by name,
//              the model is at chance on that group no matter how good it is at everything else.
//
// Both probes pin the same free rung and record the serving model, for the same reason as
// the selection eval: a silent fallback must not change the measurement.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { arg, callLadder as callLadderApi, requireToken, resolveRung } from './ladder-free.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

// A pinned rung, not the `free` alias — see src/ladder-free.mjs.
const RUNG = resolveRung();
const GROUPS_FILE = arg('groups', path.join(ROOT, 'tasks', 'confusable-groups.v1.json'));
const CONCURRENCY = Math.min(8, Math.max(1, Number(arg('concurrency', 3))));
const SEED = Number(arg('seed', 20261002));
const LIMIT = Number(arg('limit', 0));
const PROBES = (arg('probes', 'abc') || 'abc').split('').filter((c) => 'abc'.includes(c));

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

async function callLadder(messages, timeoutMs = 120000) {
  return callLadderApi(RUNG, { messages, maxTokens: 300, trace: 'mcp-eval-informativeness', temperature: 0, timeoutMs });
}

function parseJson(content) {
  const cleaned = String(content).replace(/```(?:json)?/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return { value: null, parseError: 'no JSON object' };
  try {
    return { value: JSON.parse(cleaned.slice(start, end + 1)), parseError: null };
  } catch (err) {
    return { value: null, parseError: err.message };
  }
}

// ---------- Probe A: name -> description, judged against the real one ----------

const RECONSTRUCT_PROMPT = (name) => [
  'Ты видишь только имя MCP-инструмента. По имени реши, какую задачу пользователя он выполняет.',
  '',
  'Ответь одним JSON-объектом:',
  '{"guess": "<что делает инструмент, одной фразой>", "clear": <true|false>}',
  '',
  'clear=true — если по имени действительно понятно. clear=false — если имя неинформативно и ты',
  'угадываешь. Не выдумывай деталей, которых в имени нет. Без markdown, только JSON.',
  '',
  `ИНСТРУМЕНТ: ${name}`,
  '',
  'Ответ:',
].join('\n');

const JUDGE_PROMPT = (name, guess, real) => [
  'Оцени, насколько догадка о назначении инструмента совпадает с его реальным назначением.',
  '',
  `Имя инструмента: ${name}`,
  `Догадка: ${guess}`,
  `Реальное назначение: ${real}`,
  '',
  'Шкала:',
  '4 — догадка точно описывает назначение',
  '3 — в целом верно, но неточно или неполно',
  '2 — частично верно, упущено главное различие',
  '1 — почти не связано с реальным назначением',
  '0 — выдумка, описывает другой инструмент',
  '',
  'Ответь одним JSON-объектом: {"score": <0-4>, "why": "<коротко>"}. Без markdown.',
].join('\n');

async function probeA(tool, rand) {
  const res = await callLadder([{ role: 'user', content: RECONSTRUCT_PROMPT(tool.name) }]);
  if (!res.ok) {
    return { probe: 'A', name: tool.name, status: 'unavailable', error: res.error, servedModel: null };
  }
  const parsed = parseJson(res.content);
  if (parsed.parseError || !parsed.value) {
    return { probe: 'A', name: tool.name, status: 'parse_error', raw: res.content, servedModel: res.servedModel };
  }
  const guess = String(parsed.value.guess || '');
  const clear = parsed.value.clear === true;

  const judged = await callLadder([
    { role: 'user', content: JUDGE_PROMPT(tool.name, guess, tool.description || '(описание отсутствует)') },
  ]);
  if (!judged.ok) {
    return { probe: 'A', name: tool.name, status: 'unavailable', error: judged.error, guess, clear, servedModel: res.servedModel };
  }
  const j = parseJson(judged.content);
  const score = j.value && Number.isFinite(Number(j.value.score)) ? Number(j.value.score) : null;
  return {
    probe: 'A',
    name: tool.name,
    status: score == null ? 'parse_error' : 'scored',
    guess,
    clear,
    score,
    why: j.value && typeof j.value.why === 'string' ? j.value.why : '',
    servedModel: res.servedModel,
  };
}

// ---------- Probe B: which description belongs to which name ----------

function discriminationPrompt(group, order) {
  const lines = group.names.map((n, i) => `${i + 1}. ${n}`).join('\n');
  const descs = order.map((idx, i) => `${i + 1}. ${group.descriptions[idx]}`).join('\n');
  return [
    'Даны несколько MCP-инструментов и несколько описаний их назначений. Описания перемешаны.',
    'Сопоставь каждому инструменту его описание.',
    '',
    'ИНСТРУМЕНТЫ:',
    lines,
    '',
    'ОПИСАНИЯ:',
    descs,
    '',
    'Ответь JSON-объектом, где ключ — имя инструмента, значение — номер описания:',
    JSON.stringify(Object.fromEntries(group.names.map((n) => [n, 0]))),
    '',
    'Без markdown, только JSON.',
  ].join('\n');
}

async function probeB(group, rand) {
  const order = shuffle(group.names.map((_, i) => i), rand);
  const res = await callLadder([{ role: 'user', content: discriminationPrompt(group, order) }]);
  if (!res.ok) {
    return { probe: 'B', groupId: group.id, names: group.names, status: 'unavailable', error: res.error, servedModel: null };
  }
  const parsed = parseJson(res.content);
  if (parsed.parseError || !parsed.value) {
    return { probe: 'B', groupId: group.id, names: group.names, status: 'parse_error', raw: res.content, servedModel: res.servedModel };
  }
  const answers = {};
  let correct = 0;
  for (const [i, name] of group.names.entries()) {
    const given = Number(parsed.value[name]);
    const right = order.indexOf(i) + 1;
    answers[name] = given;
    if (given === right) correct++;
  }
  return {
    probe: 'B',
    groupId: group.id,
    names: group.names,
    k: group.names.length,
    chance: 1 / group.names.length,
    status: 'scored',
    correct,
    total: group.names.length,
    accuracy: correct / group.names.length,
    answers,
    servedModel: res.servedModel,
  };
}

// ---------- Probe C: closed-set routing over a confusable group ----------
//
// Probe B asks the model to match REAL DESCRIPTIONS to names. That leaks the very information the
// router will not have: `hh_evaluate_resume` is described as "из холодного поиска ... БЕЗ отклика"
// and `hh_evaluate_candidate` as "откликнулся", so the model matches on those tokens and scores 100%
// — while in real routing, with names only, the pair is genuinely hard.
//
// Probe C removes the leak and also removes the rest of the catalog. Only the k confusable names are
// visible, and the model must route real corpus phrasings to one of them. If the names distinguish the
// tools, accuracy approaches 1. If they do not, it falls to chance 1/k. A 4-way group is a far sharper
// instrument than a pair, and this is the probe that catches "these two are the same capability with
// two names" — the case the plan's §2 calls a merge, not a rename.

const ROUTE_PROMPT = (group, request) => [
  'Ты — маршрутизатор инструментов. Ниже — каталог из нескольких похожих инструментов в формате',
  '«группа: имена через запятую». Описаний нет — выбирай только по именам.',
  '',
  'Правила:',
  '1. Выбери ровно один инструмент из списка.',
  '2. Если ни один не подходит — ответь {"tool": null, "reason": "нет подходящего инструмента"}.',
  '3. Ответь строго одним JSON-объектом, без markdown.',
  '',
  'КАТАЛОГ:',
  `${group.id || 'tools'}: ${group.names.join(', ')}`,
  '',
  'ЗАПРОС ПОЛЬЗОВАТЕЛЯ:',
  request,
  '',
  'Ответ:',
].join('\n');

async function routeOne(group, phrasing, rand) {
  const res = await callLadder([{ role: 'user', content: ROUTE_PROMPT(group, phrasing.request) }]);
  if (!res.ok) {
    return { groupId: group.id, tool: phrasing.tool, request: phrasing.request, status: 'unavailable', error: res.error, servedModel: null };
  }
  const parsed = parseJson(res.content);
  if (parsed.parseError || !parsed.value) {
    return { groupId: group.id, tool: phrasing.tool, request: phrasing.request, status: 'parse_error', raw: res.content, servedModel: res.servedModel };
  }
  const got = typeof parsed.value.tool === 'string' ? parsed.value.tool : null;
  return {
    groupId: group.id,
    tool: phrasing.tool,
    request: phrasing.request,
    status: got === phrasing.tool ? 'correct' : 'wrong',
    actual: got,
    reason: typeof parsed.value.reason === 'string' ? parsed.value.reason : '',
    servedModel: res.servedModel,
  };
}

async function probeC(group, phrasings, rand) {
  const rows = await pool(phrasings, CONCURRENCY, (p) => routeOne(group, p, rand));
  const scored = rows.filter((r) => r.status !== 'unavailable');
  const correct = scored.filter((r) => r.status === 'correct').length;
  const perTool = {};
  for (const p of phrasings) perTool[p.tool] = perTool[p.tool] || { total: 0, correct: 0 };
  for (const r of rows) {
    if (!perTool[r.tool]) continue;
    perTool[r.tool].total++;
    if (r.status === 'correct') perTool[r.tool].correct++;
  }
  return {
    probe: 'C',
    groupId: group.id,
    names: group.names,
    k: group.names.length,
    chance: 1 / group.names.length,
    total: rows.length,
    scored: scored.length,
    correct,
    accuracy: scored.length ? correct / scored.length : null,
    refused: rows.filter((r) => r.actual === null).length,
    perTool,
    rows,
    why: group.why || '',
  };
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

function summarizeA(rows) {
  const scored = rows.filter((r) => r.status === 'scored');
  const byScore = {};
  for (const r of scored) byScore[r.score] = (byScore[r.score] || 0) + 1;
  const mean = scored.length ? scored.reduce((s, r) => s + r.score, 0) / scored.length : null;
  const clearTrue = scored.filter((r) => r.clear).length;
  const clearAndHigh = scored.filter((r) => r.clear && r.score >= 3).length;
  const unclearAndLow = scored.filter((r) => !r.clear && r.score <= 1).length;
  return {
    total: rows.length,
    scored: scored.length,
    unavailable: rows.filter((r) => r.status === 'unavailable').length,
    parseErrors: rows.filter((r) => r.status === 'parse_error').length,
    meanScore: mean,
    byScore,
    clearTrue,
    clearAndHigh,
    unclearAndLow,
    // The interesting number: how often the model's own confidence is justified. A name the model
    // finds clear but the judge scores low is an actively misleading name — worse than an honestly
    // opaque one, because the router will commit to it.
    overconfident: clearAndHigh === 0 && clearTrue > 0 ? 0 : scored.filter((r) => r.clear && r.score <= 1).length,
  };
}

function summarizeB(rows) {
  const scored = rows.filter((r) => r.status === 'scored');
  const totalNames = scored.reduce((s, r) => s + r.total, 0);
  const correctNames = scored.reduce((s, r) => s + r.correct, 0);
  const byGroup = {};
  for (const r of scored) {
    byGroup[r.groupId] = { k: r.k, chance: r.chance, correct: r.correct, total: r.total, accuracy: r.accuracy };
  }
  return {
    total: rows.length,
    scored: scored.length,
    unavailable: rows.filter((r) => r.status === 'unavailable').length,
    parseErrors: rows.filter((r) => r.status === 'parse_error').length,
    meanAccuracy: totalNames ? correctNames / totalNames : null,
    correctNames,
    totalNames,
    byGroup,
  };
}

function summarizeC(rows) {
  const scored = rows.filter((r) => r.scored > 0);
  const totalPhr = scored.reduce((s, r) => s + r.scored, 0);
  const correct = scored.reduce((s, r) => s + r.correct, 0);
  const byGroup = {};
  for (const r of scored) {
    byGroup[r.groupId] = {
      k: r.k,
      chance: r.chance,
      correct: r.correct,
      scored: r.scored,
      accuracy: r.accuracy,
      refused: r.refused,
      why: r.why,
    };
  }
  // How far above chance each group sits. Negative means the names are worse than useless — the
  // model is actively drawn to the wrong member of the group.
  const lift = {};
  for (const [id, g] of Object.entries(byGroup)) lift[id] = g.chance > 0 ? g.accuracy / g.chance : 0;
  return {
    total: rows.length,
    scored: scored.length,
    correct,
    totalPhr,
    meanAccuracy: totalPhr ? correct / totalPhr : null,
    atOrBelowChance: Object.entries(byGroup).filter(([, g]) => g.accuracy <= g.chance + 1e-9).map(([id]) => id),
    byGroup,
    lift,
  };
}

function markdown(meta, a, b, c, rowsA, rowsB, rowsC) {
  const pct = (n, d) => (d ? `${((100 * n) / d).toFixed(1)}%` : 'n/a');
  const L = [];
  L.push(`# Name-informativeness eval — ${meta.rung}`);
  L.push('');
  L.push(`Run: ${meta.at} · seed ${meta.seed} · probes ${meta.probes}`);
  L.push('');
  L.push('## Probe A — имя → назначение (судья против реального описания)');
  L.push('');
  L.push(`| Метрика | Значение |`);
  L.push(`|---|---|`);
  L.push(`| Инструментов | ${a.total} |`);
  L.push(`| Оценено | ${a.scored} |`);
  L.push(`| Средний балл (0–4) | ${a.meanScore == null ? 'n/a' : a.meanScore.toFixed(2)} |`);
  L.push(`| Недоступно | ${a.unavailable} |`);
  L.push(`| Ошибок парсинга | ${a.parseErrors} |`);
  L.push('');
  L.push('Распределение баллов:');
  L.push('');
  L.push(`| Балл | Инструментов |`);
  L.push(`|---|---|`);
  for (const s of [4, 3, 2, 1, 0]) L.push(`| ${s} | ${a.byScore[s] || 0} |`);
  L.push('');
  L.push(`Модель сама считает имя понятным: ${a.clearTrue} из ${a.scored}.`);
  L.push(`Из них судья согласен (балл ≥3): ${a.clearAndHigh}.`);
  L.push('');
  L.push('**Самоуверенные имена** — модель говорит «понятно», а судья ставит ≤1. Это худший класс:');
  L.push('маршрутизатор уверенно выберет не тот инструмент.');
  L.push('');
  L.push(`| Имя | Догадка | Балл | Почему |`);
  L.push(`|---|---|---|---|`);
  for (const r of rowsA.filter((x) => x.status === 'scored' && x.clear && x.score <= 1)) {
    L.push(`| ${r.name} | ${r.guess.replace(/\|/g, '\\|')} | ${r.score} | ${(r.why || '').replace(/\|/g, '\\|')} |`);
  }
  L.push('');
  L.push('**Честно непонятные имена** — модель сама признаёт, что угадывает (clear=false), и судья');
  L.push('подтверждает (балл ≤1). Такие имена хотя бы не вводят в заблуждение.');
  L.push('');
  L.push(`| Имя | Догадка | Балл |`);
  L.push(`|---|---|---|`);
  for (const r of rowsA.filter((x) => x.status === 'scored' && !x.clear && x.score <= 1)) {
    L.push(`| ${r.name} | ${r.guess.replace(/\|/g, '\\|')} | ${r.score} |`);
  }
  L.push('');
  L.push('## Probe B — сопоставление описаний именам в группах близких имён');
  L.push('');
  L.push(`| Метрика | Значение |`);
  L.push(`|---|---|`);
  L.push(`| Групп | ${b.scored} |`);
  L.push(`| Имен в группах | ${b.totalNames} |`);
  L.push(`| Средняя точность | ${pct(b.correctNames, b.totalNames)} |`);
  L.push(`| Недоступно | ${b.unavailable} |`);
  L.push('');
  L.push('Шанс для группы из k имён — 1/k. Группа, где точность на уровне шанса, означает, что имена');
  L.push('не дают маршрутизатору ничего, кроме позиции в списке.');
  L.push('');
  L.push(`| Группа | k | Шанс | Верно | Точность |`);
  L.push(`|---|---|---|---|---|`);
  for (const [id, g] of Object.entries(b.byGroup).sort((x, y) => x[1].accuracy - y[1].accuracy)) {
    L.push(`| ${id} | ${g.k} | ${(100 * g.chance).toFixed(0)}% | ${g.correct}/${g.total} | ${(100 * g.accuracy).toFixed(0)}% |`);
  }
  L.push('');
  L.push('## Probe C — маршрутизация в закрытом наборе близких имён');
  L.push('');
  L.push('Probe B показывает высокую точность, но это утечка: модель получает настоящие описания и');
  L.push('матчит по словам, которых при маршрутизации не будет. Probe C убирает обе подсказки —');
  L.push('остаются только k похожих имён и реальные формулировки корпуса.');
  L.push('');
  if (c.total === 0) {
    L.push('_Не выполнялся._');
  } else {
    L.push(`| Метрика | Значение |`);
    L.push(`|---|---|`);
    L.push(`| Групп | ${c.scored} |`);
    L.push(`| Формулировок | ${c.totalPhr} |`);
    L.push(`| Средняя точность | ${pct(c.correct, c.totalPhr)} |`);
    L.push(`| Групп на уровне шанса или ниже | ${c.atOrBelowChance.length} |`);
    L.push('');
    L.push('Группа на уровне шанса или ниже — имена не различают инструменты. Это не вопрос лучшего');
    L.push('имени, это вопрос объединения: §2 предлагает «объединить действительно одинаковые');
    L.push('возможности» либо «выделить общий инструмент с явным параметром».');
    L.push('');
    L.push(`| Группа | k | Шанс | Точность | Отказ | ×шанс | Различие |`);
    L.push(`|---|---|---|---|---|---|---|`);
    const ordered = Object.entries(c.byGroup).sort((x, y) => x[1].accuracy - y[1].accuracy);
    for (const [id, g] of ordered) {
      const atChance = g.accuracy <= g.chance + 1e-9;
      L.push(
        `| ${id}${atChance ? ' ⚠' : ''} | ${g.k} | ${(100 * g.chance).toFixed(0)}% | ${(100 * g.accuracy).toFixed(0)}% | ${g.refused} | ${c.lift[id].toFixed(1)}× | ${(g.why || '').replace(/\|/g, '\\|')} |`
      );
    }
  }
  L.push('');
  return L.join('\n');
}

async function main() {
  requireToken();
  const fullFile = path.join(ROOT, 'out', 'catalog-full.json');
  if (!fs.existsSync(fullFile)) {
    console.error('[info] out/catalog-full.json is missing — run `node src/catalog.mjs` first');
    process.exit(2);
  }
  const full = JSON.parse(fs.readFileSync(fullFile, 'utf8'));
  const tools = Object.entries(full.tools)
    .map(([name, t]) => ({ name, description: t.description || '' }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const groups = JSON.parse(fs.readFileSync(GROUPS_FILE, 'utf8')).groups
    .map((g) => ({ ...g, descriptions: g.names.map((n) => tools.find((t) => t.name === n)?.description || '') }))
    .filter((g) => g.descriptions.every((d) => d.length > 0));

  const skipped = groups.filter((g) => g.descriptions.some((d) => !d));
  if (skipped.length) {
    console.error(`[info] ${skipped.length} group(s) skipped: tool missing from catalog`);
  }

  const rand = mulberry32(SEED);
  const rowsA = [];
  const rowsB = [];
  const rowsC = [];

  if (PROBES.includes('a')) {
    const subset = LIMIT > 0 ? tools.slice(0, LIMIT) : tools;
    console.error(`[info] Probe A: ${subset.length} tools × 2 calls (reconstruct + judge)`);
    rowsA.push(...(await pool(subset, CONCURRENCY, (t) => probeA(t, rand))));
  }
  if (PROBES.includes('b')) {
    console.error(`[info] Probe B: ${groups.length} confusable groups`);
    rowsB.push(...(await pool(groups, CONCURRENCY, (g) => probeB(g, rand))));
  }
  if (PROBES.includes('c')) {
    const corpusFile = path.join(ROOT, 'tasks', 'corpus.v1.jsonl');
    if (!fs.existsSync(corpusFile)) {
      console.error('[info] Probe C needs tasks/corpus.v1.jsonl — run `node src/gen-corpus.mjs` first');
      process.exitCode = 1;
    } else {
      // Real corpus phrasings, restricted to the group's tools. This is what makes Probe C harder
      // than the selection eval: no descriptions, and no other 300 names to fall back on.
      const byTool = new Map();
      for (const line of fs.readFileSync(corpusFile, 'utf8').split('\n')) {
        if (!line.trim()) continue;
        const row = JSON.parse(line);
        if (!byTool.has(row.tool)) byTool.set(row.tool, []);
        byTool.get(row.tool).push(row);
      }
      const usable = groups.filter((g) => g.names.every((n) => byTool.has(n)));
      const missing = groups.filter((g) => !g.names.every((n) => byTool.has(n)));
      if (missing.length) {
        console.error(`[info] Probe C: ${missing.length} group(s) skipped — no corpus phrasings for ${missing.flatMap((g) => g.names.filter((n) => !byTool.has(n))).join(', ')}`);
      }
      const count = usable.reduce((s, g) => s + g.names.reduce((t, n) => t + byTool.get(n).length, 0), 0);
      console.error(`[info] Probe C: ${usable.length} groups, ${count} phrasings, closed set`);
      rowsC.push(...(await pool(usable, Math.max(1, Math.floor(CONCURRENCY / 3)), (g) => probeC(g, g.names.flatMap((n) => byTool.get(n)), rand))));
    }
  }

  const sumA = summarizeA(rowsA);
  const sumB = summarizeB(rowsB);
  const sumC = summarizeC(rowsC);
  const outDir = path.join(ROOT, 'out');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'informativeness.v1.json'),
    JSON.stringify({ probeA: rowsA, probeB: rowsB, probeC: rowsC }, null, 2) + '\n'
  );

  const meta = {
    at: new Date().toISOString(),
    rung: RUNG,
    seed: SEED,
    probes: PROBES.join(''),    tools: tools.length,
    groups: groups.length,
  };
  fs.writeFileSync(path.join(outDir, 'informativeness.v1.meta.json'), JSON.stringify(meta, null, 2) + '\n');
  fs.writeFileSync(path.join(outDir, 'informativeness.v1.md'), markdown(meta, sumA, sumB, sumC, rowsA, rowsB, rowsC));

  console.error(`[info] Probe A: mean=${sumA.meanScore == null ? 'n/a' : sumA.meanScore.toFixed(2)}/4 overconfident=${sumA.overconfident}`);
  console.error(`[info] Probe B: mean=${sumB.meanAccuracy == null ? 'n/a' : (100 * sumB.meanAccuracy).toFixed(1) + '%'} (${sumB.correctNames}/${sumB.totalNames})`);
  console.error(`[info] Probe C: mean=${sumC.meanAccuracy == null ? 'n/a' : (100 * sumC.meanAccuracy).toFixed(1) + '%'} at-or-below-chance=${sumC.atOrBelowChance.length}/${sumC.scored}`);
  console.error(`[info] report: out/informativeness.v1.md`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});