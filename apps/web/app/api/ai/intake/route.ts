import {
  FAST_MODEL,
  Output,
  engineKeys,
  generateText,
  z,
} from "@/lib/ai";

export const runtime = "nodejs";

const schema = z.object({
  normalized: z.object({
    name: z.string(),
    sector: z.string(),
    payer: z.string(),
    user: z.string(),
    problem: z.string(),
    solution: z.string(),
    businessModels: z.array(z.string()).max(4),
  }),
  engineSuggestions: z
    .array(
      z.object({
        engine: z.enum(engineKeys),
        affinity: z.number().min(0).max(10),
        rationale: z.string(),
      }),
    )
    .max(6),
  assumptions: z
    .array(
      z.object({
        statement: z.string(),
        whyItMatters: z.string(),
        evidenceNeeded: z.string(),
      }),
    )
    .max(8),
  unknowns: z.array(z.string()).max(8),
  firstQuestions: z.array(z.string()).max(8),
});

export async function POST(request: Request) {
  const body = await request.json();
  const text = String(body?.text ?? "").trim();

  if (text.length < 20) {
    return Response.json(
      { error: "Envie uma descrição mais completa da tese." },
      { status: 400 },
    );
  }

  const result = await generateText({
    model: FAST_MODEL,
    output: Output.object({
      name: "StartupThesisIntake",
      description:
        "Normalize a startup thesis without deciding whether it is good or bad.",
      schema,
    }),
    system: `Você é o intake analyst do Thesis Engine V5.
Sua função é SOMENTE estruturar linguagem humana e localizar lacunas.
Você NÃO decide se a tese é boa, NÃO aplica vetos e NÃO dá nota final.
Engine affinity serve apenas para classificar mecanismos de valor.
Não invente mercado, receita, budget, WTP ou evidência que o usuário não forneceu.
Quando algo estiver ausente, coloque em unknowns/assumptions.`,
    prompt: `Estruture esta tese para avaliação determinística posterior:

${text}`,
  });

  return Response.json({
    model: FAST_MODEL,
    advisoryOnly: true,
    ...result.output,
  });
}
