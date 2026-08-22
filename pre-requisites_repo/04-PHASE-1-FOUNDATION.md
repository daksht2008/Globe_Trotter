# 📋 04 — Phase 1: Foundation (~2 hours)

> **Goal**: Working skeleton — DB schema created, app factory running, Docker containers building, health endpoint live.
> **Everyone works in parallel on their own setup.**

---

## ⏰ Timeline

| Time | Activity |
|------|----------|
| 0:00 – 0:30 | Daksh: DB models + app factory + seed data scaffold |
| 0:00 – 0:30 | Backend Dev 1: Write `backend/Dockerfile`, test build |
| 0:00 – 0:30 | Backend Dev 2: Stub route files (empty blueprints), register in app factory |
| 0:00 – 0:30 | Frontend Dev: Scaffold Vite+React project, write `frontend/Dockerfile`, install deps |
| 0:30 – 1:00 | Daksh: Seed script (`seed.py`) with Faker — 20 cities, 50 activities |
| 0:30 – 1:00 | Backend Dev 1: Auth route scaffold (empty endpoints, correct status codes) |
| 0:30 – 1:00 | Backend Dev 2: Help Daksh test model relationships |
| 0:30 – 1:00 | Frontend Dev: Setup routing (react-router-dom), empty pages, Navbar shell |
| 1:00 – 1:30 | Daksh: `docker-compose.yml` wiring, verify full stack boots |
| 1:00 – 1:30 | Everyone: Pull main, verify `docker compose up --build` works on their machine |
| 1:30 – 2:00 | Buffer: Fix any build issues, merge initial PRs |

---

## ✅ Tasks

### 🟢 Daksh (DB + Debug + Integration)

- [ ] **Create all SQLAlchemy models** (`backend/app/models/`)
  - `user.py` — User model with password hashing (werkzeug)
  - `trip.py` — Trip model with user FK, share_token
  - `city.py` — City reference data model
  - `stop.py` — Stop (city within trip) with order_index
  - `activity.py` — Activity reference data model
  - `stop_activity.py` — Join table (stop ↔ activity)
  - `__init__.py` — Export all models

- [ ] **App factory** (`backend/app/__init__.py`)
  ```python
  # Keep it COMPACT — ~20 lines max
  # Use create_app() pattern
  # Register blueprints, init db, init JWT, init CORS
  ```

- [ ] **Config** (`backend/app/config.py`)
  ```python
  # ~10 lines — just load from .env with defaults
  ```

- [ ] **Seed script** (`backend/app/utils/seed.py`)
  - Use `faker` library — generate cities, activities in bulk
  - Target: 20 cities (real names), 50 activities (varied categories)
  - Make it idempotent (check if data exists before inserting)

- [ ] **Entry point** (`backend/run.py`)
  ```python
  # ~8 lines — import create_app, create tables, run
  ```

- [ ] **Health endpoint** in app factory or a separate `routes/health.py`

- [ ] **docker-compose.yml** — wire backend + frontend services

- [ ] **`.gitignore`** — comprehensive for Python + Node + SQLite + Docker

- [ ] **`.env.example`** files for backend and frontend

> 🎯 **Compactness target**: Entire backend scaffold ≤ 150 lines total across all files.

---

### 🔵 Backend Dev 1

- [ ] **Write `backend/Dockerfile`**
  ```dockerfile
  # Target: 8 lines max (it's already in pre-requisites.md)
  # FROM python:3.14-slim → WORKDIR → COPY requirements → RUN pip install → COPY . → EXPOSE → CMD
  ```

- [ ] **`backend/requirements.txt`** — finalize dependencies
  ```
  Flask>=3.0.0
  Flask-Cors>=4.0.0
  Flask-SQLAlchemy>=3.1.1
  Flask-JWT-Extended>=4.6.0
  python-dotenv>=1.0.0
  pydantic>=2.5.0
  gunicorn>=21.2.0
  faker>=20.0.0
  ```

- [ ] **Stub `backend/app/routes/auth.py`** — empty blueprint with placeholder endpoints
  ```python
  from flask import Blueprint, jsonify
  auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

  @auth_bp.route('/signup', methods=['POST'])
  def signup():
      return jsonify({"message": "TODO"}), 501

  @auth_bp.route('/login', methods=['POST'])
  def login():
      return jsonify({"message": "TODO"}), 501
  ```

- [ ] **Stub `backend/app/routes/cities.py`** — same pattern

- [ ] **Stub `backend/app/routes/share.py`** — same pattern

- [ ] **Test Docker build**: `docker build -t globetrotter-backend ./backend`

- [ ] **PR**: `backend-1/phase1-scaffold` → `main`

---

### 🟡 Backend Dev 2

- [ ] **Stub `backend/app/routes/trips.py`** — empty endpoints for GET/:id, PUT/:id, DELETE/:id
  ```python
  # Coordinate with Backend Dev 1 who owns POST and GET-list
  # Use same Blueprint — trips_bp
  ```

- [ ] **Stub `backend/app/routes/stops.py`** — empty CRUD endpoints

- [ ] **Stub `backend/app/routes/activities.py`** — empty search + assign/remove

- [ ] **Stub `backend/app/routes/__init__.py`** — register all blueprints

- [ ] **Help Daksh test model relationships**
  - Verify FK cascades (delete trip → delete stops → delete stop_activities)
  - Verify unique constraints
  - Test `to_dict()` serialization

- [ ] **PR**: `backend-2/phase1-scaffold` → `main`

---

### 🟣 Frontend Dev

- [ ] **Scaffold React app** (if not already done via Vite)
  ```bash
  npm create vite@latest . -- --template react
  npm install
  ```

- [ ] **Install core dependencies**
  ```bash
  npm install axios lucide-react react-router-dom zustand recharts sonner
  ```

- [ ] **Write `frontend/Dockerfile`**
  ```dockerfile
  # Target: 7 lines max
  # FROM node:22-alpine → WORKDIR → COPY package* → RUN npm install → COPY . → EXPOSE → CMD
  ```

- [ ] **Setup routing** (`App.jsx`)
  ```jsx
  // ~25 lines — BrowserRouter, Routes, Route for all 12 pages
  // Import empty page components
  ```

- [ ] **Create empty page files** (`frontend/src/pages/`)
  - Each page: just a `<div>Page Name</div>` placeholder
  - Total: 13 files (Login, Signup, Dashboard, CreateTrip, MyTrips, ItineraryBuilder, ItineraryView, CitySearch, ActivitySearch, TripBudget, TripCalendar, SharedView, Profile)

- [ ] **Create Navbar shell** (`frontend/src/components/Navbar.jsx`)
  - Links to main pages
  - Auth state display (logged in / not)

- [ ] **Setup API client** (`frontend/src/services/api.js`)
  ```javascript
  // ~15 lines — axios instance with baseURL, token interceptor
  ```

- [ ] **Setup Zustand store** (`frontend/src/store/useStore.js`)
  ```javascript
  // ~10 lines — user, token, setUser, logout
  ```

- [ ] **Test Docker build**: `docker build -t globetrotter-frontend ./frontend`

- [ ] **PR**: `frontend/phase1-scaffold` → `main`

---

## 🏁 Phase 1 Exit Criteria

Before moving to Phase 2, ALL of these must be true:

- [ ] `docker compose up --build` starts both services without errors
- [ ] `http://localhost:5000/api/health` returns `{"status": "healthy"}`
- [ ] `http://localhost:5173` shows React app with Navbar and routing working
- [ ] All models create tables in SQLite (verify with SQLite Viewer)
- [ ] Seed data populates cities and activities
- [ ] All stub endpoints return 501 responses
- [ ] `.gitignore` properly excludes `node_modules/`, `__pycache__/`, `instance/*.db`, `.env`, `venv/`
- [ ] All team members can `git pull main` and run `docker compose up --build` successfully
