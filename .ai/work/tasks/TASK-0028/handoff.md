# Handoff: TASK-0028 — Cloudflare R2 S3-Compatible Media Presigned Upload REST API

- **От кого:** Backend Specialist
- **Кому:** Orchestrator / Reviewer
- **Дата:** 2026-10-02
- **Ветка Git:** subagent-Backend-Specialist-self-1217b341
- **Worktree:** .worktrees/subagent-Backend-Specialist-self-1217b341

## 1. Выполненная работа
- [x] Удалена зависимость Cloudinary из `apps/backend/pom.xml`.
- [x] Добавлена зависимость AWS S3 SDK v2 (`software.amazon.awssdk:s3:2.29.50`), предоставляющая `S3Client` и `S3Presigner`.
- [x] Настроена конфигурация Cloudflare R2 в `apps/backend/src/main/resources/application.yml` под префиксом `app.r2` со свойствами `endpoint`, `access-key-id`, `secret-access-key`, `bucket`, `region`, `public-url`.
- [x] Создан класс конфигурации `R2Config` в пакете `com.marziyagold.config` с бинами `S3Presigner` и `S3Client`, поддерживающими S3 path-style access (`pathStyleAccessEnabled=true`).
- [x] Созданы DTO `PresignedUploadRequest` (`fileName`, `contentType` с `@NotBlank`) и `PresignedUploadResponse` (`uploadUrl`, `objectKey`, `publicUrl`).
- [x] Реализован сервис `MediaStorageService`:
  - Проверка разрешенных MIME-типов (`image/jpeg`, `image/png`, `image/webp`, `image/avif`, `video/mp4`).
  - Генерация безопасного ключа объекта `products/<uuid>.<ext>`.
  - Генерация Presigned PUT URL через `S3Presigner` со сроком действия 15 минут (`Duration.ofMinutes(15)`).
  - Формирование полного публичного URL CDN без дублирования слэшей.
  - Прямой метод загрузки `upload(MultipartFile)` через `s3Client.putObject` для обратной совместимости.
- [x] Обновлен `AdminMediaController`:
  - Добавлен эндпоинт `POST /api/v1/admin/media/presign-upload` с валидацией запроса.
  - Сохранен адаптированный эндпоинт `POST /api/v1/admin/media/upload` (direct upload в R2 через S3Client).
  - Эндпоинты защищены в `SecurityConfig` правилом `.requestMatchers("/api/v1/admin/**").hasRole("ADMIN")`.
- [x] Обновлен контракт `docs/api/openapi.yaml` (добавлен путь `/admin/media/presign-upload`, обновлен `/admin/media/upload`, добавлены схемы `PresignedUploadRequest` и `PresignedUploadResponse`).
- [x] Удалены устаревшие файлы `CloudinaryService.java` и `CloudinaryServiceTest.java`.
- [x] Разработаны комплексные тесты:
  - `MediaStorageServiceTest` (13 тестов): валидация типов, генерация presigned URL, TTL 15 минут, обработка расширений, прямой upload и обработка ошибок S3.
  - `AdminMediaControllerTest` (7 тестов): валидация payload, presign endpoint, обработка ошибок, контекст аутентифицированного администратора, multipart upload.
  - `R2ConfigTest` (2 теста): создание бинов `s3Client` и `s3Presigner`.
- [x] Выполнен прогон тестов `mvn test`: 157 тестов успешно пройдены (0 ошибок, 0 падений).

## 2. Измененные файлы
- `apps/backend/pom.xml`: удален `cloudinary-http5`, добавлен `software.amazon.awssdk:s3:2.29.50`.
- `apps/backend/src/main/resources/application.yml`: удалена секция `cloudinary`, добавлена секция `app.r2`.
- `apps/backend/src/main/java/com/marziyagold/config/R2Config.java`: конфигурация бинов AWS SDK v2 для R2.
- `apps/backend/src/main/java/com/marziyagold/dto/PresignedUploadRequest.java`: DTO запроса генерации presigned URL.
- `apps/backend/src/main/java/com/marziyagold/dto/PresignedUploadResponse.java`: DTO ответа с presigned URL, objectKey и publicUrl.
- `apps/backend/src/main/java/com/marziyagold/service/MediaStorageService.java`: сервис работы с хранилищем Cloudflare R2.
- `apps/backend/src/main/java/com/marziyagold/controller/admin/AdminMediaController.java`: эндпоинты медиа админ-панели.
- `apps/backend/src/main/java/com/marziyagold/service/CloudinaryService.java`: удален устаревший сервис.
- `apps/backend/src/test/java/com/marziyagold/config/R2ConfigTest.java`: юнит-тесты конфигурации R2.
- `apps/backend/src/test/java/com/marziyagold/service/MediaStorageServiceTest.java`: тесты сервиса R2.
- `apps/backend/src/test/java/com/marziyagold/controller/admin/AdminMediaControllerTest.java`: срез-тесты контроллера медиа.
- `apps/backend/src/test/java/com/marziyagold/service/CloudinaryServiceTest.java`: удален устаревший тест.
- `docs/api/openapi.yaml`: спецификация эндпоинта `/admin/media/presign-upload` и сопутствующих схем.
- `.ai/work/tasks/TASK-0028/task.yaml`: статус обновлен на `review`.
- `.ai/work/registry.yaml`: статус задачи обновлен на `review`.

## 3. Принятые решения
- Использован официальный AWS SDK Java v2 (`software.amazon.awssdk:s3:2.29.50`), включающий в себя `S3Presigner` и `S3Client`.
- Бины `S3Client` и `S3Presigner` используют `pathStyleAccessEnabled=true` для гарантированной совместимости с Cloudflare R2 S3 API.
- Метод `extractExtension` безопасно парсит расширение файла, проверяя на валидные буквенно-цифровые символы, и использует маппинг по `Content-Type` как fallback.
- Сохранен метод `upload(MultipartFile)` в `MediaStorageService` и контроллере для обеспечения обратной совместимости прямого аплоада через бэкенд в R2.
- Исключены потенциальные двойные слэши при формировании `publicUrl` через очистку завершающих слэшей из базового URL.

## 4. Допущения
- На бакете Cloudflare R2 сконфигурированы CORS-правила для разрешения PUT-запросов из браузера.
- Публичный доступ к медиафайлам обеспечивается через custom domain Cloudflare CDN (`NEXT_PUBLIC_MEDIA_URL`).

## 5. Известные ограничения
- Время жизни presigned URL составляет 15 минут (конфигурируется через свойство `app.r2.presign-ttl-minutes`).
- Разрешены только форматы ювелирных изображений и видео (`image/jpeg`, `image/png`, `image/webp`, `image/avif`, `video/mp4`).

## 6. Валидация
- Команда проверки: `mvn test`
- Результат: `Tests run: 157, Failures: 0, Errors: 0, Skipped: 0` (BUILD SUCCESS, время выполнения 12.3s).

## 7. Следующие шаги
- Передать задачу на Code Review.
- На фронтенде Next.js переключить загрузчик медиафайлов в карточке товара на вызов `POST /api/v1/admin/media/presign-upload` с последующим прямым PUT в R2 и сохранением `objectKey` в карточке товара.

## 8. Ключевые файлы
- `apps/backend/src/main/java/com/marziyagold/config/R2Config.java`
- `apps/backend/src/main/java/com/marziyagold/dto/PresignedUploadRequest.java`
- `apps/backend/src/main/java/com/marziyagold/dto/PresignedUploadResponse.java`
- `apps/backend/src/main/java/com/marziyagold/service/MediaStorageService.java`
- `apps/backend/src/main/java/com/marziyagold/controller/admin/AdminMediaController.java`
- `docs/api/openapi.yaml`
