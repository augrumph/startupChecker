use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use super::{
    scorecard, signal_score, round1, round3, BlueOceanEvaluation, CriterionDef,
    CriterionResult, Decision, EngineError, EngineKind, EngineV4, ExpertEvaluation,
    PublicCriterion, ScoreCard, ThesisInput, ENGINE_VERSION,
};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum EvidenceDirection {
    Supports,
    Contradicts,
    Neutral,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HypothesisObservation {
    pub direction: EvidenceDirection,
    pub strength: f64,
    #[serde(default = "one_v8")]
    pub reliability: f64,
    #[serde(default)]
    pub source: Option<String>,
}

fn one_v8() -> f64 { 1.0 }

fn default_prior_strength() -> f64 { 2.0 }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HypothesisInput {
    pub id: String,
    pub label: String,
    pub prior_probability: f64,
    #[serde(default = "default_prior_strength")]
    pub prior_strength: f64,
    #[serde(default)]
    pub kill_if_false: bool,
    #[serde(default)]
    pub observations: Vec<HypothesisObservation>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HypothesisPosterior {
    pub id: String,
    pub label: String,
    pub prior_probability: f64,
    pub posterior_probability: f64,
    pub entropy_bits: f64,
    pub observation_count: usize,
    pub kill_if_false: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CandidateExperiment {
    pub id: String,
    pub label: String,
    pub hypothesis_id: String,
    #[serde(default)]
    pub cost_brl: f64,
    #[serde(default)]
    pub hours: f64,
    pub decisiveness: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct V8ExperimentEvaluation {
    pub id: String,
    pub label: String,
    pub hypothesis_id: String,
    pub expected_information_gain_bits: f64,
    pub(crate) value_of_information: f64,
    pub(crate) kill_probability: f64,
    pub cost_brl: f64,
    pub hours: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FounderFitEvaluation {
    pub scorecard: ScoreCard,
    pub interpretation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Counterfactual {
    pub target_score: f64,
    pub already_reached: bool,
    pub blockers: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FailurePattern {
    pub code: String,
    pub label: String,
    pub severity: u8,
    pub reason: String,
}

#[derive(Debug, Clone)]
pub(crate) struct V8Overlay {
    pub(crate) founder_fit: Option<FounderFitEvaluation>,
    pub(crate) hypothesis_posteriors: Vec<HypothesisPosterior>,
    pub(crate) best_experiment: Option<V8ExperimentEvaluation>,
    pub value_of_information: f64,
    pub kill_probability: f64,
    pub(crate) founder_attention_priority: f64,
    pub(crate) counterfactuals: Vec<Counterfactual>,
    pub(crate) failure_patterns: Vec<FailurePattern>,
}

const FOUNDER_FIT: [CriterionDef; 6] = [
    CriterionDef { key: "domain_edge", label: "Vantagem de domínio", weight: 15.0, veto: None },
    CriterionDef { key: "distribution_access", label: "Acesso à distribuição/compradores", weight: 25.0, veto: None },
    CriterionDef { key: "build_speed", label: "Capacidade de construir rápido", weight: 20.0, veto: None },
    CriterionDef { key: "credibility", label: "Credibilidade necessária para vender", weight: 15.0, veto: None },
    CriterionDef { key: "capital_fit", label: "Compatibilidade com capital disponível", weight: 10.0, veto: None },
    CriterionDef { key: "execution_obsession", label: "Energia/obsessão para executar", weight: 15.0, veto: None },
];

pub(super) fn public_founder_fit() -> Vec<PublicCriterion> {
    FOUNDER_FIT
        .iter()
        .map(|d| (d.key, d.label, d.weight, d.veto))
        .collect()
}

fn founder_fit(input: &ThesisInput) -> Result<Option<FounderFitEvaluation>, EngineError> {
    if input.founder_fit.is_empty() {
        return Ok(None);
    }
    let sc = scorecard("founder_fit", &input.founder_fit, &FOUNDER_FIT)?;
    let interpretation = if sc.conservative_score >= 8.0 {
        "STRONG_FOUNDER_FIT"
    } else if sc.conservative_score >= 6.0 {
        "ADEQUATE_FOUNDER_FIT"
    } else {
        "WEAK_FOUNDER_FIT"
    };
    Ok(Some(FounderFitEvaluation {
        scorecard: sc,
        interpretation: interpretation.to_string(),
    }))
}

fn entropy_bits(p: f64) -> f64 {
    let p = p.clamp(1e-9, 1.0 - 1e-9);
    -p * p.log2() - (1.0 - p) * (1.0 - p).log2()
}

fn posterior(h: &HypothesisInput) -> HypothesisPosterior {
    let prior = h.prior_probability.clamp(0.01, 0.99);
    let prior_strength = h.prior_strength.max(0.25);
    let mut alpha = prior * prior_strength;
    let mut beta = (1.0 - prior) * prior_strength;

    for obs in &h.observations {
        let weight = obs.strength.clamp(0.0, 1.0) * obs.reliability.clamp(0.0, 1.0) * 4.0;
        match obs.direction {
            EvidenceDirection::Supports => alpha += weight,
            EvidenceDirection::Contradicts => beta += weight,
            EvidenceDirection::Neutral => {
                alpha += weight * 0.5;
                beta += weight * 0.5;
            }
        }
    }

    let p = alpha / (alpha + beta);
    HypothesisPosterior {
        id: h.id.clone(),
        label: h.label.clone(),
        prior_probability: round3(prior),
        posterior_probability: round3(p),
        entropy_bits: round3(entropy_bits(p)),
        observation_count: h.observations.len(),
        kill_if_false: h.kill_if_false,
    }
}

fn evaluate_experiments(
    experiments: &[CandidateExperiment],
    posteriors: &[HypothesisPosterior],
) -> Vec<V8ExperimentEvaluation> {
    let by_id: BTreeMap<&str, &HypothesisPosterior> =
        posteriors.iter().map(|p| (p.id.as_str(), p)).collect();

    let mut out = Vec::new();
    for exp in experiments {
        let Some(h) = by_id.get(exp.hypothesis_id.as_str()) else { continue; };
        let decisiveness = exp.decisiveness.clamp(0.0, 1.0);
        let information_gain = h.entropy_bits * decisiveness;

        let cost_penalty =
            1.0
            + (1.0 + exp.cost_brl.max(0.0) / 500.0).ln()
            + (1.0 + exp.hours.max(0.0) / 8.0).ln();

        let voi = (information_gain * 10.0 / cost_penalty).clamp(0.0, 10.0);
        let kill_probability = if h.kill_if_false {
            (1.0 - h.posterior_probability) * decisiveness
        } else {
            0.0
        };

        out.push(V8ExperimentEvaluation {
            id: exp.id.clone(),
            label: exp.label.clone(),
            hypothesis_id: exp.hypothesis_id.clone(),
            expected_information_gain_bits: round3(information_gain),
            value_of_information: round1(voi),
            kill_probability: round3(kill_probability),
            cost_brl: exp.cost_brl.max(0.0),
            hours: exp.hours.max(0.0),
        });
    }

    out.sort_by(|a, b| {
        b.value_of_information
            .total_cmp(&a.value_of_information)
            .then_with(|| b.kill_probability.total_cmp(&a.kill_probability))
    });
    out
}

fn criterion<'a>(card: &'a ScoreCard, key: &str) -> Option<&'a CriterionResult> {
    card.criteria.iter().find(|c| c.key == key)
}

fn expert_criterion<'a>(
    experts: &'a [ExpertEvaluation],
    engine: EngineKind,
    key: &str,
) -> Option<&'a CriterionResult> {
    experts
        .iter()
        .find(|e| e.engine == engine)
        .and_then(|e| criterion(&e.scorecard, key))
}

fn detect_failure_patterns(
    input: &ThesisInput,
    universal: &ScoreCard,
    experts: &[ExpertEvaluation],
    learning: &ScoreCard,
    blue: Option<&BlueOceanEvaluation>,
    founder: Option<&FounderFitEvaluation>,
) -> Vec<FailurePattern> {
    let mut p = Vec::new();
    let score = |card: &ScoreCard, key: &str| criterion(card, key).map(|c| c.score).unwrap_or(5.0);

    let payer = score(universal, "payer_clarity");
    let ability = score(universal, "ability_to_pay");
    let value = score(universal, "value_intensity");
    let access = score(learning, "access_to_payer");
    let adoption = score(learning, "low_adoption_friction");
    let entry = score(learning, "independent_entry");

    if value >= 7.0 && payer < 6.0 {
        p.push(FailurePattern { code:"FP-01".into(), label:"USER_LOVES_BUYER_DOESNT".into(), severity:5, reason:"Valor percebido existe, mas o pagador não está claro.".into() });
    }
    if ability < 6.0 {
        p.push(FailurePattern { code:"FP-02".into(), label:"NO_BUDGET".into(), severity:5, reason:"O pagador não demonstra capacidade real de sustentar preço suficiente.".into() });
    }
    if access < 4.0 {
        p.push(FailurePattern { code:"FP-03".into(), label:"MARKET_ACCESS_BLOCKED".into(), severity:4, reason:"Chegar ao comprador já é um gargalo estrutural.".into() });
    }
    if blue.is_some_and(|b| b.empty_ocean_risk >= 65.0) {
        p.push(FailurePattern { code:"FP-04".into(), label:"EMPTY_OCEAN".into(), severity:5, reason:"White space pode ser ausência de demanda, não criação de categoria.".into() });
    }
    if adoption < 3.0 {
        p.push(FailurePattern { code:"FP-05".into(), label:"IMPLEMENTATION_KILLS".into(), severity:4, reason:"A fricção de adoção pode consumir o valor criado.".into() });
    }
    if input.potential.contains_key("payer_density")
        && signal_score(&input.potential, "payer_density") < 5.0
        && signal_score(&input.universal, "value_price_surplus") >= 7.0
    {
        p.push(FailurePattern { code:"FP-06".into(), label:"SMALL_MARKET_HIGH_WTP".into(), severity:3, reason:"Pode existir WTP, mas pouca densidade de compradores.".into() });
    }
    if expert_criterion(experts, EngineKind::ConvenienceExperience, "substitution_resistance").is_some_and(|c| c.score < 5.0) {
        p.push(FailurePattern { code:"FP-07".into(), label:"EASY_SUBSTITUTE".into(), severity:4, reason:"A solução pode ser facilmente substituída por grátis/manual/LLM horizontal.".into() });
    }
    if founder.is_some_and(|f| f.scorecard.conservative_score < 5.0) {
        p.push(FailurePattern { code:"FP-08".into(), label:"FOUNDER_MARKET_FIT".into(), severity:4, reason:"A oportunidade pode ser boa, mas o time não tem vantagem suficiente para persegui-la.".into() });
    }
    if entry < 3.0 {
        p.push(FailurePattern { code:"FP-09".into(), label:"GATEKEEPER_DEPENDENCY".into(), severity:5, reason:"A entrada depende de incumbente, lobby, procurement ou autorização rara.".into() });
    }
    if input.potential.contains_key("capital_efficiency")
        && signal_score(&input.potential, "capital_efficiency") < 4.0
    {
        p.push(FailurePattern { code:"FP-10".into(), label:"ECONOMICS_ONLY_AT_SCALE".into(), severity:3, reason:"A tese pode exigir capital/escala antes de provar economics.".into() });
    }

    p
}

fn counterfactuals(
    thesis_score: f64,
    structural_strength: f64,
    evidence_cap: f64,
    quality_cap: f64,
    fatal_vetoes: &[CriterionResult],
    entry_flags: &[CriterionResult],
) -> Vec<Counterfactual> {
    [7.0, 8.0, 9.0]
        .into_iter()
        .map(|target| {
            let mut blockers = Vec::new();
            if thesis_score >= target {
                return Counterfactual { target_score: target, already_reached: true, blockers };
            }
            for veto in fatal_vetoes {
                blockers.push(format!("Resolver veto: {} ({:.1} < {:.1})", veto.label, veto.score, veto.threshold.unwrap_or(0.0)));
            }
            if structural_strength < target {
                blockers.push(format!("Estrutura teórica precisa subir de {:.1} para pelo menos {:.1}", structural_strength, target));
            }
            if evidence_cap < target {
                blockers.push(format!("Evidência atual limita a nota a {:.1}; elevar maturidade da evidência", evidence_cap));
            }
            if quality_cap < target {
                blockers.push(format!("Elo crítico limita a nota a {:.1}; aumentar folga acima dos vetos", quality_cap));
            }
            if target >= 8.0 && !entry_flags.is_empty() {
                blockers.push("Resolver bloqueio de entrada/distribuição antes de tratar como prioridade".into());
            }
            Counterfactual { target_score: target, already_reached: false, blockers }
        })
        .collect()
}

pub(super) fn build_overlay(
    input: &ThesisInput,
    thesis_score: f64,
    universal: &ScoreCard,
    experts: &[ExpertEvaluation],
    learning: &ScoreCard,
    blue: Option<&BlueOceanEvaluation>,
    fatal_vetoes: &[CriterionResult],
    entry_flags: &[CriterionResult],
    critical: &CriterionResult,
    evidence_cap: f64,
    quality_cap: f64,
    structural_strength: f64,
) -> Result<V8Overlay, EngineError> {
    let founder = founder_fit(input)?;
    let posteriors: Vec<_> = input.hypotheses.iter().map(posterior).collect();
    let experiments = evaluate_experiments(&input.candidate_experiments, &posteriors);
    let best = experiments.first().cloned();

    let threshold_proximity = critical.threshold.map(|t| {
        (1.0 - ((critical.score - t).abs() / 3.0).min(1.0)).clamp(0.0, 1.0)
    }).unwrap_or(0.6);

    let fallback_voi = ((1.0 - critical.confidence) * threshold_proximity * 10.0).clamp(0.0, 10.0);
    let voi = best.as_ref().map(|e| e.value_of_information).unwrap_or(round1(fallback_voi));
    let kill_probability = best.as_ref().map(|e| e.kill_probability).unwrap_or(0.0);
    let learning_score = learning.raw_score;

    let mut attention = if let Some(f) = founder.as_ref() {
        thesis_score * 0.40
            + learning_score * 0.15
            + f.scorecard.conservative_score * 0.20
            + voi * 0.25
    } else {
        thesis_score * 0.55 + learning_score * 0.20 + voi * 0.25
    };

    if !fatal_vetoes.is_empty() || thesis_score < 5.0 {
        attention = attention.min(4.9);
    } else if !entry_flags.is_empty() {
        attention = attention.min(6.9);
    }

    let failures = detect_failure_patterns(input, universal, experts, learning, blue, founder.as_ref());
    let counters = counterfactuals(
        thesis_score,
        structural_strength,
        evidence_cap,
        quality_cap,
        fatal_vetoes,
        entry_flags,
    );

    Ok(V8Overlay {
        founder_fit: founder,
        hypothesis_posteriors: posteriors,
        best_experiment: best,
        value_of_information: round1(voi),
        kill_probability: round3(kill_probability),
        founder_attention_priority: round1(attention.clamp(0.0, 10.0)),
        counterfactuals: counters,
        failure_patterns: failures,
    })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortfolioRequest {
    pub items: Vec<ThesisInput>,
    #[serde(default)]
    pub budget_hours: Option<f64>,
    #[serde(default)]
    pub budget_brl: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortfolioEntry {
    pub rank: usize,
    pub thesis_id: String,
    pub thesis_name: String,
    pub thesis_score: f64,
    pub founder_attention_priority: f64,
    pub value_of_information: f64,
    pub founder_fit_score: Option<f64>,
    pub decision: Decision,
    pub best_experiment: Option<V8ExperimentEvaluation>,
    pub selected_for_budget: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortfolioResponse {
    pub engine_version: String,
    pub total_items: usize,
    pub allocated_hours: f64,
    pub allocated_brl: f64,
    pub ranking: Vec<PortfolioEntry>,
}

pub fn rank_portfolio(
    engine: &EngineV4,
    request: &PortfolioRequest,
) -> Result<PortfolioResponse, EngineError> {
    let mut rows = Vec::new();
    for item in &request.items {
        let evaluation = engine.evaluate(item)?;
        rows.push((item, evaluation));
    }

    rows.sort_by(|a, b| {
        b.1.founder_attention_priority
            .total_cmp(&a.1.founder_attention_priority)
            .then_with(|| b.1.thesis_score.total_cmp(&a.1.thesis_score))
    });

    let mut spent_hours = 0.0;
    let mut spent_brl = 0.0;
    let hours_budget = request.budget_hours.unwrap_or(f64::INFINITY);
    let brl_budget = request.budget_brl.unwrap_or(f64::INFINITY);
    let allocation_enabled = request.budget_hours.is_some() || request.budget_brl.is_some();

    let mut ranking = Vec::new();
    for (index, (input, eval)) in rows.into_iter().enumerate() {
        let exp_hours = eval.best_v8_experiment.as_ref().map(|e| e.hours).unwrap_or(0.0);
        let exp_brl = eval.best_v8_experiment.as_ref().map(|e| e.cost_brl).unwrap_or(0.0);

        let selected = allocation_enabled
            && eval.best_v8_experiment.is_some()
            && spent_hours + exp_hours <= hours_budget
            && spent_brl + exp_brl <= brl_budget
            && eval.founder_attention_priority >= 5.0;

        if selected {
            spent_hours += exp_hours;
            spent_brl += exp_brl;
        }

        ranking.push(PortfolioEntry {
            rank: index + 1,
            thesis_id: input.id.clone(),
            thesis_name: input.name.clone(),
            thesis_score: eval.thesis_score,
            founder_attention_priority: eval.founder_attention_priority,
            value_of_information: eval.value_of_information,
            founder_fit_score: eval.founder_fit.as_ref().map(|f| f.scorecard.conservative_score),
            decision: eval.decision,
            best_experiment: eval.best_v8_experiment.clone(),
            selected_for_budget: selected,
        });
    }

    Ok(PortfolioResponse {
        engine_version: ENGINE_VERSION.to_string(),
        total_items: ranking.len(),
        allocated_hours: round1(spent_hours),
        allocated_brl: round1(spent_brl),
        ranking,
    })
}
