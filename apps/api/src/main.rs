use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde_json::{json, Value};

mod store;
use store::{MarkdownStore, ThesisRecord};
use thesis_engine::{
    calibration_report, public_config, public_expert_config, rank_portfolio, scout_sparse_thesis, update_with_evidence, update_with_experiment, EngineV10, AppendEvidenceRequest, ExperimentUpdateRequest, CalibrationRecord, PortfolioRequest, SparseThesisInput, ThesisInput, ENGINE_VERSION, SCOUT_MODEL_VERSION,
};
use tower_http::cors::{Any, CorsLayer};

#[derive(Clone)]
struct AppState {
    engine: EngineV10,
    store: MarkdownStore,
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/health", get(health))
        .route("/v1/config", get(config))
        .route("/v1/evaluate", post(evaluate))
        .route("/v1/scout", post(scout))
        .route("/v1/portfolio", post(portfolio))
        .route("/v1/experiment/update", post(update_experiment))
        .route("/v1/calibration", post(calibration))
        .route("/v1/evidence/update", post(update_evidence))
        .route("/v1/theses", get(list_theses).post(save_thesis))
        .route("/v1/theses/{id}", get(get_thesis).put(put_thesis))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .with_state(AppState {
            engine: EngineV10::default(),
            store: MarkdownStore::from_env(),
        });

    let addr = std::env::var("BIND_ADDR").unwrap_or_else(|_| "0.0.0.0:8080".into());
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .unwrap_or_else(|e| panic!("failed to bind {addr}: {e}"));

    println!("startupChecker API listening on {addr}");
    axum::serve(listener, app).await.expect("server failed");
}

async fn health() -> Json<Value> {
    Json(json!({
        "ok": true,
        "engine": "Thesis Engine V10",
        "version": ENGINE_VERSION
    }))
}

async fn config() -> Json<Value> {
    Json(json!({
        "engine_version": ENGINE_VERSION,
        "criteria": public_config(),
        "experts": public_expert_config(),
        "router": [
            {
                "key": "ECONOMIC_ROI",
                "label": "Economic ROI",
                "description": "Reduz custo, aumenta receita, libera tempo monetizável ou cria valor financeiro direto."
            },
            {
                "key": "ASPIRATION_TRANSFORMATION",
                "label": "Aspiration / Transformation",
                "description": "Sonho, identidade, status, desenvolvimento, educação, esporte ou transformação pessoal."
            },
            {
                "key": "RISK_MANDATORY",
                "label": "Risk / Mandatory",
                "description": "Obrigação, compliance, segurança, risco jurídico/regulatório ou perda relevante."
            },
            {
                "key": "TRANSACTION_ASSET",
                "label": "Transaction / Asset",
                "description": "Ativos, investimentos, arbitragem, spreads, deals, turnaround ou capital."
            },
            {
                "key": "NETWORK_MARKETPLACE",
                "label": "Network / Marketplace",
                "description": "Matching, dois ou mais lados, liquidez e valor criado pela rede."
            },
            {
                "key": "CONVENIENCE_EXPERIENCE",
                "label": "Convenience / Experience",
                "description": "Remove fricção, economiza esforço/tempo ou melhora muito a experiência."
            }
        ]
    }))
}

async fn scout(Json(input): Json<SparseThesisInput>) -> Json<Value> {
    Json(json!({
        "engine_version": ENGINE_VERSION,
        "scout_model_version": SCOUT_MODEL_VERSION,
        "prediction": scout_sparse_thesis(&input)
    }))
}

async fn portfolio(
    State(state): State<AppState>,
    Json(input): Json<PortfolioRequest>,
) -> impl IntoResponse {
    match rank_portfolio(&state.engine, &input) {
        Ok(result) => (StatusCode::OK, Json(json!(result))),
        Err(error) => (
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(json!({
                "error": error.to_string(),
                "engine_version": ENGINE_VERSION
            })),
        ),
    }
}

async fn update_evidence(
    State(state): State<AppState>,
    Json(input): Json<AppendEvidenceRequest>,
) -> impl IntoResponse {
    match update_with_evidence(&state.engine, &input) {
        Ok(result) => (StatusCode::OK, Json(json!(result))),
        Err(error) => (
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(json!({
                "error": error.to_string(),
                "engine_version": ENGINE_VERSION
            })),
        ),
    }
}

async fn update_experiment(
    State(state): State<AppState>,
    Json(input): Json<ExperimentUpdateRequest>,
) -> impl IntoResponse {
    match update_with_experiment(&state.engine, &input) {
        Ok(result) => (StatusCode::OK, Json(json!(result))),
        Err(error) => (
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(json!({
                "error": error.to_string(),
                "engine_version": ENGINE_VERSION
            })),
        ),
    }
}

async fn calibration(Json(records): Json<Vec<CalibrationRecord>>) -> Json<Value> {
    Json(json!(calibration_report(&records)))
}

async fn list_theses(
    State(state): State<AppState>,
) -> impl IntoResponse {
    match state.store.list().await {
        Ok(items) => (StatusCode::OK, Json(json!(items))),
        Err(error) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": error.to_string()})),
        ),
    }
}

async fn get_thesis(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    match state.store.read(&id).await {
        Ok(record) => (StatusCode::OK, Json(json!(record))),
        Err(error) => (
            StatusCode::NOT_FOUND,
            Json(json!({"error": error.to_string()})),
        ),
    }
}

async fn save_thesis(
    State(state): State<AppState>,
    Json(thesis): Json<ThesisInput>,
) -> impl IntoResponse {
    match state.store.save_evaluated(&state.engine, thesis).await {
        Ok(record) => (StatusCode::OK, Json(json!(record))),
        Err(error) => (
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(json!({"error": error.to_string()})),
        ),
    }
}

async fn put_thesis(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(record): Json<ThesisRecord>,
) -> impl IntoResponse {
    if record.thesis.id != id {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "path id must match record thesis id"})),
        );
    }

    match state.store.write_record(record).await {
        Ok(record) => (StatusCode::OK, Json(json!(record))),
        Err(error) => (
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(json!({"error": error.to_string()})),
        ),
    }
}

async fn evaluate(
    State(state): State<AppState>,
    Json(input): Json<ThesisInput>,
) -> impl IntoResponse {
    match state.engine.evaluate(&input) {
        Ok(result) => (StatusCode::OK, Json(json!(result))),
        Err(error) => (
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(json!({
                "error": error.to_string(),
                "engine_version": ENGINE_VERSION
            })),
        ),
    }
}
