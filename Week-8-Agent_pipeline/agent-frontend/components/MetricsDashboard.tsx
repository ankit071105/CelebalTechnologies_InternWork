"use client";
import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle, XCircle, Activity, DollarSign } from "lucide-react";
import { getMetrics } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    getMetrics().then(setMetrics).finally(()=>setLoading(false));
  }
  useEffect(()=>{ load(); },[]);

  const rate    = metrics?.task_completion_rate ?? 0;
  const history = (metrics?.task_history ?? []).slice(-10);
  const routeCounts: Record<string,number> = history.reduce((a:any,t:any)=>{
    a[t.route]=(a[t.route]||0)+1; return a;
  },{});
  const chartData = Object.entries(routeCounts).map(([name,count])=>({ name, count }));

  const rateColor = rate>=80 ? "#16a34a" : rate>=50 ? "#d97706" : "#dc2626";

  const card: React.CSSProperties = {
    background:"#fff", border:"1px solid #f0f0f0",
    borderRadius:12, boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
  };

  const stats = [
    {
      label:"Completion Rate",
      value:`${rate}%`,
      sub:`${metrics?.completed_tasks??0} of ${metrics?.total_tasks??0} tasks`,
      Icon:CheckCircle, color:rateColor,
    },
    {
      label:"Failed",
      value:metrics?.failed_tasks??0,
      sub:"retry limit reached",
      Icon:XCircle, color:"#dc2626",
    },
    {
      label:"Groq API Calls",
      value:metrics?.total_api_calls??0,
      sub:`${metrics?.total_tokens_used??0} tokens used`,
      Icon:Activity, color:"#0a0a0a",
    },
    {
      label:"Estimated Cost",
      value:`$${metrics?.estimated_cost_usd??0}`,
      sub:"at $1 per 1M tokens",
      Icon:DollarSign, color:"#0a0a0a",
    },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"#0a0a0a", letterSpacing:"-0.03em", marginBottom:4 }}>
            Metrics
          </h1>
          <p style={{ fontSize:14, color:"#71717a", lineHeight:1.6 }}>
            Task completion rate, API usage, and cost tracking across all agent runs.
          </p>
        </div>
        <button onClick={load} disabled={loading} style={{
          display:"flex", alignItems:"center", gap:7,
          padding:"9px 16px", background:"#fff",
          border:"1px solid #e4e4e7", borderRadius:8,
          fontSize:13, fontWeight:500, color:"#52525b",
          cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s",
        }}>
          <RefreshCw size={13} strokeWidth={2} style={{ animation:loading?"spin 0.65s linear infinite":undefined }}/> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12 }}>
        {stats.map(({ label, value, sub, Icon, color })=>(
          <div key={label} style={{ ...card, padding:20 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <span style={{ fontSize:12, color:"#71717a", fontWeight:500 }}>{label}</span>
              <Icon size={15} color={color} strokeWidth={2}/>
            </div>
            <div style={{ fontSize:26, fontWeight:700, color, letterSpacing:"-0.03em", marginBottom:4 }}>
              {value}
            </div>
            <div style={{ fontSize:12, color:"#a1a1aa" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Completion bar */}
      <div style={{ ...card, padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <span style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", color:"#a1a1aa" }}>
            Completion rate
          </span>
          <span style={{ fontSize:12, color:"#71717a" }}>Target ≥ 80%</span>
        </div>
        <div style={{ height:10, background:"#f4f4f5", borderRadius:99, overflow:"hidden" }}>
          <div style={{
            height:"100%", width:`${Math.max(rate,0)}%`,
            background: rateColor, borderRadius:99,
            transition:"width 0.8s cubic-bezier(0.16,1,0.3,1)",
          }}/>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontSize:11, color:"#a1a1aa" }}>
          <span>0%</span>
          <span style={{ color:rateColor, fontWeight:600 }}>{rate}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Chart */}
      {chartData.length>0 && (
        <div style={{ ...card, padding:20 }}>
          <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", color:"#a1a1aa", marginBottom:20 }}>
            Route distribution
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={chartData} barSize={40} barCategoryGap={20}>
              <XAxis dataKey="name" tick={{ fill:"#a1a1aa", fontSize:11, fontFamily:"Inter" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:"#a1a1aa", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip
                contentStyle={{ background:"#fff", border:"1px solid #f0f0f0", borderRadius:8, fontSize:12, fontFamily:"Inter", boxShadow:"0 4px 12px rgba(0,0,0,0.08)" }}
                labelStyle={{ color:"#0a0a0a", fontWeight:600 }}
                cursor={{ fill:"#f9f9f9" }}
              />
              <Bar dataKey="count" radius={[5,5,0,0]}>
                {chartData.map((_:any,i:number)=>(
                  <Cell key={i} fill={["#0a0a0a","#52525b","#a1a1aa"][i%3]}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History table */}
      <div style={card}>
        <div style={{ padding:"14px 20px", borderBottom:"1px solid #f0f0f0" }}>
          <span style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", color:"#a1a1aa" }}>
            Recent task history
          </span>
        </div>
        {history.length===0 ? (
          <div style={{ padding:"48px 20px", textAlign:"center", color:"#a1a1aa" }}>
            <Activity size={28} color="#e4e4e7" style={{ margin:"0 auto 10px" }}/>
            <div style={{ fontSize:13, fontWeight:500, color:"#71717a", marginBottom:4 }}>No tasks yet</div>
            <div style={{ fontSize:12 }}>Run some queries in the Run Agent tab</div>
          </div>
        ) : (
          [...history].reverse().map((t:any,i:number,arr:any[])=>(
            <div key={i} style={{
              padding:"12px 20px",
              borderBottom: i<arr.length-1?"1px solid #f9f9f9":"none",
              display:"flex", alignItems:"center", gap:12,
            }}>
              {t.status==="completed"
                ? <CheckCircle size={14} color="#16a34a" strokeWidth={2}/>
                : <XCircle size={14} color="#dc2626" strokeWidth={2}/>
              }
              <span style={{ fontSize:13, color:"#27272a", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {t.query}
              </span>
              <span style={{
                fontSize:11, padding:"2px 9px", borderRadius:99, flexShrink:0,
                background:"#f4f4f5", color:"#52525b", fontWeight:500,
              }}>{t.route}</span>
              <span style={{ fontSize:12, color:"#a1a1aa", flexShrink:0, width:52, textAlign:"right" }}>
                {t.duration_ms} ms
              </span>
            </div>
          ))
        )}
      </div>

      {/* Tips */}
      <div style={{ ...card, padding:20 }}>
        <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", color:"#a1a1aa", marginBottom:16 }}>
          Optimization tips
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            "Improve routing accuracy to avoid misrouting queries to the wrong tool",
            "Use parallel execution for independent tool calls to reduce total latency",
            "Cache repeated queries to reduce Groq API calls and token spend",
            "Tune retry limits — too high wastes resources, too low hurts reliability",
          ].map((tip,i)=>(
            <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <div style={{ width:20, height:20, borderRadius:4, background:"#f4f4f5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                <span style={{ fontSize:10, fontWeight:700, color:"#52525b" }}>{i+1}</span>
              </div>
              <span style={{ fontSize:13, color:"#52525b", lineHeight:1.6 }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
