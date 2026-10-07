use std::collections::{BTreeMap, BTreeSet};

use serde::{Deserialize, Serialize};
use thiserror::Error;

pub const ENGINE_VERSION: &str = "10.0.0";

mod v8;
pub use v8::{
    rank_portfolio, CandidateExperiment, Counterfactual, EvidenceDirection, FailurePattern,
    FounderFitEvaluation, HypothesisInput, HypothesisObservation, HypothesisPosterior,
    PortfolioEntry, PortfolioRequest, PortfolioResponse, V8ExperimentEvaluation,
};

mod v9;
pub use v9::{
    calibration_report, update_with_experiment, CalibrationRecord, CalibrationReport,
    DecisionSnapshotInput, DecisionDrift, EmpiricalOutcomeLabel, ExperimentLedgerEntry,
    ExperimentUpdateRequest, ExperimentUpdateResponse, LearningLedgerSummary, OutcomeEvent,
    OutcomeKind, RobustnessSimulation, ScenarioValueInput, V9Overlay,
};

mod v10;
pub use v10::{
    update_with_evidence, AppendEvidenceRequest, AppendEvidenceResponse, AuditGrade,
    EvidenceRecord, SourceKind, TruthEvaluation, V10Overlay,
};

#[derive(
    Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize,
)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum EngineKind {
    EconomicRoi,
    AspirationTransformation,
    RiskMandatory,
    TransactionAsset,
    NetworkMarketplace,
    ConvenienceExperience,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum EvidenceLevel {
    Hypothesis,
    DeskResearch,
    CustomerBehavior,
    CommercialCommitment,
    Money,
    ObservedOutcome,
}

impl EvidenceLevel {
    fn confidence(self) -> f64 {
        match self {
            Self::Hypothesis => 0.05,
            Self::DeskResearch => 0.20,
            Self::CustomerBehavior => 0.45,
            Self::CommercialCommitment => 0.65,
            Self::Money => 0.85,
            Self::ObservedOutcome => 1.00,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Signal {
    pub score: f64,
    pub evidence: EvidenceLevel,
    #[serde(default = "one")]
    pub quality: f64,
    #[serde(default)]
    pub contradictions: u8,
    #[serde(default)]
    pub note: Option<String>,
}

fn one() -> f64 {
    1.0
}

impl Signal {
    fn score(&self) -> f64 {
        self.score.clamp(0.0, 10.0)
    }

    fn confidence(&self) -> f64 {
        let contradiction_penalty = 0.85_f64.powi(i32::from(self.contradictions));
        (self.evidence.confidence() * self.quality.clamp(0.0, 1.0) * contradiction_penalty)
            .clamp(0.0, 1.0)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThesisContext {
    pub sector: String,
    #[serde(default)]
    pub business_models: Vec<String>,
    pub payer: String,
    pub user: String,
    pub problem: String,
    pub solution: String,

    // Sparse-universe metadata used for navigation and research queues.
    #[serde(default)]
    pub source: String,
    #[serde(default)]
    pub batch: String,
    #[serde(default)]
    pub location: String,
    #[serde(default)]
    pub area: String,
    #[serde(default)]
    pub source_url: String,
    #[serde(default)]
    pub analysis_status: String,
    #[serde(default)]
    pub adaptation_mode: String,

    // Navigation/filter taxonomy. These are triage metadata, not evidence.
    #[serde(default)]
    pub market_types: Vec<String>,
    #[serde(default)]
    pub macro_area: String,
    #[serde(default)]
    pub product_type: String,
    #[serde(default)]
    pub sales_motion: String,
    #[serde(default)]
    pub capital_intensity: String,
    #[serde(default)]
    pub regulatory_intensity: String,
    #[serde(default)]
    pub filter_confidence: String,
}


#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ResearchStatus {
    #[default]
    Sparse,
    ResearchIncomplete,
    ResearchComplete,
    EngineReady,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ResearchReadiness {
    #[serde(default)]
    pub status: ResearchStatus,
    #[serde(default)]
    pub dossier_version: String,
    #[serde(default)]
    pub completeness: f64,
    #[serde(default)]
    pub missing_fields: Vec<String>,
    #[serde(default)]
    pub source_count: usize,
    #[serde(default)]
    pub independent_domains: usize,
    #[serde(default)]
    pub primary_or_official_sources: usize,
    #[serde(default)]
    pub evidence_claim_count: usize,
    #[serde(default)]
    pub critical_unknowns: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThesisInput {
    pub id: String,
    pub name: String,
    pub context: ThesisContext,

    /// Affinity 0..10 for each value engine.
    pub router: BTreeMap<EngineKind, Signal>,

    /// Optional manual engines for hybrid theses. When empty, routing is automatic.
    #[serde(default)]
    pub engine_override: Vec<EngineKind>,

    /// Universal criteria: payer_clarity, ability_to_pay, value_intensity,
    /// current_behavior, value_price_surplus, urgency.
    pub universal: BTreeMap<String, Signal>,

    /// Expert-specific criteria keyed by engine.
    pub experts: BTreeMap<EngineKind, BTreeMap<String, Signal>>,

    /// access_to_payer, test_without_full_build, cheap_to_learn,
    /// fast_to_learn, low_adoption_friction, independent_entry.
    pub learning: BTreeMap<String, Signal>,

    /// payer_density, profit_pool, adjacency, capital_efficiency.
    #[serde(default)]
    pub potential: BTreeMap<String, Signal>,

    /// V5 Blue Ocean layer. This does NOT rescue a weak thesis.
    /// value_curve_departure, noncustomer_unlock, utility_leap,
    /// cost_curve_break, new_demand_creation, latent_demand_evidence.
    #[serde(default)]
    pub blue_ocean: BTreeMap<String, Signal>,

    /// V8: team-specific capability. It never changes thesis_score.
    #[serde(default)]
    pub founder_fit: BTreeMap<String, Signal>,

    /// V8: explicit uncertain assumptions with Bayesian-style posterior updates.
    #[serde(default)]
    pub hypotheses: Vec<HypothesisInput>,

    /// V8: candidate experiments used for Value of Information ranking.
    #[serde(default)]
    pub candidate_experiments: Vec<CandidateExperiment>,

    /// V9: immutable-ish audit trail of executed experiments.
    #[serde(default)]
    pub experiment_ledger: Vec<ExperimentLedgerEntry>,

    /// V9: observed commercial/product outcomes.
    #[serde(default)]
    pub outcomes: Vec<OutcomeEvent>,

    /// V9: prior decision snapshots for drift/regret analysis.
    #[serde(default)]
    pub decision_history: Vec<DecisionSnapshotInput>,

    /// V9: optional economic payoff proxy. Never inferred silently by Rust.
    #[serde(default)]
    pub scenario_value: Option<ScenarioValueInput>,

    /// V10: auditable evidence ledger. Research should append facts here instead of
    /// silently inflating signal confidence.
    #[serde(default)]
    pub evidence_records: Vec<EvidenceRecord>,

    /// V10: deterministic reference time for freshness calculations.
    /// If omitted, the newest evidence timestamp is used.
    #[serde(default)]
    pub evidence_as_of_unix: Option<u64>,

    /// Research-first architecture: raw structured dossier persisted in Markdown.
    /// The deterministic engine never infers missing facts from this JSON.
    #[serde(default)]
    pub research_dossier: Option<serde_json::Value>,

    /// Hard gate evaluated before any V10 scoring.
    #[serde(default)]
    pub research_readiness: ResearchReadiness,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CriterionResult {
    pub key: String,
    pub label: String,
    pub score: f64,
    pub confidence: f64,
    pub threshold: Option<f64>,
    pub veto_failed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScoreCard {
    pub raw_score: f64,
    pub evidence_coverage: f64,
    pub conservative_score: f64,
    pub criteria: Vec<CriterionResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpertEvaluation {
    pub engine: EngineKind,
    pub route_affinity: f64,
    pub route_confidence: f64,
    pub scorecard: ScoreCard,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum Decision {
    KillReformulate,
    ThesisGoodEntryBad,
    Falsify48h,
    ValidateDemand7d,
    PaidTest30d,
    DeliverMeasureValue,
    ScaleExpand,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum RatingBand {
    Reject,
    Weak,
    Watchlist,
    Investigate,
    Priority,
    Exceptional,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExperimentRecommendation {
    pub criterion_key: String,
    pub criterion_label: String,
    pub reason: String,
    pub method: String,
    pub success_signal: String,
    pub failure_signal: String,
    pub horizon_hours: u32,
    pub information_priority: f64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum BlueOceanClass {
    NotAssessed,
    RedOcean,
    PurpleOcean,
    BlueHypothesis,
    BlueValidated,
    EmptyOceanRisk,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlueOceanEvaluation {
    pub classification: BlueOceanClass,
    pub scorecard: ScoreCard,
    pub empty_ocean_risk: f64,
    pub value_innovation_valid: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Evaluation {
    pub engine_version: String,
    pub thesis_id: String,
    pub thesis_name: String,
    pub selected_experts: Vec<EngineKind>,
    pub primary_expert: EngineKind,
    pub universal: ScoreCard,
    pub experts: Vec<ExpertEvaluation>,
    pub learning: ScoreCard,
    pub potential_score: Option<f64>,
    pub blue_ocean: Option<BlueOceanEvaluation>,

    /// V7 theoretical strength after nonlinear score compression, before evidence/quality caps.
    pub structural_strength: f64,

    /// V7 headline score. This is the number used for ranking/action.
    pub thesis_score: f64,

    /// Alias kept for API compatibility; equals thesis_score in V7.
    pub conservative_strength: f64,

    /// V7 semantic band for the 0-10 headline score.
    pub rating_band: RatingBand,

    /// Maximum score allowed by the maturity of evidence.
    pub evidence_cap: f64,

    /// Maximum score allowed by headroom above critical veto thresholds.
    pub quality_cap: f64,

    /// Average confidence across the signals that drive the decision.
    pub evidence_coverage: f64,

    /// High = worth founder attention now. Strong structure + uncertainty + learnability.
    pub investigation_priority: f64,

    /// V5: confidence in the decision itself, not in the thesis.
    pub decision_confidence: f64,

    /// V5: how easily small score changes could alter gates/decision.
    pub sensitivity_risk: f64,

    /// V5: disagreement among selected expert engines.
    pub expert_disagreement: f64,

    /// V5: smallest distance from any veto threshold.
    pub decision_margin: f64,

    /// V5: true when a human should inspect the decision before acting.
    pub review_required: bool,

    /// V8: team fit is separate from market opportunity.
    pub founder_fit: Option<FounderFitEvaluation>,

    /// V8: posterior belief state for explicit hypotheses.
    pub hypothesis_posteriors: Vec<HypothesisPosterior>,

    /// V8: highest-value next learning action.
    pub best_v8_experiment: Option<V8ExperimentEvaluation>,

    /// V8: 0-10 expected value of information of the best available experiment.
    pub value_of_information: f64,

    /// V8: probability that the best experiment kills the thesis if its key hypothesis fails.
    pub kill_probability: f64,

    /// V8: where founder time should go next. Separate from thesis_score.
    pub founder_attention_priority: f64,

    /// V8: what must change to reach 7, 8, and 9.
    pub counterfactuals: Vec<Counterfactual>,

    /// V8: recurring failure modes learned from our dead/weak theses.
    pub failure_patterns: Vec<FailurePattern>,

    /// V9: uncertainty stress test over the latent opportunity.
    pub robustness: RobustnessSimulation,

    /// V9: accumulated experiment economics and evidence velocity.
    pub learning_ledger: LearningLedgerSummary,

    /// V9: how much the current decision moved since the previous snapshot.
    pub decision_drift: Option<DecisionDrift>,

    /// V9: optional EV proxy when the user/research provides grounded payoff inputs.
    pub expected_option_value_brl: Option<f64>,

    /// V9: normalized real-world outcome label for future OutcomeNet training.
    pub empirical_outcome_label: EmpiricalOutcomeLabel,

    /// V10: factual quality of the evidence base. It never increases thesis_score.
    pub truth: TruthEvaluation,

    /// V10: confidence after applying the Truth Score ceiling.
    pub truth_adjusted_decision_confidence: f64,

    /// V10: whether this record is clean enough to become future training data.
    pub training_eligible: bool,

    pub fatal_vetoes: Vec<CriterionResult>,
    pub entry_flags: Vec<CriterionResult>,
    pub decision: Decision,
    pub critical_issue: String,
    pub next_experiment: ExperimentRecommendation,
}

#[derive(Debug, Error)]
pub enum EngineError {
    #[error("missing required signal '{key}' in {scope}")]
    MissingSignal { scope: String, key: String },

    #[error("missing expert payload for {0:?}")]
    MissingExpert(EngineKind),

    #[error("no viable engine route")]
    NoViableRoute,

    #[error("research dossier is not ENGINE_READY (status={status:?}, completeness={completeness:.2}, missing={missing:?})")]
    ResearchNotReady {
        status: ResearchStatus,
        completeness: f64,
        missing: Vec<String>,
    },
}

#[derive(Clone, Copy)]
struct CriterionDef {
    key: &'static str,
    label: &'static str,
    weight: f64,
    veto: Option<f64>,
}

const UNIVERSAL: [CriterionDef; 6] = [
    CriterionDef { key: "payer_clarity", label: "Pagador claro", weight: 15.0, veto: Some(6.0) },
    CriterionDef { key: "ability_to_pay", label: "Capacidade real de pagar", weight: 20.0, veto: Some(6.0) },
    CriterionDef { key: "value_intensity", label: "Intensidade da dor/desejo/obrigação", weight: 20.0, veto: Some(6.0) },
    CriterionDef { key: "current_behavior", label: "Gasto/comportamento atual", weight: 10.0, veto: None },
    CriterionDef { key: "value_price_surplus", label: "Value-price surplus", weight: 25.0, veto: Some(6.0) },
    CriterionDef { key: "urgency", label: "Trigger/urgência", weight: 10.0, veto: None },
];

const LEARNING: [CriterionDef; 6] = [
    CriterionDef { key: "access_to_payer", label: "Acesso ao pagador", weight: 20.0, veto: None },
    CriterionDef { key: "test_without_full_build", label: "Testável sem build completo", weight: 20.0, veto: None },
    CriterionDef { key: "cheap_to_learn", label: "Baixo custo até evidência", weight: 15.0, veto: None },
    CriterionDef { key: "fast_to_learn", label: "Tempo curto até evidência", weight: 15.0, veto: None },
    CriterionDef { key: "low_adoption_friction", label: "Baixa fricção de adoção", weight: 10.0, veto: None },
    CriterionDef { key: "independent_entry", label: "Independência de lobby/regulação/incumbente", weight: 20.0, veto: None },
];

const ECONOMIC: [CriterionDef; 5] = [
    CriterionDef { key: "status_quo_cost", label: "Custo monetário do status quo", weight: 25.0, veto: Some(6.0) },
    CriterionDef { key: "money_causality", label: "Mecanismo causal para R$", weight: 25.0, veto: Some(7.0) },
    CriterionDef { key: "value_magnitude", label: "Magnitude do valor criado", weight: 20.0, veto: Some(6.0) },
    CriterionDef { key: "roi_attribution", label: "ROI mensurável/atribuível", weight: 15.0, veto: Some(5.0) },
    CriterionDef { key: "price_headroom", label: "Headroom de preço", weight: 15.0, veto: Some(5.0) },
];

const ASPIRATION: [CriterionDef; 5] = [
    CriterionDef { key: "transformation_intensity", label: "Intensidade do sonho/transformação", weight: 25.0, veto: Some(7.0) },
    CriterionDef { key: "existing_spend", label: "Gasto/comportamento já existente", weight: 15.0, veto: Some(5.0) },
    CriterionDef { key: "premium_wtp", label: "WTP premium plausível", weight: 25.0, veto: Some(6.0) },
    CriterionDef { key: "outcome_differentiation", label: "Diferenciação percebida do outcome", weight: 20.0, veto: Some(6.0) },
    CriterionDef { key: "paying_segment_density", label: "Densidade do segmento capaz de pagar", weight: 15.0, veto: Some(6.0) },
];

const RISK: [CriterionDef; 5] = [
    CriterionDef { key: "consequence_severity", label: "Severidade da consequência", weight: 25.0, veto: Some(7.0) },
    CriterionDef { key: "inevitability", label: "Inevitabilidade/probabilidade", weight: 20.0, veto: Some(6.0) },
    CriterionDef { key: "forced_budget", label: "Budget forçado/obrigação de agir", weight: 20.0, veto: Some(6.0) },
    CriterionDef { key: "deadline_trigger", label: "Trigger/deadline", weight: 15.0, veto: Some(5.0) },
    CriterionDef { key: "risk_reduction_power", label: "Capacidade de reduzir risco", weight: 20.0, veto: Some(6.0) },
];

const TRANSACTION: [CriterionDef; 5] = [
    CriterionDef { key: "economic_edge", label: "Magnitude do spread/edge econômico", weight: 25.0, veto: Some(6.0) },
    CriterionDef { key: "repeatable_access", label: "Acesso repetível a ativos/deals", weight: 20.0, veto: Some(5.0) },
    CriterionDef { key: "capital_efficiency", label: "Capital efficiency", weight: 15.0, veto: Some(4.0) },
    CriterionDef { key: "edge_durability", label: "Durabilidade da vantagem/informação", weight: 20.0, veto: Some(5.0) },
    CriterionDef { key: "execution_liquidity", label: "Executabilidade/liquidez/legal", weight: 20.0, veto: Some(5.0) },
];

const NETWORK: [CriterionDef; 5] = [
    CriterionDef { key: "matching_pain", label: "Dor de acesso/matching", weight: 20.0, veto: Some(6.0) },
    CriterionDef { key: "reachable_sides", label: "Oferta e demanda alcançáveis", weight: 20.0, veto: Some(5.0) },
    CriterionDef { key: "cross_side_value", label: "Valor cross-side/efeito de rede", weight: 20.0, veto: Some(5.0) },
    CriterionDef { key: "monetization_space", label: "Espaço para monetização/take rate", weight: 20.0, veto: Some(5.0) },
    CriterionDef { key: "cold_start_wedge", label: "Wedge de cold start/liquidez inicial", weight: 20.0, veto: Some(5.0) },
];

const CONVENIENCE: [CriterionDef; 5] = [
    CriterionDef { key: "friction_intensity", label: "Intensidade da fricção/tempo desperdiçado", weight: 25.0, veto: Some(6.0) },
    CriterionDef { key: "usage_context", label: "Frequência/contexto de uso", weight: 15.0, veto: Some(4.0) },
    CriterionDef { key: "convenience_wtp", label: "WTP por conveniência/experiência", weight: 25.0, veto: Some(6.0) },
    CriterionDef { key: "perceived_delta", label: "Diferença percebida vs alternativa", weight: 20.0, veto: Some(6.0) },
    CriterionDef { key: "substitution_resistance", label: "Baixa substituição por grátis/manual", weight: 15.0, veto: Some(5.0) },
];

const POTENTIAL: [CriterionDef; 4] = [
    CriterionDef { key: "payer_density", label: "Densidade de pagadores", weight: 25.0, veto: None },
    CriterionDef { key: "profit_pool", label: "Profit pool/upside", weight: 30.0, veto: None },
    CriterionDef { key: "adjacency", label: "Expansão adjacente", weight: 25.0, veto: None },
    CriterionDef { key: "capital_efficiency", label: "Capital efficiency", weight: 20.0, veto: None },
];

const BLUE_OCEAN: [CriterionDef; 6] = [
    CriterionDef { key: "value_curve_departure", label: "Ruptura da curva de valor", weight: 20.0, veto: None },
    CriterionDef { key: "noncustomer_unlock", label: "Capacidade de converter não-clientes", weight: 20.0, veto: None },
    CriterionDef { key: "utility_leap", label: "Salto de utilidade para o comprador", weight: 20.0, veto: None },
    CriterionDef { key: "cost_curve_break", label: "Quebra da estrutura de custo", weight: 15.0, veto: None },
    CriterionDef { key: "new_demand_creation", label: "Criação de nova demanda", weight: 15.0, veto: None },
    CriterionDef { key: "latent_demand_evidence", label: "Evidência de demanda latente", weight: 10.0, veto: None },
];

fn expert_defs(engine: EngineKind) -> &'static [CriterionDef; 5] {
    match engine {
        EngineKind::EconomicRoi => &ECONOMIC,
        EngineKind::AspirationTransformation => &ASPIRATION,
        EngineKind::RiskMandatory => &RISK,
        EngineKind::TransactionAsset => &TRANSACTION,
        EngineKind::NetworkMarketplace => &NETWORK,
        EngineKind::ConvenienceExperience => &CONVENIENCE,
    }
}

fn scorecard(
    scope: &str,
    signals: &BTreeMap<String, Signal>,
    defs: &[CriterionDef],
) -> Result<ScoreCard, EngineError> {
    let mut weighted = 0.0;
    let mut weighted_confidence = 0.0;
    let mut total_weight = 0.0;
    let mut criteria = Vec::with_capacity(defs.len());

    for def in defs {
        let signal = signals.get(def.key).ok_or_else(|| EngineError::MissingSignal {
            scope: scope.to_string(),
            key: def.key.to_string(),
        })?;

        let score = signal.score();
        let confidence = signal.confidence();
        let veto_failed = def.veto.is_some_and(|threshold| score < threshold);

        weighted += score * def.weight;
        weighted_confidence += confidence * def.weight;
        total_weight += def.weight;

        criteria.push(CriterionResult {
            key: def.key.to_string(),
            label: def.label.to_string(),
            score,
            confidence,
            threshold: def.veto,
            veto_failed,
        });
    }

    let weighted_average = weighted / total_weight;
    let coverage = weighted_confidence / total_weight;

    // V7: nonlinear compression. Ordinary "good" averages must not become 8/10.
    // 7.0 avg -> ~5.5; 8.0 -> ~6.8; 9.0 -> ~8.4; 9.4 -> ~9.0.
    let raw = strict_curve(weighted_average);
    let conservative = raw.min(evidence_score_cap(coverage));

    Ok(ScoreCard {
        raw_score: round1(raw),
        evidence_coverage: round3(coverage),
        conservative_score: round1(conservative),
        criteria,
    })
}

fn router_signal(input: &ThesisInput, engine: EngineKind) -> Option<&Signal> {
    input.router.get(&engine)
}

fn selected_engines(input: &ThesisInput) -> Result<Vec<EngineKind>, EngineError> {
    if !input.engine_override.is_empty() {
        let unique: BTreeSet<_> = input.engine_override.iter().copied().collect();
        return Ok(unique.into_iter().collect());
    }

    let mut routes: Vec<(EngineKind, f64)> = input
        .router
        .iter()
        .map(|(engine, signal)| (*engine, signal.score()))
        .collect();

    if routes.is_empty() {
        return Err(EngineError::NoViableRoute);
    }

    routes.sort_by(|a, b| b.1.total_cmp(&a.1));
    let top = routes[0].1;

    // V4 is hybrid: include meaningful secondary engines close to the winner.
    let selected: Vec<_> = routes
        .into_iter()
        .filter(|(_, affinity)| *affinity >= 6.0 && *affinity >= top - 2.0)
        .take(3)
        .map(|(engine, _)| engine)
        .collect();

    if selected.is_empty() {
        Err(EngineError::NoViableRoute)
    } else {
        Ok(selected)
    }
}

fn entry_flags(learning: &ScoreCard) -> Vec<CriterionResult> {
    learning
        .criteria
        .iter()
        .filter(|c| match c.key.as_str() {
            "access_to_payer" => c.score < 4.0,
            "low_adoption_friction" => c.score < 3.0,
            "independent_entry" => c.score < 3.0,
            _ => false,
        })
        .cloned()
        .collect()
}

fn all_fatal_vetoes(universal: &ScoreCard, experts: &[ExpertEvaluation]) -> Vec<CriterionResult> {
    let mut vetoes: Vec<_> = universal
        .criteria
        .iter()
        .filter(|c| c.veto_failed)
        .cloned()
        .collect();

    for expert in experts {
        vetoes.extend(
            expert
                .scorecard
                .criteria
                .iter()
                .filter(|c| c.veto_failed)
                .cloned(),
        );
    }
    vetoes
}

fn evidence_level_for_decision(input: &ThesisInput) -> EvidenceLevel {
    // Conservative: use the strongest commercial evidence anywhere in the universal/expert layer.
    input
        .universal
        .values()
        .chain(input.experts.values().flat_map(|m| m.values()))
        .map(|s| s.evidence)
        .max_by_key(|e| match e {
            EvidenceLevel::Hypothesis => 0,
            EvidenceLevel::DeskResearch => 1,
            EvidenceLevel::CustomerBehavior => 2,
            EvidenceLevel::CommercialCommitment => 3,
            EvidenceLevel::Money => 4,
            EvidenceLevel::ObservedOutcome => 5,
        })
        .unwrap_or(EvidenceLevel::Hypothesis)
}

fn weakest_information_gap(
    universal: &ScoreCard,
    experts: &[ExpertEvaluation],
    learning: &ScoreCard,
) -> CriterionResult {
    universal
        .criteria
        .iter()
        .chain(experts.iter().flat_map(|e| e.scorecard.criteria.iter()))
        .chain(learning.criteria.iter())
        .min_by(|a, b| {
            // High score + low confidence is the most dangerous unproven assumption.
            let pa = a.score * (1.0 - a.confidence);
            let pb = b.score * (1.0 - b.confidence);
            pb.total_cmp(&pa)
        })
        .cloned()
        .expect("configured engine always has criteria")
}

fn experiment_for(critical: &CriterionResult, decision: Decision) -> ExperimentRecommendation {
    let (method, success, failure, hours) = match decision {
        Decision::KillReformulate => (
            "Não construir. Reescreva a tese ou busque evidência nova exatamente para este veto.",
            "O critério ultrapassa o limiar com evidência comportamental ou monetária.",
            "Continua abaixo do limiar ou ninguém consegue demonstrar comportamento compatível.",
            0,
        ),
        Decision::ThesisGoodEntryBad => (
            "Teste uma rota de entrada alternativa: outro ICP, canal, parceiro, wedge ou versão manual.",
            "Consegue chegar ao pagador e obter avanço comercial sem depender do bloqueio atual.",
            "A entrada continua dependente de lobby, procurement, integração ou acesso raro.",
            168,
        ),
        Decision::Falsify48h => (
            "Fale com pagadores reais e tente destruir a hipótese. Não venda a ideia; investigue comportamento atual, gasto e prioridade.",
            "Comportamento observado sustenta a nota e alguém aceita discutir preço/compromisso.",
            "A hipótese depende de opinião, elogio ou intenção sem comportamento.",
            48,
        ),
        Decision::ValidateDemand7d => (
            "Teste demanda com consequência real: preço explícito, reserva, depósito, pré-venda ou proposta comercial.",
            "Pagadores aceitam compromisso real no preço-alvo.",
            "Há interesse verbal, mas o compromisso some quando aparece preço ou fricção.",
            168,
        ),
        Decision::PaidTest30d => (
            "Feche um piloto pago e meça o outcome prometido, custo de entrega e tempo até valor.",
            "Cliente paga e o outcome é observado com economics defensáveis.",
            "Piloto só fecha grátis ou não gera o outcome central.",
            720,
        ),
        Decision::DeliverMeasureValue => (
            "Entregue e acompanhe recompra, expansão, uso e outcome. Pare de otimizar o deck.",
            "Valor se repete e gera recompra/renovação/expansão.",
            "Valor foi pontual, caro de entregar ou não sustenta recompra.",
            720,
        ),
        Decision::ScaleExpand => (
            "Escalone o canal que já demonstrou economics e registre outcomes para calibrar o motor.",
            "Aquisição e entrega mantêm economics ao crescer.",
            "CAC, entrega ou qualidade degradam materialmente com escala.",
            720,
        ),
    };

    ExperimentRecommendation {
        criterion_key: critical.key.clone(),
        criterion_label: critical.label.clone(),
        reason: format!(
            "Critério prioritário: score {:.1}/10, confiança {:.0}%.",
            critical.score,
            critical.confidence * 100.0
        ),
        method: method.to_string(),
        success_signal: success.to_string(),
        failure_signal: failure.to_string(),
        horizon_hours: hours,
        information_priority: round1(critical.score * (1.0 - critical.confidence) * 10.0),
    }
}

fn decide(
    fatal_vetoes: &[CriterionResult],
    entry_flags: &[CriterionResult],
    thesis_score: f64,
) -> Decision {
    if !fatal_vetoes.is_empty() || thesis_score < 5.5 {
        return Decision::KillReformulate;
    }
    if !entry_flags.is_empty() {
        return Decision::ThesisGoodEntryBad;
    }

    if thesis_score < 7.0 {
        Decision::Falsify48h
    } else if thesis_score < 8.0 {
        Decision::ValidateDemand7d
    } else if thesis_score < 8.6 {
        Decision::PaidTest30d
    } else if thesis_score < 9.0 {
        Decision::DeliverMeasureValue
    } else {
        Decision::ScaleExpand
    }
}

fn potential_score(input: &ThesisInput) -> Option<f64> {
    if input.potential.is_empty() {
        return None;
    }
    scorecard("potential", &input.potential, &POTENTIAL)
        .ok()
        .map(|s| s.raw_score)
}

fn signal_score(signals: &BTreeMap<String, Signal>, key: &str) -> f64 {
    signals.get(key).map(Signal::score).unwrap_or(0.0)
}

fn blue_ocean_evaluation(
    input: &ThesisInput,
) -> Result<Option<BlueOceanEvaluation>, EngineError> {
    if input.blue_ocean.is_empty() {
        return Ok(None);
    }

    let scorecard = scorecard("blue_ocean", &input.blue_ocean, &BLUE_OCEAN)?;
    let latent = signal_score(&input.blue_ocean, "latent_demand_evidence");
    let utility = signal_score(&input.blue_ocean, "utility_leap");
    let cost_break = signal_score(&input.blue_ocean, "cost_curve_break");
    let noncustomers = signal_score(&input.blue_ocean, "noncustomer_unlock");
    let current_behavior = input
        .universal
        .get("current_behavior")
        .map(Signal::score)
        .unwrap_or(5.0);

    // Guardrail: an apparently uncontested market with little evidence of latent
    // demand and little existing behavior may simply be an empty ocean.
    let empty_ocean_risk = round1(
        (((10.0 - latent) * 0.55
            + (10.0 - current_behavior) * 0.25
            + (noncustomers * (1.0 - scorecard.evidence_coverage)) * 0.20)
            * 10.0)
            .clamp(0.0, 100.0),
    );

    let value_innovation_valid =
        utility >= 6.0 && cost_break >= 5.0 && latent >= 5.0;

    let classification = if empty_ocean_risk >= 65.0 {
        BlueOceanClass::EmptyOceanRisk
    } else if scorecard.conservative_score >= 8.5
        && scorecard.evidence_coverage >= 0.70
        && utility >= 8.0
        && cost_break >= 7.0
        && latent >= 8.0
    {
        BlueOceanClass::BlueValidated
    } else if scorecard.conservative_score >= 7.0
        && value_innovation_valid
        && empty_ocean_risk < 50.0
    {
        BlueOceanClass::BlueHypothesis
    } else if scorecard.conservative_score >= 5.5 {
        BlueOceanClass::PurpleOcean
    } else {
        BlueOceanClass::RedOcean
    };

    Ok(Some(BlueOceanEvaluation {
        classification,
        scorecard,
        empty_ocean_risk,
        value_innovation_valid,
    }))
}

fn veto_criteria<'a>(
    universal: &'a ScoreCard,
    experts: &'a [ExpertEvaluation],
) -> Vec<&'a CriterionResult> {
    universal
        .criteria
        .iter()
        .chain(experts.iter().flat_map(|e| e.scorecard.criteria.iter()))
        .filter(|criterion| criterion.threshold.is_some())
        .collect()
}

fn decision_margin(universal: &ScoreCard, experts: &[ExpertEvaluation]) -> f64 {
    veto_criteria(universal, experts)
        .into_iter()
        .filter_map(|criterion| {
            criterion
                .threshold
                .map(|threshold| (criterion.score - threshold).abs())
        })
        .min_by(|a, b| a.total_cmp(b))
        .map(round1)
        .unwrap_or(10.0)
}

fn sensitivity_risk(universal: &ScoreCard, experts: &[ExpertEvaluation]) -> f64 {
    let criteria = veto_criteria(universal, experts);
    if criteria.is_empty() {
        return 0.0;
    }

    let risk = criteria
        .iter()
        .map(|criterion| {
            let threshold = criterion.threshold.unwrap_or(0.0);
            let distance = (criterion.score - threshold).abs();
            let proximity = ((2.0 - distance).max(0.0) / 2.0).clamp(0.0, 1.0);
            let uncertainty = 1.0 - criterion.confidence;
            proximity * (0.55 + uncertainty * 0.45)
        })
        .sum::<f64>()
        / criteria.len() as f64
        * 100.0;

    round1(risk)
}

fn expert_disagreement(experts: &[ExpertEvaluation]) -> f64 {
    if experts.len() <= 1 {
        return 0.0;
    }

    let mean = experts
        .iter()
        .map(|e| e.scorecard.raw_score)
        .sum::<f64>()
        / experts.len() as f64;

    let variance = experts
        .iter()
        .map(|e| {
            let delta = e.scorecard.raw_score - mean;
            delta * delta
        })
        .sum::<f64>()
        / experts.len() as f64;

    // V7 scorecards are 0-10; a 2-point standard deviation is severe disagreement.
    round1((variance.sqrt() / 2.0 * 100.0).clamp(0.0, 100.0))
}

fn decision_confidence(
    evidence_coverage: f64,
    sensitivity_risk: f64,
    expert_disagreement: f64,
) -> f64 {
    round1(
        (
            evidence_coverage.clamp(0.0, 1.0) * 0.50
                + (1.0 - sensitivity_risk / 100.0).clamp(0.0, 1.0) * 0.30
                + (1.0 - expert_disagreement / 100.0).clamp(0.0, 1.0) * 0.20
        ) * 100.0,
    )
}


fn strict_curve(score_0_10: f64) -> f64 {
    let normalized = (score_0_10.clamp(0.0, 10.0) / 10.0).powf(1.7);
    (normalized * 10.0).clamp(0.0, 10.0)
}

fn evidence_score_cap(coverage: f64) -> f64 {
    let c = coverage.clamp(0.0, 1.0);
    if c < 0.12 {
        6.3
    } else if c < 0.30 {
        7.1
    } else if c < 0.50 {
        7.8
    } else if c < 0.70 {
        8.5
    } else if c < 0.88 {
        9.2
    } else if c < 0.97 {
        9.6
    } else {
        10.0
    }
}

fn critical_headroom(universal: &ScoreCard, experts: &[ExpertEvaluation]) -> f64 {
    universal
        .criteria
        .iter()
        .chain(experts.iter().flat_map(|e| e.scorecard.criteria.iter()))
        .filter_map(|criterion| {
            criterion.threshold.map(|threshold| criterion.score - threshold)
        })
        .min_by(|a, b| a.total_cmp(b))
        .unwrap_or(3.0)
}

fn quality_score_cap(headroom: f64, has_fatal_veto: bool) -> f64 {
    if has_fatal_veto || headroom < 0.0 {
        4.9
    } else if headroom < 0.5 {
        5.9
    } else if headroom < 1.0 {
        6.9
    } else if headroom < 1.5 {
        7.9
    } else if headroom < 2.0 {
        8.6
    } else {
        10.0
    }
}

fn rating_band(score: f64) -> RatingBand {
    if score < 5.0 {
        RatingBand::Reject
    } else if score < 6.0 {
        RatingBand::Weak
    } else if score < 7.0 {
        RatingBand::Watchlist
    } else if score < 8.0 {
        RatingBand::Investigate
    } else if score < 9.0 {
        RatingBand::Priority
    } else {
        RatingBand::Exceptional
    }
}

fn weighted_harmonic(a: f64, b: f64, wa: f64, wb: f64) -> f64 {
    if a <= 0.0 || b <= 0.0 {
        return 0.0;
    }
    (wa + wb) / (wa / a + wb / b)
}

fn round1(v: f64) -> f64 {
    (v * 10.0).round() / 10.0
}

fn round3(v: f64) -> f64 {
    (v * 1000.0).round() / 1000.0
}

#[derive(Debug, Default, Clone)]
pub struct EngineV4;

pub type EngineV6 = EngineV4;
pub type EngineV7 = EngineV4;
pub type EngineV8 = EngineV4;
pub type EngineV9 = EngineV4;
pub type EngineV10 = EngineV4;

impl EngineV4 {
    pub fn evaluate(&self, input: &ThesisInput) -> Result<Evaluation, EngineError> {
        const MIN_RESEARCH_COMPLETENESS: f64 = 0.95;
        const MIN_SOURCES: usize = 12;
        const MIN_INDEPENDENT_DOMAINS: usize = 6;
        const MIN_PRIMARY_OR_OFFICIAL: usize = 2;
        const MIN_EVIDENCE_CLAIMS: usize = 12;

        let readiness = &input.research_readiness;
        let engine_ready = matches!(readiness.status, ResearchStatus::EngineReady)
            && readiness.completeness >= MIN_RESEARCH_COMPLETENESS
            && readiness.missing_fields.is_empty()
            && readiness.critical_unknowns.is_empty()
            && readiness.source_count >= MIN_SOURCES
            && readiness.independent_domains >= MIN_INDEPENDENT_DOMAINS
            && readiness.primary_or_official_sources >= MIN_PRIMARY_OR_OFFICIAL
            && readiness.evidence_claim_count >= MIN_EVIDENCE_CLAIMS;

        if !engine_ready {
            let mut missing = readiness.missing_fields.clone();
            if readiness.completeness < MIN_RESEARCH_COMPLETENESS {
                missing.push("research_completeness<0.95".to_string());
            }
            if readiness.source_count < MIN_SOURCES {
                missing.push("source_count<12".to_string());
            }
            if readiness.independent_domains < MIN_INDEPENDENT_DOMAINS {
                missing.push("independent_domains<6".to_string());
            }
            if readiness.primary_or_official_sources < MIN_PRIMARY_OR_OFFICIAL {
                missing.push("primary_or_official_sources<2".to_string());
            }
            if readiness.evidence_claim_count < MIN_EVIDENCE_CLAIMS {
                missing.push("evidence_claim_count<12".to_string());
            }
            missing.extend(readiness.critical_unknowns.iter().cloned());
            missing.sort();
            missing.dedup();

            return Err(EngineError::ResearchNotReady {
                status: readiness.status,
                completeness: readiness.completeness,
                missing,
            });
        }

        let selected = selected_engines(input)?;
        let universal = scorecard("universal", &input.universal, &UNIVERSAL)?;
        let learning = scorecard("learning", &input.learning, &LEARNING)?;

        let mut experts = Vec::with_capacity(selected.len());
        for engine in &selected {
            let signals = input
                .experts
                .get(engine)
                .ok_or(EngineError::MissingExpert(*engine))?;
            let route = router_signal(input, *engine).ok_or(EngineError::NoViableRoute)?;
            experts.push(ExpertEvaluation {
                engine: *engine,
                route_affinity: route.score(),
                route_confidence: round3(route.confidence()),
                scorecard: scorecard(
                    &format!("expert:{engine:?}"),
                    signals,
                    expert_defs(*engine),
                )?,
            });
        }

        experts.sort_by(|a, b| {
            let sa = a.scorecard.raw_score * a.route_affinity / 10.0;
            let sb = b.scorecard.raw_score * b.route_affinity / 10.0;
            sb.total_cmp(&sa)
        });

        let primary = experts.first().ok_or(EngineError::NoViableRoute)?.engine;
        let total_affinity: f64 = experts.iter().map(|e| e.route_affinity).sum();

        let expert_raw = experts
            .iter()
            .map(|e| e.scorecard.raw_score * e.route_affinity)
            .sum::<f64>()
            / total_affinity.max(1.0);

        let expert_coverage = experts
            .iter()
            .map(|e| e.scorecard.evidence_coverage * e.route_affinity)
            .sum::<f64>()
            / total_affinity.max(1.0);

        // V7: weighted harmonic mean punishes imbalance between universal fundamentals
        // and the selected value engine(s). A great expert score cannot hide a mediocre core.
        let structural_strength =
            weighted_harmonic(universal.raw_score, expert_raw, 0.45, 0.55);

        // Only evidence attached to value/economics can lift the score ceiling.
        // "Easy to test" evidence does not make the thesis itself more true.
        let evidence_coverage =
            universal.evidence_coverage * 0.45 + expert_coverage * 0.55;

        let fatal_vetoes = all_fatal_vetoes(&universal, &experts);
        let flags = entry_flags(&learning);
        let headroom = critical_headroom(&universal, &experts);
        let evidence_cap = evidence_score_cap(evidence_coverage);
        let quality_cap = quality_score_cap(headroom, !fatal_vetoes.is_empty());

        let mut thesis_score = structural_strength.min(evidence_cap).min(quality_cap);
        if !flags.is_empty() {
            thesis_score = thesis_score.min(6.9);
        }
        thesis_score = round1(thesis_score);

        let band = rating_band(thesis_score);
        let decision = decide(&fatal_vetoes, &flags, thesis_score);

        let critical = if let Some(veto) = fatal_vetoes.first() {
            veto.clone()
        } else if let Some(flag) = flags.first() {
            flag.clone()
        } else {
            weakest_information_gap(&universal, &experts, &learning)
        };

        // V7 research priority is also 0-10 and cannot outrun the quality of the thesis.
        let information_gap = (1.0 - evidence_coverage.clamp(0.0, 1.0)) * 10.0;
        let investigation_priority = if matches!(decision, Decision::KillReformulate) {
            0.0
        } else {
            (thesis_score * 0.65 + learning.raw_score * 0.25 + information_gap * 0.10)
                .min(9.5)
        };

        let sensitivity = sensitivity_risk(&universal, &experts);
        let disagreement = expert_disagreement(&experts);
        let margin = decision_margin(&universal, &experts);
        let confidence = decision_confidence(evidence_coverage, sensitivity, disagreement);
        let review_required =
            confidence < 55.0 || sensitivity >= 45.0 || disagreement >= 35.0;

        let blue_ocean = blue_ocean_evaluation(input)?;

        let v8_overlay = v8::build_overlay(
            input,
            thesis_score,
            &universal,
            &experts,
            &learning,
            blue_ocean.as_ref(),
            &fatal_vetoes,
            &flags,
            &critical,
            evidence_cap,
            quality_cap,
            structural_strength,
        )?;

        let v9_overlay = v9::build_overlay(
            input,
            thesis_score,
            decision,
            structural_strength,
            evidence_coverage,
            confidence,
            sensitivity,
            &v8_overlay,
        );

        let v10_overlay = v10::build_overlay(input, confidence);

        Ok(Evaluation {
            engine_version: ENGINE_VERSION.to_string(),
            thesis_id: input.id.clone(),
            thesis_name: input.name.clone(),
            selected_experts: selected,
            primary_expert: primary,
            universal,
            experts,
            learning,
            potential_score: potential_score(input),
            blue_ocean,
            structural_strength: round1(structural_strength),
            thesis_score,
            conservative_strength: thesis_score,
            rating_band: band,
            evidence_cap: round1(evidence_cap),
            quality_cap: round1(quality_cap),
            evidence_coverage: round3(evidence_coverage),
            investigation_priority: round1(investigation_priority),
            decision_confidence: confidence,
            sensitivity_risk: sensitivity,
            expert_disagreement: disagreement,
            decision_margin: margin,
            review_required,
            founder_fit: v8_overlay.founder_fit,
            hypothesis_posteriors: v8_overlay.hypothesis_posteriors,
            best_v8_experiment: v8_overlay.best_experiment,
            value_of_information: v8_overlay.value_of_information,
            kill_probability: v8_overlay.kill_probability,
            founder_attention_priority: v8_overlay.founder_attention_priority,
            counterfactuals: v8_overlay.counterfactuals,
            failure_patterns: v8_overlay.failure_patterns,
            robustness: v9_overlay.robustness,
            learning_ledger: v9_overlay.learning_ledger,
            decision_drift: v9_overlay.decision_drift,
            expected_option_value_brl: v9_overlay.expected_option_value_brl,
            empirical_outcome_label: v9_overlay.empirical_outcome_label,
            truth: v10_overlay.truth,
            truth_adjusted_decision_confidence: v10_overlay.truth_adjusted_decision_confidence,
            training_eligible: v10_overlay.training_eligible,
            fatal_vetoes,
            entry_flags: flags,
            decision,
            critical_issue: critical.label.clone(),
            next_experiment: experiment_for(&critical, decision),
        })
    }
}

pub type PublicCriterion = (&'static str, &'static str, f64, Option<f64>);

fn public_defs(defs: &[CriterionDef]) -> Vec<PublicCriterion> {
    defs.iter()
        .map(|d| (d.key, d.label, d.weight, d.veto))
        .collect()
}

pub fn public_config() -> BTreeMap<&'static str, Vec<PublicCriterion>> {
    let mut out = BTreeMap::new();
    out.insert("universal", public_defs(&UNIVERSAL));
    out.insert("learning", public_defs(&LEARNING));
    out.insert("potential", public_defs(&POTENTIAL));
    out.insert("blue_ocean", public_defs(&BLUE_OCEAN));
    out.insert("founder_fit", v8::public_founder_fit());
    out
}

pub fn public_expert_config() -> BTreeMap<&'static str, Vec<PublicCriterion>> {
    let mut out = BTreeMap::new();
    out.insert("ECONOMIC_ROI", public_defs(&ECONOMIC));
    out.insert("ASPIRATION_TRANSFORMATION", public_defs(&ASPIRATION));
    out.insert("RISK_MANDATORY", public_defs(&RISK));
    out.insert("TRANSACTION_ASSET", public_defs(&TRANSACTION));
    out.insert("NETWORK_MARKETPLACE", public_defs(&NETWORK));
    out.insert("CONVENIENCE_EXPERIENCE", public_defs(&CONVENIENCE));
    out
}

mod scout;
pub use scout::{scout_sparse_thesis, ScoutPrediction, SparseThesisInput, SCOUT_MODEL_VERSION};
