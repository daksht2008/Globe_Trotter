# 👥 02 — Team Roles & Responsibilities

> Who does what. Branch ownership. Docker duties. Review responsibilities.

---

## 🧑‍💻 Team Roster

### 🟢 Daksh — Team Lead + DB Architect + Backend Debugger

**Branch**: `main` (direct push — no PR required)

| Area | Responsibility |
|------|---------------|
| **Database** | Design & implement all SQLAlchemy models, migrations, seed data |
| **Debug** | Review & debug all backend code before it goes into `main` |
| **Integration** | Merge PRs, resolve conflicts, ensure backend↔frontend contract is met |
| **Docker** | Own `docker-compose.yml`, ensure all services build & communicate |
| **Code Review** | Review ALL pull requests before merging |
| **Architecture** | Maintain API contract in `01-ARCHITECTURE.md`, update if endpoints change |

**Files Owned**:
- `backend/app/models/*` (all model files)
- `backend/app/config.py`
- `backend/app/__init__.py` (app factory)
- `backend/app/utils/seed.py`
- `backend/run.py`
- `docker-compose.yml`
- `backend/instance/app.db`
- All `0x-*.md` documentation files

---

### 🔵 Backend Dev 1 — Auth + Trips + Cities + Budget + Share

**Branch Prefix**: `backend-1/<feature>`
**PR Target**: `main`

| Area | Responsibility |
|------|---------------|
| **Auth** | Signup, login, JWT token management, `@jwt_required` decorator |
| **Trips CRUD** | Create, list trips for authenticated user |
| **Cities** | City search endpoint with filters |
| **Budget** | Budget calculation service + endpoint |
| **Share** | Generate share tokens, public trip view endpoint |

**Files Owned**:
- `backend/app/routes/auth.py`
- `backend/app/routes/trips.py` (POST, GET list)
- `backend/app/routes/cities.py`
- `backend/app/routes/share.py`
- `backend/app/services/budget.py`
- `backend/app/services/search.py`
- `backend/app/utils/validators.py` (shared, co-owned with Backend Dev 2)

**Endpoints**:
```
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
GET  /api/trips           (list user's trips)
POST /api/trips           (create trip)
GET  /api/cities           (search)
GET  /api/cities/:id
GET  /api/trips/:id/budget
POST /api/trips/:id/share
GET  /api/share/:token
```

---

### 🟡 Backend Dev 2 — Trip Detail + Stops + Activities + Itinerary

**Branch Prefix**: `backend-2/<feature>`
**PR Target**: `main`

| Area | Responsibility |
|------|---------------|
| **Trip Detail** | GET/PUT/DELETE single trip (full nested response) |
| **Stops CRUD** | Add/edit/delete/reorder stops within a trip |
| **Activities** | Activity search + assign/remove activities to stops |
| **Itinerary** | Full nested trip response (trip → stops → activities) |

**Files Owned**:
- `backend/app/routes/trips.py` (GET/:id, PUT/:id, DELETE/:id — **coordinate with Backend Dev 1**)
- `backend/app/routes/stops.py`
- `backend/app/routes/activities.py`

**Endpoints**:
```
GET    /api/trips/:id          (full nested detail)
PUT    /api/trips/:id          (update trip)
DELETE /api/trips/:id          (delete trip)
GET    /api/trips/:id/stops
POST   /api/trips/:id/stops
PUT    /api/stops/:id
DELETE /api/stops/:id
PUT    /api/trips/:id/stops/reorder
GET    /api/activities          (search with filters)
POST   /api/stops/:id/activities
DELETE /api/stops/:stopId/activities/:actId
```

> ⚠️ **Backend Dev 1 & 2 Coordination**: The `trips.py` route file is shared.
> **Solution**: Backend Dev 1 owns the top-level list/create. Backend Dev 2 owns single-trip detail/update/delete.
> Both must coordinate before editing `trips.py`. If conflicts arise, Daksh resolves.

---

### 🟣 Frontend Dev — All UI Screens + Stress Testing

**Branch Prefix**: `frontend/<feature>`
**PR Target**: `main`

| Area | Responsibility |
|------|---------------|
| **All 12 Screens** | Build every page listed in the problem statement |
| **API Integration** | Consume all backend endpoints via `services/api.js` |
| **State Management** | Zustand store for auth, current trip, UI state |
| **Styling** | Responsive design, visual polish, micro-animations |
| **Stress Testing** | Test every screen for edge cases before pushing |

**Files Owned**:
- `frontend/src/**` (entire frontend source)
- `frontend/Dockerfile`
- `frontend/package.json`
- `frontend/vite.config.js`

**Screens**:
```
1.  Login / Signup
2.  Dashboard / Home
3.  Create Trip
4.  My Trips (Trip List)
5.  Itinerary Builder
6.  Itinerary View
7.  City Search
8.  Activity Search
9.  Trip Budget & Cost Breakdown
10. Trip Calendar / Timeline
11. Shared/Public Itinerary View
12. User Profile / Settings
```

---

## 🐳 Docker Duties

| Who | Dockerfile | Build Command |
|-----|-----------|---------------|
| **Daksh** | `docker-compose.yml` | `docker compose up --build` |
| **Backend Dev 1** | `backend/Dockerfile` (primary author) | `docker build -t globetrotter-backend ./backend` |
| **Backend Dev 2** | Reviews & tests `backend/Dockerfile` | `docker build -t globetrotter-backend ./backend` |
| **Frontend Dev** | `frontend/Dockerfile` | `docker build -t globetrotter-frontend ./frontend` |

### Docker Image Tagging Convention
```bash
# Each member tags with their name/role
docker build -t globetrotter-backend:latest ./backend
docker build -t globetrotter-frontend:latest ./frontend

# Full stack via compose (Daksh manages)
docker compose up --build
```

---

## 📞 Communication Contract

1. **Before starting a new feature**: Comment in the team chat which endpoint(s) you're working on
2. **Before modifying a shared file** (e.g., `trips.py`, `__init__.py`): Ping the other owner
3. **Stuck for > 15 min**: Escalate to Daksh immediately — no silent struggling
4. **API contract changes**: Update `01-ARCHITECTURE.md` BEFORE implementing — Frontend Dev needs to know
