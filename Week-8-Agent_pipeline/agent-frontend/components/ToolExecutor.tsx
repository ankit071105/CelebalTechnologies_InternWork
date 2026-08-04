"use client";
import { useState } from "react";
import { Plus, Trash2, Play, Zap, ArrowDown } from "lucide-react";
import { executeTools } from "@/lib/api";

const TOOLS = ["calculator", "keyword_extractor", "general_responder"];

const TOOL_DESC: Record<string, string> = {
  calculator:        "Evaluates math expressions",
  keyword_extractor: "Extracts keywords from text",
  general_responder: "Answers general queries via Groq LLM",
};

interface Row { tool: string; input: string; }

const DEFAULT: Row[] = [
  { tool: "calculator",        input: "25 * 4 + 10" },
  { tool: "keyword_extractor", input: "machine learning neural networks deep learning AI" },
];

export default function ToolExecutor() {
  const [rows, setRows]     = useState<Row[]>(DEFAULT);
  const [mode, setMode]     = useState<"sequential"|"parallel">("sequential");
  const [loading, setLoad]  = useState(false);
  const [result, setResult] = useState<any>(null);

  const addRow    = () => setRows([...rows, { tool: "calculator", input: "" }]);
  const removeRow = (i: number) => setRows(rows.filter((_,idx)=>idx!==i));
  const updateRow = (i: number, f: keyof Row, v: string) => {
    const u=[...rows]; u[i]={...u[i],[f]:v}; setRows(u);
  };

  async function run() {
    const valid = rows.filter(r=>r.input.trim());
    if (!valid.length) return;
    setLoad(true); setResult(null);
    try {
      const d = await executeTools(valid.map(r=>r.tool), valid.map(r=>r.input), mode);
      setResult(d);
    } catch(e:any) { setResult({ error: e.message }); }
    finally { setLoad(false); }
  }

  const card: React.CSSProperties = {
    background:"#fff", border:"1px solid #f0f0f0",
    borderRadius:12, boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <div style={{ marginBottom:8 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:"#0a0a0a", letterSpacing:"-0.03em", marginBottom:4 }}>
          Tool Executor
        </h1>
        <p style={{ fontSize:14, color:"#71717a", lineHeight:1.6 }}>
          Compare sequential and parallel tool execution. Use sequential when tasks depend on each other, parallel when they are independent.
        </p>
      </div>

      {/* Mode picker */}
      <div style={{ ...card, padding:4, display:"inline-flex", gap:2, alignSelf:"flex-start" }}>
        {(["sequential","parallel"] as const).map(m => (
          <button key={m} onClick={()=>setMode(m)} style={{
            display:"flex", alignItems:"center", gap:7,
            padding:"9px 18px", border:"none", borderRadius:9,
            background: mode===m ? "#0a0a0a" : "none",
            color: mode===m ? "#fff" : "#71717a",
            fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit",
            transition:"all 0.15s",
          }}>
            {m==="sequential" ? <ArrowDown size={13} strokeWidth={2}/> : <Zap size={13} strokeWidth={2}/>}
            {m.charAt(0).toUpperCase()+m.slice(1)}
          </button>
        ))}
      </div>
      <p style={{ fontSize:12, color:"#a1a1aa", marginTop:-16 }}>
        {mode==="sequential"
          ? "Tasks run one after the other. Each step waits for the previous to complete."
          : "Tasks run at the same time. Total duration ≈ slowest individual task."}
      </p>

      {/* Tool rows */}
      <div style={card}>
        <div style={{ padding:"14px 20px", borderBottom:"1px solid #f0f0f0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", color:"#a1a1aa" }}>Tool calls</span>
          <button onClick={addRow} style={{
            display:"flex", alignItems:"center", gap:5,
            background:"none", border:"1px solid #e4e4e7", borderRadius:6,
            padding:"4px 10px", fontSize:12, color:"#52525b", cursor:"pointer", fontFamily:"inherit",
          }}>
            <Plus size={12} strokeWidth={2}/> Add tool
          </button>
        </div>
        {rows.map((row,i)=>(
          <div key={i} style={{
            padding:"12px 20px", borderBottom:"1px solid #f9f9f9",
            display:"flex", alignItems:"center", gap:10,
          }}>
            <span style={{ fontSize:12, color:"#d1d1d6", width:18, textAlign:"center" }}>{i+1}</span>
            <div style={{ position:"relative", flexShrink:0 }}>
              <select value={row.tool} onChange={e=>updateRow(i,"tool",e.target.value)} style={{
                background:"#fafafa", border:"1px solid #e4e4e7", borderRadius:7,
                padding:"8px 12px", fontSize:12, color:"#0a0a0a", fontFamily:"inherit",
                outline:"none", cursor:"pointer", width:190,
              }}>
                {TOOLS.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ fontSize:11, color:"#a1a1aa", flexShrink:0, width:160 }}>
              {TOOL_DESC[row.tool]}
            </div>
            <input value={row.input} onChange={e=>updateRow(i,"input",e.target.value)}
              placeholder="Input for this tool…"
              style={{
                flex:1, background:"#fafafa", border:"1px solid #e4e4e7", borderRadius:7,
                padding:"8px 12px", fontSize:13, color:"#0a0a0a", fontFamily:"inherit", outline:"none",
              }}
              onFocus={e=>{ e.target.style.borderColor="#0a0a0a"; }}
              onBlur={e=>{ e.target.style.borderColor="#e4e4e7"; }}
            />
            <button onClick={()=>removeRow(i)} style={{
              background:"none", border:"none", cursor:"pointer", color:"#d1d1d6", padding:4, display:"flex",
            }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color="#dc2626"; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color="#d1d1d6"; }}>
              <Trash2 size={14} strokeWidth={2}/>
            </button>
          </div>
        ))}
        <div style={{ padding:"14px 20px" }}>
          <button onClick={run} disabled={loading} style={{
            display:"flex", alignItems:"center", gap:8,
            padding:"10px 20px", border:"none", borderRadius:8,
            background: loading ? "#f4f4f5" : "#0a0a0a",
            color: loading ? "#a1a1aa" : "#fff",
            fontSize:13, fontWeight:600, cursor:loading?"not-allowed":"pointer", fontFamily:"inherit",
            transition:"all 0.15s",
          }}>
            {loading ? <><span className="spinner-white"/> Running…</> : <><Play size={13} strokeWidth={2}/> Execute ({mode})</>}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && !result.error && (
        <div className="stagger" style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Summary */}
          <div style={{ ...card, padding:"14px 20px", display:"flex", alignItems:"center", gap:16 }}>
            <div>
              <div style={{ fontSize:11, color:"#a1a1aa", marginBottom:2 }}>Mode</div>
              <div style={{ fontSize:14, fontWeight:700, color:mode==="parallel"?"#16a34a":"#1d4ed8" }}>
                {result.mode}
              </div>
            </div>
            <div style={{ width:1, height:32, background:"#f0f0f0" }}/>
            <div>
              <div style={{ fontSize:11, color:"#a1a1aa", marginBottom:2 }}>Total duration</div>
              <div style={{ fontSize:14, fontWeight:700, color:"#0a0a0a" }}>{result.total_duration_ms} ms</div>
            </div>
            <div style={{ width:1, height:32, background:"#f0f0f0" }}/>
            <div>
              <div style={{ fontSize:11, color:"#a1a1aa", marginBottom:2 }}>Tools executed</div>
              <div style={{ fontSize:14, fontWeight:700, color:"#0a0a0a" }}>{result.results?.length}</div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ ...card, padding:20 }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", color:"#a1a1aa", marginBottom:16 }}>
              Execution timeline
            </div>
            {result.results?.map((r:any,i:number) => {
              const pct = Math.max(6, Math.round((r.duration_ms/result.total_duration_ms)*100));
              const offset = mode==="sequential"
                ? result.results.slice(0,i).reduce((a:number,x:any)=>a+Math.max(6,Math.round((x.duration_ms/result.total_duration_ms)*100)),0)
                : 0;
              return (
                <div key={i} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}>
                    <span style={{ color:"#27272a", fontWeight:500 }}>{r.tool}</span>
                    <span style={{ color:"#a1a1aa" }}>{r.duration_ms} ms</span>
                  </div>
                  <div style={{ height:28, background:"#f9f9f9", borderRadius:6, position:"relative", overflow:"hidden", border:"1px solid #f0f0f0" }}>
                    <div style={{
                      position:"absolute", left:`${offset}%`, width:`${pct}%`, height:"100%",
                      background: mode==="parallel" ? "#dcfce7" : "#dbeafe",
                      borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"width 0.5s ease",
                    }}>
                      <span style={{ fontSize:10, fontWeight:700, color: mode==="parallel"?"#15803d":"#1d4ed8" }}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Per-tool output */}
          {result.results?.map((r:any,i:number)=>(
            <div key={i} style={{ ...card, padding:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <span style={{ fontSize:13, fontWeight:600, color:"#0a0a0a" }}>{r.tool}</span>
                <span style={{
                  fontSize:11, padding:"2px 9px", borderRadius:99, fontWeight:600,
                  background: r.status==="success"?"#f0fdf4":"#fef2f2",
                  color: r.status==="success"?"#16a34a":"#dc2626",
                  border: `1px solid ${r.status==="success"?"#bbf7d0":"#fecaca"}`,
                }}>{r.status}</span>
                <span style={{ marginLeft:"auto", fontSize:12, color:"#a1a1aa" }}>{r.duration_ms} ms</span>
              </div>
              <pre style={{
                fontSize:12, color:"#27272a", background:"#fafafa",
                border:"1px solid #f0f0f0", borderRadius:8, padding:14,
                overflow:"auto", margin:0, lineHeight:1.6,
                fontFamily:"'JetBrains Mono', ui-monospace, monospace",
              }}>
                {JSON.stringify(r.result??r.keywords??r.response??r, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      {result?.error && (
        <div style={{ ...card, padding:16, border:"1px solid #fecaca", background:"#fef2f2" }}>
          <p style={{ fontSize:13, color:"#dc2626", margin:0 }}>{result.error}</p>
        </div>
      )}
    </div>
  );
}
