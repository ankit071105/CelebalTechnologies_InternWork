"use client";
import { useState } from "react";
import { Play, GitBranch, Wrench, FileCode, BarChart2, Zap } from "lucide-react";
import AgentRunner from "@/components/AgentRunner";
import GraphView from "@/components/GraphView";
import ToolExecutor from "@/components/ToolExecutor";
import ToolSchemas from "@/components/ToolSchemas";
import MetricsDashboard from "@/components/MetricsDashboard";

const TABS = [
  { id: "agent",   label: "Run Agent",    Icon: Play },
  { id: "graph",   label: "Pipeline",     Icon: GitBranch },
  { id: "tools",   label: "Tool Executor",Icon: Wrench },
  { id: "schemas", label: "Schemas",      Icon: FileCode },
  { id: "metrics", label: "Metrics",      Icon: BarChart2 },
];

export default function Home() {
  const [active, setActive] = useState("agent");

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>

      {/* ── Navbar ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #f0f0f0",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>

          {/* Top row */}
          <div style={{ display: "flex", alignItems: "center", height: 60, gap: 10 }}>
            {/* Logo mark */}
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "#0a0a0a",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Zap size={14} color="#fff" strokeWidth={2.5} />
            </div>

            <div style={{ lineHeight: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0a0a0a", letterSpacing: "-0.02em" }}>
                Nexus
              </div>
              <div style={{ fontSize: 11, color: "#a1a1aa", marginTop: 2, fontWeight: 400 }}>
                Agent Pipeline
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 20, background: "#e4e4e7", marginLeft: 6 }} />

            <div style={{ fontSize: 12, color: "#71717a" }}>

            </div>

            {/* Right side */}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
       
        
            </div>
          </div>

          {/* Tab row */}
          <div style={{ display: "flex", gap: 0, marginTop: 0 }}>
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "10px 16px",
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 500,
                  color: active === id ? "#0a0a0a" : "#71717a",
                  borderBottom: `2px solid ${active === id ? "#0a0a0a" : "transparent"}`,
                  transition: "color 0.15s, border-color 0.15s",
                  marginBottom: -1,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { if (active !== id) (e.currentTarget as HTMLElement).style.color = "#27272a"; }}
                onMouseLeave={e => { if (active !== id) (e.currentTarget as HTMLElement).style.color = "#71717a"; }}
              >
                <Icon size={13} strokeWidth={2} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Page body ── */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 28px 100px" }}>
        <div className="fade-up" key={active}>
          {active === "agent"   && <AgentRunner />}
          {active === "graph"   && <GraphView />}
          {active === "tools"   && <ToolExecutor />}
          {active === "schemas" && <ToolSchemas />}
          {active === "metrics" && <MetricsDashboard />}
        </div>
      </main>
    </div>
  );
}
