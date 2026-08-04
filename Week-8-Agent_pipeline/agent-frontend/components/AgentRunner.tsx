"use client";
import { useState } from "react";
import { Send, CheckCircle, XCircle, AlertCircle, ChevronRight } from "lucide-react";
import { runAgent, routeQuery } from "@/lib/api";

const EXAMPLES = [
  "Calculate 25 * 4 + 100 / 5",
  "Extract keywords from: Machine learning enables computers to learn patterns from data",
  "What is a neural network?",
  "Compute 144 / 12 + 8",
  "What are the benefits of using FastAPI?",
];

const ROUTE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  calculator:        { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  keyword_extractor: { bg: "#fdf4ff", color: "#7e22ce", border: "#e9d5ff" },
  general_responder: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
};

const NODE_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  QueryAnalyzer:     { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
  ConditionalRouter: { bg: "#fefce8", border: "#fde68a", color: "#92400e" },
  ToolExecutor:      { bg: "#fdf4ff", border: "#e9d5ff", color: "#7e22ce" },
  ResponseGenerator: { bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d" },
};

const NODE_LABELS: Record<string, string> = {
  QueryAnalyzer:     "Query Analyzer",
  ConditionalRouter: "Conditional Router",
  ToolExecutor:      "Tool Executor",
  ResponseGenerator: "Response Generator",
};

export default function AgentRunner() {
  const [query, setQuery]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState<any>(null);
  const [routeInfo, setRouteInfo]       = useState<any>(null);
  const [error, setError]               = useState<string | null>(null);
  const [statusMsg, setStatusMsg]       = useState("");

  async function handleRun() {
    if (!query.trim() || loading) return;
    setLoading(true); setError(null); setResult(null); setRouteInfo(null);
    try {
      setStatusMsg("Analyzing query...");
      const r = await routeQuery(query);
      setRouteInfo(r);
      setStatusMsg("Executing agent pipeline...");
      const d = await runAgent(query);
      setResult(d);
    } catch (e: any) {
      setError(e.message || "Backend unreachable. Make sure FastAPI is running on port 8000.");
    } finally { setLoading(false); setStatusMsg(""); }
  }

  const rc = result ? (ROUTE_COLORS[result.route] || ROUTE_COLORS.general_responder) : null;

  // card style
  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #f0f0f0",
    borderRadius: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.07em", color: "#a1a1aa", marginBottom: 12,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Page title */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0a0a0a", letterSpacing: "-0.03em", marginBottom: 4 }}>
          Run Agent
        </h1>
        <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.6 }}>
          Send a query through the stateful agent pipeline. The system routes it, picks the right tool, and returns a traced response.
        </p>
      </div>

      {/* Input card */}
      <div style={{ ...card, padding: 20, marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleRun()}
            placeholder="Enter a query — math, keyword extraction, or any question…"
            style={{
              flex: 1, padding: "11px 14px",
              background: "#fafafa", border: "1px solid #e4e4e7",
              borderRadius: 8, fontSize: 14, color: "#0a0a0a",
              fontFamily: "inherit", outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={e => { e.target.style.borderColor = "#0a0a0a"; e.target.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.06)"; }}
            onBlur={e => { e.target.style.borderColor = "#e4e4e7"; e.target.style.boxShadow = "none"; }}
          />
          <button
            onClick={handleRun}
            disabled={loading || !query.trim()}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "11px 20px",
              background: loading || !query.trim() ? "#f4f4f5" : "#0a0a0a",
              color: loading || !query.trim() ? "#a1a1aa" : "#fff",
              border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: loading || !query.trim() ? "not-allowed" : "pointer",
              fontFamily: "inherit", transition: "all 0.15s", whiteSpace: "nowrap",
            }}
          >
            {loading
              ? <><span className="spinner-white" /> {statusMsg || "Running…"}</>
              : <><Send size={13} strokeWidth={2} /> Run</>
            }
          </button>
        </div>

        {/* Example queries */}
        <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#a1a1aa", marginRight: 4 }}>Examples</span>
          {EXAMPLES.map(ex => (
            <button key={ex} onClick={() => setQuery(ex)} style={{
              background: "none", border: "1px solid #e4e4e7", borderRadius: 6,
              padding: "4px 10px", fontSize: 12, color: "#52525b", cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.12s", maxWidth: 300,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fafafa"; (e.currentTarget as HTMLElement).style.color = "#0a0a0a"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "#52525b"; }}
            >{ex}</button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="fade-up" style={{ ...card, padding: 16, border: "1px solid #fecaca", background: "#fef2f2", display: "flex", gap: 10 }}>
          <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>Request failed</div>
            <div style={{ fontSize: 12, color: "#991b1b", marginTop: 2 }}>{error}</div>
          </div>
        </div>
      )}

      {/* Route info */}
      {routeInfo && (
        <div className="slide-right" style={{ ...card, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <ChevronRight size={14} color="#a1a1aa" />
          <span style={{ fontSize: 12, color: "#71717a" }}>Routed to</span>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 99,
            background: ROUTE_COLORS[routeInfo.route]?.bg || "#f4f4f5",
            color: ROUTE_COLORS[routeInfo.route]?.color || "#27272a",
            border: `1px solid ${ROUTE_COLORS[routeInfo.route]?.border || "#e4e4e7"}`,
          }}>{routeInfo.route}</span>
          <span style={{ fontSize: 12, color: "#a1a1aa" }}>— {routeInfo.rule}</span>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Status row */}
          <div style={{ ...card, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {result.status === "completed"
              ? <CheckCircle size={15} color="#16a34a" />
              : <XCircle size={15} color="#dc2626" />}
            <span style={{ fontSize: 13, fontWeight: 600, color: result.status === "completed" ? "#16a34a" : "#dc2626" }}>
              {result.status === "completed" ? "Completed" : "Failed"}
            </span>
            <div style={{ width: 1, height: 14, background: "#e4e4e7" }} />
            <span style={{
              fontSize: 12, fontWeight: 500, padding: "2px 10px", borderRadius: 99,
              background: rc?.bg, color: rc?.color, border: `1px solid ${rc?.border}`,
            }}>{result.route}</span>
            <div style={{ width: 1, height: 14, background: "#e4e4e7" }} />
            <span style={{ fontSize: 12, color: "#71717a" }}>{result.duration_ms} ms</span>
            {result.retries > 0 && <>
              <div style={{ width: 1, height: 14, background: "#e4e4e7" }} />
              <span style={{ fontSize: 12, color: "#d97706" }}>{result.retries} retries</span>
            </>}
          </div>

          {/* Answer */}
          <div style={{ ...card, padding: 20 }}>
            <div style={sectionLabel}>Response</div>
            <p style={{ fontSize: 15, fontWeight: 500, color: "#0a0a0a", lineHeight: 1.7, margin: 0 }}>
              {result.final_response}
            </p>
          </div>

          {/* Trajectory */}
          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={sectionLabel}>Trajectory · {result.trajectory?.length} steps</div>
              <span style={{ fontSize: 11, color: "#a1a1aa" }}>Full execution trace</span>
            </div>
            <div>
              {result.trajectory?.map((step: any, i: number) => {
                const ns = NODE_STYLES[step.node] || { bg: "#fafafa", border: "#e4e4e7", color: "#27272a" };
                const label = NODE_LABELS[step.node] || step.node;
                return (
                  <div key={i} className="step-in" style={{ animationDelay: `${i * 70}ms`, display: "flex", gap: 14 }}>
                    {/* Timeline */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: ns.bg, border: `1.5px solid ${ns.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, color: ns.color,
                      }}>{i + 1}</div>
                      {i < result.trajectory.length - 1 && (
                        <div style={{ width: 1, height: 28, background: "#f0f0f0", margin: "3px 0" }} />
                      )}
                    </div>
                    {/* Text */}
                    <div style={{ paddingTop: 5, paddingBottom: i < result.trajectory.length - 1 ? 0 : 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0a0a0a" }}>{label}</span>
                        {step.status === "retry" && (
                          <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 99, background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", fontWeight: 600 }}>
                            RETRY
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: "#71717a", margin: "0 0 20px 0", lineHeight: 1.5 }}>{step.action}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !result && !error && (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#a1a1aa" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f4f4f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Send size={20} color="#a1a1aa" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#52525b", marginBottom: 6 }}>No results yet</div>
          <div style={{ fontSize: 13 }}>Enter a query above and press Run</div>
        </div>
      )}
    </div>
  );
}
