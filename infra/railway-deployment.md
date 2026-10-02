# Руководство по развертыванию на Railway PaaS (Zero-Maintenance)

Данный документ описывает регламент и пошаговый процесс развертывания проекта **Marziya Gold Jewelry E-Commerce** на платформе **Railway PaaS** в соответствии с парадигмой **Zero-Maintenance**.

---

## 1. Архитектурная концепция Zero-Maintenance

Цель архитектуры — полное исключение ручного администрирования серверов (no bare-metal Linux, no manual Nginx configs, no manual Certbot SSL, no manual cron jobs).

```
                      +-----------------------------+
                      |   Cloudflare DNS & Edge     |
                      |  (DDoS, WAF, SSL, Caching)  |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v (HTTPS: marziyagold.uz)                   v (HTTPS: api.marziyagold.uz)
    +----------------------+                    +----------------------+
    |   Railway Frontend   |                    |   Railway Backend    |
    |  (Next.js Standalone)|                    |  (Spring Boot / JRE) |
    |      Port: 3000      |                    |      Port: 8080      |
    +----------+-----------+                    +----------+-----------+
               |                                           |
               | (Private Network: http://backend.internal)|
               +------------------------------------------>|
                                                           v
                                                +----------------------+
                                                |   Railway Managed    |
                                                |      PostgreSQL      |
                                                |  (Automated Backups) |
                                                +----------------------+
```

### Компоненты инфраструктуры
1. **Frontend:** Легковесный multi-stage Docker-образ на базе `node:22-alpine` с `output: "standalone"`, потребляющий ~60-90 МБ ОЗУ.
2. **Backend:** Multi-stage Docker-образ на базе `eclipse-temurin:21-jre-alpine` с cgroup/container-aware настройками JVM (`-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0`).
3. **Database:** Управляемый PostgreSQL от Railway (автоматический restart upon failure, встроенные snapshot-бэкапы, connection pooling).
4. **Media Storage:** Cloudflare R2 / Cloudinary (хранение медиафайлов без платы за egress-трафик).
5. **Private Networking:** Запросы между Frontend SSR и Backend идут по внутренней зашифрованной сети Railway (`.railway.internal`) с нулевой задержкой и нулевой стоимостью внешнего трафика.

---

## 2. Предварительные требования

Перед началом развертывания убедитесь, что у вас есть:
- Учетная запись на [Railway.app](https://railway.app).
- Учетная запись GitHub с доступом к репозиторию `marziya-gold_ecom`.
- (Опционально) Учетная запись Cloudflare для управления DNS и медиа-хранилищем R2.

---

## 3. Пошаговое развертывание через Railway Dashboard (Рекомендуемый способ)

### Шаг 1: Создание проекта
1. Войдите в панель [Railway Dashboard](https://railway.app/dashboard).
2. Нажмите **"New Project"** -> **"Deploy from GitHub repo"**.
3. Выберите репозиторий `marziya-gold_ecom`.
4. Нажмите **"Add variables later"** или закройте первичное модальное окно (мы настроим сервисы отдельно).

---

### Шаг 2: Добавление управляемой базы данных PostgreSQL
1. В полотне проекта нажмите кнопку **"+ New"** (в правом верхнем углу).
2. Выберите **"Database"** -> **"Add PostgreSQL"**.
3. Railway автоматически создаст инстанс PostgreSQL и сгенерирует учетные данные:
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`
   - `DATABASE_URL`

---

### Шаг 3: Настройка Backend-сервиса
1. В полотне проекта нажмите **"+ New"** -> **"GitHub Repo"** -> выберите `marziya-gold_ecom`.
2. Переименуйте созданный сервис в `backend` (Settings -> General -> Service Name -> `backend`).
3. В **Settings** задайте конфигурацию монорепозитория:
   - **Root Directory:** `apps/backend`
   - **Builder:** `DOCKERFILE` (или оставьте автоматическое определение, так как `railway.toml` задан).
   - **Dockerfile Path:** `Dockerfile` (относительно корня сервиса `apps/backend`).
   - **Watch Paths:** `src/**`, `pom.xml`, `Dockerfile`.
4. В **Settings** -> **Deploy**:
   - **Healthcheck Path:** `/api/v1/categories`
   - **Healthcheck Timeout:** `120` сек.
   - **Restart Policy:** `ON_FAILURE` (Max retries: 10).
5. В вкладке **Variables** добавьте переменные окружения:

| Переменная | Значение (Railway reference) | Описание |
|---|---|---|
| `PORT` | `8080` | Порт Spring Boot |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}?sslmode=require` | JDBC-строка подключения |
| `SPRING_DATASOURCE_USERNAME` | `${{Postgres.PGUSER}}` | Имя пользователя БД |
| `SPRING_DATASOURCE_PASSWORD` | `${{Postgres.PGPASSWORD}}` | Пароль к БД |
| `JDBC_DATABASE_URL` | `jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}?sslmode=require` | Алиас для обратной совместимости |
| `DB_USERNAME` | `${{Postgres.PGUSER}}` | Алиас имени пользователя |
| `DB_PASSWORD` | `${{Postgres.PGPASSWORD}}` | Алиас пароля |
| `JWT_SECRET` | *32+ символьная криптостойкая строка* | Секрет HMAC-SHA256 |
| `JWT_EXPIRATION_MS` | `86400000` | Время жизни сессии (24 часа) |
| `ADMIN_DEFAULT_PASSWORD` | *Надежный пароль мастера* | Пароль первого входа администратора |
| `CORS_ALLOWED_ORIGINS` | `https://marziyagold.uz,https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}` | Разрешенные источники |
| `CLOUDINARY_CLOUD_NAME` | *Имя облака Cloudinary (если используется)* | Облачное медиахранилище |
| `CLOUDINARY_API_KEY` | *API ключ* | Ключ доступа |
| `CLOUDINARY_API_SECRET` | *API секрет* | Секрет доступа |
| `CLOUDINARY_FOLDER` | `marziya-gold` | Папка загрузки |

6. В **Settings** -> **Networking**:
   - Включите **Private Networking** (Railway создаст внутренний домен `backend.railway.internal`).
   - Нажмите **"Generate Domain"** для получения публичного домена (например, `backend-production-xxxx.up.railway.app`).

---

### Шаг 4: Настройка Frontend-сервиса
1. В полотне проекта нажмите **"+ New"** -> **"GitHub Repo"** -> снова выберите `marziya-gold_ecom`.
2. Переименуйте сервис в `frontend`.
3. В **Settings** задайте:
   - **Root Directory:** `apps/frontend`
   - **Builder:** `DOCKERFILE`
   - **Dockerfile Path:** `Dockerfile`
   - **Watch Paths:** `src/**`, `public/**`, `next.config.ts`, `package.json`, `Dockerfile`.
4. В **Settings** -> **Deploy**:
   - **Healthcheck Path:** `/`
   - **Healthcheck Timeout:** `60` сек.
   - **Restart Policy:** `ON_FAILURE`.
5. В вкладке **Variables** добавьте переменные:

| Переменная | Значение | Описание |
|---|---|---|
| `NODE_ENV` | `production` | Окружение Node.js |
| `PORT` | `3000` | Порт Next.js |
| `HOSTNAME` | `0.0.0.0` | Привязка интерфейса |
| `NEXT_PUBLIC_API_URL` | `https://${{backend.RAILWAY_PUBLIC_DOMAIN}}` | Публичный адрес API бэкенда |
| `NEXT_PUBLIC_MEDIA_URL` | `https://media.marziyagold.uz` | Домен статики/медиа |
| `INTERNAL_API_URL` | `http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:8080` | Внутренний трафик для Next.js SSR |
| `BACKEND_URL` | `http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:8080` | Внутренний прокси для API rewrites |

6. В **Settings** -> **Networking**:
   - Нажмите **"Generate Domain"** (или подключите собственный домен `marziyagold.uz`).

---

## 4. Развертывание через Railway CLI (Альтернативный способ)

Если вы предпочитаете управлять инфраструктурой через терминал:

```bash
# 1. Установка Railway CLI
npm i -g @railway/cli

# 2. Авторизация
railway login

# 3. Инициализация проекта и привязка репозитория
railway init

# 4. Добавление плагина PostgreSQL
railway add --database postgres

# 5. Деплой монорепозитория
railway up
```

---

## 5. Доменные имена и SSL-сертификаты

Платформа Railway автоматически выпускает бесплатные управляемые сертификаты Let's Encrypt для всех подключенных доменов:

1. Перейдите в сервис `frontend` -> **Settings** -> **Networking** -> **Custom Domains**.
2. Введите `marziyagold.uz` (и `www.marziyagold.uz`).
3. В панели регистратора домена / Cloudflare укажите предложенную запись `CNAME` или `ALIAS`:
   ```
   CNAME  @    <your-project>.up.railway.app
   CNAME  www  <your-project>.up.railway.app
   ```
4. Для бэкенда при необходимости подключите поддомен `api.marziyagold.uz`:
   ```
   CNAME  api  <your-backend>.up.railway.app
   ```
5. Обновление и продление SSL-сертификатов происходит полностью в автоматическом режиме без участия человека.

---

## 6. Миграции базы данных и начальная загрузка (Flyway)

- Миграции схемы данных запускаются автоматически при старте бэкенд-контейнера через встроенный Spring Boot Flyway runner (`classpath:db/migration`).
- Flyway сверяет контрольные суммы миграций `V1__init_schema.sql`, `V2__...` и применяет недостающие изменения транзакционно.
- При ошибке миграции контейнер завершается с ненулевым кодом выхода, а Railway автоматически сохраняет работоспособность предыдущей ревизии (Zero-Downtime Deployment).

---

## 7. Мониторинг, Логи и Обслуживание (Zero-Maintenance Operations)

1. **Просмотр логов в реальном времени:**
   В Railway Dashboard выберите сервис -> вкладка **Deployments** -> **View Logs**.
2. **Откат к предыдущей версии (Rollback):**
   При необходимости вернуться к стабильной сборке выберите предыдущий успешный деплой и нажмите **"Redeploy"** — откат занимает менее 10 секунд.
3. **Автоматический перезапуск:**
   В случае непредвиденного сбоя процесса или Out-Of-Memory, Railway мгновенно поднимает новый контейнер в соответствии с политикой `ON_FAILURE`.
4. **Резервные копии БД:**
   Railway Managed PostgreSQL автоматически создает регулярные снапшоты базы данных. Восстановление доступно в 1 клик через вкладку **Data** инстанса Postgres.
