# Handoff: TASK-0012 — Admin Authentication & Inquiries Management REST API

- **От кого:** Senior Java Backend Engineer (backend agent)
- **Кому:** Orchestrator / Reviewer
- **Дата:** 2026-09-25
- **Ветка Git:** `feat/TASK-0012-admin-api`
- **Worktree:** `.worktrees/TASK-0012-admin-api`
- **Коммит:** `feat(backend): implement admin authentication and inquiries management REST API`

---

## 1. Выполненная работа

### 1.1. Пакет DTO (`com.marziyagold.dto`)
Реализованы все DTO в соответствии со спецификацией `docs/api/openapi.yaml` (разделы `[Admin Auth]`, `[Admin Inquiries]`) и требованиями задачи:
- `LoginRequest` (`username`, `password`) — валидируемый запрос на аутентификацию администратора.
- `AdminUserDto` (`id`, `username`, `role`, `createdAt`) — профиль администратора.
- `InquirySummaryDto` (`id`, `clientName`, `clientPhone`, `itemCount`, `status`, `createdAt`, `updatedAt`) — представление заявки для списка и фильтрации.
- `InquiryItemDetailDto` (`id`, `productId`, `quantity`, `productSnapshot` / `snapshot`) — позиция заявки с полным историческим JSON-снапшотом изделия.
- `InquiryStatusHistoryDto` (`id`, `oldStatus`, `newStatus`, `changedBy`, `changedAt`) — аудит-запись смены статуса.
- `InquiryDetailDto` (`id`, `clientName`, `clientPhone`, `comment`, `status`, `createdAt`, `updatedAt`, `items`, `history` / `statusHistory`) — детальная карточка заявки с позициями и хронологией изменения статусов.
- `InquiryStatusUpdateRequest` (`status`, `comment`) — запрос на явную смену статуса заявки.
- `NewInquiriesCountDto` (`count` / `newCount`) — легковесный DTO для 30-секундного polling'а новых заявок.

### 1.2. Репозитории (`com.marziyagold.repository`)
- **`InquiryRepository`**:
  - Добавлен метод `long countByStatus(InquiryStatus status)` для оптимального подсчета количества новых заявок (`NEW`) без загрузки сущностей в память.

### 1.3. Сервисы (`com.marziyagold.service`)
- **`AdminAuthService`**:
  - `authenticate(LoginRequest, HttpServletResponse)`:
    - Проверка наличия администратора в БД.
    - Проверка пароля через `PasswordEncoder` (BCrypt).
    - Генерация JWT токена (`JwtTokenProvider`) с сохранением имени и роли (`ADMIN`).
    - Установка защищенной `HttpOnly` Cookie (`access_token`, `SameSite=Strict`, `Path=/`, `Secure=false/true`, `maxAge=24ч`).
    - Фиксация аутентификации в `SecurityContextHolder`.
    - Возврат `AdminUserDto`.
  - `logout(HttpServletResponse)`:
    - Очистка `HttpOnly` Cookie (`Max-Age=0`).
    - Очистка `SecurityContextHolder.clearContext()`.
  - `getCurrentAdmin()`:
    - Извлечение имени администратора из текущего `SecurityContext`.
    - Получение сущности `AdminUser` из репозитория.
  - `getCurrentAdminDto()`:
    - Преобразование текущего администратора в `AdminUserDto`.
- **`AdminInquiryService`**:
  - `getInquiries(Pageable pageable, InquiryStatus status)`:
    - Пагинация и сортировка по умолчанию `createdAt DESC`.
    - Опциональная фильтрация по статусу заявки (`NEW`, `CONTACTED`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`).
    - Расчет общего количества изделий в заявке (`itemCount`).
  - `getInquiryById(Long id)`:
    - Получение заявки с полной коллекцией позиций (включая JSON-слепок характеристик изделия на момент отправки) и таймлайном статусов.
    - Выброс `ResourceNotFoundException` при отсутствии заявки.
  - `updateInquiryStatus(Long id, InquiryStatus newStatus, String adminUsername)`:
    - Явная смена статуса с автоматической фиксацией аудита в `InquiryStatusHistory` (`old_status`, `new_status`, `changed_by`, `changed_at`).
    - Обновление `updated_at` заявки.
    - Возврат обновленной детальной информации о заявке.
  - `getNewInquiriesCount()`:
    - Быстрый подсчет количества заявок в статусе `NEW` для 30-секундного polling'а UI админки.

### 1.4. Контроллеры (`com.marziyagold.controller.admin`)
- **`AdminAuthController`** (`/api/v1/admin/auth`):
  - `POST /login` (публичный эндпоинт, разрешен в `SecurityConfig`) — вход в систему с установкой `HttpOnly` Cookie.
  - `POST /logout` (защищен ролью `ADMIN`) — выход с очисткой куки.
  - `GET /me` (защищен ролью `ADMIN`) — получение текущего профиля администратора.
- **`AdminInquiryController`** (`/api/v1/admin/inquiries`):
  - `GET /` — список заявок с поддержкой статусного фильтра `?status=...`, пагинации (`page`, `size`) и пагинационных HTTP-заголовков (`X-Total-Count`, `X-Total-Pages`, `X-Page-Number`, `X-Page-Size`).
  - `GET /new-count` — легковесный счетчик новых заявок.
  - `GET /{id}` — детальная карточка заявки с историей и слепками изделий.
  - `PUT /{id}/status` — смена статуса заявки с фиксацией автора изменения из `Principal`.

### 1.5. Безопасность и фильтры (`com.marziyagold.security`, `com.marziyagold.exception`)
- **`SecurityConfig`**:
  - `POST /api/v1/admin/auth/login` разрешен всем (`permitAll()`).
  - Все остальные маршруты `/api/v1/admin/**` защищены авторизацией `hasRole("ADMIN")`.
- **`JwtAuthenticationFilter`**:
  - Проверено и протестировано извлечение JWT токена как из `HttpOnly` Cookie (`access_token`), так и из заголовка `Authorization: Bearer <token>`.
- **`GlobalExceptionHandler`**:
  - Добавлена обработка `BadCredentialsException` и `AuthenticationException` с возвратом HTTP 401 Unauthorized в каноническом формате `ErrorResponse`.
  - Добавлена обработка `AccessDeniedException` с возвратом HTTP 403 Forbidden.

---

## 2. Соблюдение канонической терминологии
- Строго соблюдены правила проекта:
  - Термины: «Моя подборка», «В подборку», «Отправить запрос», «Заявка», «Изделие».
  - Запрещенные термины («Корзина», «Cart», «Купить», «Оформить заказ», «Checkout») полностью отсутствуют в исходном коде, комментариях и сообщениях.

---

## 3. Валидация и тестирование
- **Компиляция:** `mvn clean test-compile` в `apps/backend` завершен успешно с 0 ошибок.
- **Тестовый набор:** Запущен полный прогон `mvn clean test` — **51 тест пройден успешно (0 failures, 0 errors, 0 skipped)**:
  - `AdminAuthServiceTest` (6 тестов)
  - `AdminInquiryServiceTest` (7 тестов)
  - `AdminAuthControllerTest` (6 тестов)
  - `AdminInquiryControllerTest` (7 тестов)
  - `JwtAuthenticationFilterTest` (4 теста)
  - `JwtTokenProviderTest` (2 теста)
  - `RateLimitingServiceTest` (1 тест)
  - `ProductServiceTest` (4 теста)
  - `InquiryServiceTest` (3 теста)
  - `CategoryServiceTest` (1 тест)
  - `CharacteristicServiceTest` (2 теста)
  - `SettingsServiceTest` (1 тест)
  - `ProductControllerTest` (4 теста)
  - `InquiryControllerTest` (3 теста)

---

## 4. Git и статус
- Изменения закоммичены локально в ветку `feat/TASK-0012-admin-api`:
  - `git commit -m "feat(backend): implement admin authentication and inquiries management REST API"`
- Pull Request не создавался в соответствии с регламентом.
- Задача готова к проведению `code_review_gate`.
