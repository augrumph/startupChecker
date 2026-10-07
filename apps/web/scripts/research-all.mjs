const WEB_BASE_URL = process.env.WEB_BASE_URL ?? "http://localhost:3000";
const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8080";
const CONCURRENCY = Math.max(1, Number(process.env.RESEARCH_CONCURRENCY ?? "1"));
const FORCE = process.argv.includes("--force");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function json(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${url}: ${text.slice(0, 800)}`);
  return text ? JSON.parse(text) : null;
}


const EVIDENCE_MAP = {
  HYPOTHESIS: "Hypothesis",
  DESK_RESEARCH: "DeskResearch",
  CUSTOMER_BEHAVIOR: "CustomerBehavior",
  COMMERCIAL_COMMITMENT: "CommercialCommitment",
  MONEY: "Money",
  OBSERVED_OUTCOME: "ObservedOutcome",
};

function toSignal(criterion) {
  return {
    score: criterion.score,
    evidence: EVIDENCE_MAP[criterion.evidenceLevel] ?? "Hypothesis",
    quality: criterion.confidence ?? 0.5,
    contradictions: 0,
    note: criterion.rationale ?? null,
  };
}

function signalMap(criteria = []) {
  return Object.fromEntries(criteria.map((criterion) => [criterion.key, toSignal(criterion)]));
}

function applyResearchInterpretation(record, research) {
  record.thesis.universal = signalMap(research.proposedSignals?.universal);
  record.thesis.learning = signalMap(research.proposedSignals?.learning);
  record.thesis.potential = signalMap(research.proposedSignals?.potential);
  record.thesis.blue_ocean = signalMap(research.blueOcean?.proposedSignals);

  record.thesis.experts = Object.fromEntries(
    (research.proposedSignals?.experts ?? []).map((expert) => [
      expert.engine,
      signalMap(expert.criteria),
    ])
  );

  record.thesis.router = Object.fromEntries(
    (research.engineSuggestions ?? []).map((engine) => [
      engine.engine,
      {
        score: engine.affinity,
        evidence: "DeskResearch",
        quality: research.researchConfidence ?? 0.5,
        contradictions: 0,
        note: engine.rationale ?? null,
      },
    ])
  );

  const dossier = research.researchDossier;
  if (dossier) {
    record.thesis.context.payer = dossier.buyer?.economicBuyer?.answer ?? record.thesis.context.payer;
    record.thesis.context.user = dossier.buyer?.endUser?.answer ?? record.thesis.context.user;
    record.thesis.context.problem = dossier.problem?.jobToBeDone?.answer ?? record.thesis.context.problem;
    record.thesis.context.solution = dossier.thesis?.rewrittenPtBr?.answer ?? record.thesis.context.solution;
  }
}

function toEvidenceRecords(research) {
  return (research.evidenceGraph?.claims ?? []).flatMap((claim) =>
    (claim.sourceUrls ?? []).map((url, index) => ({
      id: `${claim.id}-${index + 1}`,
      claim: claim.claim,
      source_kind: claim.sourceKind,
      source_url: url,
      source_title: null,
      published_at_unix: null,
      observed_at_unix: null,
      fetched_at_unix: Math.floor(Date.now() / 1000),
      criterion_keys: claim.criterionKeys ?? [],
      direction: claim.direction === "SUPPORTS" ? "SUPPORTS" : claim.direction === "CONTRADICTS" ? "CONTRADICTS" : "NEUTRAL",
      strength: claim.confidence ?? 0.5,
      reliability: claim.confidence ?? 0.5,
      independence_group: (() => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return null; } })(),
      content_hash: null,
      note: "Research Dossier V1",
    }))
  );
}

async function researchOne(summary) {
  const record = await json(`${API_BASE_URL}/v1/theses/${encodeURIComponent(summary.id)}`);
  const current = record.thesis.research_readiness;
  if (!FORCE && current?.status === "ENGINE_READY") {
    console.log(`SKIP ENGINE_READY ${summary.id}`);
    return { id: summary.id, status: "SKIP" };
  }

  const context = record.thesis.context ?? {};
  const body = {
    name: record.thesis.name,
    tagline: context.solution || context.problem || record.thesis.name,
    category: context.sector || context.area || "",
  };

  console.log(`RESEARCH ${summary.id} :: ${record.thesis.name}`);
  const research = await json(`${WEB_BASE_URL}/api/ai/research`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  record.thesis.research_dossier = {
    ...research.researchDossier,
    _analysis: {
      brazilAdaptation: research.brazilAdaptation,
      blueOcean: research.blueOcean,
      criticalHypotheses: research.criticalHypotheses,
      candidateExperiments: research.candidateExperiments,
      fastestFalsification: research.fastestFalsification,
      researchConfidence: research.researchConfidence,
      sources: research.sources,
    },
  };
  record.thesis.research_readiness = research.researchReadiness;
  applyResearchInterpretation(record, research);
  record.thesis.evidence_records = toEvidenceRecords(research);
  record.thesis.evidence_as_of_unix = Math.floor(Date.now() / 1000);
  record.thesis.context.analysis_status = research.researchReadiness.status;
  record.evaluation = null;
  record.updated_at_unix = Math.floor(Date.now() / 1000);

  await json(`${API_BASE_URL}/v1/theses/${encodeURIComponent(summary.id)}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(record),
  });

  const rr = research.researchReadiness;
  console.log(`DONE ${summary.id} :: ${rr.status} :: ${Math.round(rr.completeness * 100)}% :: sources=${rr.source_count} domains=${rr.independent_domains}`);
  return { id: summary.id, status: rr.status, completeness: rr.completeness };
}

async function worker(queue, results) {
  while (queue.length) {
    const item = queue.shift();
    if (!item) return;
    try {
      results.push(await researchOne(item));
    } catch (error) {
      console.error(`FAIL ${item.id}`, error);
      results.push({ id: item.id, status: "ERROR", error: String(error) });
      await sleep(1500);
    }
  }
}

const all = await json(`${API_BASE_URL}/v1/theses`);
const targets = all;
console.log(`Researching ${targets.length} canonical theses with concurrency=${CONCURRENCY}`);

const queue = [...targets];
const results = [];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue, results)));

const counts = results.reduce((acc, r) => {
  acc[r.status] = (acc[r.status] ?? 0) + 1;
  return acc;
}, {});
console.log(JSON.stringify({ total: results.length, counts }, null, 2));

if (counts.ERROR) process.exitCode = 1;
