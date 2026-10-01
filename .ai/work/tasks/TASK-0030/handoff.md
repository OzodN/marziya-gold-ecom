# Handoff: TASK-0030 — Frontend Automated Testing Infrastructure and Core Component Test Suite

- **От кого:** frontend / QA specialist
- **Кому:** orchestrator
- **Дата:** 2026-10-02
- **Ветка Git:** subagent-Frontend-QA-Specialist-self-9c520685

## 1. Выполненная работа
- [x] В `apps/frontend/package.json` установлены devDependencies для тестирования:
  - `vitest` (v5.0.3)
  - `@vitejs/plugin-react` (v6.1.1)
  - `@testing-library/react` (v16.3.3)
  - `@testing-library/jest-dom` (v7.0.1)
  - `jsdom` (v30.1.1)
- [x] Добавлен скрипт запуска тестов в `apps/frontend/package.json`:
  ```json
  "test": "vitest run"
  ```
- [x] Создан файл конфигурации `apps/frontend/vitest.config.ts`:
  - `environment: 'jsdom'`
  - `setupFiles: './src/setupTests.ts'`
  - `globals: true`
  - Alias `@` настроен на `./src`
- [x] Создан файл инициализации тестовой среды `apps/frontend/src/setupTests.ts`:
  - Подключены матчеры `@testing-library/jest-dom/vitest`.
  - Реализованы моки для `next/image` и `next/link` для корректного рендеринга в jsdom без Next.js runtime warning.
- [x] Разработан набор компонентных тестов витрины и подборки:
  - **`apps/frontend/src/components/catalog/__tests__/ProductCard.test.tsx`**:
    - Рендеринг названия изделия, категории, артикула и изображения.
    - Корректный рендеринг фоллбэк-заглушки (иконки Gem) при отсутствии изображений.
    - Интерактивное добавление в подборку (`useSelectionStore`), отображение бейджа «В подборке» и индикации «Добавлено».
    - Отображение блока характеристик изделия (`specs`).
  - **`apps/frontend/src/components/selection/__tests__/SelectionSheet.test.tsx`**:
    - Проверка сокрытия при `isOpen: false`.
    - Рендеринг пустого состояния (заголовок «Ваша подборка пуста», подсказка, кнопка перехода к изделиям).
    - Рендеринг списка изделий и бейджа суммарного количества («3 шт.»).
    - Увеличение и уменьшение количества через кнопки `+` и `-`.
    - Удаление отдельного изделия из подборки.
    - Очистка всей подборки по кнопке «Очистить подборку».
    - Переход к оформлению заявки по кнопке «Отправить запрос» (открытие `InquiryModal` и закрытие шторки).
  - **`apps/frontend/src/components/selection/__tests__/InquiryModal.test.tsx`**:
    - Проверка сокрытия при `isInquiryModalOpen: false`.
    - Валидация незаполненных обязательных полей (имя, телефон) при отправке без вызова API.
    - Динамический сброс ошибки валидации поля при вводе пользователем.
    - Успешная отправка заявки (`submitInquiry`), очистка подборки в сторе и отображение экрана подтверждения с кнопкой возврата.
    - Отображение серверной ошибки при сбое API.
- [x] Проведена полная валидация: `npm test` (все 14 тестов пройдены успешно), `npm run build` (33/33 страниц Next.js собраны без регрессий).

## 2. Измененные и созданные файлы
- `apps/frontend/package.json` — добавлены devDependencies и скрипт `"test": "vitest run"`
- `apps/frontend/package-lock.json` — зафиксированы зависимости тестового стека
- `apps/frontend/vitest.config.ts` — конфигурация Vitest для jsdom и React
- `apps/frontend/src/setupTests.ts` — jest-dom матчеры и Next.js моки
- `apps/frontend/src/components/catalog/__tests__/ProductCard.test.tsx` — юнит-тесты карточки товара
- `apps/frontend/src/components/selection/__tests__/SelectionSheet.test.tsx` — юнит-тесты шторки подборки
- `apps/frontend/src/components/selection/__tests__/InquiryModal.test.tsx` — юнит-тесты модального окна заявки
- `.ai/work/tasks/TASK-0030/task.yaml` — обновление статуса задачи
- `.ai/work/tasks/TASK-0030/handoff.md` — итоговый отчет о выполнении

## 3. Принятые решения
- В качестве тестового раннера выбран **Vitest** вместо Jest: полная нативная поддержка TypeScript, Vite-based сборка без babel-transpilation overhead, совместимость с Next.js 15 и React 19.
- Мокирование `next/image` и `next/link` вынесено в `setupTests.ts` с использованием чистого `React.createElement` (без JSX) для гарантии совместимости с компилятором `vite:oxc` в `.ts` файлах.
- В тестах изолировано состояние Zustand хранилища `useSelectionStore` через `localStorage.clear()` и `setState` в хуках `beforeEach`.
- Сетевые вызовы API (`submitInquiry`, `validateBatch`) мокируются через `vi.mock("@/lib/api")`, предотвращая сетевой оверхед и гарантируя детерминированность выполнения тестов.

## 4. Допущения
- Логика тихой валидации доступности `validateBatch` при открытии шторки не блокирует отображение UI при сбое сети.

## 5. Валидация
- `npm test`:
  ```
  ✓ src/components/catalog/__tests__/ProductCard.test.tsx (4 tests)
  ✓ src/components/selection/__tests__/SelectionSheet.test.tsx (5 tests)
  ✓ src/components/selection/__tests__/InquiryModal.test.tsx (5 tests)
  Test Files  3 passed (3)
       Tests  14 passed (14)
  ```
- `npm run build`: Сборка Next.js 15.5.26 завершена успешно (33/33 статических и динамических страниц).

## 6. Следующие шаги
- Передать задачу на ревью оркестратору.
