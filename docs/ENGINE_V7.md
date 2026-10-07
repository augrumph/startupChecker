# Thesis Engine V7 — hard calibration

V7 fixes score inflation.

## Meaning of the headline score

The headline `thesis_score` is **0–10**.

| Score | Meaning | Founder action |
| ---: | --- | --- |
| <5.0 | Reject | Do not spend meaningful time |
| 5.0–5.9 | Weak | Reformulate only if a new insight appears |
| 6.0–6.9 | Watchlist | Cheap falsification only |
| 7.0–7.9 | Investigate | Spend real time researching / testing |
| 8.0–8.9 | Priority | Strong enough for commercial/pilot work |
| 9.0+ | Exceptional | Rare; pursue aggressively |
| 10.0 | Near-theoretical ceiling | Requires extraordinary, repeatable evidence |

A 9 should be rare. A 10 should almost never appear.

## 1. Nonlinear compression

The weighted criterion average is no longer displayed directly.

V7 applies:

```
strict = 10 * (weighted_average / 10)^1.7
```

Examples:

| ordinary weighted avg | V7 theoretical |
| ---: | ---: |
| 7.0 | 5.5 |
| 8.0 | 6.8 |
| 8.2 | 7.1 |
| 8.5 | 7.6 |
| 9.0 | 8.4 |
| 9.4 | 9.0 |
| 10.0 | 10.0 |

So a collection of ordinary 7s/8s no longer creates an 80+ headline score.

## 2. Evidence cap

Even an excellent theoretical thesis cannot outrun its evidence.

| weighted evidence coverage | max headline |
| ---: | ---: |
| <12% | 6.3 |
| 12–29% | 7.1 |
| 30–49% | 7.8 |
| 50–69% | 8.5 |
| 70–87% | 9.2 |
| 88–96% | 9.6 |
| 97%+ | 10.0 |

Practical interpretation:
- hypothesis cannot create a high score;
- desk research can earn permission to investigate;
- customer behavior can reach high-7;
- commercial commitment can reach 8+;
- money is needed for 9 territory;
- repeatable observed outcome is needed for the top of the scale.

## 3. Quality/headroom cap

Passing a veto by 0.1 does not make a strong thesis.

V7 computes the minimum headroom above every critical veto.

| minimum headroom | max headline |
| ---: | ---: |
| fatal / <0 | 4.9 |
| 0–0.49 | 5.9 |
| 0.5–0.99 | 6.9 |
| 1.0–1.49 | 7.9 |
| 1.5–1.99 | 8.6 |
| 2.0+ | 10.0 |

This prevents averages from hiding one weak critical leg.

## 4. Core vs expert

V7 uses a weighted harmonic mean between:
- universal core (45%)
- selected value expert(s) (55%)

The harmonic mean punishes imbalance more than an arithmetic average.

## 5. Decision ladder

- fatal veto or score <5.5 → `KILL_REFORMULATE`
- entry blockage → `THESIS_GOOD_ENTRY_BAD`
- 5.5–6.9 → `FALSIFY_48H`
- 7.0–7.9 → `VALIDATE_DEMAND_7D`
- 8.0–8.5 → `PAID_TEST_30D`
- 8.6–8.9 → `DELIVER_MEASURE_VALUE`
- 9.0+ → `SCALE_EXPAND`

## 6. Research-agent rubric

The research LLM is explicitly instructed that:
- 5 is plausible/average;
- 6 is interesting but ordinary/unproven;
- 7 is strong and merits deep investigation;
- 8 is rare and requires multiple independent signals;
- 9 requires commercial/money-grade evidence;
- 10 is reserved for repeatable observed outcomes.

When uncertain between two scores it must choose the lower score.

## 7. ScoutNet

The existing ScoutNet was trained on V6 weak labels. It remains useful only as a cheap ordering heuristic.

Its legacy 0–100 priority is compressed to the V7 0–10 scale before exposure.

It is explicitly:
- `teacher_only=true`
- `can_change_rust_decision=false`

OutcomeNet will eventually learn from real market outcomes and is the place where calibration can become empirical.
