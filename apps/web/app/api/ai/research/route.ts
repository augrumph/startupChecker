import {
  DEEP_MODEL,
  Output,
  engineKeys,
  evidenceLevels,
  generateText,
  z,
} from "@/lib/ai";
import { gateway, isStepCount } from "ai";

export const runtime = "nodejs";
export const maxDuration = 300;

const sourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  publisher: z.string(),
  date: z.string().optional(),
  claim: z.string(),
  authority: z.enum(["OFFICIAL", "INDUSTRY", "COMPANY", "MEDIA", "COMMUNITY", "OTHER"]),
});

const factField = z.object({
  answer: z.string(),
  status: z.enum(["SUPPORTED", "CONFLICTED", "UNKNOWN"]),
  confidence: z.number().min(0).max(1),
  sourceUrls: z.array(z.string().url()).max(12),
  note: z.string().optional(),
});

const moneyEvidence = z.object({
  description: z.string(),
  amountOrRange: z.string(),
  context: z.string(),
  sourceUrls: z.array(z.string().url()).min(1).max(8),
  confidence: z.number().min(0).max(1),
});

const researchDossierSchema = z.object({
  thesis: z.object({
    rewrittenPtBr: factField,
    category: factField,
    businessModel: factField,
    marketType: factField,
    valueEngineHypothesis: factField,
  }),
  buyer: z.object({
    economicBuyer: factField,
    budgetOwner: factField,
    endUser: factField,
    beneficiary: factField,
    buyerSegments: z.array(factField).min(1).max(12),
    purchaseTrigger: factField,
    purchaseProcess: factField,
    procurementReality: factField,
  }),
  problem: z.object({
    jobToBeDone: factField,
    currentWorkflow: factField,
    frequency: factField,
    urgency: factField,
    severity: factField,
    currentAlternatives: z.array(factField).min(1).max(15),
    statusQuoCost: factField,
    switchingFriction: factField,
    whyNow: factField,
  }),
  economics: z.object({
    currentSpend: z.array(moneyEvidence).max(15),
    pricingBenchmarks: z.array(moneyEvidence).max(15),
    wtpEvidence: z.array(moneyEvidence).max(15),
    roiMechanism: factField,
    valueEquation: factField,
    paybackLogic: factField,
    grossMarginLogic: factField,
    implementationCostLogic: factField,
    ongoingCostDrivers: z.array(factField).max(12),
    unitEconomicRisks: z.array(factField).max(12),
  }),
  market: z.object({
    buyerCount: factField,
    buyerDensity: factField,
    tam: factField,
    sam: factField,
    somEntryWedge: factField,
    marketGrowth: factField,
    segmentation: z.array(factField).min(1).max(15),
    geographicConcentration: factField,
    seasonalityCyclicality: factField,
  }),
  competition: z.object({
    direct: z.array(z.object({
      name: z.string(),
      url: z.string().url().optional(),
      geography: z.string(),
      buyer: z.string(),
      product: z.string(),
      pricing: z.string(),
      strengths: z.array(z.string()).max(8),
      weaknesses: z.array(z.string()).max(8),
      sourceUrls: z.array(z.string().url()).max(8),
    })).min(3).max(30),
    indirectAlternatives: z.array(factField).min(2).max(20),
    incumbentResponse: factField,
    substitutionRisk: factField,
    marketCrowding: factField,
  }),
  distribution: z.object({
    primaryChannels: z.array(factField).min(1).max(10),
    salesMotion: factField,
    salesCycle: factField,
    cacProxy: factField,
    trustBarrier: factField,
    channelDependencies: z.array(factField).max(10),
    landAndExpand: factField,
  }),
  product: z.object({
    minimumViableWedge: factField,
    workflowInsertionPoint: factField,
    requiredIntegrations: z.array(factField).max(20),
    requiredData: z.array(factField).max(20),
    automationBoundary: factField,
    humanInTheLoop: factField,
    technicalRisks: z.array(factField).max(15),
    implementationComplexity: factField,
    timeToValue: factField,
  }),
  regulation: z.object({
    obligations: z.array(factField).max(20),
    licenses: z.array(factField).max(15),
    privacyData: z.array(factField).max(15),
    liability: z.array(factField).max(15),
    procurementLobby: z.array(factField).max(15),
    regulatoryRiskSummary: factField,
  }),
  defensibility: z.object({
    switchingCosts: factField,
    dataAdvantage: factField,
    workflowEmbedding: factField,
    networkEffects: factField,
    scaleEconomies: factField,
    brandTrust: factField,
    proprietaryTechnology: factField,
    platformDependency: factField,
    incumbentCopyRisk: factField,
  }),
  retentionExpansion: z.object({
    usageFrequency: factField,
    retentionDriver: factField,
    churnRisks: z.array(factField).max(12),
    expansionPaths: z.array(factField).max(12),
    naturalUpsell: factField,
  }),
  traction: z.object({
    revenue: factField,
    customerCount: factField,
    namedCustomers: z.array(factField).max(20),
    growth: factField,
    funding: factField,
    usage: factField,
    outcomes: z.array(factField).max(20),
  }),
  localization: z.object({
    brazilApplicability: factField,
    brazilSpecificWorkflow: factField,
    brazilCompetitors: z.array(factField).max(20),
    brazilRegulation: z.array(factField).max(20),
    brazilPricingReality: factField,
    globalFromBrazilCase: factField,
  }),
  risks: z.object({
    fatalAssumptions: z.array(factField).min(2).max(15),
    contradictionEvidence: z.array(factField).max(15),
    unknowns: z.array(factField).max(20),
    externalDependencies: z.array(factField).max(15),
  }),
});

const scoredCriterion = z.object({
  key: z.string(),
  score: z.number().min(0).max(10),
  evidenceLevel: z.enum(evidenceLevels),
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
  sourceUrls: z.array(z.string().url()).max(8),
  unresolved: z.string().optional(),
});

const schema = z.object({
  originalThesis: z.object({
    name: z.string(),
    tagline: z.string(),
    category: z.string().optional(),
  }),
  researchDossier: researchDossierSchema,
  brazilAdaptation: z.object({
    verdict: z.enum([
      "LOCALIZE_BRAZIL",
      "VERTICALIZE_BRAZIL",
      "GLOBAL_FROM_BRAZIL",
      "DO_NOT_ADAPT_YET",
    ]),
    adaptedThesis: z.string(),
    payer: z.string(),
    user: z.string(),
    wedge: z.string(),
    whyBrazil: z.string(),
    whatMustChangeFromOriginal: z.array(z.string()).max(8),
  }),
  market: z.object({
    buyerCountOrProxy: z.string(),
    marketSizeOrProxy: z.string(),
    currentSpendOrWorkaround: z.string(),
    urgencyOrTrigger: z.string(),
    distributionReality: z.string(),
  }),
  competitors: z.array(
    z.object({
      name: z.string(),
      category: z.string(),
      url: z.string().url().optional(),
      whyRelevant: z.string(),
    }),
  ).max(30),
  regulation: z.array(
    z.object({
      item: z.string(),
      impact: z.enum(["LOW", "MEDIUM", "HIGH"]),
      sourceUrl: z.string().url().optional(),
    }),
  ).max(25),
  engineSuggestions: z.array(
    z.object({
      engine: z.enum(engineKeys),
      affinity: z.number().min(0).max(10),
      rationale: z.string(),
    }),
  ).max(6),
  blueOcean: z.object({
    competitiveArena: z.string(),
    conventionalFactors: z.array(z.string()).max(12),
    noncustomers: z.object({
      tier1SoonToBe: z.array(z.string()).max(6),
      tier2Refusing: z.array(z.string()).max(6),
      tier3Unexplored: z.array(z.string()).max(6),
    }),
    utilityBlocks: z.array(z.string()).max(10),
    errc: z.object({
      eliminate: z.array(z.string()).max(8),
      reduce: z.array(z.string()).max(8),
      raise: z.array(z.string()).max(8),
      create: z.array(z.string()).max(8),
    }),
    valueInnovationThesis: z.string(),
    whyNotEmptyOcean: z.string(),
    classificationHypothesis: z.enum([
      "BLUE_HYPOTHESIS",
      "PURPLE_OCEAN",
      "RED_OCEAN",
      "EMPTY_OCEAN_RISK",
      "UNKNOWN",
    ]),
    emptyOceanRisk: z.number().min(0).max(1),
    proposedSignals: z.array(scoredCriterion).length(6),
    sourceUrls: z.array(z.string().url()).max(12),
    strategyCanvas: z.array(
      z.object({
        factor: z.string(),
        incumbents: z.number().min(0).max(10),
        proposed: z.number().min(0).max(10),
        rationale: z.string(),
      }),
    ).min(4).max(12),
  }),
  evidenceGraph: z.object({
    claims: z.array(
      z.object({
        id: z.string(),
        claim: z.string(),
        sourceUrls: z.array(z.string().url()).max(8),
        criterionKeys: z.array(z.string()).max(8),
        direction: z.enum(["SUPPORTS", "CONTRADICTS", "CONTEXT"]),
        confidence: z.number().min(0).max(1),
        sourceKind: z.enum([
          "OFFICIAL",
          "REGULATOR",
          "ACADEMIC_RESEARCH",
          "COMPANY_PRIMARY",
          "INDUSTRY_ASSOCIATION",
          "REPUTABLE_MEDIA",
          "COMMUNITY",
          "UNKNOWN"
        ]),
      }),
    ).max(120),
  }),
  criticalHypotheses: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      priorProbability: z.number().min(0.01).max(0.99),
      killIfFalse: z.boolean(),
      rationale: z.string(),
    }),
  ).min(2).max(10),
  candidateExperiments: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      hypothesisId: z.string(),
      costBRL: z.number().min(0),
      hours: z.number().min(0),
      decisiveness: z.number().min(0).max(1),
      rationale: z.string(),
    }),
  ).min(1).max(12),
  founderFitQuestions: z.array(z.string()).max(8),
  proposedSignals: z.object({
    universal: z.array(scoredCriterion),
    experts: z.array(
      z.object({
        engine: z.enum(engineKeys),
        criteria: z.array(scoredCriterion),
      }),
    ),
    learning: z.array(scoredCriterion),
    potential: z.array(scoredCriterion),
  }),
  fastestFalsification: z.object({
    question: z.string(),
    experiment: z.string(),
    passSignal: z.string(),
    killSignal: z.string(),
    days: z.number().int().min(1).max(30),
  }),
  sources: z.array(sourceSchema).min(12).max(80),
  unresolvedUnknowns: z.array(z.string()).max(40),
  researchConfidence: z.number().min(0).max(1),
});


function domainOf(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

function supported(field: { status?: string; answer?: string; sourceUrls?: string[] } | undefined) {
  return Boolean(
    field &&
    field.status !== "UNKNOWN" &&
    String(field.answer ?? "").trim().length >= 3 &&
    Array.isArray(field.sourceUrls) &&
    field.sourceUrls.length > 0
  );
}

function auditResearchReadiness(output: z.infer<typeof schema>) {
  const d = output.researchDossier;
  const critical: Array<[string, { status?: string; answer?: string; sourceUrls?: string[] } | undefined]> = [
    ["buyer.economicBuyer", d.buyer.economicBuyer],
    ["buyer.budgetOwner", d.buyer.budgetOwner],
    ["buyer.purchaseTrigger", d.buyer.purchaseTrigger],
    ["buyer.purchaseProcess", d.buyer.purchaseProcess],
    ["problem.jobToBeDone", d.problem.jobToBeDone],
    ["problem.currentWorkflow", d.problem.currentWorkflow],
    ["problem.frequency", d.problem.frequency],
    ["problem.statusQuoCost", d.problem.statusQuoCost],
    ["economics.roiMechanism", d.economics.roiMechanism],
    ["economics.valueEquation", d.economics.valueEquation],
    ["economics.paybackLogic", d.economics.paybackLogic],
    ["economics.grossMarginLogic", d.economics.grossMarginLogic],
    ["market.buyerCount", d.market.buyerCount],
    ["market.buyerDensity", d.market.buyerDensity],
    ["market.sam", d.market.sam],
    ["market.somEntryWedge", d.market.somEntryWedge],
    ["competition.incumbentResponse", d.competition.incumbentResponse],
    ["competition.substitutionRisk", d.competition.substitutionRisk],
    ["distribution.salesMotion", d.distribution.salesMotion],
    ["distribution.salesCycle", d.distribution.salesCycle],
    ["distribution.cacProxy", d.distribution.cacProxy],
    ["distribution.trustBarrier", d.distribution.trustBarrier],
    ["product.minimumViableWedge", d.product.minimumViableWedge],
    ["product.workflowInsertionPoint", d.product.workflowInsertionPoint],
    ["product.automationBoundary", d.product.automationBoundary],
    ["product.implementationComplexity", d.product.implementationComplexity],
    ["product.timeToValue", d.product.timeToValue],
    ["regulation.regulatoryRiskSummary", d.regulation.regulatoryRiskSummary],
    ["defensibility.switchingCosts", d.defensibility.switchingCosts],
    ["defensibility.platformDependency", d.defensibility.platformDependency],
    ["retentionExpansion.usageFrequency", d.retentionExpansion.usageFrequency],
    ["retentionExpansion.retentionDriver", d.retentionExpansion.retentionDriver],
    ["localization.brazilApplicability", d.localization.brazilApplicability],
  ];

  const missing = critical.filter(([, field]) => !supported(field)).map(([path]) => path);
  if (d.competition.direct.length < 3) missing.push("competition.direct<3");
  if (d.problem.currentAlternatives.length < 1) missing.push("problem.currentAlternatives");
  if (d.economics.pricingBenchmarks.length + d.economics.wtpEvidence.length < 2) {
    missing.push("economics.pricing_or_wtp_evidence<2");
  }

  const domains = new Set(output.sources.map((s) => domainOf(s.url)).filter(Boolean));
  const primary = output.sources.filter((s) =>
    ["OFFICIAL", "COMPANY", "INDUSTRY"].includes(s.authority)
  ).length;
  const claimCount = output.evidenceGraph.claims.length;

  const structuralChecks = critical.length + 3;
  const passed = structuralChecks - missing.length;
  const completeness = Math.max(0, Math.min(1, passed / structuralChecks));

  const criticalUnknowns = [
    ...missing,
    ...output.unresolvedUnknowns.filter((x) =>
      /pagador|payer|preço|pricing|wtp|willingness|roi|regula|licen|budget|orçamento|distribui|sales cycle|ciclo de venda/i.test(x)
    ),
  ];

  const engineReady =
    completeness >= 0.95 &&
    missing.length === 0 &&
    criticalUnknowns.length === 0 &&
    output.sources.length >= 12 &&
    domains.size >= 6 &&
    primary >= 2 &&
    claimCount >= 12;

  return {
    status: engineReady ? "ENGINE_READY" : completeness >= 0.8 ? "RESEARCH_COMPLETE" : "RESEARCH_INCOMPLETE",
    dossier_version: "research-dossier-v1",
    completeness,
    missing_fields: missing,
    source_count: output.sources.length,
    independent_domains: domains.size,
    primary_or_official_sources: primary,
    evidence_claim_count: claimCount,
    critical_unknowns: [...new Set(criticalUnknowns)],
  };
}

export async function POST(request: Request) {
  const body = await request.json();

  const name = String(body?.name ?? "").trim();
  const tagline = String(body?.tagline ?? body?.text ?? "").trim();
  const category = String(body?.category ?? "").trim();

  if (!name || tagline.length < 8) {
    return Response.json(
      { error: "Envie ao menos nome e tagline/tese curta." },
      { status: 400 },
    );
  }

  const prompt = `
Você recebeu APENAS a semente de uma tese, como no diretório da Y Combinator.

EMPRESA/Tese: ${name}
TAGLINE: ${tagline}
CATEGORIA: ${category || "não informada"}
PAÍS-ALVO: Brasil
DATA DE REFERÊNCIA: outubro de 2026

Sua função é FAZER O TRABALHO QUE O FOUNDER NÃO DEVE PREENCHER MANUALMENTE.

ANTES DE PONTUAR QUALQUER COISA, construa um DOSSIÊ DE PESQUISA COMPLETO.
A tagline é só uma semente; não repita marketing da empresa como verdade.

Para CADA dimensão do researchDossier:
- responda em PT-BR;
- marque SUPPORTED, CONFLICTED ou UNKNOWN;
- anexe URLs diretamente ao fato;
- procure evidência CONTRÁRIA, não apenas confirmação;
- diferencie fato da própria empresa, fonte independente e inferência;
- se não houver evidência suficiente, use UNKNOWN — nunca complete por plausibilidade.

O dossiê precisa cobrir obrigatoriamente:
- tese reformulada, modelo de negócio e value engine;
- pagador econômico, budget owner, usuário, beneficiário e processo de compra;
- JTBD, workflow atual, frequência, urgência, alternativas e custo do status quo;
- gasto atual, pricing, WTP, ROI, payback, margem e custos de implantação/operação;
- buyer count, TAM/SAM/SOM com proxies defensáveis, segmentação e crescimento;
- pelo menos 3 concorrentes diretos + alternativas indiretas;
- distribuição, CAC proxy, ciclo de venda, procurement e trust barriers;
- MVP/wedge, integrações, dados, human-in-the-loop, riscos técnicos e time-to-value;
- regulação, licenças, privacidade, responsabilidade e procurement/lobby;
- defensibilidade, switching costs, dados, workflow embedding, platform risk e copy risk;
- retenção, frequência de uso, churn e expansão;
- tração: receita, clientes, growth, funding, uso e outcomes, quando existirem;
- Brasil: workflow local, concorrentes locais, regulação local, pricing e decisão local/global;
- fatal assumptions, evidência contraditória, dependências externas e unknowns.

Depois do dossiê, pesquise ativamente a web e descubra:
1. quem seria o pagador real no Brasil;
2. tamanho/densidade de compradores ou proxy defensável;
3. workflow atual e workaround;
4. quanto o problema custa ou quanto o cliente já gasta;
5. concorrentes brasileiros e globais relevantes presentes no Brasil;
6. regulação, licenças, lobby, procurement e integrações;
7. preços ou proxies de willingness-to-pay;
8. distribuição/ciclo de venda;
9. se devemos copiar, verticalizar, adaptar profundamente, ou NÃO adaptar e vender globalmente do Brasil;
10. qual é o teste mais barato para matar a tese em <=30 dias.

BLUE OCEAN — obrigatório em TODA tese:
11. defina a arena competitiva real e os fatores em que o setor compete hoje;
12. identifique os 3 tiers de não-clientes: soon-to-be, refusing e unexplored;
13. identifique os principais bloqueios de utilidade ao longo da experiência do comprador;
14. construa ERRC: ELIMINAR, REDUZIR, ELEVAR e CRIAR;
15. avalie se existe VALUE INNOVATION real: salto de utilidade + estrutura de custo melhor;
16. diferencie explicitamente BLUE OCEAN de EMPTY OCEAN. Ausência de concorrentes sem demanda latente comprovável é sinal negativo;
17. proponha exatamente estes 6 sinais 0-10 para o Rust:
    - value_curve_departure
    - noncustomer_unlock
    - utility_leap
    - cost_curve_break
    - new_demand_creation
    - latent_demand_evidence
18. classifique preliminarmente como BLUE_HYPOTHESIS, PURPLE_OCEAN, RED_OCEAN, EMPTY_OCEAN_RISK ou UNKNOWN.

Blue Ocean NÃO pode resgatar uma tese com pagador, capacidade de pagar ou valor fracos.
O objetivo é descobrir criação de demanda e value innovation, não premiar novidade.

V8 — DECISION & RESEARCH OS:
19. construa uma STRATEGY CANVAS com 4–12 fatores reais de competição; compare incumbentes vs tese proposta 0–10;
20. construa um EVIDENCE GRAPH: cada claim importante deve apontar fontes e critérios que suporta/contradiz;
21. liste 2–10 HIPÓTESES CRÍTICAS que ainda não sabemos, com prior probability conservadora e killIfFalse;
22. crie experimentos baratos para essas hipóteses, estimando custo em R$, horas e decisiveness 0–1;
23. priorize experimentos que possam mudar a decisão, não os que apenas aumentam confiança;
24. gere perguntas de Founder Fit apenas para fatos privados que a web não consegue saber (acesso, credibilidade, capital, velocidade de build);
25. não invente Founder Fit: pergunte, não pontue.

SCORING V7/V8 — use esta régua com extrema severidade para TODO score 0-10:
- 0–2: evidência contrária / mecanismo praticamente inexistente.
- 3–4: fraco; abaixo do necessário; tese não deve consumir founder time.
- 5: plausível/mediano, mas sem edge forte.
- 6: interessante, porém comum ou ainda pouco provado.
- 7: FORTE e específico; já merece investigação profunda. Não dê 7 por simpatia.
- 8: RARO; múltiplas evidências independentes e economics/utility muito convincentes.
- 9: EXCEPCIONAL; comportamento comercial/dinheiro real ou evidência quase incontestável.
- 10: praticamente reservado a outcome observado repetível; use rarissimamente.

CAPS DE EVIDÊNCIA:
- hipótese/opinião não deve sustentar >6;
- desk research, benchmarks e mercado público não devem sustentar >7;
- comportamento real de clientes pode sustentar ~7–8;
- compromisso comercial pode sustentar ~8–8.5;
- dinheiro real pode sustentar ~9;
- outcome repetível é necessário para 9.5–10.
Se estiver em dúvida entre duas notas, escolha a MENOR.
Uma tese com vários 8/9 sem evidência comportamental/comercial está mal avaliada.

Priorize fontes oficiais brasileiras, reguladores, associações setoriais, dados de mercado, filings, documentos públicos, páginas de pricing, customer stories e sites de concorrentes.
Use mídia/comunidade somente como complemento.

MÍNIMO PARA ENGINE_READY:
- 12 fontes totais;
- 6 domínios independentes;
- 2 fontes primárias/oficiais;
- 12 claims no evidence graph;
- todos os campos críticos de buyer, problem, economics, market, competition, distribution, product e regulation com status SUPPORTED ou CONFLICTED;
- nenhum UNKNOWN crítico sobre pagador, capacidade de pagar, mecanismo de valor, custo do status quo, WTP/pricing, distribuição ou regulação aplicável.
Se isso não for atingido, o research pode retornar, mas NÃO está pronto para o motor.
Não invente números. Se não encontrar, marque como desconhecido.
Não confunda TAM com disposição a pagar.

Você PODE propor scores preliminares 0-10 para o Rust, mas:
- todo score deve trazer evidência e URLs;
- HYPOTHESIS/DESK_RESEARCH nunca deve ser apresentado como verdade;
- o Rust continua sendo o único responsável pela decisão final;
- se evidência for insuficiente, prefira score conservador + unresolved.

Os critérios podem variar conforme o engine. Não crie critério inexistente se não houver necessidade.
`;

  const result = await generateText({
    model: DEEP_MODEL,
    tools: {
      browserbase_search: gateway.tools.browserbaseSearch({ numResults: 10 }),
      browserbase_fetch: gateway.tools.browserbaseFetch({ allowRedirects: true }),
    },
    stopWhen: isStepCount(30),
    output: Output.object({
      name: "BrazilThesisResearch",
      description:
        "Web-grounded Brazil adaptation and preliminary evidence pack for deterministic thesis evaluation.",
      schema,
    }),
    system: `Você é o Research Orchestrator do Thesis Engine V8.
Você pesquisa; não vende a ideia.
Você é adversarial, econômico e local.
Uma tese YC não ganha pontos por ser YC.
Uma ausência de concorrente pode significar ausência de mercado.
Blue Ocean exige simultaneamente valor para o comprador e lógica econômica/custo, além de nova demanda ou não-clientes plausíveis.
Use URLs reais obtidas nas ferramentas.
O output deve permitir que outro sistema audite cada conclusão.
A V8 separa qualidade da tese de prioridade de atenção. Sua função é produzir as incertezas e experimentos que permitam ao Rust calcular Value of Information.
Não tente adivinhar Founder Fit.`,
    prompt,
  });

  const researchReadiness = auditResearchReadiness(result.output);

  return Response.json({
    model: DEEP_MODEL,
    advisoryOnly: true,
    researchedAt: new Date().toISOString(),
    researchReadiness,
    ...result.output,
  });
}
