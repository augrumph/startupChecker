# Thesis Engine V10 — Truth Layer

V10 adds an auditable evidence-quality layer on top of V7/V8/V9.

## Principle

**Truth Score never increases Thesis Score.**

It answers a separate question:

> How trustworthy is the factual base underneath the current decision?

## EvidenceRecord

Every research claim may be persisted with:

- claim text
- source kind
- source URL / title
- publication / observation / fetch timestamp
- mapped criterion keys
- supports / contradicts / neutral direction
- strength
- reliability
- independence group
- optional content hash

## Source kinds

- OFFICIAL
- REGULATOR
- ACADEMIC_RESEARCH
- COMPANY_PRIMARY
- INDUSTRY_ASSOCIATION
- CUSTOMER_INTERVIEW
- INTERNAL_EXPERIMENT
- COMMERCIAL_ARTIFACT
- REPUTABLE_MEDIA
- COMMUNITY
- SYNTHETIC
- UNKNOWN

Synthetic evidence is heavily penalized and can block future model training.

## Truth Score components

V10 evaluates:

- critical-claim coverage
- source quality
- source diversity
- source independence
- freshness
- contradiction load
- duplicate evidence
- synthetic evidence share

Output:

- truth_score 0–10
- audit_grade A–F
- truth_adjusted_decision_confidence
- training_eligible
- blocking_reasons

## Freshness

Evidence decays according to source-specific half-life.

Examples:

- regulation / official: slow decay
- academic research: slow decay
- experiments / commercial artifacts: medium-slow
- company/association data: medium
- media/community: faster

The engine remains deterministic by using `evidence_as_of_unix` when supplied.

## Training gate

A thesis record is only eligible for future OutcomeNet training when:

- audit grade is A or B
- contradiction load <= 20%
- synthetic share <= 10%
- critical claim coverage >= 60%
- at least one real outcome exists

This protects the future model from learning weak research or duplicated claims.

## Markdown database

All evidence lives inside:

```
data/theses/<ID>.md
```

The machine JSON record remains the source of truth.

Persisted APIs:

```
POST /v1/theses
GET  /v1/theses
GET  /v1/theses/{id}
PUT  /v1/theses/{id}
POST /v1/theses/{id}/evidence
POST /v1/theses/{id}/experiments
```

Stateless engine APIs remain available for transformations/evaluation.

## V10 stack

```
Sparse thesis
 -> ScoutNet
 -> Deep Research
 -> Evidence Graph
 -> V10 Truth Layer
 -> V7 Thesis Score
 -> V8 Attention / VOI
 -> V9 Experiment + Outcome Loop
 -> Markdown / Git history
 -> future OutcomeNet
```

Rule:

**LLM may find evidence. Rust audits the evidence. Git preserves the record. Real outcomes train the future model.**
