import {
  FAST_MODEL,
  Output,
  evidenceLevels,
  generateText,
  z,
} from "@/lib/ai";

export const runtime = "nodejs";

const criterionSchema = z.object({
  key: z.string(),
  label: z.string(),
  scope: z.string(),
});

const schema = z.object({
  findings: z
    .array(
      z.object({
        criterionKey: z.string(),
        direction: z.enum(["SUPPORTS", "CONTRADICTS", "NEUTRAL"]),
        evidenceLevel: z.enum(evidenceLevels),
        strength: z.number().min(0).max(1),
        rationale: z.string(),
        sourceFragment: z.string().max(260),
      }),
    )
    .max(20),
  unresolved: z.array(z.string()).max(12),
  warnings: z.array(z.string()).max(8),
});

export async function POST(request: Request) {
  const body = await request.json();
  const text = String(body?.text ?? "").trim();
  const criteria = z.array(criterionSchema).parse(body?.criteria ?? []);

  if (text.length < 20 || criteria.length === 0) {
    return Response.json(
      { error: "Envie evidência em texto e os critérios a mapear." },
      { status: 400 },
    );
  }

  const result = await generateText({
    model: FAST_MODEL,
    output: Output.object({
      name: "EvidenceMapping",
      description:
        "Map user-supplied evidence to thesis criteria without changing deterministic scores.",
      schema,
    }),
    system: `Você é o evidence mapper do Thesis Engine V5.
Mapeie APENAS afirmações sustentadas pelo texto fornecido.
Não altere scores, não decida a tese e não invente evidência.
Use CUSTOMER_BEHAVIOR apenas para comportamento real relatado/observado;
COMMERCIAL_COMMITMENT para proposta/preço/LOI/piloto negociado;
MONEY somente quando houve dinheiro real;
OBSERVED_OUTCOME somente quando existe resultado observado após entrega.
sourceFragment deve ser curto e fiel ao material fornecido.`,
    prompt: `CRITÉRIOS:
${JSON.stringify(criteria, null, 2)}

EVIDÊNCIA:
${text}`,
  });

  return Response.json({
    model: FAST_MODEL,
    advisoryOnly: true,
    ...result.output,
  });
}
