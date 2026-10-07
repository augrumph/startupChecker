use std::collections::{BTreeMap, BTreeSet};

use serde::{Deserialize, Serialize};
use thiserror::Error;

pub const ENGINE_VERSION: &str = "4.0.0";

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

    /// Strength of the thesis assuming the supplied scores are true.
    pub structural_strength: f64,

    /// Evidence-adjusted strength. This is intentionally conservative.
    pub conservative_strength: f64,

    /// Average confidence across the signals that drive the decision.
    pub evidence_coverage: f64,

    /// High = worth founder attention now. Strong structure + uncertainty + learnability.
    pub investigation_priority: f64,

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

    let raw = weighted / total_weight * 10.0;
    let coverage = weighted_confidence / total_weight;

    // Conservative shrinkage toward 50, not toward zero:
    // low evidence means uncertainty, not automatic rejection.
    let conservative = 50.0 + (raw - 50.0) * coverage;

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
    input: &ThesisInput,
) -> Decision {
    if !fatal_vetoes.is_empty() {
        return Decision::KillReformulate;
    }
    if !entry_flags.is_empty() {
        return Decision::ThesisGoodEntryBad;
    }

    match evidence_level_for_decision(input) {
        EvidenceLevel::Hypothesis | EvidenceLevel::DeskResearch => Decision::Falsify48h,
        EvidenceLevel::CustomerBehavior => Decision::ValidateDemand7d,
        EvidenceLevel::CommercialCommitment => Decision::PaidTest30d,
        EvidenceLevel::Money => Decision::DeliverMeasureValue,
        EvidenceLevel::ObservedOutcome => Decision::ScaleExpand,
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

fn round1(v: f64) -> f64 {
    (v * 10.0).round() / 10.0
}

fn round3(v: f64) -> f64 {
    (v * 1000.0).round() / 1000.0
}

#[derive(Debug, Default, Clone)]
pub struct EngineV4;

impl EngineV4 {
    pub fn evaluate(&self, input: &ThesisInput) -> Result<Evaluation, EngineError> {
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

        // Hybrid thesis: core + weighted expert blend.
        let total_affinity: f64 = experts.iter().map(|e| e.route_affinity).sum();
        let expert_raw = experts
            .iter()
            .map(|e| e.scorecard.raw_score * e.route_affinity)
            .sum::<f64>()
            / total_affinity.max(1.0);

        let expert_conservative = experts
            .iter()
            .map(|e| e.scorecard.conservative_score * e.route_affinity)
            .sum::<f64>()
            / total_affinity.max(1.0);

        let expert_coverage = experts
            .iter()
            .map(|e| e.scorecard.evidence_coverage * e.route_affinity)
            .sum::<f64>()
            / total_affinity.max(1.0);

        let structural_strength = universal.raw_score * 0.45 + expert_raw * 0.55;
        let conservative_strength =
            universal.conservative_score * 0.45 + expert_conservative * 0.55;
        let evidence_coverage =
            universal.evidence_coverage * 0.35 + expert_coverage * 0.45 + learning.evidence_coverage * 0.20;

        let fatal_vetoes = all_fatal_vetoes(&universal, &experts);
        let flags = entry_flags(&learning);
        let decision = decide(&fatal_vetoes, &flags, input);

        let critical = if let Some(veto) = fatal_vetoes.first() {
            veto.clone()
        } else if let Some(flag) = flags.first() {
            flag.clone()
        } else {
            weakest_information_gap(&universal, &experts, &learning)
        };

        // Priority rewards strong structure, low evidence and fast learning.
        // This explicitly prioritizes "promising but unproven and cheap to learn".
        let uncertainty = 1.0 - evidence_coverage.clamp(0.0, 1.0);
        let investigation_priority = if matches!(decision, Decision::KillReformulate) {
            0.0
        } else {
            structural_strength * 0.55
                + learning.raw_score * 0.25
                + (uncertainty * 100.0) * 0.20
        };

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
            structural_strength: round1(structural_strength),
            conservative_strength: round1(conservative_strength),
            evidence_coverage: round3(evidence_coverage),
            investigation_priority: round1(investigation_priority),
            fatal_vetoes,
            entry_flags: flags,
            decision,
            critical_issue: critical.label.clone(),
            next_experiment: experiment_for(&critical, decision),
        })
    }
}

pub fn public_config() -> BTreeMap<&'static str, Vec<(&'static str, &'static str, f64, Option<f64>)>> {
    let mut out = BTreeMap::new();
    out.insert(
        "universal",
        UNIVERSAL.iter().map(|d| (d.key, d.label, d.weight, d.veto)).collect(),
    );
    out.insert(
        "learning",
        LEARNING.iter().map(|d| (d.key, d.label, d.weight, d.veto)).collect(),
    );
    out.insert(
        "potential",
        POTENTIAL.iter().map(|d| (d.key, d.label, d.weight, d.veto)).collect(),
    );
    out
}
