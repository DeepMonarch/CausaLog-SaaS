# Causalog

**AI-powered Root Cause Analysis for application logs.**

Causalog transforms raw logs into structured insights, probable root causes, and actionable debugging recommendations — with full explainability.

---

## Project structure

```
causalog/
├── frontend/          # React + TypeScript + Tailwind
└── backend/           # FastAPI + PostgreSQL
```

---

## Quick start

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY

# Run database migrations (after Alembic is set up)
# alembic upgrade head

# Start dev server
uvicorn app.main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/api/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at: `http://localhost:5173`

---

## Auth endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/token` | Login (returns JWT) |
| GET | `/api/users/me` | Get current user |

---

## Roadmap

- **Phase 1 (MVP):** Auth · Upload · Preprocessing · NLP · ML pipeline · Inference · Reports
- **Phase 2:** LLM integration · AI explanations · Chat interface
- **Phase 3:** Teams · Real-time streaming · Integrations

See `docs/ROADMAP.md` for full detail.



# Frontend
cd causalog/frontend
npm install
npm run dev   # → http://localhost:5173

# Backend
cd causalog/backend
python -m venv .venv && .venv\Scripts\Activate
pip install -r requirements.txt
cp .env.example .env  # fill in DATABASE_URL and SECRET_KEY
uvicorn app.main:app --reload --port 8000