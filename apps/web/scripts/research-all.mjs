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

  record.thesis.research_dossier = research.researchDossier;
  record.thesis.research_readiness = research.researchReadiness;
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
const targets = all.filter((item) => item.source === "Y Combinator" || item.id.startsWith("yc-"));
console.log(`Researching ${targets.length} YC theses with concurrency=${CONCURRENCY}`);

const queue = [...targets];
const results = [];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue, results)));

const counts = results.reduce((acc, r) => {
  acc[r.status] = (acc[r.status] ?? 0) + 1;
  return acc;
}, {});
console.log(JSON.stringify({ total: results.length, counts }, null, 2));

if (counts.ERROR) process.exitCode = 1;
