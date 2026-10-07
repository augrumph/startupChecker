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
export const maxDuration = 120;

const sourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  publisher: z.string(),
  date: z.string().optional(),
  claim: z.string(),
  authority: z.enum(["OFFICIAL", "INDUSTRY", "COMPANY", "MEDIA", "COMMUNITY", "OTHER"]),
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
  ).max(12),
  regulation: z.array(
    z.object({
      item: z.string(),
      impact: z.enum(["LOW", "MEDIUM", "HIGH"]),
      sourceUrl: z.string().url().optional(),
    }),
  ).max(10),
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
      }),
    ).max(40),
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
  sources: z.array(sourceSchema).min(3).max(30),
  unresolvedUnknowns: z.array(z.string()).max(15),
  researchConfidence: z.number().min(0).max(1),
});

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

Pesquise ativamente a web e descubra:
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

Priorize fontes oficiais brasileiras, reguladores, associações setoriais, dados de mercado e sites de concorrentes.
Use mídia/comunidade somente como complemento.
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
      browserbase_search: gateway.tools.browserbaseSearch({ numResults: 6 }),
      browserbase_fetch: gateway.tools.browserbaseFetch({ allowRedirects: true }),
    },
    stopWhen: isStepCount(14),
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

  return Response.json({
    model: DEEP_MODEL,
    advisoryOnly: true,
    researchedAt: new Date().toISOString(),
    ...result.output,
  });
}
