# 🏗️ 01 — Architecture & Technical Design

> GlobeTrotter system architecture, database schema, API contract, and folder structure.

---

## 📁 Repository Structure

```
globetrotter/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── config.py            # Config (DB URI, JWT secret, etc.)
│   │   ├── models/              # SQLAlchemy models (1 file per table)
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── trip.py
│   │   │   ├── stop.py
│   │   │   ├── activity.py
│   │   │   └── city.py
│   │   ├── routes/              # Flask blueprints (1 file per resource)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # /api/auth/*
│   │   │   ├── trips.py         # /api/trips/*
│   │   │   ├── stops.py         # /api/stops/*
│   │   │   ├── activities.py    # /api/activities/*
│   │   │   ├── cities.py        # /api/cities/*
│   │   │   └── share.py         # /api/share/*
│   │   ├── services/            # Business logic (keeps routes thin)
│   │   │   ├── __init__.py
│   │   │   ├── budget.py
│   │   │   └── search.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── validators.py    # Pydantic schemas
│   │       └── seed.py          # Faker-based mock data seeder
│   ├── instance/
│   │   └── app.db               # SQLite file (auto-generated, gitignored)
│   ├── tests/                   # pytest test files
│   │   ├── test_auth.py
│   │   ├── test_trips.py
│   │   └── conftest.py
│   ├── .env.example
│   ├── Dockerfile
│   ├── requirements.txt
│   └── run.py                   # Entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── TripCard.jsx
│   │   │   ├── ActivityCard.jsx
│   │   │   ├── CityCard.jsx
│   │   │   ├── BudgetChart.jsx
│   │   │   └── Modal.jsx
│   │   ├── pages/               # One file per screen
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateTrip.jsx
│   │   │   ├── MyTrips.jsx
│   │   │   ├── ItineraryBuilder.jsx
│   │   │   ├── ItineraryView.jsx
│   │   │   ├── CitySearch.jsx
│   │   │   ├── ActivitySearch.jsx
│   │   │   ├── TripBudget.jsx
│   │   │   ├── TripCalendar.jsx
│   │   │   ├── SharedView.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/
│   │   │   └── api.js           # Axios instance + all API calls
│   │   ├── store/
│   │   │   └── useStore.js      # Zustand global state
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── .gitignore
├── 00-PROJECT-HUB.md
├── 01-ARCHITECTURE.md           # ← This file
├── ...                          # Other workflow docs
└── README.md
```

---

## 🗄️ Database Schema (SQLite)

> **Owner**: Daksh (Team Lead)
> All models use `Flask-SQLAlchemy`. Auto-incrementing integer PKs. UTC timestamps.

### Entity-Relationship Diagram

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌──────────────┐
│  User   │──1:N──│  Trip  │──1:N──│  Stop  │──1:N──│StopActivity│
└─────────┘     └─────────┘     └─────────┘     └──────────────┘
                                     │                    │
                                     │ N:1                │ N:1
                                     ▼                    ▼
                                ┌─────────┐        ┌──────────┐
                                │  City   │        │ Activity │
                                └─────────┘        └──────────┘
```

### Table Definitions

#### `users`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INTEGER | PK, AUTO | — |
| `email` | VARCHAR(120) | UNIQUE, NOT NULL | Login identifier |
| `password_hash` | VARCHAR(256) | NOT NULL | Werkzeug `generate_password_hash` |
| `name` | VARCHAR(100) | NOT NULL | Display name |
| `created_at` | DATETIME | DEFAULT NOW | UTC |

#### `trips`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INTEGER | PK, AUTO | — |
| `user_id` | INTEGER | FK → users.id, NOT NULL | Owner |
| `name` | VARCHAR(200) | NOT NULL | Trip title |
| `description` | TEXT | NULLABLE | Optional description |
| `start_date` | DATE | NULLABLE | Trip start |
| `end_date` | DATE | NULLABLE | Trip end |
| `is_public` | BOOLEAN | DEFAULT FALSE | Sharing toggle |
| `share_token` | VARCHAR(64) | UNIQUE, NULLABLE | UUID for public link |
| `cover_url` | VARCHAR(500) | NULLABLE | Cover photo URL |
| `created_at` | DATETIME | DEFAULT NOW | — |
| `updated_at` | DATETIME | ON UPDATE NOW | — |

#### `cities` (pre-seeded reference data)
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INTEGER | PK, AUTO | — |
| `name` | VARCHAR(100) | NOT NULL | City name |
| `country` | VARCHAR(100) | NOT NULL | Country |
| `region` | VARCHAR(100) | NULLABLE | Continent/region |
| `cost_index` | FLOAT | DEFAULT 1.0 | Relative cost (1.0 = average) |
| `popularity` | INTEGER | DEFAULT 0 | Search ranking weight |
| `image_url` | VARCHAR(500) | NULLABLE | Display image |
| `lat` | FLOAT | NULLABLE | Latitude |
| `lng` | FLOAT | NULLABLE | Longitude |

#### `stops` (a city within a trip)
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INTEGER | PK, AUTO | — |
| `trip_id` | INTEGER | FK → trips.id, NOT NULL | Parent trip |
| `city_id` | INTEGER | FK → cities.id, NOT NULL | Which city |
| `order_index` | INTEGER | NOT NULL | Sort order within trip |
| `arrival_date` | DATE | NULLABLE | — |
| `departure_date` | DATE | NULLABLE | — |
| `notes` | TEXT | NULLABLE | User notes for this stop |

#### `activities` (pre-seeded reference data)
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INTEGER | PK, AUTO | — |
| `name` | VARCHAR(200) | NOT NULL | Activity name |
| `category` | VARCHAR(50) | NOT NULL | sightseeing / food / adventure / culture / shopping |
| `cost_estimate` | FLOAT | DEFAULT 0 | Estimated cost in USD |
| `duration_hours` | FLOAT | DEFAULT 1.0 | How long it takes |
| `city_id` | INTEGER | FK → cities.id, NULLABLE | City-specific or generic |
| `description` | TEXT | NULLABLE | — |
| `image_url` | VARCHAR(500) | NULLABLE | — |

#### `stop_activities` (join table: which activities assigned to which stop)
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INTEGER | PK, AUTO | — |
| `stop_id` | INTEGER | FK → stops.id, NOT NULL | — |
| `activity_id` | INTEGER | FK → activities.id, NOT NULL | — |
| `day_number` | INTEGER | NULLABLE | Which day of the stop |
| `time_slot` | VARCHAR(20) | NULLABLE | morning / afternoon / evening |
| `notes` | TEXT | NULLABLE | User notes |

> **Unique constraint**: (`stop_id`, `activity_id`) — no duplicate activities per stop.

---

## 🔌 API Contract (REST)

> **Prefix**: All endpoints under `/api`
> **Auth**: JWT Bearer token in `Authorization` header (except login/signup/health/public share)

### Auth Endpoints
| Method | Endpoint | Body | Response | Owner |
|--------|----------|------|----------|-------|
| `POST` | `/api/auth/signup` | `{email, password, name}` | `{user, token}` | Backend Dev 1 |
| `POST` | `/api/auth/login` | `{email, password}` | `{user, token}` | Backend Dev 1 |
| `GET` | `/api/auth/me` | — | `{user}` | Backend Dev 1 |

### Trip Endpoints
| Method | Endpoint | Body | Response | Owner |
|--------|----------|------|----------|-------|
| `GET` | `/api/trips` | — | `[{trip}]` (user's trips) | Backend Dev 1 |
| `POST` | `/api/trips` | `{name, description, start_date, end_date}` | `{trip}` | Backend Dev 1 |
| `GET` | `/api/trips/:id` | — | `{trip, stops, activities}` (full nested) | Backend Dev 2 |
| `PUT` | `/api/trips/:id` | `{name?, description?, ...}` | `{trip}` | Backend Dev 2 |
| `DELETE` | `/api/trips/:id` | — | `204` | Backend Dev 2 |

### Stop Endpoints
| Method | Endpoint | Body | Response | Owner |
|--------|----------|------|----------|-------|
| `GET` | `/api/trips/:id/stops` | — | `[{stop}]` | Backend Dev 2 |
| `POST` | `/api/trips/:id/stops` | `{city_id, order_index, arrival_date?, departure_date?}` | `{stop}` | Backend Dev 2 |
| `PUT` | `/api/stops/:id` | `{order_index?, dates?, notes?}` | `{stop}` | Backend Dev 2 |
| `DELETE` | `/api/stops/:id` | — | `204` | Backend Dev 2 |
| `PUT` | `/api/trips/:id/stops/reorder` | `{stop_ids: [ordered]}` | `200` | Backend Dev 2 |

### Activity Endpoints
| Method | Endpoint | Body | Response | Owner |
|--------|----------|------|----------|-------|
| `GET` | `/api/activities` | `?city_id=&category=&q=` | `[{activity}]` | Backend Dev 2 |
| `POST` | `/api/stops/:id/activities` | `{activity_id, day_number?, time_slot?}` | `{stop_activity}` | Backend Dev 2 |
| `DELETE` | `/api/stops/:stopId/activities/:actId` | — | `204` | Backend Dev 2 |

### City Endpoints
| Method | Endpoint | Body | Response | Owner |
|--------|----------|------|----------|-------|
| `GET` | `/api/cities` | `?q=&country=&region=` | `[{city}]` | Backend Dev 1 |
| `GET` | `/api/cities/:id` | — | `{city, activities}` | Backend Dev 1 |

### Budget Endpoint
| Method | Endpoint | Body | Response | Owner |
|--------|----------|------|----------|-------|
| `GET` | `/api/trips/:id/budget` | — | `{total, by_stop: [{stop, cost, activities}], by_category}` | Backend Dev 1 |

### Share Endpoints
| Method | Endpoint | Body | Response | Owner |
|--------|----------|------|----------|-------|
| `POST` | `/api/trips/:id/share` | — | `{share_token, url}` | Backend Dev 1 |
| `GET` | `/api/share/:token` | — | `{trip, stops, activities}` (public, no auth) | Backend Dev 1 |

### Utility
| Method | Endpoint | Response | Owner |
|--------|----------|----------|-------|
| `GET` | `/api/health` | `{status: "healthy"}` | Daksh |

---

## 🧩 Frontend Screen ↔ API Mapping

| Screen | APIs Used | Owner |
|--------|-----------|-------|
| Login / Signup | `auth/login`, `auth/signup` | Frontend Dev |
| Dashboard | `trips` (GET), `cities` (GET, popular) | Frontend Dev |
| Create Trip | `trips` (POST) | Frontend Dev |
| My Trips | `trips` (GET), `trips/:id` (DELETE) | Frontend Dev |
| Itinerary Builder | `trips/:id` (GET), `stops` (CRUD), `cities` (search), `activities` (search), `stop_activities` (CRUD) | Frontend Dev |
| Itinerary View | `trips/:id` (GET full nested) | Frontend Dev |
| City Search | `cities` (GET with filters) | Frontend Dev |
| Activity Search | `activities` (GET with filters) | Frontend Dev |
| Trip Budget | `trips/:id/budget` (GET) | Frontend Dev |
| Trip Calendar | `trips/:id` (GET full nested) | Frontend Dev |
| Shared View | `share/:token` (GET) | Frontend Dev |
| Profile | `auth/me` (GET), `auth/me` (PUT — stretch) | Frontend Dev |

---

## ⚙️ Configuration

### Backend `.env`
```env
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=your-secret-key-change-in-prod
JWT_SECRET_KEY=your-jwt-secret-change-in-prod
DATABASE_URI=sqlite:///instance/app.db
PORT=5000
```

### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📐 Design Principles

1. **Thin routes, fat services** — Routes only parse request → call service → return response
2. **One model per file** — Easy to find, easy to merge
3. **One blueprint per resource** — Clean separation
4. **Pydantic for validation** — Never trust raw `request.get_json()`
5. **Consistent JSON responses** — Always `{data}` or `{error: "message"}`
6. **HTTP status codes** — 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 404 Not Found
