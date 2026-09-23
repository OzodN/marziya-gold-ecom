# Backend Application Placeholder (`apps/backend`)

## Стек
- Java 21 LTS
- Spring Boot 4.1.1
- Spring Data JPA
- Spring Security (JWT в HttpOnly Cookies)
- Flyway (SQL-миграции в `src/main/resources/db/migration/`)
- PostgreSQL 16+

## Правила
Ознакомьтесь с [AGENTS.md](AGENTS.md) перед началом работы.
Реализация сервисов и контроллеров ведется строго по спецификации `docs/api/openapi.yaml`.
Бизнес-логика реализуется назначенным агентом `backend` в рамках выделенных задач.
