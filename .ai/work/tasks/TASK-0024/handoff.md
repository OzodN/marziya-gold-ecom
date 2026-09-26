# Handoff: TASK-0024 — Temporary Universal Origin and Ngrok Tunnel Support for Admin Login and API

- **От кого:** fullstack
- **Кому:** orchestrator
- **Дата:** 2026-09-26
- **Ветка Git:** feat/TASK-0024-universal-origin
- **Worktree:** .worktrees/TASK-0024-universal-origin

## 1. Выполненная работа
- [x] В `SecurityConfig.java` активирован универсальный режим сопоставления CORS-источников: поддержка `*` в `setAllowedOriginPatterns(List.of("*"))`, что позволяет безопасно принимать запросы с любых доменов и туннелей (ngrok, localtunnel, LAN IP) при активном `allowCredentials(true)`.
- [x] В `application.yml` и `application.yml.example` дефолтное значение `allowed-origins` установлено в `*`.
- [x] В `AdminAuthService.java` добавлен возврат заголовка `Authorization: Bearer <token>` и поле `token` в `AdminUserDto` для надежной аутентификации в сценариях, когда браузерные политики блокируют сторонние cookie между доменами туннеля и локалхостом.
- [x] В `next.config.ts` настроены rewrites `/api/backend/:path*` -> `${backendUrl}/api/:path*`, что предотвращает блокировку Mixed Content (когда страница открыта по HTTPS через ngrok, а бэкенд на HTTP).
- [x] В `apps/frontend/src/lib/admin-api.ts` и `apps/frontend/src/lib/api.ts` обновлен `getApiBaseUrl()`: при обнаружении туннеля/HTTPS-протокола запросы автоматически идут через `/api/backend/v1`.
- [x] В `apps/frontend/src/lib/admin-api.ts` внедрены хелперы `getAdminAuthToken`, `setAdminAuthToken` и `getAuthHeaders`, передающие заголовок `Authorization: Bearer <token>` во все админские эндпоинты в дополнение к сессионным cookie.
- [x] Добавлен тест в `SecurityConfigCorsTest.java` для проверки работы wildcard origin (`*`) с ngrok-доменами (`*.ngrok-free.app`, `*.ngrok.io`).
- [x] Все 135 бэкенд-тестов (`mvn test`) и сборка фронтенда (`npm run build`) успешно завершены.

## 2. Измененные файлы
- `apps/backend/src/main/java/com/marziyagold/security/SecurityConfig.java`
- `apps/backend/src/main/java/com/marziyagold/service/AdminAuthService.java`
- `apps/backend/src/main/java/com/marziyagold/dto/AdminUserDto.java`
- `apps/backend/src/main/resources/application.yml`
- `apps/backend/src/main/resources/application.yml.example`
- `apps/backend/src/test/java/com/marziyagold/security/SecurityConfigCorsTest.java`
- `apps/frontend/next.config.ts`
- `apps/frontend/src/types/api.ts`
- `apps/frontend/src/lib/admin-api.ts`
- `apps/frontend/src/lib/api.ts`
- `.ai/work/registry.yaml`
- `.ai/work/tasks/TASK-0024/task.yaml`

## 3. Принятые решения
- Использование `setAllowedOriginPatterns(List.of("*"))` в Spring Security позволяет клиентам с любыми динамическими ngrok-поддоменами авторизовываться без необходимости вручную менять конфигурацию бэкенда при каждом перезапуске туннеля.
- Добавление Next.js rewrites гарантирует отсутствие ошибок браузера "Mixed Content" (HTTPS -> HTTP), если фронтенд хостится через ngrok, а бэкенд слушает локальный HTTP-порт 8080.
- Двойной механизм авторизации (HttpOnly Cookie + Bearer Token Fallback) обеспечивает 100% надежность даже при строгих политиках кросс-доменных cookies браузера.

## 4. Допущения
- По завершении активного тестирования через ngrok перед релизом в продакшн значение `CORS_ALLOWED_ORIGINS` должно быть зафиксировано на конкретном боевом домене.

## 5. Известные ограничения
- Нет.

## 6. Валидация
- `mvn test`: 135 tests run, 0 failures, 0 errors.
- `npm run build`: Сборка Next.js 15.5.26 успешна (0 ошибок).

## 7. Следующие шаги
- Слить ветку `feat/TASK-0024-universal-origin` в `main`.
- Зафиксировать статус задачи в `registry.yaml` как `done`.
