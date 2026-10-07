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
    system: `Você é o Research Orchestrator do Thesis Engine V5.
Você pesquisa; não vende a ideia.
Você é adversarial, econômico e local.
Uma tese YC não ganha pontos por ser YC.
Uma ausência de concorrente pode significar ausência de mercado.
Use URLs reais obtidas nas ferramentas.
O output deve permitir que outro sistema audite cada conclusão.`,
    prompt,
  });

  return Response.json({
    model: DEEP_MODEL,
    advisoryOnly: true,
    researchedAt: new Date().toISOString(),
    ...result.output,
  });
}
