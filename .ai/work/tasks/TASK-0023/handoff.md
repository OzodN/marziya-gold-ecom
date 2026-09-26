# Handoff: TASK-0023 — Resolve Admin Login CORS and Host Resolution Issue

- **От кого:** fullstack
- **Кому:** orchestrator
- **Дата:** 2026-09-26
- **Ветка Git:** fix/TASK-0023-cors-host-resolution
- **Worktree:** .worktrees/TASK-0023-cors-host-resolution

## 1. Выполненная работа
- [x] Диагностирована причина ошибки "Сервер авторизации недоступен...": Spring Boot отвергал preflight-запросы `OPTIONS` с кодом 403 Forbidden при обращении с `127.0.0.1:3000`, `localhost:3001` и других dev-портов из-за строгого белого списка `allowedOrigins`.
- [x] В `SecurityConfig.java` настроен `setAllowedOriginPatterns` с поддержкой wildcard-портов локальной разработки (`http://localhost:[*]`, `http://127.0.0.1:[*]`, `http://[::1]:[*]`), что полностью совместимо со стандартом CORS и `allowCredentials(true)`.
- [x] Добавлен экспорт заголовков `Authorization`, `Content-Disposition`, `Set-Cookie` в `SecurityConfig.java`.
- [x] Обновлен `application.yml` и `application.yml.example` со стандартными fallback-портами разработки.
- [x] Разработан комплексный юнит-тест `SecurityConfigCorsTest.java` (проверка `localhost`, `127.0.0.1`, произвольных dev-портов и отклонения посторонних хостов).
- [x] В `apps/frontend/src/lib/admin-api.ts` улучшена функция `getApiBaseUrl()`: при отсутствии `NEXT_PUBLIC_API_URL` динамически определяется `window.location.hostname` (устраняя конфликт при открытии сайта по IP/домену).
- [x] В `apps/frontend/src/lib/admin-api.ts` в `adminLogin` добавлен прозрачный вывод ошибок в `console.error` и уточнение сообщения с указанием причины сбоя сети.
- [x] Прогнаны сборка фронтенда (`npm run build`) и все 134 теста бэкенда (`mvn clean test`), 0 ошибок.

## 2. Измененные файлы
- `apps/backend/src/main/java/com/marziyagold/security/SecurityConfig.java`: переход на `setAllowedOriginPatterns` для поддержки dev-портов и IP-адресов.
- `apps/backend/src/main/resources/application.yml`: расширение дефолтных CORS-источников.
- `apps/backend/src/main/resources/application.yml.example`: обновление примера конфигурации.
- `apps/backend/src/test/java/com/marziyagold/security/SecurityConfigCorsTest.java`: юнит-тесты для CORS.
- `apps/frontend/src/lib/admin-api.ts`: динамическое сопоставление хоста в `getApiBaseUrl()` и информативная обработка ошибок в `adminLogin`.
- `.ai/work/registry.yaml`: регистрация TASK-0023.
- `.ai/work/tasks/TASK-0023/task.yaml`: спецификация задачи TASK-0023.

## 3. Принятые решения
- Использован `setAllowedOriginPatterns` вместо `setAllowedOrigins`, так как при `allowCredentials=true` Spring Security требует либо точные совпадения, либо паттерны. `setAllowedOriginPatterns` позволяет гибко и безопасно поддерживать любые порты на `localhost` и `127.0.0.1` в среде разработки.
- Фронтенд использует `window.location.hostname`, чтобы запрос к API всегда шел к тому же хосту, на котором открыт браузер (например, если браузер открыт на `http://127.0.0.1:3000`, запрос уйдет на `http://127.0.0.1:8080/api/v1`).

## 4. Допущения
- Бэкенд по умолчанию слушает порт 8080.

## 5. Известные ограничения
- Нет.

## 6. Валидация
- `mvn test -Dtest=SecurityConfigCorsTest`: 3 tests run, 0 failures, 0 errors.
- `mvn clean test`: 134 tests run, 0 failures, 0 errors.
- `npm run build`: Сборка Next.js 15.5.26 завершилась успешно (0 ошибок, 0 предупреждений).

## 7. Следующие шаги
- Слить ветку `fix/TASK-0023-cors-host-resolution` в `main`.
- Перезапустить бэкенд на порту 8080 для применения обновленного CORS фильтра.
- Проверить вход в `/admin/login` под `admin` / `admin123`.

## 8. Ключевые файлы
- `apps/backend/src/main/java/com/marziyagold/security/SecurityConfig.java`
- `apps/frontend/src/lib/admin-api.ts`
- `apps/backend/src/test/java/com/marziyagold/security/SecurityConfigCorsTest.java`
