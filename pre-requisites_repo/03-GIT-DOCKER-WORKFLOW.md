# 🔁 03 — Git & Docker Workflow

> Branch strategy, commit conventions, PR process, Docker build flow.

---

## 🌳 Branch Strategy

```
main ─────────────────────────────────────────────────► (Daksh pushes directly)
  │
  ├── backend-1/auth ──────► PR → main
  ├── backend-1/trips ─────► PR → main
  ├── backend-1/cities ────► PR → main
  ├── backend-1/budget ────► PR → main
  ├── backend-1/share ─────► PR → main
  │
  ├── backend-2/trip-detail ► PR → main
  ├── backend-2/stops ──────► PR → main
  ├── backend-2/activities ─► PR → main
  │
  ├── frontend/auth-pages ──► PR → main
  ├── frontend/dashboard ───► PR → main
  ├── frontend/trips ───────► PR → main
  ├── frontend/itinerary ──► PR → main
  ├── frontend/search ─────► PR → main
  ├── frontend/budget-cal ──► PR → main
  └── frontend/share-profile► PR → main
```

---

## 📝 Branch Naming Convention

```
<role>/<feature-name>

# Examples:
backend-1/auth
backend-1/trips-crud
backend-2/stops-reorder
frontend/login-signup
frontend/itinerary-builder
```

---

## ✍️ Commit Message Convention

```
<type>: <short description>

# Types:
feat:     New feature
fix:      Bug fix
refactor: Code restructuring (no new feature, no bug fix)
style:    CSS/formatting changes
docs:     Documentation only
test:     Adding/updating tests
chore:    Build, config, deps changes
```

**Examples**:
```
feat: add JWT login/signup endpoints
fix: trip delete cascade not removing stops
refactor: extract budget calc into service layer
style: dashboard responsive grid layout
chore: add flask-jwt-extended to requirements.txt
```

---

## 🔄 Pull Request Process (Backend Devs 1 & 2, Frontend Dev)

### Step 1: Create branch & work
```bash
# Pull latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b backend-1/auth

# Work, commit often
git add .
git commit -m "feat: add signup endpoint with password hashing"
```

### Step 2: Push & create PR
```bash
# Push branch
git push origin backend-1/auth

# Create PR via GitHub UI or CLI
# Title: "feat: JWT auth (signup + login + /me)"
# Description: List endpoints, link to architecture doc
```

### Step 3: PR Description Template
```markdown
## What does this PR do?
Brief description of the feature/fix.

## Endpoints Added/Modified
- `POST /api/auth/signup` — creates user, returns JWT
- `POST /api/auth/login` — validates credentials, returns JWT

## Files Changed
- `backend/app/routes/auth.py` (new)
- `backend/requirements.txt` (added flask-jwt-extended)

## Code Compactness Checklist
- [ ] Asked: "Do I really need this many lines?"
- [ ] Asked: "Is there a library that does this in fewer lines?"
- [ ] Asked: "What's the time complexity?"

## Testing Done
- [ ] Tested with Thunder Client / Postman
- [ ] Tested edge cases (empty body, duplicate email, wrong password)
- [ ] Docker build succeeds: `docker build -t globetrotter-backend ./backend`

## For Frontend Dev / Debugger (Daksh) Only:
- [ ] Stress tested all edge cases
- [ ] Tested with rapid successive requests
- [ ] Tested with malformed/extreme input
```

### Step 4: Review by Daksh
- Daksh reviews the PR
- Checks code quality (see `08-CODE-QUALITY-GATES.md`)
- Runs the code locally or in Docker
- Merges or requests changes

---

## 🐳 Docker Build Flow

### Per-Member Docker Image Build

Each member must verify their Docker image builds **before** pushing code:

```bash
# Backend (Backend Dev 1 — primary Dockerfile author, Backend Dev 2 tests it)
cd backend
docker build -t globetrotter-backend:latest .
docker run --rm -p 5000:5000 globetrotter-backend:latest

# Verify: curl http://localhost:5000/api/health
# Expected: {"status": "healthy"}

# Frontend (Frontend Dev)
cd frontend
docker build -t globetrotter-frontend:latest .
docker run --rm -p 5173:5173 globetrotter-frontend:latest

# Verify: open http://localhost:5173 in browser
```

### Full Stack (Daksh)
```bash
# From repo root
docker compose up --build

# Verify both services:
# Backend:  http://localhost:5000/api/health
# Frontend: http://localhost:5173
```

---

## 🛡️ Pre-Push Checklist (EVERYONE)

Before every `git push`, verify:

```
□ Code runs locally without errors
□ No hardcoded secrets/passwords (use .env)
□ .gitignore covers: node_modules/, __pycache__/, instance/*.db, .env, venv/
□ Docker image builds successfully
□ No console.log / print() debugging left in code (except logger)
```

### Additional for Frontend Dev:
```
□ All screens render without JS errors
□ Tested on different viewport sizes (mobile, tablet, desktop)
□ Stress tested: rapid clicking, empty states, 0 items, 100+ items
□ Network errors handled gracefully (API down, timeout)
□ No broken images or missing assets
```

### Additional for Daksh (Debugger):
```
□ All backend endpoints return correct status codes
□ Edge cases: empty body, missing fields, invalid types
□ SQL injection attempts handled (SQLAlchemy parameterizes by default)
□ Concurrent requests don't corrupt data
□ DB schema matches 01-ARCHITECTURE.md
```

---

## 🔀 Merge Conflict Resolution

1. **Prevention**: Each member works on separate files (see `02-TEAM-ROLES.md`)
2. **Shared files** (`trips.py`, `requirements.txt`, `package.json`):
   - Always `git pull origin main` before starting work
   - Keep changes minimal and scoped
3. **If conflict occurs**:
   - The PR author resolves the conflict
   - Daksh reviews the resolution
   - Never force-push to someone else's branch

---

## 📊 Development Loop (Repeat Per Feature)

```
┌──────────────────────────────────────────────────┐
│  1. Pull latest main                             │
│  2. Create feature branch                        │
│  3. Code the feature (ask the 3 questions!)      │
│  4. Test locally                                 │
│  5. Docker build succeeds?                       │
│     ├── YES → Continue                           │
│     └── NO  → Fix, go to step 4                  │
│  6. Stress test (Frontend + Debugger roles)      │
│  7. Commit with convention                       │
│  8. Push branch                                  │
│  9. Create PR with template                      │
│ 10. Daksh reviews & merges                       │
│ 11. Pull latest main, start next feature         │
└──────────────────────────────────────────────────┘
```
