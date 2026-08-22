# 🧪 08 — Code Quality Gates

> **The 3 questions every team member must ask before writing any code.**
> **The stress testing protocol for Frontend Dev and Daksh (Debugger).**

---

## 🚦 The 3 Mandatory Questions

Before implementing ANYTHING — a function, an endpoint, a component — stop and ask:

### Question 1: "Do I really need this many lines of code?"

```
❌ BAD: 30-line function with manual validation
✅ GOOD: 10-line function using Pydantic schema

❌ BAD: Custom date formatting with string manipulation
✅ GOOD: datetime.strftime() or .isoformat() — 1 line

❌ BAD: Manual JSON serialization with nested loops
✅ GOOD: to_dict() method on model + list comprehension — 1 line
```

**Compactness targets per file type**:

| File Type | Max Lines | If Over, Ask Why |
|-----------|-----------|-----------------|
| Model file (1 table) | 25 lines | Are there unnecessary methods? |
| Route file (1 resource) | 60 lines | Can logic move to a service? |
| Service file | 40 lines | Can it use a library? |
| React page component | 80 lines | Can parts become reusable components? |
| React component | 40 lines | Is it doing too many things? |
| Utility/helper | 20 lines | Is this already in a library? |
| Config file | 15 lines | Are there hardcoded values that should be in .env? |

---

### Question 2: "Is there a library that does this in fewer lines?"

**Common traps and their library solutions**:

| Task | ❌ DIY Lines | ✅ Library | ✅ Lines |
|------|------------|-----------|---------|
| Password hashing | 15+ (custom salt + hash) | `werkzeug.security` | 2 |
| JWT auth | 50+ (manual token gen/verify) | `flask-jwt-extended` | 5 per endpoint |
| Request validation | 20+ (manual checks) | `pydantic` | 5 (schema class) |
| Mock data generation | 40+ (manual dicts) | `faker` | 3 |
| HTTP client setup | 15+ (fetch + error handling) | `axios` | 5 |
| Global state | 30+ (React context) | `zustand` | 8 |
| Toast notifications | 20+ (custom component) | `sonner` | 1 per toast |
| Charts | 100+ (custom SVG) | `recharts` | 15 per chart |
| Icons | N/A (download SVGs manually) | `lucide-react` | 1 per icon |
| Debounced search | 10+ (custom hook) | Custom 3-line hook | 3 |

**Rule**: If a library can do it in < 5 lines, USE THE LIBRARY. Don't reinvent the wheel during a hackathon.

---

### Question 3: "What's the time complexity?"

| Operation | Acceptable | Flag If | Optimization |
|-----------|-----------|---------|-------------|
| List user's trips | O(n) where n = user's trips | n > 1000 | Paginate |
| Search cities | O(n) linear scan | n > 5000 | Add SQLite index on `name` |
| Get trip detail | O(S × A) | S > 50, A > 50 | Use `joinedload()` |
| Budget calculation | O(S × A) | S > 50, A > 50 | Single query with joins |
| Reorder stops | O(n) where n = stops | n > 100 | Already optimal |
| City search (ILIKE) | O(n) full scan | n > 10000 | FTS5 (stretch) |

**For this hackathon**: SQLite with < 1000 records per table means ANY algorithm is fast enough. Focus on correctness, not premature optimization.

**However, avoid these anti-patterns**:
```python
# ❌ N+1 Query (1 query per stop to get activities)
for stop in stops:
    stop.activities = StopActivity.query.filter_by(stop_id=stop.id).all()

# ✅ Eager loading (1-2 queries total)
trip = Trip.query.options(
    joinedload(Trip.stops).joinedload(Stop.stop_activities).joinedload(StopActivity.activity)
).get(trip_id)
```

```javascript
// ❌ Multiple sequential API calls
const trips = await getTrips();
for (const trip of trips) {
  trip.stops = await getStops(trip.id);  // N+1 API calls!
}

// ✅ Single API call with nested data
const trip = await getTripDetail(tripId);  // Returns stops + activities
```

---

## 🔨 Stress Testing Protocol

### Who Must Stress Test

| Role | What to Stress Test | When |
|------|-------------------|------|
| **Daksh (Debugger)** | ALL backend endpoints | Before merging any PR + Phase 4 sweep |
| **Frontend Dev** | ALL frontend screens | Before every `git push` + Phase 4 sweep |
| Backend Devs 1 & 2 | Their own endpoints (basic) | Before creating PR |

---

### Backend Stress Test Methodology (Daksh)

#### Tool: Thunder Client, Postman, or curl

For EVERY endpoint, test these categories:

**1. Happy Path** ✅
- Valid request with all required fields → expected success response

**2. Missing/Invalid Fields** ❌
```bash
# Missing required field
curl -X POST /api/trips -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: 400 with clear error message

# Wrong data type
curl -X POST /api/trips -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": 123}'
# Expected: 400 or type-coerced gracefully
```

**3. Auth Edge Cases** 🔐
```bash
# No token
curl -X GET /api/trips
# Expected: 401

# Invalid token
curl -X GET /api/trips -H "Authorization: Bearer fake_token"
# Expected: 401 or 422

# Accessing another user's resource
curl -X GET /api/trips/999 -H "Authorization: Bearer $OTHER_USER_TOKEN"
# Expected: 404 or 403
```

**4. Boundary Values** 📏
```bash
# Empty string name
{"name": ""}

# Very long name (1000 chars)
{"name": "A" * 1000}

# Special characters
{"name": "Trip <script>alert('xss')</script>"}

# Unicode
{"name": "旅行 🌍 Ÿ"}
```

**5. Concurrent Writes** ⚡
```bash
# Open 2 terminals, run simultaneously:
# Terminal 1:
curl -X DELETE /api/trips/1 -H "Authorization: Bearer $TOKEN"
# Terminal 2:
curl -X PUT /api/trips/1 -H "Authorization: Bearer $TOKEN" -d '{"name": "Updated"}'
# Expected: One succeeds, one gets 404 — no crash or corruption
```

---

### Frontend Stress Test Methodology (Frontend Dev)

For EVERY screen, test these categories:

**1. Empty States** 📭
- What shows when there's no data? (0 trips, 0 cities, etc.)
- Is there a helpful message or just a blank page?

**2. Loading States** ⏳
- Is there a spinner/skeleton while API calls are in-flight?
- Use Chrome DevTools → Network → Slow 3G to test

**3. Error States** 💥
- Stop the backend → open the page → does it show an error or crash?
- Send a request that returns 500 → does the UI handle it?

**4. Rapid Interactions** 🐇
- Click "Submit" 10 times rapidly → does it create 10 records or just 1?
  - **Fix**: Disable button during loading, use a `isSubmitting` flag
- Click "Delete" then "Edit" immediately → race condition?
- Type very fast in search → does it debounce correctly?

**5. Extreme Data** 📊
- What if a trip has 20 stops? Does the layout break?
- What if a city name is 100 characters? Does it overflow?
- What if budget is $999,999.99? Does the chart render?
- What if budget is $0? Does the pie chart show empty or crash?

**6. Navigation Edge Cases** 🧭
- Refresh on any page → does it recover? (no white screen)
- Use browser back/forward → does routing work?
- Direct URL access (paste URL into new tab) → does it load?
- Logout → press back button → should redirect to login, not show cached data

**7. Viewport Sizes** 📱
```
375px   (iPhone SE)
414px   (iPhone 14)
768px   (iPad)
1024px  (Small laptop)
1440px  (Standard desktop)
1920px  (Full HD)
```

---

## 📝 Code Review Checklist (Daksh uses this for PR reviews)

```
FUNCTIONALITY
□ Does it do what it claims?
□ Are edge cases handled?
□ Are errors returned with proper HTTP status codes?
□ Does it follow the API contract in 01-ARCHITECTURE.md?

COMPACTNESS
□ Under the line limit for its file type?
□ No code that a library could handle?
□ No duplicated logic (DRY)?
□ No dead code or commented-out code?

SECURITY
□ No hardcoded secrets?
□ Auth required where it should be?
□ User can only access their own data?
□ Input validated (Pydantic or manual checks)?

PERFORMANCE
□ No N+1 queries?
□ No unnecessary API calls from frontend?
□ Images/assets optimized?

STYLE
□ Follows commit message convention?
□ No console.log / print() debugging?
□ Consistent naming (snake_case for Python, camelCase for JS)?
□ Functions are named descriptively?
```

---

## 🚨 "Stop the Line" Rules

If any of these happen, **STOP and fix immediately** before continuing:

1. ❌ `docker compose up --build` fails
2. ❌ An endpoint returns 500 Internal Server Error
3. ❌ Frontend shows a white screen (React error boundary not catching)
4. ❌ Data corruption (wrong user sees another user's trips)
5. ❌ Password stored in plaintext
6. ❌ `.env` file committed to Git
