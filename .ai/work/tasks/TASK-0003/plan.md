# План выполнения: TASK-0003 — Spring Boot Project Scaffolding and Security Skeleton

## 1. Загрузка контекста
- [x] Ознакомиться с `apps/backend/AGENTS.md` и `docs/adr/0001-baseline-architecture-decisions.md`.
- [x] Изучить схему миграции `apps/backend/src/main/resources/db/migration/V1__init_schema.sql`.
- [x] Изучить спецификацию API `docs/api/openapi.yaml`.

## 2. Инициализация проекта Maven
- [x] Создать `pom.xml` в `apps/backend/` с зависимостями:
  - Spring Boot Starter Web, Data JPA, Security, Validation, Actuator
  - PostgreSQL Driver
  - Flyway Core & Flyway Database PostgreSQL
  - Bucket4j (core/jdk17)
  - JJWT (api, impl, jackson)
  - Lombok
  - Spring Boot Starter Test (JUnit 5, Mockito, AssertJ)
- [x] Создать `src/main/resources/application.yml` с профилями, настройками PostgreSQL, JPA (`hibernate.ddl-auto: validate`) и Flyway.
- [x] Создать главный класс `com.marziyagold.MarziyaGoldApplication`.

## 3. Разработка JPA сущностей
- [x] Создать пакет `com.marziyagold.entity`:
  - `AdminUser` (роль `ADMIN`, `passwordHash`)
  - `Category` (`slug`, `sortOrder`, `isVisible`)
  - `CharacteristicKey` (`name`, `isFilterable`)
  - `StoneType` (`name`, `isActive`)
  - `Product` (связь с `Category`, `@JdbcTypeCode(SqlTypes.JSON)` для `characteristics`)
  - `ProductImage` (`url`, `publicId`, `sortOrder`)
  - `ProductStone` (`stoneTypeId`, `@JdbcTypeCode(SqlTypes.JSON)` для `characteristics`)
  - `Inquiry` (статус `InquiryStatus`, данные клиента)
  - `InquiryItem` (`@JdbcTypeCode(SqlTypes.JSON)` для `productSnapshot`)
  - `InquiryStatusHistory`
  - `SiteSetting`
- [x] Создать базовые репозитории `com.marziyagold.repository`.

## 4. Скелет безопасности (Security & Auth)
- [x] Реализовать `JwtTokenProvider` (генерация, валидация, извлечение username).
- [x] Реализовать `JwtAuthenticationFilter` (извлечение токена строго из `HttpOnly` Cookie `access_token`).
- [x] Настроить `SecurityConfig`:
  - Отключение CSRF (stateless API)
  - Настройка CORS для фронтенда (`http://localhost:3000`)
  - Авторизация эндпоинтов по контракту OpenAPI
  - `BCryptPasswordEncoder`
- [x] Подготовить `RateLimitingService` на базе Bucket4j для защиты `/api/v1/inquiries`.

## 5. Верификация и тестирование
- [x] Запустить `mvn clean test-compile` в `apps/backend/`.
- [x] Проверить отсутствие ошибок компиляции и валидации сущностей.

## 6. Завершение и передача
- [x] Закоммитить изменения `feat(backend): scaffold Spring Boot 3.4 project with JPA entities and security skeleton`.
- [x] Составить отчет `.ai/work/tasks/TASK-0003/handoff.md`.
