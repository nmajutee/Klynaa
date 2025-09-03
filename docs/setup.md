# Setup Guide

Prereqs: Docker, Docker Compose, Node 18+, Python 3.11+, Make.

1. Copy env
   cp .env.example .env
2. Start stack
   make up
3. Check services
   - Frontend: http://localhost
   - Backend: http://localhost/api
   - AI: http://localhost/ai/health

Django (SQLite in Bee env):
- make migrate to apply migrations (creates db.sqlite3)
- make backend-shell to enter container

Testing:
- make test to run tests across services
