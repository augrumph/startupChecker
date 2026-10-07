use std::collections::{BTreeMap, BTreeSet, HashMap};

use serde::{Deserialize, Serialize};

use super::{
    round1, round3, EngineError, EngineV4, Evaluation, EvidenceDirection, ThesisInput,
};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SourceKind {
    Official,
    Regulator,
    AcademicResearch,
    CompanyPrimary,
    IndustryAssociation,
    CustomerInterview,
    InternalExperiment,
    CommercialArtifact,
    ReputableMedia,
    Community,
    Synthetic,
    Unknown,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AuditGrade {
    A,
    B,
    C,
    D,
    F,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvidenceRecord {
    pub id: String,
    pub claim: String,
    pub source_kind: SourceKind,
    #[serde(default)]
    pub source_url: Option<String>,
    #[serde(default)]
    pub source_title: Option<String>,
    #[serde(default)]
    pub published_at_unix: Option<u64>,
    #[serde(default)]
    pub observed_at_unix: Option<u64>,
    #[serde(default)]
    pub fetched_at_unix: Option<u64>,
    #[serde(default)]
    pub criterion_keys: Vec<String>,
    pub direction: EvidenceDirection,
    pub strength: f64,
    #[serde(default = "one_v10")]
    pub reliability: f64,
    #[serde(default)]
    pub independence_group: Option<String>,
    #[serde(default)]
    pub content_hash: Option<String>,
    #[serde(default)]
    pub note: Option<String>,
}

fn one_v10() -> f64 { 1.0 }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TruthEvaluation {
    pub truth_score: f64,
    pub audit_grade: AuditGrade,
    pub evidence_count: usize,
    pub claim_coverage: f64,
    pub source_quality: f64,
    pub source_diversity: f64,
    pub independence_score: f64,
    pub freshness_score: f64,
    pub contradiction_rate: f64,
    pub duplicate_rate: f64,
    pub synthetic_share: f64,
    pub unsupported_critical_claims: usize,
    pub blocking_reasons: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct V10Overlay {
    pub truth: TruthEvaluation,
    pub truth_adjusted_decision_confidence: f64,
    pub training_eligible: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppendEvidenceRequest {
    pub thesis: ThesisInput,
    pub evidence: Vec<EvidenceRecord>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppendEvidenceResponse {
    pub thesis: ThesisInput,
    pub evaluation: Evaluation,
}

fn source_quality(kind: SourceKind) -> f64 {
    match kind {
        SourceKind::Official => 1.00,
        SourceKind::Regulator => 1.00,
        SourceKind::InternalExperiment => 0.98,
        SourceKind::CommercialArtifact => 0.95,
        SourceKind::AcademicResearch => 0.92,
        SourceKind::CustomerInterview => 0.86,
        SourceKind::CompanyPrimary => 0.78,
        SourceKind::IndustryAssociation => 0.76,
        SourceKind::ReputableMedia => 0.70,
        SourceKind::Community => 0.45,
        SourceKind::Unknown => 0.30,
        SourceKind::Synthetic => 0.10,
    }
}

fn half_life_days(kind: SourceKind) -> f64 {
    match kind {
        SourceKind::Regulator | SourceKind::Official => 730.0,
        SourceKind::AcademicResearch => 1095.0,
        SourceKind::InternalExperiment | SourceKind::CommercialArtifact => 540.0,
        SourceKind::CustomerInterview => 365.0,
        SourceKind::CompanyPrimary | SourceKind::IndustryAssociation => 270.0,
        SourceKind::ReputableMedia => 180.0,
        SourceKind::Community => 120.0,
        SourceKind::Synthetic | SourceKind::Unknown => 90.0,
    }
}

fn evidence_timestamp(e: &EvidenceRecord) -> Option<u64> {
    e.observed_at_unix.or(e.published_at_unix).or(e.fetched_at_unix)
}

fn as_of(input: &ThesisInput) -> u64 {
    input.evidence_as_of_unix.unwrap_or_else(|| {
        input
            .evidence_records
            .iter()
            .filter_map(|e| e.fetched_at_unix.or(e.observed_at_unix).or(e.published_at_unix))
            .max()
            .unwrap_or(0)
    })
}

fn freshness(e: &EvidenceRecord, as_of_unix: u64) -> f64 {
    if as_of_unix == 0 {
        return 0.65;
    }
    let Some(ts) = evidence_timestamp(e) else { return 0.45; };
    if ts >= as_of_unix {
        return 1.0;
    }
    let age_days = (as_of_unix - ts) as f64 / 86_400.0;
    0.5_f64.powf(age_days / half_life_days(e.source_kind))
}

fn canonical_source(e: &EvidenceRecord) -> String {
    if let Some(group) = &e.independence_group {
        if !group.trim().is_empty() {
            return group.trim().to_lowercase();
        }
    }
    if let Some(url) = &e.source_url {
        let stripped = url
            .trim()
            .trim_start_matches("https://")
            .trim_start_matches("http://");
        return stripped.split('/').next().unwrap_or(stripped).to_lowercase();
    }
    format!("{:?}:{}", e.source_kind, e.source_title.as_deref().unwrap_or("unknown")).to_lowercase()
}

fn duplicate_key(e: &EvidenceRecord) -> String {
    if let Some(hash) = &e.content_hash {
        if !hash.trim().is_empty() {
            return format!("hash:{}", hash.trim().to_lowercase());
        }
    }
    let claim = e.claim.to_lowercase().split_whitespace().collect::<Vec<_>>().join(" ");
    format!("{}|{}", canonical_source(e), claim)
}

fn critical_keys() -> &'static [&'static str] {
    &[
        "payer_clarity",
        "ability_to_pay",
        "value_intensity",
        "value_price_surplus",
        "status_quo_cost",
        "money_causality",
        "value_magnitude",
        "roi_attribution",
        "price_headroom",
        "paid_behavior",
        "credible_path",
        "mandatory_force",
        "loss_avoidance",
    ]
}

fn truth_evaluation(input: &ThesisInput) -> TruthEvaluation {
    let records = &input.evidence_records;
    if records.is_empty() {
        return TruthEvaluation {
            truth_score: 0.0,
            audit_grade: AuditGrade::F,
            evidence_count: 0,
            claim_coverage: 0.0,
            source_quality: 0.0,
            source_diversity: 0.0,
            independence_score: 0.0,
            freshness_score: 0.0,
            contradiction_rate: 0.0,
            duplicate_rate: 0.0,
            synthetic_share: 0.0,
            unsupported_critical_claims: critical_keys().len(),
            blocking_reasons: vec!["NO_AUDITABLE_EVIDENCE_RECORDS".into()],
        };
    }

    let as_of_unix = as_of(input);
    let mut quality_sum = 0.0;
    let mut freshness_sum = 0.0;
    let mut synthetic = 0usize;
    let mut source_kinds = BTreeSet::new();
    let mut independent_sources = BTreeSet::new();
    let mut duplicate_keys = HashMap::<String, usize>::new();
    let mut criterion_mass = BTreeMap::<String, (f64, f64)>::new();

    for evidence in records {
        let reliability = evidence.reliability.clamp(0.0, 1.0);
        let strength = evidence.strength.clamp(0.0, 1.0);
        quality_sum += source_quality(evidence.source_kind) * reliability;
        freshness_sum += freshness(evidence, as_of_unix);
        source_kinds.insert(evidence.source_kind);
        independent_sources.insert(canonical_source(evidence));
        *duplicate_keys.entry(duplicate_key(evidence)).or_insert(0) += 1;
        if evidence.source_kind == SourceKind::Synthetic {
            synthetic += 1;
        }

        let weighted = source_quality(evidence.source_kind)
            * reliability
            * strength
            * freshness(evidence, as_of_unix);

        for key in &evidence.criterion_keys {
            let mass = criterion_mass.entry(key.clone()).or_insert((0.0, 0.0));
            match evidence.direction {
                EvidenceDirection::Supports => mass.0 += weighted,
                EvidenceDirection::Contradicts => mass.1 += weighted,
                EvidenceDirection::Neutral => {}
            }
        }
    }

    let n = records.len() as f64;
    let source_quality_score = quality_sum / n;
    let freshness_score = freshness_sum / n;
    let source_diversity = (source_kinds.len() as f64 / 6.0).min(1.0);
    let independence_score = (independent_sources.len() as f64 / records.len().min(8) as f64).min(1.0);

    let duplicates = duplicate_keys.values().map(|count| count.saturating_sub(1)).sum::<usize>();
    let duplicate_rate = duplicates as f64 / records.len() as f64;
    let synthetic_share = synthetic as f64 / records.len() as f64;

    let mut contradiction_numerator = 0.0;
    let mut contradiction_denominator = 0.0;
    for (supports, contradicts) in criterion_mass.values() {
        let total = supports + contradicts;
        if total > 0.0 {
            contradiction_numerator += supports.min(*contradicts);
            contradiction_denominator += total;
        }
    }
    let contradiction_rate = if contradiction_denominator > 0.0 {
        contradiction_numerator / contradiction_denominator
    } else {
        0.0
    };

    let supported_critical = critical_keys()
        .iter()
        .filter(|key| {
            criterion_mass
                .get(**key)
                .map(|(support, contradict)| support >= 0.55 && support > contradict)
                .unwrap_or(false)
        })
        .count();
    let unsupported = critical_keys().len() - supported_critical;
    let claim_coverage = supported_critical as f64 / critical_keys().len() as f64;

    let base = source_quality_score * 0.25
        + claim_coverage * 0.25
        + independence_score * 0.15
        + freshness_score * 0.15
        + source_diversity * 0.10
        + (1.0 - contradiction_rate).clamp(0.0, 1.0) * 0.10;

    let penalty = duplicate_rate * 0.12 + synthetic_share * 0.25;
    let truth = ((base - penalty).clamp(0.0, 1.0) * 10.0).clamp(0.0, 10.0);

    let mut blockers = Vec::new();
    if claim_coverage < 0.50 { blockers.push("CRITICAL_CLAIM_COVERAGE_BELOW_50_PERCENT".into()); }
    if independence_score < 0.40 { blockers.push("LOW_SOURCE_INDEPENDENCE".into()); }
    if source_quality_score < 0.55 { blockers.push("LOW_SOURCE_QUALITY".into()); }
    if contradiction_rate > 0.25 { blockers.push("HIGH_CONTRADICTION_LOAD".into()); }
    if duplicate_rate > 0.30 { blockers.push("HIGH_DUPLICATE_EVIDENCE".into()); }
    if synthetic_share > 0.15 { blockers.push("SYNTHETIC_EVIDENCE_TOO_HIGH".into()); }

    let grade = if truth >= 8.5 && blockers.is_empty() {
        AuditGrade::A
    } else if truth >= 7.0 && blockers.len() <= 1 {
        AuditGrade::B
    } else if truth >= 5.5 {
        AuditGrade::C
    } else if truth >= 4.0 {
        AuditGrade::D
    } else {
        AuditGrade::F
    };

    TruthEvaluation {
        truth_score: round1(truth),
        audit_grade: grade,
        evidence_count: records.len(),
        claim_coverage: round3(claim_coverage),
        source_quality: round3(source_quality_score),
        source_diversity: round3(source_diversity),
        independence_score: round3(independence_score),
        freshness_score: round3(freshness_score),
        contradiction_rate: round3(contradiction_rate),
        duplicate_rate: round3(duplicate_rate),
        synthetic_share: round3(synthetic_share),
        unsupported_critical_claims: unsupported,
        blocking_reasons: blockers,
    }
}

pub(crate) fn build_overlay(input: &ThesisInput, decision_confidence: f64) -> V10Overlay {
    let truth = truth_evaluation(input);
    let truth_ceiling = truth.truth_score * 10.0;
    let adjusted = decision_confidence.min(truth_ceiling);
    let training_eligible = matches!(truth.audit_grade, AuditGrade::A | AuditGrade::B)
        && truth.contradiction_rate <= 0.20
        && truth.synthetic_share <= 0.10
        && truth.claim_coverage >= 0.60
        && !input.outcomes.is_empty();

    V10Overlay {
        truth,
        truth_adjusted_decision_confidence: round1(adjusted),
        training_eligible,
    }
}

pub fn update_with_evidence(
    engine: &EngineV4,
    request: &AppendEvidenceRequest,
) -> Result<AppendEvidenceResponse, EngineError> {
    let mut thesis = request.thesis.clone();

    for incoming in &request.evidence {
        if let Some(existing) = thesis.evidence_records.iter_mut().find(|e| e.id == incoming.id) {
            *existing = incoming.clone();
        } else {
            thesis.evidence_records.push(incoming.clone());
        }
    }

    let evaluation = engine.evaluate(&thesis)?;
    Ok(AppendEvidenceResponse { thesis, evaluation })
}
