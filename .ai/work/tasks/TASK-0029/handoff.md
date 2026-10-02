# Handoff: TASK-0029 — Direct Cloudflare R2 Media Upload and Custom Image Loader Integration

- **От кого:** Frontend Developer
- **Кому:** Orchestrator / Lead Architect
- **Дата:** 2026-10-02
- **Ветка Git:** `feat/TASK-0029-frontend-r2`
- **Worktree:** `.worktrees/TASK-0029-frontend-r2`

## 1. Выполненная работа
- [x] В `apps/frontend/src/types/api.ts` добавлены DTO-типы `PresignedUploadRequestDto` и `PresignedUploadResponseDto`.
- [x] В `apps/frontend/src/lib/admin-api.ts` реализован запрос presigned URL (`requestPresignedUpload`) и прямая загрузка файла через `PUT` в Cloudflare R2 с бесшовным фоллбэком на классический сервеверный endpoint при сетевых ошибках.
- [x] В `apps/frontend/src/components/admin/ProductEditor.tsx` внедрена индикация прогресса загрузки нескольких фото (`Загрузка 1/N...`) с блокировкой повторных сохранений и спиннером `Loader2`.
- [x] Реализован кастомный загрузчик изображений `apps/frontend/src/imageLoader.ts` согласно ADR-0002:
  - Формирование Edge URL вида `${baseUrl}/cdn-cgi/image/width=${width},quality=${quality || 80},format=auto/${cleanPath}`.
  - Сохранение локальных статических ассетов (`/images/*`, `/_next/*`).
  - Сохранение Data URL (`data:*`) и Blob URL (`blob:*`).
  - Сохранение векторных SVG файлов без растрирования (`.svg`).
  - Сохранение сторонних демо-ссылок (Unsplash).
  - Нормализация повторно трансформированных ссылок Cloudflare.
- [x] В `apps/frontend/next.config.ts` подключен `loader: "custom"` и `loaderFile: "./src/imageLoader.ts"`, в `remotePatterns` добавлен домен `media.marziyagold.uz` и удален устаревший Cloudinary.
- [x] Написаны модульные тесты:
  - `apps/frontend/src/__tests__/imageLoader.test.ts` (13 тестов).
  - `apps/frontend/src/lib/__tests__/admin-api.test.ts` (2 теста).
- [x] Все 29 тестов Vitest успешно пройдены.
- [x] Продуктовая сборка `npm run build` успешно компилируется (33/33 статических страниц сгенерировано без ошибок).

## 2. Измененные файлы
- `apps/frontend/src/types/api.ts`: добавлены интерфейсы presigned-запроса и ответа.
- `apps/frontend/src/lib/admin-api.ts`: интеграция прямого PUT в R2 и фоллбэк.
- `apps/frontend/src/components/admin/ProductEditor.tsx`: индикатор загрузки и адаптивный статус в UI.
- `apps/frontend/src/imageLoader.ts`: кастомный Cloudflare Image Transformations loader.
- `apps/frontend/next.config.ts`: подключение custom loader и домена медиа.
- `apps/frontend/src/__tests__/imageLoader.test.ts`: юнит-тесты loader.
- `apps/frontend/src/lib/__tests__/admin-api.test.ts`: юнит-тесты загрузки и фоллбэка.

## 3. Принятые решения
- **Zero-Egress и Zero-Load на Backend:** Браузер администратора отправляет медиафайлы напрямую в Cloudflare R2 по одноразовому presigned URL, экономя память и пропускную способность Spring Boot.
- **Graceful Fallback:** Если у клиента возникают CORS-проблемы или R2 недоступен, загрузка автоматически переключается на проксирующий бэкенд `/admin/media/upload`.
- **Изоляция статики:** Локальные логотипы (`/images/icon-gold.png`) и SVG не передаются на обработку в `/cdn-cgi/image/`, предотвращая ошибки формата 9403/9412 в Cloudflare.

## 4. Допущения
- Домен медиа по умолчанию — `https://media.marziyagold.uz`, переопределяемый переменной `NEXT_PUBLIC_MEDIA_URL`.

## 5. Известные ограничения
- Максимальный размер загружаемого файла через Presigned URL — до 25 МБ (валидируется на бэкенде).

## 6. Валидация
- Команда проверки тестов: `npm test` -> **5 test files passed, 29 tests passed (0 failures)**.
- Команда проверки сборки: `npm run build` -> **Compiled successfully in 16.8s, 33/33 static pages generated**.

### 6.1. UX/UI Self-Check (Обязательно для Frontend-задач)
- [x] Соответствие `docs/design/ux-criteria.md` проверено
- [x] 6 состояний (default, hover, loading skeleton/spinner, empty, error, disabled) реализованы
- [x] Mobile-first: touch targets >= 44x44px, sticky CTA, viewport 375px
- [x] Терминология: строго "Моя подборка", "В подборку", "Отправить запрос"
- [x] Доступность: Escape закрывает диалоги, focus trap, aria-labels

## 7. Следующие шаги
- Влить ветку `feat/TASK-0029-frontend-r2` в `main`.
- Удалить рабочее дерево `.worktrees/TASK-0029-frontend-r2`.
- Перевести задачу `TASK-0029` в статус `done` в `.ai/work/registry.yaml`.
- Активировать финальную задачу `TASK-0032` (Production Hardening, Seeding & Zero-Maintenance Handover Docs).

## 8. Ключевые файлы
- `apps/frontend/src/imageLoader.ts`
- `apps/frontend/src/lib/admin-api.ts`
- `apps/frontend/src/components/admin/ProductEditor.tsx`
- `apps/frontend/next.config.ts`
