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
| `src/eval-select.mjs` | Level-2 eval: a cheap LLM picks a tool from names only. |
| `tasks/selection.v1.jsonl` | 97 Russian natural-language requests with acceptable-answer sets. |
| `FINDINGS.md` | What the baseline measured, and the naming problems it exposed. |
| `sources.json` | The 7 repos, their registries and their group names. |

## The three views, from one pass

`src/catalog.mjs` emits all of them from a single extraction, so they cannot drift (the plan's central
invariant in §3):

- `out/catalog.json` — names only, grouped. **What the router LLM sees.** ~1698 tokens.
- `out/catalog-full.json` — names + descriptions + schema presence. For diffing and for humans.
- `out/collisions.json` — hard name duplicates and ungrouped leftovers.

For scale: the full catalog with descriptions is ~27 595 tokens. Names only is 16× smaller, which is
the plan's §1 premise confirmed by measurement rather than by promise.

## Run it

```bash
# Catalog only — deterministic, no credentials, ~2s
CATALOG_REPO_ROOT=/path/to/parent node src/catalog.mjs

# Full baseline — 97 tasks × 2 runs = 194 free LLM calls, ~10 min
LADDER_TOKEN=... node src/eval-select.mjs --runs 2 --concurrency 4 --distractors 5
```

`CATALOG_REPO_ROOT` must contain one directory per repo, named after the repo
(`trained-assist-agent`, `trained-assist-hh-skill`, …). Without it the script looks next to this
repository, which is how it works on a laptop with the usual `~/Code` layout.

### Eval flags

| Flag | Default | Why it exists |
|---|---|---|
| `--runs N` | 1 (max 5) | §6.2 — up to five isolated parallel runs. |
| `--concurrency N` | 3 | Free-tier rate limits are the real constraint. |
| `--distractors N` | 0 | §7 — the model must not pass by pattern-matching a familiar prefix. |
| `--shuffle on/off` | on | §7 — a model that only works because the answer sits at a fixed position must fail. |
| `--seed N` | 20261002 | Reproducible shuffle, so before/after a rename is a real comparison. |
| `--limit N` | 0 | Smoke-test a subset. |
| `--profile` | `free` | Ladder profile. |

## Baseline

**90.7% (176/194), 0 unavailable, 0 parse errors**, served by `opencode-go/deepseek-v4-flash` with 3
calls falling through to `opencode-go/longcat-2.5-preview-free`.

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