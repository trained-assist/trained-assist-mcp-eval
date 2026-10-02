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
// Both probes use the same free ladder profile and record the serving model, for the same reason as
// the selection eval: a silent fallback must not change the measurement.

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
const CONCURRENCY = Math.min(8, Math.max(1, Number(arg('concurrency', 3))));
const SEED = Number(arg('seed', 20261002));
const LIMIT = Number(arg('limit', 0));
const PROBES = (arg('probes', 'ab') || 'ab').split('').filter((c) => 'ab'.includes(c));

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
        'x-ladder-trace': 'mcp-eval-informativeness',
      },
      body: JSON.stringify({ model: PROFILE, messages, max_tokens: 300, stream: false, temperature: 0 }),
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
      usage: data.usage || null,
      latencyMs: Date.now() - started,
    };
  } catch (err) {
    return { ok: false, error: err.name === 'AbortError' ? 'timeout' : err.message, latencyMs: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
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

function markdown(meta, a, b, rowsA, rowsB) {
  const pct = (n, d) => (d ? `${((100 * n) / d).toFixed(1)}%` : 'n/a');
  const L = [];
  L.push(`# Name-informativeness eval — ${meta.profile}`);
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
  return L.join('\n');
}

async function main() {
  if (!LADDER_TOKEN) {
    console.error('[info] LADDER_TOKEN is not set and ~/.llm-ladder-token is missing');
    process.exit(2);
  }
  const fullFile = path.join(ROOT, 'out', 'catalog-full.json');
  if (!fs.existsSync(fullFile)) {
    console.error('[info] out/catalog-full.json is missing — run `node src/catalog.mjs` first');
    process.exit(2);
  }
  const full = JSON.parse(fs.readFileSync(fullFile, 'utf8'));
  const tools = Object.entries(full.tools)
    .map(([name, t]) => ({ name, description: t.description || '' }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const groups = JSON.parse(fs.readFileSync(path.join(ROOT, 'tasks', 'confusable-groups.v1.json'), 'utf8')).groups
    .map((g) => ({ ...g, descriptions: g.names.map((n) => tools.find((t) => t.name === n)?.description || '') }))
    .filter((g) => g.descriptions.every((d) => d.length > 0));

  const skipped = groups.filter((g) => g.descriptions.some((d) => !d));
  if (skipped.length) {
    console.error(`[info] ${skipped.length} group(s) skipped: tool missing from catalog`);
  }

  const rand = mulberry32(SEED);
  const rowsA = [];
  const rowsB = [];

  if (PROBES.includes('a')) {
    const subset = LIMIT > 0 ? tools.slice(0, LIMIT) : tools;
    console.error(`[info] Probe A: ${subset.length} tools × 2 calls (reconstruct + judge)`);
    rowsA.push(...(await pool(subset, CONCURRENCY, (t) => probeA(t, rand))));
  }
  if (PROBES.includes('b')) {
    console.error(`[info] Probe B: ${groups.length} confusable groups`);
    rowsB.push(...(await pool(groups, CONCURRENCY, (g) => probeB(g, rand))));
  }

  const sumA = summarizeA(rowsA);
  const sumB = summarizeB(rowsB);
  const outDir = path.join(ROOT, 'out');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'informativeness.v1.json'), JSON.stringify({ probeA: rowsA, probeB: rowsB }, null, 2) + '\n');

  const meta = {
    at: new Date().toISOString(),
    profile: PROFILE,
    seed: SEED,
    probes: PROBES.join(''),    tools: tools.length,
    groups: groups.length,
  };
  fs.writeFileSync(path.join(outDir, 'informativeness.v1.meta.json'), JSON.stringify(meta, null, 2) + '\n');
  fs.writeFileSync(path.join(outDir, 'informativeness.v1.md'), markdown(meta, sumA, sumB, rowsA, rowsB));

  console.error(`[info] Probe A: mean=${sumA.meanScore == null ? 'n/a' : sumA.meanScore.toFixed(2)}/4 overconfident=${sumA.overconfident}`);
  console.error(`[info] Probe B: mean=${sumB.meanAccuracy == null ? 'n/a' : (100 * sumB.meanAccuracy).toFixed(1) + '%'} (${sumB.correctNames}/${sumB.totalNames})`);
  console.error(`[info] report: out/informativeness.v1.md`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});