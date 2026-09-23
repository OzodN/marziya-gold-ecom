# Рабочий процесс: Аудит безопасности (Security Review Workflow)

## 1. Точка входа (Entry Condition)
- Изменение механизмов аутентификации, авторизации, работы с куками, CORS, загрузки файлов или плановый релизный аудит.

## 2. Исполнитель и навыки
- Назначенный агент: `security`.
- Навыки: `backend-security-coder`, `frontend-security-coder`, `api-security-best-practices`, `auth-implementation-patterns`.

## 3. Чек-лист аудита
1. **Аутентификация:** Проверка хранения JWT в `HttpOnly`, `SameSite=Strict`, `Secure` cookies.
2. **CORS:** Ограничение разрешенных origins только доменом витрины.
3. **Защита от спама:** Проверка Bucket4j rate limiting на эндпоинте отправки заявок `POST /api/v1/inquiries`.
4. **Инъекции:** Проверка отсутствия склейки SQL-строк (только Spring Data / Parameterized Queries).
5. **Загрузка файлов:** Проверка валидации MIME-типов и размеров фото перед отправкой в Cloudinary.
6. **Секреты:** Проверка отсутствия hardcoded API-ключей в кодовой базе и Git.

## 4. Результат аудита
- Формирование отчета в `.ai/reports/security/AUDIT-YYYY-MM-DD.md`.
- Если найдены уязвимости: создание блокеров `TASK-XXXX` с наивысшим приоритетом.
- Прохождение `security_audit_gate`.
