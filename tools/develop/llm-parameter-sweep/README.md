# llm-parameter-sweep

Records which parameter values each vendor API accepts, per model. For every vendor it lists the models
through the production `listModelsRunDispatch`, then sends one minimal non-streaming request per
(model, sweep, value) through the production AIX dispatch (`createChatGenerateDispatch`, the real adapter and
parser) with the prompt "just say `hi`", and classifies each response. Function-calling probes run alongside.
Passing values go to one committed JSON file per dialect, which `/verify-parameters` diffs against the model
definitions in `src/modules/llms/server/`.

## Usage (from the repo root)

```bash
tools/develop/llm-parameter-sweep/sweep.sh --help
tools/develop/llm-parameter-sweep/sweep.sh                                       # auto-detects sweep-config.json
tools/develop/llm-parameter-sweep/sweep.sh --config path/to/config.json
tools/develop/llm-parameter-sweep/sweep.sh --dialect metaai --key "$METAAI_API_KEY" --model-filter muse-spark
tools/develop/llm-parameter-sweep/sweep.sh --dialect openai --key sk-... --model-filter gpt-5 --max-models 1 --sweep-filter temperature
```

`sweep.sh` changes to the repo root, sets `SUPPRESS_FETCHER_LOGS=1` (silences the server fetcher's error
logging in `trpc.router.fetchers.ts`, the sweep reports errors itself) and runs
`npx -y tsx tools/develop/llm-parameter-sweep/sweep.ts "$@"`. Relative `--config` paths resolve from the repo root.

| flag | effect |
|---|---|
| `--config`, `-c <path>` | config file (see below) |
| `--dialect`, `-d <name>` | single-vendor mode with `--key`; with a config, runs only vendors of that dialect |
| `--key <key>` | API key for single-vendor mode |
| `--host <url>` | custom host for single-vendor mode (ollama defaults to `http://127.0.0.1:11434`) |
| `--model-filter`, `-m <re>` | case-insensitive regex on model id or label, applied after the config prefix filter |
| `--sweep-filter <csv>` | run only these sweep and probe names (`fn` selects the three tool probes) |
| `--delay <ms>` | default 1000; parallel mode waits between sweeps, `--sequential` between values. The config's `delayMs` overrides it |
| `--max-models <n>` | first n models per vendor after filtering (default 100) |
| `--sequential` | one value at a time (default: all values of a sweep in parallel) |
| `--merge-models` | merge into the existing results file instead of overwriting |
| `--verbose`, `-v` | response or error detail under each sweep line |
| `--debug` | request body under each sweep line |
| `--include-symlinks` | keep models whose label carries the symlink marker (excluded by default) |
| `--dry-run` | print the values each sweep would test; sends no generation requests and writes nothing, but still lists models (a live call) |
| `--help` | usage, the sweep table and the probe table |

Unknown arguments exit 1. With neither `--config` nor `--dialect` plus `--key`, the script uses
`sweep-config.json` next to `sweep.ts` if it exists, and exits 1 otherwise.

## Prerequisites

- Node per `package.json` `engines` (22, 24 or 26; `.nvmrc` pins 26). `tsx` comes from the npx cache.
- Keys come only from `--key` or the config file's `access` objects. `sweep.ts` reads no environment
  variables and no `.env.api-keys`; load a key into a shell variable in the same command if needed. `--key`
  puts the value on the process argv; the config file avoids that.
- Cost and time: every value is a real request, tool probes are 3 to 4 requests per model. A full vendor takes
  about 15 minutes (estimate in the `verify-parameters` skill).

## Config file

`cp tools/develop/llm-parameter-sweep/sweep-config.template.json tools/develop/llm-parameter-sweep/sweep-config.json`
and fill in the keys. `sweep-config.json` is gitignored. Keys starting with `_` are comments.

- `delayMs` - delay between sweeps; overrides `--delay`
- `maxTokens` - base `maxTokens` per request (default 1024)
- `vendors.<name>.access` - an `AixAPI_Access` object (`dialect` plus that dialect's key and host fields)
- `vendors.<name>.sweeps` - sweep names to run; omitted or empty runs every sweep applicable to the dialect.
  Tool probes run regardless of this list (opt out with `--sweep-filter`). Unknown names warn and are skipped.
  The template's `__AUTO_IGNORE_sweeps` on openrouter is a disabled key, so that vendor runs all applicable sweeps
- `vendors.<name>.modelFilter` - model id prefix or list of prefixes. Without it and without `--model-filter`,
  openai defaults to `gpt-5`, `gpt-6`, `o` and openrouter to `anthropic/claude`, `openai/gpt-5`, `google/gemini`
- `vendors.<name>.baseModelOverrides` - `Partial<AixAPI_Model>` merged into every request (the template sets
  `maxTokens` 2048 to 4096 so reasoning models finish before the cap)

A flat `Record<string, AixAPI_Access>` without `vendors` is also accepted (legacy format).

## Sweeps and probes

A sweep is a `SweepDefinition` in the `SWEEP_DEFINITIONS` table at the top of `sweep.ts`:

- `applicability` - `{ type: 'all' }` or a list of dialects
- `values` - the values to test; `applyToModel(value)` maps one to `Partial<AixAPI_Model>` fields
- `mode: 'enumerate'` tests every value. `mode: 'bisect'` treats `values[0]` and `values[1]` as numeric
  endpoints and binary-searches the pass/fail boundary down to `bisectPrecision` (default 1). No current
  definition uses bisect.
- `neuteredValues` - when every passing value is in this set (the API default, e.g. `medium` for
  `oai-reasoning-effort` and `oai-verbosity`, `standard` for `oai-reasoning-mode`), the sweep is reported as
  `~neutered~` and omitted from the results file: the API accepted only the no-op value.
- `preflightFail(body, value)` - wire-fidelity check on the built request body before any API call. When an
  adapter hotfix coerced the value (`ant-thinking-budget` turned into adaptive thinking, `oai-reasoning-mode`
  dropped on Chat Completions), it returns a reason and the value records `fail` without a request, so a coerced
  request cannot record a false pass.

Each model's request starts from `{ id, acceptsOutputs, maxTokens }`, then the overrides derived from its
`interfaces` (output modalities, `vndOaiResponsesAPI` for `oai-responses`), id heuristics (web search on OpenAI
`-deep-research-` and `-search-api-` ids), the config's `baseModelOverrides`, and last the sweep's fields.
Variant duplicates of one id are tested once.

Tool probes (`TOOL_PROBE_DEFINITIONS`, all dialects, output key `fn`) call a `get_current_weather` tool:
`auto` (policy auto), `required` (policy any; preflight fails when the body's `tool_choice` was coerced away
from forced), `roundtrip` (turn 2 injects a canned result and must answer in text containing `cloudy` or `18`
without re-calling the tool).

## Outcomes

| outcome | console | meaning |
|---|---|---|
| pass | ✅ (dim ✓ for a `null` value) | HTTP 200, no dialect issue, stop reason ok or tool invocations; for probes, the expected call with valid args |
| fail | ❌ | HTTP error other than 429/503, request build exception, parser dialect issue, other stop reason, preflight failure, or a probe check failed |
| blocked | ❓ | HTTP 429 or 503: rate limit or overload, says nothing about the parameter |
| truncated | ✂️ | stop reason `out-of-tokens`: hit `maxTokens` |
| error | ⚠️ | any other exception during the request |

In the results file, `truncated` counts as accepted for parameter sweeps (the API took the value) but not for
tool probes. Models with no `pass` at all are dropped from the results.

## Results files

`llm-{dialect}-parameters-sweep.json` next to `sweep.ts`, one per dialect, committed: anthropic, gemini,
metaai, openai, openrouter, xai. They are the API-validated source `/verify-parameters` compares
`parameterSpecs` and `LLM_IF_OAI_Fn` against, and `kb/modules/LLM-openai-responses.md` cites the openai one.
Written only by a non-dry run with at least one passing model.

- Header keys: `_comment`, `_evaluated` (sweeps run; a missing key on a model means unsupported), and
  `_modelFilter` when a filter applied.
- Per model id: sweep name to passing values. A numeric sweep (`temperature`, `oai-temperature-think-*`,
  `ant-thinking-budget`, `gemini-thinking-budget`) whose passing values are a gap-free prefix of the tested
  values becomes `<sweep>-range: [min, max]`. `oai-image-generation` and `oai-web-search` passing every value
  become entries in `tools`; `xai-web-search` in `xai-tools`. `fn` lists the passing probes.
- A filtered run over an existing file auto-enables `--merge-models`: swept models move to the top, the rest
  stay. With `--sweep-filter`, each model entry is deep-merged (keys not probed this run survive); without
  it, the model entry is replaced. An unfiltered run without `--merge-models` rewrites the file.

## Adding a sweep

1. Add a `defineSweep({...})` entry to `SWEEP_DEFINITIONS`; type `values` with
   `satisfies AixAPI_Model['<field>'][]` so the compiler checks them.
2. Set `neuteredValues` when one value is the API default, and `preflightFail` when any adapter can rewrite
   or drop the field on the wire.
3. Numeric range sweeps: add the name to `collapsibleNumberRanges` in `vendorResultToDialectResults`.
   Tool-like sweeps that should land in `tools`: add to `toolSweeps`.
4. Add the name to the vendor's `sweeps` in `sweep-config.template.json` if it should run by default there.
5. Check with `--help` and `--dry-run`, then one model: `--max-models 1 --sweep-filter <name> --verbose --debug`.
