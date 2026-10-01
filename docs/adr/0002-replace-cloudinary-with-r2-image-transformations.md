# ADR-0002: Замена Cloudinary на Cloudflare R2 + Image Transformations

- **Статус:** `Accepted`
- **Дата:** 2026-10-01 (обновлено 2026-10-02)
- **Автор:** Lead Architect
- **Связано с:** ADR-0001 (пункт 5 «Медиафайлы»)

## 1. Контекст (Context)
Сервис Cloudinary недоступен на территории Республики Узбекистан: регистрация и API-вызовы блокируются по Geo-IP, оплата узбекскими картами (Uzcard/Humo) невозможна. Это критическое препятствие для развертывания и эксплуатации проекта.

Необходима альтернатива, которая:
1. Гарантированно работает из Узбекистана без зависимости от внешних блокировок.
2. Обеспечивает динамическую нарезку изображений и конвертацию в WebP/AVIF на лету.
3. Совместима с парадигмой Zero-Maintenance (полностью managed, без VPS и Docker).
4. Минимальна по стоимости и не требует администрирования серверов.

## 2. Принятое решение (Decision)
Заменить Cloudinary на связку **Cloudflare R2** (объектное хранилище) + **Cloudflare Image Transformations** (динамический ресайз и конвертация на edge).

### Компоненты:
1. **Cloudflare R2** — S3-совместимое объектное хранилище с нулевым egress. Хранит оригиналы фотографий и видео изделий. Бэкенд взаимодействует через стандартный AWS S3 SDK (`software.amazon.awssdk:s3`).
2. **Cloudflare Image Transformations** — обработка изображений на edge-серверах Cloudflare: ресайз, обрезка, конвертация в WebP/AVIF на лету по URL-параметрам (`/cdn-cgi/image/width=600,format=auto/...`).
3. **Cloudflare CDN** — автоматическое кэширование трансформированных изображений на edge. DNS и CDN через Cloudflare (Free Plan).

### Интеграция с бэкендом:
- Spring Boot использует стандартный **AWS S3 SDK** (`software.amazon.awssdk:s3`) для генерации presigned PUT URL.
- Загрузка файлов выполняется **напрямую из браузера** в R2 через presigned URL (бэкенд не проксирует файлы).
- Зависимость `com.cloudinary:cloudinary-http44` удаляется.
- `CloudinaryService` заменяется на `MediaStorageService`, работающий по протоколу S3 c R2 endpoint.

### Интеграция с фронтендом:
- В `next.config.ts` устанавливается `loader: "custom"` + `loaderFile: "./imageLoader.ts"`.
- Custom loader генерирует Cloudflare Image Transformation URL: `/cdn-cgi/image/width=W,quality=Q,format=auto/PATH`.
- Компонент `next/image` работает штатно, используя custom loader.

### Хранение в БД:
- `product_image.url` — R2 object path (e.g., `products/42/uuid.jpg`).
- `product_image.public_id` — R2 object key (совпадает с `url`, сохранён для обратной совместимости).
- Фронтенд формирует полный URL с трансформацией через custom loader.

## 3. Последствия (Consequences)

### Плюсы:
- **100% доступность:** Cloudflare не блокирует Узбекистан. Оплата Visa/Mastercard.
- **$0 egress:** R2 не взимает плату за исходящий трафик — в отличие от AWS S3, Google Cloud Storage.
- **Zero-Maintenance:** Полностью managed-сервис. Нет VPS, нет Docker, нет обновлений ОС, нет сертификатов, нет мониторинга дисков.
- **Нет SPOF на своей стороне:** Данные реплицированы внутри Cloudflare. Медиа доступны даже при падении Railway (бэкенда).
- **Низкая стоимость:** $0.015/ГБ хранение, 5,000 бесплатных трансформаций/мес, $0 egress. Итого ~$6–18/мес за весь медиа-стек.
- **Низкий vendor lock-in на уровне storage:** R2 использует стандартный S3 API. Миграция через `rclone sync` за часы.
- **Edge-обработка изображений:** Трансформации выполняются на ближайшем PoP Cloudflare, а не на вашем сервере. Latency < 50ms для cache hit.

### Минусы / Компромиссы:
- **Средний vendor lock-in на уровне трансформаций:** URL формат `/cdn-cgi/image/...` — проприетарный. При миграции потребуется переписать custom loader (~15 строк) и поднять альтернативу (imgproxy и т.д.).
- **Лимит 5,000 трансформаций/мес (Free):** При превышении новые трансформации возвращают ошибку 9422. Решение: фиксация breakpoints (120, 400, 800, 1600px) и `format=auto`. При росте — $0.50/1000 доп. трансформаций.
- **Cloudflare ToS ограничивает проксирование видео через CDN:** Большой объём видеотрафика через proxied-домен нарушает Terms of Service. Решение: видео отдается напрямую из R2 public URL без проксирования, либо через DNS-only поддомен.
- **Единый вендор:** Storage, CDN, DNS, трансформации — всё Cloudflare. Глобальный сбой CF = недоступность медиа (вероятность крайне низкая — 99.99% uptime в истории).

## 4. Рассмотренные альтернативы (Alternatives Considered)

| Альтернатива | Причина отклонения |
|---|---|
| **Cloudinary** | Недоступен на территории Республики Узбекистан (блокировка Geo-IP, невозможность оплаты Uzcard/Humo). |
| **VPS + MinIO + imgproxy** | Работоспособно, но нарушает парадигму Zero-Maintenance: требует DevOps (Docker, firewall, certbot, backup cron, мониторинг). VPS = SPOF. Дороже на $5–10/мес. |
| **ImageKit.io** | SaaS-аналог Cloudinary. Доступен из РУз, но зависимость от стороннего облака с оплатой в валюте и проприетарным API. |
| **Yandex Object Storage** | Проблемы с оплатой из Узбекистана, нет встроенных трансформаций, юридические риски (данные в России). |

## 5. Переменные окружения (Environment Variables)

Вместо `CLOUDINARY_*` теперь используются:

```env
# Cloudflare R2 (S3-compatible storage)
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<access-key>
R2_SECRET_ACCESS_KEY=<secret-key>
R2_BUCKET=marziya-media
R2_REGION=auto

# Cloudflare Image Transformations (настройка через Cloudflare Dashboard)
# Фронтенд использует NEXT_PUBLIC_MEDIA_URL для формирования URL трансформаций
NEXT_PUBLIC_MEDIA_URL=https://media.marziyagold.uz
```

## 6. Схема доступа (Access Control)

| Компонент | Credentials | Permissions |
|---|---|---|
| **Spring Boot (backend)** | R2 API Token | Object Read & Write (bucket: `marziya-media`) |
| **Browser (upload)** | Presigned PUT URL (TTL 15 мин) | Только PUT конкретного object key |
| **CF Image Transformations** | Автоматический (через custom domain) | Read-only (через CF proxy) |
| **R2 Bucket** | Private | Public access только через custom domain (`media.marziyagold.uz`) |
