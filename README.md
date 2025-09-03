# Klynaa (Monorepo)

Enterprise-grade, Docker-first monorepo for Klynaa containing:

- Backend (Django REST API)
- Frontend (Next.js)
- Mobile (React Native / Expo)
- AI Microservices (FastAPI / PyTorch / TensorFlow-ready)
- Blockchain/Web3 (Hardhat + Ethers.js, future token payments)
- Shared utilities and schemas

See `docs/setup.md` for onboarding and local development.

Quick start

1) Copy `.env.example` to `.env` and adjust values
2) Build and start services with Makefile or docker compose

For architecture details, see `docs/architecture.md`.

Monorepo structure (key files only)

klynaa/
├─ docker/                       # Docker configs (nginx, etc)
│  └─ nginx/
│     └─ nginx.conf              # Reverse proxy routes / -> frontend, /api -> backend, /ai -> ai
├─ k8s/                          # Optional Kubernetes manifests
│  ├─ README.md
│  ├─ backend-deployment.yaml    # Sample backend Deployment + Service
│  └─ ai-deployment.yaml         # Sample AI Deployment + Service
├─ backend/                      # Django REST API (feature-based apps)
│  ├─ apps/
│  │  ├─ users/                  # Auth endpoints (JWT), profile extensions
│  │  │  ├─ urls.py
│  │  │  ├─ views.py
│  │  │  ├─ serializers.py
│  │  │  └─ migrations/
│  │  ├─ bins/                   # Bin mgmt, states (empty/full/waiting)
│  │  ├─ pickups/                # Pickup scheduling, assignments
│  │  ├─ payments/               # Payment workflows
│  │  ├─ notifications/          # Email, SMS, push notifications
│  │  └─ analytics/              # Reporting, KPIs
│  ├─ config/                    # Django project config
│  │  ├─ settings.py
│  │  ├─ urls.py
│  │  ├─ asgi.py
│  │  └─ wsgi.py
│  ├─ requirements/
│  │  ├─ base.txt
│  │  ├─ dev.txt
│  │  ├─ prod.txt
│  │  └─ test.txt
│  ├─ Dockerfile                 # Backend Dockerfile
│  ├─ manage.py
│  └─ tests/
├─ frontend/                     # Next.js (Web client)
│  ├─ pages/
│  ├─ services/                  # API wrappers
│  ├─ utils/
│  ├─ Dockerfile
│  ├─ package.json
│  └─ tsconfig.json
├─ mobile/                       # React Native / Expo app
│  ├─ app/
│  ├─ Dockerfile
│  └─ package.json
├─ ai/                           # AI microservices (FastAPI)
│  ├─ services/
│  │  └─ main.py                 # Health + stub predict endpoint
│  ├─ requirements.txt
│  └─ Dockerfile
├─ blockchain/                   # Web3 & smart contracts (Hardhat)
│  ├─ contracts/
│  │  └─ KlynaaToken.sol       # Placeholder token
│  ├─ scripts/
│  ├─ tests/
│  ├─ Dockerfile
│  └─ package.json
├─ shared/                       # Reusable modules across services
│  ├─ utils/
│  ├─ constants/
│  ├─ middlewares/
│  └─ schemas/
├─ docs/                         # Onboarding docs
│  ├─ architecture.md
│  ├─ setup.md
│  ├─ contribution.md
│  └─ roadmap.md
├─ tests/                        # Cross-service integration/e2e tests
├─ .github/workflows/ci.yml      # CI pipeline (lint/test)
├─ docker-compose.yml            # Orchestrates local dev
├─ .env.example                  # Sample env vars
├─ .gitignore
├─ Makefile                      # Common commands
└─ README.md
Waste Management System in Cameroon
