# Handoff: TASK-0005 — Selection Sheet Backdrop and Keyboard Close Interaction

- **От кого:** Senior Frontend Engineer (frontend agent)
- **Кому:** Orchestrator / Reviewer
- **Дата:** 2026-09-24
- **Ветка Git:** `feat/TASK-0005-selection-sheet-backdrop`
- **Worktree:** `.worktrees/TASK-0005-selection-sheet-backdrop`
- **Коммит:** `121e047` (`fix(frontend): close selection sheet on backdrop click and Escape key`)

## 1. Выполненная работа
- [x] Реализовано закрытие боковой шторки подборки (`closeSelection`) при клике на затемненную область фона (бэкдроп) вне самой панели подборки.
  - Добавлен явный бэкдроп-оверлей (`<div className="fixed inset-0 bg-noir-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" onClick={closeSelection} aria-hidden="true" />`).
  - Обертка позиционирования панели снабжена классом `pointer-events-none`, чтобы клики в свободной левой области беспрепятственно достигали бэкдропа.
  - Сама панель подборки (drawer content) получила класс `pointer-events-auto` и обработчик `onClick={(e) => e.stopPropagation()}`, гарантируя, что клики по товарам, счетчикам, кнопкам, скроллу и пустому пространству внутри панели НЕ закрывают подборку.
- [x] Добавлена обработка нажатия клавиши `Escape`:
  - В `useEffect` зарегистрирован слушатель события `keydown` на объекте `window` (активен при `isOpen === true`), вызывающий `closeSelection()` при `event.key === "Escape"`.
  - Предусмотрено корректное снятие слушателя (`removeEventListener`) в cleanup-функции эффекта при размонтировании или закрытии шторки.
- [x] Добавлены атрибуты доступности: `role="dialog"`, `aria-modal="true"`, `aria-label="Моя подборка"`.
- [x] Строго соблюдена каноническая терминология («Моя подборка», «В подборку», «Отправить запрос»). Запрещенные термины («Корзина», «Cart», «Купить», «Оформить заказ», «Checkout») исключены.
- [x] Успешно пройдена валидация: `npm run build` в `apps/frontend` завершился с кодом 0 без ошибок компиляции и линтинга.
- [x] Изменения закоммичены в ветку ворктри с сообщением `fix(frontend): close selection sheet on backdrop click and Escape key`. Pull Request намеренно НЕ создавался.

## 2. Измененные файлы
- `apps/frontend/src/components/selection/SelectionSheet.tsx`:
  - Добавлен `useEffect` со слушателем клавиши `Escape`.
  - Реструктурирован слой бэкдропа с `onClick={closeSelection}`.
  - Добавлен `pointer-events-none` на внешнюю обертку и `pointer-events-auto` с `onClick={(e) => e.stopPropagation()}` на панель содержимого подборки.

## 3. Принятые решения
- **Изоляция кликов через stopPropagation и pointer-events:** Использование комбинации `pointer-events-none` на позиционирующем контейнере и `pointer-events-auto` + `stopPropagation` на панели шторки обеспечивает стабильное поведение: клик по любой части затемнения экрана закрывает подборку, а любые клики внутри (включая пустое пространство между товарами и скроллбар) остаются строго изолированными внутри панели.
- **Очистка слушателя событий:** Регистрация слушателя клавиатуры привязана к зависимости `isOpen`, что исключает утечки памяти и лишние вызовы, когда шторка закрыта.

## 4. Валидация
- Команда сборки: `npm run build` в `apps/frontend`
- Результат: Успешно (Next.js 15.5.26, compiled successfully, 0 lint/type errors, static generation 6/6 passed).
