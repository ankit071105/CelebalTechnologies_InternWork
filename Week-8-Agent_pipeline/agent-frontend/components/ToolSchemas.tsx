"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, FileCode } from "lucide-react";
import { getToolSchemas } from "@/lib/api";

export default function ToolSchemas() {
  const [schemas, setSchemas]   = useState<any>(null);
  const [expanded, setExpanded] = useState<Record<string,boolean>>({});

  useEffect(()=>{ getToolSchemas().then(setSchemas); },[]);

  const tools = schemas ? Object.values(schemas.schemas) as any[] : [];

  const card: React.CSSProperties = {
    background:"#fff", border:"1px solid #f0f0f0",
    borderRadius:12, boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <div style={{ marginBottom:8 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:"#0a0a0a", letterSpacing:"-0.03em", marginBottom:4 }}>
          JSON Schemas
        </h1>
        <p style={{ fontSize:14, color:"#71717a", lineHeight:1.6 }}>
          Each tool defines a typed input and output schema. This validates data before execution and keeps agent-tool communication structured and predictable.
        </p>
      </div>

      {/* Why banner */}
      <div style={{ ...card, padding:20, borderLeft:"3px solid #0a0a0a" }}>
        <div style={{ fontSize:13, fontWeight:600, color:"#0a0a0a", marginBottom:12 }}>Why JSON schemas?</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[
            "Validate inputs before tool execution begins",
            "Ensure outputs are consistent and parseable",
            "Allow agents to reason about tool capabilities",
            "Reduce errors at agent-tool boundaries",
          ].map(t=>(
            <div key={t} style={{ display:"flex", gap:8, fontSize:13, color:"#52525b" }}>
              <span style={{ color:"#0a0a0a", fontWeight:700, flexShrink:0 }}>—</span>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Schemas */}
      {!schemas ? (
        <div style={{ display:"flex", alignItems:"center", gap:10, color:"#a1a1aa", fontSize:13, padding:20 }}>
          <span className="spinner"/> Loading schemas…
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {tools.map((tool:any)=>{
            const open = expanded[tool.name];
            return (
              <div key={tool.name} style={card}>
                <button
                  onClick={()=>setExpanded({...expanded,[tool.name]:!open})}
                  style={{
                    width:"100%", padding:"16px 20px",
                    display:"flex", alignItems:"center", gap:12,
                    background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", textAlign:"left",
                    transition:"background 0.15s",
                  }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background="#fafafa"; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background="none"; }}
                >
                  <div style={{ width:32, height:32, borderRadius:8, background:"#f4f4f5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <FileCode size={15} color="#52525b" strokeWidth={2}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#0a0a0a", marginBottom:2 }}>{tool.name}</div>
                    <div style={{ fontSize:12, color:"#71717a" }}>{tool.description}</div>
                  </div>
                  {open ? <ChevronDown size={16} color="#a1a1aa"/> : <ChevronRight size={16} color="#a1a1aa"/>}
                </button>

                {open && (
                  <div className="fade-in" style={{ borderTop:"1px solid #f0f0f0", padding:20, display:"flex", flexDirection:"column", gap:20 }}>
                    {[
                      { title:"Input Schema", color:"#1d4ed8", schema:tool.input_schema },
                      { title:"Output Schema", color:"#15803d", schema:tool.output_schema },
                    ].map(({ title, color, schema })=>(
                      <div key={title}>
                        <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", color, marginBottom:10 }}>
                          {title}
                        </div>
                        <pre style={{
                          fontSize:12, color:"#27272a", background:"#fafafa",
                          border:"1px solid #f0f0f0", borderRadius:8,
                          padding:16, overflow:"auto", margin:0, lineHeight:1.7,
                          fontFamily:"'JetBrains Mono', ui-monospace, monospace",
                        }}>
                          {JSON.stringify(schema, null, 2)}
                        </pre>
                      </div>
                    ))}
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", color:"#a1a1aa", marginBottom:10 }}>
                        Required fields
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                        {tool.input_schema?.required?.map((f:string)=>(
                          <span key={f} style={{
                            fontSize:12, padding:"3px 10px", borderRadius:6,
                            background:"#eff6ff", color:"#1d4ed8",
                            border:"1px solid #bfdbfe", fontWeight:500,
                          }}>
                            {f}
                            <span style={{ color:"#93c5fd", fontWeight:400 }}> : {tool.input_schema.properties[f]?.type}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
