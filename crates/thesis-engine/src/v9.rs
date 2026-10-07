use serde::{Deserialize, Serialize};

use super::{
    round1, round3, Decision, EngineError, EngineV4, EvidenceDirection, HypothesisObservation,
    ThesisInput, V8Overlay, Evaluation,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExperimentLedgerEntry {
    pub experiment_id: String,
    pub hypothesis_id: String,
    pub direction: EvidenceDirection,
    pub strength: f64,
    #[serde(default = "one_v9")]
    pub reliability: f64,
    #[serde(default)]
    pub actual_cost_brl: f64,
    #[serde(default)]
    pub actual_hours: f64,
    #[serde(default)]
    pub note: Option<String>,
}

fn one_v9() -> f64 { 1.0 }

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum OutcomeKind {
    Paid,
    ValueObserved,
    RepurchaseOrExpansion,
    Churned,
    Killed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OutcomeEvent {
    pub kind: OutcomeKind,
    pub occurred: bool,
    #[serde(default)]
    pub amount_brl: Option<f64>,
    #[serde(default)]
    pub days_from_start: Option<u32>,
    #[serde(default)]
    pub note: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum EmpiricalOutcomeLabel {
    NoOutcomeYet,
    KilledCorrectly,
    PaidNoValueYet,
    PaidAndValue,
    PaidValueAndExpanded,
    ValueThenChurned,
    Inconclusive,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecisionSnapshotInput {
    pub engine_version: String,
    pub thesis_score: f64,
    pub founder_attention_priority: f64,
    pub decision_confidence: f64,
    pub evidence_coverage: f64,
    pub decision: Decision,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecisionDrift {
    pub score_delta: f64,
    pub attention_delta: f64,
    pub confidence_delta: f64,
    pub evidence_delta: f64,
    pub decision_changed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScenarioValueInput {
    pub upside_if_success_brl: f64,
    #[serde(default)]
    pub downside_if_failure_brl: f64,
    #[serde(default)]
    pub test_cost_brl: f64,
    #[serde(default)]
    pub founder_hours_to_test: f64,
    #[serde(default)]
    pub founder_hour_value_brl: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RobustnessSimulation {
    pub samples: u32,
    pub expected_latent_score: f64,
    pub p_score_ge_7: f64,
    pub p_score_ge_8: f64,
    pub p_score_ge_9: f64,
    pub p_kill: f64,
    pub decision_stability: f64,
    pub uncertainty_sigma: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearningLedgerSummary {
    pub experiments_run: usize,
    pub total_cost_brl: f64,
    pub total_hours: f64,
    pub supporting_results: usize,
    pub contradicting_results: usize,
    pub neutral_results: usize,
    pub evidence_velocity_per_10h: f64,
}

#[derive(Debug, Clone)]
pub struct V9Overlay {
    pub robustness: RobustnessSimulation,
    pub learning_ledger: LearningLedgerSummary,
    pub decision_drift: Option<DecisionDrift>,
    pub expected_option_value_brl: Option<f64>,
    pub empirical_outcome_label: EmpiricalOutcomeLabel,
}

#[derive(Clone)]
struct TinyRng { state: u64 }

impl TinyRng {
    fn new(seed: u64) -> Self {
        Self { state: if seed == 0 { 0x9E3779B97F4A7C15 } else { seed } }
    }

    fn next_u64(&mut self) -> u64 {
        let mut x = self.state;
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        self.state = x;
        x
    }

    fn unit(&mut self) -> f64 {
        let raw = self.next_u64() >> 11;
        (raw as f64 + 1.0) / ((1u64 << 53) as f64 + 2.0)
    }

    fn normal(&mut self) -> f64 {
        let u1 = self.unit().max(1e-12);
        let u2 = self.unit();
        (-2.0 * u1.ln()).sqrt() * (2.0 * std::f64::consts::PI * u2).cos()
    }
}

fn stable_seed(text: &str) -> u64 {
    let mut hash = 1469598103934665603u64;
    for byte in text.as_bytes() {
        hash ^= u64::from(*byte);
        hash = hash.wrapping_mul(1099511628211);
    }
    hash
}

fn decision_bucket(score: f64) -> u8 {
    if score < 5.5 { 0 }
    else if score < 7.0 { 1 }
    else if score < 8.0 { 2 }
    else if score < 8.6 { 3 }
    else if score < 9.0 { 4 }
    else { 5 }
}

fn robustness(
    input: &ThesisInput,
    thesis_score: f64,
    structural_strength: f64,
    evidence_coverage: f64,
    sensitivity_risk: f64,
    v8: &V8Overlay,
) -> RobustnessSimulation {
    const SAMPLES: u32 = 1200;
    let mut rng = TinyRng::new(stable_seed(&input.id));
    let sigma = (0.30
        + (1.0 - evidence_coverage.clamp(0.0, 1.0)) * 1.65
        + (sensitivity_risk / 100.0).clamp(0.0, 1.0) * 0.75)
        .clamp(0.25, 2.7);

    let current_bucket = decision_bucket(thesis_score);
    let mut sum = 0.0;
    let mut ge7 = 0u32;
    let mut ge8 = 0u32;
    let mut ge9 = 0u32;
    let mut killed = 0u32;
    let mut stable = 0u32;

    for _ in 0..SAMPLES {
        let mut simulated = (structural_strength + rng.normal() * sigma).clamp(0.0, 10.0);

        for h in &v8.hypothesis_posteriors {
            let true_draw = rng.unit() <= h.posterior_probability;
            if h.kill_if_false && !true_draw {
                simulated = simulated.min(4.9);
            } else if !h.kill_if_false {
                let centered = if true_draw {
                    1.0 - h.posterior_probability
                } else {
                    -h.posterior_probability
                };
                simulated = (simulated + centered * 0.7).clamp(0.0, 10.0);
            }
        }

        sum += simulated;
        if simulated >= 7.0 { ge7 += 1; }
        if simulated >= 8.0 { ge8 += 1; }
        if simulated >= 9.0 { ge9 += 1; }
        if simulated < 5.5 { killed += 1; }
        if decision_bucket(simulated) == current_bucket { stable += 1; }
    }

    RobustnessSimulation {
        samples: SAMPLES,
        expected_latent_score: round1(sum / f64::from(SAMPLES)),
        p_score_ge_7: round3(f64::from(ge7) / f64::from(SAMPLES)),
        p_score_ge_8: round3(f64::from(ge8) / f64::from(SAMPLES)),
        p_score_ge_9: round3(f64::from(ge9) / f64::from(SAMPLES)),
        p_kill: round3(f64::from(killed) / f64::from(SAMPLES)),
        decision_stability: round3(f64::from(stable) / f64::from(SAMPLES)),
        uncertainty_sigma: round3(sigma),
    }
}

fn ledger_summary(input: &ThesisInput) -> LearningLedgerSummary {
    let mut support = 0usize;
    let mut contradict = 0usize;
    let mut neutral = 0usize;
    let mut cost = 0.0;
    let mut hours = 0.0;

    for e in &input.experiment_ledger {
        cost += e.actual_cost_brl.max(0.0);
        hours += e.actual_hours.max(0.0);
        match e.direction {
            EvidenceDirection::Supports => support += 1,
            EvidenceDirection::Contradicts => contradict += 1,
            EvidenceDirection::Neutral => neutral += 1,
        }
    }

    let velocity = if hours > 0.0 {
        input.experiment_ledger.len() as f64 / hours * 10.0
    } else {
        0.0
    };

    LearningLedgerSummary {
        experiments_run: input.experiment_ledger.len(),
        total_cost_brl: round1(cost),
        total_hours: round1(hours),
        supporting_results: support,
        contradicting_results: contradict,
        neutral_results: neutral,
        evidence_velocity_per_10h: round1(velocity),
    }
}

fn outcome_label(outcomes: &[OutcomeEvent]) -> EmpiricalOutcomeLabel {
    let happened = |kind: OutcomeKind| outcomes.iter().any(|o| o.kind == kind && o.occurred);
    let paid = happened(OutcomeKind::Paid);
    let value = happened(OutcomeKind::ValueObserved);
    let expanded = happened(OutcomeKind::RepurchaseOrExpansion);
    let churned = happened(OutcomeKind::Churned);
    let killed = happened(OutcomeKind::Killed);

    if killed && !paid {
        EmpiricalOutcomeLabel::KilledCorrectly
    } else if paid && value && expanded {
        EmpiricalOutcomeLabel::PaidValueAndExpanded
    } else if paid && value && churned {
        EmpiricalOutcomeLabel::ValueThenChurned
    } else if paid && value {
        EmpiricalOutcomeLabel::PaidAndValue
    } else if paid {
        EmpiricalOutcomeLabel::PaidNoValueYet
    } else if outcomes.is_empty() {
        EmpiricalOutcomeLabel::NoOutcomeYet
    } else {
        EmpiricalOutcomeLabel::Inconclusive
    }
}

fn drift(
    history: &[DecisionSnapshotInput],
    current_score: f64,
    current_attention: f64,
    current_confidence: f64,
    current_evidence: f64,
    current_decision: Decision,
) -> Option<DecisionDrift> {
    let previous = history.last()?;
    Some(DecisionDrift {
        score_delta: round1(current_score - previous.thesis_score),
        attention_delta: round1(current_attention - previous.founder_attention_priority),
        confidence_delta: round1(current_confidence - previous.decision_confidence),
        evidence_delta: round3(current_evidence - previous.evidence_coverage),
        decision_changed: previous.decision != current_decision,
    })
}

fn option_value(
    scenario: Option<&ScenarioValueInput>,
    robustness: &RobustnessSimulation,
) -> Option<f64> {
    let s = scenario?;
    let p = robustness.p_score_ge_8.clamp(0.0, 1.0);
    let ev = p * s.upside_if_success_brl.max(0.0)
        - (1.0 - p) * s.downside_if_failure_brl.max(0.0)
        - s.test_cost_brl.max(0.0)
        - s.founder_hours_to_test.max(0.0) * s.founder_hour_value_brl.max(0.0);
    Some(round1(ev))
}

pub(crate) fn build_overlay(
    input: &ThesisInput,
    thesis_score: f64,
    decision: Decision,
    structural_strength: f64,
    evidence_coverage: f64,
    sensitivity_risk: f64,
    v8: &V8Overlay,
) -> V9Overlay {
    let robustness = robustness(
        input,
        thesis_score,
        structural_strength,
        evidence_coverage,
        sensitivity_risk,
        v8,
    );
    let learning_ledger = ledger_summary(input);
    let decision_drift = drift(
        &input.decision_history,
        thesis_score,
        v8.founder_attention_priority,
        0.0,
        evidence_coverage,
        decision,
    );
    let expected_option_value_brl = option_value(input.scenario_value.as_ref(), &robustness);
    let empirical_outcome_label = outcome_label(&input.outcomes);

    V9Overlay {
        robustness,
        learning_ledger,
        decision_drift,
        expected_option_value_brl,
        empirical_outcome_label,
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExperimentUpdateRequest {
    pub thesis: ThesisInput,
    pub result: ExperimentLedgerEntry,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExperimentUpdateResponse {
    pub thesis: ThesisInput,
    pub evaluation: Evaluation,
}

pub fn update_with_experiment(
    engine: &EngineV4,
    request: &ExperimentUpdateRequest,
) -> Result<ExperimentUpdateResponse, EngineError> {
    let before = engine.evaluate(&request.thesis)?;
    let mut thesis = request.thesis.clone();

    thesis.decision_history.push(DecisionSnapshotInput {
        engine_version: before.engine_version.clone(),
        thesis_score: before.thesis_score,
        founder_attention_priority: before.founder_attention_priority,
        decision_confidence: before.decision_confidence,
        evidence_coverage: before.evidence_coverage,
        decision: before.decision,
    });

    if let Some(hypothesis) = thesis
        .hypotheses
        .iter_mut()
        .find(|h| h.id == request.result.hypothesis_id)
    {
        hypothesis.observations.push(HypothesisObservation {
            direction: request.result.direction,
            strength: request.result.strength.clamp(0.0, 1.0),
            reliability: request.result.reliability.clamp(0.0, 1.0),
            source: request.result.note.clone(),
        });
    }

    thesis.experiment_ledger.push(request.result.clone());
    let evaluation = engine.evaluate(&thesis)?;

    Ok(ExperimentUpdateResponse { thesis, evaluation })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalibrationRecord {
    pub predicted_probability: f64,
    pub actual_success: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalibrationReport {
    pub n: usize,
    pub brier_score: f64,
    pub ece_5bin: f64,
    pub precision_at_50: f64,
    pub recall_at_50: f64,
    pub false_positive_rate_at_50: f64,
}

pub fn calibration_report(records: &[CalibrationRecord]) -> CalibrationReport {
    if records.is_empty() {
        return CalibrationReport {
            n: 0,
            brier_score: 0.0,
            ece_5bin: 0.0,
            precision_at_50: 0.0,
            recall_at_50: 0.0,
            false_positive_rate_at_50: 0.0,
        };
    }

    let n = records.len() as f64;
    let brier = records.iter().map(|r| {
        let p = r.predicted_probability.clamp(0.0, 1.0);
        let y = if r.actual_success { 1.0 } else { 0.0 };
        (p - y).powi(2)
    }).sum::<f64>() / n;

    let mut ece = 0.0;
    for bin in 0..5 {
        let low = bin as f64 / 5.0;
        let high = (bin + 1) as f64 / 5.0;
        let bucket: Vec<_> = records.iter().filter(|r| {
            let p = r.predicted_probability.clamp(0.0, 1.0);
            p >= low && (bin == 4 || p < high)
        }).collect();
        if bucket.is_empty() { continue; }
        let avg_p = bucket.iter().map(|r| r.predicted_probability.clamp(0.0, 1.0)).sum::<f64>() / bucket.len() as f64;
        let avg_y = bucket.iter().filter(|r| r.actual_success).count() as f64 / bucket.len() as f64;
        ece += bucket.len() as f64 / n * (avg_p - avg_y).abs();
    }

    let mut tp=0.0; let mut fp=0.0; let mut fn_=0.0; let mut tn=0.0;
    for r in records {
        let pred = r.predicted_probability >= 0.5;
        match (pred, r.actual_success) {
            (true,true)=>tp+=1.0,
            (true,false)=>fp+=1.0,
            (false,true)=>fn_+=1.0,
            (false,false)=>tn+=1.0,
        }
    }

    CalibrationReport {
        n: records.len(),
        brier_score: round3(brier),
        ece_5bin: round3(ece),
        precision_at_50: round3(if tp+fp>0.0 {tp/(tp+fp)} else {0.0}),
        recall_at_50: round3(if tp+fn_>0.0 {tp/(tp+fn_)} else {0.0}),
        false_positive_rate_at_50: round3(if fp+tn>0.0 {fp/(fp+tn)} else {0.0}),
    }
}
