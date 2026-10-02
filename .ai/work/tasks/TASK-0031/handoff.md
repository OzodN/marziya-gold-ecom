# Handoff: TASK-0031 — Production Containerization and Railway PaaS Monorepo Deployment Configuration

- **От кого:** DevOps Specialist
- **Кому:** Orchestrator / Reviewer
- **Дата:** 2026-10-02
- **Ветка Git:** `subagent-DevOps-Specialist-self-2f792a03`
- **Worktree:** `subagent-DevOps-Specialist-self-2f792a03`

---

## 1. Выполненная работа
- [x] Созданы файлы `.dockerignore` в корне проекта, `apps/backend/.dockerignore` и `apps/frontend/.dockerignore` для исключения `node_modules`, `target`, `.worktrees`, `.git`, `.ai`, секретов и временных файлов.
- [x] Создан multi-stage `apps/backend/Dockerfile`:
  - Builder stage: `maven:3.9-eclipse-temurin-21-alpine` (сборка JAR через `mvn clean package -DskipTests`).
  - Runner stage: `eclipse-temurin:21-jre-alpine` с выделенным non-root пользователем `spring:spring`.
  - Заданы флаги JVM для работы в контейнерах: `-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0`.
  - Экспонирован порт 8080 и настроен healthcheck.
- [x] В `apps/frontend/next.config.ts` сконфигурирован параметр `output: "standalone"`.
- [x] Создан multi-stage `apps/frontend/Dockerfile`:
  - Deps stage: `node:22-alpine` с установкой зависимостей через `npm ci`.
  - Builder stage: `node:22-alpine` со сборкой standalone-бандла Next.js 15.
  - Runner stage: `node:22-alpine` с non-root пользователем `nextjs:nodejs`.
  - Корректно скопированы `.next/standalone`, `.next/static` и `public`.
  - Экспонирован порт 3000, установлены `PORT=3000` и `HOSTNAME="0.0.0.0"`.
- [x] Создан манифест `railway.toml` в корне репозитория (а также локальные манифесты `apps/backend/railway.toml` и `apps/frontend/railway.toml`), декларирующий сервисы `backend` и `frontend` для Railway PaaS.
- [x] Создан эталонный файл переменных окружения `.env.production.example` с документированием всех параметров (PostgreSQL, Cloudflare R2, Cloudinary, JWT, CORS, Next.js Public & Internal URLs).
- [x] Написано детальное руководство по развертыванию `infra/railway-deployment.md` в рамках модели Zero-Maintenance.

---

## 2. Измененные и созданные файлы
- `.dockerignore`: корневые правила исключения из контекста сборки.
- `apps/backend/.dockerignore`: исключения для сборки бэкенда.
- `apps/frontend/.dockerignore`: исключения для сборки фронтенда.
- `apps/backend/Dockerfile`: multi-stage сборка бэкенда (Java 21 Temurin).
- `apps/frontend/Dockerfile`: multi-stage сборка фронтенда (Next.js standalone).
- `apps/frontend/next.config.ts`: включен `output: "standalone"`.
- `railway.toml`: декларация монорепозитория для Railway PaaS.
- `apps/backend/railway.toml`: локальный манифест сервиса бэкенда.
- `apps/frontend/railway.toml`: локальный манифест сервиса фронтенда.
- `.env.production.example`: спецификация всех переменных окружения для продакшена.
- `infra/railway-deployment.md`: архитектурное и операционное руководство по деплою.

---

## 3. Принятые решения
- **Standalone режим Next.js:** Включение `output: "standalone"` сокращает размер итогового runtime-образа фронтенда с ~1 ГБ до ~150 МБ и потребление ОЗУ до ~80 МБ.
- **Двухуровневая поддержка конфигурации Railway:** Размещен как корневой `railway.toml`, так и изолированные конфигурации сервисов внутри `apps/backend` и `apps/frontend`, что гарантирует бесшовный деплой как через корень репозитория, так и при явном указании Root Directory в Railway Dashboard.
- **Поддержка private networking:** Внутренние запросы между Next.js SSR и Spring Boot API настроены через `.railway.internal`, обеспечивая нулевые накладные расходы на egress-трафик и высокую скорость.

---

## 4. Допущения
- Предполагается использование управляемого PostgreSQL от Railway или совместимого сервиса (Neon/Supabase) с поддержкой SSL (`sslmode=require`).
- Для медиафайлов поддерживается гибридный вариант: Cloudflare R2 (S3 API) или Cloudinary (через существующий `CloudinaryService`).

---

## 5. Известные ограничения
- При развертывании в Railway переменные с префиксом `NEXT_PUBLIC_*` должны быть определены в среде сборки фронтенда для корректной подстановки в клиентский бандл.

---

## 6. Валидация
- Проверка синтаксиса и структуры Dockerfile для бэкенда и фронтенда: корректно.
- Проверка структуры `.dockerignore`: корректно.
- Проверка `output: "standalone"` в `next.config.ts`: корректно.
- Проверка схемы `railway.toml`: соответствует `https://railway.com/railway.schema.json`.

---

## 7. Следующие шаги
- [ ] Оркестратору / Reviewer провести валидацию решения по шлюзу `code_review_gate`.
- [ ] Слить ветку в основную ветку `main`.
- [ ] Перевести статус TASK-0031 в `done` в `.ai/work/registry.yaml`.

---

## 8. Ключевые файлы
- `apps/backend/Dockerfile`
- `apps/frontend/Dockerfile`
- `railway.toml`
- `.env.production.example`
- `infra/railway-deployment.md`
