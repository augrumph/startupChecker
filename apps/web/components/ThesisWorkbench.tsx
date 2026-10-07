"use client";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  CircleDollarSign,
  FilePlus2,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  Search,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

type EngineKey =
  | "ECONOMIC_ROI"
  | "ASPIRATION_TRANSFORMATION"
  | "RISK_MANDATORY"
  | "TRANSACTION_ASSET"
  | "NETWORK_MARKETPLACE"
  | "CONVENIENCE_EXPERIENCE";

type Evidence =
  | "HYPOTHESIS"
  | "DESK_RESEARCH"
  | "CUSTOMER_BEHAVIOR"
  | "COMMERCIAL_COMMITMENT"
  | "MONEY"
  | "OBSERVED_OUTCOME";

type CriterionDef = [string, string, number, number | null];

type EngineMeta = {
  key: EngineKey;
  label: string;
  description: string;
};

type EngineConfig = {
  engine_version: string;
  criteria: {
    universal: CriterionDef[];
    learning: CriterionDef[];
    potential: CriterionDef[];
  };
  experts: Record<EngineKey, CriterionDef[]>;
  router: EngineMeta[];
};

type SignalDraft = {
  score: number;
  evidence: Evidence;
  quality: number;
  contradictions: number;
};

type CriterionResult = {
  key: string;
  label: string;
  score: number;
  confidence: number;
  threshold: number | null;
  veto_failed: boolean;
};

type ScoreCard = {
  raw_score: number;
  evidence_coverage: number;
  conservative_score: number;
  criteria: CriterionResult[];
};

type ExpertEvaluation = {
  engine: EngineKey;
  route_affinity: number;
  route_confidence: number;
  scorecard: ScoreCard;
};

type Evaluation = {
  engine_version: string;
  thesis_id: string;
  thesis_name: string;
  selected_experts: EngineKey[];
  primary_expert: EngineKey;
  universal: ScoreCard;
  experts: ExpertEvaluation[];
  learning: ScoreCard;
  potential_score: number | null;
  structural_strength: number;
  conservative_strength: number;
  evidence_coverage: number;
  investigation_priority: number;
  decision_confidence: number;
  sensitivity_risk: number;
  expert_disagreement: number;
  decision_margin: number;
  review_required: boolean;
  fatal_vetoes: CriterionResult[];
  entry_flags: CriterionResult[];
  decision:
    | "KILL_REFORMULATE"
    | "THESIS_GOOD_ENTRY_BAD"
    | "FALSIFY_48H"
    | "VALIDATE_DEMAND_7D"
    | "PAID_TEST_30D"
    | "DELIVER_MEASURE_VALUE"
    | "SCALE_EXPAND";
  critical_issue: string;
  next_experiment: {
    criterion_key: string;
    criterion_label: string;
    reason: string;
    method: string;
    success_signal: string;
    failure_signal: string;
    horizon_hours: number;
    information_priority: number;
  };
};

type AiIntake = {
  model: string;
  advisoryOnly: boolean;
  normalized: {
    name: string;
    sector: string;
    payer: string;
    user: string;
    problem: string;
    solution: string;
    businessModels: string[];
  };
  engineSuggestions: Array<{
    engine: EngineKey;
    affinity: number;
    rationale: string;
  }>;
  assumptions: Array<{
    statement: string;
    whyItMatters: string;
    evidenceNeeded: string;
  }>;
  unknowns: string[];
  firstQuestions: string[];
};

type AiRedTeam = {
  model: string;
  advisoryOnly: boolean;
  attacks: Array<{
    assumption: string;
    failureMode: string;
    whyItCouldBeWrong: string;
    cheapestFalsification: string;
    severity: number;
  }>;
  blindSpots: string[];
  strongestCounterCase: string;
};

type AiEvidence = {
  model: string;
  advisoryOnly: boolean;
  findings: Array<{
    criterionKey: string;
    direction: "SUPPORTS" | "CONTRADICTS" | "NEUTRAL";
    evidenceLevel: Evidence;
    strength: number;
    rationale: string;
    sourceFragment: string;
  }>;
  unresolved: string[];
  warnings: string[];
};

type Thesis = {
  id: string;
  name: string;
  sector: string;
  engine: string;
  decision: string;
  core: number;
  expert: number;
  learning: number;
  evidence: number;
  next: string;
  evaluation?: Evaluation;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const STORAGE_KEY = "startup-checker-v4-theses";

const seeded: Thesis[] = [
  {
    id: "GYF-01",
    name: "Gyfted",
    sector: "Formação esportiva",
    engine: "Aspiration / Transformation",
    decision: "7-day WTP / Demand Test",
    core: 87,
    expert: 88.5,
    learning: 91,
    evidence: 2,
    next: "Conseguir compromissos reais no ticket: reserva, depósito ou matrícula.",
  },
  {
    id: "OLY-01",
    name: "Olympia",
    sector: "Legaltech trabalhista",
    engine: "Economic ROI",
    decision: "30-day Paid Test",
    core: 88.5,
    expert: 86.5,
    learning: 84,
    evidence: 3,
    next: "Fechar piloto pago e medir horas economizadas, custo de entrega e outcome.",
  },
  {
    id: "RHU-01",
    name: "Rhubius",
    sector: "Fintech / PME",
    engine: "Economic ROI",
    decision: "48h Falsification",
    core: 81.5,
    expert: 81,
    learning: 83,
    evidence: 1,
    next: "Tentar destruir a hipótese com donos/CFOs antes de qualquer build.",
  },
  {
    id: "COR-01",
    name: "Cori Insight",
    sector: "Healthtech",
    engine: "Economic ROI",
    decision: "Kill / Reformulate",
    core: 46.5,
    expert: 40,
    learning: 53,
    evidence: 4,
    next: "Não investir mais sem uma nova economia de valor e um pagador claro.",
  },
];

const evidenceOptions: { value: Evidence; label: string; hint: string }[] = [
  { value: "HYPOTHESIS", label: "Hipótese", hint: "opinião / tese" },
  { value: "DESK_RESEARCH", label: "Pesquisa", hint: "desk research / especialista" },
  { value: "CUSTOMER_BEHAVIOR", label: "Comportamento", hint: "cliente confirma o que já faz" },
  { value: "COMMERCIAL_COMMITMENT", label: "Compromisso", hint: "preço / proposta / LOI" },
  { value: "MONEY", label: "Dinheiro", hint: "depósito / venda / piloto pago" },
  { value: "OBSERVED_OUTCOME", label: "Outcome", hint: "valor observado após entrega" },
];

const blankSignal = (): SignalDraft => ({
  score: 5,
  evidence: "HYPOTHESIS",
  quality: 1,
  contradictions: 0,
});

function makeSignals(defs: CriterionDef[], score = 5) {
  return Object.fromEntries(
    defs.map(([key]) => [
      key,
      { ...blankSignal(), score },
    ]),
  ) as Record<string, SignalDraft>;
}

function formatEngine(engine: string) {
  return engine
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase())
    .replace("Roi", "ROI");
}

function formatDecision(decision: string) {
  const map: Record<string, string> = {
    KILL_REFORMULATE: "Kill / Reformulate",
    THESIS_GOOD_ENTRY_BAD: "Tese boa, entrada ruim",
    FALSIFY_48H: "48h Falsification",
    VALIDATE_DEMAND_7D: "7-day WTP / Demand Test",
    PAID_TEST_30D: "30-day Paid Test",
    DELIVER_MEASURE_VALUE: "Deliver / Measure Value",
    SCALE_EXPAND: "Scale / Expand",
  };
  return map[decision] ?? decision;
}

function scoreTone(score: number) {
  if (score >= 80) return "score score-good";
  if (score >= 65) return "score score-warn";
  return "score score-bad";
}

function decisionTone(decision: string) {
  if (decision.toLowerCase().includes("kill")) return "pill pill-bad";
  if (
    decision.toLowerCase().includes("paid") ||
    decision.toLowerCase().includes("deliver") ||
    decision.toLowerCase().includes("scale")
  ) {
    return "pill pill-good";
  }
  return "pill pill-warn";
}

function selectEngines(router: Record<string, SignalDraft>): EngineKey[] {
  const sorted = Object.entries(router)
    .map(([engine, signal]) => [engine as EngineKey, signal.score] as const)
    .sort((a, b) => b[1] - a[1]);

  if (!sorted.length || sorted[0][1] < 6) return [];
  const top = sorted[0][1];

  return sorted
    .filter(([, score]) => score >= 6 && score >= top - 2)
    .slice(0, 3)
    .map(([engine]) => engine);
}

function CriterionControl({
  label,
  weight,
  veto,
  value,
  onChange,
  description,
}: {
  label: string;
  weight?: number;
  veto?: number | null;
  value: SignalDraft;
  onChange: (next: SignalDraft) => void;
  description?: string;
}) {
  return (
    <div className="criterion">
      <div className="criterion-top">
        <div className="criterion-copy">
          <strong>{label}</strong>
          {description ? <p>{description}</p> : null}
          <small>
            {weight ? `peso ${weight}%` : "afinidade"}
            {veto != null ? ` · veto abaixo de ${veto}` : ""}
          </small>
        </div>
        <div className="criterion-score">{value.score}</div>
      </div>

      <input
        className="score-slider"
        type="range"
        min="0"
        max="10"
        step="1"
        value={value.score}
        onChange={(e) => onChange({ ...value, score: Number(e.target.value) })}
      />

      <div className="criterion-meta">
        <label>
          <span>Evidência</span>
          <select
            value={value.evidence}
            onChange={(e) =>
              onChange({ ...value, evidence: e.target.value as Evidence })
            }
          >
            {evidenceOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Contradições</span>
          <select
            value={value.contradictions}
            onChange={(e) =>
              onChange({ ...value, contradictions: Number(e.target.value) })
            }
          >
            {[0, 1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function Metric({
  icon,
  title,
  subtitle,
  value,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  value: number;
}) {
  return (
    <div className="metric-row">
      <div className="metric-icon">{icon}</div>
      <div className="metric-copy">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      <div className={scoreTone(value)}>{value.toFixed(1)}</div>
    </div>
  );
}

export function ThesisWorkbench() {
  const [theses, setTheses] = useState<Thesis[]>(seeded);
  const [selected, setSelected] = useState(seeded[0].id);
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);

  const [config, setConfig] = useState<EngineConfig | null>(null);
  const [configError, setConfigError] = useState("");
  const [wizardStep, setWizardStep] = useState(0);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState("");
  const [lastEvaluation, setLastEvaluation] = useState<Evaluation | null>(null);

  const [aiIntakeText, setAiIntakeText] = useState("");
  const [aiIntake, setAiIntake] = useState<AiIntake | null>(null);
  const [aiRedTeam, setAiRedTeam] = useState<AiRedTeam | null>(null);
  const [aiEvidence, setAiEvidence] = useState<AiEvidence | null>(null);
  const [evidenceText, setEvidenceText] = useState("");
  const [aiBusy, setAiBusy] = useState<"intake" | "redteam" | "evidence" | null>(null);
  const [aiError, setAiError] = useState("");

  const [context, setContext] = useState({
    name: "",
    sector: "",
    model: "B2C",
    payer: "",
    user: "",
    problem: "",
    solution: "",
  });

  const [routerSignals, setRouterSignals] = useState<Record<string, SignalDraft>>({});
  const [universalSignals, setUniversalSignals] = useState<Record<string, SignalDraft>>({});
  const [expertSignals, setExpertSignals] = useState<Record<string, Record<string, SignalDraft>>>({});
  const [learningSignals, setLearningSignals] = useState<Record<string, SignalDraft>>({});
  const [potentialSignals, setPotentialSignals] = useState<Record<string, SignalDraft>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Thesis[];
        if (Array.isArray(parsed) && parsed.length) {
          setTheses([...seeded, ...parsed]);
        }
      }
    } catch {
      // GO HORSE: storage corrupto não bloqueia o produto.
    }
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/v1/config`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`API ${response.status}`);
        return (await response.json()) as EngineConfig;
      })
      .then((nextConfig) => {
        setConfig(nextConfig);
        setConfigError("");
        setRouterSignals(
          Object.fromEntries(
            nextConfig.router.map((engine) => [
              engine.key,
              { ...blankSignal(), score: 0 },
            ]),
          ),
        );
        setUniversalSignals(makeSignals(nextConfig.criteria.universal));
        setLearningSignals(makeSignals(nextConfig.criteria.learning));
        setPotentialSignals(makeSignals(nextConfig.criteria.potential));
      })
      .catch((error) => {
        setConfigError(
          `Não consegui carregar o motor em ${API_URL}. ${String(error)}`,
        );
      });
  }, []);

  const selectedEngines = useMemo(
    () => selectEngines(routerSignals),
    [routerSignals],
  );

  useEffect(() => {
    if (!config) return;

    setExpertSignals((previous) => {
      const next = { ...previous };
      for (const engine of selectedEngines) {
        if (!next[engine]) {
          next[engine] = makeSignals(config.experts[engine] ?? []);
        }
      }
      return next;
    });
  }, [config, selectedEngines.join("|")]);

  const visibleTheses = useMemo(
    () =>
      theses.filter((item) =>
        [item.name, item.sector, item.engine, item.decision]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, theses],
  );

  const thesis = theses.find((item) => item.id === selected) ?? theses[0];

  function resetWizard() {
    setWizardStep(0);
    setEvaluationError("");
    setLastEvaluation(null);
    setAiIntakeText("");
    setAiIntake(null);
    setAiRedTeam(null);
    setAiEvidence(null);
    setEvidenceText("");
    setAiError("");
    setAiBusy(null);
    setContext({
      name: "",
      sector: "",
      model: "B2C",
      payer: "",
      user: "",
      problem: "",
      solution: "",
    });

    if (config) {
      setRouterSignals(
        Object.fromEntries(
          config.router.map((engine) => [
            engine.key,
            { ...blankSignal(), score: 0 },
          ]),
        ),
      );
      setUniversalSignals(makeSignals(config.criteria.universal));
      setLearningSignals(makeSignals(config.criteria.learning));
      setPotentialSignals(makeSignals(config.criteria.potential));
      setExpertSignals({});
    }
  }

  function openWizard() {
    resetWizard();
    setShowNew(true);
  }

  function updateGroup(
    setter: Dispatch<SetStateAction<Record<string, SignalDraft>>>,
    key: string,
    next: SignalDraft,
  ) {
    setter((prev) => ({ ...prev, [key]: next }));
  }

  function updateExpert(engine: EngineKey, key: string, next: SignalDraft) {
    setExpertSignals((prev) => ({
      ...prev,
      [engine]: {
        ...(prev[engine] ?? {}),
        [key]: next,
      },
    }));
  }

  function canAdvanceContext() {
    return (
      context.name.trim() &&
      context.sector.trim() &&
      context.payer.trim() &&
      context.user.trim() &&
      context.problem.trim() &&
      context.solution.trim()
    );
  }

  function persistUserTheses(next: Thesis[]) {
    const custom = next.filter(
      (item) => !seeded.some((seed) => seed.id === item.id),
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
  }

  async function evaluateThesis() {
    if (!config || selectedEngines.length === 0) {
      setEvaluationError(
        "Nenhum mecanismo de valor ficou forte o bastante para rotear a tese. Dê pelo menos 6/10 ao mecanismo que realmente explica por que alguém pagaria.",
      );
      return;
    }

    setEvaluating(true);
    setEvaluationError("");

    const id = `TH-${Date.now()}`;
    const experts = Object.fromEntries(
      selectedEngines.map((engine) => [
        engine,
        expertSignals[engine] ?? makeSignals(config.experts[engine]),
      ]),
    );

    const payload = {
      id,
      name: context.name.trim(),
      context: {
        sector: context.sector.trim(),
        business_models: context.model ? [context.model] : [],
        payer: context.payer.trim(),
        user: context.user.trim(),
        problem: context.problem.trim(),
        solution: context.solution.trim(),
      },
      router: routerSignals,
      engine_override: [],
      universal: universalSignals,
      experts,
      learning: learningSignals,
      potential: potentialSignals,
    };

    try {
      const response = await fetch(`${API_URL}/v1/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? `API ${response.status}`);
      }

      const result = data as Evaluation;
      setLastEvaluation(result);

      const primary =
        result.experts.find((expert) => expert.engine === result.primary_expert) ??
        result.experts[0];

      const summary: Thesis = {
        id,
        name: context.name.trim(),
        sector: context.sector.trim(),
        engine: formatEngine(result.primary_expert),
        decision: formatDecision(result.decision),
        core: result.universal.raw_score,
        expert: primary?.scorecard.raw_score ?? result.structural_strength,
        learning: result.learning.raw_score,
        evidence: Math.max(0, Math.min(5, Math.round(result.evidence_coverage * 5))),
        next: result.next_experiment.method,
        evaluation: result,
      };

      setTheses((prev) => {
        const next = [...prev, summary];
        persistUserTheses(next);
        return next;
      });
      setSelected(id);
      setWizardStep(4);
    } catch (error) {
      setEvaluationError(String(error));
    } finally {
      setEvaluating(false);
    }
  }

  async function runAiIntake() {
    const text = aiIntakeText.trim();
    if (text.length < 20) {
      setAiError("Cole uma descrição minimamente completa da tese.");
      return;
    }

    setAiBusy("intake");
    setAiError("");

    try {
      const response = await fetch("/api/ai/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `AI ${response.status}`);

      const result = data as AiIntake;
      setAiIntake(result);
      setContext((prev) => ({
        ...prev,
        name: result.normalized.name || prev.name,
        sector: result.normalized.sector || prev.sector,
        payer: result.normalized.payer || prev.payer,
        user: result.normalized.user || prev.user,
        problem: result.normalized.problem || prev.problem,
        solution: result.normalized.solution || prev.solution,
        model: result.normalized.businessModels[0] || prev.model,
      }));

      // LLM may classify the mechanism of value, but these affinities remain
      // HYPOTHESIS-level router hints. It never assigns core/expert scores.
      setRouterSignals((prev) => {
        const next = { ...prev };
        for (const suggestion of result.engineSuggestions) {
          next[suggestion.engine] = {
            ...(next[suggestion.engine] ?? blankSignal()),
            score: Math.round(suggestion.affinity),
            evidence: "HYPOTHESIS",
          };
        }
        return next;
      });
    } catch (error) {
      setAiError(String(error));
    } finally {
      setAiBusy(null);
    }
  }

  function evidenceCriteria(evaluation: Evaluation) {
    return [
      ...evaluation.universal.criteria.map((criterion) => ({
        key: criterion.key,
        label: criterion.label,
        scope: "universal",
      })),
      ...evaluation.experts.flatMap((expert) =>
        expert.scorecard.criteria.map((criterion) => ({
          key: criterion.key,
          label: criterion.label,
          scope: `expert:${expert.engine}`,
        })),
      ),
      ...evaluation.learning.criteria.map((criterion) => ({
        key: criterion.key,
        label: criterion.label,
        scope: "learning",
      })),
    ];
  }

  async function runAiRedTeam() {
    if (!lastEvaluation) return;
    setAiBusy("redteam");
    setAiError("");

    try {
      const response = await fetch("/api/ai/red-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thesis: context,
          evaluation: lastEvaluation,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `AI ${response.status}`);
      setAiRedTeam(data as AiRedTeam);
    } catch (error) {
      setAiError(String(error));
    } finally {
      setAiBusy(null);
    }
  }

  async function runAiEvidence() {
    if (!lastEvaluation || evidenceText.trim().length < 20) {
      setAiError("Cole uma entrevista, nota de cliente ou evidência mais completa.");
      return;
    }

    setAiBusy("evidence");
    setAiError("");

    try {
      const response = await fetch("/api/ai/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: evidenceText,
          criteria: evidenceCriteria(lastEvaluation),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `AI ${response.status}`);
      setAiEvidence(data as AiEvidence);
    } catch (error) {
      setAiError(String(error));
    } finally {
      setAiBusy(null);
    }
  }

  const currentHeroScore = thesis.evaluation
    ? thesis.evaluation.structural_strength
    : (thesis.core + thesis.expert) / 2;

  const currentConservative = thesis.evaluation?.conservative_strength;
  const currentPriority = thesis.evaluation?.investigation_priority;

  return (
    <main className="app-shell">
      <aside className="sidebar glass">
        <div className="brand">
          <div className="brand-mark">
            <BrainCircuit size={18} strokeWidth={2.2} />
          </div>
          <div>
            <strong>Startup Checker</strong>
            <span>Thesis Engine V5</span>
          </div>
        </div>

        <nav className="nav">
          <button className="nav-item nav-active">
            <LayoutDashboard size={17} />
            Teses
          </button>
          <button className="nav-item">
            <FlaskConical size={17} />
            Experimentos
          </button>
          <button className="nav-item">
            <Activity size={17} />
            Outcomes
          </button>
        </nav>

        <div className="smart-blocks">
          <div className="smart smart-blue">
            <span>Investigar</span>
            <strong>
              {
                theses.filter(
                  (item) =>
                    !item.decision.toLowerCase().includes("kill") &&
                    !item.decision.toLowerCase().includes("scale"),
                ).length
              }
            </strong>
          </div>
          <div className="smart smart-red">
            <span>Kill</span>
            <strong>
              {
                theses.filter((item) =>
                  item.decision.toLowerCase().includes("kill"),
                ).length
              }
            </strong>
          </div>
          <div className="smart smart-green">
            <span>Paid+</span>
            <strong>
              {
                theses.filter(
                  (item) =>
                    item.decision.toLowerCase().includes("paid") ||
                    item.decision.toLowerCase().includes("deliver") ||
                    item.decision.toLowerCase().includes("scale"),
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="sidebar-spacer" />

        <button className="nav-item">
          <Settings2 size={17} />
          Motor & pesos
        </button>
      </aside>

      <section className="list-column">
        <header className="list-header">
          <div>
            <h1>Teses</h1>
            <p>Mate cedo. Aprofunde só onde há sinal.</p>
          </div>
          <button className="circle-button" onClick={openWizard} aria-label="Nova tese">
            <FilePlus2 size={18} />
          </button>
        </header>

        <label className="search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar"
          />
        </label>

        <div className="thesis-list">
          {visibleTheses.map((item) => (
            <button
              key={item.id}
              className={
                item.id === thesis.id
                  ? "thesis-row thesis-selected"
                  : "thesis-row"
              }
              onClick={() => setSelected(item.id)}
            >
              <div className="mini-ring">
                <span>{Math.round(item.evaluation?.structural_strength ?? (item.core + item.expert) / 2)}</span>
              </div>
              <div className="row-copy">
                <div className="row-title">
                  <strong>{item.name}</strong>
                  <span>{item.evidence}/5</span>
                </div>
                <p>{item.sector}</p>
                <small>{item.decision}</small>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="detail">
        <header className="detail-bar">
          <div>
            <span className="eyebrow">{thesis.engine}</span>
            <h2>{thesis.name}</h2>
          </div>
          <button className="primary-button" onClick={openWizard}>
            Nova avaliação
          </button>
        </header>

        <div className="content">
          <section className="hero-card">
            <div className="hero-score">
              <div className="big-ring">
                <div>
                  <strong>{Math.round(currentHeroScore)}</strong>
                  <span>estrutura</span>
                </div>
              </div>
            </div>

            <div className="hero-copy">
              <span className={decisionTone(thesis.decision)}>{thesis.decision}</span>
              <h3>{thesis.evaluation?.critical_issue ?? "Vale founder time?"}</h3>
              <p>
                {thesis.evaluation
                  ? `A V5 encontrou ${thesis.evaluation.fatal_vetoes.length} veto(s) fatal(is) e ${thesis.evaluation.entry_flags.length} flag(s) de entrada. O score potencial não participa do resgate da tese.`
                  : "Referência de calibração. Crie uma nova tese para rodar o motor real ponta a ponta."}
              </p>

              <div className="next-action">
                <Sparkles size={18} />
                <div>
                  <span>Próximo experimento</span>
                  <strong>{thesis.next}</strong>
                </div>
                <ArrowRight size={18} />
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-title">
              <div>
                <h3>Leitura do motor</h3>
                <p>Estrutura, expert, velocidade, evidência e prioridade de investigação.</p>
              </div>
            </div>

            <div className="metric-list">
              <Metric
                icon={<Target size={18} />}
                title="Core"
                subtitle="Fundamentos universais do valor e do pagador."
                value={thesis.core}
              />
              <Metric
                icon={<CircleDollarSign size={18} />}
                title="Expert"
                subtitle={`Critérios específicos de ${thesis.engine}.`}
                value={thesis.expert}
              />
              <Metric
                icon={<Gauge size={18} />}
                title="Learning velocity"
                subtitle="Quanto rápido e barato conseguimos descobrir a verdade."
                value={thesis.learning}
              />
              {currentConservative != null ? (
                <Metric
                  icon={<TrendingUp size={18} />}
                  title="Força conservadora"
                  subtitle="Estrutura retraída pela qualidade da evidência."
                  value={currentConservative}
                />
              ) : null}
              {currentPriority != null ? (
                <Metric
                  icon={<FlaskConical size={18} />}
                  title="Investigation priority"
                  subtitle="Estrutura forte + incerteza relevante + aprendizado rápido."
                  value={currentPriority}
                />
              ) : null}
              {thesis.evaluation ? (
                <Metric
                  icon={<BrainCircuit size={18} />}
                  title="Confiança da decisão"
                  subtitle="Evidência + distância dos vetos + concordância entre experts."
                  value={thesis.evaluation.decision_confidence}
                />
              ) : null}
              {thesis.evaluation ? (
                <Metric
                  icon={<Gauge size={18} />}
                  title="Estabilidade da decisão"
                  subtitle="100 menos o risco de pequenas mudanças alterarem a conclusão."
                  value={100 - thesis.evaluation.sensitivity_risk}
                />
              ) : null}

              <div className="metric-row">
                <div className="metric-icon"><TrendingUp size={18} /></div>
                <div className="metric-copy">
                  <strong>Força da evidência</strong>
                  <span>Hipótese → comportamento → dinheiro → outcome observado.</span>
                </div>
                <div className="evidence-dots" aria-label={`Evidência ${thesis.evidence} de 5`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <i key={n} className={n <= thesis.evidence ? "dot dot-on" : "dot"} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {thesis.evaluation ? (
            <section className="section evaluation-details">
              <div className="section-title">
                <div>
                  <h3>Experts selecionados</h3>
                  <p>Uma tese pode ser híbrida. O motor usa até três experts próximos do vencedor.</p>
                </div>
              </div>
              <div className="expert-summary-list">
                {thesis.evaluation.experts.map((expert) => (
                  <div className="expert-summary" key={expert.engine}>
                    <div>
                      <strong>{formatEngine(expert.engine)}</strong>
                      <span>afinidade {expert.route_affinity.toFixed(1)}/10</span>
                    </div>
                    <div className={scoreTone(expert.scorecard.raw_score)}>
                      {expert.scorecard.raw_score.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>

              {thesis.evaluation.fatal_vetoes.length ? (
                <div className="veto-box">
                  <strong>Vetos fatais</strong>
                  {thesis.evaluation.fatal_vetoes.map((veto) => (
                    <span key={`${veto.key}-${veto.label}`}>
                      {veto.label}: {veto.score.toFixed(1)} / mínimo {veto.threshold}
                    </span>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      </section>

      {showNew && (
        <div className="sheet-backdrop" onMouseDown={() => setShowNew(false)}>
          <div className="sheet wizard-sheet" onMouseDown={(e) => e.stopPropagation()}>
            <div className="sheet-bar">
              <button
                className="text-button"
                onClick={() => {
                  if (wizardStep > 0 && wizardStep < 4) {
                    setWizardStep((step) => step - 1);
                  } else {
                    setShowNew(false);
                  }
                }}
              >
                {wizardStep > 0 && wizardStep < 4 ? (
                  <><ArrowLeft size={15} /> Voltar</>
                ) : (
                  "Cancelar"
                )}
              </button>

              <div className="sheet-title">
                <strong>Nova tese</strong>
                <span>{Math.min(wizardStep + 1, 5)} de 5</span>
              </div>

              <button className="icon-close" onClick={() => setShowNew(false)} aria-label="Fechar">
                <X size={17} />
              </button>
            </div>

            {!config && !configError ? (
              <div className="wizard-state">Carregando Thesis Engine V5…</div>
            ) : null}

            {configError ? (
              <div className="wizard-error">
                <strong>Motor indisponível</strong>
                <span>{configError}</span>
              </div>
            ) : null}

            {config && wizardStep === 0 ? (
              <div className="wizard-body">
                <div className="wizard-heading">
                  <span className="eyebrow">Contexto</span>
                  <h3>O que estamos avaliando?</h3>
                  <p>Sem pitch. Descreva o pagador, o job e o wedge inicial.</p>
                </div>

                <div className="ai-assist-card">
                  <div className="ai-assist-head">
                    <div>
                      <span>LLM opcional</span>
                      <strong>Estruturar uma tese em texto livre</strong>
                    </div>
                    <button
                      className="secondary-button"
                      disabled={aiBusy === "intake"}
                      onClick={runAiIntake}
                    >
                      <Sparkles size={14} />
                      {aiBusy === "intake" ? "Estruturando…" : "Estruturar com IA"}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={aiIntakeText}
                    onChange={(e) => setAiIntakeText(e.target.value)}
                    placeholder="Cole aqui a ideia do jeito que você pensou. A IA só organiza, aponta lacunas e sugere o mecanismo de valor — ela não julga a tese."
                  />
                  {aiIntake ? (
                    <div className="ai-intake-output">
                      <div>
                        <strong>Lacunas</strong>
                        {aiIntake.unknowns.slice(0, 4).map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </div>
                      <div>
                        <strong>Perguntas que importam</strong>
                        {aiIntake.firstQuestions.slice(0, 4).map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="form-section wizard-form">
                  <label>
                    <span>Nome</span>
                    <input
                      value={context.name}
                      onChange={(e) => setContext({ ...context, name: e.target.value })}
                      placeholder="Ex.: Gyfted"
                      autoFocus
                    />
                  </label>
                  <label>
                    <span>Setor</span>
                    <input
                      value={context.sector}
                      onChange={(e) => setContext({ ...context, sector: e.target.value })}
                      placeholder="Ex.: formação esportiva"
                    />
                  </label>
                  <label>
                    <span>Modelo inicial</span>
                    <select
                      value={context.model}
                      onChange={(e) => setContext({ ...context, model: e.target.value })}
                    >
                      {["B2C", "B2B", "B2B2C", "B2G", "B2B2G", "Marketplace", "Transaction", "Licensing", "Services", "Hybrid", "Unknown"].map((item) => (
                        <option value={item} key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Pagador</span>
                    <input
                      value={context.payer}
                      onChange={(e) => setContext({ ...context, payer: e.target.value })}
                      placeholder="Quem tira dinheiro do bolso?"
                    />
                  </label>
                  <label>
                    <span>Usuário</span>
                    <input
                      value={context.user}
                      onChange={(e) => setContext({ ...context, user: e.target.value })}
                      placeholder="Quem usa / recebe o valor?"
                    />
                  </label>
                  <label>
                    <span>Problema / desejo / obrigação</span>
                    <textarea
                      rows={4}
                      value={context.problem}
                      onChange={(e) => setContext({ ...context, problem: e.target.value })}
                      placeholder="O que realmente faz o cliente mudar de comportamento?"
                    />
                  </label>
                  <label>
                    <span>Solução / wedge</span>
                    <textarea
                      rows={3}
                      value={context.solution}
                      onChange={(e) => setContext({ ...context, solution: e.target.value })}
                      placeholder="Menor proposta de valor testável."
                    />
                  </label>
                </div>

                <div className="wizard-footer">
                  <span>O modelo/canal não limita o motor.</span>
                  <button
                    className="primary-button"
                    disabled={!canAdvanceContext()}
                    onClick={() => setWizardStep(1)}
                  >
                    Continuar <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ) : null}

            {config && wizardStep === 1 ? (
              <div className="wizard-body">
                <div className="wizard-heading">
                  <span className="eyebrow">Roteador + core</span>
                  <h3>Por que alguém pagaria?</h3>
                  <p>Primeiro identificamos o mecanismo de valor. Depois aplicamos os experts corretos.</p>
                </div>

                <div className="criteria-section">
                  <div className="criteria-title">
                    <strong>Mecanismos de valor</strong>
                    <span>até 3 experts podem ser selecionados</span>
                  </div>
                  <div className="criteria-grid">
                    {config.router.map((engine) => (
                      <CriterionControl
                        key={engine.key}
                        label={engine.label}
                        description={engine.description}
                        value={routerSignals[engine.key] ?? blankSignal()}
                        onChange={(next) =>
                          updateGroup(setRouterSignals, engine.key, next)
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="route-preview">
                  <span>Experts roteados</span>
                  <div>
                    {selectedEngines.length ? (
                      selectedEngines.map((engine) => (
                        <b key={engine}>{formatEngine(engine)}</b>
                      ))
                    ) : (
                      <em>Nenhum ainda — algum mecanismo precisa chegar a 6/10.</em>
                    )}
                  </div>
                </div>

                <div className="criteria-section">
                  <div className="criteria-title">
                    <strong>Fundamentos universais</strong>
                    <span>esses vetos valem para qualquer modelo</span>
                  </div>
                  <div className="criteria-grid">
                    {config.criteria.universal.map(([key, label, weight, veto]) => (
                      <CriterionControl
                        key={key}
                        label={label}
                        weight={weight}
                        veto={veto}
                        value={universalSignals[key] ?? blankSignal()}
                        onChange={(next) =>
                          updateGroup(setUniversalSignals, key, next)
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="wizard-footer">
                  <span>Potencial não salva falha no core.</span>
                  <button
                    className="primary-button"
                    disabled={selectedEngines.length === 0}
                    onClick={() => setWizardStep(2)}
                  >
                    Aplicar experts <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ) : null}

            {config && wizardStep === 2 ? (
              <div className="wizard-body">
                <div className="wizard-heading">
                  <span className="eyebrow">Mixture of Experts</span>
                  <h3>Agora a régua fica específica.</h3>
                  <p>Você só responde o que faz sentido para os mecanismos selecionados.</p>
                </div>

                {selectedEngines.map((engine) => {
                  const meta = config.router.find((item) => item.key === engine);
                  return (
                    <div className="criteria-section expert-section" key={engine}>
                      <div className="criteria-title">
                        <strong>{meta?.label ?? formatEngine(engine)}</strong>
                        <span>{meta?.description}</span>
                      </div>
                      <div className="criteria-grid">
                        {(config.experts[engine] ?? []).map(([key, label, weight, veto]) => (
                          <CriterionControl
                            key={key}
                            label={label}
                            weight={weight}
                            veto={veto}
                            value={expertSignals[engine]?.[key] ?? blankSignal()}
                            onChange={(next) => updateExpert(engine, key, next)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="wizard-footer">
                  <span>{selectedEngines.length} expert(s) selecionado(s).</span>
                  <button className="primary-button" onClick={() => setWizardStep(3)}>
                    Velocidade & potencial <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ) : null}

            {config && wizardStep === 3 ? (
              <div className="wizard-body">
                <div className="wizard-heading">
                  <span className="eyebrow">Founder time</span>
                  <h3>Quão barato é descobrir a verdade?</h3>
                  <p>Uma tese pode ser forte e ainda ser uma entrada ruim para nós agora.</p>
                </div>

                <div className="criteria-section">
                  <div className="criteria-title">
                    <strong>Learning velocity / entry</strong>
                    <span>define o custo de aprofundar</span>
                  </div>
                  <div className="criteria-grid">
                    {config.criteria.learning.map(([key, label, weight, veto]) => (
                      <CriterionControl
                        key={key}
                        label={label}
                        weight={weight}
                        veto={veto}
                        value={learningSignals[key] ?? blankSignal()}
                        onChange={(next) =>
                          updateGroup(setLearningSignals, key, next)
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="criteria-section">
                  <div className="criteria-title">
                    <strong>Potencial — informativo</strong>
                    <span>não resgata tese ruim</span>
                  </div>
                  <div className="criteria-grid">
                    {config.criteria.potential.map(([key, label, weight, veto]) => (
                      <CriterionControl
                        key={key}
                        label={label}
                        weight={weight}
                        veto={veto}
                        value={potentialSignals[key] ?? blankSignal()}
                        onChange={(next) =>
                          updateGroup(setPotentialSignals, key, next)
                        }
                      />
                    ))}
                  </div>
                </div>

                {evaluationError ? (
                  <div className="wizard-error compact">
                    <strong>Não consegui avaliar</strong>
                    <span>{evaluationError}</span>
                  </div>
                ) : null}

                <div className="wizard-footer">
                  <span>O Rust decide; o frontend só coleta evidência.</span>
                  <button
                    className="primary-button"
                    disabled={evaluating}
                    onClick={evaluateThesis}
                  >
                    {evaluating ? "Avaliando…" : "Rodar Thesis Engine V5"}
                    {!evaluating ? <Sparkles size={15} /> : null}
                  </button>
                </div>
              </div>
            ) : null}

            {wizardStep === 4 && lastEvaluation ? (
              <div className="wizard-body result-step">
                <div className="result-hero">
                  <div className="result-score">
                    <strong>{Math.round(lastEvaluation.structural_strength)}</strong>
                    <span>estrutura</span>
                  </div>
                  <div>
                    <span className={decisionTone(formatDecision(lastEvaluation.decision))}>
                      {formatDecision(lastEvaluation.decision)}
                    </span>
                    <h3>{lastEvaluation.critical_issue}</h3>
                    <p>{lastEvaluation.next_experiment.reason}</p>
                  </div>
                </div>

                <div className="result-grid">
                  <div>
                    <span>Força conservadora</span>
                    <strong>{lastEvaluation.conservative_strength.toFixed(1)}</strong>
                  </div>
                  <div>
                    <span>Learning</span>
                    <strong>{lastEvaluation.learning.raw_score.toFixed(1)}</strong>
                  </div>
                  <div>
                    <span>Investigation priority</span>
                    <strong>{lastEvaluation.investigation_priority.toFixed(1)}</strong>
                  </div>
                  <div>
                    <span>Evidência</span>
                    <strong>{Math.round(lastEvaluation.evidence_coverage * 100)}%</strong>
                  </div>
                  <div>
                    <span>Confiança decisão</span>
                    <strong>{lastEvaluation.decision_confidence.toFixed(1)}</strong>
                  </div>
                  <div>
                    <span>Sensibilidade</span>
                    <strong>{lastEvaluation.sensitivity_risk.toFixed(1)}</strong>
                  </div>
                  <div>
                    <span>Divergência experts</span>
                    <strong>{lastEvaluation.expert_disagreement.toFixed(1)}</strong>
                  </div>
                  <div>
                    <span>Margem do veto</span>
                    <strong>{lastEvaluation.decision_margin.toFixed(1)}</strong>
                  </div>
                </div>

                {lastEvaluation.review_required ? (
                  <div className="review-warning">
                    <strong>Revisão humana recomendada</strong>
                    <span>
                      A decisão está sensível, pouco evidenciada ou há divergência relevante entre experts.
                    </span>
                  </div>
                ) : null}

                <div className="experiment-card">
                  <div className="experiment-head">
                    <FlaskConical size={18} />
                    <div>
                      <span>Próximo experimento</span>
                      <strong>{lastEvaluation.next_experiment.criterion_label}</strong>
                    </div>
                  </div>
                  <p>{lastEvaluation.next_experiment.method}</p>
                  <div className="experiment-signals">
                    <div>
                      <Check size={15} />
                      <span>{lastEvaluation.next_experiment.success_signal}</span>
                    </div>
                    <div>
                      <X size={15} />
                      <span>{lastEvaluation.next_experiment.failure_signal}</span>
                    </div>
                  </div>
                </div>

                <div className="ai-lab">
                  <div className="ai-lab-header">
                    <div>
                      <span>LLM advisory layer</span>
                      <strong>Use IA só onde interpretação humana ajuda.</strong>
                    </div>
                    <button
                      className="secondary-button"
                      disabled={aiBusy === "redteam"}
                      onClick={runAiRedTeam}
                    >
                      <BrainCircuit size={14} />
                      {aiBusy === "redteam" ? "Atacando…" : "Red-team da tese"}
                    </button>
                  </div>

                  {aiRedTeam ? (
                    <div className="redteam-list">
                      <div className="counter-case">
                        <span>Melhor argumento contra</span>
                        <strong>{aiRedTeam.strongestCounterCase}</strong>
                      </div>
                      {aiRedTeam.attacks.map((attack, index) => (
                        <div className="redteam-item" key={`${attack.assumption}-${index}`}>
                          <div className="redteam-severity">{attack.severity}</div>
                          <div>
                            <strong>{attack.assumption}</strong>
                            <p>{attack.whyItCouldBeWrong}</p>
                            <span>{attack.cheapestFalsification}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="evidence-lab">
                    <div>
                      <span>Mapear nova evidência</span>
                      <p>
                        Cole entrevista, nota de cliente ou resultado de pesquisa. A IA mapeia para critérios,
                        mas não altera nenhuma nota sozinha.
                      </p>
                    </div>
                    <textarea
                      rows={4}
                      value={evidenceText}
                      onChange={(e) => setEvidenceText(e.target.value)}
                      placeholder="Ex.: transcrição de entrevista, feedback de comprador, proposta discutida…"
                    />
                    <button
                      className="secondary-button"
                      disabled={aiBusy === "evidence"}
                      onClick={runAiEvidence}
                    >
                      <Search size={14} />
                      {aiBusy === "evidence" ? "Mapeando…" : "Mapear evidência"}
                    </button>
                  </div>

                  {aiEvidence ? (
                    <div className="evidence-findings">
                      {aiEvidence.findings.map((finding, index) => (
                        <div className="evidence-finding" key={`${finding.criterionKey}-${index}`}>
                          <span className={`evidence-direction ${finding.direction.toLowerCase()}`}>
                            {finding.direction}
                          </span>
                          <div>
                            <strong>{finding.criterionKey}</strong>
                            <p>{finding.rationale}</p>
                            <small>{finding.evidenceLevel} · força {Math.round(finding.strength * 100)}%</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {aiError ? (
                    <div className="wizard-error compact">
                      <strong>Camada LLM indisponível</strong>
                      <span>{aiError}</span>
                    </div>
                  ) : null}

                  <div className="ai-guardrail">
                    Rust decide. A IA não pode alterar score, veto, threshold ou decisão final.
                  </div>
                </div>

                {lastEvaluation.fatal_vetoes.length ? (
                  <div className="veto-box result-veto">
                    <strong>Por que morreu</strong>
                    {lastEvaluation.fatal_vetoes.map((veto) => (
                      <span key={veto.key}>
                        {veto.label}: {veto.score.toFixed(1)} / mínimo {veto.threshold}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="wizard-footer">
                  <span>A tese já foi adicionada à lista local.</span>
                  <button className="primary-button" onClick={() => setShowNew(false)}>
                    Concluir
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </main>
  );
}
