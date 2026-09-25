# Handoff: TASK-0013 — Product Detail Page UX Remediation (DEF-09 to DEF-13)

- **От кого:** Frontend Engineer
- **Кому:** UX Reviewer / Orchestrator
- **Дата:** 2026-09-25
- **Ветка Git:** `feat/TASK-0013-product-ux-remediation`
- **Worktree:** `.worktrees/TASK-0013-product-ux-remediation`

## 1. Выполненная работа
- [x] **DEF-09:** В `StickyActionBar.tsx` скорректировано условие отображения липкой мобильной панели: она активируется при скролле ниже 240px (`window.scrollY > 240`) и скрывается только тогда, когда основная кнопка «В подборку» находится в видимой области экрана (`rect.top < window.innerHeight && rect.bottom > 0`). Добавлен учет `env(safe-area-inset-bottom)`.
- [x] **DEF-10:** В `ProductGallery.tsx` реализовано закрытие полноэкранного лайтбокса при клике на затемненную область фона (бэкдроп/оверлей), с изоляцией событий (`e.stopPropagation()`) на самом изображении, кнопках навигации и панели миниатюр.
- [x] **DEF-11:** В `ProductGallery.tsx` реализован полноценный механизм удержания фокуса (Focus Trap) внутри открытого лайтбокса с циклическим переключением клавишей `Tab` / `Shift+Tab`, автоматической установкой фокуса на кнопку закрытия и восстановлением фокуса на исходный элемент при выходе.
- [x] **DEF-12:** В `ProductInfo.tsx` и `app/product/[slug]/page.tsx` подключена динамическая загрузка контактных данных мастера через `getContactSettings()`. Ссылки на Telegram и телефон формируются динамически с санитайзингом и fallback-значениями.
- [x] **DEF-13:** В `ProductGallery.tsx` интерактивная область точек пагинации расширена до `min-h-[44px] min-w-[44px]` с `h-11`, что полностью удовлетворяет мобильным критериям touch targets >= 44x44px.

## 2. Измененные файлы
- `apps/frontend/src/components/product/StickyActionBar.tsx`: улучшен алгоритм видимости панели и мобильные отступы безопасной зоны.
- `apps/frontend/src/components/product/ProductGallery.tsx`: закрытие лайтбокса по бэкдропу, фокус-трап и тач-таргеты точек пагинации.
- `apps/frontend/src/components/product/ProductInfo.tsx`: интеграция динамических контактов мастера с fallback.
- `apps/frontend/src/app/product/[slug]/page.tsx`: параллельный fetch настроек контактов через `Promise.all` и передача в `ProductInfo`.

## 3. Принятые решения
- Для сохранения идеальной производительности и SEO контактные данные мастера запрашиваются на сервере параллельно с получением изделия в `page.tsx` и передаются пропом в `ProductInfo`, а при изолированном рендере на клиенте подгружаются через `useEffect`.

## 4. Допущения
- Стандартные fallback-контакты мастера соответствуют сид-миграции базы данных (`@marziyagold`, `+998901234567`).

## 5. Валидация
- Команда проверки: `npm run build` в `apps/frontend`
- Результат: **Passed (0 errors, 24/24 static pages pre-rendered)**
- Schema.org Product JSON-LD валидирован.

### 5.1. UX/UI Self-Check
- [x] Соответствие `docs/design/ux-criteria.md` проверено
- [x] Mobile-first: touch targets >= 44x44px на всех интерактивных элементах (включая точки слайдера)
- [x] Терминология: строго "Моя подборка", "В подборку", "Отправить запрос", "Изделие изготавливается под заказ мастером"
- [x] Доступность: Escape закрывает диалоги, focus trap в лайтбоксе, aria-labels и aria-modal настроены

## 6. Следующие шаги
- [ ] Передать на финальную валидацию `ux-reviewer` (`ux_review_gate`).
- [ ] Слить ветку в `main` и приступить к интерфейсу панели мастера (Admin UI).
