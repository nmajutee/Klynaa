# 🌍 Klynaa — Modern Waste Management Platform (Monorepo)

[![CI](https://github.com/nmajutee/Klynaa/actions/workflows/ci.yml/badge.svg)](https://github.com/nmajutee/Klynaa/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 20+](https://img.shields.io/badge/node.js-20+-green.svg)](https://nodejs.org/)

Klynaa (pronounced “Clean‑ah”) is a full‑stack platform that digitizes waste management workflows for cities and municipalities. It brings together a Django REST backend, a Next.js web app, a React‑Native mobile app, AI microservices, and Web3 contracts—packaged as a Docker‑first monorepo.

---

## ✨ Highlights

- 🧠 Hybrid architecture: Django core + serverless‑friendly microservices (AI)
- 🗺️ Smart pickup scheduling and future route optimization
- 🔔 Notifications pipeline (email/SMS/push-ready)
- 💳 Web3 plumbing for future tokenized payments (KLY)
- 📊 Admin analytics and KPIs
- 🧩 Monorepo with shared utilities and CI

---

## 🗂 Monorepo Layout (top‑level)

```
Klynaa/
├─ backend/        # Django REST API (feature-based apps)
├─ frontend/       # Next.js web app
├─ mobile/         # React Native / Expo app
├─ ai/             # FastAPI microservices (ML/analytics)
├─ blockchain/     # Hardhat + Ethers (Solidity contracts)
├─ shared/         # Reusable code across services
├─ docker/         # Nginx, etc.
├─ k8s/            # Optional Kubernetes manifests
├─ docs/           # Setup & architecture docs
├─ tests/          # Cross-service tests
├─ docker-compose.yml
├─ Makefile
└─ .github/workflows/ci.yml
```

Nginx reverse‑proxies locally to:
- http://localhost → Frontend
- http://localhost/api → Backend
- http://localhost/ai → AI service

---

## 🚀 Quick Start (Docker‑first)

Prereqs: Docker, Docker Compose, Node 20+, Python 3.11+, Make.

1) Configure environment

```bash
cp .env.example .env
```

2) Start the stack (Bee dev env)

```bash
make up
```

3) Open the apps
- Frontend: http://localhost
- Backend (proxied): http://localhost/api
- AI service (health): http://localhost/ai/health

Useful Make targets:

```bash
make logs         # Tail all service logs
make ps           # Show container status
make down         # Stop the stack
make backend-shell
make migrate      # Django migrations
```

If you prefer raw Docker Compose (equivalent used by the Makefile):

```bash
docker compose \
  --env-file environments/bee/.env.bee \
  -f docker-compose.yml \
  -f environments/bee/docker-compose.bee.yml \
  up -d --build
```

---

## 💻 Local Dev (without Docker)

Backend (SQLite dev):
```bash
python backend/manage.py migrate
python backend/manage.py runserver 0.0.0.0:8000  # http://localhost:8000
```

Frontend:
```bash
cd frontend
npm install
npm run dev  # http://localhost:3000 (proxied by nginx to /)
```

AI service:
```bash
cd ai
pip install -r requirements.txt
uvicorn services.main:app --reload --port 8001  # proxied to /ai
```

Blockchain (Hardhat):
```bash
cd blockchain
npm install
npm test
```

---

## 🔐 Environment Variables

Start with `.env.example` → `.env`. The Bee dev profile also reads `environments/bee/.env.bee` used by Docker Compose. Common variables:

- DJANGO_DEBUG, DJANGO_SECRET_KEY, DJANGO_ALLOWED_HOSTS
- DJANGO_DB_NAME, DJANGO_DB_USER, DJANGO_DB_PASSWORD (when using Postgres profile)
- Any API keys for email/SMS/AI services you integrate

---

## 🧪 Testing

- CI runs backend, frontend lint, AI stubs, and blockchain tests via `.github/workflows/ci.yml`.
- Locally (Docker):
```bash
make test
```
- Frontend lint (CI fix already included):
```bash
cd frontend && npm run lint
```
- Blockchain tests:
```bash
cd blockchain && npm test
```

---

## 🧱 Services Overview

### Backend (Django)
- Feature apps under `backend/apps/*` (users, bins, pickups, payments, notifications, analytics)
- DRF APIs defined in `backend/config/urls.py`
- Dev DB: SQLite (simple), Prod: PostgreSQL (via optional profiles)

### Frontend (Next.js)
- Pages in `frontend/pages`
- API wrappers in `frontend/services`
- ESLint configured (`.eslintrc.json`) for CI stability

### Mobile (Expo)
- Cross‑platform app targeting field agents & citizens

### AI (FastAPI)
- `services/main.py` exposes health and stub endpoints
- Ready to host models for forecasting, routing, classification, etc.

### Blockchain (Hardhat)
- Contract: `contracts/KlynaaToken.sol`
- Tests in `test/` (sample token metadata test)
- Ethers.js v6 integration ready

---

## 🏗️ Deployment Notes

- Docker images can be built per service using the included Dockerfiles
- Nginx provides a simple local reverse proxy; for production use hardened config or a managed ingress
- Optional K8s manifests provided under `k8s/`

---

## 🤝 Contributing

1) Fork the repo and create a feature branch
2) Follow the service style guides (Black/Flake8, Prettier, ESLint)
3) Add/Update tests where applicable
4) Open a PR; CI must pass

See `docs/contribution.md` for conventions.

---

## 📚 Further Reading

- `docs/setup.md` — onboarding & commands
- `docs/architecture.md` — high‑level design
- `docs/roadmap.md` — planned features

---

## 📄 License

MIT. See LICENSE.
