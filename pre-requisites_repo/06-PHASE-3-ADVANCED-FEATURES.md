# 📋 06 — Phase 3: Advanced Features (~2 hours)

> **Goal**: Search, budget breakdowns, calendar view, sharing — the features that make judges go "wow."
> **Only start Phase 3 when Phase 2 is fully working.**

---

## ⏰ Timeline

| Time | Daksh | Backend Dev 1 | Backend Dev 2 | Frontend Dev |
|------|-------|---------------|---------------|-------------|
| 0:00 – 1:00 | Debug budget logic + review PRs | Budget endpoint | Stops reorder polish | City Search + Activity Search pages |
| 1:00 – 2:00 | Debug share flow + stress test | Share endpoints | Help Daksh stress test all APIs | Budget page + Calendar page + Share page |

---

## ✅ Tasks

### 🟢 Daksh (Debug + DB)

- [ ] **Debug budget calculation**
  - Verify cost aggregation: per stop, per category, total
  - Test with 0 activities, 1 activity, many activities
  - Test with activities that have `cost_estimate = 0` or `NULL`
  - Verify currency consistency (everything in USD)

- [ ] **Debug share flow**
  - Test share token generation (UUID uniqueness)
  - Test public endpoint returns full trip without auth
  - Test invalid/expired tokens → 404
  - Test that private trips aren't accessible via share endpoint without token

- [ ] **Update seed data** if new categories or activity types needed for demo

- [ ] **Stress test ALL backend endpoints** (see `08-CODE-QUALITY-GATES.md`)

---

### 🔵 Backend Dev 1

#### Budget Endpoint (`backend/app/services/budget.py` + `backend/app/routes/trips.py`)

- [ ] **GET `/api/trips/:id/budget`**
  ```python
  # Target: ~25 lines for service, ~8 lines for route
  #
  # Response shape:
  # {
  #   "total_cost": 1450.00,
  #   "by_stop": [
  #     {
  #       "stop_id": 1,
  #       "city": "Paris",
  #       "cost": 650.00,
  #       "activities": [
  #         {"name": "Eiffel Tower", "cost": 25.00, "category": "sightseeing"},
  #         ...
  #       ]
  #     }
  #   ],
  #   "by_category": {
  #     "sightseeing": 200.00,
  #     "food": 300.00,
  #     "adventure": 150.00,
  #     ...
  #   },
  #   "avg_per_day": 120.83,
  #   "num_days": 12
  # }
  ```

  > ⏱️ **Time complexity**: O(S × A) — one pass through stops and their activities. Single query with joinedload.

  > 💡 **Compact approach**: Use `itertools.groupby` or a dict comprehension for `by_category` aggregation — avoid manual loops.

#### Share Endpoints

- [ ] **POST `/api/trips/:id/share`** (requires `@jwt_required()`)
  ```python
  # Target: ~10 lines
  # 1. Verify trip belongs to user
  # 2. Generate share_token = uuid4().hex[:12] (short, URL-friendly)
  # 3. Set trip.is_public = True, trip.share_token = token
  # 4. Return { share_token, url: f"/share/{token}" }
  ```

- [ ] **GET `/api/share/:token`** (NO auth required)
  ```python
  # Target: ~10 lines
  # Trip.query.filter_by(share_token=token, is_public=True).first_or_404()
  # Return full nested trip (same format as GET /api/trips/:id)
  ```

- [ ] **PR**: `backend-1/budget` → `main`
- [ ] **PR**: `backend-1/share` → `main`

---

### 🟡 Backend Dev 2

#### Polish Stops Reorder

- [ ] **Improve reorder robustness**
  - Validate all stop_ids belong to the trip
  - Validate no duplicates in the list
  - Handle partial reorder (subset of stops)
  - Wrap in a single transaction

- [ ] **Help Daksh stress test all endpoints**
  - Run through every endpoint with edge cases
  - Test concurrent requests (open 2 terminals, hit same endpoint simultaneously)
  - Verify no data corruption under concurrent writes

- [ ] **Add any missing validation** across stop/activity endpoints
  - Verify stop belongs to current user's trip before allowing modification
  - Verify activity exists before assigning

- [ ] **PR**: `backend-2/phase3-polish` → `main`

---

### 🟣 Frontend Dev

> ⚠️ **STRESS TEST every screen before committing.** Edge cases, empty states, rapid clicking, network errors.

#### City Search (`pages/CitySearch.jsx`)

- [ ] **City Search page**
  ```
  Search bar (debounced — 300ms delay before API call)
  Filter by country/region dropdown
  City cards: name, country, cost index badge, popularity stars, image
  "Add to Trip" button → select which trip → POST stop
  Empty state: "No cities found matching your search"
  ```
  - Target: ~50 lines

  > 💡 **Compact tip**: Use a custom `useDebounce` hook (3 lines with `useEffect + setTimeout`). Don't install a library for this.

#### Activity Search (`pages/ActivitySearch.jsx`)

- [ ] **Activity Search page**
  ```
  Filter by: category (tabs/pills), cost range, city
  Activity cards: name, category badge, cost, duration, description snippet
  "Add to Stop" / "Remove" toggle
  Quick preview on hover/click
  ```
  - Target: ~50 lines

#### Trip Budget (`pages/TripBudget.jsx`)

- [ ] **Budget & Cost Breakdown page**
  ```
  Total cost hero number
  Pie/donut chart by category (recharts PieChart)
  Bar chart: cost per stop (recharts BarChart)
  Average cost per day
  Table: detailed breakdown by stop → activities
  Overbudget alert if > user's threshold (stretch)
  ```
  - Target: ~60 lines

  > 💡 **Library**: `recharts` — PieChart + BarChart components are ~15 lines each. Don't build custom SVG charts.

#### Trip Calendar (`pages/TripCalendar.jsx`)

- [ ] **Calendar / Timeline page**
  ```
  Vertical timeline showing each day
  Each day: city name, activities scheduled
  Color-coded by city
  Expandable day sections
  ```
  - Target: ~55 lines

  > 💡 **Compact approach**: Don't use a full calendar library. Build a simple vertical timeline with date iteration using `Date` objects. A full-blown calendar lib (like `react-big-calendar`) is overkill and adds 200KB.

#### Shared View (`pages/SharedView.jsx`)

- [ ] **Public itinerary view**
  ```
  Fetch via /api/share/:token (no auth)
  Read-only version of Itinerary View
  "Copy Trip" button (stretch — requires auth)
  Social share buttons (stretch — just link copy)
  Clean, presentation-quality layout
  ```
  - Target: ~40 lines (reuse ItineraryView component)

  > 💡 **Compact tip**: SharedView is essentially `<ItineraryView readOnly={true} />` — don't duplicate the component.

#### Profile (`pages/Profile.jsx`)

- [ ] **User Profile page**
  ```
  Display name, email
  Edit name (stretch)
  Trip stats: total trips, total destinations, total activities
  ```
  - Target: ~30 lines

- [ ] **PR**: `frontend/search` → `main`
- [ ] **PR**: `frontend/budget-calendar` → `main`
- [ ] **PR**: `frontend/share-profile` → `main`

---

## 🏁 Phase 3 Exit Criteria

- [ ] City search with filters works and returns results
- [ ] Activity search with filters works
- [ ] Budget page shows accurate cost breakdown with charts
- [ ] Calendar/timeline displays trip day-by-day
- [ ] Share link generates and public view loads without auth
- [ ] All new features work inside Docker containers
- [ ] No regressions in Phase 2 features
- [ ] Frontend handles all edge cases (empty data, loading, errors)
