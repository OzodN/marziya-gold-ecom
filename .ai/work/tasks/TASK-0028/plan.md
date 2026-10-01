# Plan: TASK-0028 — Cloudflare R2 S3-Compatible Media Presigned Upload REST API

## 1. Цель
Реализовать безопасную генерацию Presigned PUT URL для прямой загрузки фото изделий в Cloudflare R2 из браузера в соответствии с ADR-0002.

## 2. Шаги реализации
1. Обновить `apps/backend/pom.xml`: удалить `cloudinary-http44`, добавить `software.amazon.awssdk:s3` и `software.amazon.awssdk:s3-presigner`.
2. Добавить `R2Config.java` и конфигурацию в `application.yml` (`r2.endpoint`, `r2.access-key`, `r2.secret-key`, `r2.bucket`, `r2.public-url`).
3. Создать `PresignedUploadRequest` (`fileName`, `contentType`) и `PresignedUploadResponse` (`uploadUrl`, `objectKey`, `publicUrl`).
4. Реализовать `MediaStorageService` с генерацией Presigned PUT URL (TTL 15 минут) и проверкой MIME-типов (JPEG, PNG, WebP, AVIF).
5. Обновить `AdminMediaController`: заменить старый upload на `POST /api/v1/admin/media/presign-upload` (сохранив обратную совместимость или заменив устаревший upload).
6. Актуализировать контракт `docs/api/openapi.yaml`.
7. Написать тесты `MediaStorageServiceTest` и `AdminMediaControllerTest`.
8. Выполнить `mvn test` и подготовить `handoff.md`.
