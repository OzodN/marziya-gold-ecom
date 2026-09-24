# План реализации TASK-0009: Страница каталога, фильтры категорий и поиск

## 1. Архитектурная цель
Реализовать полноценную страницу каталога витрины `/catalog` и маршрут категории `/catalog/[categorySlug]` с фильтрацией, пагинацией и поиском по контракту `docs/api/openapi.yaml`.

## 2. Шаги реализации
1. Создать ворктри `.worktrees/TASK-0009-frontend-catalog` на ветке `feat/TASK-0009-frontend-catalog`.
2. Реализовать клиент API `src/lib/api.ts` для взаимодействия с эндпоинтами каталога (`GET /products`, `GET /categories`, `GET /characteristics/filter-keys`).
3. Создать компоненты фильтрации:
   - `CatalogFilters.tsx`: фильтр категорий, типов камней, характеристик (металл, проба).
   - Адаптивность: боковая панель для десктопа + мобильный выдвижной Drawer.
   - `CatalogSearch.tsx`: строка поиска с debounce.
   - `Pagination.tsx`: компонент пагинации.
4. Создать страницу `src/app/catalog/page.tsx` и `src/app/catalog/[categorySlug]/page.tsx`.
5. Обеспечить корректную работу кнопки «В подборку» и бейджа в Header.
6. Проверить сборку `npm run build` в `apps/frontend`.
7. Составить `handoff.md`.
