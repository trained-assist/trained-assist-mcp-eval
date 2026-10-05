// The one place that decides what "free" means for every eval in this repo.
//
// Why this exists: the ladder's `free` profile is an ALIAS, not a promise. Its first two rungs are
// `opencode-go/*`, which is a paid OpenCode Go subscription billed to the account — the `-free` in
// the model name says nothing about the price. A full 2 653-call pass landed there: 2 652 of 2 653
// calls. See RUNNING-EVALS-WITHOUT-SPENDING-MONEY.md.
//
// So the rule is inverted: instead of trusting a name, we pin ONE rung and check every answer
// against a whitelist. A call that comes back from anything else is an error, never a data point.
//
// The whitelist is a property of the providers, not of this repo's taste:
//   openrouter — the public /models list marks the $0 tier with a `:free` suffix. That suffix is
//                the only reliable zero-price signal on that provider.
//   opencode-zen — the self-hosted pool marks its free tier with a `-free` suffix.
//   opencode-go — excluded on purpose. `*-free` there means "free WITH a Go subscription", and the
//                 subscription is the thing that costs money.
//
// `config/prices.json` in trained-assist-llm-ladder omits $0 rungs entirely ("Go *-free,
// OpenRouter :free, zen free are omitted → cost 0"), which is where these patterns come from.

import fs from 'node:fs';
import path from 'node:path';

const LADDER_BASE = (process.env.LADDER_BASE || 'https://llm-ladder.trainedassist.store').replace(/\/$/, '');
const LADDER_TOKEN = process.env.LADDER_TOKEN || readTokenFile();

function readTokenFile() {
  try {
    return fs.readFileSync(path.join(process.env.HOME || '/root', '.llm-ladder-token'), 'utf8').trim();
  } catch {
    return '';
  }
}

// The rung every eval pins unless told otherwise.
//
// Chosen by measurement, not by taste: all 97 hand-written tasks were routed on each candidate free
// rung, and this one came out closest to the paid baseline the previous numbers were measured on.
//
//   opencode-zen/mimo-v2.6-flash-free          87.1% (81/93),  4 unavailable
//   opencode-zen/mimo-v2.5-free                84.2% (80/95),  2 unavailable
//   openrouter/cohere/north-mini-code:free     77.3% (68/88),  9 unavailable
//   openrouter/nvidia/nemotron-3-super-120b-a12b:free  52.6% (51/97)
//   opencode-zen/nemotron-3.5-lightning-free   did not finish 97 tasks in 7 min
//
// The baseline these are compared against is 90.2% on opencode-go/space-bunny-free — a paid
// subscription model, so some drop is expected and is itself the finding: the free tier is
// measurably worse at this task, and the old numbers were flattered by the model that served them.
export const DEFAULT_RUNG = 'opencode-zen/mimo-v2.6-flash-free';

const FREE_RUNG_PATTERNS = [/^openrouter\/.+:free$/, /^opencode-zen\/.+-free$/, /^zen-pool\/.+-free$/];

// A single free-tier blip ("fetch failed", 5xx, 429) must not become a permanent `unavailable`
// row: at 1 579 calls one dropped connection otherwise shows up as a hole in the report. Retry
// transient failures only — a non-free servedModel throws and is never retried.
const TRANSIENT = (e) => /fetch failed|timeout|HTTP 5\d\d|HTTP 429|ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket hang up|UND_ERR/i.test(String(e || ''));

export async function callLadder(rung, opts) {
  let last;
  for (let attempt = 0; attempt < 4; attempt++) {
    last = await callLadderOnce(rung, opts);
    if (last.ok || !TRANSIENT(last.error)) return last;
    await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
  }
  return last;
}

export function isFreeRung(model) {
  const m = String(model || '');
  return FREE_RUNG_PATTERNS.some((re) => re.test(m));
}

export function freeRungList() {
  return FREE_RUNG_PATTERNS.map((re) => String(re));
}

// Refuse before the first call. A `--profile` that is not a pinned free rung is the exact mistake
// that cost 21 224 calls, so it is a startup error rather than a warning.
export function assertFreeRung(rung, { exitCode = 2 } = {}) {
  if (!isFreeRung(rung)) {
    console.error(`[ladder] refusing to run: "${rung}" is not a pinned free rung.`);
    console.error(`[ladder] a profile is an alias, not a price. The ladder's \`free\` alias starts`);
    console.error(`[ladder] with opencode-go/* — a paid subscription despite the -free suffix.`);
    console.error(`[ladder] pass --profile with one of:`);
    for (const re of FREE_RUNG_PATTERNS) console.error(`[ladder]   ${re}`);
    console.error(`[ladder] or leave it unset to pin ${DEFAULT_RUNG}.`);
    process.exit(exitCode);
  }
  return rung;
}

export function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}

export function resolveRung() {
  return assertFreeRung(arg('profile', DEFAULT_RUNG));
}

export function hasToken() {
  return Boolean(LADDER_TOKEN);
}

export function requireToken() {
  if (!LADDER_TOKEN) {
    console.error('[ladder] LADDER_TOKEN is not set and ~/.llm-ladder-token is missing — cannot reach the ladder');
    process.exit(2);
  }
  return LADDER_TOKEN;
}

// The ladder name `model` must be — the API takes a ladder, not a bare rung. Safety comes from
// `ladder_rung`, not from this string: with a pin the ladder collapses to exactly that one rung,
// with no failover and no health skip (ladder.js: `all = [pinRung]`). The `opencode-go/*` rungs
// at the head of a ladder are therefore unreachable. Default `free`; `--ladder build` exposes the
// `zen-pool/*` rungs, which are free but only listed on the role ladders.
const LADDER_NAME = arg('ladder', 'free');

// One call, pinned to a single rung: `ladder_rung` means "no failover", so the answer cannot
// wander onto a paid rung the way the alias did. A non-free `servedModel` throws instead of
// returning a row — a silent report of 1 579 subscription calls is the worst possible outcome,
// because the numbers look valid and nothing shows that they were paid for.
async function callLadderOnce(rung, { messages, maxTokens = 300, trace, temperature = 0, timeoutMs = 120000 }) {
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
        'x-ladder-trace': trace,
      },
      body: JSON.stringify({
        model: LADDER_NAME,
        ladder_rung: rung,
        messages,
        max_tokens: maxTokens,
        stream: false,
        temperature,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}`, latencyMs: Date.now() - started };
    }
    const data = await res.json();
    const servedModel = data.model || null;
    const content = data?.choices?.[0]?.message?.content ?? '';
    const usage = data.usage || null;
    const latencyMs = Date.now() - started;
    // Checked outside the try on purpose: this must throw, not become a row in the report.
    if (!isFreeRung(servedModel)) {
      throw new Error(
        `ladder served "${servedModel ?? 'unknown'}" for pinned rung ${rung}, which is not in the ` +
          `free whitelist. Refusing to record this call — it was not free.`
      );
    }
    return { ok: true, content, servedModel, usage, latencyMs };
  } catch (err) {
    return { ok: false, error: err.name === 'AbortError' ? 'timeout' : err.message, latencyMs: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}
