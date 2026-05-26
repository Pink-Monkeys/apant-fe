# API Data Flow (Request -> Response)

This document explains how a frontend request is built, sent, and consumed in this project.

## Flow Overview

1. UI form or component triggers an action
2. Feature API function prepares the request
3. HTTP client builds the URL and sends `fetch`
4. Response is parsed and returned (or error thrown)
5. TanStack Query updates UI state

## File Map

- UI layer: `src/features/<feature>/components/*`
- Feature API: `src/features/<feature>/api/*`
- Endpoints: `src/services/endpoints.ts`
- HTTP client: `src/services/http/client.ts`
- Env config: `src/config/env.ts`

## Example: Login

**UI**

`src/features/auth/components/login-form.tsx`

- Collects `email` and `password`
- Calls `mutation.mutate({ email, password })`

**Feature API**

`src/features/auth/api/auth-api.ts`

- `login(payload)` calls `request(ENDPOINTS.auth.login, { method: 'POST', body: payload })`

**HTTP Client**

`src/services/http/client.ts`

- Builds URL with `new URL(path, API_BASE_URL)`
- Sends `fetch` with `Content-Type: application/json`
- Parses JSON response or throws an error on non-2xx

**Response**

- Returned as `AuthResponse` (see `src/features/auth/types.ts`)
- UI can use `mutation.data` or handle `mutation.error`

## Error Handling

- All non-2xx responses throw an error with `status` and `data` (if JSON)
- UI reads `mutation.error.message` for user display
- For structured errors, parse `error.data` in component or create a helper

### Error Envelope

Use a consistent error response on the backend so the frontend can read messages
reliably. The frontend expects a `message` or `error` field when available.

Example JSON:

```json
{
  "message": "Invalid credentials",
  "code": "AUTH_INVALID",
  "errors": {
    "email": ["not found"],
    "password": ["incorrect"]
  }
}
```

Types are defined in `src/types/http.ts`.

## Tips

- Keep request payload types in each feature’s `types.ts`
- Add response types for each endpoint as contracts evolve
- Avoid calling `fetch` directly in components
- Centralize new endpoints in `src/services/endpoints.ts`
