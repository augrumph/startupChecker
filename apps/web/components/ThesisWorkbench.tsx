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
    blue_ocean: CriterionDef[];
    founder_fit: CriterionDef[];
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
  thesis_score: number;
  conservative_strength: number;
  rating_band: "REJECT" | "WEAK" | "WATCHLIST" | "INVESTIGATE" | "PRIORITY" | "EXCEPTIONAL";
  evidence_cap: number;
  quality_cap: number;
  evidence_coverage: number;
  investigation_priority: number;
  decision_confidence: number;
  sensitivity_risk: number;
  expert_disagreement: number;
  decision_margin: number;
  review_required: boolean;
  truth: {
    truth_score: number;
    audit_grade: "A" | "B" | "C" | "D" | "F";
    evidence_count: number;
    claim_coverage: number;
    source_quality: number;
    source_diversity: number;
    independence_score: number;
    freshness_score: number;
    contradiction_rate: number;
    duplicate_rate: number;
    synthetic_share: number;
    unsupported_critical_claims: number;
    blocking_reasons: string[];
  };
  truth_adjusted_decision_confidence: number;
  training_eligible: boolean;
  founder_fit: { scorecard: ScoreCard; interpretation: string } | null;
  hypothesis_posteriors: Array<{
    id: string;
    label: string;
    prior_probability: number;
    posterior_probability: number;
    entropy_bits: number;
    observation_count: number;
    kill_if_false: boolean;
  }>;
  best_v8_experiment: {
    id: string;
    label: string;
    hypothesis_id: string;
    expected_information_gain_bits: number;
    value_of_information: number;
    kill_probability: number;
    cost_brl: number;
    hours: number;
  } | null;
  value_of_information: number;
  kill_probability: number;
  founder_attention_priority: number;
  counterfactuals: Array<{
    target_score: number;
    already_reached: boolean;
    blockers: string[];
  }>;
  failure_patterns: Array<{
    code: string;
    label: string;
    severity: number;
    reason: string;
  }>;
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

type AiResearch = {
  brazilAdaptation: {
    verdict: string;
    adaptedThesis: string;
    payer: string;
    user: string;
    wedge: string;
    whyBrazil: string;
  };
  engineSuggestions: Array<{
    engine: EngineKey;
    affinity: number;
    rationale: string;
  }>;
  blueOcean: {
    proposedSignals: Array<{
      key: string;
      score: number;
      evidenceLevel: Evidence;
      confidence: number;
      rationale: string;
      sourceUrls: string[];
    }>;
    strategyCanvas: Array<{
      factor: string;
      incumbents: number;
      proposed: number;
      rationale: string;
    }>;
  };
  proposedSignals: {
    universal: Array<ResearchSignal>;
    experts: Array<{ engine: EngineKey; criteria: Array<ResearchSignal> }>;
    learning: Array<ResearchSignal>;
    potential: Array<ResearchSignal>;
  };
  evidenceGraph: {
    claims: Array<{
      id: string;
      claim: string;
      sourceUrls: string[];
      criterionKeys: string[];
      direction: "SUPPORTS" | "CONTRADICTS" | "CONTEXT";
      confidence: number;
      sourceKind: "OFFICIAL" | "REGULATOR" | "ACADEMIC_RESEARCH" | "COMPANY_PRIMARY" | "INDUSTRY_ASSOCIATION" | "REPUTABLE_MEDIA" | "COMMUNITY" | "UNKNOWN";
    }>;
  };
  criticalHypotheses: Array<{
    id: string;
    label: string;
    priorProbability: number;
    killIfFalse: boolean;
    rationale: string;
  }>;
  candidateExperiments: Array<{
    id: string;
    label: string;
    hypothesisId: string;
    costBRL: number;
    hours: number;
    decisiveness: number;
    rationale: string;
  }>;
  founderFitQuestions: string[];
  researchConfidence: number;
};

type ResearchSignal = {
  key: string;
  score: number;
  evidenceLevel: Evidence;
  confidence: number;
  rationale: string;
  sourceUrls: string[];
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
  source?: string;
  batch?: string;
  location?: string;
  macroArea?: string;
  area?: string;
  marketTypes?: string[];
  productType?: string;
  salesMotion?: string;
  capitalIntensity?: string;
  regulatoryIntensity?: string;
  adaptationMode?: string;
  analysisStatus?: string;
};

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


type ShortlistItem = {
  rank: number;
  id: string;
  name: string;
  tagline: string;
  batch: string;
  area: string;
  scoutPriority: number;
  ocean: "BLUE_HYPOTHESIS" | "PURPLE_OCEAN";
  whyImportant: string;
  whatCanKill: string;
};

const ycShortlist: ShortlistItem[] = [
  { rank: 1, id: "yc-spring-2026-dayjob", name: "Dayjob", tagline: "AI Scheduling for Short Haul Trucks", batch: "Spring 2026", area: "Supply Chain & Logistics", scoutPriority: 4.2, ocean: "BLUE_HYPOTHESIS", whyImportant: "Scheduling de frota é recorrente, operacional e mensurável; se reduzir ociosidade, atraso ou trabalho manual, o ROI aparece rápido.", whatCanKill: "TMS existentes resolverem o suficiente ou integração/dispatch ser mais difícil que o ganho econômico." },
  { rank: 2, id: "yc-winter-2026-khotan-formerly-pollinate", name: "Khotan", tagline: "FDE as a platform for rebuilding critical operations in software.", batch: "Winter 2026", area: "Enterprise Operations & Vertical SaaS", scoutPriority: 4.2, ocean: "BLUE_HYPOTHESIS", whyImportant: "Ataca operações críticas, onde software ruim custa horas e receita; FDE pode capturar budget existente de serviços + software.", whatCanKill: "Virar consultoria pouco escalável ou depender de projetos longos para provar valor." },
  { rank: 3, id: "yc-fall-2025-lunavo", name: "Lunavo", tagline: "AI assistant for carriers.", batch: "Fall 2025", area: "Supply Chain & Logistics", scoutPriority: 4.2, ocean: "BLUE_HYPOTHESIS", whyImportant: "Transportadoras têm alto volume de comunicação, tracking, exceções e backoffice; automação pode monetizar economia de headcount e throughput.", whatCanKill: "Wedge genérico demais ou carriers já terem automação suficiente no TMS." },
  { rank: 4, id: "yc-spring-2026-hexa", name: "Hexa", tagline: "Autonomous operations for industrial distributors", batch: "Spring 2026", area: "Industrial, Manufacturing & Robotics", scoutPriority: 4.2, ocean: "BLUE_HYPOTHESIS", whyImportant: "Distribuidores industriais têm pedidos, cotações, estoque e atendimento repetitivos; buyer B2B e ROI operacional são claros.", whatCanKill: "Integrações ERP e dados ruins consumirem toda a margem e velocidade de implantação." },
  { rank: 5, id: "yc-spring-2026-alchemize", name: "Alchemize", tagline: "Building AI Native Customs Brokerages", batch: "Spring 2026", area: "Supply Chain & Logistics", scoutPriority: 4.2, ocean: "BLUE_HYPOTHESIS", whyImportant: "Despacho aduaneiro mistura trabalho documental, regras e transação econômica; há oportunidade de serviço tech-enabled com automação profunda.", whatCanKill: "Regulação/localização e responsabilidade do broker impedirem automação ou expansão rápida." },
  { rank: 6, id: "yc-winter-2027-linklane", name: "LinkLane", tagline: "AI-powered freight brokerage. Quote, book, and track loads in seconds.", batch: "Winter 2027", area: "Supply Chain & Logistics", scoutPriority: 4.2, ocean: "BLUE_HYPOTHESIS", whyImportant: "Cotação→booking→tracking é um workflow completo e monetizável; no Brasil ainda há espaço para uma adaptação realmente local.", whatCanKill: "Margem pequena, aquisição de liquidez e integração com embarcadores/transportadores." },
  { rank: 7, id: "yc-winter-2026-balance", name: "Balance", tagline: "Full-Stack AI Accounting", batch: "Winter 2026", area: "Finance & Accounting", scoutPriority: 3.9, ocean: "BLUE_HYPOTHESIS", whyImportant: "Contabilidade possui budget recorrente, tarefas repetitivas e valor econômico direto; substituir trabalho humano cria um ROI objetivo.", whatCanKill: "Qualidade/責abilidade contábil exigir humanos demais ou concorrência comprimir preço." },
  { rank: 8, id: "yc-winter-2026-fullseam", name: "FullSeam", tagline: "AI agents for corporate accounting teams", batch: "Winter 2026", area: "Finance & Accounting", scoutPriority: 3.9, ocean: "BLUE_HYPOTHESIS", whyImportant: "Buyer e departamento são explícitos; fechamento, reconciliação e exceções são frequentes e mensuráveis.", whatCanKill: "ERP incumbente incorporar a feature ou controles internos bloquearem autonomia do agente." },
  { rank: 9, id: "yc-spring-2026-cohesion", name: "Cohesion", tagline: "Modern Intelligence for Finance", batch: "Spring 2026", area: "Finance & Accounting", scoutPriority: 3.9, ocean: "BLUE_HYPOTHESIS", whyImportant: "Finance teams têm alto custo de análise e decisão; uma camada de inteligência pode capturar budget se atuar em decisões recorrentes.", whatCanKill: "Posicionamento amplo demais e substituição fácil por BI/LLMs horizontais." },
  { rank: 10, id: "yc-winter-2027-rote", name: "Rote", tagline: "AI-native insurance department for auto body shops", batch: "Winter 2027", area: "Insurance", scoutPriority: 3.9, ocean: "PURPLE_OCEAN", whyImportant: "Oficinas lidam com orçamento, fotos, seguradoras, autorizações e follow-up; o comprador e o workflow são concretos.", whatCanKill: "Seguradoras controlarem o processo ou oficinas pequenas não sustentarem ticket." },
  { rank: 11, id: "yc-winter-2026-valgo", name: "Valgo", tagline: "Insurance risk layer for physical AI", batch: "Winter 2026", area: "Insurance", scoutPriority: 3.9, ocean: "PURPLE_OCEAN", whyImportant: "Physical AI cria novos riscos e compradores corporativos; uma camada de risco pode virar infraestrutura obrigatória se o mercado crescer.", whatCanKill: "Mercado prematuro, dados insuficientes para underwriting ou carriers capturarem a camada." },
  { rank: 12, id: "yc-spring-2026-huscarl", name: "Huscarl", tagline: "AI-native actuary enabling self-insurance for corporations", batch: "Spring 2026", area: "Insurance", scoutPriority: 3.9, ocean: "PURPLE_OCEAN", whyImportant: "Self-insurance corporativo envolve economics grandes; reduzir custo atuarial/risco pode justificar ticket elevado.", whatCanKill: "Regulação, confiança e cauda de risco exigirem capital/credibilidade que a startup não possui." },
  { rank: 13, id: "yc-spring-2026-clawvisor", name: "Clawvisor", tagline: "The Authorization Layer for AI Agents", batch: "Spring 2026", area: "Security, Identity & Trust", scoutPriority: 3.7, ocean: "PURPLE_OCEAN", whyImportant: "Quanto mais agentes executam ações, mais autorização e controle viram requisito; valor é de risco/mandatory, não só conveniência.", whatCanKill: "Cloud/security incumbents absorverem a função ou padrões abertos comoditizarem a camada." },
  { rank: 14, id: "yc-spring-2026-modern", name: "Modern", tagline: "The ServiceNow killer", batch: "Spring 2026", area: "Enterprise Operations & Vertical SaaS", scoutPriority: 3.7, ocean: "PURPLE_OCEAN", whyImportant: "Service management tem budgets enormes e processos ruins; deslocar incumbent pode criar muito valor se houver wedge específico.", whatCanKill: "Sales cycle enterprise, switching cost e escopo amplo demais." },
  { rank: 15, id: "yc-spring-2026-asendia-ai", name: "Asendia AI", tagline: "AI recruiters for staffing agencies", batch: "Spring 2026", area: "Recruiting & HR", scoutPriority: 3.7, ocean: "PURPLE_OCEAN", whyImportant: "Staffing agencies monetizam throughput; automação que aumenta placements ou reduz recruiter-hours tem ROI direto.", whatCanKill: "Mercado extremamente crowded e diferenciação baixa." },
  { rank: 16, id: "yc-spring-2026-pumpgtm", name: "PumpGTM", tagline: "Find and engage with desperate buyers across LinkedIn, Email, and X", batch: "Spring 2026", area: "Sales, Marketing & Growth", scoutPriority: 3.7, ocean: "PURPLE_OCEAN", whyImportant: "Geração de pipeline tem budget claro e outcome em receita; uma fonte nova de intent pode capturar valor rápido.", whatCanKill: "Red ocean severo, dependência de plataformas e sinais de intent fracos." },
  { rank: 17, id: "yc-spring-2026-agentphone", name: "AgentPhone", tagline: "Phone Numbers for AI Agents", batch: "Spring 2026", area: "AI Infrastructure & Developer Tools", scoutPriority: 3.7, ocean: "PURPLE_OCEAN", whyImportant: "Agentes precisam de identidade/canais próprios para operar; pode virar infraestrutura simples e global.", whatCanKill: "Ser feature facilmente replicável por Twilio/telecom APIs." },
  { rank: 18, id: "yc-spring-2026-runtime", name: "Runtime", tagline: "The AI agent harness for payment teams", batch: "Spring 2026", area: "AI Infrastructure & Developer Tools", scoutPriority: 3.7, ocean: "PURPLE_OCEAN", whyImportant: "Payment teams combinam alto valor transacional com necessidade de controle; harness especializado pode cobrar premium.", whatCanKill: "Buyer preferir plataforma generalista ou compliance bloquear autonomia." },
  { rank: 19, id: "yc-spring-2026-silmaril", name: "Silmaril", tagline: "Security for agents that self-improves", batch: "Spring 2026", area: "Security, Identity & Trust", scoutPriority: 3.7, ocean: "PURPLE_OCEAN", whyImportant: "Segurança de agentes é um risco crescente; se detectar comportamento real em produção, o valor pode ser obrigatório.", whatCanKill: "Mercado ainda cedo ou solução virar módulo de observability/security existente." },
  { rank: 20, id: "yc-spring-2026-wato", name: "Wato", tagline: "The control point for AI agents at work.", batch: "Spring 2026", area: "AI Infrastructure & Developer Tools", scoutPriority: 3.7, ocean: "PURPLE_OCEAN", whyImportant: "Empresas precisarão controlar agentes, ações e permissões; governance pode se tornar infraestrutura horizontal.", whatCanKill: "Categoria consolidar em poucos vendors grandes ou produto não superar security stack atual." },
  { rank: 21, id: "yc-spring-2026-chronicle-labs", name: "Chronicle Labs", tagline: "Staging Environments for Enterprise AI Agents", batch: "Spring 2026", area: "Enterprise Operations & Vertical SaaS", scoutPriority: 3.7, ocean: "PURPLE_OCEAN", whyImportant: "Antes de agentes atuarem em produção, empresas precisam testar comportamento e integração; staging é um wedge técnico concreto.", whatCanKill: "Frameworks de agentes oferecerem isso nativamente." },
  { rank: 22, id: "yc-spring-2026-auxos", name: "Auxos", tagline: "Simulations of real people for market research", batch: "Spring 2026", area: "Research, Data & Simulation", scoutPriority: 3.7, ocean: "PURPLE_OCEAN", whyImportant: "Market research tem budget e tempo altos; simulação pode reduzir custo se provar correlação com humanos reais.", whatCanKill: "Validade externa ruim tornar o produto inútil para decisões sérias." },
  { rank: 23, id: "yc-spring-2026-saudara-ai", name: "Saudara AI", tagline: "AI Native Sourcing Broker For Overseas Manufacturing", batch: "Spring 2026", area: "Supply Chain & Logistics", scoutPriority: 3.7, ocean: "PURPLE_OCEAN", whyImportant: "Sourcing internacional é fragmentado e transacional; brokerage tech-enabled captura valor por economia e execução.", whatCanKill: "Confiança, inspeção e relacionamento local continuarem exigindo humanos." },
  { rank: 24, id: "yc-spring-2026-kinect", name: "Kinect", tagline: "The AI revenue platform for D2C brands", batch: "Spring 2026", area: "Sales, Marketing & Growth", scoutPriority: 3.7, ocean: "PURPLE_OCEAN", whyImportant: "D2C mede receita diretamente; produto que prova lift pode cobrar sobre valor.", whatCanKill: "Atribuição fraca e competição intensa em martech." },
  { rank: 25, id: "yc-spring-2026-maquoketa-research", name: "Maquoketa Research", tagline: "Automated LiveOps for Game Studios", batch: "Spring 2026", area: "AI Applications & Vertical Software", scoutPriority: 3.7, ocean: "PURPLE_OCEAN", whyImportant: "LiveOps é recorrente e ligado a retenção/receita; automação especializada pode ter outcome claro.", whatCanKill: "Studios pequenos demais ou ferramentas internas absorverem o fluxo." },
  { rank: 26, id: "yc-spring-2026-pentagon", name: "Pentagon", tagline: "The control plane for agent-native work.", batch: "Spring 2026", area: "AI Applications & Vertical Software", scoutPriority: 3.7, ocean: "PURPLE_OCEAN", whyImportant: "Se agentes virarem coworkers, coordenação e controle passam a ser uma nova camada de trabalho.", whatCanKill: "Abstração cedo demais sem buyer/wedge específico." },
  { rank: 27, id: "yc-spring-2026-projectx", name: "ProjectX", tagline: "Agent native workspace for heavy parallel workflows on the web", batch: "Spring 2026", area: "AI Infrastructure & Developer Tools", scoutPriority: 3.7, ocean: "PURPLE_OCEAN", whyImportant: "Workflows paralelos de agentes têm dor técnica real em browser/runtime; pode ser dev infra global.", whatCanKill: "Browsers/agent frameworks internalizarem a capacidade." },
  { rank: 28, id: "yc-spring-2026-manicule", name: "Manicule", tagline: "AgentRel — Devrel For Agents", batch: "Spring 2026", area: "Sales, Marketing & Growth", scoutPriority: 3.7, ocean: "PURPLE_OCEAN", whyImportant: "Se agentes passarem a escolher APIs/ferramentas, surge um novo canal de distribuição B2B.", whatCanKill: "A premissa de agentes decidirem autonomamente software ainda não gerar budget real." },
  { rank: 29, id: "yc-spring-2026-thomas", name: "Thomas", tagline: "The first AI founder: a virtual human who runs his own companies.", batch: "Spring 2026", area: "AI Applications & Vertical Software", scoutPriority: 3.7, ocean: "PURPLE_OCEAN", whyImportant: "É uma tese extrema de automação empresarial que pode revelar novos modelos de company creation.", whatCanKill: "Produto sem buyer claro, narrativa maior que economics e responsabilidade operacional." },
  { rank: 30, id: "yc-winter-2026-inventoryquant", name: "InventoryQuant", tagline: "We automate the inventory process in insurance", batch: "Winter 2026", area: "Insurance", scoutPriority: 3.9, ocean: "PURPLE_OCEAN", whyImportant: "Inventário em sinistros é trabalho manual ligado diretamente ao claim; buyer e outcome operacional podem ser mensurados.", whatCanKill: "Volume pequeno por cliente ou incumbentes já dominarem o processo." }
];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const seeded: Thesis[] = [
  {
    id: "GYF-01",
    name: "Gyfted",
    sector: "Formação esportiva",
    engine: "Aspiration / Transformation",
    decision: "48h Falsification",
    core: 6.7,
    expert: 6.9,
    learning: 7.4,
    evidence: 2,
    next: "Conseguir compromissos reais no ticket: reserva, depósito ou matrícula.",
  },
  {
    id: "OLY-01",
    name: "Olympia",
    sector: "Legaltech trabalhista",
    engine: "Economic ROI",
    decision: "48h Falsification",
    core: 6.8,
    expert: 6.7,
    learning: 7.0,
    evidence: 3,
    next: "Fechar piloto pago e medir horas economizadas, custo de entrega e outcome.",
  },
  {
    id: "RHU-01",
    name: "Rhubius",
    sector: "Fintech / PME",
    engine: "Economic ROI",
    decision: "48h Falsification",
    core: 6.1,
    expert: 6.0,
    learning: 6.8,
    evidence: 1,
    next: "Tentar destruir a hipótese com donos/CFOs antes de qualquer build.",
  },
  {
    id: "COR-01",
    name: "Cori Insight",
    sector: "Healthtech",
    engine: "Economic ROI",
    decision: "Kill / Reformulate",
    core: 3.2,
    expert: 2.8,
    learning: 4.0,
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
  if (score >= 8) return "score score-good";
  if (score >= 7) return "score score-warn";
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
  percent = false,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  value: number;
  percent?: boolean;
}) {
  const toneValue = percent ? value / 10 : value;
  return (
    <div className="metric-row">
      <div className="metric-icon">{icon}</div>
      <div className="metric-copy">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      <div className={scoreTone(toneValue)}>
        {value.toFixed(1)}{percent ? "%" : ""}
      </div>
    </div>
  );
}

export function ThesisWorkbench() {
  const [theses, setTheses] = useState<Thesis[]>(seeded);
  const [selected, setSelected] = useState(seeded[0].id);
  const [query, setQuery] = useState("");
  const [listMode, setListMode] = useState<"BEST" | "ALL" | "TRAINING">("BEST");
  const [marketFilter, setMarketFilter] = useState("ALL");
  const [macroFilter, setMacroFilter] = useState("ALL");
  const [areaFilter, setAreaFilter] = useState("ALL");
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [productFilter, setProductFilter] = useState("ALL");
  const [salesMotionFilter, setSalesMotionFilter] = useState("ALL");
  const [capitalFilter, setCapitalFilter] = useState("ALL");
  const [regulatoryFilter, setRegulatoryFilter] = useState("ALL");
  const [adaptationFilter, setAdaptationFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
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
  const [aiResearch, setAiResearch] = useState<AiResearch | null>(null);
  const [evidenceText, setEvidenceText] = useState("");
  const [aiBusy, setAiBusy] = useState<"intake" | "research" | "redteam" | "evidence" | null>(null);
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
  const [blueOceanSignals, setBlueOceanSignals] = useState<Record<string, SignalDraft>>({});
  const [founderFitSignals, setFounderFitSignals] = useState<Record<string, SignalDraft>>({});
  const [founderFitEnabled, setFounderFitEnabled] = useState(false);
  const [hypotheses, setHypotheses] = useState<Array<Record<string, unknown>>>([]);
  const [candidateExperiments, setCandidateExperiments] = useState<Array<Record<string, unknown>>>([]);

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
        setBlueOceanSignals({});
        setFounderFitSignals({});
      })
      .catch((error) => {
        setConfigError(
          `Não consegui carregar o motor em ${API_URL}. ${String(error)}`,
        );
      });
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/v1/theses`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`API ${response.status}`);
        return (await response.json()) as ThesisSummaryApi[];
      })
      .then((items) => {
        const imported: Thesis[] = items.map((item) => ({
          id: item.id,
          name: item.name,
          sector: item.sector,
          engine: item.analysis_status === "SPARSE_TRIAGED_RESEARCH_PENDING" ? "Research pending" : "V10",
          decision: item.decision ?? "Research pending",
          core: item.thesis_score ?? 0,
          expert: item.thesis_score ?? 0,
          learning: item.founder_attention_priority ?? 0,
          evidence: 0,
          next: item.analysis_status === "SPARSE_TRIAGED_RESEARCH_PENDING"
            ? "Rodar Deep Research V10 antes de atribuir qualquer score."
            : "Abrir registro completo.",
          source: item.source,
          batch: item.batch,
          location: item.location,
          macroArea: item.macro_area,
          area: item.area,
          marketTypes: item.market_types,
          productType: item.product_type,
          salesMotion: item.sales_motion,
          capitalIntensity: item.capital_intensity,
          regulatoryIntensity: item.regulatory_intensity,
          adaptationMode: item.adaptation_mode,
          analysisStatus: item.analysis_status,
        }));
        setTheses([...seeded, ...imported]);
      })
      .catch(() => {
        // The curated seeds remain usable if the repository index is unavailable.
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

  const filterOptions = useMemo(() => {
    const unique = (values: Array<string | undefined>) =>
      [...new Set(values.filter((value): value is string => Boolean(value)))].sort();

    return {
      markets: unique(theses.flatMap((item) => item.marketTypes ?? [])),
      macros: unique(theses.map((item) => item.macroArea)),
      areas: unique(
        theses
          .filter((item) => macroFilter === "ALL" || item.macroArea === macroFilter)
          .map((item) => item.area),
      ),
      batches: unique(theses.map((item) => item.batch)),
      products: unique(theses.map((item) => item.productType)),
      salesMotions: unique(theses.map((item) => item.salesMotion)),
      capital: unique(theses.map((item) => item.capitalIntensity)),
      regulatory: unique(theses.map((item) => item.regulatoryIntensity)),
      adaptations: unique(theses.map((item) => item.adaptationMode)),
      statuses: unique(theses.map((item) => item.analysisStatus)),
    };
  }, [theses, macroFilter]);

  const visibleTheses = useMemo(
    () =>
      theses.filter((item) => {
        const matchesText = [
          item.name,
          item.sector,
          item.engine,
          item.decision,
          item.macroArea,
          item.area,
          item.productType,
          item.salesMotion,
          item.batch,
          ...(item.marketTypes ?? []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());

        return (
          matchesText &&
          (marketFilter === "ALL" || item.marketTypes?.includes(marketFilter)) &&
          (macroFilter === "ALL" || item.macroArea === macroFilter) &&
          (areaFilter === "ALL" || item.area === areaFilter) &&
          (batchFilter === "ALL" || item.batch === batchFilter) &&
          (productFilter === "ALL" || item.productType === productFilter) &&
          (statusFilter === "ALL" || item.analysisStatus === statusFilter)
        );
      }),
    [query, theses, marketFilter, macroFilter, areaFilter, batchFilter, productFilter, statusFilter],
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
    setAiResearch(null);
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
      setBlueOceanSignals({});
      setFounderFitSignals({});
      setFounderFitEnabled(false);
      setHypotheses([]);
      setCandidateExperiments([]);
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
      blue_ocean: blueOceanSignals,
      founder_fit: founderFitEnabled ? founderFitSignals : {},
      hypotheses,
      candidate_experiments: candidateExperiments,
      evidence_records: (aiResearch?.evidenceGraph.claims ?? []).flatMap((claim) =>
        claim.sourceUrls.map((url, index) => ({
          id: `${claim.id}-${index + 1}`,
          claim: claim.claim,
          source_kind: claim.sourceKind,
          source_url: url,
          source_title: null,
          published_at_unix: null,
          observed_at_unix: null,
          fetched_at_unix: Math.floor(Date.now() / 1000),
          criterion_keys: claim.criterionKeys,
          direction:
            claim.direction === "SUPPORTS"
              ? "SUPPORTS"
              : claim.direction === "CONTRADICTS"
                ? "CONTRADICTS"
                : "NEUTRAL",
          strength: claim.confidence,
          reliability: claim.confidence,
          independence_group: (() => {
            try { return new URL(url).hostname; } catch { return null; }
          })(),
          content_hash: null,
          note: "Deep Research V10",
        })),
      ),
      evidence_as_of_unix: Math.floor(Date.now() / 1000),
    };

    try {
      const response = await fetch(`${API_URL}/v1/theses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? `API ${response.status}`);
      }

      const result = data.evaluation as Evaluation;
      if (!result) throw new Error("Markdown store returned no evaluation");
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

      setTheses((prev) => [...prev.filter((item) => item.id !== id), summary]);
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

  function researchSignal(signal: ResearchSignal): SignalDraft {
    return {
      score: Math.round(signal.score),
      evidence: signal.evidenceLevel,
      quality: Math.max(0, Math.min(1, signal.confidence)),
      contradictions: 0,
    };
  }

  async function runDeepResearch() {
    const seed = (aiIntakeText.trim() || [context.problem, context.solution].filter(Boolean).join(" — ")).trim();
    if (!context.name.trim() || seed.length < 8) {
      setAiError("Informe pelo menos o nome e uma descrição curta da tese.");
      return;
    }

    setAiBusy("research");
    setAiError("");

    try {
      const response = await fetch("/api/ai/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: context.name.trim(),
          tagline: seed,
          category: context.sector.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `AI ${response.status}`);

      const result = data as AiResearch;
      setAiResearch(result);

      setContext((prev) => ({
        ...prev,
        payer: result.brazilAdaptation.payer || prev.payer,
        user: result.brazilAdaptation.user || prev.user,
        solution: result.brazilAdaptation.wedge || prev.solution,
      }));

      setRouterSignals((prev) => {
        const next = { ...prev };
        for (const suggestion of result.engineSuggestions) {
          next[suggestion.engine] = {
            ...(next[suggestion.engine] ?? blankSignal()),
            score: Math.round(suggestion.affinity),
            evidence: "DESK_RESEARCH",
            quality: result.researchConfidence,
          };
        }
        return next;
      });

      setUniversalSignals(
        Object.fromEntries(
          result.proposedSignals.universal.map((signal) => [signal.key, researchSignal(signal)]),
        ),
      );
      setLearningSignals(
        Object.fromEntries(
          result.proposedSignals.learning.map((signal) => [signal.key, researchSignal(signal)]),
        ),
      );
      setPotentialSignals(
        Object.fromEntries(
          result.proposedSignals.potential.map((signal) => [signal.key, researchSignal(signal)]),
        ),
      );
      setBlueOceanSignals(
        Object.fromEntries(
          result.blueOcean.proposedSignals.map((signal) => [signal.key, researchSignal(signal)]),
        ),
      );
      setExpertSignals(
        Object.fromEntries(
          result.proposedSignals.experts.map((group) => [
            group.engine,
            Object.fromEntries(group.criteria.map((signal) => [signal.key, researchSignal(signal)])),
          ]),
        ),
      );

      setHypotheses(
        result.criticalHypotheses.map((h) => ({
          id: h.id,
          label: h.label,
          prior_probability: h.priorProbability,
          prior_strength: 2,
          kill_if_false: h.killIfFalse,
          observations: [],
        })),
      );
      setCandidateExperiments(
        result.candidateExperiments.map((e) => ({
          id: e.id,
          label: e.label,
          hypothesis_id: e.hypothesisId,
          cost_brl: e.costBRL,
          hours: e.hours,
          decisiveness: e.decisiveness,
        })),
      );
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

  const selectedShortlist = ycShortlist.find((item) => item.id === thesis.id);
  const currentHeroScore = thesis.evaluation
    ? thesis.evaluation.thesis_score
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
            <span>Thesis Engine V10</span>
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

        <div className="universe-modes">
          <button className={listMode === "BEST" ? "universe-mode active" : "universe-mode"} onClick={() => setListMode("BEST")}>Melhores</button>
          <button className={listMode === "ALL" ? "universe-mode active" : "universe-mode"} onClick={() => setListMode("ALL")}>Todas 539</button>
          <button className={listMode === "TRAINING" ? "universe-mode active" : "universe-mode"} onClick={() => setListMode("TRAINING")}>Treino</button>
        </div>

        <label className="search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar"
          />
        </label>

        {listMode === "ALL" ? <div className="filter-bar">
          <div className="market-tabs">
            {["ALL", "B2B", "B2C", "B2G", "B2B2C"].map((market) => (
              <button
                key={market}
                className={marketFilter === market ? "filter-chip filter-chip-active" : "filter-chip"}
                onClick={() => setMarketFilter(market)}
              >
                {market === "ALL" ? "Todos" : market}
              </button>
            ))}
          </div>

          <div className="filter-selects">
            <select
              value={macroFilter}
              onChange={(e) => {
                setMacroFilter(e.target.value);
                setAreaFilter("ALL");
              }}
            >
              <option value="ALL">Todas as macro áreas</option>
              {filterOptions.macros.map((value) => <option key={value}>{value}</option>)}
            </select>
            <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
              <option value="ALL">Todas as áreas</option>
              {filterOptions.areas.map((value) => <option key={value}>{value}</option>)}
            </select>
            <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)}>
              <option value="ALL">Todos os batches</option>
              {filterOptions.batches.map((value) => <option key={value}>{value}</option>)}
            </select>
            <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
              <option value="ALL">Todos os produtos</option>
              {filterOptions.products.map((value) => <option key={value}>{value}</option>)}
            </select>
            <select value={salesMotionFilter} onChange={(e) => setSalesMotionFilter(e.target.value)}>
              <option value="ALL">Todos os motions</option>
              {filterOptions.salesMotions.map((value) => <option key={value}>{value}</option>)}
            </select>
            <select value={capitalFilter} onChange={(e) => setCapitalFilter(e.target.value)}>
              <option value="ALL">Qualquer capital</option>
              {filterOptions.capital.map((value) => <option key={value}>{value}</option>)}
            </select>
            <select value={regulatoryFilter} onChange={(e) => setRegulatoryFilter(e.target.value)}>
              <option value="ALL">Qualquer regulação</option>
              {filterOptions.regulatory.map((value) => <option key={value}>{value}</option>)}
            </select>
            <select value={adaptationFilter} onChange={(e) => setAdaptationFilter(e.target.value)}>
              <option value="ALL">Brasil / global</option>
              {filterOptions.adaptations.map((value) => <option key={value}>{value}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">Todos os status</option>
              {filterOptions.statuses.map((value) => <option key={value}>{value}</option>)}
            </select>
          </div>

          <div className="filter-result-count">
            <strong>{visibleTheses.length}</strong>
            <span>teses</span>
            {(marketFilter !== "ALL" || macroFilter !== "ALL" || areaFilter !== "ALL" || batchFilter !== "ALL" || productFilter !== "ALL" || statusFilter !== "ALL") ? (
              <button
                onClick={() => {
                  setMarketFilter("ALL");
                  setMacroFilter("ALL");
                  setAreaFilter("ALL");
                  setBatchFilter("ALL");
                  setProductFilter("ALL");
                  setStatusFilter("ALL");
                }}
              >
                Limpar filtros
              </button>
            ) : null}
          </div>
        </div> : null}

        <div className="thesis-list">
          {listMode === "BEST" ? (
            ycShortlist.map((item) => (
              <button
                key={item.id}
                className={item.id === thesis.id ? "thesis-row thesis-selected shortlist-row" : "thesis-row shortlist-row"}
                onClick={() => setSelected(item.id)}
              >
                <div className="shortlist-rank">#{item.rank}</div>
                <div className="row-copy">
                  <div className="row-title">
                    <strong>{item.name}</strong>
                    <span>{item.scoutPriority.toFixed(1)} scout</span>
                  </div>
                  <p>{item.tagline}</p>
                  <small>{item.area} · {item.batch} · {item.ocean === "BLUE_HYPOTHESIS" ? "Blue candidate" : "Purple"}</small>
                  <em className="why-inline">{item.whyImportant}</em>
                </div>
              </button>
            ))
          ) : listMode === "TRAINING" ? (
            <div className="training-panel">
              <span className="eyebrow">ScoutNet · advisory only</span>
              <h3>O que já foi treinado</h3>
              <div className="training-stat"><span>Universo de treino</span><strong>363 teses</strong></div>
              <div className="training-stat"><span>LinearSVC macro-F1</span><strong>0.7664</strong></div>
              <div className="training-stat"><span>Accuracy</span><strong>0.8154</strong></div>
              <div className="training-stat"><span>MLP challenger macro-F1</span><strong>0.7334</strong></div>
              <div className="training-stat"><span>Priority model</span><strong>Ridge · MAE 7.129</strong></div>
              <p>O modelo serve para ordenar research. Ele não pode alterar score, veto ou decisão Rust.</p>
            </div>
          ) : (
            visibleTheses.map((item) => (
              <button
                key={item.id}
                className={item.id === thesis.id ? "thesis-row thesis-selected" : "thesis-row"}
                onClick={() => setSelected(item.id)}
              >
                <div className="mini-ring">
                  <span>{item.evaluation ? item.evaluation.thesis_score.toFixed(1) : "—"}</span>
                </div>
                <div className="row-copy">
                  <div className="row-title">
                    <strong>{item.name}</strong>
                    <span>{item.evaluation ? `${item.evidence}/5` : "sparse"}</span>
                  </div>
                  <p>{item.area ?? item.sector}</p>
                  <small>{[...(item.marketTypes ?? []), item.batch, item.productType].filter(Boolean).join(" · ") || item.decision}</small>
                </div>
              </button>
            ))
          )}
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
                  <strong>{selectedShortlist && !thesis.evaluation ? selectedShortlist.scoutPriority.toFixed(1) : currentHeroScore.toFixed(1)}</strong>
                  <span>{selectedShortlist && !thesis.evaluation ? "scout priority" : "score V10"}</span>
                </div>
              </div>
            </div>

            <div className="hero-copy">
              <span className={decisionTone(thesis.decision)}>{thesis.decision}</span>
              <h3>{thesis.evaluation?.critical_issue ?? "Vale founder time?"}</h3>
              <p>
                {thesis.evaluation
                  ? `A V10 encontrou ${thesis.evaluation.fatal_vetoes.length} veto(s) fatal(is) e ${thesis.evaluation.entry_flags.length} flag(s) de entrada. O score potencial não participa do resgate da tese.`
                  : selectedShortlist
                    ? selectedShortlist.whyImportant
                    : "Ainda sem Deep Research V10. A triagem sparse não é um score final."}
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

          {selectedShortlist && !thesis.evaluation ? (
            <section className="shortlist-explanation">
              <div className="shortlist-explanation-head">
                <div>
                  <span className="eyebrow">Top {selectedShortlist.rank} / 539</span>
                  <h3>Por que está no shortlist</h3>
                </div>
                <span className={selectedShortlist.ocean === "BLUE_HYPOTHESIS" ? "pill pill-good" : "pill pill-warn"}>
                  {selectedShortlist.ocean === "BLUE_HYPOTHESIS" ? "Blue candidate" : "Purple ocean"}
                </span>
              </div>
              <p>{selectedShortlist.whyImportant}</p>
              <div className="shortlist-why-grid">
                <div>
                  <span>O que o treino enxergou</span>
                  <strong>Scout {selectedShortlist.scoutPriority.toFixed(1)} · {selectedShortlist.area}</strong>
                  <small>Ranking model-informed, diversificado por área para reduzir viés do vocabulário do ScoutNet.</small>
                </div>
                <div>
                  <span>O que pode matar</span>
                  <strong>{selectedShortlist.whatCanKill}</strong>
                  <small>Isso precisa ser atacado no Deep Research/experimento antes de qualquer score V10 comparável.</small>
                </div>
              </div>
              <div className="not-final-warning">
                <BrainCircuit size={16} />
                <span>Não é Thesis Score V10. É prioridade de investigação entre as 539 teses sparse.</span>
              </div>
            </section>
          ) : null}

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
                  title="Score V8"
                  subtitle="Score final após compressão, evidência e folga sobre vetos."
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
                  percent
                />
              ) : null}
              {thesis.evaluation ? (
                <Metric
                  icon={<Gauge size={18} />}
                  title="Estabilidade da decisão"
                  subtitle="100 menos o risco de pequenas mudanças alterarem a conclusão."
                  value={100 - thesis.evaluation.sensitivity_risk}
                  percent
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
              <div className="wizard-state">Carregando Thesis Engine V10…</div>
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
                    <div className="ai-action-row">
                      <button
                        className="secondary-button"
                        disabled={aiBusy === "intake"}
                        onClick={runAiIntake}
                      >
                        <Sparkles size={14} />
                        {aiBusy === "intake" ? "Estruturando…" : "Estruturar com IA"}
                      </button>
                      <button
                        className="secondary-button"
                        disabled={aiBusy === "research"}
                        onClick={runDeepResearch}
                      >
                        <Search size={14} />
                        {aiBusy === "research" ? "Pesquisando…" : "Deep Research V8"}
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={aiIntakeText}
                    onChange={(e) => setAiIntakeText(e.target.value)}
                    placeholder="Cole aqui a ideia do jeito que você pensou. A IA só organiza, aponta lacunas e sugere o mecanismo de valor — ela não julga a tese."
                  />
                  {aiResearch ? (
                    <div className="research-summary">
                      <div>
                        <span>Adaptação</span>
                        <strong>{aiResearch.brazilAdaptation.verdict}</strong>
                      </div>
                      <div>
                        <span>Confiança research</span>
                        <strong>{Math.round(aiResearch.researchConfidence * 100)}%</strong>
                      </div>
                      <div>
                        <span>Hipóteses críticas</span>
                        <strong>{aiResearch.criticalHypotheses.length}</strong>
                      </div>
                      <div>
                        <span>Experimentos</span>
                        <strong>{aiResearch.candidateExperiments.length}</strong>
                      </div>
                    </div>
                  ) : null}
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

                <div className="criteria-section">
                  <div className="criteria-title">
                    <strong>Founder Fit — separado da oportunidade</strong>
                    <button
                      className="secondary-button"
                      onClick={() => {
                        const next = !founderFitEnabled;
                        setFounderFitEnabled(next);
                        if (next && Object.keys(founderFitSignals).length === 0) {
                          setFounderFitSignals(makeSignals(config.criteria.founder_fit));
                        }
                      }}
                    >
                      {founderFitEnabled ? "Remover Founder Fit" : "Avaliar nosso fit"}
                    </button>
                  </div>
                  {founderFitEnabled ? (
                    <>
                      <p className="section-helper">
                        Isso não altera Thesis Score. Só altera Founder Attention Priority.
                      </p>
                      <div className="criteria-grid">
                        {config.criteria.founder_fit.map(([key, label, weight, veto]) => (
                          <CriterionControl
                            key={key}
                            label={label}
                            weight={weight}
                            veto={veto}
                            value={founderFitSignals[key] ?? blankSignal()}
                            onChange={(next) =>
                              updateGroup(setFounderFitSignals, key, next)
                            }
                          />
                        ))}
                      </div>
                    </>
                  ) : null}
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
                    {evaluating ? "Avaliando…" : "Rodar Thesis Engine V10"}
                    {!evaluating ? <Sparkles size={15} /> : null}
                  </button>
                </div>
              </div>
            ) : null}

            {wizardStep === 4 && lastEvaluation ? (
              <div className="wizard-body result-step">
                <div className="result-hero">
                  <div className="result-score">
                    <strong>{lastEvaluation.thesis_score.toFixed(1)}</strong>
                    <span>score V10</span>
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
                    <span>Estrutura teórica</span>
                    <strong>{lastEvaluation.structural_strength.toFixed(1)}</strong>
                  </div>
                  <div>
                    <span>Teto evidência</span>
                    <strong>{lastEvaluation.evidence_cap.toFixed(1)}</strong>
                  </div>
                  <div>
                    <span>Teto qualidade</span>
                    <strong>{lastEvaluation.quality_cap.toFixed(1)}</strong>
                  </div>
                  <div>
                    <span>Faixa</span>
                    <strong>{lastEvaluation.rating_band}</strong>
                  </div>
                  <div className="v8-priority">
                    <span>Founder Attention</span>
                    <strong>{lastEvaluation.founder_attention_priority.toFixed(1)}</strong>
                  </div>
                  <div>
                    <span>Value of Information</span>
                    <strong>{lastEvaluation.value_of_information.toFixed(1)}</strong>
                  </div>
                  <div>
                    <span>Kill probability</span>
                    <strong>{Math.round(lastEvaluation.kill_probability * 100)}%</strong>
                  </div>
                  <div>
                    <span>Founder Fit</span>
                    <strong>{lastEvaluation.founder_fit ? lastEvaluation.founder_fit.scorecard.conservative_score.toFixed(1) : "N/A"}</strong>
                  </div>
                  <div className="v8-priority">
                    <span>Truth Score</span>
                    <strong>{lastEvaluation.truth.truth_score.toFixed(1)} · {lastEvaluation.truth.audit_grade}</strong>
                  </div>
                  <div>
                    <span>Claims críticos cobertos</span>
                    <strong>{Math.round(lastEvaluation.truth.claim_coverage * 100)}%</strong>
                  </div>
                  <div>
                    <span>Confiança auditada</span>
                    <strong>{lastEvaluation.truth_adjusted_decision_confidence.toFixed(1)}%</strong>
                  </div>
                  <div>
                    <span>Treino futuro</span>
                    <strong>{lastEvaluation.training_eligible ? "ELIGIBLE" : "BLOCKED"}</strong>
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

                {lastEvaluation.best_v8_experiment ? (
                  <div className="v8-decision-card">
                    <div>
                      <span>Next Best Experiment · V8</span>
                      <strong>{lastEvaluation.best_v8_experiment.label}</strong>
                      <p>
                        VOI {lastEvaluation.best_v8_experiment.value_of_information.toFixed(1)} ·
                        {" "}R$ {lastEvaluation.best_v8_experiment.cost_brl.toFixed(0)} ·
                        {" "}{lastEvaluation.best_v8_experiment.hours.toFixed(1)}h ·
                        {" "}kill {Math.round(lastEvaluation.best_v8_experiment.kill_probability * 100)}%
                      </p>
                    </div>
                    <FlaskConical size={20} />
                  </div>
                ) : null}

                {lastEvaluation.failure_patterns.length ? (
                  <div className="failure-patterns">
                    <div className="criteria-title">
                      <strong>Failure Pattern Library</strong>
                      <span>padrões que já mataram teses parecidas</span>
                    </div>
                    {lastEvaluation.failure_patterns.map((pattern) => (
                      <div className="failure-pattern" key={pattern.code}>
                        <b>{pattern.code}</b>
                        <div>
                          <strong>{pattern.label}</strong>
                          <span>{pattern.reason}</span>
                        </div>
                        <em>{pattern.severity}/5</em>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="counterfactual-grid">
                  {lastEvaluation.counterfactuals.map((item) => (
                    <div className="counterfactual-card" key={item.target_score}>
                      <span>Para chegar em {item.target_score.toFixed(0)}</span>
                      {item.already_reached ? (
                        <strong>Já atingido</strong>
                      ) : (
                        <>
                          <strong>{item.blockers.length} bloqueio(s)</strong>
                          {item.blockers.slice(0, 3).map((blocker) => (
                            <small key={blocker}>{blocker}</small>
                          ))}
                        </>
                      )}
                    </div>
                  ))}
                </div>

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
