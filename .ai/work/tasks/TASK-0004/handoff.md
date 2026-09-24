# Handoff: TASK-0004 — Next.js 15+ App Router Client Storefront & Selection Store Scaffolding

- **От кого:** Senior Frontend Engineer (frontend agent)
- **Кому:** Orchestrator / Reviewer
- **Дата:** 2026-09-24
- **Ветка Git:** `feat/TASK-0004-frontend-skeleton`
- **Worktree:** `.worktrees/TASK-0004-frontend-skeleton`

## 1. Выполненная работа
- [x] Развернут каркас приложения Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS под `apps/frontend/`.
- [x] Сконфигурированы `package.json`, `tsconfig.json` с path alias `@/*` -> `./src/*`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.ts`.
- [x] Созданы доменные интерфейсы в `src/types/api.ts` в строгом соответствии со спецификацией `docs/api/openapi.yaml` (`ProductSummaryDto`, `ProductDetailDto`, `CategoryDto`, `InquiryCreateRequestDto`, `InquiryResponseDto`, `PageResponseProductSummaryDto`, `ProductAvailabilityDto` и др.).
- [x] Реализовано клиентское хранилище Zustand Selection Store (`src/store/selection-store.ts`) с middleware `persist` (`localStorage` ключ `marziya-selection-storage`) и методами `addToSelection`, `removeFromSelection`, `updateQuantity`, `clearSelection`, `hasItem`, `markBatchAvailability`.
- [x] Настроены стили `src/app/globals.css` в стилистике ювелирной мастерской (золотые акценты, глубокие фоновые тона `noir`, градиенты, свечения).
- [x] Реализованы базовые компоненты витрины:
  - `src/components/layout/Header.tsx` — логотип, навигация, кнопка «Моя подборка» с бейджем количества.
  - `src/components/layout/Footer.tsx` — описание мастерской, категории изделий, контакты мастера (Telegram, телефон, адрес).
  - `src/components/catalog/ProductCard.tsx` — карточка изделия с изображением, артикулом, характеристиками и кнопкой «В подборку».
  - `src/components/selection/SelectionSheet.tsx` — боковая шторка подборки с управлением количеством, превью, тихой проверкой доступности и кнопкой «Отправить запрос».
  - `src/components/selection/InquiryModal.tsx` — модальное окно подачи заявки (имя, телефон/Telegram, комментарий) с отправкой на `/api/v1/inquiries` и очисткой подборки при успехе.
  - `src/app/layout.tsx` — корневой layout с подключением шрифтов Playfair Display и Inter, шапки, подвала и глобальных оверлеев подборки.
  - `src/app/page.tsx` — главная страница с Hero-блоком, фильтром категорий, галереей украшений и манифестом мастерской.
- [x] Строжайшее соблюдение терминологии: повсеместно используются формулировки «Моя подборка», «В подборку», «Отправить запрос». Полностью исключены термины «Корзина», «Cart», «Купить», «Оформить заказ», «Checkout».
- [x] Границы владения соблюдены: файлы в `apps/backend/` и `database/` не затрагивались.

## 2. Измененные файлы
- `apps/frontend/package.json`: конфигурация зависимостей (Next.js 15, React 19, Zustand 5, Tailwind 3.4, Lucide React).
- `apps/frontend/package-lock.json`: lockfile зависимостей npm.
- `apps/frontend/tsconfig.json`: конфигурация TypeScript с алиасом `@/*`.
- `apps/frontend/next.config.ts`: конфигурация Next.js с поддержкой Cloudinary и Unsplash.
- `apps/frontend/tailwind.config.ts`: палитры gold и noir, тени, типографика.
- `apps/frontend/postcss.config.mjs`: интеграция Tailwind и Autoprefixer.
- `apps/frontend/.gitignore`: игнорирование `node_modules`, `.next`, локальных конфигов.
- `apps/frontend/src/lib/utils.ts`: утилита `cn()` для слияния классов Tailwind.
- `apps/frontend/src/types/api.ts`: канонические интерфейсы DTO из OpenAPI.
- `apps/frontend/src/store/selection-store.ts`: хранилище подборки с `persist` и хуками гидратации.
- `apps/frontend/src/app/globals.css`: ювелирные стили, шрифтовые переменные, скроллбары.
- `apps/frontend/src/app/layout.tsx`: Root Layout с шрифтами, шапкой и подвалом.
- `apps/frontend/src/app/page.tsx`: главная страница витрины и каталог изделий.
- `apps/frontend/src/components/layout/Header.tsx`: шапка сайта с «Моя подборка».
- `apps/frontend/src/components/layout/Footer.tsx`: подвал сайта с контактами.
- `apps/frontend/src/components/catalog/ProductCard.tsx`: карточка изделия с кнопкой «В подборку».
- `apps/frontend/src/components/selection/SelectionSheet.tsx`: шторка подборки клиента.
- `apps/frontend/src/components/selection/InquiryModal.tsx`: модальное окно «Отправить запрос».
- `.ai/work/tasks/TASK-0004/plan.md`: обновлены статусы выполнения шагов.
- `.ai/work/tasks/TASK-0004/handoff.md`: настоящий отчет передачи.

## 3. Принятые решения
- **Безопасная гидратация Zustand (SSR):** Для предотвращения hydration mismatch при рендеринге количества изделий из `localStorage` реализован хук `useSelectionCount()` и `useIsSelectionHydrated()`, синхронизирующий состояние после монтирования на клиенте.
- **Тихая валидация доступности:** В `SelectionSheet` добавлен фоновый запрос `/api/v1/products/validate-batch`, позволяющий мягко деактивировать/пометить серым недоступные изделия без блокировки интерфейса.
- **Интеграция шрифтов Next.js:** Использованы `next/font/google` (`Playfair_Display` для роскошных заголовков и `Inter` для чистого интерфейса) через CSS-переменные `--font-serif` и `--font-sans`.

## 4. Допущения
- Запрос отправки заявки направляется методом POST на `/api/v1/inquiries`. В случае локальной разработки при отсутствии запущенного бэкенда предусмотрен fallback с демонстрацией успешного подтверждения для валидации UX.

## 5. Известные ограничения
- В рамках TASK-0004 реализован каркас и базовые мок-данные для витрины; полноценная динамическая загрузка страниц товаров и интеграция с живым REST API будет расширяться в следующих задачах.

## 6. Валидация
- Команда проверки: `npm run build`
- Результат: **Passed** (Next.js 15.5.26 успешно скомпилировал проект, проверил типы и сгенерировал статические маршруты без ошибок).
- Проверка терминологии: автоматический поиск запрещенных терминов (`Корзина`, `Cart`, `Купить`, `Оформить заказ`, `Checkout`) по всему исходному коду — **0 совпадений**.
- Проверка границ владения: `apps/backend/` и `database/` не изменялись.

## 7. Следующие шаги
- Провести ревью в рамках `code_review_gate`.
- Влить ветку `feat/TASK-0004-frontend-skeleton` в `main`.
- Переход к задачам реализации страниц детального просмотра изделия и административной панели (`/admin`).

## 8. Ключевые файлы
- `apps/frontend/src/store/selection-store.ts`
- `apps/frontend/src/types/api.ts`
- `apps/frontend/src/components/selection/SelectionSheet.tsx`
- `apps/frontend/src/components/selection/InquiryModal.tsx`
- `apps/frontend/src/components/catalog/ProductCard.tsx`
- `apps/frontend/src/app/page.tsx`
