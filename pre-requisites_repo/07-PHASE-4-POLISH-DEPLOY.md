# 📋 07 — Phase 4: Polish & Deploy (~1 hour)

> **Goal**: Stress test everything, fix bugs, polish UI, build final Docker images, prepare demo.
> **NO NEW FEATURES in this phase.** Only fixes and polish.

---

## ⏰ Timeline

| Time | Daksh | Backend Dev 1 | Backend Dev 2 | Frontend Dev |
|------|-------|---------------|---------------|-------------|
| 0:00 – 0:30 | Full backend stress test pass | Fix any bugs found | Fix any bugs found | UI polish + animations + responsive |
| 0:30 – 0:45 | Final Docker compose build & test | Final Dockerfile check | Help test frontend in Docker | Stress test all screens (see below) |
| 0:45 – 1:00 | Final merge, tag release, prep demo | Stand by for fixes | Stand by for fixes | Stand by for UI fixes |

---

## ✅ Tasks

### 🟢 Daksh (Full Stress Test)

#### Backend Stress Test Sweep

- [ ] **Auth stress test**
  | Test Case | Expected | Status |
  |-----------|----------|--------|
  | Signup with valid data | 201 + token | ☐ |
  | Signup duplicate email | 409 Conflict | ☐ |
  | Signup empty body | 400 Bad Request | ☐ |
  | Signup missing password | 400 | ☐ |
  | Login correct | 200 + token | ☐ |
  | Login wrong password | 401 | ☐ |
  | Login non-existent email | 401 | ☐ |
  | GET /me with valid token | 200 | ☐ |
  | GET /me with expired token | 401 | ☐ |
  | GET /me with no token | 401 | ☐ |

- [ ] **Trips stress test**
  | Test Case | Expected | Status |
  |-----------|----------|--------|
  | Create trip — valid | 201 | ☐ |
  | Create trip — no name | 400 | ☐ |
  | Create trip — end_date before start_date | 400 | ☐ |
  | List trips — returns only user's trips | 200 | ☐ |
  | List trips — 0 trips | 200, empty array | ☐ |
  | Get trip detail — own trip | 200 + nested | ☐ |
  | Get trip detail — other user's private trip | 404 or 403 | ☐ |
  | Delete trip — cascades to stops | 204 | ☐ |
  | Update trip — partial fields | 200 | ☐ |

- [ ] **Stops stress test**
  | Test Case | Expected | Status |
  |-----------|----------|--------|
  | Add stop — valid city_id | 201 | ☐ |
  | Add stop — invalid city_id | 400 or 404 | ☐ |
  | Reorder stops — valid | 200 | ☐ |
  | Reorder stops — mismatched IDs | 400 | ☐ |
  | Delete stop — reindexes remaining | 204 | ☐ |

- [ ] **Activities stress test**
  | Test Case | Expected | Status |
  |-----------|----------|--------|
  | Search activities — no filters | 200, paginated | ☐ |
  | Search activities — by category | 200, filtered | ☐ |
  | Assign activity to stop | 201 | ☐ |
  | Assign duplicate activity | 409 or 400 | ☐ |
  | Remove activity from stop | 204 | ☐ |

- [ ] **Budget stress test**
  | Test Case | Expected | Status |
  |-----------|----------|--------|
  | Budget — trip with 0 stops | 200, total=0 | ☐ |
  | Budget — trip with stops, 0 activities | 200, total=0 | ☐ |
  | Budget — full trip | 200, correct math | ☐ |
  | Budget — verify category aggregation | Correct grouping | ☐ |

- [ ] **Share stress test**
  | Test Case | Expected | Status |
  |-----------|----------|--------|
  | Share trip — generates token | 200 + token | ☐ |
  | Share trip — already shared (idempotent) | 200 + same token | ☐ |
  | Public view — valid token | 200 + full trip | ☐ |
  | Public view — invalid token | 404 | ☐ |
  | Public view — no auth header needed | Works without JWT | ☐ |

#### Final Docker Build

- [ ] `docker compose down -v` (clean volumes)
- [ ] `docker compose up --build` (fresh build)
- [ ] Verify backend: `http://localhost:5000/api/health`
- [ ] Verify frontend: `http://localhost:5173`
- [ ] Run full user journey in Docker:
  1. Sign up
  2. Create trip
  3. Add 3 stops
  4. Add activities to each stop
  5. View itinerary
  6. Check budget
  7. Share trip
  8. Open share link in incognito (no auth)

---

### 🔵 Backend Dev 1 — Bug Fixes

- [ ] Fix any bugs found during Daksh's stress test
- [ ] Ensure all error responses have consistent shape: `{"error": "message"}`
- [ ] Verify `requirements.txt` has exact versions pinned
- [ ] Final `docker build -t globetrotter-backend ./backend` succeeds
- [ ] Remove any `print()` debug statements — use `app.logger` if needed

---

### 🟡 Backend Dev 2 — Bug Fixes + Help Test

- [ ] Fix any bugs found during stress testing
- [ ] Help test frontend ↔ backend integration in Docker
- [ ] Verify cascade deletes work correctly end-to-end
- [ ] Check for any N+1 query issues (check Flask debug logs for excessive queries)

---

### 🟣 Frontend Dev — UI Polish + Stress Test

#### UI Polish Checklist

- [ ] **Typography**: Use Inter/Roboto from Google Fonts (not browser defaults)
- [ ] **Color palette**: Consistent theme (not random colors)
- [ ] **Loading states**: Spinner or skeleton on every API call
- [ ] **Empty states**: Meaningful message when no data (not blank page)
- [ ] **Error states**: Toast notification on API errors (sonner)
- [ ] **Success states**: Toast notification on create/update/delete
- [ ] **Responsive**: Test at 375px (mobile), 768px (tablet), 1440px (desktop)
- [ ] **Hover effects**: Buttons, cards, interactive elements
- [ ] **Transitions**: Smooth page transitions, modal open/close
- [ ] **Favicon**: Set a favicon (even a generic globe emoji)

#### Frontend Stress Test Sweep

- [ ] **Login/Signup stress test**
  | Test | Expected |
  |------|----------|
  | Submit empty form | Validation error shown |
  | Spam submit button 10x rapidly | Only 1 API call (disable button on loading) |
  | Paste very long email (500 chars) | Handled gracefully |
  | Login → navigate to protected page → refresh | Still logged in (localStorage) |
  | Logout → press back button | Redirected to login, not dashboard |

- [ ] **Dashboard stress test**
  | Test | Expected |
  |------|----------|
  | 0 trips, 0 cities | Shows empty states, not broken layout |
  | API down (stop backend) | Error message, not white screen |
  | Slow network (throttle in DevTools) | Loading spinner shown |

- [ ] **Itinerary Builder stress test**
  | Test | Expected |
  |------|----------|
  | Add 10+ stops rapidly | All render correctly |
  | Add same city twice | Handled (show warning or allow) |
  | Remove all stops | Empty state shown |
  | Add 20+ activities to one stop | Scrollable, no layout break |
  | Refresh page mid-edit | Data persists (fetched from API) |

- [ ] **Budget page stress test**
  | Test | Expected |
  |------|----------|
  | Trip with $0 total | Charts show 0, no divide-by-zero |
  | Trip with 1 category | Pie chart shows 1 slice correctly |
  | Very large numbers ($999,999) | Formatted, no overflow |

- [ ] **Share page stress test**
  | Test | Expected |
  |------|----------|
  | Open share link logged out | Works without auth |
  | Share link for non-existent token | 404 page, not crash |
  | Share link for private trip (no token) | 404 page |

- [ ] **PR**: `frontend/polish` → `main` (FINAL PR)

---

## 🏁 Phase 4 Exit Criteria (SHIP IT ✅)

- [ ] **Full user journey works end-to-end** (signup → trip → itinerary → budget → share)
- [ ] **Docker images build cleanly**: `docker compose up --build` from clean state
- [ ] **No console errors** in browser DevTools
- [ ] **No unhandled exceptions** in backend logs
- [ ] **Responsive design** works on mobile width
- [ ] **Seed data** populates on first run
- [ ] **All stress tests pass** (backend + frontend)
- [ ] **README.md** updated with:
  - Project description
  - How to run (Docker + local fallback)
  - Tech stack
  - Team members
  - Screenshots (stretch)
