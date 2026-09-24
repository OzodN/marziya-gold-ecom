# План реализации TASK-0006: Публичный REST API витрины и обработка заявок

## 1. Архитектурная цель
Реализовать публичный API для витрины каталога ювелирных изделий в соответствии с `docs/api/openapi.yaml`:
- Получение списка изделий с пагинацией, фильтрами и нечетким поиском.
- Получение детальной карточки изделия по `slug`.
- Пакетная тихая валидация (`validate-batch`).
- Получение активных категорий и ключей фильтров.
- Создание заявок (`inquiries`) со снапшотом и rate limiting.
- Публичные контакты мастера.

## 2. Шаги реализации
1. Создать ворктри `.worktrees/TASK-0006-backend-api` на ветке `feat/TASK-0006-backend-api`.
2. Создать DTO пакет `com.marziyagold.dto`:
   - `ProductSummaryDto`, `ProductDetailDto`, `ProductPageResponse`
   - `CategoryDto`, `FilterKeysDto`
   - `ProductAvailabilityDto`, `BatchValidationRequest`
   - `InquiryCreateRequest`, `InquiryItemRequest`, `InquiryResponseDto`
   - `ContactSettingsDto`
3. Расширить репозитории:
   - `ProductRepository`: нативные/JPQL методы для `is_visible=true`, фильтрации по категории, камням и нечеткого поиска через триграммы.
   - `CategoryRepository`: выборка `is_visible=true` с сортировкой по `sort_order`.
4. Реализовать сервисы:
   - `ProductService`, `CategoryService`, `CharacteristicService`, `InquiryService`, `SettingsService`.
5. Реализовать контроллеры:
   - `ProductController`, `CategoryController`, `CharacteristicController`, `InquiryController`, `SettingsController`.
6. Реализовать `GlobalExceptionHandler`.
7. Проверить компиляцию: `mvn clean test-compile`.
8. Составить `handoff.md`.
