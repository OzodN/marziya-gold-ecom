# Архитектурные и технические ограничения (Constraints)

## 1. Эксплуатационные ограничения (Zero-Maintenance)
- Проект создается по модели **"Сдал и забыл"**: после сдачи клиенту разработчик не должен администрировать серверы, обновлять ОС или продлевать сертификаты.
- **Никаких голых Linux VPS / Self-hosted серверов**: только полностью управляемые PaaS (Vercel, Render/Railway, Managed PostgreSQL).
- **Никакого хранения файлов на локальном диске сервера**: все медиафайлы отправляются напрямую в Cloudinary CDN.
- **Никаких внешних сервисов поиска (ElasticSearch/Meilisearch)**: полнотекстовый и нечеткий поиск реализуется строго нативным расширением PostgreSQL `pg_trgm`.

## 2. Технические ограничения
- **Java:** Версия 21 LTS.
- **Spring Boot:** Версия 4.1.1.
- **База данных:** PostgreSQL 16+ с расширением `pg_trgm` и колонками JSONB.
- **Миграции:** Flyway — единственный источник истины для схемы БД.
- **Frontend:** Next.js (App Router), React 19, TypeScript, TailwindCSS, shadcn/ui.
- **State Management:** Zustand с middleware persist (`localStorage`).
- **Безопасность админки:** JWT передается и сохраняется строго в `HttpOnly`, `SameSite=Strict`, `Secure` Cookie. Никаких токенов в `localStorage` админки.
- **Realtime в админке:** Фоновый HTTP Polling раз в 30 секунд. Никаких WebSockets или SSE в MVP.
- **Размер файлов правил:** Любой файл `AGENTS.md` не должен превышать 24 КБ (24 000 байт).
