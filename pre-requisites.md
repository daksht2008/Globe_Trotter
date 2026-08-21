# 🚀 Odoo x LDCE Hackathon — Environment Setup & Pre-Requisites

> **Instructions for Teammates & AI IDEs**:
> This document specifies the exact environment, dependencies, runtime versions, and container configuration for the **Odoo x LDCE Hackathon (Virtual Round)**. 
> If you are using an AI IDE (Antigravity, Cursor, Windsurf, Copilot Workspace), feed this file as context to automate project setup.

---

## 📌 Core Tech Stack & Exact Versions

| Component | Technology | Version / Spec |
| :--- | :--- | :--- |
| **Backend Language** | **Python** | **`3.14.x`** *(Compatible with `>= 3.12`)* |
| **Backend Framework** | **Flask** | `Flask 3.x` with `Flask-CORS` |
| **Database** | **SQLite** | `SQLite 3` *(Included natively with Python)* |
| **Frontend Framework** | **React** (JavaScript) | `React 18/19` via **Vite** |
| **Package Managers** | `pip` (Python) / `npm` (Node.js) | Node.js `>= 20.x` (Host has `v24.15.0`, npm `11.12.1`) |
| **Containerization** | **Docker** & **Docker Compose** | Docker `>= 27.x` (Host has `29.6.1`) |

---

## ❓ Docker & WSL Question: Do we need WSL for this tech stack?

### **Short Answer:**
- **If running Docker Desktop on Windows**: **YES, WSL 2 is strongly recommended (and practically required).**
- **If running directly on Windows without Docker**: **NO, WSL is not needed.**

### **Detailed Breakdown for the Team:**
1. **Why Docker on Windows needs WSL 2**:
   - Docker containers are native Linux processes.
   - On Windows 10/11, Docker Desktop uses the **WSL 2 (Windows Subsystem for Linux) backend** to run Linux containers with lightweight memory consumption, near-instant startup, and native file system performance.
   - Without WSL 2, Docker Desktop requires Hyper-V (which is heavy, unavailable on Windows Home edition, and prone to performance slowdowns).
2. **Hackathon Strategy & Recommendation**:
   - **Primary Setup**: Docker + Docker Compose with WSL 2 backend enabled.
   - **Emergency Fallback (Fast Track)**: If any teammate faces Docker/WSL installation errors on competition day, **do not waste hackathon time troubleshooting Docker**. Run Python directly (`python app.py`) and Vite directly (`npm run dev`) natively on Windows.

---

## 🛠️ Step-by-Step Teammate Setup Guide

### 1. Prerequisites Check (Host Machine)

Open PowerShell / Terminal and verify your installed tools:

```bash
# 1. Check Python version (Must match Python 3.14.x or >= 3.12)
python --version

# 2. Check Node.js and npm
node --version
npm --version

# 3. Check Docker & Docker Compose
docker --version
docker compose version
```

> **If tools are missing:**
> - **Python 3.14 / 3.12+**: Install from [python.org](https://www.python.org/downloads/) (Make sure to check **"Add python.exe to PATH"**).
> - **Node.js**: Install latest LTS / v22+ from [nodejs.org](https://nodejs.org/).
> - **Docker Desktop & WSL 2 (Windows)**:
>   1. Open PowerShell as Administrator and run: `wsl --install`
>   2. Restart computer if prompted.
>   3. Download & install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
>   4. In Docker Desktop Settings: Ensure **"Use the WSL 2 based engine"** is checked under *General*.

---

## 📁 Standard Project Repository Structure

Ensure the team uses this unified structure:

```text
odoo-hackathon-app/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── routes.py
│   │   └── database.py
│   ├── instance/
│   │   └── app.db            # SQLite database file (created automatically)
│   ├── .env.example
│   ├── Dockerfile
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/         # API calls to Flask
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 📦 Dependency Files (Ready to Copy-Paste)

### 1. `backend/requirements.txt`
```txt
Flask>=3.0.0
Flask-Cors>=4.0.0
Flask-SQLAlchemy>=3.1.1
python-dotenv>=1.0.0
pydantic>=2.5.0
requests>=2.31.0
gunicorn>=21.2.0
```

### 2. `frontend/package.json` (Vite + React)
```json
{
  "name": "odoo-hackathon-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.0",
    "lucide-react": "^0.470.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.0"
  }
}
```

---

## 🐳 Docker & Docker Compose Setup

### 1. `backend/Dockerfile`
```dockerfile
FROM python:3.14-slim

WORKDIR /app

# Prevent python from buffering stdout/stderr
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "run.py"]
```

### 2. `frontend/Dockerfile`
```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
```

### 3. Root `docker-compose.yml`
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: hackathon_backend
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
      - sqlite_data:/app/instance
    environment:
      - FLASK_ENV=development
      - FLASK_DEBUG=1
      - PORT=5000
    restart: unless-stopped

  frontend:
    build: ./frontend
    container_name: hackathon_frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_BASE_URL=http://localhost:5000
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  sqlite_data:
```

---

## ⚡ Quick Start Commands for Team

### Option A: Run via Docker (Recommended)
```bash
# Build and start all services in detached mode with live code reloading
docker compose up --build

# Stop all services
docker compose down
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

---

### Option B: Local Direct Execution (Zero Docker / Fast Fallback)

#### Backend:
```bash
cd backend
python -m venv venv

# Windows Activation:
.\venv\Scripts\activate
# Mac/Linux Activation:
# source venv/bin/activate

pip install -r requirements.txt
python run.py
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## ✅ Pre-Hackathon Readiness Checklist

- [ ] Python 3.14.x / 3.12+ installed and accessible via `python`
- [ ] Node.js (v20+) and npm installed and accessible via `node` / `npm`
- [ ] Docker Desktop installed and running (with WSL 2 enabled on Windows)
- [ ] Test container build: `docker compose up --build` works without network/permission errors
- [ ] Browser access verified for `http://localhost:5173` and `http://localhost:5000/api/health`
- [ ] VS Code Extensions / AI Plugins installed:
  - *Python* (`ms-python.python`)
  - *SQLite Viewer* (`qwtel.sqlite-viewer` or `alexcvzz.vscode-sqlite`)
  - *Thunder Client* or *Postman* for instant API testing
  - *Docker* (`ms-azuretools.vscode-docker`)
