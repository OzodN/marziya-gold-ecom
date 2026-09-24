# Handoff: TASK-0002 — Initial Flyway Schema Migration and Database Documentation

- **От кого:** Database Architect (`database`)
- **Кому:** Reviewer (`reviewer`) / Backend Architect (`backend`)
- **Дата:** 2026-09-24
- **Ветка Git:** `feat/TASK-0002-flyway-schema`
- **Worktree:** `.worktrees/TASK-0002-flyway-schema`

## 1. Выполненная работа
- [x] Создана базовая DDL-миграция Flyway `apps/backend/src/main/resources/db/migration/V1__init_schema.sql` для PostgreSQL 16+.
- [x] Подключено расширение `pg_trgm` (`CREATE EXTENSION IF NOT EXISTS pg_trgm`).
- [x] Созданы все 11 сущностных таблиц схемы: `admin_user`, `category`, `characteristic_key`, `stone_type`, `product`, `product_image`, `product_stone`, `inquiry`, `inquiry_item`, `inquiry_status_history`, `site_setting`.
- [x] Сконфигурированы внешние ключи с точными каскадными политиками (`ON DELETE CASCADE`, `RESTRICT`, `SET NULL`).
- [x] Сконфигурированы индексы:
  - GIN на JSONB-характеристики изделий (`idx_product_characteristics`) и камней (`idx_product_stone_characteristics`).
  - GIN pg_trgm для нечеткого поиска по названию и артикулу (`idx_product_trgm`).
  - B-Tree индексы на `category_id`, `is_visible`, `inquiry.status`, `inquiry.created_at DESC` и внешние ключи.
- [x] Синхронизирована архитектурная документация в `database/schema-model.md`.
- [x] Подтверждено отсутствие конкурирующих `.sql` файлов в каталоге `database/`.
- [x] Выполнена проверка инфраструктуры скриптом `scripts/validate-ai-state.ps1` (100% PASS).

## 2. Измененные файлы
- `apps/backend/src/main/resources/db/migration/V1__init_schema.sql`: Создана каноническая DDL-миграция Flyway.
- `database/schema-model.md`: Дополнена документация индексов для `product_stone`.
- `.ai/work/tasks/TASK-0002/plan.md`: Отмечены выполненные этапы.
- `.ai/work/tasks/TASK-0002/task.yaml`: Обновлен статус на `review`, валидация `passed`.
- `.ai/work/registry.yaml`: Обновлен статус задачи на `review`.

## 3. Принятые решения
- Использование `JSONB` с дефолтом `'[]'::jsonb` для `product.characteristics` и `product_stone.characteristics`.
- Поле `inquiry_item.product_snapshot` строго типизировано как `JSONB NOT NULL` для неизменяемой фиксации данных о товаре на момент подачи заявки клиентом.
- При удалении товара (`product`), связанные позиции в `inquiry_item` сохраняются со значением `product_id = NULL` (`ON DELETE SET NULL`), защищая историю заявок.
- Для ускорения выборок и предотвращения блокировок при каскадном удалении добавлены B-Tree индексы на внешние ключи дочерних таблиц.

## 4. Допущения
- В production-среде расширение `pg_trgm` поддерживается на целевых PaaS (Neon, Supabase) по умолчанию.

## 5. Известные ограничения
- Удаление категорий и типов камней защищено правилом `ON DELETE RESTRICT` — невозможно удалить категорию или тип камня, пока на них ссылаются товары или камни.

## 6. Валидация
- Команда проверки: `powershell -ExecutionPolicy Bypass -File .\scripts\validate-ai-state.ps1`
- Результат: All checks green (PASS)

## 7. Следующие шаги
- [ ] Прохождение шлюза `database_migration_gate` и ревью кода.
- [ ] Вливание ветки `feat/TASK-0002-flyway-schema` в `main`.
- [ ] Разблокировка `TASK-0003` (Spring Boot Scaffolding & Security) для `backend` агента.

## 8. Ключевые файлы
- `apps/backend/src/main/resources/db/migration/V1__init_schema.sql`
- `database/schema-model.md`
- `.ai/work/tasks/TASK-0002/task.yaml`
