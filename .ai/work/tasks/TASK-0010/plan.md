# План реализации TASK-0010: Устранение всех замечаний UX-аудита

## 1. Цель
Устранить все замечания, выявленные в ходе UX-аудита (`.ai/reports/ux-reviews/TASK-0009-ux-review.md`), для перевода вердикта `ux_review_gate` в **APPROVE**.

## 2. Объем правок по компонентам

### 1. `InquiryModal.tsx` (DEF-01, DEF-02, DEF-04)
- Добавить обработчик нажатия клавиши `Escape` через `useEffect`.
- Сделать бэкдроп кликабельным (`onClick={handleClose}`), а внутренний контейнер изолировать `onClick={(e) => e.stopPropagation()}`.
- Добавить семантику: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="inquiry-modal-title"`.
- Заменить верхний баннер ошибок на инлайн-валидацию полей ввода (`fieldErrors: { name?: string, phone?: string }`) с подсветкой `border-red-500` и текстом под полем.
- Увеличить область кнопки `X` до `min-h-[44px] min-w-[44px]`.

### 2. `ProductCard.tsx` (DEF-03, DEF-04, DEF-08)
- Обернуть изображение и заголовок в `<Link href={`/product/${product.slug}`}>`.
- Обеспечить минимальную высоту кнопки «В подборку» `min-h-[44px]`.
- Добавить `focus-visible:ring-2 focus-visible:ring-gold-400`.

### 3. `SelectionSheet.tsx` (DEF-04, DEF-06)
- Увеличить кнопки счетчика `+` и `-` и кнопку удаления `Trash2` до комфортных тач-областей (кнопки с `min-h-[36px] min-w-[36px]` внутри контейнера, или `min-h-[44px] min-w-[44px]`).
- Увеличить кнопку закрытия `X` до `min-h-[44px] min-w-[44px]`.
- На смартфонах (`<sm`) убрать неудобный отступ `pl-10`, сделав панель на всю ширину экрана (`w-full pl-0 sm:pl-10`).

### 4. `Pagination.tsx` (DEF-04, DEF-08)
- Заменить размеры кнопок `h-9 min-w-9` на `h-11 min-w-[44px]` (44×44px).
- Добавить `focus-visible:ring-2 focus-visible:ring-gold-400`.

### 5. `CatalogSearch.tsx` (DEF-04)
- Увеличить кнопку очистки поиска `X` до `h-9 w-9` (или обернуть в `min-h-[44px] min-w-[44px]`).

### 6. `CatalogView.tsx` (DEF-05)
- Добавить состояние `hasError: boolean`. При возникновении ошибки рендерить состояние ошибки с кнопкой «Повторить попытку».

### 7. `Header.tsx` (DEF-07)
- На мобильных устройствах (<640px) добавить компактную кнопку/ссылку «Каталог», чтобы навигация оставалась доступной.

## 3. Валидация
- `npm run build` в `apps/frontend`.
- Повторный запуск `ux-reviewer`.
