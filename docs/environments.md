# Environments

## Bee (development)
- Env file: `environments/bee/.env.bee`
- Compose override: `environments/bee/docker-compose.bee.yml`
- K8s overlay: `k8s/overlays/bee`

Usage:
- Local docker: `make up`, `make logs`, `make down`
- K8s (kustomize): `kubectl apply -k k8s/overlays/bee`
