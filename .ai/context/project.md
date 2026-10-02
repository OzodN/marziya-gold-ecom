# Контекст проекта: Marziya Gold E-Catalog

## 1. Назначение
Проект `marziya-gold_ecom` — это веб-каталог авторских ювелирных изделий ручной работы с возможностью формирования подборки и отправки индивидуальной заявки мастеру.

## 2. Ключевые цели
- Презентация эксклюзивных изделий в премиальном минималистичном визуальном стиле.
- Предоставление клиенту исчерпывающих сведений об изделии (металл, проба, камни, огранка).
- Сбор структурированных лидов (заявок на изготовление) без классического интернет-магазина.
- Полная автономность системы в эксплуатации по модели **"Zero-Maintenance**.

## 3. Целевые платформы и стек
- **Клиентская часть (Frontend):** Next.js 15+ (App Router), React 19, TypeScript, TailwindCSS, shadcn/ui.
- **Серверная часть (Backend):** Java 21, Spring Boot 4.1.1, Spring Data JPA, Spring Security (JWT в HttpOnly Cookie), Flyway.
- **База данных:** PostgreSQL 16+ (расширение `pg_trgm`, индексация JSONB).
- **Медиа-сервис:** Cloudflare R2 (S3-хранилище оригиналов, $0 egress) + Cloudflare Image Transformations (динамический ресайз и конвертация WebP/AVIF на edge). Полностью managed. См. ADR-0002.
- **Хостинг:** Managed PaaS (единый проект на Railway: Frontend Next.js + Backend Spring Boot + PostgreSQL, под единым Cloudflare DNS).
