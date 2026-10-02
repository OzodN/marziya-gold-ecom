# Руководство по передаче и эксплуатации проекта (Zero-Maintenance Handover)

> **Статус проекта:** Полная готовность к промышленной эксплуатации (Production Ready).  
> **Архитектурная модель:** (Zero-Maintenance, Managed Cloud, No VPS/Self-Hosted).  
> **Дата финализации:** Октябрь 2026.

---

## 1. Концепция и архитектура

Веб-каталог авторских ювелирных изделий **Marziya Gold** спроектирован так, чтобы после передачи заказчику **не требовалось системное администрирование**:
- **Нет физических или виртуальных серверов (No Bare-Metal / No VPS):** вам не нужно обновлять Linux, конфигурировать Nginx, следить за свободным местом на дисках или настраивать фаерволы.
- **Полностью управляемая инфраструктура (Managed PaaS):**
  - **Railway PaaS:** автоматический билд из GitHub, самовосстановление контейнеров при сбоях (auto-restart), автоматические SSL-сертификаты.
  - **Managed PostgreSQL:** репликация, пулинг соединений HikariCP, автоматические ежедневные snapshot-бэкапы.
  - **Cloudflare R2 + CDN:** объектное хранилище медиафайлов с нулевой стоимостью исходящего трафика ($0 egress) и автоматической трансформацией фото на edge.
- **Прогнозируемый бюджет:** ~$6–18 в месяц за всю инфраструктуру (в зависимости от посещаемости).

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
    |  (Next.js Standalone)|                    |  (Spring Boot 4 / JRE|
    |      Port: 3000      |                    |      Port: 8080      |
    +----------+-----------+                    +----------+-----------+
               |                                           |
               | (Private Network: .railway.internal)      |
               +------------------------------------------>|
                                                           v
                                                +----------------------+
                                                |   Railway Managed    |
                                                |      PostgreSQL      |
                                                |  (Automated Backups) |
                                                +----------------------+
```

---

## 2. Экспресс-запуск проекта (Quick Start Checklist)

### Шаг 1. Настройка Cloudflare (DNS, SSL, R2)
1. Добавьте ваш домен (например, `marziyagold.uz`) в аккаунт [Cloudflare](https://dash.cloudflare.com).
2. В разделе **SSL/TLS** установите режим шифрования: **Full (Strict)**.
3. В разделе **R2 Object Storage**:
   - Нажмите **Create Bucket**, назовите бакет `marziya-media`.
   - В настройках бакета (Settings -> Public Access) подключите Custom Domain: `media.marziyagold.uz`.
   - В разделе **CORS Policy** бакета вставьте разрешающие правила для загрузки из браузера:
     ```json
     [
       {
         "AllowedOrigins": ["https://marziyagold.uz", "https://*.marziyagold.uz", "http://localhost:3000"],
         "AllowedMethods": ["GET", "PUT", "HEAD"],
         "AllowedHeaders": ["*"],
         "ExposeHeaders": ["ETag"],
         "MaxAgeSeconds": 3600
       }
     ]
     ```
   - В разделе **Manage R2 API Tokens** создайте токен с правами `Object Read & Write` для бакета `marziya-media`. Сохраните:
     - `Access Key ID`
     - `Secret Access Key`
     - `Endpoint` (формат: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`)

---

### Шаг 2. Развертывание в Railway PaaS
1. Зарегистрируйтесь на [Railway.app](https://railway.app) и создайте **New Project** -> **Deploy from GitHub repo** (`marziya-gold_ecom`).
2. Добавьте базу данных: нажмите **+ New** -> **Database** -> **Add PostgreSQL**.
3. Настройте сервис **Backend**:
   - Откройте сервис бэкенда -> перейдите во вкладку **Settings** -> раздел **General**.
   - **ОБЯЗАТЕЛЬНО:** В поле **Root Directory** укажите `/apps/backend` (или `apps/backend`) и нажмите Save.
   - Railway автоматически обнаружит `apps/backend/Dockerfile` и `apps/backend/railway.toml`.
   - Во вкладке **Variables** задайте переменные окружения:

| Переменная | Значение / Формат | Описание |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` | Активация боевого профиля `application-prod.yml` |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}?sslmode=require` | Строка подключения к БД |
| `SPRING_DATASOURCE_USERNAME` | `${{Postgres.PGUSER}}` | Логин к БД |
| `SPRING_DATASOURCE_PASSWORD` | `${{Postgres.PGPASSWORD}}` | Пароль к БД |
| `JWT_SECRET` | *Строка от 32 символов (сгенерируйте `openssl rand -hex 32`)* | Секретный ключ подписи JWT |
| `CORS_ALLOWED_ORIGINS` | `https://marziyagold.uz,https://www.marziyagold.uz` | Разрешенные домены фронтенда |
| `R2_ENDPOINT` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` | R2 S3 Endpoint |
| `R2_ACCESS_KEY_ID` | `<ваш-access-key-id>` | Ключ R2 |
| `R2_SECRET_ACCESS_KEY` | `<ваш-secret-access-key>` | Секрет R2 |
| `R2_BUCKET` | `marziya-media` | Имя бакета R2 |
| `NEXT_PUBLIC_MEDIA_URL` | `https://media.marziyagold.uz` | Публичный CDN-домен медиа |

4. Создайте и настройте сервис **Frontend**:
   - Нажмите **+ New** -> **GitHub Repo** -> выберите репозиторий `marziya-gold_ecom`.
   - Откройте созданный сервис -> перейдите во вкладку **Settings** -> раздел **General**.
   - **ОБЯЗАТЕЛЬНО:** В поле **Root Directory** укажите `/apps/frontend` (или `apps/frontend`) и нажмите Save.
   - Railway автоматически обнаружит `apps/frontend/Dockerfile` и `apps/frontend/railway.toml`.
   - Во вкладке **Variables** задайте:

| Переменная | Значение | Описание |
|---|---|---|
| `NODE_ENV` | `production` | Продовый режим Node.js |
| `PORT` | `3000` | Порт приложения |
| `INTERNAL_API_URL` | `http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:8080` | Внутренний приватный адрес бэкенда |
| `NEXT_PUBLIC_API_URL` | `/api/backend` | Клиентский прокси-путь |
| `NEXT_PUBLIC_MEDIA_URL` | `https://media.marziyagold.uz` | URL медиа-трансформаций |

5. В настройках **Custom Domains** привяжите:
   - Frontend: `marziyagold.uz`
   - Backend: `api.marziyagold.uz` (или используйте встроенный Next.js rewrite без отдельного поддомена)

---

### Шаг 3. Первый вход мастера и ротация паролей
1. При первом старте база данных **автоматически накатит схему и стартовые справочники** через Flyway.
2. Перейдите по адресу: `https://marziyagold.uz/admin/login`.
3. Учетные данные по умолчанию:
   - **Логин:** `admin`
   - **Пароль:** `admin123`
4. **КРИТИЧЕСКИ ВАЖНО:** Сразу после первого входа перейдите в **«Настройки»** (`/admin/settings`) и смените пароль администратора на уникальный и надежный.
5. Проверьте актуальность контактов мастера (телефон, Telegram).

---

## 3. Модель безопасности (Zero-Trust)

1. **Защита токенов:** JWT токен мастера передается и хранится строго в куке `access_token` с флагами `HttpOnly`, `SameSite=Strict`, `Secure`. Доступ к токену из клиентского JavaScript (XSS-атаки) технически невозможен.
2. **Защита от спама и перегрузки (Rate Limiting):** Публичный эндпоинт отправки заявок защищен ограничителем Bucket4j (не более 5 заявок в минуту с одного IP).
3. **Прямая загрузка медиа (Zero-Egress Direct Upload):** Браузер загружает фото напрямую в Cloudflare R2 по одноразовому Presigned PUT URL. Бэкенд не пропускает тяжелые файлы через свой трафик и память.

---

## 4. Резервное копирование и восстановление (Disaster Recovery)

- **PostgreSQL:** Railway выполняет автоматические ежедневные бэкапы инстанса базы данных с возможностью отката в панели управления в 1 клик.
- **Ручной дамп БД:**
  ```bash
  # Создание резервной копии
  pg_dump "$DATABASE_URL" -F c -b -v -f marziya_backup.dump

  # Восстановление из дампа
  pg_restore -d "$DATABASE_URL" -v marziya_backup.dump
  ```
- **Медиафайлы:** Все оригиналы фото сохраняются в Cloudflare R2 (хранилище с 99.999999999% надежности и гео-распределением).

---

## 5. Документация для разработчиков и операторов

Подробные инструкции, регламенты и технические описания расположены в каталоге `docs/`:
- **Подробное руководство оператора:** [`docs/operations/zero-maintenance-guide.md`](file:///D:/ozod/coding/java/projects/marziya-gold_ecom/docs/operations/zero-maintenance-guide.md)
- **Руководство по развертыванию на Railway:** [`infra/railway-deployment.md`](file:///D:/ozod/coding/java/projects/marziya-gold_ecom/infra/railway-deployment.md)
- **Схема базы данных:** [`database/schema-model.md`](file:///D:/ozod/coding/java/projects/marziya-gold_ecom/database/schema-model.md)
- **Скрипт начального сидирования:** [`database/seed-production.sql`](file:///D:/ozod/coding/java/projects/marziya-gold_ecom/database/seed-production.sql)
- **Контракт API (OpenAPI 3.0):** [`docs/api/openapi.yaml`](file:///D:/ozod/coding/java/projects/marziya-gold_ecom/docs/api/openapi.yaml)
- **Архитектурные решения:** [`docs/adr/`](file:///D:/ozod/coding/java/projects/marziya-gold_ecom/docs/adr/)
