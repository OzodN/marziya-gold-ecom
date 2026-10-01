# Интеграции и внешние сервисы (Integrations)

## 1. Cloudflare R2 + Image Transformations (Managed Media Stack)
- **Назначение:** Хранение оригиналов изображений и видео (Cloudflare R2) и динамическая трансформация, конвертация в WebP/AVIF на edge-серверах Cloudflare (Image Transformations). Полностью managed, zero-ops.
- **Причина выбора:** Cloudinary недоступен на территории Республики Узбекистан (блокировка Geo-IP, невозможность оплаты картами Uzcard/Humo). См. ADR-0002.
- **Компоненты:**
  - **Cloudflare R2:** S3-совместимое объектное хранилище с $0 egress. Бэкенд взаимодействует через стандартный AWS S3 SDK (`software.amazon.awssdk:s3`). R2 bucket приватный, доступ через custom domain `media.marziyagold.uz`.
  - **Cloudflare Image Transformations:** Обработка изображений на edge (ресайз, конвертация в WebP/AVIF) по URL-параметрам `/cdn-cgi/image/width=W,format=auto/...`. 5,000 бесплатных трансформаций/мес.
  - **Cloudflare CDN:** Автоматическое кэширование на edge PoP. DNS через Cloudflare (Free Plan).
- **Поток загрузки:**
  1. Администратор перетаскивает фото в редакторе товара.
  2. Фронтенд запрашивает у бэкенда presigned PUT URL для R2.
  3. Браузер загружает файл **напрямую** в R2 (бэкенд не проксирует).
  4. В БД сохраняется R2 object path и metadata.
  5. Фронтенд формирует URL с трансформацией через custom loader Next.js (например, `/cdn-cgi/image/width=600,format=auto/products/42/ring.jpg`).

## 2. Прямые каналы связи (Telegram / Телефон)
- **Назначение:** Альтернативный быстрый контакт клиента с мастером прямо из карточки товара.
- **Реализация:**
  - Кнопка `[Telegram]`: прямая ссылка `https://t.me/<master_username>` (параметр берется из настроек `SiteSetting`).
  - Кнопка `[Позвонить]`: нативная ссылка `tel:<phone_number>`.

## 3. Managed PostgreSQL (Railway / Neon / Supabase)
- **Назначение:** Хранилище реляционных данных и JSONB-снапшотов.
- **Требования:** Версия PostgreSQL 16+, включенное расширение `pg_trgm`, автоматическое создание ежедневных бэкапов.

## 4. Хостинг и CI/CD
- **Платформа хостинга:** Единый проект на **Railway (PaaS)** для монорепозитория:
  - **Frontend:** Сервис `apps/frontend` (Next.js 15, Always-on Node.js контейнер).
  - **Backend:** Сервис `apps/backend` (Spring Boot 4.1.1, Java 21). При SSR фронтенд обращается к бэкенду по внутренней приватной сети Railway (`backend.railway.internal`) с минимальной задержкой.
  - **Database:** Managed PostgreSQL сервис внутри того же проекта Railway.
  - **DNS & CDN:** Cloudflare (домены `marziyagold.uz` и `api.marziyagold.uz`, автоматический SSL, WAF).
- **CI/CD:** GitHub Actions (автоматический запуск юнит/интеграционных тестов, линтинг, проверка контрактов) + автоматический деплой Railway с разделением по Watch Paths (`apps/frontend/**`, `apps/backend/**`).
