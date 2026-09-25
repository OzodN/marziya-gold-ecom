# Handoff: TASK-0014 — Product Detail & Catalog Interactions

- **От кого:** Fullstack Engineer
- **Кому:** UX Reviewer / Orchestrator
- **Дата:** 2026-09-25
- **Ветка Git:** `feat/TASK-0014-product-interactions`
- **Worktree:** `.worktrees/TASK-0014-product-interactions`

## 1. Выполненная работа
- [x] **Изоляция зума (Lightbox Portal):** В `ProductGallery.tsx` полноэкранный просмотр изображений перенесен в корень DOM с помощью `createPortal(..., document.body)` и наивысшим `z-[100]`. Это полностью устранило проблему выхода блока-дисклеймера ручной работы мастера поверх изображения в зуме из-за ограничений контекста наложения (Stacking Context).
- [x] **Плавающая кнопка закрытия [X]:** В `ProductGallery.tsx` добавлена фиксированная плавающая круглая кнопка закрытия `[X]` (`fixed top-4 right-4 z-[120]`, размер `h-12 w-12 min-h-[44px] min-w-[44px]`) со стильным темным фоном, золотой каймой и мягким эффектом блюра. Она всегда видна и доступна в правом верхнем углу экрана независимо от зума, прокрутки или устройства.
- [x] **Свайп изображений мышью на десктопе:** В `ProductGallery.tsx` реализован полноценный свайп перетаскиванием мыши (`mousedown`, `mousemove`, `mouseup`) с курсором `cursor-grab` / `cursor-grabbing`. Работает как на основном блоке галереи, так и внутри открытого лайтбокса (при масштабе 1x). Перехват защищен от ложного клика при завершении перетаскивания.
- [x] **Свайп картинок прямо в списке каталога (In-Card Image Swipe):** В `ProductCard.tsx` поддержано переключение между всеми фотографиями изделия жестом свайпа (как тачем на мобильных, так и перетаскиванием мыши на десктопе) без перехода по ссылке на карточку изделия. Согласно требованию пользователя, стрелочные кнопки отсутствуют («но уже без кнопки свайпа, а просто свайп картинки»), а внизу изображения отображаются минималистичные аккуратные полоски-индикаторы активного фото.
- [x] **Кнопка возврата в каталог («просто стрелка»):** Создан компонент `BackButton.tsx` и внедрен в шапку страницы изделия `/product/[slug]/page.tsx`. Кнопка представляет собой лаконичную стрелку `ArrowLeft` (`min-h-[44px] min-w-[44px]`), видимую как на смартфонах, так и на десктопе, возвращающую в категорию изделия либо общий каталог.
- [x] **Поддержка списка картинок в API и бэкенде:** Поле `imageUrls` добавлено в `ProductSummaryDto.java`, `ProductService.java` заполняет его отсортированными изображениями товара, спецификация `openapi.yaml` и фронтенд-типы `api.ts` синхронизированы.

## 2. Измененные файлы
- `apps/backend/src/main/java/com/marziyagold/dto/ProductSummaryDto.java`
- `apps/backend/src/main/java/com/marziyagold/service/ProductService.java`
- `docs/api/openapi.yaml`
- `apps/frontend/src/types/api.ts`
- `apps/frontend/src/lib/api.ts`
- `apps/frontend/src/components/product/BackButton.tsx`
- `apps/frontend/src/app/product/[slug]/page.tsx`
- `apps/frontend/src/components/product/ProductGallery.tsx`
- `apps/frontend/src/components/catalog/ProductCard.tsx`

## 3. Валидация
- `mvn test` в `apps/backend` — **Passed (51/51 tests green)**.
- `npm run build` в `apps/frontend` — **Passed (0 errors, 24/24 static pages pre-rendered)**.
- Строго соблюдена каноническая терминология мастерской.

## 4. Следующие шаги
- Слить ветку `feat/TASK-0014-product-interactions` в `main`.
- Обновить статус задачи на `done` в `task.yaml` и `registry.yaml`.
