# trained-assist-mcp-eval

Names-only MCP tool catalog + Level-2 selection eval on free models. Built for
[trained-agent-architecture#124](https://github.com/trained-assist/trained-agent-architecture/issues/124)
— the plan that renames 280 MCP tools across 7 repositories so a cheap LLM can pick the right one.

**Why a separate repository.** The plan's §9 says to decide where the aggregator lives after
inventory. The inventory showed the registry, the catalogs and the Level-1 tests already live in
`trained-assist-agent`, which deploys to production and runs CI on every PR. Putting an LLM-eval
harness there would couple a free-model measurement to a production deploy pipeline. This repo shares
no runtime code with any product service, so it cannot break one by construction.

**Why it is safe to run.** All seven MCP repos are public. The catalog is built by cloning them and
requiring their registries — no `npm install`, no credentials, no product endpoint. The LLM calls go
to the `free` profile of `llm-ladder`, which is free-tier models only.

## What is here

| Path | Purpose |
|---|---|
| `src/extract-registry.cjs` | Runs inside one skill repo, prints its registry's tool list as JSON. The registry is authoritative — this never re-decides which tools exist. |
| `src/catalog.mjs` | Builds the names-only catalog from all 7 repos. Deterministic: same commits in, byte-identical file out. |
| `src/gen-corpus.mjs` | Generates 3–10 natural phrasings per tool — the test database. |
| `src/eval-select.mjs` | Level-2 eval: a cheap LLM picks a tool from names only. |
| `src/eval-informativeness.mjs` | Probes whether the *name alone* conveys what the tool does, as opposed to whether the model picked right. |
| `tasks/corpus.v1.jsonl` | Generated corpus — 1579 phrasings across 327 tools. |
| `tasks/selection.v1.jsonl` | 97 hand-written Russian requests, kept as a second opinion. |
| `tasks/confusable-groups.v1.json` | Groups of confusable names for Probe B. |
| `FINDINGS.md` | What the 97-task baseline measured. |
| `FINDINGS-corpus.md` | What the generated corpus measured — the sharper result. |
| `sources.json` | The 7 repos, their registries and their group names. |

## Two corpora, because they disagree

| Corpus | Tasks | Accuracy |
|---|---|---|
| `tasks/selection.v1.jsonl` — hand-written | 97 | **90.2%** |
| `tasks/corpus.v1.jsonl` — generated, 5 phrasings per tool | 1579 | **66.9%** |

The hand-written number was flattering: I wrote tasks for tools I already understood, and the
phrasings came out easy. The 23-point gap is the instrument working. Trust the generated corpus.

The distribution is bimodal rather than uniformly mediocre, which makes the work additive: **140
tools route 100% of the time, 45 tools route 0% of the time.** Those 45 are the worklist.

Of 523 errors, **216 (41%) are the model saying "no suitable tool" when one exists** — refusal, not
misfire. That is a different bug from choosing wrongly, and the plan currently conflates them.

## Name informativeness — a different property from picking correctly

`src/eval-select.mjs` measures whether the model picked the right name. That is *matching*. A name can
be unique and say nothing at all — `process_document` collides with nothing and tells you nothing.

- **Probe A — reconstruction.** Show only the name, ask what the tool does, then have a judge compare
  the guess against the tool's real description. Mean **2.88 / 4** over 330 tools, with 9 names the
  model calls "clear" that the judge scores ≤1 — actively misleading, because the router will commit
  to them.
- **Probe B — discrimination.** For a group of *k* confusable names, match real descriptions to names.
  Chance is 1/k. This came out at 94.4%, which **contradicts** the earlier claim that
  `hh_evaluate_resume` / `hh_evaluate_candidate` are indistinguishable: given the descriptions, the
  model matches them reliably. The leak is that Probe B hands the model the descriptions, so it matches
  on shared tokens instead of reasoning from the name. Probe A is the instrument that isolates the name.

## The three views, from one pass

`src/catalog.mjs` emits all of them from a single extraction, so they cannot drift (the plan's central
invariant in §3):

- `out/catalog.json` — names only, grouped. **What the router LLM sees.** ~1698 tokens.
- `out/catalog-full.json` — names + descriptions + schema presence. For diffing and for humans.
- `out/collisions.json` — hard name duplicates and ungrouped leftovers.

For scale: the full catalog with descriptions is ~33 603 tokens. Names only is 16× smaller, which is
the plan's §1 premise confirmed by measurement rather than by promise.

## Run it

```bash
# Catalog only — deterministic, no credentials, ~2s
CATALOG_REPO_ROOT=/path/to/parent node src/catalog.mjs

# Generate the test database (1579 phrasings, ~1650 LLM calls)
node src/gen-corpus.mjs --per-tool 5 --concurrency 4

# Route the generated corpus — 1579 free LLM calls
node src/eval-select.mjs --tasks tasks/corpus.v1.jsonl --runs 1 --concurrency 5

# Route the hand-written corpus — 97 calls
node src/eval-select.mjs --runs 2 --concurrency 4 --distractors 5

# Name informativeness (2 probes, 660 calls)
node src/eval-informativeness.mjs --concurrency 4
```

`CATALOG_REPO_ROOT` must contain one directory per repo, named after the repo
(`trained-assist-agent`, `trained-assist-hh-skill`, …). Without it the script looks next to this
repository, which is how it works on a laptop with the usual `~/Code` layout.

### Eval flags

| Flag | Default | Why it exists |
|---|---|---|
| `--tasks FILE` | `tasks/selection.v1.jsonl` | Point at the generated corpus instead. |
| `--runs N` | 1 (max 5) | §6.2 — up to five isolated parallel runs. |
| `--concurrency N` | 3 | Free-tier rate limits are the real constraint. |
| `--distractors N` | 0 | §7 — the model must not pass by pattern-matching a familiar prefix. |
| `--shuffle on/off` | on | §7 — a model that only works because the answer sits at a fixed position must fail. |
| `--seed N` | 20261002 | Reproducible shuffle, so before/after a rename is a real comparison. |
| `--limit N` | 0 | Smoke-test a subset. |
| `--profile` | `free` | Ladder profile. |

## Baseline

**90.2% (175/194), 0 unavailable, 0 parse errors**, served by `opencode-go/deepseek-v4-flash` with 3
calls falling through to `opencode-go/longcat-2.5-preview-free`.

An independent CI run of the same corpus, same seed, same model gave **89.2% (173/194)** — about one
percentage point of run-to-run variance on free-tier providers. So do not implement §7's "no
regression" as exact equality: below ~1 pp is indistinguishable from noise, above ~2 pp is a signal.

That number is the gate for the rename: a new name set must not make it worse on the same corpus.
See [`FINDINGS.md`](FINDINGS.md) for what the errors actually are — the short version is that the
bottleneck is **name informativeness**, not catalog size.

## CI

Two jobs, because they cost different things:

- **`catalog`** — every PR. Builds the catalog, fails on a hard duplicate or an ungrouped tool.
  No credentials.
- **`eval`** — schedule (every 6 h) and dispatch only. Needs `LADDER_TOKEN` as a repository secret,
  which is why it never runs on a PR: a fork must not be able to spend the token.

## Adding a task

One JSON object per line in `tasks/selection.v1.jsonl`:

```json
{"id":"syn-100","category":"synonym","request":"покажи вакансии","accept":["hh_list_vacancies"]}
```

`expect` is `tool` by default; set it to `none` (no suitable tool exists), `clarify` (the request is
too vague to answer) or `ambiguous` (several answers are equally correct). `accept` is the set of
correct answers — a model picking any of them is right, per §6.2 «несколько правильных инструментов
не считать ошибкой автоматически».

Categories: `direct`, `synonym`, `typo`, `similar`, `access`, `no_tool`, `ambiguous`.