# startupChecker — Thesis Engine V8

Decision engine for rapidly killing weak startup theses and identifying the cheapest next experiment for promising ones.

## Architecture

- **Rust 2024** for the deterministic/auditable decision core.
- **Axum** API (added in this initial backend phase).
- **Next.js 16** frontend is implemented as a guided thesis wizard, using the Olympia visual contract (Apple-like iOS/macOS 27 / Liquid Glass chrome).
- Optional LLM advisory layer in Next.js for intake, evidence mapping and red-team analysis.
- **Rust remains the final decision authority**: LLM output cannot overwrite scores, vetoes, thresholds or decisions.
- Future predictive ML is **not trained inside the transactional core**. Outcomes will be collected and models can be trained offline, then versioned and plugged into the engine as an overlay.

## V8 principles

1. Business-model agnostic: B2C, B2B, B2B2C, B2G, marketplaces, transactions, services, industrial models, etc.
2. Multi-expert routing: a thesis may be evaluated by more than one value engine.
3. Non-compensatory vetoes: market size, recurrence, AI, moat or margin cannot rescue a thesis that fails its own value fundamentals.
4. Criterion-level evidence: every score carries evidence strength and quality.
5. Uncertainty is explicit: low evidence triggers cheap falsification, not false confidence.
6. Potential is informational and does not rescue weak value.
7. The primary output is **decision + critical uncertainty + next experiment**.

See `docs/ENGINE_V5.md` for the current model. `docs/ENGINE_V4.md` remains as historical context.


## Run locally

### Rust API

```bash
cargo run -p startup-checker-api
```

API: `http://localhost:8080`

Endpoints:

- `GET /health`
- `GET /v1/config`
- `POST /v1/evaluate`

### Next.js 16

```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

Frontend: `http://localhost:3000`

The frontend reads all criteria, weights, veto thresholds and expert definitions from `GET /v1/config`. It does not duplicate the V5 scoring rules.

## Current flow

1. Context: thesis, sector, payer, user, problem and wedge.
2. Value router: scores six possible value mechanisms.
3. Universal gates: payer, ability to pay, value intensity and surplus.
4. Multi-expert evaluation: only relevant expert criteria are shown.
5. Learning + potential: estimates founder-time cost and upside.
6. Rust evaluation: returns vetoes, structural/conservative strength, investigation priority and next experiment.
7. Result is kept locally in the browser for fast iteration.


## V5 selective LLM layer

The LLM is used only where unstructured language interpretation helps:

- `POST /api/ai/intake` — structure messy founder prose and suggest value-engine routing.
- `POST /api/ai/evidence` — map interviews/research to existing criteria without mutating scores.
- `POST /api/ai/red-team` — attack assumptions and propose cheap falsification tests.

The deterministic Rust evaluation also exposes:

- decision confidence,
- sensitivity risk,
- expert disagreement,
- decision margin,
- human-review flag.

Local LLM setup:

```bash
AI_GATEWAY_API_KEY=...
AI_MODEL_FAST=openai/gpt-5.6-luna
AI_MODEL_DEEP=openai/gpt-6-sol
```

**Rule: LLM interprets. Rust decides.**


## V6 — ScoutNet and OutcomeNet

ScoutNet was trained on the current 363-thesis weak-label universe and is used only to prioritize research.

Endpoint:

```
POST /v1/scout
```

Actual 5-fold CV:
- LinearSVC macro-F1: **0.7664** — promoted Scout overlay
- MLP 128×32 macro-F1: **0.7334** — neural challenger
- Ridge research-priority MAE: **7.129** — promoted
- MLP regressor MAE: **8.372** — challenger

The neural models were trained and lost, so they are not promoted.

OutcomeNet remains locked until enough real market outcomes exist. See `docs/ENGINE_V6.md`.


## V7 — hard calibration

V7 changes the meaning of the score.

- **<5.0** — reject
- **5.0–5.9** — weak
- **6.0–6.9** — watchlist / cheap falsification only
- **7.0–7.9** — investigate seriously
- **8.0–8.9** — priority; strong enough to justify real commercial/pilot work
- **9.0+** — exceptional; rare and evidence-heavy

The score is now 0–10, not 0–100.

Three mechanisms prevent inflation:
1. nonlinear compression: ordinary weighted averages are pushed down;
2. evidence cap: desk research alone cannot meaningfully exceed ~7;
3. quality cap: barely clearing veto thresholds cannot produce a high overall score.

A 9 requires both exceptional fundamentals and mature evidence. A 10 should be nearly absent.


## V8 — Portfolio Decision OS

V8 keeps the strict V7 thesis score and adds decision allocation:

- Founder Fit separate from market quality
- Bayesian-style hypothesis posteriors
- Value of Information
- kill probability
- Founder Attention Priority
- 7/8/9 counterfactuals
- Failure Pattern Library
- portfolio ranking and budget allocation
- Strategy Canvas and Evidence Graph from Deep Research

New endpoint:

```
POST /v1/portfolio
```

See `docs/ENGINE_V8.md`.
