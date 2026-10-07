# startupChecker — Thesis Engine V4

Decision engine for rapidly killing weak startup theses and identifying the cheapest next experiment for promising ones.

## Architecture

- **Rust 2024** for the deterministic/auditable decision core.
- **Axum** API (added in this initial backend phase).
- **Next.js 16.4** will be added after the V4 engine is stable, using the visual contract from Olympia (Apple-like iOS/macOS 27 / Liquid Glass chrome).
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
