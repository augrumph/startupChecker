# startupChecker — Thesis Engine V4

Decision engine for rapidly killing weak startup theses and identifying the cheapest next experiment for promising ones.

## Architecture

- **Rust 2024** for the deterministic/auditable decision core.
- **Axum** API (added in this initial backend phase).
- **Next.js 16** frontend is implemented as a guided thesis wizard, using the Olympia visual contract (Apple-like iOS/macOS 27 / Liquid Glass chrome).
- Future ML is **not trained inside the transactional core**. Outcomes will be collected and models can be trained offline, then versioned and plugged into the engine as an overlay.

## V4 principles

1. Business-model agnostic: B2C, B2B, B2B2C, B2G, marketplaces, transactions, services, industrial models, etc.
2. Multi-expert routing: a thesis may be evaluated by more than one value engine.
3. Non-compensatory vetoes: market size, recurrence, AI, moat or margin cannot rescue a thesis that fails its own value fundamentals.
4. Criterion-level evidence: every score carries evidence strength and quality.
5. Uncertainty is explicit: low evidence triggers cheap falsification, not false confidence.
6. Potential is informational and does not rescue weak value.
7. The primary output is **decision + critical uncertainty + next experiment**.

See `docs/ENGINE_V4.md` for the full model.


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

The frontend reads all criteria, weights, veto thresholds and expert definitions from `GET /v1/config`. It does not duplicate the V4 scoring rules.

## Current flow

1. Context: thesis, sector, payer, user, problem and wedge.
2. Value router: scores six possible value mechanisms.
3. Universal gates: payer, ability to pay, value intensity and surplus.
4. Multi-expert evaluation: only relevant expert criteria are shown.
5. Learning + potential: estimates founder-time cost and upside.
6. Rust evaluation: returns vetoes, structural/conservative strength, investigation priority and next experiment.
7. Result is kept locally in the browser for fast iteration.
