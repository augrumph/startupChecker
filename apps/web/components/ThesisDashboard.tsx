"use client";

import { Activity, AlertTriangle, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BrainCircuit, CheckCircle2, CircleDollarSign, Database, FlaskConical, Gauge, Layers3, LayoutDashboard, LoaderCircle, LockKeyhole, Minus, Play, RefreshCw, Search, ShieldCheck, SlidersHorizontal, Sparkles, Target, Trophy, XCircle, Zap } from "lucide-react";
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
  thesis_score: number | null;
  founder_attention_priority: number | null;
  decision: string | null;
};

type DeepResearchItem = {
  deep_research_rank: number;
  id: string;
  name: string;
  tagline: string;
  batch: string;
  categories: string[];
  scout_priority: number;
  ocean: "BLUE_HYPOTHESIS" | "PURPLE_OCEAN";
  research_priority: number;
  research_status: "DEEP_RESEARCHED" | "DEEP_RESEARCH_PARTIAL" | "RESEARCH_INCOMPLETE";
  why: string;
  what_can_kill: string;
  sources: string[];
  tagline_original?: string;
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

type EngineEvaluation = {
  engine_version: string;
  thesis_id: string;
  thesis_name: string;
  thesis_score: number;
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
  universal: { raw_score: number; conservative_score: number; criteria: CriterionResult[] };
  experts: Array<{ engine: string; route_affinity: number; route_confidence: number; scorecard: { raw_score: number; conservative_score: number; criteria: CriterionResult[] } }>;
  learning: { raw_score: number; conservative_score: number; criteria: CriterionResult[] };
  potential_score?: number | null;
  blue_ocean?: { classification: string; empty_ocean_risk: number; scorecard: { raw_score: number; conservative_score: number; criteria: CriterionResult[] } } | null;
  fatal_vetoes: CriterionResult[];
  entry_flags: CriterionResult[];
  decision: string;
  critical_issue: string;
  next_experiment: { reason: string; method: string; success_signal: string; failure_signal: string; horizon_hours: number };
  counterfactuals?: Array<{ target_score?: number; description?: string; changes?: string[] }>;
  truth?: { truth_score?: number; [key: string]: unknown };
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

function scoreTone(score: number) {
  if (score >= 8) return styles.good;
  if (score >= 7) return styles.warn;
  if (score >= 5.5) return styles.watch;
  return styles.bad;
}

function statusLabel(status?: string) {
  if (status === "DEEP_RESEARCHED") return "evidência forte";
  if (status === "DEEP_RESEARCH_PARTIAL") return "pesquisa parcial";
  if (status === "RESEARCH_INCOMPLETE") return "pesquisa incompleta";
  return "triagem";
}

export function ThesisDashboard() {
  const [theses, setTheses] = useState<ThesisSummaryApi[]>([]);
  const [research, setResearch] = useState<DeepResearchItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("GYF-01");
  const [mode, setMode] = useState<"BEST" | "ALL" | "TRAINING">("BEST");
  const [query, setQuery] = useState("");
  const [market, setMarket] = useState("ALL");
  const [macro, setMacro] = useState("ALL");
  const [area, setArea] = useState("ALL");
  const [batch, setBatch] = useState("ALL");
  const [product, setProduct] = useState("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`${API_URL}/v1/theses`).then((r) => r.ok ? r.json() : Promise.reject(new Error(`theses ${r.status}`))),
      fetch(`${API_URL}/v1/leaderboards/deep-research`).then((r) => r.ok ? r.json() : Promise.reject(new Error(`research ${r.status}`))),
    ])
      .then(([thesisData, researchData]: [ThesisSummaryApi[], DeepResearchLeaderboard]) => {
        if (!active) return;
        setTheses(thesisData);
        setResearch(researchData.items ?? []);
      })
      .catch(() => {
        if (!active) return;
        setTheses([]);
        setResearch([]);
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const researchById = useMemo(() => new Map(research.map((item) => [item.id, item])), [research]);

  const allRows = useMemo<ListRow[]>(() => {
    const imported = theses.map((item) => {
      const deep = researchById.get(item.id);
      return {
        id: item.id,
        name: item.name,
        area: item.area || item.sector,
        batch: item.batch,
        marketTypes: item.market_types,
        productType: item.product_type,
        macroArea: item.macro_area,
        salesMotion: item.sales_motion,
        capitalIntensity: item.capital_intensity,
        regulatoryIntensity: item.regulatory_intensity,
        adaptationMode: item.adaptation_mode,
        analysisStatus: item.analysis_status,
        v10Score: item.thesis_score,
        researchPriority: deep?.research_priority ?? null,
        researchRank: deep?.deep_research_rank ?? null,
        researchStatus: deep?.research_status,
        tagline: deep?.tagline,
        why: deep?.why,
        whatCanKill: deep?.what_can_kill,
        sources: deep?.sources,
        thesisPtbr: deep?.thesis_ptbr,
        buyerPtbr: deep?.buyer_ptbr,
        problemPtbr: deep?.problem_ptbr,
        valuePtbr: deep?.value_ptbr,
        evidencePtbr: deep?.evidence_ptbr,
        whyRankedPtbr: deep?.why_ranked_ptbr,
      } satisfies ListRow;
    });

    const calibratedRows = calibrated.map((item) => ({
      id: item.id,
      name: item.name,
      area: item.sector,
      marketTypes: item.id === "GYF-01" ? ["B2C"] : ["B2B"],
      v10Score: item.score,
      researchPriority: null,
      researchRank: null,
      calibrated: item,
    } satisfies ListRow));

    return [...calibratedRows, ...imported.filter((row) => !calibratedRows.some((seed) => seed.id === row.id))];
  }, [theses, researchById]);

  const options = useMemo(() => {
    const unique = (values: Array<string | undefined>) => [...new Set(values.filter(Boolean) as string[])].sort();
    return {
      markets: unique(allRows.flatMap((row) => row.marketTypes ?? [])),
      macros: unique(allRows.map((row) => row.macroArea)),
      areas: unique(allRows.filter((row) => macro === "ALL" || row.macroArea === macro).map((row) => row.area)),
      batches: unique(allRows.map((row) => row.batch)),
      products: unique(allRows.map((row) => row.productType)),
    };
  }, [allRows, macro]);

  const filteredAll = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter((row) => {
      const haystack = [row.name, row.area, row.batch, row.macroArea, row.productType, ...(row.marketTypes ?? [])].filter(Boolean).join(" ").toLowerCase();
      return (!q || haystack.includes(q))
        && (market === "ALL" || row.marketTypes?.includes(market))
        && (macro === "ALL" || row.macroArea === macro)
        && (area === "ALL" || row.area === area)
        && (batch === "ALL" || row.batch === batch)
        && (product === "ALL" || row.productType === product);
    });
  }, [allRows, query, market, macro, area, batch, product]);

  const bestRows = useMemo<ListRow[]>(() => {
    const q = query.trim().toLowerCase();
    return research
      .filter((item) => !q || `${item.name} ${item.thesis_ptbr ?? ""} ${item.categories.join(" ")}`.toLowerCase().includes(q))
      .map((item) => {
        const source = allRows.find((row) => row.id === item.id);
        return {
          id: item.id,
          name: item.name,
          area: source?.area || item.categories.join(" / "),
          batch: item.batch,
          marketTypes: source?.marketTypes,
          productType: source?.productType,
          macroArea: source?.macroArea,
          salesMotion: source?.salesMotion,
          capitalIntensity: source?.capitalIntensity,
          regulatoryIntensity: source?.regulatoryIntensity,
          adaptationMode: source?.adaptationMode,
          analysisStatus: source?.analysisStatus,
          v10Score: source?.v10Score ?? null,
          researchPriority: item.research_priority,
          researchRank: item.deep_research_rank,
          researchStatus: item.research_status,
          tagline: item.tagline,
          why: item.why,
          whatCanKill: item.what_can_kill,
          sources: item.sources,
          thesisPtbr: item.thesis_ptbr,
          buyerPtbr: item.buyer_ptbr,
          problemPtbr: item.problem_ptbr,
          valuePtbr: item.value_ptbr,
          evidencePtbr: item.evidence_ptbr,
          whyRankedPtbr: item.why_ranked_ptbr,
        };
      });
  }, [research, allRows, query]);

  const rows = mode === "BEST" ? bestRows : filteredAll;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => setPage(1), [mode, query, market, macro, area, batch, product]);

  const selected = allRows.find((row) => row.id === selectedId)
    ?? bestRows.find((row) => row.id === selectedId)
    ?? allRows[0]
    ?? bestRows[0];

  const evidenceRich = research.filter((item) => item.research_status === "DEEP_RESEARCHED").length;
  const partial = research.filter((item) => item.research_status === "DEEP_RESEARCH_PARTIAL").length;

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
          <div><Database size={14} /><span>Universo</span><strong>{allRows.length || 543}</strong></div>
          <div><BrainCircuit size={14} /><span>Pesquisa profunda</span><strong>{research.length}</strong></div>
          <div><ShieldCheck size={14} /><span>Evidência forte</span><strong>{evidenceRich}</strong></div>
          <div><Layers3 size={14} /><span>Pesquisa parcial</span><strong>{partial}</strong></div>
        </div>
        <div className={styles.sidebarNote}>Sparse ≠ nota zero. Sem avaliação, o sistema mostra N/A.</div>
      </aside>

      <section className={styles.listPane}>
        <header className={styles.listHeader}>
          <div><span className={styles.kicker}><Sparkles size={13} /> Central de análise</span><h1>Teses</h1><p>Mate cedo. Aprofunde só onde há sinal.</p></div>
          <button className={styles.iconButton} aria-label="Filtros"><SlidersHorizontal size={16} /></button>
        </header>

        <div className={styles.tabs}>
          <button onClick={() => setMode("BEST")} className={mode === "BEST" ? styles.tabActive : ""}><Trophy size={13} />Melhores</button>
          <button onClick={() => setMode("ALL")} className={mode === "ALL" ? styles.tabActive : ""}><Layers3 size={13} />Todas</button>
          <button onClick={() => setMode("TRAINING")} className={mode === "TRAINING" ? styles.tabActive : ""}><BrainCircuit size={13} />Treino</button>
        </div>

        {mode !== "TRAINING" ? (
          <>
            <div className={styles.search}><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar tese, área, batch..." /></div>
            {mode === "ALL" ? (
              <div className={styles.filters}>
                <div className={styles.marketTabs}>{["ALL", "B2B", "B2C", "B2G", "B2B2C"].map((value) => <button key={value} className={market === value ? styles.chipActive : ""} onClick={() => setMarket(value)}>{value === "ALL" ? "Todos" : value}</button>)}</div>
                <select value={macro} onChange={(e) => { setMacro(e.target.value); setArea("ALL"); }}><option value="ALL">Todas as macro áreas</option>{options.macros.map((v) => <option key={v}>{v}</option>)}</select>
                <select value={area} onChange={(e) => setArea(e.target.value)}><option value="ALL">Todas as áreas</option>{options.areas.map((v) => <option key={v}>{v}</option>)}</select>
                <select value={batch} onChange={(e) => setBatch(e.target.value)}><option value="ALL">Todos os batches</option>{options.batches.map((v) => <option key={v}>{v}</option>)}</select>
                <select value={product} onChange={(e) => setProduct(e.target.value)}><option value="ALL">Todos os produtos</option>{options.products.map((v) => <option key={v}>{v}</option>)}</select>
              </div>
            ) : null}

            <div className={styles.listMeta}><strong>{rows.length}</strong><span>teses</span><span>· página {safePage}/{totalPages}</span></div>
            <div className={styles.list}>
              {loading ? <div className={styles.empty}>Carregando…</div> : pageRows.map((row) => (
                <button key={row.id} onClick={() => setSelectedId(row.id)} className={`${styles.row} ${selected?.id === row.id ? styles.rowSelected : ""}`}>
                  <div className={styles.scoreBadge}>
                    {row.v10Score != null ? row.v10Score.toFixed(1) : row.researchPriority != null ? row.researchPriority.toFixed(1) : "N/A"}
                    <small>{row.v10Score != null ? "V10" : row.researchPriority != null ? "pesquisa" : "triagem"}</small>
                  </div>
                  <div className={styles.rowCopy}>
                    <div><strong>{row.name}</strong>{row.researchRank ? <span>#{row.researchRank}</span> : null}</div>
                    <p>{row.thesisPtbr || `Hipótese de ${row.area} ainda em triagem analítica.`}</p>
                    <small>{[row.area, row.batch, ...(row.marketTypes ?? [])].filter(Boolean).join(" · ")}</small>
                    {row.why ? <em>{row.why}</em> : null}
                  </div>
                </button>
              ))}
            </div>
            <div className={styles.pagination}>
              <button disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ArrowLeft size={13} />Anterior</button>
              <span>{safePage} / {totalPages}</span>
              <button disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Próxima<ArrowRight size={13} /></button>
            </div>
          </>
        ) : (
          <div className={styles.training}>
            <span><BrainCircuit size={13} /> ScoutNet · somente apoio à triagem</span>
            <h2>Treino atual</h2>
            <div><strong>363</strong><small>teses no treino</small></div>
            <div><strong>0.7664</strong><small>LinearSVC macro-F1</small></div>
            <div><strong>0.8154</strong><small>acurácia</small></div>
            <div><strong>0.7334</strong><small>MLP desafiante · macro-F1</small></div>
            <p>O ScoutNet apenas prioriza a pesquisa. Ele não pode inventar nota V10 nem superar os vetos determinísticos do motor.</p>
          </div>
        )}
      </section>

      <section className={styles.detailPane}>
        {!selected ? <div className={styles.empty}>Selecione uma tese.</div> : selected.calibrated ? <CalibratedDetail thesis={selected.calibrated} /> : <ResearchDetail thesis={selected} />}
      </section>
    </main>
  );
}

function CalibratedDetail({ thesis }: { thesis: CalibratedThesis }) {
  return (
    <div className={styles.detailContent}>
      <header className={styles.detailHeader}><div><span className={styles.kicker}><Target size={13} />{thesis.engine}</span><h2>{thesis.name}</h2></div><span className={styles.status}><FlaskConical size={12} />{thesis.decision}</span></header>
      <section className={styles.hero}>
        <div className={styles.scoreOrb}><div className={`${styles.heroScore} ${scoreTone(thesis.score)}`}><strong>{thesis.score.toFixed(1)}</strong><span>nota V10</span></div></div>
        <div className={styles.heroNarrative}><span className={styles.sectionEyebrow}><Sparkles size={13} /> decisão explicável</span><h3>Por que essa nota?</h3><p>{thesis.summary}</p><div className={styles.next}><Zap size={16} /><div><span>Próximo experimento</span><strong>{thesis.next}</strong></div><ChevronRight size={16} /></div></div>
      </section>

      <section className={styles.card}><h3><Gauge size={17} />Leitura do motor — com explicação</h3><MetricExplain label="Fundamentos" score={thesis.core} text={thesis.coreWhy} /><MetricExplain label="Especialista" score={thesis.expert} text={thesis.expertWhy} /><MetricExplain label="Velocidade de aprendizado" score={thesis.learning} text={thesis.learningWhy} /><MetricExplain label="Força da evidência" score={`${thesis.evidence}/5`} text={thesis.evidenceWhy} /></section>

      <section className={styles.twoCols}>
        <div className={styles.card}><h3><CheckCircle2 size={17} />O que sustenta a tese</h3><ul>{thesis.strengths.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div className={styles.card}><h3><XCircle size={17} />O que pode matar</h3><ul>{thesis.risks.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>

      <section className={styles.card}><h3><BarChart3 size={17} />Por que não está mais alto?</h3><p>{thesis.whyNotHigher}</p></section>
    </div>
  );
}

function ResearchDetail({ thesis }: { thesis: ListRow }) {
  const hasResearch = thesis.researchPriority != null;
  const evidence = thesis.evidencePtbr ?? [];
  return (
    <div className={styles.detailContent}>
      <header className={styles.detailHeader}>
        <div>
          <span className={styles.kicker}><Layers3 size={13} />Análise de tese · {thesis.area}</span>
          <h2>{thesis.name}</h2>
        </div>
        <span className={styles.status}><BrainCircuit size={12} />{hasResearch ? statusLabel(thesis.researchStatus) : "pesquisa pendente"}</span>
      </header>

      <section className={styles.hero}>
        <div className={styles.scoreOrb}>
          <div className={`${styles.heroScore} ${hasResearch ? scoreTone(thesis.researchPriority!) : styles.neutral}`}>
            <strong>{hasResearch ? thesis.researchPriority!.toFixed(1) : "N/A"}</strong>
            <span>{hasResearch ? "prioridade de pesquisa" : "sem avaliação"}</span>
          </div>
        </div>
        <div className={styles.heroNarrative}>
          <span className={styles.sectionEyebrow}><Sparkles size={13} />tese reformulada</span>
          <h3>O que esta empresa está tentando provar?</h3>
          <p className={styles.thesisStatement}>
            {thesis.thesisPtbr || `Hipótese de ${thesis.area} ainda sem pesquisa suficiente para uma reformulação analítica confiável.`}
          </p>
          {hasResearch ? (
            <div className={styles.rankReason}>
              <Trophy size={17} />
              <div>
                <span>Por que está em {thesis.researchRank ? `#${thesis.researchRank}` : "destaque"}</span>
                <strong>{thesis.whyRankedPtbr || thesis.why}</strong>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.memoGrid}>
        <article className={styles.memoCard}>
          <div className={styles.memoIcon}><CircleDollarSign size={17} /></div>
          <span>Quem paga</span>
          <strong>{thesis.buyerPtbr || "Ainda não comprovado."}</strong>
        </article>
        <article className={styles.memoCard}>
          <div className={styles.memoIcon}><Target size={17} /></div>
          <span>Dor econômica</span>
          <strong>{thesis.problemPtbr || "Ainda não há evidência suficiente para descrever a dor econômica com confiança."}</strong>
        </article>
        <article className={styles.memoCard}>
          <div className={styles.memoIcon}><Zap size={17} /></div>
          <span>Como captura valor</span>
          <strong>{thesis.valuePtbr || "O mecanismo de captura de valor ainda precisa ser provado."}</strong>
        </article>
      </section>

      <section className={styles.card}>
        <h3><ShieldCheck size={17} />O que já foi provado</h3>
        {evidence.length ? (
          <ul>{evidence.map((item) => <li key={item}>{item}</li>)}</ul>
        ) : (
          <p>A pesquisa pública foi executada, mas ainda não encontrou prova específica suficiente de cliente, receita, preço ou ROI. Isso é uma lacuna real, não um zero escondido.</p>
        )}
      </section>

      <section className={styles.twoCols}>
        <div className={styles.card}>
          <h3><Trophy size={17} />Por que merece atenção agora</h3>
          <p>{thesis.whyRankedPtbr || thesis.why || "Ainda sem justificativa forte o bastante para priorização."}</p>
        </div>
        <div className={styles.card}>
          <h3><XCircle size={17} />O que derruba a tese</h3>
          <p>{thesis.whatCanKill || "Ainda precisamos definir um teste de falsificação específico."}</p>
        </div>
      </section>

      <section className={styles.card}>
        <h3><Gauge size={17} />Como ler essa posição</h3>
        <div className={styles.factGrid}>
          <div><span>Nota V10</span><strong>{thesis.v10Score != null ? thesis.v10Score.toFixed(1) : "N/A"}</strong></div>
          <div><span>Prioridade de pesquisa</span><strong>{hasResearch ? thesis.researchPriority!.toFixed(1) : "N/A"}</strong></div>
          <div><span>Posição na pesquisa</span><strong>{thesis.researchRank ? `#${thesis.researchRank}` : "N/A"}</strong></div>
          <div><span>Qualidade da evidência</span><strong>{hasResearch ? statusLabel(thesis.researchStatus) : "triagem"}</strong></div>
        </div>
        <p className={styles.scoreExplanation}>
          A prioridade de pesquisa responde “vale aprofundar agora?”. Ela não significa que a tese já recebeu uma nota V10. A nota V10 só aparece quando pagador, economia, alternativas e Truth Layer estiverem preenchidos com evidência suficiente.
        </p>
      </section>

      {thesis.sources?.length ? (
        <section className={styles.card}>
          <h3><Database size={17} />Fontes que sustentam esta leitura</h3>
          <div className={styles.sources}>
            {thesis.sources.map((url, index) => {
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

function MetricExplain({ label, score, text }: { label: string; score: number | string; text: string }) {
  const icon = label === "Fundamentos" ? <Target size={16} /> : label === "Especialista" ? <CircleDollarSign size={16} /> : label === "Velocidade de aprendizado" ? <Gauge size={16} /> : <ShieldCheck size={16} />;
  return <div className={styles.metric}><div className={styles.metricIcon}>{icon}</div><div><strong>{label}</strong><p>{text}</p></div><span>{typeof score === "number" ? score.toFixed(1) : score}</span></div>;
}
