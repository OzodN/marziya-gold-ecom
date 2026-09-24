# Handoff: TASK-0006 — Storefront Public REST API, Inquiry Processing & Rate Limiting

- **От кого:** Senior Java Backend Engineer (backend agent)
- **Кому:** Orchestrator / Reviewer
- **Дата:** 2026-09-25
- **Ветка Git:** `feat/TASK-0006-backend-api`
- **Worktree:** `.worktrees/TASK-0006-backend-api`

---

## 1. Выполненная работа

### 1.1. Пакет DTO (`com.marziyagold.dto`)
Полностью реализованы все канонические DTO в соответствии со спецификацией `docs/api/openapi.yaml` и требованиями задачи:
- `ProductSummaryDto` (`id`, `sku`, `name`, `slug`, `categoryName`, `categorySlug`, `mainImageUrl`, `isVisible`, `characteristics`)
- `ProductDetailDto` (`id`, `sku`, `name`, `slug`, `description`, `category`, `categoryName`, `categorySlug`, `images`, `stones`, `characteristics`, `createdAt`, `isVisible`)
- `ProductImageDto` (`id`, `url`, `publicId`, `sortOrder`)
- `ProductStoneDto` (`id`, `stoneTypeId`, `stoneTypeName`, `sortOrder`, `characteristics`)
- `CharacteristicEntryDto` (`name`, `value`)
- `ProductPageResponse` (`content`, `page`, `pageNumber`, `size`, `totalElements`, `totalPages`, `last`) с фабричным методом `from(Page<ProductSummaryDto>)`
- `CategoryDto` (`id`, `name`, `slug`, `sortOrder`)
- `StoneTypeDto` (`id`, `name`, `isActive`)
- `FilterGroupDto` (`name`, `values`)
- `FilterKeysDto` (`categories`, `stoneTypes`, `characteristicKeys`)
- `ProductAvailabilityDto` (`productId`, `isAvailable`, `name`, `sku`, `mainImageUrl`)
- `BatchValidationRequest` (`productIds`)
- `InquiryItemRequest` (`productId`, `quantity`)
- `InquiryCreateRequest` (`clientName`, `clientPhone`, `comment`, `items`)
- `InquiryResponseDto` (`id`, `clientName`, `status`, `message`, `createdAt`)
- `ContactSettingsDto` (`contactPhone`, `phoneNumber`, `contactTelegram`, `telegramUsername`, `masterName`, `aboutText`, `masterBio`)
- `ErrorResponse` (структурированный RFC 7807 совместимый ответ об ошибке)

### 1.2. Репозитории (`com.marziyagold.repository`)
- **`ProductRepository`**:
  - Добавлен метод `findBySlugAndIsVisibleTrue(String slug)` для безопасного поиска активного изделия.
  - Добавлен метод `findByIdInAndIsVisibleTrue(List<Long> ids)` и `findByIdIn(List<Long> ids)` для пакетной валидации подборки.
  - Добавлен JPQL-запрос `findFiltered(categorySlug, stoneTypeId, q, pageable)` с поддержкой пагинации (`Pageable`), фильтрации по категории и типу камня, строго `isVisible = true`, и поиска по названию и артикулу (в PostgreSQL автоматически использует GIN-индекс `idx_product_trgm`).
- **`CategoryRepository`**:
  - Добавлен метод `findAllByIsVisibleTrueOrderBySortOrderAsc()`.

### 1.3. Сервисы (`com.marziyagold.service`)
- **`ProductService`**:
  - `getProducts(...)`: пагинация, фильтрация, маппинг в `ProductSummaryDto` и `ProductPageResponse`.
  - `getProductBySlug(...)`: получение детальной карточки изделия с галереей изображений и вставками драгоценных камней.
  - `validateBatch(...)`: тихая пакетная валидация изделий из подборки клиента с формированием `ProductAvailabilityDto`.
- **`CategoryService`**:
  - `getVisibleCategories()`: возвращает активные категории, отсортированные по `sort_order`.
- **`CharacteristicService`**:
  - `getFilterGroups()`: извлечение активных фильтруемых характеристик и их уникальных значений из изделий каталога.
  - `getFilterKeys()`: возвращает сводку категорий, активных типов камней и фильтруемых ключей.
- **`InquiryService`**:
  - Проверка rate limit по IP клиента через `RateLimitingService` (Bucket4j). При превышении лимита выбрасывается `RateLimitExceededException` (HTTP 429).
  - Валидация состава подборки.
  - Формирование неизменяемого JSONB-снапшота изделий (`ProductSnapshot`) со всеми характеристиками, артикулом, названием и камнями на момент отправки запроса.
  - Создание заявки со статусом `NEW`.
  - Формирование первой записи в `InquiryStatusHistory` (oldStatus: null, newStatus: NEW, changedBy: "CLIENT").
- **`SettingsService`**:
  - Получение контактных данных мастера и мастерской из `site_setting`.

### 1.4. Контроллеры (`com.marziyagold.controller`)
- `ProductController` (`/api/v1/products`):
  - `GET /` — каталог с фильтрацией и пагинацией.
  - `GET /{slug}` — детальная информация об изделии.
  - `POST /validate-batch` — пакетная валидация подборки.
- `CategoryController` (`/api/v1/categories`):
  - `GET /` — список активных категорий.
- `CharacteristicController` (`/api/v1/characteristics`):
  - `GET /filter-keys` — группы фильтров со значениями.
  - `GET /keys` — ключи фильтрации.
- `InquiryController` (`/api/v1/inquiries`):
  - `POST /` — оформление запроса на изготовление с извлечением IP клиента (с учетом заголовков `X-Forwarded-For` и `X-Real-IP`) и возвратом HTTP 201 Created.
- `SettingsController` (`/api/v1/settings`):
  - `GET /contacts` — публичные контакты мастера.

### 1.5. Обработка ошибок (`com.marziyagold.exception`)
- `GlobalExceptionHandler` (`@RestControllerAdvice`):
  - `ResourceNotFoundException` -> HTTP 404 Not Found.
  - `RateLimitExceededException` -> HTTP 429 Too Many Requests.
  - `MethodArgumentNotValidException` -> HTTP 400 Bad Request с детализацией полей.
  - `IllegalArgumentException` / `IllegalStateException` -> HTTP 400 Bad Request.
  - `Exception` -> HTTP 500 Internal Server Error.

---

## 2. Соблюдение канонической терминологии
- Строго выдержаны требования `.ai/context/terminology.md`.
- Термины: «Моя подборка», «В подборку», «Отправить запрос», «Заявка», «Изделие».
- Запрещенные термины («Корзина», «Cart», «Купить», «Оформить заказ», «Checkout») полностью отсутствуют в исходном коде и сообщениях.

---

## 3. Валидация и тестирование
- **Компиляция:** `mvn clean test-compile` выполнен успешно с 0 ошибок.
- **Модульные тесты:** Выполнен полный прогон `mvn clean test` (21 тест пройден без единой ошибки или сбоя):
  - `ProductServiceTest` (4 теста)
  - `InquiryServiceTest` (3 теста)
  - `CategoryServiceTest` (1 тест)
  - `CharacteristicServiceTest` (2 теста)
  - `SettingsServiceTest` (1 тест)
  - `ProductControllerTest` (4 теста)
  - `InquiryControllerTest` (3 теста)
  - `JwtTokenProviderTest` (2 теста)
  - `RateLimitingServiceTest` (1 тест)
