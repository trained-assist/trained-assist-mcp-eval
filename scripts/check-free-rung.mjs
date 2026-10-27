import { DEFAULT_RUNG, isFreeRung } from '../src/ladder-free.mjs';

// Every rung of the ladder's `free` profile, verbatim from config/ladders.json
// (updated 2026-10-27, #13: the opencode-zen/* rungs left the profile on 2026-10-07,
//  zen-rings/* took their place; opencode-go/longcat... is gone too, beam-free leads).
const FREE_LADDER_RUNGS = [
  'opencode-go/beam-free',
  'zen-rings/nemotron-3-ultra-free',
  'zen-rings/mimo-v2.6-flash-free',
  'openrouter/nvidia/nemotron-3-super-120b-a12b:free',
  'openrouter/inclusionai/ling-3.0-flash-sante:free',
  'openrouter/nvidia/nemotron-3-ultra-550b-a55b:free',
  'openrouter/cohere/north-mini-code:free',
  'openrouter/dots-studio/dots-3-note-preview:free',
  'openrouter/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'zen-rings/nemotron-3.5-lightning-free',
  'zen-rings/big-pickle',
];

const MUST_REJECT = [
  ...FREE_LADDER_RUNGS.filter((r) => r.startsWith('opencode-go/')),
  // The retired prefix must stay rejected: a ladder serving opencode-zen/* today would be a
  // config regression, and recording it as "free" would silently resurrect a dead rung (#13).
  'opencode-zen/mimo-v2.6-flash-free',
  'opencode-zen/big-pickle',
  'free',
  'service',
  '',
];

const MUST_ACCEPT = FREE_LADDER_RUNGS.filter(
  (r) => r.startsWith('openrouter/') || r.startsWith('zen-rings/'),
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

console.log('');
if (failed) {
  console.error(`check-free-rung: ${failed} case(s) wrong`);
  process.exit(1);
}
console.log(`check-free-rung: ${MUST_REJECT.length} rejected, ${MUST_ACCEPT.length} accepted, default ${DEFAULT_RUNG}`);
