<div align="center">

# 🏦 Credit & Covenant Risk Copilot

### AI-powered credit agreement analysis with real-time covenant monitoring

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

**Upload a credit agreement PDF → AI extracts covenants automatically → Ask questions in natural language → Monitor covenant compliance with deterministic breach detection**

[🚀 Quick Start](#-quick-start) · [✨ Features](#-features) · [🏗️ Architecture](#%EF%B8%8F-architecture) · [📡 API Endpoints](#-api-endpoints) · [🧠 RAG Pipeline](#-rag-pipeline) · [🔧 Tech Stack](#-tech-stack)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📄 Document Intelligence
- **MinerU Cloud Parsing** — VLM-powered PDF extraction preserving tables, headers, and legal structure
- **Smart Chunking** — Header-aware recursive splitting that keeps covenant sections intact
- **Semantic Search** — Jina AI embeddings + pgvector for meaning-based clause retrieval

</td>
<td width="50%">

### 🤖 Advanced RAG Pipeline
- **Query Rewriting** — Groq-powered expansion of vague questions into retrieval-optimized queries
- **Cohere Reranking** — True relevance scoring on retrieved candidates
- **Context Compression** — Strip noise from chunks before generation
- **Grounded Answers** — Mistral generates responses using *only* retrieved clauses, with source citations

</td>
</tr>
<tr>
<td width="50%">

### 📊 Covenant Monitoring
- **Auto-Extraction** — LLM reads the agreement and populates a structured covenant register (metric, operator, threshold, source quote)
- **Deterministic Risk Engine** — Pure Python breach detection (no LLM for math — auditable and trustworthy)
- **Headroom Tracking** — See exactly how much room before a covenant trips

</td>
<td width="50%">

### 🔐 Production-Ready Auth
- **JWT + Refresh Tokens** — Secure access with automatic token rotation
- **Role-Based Access** — Admin and user roles with route-level protection
- **Password Hashing** — bcrypt with salt

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        React Frontend (Vite)                        │
│   Login • Chat • Upload • Covenants • Risk Check • Borrowers/Loans │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ REST API (JWT Auth)
┌─────────────────────────▼───────────────────────────────────────────┐
│                      FastAPI Backend                                 │
│                                                                      │
│  ┌──────────┐  ┌──────────────────────────────────────────────────┐  │
│  │  Routers  │  │              RAG Pipeline                        │  │
│  │  ────────  │  │                                                  │  │
│  │ /auth      │  │  Query ──► Rewrite ──► Retrieve ──► Rerank     │  │
│  │ /borrowers │  │  (user)    (Groq)     (pgvector)   (Cohere)    │  │
│  │ /loans     │  │                                       │         │  │
│  │ /covenants │  │              Compress ◄───────────────┘         │  │
│  │ /documents │  │              (Groq)                             │  │
│  │ /risk      │  │                 │                                │  │
│  └──────────┘  │              Generate ──► Grounded Answer         │  │
│                 │              (Mistral)   + Source Citations       │  │
│                 └──────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────┐   │
│  │   CRUD Layer    │  │  Risk Engine   │  │  Covenant Extractor  │   │
│  │  borrower.py    │  │  Deterministic │  │  LLM → Structured   │   │
│  │  loan.py        │  │  Python math   │  │  JSON → DB rows     │   │
│  │  covenant.py    │  │  (no LLM)      │  │                      │   │
│  └────────────────┘  └────────────────┘  └──────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────────┐
│              PostgreSQL + pgvector (Neon Serverless)                  │
│                                                                      │
│  borrowers • loan_agreements • covenants • compliance_certificates   │
│  breach_checks • documents • document_chunks (Vector 768) • users   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** with [uv](https://docs.astral.sh/uv/)
- **Node.js 18+** with npm
- **Neon account** (free) — [neon.tech](https://neon.tech)
- API keys (all free tier):

| Service | Purpose | Get Key |
|---------|---------|---------|
| **MinerU** | PDF parsing | [mineru.net](https://mineru.net) |
| **Jina AI** | Embeddings (768d) | [jina.ai](https://jina.ai) |
| **Groq** | Query rewriting + compression | [console.groq.com](https://console.groq.com) |
| **Mistral** | Answer generation | [console.mistral.ai](https://console.mistral.ai) |
| **Cohere** | Reranking | [dashboard.cohere.com](https://dashboard.cohere.com) |

### 1️⃣ Clone & Configure

```bash
git clone https://github.com/yourusername/credit-copilot.git
cd credit-copilot
```

```bash
cd backend
cp .env.example .env
# Edit .env with your real keys
```

### 2️⃣ Start the Backend

```bash
uv venv --python 3.11
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Mac/Linux

uv sync
uv run uvicorn app.main:app --reload
```

> Backend runs at **http://localhost:8000** — API docs at [http://localhost:8000/docs](http://localhost:8000/docs)

### 3️⃣ Start the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

> Frontend runs at **http://localhost:5173**

### 4️⃣ First Use

1. **Register** — create an account at the login screen
2. **Add a borrower** — Borrowers page → Add
3. **Add a loan** — Loans page → Add (link to borrower)
4. **Upload agreement** — Upload page → select loan, choose PDF
5. **Ask questions** — Chat page → *"What are the negative covenants?"*
6. **Check risk** — Risk page → select a numeric covenant, enter a value

---

## 📡 API Endpoints

<details>
<summary><b>🔐 Auth</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create a new user account |
| `POST` | `/auth/login` | Get access + refresh tokens |
| `POST` | `/auth/refresh` | Exchange refresh token for new pair |

</details>

<details>
<summary><b>👥 Borrowers</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/borrowers` | List all borrowers |
| `POST` | `/borrowers` | Create a borrower |

</details>

<details>
<summary><b>💰 Loans</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/loans` | List all loans |
| `POST` | `/loans` | Create a loan (linked to a borrower) |

</details>

<details>
<summary><b>📜 Covenants</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/covenants` | List all covenants |
| `POST` | `/covenants` | Manually create a covenant |

</details>

<details>
<summary><b>📄 Documents & RAG</b> (🔒 Protected)</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/documents/upload` | Upload PDF → parse → chunk → embed → store |
| `GET` | `/documents/search?q=` | Semantic search over stored chunks |
| `GET` | `/documents/ask?q=` | Full RAG Q&A with grounded answer + sources |
| `POST` | `/documents/{id}/extract_covenants` | AI extracts covenants into structured register |

</details>

<details>
<summary><b>⚠️ Risk Engine</b> (🔒 Protected)</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/risk/check` | Submit reported value → deterministic breach check |

**Example request:**
```json
{
  "covenant_id": 8,
  "period": "2026-03-31",
  "reported_value": 3.2
}
```
**Example response:**
```json
{
  "covenant": "Net Debt / EBITDA",
  "threshold": 3.5,
  "reported": 3.2,
  "status": "compliant",
  "headroom": 0.3
}
```

</details>

---

## 🧠 RAG Pipeline

The system uses an advanced multi-model RAG architecture — each stage uses the best-fit model for the task:

```
User Query
    │
    ▼
┌─────────────────────────────┐
│  1. Query Rewriting (Groq)  │  "is this risky?" → "financial covenants,
│     Fast, cheap model       │   leverage ratios, events of default..."
└────────────┬────────────────┘
             ▼
┌─────────────────────────────┐
│  2. Vector Retrieval        │  Embed query (Jina 768d) → pgvector
│     Top 20 candidates       │  cosine distance → 20 nearest chunks
└────────────┬────────────────┘
             ▼
┌─────────────────────────────┐
│  3. Reranking (Cohere)      │  Score 20 candidates by TRUE relevance
│     Keep top 5              │  → Best 5 chunks survive
└────────────┬────────────────┘
             ▼
┌─────────────────────────────┐
│  4. Compression (Groq)      │  Strip each chunk to only the sentences
│     Remove noise            │  relevant to the question
└────────────┬────────────────┘
             ▼
┌─────────────────────────────┐
│  5. Generation (Mistral)    │  Answer using ONLY the retrieved clauses
│     Grounded + cited        │  → Refuses to hallucinate
└─────────────────────────────┘
```

### Design Principles

- **Deterministic-first** — The LLM never does arithmetic. Breach checks, headroom, and compliance are pure Python math. The LLM explains; Python decides.
- **Human-in-the-loop** — Every answer includes source citations. The copilot flags; a credit officer confirms.
- **Grounded generation** — The system prompt enforces: *"Answer using ONLY the provided clauses. If not found, say so."* Hallucination = refused.

---

## 🔧 Tech Stack

### Backend

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | FastAPI (async) | Type-safe, auto-docs, async-native |
| **Database** | PostgreSQL + pgvector via Neon | Relational + vector search in one DB |
| **ORM** | SQLAlchemy 2.0 (async) | Industry standard, full async support |
| **Auth** | JWT + bcrypt | Stateless auth with refresh tokens |
| **PDF Parsing** | MinerU Cloud API (VLM) | Best table/structure preservation |
| **Chunking** | LangChain RecursiveCharacterTextSplitter | Header-aware, battle-tested |
| **Embeddings** | Jina AI v3 (768d) | Open model, Matryoshka support |
| **Reranking** | Cohere rerank-v3.5 | Production-grade relevance scoring |
| **Query Rewriting** | Groq (openai/gpt-oss-20b) | Fast, cheap, perfect for preprocessing |
| **Generation** | Mistral (open-mistral-nemo) | 128k context, strong for legal text |

### Frontend

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + Vite |
| **Styling** | Tailwind CSS |
| **Routing** | React Router 7 |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
credit-copilot/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + CORS + lifespan
│   │   ├── config.py            # Pydantic settings (env vars)
│   │   ├── database.py          # Async SQLAlchemy engine + session
│   │   ├── models.py            # 8 SQLAlchemy tables
│   │   ├── schemas.py           # Pydantic request/response shapes
│   │   ├── auth.py              # JWT + bcrypt + role guards
│   │   ├── crud/                # Database operations (separated)
│   │   │   ├── borrower.py
│   │   │   ├── loan.py
│   │   │   └── covenant.py
│   │   ├── routers/             # API endpoints (thin, call CRUD/RAG)
│   │   │   ├── auth.py
│   │   │   ├── borrowers.py
│   │   │   ├── loans.py
│   │   │   ├── covenants.py
│   │   │   ├── documents.py     # Upload, search, ask, extract
│   │   │   ├── risk.py
│   │   │   └── health.py
│   │   ├── rag/                 # RAG pipeline (one file per stage)
│   │   │   ├── parser.py        # MinerU PDF → Markdown
│   │   │   ├── chunker.py       # Recursive text splitting
│   │   │   ├── embedder.py      # Jina AI embeddings
│   │   │   ├── ingest.py        # Parse→chunk→embed→store chain
│   │   │   ├── retrieve.py      # pgvector similarity search
│   │   │   ├── rerank.py        # Cohere reranking
│   │   │   ├── retrieval_compression.py  # Chunk compression
│   │   │   ├── query_rewriting.py        # Groq query expansion
│   │   │   ├── extract.py       # Covenant extraction via LLM
│   │   │   └── generate.py      # Mistral answer generation
│   │   ├── risk/
│   │   │   └── engine.py        # Deterministic breach math
│   │   └── prompts/             # All LLM prompts (separated from code)
│   │       ├── answer.py
│   │       ├── rewrite.py
│   │       ├── compression.py
│   │       └── extraction.py
│   ├── test/
│   ├── Data/                    # Sample credit agreement
│   ├── pyproject.toml
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── main.jsx             # App entry + routing
    │   ├── components/
    │   │   ├── Layout.jsx       # Sidebar + content wrapper
    │   │   └── Sidebar.jsx      # Navigation
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Chat.jsx         # Main copilot Q&A
    │   │   ├── Upload.jsx       # PDF upload + auto-extraction
    │   │   ├── Covenants.jsx    # Covenant register view
    │   │   ├── Risk.jsx         # Breach check interface
    │   │   ├── Borrowers.jsx
    │   │   └── Loans.jsx
    │   ├── hooks/
    │   │   └── useAuth.jsx      # Auth context
    │   └── lib/
    │       └── api.js           # API client with auto-refresh
    ├── package.json
    └── vite.config.js
```

---

## 🧪 Example Queries

Try these in the **Chat** page to see the copilot in action:

| Query | Tests |
|-------|-------|
| *"What is the senior loan commitment amount?"* | Direct factual retrieval |
| *"What are the negative covenants?"* | Section-level retrieval |
| *"Is this loan safe?"* | Query rewriting (vague → specific) |
| *"What are the covenants and what happens if they're breached?"* | Multi-part question handling |
| *"What is the borrower's credit rating?"* | Grounding (should refuse — not in document) |

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Random string for signing tokens |
| `MINERU_API_TOKEN` | ✅ | MinerU cloud parsing API |
| `JINA_API_KEY` | ✅ | Jina embeddings API |
| `GROQ_API_KEY` | ✅ | Groq (query rewriting + compression) |
| `MISTRAL_API_KEY` | ✅ | Mistral (answer generation) |
| `COHERE_API_KEY` | ✅ | Cohere (reranking) |
| `DEBUG` | ❌ | Enable SQL echo logging |

---

<div align="center">

**Built as a learning project — from "I don't know backend" to a production-shaped, multi-model AI credit tool.**

</div>
