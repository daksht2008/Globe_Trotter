# 🌍 GlobeTrotter — Smart Multi-City Travel Planner

> **Odoo x LDCE Hackathon**  
> A full-stack travel planning application for creating multi-city itineraries, discovering destinations and activities, optimizing budgets, viewing interactive maps, and sharing travel plans.

---

## 🚀 Features

- **🗺️ Interactive Interactive Map & Global Visualization**: Embedded Leaflet map rendering cities, visited destinations, and customized trip routes.
- **✈️ Multi-City Itinerary Builder**: Plan multi-stop journeys with dates, custom notes, stop reordering, and day-by-day scheduling.
- **🔍 Destination & Activity Discovery**: Browse world destinations and curated activities across sightseeing, culture, adventure, food, and shopping. Enriched with live GeoDB, REST Countries, and Unsplash integration with offline database fallbacks.
- **💰 Budget Tracking & Analytics**: Real-time cost estimates, category breakdowns, stop-by-stop spending summaries, and per-day expense tracking.
- **📅 Timeline & Calendar Schedule**: Interactive day-by-day schedule with activity slots (Morning, Afternoon, Evening).
- **🔗 Public Trip Sharing**: Generate unique shareable links with cryptographic tokens to share view-only itineraries with friends and the public.
- **🔐 Secure Authentication**: JWT-based authentication with bcrypt password hashing and user profile management.
- **🧪 Comprehensive Test Coverage**: Full automated test suites across auth, trips CRUD, stops, activities, search fallbacks, and sharing logic.

---

## 🏗️ Tech Stack

| Layer | Technology | Details | Port |
|---|---|---|---|
| **Backend** | Python 3.10+ / Flask 3.x | Application factory pattern, Blueprint modular routing | `5000` |
| **Database** | SQLite 3 + SQLAlchemy 3.x | Normalized relational schema with cascade deletes & foreign keys | Embedded |
| **Authentication** | Flask-JWT-Extended | Secure stateless token-based authorization | — |
| **Validation** | Pydantic v2 | Strict request payload schema validation | — |
| **Frontend** | React 18 + Vite + TypeScript | Modern SPA with React hooks & context architecture | `5173` |
| **Styling & UI** | Tailwind CSS + Lucide Icons | Responsive modern design with accessible UI components | — |
| **Mapping** | Leaflet + React-Leaflet | Interactive global mapping and marker positioning | — |
| **Containers** | Docker & Docker Compose | Multi-container reproducible runtime environment | — |

---

## 🗄️ Database Architecture

```
┌─────────┐       ┌─────────┐       ┌─────────┐       ┌────────────────┐
│  User   │──1:N──│  Trip   │──1:N──│  Stop   │──1:N──│  StopActivity  │
└─────────┘       └─────────┘       └─────────┘       └────────────────┘
                                         │                    │
                                         │ N:1                │ N:1
                                         ▼                    ▼
                                    ┌─────────┐          ┌──────────┐
                                    │  City   │          │ Activity │
                                    └─────────┘          └──────────┘
```

- **`users`**: User credentials (`id`, `email`, `password_hash`, `name`, `created_at`)
- **`trips`**: User trips (`id`, `user_id`, `name`, `description`, `start_date`, `end_date`, `is_public`, `share_token`, `cover_url`, `created_at`)
- **`cities`**: Reference destinations (`id`, `name`, `country`, `region`, `cost_index`, `popularity`, `lat`, `lng`, `image_url`)
- **`stops`**: Ordered trip destinations (`id`, `trip_id`, `city_id`, `order_index`, `arrival_date`, `departure_date`, `notes`)
- **`activities`**: Reference activities (`id`, `city_id`, `name`, `category`, `cost_estimate`, `duration_hours`, `description`, `image_url`)
- **`stop_activities`**: Join table linking activities to stops (`id`, `stop_id`, `activity_id`, `day_number`, `time_slot`, `notes`)

---

## ⚡ Quick Start

### Option 1: Docker Compose (Recommended)

Start all backend, frontend, and database services with one command:

```bash
docker compose up --build
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### Option 2: Local Development Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt

# Seed the database with reference cities & activities
python run.py seed

# Start the Flask API server
python run.py
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔌 API Endpoints Reference

### 🔐 Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Authenticate & obtain JWT | ❌ |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | ✅ |

### ✈️ Trips Management
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/trips` | List all trips for current user | ✅ |
| `POST` | `/api/trips` | Create a new trip | ✅ |
| `GET` | `/api/trips/:id` | Fetch detailed trip with nested stops & activities | ✅ |
| `PUT` | `/api/trips/:id` | Update trip metadata | ✅ |
| `DELETE`| `/api/trips/:id` | Delete trip and cascade delete stops | ✅ |
| `GET` | `/api/trips/:id/budget`| Get calculated budget breakdown for trip | ✅ |
| `POST` | `/api/trips/:id/share` | Generate or toggle public shareable token | ✅ |

### 📍 Stops & Itinerary
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/trips/:id/stops` | Add a city stop to trip | ✅ |
| `PUT` | `/api/trips/:id/stops/reorder` | Reorder stops array within trip | ✅ |
| `DELETE`| `/api/stops/:id` | Remove stop from trip | ✅ |

### 🎯 Activities & Discovery
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/cities` | Search/filter cities (with live API fallback) | ❌ |
| `GET` | `/api/activities` | Search/filter activities by city & category | ❌ |
| `POST` | `/api/stops/:id/activities` | Assign activity to a stop with day/time slot | ✅ |
| `DELETE`| `/api/stops/:stopId/activities/:actId` | Remove activity from stop | ✅ |

### 🌐 Public Sharing
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/share/:token` | View public shared itinerary (view-only) | ❌ |
| `GET` | `/api/health` | Service health status | ❌ |

---

## 🧪 Testing

The backend includes a comprehensive test suite using `pytest`:

```bash
cd backend
pytest -v
```

Tests cover:
- User registration, login, and JWT validation
- Trips CRUD operations and user isolation
- Stop creation, reordering, and cascade deletion
- Stop activity assignments and slot updates
- Budget calculations and category aggregation
- Public share token generation and view access
- External search fallback mechanisms

---

## 🚦 Roadmap & Implementation Status

- [x] **Phase 1 — Foundation**: Database models, App factory pattern, Database Seeder with Faker, Health Check endpoint, Docker Compose.
- [x] **Phase 2 — Core Features**: JWT Authentication, Trip CRUD, Stop management & reordering, Activity assignment, Full Itinerary builder.
- [x] **Phase 3 — Advanced Features**: City & Activity discovery with external API integration (GeoDB / REST Countries / Unsplash), Budget tracking & category analytics, Interactive timeline & calendar view, Public trip sharing via tokens.
- [x] **Phase 4 — Polish & UI/UX**: Interactive Leaflet maps, complete responsive frontend screens, full automated test coverage, and documentation.

---

## 📜 License
MIT License
