"use client";

import { Activity, ArrowLeft, ArrowRight, BarChart3, BrainCircuit, CheckCircle2, ChevronRight, CircleDollarSign, Database, FlaskConical, Gauge, Layers3, LayoutDashboard, Search, ShieldCheck, SlidersHorizontal, Sparkles, Target, Trophy, XCircle, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import styles from "./ThesisDashboard.module.css";

type ThesisSummaryApi = {
  id: string;
  name: string;
  sector: string;
  source: string;
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
};

type DeepResearchLeaderboard = {
  generated_at: string;
  items: DeepResearchItem[];
};

type CalibratedThesis = {
  id: string;
  name: string;
  sector: string;
  engine: string;
  decision: string;
  score: number;
  core: number;
  expert: number;
  learning: number;
  evidence: number;
  next: string;
  summary: string;
  coreWhy: string;
  expertWhy: string;
  learningWhy: string;
  evidenceWhy: string;
  strengths: string[];
  risks: string[];
  whyNotHigher: string;
};

type ListRow = {
  id: string;
  name: string;
  area: string;
  batch?: string;
  marketTypes?: string[];
  productType?: string;
  macroArea?: string;
  salesMotion?: string;
  capitalIntensity?: string;
  regulatoryIntensity?: string;
  adaptationMode?: string;
  analysisStatus?: string;
  v10Score: number | null;
  researchPriority: number | null;
  researchRank: number | null;
  researchStatus?: DeepResearchItem["research_status"];
  tagline?: string;
  why?: string;
  whatCanKill?: string;
  sources?: string[];
  calibrated?: CalibratedThesis;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const PAGE_SIZE = 30;

const calibrated: CalibratedThesis[] = [
  {
    id: "GYF-01",
    name: "Gyfted",
    sector: "Formação esportiva",
    engine: "Aspiration / Transformation",
    decision: "48h Falsification",
    score: 6.8,
    core: 6.7,
    expert: 6.9,
    learning: 7.4,
    evidence: 2,
    next: "Conseguir compromisso real no ticket: reserva, depósito ou matrícula.",
    summary: "A tese tem um motor de valor legítimo: pais já gastam para desenvolver filhos no futebol, e evolução, vídeo, dados e scouting podem transformar essa aspiração em produto. O problema é que ainda não provamos que a proposta específica da Gyfted recebe dinheiro no ticket necessário.",
    coreWhy: "Pagador e comportamento de gasto existem, mas o excedente valor-preço ainda é hipótese. O core para em 6,7 porque gostar da proposta não basta: precisamos provar pagamento e retenção.",
    expertWhy: "Aspiração, transformação e status têm intensidade alta. A oferta pode tornar evolução mensurável, mas ainda falta provar que essa transformação é percebida como superior a escolinhas, treinadores e alternativas existentes.",
    learningWhy: "É barato aprender: não precisamos construir plataforma completa. Uma landing page, avaliação inicial, turma piloto e cobrança real conseguem testar a tese rapidamente.",
    evidenceWhy: "2/5 porque temos tese + sinais de comportamento do mercado, mas ainda não temos MONEY nem OBSERVED_OUTCOME suficientes da própria Gyfted.",
    strengths: ["Mercado já gasta dinheiro com formação esportiva", "Valor aspiracional forte para pais e atletas", "Piloto pode ser vendido antes de tecnologia completa", "Evolução pode ser transformada em métricas, vídeo e scouting"],
    risks: ["Pais elogiarem a proposta sem pagar", "CAC local destruir unit economics", "Operação presencial limitar escala", "Scouting não ser percebido como diferencial suficiente"],
    whyNotHigher: "Para passar de 7, a tese precisa de compromisso comercial real. Para chegar perto de 8, precisa de pagamento + sinais de retenção/outcome, não apenas interesse.",
  },
  {
    id: "OLY-01",
    name: "Olympia",
    sector: "Legaltech trabalhista",
    engine: "Economic ROI",
    decision: "48h Falsification",
    score: 6.8,
    core: 6.8,
    expert: 6.7,
    learning: 7.0,
    evidence: 3,
    next: "Fechar piloto pago e medir horas economizadas, custo de entrega e outcome.",
    summary: "A Olympia ataca um trabalho recorrente, caro e operacional em escritórios trabalhistas patronais. O comprador é identificável e o ROI pode ser traduzido em horas, velocidade, controle e perda operacional evitada.",
    coreWhy: "Dor, pagador e mecanismo econômico são claros. A nota não sobe porque ticket, frequência de uso e margem real por caso ainda precisam ser provados com clientes pagantes.",
    expertWhy: "O motor Economic ROI é forte: automação substitui trabalho humano mensurável. O risco está em custos de IA, suporte, integrações e revisão jurídica consumirem a economia prometida.",
    learningWhy: "É possível rodar concierge/manual-first e piloto pago antes de automatizar tudo, reduzindo o custo de aprendizagem.",
    evidenceWhy: "3/5 porque já há validação operacional e comportamento do buyer, mas falta uma série consistente de MONEY + outcome observado.",
    strengths: ["Buyer claro", "Dor frequente", "ROI mensurável", "Piloto vendável antes do produto completo"],
    risks: ["Ticket premium não fechar", "IA/suporte comprimirem margem", "Integrações gerarem implantação pesada", "Economia de tempo ser menor que a esperada"],
    whyNotHigher: "O próximo salto de score depende de piloto pago com horas economizadas e margem demonstrada.",
  },
  {
    id: "RHU-01",
    name: "Rhubius",
    sector: "Fintech / PME",
    engine: "Economic ROI",
    decision: "48h Falsification",
    score: 6.1,
    core: 6.1,
    expert: 6.0,
    learning: 6.8,
    evidence: 1,
    next: "Tentar destruir a hipótese com donos/CFOs antes de qualquer build.",
    summary: "Existe uma hipótese econômica plausível em decisões financeiras de PMEs, mas hoje a tese é muito mais hipótese do que evidência.",
    coreWhy: "O problema pode ter impacto em caixa e decisão, porém payer clarity, frequência e WTP ainda estão insuficientemente provados.",
    expertWhy: "Se a recomendação realmente alterar decisões financeiras, o ROI pode ser alto. O risco é confiança, dados ruins e substituição por contador, ERP ou banco.",
    learningWhy: "É possível testar com donos/CFOs e dados históricos antes de construir integrações pesadas.",
    evidenceWhy: "1/5: praticamente tudo ainda está no nível de hipótese.",
    strengths: ["Consequência econômica real", "Buyer acessível para entrevistas", "Pode ser testada sem build completo"],
    risks: ["Baixa confiança em recomendação automática", "Dados fragmentados", "WTP baixo", "Integrações caras"],
    whyNotHigher: "Precisa primeiro provar uma dor frequente e um comportamento de pagamento. Sem isso, não merece tempo relevante de build.",
  },
  {
    id: "COR-01",
    name: "Cori Insight",
    sector: "Healthtech",
    engine: "Economic ROI",
    decision: "Kill / Reformulate",
    score: 3.0,
    core: 3.2,
    expert: 2.8,
    learning: 4.0,
    evidence: 4,
    next: "Não investir mais sem uma nova economia de valor e um pagador claro.",
    summary: "É o caso negativo de calibração: produto tecnicamente sofisticado não compensou buyer alignment, budget e value-price surplus fracos.",
    coreWhy: "O pagador institucional não demonstrou urgência e orçamento suficientes para justificar a solução no formato original.",
    expertWhy: "Mesmo que o produto melhore decisão clínica, o mecanismo de captura econômica não ficou forte para quem assina o contrato.",
    learningWhy: "Há bastante aprendizado acumulado, mas a próxima descoberta útil exige reformular pagador/wedge, não otimizar mais o produto atual.",
    evidenceWhy: "4/5 porque existe muita evidência acumulada — inclusive evidência negativa. Evidência forte não significa tese boa.",
    strengths: ["Produto tecnicamente profundo", "Conhecimento de domínio acumulado", "Capacidade de execução técnica"],
    risks: ["Buyer sem budget", "ROI difícil de capturar", "Procurement institucional", "Tecnologia virar solução à procura de comprador"],
    whyNotHigher: "Não falta pesquisa: falta uma nova tese econômica. Mais features não resolvem o problema central.",
  },
];

function scoreTone(score: number) {
  if (score >= 8) return styles.good;
  if (score >= 7) return styles.warn;
  if (score >= 5.5) return styles.watch;
  return styles.bad;
}

function statusLabel(status?: string) {
  if (status === "DEEP_RESEARCHED") return "evidence-rich";
  if (status === "DEEP_RESEARCH_PARTIAL") return "research parcial";
  if (status === "RESEARCH_INCOMPLETE") return "research incompleto";
  return "sparse";
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
      .filter((item) => !q || `${item.name} ${item.tagline} ${item.categories.join(" ")}`.toLowerCase().includes(q))
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
          <div><strong>Startup Checker</strong><span>Thesis Engine V10</span></div>
        </div>
        <nav className={styles.nav}>
          <button className={styles.navActive}><LayoutDashboard size={16} /><span>Teses</span></button>
          <button><FlaskConical size={16} /><span>Experimentos</span></button>
          <button><Activity size={16} /><span>Outcomes</span></button>
        </nav>
        <div className={styles.stats}>
          <div><Database size={14} /><span>Universo</span><strong>{allRows.length || 543}</strong></div>
          <div><BrainCircuit size={14} /><span>Deep research</span><strong>{research.length}</strong></div>
          <div><ShieldCheck size={14} /><span>Evidence-rich</span><strong>{evidenceRich}</strong></div>
          <div><Layers3 size={14} /><span>Parcial</span><strong>{partial}</strong></div>
        </div>
        <div className={styles.sidebarNote}>Sparse ≠ nota zero. Sem avaliação, o sistema mostra N/A.</div>
      </aside>

      <section className={styles.listPane}>
        <header className={styles.listHeader}>
          <div><span className={styles.kicker}><Sparkles size={13} /> Intelligence Workspace</span><h1>Teses</h1><p>Mate cedo. Aprofunde só onde há sinal.</p></div>
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
                    <small>{row.v10Score != null ? "V10" : row.researchPriority != null ? "research" : "sparse"}</small>
                  </div>
                  <div className={styles.rowCopy}>
                    <div><strong>{row.name}</strong>{row.researchRank ? <span>#{row.researchRank}</span> : null}</div>
                    <p>{row.tagline || row.area}</p>
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
            <span><BrainCircuit size={13} /> ScoutNet · advisory only</span>
            <h2>Treino atual</h2>
            <div><strong>363</strong><small>teses no treino</small></div>
            <div><strong>0.7664</strong><small>LinearSVC macro-F1</small></div>
            <div><strong>0.8154</strong><small>accuracy</small></div>
            <div><strong>0.7334</strong><small>MLP challenger macro-F1</small></div>
            <p>O ScoutNet ordena research. Ele não pode inventar V10 score nem superar vetos Rust.</p>
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
        <div className={styles.scoreOrb}><div className={`${styles.heroScore} ${scoreTone(thesis.score)}`}><strong>{thesis.score.toFixed(1)}</strong><span>score V10</span></div></div>
        <div className={styles.heroNarrative}><span className={styles.sectionEyebrow}><Sparkles size={13} /> decisão explicável</span><h3>Por que essa nota?</h3><p>{thesis.summary}</p><div className={styles.next}><Zap size={16} /><div><span>Próximo experimento</span><strong>{thesis.next}</strong></div><ChevronRight size={16} /></div></div>
      </section>

      <section className={styles.card}><h3><Gauge size={17} />Leitura do motor — com explicação</h3><MetricExplain label="Core" score={thesis.core} text={thesis.coreWhy} /><MetricExplain label="Expert" score={thesis.expert} text={thesis.expertWhy} /><MetricExplain label="Learning velocity" score={thesis.learning} text={thesis.learningWhy} /><MetricExplain label="Força da evidência" score={`${thesis.evidence}/5`} text={thesis.evidenceWhy} /></section>

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
  return (
    <div className={styles.detailContent}>
      <header className={styles.detailHeader}><div><span className={styles.kicker}><Layers3 size={13} />{thesis.area}</span><h2>{thesis.name}</h2></div><span className={styles.status}><BrainCircuit size={12} />{hasResearch ? statusLabel(thesis.researchStatus) : "research pending"}</span></header>
      <section className={styles.hero}>
        <div className={styles.scoreOrb}><div className={`${styles.heroScore} ${hasResearch ? scoreTone(thesis.researchPriority!) : styles.neutral}`}><strong>{hasResearch ? thesis.researchPriority!.toFixed(1) : "N/A"}</strong><span>{hasResearch ? "research priority" : "sem avaliação"}</span></div></div>
        <div className={styles.heroNarrative}><span className={styles.sectionEyebrow}><BrainCircuit size={13} /> research intelligence</span><h3>{hasResearch ? "Por que está no ranking?" : "Ainda não foi avaliada"}</h3><p>{thesis.why || "Esta tese está no universo, mas ainda não tem Deep Research suficiente. N/A é intencional: ausência de evidência não é nota zero."}</p>{thesis.tagline ? <div className={styles.quote}>{thesis.tagline}</div> : null}</div>
      </section>

      <section className={styles.card}><h3><ShieldCheck size={17} />Estado da evidência</h3><div className={styles.factGrid}><div><span>V10 Thesis Score</span><strong>{thesis.v10Score != null ? thesis.v10Score.toFixed(1) : "N/A"}</strong></div><div><span>Research priority</span><strong>{hasResearch ? thesis.researchPriority!.toFixed(1) : "N/A"}</strong></div><div><span>Rank research</span><strong>{thesis.researchRank ? `#${thesis.researchRank}` : "N/A"}</strong></div><div><span>Status</span><strong>{hasResearch ? statusLabel(thesis.researchStatus) : "sparse"}</strong></div></div></section>

      {thesis.whatCanKill ? <section className={styles.card}><h3><XCircle size={17} />O que pode matar</h3><p>{thesis.whatCanKill}</p></section> : null}
      {thesis.sources?.length ? <section className={styles.card}><h3><Database size={17} />Fontes usadas no Pass 1</h3><div className={styles.sources}>{thesis.sources.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer">{url}</a>)}</div></section> : null}
      <section className={styles.warning}>Research Priority não é Thesis Score V10. Só vira V10 quando os critérios e o Truth Layer tiverem evidência suficiente.</section>
    </div>
  );
}

function MetricExplain({ label, score, text }: { label: string; score: number | string; text: string }) {
  const icon = label === "Core" ? <Target size={16} /> : label === "Expert" ? <CircleDollarSign size={16} /> : label === "Learning velocity" ? <Gauge size={16} /> : <ShieldCheck size={16} />;
  return <div className={styles.metric}><div className={styles.metricIcon}>{icon}</div><div><strong>{label}</strong><p>{text}</p></div><span>{typeof score === "number" ? score.toFixed(1) : score}</span></div>;
}
