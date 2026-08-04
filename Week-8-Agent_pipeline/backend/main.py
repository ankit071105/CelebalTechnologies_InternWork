from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import asyncio
import time
import json
import re
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Agent Pipeline API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Groq Client ─────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# ─── In-memory metrics store ─────────────────────────────────
metrics_store = {
    "total_tasks": 0,
    "completed_tasks": 0,
    "failed_tasks": 0,
    "total_api_calls": 0,
    "total_tokens": 0,
    "total_cost_usd": 0.0,
    "task_history": []
}

# ─── JSON Schemas for tools (Q6) ─────────────────────────────
TOOL_SCHEMAS = {
    "calculator": {
        "name": "calculator",
        "description": "Evaluates mathematical expressions",
        "input_schema": {
            "type": "object",
            "required": ["expression"],
            "properties": {
                "expression": {"type": "string", "description": "Math expression to evaluate"}
            }
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "result": {"type": "number"},
                "expression": {"type": "string"},
                "status": {"type": "string"}
            }
        }
    },
    "keyword_extractor": {
        "name": "keyword_extractor",
        "description": "Extracts important keywords from text",
        "input_schema": {
            "type": "object",
            "required": ["text"],
            "properties": {
                "text": {"type": "string", "description": "Text to extract keywords from"}
            }
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "keywords": {"type": "array", "items": {"type": "string"}},
                "count": {"type": "integer"},
                "status": {"type": "string"}
            }
        }
    },
    "general_responder": {
        "name": "general_responder",
        "description": "Handles general queries using Groq LLM",
        "input_schema": {
            "type": "object",
            "required": ["query"],
            "properties": {
                "query": {"type": "string", "description": "User query to respond to"}
            }
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "response": {"type": "string"},
                "model": {"type": "string"},
                "status": {"type": "string"}
            }
        }
    }
}

# ─── Tool Implementations ─────────────────────────────────────

def run_calculator(expression: str) -> Dict[str, Any]:
    """Calculator tool - evaluates math expressions"""
    try:
        # Safe eval for math
        allowed = set('0123456789+-*/().% ')
        if not all(c in allowed for c in expression):
            raise ValueError("Invalid characters in expression")
        result = eval(expression, {"__builtins__": {}})
        return {"result": result, "expression": expression, "status": "success"}
    except Exception as e:
        return {"result": None, "expression": expression, "status": "error", "error": str(e)}

def run_keyword_extractor(text: str) -> Dict[str, Any]:
    """Keyword extractor - pulls important words from text"""
    stop_words = {"the", "a", "an", "is", "it", "in", "on", "at", "to", "for",
                  "of", "and", "or", "but", "i", "you", "we", "they", "what",
                  "how", "why", "when", "where", "which", "this", "that", "with"}
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    keywords = list(dict.fromkeys([w for w in words if w not in stop_words]))[:10]
    return {"keywords": keywords, "count": len(keywords), "status": "success"}

def run_general_responder(query: str) -> Dict[str, Any]:
    """General responder using Groq LLM"""
    if not groq_client:
        return {"response": f"[Mock] Answer to: {query}", "model": "mock", "status": "success"}
    try:
        resp = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a concise helpful assistant. Answer in 2-3 sentences max."},
                {"role": "user", "content": query}
            ],
            max_tokens=150
        )
        metrics_store["total_api_calls"] += 1
        tokens = resp.usage.total_tokens if resp.usage else 0
        metrics_store["total_tokens"] += tokens
        metrics_store["total_cost_usd"] += tokens * 0.000001
        return {
            "response": resp.choices[0].message.content,
            "model": "llama-3.1-8b-instant",
            "tokens": tokens,
            "status": "success"
        }
    except Exception as e:
        return {"response": None, "model": "groq", "status": "error", "error": str(e)}

# ─── AGENT STATE (Stateful Graph - Q1) ───────────────────────

class AgentState:
    def __init__(self, query: str):
        self.query = query
        self.route = None
        self.tool_result = None
        self.final_response = None
        self.trajectory = []   # full trace for Q9
        self.retries = 0
        self.status = "running"
        self.tokens_used = 0
        self.start_time = time.time()

    def to_dict(self):
        return {
            "query": self.query,
            "route": self.route,
            "tool_result": self.tool_result,
            "final_response": self.final_response,
            "trajectory": self.trajectory,
            "retries": self.retries,
            "status": self.status,
            "tokens_used": self.tokens_used,
            "duration_ms": round((time.time() - self.start_time) * 1000)
        }

# ─── NODES (Q2) ──────────────────────────────────────────────

def node_query_analyzer(state: AgentState) -> AgentState:
    """Node 1: Analyze the incoming query"""
    state.trajectory.append({
        "node": "QueryAnalyzer",
        "action": "Analyzing query intent",
        "input": state.query,
        "output": "Query classified for routing"
    })
    return state

def node_router(state: AgentState) -> AgentState:
    """Node 2: Conditional routing (Q3)"""
    query_lower = state.query.lower()
    if any(k in query_lower for k in ["calculate", "compute", "+", "-", "*", "/", "="]):
        route = "calculator"
    elif any(k in query_lower for k in ["keyword", "extract", "keywords from", "key words"]):
        route = "keyword_extractor"
    else:
        route = "general_responder"

    state.route = route
    state.trajectory.append({
        "node": "ConditionalRouter",
        "action": f"Routing to → {route}",
        "input": state.query,
        "output": route,
        "rule": f"Matched rule for '{route}'"
    })
    return state

def node_tool_executor(state: AgentState, max_retries: int = 3) -> AgentState:
    """Node 3: Execute tool with retry loop (Q4, Q8)"""
    for attempt in range(1, max_retries + 1):
        state.retries = attempt - 1
        try:
            if state.route == "calculator":
                # Extract math expression from query
                expr = re.search(r'[\d\s\+\-\*\/\(\)\.%]+', state.query)
                expression = expr.group(0).strip() if expr else state.query
                result = run_calculator(expression)
            elif state.route == "keyword_extractor":
                result = run_keyword_extractor(state.query)
            else:
                result = run_general_responder(state.query)

            if result.get("status") == "success":
                state.tool_result = result
                state.trajectory.append({
                    "node": "ToolExecutor",
                    "action": f"Executed {state.route} (attempt {attempt})",
                    "input": state.query,
                    "output": result,
                    "status": "success"
                })
                return state
            else:
                raise Exception(result.get("error", "Tool failed"))

        except Exception as e:
            state.trajectory.append({
                "node": "ToolExecutor",
                "action": f"Attempt {attempt} failed — retrying",
                "input": state.query,
                "output": str(e),
                "status": "retry"
            })
            if attempt == max_retries:
                state.tool_result = {"status": "error", "error": str(e)}
                state.status = "failed"

    return state

def node_response_generator(state: AgentState) -> AgentState:
    """Node 4: Generate final response"""
    if state.tool_result and state.tool_result.get("status") == "success":
        route = state.route
        result = state.tool_result
        if route == "calculator":
            response = f"Result: {result.get('result')}"
        elif route == "keyword_extractor":
            response = f"Keywords: {', '.join(result.get('keywords', []))}"
        else:
            response = result.get("response", "No response generated")

        state.final_response = response
        state.status = "completed"
    else:
        state.final_response = "Sorry, I could not complete this task after multiple retries."
        state.status = "failed"

    state.trajectory.append({
        "node": "ResponseGenerator",
        "action": "Composing final response",
        "input": state.tool_result,
        "output": state.final_response,
        "status": state.status
    })
    return state

# ─── AGENT RUNNER (Stateful Graph executor - Q1) ─────────────

def run_agent(query: str) -> Dict[str, Any]:
    """Runs the full stateful directed graph"""
    state = AgentState(query)
    metrics_store["total_tasks"] += 1

    # Execute nodes in order (edges connect them)
    state = node_query_analyzer(state)
    state = node_router(state)
    state = node_tool_executor(state)
    state = node_response_generator(state)

    result = state.to_dict()

    # Update metrics
    if state.status == "completed":
        metrics_store["completed_tasks"] += 1
    else:
        metrics_store["failed_tasks"] += 1

    metrics_store["task_history"].append({
        "query": query[:60],
        "status": state.status,
        "route": state.route,
        "duration_ms": result["duration_ms"]
    })
    if len(metrics_store["task_history"]) > 20:
        metrics_store["task_history"] = metrics_store["task_history"][-20:]

    return result

# ─── Parallel Tool Execution (Q7) ────────────────────────────

async def run_tool_async(tool_name: str, input_data: str) -> Dict[str, Any]:
    start = time.time()
    await asyncio.sleep(0)  # yield
    if tool_name == "calculator":
        result = run_calculator(input_data)
    elif tool_name == "keyword_extractor":
        result = run_keyword_extractor(input_data)
    else:
        result = run_general_responder(input_data)
    result["duration_ms"] = round((time.time() - start) * 1000)
    result["tool"] = tool_name
    return result

# ─── API ROUTES ───────────────────────────────────────────────

class QueryRequest(BaseModel):
    query: str

class RouteRequest(BaseModel):
    query: str

class ToolCallRequest(BaseModel):
    tools: List[str]
    inputs: List[str]
    mode: str = "sequential"  # sequential | parallel

@app.get("/")
def root():
    return {"status": "Agent Pipeline API running"}

@app.post("/agent/run")
def agent_run(req: QueryRequest):
    """Full agent pipeline run with trajectory"""
    result = run_agent(req.query)
    return result

@app.post("/route")
def route_query(req: RouteRequest):
    """Conditional routing only (Q3)"""
    query_lower = req.query.lower()
    if any(k in query_lower for k in ["calculate", "compute", "+", "-", "*", "/"]):
        route = "calculator"
        rule = "Query contains math operators or 'calculate'"
    elif any(k in query_lower for k in ["keyword", "extract", "keywords"]):
        route = "keyword_extractor"
        rule = "Query contains 'keyword' or 'extract'"
    else:
        route = "general_responder"
        rule = "No specific pattern matched — using general responder"
    return {"query": req.query, "route": route, "rule": rule}

@app.post("/tools/execute")
async def execute_tools(req: ToolCallRequest):
    """Sequential vs Parallel tool execution (Q7)"""
    if len(req.tools) != len(req.inputs):
        raise HTTPException(status_code=400, detail="tools and inputs must have same length")

    start = time.time()
    results = []

    if req.mode == "parallel":
        tasks = [run_tool_async(t, i) for t, i in zip(req.tools, req.inputs)]
        results = await asyncio.gather(*tasks)
        results = list(results)
    else:
        for tool, inp in zip(req.tools, req.inputs):
            result = await run_tool_async(tool, inp)
            results.append(result)

    total_ms = round((time.time() - start) * 1000)
    return {
        "mode": req.mode,
        "total_duration_ms": total_ms,
        "results": results
    }

@app.get("/tools/schemas")
def get_tool_schemas():
    """JSON schemas for all tools (Q6)"""
    return {"schemas": TOOL_SCHEMAS}

@app.get("/metrics")
def get_metrics():
    """Task completion rate + cost metrics (Q10)"""
    total = metrics_store["total_tasks"]
    completed = metrics_store["completed_tasks"]
    rate = round((completed / total * 100), 1) if total > 0 else 0
    return {
        "task_completion_rate": rate,
        "total_tasks": total,
        "completed_tasks": completed,
        "failed_tasks": metrics_store["failed_tasks"],
        "total_api_calls": metrics_store["total_api_calls"],
        "total_tokens_used": metrics_store["total_tokens"],
        "estimated_cost_usd": round(metrics_store["total_cost_usd"], 6),
        "task_history": metrics_store["task_history"]
    }

@app.get("/graph/definition")
def get_graph_definition():
    """Returns the graph nodes/edges structure for visualization (Q1, Q2)"""
    return {
        "nodes": [
            {"id": "start", "label": "START", "type": "terminal"},
            {"id": "query_analyzer", "label": "Query Analyzer", "type": "node", "description": "Parses and understands the user query"},
            {"id": "router", "label": "Conditional Router", "type": "node", "description": "Routes to appropriate tool based on query type"},
            {"id": "calculator", "label": "Calculator Tool", "type": "tool", "description": "Evaluates math expressions"},
            {"id": "keyword_extractor", "label": "Keyword Extractor", "type": "tool", "description": "Extracts keywords from text"},
            {"id": "general_responder", "label": "General Responder (Groq)", "type": "tool", "description": "Handles general queries via LLM"},
            {"id": "tool_executor", "label": "Tool Executor + Retry", "type": "node", "description": "Executes tool with up to 3 retries"},
            {"id": "response_generator", "label": "Response Generator", "type": "node", "description": "Composes final response"},
            {"id": "end", "label": "END", "type": "terminal"}
        ],
        "edges": [
            {"from": "start", "to": "query_analyzer", "label": "query"},
            {"from": "query_analyzer", "to": "router", "label": "analyzed"},
            {"from": "router", "to": "calculator", "label": "if math"},
            {"from": "router", "to": "keyword_extractor", "label": "if extract"},
            {"from": "router", "to": "general_responder", "label": "else"},
            {"from": "calculator", "to": "tool_executor", "label": "selected"},
            {"from": "keyword_extractor", "to": "tool_executor", "label": "selected"},
            {"from": "general_responder", "to": "tool_executor", "label": "selected"},
            {"from": "tool_executor", "to": "router", "label": "retry (on fail)", "style": "dashed"},
            {"from": "tool_executor", "to": "response_generator", "label": "on success"},
            {"from": "response_generator", "to": "end", "label": "response"}
        ]
    }
