SHELL := /bin/bash

.DEFAULT_GOAL := help

PROJECT_NAME ?= klynaa
DOCKER_COMPOSE ?= docker-compose

help: ## Show help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS=":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Start all core services (Bee env)
	$(DOCKER_COMPOSE) --env-file environments/bee/.env.bee -f docker-compose.yml -f environments/bee/docker-compose.bee.yml up -d --build

down: ## Stop all services (Bee env)
	$(DOCKER_COMPOSE) --env-file environments/bee/.env.bee -f docker-compose.yml -f environments/bee/docker-compose.bee.yml down

logs: ## Tail all logs (Bee env)
	$(DOCKER_COMPOSE) --env-file environments/bee/.env.bee -f docker-compose.yml -f environments/bee/docker-compose.bee.yml logs -f --tail=200

ps: ## Show service status (Bee env)
	$(DOCKER_COMPOSE) --env-file environments/bee/.env.bee -f docker-compose.yml -f environments/bee/docker-compose.bee.yml ps

backend-shell: ## Shell into backend container
	$(DOCKER_COMPOSE) exec backend bash || true

migrate: ## Run Django migrations
	$(DOCKER_COMPOSE) exec backend python manage.py migrate

makemigrations: ## Create Django migrations
	$(DOCKER_COMPOSE) exec backend python manage.py makemigrations

# SQLite Development Commands
optimize-db: ## Optimize SQLite database for faster development
	python scripts/optimize_sqlite.py

seed-data: ## Create sample data for development
	python scripts/seed_data.py

reset-db: ## Reset SQLite database (WARNING: destroys all data)
	@echo "⚠️  This will delete all data. Press Ctrl+C to cancel, Enter to continue..."
	@read
	rm -f backend/db.sqlite3
	python backend/manage.py migrate
	python scripts/seed_data.py
	python scripts/optimize_sqlite.py
	@echo "✅ Database reset with sample data and optimizations"

dev-setup: ## Complete development setup
	python backend/manage.py migrate
	python scripts/seed_data.py
	python scripts/optimize_sqlite.py
	@echo "✅ Development environment ready!"

# Local development (using bee venv)
runserver: ## Run Django dev server locally
	python backend/manage.py runserver 0.0.0.0:8000

shell: ## Django shell locally
	python backend/manage.py shell

test: ## Run tests locally
	python backend/manage.py test

test: ## Run tests across services (backend + ai + blockchain)
	$(DOCKER_COMPOSE) exec backend pytest || true
	$(DOCKER_COMPOSE) exec ai pytest || true
	$(DOCKER_COMPOSE) exec blockchain npm test || true

fmt: ## Format code (black, isort, prettier)
	$(DOCKER_COMPOSE) exec backend bash -lc "black . && isort ." || true
	$(DOCKER_COMPOSE) exec frontend npm run format || true
	$(DOCKER_COMPOSE) exec mobile npm run format || true
	$(DOCKER_COMPOSE) exec blockchain npm run format || true

lint: ## Lint code
	$(DOCKER_COMPOSE) exec backend bash -lc "flake8" || true
	$(DOCKER_COMPOSE) exec frontend npm run lint || true
	$(DOCKER_COMPOSE) exec mobile npm run lint || true
	$(DOCKER_COMPOSE) exec ai bash -lc "flake8" || true

seed: ## Seed dev data
	$(DOCKER_COMPOSE) exec backend python manage.py loaddata seeds/dev.json || true

ci: ## Run CI checks similar to pipeline
	make lint && make test
