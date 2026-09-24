# План выполнения: TASK-0004 — Next.js 15+ App Router Client Storefront & Selection Store Scaffolding

## 1. Загрузка контекста
- [x] Ознакомиться с `apps/frontend/AGENTS.md` и `.ai/context/terminology.md`.
- [x] Изучить API-контракт `docs/api/openapi.yaml`.

## 2. Инициализация и структура проекта
- [x] Сформировать конфигурацию `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.ts`.
- [x] Установить зависимости (`next`, `react`, `react-dom`, `zustand`, `lucide-react`, `clsx`, `tailwind-merge`).

## 3. Типы и хранилище (Selection Store)
- [x] Создать `src/types/api.ts` со схемами из `docs/api/openapi.yaml`.
- [x] Реализовать `src/store/selection-store.ts` на базе Zustand `persist` (ключ в localStorage, строго терминология "подборка").

## 4. UI компоненты и страницы витрины
- [x] Настроить глобальные стили (`src/app/globals.css`).
- [x] Реализовать Root Layout (`src/app/layout.tsx`) с шапкой магазина и счетчиком "Моя подборка".
- [x] Реализовать главную страницу каталога (`src/app/page.tsx`).
- [x] Реализовать компонент модалки/шторки подборки (`SelectionSheet` / `InquiryModal`) со строгой терминологией ("В подборку", "Отправить запрос").

## 5. Верификация и сборка
- [x] Запустить сборку `npm run build` / `npm run lint`.
- [x] Проверить отсутствие нарушений границ владения кодом.

## 6. Завершение и передача
- [x] Создать коммит `feat(frontend): scaffold Next.js 15 storefront and selection store`.
- [x] Подготовить отчет `.ai/work/tasks/TASK-0004/handoff.md`.
