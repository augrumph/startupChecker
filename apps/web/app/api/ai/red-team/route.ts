import {
  DEEP_MODEL,
  Output,
  generateText,
  z,
} from "@/lib/ai";

export const runtime = "nodejs";

const schema = z.object({
  attacks: z
    .array(
      z.object({
        assumption: z.string(),
        failureMode: z.string(),
        whyItCouldBeWrong: z.string(),
        cheapestFalsification: z.string(),
        severity: z.number().int().min(1).max(5),
      }),
    )
    .min(3)
    .max(6),
  blindSpots: z.array(z.string()).max(8),
  strongestCounterCase: z.string(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const thesis = body?.thesis;
  const evaluation = body?.evaluation;

  if (!thesis || !evaluation) {
    return Response.json(
      { error: "Envie a tese e a avaliação determinística." },
      { status: 400 },
    );
  }

  const result = await generateText({
    model: DEEP_MODEL,
    output: Output.object({
      name: "ThesisRedTeam",
      description:
        "Adversarial review of a deterministic startup thesis evaluation.",
      schema,
    }),
    system: `Você é o red-team analyst do Thesis Engine V5.
Sua função é procurar razões concretas pelas quais a tese ou a avaliação determinística pode estar errada.
Você NÃO pode alterar Decision, veto, score ou threshold do Rust.
Priorize premissas de score alto com evidência baixa, causalidade fraca, WTP não provado,
confusão entre usuário e pagador, seleção enviesada de entrevistas e gargalos de distribuição.
Cada ataque deve terminar em um teste barato/falsificável, não em opinião genérica.`,
    prompt: `TESE:
${JSON.stringify(thesis, null, 2)}

AVALIAÇÃO RUST:
${JSON.stringify(evaluation, null, 2)}

Faça um red-team agressivo e específico.`,
  });

  return Response.json({
    model: DEEP_MODEL,
    advisoryOnly: true,
    ...result.output,
  });
}
