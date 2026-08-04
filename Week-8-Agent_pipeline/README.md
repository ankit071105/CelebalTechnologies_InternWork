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
│   ├── main.py   
│   └── requirements.txt
└── frontend/
    ├── app/
    │   └── page.tsx   
    ├── components/
    │   ├── AgentRunner.tsx    
    │   ├── GraphView.tsx       
    │   ├── ToolExecutor.tsx    
    │   ├── ToolSchemas.tsx    
    │   └── MetricsDashboard.tsx
    └── lib/api.ts     
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


## Output Images:- 

<img width="1202" height="837" alt="Screenshot 2026-08-04 at 1 11 22 PM" src="https://github.com/user-attachments/assets/2ec86227-6cf2-45c3-845d-6d4bbbaf09ae" />

<img width="1202" height="837" alt="Screenshot 2026-08-04 at 1 10 55 PM" src="https://github.com/user-attachments/assets/9d84ba44-8942-4471-a827-47f936f53b64" />






<img width="1202" height="837" alt="Screenshot 2026-08-04 at 1 11 27 PM" src="https://github.com/user-attachments/assets/0108145c-b4e3-44c5-9e65-0b6c84104cdb" />





<img width="1202" height="837" alt="Screenshot 2026-08-04 at 1 11 48 PM" src="https://github.com/user-attachments/assets/d4e7f399-d8d2-4680-9ec7-3835edf273f4" />


<img width="1202" height="837" alt="Screenshot 2026-08-04 at 1 11 59 PM" src="https://github.com/user-attachments/assets/2ac189e3-c862-49e8-9692-c2c3d74bde43" />



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
