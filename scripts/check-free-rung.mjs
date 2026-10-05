#!/usr/bin/env node
// Zero-call check that the free-rung whitelist does what it exists to do.
//
// The bleed it guards against was a NAME that looked free and was not: `opencode-go/space-bunny-free`
// sat at the head of the `free` ladder and 2 652 of 2 653 calls landed on it. So the cases below are
// the actual rungs from config/ladders.json, not hypotheticals — the first four must be rejected.
//
//   node scripts/check-free-rung.mjs

import { DEFAULT_RUNG, isFreeRung } from '../src/ladder-free.mjs';

// Every rung of the ladder's `free` profile, verbatim from config/ladders.json.
const FREE_LADDER_RUNGS = [
  'opencode-go/space-bunny-free',
  'opencode-go/longcat-2.5-preview-free',
  'openrouter/nvidia/nemotron-3-super-120b-a12b:free',
  'openrouter/inclusionai/ling-3.0-flash-sante:free',
  'openrouter/nvidia/nemotron-3-ultra-550b-a55b:free',
  'openrouter/cohere/north-mini-code:free',
  'openrouter/dots-studio/dots-3-note-preview:free',
  'openrouter/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'opencode-zen/mimo-v2.6-flash-free',
  'opencode-zen/mimo-v2.5-free',
  'opencode-zen/big-pickle',
  'opencode-zen/nemotron-3.5-lightning-free',
];

const MUST_REJECT = [
  ...FREE_LADDER_RUNGS.filter((r) => r.startsWith('opencode-go/')),
  'opencode-zen/big-pickle',
  'free',
  'service',
  '',
];

const MUST_ACCEPT = FREE_LADDER_RUNGS.filter(
  (r) => r.startsWith('openrouter/') || (r.startsWith('opencode-zen/') && r.endsWith('-free'))
);

let failed = 0;
const check = (model, expected) => {
  const got = isFreeRung(model);
  const ok = got === expected;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  isFreeRung(${JSON.stringify(model)}) = ${got}, expected ${expected}`);
};

for (const m of MUST_REJECT) check(m, false);
for (const m of MUST_ACCEPT) check(m, true);
check(DEFAULT_RUNG, true);
if (DEFAULT_RUNG !== 'opencode-zen/mimo-v2.6-flash-free') {
  failed++;
  console.error(`FAIL  DEFAULT_RUNG moved without updating the measurement note in ladder-free.mjs`);
}

console.log('');
if (failed) {
  console.error(`check-free-rung: ${failed} case(s) wrong`);
  process.exit(1);
}
console.log(`check-free-rung: ${MUST_REJECT.length} rejected, ${MUST_ACCEPT.length} accepted, default ${DEFAULT_RUNG}`);
