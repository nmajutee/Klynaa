# Architecture Overview

Monorepo with services:
- backend (Django REST): feature-based apps, JWT auth
- frontend (Next.js): customer/admin portal
- mobile (Expo): field/mobile users
- ai (FastAPI): ML microservices
- blockchain (Hardhat): contracts + future payments
- shared: cross-service modules

Nginx fronts services locally at:
- http://localhost -> frontend
- http://localhost/api -> backend
- http://localhost/ai -> ai service
