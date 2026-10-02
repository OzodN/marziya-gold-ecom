# Plan: TASK-0029 — Direct Cloudflare R2 Media Upload and Custom Image Loader Integration

## 1. Контекст и цели
В соответствии с ADR-0002 необходимо завершить перевод медиа-стека на Cloudflare R2 + Cloudflare Image Transformations:
1. Обеспечить прямую загрузку фото изделий из браузера мастера в R2 через S3 Presigned PUT URLs (минуя бэкенд).
2. Реализовать `imageLoader.ts` для автоматической нарезки и конвертации в WebP/AVIF на edge Cloudflare через `/cdn-cgi/image/...`.

## 2. Шаги реализации
1. В `apps/frontend/src/types/api.ts` добавить DTO:
   - `PresignedUploadRequestDto` (`fileName`, `contentType`).
   - `PresignedUploadResponseDto` (`uploadUrl`, `objectKey`, `publicUrl`).
2. В `apps/frontend/src/lib/admin-api.ts`:
   - Добавить функцию `requestPresignedUpload(dto)`.
   - Обновить `uploadMedia(file)`: получение presigned URL -> прямой `fetch(PUT)` в R2 -> возврат `{ url, publicId }`.
   - Реализовать безопасный fallback на `/admin/media/upload` при сетевых сбоях прямого PUT.
3. В `apps/frontend/src/components/admin/ProductEditor.tsx`:
   - Улучшить UX загрузки фото (индикация прогресса загрузки файлов, обработка ошибок).
4. Реализовать `apps/frontend/src/imageLoader.ts`:
   - Поддержка параметров: `src`, `width`, `quality`.
   - Формирование URL Cloudflare Transformations `/cdn-cgi/image/width={width},quality={quality},format=auto/{path}`.
   - Корректная обработка относительных путей R2, абсолютных R2 доменов, а также внешних Unsplash и data URI.
5. Обновить `apps/frontend/next.config.ts`:
   - Настроить `images: { loader: "custom", loaderFile: "./src/imageLoader.ts" }`.
6. Написать юнит-тесты `apps/frontend/src/__tests__/imageLoader.test.ts`.
7. Выполнить валидацию:
   - `npm test`
   - `npm run build`
8. Составить `handoff.md`, закоммитить изменения и актуализировать `registry.yaml`.
