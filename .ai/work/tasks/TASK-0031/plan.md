# Plan: TASK-0031 — Production Containerization and Railway PaaS Monorepo Deployment Configuration

## 1. Цель
Создать легковесные, безопасные multi-stage Docker-образы для бэкенда и фронтенда, а также манифесты конфигурации деплоя на Railway PaaS в соответствии с моделью Zero-Maintenance.

## 2. Шаги реализации
1. Создать `.dockerignore` в корне и сервисах.
2. Создать `apps/backend/Dockerfile`:
   - Stage 1 (builder): maven:3.9-eclipse-temurin-21, компиляция и упаковка JAR.
   - Stage 2 (runner): eclipse-temurin:21-jre-alpine / distroless / non-root, JVM-флаги (`-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0`).
3. Создать `apps/frontend/Dockerfile`:
   - Stage 1 (deps): node:22-alpine, `package.json`, установка зависимостей.
   - Stage 2 (builder): `npm run build` с `output: "standalone"` в `next.config.ts`.
   - Stage 3 (runner): node:22-alpine, non-root user `nextjs:nodejs`, копирование `.next/standalone` и `.next/static`.
4. Создать `railway.toml` с описанием сервисов:
   - `backend` (`apps/backend`, healthcheck `/actuator/health` или `/api/v1/categories`).
   - `frontend` (`apps/frontend`).
5. Создать `.env.production.example` со всеми переменными (PostgreSQL, R2, JWT, CORS).
6. Создать `infra/railway-deployment.md` с пошаговой инструкцией.
7. Составить `handoff.md`.
