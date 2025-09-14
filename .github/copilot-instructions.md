# Klynaa AI Coding Guide

## Architecture Overview
This is a **Docker-first monorepo** for waste management with:
- **Django REST backend** (`backend/`) with feature-based apps under `apps/*`
- **Next.js frontend** (`frontend/`) with TypeScript, Tailwind, and Zustand state management
- **FastAPI AI service** (`ai/`) for ML/analytics microservices
- **Hardhat blockchain** (`blockchain/`) for Web3 token contracts
- **Nginx reverse proxy** routing: `/` → frontend, `/api` → backend, `/ai` → AI service

## Development Workflow

### Essential Commands (Use Make targets)
```bash
make up          # Start full stack (uses Bee environment)
make logs        # Tail all service logs
make down        # Stop services
make migrate     # Django migrations in container
make backend-shell  # Shell into Django container
make dev-setup   # SQLite setup with seed data
```

### Environment Strategy
- **Bee profile** (`environments/bee/`) is the primary dev environment
- Uses Docker Compose overlays: `docker-compose.yml` + `docker-compose.bee.yml`
- Backend defaults to **SQLite** for development simplicity
- Environment variables: `.env.example` → `.env` + `environments/bee/.env.bee`

## Backend Patterns (Django)

### App Organization
- Feature-based apps: `users`, `bins`, `pickups`, `payments`, `notifications`, `analytics`
- URL routing centralized in `backend/config/urls.py` with `/api/` prefix
- Worker-specific endpoints under `/api/v1/` (see `apps.users.worker_urls`)

### Key Conventions
- DRF with JWT authentication (`rest_framework_simplejwt`)
- CORS enabled for frontend integration
- All apps follow Django app structure with dedicated URLs, views, models
- Frontend integration via `apps.frontend_views.py` for simple UI serving

### Database
- **Development**: SQLite (`db.sqlite3`) with optimization scripts
- **Production**: PostgreSQL support via environment profiles
- Use `scripts/seed_data.py` for sample data, `scripts/optimize_sqlite.py` for performance

## Frontend Patterns (Next.js)

### Structure
- **Pages**: Route-based in `pages/` (auth, customer, worker, admin dashboards)
- **Components**: Organized by domain (`auth/`, `worker/`, `ui/`, `layout/`)
- **State**: Zustand stores in `stores/`
- **API**: Axios wrappers in `services/`

### Key Technologies
- TypeScript with strict typing
- Tailwind CSS + Headless UI components
- React Hook Form + Zod validation
- Leaflet maps for location features
- Lucide icons throughout UI

### Authentication Flow
- JWT tokens managed in Zustand stores
- `PrivateRoute` component for protected pages
- Separate dashboards: `/customer/`, `/worker/`, `/admin/`

## Service Integration

### API Communication
- Backend exposes REST endpoints with `/api/` prefix
- Frontend services (`services/`) handle API calls with proper error handling
- Worker mobile features via dedicated endpoints (`/api/v1/`)

### Docker Development
- All services run in containers with volume mounts for live reload
- Nginx handles routing and proxying between services
- Use `docker compose logs` for debugging cross-service issues

## Testing & Quality

### Standards
- **Backend**: Django tests, Black formatting, Flake8 linting
- **Frontend**: ESLint with Next.js config, Prettier formatting
- **Blockchain**: Hardhat test suite with Ethers.js v6
- CI runs via `.github/workflows/ci.yml`

## Common Tasks

### Adding New Features
1. Backend: Create/extend app in `backend/apps/`, add URLs to `config/urls.py`
2. Frontend: Add pages/components, create API service wrapper
3. Update Docker containers and run migrations as needed

### Database Changes
```bash
make makemigrations  # Create migrations
make migrate        # Apply migrations
make reset-db       # Full reset with sample data (dev only)
```

### Debugging
- Use `make logs` for all services or `docker compose logs [service]`
- Backend shell: `make backend-shell`
- Check service health: `http://localhost/api/health/`, `http://localhost/ai/health`

## Web3 Integration
- Hardhat setup in `blockchain/` with KlynaaToken contract
- Ethers.js v6 for contract interactions
- Future tokenized payment integration planned