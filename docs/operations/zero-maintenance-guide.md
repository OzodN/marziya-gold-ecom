# Руководство по промышленной эксплуатации (Zero-Maintenance Operations Guide)

- **Проект:** Marziya Gold Jewelry E-Catalog
- **Версия:** 1.0.0 (Production Release)
- **Модель сопровождения:** Zero-Maintenance («Сдал и забыл»)
- **Дата утверждения:** Октябрь 2026

---

## 1. Архитектурные принципы Zero-Maintenance

Цель парадигмы «Сдал и забыл» — устранить необходимость в штатном системном администраторе или DevOps-инженере после запуска:
1. **Никаких VPS / Bare-Metal:** Отсутствуют операционные системы, требующие патчей безопасности, фаерволы, iptables, swap и ручные cron-задачи.
2. **Managed PaaS (Railway):** Все контейнеры упакованы в multi-stage образы, запускаются в изолированных cgroups, обладают встроенными healthcheck-пробами и автоматически перезапускаются при сбоях.
3. **Managed Database (PostgreSQL):** СУБД администрируется платформой Railway: автоматическое выделение ресурсов, ежедневные снимки (snapshots), мониторинг соединений.
4. **Managed Storage & CDN (Cloudflare):**
   - **R2:** объектное хранилище S3-типа с гео-распределенной надежностью (11 девяток — 99.999999999%).
   - **$0 Egress:** Cloudflare не взимает плату за скачивание файлов, устраняя риск непредсказуемых счетов при вирусном росте трафика.
   - **Edge Image Transformations:** нарезка и оптимизация картинок на лету (WebP/AVIF) на ближайшем PoP Cloudflare.
5. **Внутренняя сеть (Private Networking):** Frontend общается с Backend по защищенному внутреннему протоколу Railway (`http://backend.railway.internal:8080`), не расходуя публичный трафик.

---

## 2. Полная матрица переменных окружения (Production Matrix)

### 2.1. Backend Service (Spring Boot)

| Переменная | Обязательность | Значение по умолчанию | Пример для Production | Назначение |
|---|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Обязательно | `default` | `prod` | Активирует профиль `application-prod.yml` |
| `PORT` | Обязательно | `8080` | `8080` | Порт прослушивания Spring Boot |
| `SPRING_DATASOURCE_URL` | Обязательно | — | `jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}?sslmode=require` | Строка подключения к PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | Обязательно | — | `${{Postgres.PGUSER}}` | Имя пользователя базы данных |
| `SPRING_DATASOURCE_PASSWORD` | Обязательно | — | `${{Postgres.PGPASSWORD}}` | Пароль к базе данных |
| `JWT_SECRET` | Обязательно | — | `d9f82c...` (64 hex chars) | Криптографический ключ HMAC-SHA256 (>= 32 байт) |
| `JWT_EXPIRATION_MS` | Опционально | `86400000` | `86400000` | Время жизни сессии мастера (24 часа) |
| `CORS_ALLOWED_ORIGINS` | Обязательно | `*` | `https://marziyagold.uz,https://www.marziyagold.uz` | Разрешенные домены фронтенда |
| `R2_ENDPOINT` | Обязательно | — | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` | S3-эндпоинт бакета Cloudflare R2 |
| `R2_ACCESS_KEY_ID` | Обязательно | — | `<CF_R2_ACCESS_KEY_ID>` | Идентификатор ключа доступа R2 |
| `R2_SECRET_ACCESS_KEY` | Обязательно | — | `<CF_R2_SECRET_ACCESS_KEY>` | Секретный ключ доступа R2 |
| `R2_BUCKET` | Обязательно | `marziya-media` | `marziya-media` | Имя бакета для хранения фото |
| `R2_REGION` | Опционально | `auto` | `auto` | Регион Cloudflare R2 |
| `NEXT_PUBLIC_MEDIA_URL` | Обязательно | `https://media.marziyagold.uz` | `https://media.marziyagold.uz` | Публичный CDN-домен раздачи медиа |
| `DB_POOL_MAX` | Опционально | `10` | `10` | Максимальный размер пула соединений HikariCP |
| `RATE_LIMIT_CAPACITY` | Опционально | `5` | `5` | Лимит заявок с одного IP в минуту |

### 2.2. Frontend Service (Next.js)

| Переменная | Обязательность | Значение по умолчанию | Пример для Production | Назначение |
|---|---|---|---|---|
| `NODE_ENV` | Обязательно | `production` | `production` | Оптимизация сборки и рендеринга Next.js |
| `PORT` | Обязательно | `3000` | `3000` | Порт веб-сервера Node.js |
| `INTERNAL_API_URL` | Обязательно | `http://127.0.0.1:8080` | `http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:8080` | Адрес бэкенда во внутренней сети Railway |
| `NEXT_PUBLIC_API_URL` | Обязательно | `/api/backend` | `/api/backend` | Базовый путь API для клиентских вызовов |
| `NEXT_PUBLIC_MEDIA_URL` | Обязательно | `https://media.marziyagold.uz` | `https://media.marziyagold.uz` | URL медиа-домена для Cloudflare Image Loader |

---

## 3. Детальная настройка Cloudflare

### 3.1. DNS & SSL Защита
В панели Cloudflare DNS настройте записи типа CNAME, указывающие на доменные имена сервисов в Railway:
- `marziyagold.uz` (CNAME) -> `<frontend-service>.up.railway.app` (Proxy: Proxied 🟧)
- `www` (CNAME) -> `marziyagold.uz` (Proxy: Proxied 🟧)
- `media` (CNAME) -> `<r2-bucket-public-domain>.r2.dev` или автоматический Custom Domain R2 (Proxy: Proxied 🟧)

В разделе **SSL/TLS**:
- **Encryption mode:** `Full (Strict)`
- **Edge Certificates:** включить `Always Use HTTPS`, `Minimum TLS Version: 1.2`, `Opportunistic Encryption`.

### 3.2. Cloudflare R2: Политика CORS
Для успешной загрузки фото ювелирных изделий прямо из браузера мастера без проксирования через бэкенд, в бакете `marziya-media` (Settings -> CORS Policy) должен быть прописан JSON:
```json
[
  {
    "AllowedOrigins": [
      "https://marziyagold.uz",
      "https://www.marziyagold.uz",
      "https://*.up.railway.app"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### 3.3. Кэширование и трансформация изображений
- Edge Image Transformations активны автоматически при обращении к `/cdn-cgi/image/width=W,quality=Q,format=auto/...`.
- Кэширование на edge: до 30 дней для статических картинок.
- Если фото изделия было заменено, сбросить кэш можно в Cloudflare Dashboard: **Caching** -> **Configuration** -> **Purge Cache** -> **Custom Purge** (указать URL).

---

## 4. Регулярные операции мастера (Runbook)

### 4.1. Добавление нового изделия
1. Войти в админ-панель (`https://marziyagold.uz/admin/products`).
2. Нажать кнопку **«Добавить изделие»**.
3. Заполнить обязательные поля:
   - **Артикул** (например, `MG-R-104`).
   - **Название** (например, `Кольцо «Самаркандский узор»`).
   - **Категория** (выбор из выпадающего списка).
4. Загрузить фотографии:
   - Перетащить файлы или выбрать через диалог.
   - Дождаться индикации загрузки (`Загрузка 1/N...`). Фотографии загружаются напрямую в R2.
   - При необходимости упорядочить фото стрелками влево/вправо (первое фото — главное превью).
5. Заполнить характеристики (металл, проба, вес, размер) и вставки камней.
6. Нажать **«Сохранить изделие»**. Изделие мгновенно появляется на витрине.

### 4.2. Обработка входящих заявок
1. В левом меню перейти в раздел **«Заявки»** (`/admin/inquiries`).
2. Список заявок автоматически обновляется каждые 30 секунд.
3. Новые заявки помечены статусом `NEW` (золотой бейдж).
4. При клике на заявку открывается карточка с контактами клиента (имя, телефон) и списком изделий из его подборки.
5. Жизненный цикл статусов:
   - `NEW` — получена, мастер еще не звонил.
   - `CONTACTED` — мастер позвонил клиенту, обсудил детали/размер.
   - `IN_PROGRESS` — изделие отдано в производство / изготовление.
   - `COMPLETED` — изделие вручено клиенту, сделка завершена.
   - `REJECTED` — клиент отказался.

---

## 5. Экстренные ситуации и траблшутинг (Emergency Checklist)

### Ситуация 1: «Мастер забыл пароль администратора»
Поскольку почтовые сервисы для сброса паролей отключены в соответствии с Zero-Maintenance, сброс пароля выполняется через консоль Railway:
1. Зайдите в проект на [Railway.app](https://railway.app).
2. Кликните на сервис **PostgreSQL** -> вкладка **Data** (или **Query**).
3. Выполните SQL-запрос для сброса пароля на `admin123`:
   ```sql
   UPDATE admin_user 
   SET password_hash = '$2a$10$w/FMJOqbE0MrxTHXuPckROTcGAEhxDOXEfO8/J0ypYi7NWxnX1Coy'
   WHERE username = 'admin';
   ```
4. Войдите в панель с паролем `admin123` и сразу смените его на новый в `/admin/settings`.

### Ситуация 2: «Фотографии не загружаются в админке»
1. Откройте панель разработчика в браузере (F12 -> вкладка Network / Сеть).
2. Если ошибка `CORS Missing Allow Origin` при PUT-запросе к `*.r2.cloudflarestorage.com`:
   - Проверьте политику CORS в настройках бакета Cloudflare R2 (см. раздел 3.2).
3. Если ошибка `403 Forbidden` при вызове `/api/v1/admin/media/presign-upload`:
   - Проверьте переменные `R2_ACCESS_KEY_ID` и `R2_SECRET_ACCESS_KEY` в настройках бэкенда в Railway.
   - Убедитесь, что токен R2 имеет права `Object Read & Write`.

### Ситуация 3: «Клиенты жалуются на ошибку 429 при отправке заявки»
- Это штатное срабатывание защиты от спама (Bucket4j Rate Limiting).
- Лимит: не более 5 заявок в минуту с одного IP.
- Ограничение снимается автоматически через 60 секунд.

### Ситуация 4: «Бэкенд сообщает об ошибке соединения с БД»
- В настройках бэкенда в Railway убедитесь, что строка подключения использует внутренний адрес:
  `jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}?sslmode=require`
- Проверьте логи сервиса PostgreSQL в Railway: если база перезагружалась, Spring Boot с HikariCP автоматически восстановит соединение в течение 20 секунд.

---

## 6. Калькуляция затрат на инфраструктуру

| Сервис | Тариф | Примерная стоимость в месяц | Обоснование |
|---|---|---|---|
| **Railway PaaS** | Hobby / Pro ($5 base) | ~$5–12 / мес | Оплата по факту потребления CPU/RAM (бэкенд ~200МБ, фронтенд ~70МБ, база ~50МБ). |
| **Cloudflare DNS & CDN** | Free Plan | $0 / мес | Бесплатный неограниченный CDN, DDoS-защита, SSL-сертификаты. |
| **Cloudflare R2** | Pay-as-you-go | ~$0.15–1 / мес | Хранение $0.015/ГБ, $0 за исходящий трафик (egress). |
| **Cloudflare Image Transformations** | Free (5,000 трансф./мес) | $0 / мес | При кэшировании на edge бесплатных лимитов достаточно для всего каталога. |
| **Итого** | | **~$6–15 / мес** | Максимальная экономическая эффективность. |
