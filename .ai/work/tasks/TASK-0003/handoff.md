# Handoff: TASK-0003 — Spring Boot Project Scaffolding and Security Skeleton

- **От кого:** Backend Architect
- **Кому:** Lead Architect / Orchestrator & Backend Developers
- **Дата:** 2026-09-24
- **Ветка Git:** `feat/TASK-0003-backend-skeleton`
- **Worktree:** `.worktrees/TASK-0003-backend-skeleton`

## 1. Выполненная работа
- [x] Сконфигурирован Maven `pom.xml` (`apps/backend/pom.xml`) на базе Spring Boot 3.4.3, Java 21, Spring Data JPA, Spring Security, Validation, PostgreSQL Driver, Flyway Core + PostgreSQL, Bucket4j 8.10.1, JJWT 0.12.6, Lombok 1.18.38, и Spring Boot Starter Test / Security Test.
- [x] Создана конфигурация `src/main/resources/application.yml` и образец `application.yml.example` с настройками пула соединений PostgreSQL, валидации схемы Hibernate (`hibernate.ddl-auto: validate`), Flyway миграций, JWT параметров и CORS для Next.js фронтенда (`http://localhost:3000`).
- [x] Создан главный класс приложения `com.marziyagold.MarziyaGoldApplication`.
- [x] Реализованы 11 JPA-сущностей (`com.marziyagold.entity`) строго по схеме `V1__init_schema.sql`:
  - `AdminUser`: аутентификация мастера (роль `ADMIN`, BCrypt хэш).
  - `Category`: иерархия каталога (`slug`, `sortOrder`, `isVisible`).
  - `CharacteristicKey`: глобальный реестр характеристик (`isFilterable`, `sortOrder`).
  - `StoneType`: справочник вставок драгоценных камней (`isActive`).
  - `Product`: изделие ювелирного каталога, с JSONB характеристиками (`@JdbcTypeCode(SqlTypes.JSON)`) и связями с изображениями и камнями.
  - `ProductImage`: ссылки на медиа Cloudinary (`url`, `publicId`, `sortOrder`).
  - `ProductStone`: вставки камней в изделие с динамическими JSONB характеристиками.
  - `Inquiry`: клиентская заявка с enum `InquiryStatus` (`NEW`, `CONTACTED`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`).
  - `InquiryItem`: неизменяемые элементы заявки с полным JSONB слепком (`productSnapshot`).
  - `InquiryStatusHistory`: аудит-лог изменения статусов заявки мастером.
  - `SiteSetting`: key-value хранилище настроек контактов.
- [x] Созданы Spring Data JPA репозитории (`com.marziyagold.repository`) для всех сущностей (`AdminUserRepository`, `CategoryRepository`, `CharacteristicKeyRepository`, `StoneTypeRepository`, `ProductRepository`, `ProductImageRepository`, `ProductStoneRepository`, `InquiryRepository`, `InquiryItemRepository`, `InquiryStatusHistoryRepository`, `SiteSettingRepository`).
- [x] Реализован скелет подсистемы безопасности (`com.marziyagold.security`):
  - `JwtTokenProvider`: генерация, валидация и парсинг токенов (JJWT 0.12.6).
  - `JwtAuthenticationFilter`: извлечение токена строго из `HttpOnly` cookie `access_token` (с fallback на заголовок `Authorization: Bearer`).
  - `SecurityConfig`: Stateless сессии, отключение CSRF, CORS для Next.js, разграничение прав доступа по OpenAPI контракту (`/api/v1/admin/**` требует `ROLE_ADMIN`, публичный каталог и подача заявок открыты), `BCryptPasswordEncoder`.
- [x] Реализован сервис rate limiting `RateLimitingService` на базе Bucket4j (ограничение до 5 запросов в минуту на IP адрес).
- [x] Написаны юнит-тесты `JwtTokenProviderTest` и `RateLimitingServiceTest`. Все тесты и компиляция (`mvn clean test-compile`, `mvn test`) завершились без ошибок.

## 2. Измененные / Созданные файлы
- `apps/backend/pom.xml`: Конфигурация сборщика Maven.
- `apps/backend/src/main/resources/application.yml`: Основная конфигурация Spring Boot.
- `apps/backend/src/main/resources/application.yml.example`: Пример конфигурационного файла с переменными окружения.
- `apps/backend/src/main/java/com/marziyagold/MarziyaGoldApplication.java`: Точка входа в приложение.
- `apps/backend/src/main/java/com/marziyagold/entity/*.java`: JPA-сущности и enum статусов.
- `apps/backend/src/main/java/com/marziyagold/repository/*.java`: Интерфейсы Spring Data JPA репозиториев.
- `apps/backend/src/main/java/com/marziyagold/security/JwtTokenProvider.java`: Управление JWT токенами.
- `apps/backend/src/main/java/com/marziyagold/security/JwtAuthenticationFilter.java`: Аутентификационный фильтр по HttpOnly Cookie.
- `apps/backend/src/main/java/com/marziyagold/security/SecurityConfig.java`: Конфигурация Spring Security и CORS.
- `apps/backend/src/main/java/com/marziyagold/security/RateLimitingService.java`: Защита от спама через Bucket4j.
- `apps/backend/src/test/java/com/marziyagold/security/JwtTokenProviderTest.java`: Юнит-тесты токенов.
- `apps/backend/src/test/java/com/marziyagold/security/RateLimitingServiceTest.java`: Юнит-тесты ограничителя запросов.

## 3. Принятые решения
- **Lombok 1.18.38:** Использована версия 1.18.38 для полной совместимости с javac в современных JDK (включая JDK 21/25).
- **Hibernate 6 JSONB:** Использована аннотация `@JdbcTypeCode(SqlTypes.JSON)` в соответствии с требованиями Hibernate 6.
- **Двухуровневое извлечение JWT:** Фильтр проверяет наличие HttpOnly Cookie `access_token`, а при его отсутствии осуществляет fallback на заголовок `Authorization: Bearer <token>`, обеспечивая совместимость как с браузерным клиентом, так и со средствами тестирования/OpenAPI Swagger.
- **Хранение паролей:** `BCryptPasswordEncoder` с дефолтной стойкостью (10 раундов).

## 4. Допущения
- В тестах БД не поднимается в контексте (DDL validate требует активный PostgreSQL), поэтому для слоя безопасности написаны чистые изолированные юнит-тесты.

## 5. Известные ограничения
- Интеграционные тесты со срезом базы данных потребуют Testcontainers или реальный экземпляр PostgreSQL с установленным расширением `pg_trgm`.

## 6. Валидация
- Команда проверки: `mvn clean test-compile` и `mvn test`
- Результат: `BUILD SUCCESS` (0 errors, 3 tests passed).

## 7. Следующие шаги
- [ ] Реализация контроллеров и DTO для публичного каталога (`GET /api/v1/products`, `/api/v1/categories`, фильтры).
- [ ] Реализация контроллеров аутентификации мастера (`POST /api/v1/admin/auth/login`, `logout`, `me`) с выставлением HttpOnly Cookie.
- [ ] Реализация сервиса оформления заявок (`POST /api/v1/inquiries`) со снапшотированием изделий и rate limiting.
