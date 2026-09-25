# Plan: TASK-0021 — Remove Demo Auth Backdoor and Enforce Real Backend Authentication

## Objective
Remove all hardcoded demo credentials (`master`, `master123`, `admin123`), fake `sessionStorage` session persistence, and deceptive error hints from `apps/frontend/src/lib/admin-api.ts`. Enforce real Spring Security backend JWT authentication (`POST /api/v1/admin/auth/login`, `GET /api/v1/admin/auth/me`).

## Steps
1. In `.worktrees/TASK-0021-remove-demo-auth-backdoor/apps/frontend/src/lib/admin-api.ts`:
   - Remove `DEMO_MASTER_USER` and `DEMO_SESSION_KEY`.
   - Update `adminLogin`:
     - Cleanly execute `fetch(url, ...)` with 6s timeout.
     - On network failure / fetch rejection: throw `"Сервер авторизации недоступен. Пожалуйста, убедитесь, что бэкенд запущен."`
     - On HTTP 401: throw `"Неверный логин или пароль мастера"`.
     - On HTTP 200: return `await res.json()`.
     - Remove `validDemoLogins`, `validDemoPasswords`, and demo hint.
   - Update `getAdminMe`:
     - Return `user` on HTTP 200, return `null` on 401/403 or network failure.
     - Remove `sessionStorage` reading/writing.
   - Update `adminLogout`:
     - Execute `POST /api/v1/admin/auth/logout`.
     - Remove `sessionStorage.removeItem(DEMO_SESSION_KEY)`.
2. Validate frontend build via `npm run build` in `apps/frontend`.
3. Verify that `admin/login` page works cleanly with real errors and without mock hints.
4. Prepare handoff and commit changes.
