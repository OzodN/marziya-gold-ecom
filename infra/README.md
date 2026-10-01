# Infrastructure & Deployment (`infra/`)

## Назначение
Дескрипторы развертывания, переменные окружения и манифесты облачных сервисов.

## Парадигма
- **Zero-Maintenance ("Сдал и забыл"):**
  - Frontend: Railway (Next.js 15).
  - Backend: Railway (Spring Boot).
  - Database: Railway Managed PostgreSQL (или Neon/Supabase).
  - Media: Cloudflare R2 (S3-хранилище, $0 egress) + Cloudflare Image Transformations (ресайз на edge).
  - DNS & CDN: Cloudflare.
  - Никаких серверов на ручном администрировании.

Локальные правила агента: [AGENTS.md](AGENTS.md).
