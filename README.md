# 🌍 GlobeTrotter — Smart Multi-City Travel Planner

> **Odoo x LDCE Hackathon**  
> A full-stack travel planning application for creating multi-city itineraries, discovering destinations and activities, optimizing budgets, and sharing travel plans.

---

## 🚀 Features

- **Multi-City Itinerary Builder**: Plan multi-stop trips with dates, custom notes, and drag-and-drop stop reordering.
- **Activity & City Discovery**: Browse 20+ world destinations and curated activities across sightseeing, culture, adventure, food, and shopping.
- **Budget Tracking & Visuals**: Real-time cost estimates, category breakdowns, and stop-by-stop spending summaries.
- **Timeline & Calendar View**: Interactive visual schedule of your journey.
- **Public Trip Sharing**: Generate unique shareable links to share view-only itineraries with friends or public.
- **Secure Authentication**: JWT-based authentication with encrypted password hashing.

---

## 🏗️ Tech Stack

| Layer | Technology | Details | Port |
|---|---|---|---|
| **Backend** | Python 3.14 + Flask 3.x | App factory pattern, Blueprint routing | `5000` |
| **Database** | SQLite 3 + SQLAlchemy | Normalized relational schema with cascade deletes | Embedded |
| **Authentication** | Flask-JWT-Extended | Secure token-based auth | — |
| **Validation** | Pydantic v2 | Strict schema validation | — |
| **Frontend** | React 18/19 + Vite | Fast modern SPA with vanilla CSS tokens | `5173` |
| **State Management** | Zustand | Lightweight global client state | — |
| **Icons & Visuals** | Lucide React + Recharts | Modern UI icons & interactive budget charts | — |
| **Containers** | Docker & Docker Compose | Multi-container reproducible environment | — |

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

- **`users`**: User credentials (`email`, `password_hash`, `name`)
- **`trips`**: User trips (`name`, `description`, `start_date`, `end_date`, `is_public`, `share_token`, `cover_url`)
- **`cities`**: Reference destinations (`name`, `country`, `region`, `cost_index`, `popularity`, `lat`, `lng`, `image_url`)
- **`stops`**: Ordered trip destinations (`trip_id`, `city_id`, `order_index`, `arrival_date`, `departure_date`, `notes`)
- **`activities`**: Reference activities (`name`, `category`, `cost_estimate`, `duration_hours`, `city_id`, `description`, `image_url`)
- **`stop_activities`**: Join table linking activities to stops (`stop_id`, `activity_id`, `day_number`, `time_slot`, `notes`)

---

## ⚡ Quick Start

### Option 1: Docker Compose (Recommended)

Start all services with a single command:

```bash
docker compose up --build
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

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
python run.py seed   # Initializes database & seeds reference data
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | System health check | ❌ |
| `POST` | `/api/auth/signup` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Log in and receive JWT token | ❌ |
| `GET` | `/api/auth/me` | Current authenticated user profile | ✅ |
| `GET` | `/api/trips` | Get list of user trips | ✅ |
| `POST` | `/api/trips` | Create a new trip | ✅ |
| `GET` | `/api/trips/:id` | Full nested trip itinerary | ✅ |
| `PUT` | `/api/trips/:id` | Update trip details | ✅ |
| `DELETE`| `/api/trips/:id` | Delete trip and all related stops | ✅ |
| `POST` | `/api/trips/:id/stops` | Add a city stop to trip | ✅ |
| `PUT` | `/api/trips/:id/stops/reorder` | Reorder stops within trip | ✅ |
| `DELETE`| `/api/stops/:id` | Delete stop and assigned activities | ✅ |
| `GET` | `/api/cities` | Search and filter destinations | ❌ |
| `GET` | `/api/activities` | Search and filter activities | ❌ |
| `POST` | `/api/stops/:id/activities` | Assign activity to stop | ✅ |
| `DELETE`| `/api/stops/:stopId/activities/:actId` | Remove activity from stop | ✅ |
| `GET` | `/api/trips/:id/budget` | Trip budget calculations | ✅ |
| `POST` | `/api/trips/:id/share` | Generate public share token | ✅ |
| `GET` | `/api/share/:token` | Public view of shared itinerary | ❌ |

---

## 👥 Team & Development Roles

| Role | Member | Responsibilities | Branch |
|---|---|---|---|
| **Team Lead & DB** | Daksh | Database schema, models, seeding, Docker compose, health & debug | `main` |
| **Backend Dev 1** | Team Member | Auth routes, Trips CRUD, Cities search, Budget calculation | `backend-1/<feature>` |
| **Backend Dev 2** | Team Member | Stops CRUD, Activities management, Shared view API | `backend-2/<feature>` |
| **Frontend Dev** | Team Member | React UI, Zustand state, Itinerary builder, Charts & Calendar | `frontend/<feature>` |

---

## 🚦 Roadmap

- [x] **Phase 1 — Foundation**: DB models, App factory, Idempotent Seeder, Health Check, Docker Compose, Git scaffold.
- [ ] **Phase 2 — Core Features**: JWT Auth, Trip CRUD, Stop & Activity assignment, Itinerary builder UI.
- [ ] **Phase 3 — Advanced Features**: City & Activity search filters, Budget charts, Timeline calendar, Shareable links.
- [ ] **Phase 4 — Polish & Deploy**: End-to-end stress testing, error handling, mobile responsiveness, final builds.

---

## 📜 License
MIT License
