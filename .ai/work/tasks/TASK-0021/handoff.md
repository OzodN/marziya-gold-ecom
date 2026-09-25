# Handoff Report: TASK-0021 — Remove Demo Auth Backdoor and Enforce Real Backend Authentication

## 1. Обзор задачи
- **Идентификатор:** `TASK-0021`
- **Тип:** `fix` (Security & Architecture remediation)
- **Ветка:** `fix/TASK-0021-remove-demo-auth-backdoor`
- **Рабочее дерево (Worktree):** `.worktrees/TASK-0021-remove-demo-auth-backdoor`
- **Ключевая цель:**
  1. Полностью устранить бэкдор авторизации со статическими паролями и логинами (`master / master123`, `admin123`) в коде фронтенда.
  2. Устранить раскрытие паролей в тексте ошибки формы (`"Неверный логин или пароль мастера. (Для демо используйте: master / master123)"`).
  3. Устранить фейковую сессию в `sessionStorage` (`DEMO_SESSION_KEY`), маскировавшую недоступность бэкенда.
  4. Перевести авторизацию на строгое обращение к реальному Spring Boot серверу (`POST /api/v1/admin/auth/login`, `GET /api/v1/admin/auth/me`, `POST /api/v1/admin/auth/logout`) с сохранением защищенной `HttpOnly` Cookie сессии.

---

## 2. Реализованные изменения

### `apps/frontend/src/lib/admin-api.ts`
1. **Удалены демо-константы:**
   - Удален `DEMO_MASTER_USER`.
   - Удален `DEMO_SESSION_KEY = "mg_demo_admin_session"`.
2. **Переписана функция `adminLogin(credentials)`:**
   - Выполняет реальный сетевой запрос `POST /api/v1/admin/auth/login` с `credentials: 'include'`.
   - При статусе 200 (OK) возвращает данные реального пользователя `AdminUserDto` (без сохранения в `sessionStorage`).
   - При статусе 401 (Unauthorized) выбрасывает исключение: `"Неверный логин или пароль мастера"`.
   - При ошибке сети / недоступности сервера (Connection refused, timeout) выбрасывает исключение: `"Сервер авторизации недоступен. Пожалуйста, убедитесь, что бэкенд запущен."`.
   - Полностью вырезаны массивы `validDemoLogins`, `validDemoPasswords` и подсказка пароля.
3. **Переписана функция `adminLogout()`:**
   - Отправляет `POST /api/v1/admin/auth/logout` на бэкенд.
   - Очищены вызовы манипуляций с `sessionStorage`.
4. **Переписана функция `getAdminMe()`:**
   - Проверяет реальную `HttpOnly` Cookie сессию мастера через `GET /api/v1/admin/auth/me`.
   - Если сервер недоступен или вернул 401/403, возвращает `null` (неавторизован).
   - Никаких фейковых сессий из `sessionStorage` не восстанавливается.

---

## 3. Результаты валидации сборки (`npm run build`)

Сборка `apps/frontend` завершилась успешно с кодом 0:
```text
> marziya-gold-frontend@0.1.0 build
> next build

   ▲ Next.js 15.5.26

   Creating an optimized production build ...
 ✓ Compiled successfully in 11.0s
   Linting and checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (27/27)
   Finalizing page optimization ...
   Collecting build traces ...
```

---

## 4. Результаты тестирования безопасности
- Вход с логином `master` и паролем `master123` больше **НЕВОЗМОЖЕН**.
- При вводе неверных учетных данных интерфейс возвращает строгое сообщение: `Неверный логин или пароль мастера`.
- Никаких подсказок о тестовых логинах и паролях в UI не выводится.
- При выключенном бэкенде система честно информирует: `Сервер авторизации недоступен. Пожалуйста, убедитесь, что бэкенд запущен.`.
