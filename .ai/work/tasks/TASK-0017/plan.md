# План реализации TASK-0017: Admin Reference Dictionaries and Site Settings REST API

## 1. Цель задачи
Реализовать административные эндпоинты для управления справочниками (категории, ключи характеристик, типы камней) и настройками сайта мастера в соответствии со спецификацией `docs/api/openapi.yaml` и архитектурой `docs/architecture/product-architecture.md` (разделы 6, 7, 9, 10, 14).

## 2. Объем реализации в `apps/backend/src/main/java/com/marziyagold/`
1. **DTO:**
   - `CategoryAdminSaveRequest` (name, slug, sortOrder, isVisible)
   - `CharacteristicKeySaveRequest` (name, sortOrder, isFilterable)
   - `StoneTypeSaveRequest` (name, isActive)
   - `ContactSettingsUpdateRequest` (phone, telegramUsername, aboutMaster)
2. **Сервисы:**
   - `AdminCategoryService`: CRUD для категорий, сортировка, валидация уникальности slug/name.
   - `AdminCharacteristicService`: CRUD для глобального реестра характеристик (`CharacteristicKey`).
   - `AdminStoneTypeService`: CRUD для реестра типов камней (`StoneType`).
   - `AdminSettingsService`: обновление значений в `SiteSetting` (транзакционно).
3. **Контроллеры:**
   - `AdminCategoryController` (`/api/v1/admin/categories`): `GET /`, `POST /`, `PUT /{id}`, `DELETE /{id}`.
   - `AdminCharacteristicKeyController` (`/api/v1/admin/characteristic-keys`): `GET /`, `POST /`, `DELETE /{id}`.
   - `AdminStoneTypeController` (`/api/v1/admin/stone-types`): `GET /`, `POST /`, `DELETE /{id}`.
   - `AdminSettingsController` (`/api/v1/admin/settings`): `GET /`, `PUT /`.
4. **Тесты:**
   - Модульные тесты сервисов.
   - Срез-тесты контроллеров с MockMvc с проверкой `ROLE_ADMIN` и отказом без токена (401/403).

## 3. Валидация
- `mvn clean test` (все тесты зеленые, 0 ошибок).
- Оформление отчета `handoff.md`.
