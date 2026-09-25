# Handoff: TASK-0016 — Admin Product Management REST API (CRUD, Visibility, Dynamic Characteristics & Stones)

- **От кого:** Senior Java Backend Engineer (backend agent)
- **Кому:** Orchestrator / Reviewer
- **Дата:** 2026-09-25
- **Ветка Git:** `feat/TASK-0016-admin-products`
- **Worktree:** `.worktrees/TASK-0016-admin-products`
- **Коммит:** `feat(backend): implement admin product management REST API (TASK-0016)`

---

## 1. Выполненная работа

### 1.1. Пакет DTO (`com.marziyagold.dto`)
Реализованы DTO для административного управления товарами каталога:
- **`ProductSaveRequest`**:
  - `sku` (`@NotBlank`, уникальный артикул изделия).
  - `name` (`@NotBlank`, наименование изделия).
  - `description` (детальное описание).
  - `categoryId` (`@NotNull`, идентификатор категории).
  - `isVisible` (флаг видимости в публичной витрине, по умолчанию `true`).
  - `imageUrls` (список CDN URL изображений Cloudinary).
  - `characteristics` (динамические JSONB-характеристики `List<CharacteristicEntryDto>`).
  - `stones` (список драгоценных/полудрагоценных вставок `List<@Valid AdminProductStoneRequest>`).
- **`AdminProductStoneRequest`**:
  - `stoneTypeId` (`@NotNull`, ссылка на справочник `StoneType`).
  - `sortOrder` (порядок следования вставок).
  - `characteristics` (динамические характеристики камня, например вес, огранка, цвет, чистота).
- **`ProductVisibilityUpdateRequest`**:
  - `isVisible` (`@NotNull`, быстрый переключатель видимости товара).

### 1.2. Репозиторий и доступ к данным (`com.marziyagold.repository`)
- **`ProductRepository`**:
  - Добавлен метод проверки уникальности артикула при обновлении: `boolean existsBySkuAndIdNot(String sku, Long id)`.
  - Добавлен метод проверки уникальности slug при обновлении: `boolean existsBySlugAndIdNot(String slug, Long id)`.
  - Добавлен HQL/JPA-запрос `findAdminFiltered` с поддержкой:
    - Поисковой строки `q` по наименованию и артикулу (регистронезависимо).
    - Фильтрации по `categoryId`.
    - Опциональной фильтрации по статусу видимости `isVisible` (`true`/`false`/`null`).
    - Пагинации и динамической сортировки (по умолчанию `createdAt DESC`).

### 1.3. Утилита транслитерации и генерации Slug (`com.marziyagold.util.SlugUtils`)
- Реализована утилита транслитерации кириллических и латинских символов в человекопонятные URL (ЧПУ):
  - Полнофункциональная таблица транслитерации ГОСТ/ISO для кириллицы.
  - Удаление спецсимволов, нормализация дефисов.
  - Автоматическое разрешение коллизий (добавление инкрементального суффикса `-1`, `-2` при совпадении slug).

### 1.4. Сервисный слой (`com.marziyagold.service.AdminProductService`)
Реализован полный комплекс бизнес-логики:
- **`getProducts(Pageable, String query, Long categoryId, Boolean isVisible)`**:
  - Безопасное применение сортировки по умолчанию `createdAt DESC`.
  - Поиск и фильтрация с возвратом пагинированного списка `Page<ProductSummaryDto>`.
- **`getProductById(Long id)`**:
  - Получение полного изделия для единой формы редактирования (включая галерею, камни и характеристики).
  - Выброс `ResourceNotFoundException` при отсутствии.
- **`createProduct(ProductSaveRequest)`**:
  - Валидация уникальности SKU (выброс `IllegalArgumentException` при дубликате).
  - Проверка существования категории и типов камней (`ResourceNotFoundException`).
  - Генерация уникального `slug`.
  - Транзакционное сохранение изделия, коллекции изображений `ProductImage` и вставок `ProductStone` с JSONB-характеристиками.
- **`updateProduct(Long id, ProductSaveRequest)`**:
  - Проверка уникальности SKU с исключением текущего изделия.
  - Транзакционное обновление основных полей, категории, JSONB-характеристик.
  - Чистая замена дочерних коллекций `images` и `stones` благодаря `orphanRemoval = true`.
- **`deleteProduct(Long id)`**:
  - Каскадное удаление изделия со всеми дочерними изображениями и вставками.
- **`updateVisibility(Long id, boolean isVisible)`**:
  - Быстрое переключение видимости изделия на витрине.

### 1.5. REST-контроллер (`com.marziyagold.controller.admin.AdminProductController`)
Реализован контроллер по базовому пути `/api/v1/admin/products`:
- `GET /` — пагинированный список товаров для админки с заголовками `X-Total-Count`, `X-Total-Pages`, `X-Page-Number`, `X-Page-Size` и телом `ProductPageResponse`.
- `POST /` — создание нового товара (HTTP 201 Created).
- `GET /{id}` — получение изделия по ID (HTTP 200 OK).
- `PUT /{id}` — обновление изделия по ID (HTTP 200 OK).
- `DELETE /{id}` — удаление изделия (HTTP 204 No Content).
- `PATCH /{id}/visibility` — мгновенный переключатель видимости (HTTP 200 OK).

### 1.6. Безопасность и авторизация
- В соответствии с правилами `SecurityConfig`:
  - Маршруты `/api/v1/admin/**` защищены правилом `.requestMatchers("/api/v1/admin/**").hasRole("ADMIN")`.
  - Аутентификация обеспечивается через защищенную `HttpOnly` Cookie (`access_token`) с проверкой в `JwtAuthenticationFilter`.

### 1.7. Спецификация API (`docs/api/openapi.yaml`)
- Актуализирована OpenAPI 3.1 спецификация:
  - Добавлены query-параметры (`page`, `size`, `q`, `categoryId`, `isVisible`) и схема ответа `ProductPageResponse` для `GET /admin/products`.
  - Добавлен `GET /admin/products/{id}` с ответом `ProductDetailResponse`.
  - Добавлен `PATCH /admin/products/{id}/visibility` со схемой запроса `ProductVisibilityUpdateRequest` и ответом `ProductDetailResponse`.
  - Зарегистрирована схема `ProductVisibilityUpdateRequest` в разделе `components/schemas`.

---

## 2. Соблюдение канонической терминологии
- Строго соблюдена специфика ювелирного каталога под заказ:
  - Используются термины: «Изделие», «Подборка», «Заявка», «Характеристики», «Вставки / Камни».
  - Запрещенные термины e-commerce («Корзина», «Cart», «Checkout», «Платеж») полностью исключены.

---

## 3. Валидация и тестирование
- **Сборка и компиляция:** `mvn clean test` в `apps/backend` завершился успешно с кодом 0.
- **Всего тестов:** **79 тестов пройдены успешно (0 failures, 0 errors, 0 skipped)**:
  - `AdminProductServiceTest` (12 тестов):
    - Получение списка изделий с пагинацией и сортировкой `createdAt DESC`.
    - Получение изделия по ID и проверка 404 Not Found.
    - Создание изделия с изображениями и камнями.
    - Проверка дубликата SKU при создании (400 Bad Request).
    - Разрешение коллизий slug.
    - Обновление полей, галереи и камней.
    - Проверка дубликата SKU при обновлении.
    - Удаление изделия и проверка 404.
    - Переключение видимости `isVisible`.
  - `AdminProductControllerTest` (13 тестов):
    - `GET /api/v1/admin/products` с пагинационными заголовками и фильтрами.
    - `POST /api/v1/admin/products` (201 Created).
    - `POST /api/v1/admin/products` с ошибками валидации Bean Validation (400 Bad Request).
    - `POST /api/v1/admin/products` с дубликатом SKU (400 Bad Request).
    - `GET /api/v1/admin/products/{id}` (200 OK / 404 Not Found).
    - `PUT /api/v1/admin/products/{id}` (200 OK / 404 Not Found / 400 Bad Request).
    - `DELETE /api/v1/admin/products/{id}` (204 No Content / 404 Not Found).
    - `PATCH /api/v1/admin/products/{id}/visibility` (200 OK / 400 Bad Request).
  - `SlugUtilsTest` (3 теста):
    - Транслитерация кириллицы.
    - Обработка латиницы и удаление спецсимволов.
    - Обработка null и пустых строк.
  - Все ранее существовавшие тесты (Storefront Products, Inquiries, Admin Auth, Admin Inquiries, Security) сохранены и остаются 100% зелеными.
