# Иерархия источников истины (Source of Truth Model)

Для предотвращения рассинхронизации между параллельно работающими AI-агентами устанавливается строгая иерархия источников истины. Каждый аспект системы имеет **ровно одно каноническое место хранения**. Любые дублирующие копии или сгенерированные файлы строго подчиняются каноническому источнику.

---

## 1. Карта источников истины

| Аспект | Канонический источник истины | Допустимые производные (Read-only) | Кто имеет право изменять |
|---|---|---|---|
| **1. Бизнес-требования и продукт** | `docs/architecture/product-architecture.md` | `.ai/context/*.md` | Product Architect / Orchestrator |
| **2. Архитектурные решения (ADR)** | `docs/adr/*.md` | `.ai/decisions/` (ссылки/указатели) | Lead Architect / Orchestrator |
| **3. Контракт API** | `docs/api/openapi.yaml` | Сгенерированные клиентские/серверные DTO | Lead Architect / Backend Agent (по согласованию) |
| **4. Схема базы данных** | `apps/backend/src/main/resources/db/migration/*.sql` (Flyway) | `database/schema-model.md` (документация) | Database Agent / Backend Agent |
| **5. Реализация Backend** | `apps/backend/` | Тестовые отчеты, Swagger UI | Backend Agent |
| **6. Реализация Frontend** | `apps/frontend/` | Сборка Next.js, Storybook | Frontend Agent |
| **7. Инфраструктура и развертывание** | `infra/` и `.github/workflows/` | Отчеты о деплое | DevOps Agent |
| **8. Состояние задач (Task State)** | `.ai/work/registry.yaml` и `.ai/work/tasks/<ID>/task.yaml` | `.ai/work/active/`, дашборды | Orchestrator / Владелец задачи |
| **9. Сгенерированное состояние** | `.ai/state/generated/*.json` | **НИКОГДА НЕ ЯВЛЯЕТСЯ ИСТОЧНИКОМ ИСТИНЫ** | Генераторы / Скрипты валидации |

---

## 2. Правила разрешения конфликтов

1. **Контракт API первичен по отношению к коду:**
   - Если реализация эндпоинта в Spring Boot или вызов в Next.js расходится с `docs/api/openapi.yaml`, **код считается ошибочным**.
   - Изменение `docs/api/openapi.yaml` возможно только через регламент `workflow/architecture-change.md` с предварительным уведомлением обоих агентов (Frontend и Backend).

2. **Flyway-миграции первичны по отношению к JPA-сущностям:**
   - Каноническая структура таблиц, внешних ключей, JSONB-полей и индексов `pg_trgm` определяется SQL-файлами миграций Flyway.
   - JPA-аннотации `@Entity`, `@Table`, `@Column` должны строго соответствовать миграциям, а не наоборот (`ddl-auto` строго `validate` или `none`).

3. **Сгенерированные файлы не имеют юридической силы:**
   - Файлы в `.ai/state/generated/` (например, `project-state.json`, `dependency-graph.json`) служат исключительно для ускорения чтения контекста агентами.
   - Если в сгенерированном файле указан статус задачи `done`, а в `.ai/work/tasks/TASK-XXXX/task.yaml` статус `review` — истинным считается статус из `task.yaml`.

4. **ADR (Architecture Decision Records) неизменяемы задним числом:**
   - Принятый и зафиксированный ADR в `docs/adr/` не редактируется для изменения сути решения.
   - Новое решение оформляется **новым ADR**, который явно отменяет или дополняет предыдущий (статус `Superseded by ADR-XXXX`).
