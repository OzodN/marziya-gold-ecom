# План выполнения: TASK-0002 — Initial Flyway Schema Migration and Database Documentation

## 1. Загрузка контекста
- [ ] Ознакомиться с `database/AGENTS.md` и `database/schema-model.md`.
- [ ] Ознакомиться с `docs/architecture/product-architecture.md` (раздел 4.1 "Модель данных").

## 2. Разработка миграции V1__init_schema.sql
- [ ] Создать директорию `apps/backend/src/main/resources/db/migration`.
- [ ] Создать файл `apps/backend/src/main/resources/db/migration/V1__init_schema.sql`.
- [ ] Включить расширение `pg_trgm`.
- [ ] Реализовать DDL для таблиц:
  - `admin_user`
  - `category`
  - `characteristic_key`
  - `stone_type`
  - `product`
  - `product_image`
  - `product_stone`
  - `inquiry`
  - `inquiry_item` (с `product_snapshot JSONB`)
  - `inquiry_status_history`
  - `site_setting`
- [ ] Добавить все необходимые индексы:
  - B-Tree: `category_id`, `is_visible`, `inquiry.status`, `inquiry.created_at`
  - GIN: `product.characteristics`, `product_stone.characteristics`
  - GIN pg_trgm: `product(name, sku)`

## 3. Верификация
- [ ] Проверить SQL-синтаксис PostgreSQL 16+.
- [ ] Убедиться в отсутствии конкурирующих `.sql` файлов в `database/`.
- [ ] Запустить `scripts/validate-ai-state.ps1`.

## 4. Завершение и передача
- [ ] Создать коммит `feat(db): initial flyway schema migration V1`.
- [ ] Подготовить отчет `.ai/work/tasks/TASK-0002/handoff.md`.
