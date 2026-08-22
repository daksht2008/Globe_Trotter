# 🌍 GlobeTrotter — Project Hub & Navigation

> **Odoo x LDCE Hackathon — Virtual Round**
> Master index for all team documentation, workflows, and task assignments.

---

## 📚 Document Map

| # | Document | Purpose | Who Reads It |
|---|----------|---------|-------------|
| 00 | **[📍 This File](./00-PROJECT-HUB.md)** | Master navigation & project overview | Everyone |
| 01 | **[🏗️ Architecture](./01-ARCHITECTURE.md)** | Tech stack, folder structure, API contract, DB schema | Everyone |
| 02 | **[👥 Team Roles](./02-TEAM-ROLES.md)** | Who does what, branch names, PR rules, Docker duties | Everyone |
| 03 | **[🔁 Git & Docker Workflow](./03-GIT-DOCKER-WORKFLOW.md)** | Branch strategy, commit conventions, PR checklist, Docker build flow | Everyone |
| 04 | **[📋 Phase 1 — Foundation](./04-PHASE-1-FOUNDATION.md)** | DB schema, project scaffold, Docker setup | All |
| 05 | **[📋 Phase 2 — Core Features](./05-PHASE-2-CORE-FEATURES.md)** | Auth, CRUD trips, itinerary builder | Backend + Frontend |
| 06 | **[📋 Phase 3 — Advanced Features](./06-PHASE-3-ADVANCED-FEATURES.md)** | Search, budget, calendar, sharing | Backend + Frontend |
| 07 | **[📋 Phase 4 — Polish & Deploy](./07-PHASE-4-POLISH-DEPLOY.md)** | Stress testing, bug fixes, UI polish, final Docker images | All |
| 08 | **[🧪 Code Quality Gates](./08-CODE-QUALITY-GATES.md)** | LOC review, library check, time complexity, stress testing protocol | Everyone |

---

## 🎯 Project Summary

**GlobeTrotter** — A personalized travel planning app where users can:
- Create multi-city itineraries with dates, activities, and budgets
- Search cities & activities, view cost breakdowns
- Visualize trips on calendars/timelines
- Share plans publicly or with friends

---

## 🏗️ Tech Stack (Quick Ref)

| Layer | Tech | Port |
|-------|------|------|
| Backend | Python 3.14 + Flask 3.x | `5000` |
| Database | SQLite 3 (via Flask-SQLAlchemy) | embedded |
| Frontend | React 18/19 (Vite) | `5173` |
| Containers | Docker + Docker Compose | — |
| Auth | Flask-JWT-Extended | — |

---

## 👥 Team (4 Members)

| Role | Branch | PR Required? | Docker Duty |
|------|--------|-------------|-------------|
| **Daksh** — Team Lead, DB + Debug | `main` (direct push) | ❌ No | `docker-compose.yml` + DB volume |
| **Backend Dev 1** | `backend-1/<feature>` | ✅ Yes | `backend/Dockerfile` |
| **Backend Dev 2** | `backend-2/<feature>` | ✅ Yes | Shares backend Dockerfile |
| **Frontend Dev** | `frontend/<feature>` | ✅ Yes | `frontend/Dockerfile` |

---

## 🚦 Phase Overview

```
Phase 1 ─── Foundation (DB + Scaffold + Docker)     ── ~2 hrs
Phase 2 ─── Core Features (Auth + Trips + Itinerary) ── ~3 hrs
Phase 3 ─── Advanced (Search + Budget + Share)        ── ~2 hrs
Phase 4 ─── Polish & Deploy (Test + Fix + Ship)       ── ~1 hr
```

---

## ⚡ Quick Commands

```bash
# Start everything
docker compose up --build

# Rebuild single service
docker compose up --build backend
docker compose up --build frontend

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop everything
docker compose down
```

---

> **Rule #1**: Before writing ANY code, ask yourself:
> 1. *Do I really need this many lines?*
> 2. *Is there a library that does it in fewer lines?*
> 3. *What's the time complexity?*
