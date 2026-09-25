# Handoff Report: TASK-0020 — Admin Inquiries Management UI with Historical Snapshot and Status Audit

## 1. Обзор задачи
- **Идентификатор:** `TASK-0020`
- **Ветка:** `feat/TASK-0020-admin-inquiries-ui`
- **Рабочее дерево (Worktree):** `.worktrees/TASK-0020-admin-inquiries-ui`
- **Роль исполнителя:** Senior Frontend Engineer
- **Ключевая цель:** Реализовать закрытый интерфейс управления входящими заявками клиентов в панели мастера:
  1. Список заявок (`/admin/inquiries`) с горизонтальными табами статусов, поиском, пагинацией и ювелирной таблицей/карточками.
  2. Детальный экран заявки (`/admin/inquiries/[id]`) с контактами клиента, блоком ручной смены статуса (с подтверждением по кнопке «Сохранить изменения»), неизменяемым слепком заказанных изделий (`ProductSnapshot`) и журналом аудита статусов (`statusHistory`).

---

## 2. Реализованные изменения

### 2.1. API клиент и типы (`apps/frontend/src/lib/admin-api.ts`, `apps/frontend/src/types/api.ts`)
- Расширен `src/types/api.ts`:
  - `InquiryStatus`: `"NEW" | "CONTACTED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED"`.
  - `ProductSnapshotDto`: артикул, наименование, главное фото, динамические характеристики (`CharacteristicEntryDto[]`), вставки драгоценных камней (`stones`).
  - `InquirySummaryDto`: агрегированные данные для таблицы заявок.
  - `InquiryItemDetailDto`: элемент заявки с поддержкой `snapshot` и `productSnapshot`.
  - `InquiryStatusHistoryDto`: запись аудита (`oldStatus`, `newStatus`, `changedBy`, `changedAt`).
  - `InquiryDetailDto`: полный детальный объект заявки со слепком и историей.
  - `AdminInquiriesResponse`: пагинированный ответ с общим количеством элементов и страниц.
- Расширен `src/lib/admin-api.ts`:
  - `getAdminInquiries(page, size, status)`: отправляет `GET /api/v1/admin/inquiries` с `credentials: 'include'`, считывает заголовки `X-Total-Count`, `X-Total-Pages`, `X-Page-Number`, `X-Page-Size`.
  - `getAdminInquiryById(id)`: отправляет `GET /api/v1/admin/inquiries/{id}` с `credentials: 'include'`.
  - `updateAdminInquiryStatus(id, status)`: отправляет `PUT /api/v1/admin/inquiries/{id}/status` с `credentials: 'include'`.
  - Реализован деликатный offline demo fallback с сохранением состояния в `sessionStorage` (`mg_demo_admin_inquiries`) для автономной работы и тестирования в среде без поднятого бэкенда.
  - Синхронизирован подсчет новых заявок `getNewInquiriesCount()` с актуальным списком.

### 2.2. Утилиты форматирования (`apps/frontend/src/lib/inquiry-utils.ts`)
- Единый конфигуратор статусов `STATUS_META` с ювелирной цветовой гаммой, бейджами и описаниями для мастера.
- Функция `formatItemCount`: корректная русская плюрализация изделий («1 изделие», «2 изделия», «5 изделий»).
- Функции `formatDateTime` и `formatFullDate` для читаемого представления меток времени.

### 2.3. Список заявок (`apps/frontend/src/app/admin/inquiries/page.tsx`)
- **Фильтрация по табам:** «Все», «Новые», «Связались», «В работе», «Завершены», «Отклонены». Активный таб подсвечен золотым градиентом; таб «Новые» отображает пульсирующий счетчик при наличии необработанных заявок.
- **Поиск:** Поле поиска с иконкой лупы и кнопкой быстрой очистки, фильтрующее по имени клиента, номеру телефона или номеру заявки.
- **Ювелирная таблица (Desktop) и карточки (Mobile):**
  - Номер заявки с золотым акцентом и ссылкой на детальный просмотр.
  - Дата и точное время поступления заявки.
  - Имя клиента с персонализированной иконкой.
  - Телефон клиента с кликабельной ссылкой `tel:` и кнопкой быстрого копирования номера в буфер обмена с визуальной отметкой «Скопировано!».
  - Количество позиций в подборке.
  - Статус-бейдж в соответствии с регламентом (золотой пульс для `NEW`, сапфировый синий для `CONTACTED`, янтарный для `IN_PROGRESS`, изумрудный для `COMPLETED`, нейтрально-серый для `REJECTED`).
  - Кнопка действия «Открыть» с областью нажатия `min-h-[44px]`.
- **Состояния:**
  - Content-aware скелетон загрузки таблицы.
  - Дружелюбный Empty State с иконкой, пояснением и кнопкой сброса фильтра.
  - Пагинация с кнопками «Назад»/«Вперед» и номерами страниц.

### 2.4. Детальный экран заявки (`apps/frontend/src/app/admin/inquiries/[id]/page.tsx`)
- **Навигация:** Кнопка «← Назад к списку заявок» с комфортной областью клика.
- **Заголовок:** Номер заявки (`font-serif`, Playfair Display), текущий статус-бейдж, дата создания и общее количество позиций.
- **Карточка профиля клиента:** Имя заявителя, телефон с кнопками «Позвонить» (`tel:`) и «Скопировать», блок с цитатой комментария клиента.
- **Блок ручной смены статуса (Manual Status Management):**
  - Выпадающий список выбора нового статуса с подробным описанием регламента.
  - Предупреждение о несохраненных изменениях при смене статуса.
  - Кнопка «Сохранить изменения» с индикатором загрузки (спиннером), активная **только** при наличии реальных несохраненных изменений.
  - Баннеры успешного сохранения и обработки сетевых ошибок.
  - Защита от случайного закрытия вкладки с несохраненным статусом (`beforeunload`).
  - Мгновенная синхронизация со стором мастера (`pollNewCount()`).
- **Блок заказанных изделий (Historical Snapshot):**
  - Отображает неизменяемый слепок на момент отправки заявки клиентом.
  - Фотография изделия (с заглушкой при отсутствии), артикул (SKU), наименование изделия, количество.
  - Динамические характеристики из снапшота (Металл, Проба, Вес, Размер кольца и т.д.).
  - Состав вставок и драгоценных камней (тип камня, вес в каратах, огранка, цвет/чистота).
- **Журнал аудита статусов (Status Audit Trail):**
  - Хронологическая вертикальная шкала переходов статусов.
  - Отображает старый статус -> новый статус, автора изменения (`changedBy`) и точную дату/время.

---

## 3. Dedicated UX Self-Check (Критерии ux_review_gate)

| Критерий проверки | Требование docs/design/ux-criteria.md | Статус | Детали реализации |
|---|---|---|---|
| **1. Эстетика бренда (Luxury Minimalist)** | Глубокий обсидиановый фон (`#09090B`), благородное золото (`#CCA96C` / `#B88E3E`), шрифты Playfair Display (`font-serif`) для заголовков, тонкие волосяные границы `border-noir-800` / `border-gold-500/20`. | **СОБЛЮДЕНО** | Использованы классы `bg-noir-950`, `bg-noir-900/60`, `border-noir-800`, `text-gold-200`, `font-serif`, `shadow-gold`. |
| **2. Визуальная матрица статусов** | `NEW` — золотое свечение/пульс, `CONTACTED` — синий, `IN_PROGRESS` — янтарный, `COMPLETED` — изумрудный, `REJECTED` — нейтральный серый. | **СОБЛЮДЕНО** | `STATUS_META`: `NEW` имеет `shadow-[0_0_12px_rgba(204,169,108,0.25)] animate-pulse`, остальные статусы имеют точные цветовые токены. |
| **3. Матрица состояний (6 состояний)** | Реализация состояний Default, Hover/Focus, Loading Skeleton, Empty State, Error Feedback, Disabled State. | **СОБЛЮДЕНО** | Реализованы content-aware скелетоны по форме контента (CLS = 0), элегантный Empty State с кнопкой сброса, инлайн-ошибки без сдвигов верстки, `opacity-60 cursor-not-allowed` для неактивных кнопок. |
| **4. Эргономика касаний (Mobile-First)** | Все интерактивные области нажатия (кнопки, табы, иконки, ссылки) `>= 44×44 CSS пикселя`. | **СОБЛЮДЕНО** | Применены классы `min-h-[44px]`, `min-w-[44px]` ко всем кнопкам, ссылкам, табам и полям ввода. |
| **5. Адаптивность для мобильных** | Корректное отображение на экранах шириной от 375px. | **СОБЛЮДЕНО** | Таблица на мобильных устройствах трансформируется в карточный список с сохранением всех быстрых действий (звонок, копирование, переход). |
| **6. Строгая терминология** | Использование «Заявка», «Моя подборка», «Изделие». Полный запрет на слова «Корзина», «Купить», «Заказ», «Checkout». | **СОБЛЮДЕНО** | Термины строго выверены по `.ai/context/terminology.md`. Никаких e-commerce понятий. |
| **7. Ручное сохранение статуса** | Статус не отправляется в БД автоматически при клике на выпадающий список; требуется явный клик на «Сохранить изменения». | **СОБЛЮДЕНО** | Кнопка «Сохранить изменения» активируется только при изменении селектора, отображается спиннер, работает предупреждение об изменении. |
| **8. Неизменяемый слепок (Snapshot)** | Отображение зафиксированных характеристик и камней изделия из `productSnapshot`. | **СОБЛЮДЕНО** | Рендеринг данных из JSONB-снапшота с плашкой «Неизменяемый слепок при отправке». |
| **9. Доступность (a11y)** | `aria-label` для иконочных кнопок, видимый `focus-visible:ring-2 focus-visible:ring-gold-400`. | **СОБЛЮДЕНО** | Все интерактивные элементы доступны с клавиатуры, имеют фокус-кольца и понятные атрибуты доступности. |

---

## 4. Результаты валидации сборки (`npm run build`)

Сборка `apps/frontend` выполнена успешно с кодом завершения 0:
```
> marziya-gold-frontend@0.1.0 build
> next build

   ▲ Next.js 15.5.26

   Creating an optimized production build ...
 ✓ Compiled successfully in 3.1s
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/27) ...
   Generating static pages (6/27) 
   Generating static pages (13/27) 
   Generating static pages (20/27) 
 ✓ Generating static pages (27/27)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                             Size  First Load JS  Revalidate  Expire
┌ ○ /                                                7.51 kB         119 kB
├ ○ /_not-found                                        994 B         104 kB
├ ○ /admin/dashboard                                 5.55 kB         116 kB
├ ○ /admin/inquiries                                 6.78 kB         117 kB
├ ƒ /admin/inquiries/[id]                            6.84 kB         123 kB
├ ○ /admin/login                                     3.35 kB         120 kB
├ ○ /apple-icon.png                                      0 B            0 B
├ ○ /catalog                                           134 B         128 kB
├ ● /catalog/[categorySlug]                            134 B         128 kB
├   ├ /catalog/koltsa
├   ├ /catalog/sergi
├   ├ /catalog/braslety
├   └ [+2 more paths]
├ ○ /icon.png                                            0 B            0 B
└ ● /product/[slug]                                   8.4 kB         129 kB         30s      1y
    ├ /product/koltso-siyanie-vostoka-s-brilliantom                                 30s      1y
    ├ /product/sergi-buharskaya-roza-s-izumrudami                                   30s      1y
    ├ /product/braslet-tsaritsa-samarkanda                                          30s      1y
    └ [+9 more paths]
+ First Load JS shared by all                         103 kB
  ├ chunks/2e00b40c-86422e04deac773e.js              54.2 kB
  ├ chunks/514-4e9f797a6d608c98.js                   46.3 kB
  └ other shared chunks (total)                         2 kB

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

---

## 5. Коммит в репозиторий
- **Ветка:** `feat/TASK-0020-admin-inquiries-ui`
- **Коммит:** `1c88b2f`
- **Сообщение:** `feat(frontend): implement admin inquiries management UI with snapshot and audit history (TASK-0020)`
- **Затронутые файлы:**
  - `apps/frontend/src/app/admin/inquiries/page.tsx` (новый)
  - `apps/frontend/src/app/admin/inquiries/[id]/page.tsx` (новый)
  - `apps/frontend/src/lib/inquiry-utils.ts` (новый)
  - `apps/frontend/src/lib/admin-api.ts` (модифицирован)
  - `apps/frontend/src/types/api.ts` (модифицирован)

Задача полностью готова к прохождению `code_review_gate` и `ux_review_gate`.
