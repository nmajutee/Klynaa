#  <img src="https://unpkg.com/lucide-static@latest/icons/recycle.svg" alt="Recycle" width="24" height="24" style="vertical-align: text-bottom;"> Klynaa — Modern Waste Management and Disposal Platform in Cameroon

[![CI](https://github.com/nmajutee/Klynaa/actions/workflows/ci.yml/badge.svg)](https://github.com/nmajutee/Klynaa/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?logo=open-source-initiative&logoColor=white)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/downloads/)
[![Node.js 20+](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-optional-326CE5?logo=kubernetes&logoColor=white)](k8s/README.md)

Klynaa (pronounced “Clean‑ah”) is a full‑stack platform that digitizes waste management workflows for cities and municipalities. It brings together a Django REST backend, a Next.js web app, a React‑Native mobile app, AI microservices, and Web3 contracts—packaged as a Docker‑first monorepo.

---

## <img src="https://unpkg.com/lucide-static@latest/icons/sparkles.svg" alt="Highlights" width="18" height="18" style="vertical-align: text-bottom;"> Highlights

- <img src="https://unpkg.com/lucide-static@latest/icons/brain.svg" alt="Hybrid" width="16" height="16" style="vertical-align: text-bottom;"> Hybrid architecture: Django core + serverless‑friendly microservices (AI)
- <img src="https://unpkg.com/lucide-static@latest/icons/route.svg" alt="Routing" width="16" height="16" style="vertical-align: text-bottom;"> Smart pickup scheduling and future route optimization
- <img src="https://unpkg.com/lucide-static@latest/icons/bell.svg" alt="Notifications" width="16" height="16" style="vertical-align: text-bottom;"> Notifications pipeline (email/SMS/push‑ready)
- <img src="https://unpkg.com/lucide-static@latest/icons/coins.svg" alt="Web3" width="16" height="16" style="vertical-align: text-bottom;"> Web3 plumbing for future tokenized payments (KLY)
- <img src="https://unpkg.com/lucide-static@latest/icons/bar-chart-2.svg" alt="Analytics" width="16" height="16" style="vertical-align: text-bottom;"> Admin analytics and KPIs
- <img src="https://unpkg.com/lucide-static@latest/icons/puzzle.svg" alt="Monorepo" width="16" height="16" style="vertical-align: text-bottom;"> Monorepo with shared utilities and CI

---

## <img src="https://unpkg.com/lucide-static@latest/icons/folder-tree.svg" alt="Monorepo" width="18" height="18" style="vertical-align: text-bottom;"> Monorepo Layout (top‑level)

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
- <img src="https://unpkg.com/lucide-static@latest/icons/globe.svg" alt="Frontend" width="14" height="14" style="vertical-align: text-bottom;"> http://localhost → Frontend
- <img src="https://unpkg.com/lucide-static@latest/icons/server.svg" alt="Backend" width="14" height="14" style="vertical-align: text-bottom;"> http://localhost/api → Backend
- <img src="https://unpkg.com/lucide-static@latest/icons/cpu.svg" alt="AI" width="14" height="14" style="vertical-align: text-bottom;"> http://localhost/ai → AI service

---

## <img src="https://unpkg.com/lucide-static@latest/icons/rocket.svg" alt="Quick Start" width="18" height="18" style="vertical-align: text-bottom;"> Quick Start (Docker‑first)

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

## <img src="https://unpkg.com/lucide-static@latest/icons/laptop.svg" alt="Local Dev" width="18" height="18" style="vertical-align: text-bottom;"> Local Dev (without Docker)

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

## <img src="https://unpkg.com/lucide-static@latest/icons/lock.svg" alt="Env" width="18" height="18" style="vertical-align: text-bottom;"> Environment Variables

Start with `.env.example` → `.env`. The Bee dev profile also reads `environments/bee/.env.bee` used by Docker Compose. Common variables:

- DJANGO_DEBUG, DJANGO_SECRET_KEY, DJANGO_ALLOWED_HOSTS
- DJANGO_DB_NAME, DJANGO_DB_USER, DJANGO_DB_PASSWORD (when using Postgres profile)
- Any API keys for email/SMS/AI services you integrate

---

## <img src="https://unpkg.com/lucide-static@latest/icons/beaker.svg" alt="Testing" width="18" height="18" style="vertical-align: text-bottom;"> Testing

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

## <img src="https://unpkg.com/lucide-static@latest/icons/layers.svg" alt="Services" width="18" height="18" style="vertical-align: text-bottom;"> Services Overview

### <img src="https://unpkg.com/lucide-static@latest/icons/database.svg" alt="Django" width="16" height="16" style="vertical-align: text-bottom;"> Backend (Django)
- Feature apps under `backend/apps/*` (users, bins, pickups, payments, notifications, analytics)
- DRF APIs defined in `backend/config/urls.py`
- Dev DB: SQLite (simple), Prod: PostgreSQL (via optional profiles)

### <img src="https://unpkg.com/lucide-static@latest/icons/layout-dashboard.svg" alt="Next.js" width="16" height="16" style="vertical-align: text-bottom;"> Frontend (Next.js)
- Pages in `frontend/pages`
- API wrappers in `frontend/services`
- ESLint configured (`.eslintrc.json`) for CI stability

### <img src="https://unpkg.com/lucide-static@latest/icons/smartphone.svg" alt="Mobile" width="16" height="16" style="vertical-align: text-bottom;"> Mobile (Expo)
- Cross‑platform app targeting field agents & citizens

### <img src="https://unpkg.com/lucide-static@latest/icons/cpu.svg" alt="AI" width="16" height="16" style="vertical-align: text-bottom;"> AI (FastAPI)
- `services/main.py` exposes health and stub endpoints
- Ready to host models for forecasting, routing, classification, etc.

### <img src="https://unpkg.com/lucide-static@latest/icons/circuit-board.svg" alt="Blockchain" width="16" height="16" style="vertical-align: text-bottom;"> Blockchain (Hardhat)
- Contract: `contracts/KlynaaToken.sol`
- Tests in `test/` (sample token metadata test)
- Ethers.js v6 integration ready

---

## <img src="https://unpkg.com/lucide-static@latest/icons/server-cog.svg" alt="Deployment" width="18" height="18" style="vertical-align: text-bottom;"> Deployment Notes

- Docker images can be built per service using the included Dockerfiles
- Nginx provides a simple local reverse proxy; for production use hardened config or a managed ingress
- Optional K8s manifests provided under `k8s/`

---

## <img src="https://unpkg.com/lucide-static@latest/icons/handshake.svg" alt="Contributing" width="18" height="18" style="vertical-align: text-bottom;"> Contributing

1) Fork the repo and create a feature branch
2) Follow the service style guides (Black/Flake8, Prettier, ESLint)
3) Add/Update tests where applicable
4) Open a PR; CI must pass

See `docs/contribution.md` for conventions.

---

## <img src="https://unpkg.com/lucide-static@latest/icons/book-open.svg" alt="Docs" width="18" height="18" style="vertical-align: text-bottom;"> Further Reading

- `docs/setup.md` — onboarding & commands
- `docs/architecture.md` — high‑level design
- `docs/roadmap.md` — planned features

---

## <img src="https://unpkg.com/lucide-static@latest/icons/file-text.svg" alt="License" width="18" height="18" style="vertical-align: text-bottom;"> License

MIT. See LICENSE.
