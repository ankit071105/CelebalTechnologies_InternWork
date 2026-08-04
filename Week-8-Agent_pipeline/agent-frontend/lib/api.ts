const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function runAgent(query: string) {
  const res = await fetch(`${BASE_URL}/agent/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error("Agent run failed");
  return res.json();
}

export async function routeQuery(query: string) {
  const res = await fetch(`${BASE_URL}/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error("Route failed");
  return res.json();
}

export async function executeTools(tools: string[], inputs: string[], mode: "sequential" | "parallel") {
  const res = await fetch(`${BASE_URL}/tools/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tools, inputs, mode }),
  });
  if (!res.ok) throw new Error("Tool execution failed");
  return res.json();
}

export async function getToolSchemas() {
  const res = await fetch(`${BASE_URL}/tools/schemas`);
  if (!res.ok) throw new Error("Schema fetch failed");
  return res.json();
}

export async function getMetrics() {
  const res = await fetch(`${BASE_URL}/metrics`);
  if (!res.ok) throw new Error("Metrics fetch failed");
  return res.json();
}

export async function getGraphDefinition() {
  const res = await fetch(`${BASE_URL}/graph/definition`);
  if (!res.ok) throw new Error("Graph fetch failed");
  return res.json();
}
