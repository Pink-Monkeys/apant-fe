# Frontend Structure & Security

This document describes the frontend folder structure, API endpoint organization, and security-related conventions.

## Goals

- Keep routes thin and focused on layout/composition
- Put business logic inside feature folders
- Centralize API endpoints and HTTP client logic
- Keep sensitive values out of the frontend bundle

## Folder Layout

```
src/
  routes/              # TanStack file routes (thin)
    _auth/
    index.tsx
  features/            # domain slices
    auth/
      api/
      components/
      types.ts
  components/          # shared components
    ui/
  services/
    http/
      client.ts
    endpoints.ts
  config/
    env.ts
  types/
    http.ts
  hooks/
  lib/
  styles.css
```

### Optional Expansion (When Needed)

```
src/
  app/
    router/
    providers/
    layouts/
  features/
    auth/
      hooks/
      schemas/
      types.ts
  components/
    layout/
  styles/
  types/
  assets/
```

## API Endpoints

Centralized in `src/services/endpoints.ts`:

- `health`: `/api/v1/health`
- `auth.login`: `/api/v1/auth/login`
- `auth.register`: `/api/v1/auth/register`

Use `request()` from `src/services/http/client.ts` for network calls.

## Data Fetching

TanStack Query is used for mutations and caching. Use `useMutation` for writes and `useQuery`
for reads. The provider is configured in `src/main.tsx`.

## Types Layer

Keep types close to their feature (e.g. `src/features/auth/types.ts`). Use a shared
`src/types/` folder only for cross-feature contracts (e.g. pagination, api error shape).

## Environment Variables

Only use public Vite variables in the frontend:

- `VITE_API_BASE_URL=http://localhost:8000`

Never store secrets in the frontend bundle. Treat everything in `import.meta.env` as public.

### Built-in Vite Env Constants

- `import.meta.env.MODE`
- `import.meta.env.BASE_URL`
- `import.meta.env.PROD`
- `import.meta.env.DEV`
- `import.meta.env.SSR`

## Security Notes

- Prefer HttpOnly cookies for auth tokens instead of localStorage.
- If using cookies, ensure backend enables CSRF protection.
- Avoid hardcoding sensitive values in components.
- Keep CORS and rate limiting in the Go backend.
