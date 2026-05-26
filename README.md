# Docker Setup (Best Practices + Secure Defaults)

This project is containerized for production using a multi-stage build and an unprivileged Nginx runtime.

## What Is Included

- `Dockerfile`: multi-stage build (`node:22-alpine` -> `nginx-unprivileged`)
- `docker/nginx.conf`: SPA fallback routing + secure headers
- `.dockerignore`: small build context, avoids leaking unnecessary files
- `docker-compose.yml`: secure runtime defaults (`read_only`, `cap_drop`, `no-new-privileges`)

## Run (Production)

1. Build image

```bash
docker build -t apant-fe:latest .
```

2. Run container

```bash
docker run --rm -p 8080:8080 --name apant-fe apant-fe:latest
```

3. Open app

```text
http://localhost:8080
```

## Run with Compose

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f fe
docker compose down
```

## NPM Scripts

- `pnpm docker:build`
- `pnpm docker:run`
- `pnpm docker:up`
- `pnpm docker:down`

## Frontend Structure

See docs/FRONTEND-STRUCTURE.md for the folder layout, API endpoint placement, and security guidelines.

## Environment

Copy .env.example to .env.local and set VITE_API_BASE_URL.

## Security Notes

- Runtime uses a non-root Nginx image (`nginxinc/nginx-unprivileged`)
- Container filesystem is read-only in Compose
- Linux capabilities are dropped (`cap_drop: [ALL]`)
- `no-new-privileges` is enabled
- Healthcheck is configured for container monitoring

## CI/CD Automation

- Automated pipeline is defined in `.github/workflows/docker-publish.yml`
- On push to `main`, image is tested, built, scanned, and published to Docker Hub
- Detailed setup steps are documented in `docs/CI-CD.md`
