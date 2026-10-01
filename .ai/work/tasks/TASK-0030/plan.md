# Plan: TASK-0030 — Frontend Automated Testing Infrastructure and Core Component Test Suite

## 1. Цель
Развернуть быстрый тестовый фреймворк (Vitest + React Testing Library) в `apps/frontend` и покрыть автоматизированными компонентными тестами ключевые элементы витрины и подборки.

## 2. Шаги реализации
1. Установить зависимости devDependencies в `apps/frontend`: `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.
2. Создать `vitest.config.ts` с конфигурацией alias (`@/*` -> `./src/*`) и jsdom окружением.
3. Создать `src/setupTests.ts` для импорта `@testing-library/jest-dom`.
4. Добавить `"test": "vitest run"` в `apps/frontend/package.json`.
5. Написать тесты:
   - `ProductCard.test.tsx` (проверка рендера, клика добавления в подборку).
   - `SelectionSheet.test.tsx` (проверка счетчика, удаления, очистки).
   - `InquiryModal.test.tsx` (проверка валидации имени, телефона, отправки).
6. Запустить `npm test` и `npm run build` для проверки отсутствия регрессий.
7. Составить `handoff.md`.
