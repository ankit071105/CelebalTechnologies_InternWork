# Agent Pipeline — Week 8 Quiz Implementation

Single Agent System with Tool Routing built with **FastAPI + Next.js + Groq**

## What's Built (Maps to Quiz Questions)

| Quiz Q | Feature |
|--------|---------|
| Q1 — Stateful directed graph | `AgentState` class carries state through all nodes |
| Q2 — Nodes & Edges | QueryAnalyzer → Router → ToolExecutor → ResponseGenerator |
| Q3 — Conditional routing | `/route` endpoint + ConditionalRouter node |
| Q4 — Cycles/retry loops | ToolExecutor retries up to 3 times on failure |
| Q5 — Single agent = multi-agent behavior | One agent runs 4 distinct role-based nodes |
| Q6 — JSON schema tools | `/tools/schemas` returns input/output schemas per tool |
| Q7 — Sequential vs Parallel | `/tools/execute` with `mode: sequential \| parallel` |
| Q8 — Error handling | try-except + retry mechanism in ToolExecutor node |
| Q9 — Trajectory evaluation | Full step-by-step trace returned with every agent run |
| Q10 — Completion rate + cost | `/metrics` tracks rate, tokens, cost, task history |

## Project Structure

```
agent-pipeline/
├── backend/
│   ├── main.py          # FastAPI app — all agent logic
│   ├── .env             # Add your GROQ_API_KEY here
│   └── requirements.txt
└── frontend/
    ├── app/
    │   └── page.tsx     # Tabbed layout
    ├── components/
    │   ├── AgentRunner.tsx      # Run queries, see trajectory
    │   ├── GraphView.tsx        # Visual pipeline graph (SVG)
    │   ├── ToolExecutor.tsx     # Sequential vs Parallel demo
    │   ├── ToolSchemas.tsx      # JSON schema viewer
    │   └── MetricsDashboard.tsx # Completion rate + cost
    └── lib/api.ts       # API client
```

## Setup

### 1. Backend

```bash
cd backend

# Add your Groq API key
echo "GROQ_API_KEY=your_key_here" > .env

# Install deps
pip install -r requirements.txt

# Run
uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend

npm install

npm run dev
```

Open http://localhost:3000

## Tools

| Tool | Trigger | Uses Groq? |
|------|---------|-----------|
| Calculator | query has math operators or "calculate" | ❌ (pure Python eval) |
| Keyword Extractor | query has "keyword" or "extract" | ❌ (NLP logic) |
| General Responder | all other queries | ✅ llama-3.1-8b-instant |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/agent/run` | Full agent pipeline run |
| POST | `/route` | Routing decision only |
| POST | `/tools/execute` | Sequential or parallel tool calls |
| GET  | `/tools/schemas` | JSON schemas for all tools |
| GET  | `/metrics` | Task completion rate + cost |
| GET  | `/graph/definition` | Graph nodes/edges structure |
