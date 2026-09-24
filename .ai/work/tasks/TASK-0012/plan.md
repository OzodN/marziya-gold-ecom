# План реализации TASK-0012: REST API аутентификации администратора и управления заявками

## 1. Цель задачи
Реализовать административные эндпоинты в соответствии с `docs/api/openapi.yaml` и `docs/architecture/product-architecture.md` (разделы 2, 13, 14, 15).

## 2. Объем реализации в `apps/backend/src/main/java/com/marziyagold/`
1. **DTO:**
   - `LoginRequest` (username, password)
   - `AdminUserDto` (id, username, role, createdAt)
   - `InquiryDetailDto` (id, clientName, clientPhone, comment, status, createdAt, updatedAt, items: [InquiryItemDetailDto], history: [InquiryStatusHistoryDto])
   - `InquiryStatusUpdateRequest` (status, comment)
   - `NewInquiriesCountDto` (count)
2. **Сервисы:**
   - `AdminAuthService`: аутентификация через `AuthenticationManager` или проверку пароля BCrypt, генерация JWT, установка/очистка `HttpOnly` Cookie.
   - `AdminInquiryService`:
     - Пагинация и фильтрация заявок по статусу (`NEW`, `CONTACTED`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`).
     - Получение детальной информации о заявке со снапшотом изделий и таймлайном истории.
     - Обновление статуса заявки с фиксацией в `InquiryStatusHistory` (old_status, new_status, changed_by, changed_at).
     - Легковесный подсчет новых заявок `countByStatus(InquiryStatus.NEW)` для 30-секундного polling'а.
3. **Контроллеры:**
   - `AdminAuthController` (`/api/v1/admin/auth`): `POST /login`, `POST /logout`, `GET /me`.
   - `AdminInquiryController` (`/api/v1/admin/inquiries`): `GET /`, `GET /new-count`, `GET /{id}`, `PUT /{id}/status`.
4. **Тесты:**
   - Модульные тесты сервисов и срез-тесты контроллеров с MockMvc.

## 3. Валидация
- `mvn clean test` (все тесты зеленые, 0 ошибок).
