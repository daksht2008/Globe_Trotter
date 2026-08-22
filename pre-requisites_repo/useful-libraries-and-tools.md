# 🧰 Odoo x LDCE Hackathon — Useful Libraries, Tools & Rapid-Dev Toolkit

> **For the Team**: Use this cheat sheet during the hackathon virtual round to rapidly pick pre-tested libraries, UI components, data generators, and Odoo/ERP integration patterns so you don't build standard functionality from scratch.

---

## ⚡ 1. Top Backend Python & Flask Libraries

| Category | Library | Install Command | Why You Need It |
| :--- | :--- | :--- | :--- |
| **CORS (Essential)** | `flask-cors` | `pip install flask-cors` | Eliminates CORS blocking between React (port 5173) and Flask (port 5000). |
| **Database ORM** | `flask-sqlalchemy` | `pip install flask-sqlalchemy` | Declarative models, relationship joins, and automatic SQLite table generation. |
| **Mock Data (Judge-Pleaser)** | `faker` | `pip install faker` | Generate 100s of realistic orders, invoices, customers, and products in 2 lines of code. |
| **Auth & Security** | `flask-jwt-extended` | `pip install flask-jwt-extended` | 5-minute JWT login/signup & route protection (`@jwt_required()`). |
| **Data Validation** | `pydantic` | `pip install pydantic` | Automatic schema validation for incoming JSON payloads with clean error responses. |
| **Excel / CSV Analytics** | `openpyxl` / `pandas` | `pip install pandas openpyxl` | Let judges upload Excel sheets or export sales/inventory reports (Odoo judges love this). |
| **Env Variables** | `python-dotenv` | `pip install python-dotenv` | Clean `.env` configuration for secrets and ports. |
| **Odoo Integration** | `xmlrpc.client` | *(Built-in to Python)* | Standard protocol to connect to and query live Odoo ERP databases via XML-RPC. |

---

## 🎨 2. Top Frontend React Libraries

| Category | Library | Install Command | Why You Need It |
| :--- | :--- | :--- | :--- |
| **Icons** | `lucide-react` | `npm install lucide-react` | 1,000+ clean, modern SVG icons for dashboards, tables, and buttons. |
| **Charts & Analytics** | `recharts` | `npm install recharts` | Fast, reactive bar charts, line graphs, and donut charts for business metrics. |
| **Notifications** | `sonner` or `react-hot-toast` | `npm install sonner` | Polished toast alerts on create/update/delete operations. |
| **State Management** | `zustand` | `npm install zustand` | 10x simpler than Redux; global auth/user/cart state in 10 lines of code. |
| **HTTP Client** | `axios` | `npm install axios` | Configurable base URL, interceptors, and cleaner error handling than fetch. |
| **PDF Generation** | `jspdf` & `html2canvas` | `npm install jspdf html2canvas` | Instant "Download Invoice / Report as PDF" button from any HTML element. |
| **Table / Data Grid** | `@tanstack/react-table` | `npm install @tanstack/react-table` | Pagination, search filtering, and column sorting for large data sets. |

---

## 🏢 3. Odoo & ERP-Centric Features (What Judges Look For)

Since this is an **Odoo-sponsored hackathon**, the problem statement is very likely to revolve around **business workflows, operations, or enterprise productivity**. Focus on these high-impact features:

1. **Dashboard Overview**: Summary cards (Total Revenue, Active Orders, Low Stock Alerts, Pending Invoices) + Recharts visual trend.
2. **CRUD with Status Badges**: Clean table with status pills (`Draft`, `Confirmed`, `In Transit`, `Paid`, `Cancelled`).
3. **Quick Search & Filter**: Instant filtering by status, date range, or customer name.
4. **Mock Data Seeding Script**: A button or backend CLI command `python seed.py` that populates the app with sample data so judges aren't testing an empty screen.
5. **Activity Log / Audit Trail**: Simple timestamped history of actions ("Order #104 status updated to Shipped by Admin").

---

## 🛠️ 4. Essential Developer & Debugging Tools

1. **SQLite Database Inspection**:
   - **VS Code Extension**: `SQLite Viewer` (by Florian Klampfer / qwtel) — lets you click `.db` files in VS Code and view/edit tables directly in GUI.
   - **Standalone App**: [DB Browser for SQLite](https://sqlitebrowser.org/) (portable & lightweight).

2. **Rapid API Testing**:
   - **VS Code Extension**: `Thunder Client` — Test Flask endpoints right inside the editor without switching windows.
   - **Postman / Insomnia** / `curl`.

3. **Docker Management in IDE**:
   - **VS Code Extension**: `Docker` (by Microsoft) — Start/stop containers and inspect live logs with one click.

---

## 📋 5. Ready-to-Use Code Snippets

### A. Minimal Flask Backend with CORS & SQLite (`backend/run.py`)

```python
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enables cross-origin requests from React

# Configure SQLite
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Example ERP Model
class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), default="Pending")
    quantity = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "status": self.status,
            "quantity": self.quantity,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "Flask SQLite Backend"}), 200

@app.route('/api/items', methods=['GET'])
def get_items():
    items = Item.query.all()
    return jsonify([item.to_dict() for item in items]), 200

@app.route('/api/items', methods=['POST'])
def create_item():
    data = request.get_json() or {}
    if not data.get('name'):
        return jsonify({"error": "Item name is required"}), 400
    
    new_item = Item(name=data['name'], status=data.get('status', 'Pending'), quantity=data.get('quantity', 1))
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.to_dict()), 201

if __name__ == '__main__':
    os.makedirs(os.path.join(BASE_DIR, 'instance'), exist_ok=True)
    with app.app_context():
        db.create_all()
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
```

---

### B. Pre-Configured Axios Client (`frontend/src/services/api.js`)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const getItems = async () => {
  const res = await api.get('/items');
  return res.data;
};

export const createItem = async (data) => {
  const res = await api.post('/items', data);
  return res.data;
};

export default api;
```

---

### C. Connect to Odoo via Python XML-RPC (If problem requires Odoo sync)

```python
import xmlrpc.client

def connect_odoo(url, db, username, api_key):
    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
    uid = common.authenticate(db, username, api_key, {})
    models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
    return uid, models

# Example search & read on Odoo Partners
# uid, models = connect_odoo("https://your-odoo-instance.odoo.com", "db_name", "user@email.com", "api_key")
# partners = models.execute_kw(db, uid, api_key, 'res.partner', 'search_read', [[]], {'fields': ['name', 'email'], 'limit': 10})
```

---

## 🤖 6. High-Efficiency AI Prompts for the Hackathon

When working with your AI IDE (Antigravity, Cursor, etc.), use targeted prompts like:

> *"Generate a complete Flask blueprint and SQLite model for a [Feature Name] module with CRUD endpoints, input validation, and proper HTTP status codes matching our existing architecture."*

> *"Build a modern, responsive React dashboard view using Lucide icons and Recharts that fetches data from `/api/[endpoint]` and includes a status filter, search bar, and modal form for adding new records."*

> *"Create a Python database seeder script using the Faker library to populate our SQLite database with 25 realistic mock records so we can demonstrate the UI with rich data."*

---

## 💡 7. Pro Hackathon Tips for Tomorrow's Round

1. **Commit Early & Often**: Push working milestones to Git before trying risky new features.
2. **Prioritize the "Golden Path" Demo**: Make sure the main user story (Create -> View -> Update -> Export/Analyze) works flawlessly without UI glitches.
3. **Polished Presentation UI**: Spend 15 minutes at the end tweaking spacing, colors, and adding status badges and icons — visual polish creates an immediate winning impression on judges.
