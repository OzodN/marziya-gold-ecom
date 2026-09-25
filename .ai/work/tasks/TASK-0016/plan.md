# План реализации TASK-0016: Admin Product Management REST API

## 1. Цель задачи
Реализовать административные эндпоинты управления товарами каталога в соответствии со спецификацией `docs/api/openapi.yaml` (раздел `[Admin Products]`) и требованиями архитектуры `docs/architecture/product-architecture.md` (разделы 4, 9, 10, 14).

## 2. Объем реализации в `apps/backend/src/main/java/com/marziyagold/`
1. **DTO:**
   - `ProductSaveRequest` (sku, name, description, categoryId, isVisible, imageUrls: List<String>, characteristics: List<CharacteristicEntryDto>, stones: List<AdminProductStoneRequest>)
   - `AdminProductStoneRequest` (stoneTypeId, sortOrder, characteristics: List<CharacteristicEntryDto>)
   - `ProductVisibilityUpdateRequest` (isVisible)
2. **Сервис `AdminProductService`:**
   - `getProducts(Pageable pageable, String query, Long categoryId, Boolean isVisible)`: поиск по названию/артикулу, фильтрация по категории и статусу видимости.
   - `getProductById(Long id)`: получение полного изделия для формы редактирования.
   - `createProduct(ProductSaveRequest request)`: валидация уникальности SKU/slug, сохранение сущности `Product` с JSONB-характеристиками, сохранение связанных камней `ProductStone` и изображений `ProductImage`.
   - `updateProduct(Long id, ProductSaveRequest request)`: транзакционное обновление всех полей, характеристик, камней и изображений.
   - `deleteProduct(Long id)`: удаление изделия (или архивация).
   - `updateVisibility(Long id, boolean isVisible)`: быстрый переключатель видимости товара на витрине.
3. **Контроллер `AdminProductController` (`/api/v1/admin/products`):**
   - `GET /` — список товаров для админа с фильтрами и пагинацией.
   - `POST /` — создание нового товара (HTTP 201 Created).
   - `GET /{id}` — получение изделия по ID.
   - `PUT /{id}` — обновление изделия.
   - `DELETE /{id}` — удаление изделия (HTTP 204 No Content).
   - `PATCH /{id}/visibility` — переключение видимости изделия.
4. **Тесты:**
   - `AdminProductServiceTest`: модульные тесты сервиса.
   - `AdminProductControllerTest`: срез-тесты контроллера с MockMvc и проверкой авторизации `ROLE_ADMIN`.

## 3. Валидация
- `mvn clean test` (все тесты зеленые, 0 ошибок).
- Оформление отчета `handoff.md`.
