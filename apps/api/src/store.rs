use std::{
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};

use serde::{Deserialize, Serialize};
use thesis_engine::{EngineV9, Evaluation, ThesisInput};
use tokio::fs;

const RECORD_START: &str = "<!-- STARTUPCHECKER_RECORD_V1 -->";
const RECORD_END: &str = "<!-- END_STARTUPCHECKER_RECORD_V1 -->";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThesisRecord {
    pub schema_version: u32,
    pub thesis: ThesisInput,
    pub evaluation: Option<Evaluation>,
    pub created_at_unix: u64,
    pub updated_at_unix: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThesisSummary {
    pub id: String,
    pub name: String,
    pub sector: String,
    pub source: String,
    pub batch: String,
    pub area: String,
    pub macro_area: String,
    pub market_types: Vec<String>,
    pub product_type: String,
    pub sales_motion: String,
    pub capital_intensity: String,
    pub regulatory_intensity: String,
    pub adaptation_mode: String,
    pub location: String,
    pub analysis_status: String,
    pub thesis_score: Option<f64>,
    pub founder_attention_priority: Option<f64>,
    pub decision: Option<String>,
    pub updated_at_unix: u64,
    pub path: String,
}

#[derive(Debug, thiserror::Error)]
pub enum StoreError {
    #[error("invalid thesis id")]
    InvalidId,
    #[error("thesis not found")]
    NotFound,
    #[error("invalid thesis markdown record")]
    InvalidRecord,
    #[error("io: {0}")]
    Io(#[from] std::io::Error),
    #[error("json: {0}")]
    Json(#[from] serde_json::Error),
}

#[derive(Debug, Clone)]
pub struct MarkdownStore {
    root: PathBuf,
}

impl MarkdownStore {
    pub fn from_env() -> Self {
        let root = std::env::var("THESIS_DATA_DIR")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("data/theses"));
        Self { root }
    }

    pub async fn ensure(&self) -> Result<(), StoreError> {
        fs::create_dir_all(&self.root).await?;
        Ok(())
    }

    fn validate_id(id: &str) -> Result<(), StoreError> {
        if id.is_empty()
            || id.len() > 120
            || !id
                .chars()
                .all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | '.'))
        {
            return Err(StoreError::InvalidId);
        }
        Ok(())
    }

    fn path_for(&self, id: &str) -> Result<PathBuf, StoreError> {
        Self::validate_id(id)?;
        Ok(self.root.join(format!("{id}.md")))
    }

    pub async fn save_evaluated(
        &self,
        engine: &EngineV9,
        thesis: ThesisInput,
    ) -> Result<ThesisRecord, StoreError> {
        self.ensure().await?;
        let path = self.path_for(&thesis.id)?;
        let now = now_unix();

        let created_at = match self.read(&thesis.id).await {
            Ok(existing) => existing.created_at_unix,
            Err(StoreError::NotFound) => now,
            Err(error) => return Err(error),
        };

        let evaluation = engine
            .evaluate(&thesis)
            .map_err(|_| StoreError::InvalidRecord)?;

        let record = ThesisRecord {
            schema_version: 1,
            thesis,
            evaluation: Some(evaluation),
            created_at_unix: created_at,
            updated_at_unix: now,
        };

        let markdown = render_markdown(&record)?;
        atomic_write(&path, markdown.as_bytes()).await?;
        Ok(record)
    }

    pub async fn write_record(&self, mut record: ThesisRecord) -> Result<ThesisRecord, StoreError> {
        self.ensure().await?;
        let path = self.path_for(&record.thesis.id)?;
        record.schema_version = 1;
        record.updated_at_unix = now_unix();
        if record.created_at_unix == 0 {
            record.created_at_unix = record.updated_at_unix;
        }
        let markdown = render_markdown(&record)?;
        atomic_write(&path, markdown.as_bytes()).await?;
        Ok(record)
    }

    pub async fn read(&self, id: &str) -> Result<ThesisRecord, StoreError> {
        let path = self.path_for(id)?;
        let text = match fs::read_to_string(path).await {
            Ok(text) => text,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
                return Err(StoreError::NotFound)
            }
            Err(error) => return Err(error.into()),
        };
        parse_markdown(&text)
    }

    pub async fn list(&self) -> Result<Vec<ThesisSummary>, StoreError> {
        self.ensure().await?;
        let mut entries = fs::read_dir(&self.root).await?;
        let mut summaries = Vec::new();

        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();
            if path.extension().and_then(|x| x.to_str()) != Some("md") {
                continue;
            }
            if path.file_name().and_then(|x| x.to_str()) == Some("README.md") {
                continue;
            }

            let Ok(text) = fs::read_to_string(&path).await else {
                continue;
            };
            let Ok(record) = parse_markdown(&text) else {
                continue;
            };
            summaries.push(summary(&record, &path));
        }

        summaries.sort_by(|a, b| b.updated_at_unix.cmp(&a.updated_at_unix));
        Ok(summaries)
    }
}

fn now_unix() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

fn summary(record: &ThesisRecord, path: &Path) -> ThesisSummary {
    let evaluation = record.evaluation.as_ref();
    ThesisSummary {
        id: record.thesis.id.clone(),
        name: record.thesis.name.clone(),
        sector: record.thesis.context.sector.clone(),
        source: record.thesis.context.source.clone(),
        batch: record.thesis.context.batch.clone(),
        area: record.thesis.context.area.clone(),
        macro_area: record.thesis.context.macro_area.clone(),
        market_types: record.thesis.context.market_types.clone(),
        product_type: record.thesis.context.product_type.clone(),
        sales_motion: record.thesis.context.sales_motion.clone(),
        capital_intensity: record.thesis.context.capital_intensity.clone(),
        regulatory_intensity: record.thesis.context.regulatory_intensity.clone(),
        adaptation_mode: record.thesis.context.adaptation_mode.clone(),
        location: record.thesis.context.location.clone(),
        analysis_status: record.thesis.context.analysis_status.clone(),
        thesis_score: evaluation.map(|e| e.thesis_score),
        founder_attention_priority: evaluation.map(|e| e.founder_attention_priority),
        decision: evaluation.map(|e| format!("{:?}", e.decision)),
        updated_at_unix: record.updated_at_unix,
        path: path.to_string_lossy().to_string(),
    }
}

fn parse_markdown(text: &str) -> Result<ThesisRecord, StoreError> {
    let start = text.find(RECORD_START).ok_or(StoreError::InvalidRecord)? + RECORD_START.len();
    let end = text[start..]
        .find(RECORD_END)
        .map(|offset| start + offset)
        .ok_or(StoreError::InvalidRecord)?;

    let block = text[start..end].trim();
    let json = block
        .strip_prefix("~~~json")
        .and_then(|x| x.strip_suffix("~~~"))
        .map(str::trim)
        .ok_or(StoreError::InvalidRecord)?;

    Ok(serde_json::from_str(json)?)
}

fn render_markdown(record: &ThesisRecord) -> Result<String, StoreError> {
    let json = serde_json::to_string_pretty(record)?;
    let evaluation = record.evaluation.as_ref();

    let score = evaluation
        .map(|e| format!("{:.1}", e.thesis_score))
        .unwrap_or_else(|| "N/A".into());
    let attention = evaluation
        .map(|e| format!("{:.1}", e.founder_attention_priority))
        .unwrap_or_else(|| "N/A".into());
    let decision = evaluation
        .map(|e| format!("{:?}", e.decision))
        .unwrap_or_else(|| "N/A".into());

    let experiments = record.thesis.experiment_ledger.len();
    let outcomes = record.thesis.outcomes.len();

    Ok(format!(
        "# {name}\n\n> StartupChecker thesis record. The JSON block is the machine source of truth; the rest is a human-readable projection.\n\n- **ID:** `{id}`\n- **Sector:** {sector}\n- **Source:** {source}\n- **Batch:** {batch}\n- **Market:** {market}\n- **Macro area:** {macro_area}\n- **Area:** {area}\n- **Product type:** {product_type}\n- **Sales motion:** {sales_motion}\n- **Capital intensity:** {capital_intensity}\n- **Regulatory intensity:** {regulatory_intensity}\n- **Location:** {location}\n- **Analysis status:** {analysis_status}\n- **Adaptation mode:** {adaptation_mode}\n- **Payer:** {payer}\n- **User:** {user}\n- **Thesis score:** {score}\n- **Founder attention:** {attention}\n- **Decision:** {decision}\n- **Experiments logged:** {experiments}\n- **Outcomes logged:** {outcomes}\n\n## Problem\n\n{problem}\n\n## Solution / wedge\n\n{solution}\n\n## Machine record\n\n{start}\n~~~json\n{json}\n~~~\n{end}\n",
        name = record.thesis.name,
        id = record.thesis.id,
        sector = record.thesis.context.sector,
        source = record.thesis.context.source,
        batch = record.thesis.context.batch,
        market = if record.thesis.context.market_types.is_empty() { "Unknown".to_string() } else { record.thesis.context.market_types.join(" / ") },
        macro_area = record.thesis.context.macro_area,
        area = record.thesis.context.area,
        product_type = record.thesis.context.product_type,
        sales_motion = record.thesis.context.sales_motion,
        capital_intensity = record.thesis.context.capital_intensity,
        regulatory_intensity = record.thesis.context.regulatory_intensity,
        location = record.thesis.context.location,
        analysis_status = record.thesis.context.analysis_status,
        adaptation_mode = record.thesis.context.adaptation_mode,
        payer = record.thesis.context.payer,
        user = record.thesis.context.user,
        problem = record.thesis.context.problem,
        solution = record.thesis.context.solution,
        start = RECORD_START,
        end = RECORD_END,
    ))
}

async fn atomic_write(path: &Path, bytes: &[u8]) -> Result<(), StoreError> {
    let tmp = path.with_extension("md.tmp");
    fs::write(&tmp, bytes).await?;
    fs::rename(&tmp, path).await?;
    Ok(())
}
