# Thesis Engine V5

V5 keeps the deterministic Rust engine as the final authority and adds an optional LLM advisory layer only where language interpretation is useful.

## Deterministic V5 additions

The Rust evaluation now reports:

- `decision_confidence`: confidence in the decision itself.
- `sensitivity_risk`: how close important veto criteria are to flipping.
- `expert_disagreement`: disagreement across selected value engines.
- `decision_margin`: closest distance to a veto threshold.
- `review_required`: explicit human-review flag.

These are independent from thesis attractiveness.

## Selective LLM layer

The LLM is intentionally outside the Rust decision engine.

### 1. Intake

`POST /api/ai/intake`

Turns messy founder prose into:

- normalized context,
- suggested value-engine affinities,
- assumptions,
- unknowns,
- first questions.

The LLM is allowed to suggest routing affinities at HYPOTHESIS evidence level.
It is not allowed to assign core/expert scores or decisions.

### 2. Evidence mapper

`POST /api/ai/evidence`

Maps interview notes, research, proposals or observed outcomes to existing criterion keys.

It returns evidence candidates and direction (supports / contradicts / neutral).
It never mutates deterministic scores automatically.

### 3. Red team

`POST /api/ai/red-team`

Receives the thesis plus the Rust evaluation and searches for:

- unproven high-score assumptions,
- causal gaps,
- WTP gaps,
- payer/user confusion,
- biased validation,
- distribution bottlenecks,
- cheapest falsification tests.

It cannot overwrite Rust output.

## Models

Default routing through Vercel AI Gateway:

- Intake / evidence: `openai/gpt-5.6-luna`
- Red-team reasoning: `openai/gpt-6-sol`

Override with:

- `AI_MODEL_FAST`
- `AI_MODEL_DEEP`

Authentication uses `AI_GATEWAY_API_KEY` locally or supported Vercel authentication in deployment.

## Rule

**LLM interprets. Rust decides.**

Do not move vetoes, scoring, thresholds or final decisions into prompts.
