# План выполнения: TASK-0004 — Next.js 15+ App Router Client Storefront & Selection Store Scaffolding

## 1. Загрузка контекста
- [ ] Ознакомиться с `apps/frontend/AGENTS.md` и `.ai/context/terminology.md`.
- [ ] Изучить API-контракт `docs/api/openapi.yaml`.

## 2. Инициализация и структура проекта
- [ ] Сформировать конфигурацию `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.ts`.
- [ ] Установить зависимости (`next`, `react`, `react-dom`, `zustand`, `lucide-react`, `clsx`, `tailwind-merge`).

## 3. Типы и хранилище (Selection Store)
- [ ] Создать `src/types/api.ts` со схемами из `docs/api/openapi.yaml`.
- [ ] Реализовать `src/store/selection-store.ts` на базе Zustand `persist` (ключ в localStorage, строго терминология "подборка").

## 4. UI компоненты и страницы витрины
- [ ] Настроить глобальные стили (`src/app/globals.css`).
- [ ] Реализовать Root Layout (`src/app/layout.tsx`) с шапкой магазина и счетчиком "Моя подборка".
- [ ] Реализовать главную страницу каталога (`src/app/page.tsx`).
- [ ] Реализовать компонент модалки/шторки подборки (`SelectionSheet` / `InquiryModal`) со строгой терминологией ("В подборку", "Отправить запрос").

## 5. Верификация и сборка
- [ ] Запустить сборку `npm run build` / `npm run lint`.
- [ ] Проверить отсутствие нарушений границ владения кодом.

## 6. Завершение и передача
- [ ] Создать коммит `feat(frontend): scaffold Next.js 15 storefront and selection store`.
- [ ] Подготовить отчет `.ai/work/tasks/TASK-0004/handoff.md`.
