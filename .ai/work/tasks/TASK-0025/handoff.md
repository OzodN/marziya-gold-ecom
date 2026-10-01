# Handoff: TASK-0025 — Admin Media Upload Endpoint and Storage Integration

- **От кого:** backend
- **Кому:** orchestrator
- **Дата:** 2026-09-30
- **Ветка Git:** feat/TASK-0025-cloudinary-upload

## 1. Выполненная работа
- [x] В `apps/backend/pom.xml` подключена зависимость `cloudinary-http44`.
- [x] Создан DTO `MediaUploadResponse` с полями `url` и `publicId`.
- [x] Реализован сервис `CloudinaryService` для загрузки изображений и видео с валидацией пустого файла и генерацией уникального publicId.
- [x] Реализован контроллер `AdminMediaController` (`POST /api/v1/admin/media/upload`), защищенный Spring Security.
- [x] В `application.yml` добавлены параметры конфигурации хранилища медиафайлов.
- [x] Написаны модульные тесты `AdminMediaControllerTest` и `CloudinaryServiceTest`. Все тесты прошли успешно.

## 2. Измененные файлы
- `apps/backend/pom.xml`
- `apps/backend/src/main/java/com/marziyagold/controller/admin/AdminMediaController.java`
- `apps/backend/src/main/java/com/marziyagold/dto/MediaUploadResponse.java`
- `apps/backend/src/main/java/com/marziyagold/service/CloudinaryService.java`
- `apps/backend/src/main/resources/application.yml`
- `apps/backend/src/test/java/com/marziyagold/controller/admin/AdminMediaControllerTest.java`
- `apps/backend/src/test/java/com/marziyagold/service/CloudinaryServiceTest.java`

## 3. Принятые решения и архитектурный статус
- Первичная реализация медиа-загрузки была выполнена через Cloudinary SDK.
- Впоследствии архитектурным комитетом принят **ADR-0002**: Cloudinary заменяется на Cloudflare R2 (S3-совместимое хранилище с presigned PUT URLs и $0 egress) из-за географических блокировок в Республике Узбекистан.
- В рамках последующей задачи `TASK-0028` данный сервис будет переведен на AWS S3 SDK для генерации Presigned URL прямого аплоада в R2.

## 4. Допущения
- Загрузка медиа разрешена только аутентифицированным администраторам.

## 5. Известные ограничения
- Текущая имплементация проксирует файл через бэкенд в Cloudinary. Подлежит миграции на прямой S3 Presigned URL в R2 по ADR-0002.

## 6. Валидация
- `mvn test`: Все тесты успешно пройдены (0 failures, 0 errors).

## 7. Следующие шаги
- Интеграция интерфейса управления справочниками и редактора товаров на фронтенде (TASK-0026, TASK-0027).
- Миграция на Cloudflare R2 Presigned URLs (TASK-0028).
