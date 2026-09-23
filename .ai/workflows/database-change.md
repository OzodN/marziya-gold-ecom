# Рабочий процесс: Изменение схемы базы данных (Database Change Workflow)

## 1. Точка входа (Entry Condition)
- Необходимость добавления новой таблицы, колонки, индекса или изменения существующей схемы БД.

## 2. Исполнитель и навыки
- Назначенный агент: `database`.
- Навыки: `database-design`, `postgresql`, `postgres-best-practices`.

## 3. Правило источника истины (Source of Truth Rule)
- **ЕДИНСТВЕННЫЙ ИСТОЧНИК ИСТИНЫ СХЕМЫ:** `apps/backend/src/main/resources/db/migration/V{timestamp}__{description}.sql`.
- Запрещено менять структуру таблиц напрямую в БД без миграции.

## 4. Разработка миграции
1. Создание нового версионного файла миграции Flyway.
2. Проверка обратной совместимости (backward compatibility):
   - Добавление колонок с дефолтными значениями или `nullable`.
   - Проверка индексов для JSONB (`gin (characteristics)`) или `pg_trgm`.
3. Обновление документации `database/schema-model.md`.

## 5. Прохождение шлюзов (Review Gates)
- Прохождение `database_migration_gate`.
- Если миграция затрагивает сущности: агент `backend` уведомляется о необходимости обновить `@Entity` классы.

## 6. Завершение
- Локальный прогон миграции через `mvn test` или Flyway runner.
- Хендофф для бэкенда, мерж в `main`, статус `done`.
