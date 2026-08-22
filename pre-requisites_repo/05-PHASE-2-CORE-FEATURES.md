# 📋 05 — Phase 2: Core Features (~3 hours)

> **Goal**: Auth working, users can create/list trips, add stops and activities — the core user journey.
> **This is the MOST CRITICAL phase. If only this works, we have a demo.**

---

## ⏰ Timeline

| Time | Daksh | Backend Dev 1 | Backend Dev 2 | Frontend Dev |
|------|-------|---------------|---------------|-------------|
| 0:00 – 1:00 | Debug auth endpoints as BD1 builds them | Auth (signup + login + /me) | Trip detail GET/:id (full nested) | Login + Signup pages |
| 1:00 – 2:00 | Debug trips + review PRs | Trips POST + GET list, Cities GET | Trip PUT, DELETE, Stops CRUD | Dashboard + Create Trip + My Trips |
| 2:00 – 3:00 | Debug stops/activities + seed data fixes | Cities search + filters | Activities search + assign to stops | Itinerary Builder + Itinerary View |

---

## ✅ Tasks

### 🟢 Daksh (Debug + DB Maintenance)

- [ ] **Debug auth endpoints** as Backend Dev 1 builds them
  - Test signup: valid email, duplicate email, missing fields, empty password
  - Test login: correct credentials, wrong password, non-existent email
  - Test /me: valid token, expired token, no token, malformed token
  - Verify password hashing works (never stored in plaintext)

- [ ] **Debug trip endpoints** as Backend Dev 1 & 2 build them
  - Test trip creation: valid data, missing name, invalid dates (end < start)
  - Test trip listing: only shows current user's trips (not other users')
  - Test trip detail: returns full nested data (stops → activities)
  - Test trip delete: cascades to stops and stop_activities

- [ ] **Debug stop endpoints** as Backend Dev 2 builds them
  - Test add stop: valid city_id, invalid city_id, duplicate city in trip
  - Test reorder: correct index updates, out-of-range indexes
  - Test delete: cascades to stop_activities

- [ ] **Fix seed data issues** — update if models changed during phase 2

- [ ] **Review & merge PRs** — enforce code quality gates from `08-CODE-QUALITY-GATES.md`

---

### 🔵 Backend Dev 1

#### Auth System (`backend/app/routes/auth.py`)

- [ ] **POST `/api/auth/signup`**
  ```python
  # Target: ~20 lines
  # 1. Validate with Pydantic (email, password, name)
  # 2. Check if email already exists → 409 Conflict
  # 3. Hash password with werkzeug.security.generate_password_hash
  # 4. Create user, commit
  # 5. Generate JWT token with flask_jwt_extended.create_access_token
  # 6. Return {user, token}
  ```

  > 💡 **Library shortcut**: `werkzeug.security` (already included with Flask) handles password hashing — DON'T write your own.

- [ ] **POST `/api/auth/login`**
  ```python
  # Target: ~15 lines
  # 1. Validate email + password
  # 2. Look up user by email → 401 if not found
  # 3. check_password_hash → 401 if wrong
  # 4. create_access_token(identity=user.id)
  # 5. Return {user, token}
  ```

- [ ] **GET `/api/auth/me`** (requires `@jwt_required()`)
  ```python
  # Target: ~8 lines
  # 1. get_jwt_identity() → user_id
  # 2. User.query.get(user_id) → 404 if not found
  # 3. Return {user}
  ```

#### Trips — Create & List (`backend/app/routes/trips.py`)

- [ ] **POST `/api/trips`** (requires `@jwt_required()`)
  ```python
  # Target: ~15 lines
  # Validate: name required, dates optional
  # user_id from JWT identity
  ```

- [ ] **GET `/api/trips`** (requires `@jwt_required()`)
  ```python
  # Target: ~8 lines
  # Trip.query.filter_by(user_id=current_user_id).all()
  # Return list of trip summaries (no nested stops)
  ```

  > ⏱️ **Time complexity**: O(n) where n = user's trip count. Fine for SQLite scale.

#### Cities — Search (`backend/app/routes/cities.py`)

- [ ] **GET `/api/cities`** with query params `?q=&country=&region=`
  ```python
  # Target: ~15 lines
  # Build filter dynamically
  # Use City.query.filter(City.name.ilike(f"%{q}%")) for search
  # Order by popularity DESC
  # Limit to 20 results
  ```

  > ⏱️ **Time complexity**: O(n) linear scan on SQLite. Acceptable for < 1000 cities.

- [ ] **GET `/api/cities/:id`** — return city + its activities
  ```python
  # Target: ~8 lines
  ```

- [ ] **PR**: `backend-1/auth` → `main` (after Daksh reviews)
- [ ] **PR**: `backend-1/trips-list` → `main`
- [ ] **PR**: `backend-1/cities` → `main`

---

### 🟡 Backend Dev 2

#### Trip Detail (`backend/app/routes/trips.py` — detail section)

- [ ] **GET `/api/trips/:id`** — full nested response
  ```python
  # Target: ~20 lines
  # Verify trip belongs to current user (or is_public)
  # Eager load: trip → stops (ordered by order_index) → stop_activities → activity
  # Return nested JSON
  ```

  > 💡 **Library shortcut**: Use `db.relationship(..., lazy='joined')` or explicit `joinedload()` to avoid N+1 queries.

  > ⏱️ **Time complexity**: O(S × A) where S = stops, A = avg activities per stop. With joinedload, it's 1-2 SQL queries total.

- [ ] **PUT `/api/trips/:id`** — partial update
  ```python
  # Target: ~15 lines
  # Only update fields that are provided in request body
  ```

- [ ] **DELETE `/api/trips/:id`** — cascade delete
  ```python
  # Target: ~8 lines
  # Verify ownership → delete → commit
  # SQLAlchemy cascade handles stops + stop_activities
  ```

#### Stops CRUD (`backend/app/routes/stops.py`)

- [ ] **GET `/api/trips/:id/stops`**
  ```python
  # Target: ~8 lines
  # Stop.query.filter_by(trip_id=trip_id).order_by(Stop.order_index).all()
  ```

- [ ] **POST `/api/trips/:id/stops`**
  ```python
  # Target: ~15 lines
  # Validate city_id exists
  # Auto-calculate order_index (max + 1 of existing stops)
  ```

- [ ] **PUT `/api/stops/:id`** — update dates, notes
  ```python
  # Target: ~12 lines
  ```

- [ ] **DELETE `/api/stops/:id`** — delete + re-index remaining stops
  ```python
  # Target: ~12 lines
  # After deletion, update order_index for remaining stops
  ```

- [ ] **PUT `/api/trips/:id/stops/reorder`**
  ```python
  # Target: ~10 lines
  # Accept ordered list of stop_ids, update order_index
  ```

  > ⏱️ **Time complexity**: O(n) where n = number of stops. Single transaction.

#### Activities — Search & Assign (`backend/app/routes/activities.py`)

- [ ] **GET `/api/activities`** with `?city_id=&category=&q=`
  ```python
  # Target: ~15 lines — similar pattern to cities search
  ```

- [ ] **POST `/api/stops/:id/activities`** — assign activity to stop
  ```python
  # Target: ~12 lines
  # Create StopActivity join record
  # Check unique constraint (no duplicate activity per stop)
  ```

- [ ] **DELETE `/api/stops/:stopId/activities/:actId`** — remove activity
  ```python
  # Target: ~8 lines
  ```

- [ ] **PR**: `backend-2/trip-detail` → `main`
- [ ] **PR**: `backend-2/stops` → `main`
- [ ] **PR**: `backend-2/activities` → `main`

---

### 🟣 Frontend Dev

> ⚠️ **STRESS TEST EVERY SCREEN** before committing. See `08-CODE-QUALITY-GATES.md` for the full checklist.

#### Auth Pages

- [ ] **Login page** (`pages/Login.jsx`)
  ```
  Fields: email, password
  Button: Login
  Link: "Don't have an account? Sign up"
  Error display: invalid credentials, empty fields
  On success: store token in Zustand, redirect to Dashboard
  ```
  - Target: ~40 lines (use a reusable form component)

- [ ] **Signup page** (`pages/Signup.jsx`)
  ```
  Fields: name, email, password, confirm password
  Button: Sign Up
  Link: "Already have an account? Login"
  Validation: passwords match, email format, min password length
  On success: auto-login, redirect to Dashboard
  ```
  - Target: ~45 lines

  > 💡 **Compact tip**: Login and Signup can share an `AuthForm` component — difference is just fields and API call.

#### Dashboard

- [ ] **Dashboard** (`pages/Dashboard.jsx`)
  ```
  Welcome message with user name
  "Plan New Trip" CTA button
  Recent trips cards (last 3-5)
  Popular cities grid (from /api/cities?limit=6)
  ```
  - Target: ~50 lines

#### Trip Management

- [ ] **Create Trip** (`pages/CreateTrip.jsx`)
  ```
  Form: trip name, description, start date, end date
  Button: "Create Trip"
  On success: redirect to Itinerary Builder for that trip
  ```
  - Target: ~35 lines

- [ ] **My Trips** (`pages/MyTrips.jsx`)
  ```
  Grid/list of trip cards
  Each card: name, date range, destination count
  Actions: View, Edit (→ Itinerary Builder), Delete (confirm modal)
  Empty state: "No trips yet — plan your first adventure!"
  ```
  - Target: ~45 lines

#### Itinerary (MOST COMPLEX — start early)

- [ ] **Itinerary Builder** (`pages/ItineraryBuilder.jsx`)
  ```
  Load trip + stops + activities (GET /api/trips/:id)
  "Add Stop" button → city search modal → POST stop
  For each stop: show city name, dates, activity list
  "Add Activity" → activity search modal → POST stop_activity
  Drag-to-reorder stops (stretch: use react-beautiful-dnd)
  Remove stop / activity buttons
  ```
  - Target: ~80 lines (largest component)

  > 💡 **Compact tip**: Use `sonner` for toast notifications on add/remove. Zustand for current trip state.

- [ ] **Itinerary View** (`pages/ItineraryView.jsx`)
  ```
  Read-only view of trip itinerary
  Grouped by stops, shows activities with cost & time
  Timeline/list toggle (stretch)
  ```
  - Target: ~50 lines

- [ ] **PR**: `frontend/auth-pages` → `main`
- [ ] **PR**: `frontend/dashboard-trips` → `main`
- [ ] **PR**: `frontend/itinerary` → `main`

---

## 🏁 Phase 2 Exit Criteria

- [ ] A user can sign up, log in, and their token persists (Zustand + localStorage)
- [ ] A user can create a trip with name and dates
- [ ] A user can see their trips list
- [ ] A user can add stops (cities) to a trip
- [ ] A user can add activities to stops
- [ ] A user can view the full itinerary (trip → stops → activities)
- [ ] All API endpoints return proper status codes and error messages
- [ ] Docker containers still build and run cleanly with new code
- [ ] Frontend handles loading states and error states
