# OroGenie

A full-stack paper-trading and portfolio dashboard built with **React, Flask, and SQLAlchemy**.

I built OroGenie to experiment with a simpler brokerage-style interface: track simulated holdings, review price movements, and explore a portfolio without placing real trades.

## What it does

- **Paper portfolio:** Create an account, track simulated holdings and cash balances, and record buy/sell transactions.
- **Market data:** Look up stock prices and view gainers/losers using external data sources and scraping.
- **Portfolio views:** Inspect transaction history and portfolio charts.
- **AI assistant:** A simple optional OpenRouter-powered chat endpoint.
- **Backend:** Flask REST routes, JWT authentication, SQLAlchemy models, and Socket.IO support.

This is a **personal project and paper-trading prototype**, not a brokerage or production financial service. Market feeds and third-party endpoints may change or stop working.

## Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Recharts, Axios, Socket.IO client |
| Backend | Python, Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-SocketIO |
| Storage | SQLAlchemy; SQLite by default, configurable with `SQLALCHEMY_DATABASE_URI` |
| Data | Yahoo Finance scraping/yfinance and other third-party market endpoints |
| Deployment | Render static frontend and Docker-based Flask backend |

The deployment configuration for both services lives in [`render.yaml`](render.yaml).

## Local development

### Backend

Use Python 3.12. From the repository root:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Copy [`.env.example`](backend/.env.example) to `backend/.env`, then provide **your own randomly generated** `SECRET_KEY` and `JWT_SECRET_KEY`. For example, generate each one with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Optionally configure `OPENROUTER_API_KEY` if you want to use the AI assistant. Otherwise, that endpoint returns HTTP 503.

```bash
python run.py
```

The development backend listens on **http://localhost:5001**.

### Frontend

In a second terminal:

```bash
cd frontend
npm ci
npm start
```

The React app opens at **http://localhost:3000**. The development API URL defaults to `http://127.0.0.1:5001/`. Set `REACT_APP_BACKEND_URL` for a different backend address.

## Render deployment

The checked-in Blueprint defines **two Render services**: a Docker-based Flask backend and a static React frontend. Render generates `SECRET_KEY` and `JWT_SECRET_KEY` for the backend. If the AI assistant is needed, configure `OPENROUTER_API_KEY` directly in the backend service's **Environment** settings; don't commit its value.

The default SQLite database is **not a persistent managed database**. Data can be lost on a free/ephemeral deployment or during redeployment. A persistent database and additional operational work are required for reliable accounts.

## Security and limitations

- Do **not** enter real financial credentials or use this app as a brokerage.
- Passwords are hashed with bcrypt and account-specific routes use JWT authentication. These controls alone do not make the prototype production-ready.
- An older commit contained an OpenRouter credential, and the repository history included a local SQLite user database. Treat any affected credentials as exposed and review the database before using real personal information.
- JWTs are currently stored in browser `localStorage`. Stronger session handling, input validation, security testing, dependency upgrades, and persistent database deployment would be needed before real use.

This repository shows the architecture and experimentation behind OroGenie; it is not a hardened financial application.
