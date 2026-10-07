use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde_json::{json, Value};
use thesis_engine::{public_config, EngineV4, ThesisInput, ENGINE_VERSION};
use tower_http::cors::{Any, CorsLayer};

#[derive(Clone, Default)]
struct AppState {
    engine: EngineV4,
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/health", get(health))
        .route("/v1/config", get(config))
        .route("/v1/evaluate", post(evaluate))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .with_state(AppState::default());

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
        "engine": "Thesis Engine V4",
        "version": ENGINE_VERSION
    }))
}

async fn config() -> Json<Value> {
    Json(json!({
        "engine_version": ENGINE_VERSION,
        "universal_learning_potential": public_config(),
        "expert_engines": [
            "ECONOMIC_ROI",
            "ASPIRATION_TRANSFORMATION",
            "RISK_MANDATORY",
            "TRANSACTION_ASSET",
            "NETWORK_MARKETPLACE",
            "CONVENIENCE_EXPERIENCE"
        ]
    }))
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
