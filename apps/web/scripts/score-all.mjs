const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8080";

async function json(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${url}: ${text.slice(0, 1000)}`);
  return text ? JSON.parse(text) : null;
}

const all = await json(`${API_BASE_URL}/v1/theses`);
const targets = all.filter((item) => item.source === "Y Combinator" || item.id.startsWith("yc-"));
const blocked = targets.filter((item) => item.research_status !== "ENGINEREADY" && item.research_status !== "ENGINE_READY");

if (blocked.length) {
  console.error(`REFUSING TO SCORE: ${blocked.length}/${targets.length} theses are not ENGINE_READY.`);
  console.error(blocked.slice(0, 50).map((x) => `${x.id} :: ${x.research_status} :: ${Math.round((x.research_completeness ?? 0) * 100)}%`).join("\n"));
  process.exit(2);
}

for (const summary of targets) {
  const record = await json(`${API_BASE_URL}/v1/theses/${encodeURIComponent(summary.id)}`);
  const evaluation = await json(`${API_BASE_URL}/v1/evaluate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(record.thesis),
  });
  record.evaluation = evaluation;
  record.updated_at_unix = Math.floor(Date.now() / 1000);
  await json(`${API_BASE_URL}/v1/theses/${encodeURIComponent(summary.id)}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(record),
  });
  console.log(`SCORED ${summary.id} :: ${evaluation.thesis_score}`);
}
