# Thesis Engine V8 — Portfolio Decision & Research OS

V8 keeps the V7 0–10 thesis score and adds a second question:

> **Where should founder time and money go next?**

The opportunity score and the founder-attention decision are deliberately separated.

## 1. Thesis Score vs Founder Attention Priority

`thesis_score` remains the V7-calibrated quality of the opportunity.

`founder_attention_priority` is a different 0–10 score combining:
- thesis quality,
- learning velocity,
- Founder Fit when supplied,
- Value of Information of the next experiment.

A 6.8 thesis may have attention >8 if a cheap decisive test can reveal whether it is exceptional.
An 8+ thesis may receive low attention if learning is expensive or the team is a poor fit.

Founder Fit never changes thesis_score.

## 2. Founder Fit

Optional private-input layer:

- domain_edge — 15%
- distribution_access — 25%
- build_speed — 20%
- credibility — 15%
- capital_fit — 10%
- execution_obsession — 15%

The web research agent is explicitly forbidden from inventing Founder Fit. It may only ask questions.

## 3. Bayesian-style hypothesis updates

A thesis may carry explicit uncertain hypotheses.

Each hypothesis has:
- prior probability,
- prior strength,
- kill-if-false flag,
- observations.

Observations update Beta-style pseudo-counts according to:
- direction,
- strength,
- reliability.

The output includes posterior probability and entropy.

This is not used to bypass V7 gates. It exists to choose the next experiment.

## 4. Value of Information

Candidate experiments specify:
- hypothesis,
- cost in BRL,
- founder hours,
- decisiveness 0–1.

V8 estimates:
- expected information gain,
- VOI 0–10 after cost/time penalty,
- probability the experiment kills the thesis if the hypothesis fails.

The best experiment becomes the V8 next-best-learning action.

## 5. Portfolio endpoint

`POST /v1/portfolio`

Input:
- multiple full ThesisInput items,
- optional budget_hours,
- optional budget_brl.

The engine ranks by Founder Attention Priority and can greedily allocate the supplied research budget to the highest-value experiments.

This does not mean “fund the highest score”.
It means “spend the next scarce unit of founder attention where it buys the most decision value”.

## 6. Counterfactual engine

Every thesis returns deterministic counterfactuals for targets:
- 7,
- 8,
- 9.

It identifies blockers such as:
- fatal veto,
- insufficient structural strength,
- evidence cap,
- quality/headroom cap,
- blocked market entry.

This answers:

> “What would have to become true for this thesis to deserve the next tier of attention?”

## 7. Failure Pattern Library

V8 detects recurring failure modes:

- FP-01 USER_LOVES_BUYER_DOESNT
- FP-02 NO_BUDGET
- FP-03 MARKET_ACCESS_BLOCKED
- FP-04 EMPTY_OCEAN
- FP-05 IMPLEMENTATION_KILLS
- FP-06 SMALL_MARKET_HIGH_WTP
- FP-07 EASY_SUBSTITUTE
- FP-08 FOUNDER_MARKET_FIT
- FP-09 GATEKEEPER_DEPENDENCY
- FP-10 ECONOMICS_ONLY_AT_SCALE

These patterns are deterministic warnings, not extra points.

## 8. Research Orchestrator V8

Deep Research now also generates:

- Strategy Canvas,
- Evidence Graph,
- critical hypotheses,
- prior probabilities,
- kill-if-false flags,
- candidate experiments with estimated R$ cost, hours and decisiveness,
- Founder Fit questions.

The LLM never assigns Founder Fit and never overwrites Rust decisions.

## 9. Blue Ocean strategy canvas

The research output compares 4–12 actual competition factors:

```
factor -> incumbents 0–10 vs proposed thesis 0–10
```

The goal is to distinguish real value-curve departure from “slightly better at everything”.

## 10. Architecture

```
Sparse thesis
  -> ScoutNet (cheap ordering)
  -> Deep Research / Evidence Graph
  -> V7 deterministic thesis score
  -> V8 posterior hypotheses + VOI
  -> Founder Fit
  -> Founder Attention Priority
  -> Portfolio allocation
  -> real outcomes
  -> future OutcomeNet
```

Rule:

**LLM researches. V7 scores the opportunity. V8 allocates attention. Outcomes train the future truth model.**
