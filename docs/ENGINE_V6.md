# Thesis Engine V6 — ML layer

V6 separates teacher imitation from market truth.

ScoutNet was actually trained on 363 weakly-labeled theses.

5-fold CV:
- LinearSVC accuracy 0.8154, macro-F1 0.7664 — promoted.
- Logistic regression macro-F1 0.7485 — baseline.
- MLP 64 macro-F1 0.7027 — challenger.
- MLP 128x32 macro-F1 0.7334 — challenger.
- Ridge priority MAE 7.129 — promoted.
- MLP regressor MAE 8.372 — challenger.

The neural network was trained and lost, so it is not promoted.

The embedded Rust artifact is a compact distillation used only for pre-research triage.

OutcomeNet is locked until at least 200 real labeled outcomes and 40 paid-positive outcomes. Then it must benchmark linear, boosting/CatBoost, MLP/TabM and TabPFN, with out-of-sample evaluation and calibrated probabilities.

Guardrail: ScoutNet may rank what to research next; it never overrides Rust vetoes or the final decision.
