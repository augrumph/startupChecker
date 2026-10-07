"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BrainCircuit,
  CheckCircle2,
  CircleDollarSign,
  Database,
  FlaskConical,
  Gauge,
  Layers3,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  Minus,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import styles from "./ThesisDashboard.module.css";

type ThesisSummaryApi = {
  id: string;
  name: string;
  sector: string;
  source: string;
  payer: string;
  problem: string;
  solution: string;
  batch: string;
  area: string;
  macro_area: string;
  market_types: string[];
  product_type: string;
  sales_motion: string;
  capital_intensity: string;
  regulatory_intensity: string;
  adaptation_mode: string;
  location: string;
  analysis_status: string;
  research_status: string;
  research_completeness: number;
  research_missing_fields: number;
  research_source_count: number;
  research_independent_domains: number;
  research_primary_sources: number;
  research_evidence_claims: number;
  thesis_score: number | null;
  founder_attention_priority: number | null;
  decision: string | null;
  updated_at_unix: number;
};

type DeepResearchItem = {
  deep_research_rank: number;
  id: string;
  name: string;
  tagline: string;
  batch: string;
  categories: string[];
  scout_priority: number;
  ocean: string;
  research_priority: number;
  research_status: string;
  why: string;
  what_can_kill: string;
  sources: string[];
  thesis_ptbr?: string;
  buyer_ptbr?: string;
  problem_ptbr?: string;
  value_ptbr?: string;
  evidence_ptbr?: string[];
  why_ranked_ptbr?: string;
};

type DeepResearchLeaderboard = {
  generated_at: string;
  items: DeepResearchItem[];
};

type CriterionResult = {
  key: string;
  label: string;
  score: number;
  confidence: number;
  threshold?: number | null;
  veto_failed?: boolean;
};

type ScoreCard = {
  raw_score: number;
  conservative_score: number;
  evidence_coverage: number;
  criteria: CriterionResult[];
};

type EngineEvaluation = {
  engine_version: string;
  thesis_id: string;
  thesis_name: string;
  thesis_score: number;
  structural_strength: number;
  rating_band: string;
  evidence_cap: number;
  quality_cap: number;
  evidence_coverage: number;
  investigation_priority: number;
  decision_confidence: number;
  truth_adjusted_decision_confidence: number;
  founder_attention_priority: number;
  selected_experts: string[];
  primary_expert: string;
  universal: ScoreCard;
  experts: Array<{
    engine: string;
    route_affinity: number;
    route_confidence: number;
    scorecard: ScoreCard;
  }>;
  learning: ScoreCard;
  potential_score?: number | null;
  blue_ocean?: {
    classification: string;
    empty_ocean_risk: number;
    scorecard: ScoreCard;
  } | null;
  fatal_vetoes: CriterionResult[];
  entry_flags: CriterionResult[];
  decision: string;
  critical_issue: string;
  next_experiment: {
    reason: string;
    method: string;
    success_signal: string;
    failure_signal: string;
    horizon_hours: number;
  };
  counterfactuals?: Array<Record<string, unknown>>;
  truth?: Record<string, unknown>;
};

type ThesisRecordApi = {
  schema_version: number;
  thesis: {
    id: string;
    name: string;
    context: {
      sector: string;
      payer: string;
      user: string;
      problem: string;
      solution: string;
      source: string;
      area: string;
      macro_area: string;
      market_types: string[];
      [key: string]: unknown;
    };
    research_readiness: {
      status: string;
      dossier_version: string;
      completeness: number;
      missing_fields: string[];
      source_count: number;
      independent_domains: number;
      primary_or_official_sources: number;
      evidence_claim_count: number;
      field_count?: number;
      supported_field_count?: number;
      critical_unknowns: string[];
    };
    research_dossier?: Record<string, any> | null;
    universal?: Record<string, any>;
    experts?: Record<string, Record<string, any>>;
    learning?: Record<string, any>;
    potential?: Record<string, any>;
    blue_ocean?: Record<string, any>;
    [key: string]: unknown;
  };
  evaluation: EngineEvaluation | null;
  updated_at_unix: number;
};

type ListRow = {
  id: string;
  name: string;
  source: string;
  area: string;
  macroArea: string;
  marketTypes: string[];
  productType: string;
  salesMotion: string;
  batch: string;
  payer: string;
  problem: string;
  solution: string;
  researchStatus: string;
  completeness: number;
  missingFields: number;
  sourceCount: number;
  independentDomains: number;
  primarySources: number;
  evidenceClaims: number;
  score: number | null;
  founderAttention: number | null;
  decision: string | null;
  deep?: DeepResearchItem;
};

type RunState = {
  running: boolean;
  total: number;
  processed: number;
  scored: number;
  failed: number;
  blocked: number;
  currentName: string;
  message: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const PAGE_SIZE = 30;

const EMPTY_RUN: RunState = {
  running: false,
  total: 0,
  processed: 0,
  scored: 0,
  failed: 0,
  blocked: 0,
  currentName: "",
  message: "",
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || ("HTTP " + response.status));
  }
  return text ? JSON.parse(text) as T : (null as T);
}

function scoreTone(score: number) {
  if (score >= 9) return styles.good;
  if (score >= 8) return styles.warn;
  if (score >= 7) return styles.watch;
  return styles.bad;
}

function percent(value: number) {
  return Math.round(Math.max(0, Math.min(1, value)) * 100);
}

function humanDecision(value?: string | null) {
  if (!value) return "Não avaliada";
  const map: Record<string, string> = {
    KillReformulate: "Matar / reformular",
    KILL_REFORMULATE: "Matar / reformular",
    ThesisGoodEntryBad: "Tese boa, entrada ruim",
    THESIS_GOOD_ENTRY_BAD: "Tese boa, entrada ruim",
    Falsify48h: "Falsificar em 48h",
    FALSIFY_48H: "Falsificar em 48h",
    ValidateDemand7d: "Validar demanda em 7 dias",
    VALIDATE_DEMAND_7D: "Validar demanda em 7 dias",
    PaidTest30d: "Teste pago em 30 dias",
    PAID_TEST_30D: "Teste pago em 30 dias",
    DeliverMeasureValue: "Entregar e medir valor",
    DELIVER_MEASURE_VALUE: "Entregar e medir valor",
    ScaleExpand: "Escalar / expandir",
    SCALE_EXPAND: "Escalar / expandir",
  };
  return map[value] ?? value.replaceAll("_", " ");
}

function engineLabel(value?: string) {
  const map: Record<string, string> = {
    ECONOMIC_ROI: "ROI Econômico",
    ASPIRATION_TRANSFORMATION: "Aspiração / Transformação",
    RISK_MANDATORY: "Risco / Obrigação",
    TRANSACTION_ASSET: "Transação / Ativo",
    NETWORK_MARKETPLACE: "Rede / Marketplace",
    CONVENIENCE_EXPERIENCE: "Conveniência / Experiência",
  };
  return value ? (map[value] ?? value) : "—";
}

function factAnswer(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value.answer === "string") return value.answer;
  return "";
}

function dossierText(record: ThesisRecordApi | null, deep: DeepResearchItem | undefined, kind: "thesis" | "buyer" | "problem" | "value") {
  const dossier = record?.thesis.research_dossier as any;
  const seed = dossier?._seed_context ?? {};
  const context = record?.thesis.context;
  if (kind === "thesis") {
    return factAnswer(dossier?.thesis?.rewrittenPtBr)
      || seed.thesis_ptbr
      || deep?.thesis_ptbr
      || context?.solution
      || "";
  }
  if (kind === "buyer") {
    return factAnswer(dossier?.buyer?.economicBuyer)
      || seed.economic_buyer
      || deep?.buyer_ptbr
      || context?.payer
      || "";
  }
  if (kind === "problem") {
    return factAnswer(dossier?.problem?.jobToBeDone)
      || seed.problem_ptbr
      || deep?.problem_ptbr
      || context?.problem
      || "";
  }
  return factAnswer(dossier?.economics?.roiMechanism)
    || factAnswer(dossier?.economics?.valueEquation)
    || seed.pricing_history
    || deep?.value_ptbr
    || "";
}

function signalNote(record: ThesisRecordApi | null, scope: "universal" | "learning" | "expert", key: string, engine?: string) {
  if (!record) return "";
  if (scope === "expert" && engine) {
    return String(record.thesis.experts?.[engine]?.[key]?.note ?? "");
  }
  return String((record.thesis as any)?.[scope]?.[key]?.note ?? "");
}

export function ThesisDashboard() {
  const [theses, setTheses] = useState<ThesisSummaryApi[]>([]);
  const [research, setResearch] = useState<DeepResearchItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedRecord, setSelectedRecord] = useState<ThesisRecordApi | null>(null);
  const [mode, setMode] = useState<"RANKING" | "ALL" | "TRAINING">("ALL");
  const [query, setQuery] = useState("");
  const [market, setMarket] = useState("ALL");
  const [macro, setMacro] = useState("ALL");
  const [area, setArea] = useState("ALL");
  const [batch, setBatch] = useState("ALL");
  const [product, setProduct] = useState("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [run, setRun] = useState<RunState>(EMPTY_RUN);
  const [baselineRanks, setBaselineRanks] = useState<Record<string, number>>({});

  async function refreshUniverse() {
    const [thesisData, researchData] = await Promise.all([
      fetchJson<ThesisSummaryApi[]>(API_URL + "/v1/theses"),
      fetchJson<DeepResearchLeaderboard>(API_URL + "/v1/leaderboards/deep-research").catch(() => ({ generated_at: "", items: [] })),
    ]);
    setTheses(thesisData);
    setResearch(researchData.items ?? []);
    if (!selectedId && thesisData.length) setSelectedId(thesisData[0].id);
    return thesisData;
  }

  useEffect(() => {
    let active = true;
    refreshUniverse()
      .catch(() => {
        if (!active) return;
        setTheses([]);
        setResearch([]);
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSelectedRecord(null);
      return;
    }
    let active = true;
    fetchJson<ThesisRecordApi>(API_URL + "/v1/theses/" + encodeURIComponent(selectedId))
      .then((record) => active && setSelectedRecord(record))
      .catch(() => active && setSelectedRecord(null));
    return () => { active = false; };
  }, [selectedId, theses]);

  const researchById = useMemo(() => new Map(research.map((item) => [item.id, item])), [research]);

  const allRows = useMemo<ListRow[]>(() => {
    return theses.map((item) => ({
      id: item.id,
      name: item.name,
      source: item.source,
      area: item.area || item.sector,
      macroArea: item.macro_area,
      marketTypes: item.market_types ?? [],
      productType: item.product_type,
      salesMotion: item.sales_motion,
      batch: item.batch,
      payer: item.payer,
      problem: item.problem,
      solution: item.solution,
      researchStatus: item.research_status,
      completeness: item.research_completeness,
      missingFields: item.research_missing_fields,
      sourceCount: item.research_source_count,
      independentDomains: item.research_independent_domains,
      primarySources: item.research_primary_sources,
      evidenceClaims: item.research_evidence_claims,
      score: item.thesis_score,
      founderAttention: item.founder_attention_priority,
      decision: item.decision,
      deep: researchById.get(item.id),
    }));
  }, [theses, researchById]);

  const rankingRows = useMemo(() => {
    return allRows
      .filter((row) => row.score != null)
      .sort((a, b) => (b.score! - a.score!) || ((b.founderAttention ?? 0) - (a.founderAttention ?? 0)));
  }, [allRows]);

  const currentRankById = useMemo(
    () => new Map(rankingRows.map((row, index) => [row.id, index + 1])),
    [rankingRows],
  );

  const options = useMemo(() => {
    const unique = (values: Array<string | undefined>) => [...new Set(values.filter(Boolean) as string[])].sort();
    return {
      macros: unique(allRows.map((row) => row.macroArea)),
      areas: unique(allRows.filter((row) => macro === "ALL" || row.macroArea === macro).map((row) => row.area)),
      batches: unique(allRows.map((row) => row.batch)),
      products: unique(allRows.map((row) => row.productType)),
    };
  }, [allRows, macro]);

  const filteredAll = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter((row) => {
      const haystack = [
        row.name, row.area, row.macroArea, row.productType, row.source, row.batch,
        row.payer, row.problem, row.solution, ...(row.marketTypes ?? []),
      ].filter(Boolean).join(" ").toLowerCase();
      return (!q || haystack.includes(q))
        && (market === "ALL" || row.marketTypes.includes(market))
        && (macro === "ALL" || row.macroArea === macro)
        && (area === "ALL" || row.area === area)
        && (batch === "ALL" || row.batch === batch)
        && (product === "ALL" || row.productType === product);
    });
  }, [allRows, query, market, macro, area, batch, product]);

  const rankingFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rankingRows.filter((row) => !q || [row.name, row.area, row.solution].join(" ").toLowerCase().includes(q));
  }, [rankingRows, query]);

  const rows = mode === "RANKING" ? rankingFiltered : filteredAll;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => setPage(1), [mode, query, market, macro, area, batch, product]);

  const selected = allRows.find((row) => row.id === selectedId) ?? allRows[0];
  const engineReady = allRows.filter((row) => row.researchStatus === "ENGINE_READY").length;
  const evaluated = allRows.filter((row) => row.score != null).length;
  const blocked = allRows.length - engineReady;

  async function runEngine() {
    if (run.running) return;

    try {
      const fresh = await fetchJson<ThesisSummaryApi[]>(API_URL + "/v1/theses");
      const ready = fresh.filter((item) => item.research_status === "ENGINE_READY");
      const previousRanking = [...fresh]
        .filter((item) => item.thesis_score != null)
        .sort((a, b) => (b.thesis_score! - a.thesis_score!))
        .reduce<Record<string, number>>((acc, item, index) => {
          acc[item.id] = index + 1;
          return acc;
        }, {});
      setBaselineRanks(previousRanking);

      if (!ready.length) {
        setRun({
          running: false,
          total: 0,
          processed: 0,
          scored: 0,
          failed: 0,
          blocked: fresh.length,
          currentName: "",
          message: "Nenhuma tese está ENGINE_READY. O motor permaneceu bloqueado, como deveria.",
        });
        setMode("ALL");
        return;
      }

      let working = [...fresh];
      let scored = 0;
      let failed = 0;
      setMode("RANKING");
      setRun({
        running: true,
        total: ready.length,
        processed: 0,
        scored: 0,
        failed: 0,
        blocked: fresh.length - ready.length,
        currentName: ready[0]?.name ?? "",
        message: "Motor V10 iniciado. O ranking será recalculado a cada tese concluída.",
      });

      for (let index = 0; index < ready.length; index += 1) {
        const target = ready[index];
        setRun((current) => ({ ...current, currentName: target.name }));

        try {
          const record = await fetchJson<ThesisRecordApi>(API_URL + "/v1/theses/" + encodeURIComponent(target.id));
          const evaluation = await fetchJson<EngineEvaluation>(API_URL + "/v1/evaluate", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(record.thesis),
          });

          record.evaluation = evaluation;
          const saved = await fetchJson<ThesisRecordApi>(API_URL + "/v1/theses/" + encodeURIComponent(target.id), {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(record),
          });

          scored += 1;
          working = working.map((item) => item.id === target.id ? {
            ...item,
            thesis_score: evaluation.thesis_score,
            founder_attention_priority: evaluation.founder_attention_priority,
            decision: evaluation.decision,
            updated_at_unix: saved.updated_at_unix,
          } : item);
          setTheses([...working]);

          if (selectedId === target.id) setSelectedRecord(saved);
        } catch (error) {
          failed += 1;
        }

        setRun((current) => ({
          ...current,
          processed: index + 1,
          scored,
          failed,
          currentName: ready[index + 1]?.name ?? "",
          message: index + 1 === ready.length
            ? "Execução concluída. Ranking final calculado."
            : "Ranking provisório atualizado em tempo real.",
        }));

        await new Promise((resolve) => setTimeout(resolve, 90));
      }

      const finalData = await refreshUniverse();
      setRun((current) => ({
        ...current,
        running: false,
        processed: ready.length,
        scored,
        failed,
        blocked: finalData.length - finalData.filter((item) => item.research_status === "ENGINE_READY").length,
        currentName: "",
        message: "Motor concluído. O ranking exibido agora é o V10 persistido nos arquivos Markdown.",
      }));
    } catch (error) {
      setRun({
        ...EMPTY_RUN,
        failed: 1,
        message: "Falha ao iniciar o motor: " + String(error),
      });
    }
  }

  function rankDelta(row: ListRow) {
    const current = currentRankById.get(row.id);
    const before = baselineRanks[row.id];
    if (!current) return null;
    if (!before) return { kind: "new" as const, value: 0 };
    const delta = before - current;
    if (delta > 0) return { kind: "up" as const, value: delta };
    if (delta < 0) return { kind: "down" as const, value: Math.abs(delta) };
    return { kind: "same" as const, value: 0 };
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.mark}><BrainCircuit size={17} strokeWidth={2.25} /></div>
          <div><strong>Startup Checker</strong><span>Motor de Teses V10</span></div>
        </div>

        <nav className={styles.nav}>
          <button className={styles.navActive}><LayoutDashboard size={16} /><span>Teses</span></button>
          <button><FlaskConical size={16} /><span>Experimentos</span></button>
          <button><Activity size={16} /><span>Outcomes</span></button>
        </nav>

        <div className={styles.stats}>
          <div><Database size={14} /><span>Universo</span><strong>{allRows.length}</strong></div>
          <div><ShieldCheck size={14} /><span>Prontas</span><strong>{engineReady}</strong></div>
          <div><Trophy size={14} /><span>Avaliadas</span><strong>{evaluated}</strong></div>
          <div><LockKeyhole size={14} /><span>Bloqueadas</span><strong>{blocked}</strong></div>
        </div>

        <button className={styles.runButton} onClick={runEngine} disabled={run.running || loading}>
          {run.running ? <LoaderCircle size={16} className={styles.spin} /> : <Play size={16} />}
          <span>{run.running ? "Rodando motor…" : "Rodar motor V10"}</span>
        </button>

        <div className={styles.sidebarNote}>
          Só teses 100% <strong>ENGINE_READY</strong> entram no motor. Pesquisa incompleta nunca recebe nota.
        </div>
      </aside>

      <section className={styles.listPane}>
        <header className={styles.listHeader}>
          <div>
            <span className={styles.kicker}><Sparkles size={13} /> Central de decisão</span>
            <h1>{mode === "RANKING" ? "Ranking V10" : "Universo"}</h1>
            <p>{mode === "RANKING" ? "Ordem determinada somente pelo motor." : "Pesquisa primeiro. Julgamento depois."}</p>
          </div>
          <button className={styles.iconButton} onClick={() => refreshUniverse()} aria-label="Atualizar">
            <RefreshCw size={16} />
          </button>
        </header>

        <div className={styles.tabs}>
          <button onClick={() => setMode("RANKING")} className={mode === "RANKING" ? styles.tabActive : ""}><Trophy size={13} />Ranking V10</button>
          <button onClick={() => setMode("ALL")} className={mode === "ALL" ? styles.tabActive : ""}><Layers3 size={13} />Universo</button>
          <button onClick={() => setMode("TRAINING")} className={mode === "TRAINING" ? styles.tabActive : ""}><BrainCircuit size={13} />Treino</button>
        </div>

        {run.message ? (
          <div className={styles.runPanel}>
            <div className={styles.runPanelTop}>
              <div>
                <span>{run.running ? "Execução ao vivo" : "Estado do motor"}</span>
                <strong>{run.running && run.currentName ? "Processando " + run.currentName : run.message}</strong>
              </div>
              <div className={styles.runNumbers}>
                <b>{run.processed}/{run.total}</b>
                <small>{run.scored} scores · {run.failed} falhas · {run.blocked} bloqueadas</small>
              </div>
            </div>
            {run.total > 0 ? (
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: Math.round((run.processed / run.total) * 100) + "%" }} />
              </div>
            ) : null}
            {run.running ? <p>{run.message}</p> : null}
          </div>
        ) : null}

        {mode !== "TRAINING" ? (
          <>
            <div className={styles.search}>
              <Search size={15} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar tese, área, pagador, problema..." />
            </div>

            {mode === "ALL" ? (
              <div className={styles.filters}>
                <div className={styles.marketTabs}>
                  {["ALL", "B2B", "B2C", "B2G", "B2B2C"].map((value) => (
                    <button key={value} className={market === value ? styles.chipActive : ""} onClick={() => setMarket(value)}>
                      {value === "ALL" ? "Todos" : value}
                    </button>
                  ))}
                </div>
                <select value={macro} onChange={(e) => { setMacro(e.target.value); setArea("ALL"); }}>
                  <option value="ALL">Todas as macro áreas</option>
                  {options.macros.map((value) => <option key={value}>{value}</option>)}
                </select>
                <select value={area} onChange={(e) => setArea(e.target.value)}>
                  <option value="ALL">Todas as áreas</option>
                  {options.areas.map((value) => <option key={value}>{value}</option>)}
                </select>
                <select value={batch} onChange={(e) => setBatch(e.target.value)}>
                  <option value="ALL">Todos os batches</option>
                  {options.batches.map((value) => <option key={value}>{value}</option>)}
                </select>
                <select value={product} onChange={(e) => setProduct(e.target.value)}>
                  <option value="ALL">Todos os produtos</option>
                  {options.products.map((value) => <option key={value}>{value}</option>)}
                </select>
              </div>
            ) : null}

            <div className={styles.listMeta}>
              <strong>{rows.length}</strong>
              <span>{mode === "RANKING" ? "teses avaliadas" : "teses no universo"}</span>
              <span>· página {safePage}/{totalPages}</span>
            </div>

            <div className={styles.list}>
              {loading ? <div className={styles.empty}>Carregando…</div> : mode === "RANKING" && !pageRows.length ? (
                <div className={styles.emptyState}>
                  <Trophy size={24} />
                  <strong>O ranking ainda não existe.</strong>
                  <p>Complete os dossiês até ENGINE_READY e clique em “Rodar motor V10”. Nenhuma nota antiga será reaproveitada.</p>
                </div>
              ) : pageRows.map((row) => {
                const rank = currentRankById.get(row.id);
                const delta = rankDelta(row);
                return (
                  <button
                    key={row.id}
                    onClick={() => setSelectedId(row.id)}
                    className={styles.row + " " + (selected?.id === row.id ? styles.rowSelected : "")}
                  >
                    <div className={styles.scoreBadge}>
                      {row.score != null ? row.score.toFixed(1) : row.researchStatus === "ENGINE_READY" ? "READY" : percent(row.completeness) + "%"}
                      <small>{row.score != null ? "V10" : row.researchStatus === "ENGINE_READY" ? "motor" : "pesquisa"}</small>
                    </div>
                    <div className={styles.rowCopy}>
                      <div>
                        <strong>{rank ? "#" + rank + " · " : ""}{row.name}</strong>
                        {delta ? (
                          <span className={styles.delta}>
                            {delta.kind === "up" ? <ArrowUp size={10} /> : delta.kind === "down" ? <ArrowDown size={10} /> : delta.kind === "same" ? <Minus size={10} /> : <Sparkles size={10} />}
                            {delta.kind === "new" ? "novo" : delta.value || ""}
                          </span>
                        ) : (
                          <span>{row.researchStatus === "ENGINE_READY" ? "pronta" : row.researchStatus.toLowerCase().replaceAll("_", " ")}</span>
                        )}
                      </div>
                      <p>{row.solution || row.deep?.thesis_ptbr || ("Hipótese de " + row.area)}</p>
                      <small>{[row.source, row.area, row.batch, ...row.marketTypes].filter(Boolean).join(" · ")}</small>
                      {row.score == null && row.researchStatus !== "ENGINE_READY" ? (
                        <em>{row.missingFields} lacunas · {row.sourceCount} fontes · {row.independentDomains} domínios</em>
                      ) : row.decision ? <em>{humanDecision(row.decision)}</em> : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className={styles.pagination}>
              <button disabled={safePage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ArrowLeft size={13} />Anterior</button>
              <span>{safePage} / {totalPages}</span>
              <button disabled={safePage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Próxima<ArrowRight size={13} /></button>
            </div>
          </>
        ) : (
          <div className={styles.training}>
            <span><BrainCircuit size={13} /> ScoutNet · somente triagem</span>
            <h2>Treino auxiliar</h2>
            <div><strong>363</strong><small>teses no treino legado</small></div>
            <div><strong>0,7664</strong><small>LinearSVC macro-F1</small></div>
            <div><strong>0,8154</strong><small>acurácia</small></div>
            <div><strong>0,7334</strong><small>MLP desafiante · macro-F1</small></div>
            <p>O ScoutNet só ajuda a ordenar pesquisa. Ele não pode entrar no ranking final nem superar o Rust V10.</p>
          </div>
        )}
      </section>

      <section className={styles.detailPane}>
        {!selected ? (
          <div className={styles.empty}>Selecione uma tese.</div>
        ) : (
          <CanonicalDetail
            row={selected}
            record={selectedRecord?.thesis.id === selected.id ? selectedRecord : null}
            rank={currentRankById.get(selected.id) ?? null}
          />
        )}
      </section>
    </main>
  );
}

function CanonicalDetail({ row, record, rank }: { row: ListRow; record: ThesisRecordApi | null; rank: number | null }) {
  const evaluation = record?.evaluation ?? null;
  const readiness = record?.thesis.research_readiness;
  const deep = row.deep;
  const thesis = dossierText(record, deep, "thesis") || row.solution;
  const buyer = dossierText(record, deep, "buyer") || row.payer;
  const problem = dossierText(record, deep, "problem") || row.problem;
  const value = dossierText(record, deep, "value") || "Ainda não consolidado no dossiê.";
  const ready = row.researchStatus === "ENGINE_READY";
  const heroValue = evaluation ? evaluation.thesis_score.toFixed(1) : percent(readiness?.completeness ?? row.completeness) + "%";
  const heroLabel = evaluation ? "nota V10" : "pesquisa completa";

  const allCriteria = evaluation ? [
    ...evaluation.universal.criteria.map((criterion) => ({ ...criterion, scope: "universal" as const, engine: "" })),
    ...evaluation.experts.flatMap((expert) => expert.scorecard.criteria.map((criterion) => ({ ...criterion, scope: "expert" as const, engine: expert.engine }))),
  ] : [];
  const sortedCriteria = [...allCriteria].sort((a, b) => b.score - a.score);
  const strengths = sortedCriteria.slice(0, 3);
  const weaknesses = [...allCriteria].sort((a, b) => a.score - b.score).slice(0, 3);

  return (
    <div className={styles.detailContent}>
      <header className={styles.detailHeader}>
        <div>
          <span className={styles.kicker}><Layers3 size={13} />{row.source} · {row.area}</span>
          <h2>{row.name}</h2>
        </div>
        <span className={styles.status}>
          {evaluation ? <Trophy size={12} /> : ready ? <CheckCircle2 size={12} /> : <LockKeyhole size={12} />}
          {evaluation ? humanDecision(evaluation.decision) : ready ? "ENGINE_READY" : "Motor bloqueado"}
        </span>
      </header>

      <section className={styles.hero}>
        <div className={styles.scoreOrb}>
          <div className={styles.heroScore + " " + (evaluation ? scoreTone(evaluation.thesis_score) : styles.neutral)}>
            <strong>{heroValue}</strong>
            <span>{heroLabel}</span>
          </div>
        </div>

        <div className={styles.heroNarrative}>
          <span className={styles.sectionEyebrow}>
            {evaluation ? <BrainCircuit size={13} /> : <ShieldCheck size={13} />}
            {evaluation ? "decisão do motor" : "prontidão de pesquisa"}
          </span>
          <h3>{evaluation ? (rank ? "Por que está em #" + rank + "?" : "Por que recebeu essa nota?") : "O que precisa acontecer antes do score?"}</h3>
          <p className={styles.thesisStatement}>
            {evaluation
              ? evaluation.critical_issue
              : ready
                ? "O dossiê está 100% completo e pode ser julgado pelo V10. Clique em “Rodar motor V10” para gerar e persistir a avaliação."
                : "O motor está intencionalmente bloqueado. Enquanto existir qualquer lacuna factual, a tese permanece sem nota."}
          </p>

          {evaluation ? (
            <div className={styles.next}>
              <Zap size={16} />
              <div><span>Próximo experimento</span><strong>{evaluation.next_experiment.method}</strong></div>
              <span>{evaluation.next_experiment.horizon_hours}h</span>
            </div>
          ) : (
            <div className={styles.readinessStrip}>
              <span>{readiness?.source_count ?? row.sourceCount} fontes</span>
              <span>{readiness?.independent_domains ?? row.independentDomains} domínios</span>
              <span>{readiness?.primary_or_official_sources ?? row.primarySources} primárias/oficiais</span>
              <span>{readiness?.evidence_claim_count ?? row.evidenceClaims} claims</span>
            </div>
          )}
        </div>
      </section>

      <section className={styles.memoGrid}>
        <article className={styles.memoCard}>
          <div className={styles.memoIcon}><Sparkles size={17} /></div>
          <span>Tese reformulada</span>
          <strong>{thesis || "Ainda não consolidada."}</strong>
        </article>
        <article className={styles.memoCard}>
          <div className={styles.memoIcon}><CircleDollarSign size={17} /></div>
          <span>Quem paga</span>
          <strong>{buyer || "Ainda não comprovado."}</strong>
        </article>
        <article className={styles.memoCard}>
          <div className={styles.memoIcon}><Target size={17} /></div>
          <span>Dor econômica</span>
          <strong>{problem || "Ainda não comprovada."}</strong>
        </article>
      </section>

      <section className={styles.card}>
        <h3><Zap size={17} />Como a tese pretende capturar valor</h3>
        <p>{value}</p>
      </section>

      {evaluation ? (
        <>
          <section className={styles.card}>
            <h3><Gauge size={17} />Como o V10 chegou à nota</h3>
            <div className={styles.factGrid}>
              <div><span>Estrutura</span><strong>{evaluation.structural_strength.toFixed(1)}</strong></div>
              <div><span>Cap de evidência</span><strong>{evaluation.evidence_cap.toFixed(1)}</strong></div>
              <div><span>Cap de qualidade</span><strong>{evaluation.quality_cap.toFixed(1)}</strong></div>
              <div><span>Confiança ajustada</span><strong>{Math.round(evaluation.truth_adjusted_decision_confidence * 100)}%</strong></div>
            </div>
            <p className={styles.scoreExplanation}>
              Especialista principal: {engineLabel(evaluation.primary_expert)}. A nota final não pode ultrapassar os caps de evidência e qualidade, mesmo quando a força estrutural é alta.
            </p>
          </section>

          <section className={styles.twoCols}>
            <div className={styles.card}>
              <h3><CheckCircle2 size={17} />O que mais sustenta a tese</h3>
              <div className={styles.explainList}>
                {strengths.map((criterion) => (
                  <div key={criterion.scope + criterion.engine + criterion.key}>
                    <span>{criterion.score.toFixed(1)}</span>
                    <div>
                      <strong>{criterion.label}</strong>
                      <p>{signalNote(record, criterion.scope, criterion.key, criterion.engine) || ("Confiança " + Math.round(criterion.confidence * 100) + "%.")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <h3><XCircle size={17} />O que limita ou pode matar</h3>
              <div className={styles.explainList}>
                {(evaluation.fatal_vetoes.length ? evaluation.fatal_vetoes : weaknesses).map((criterion) => (
                  <div key={"weak-" + criterion.key}>
                    <span>{criterion.score.toFixed(1)}</span>
                    <div>
                      <strong>{criterion.label}</strong>
                      <p>{criterion.veto_failed ? "Falhou um veto estrutural do motor." : "É um dos critérios mais fracos da tese."}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h3><BrainCircuit size={17} />Leitura detalhada dos critérios</h3>
            <div className={styles.criteriaTable}>
              {evaluation.universal.criteria.map((criterion) => (
                <CriterionLine
                  key={criterion.key}
                  criterion={criterion}
                  note={signalNote(record, "universal", criterion.key)}
                />
              ))}
              {evaluation.experts.map((expert) => expert.scorecard.criteria.map((criterion) => (
                <CriterionLine
                  key={expert.engine + criterion.key}
                  criterion={criterion}
                  note={signalNote(record, "expert", criterion.key, expert.engine)}
                  prefix={engineLabel(expert.engine)}
                />
              )))}
              {evaluation.learning.criteria.map((criterion) => (
                <CriterionLine
                  key={"learning-" + criterion.key}
                  criterion={criterion}
                  note={signalNote(record, "learning", criterion.key)}
                  prefix="Aprendizado"
                />
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className={styles.card}>
          <h3><LockKeyhole size={17} />Gate de pesquisa antes do motor</h3>
          <div className={styles.factGrid}>
            <div><span>Completude</span><strong>{percent(readiness?.completeness ?? row.completeness)}%</strong></div>
            <div><span>Fontes</span><strong>{readiness?.source_count ?? row.sourceCount}/20+</strong></div>
            <div><span>Domínios</span><strong>{readiness?.independent_domains ?? row.independentDomains}/10+</strong></div>
            <div><span>Claims</span><strong>{readiness?.evidence_claim_count ?? row.evidenceClaims}/25+</strong></div>
          </div>

          {!ready ? (
            <>
              <div className={styles.warning}>
                <AlertTriangle size={15} />
                <span>Faltam {(readiness?.missing_fields?.length ?? row.missingFields) + (readiness?.critical_unknowns?.length ?? 0)} itens. O V10 se recusa a avaliar esta tese.</span>
              </div>
              <div className={styles.missingGrid}>
                {(readiness?.missing_fields ?? []).slice(0, 24).map((item) => <code key={item}>{item}</code>)}
                {(readiness?.critical_unknowns ?? []).slice(0, 8).map((item) => <code key={"u-" + item}>{item}</code>)}
              </div>
            </>
          ) : (
            <div className={styles.readyBanner}><CheckCircle2 size={16} />Dossiê 100% completo. Pronta para o motor.</div>
          )}
        </section>
      )}

      {deep?.why_ranked_ptbr || deep?.why ? (
        <section className={styles.twoCols}>
          <div className={styles.card}>
            <h3><Trophy size={17} />Leitura do Deep Research anterior</h3>
            <p>{deep.why_ranked_ptbr || deep.why}</p>
          </div>
          <div className={styles.card}>
            <h3><XCircle size={17} />Risco apontado na pesquisa</h3>
            <p>{deep.what_can_kill || "Sem risco consolidado no Pass 1."}</p>
          </div>
        </section>
      ) : null}

      {deep?.sources?.length ? (
        <section className={styles.card}>
          <h3><Database size={17} />Fontes já associadas à tese</h3>
          <div className={styles.sources}>
            {deep.sources.map((url, index) => {
              let host = url;
              try { host = new URL(url).hostname.replace("www.", ""); } catch {}
              return <a key={url} href={url} target="_blank" rel="noreferrer">Fonte {index + 1} · {host}</a>;
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function CriterionLine({ criterion, note, prefix }: { criterion: CriterionResult; note?: string; prefix?: string }) {
  return (
    <div className={styles.criterionLine}>
      <div>
        <span>{prefix || "Fundamento"}</span>
        <strong>{criterion.label}</strong>
        <p>{note || ("Confiança da evidência: " + Math.round(criterion.confidence * 100) + "%.")}</p>
      </div>
      <div className={styles.criterionScore}>
        <strong>{criterion.score.toFixed(1)}</strong>
        {criterion.threshold != null ? <small>veto {criterion.threshold.toFixed(1)}</small> : <small>sem veto</small>}
      </div>
    </div>
  );
}
