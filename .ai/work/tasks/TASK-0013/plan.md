# План реализации TASK-0013: Устранение замечаний UX-аудита карточки изделия

## 1. Объем доработок
- **DEF-09:** В `StickyActionBar.tsx` скорректировать логику видимости: показывать панель при `scrollY > 240` и скрывать её только тогда, когда основная кнопка видна на экране (`rect.top < window.innerHeight && rect.bottom > 0`).
- **DEF-10:** В `ProductGallery.tsx` добавить `onClick={() => setIsLightboxOpen(false)}` на фоновый оверлей лайтбокса и `e.stopPropagation()` на контейнер изображения.
- **DEF-11:** В `ProductGallery.tsx` внедрить удержание фокуса (Focus Trap) внутри открытого лайтбокса.
- **DEF-12:** В `ProductInfo.tsx` подключить динамические контакты мастера через `getContactSettings()`.
- **DEF-13:** В `ProductGallery.tsx` расширить кликабельную область кнопок точек пагинации до 44×44px (`min-h-[44px] min-w-[44px]`).

## 2. Валидация
- `npm run build` в `apps/frontend`.
- Повторный запуск `ux-reviewer`.
