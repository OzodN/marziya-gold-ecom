# Infrastructure & Deployment (`infra/`)

## Назначение
Дескрипторы развертывания, переменные окружения и манифесты облачных сервисов.

## Парадигма
- **Zero-Maintenance ("Сдал и забыл"):**
  - Frontend: Vercel.
  - Backend: Render / Railway.
  - Database: Managed PostgreSQL (Neon / Supabase).
  - Media: Cloudflare R2 (S3-хранилище, $0 egress) + Cloudflare Image Transformations (ресайз на edge).
  - Никаких серверов на ручном администрировании.

Локальные правила агента: [AGENTS.md](AGENTS.md).
