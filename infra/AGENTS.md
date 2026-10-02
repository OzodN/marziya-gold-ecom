# Local Rules: Infrastructure & Deployment (`infra/AGENTS.md`)

## 1. Назначение директории
Содержит дескрипторы развертывания, конфигурации контейнеризации и профили окружений для облачных PaaS-платформ.

## 2. Локальные правила для DevOps Agent
- **Парадигма Zero-Maintenance:**
  - Никаких голых Linux VPS, ручной настройки Nginx или самостоятельного выпуска SSL через Certbot.
  - Только управляемые платформы с автоматическим перезапуском и поддержанием HTTPS:
    - Frontend: Railway (Next.js 15, сервис монорепозитория apps/frontend).
    - Backend: Railway (Spring Boot 4.1.1, сервис монорепозитория apps/backend).
    - Database: Railway Managed PostgreSQL (с автобэкапами) или Neon/Supabase.
    - Media: Cloudflare R2 (S3-хранилище, $0 egress) + Cloudflare Image Transformations (ресайз на edge).
    - DNS & CDN: Cloudflare.
- **Управление переменными окружения:**
  - Все секретные параметры (пароли к БД, секреты JWT, ключи Cloudflare R2) передаются через Environment Variables платформы.
  - В репозитории хранятся только `.env.example` файлы.
- **Запреты:**
  - Запрещено менять код бизнес-логики в `apps/`.
  - Запрещено коммитить реальные боевые токены или пароли.
