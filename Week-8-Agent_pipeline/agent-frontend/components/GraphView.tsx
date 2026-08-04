"use client";
import { useEffect, useState } from "react";
import { getGraphDefinition } from "@/lib/api";

const POS: Record<string, { x: number; y: number }> = {
  start:              { x: 380, y: 38 },
  query_analyzer:     { x: 380, y: 118 },
  router:             { x: 380, y: 208 },
  calculator:         { x: 120, y: 316 },
  keyword_extractor:  { x: 380, y: 316 },
  general_responder:  { x: 640, y: 316 },
  tool_executor:      { x: 380, y: 424 },
  response_generator: { x: 380, y: 514 },
  end:                { x: 380, y: 604 },
};

export default function GraphView() {
  const [graph, setGraph]   = useState<any>(null);
  const [hovered, setHov]   = useState<string | null>(null);

  useEffect(() => { getGraphDefinition().then(setGraph); }, []);

  const card: React.CSSProperties = {
    background: "#fff", border: "1px solid #f0f0f0",
    borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0a0a0a", letterSpacing: "-0.03em", marginBottom: 4 }}>
          Pipeline Graph
        </h1>
        <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.6 }}>
          Stateful directed graph that executes on every query. Hover any node to see its role. The dashed edge is the retry loop (cycle).
        </p>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {[
          { stroke: "#d1d1d6", fill: "#f9f9f9", label: "Terminal" },
          { stroke: "#0a0a0a", fill: "#fff",    label: "Processing node" },
          { stroke: "#d1d1d6", fill: "#fafafa", label: "Tool node" },
          { stroke: "#d97706", fill: "none",    label: "Retry loop", dashed: true },
        ].map(({ stroke, fill, label, dashed }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#71717a" }}>
            {dashed
              ? <div style={{ width: 22, height: 0, borderTop: "2px dashed #d97706" }} />
              : <div style={{ width: 14, height: 14, border: `1.5px solid ${stroke}`, borderRadius: 3, background: fill }} />
            }
            {label}
          </div>
        ))}
      </div>

      {/* Graph */}
      <div style={{ ...card, padding: 20, overflowX: "auto" }}>
        {!graph ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 60, color: "#a1a1aa", fontSize: 13 }}>
            <span className="spinner" /> Loading graph…
          </div>
        ) : (
          <svg width={800} height={650} viewBox="0 0 800 650" style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
            <defs>
              <marker id="arr"       markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#d1d1d6" />
              </marker>
              <marker id="arr-retry" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#d97706" />
              </marker>
            </defs>

            {/* Edges */}
            {graph.edges?.map((e: any, i: number) => {
              const f = POS[e.from]; const t = POS[e.to];
              if (!f || !t) return null;
              const isRetry = e.style === "dashed";
              const d = isRetry
                ? `M ${f.x+80} ${f.y} C ${f.x+210} ${f.y-30} ${t.x+210} ${t.y+30} ${t.x+80} ${t.y}`
                : `M ${f.x} ${f.y+20} L ${t.x} ${t.y-20}`;
              const mx = (f.x+t.x)/2, my = (f.y+t.y)/2;
              return (
                <g key={i}>
                  <path d={d} fill="none"
                    stroke={isRetry ? "#f59e0b" : "#e4e4e7"} strokeWidth={1.5}
                    strokeDasharray={isRetry ? "5,4" : undefined}
                    markerEnd={isRetry ? "url(#arr-retry)" : "url(#arr)"} />
                  {!isRetry && e.label && (
                    <text x={mx+8} y={my} fill="#d1d1d6" fontSize={9}
                      fontFamily="Inter, sans-serif" textAnchor="middle">{e.label}</text>
                  )}
                  {isRetry && (
                    <text x={f.x+230} y={(f.y+t.y)/2} fill="#d97706" fontSize={9}
                      fontFamily="Inter, sans-serif">retry (on fail)</text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {graph.nodes?.map((node: any) => {
              const pos = POS[node.id];
              if (!pos) return null;
              const isHov = hovered === node.id;
              const isTerm = node.type === "terminal";
              const isTool = node.type === "tool";
              const w = 160, h = 38;
              return (
                <g key={node.id}
                  transform={`translate(${pos.x-w/2}, ${pos.y-h/2})`}
                  onMouseEnter={() => setHov(node.id)}
                  onMouseLeave={() => setHov(null)}
                  style={{ cursor: "pointer" }}>
                  <rect width={w} height={h} rx={isTerm ? 19 : 8}
                    fill={isHov ? "#0a0a0a" : isTerm ? "#f4f4f5" : "#fff"}
                    stroke={isHov ? "#0a0a0a" : isTerm ? "#e4e4e7" : isTool ? "#e4e4e7" : "#0a0a0a"}
                    strokeWidth={isHov ? 1.5 : isTool ? 1 : isTerm ? 1 : 1.5}
                    style={{ filter: isHov ? "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" : "none", transition: "all 0.18s" }}
                  />
                  <text x={w/2} y={h/2+4} textAnchor="middle"
                    fill={isHov ? "#fff" : isTerm ? "#71717a" : "#0a0a0a"}
                    fontSize={11} fontFamily="Inter, sans-serif" fontWeight="500"
                    style={{ transition: "fill 0.18s" }}>
                    {node.label}
                  </text>
                  {isHov && node.description && (
                    <g transform={`translate(${w/2-95}, ${h+6})`}>
                      <rect width={190} height={30} rx={6} fill="#0a0a0a"
                        style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.18))" }} />
                      <text x={95} y={19} textAnchor="middle" fill="#e4e4e7"
                        fontSize={9.5} fontFamily="Inter, sans-serif">{node.description}</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Node reference table */}
      {graph && (
        <div style={card}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0" }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#a1a1aa" }}>
              Node reference
            </span>
          </div>
          {graph.nodes?.filter((n: any) => n.type !== "terminal").map((node: any, i: number, arr: any[]) => (
            <div key={node.id} style={{
              padding: "14px 20px",
              borderBottom: i < arr.length-1 ? "1px solid #f9f9f9" : "none",
              display: "flex", gap: 14, alignItems: "flex-start",
            }}>
              <span style={{
                fontSize: 11, padding: "2px 9px", borderRadius: 99,
                border: "1px solid #e4e4e7", color: "#52525b", background: "#fafafa",
                marginTop: 1, flexShrink: 0, fontWeight: 500,
              }}>{node.type}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0a0a0a", marginBottom: 2 }}>{node.label}</div>
                <div style={{ fontSize: 12, color: "#71717a" }}>{node.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
