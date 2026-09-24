# Архитектурная модель данных (Database Architecture Model)

> **ВНИМАНИЕ (Source of Truth Notice):**
> Данный документ является **производным описанием** архитектуры базы данных.
> Единственным каноническим источником истины для схемы являются SQL-миграции Flyway в:
> `apps/backend/src/main/resources/db/migration/`
> Создание competing DDL файлов в этой директории строго запрещено.

---

## 1. СУБД и конфигурация
- **СУБД:** PostgreSQL 16+ (Managed PaaS: Neon / Supabase).
- **Расширения:** `pg_trgm` (для триграммного нечеткого поиска по названию и артикулу).
- **Кодировка:** UTF-8.

---

## 2. Ключевые таблицы

### 2.1. `admin_user`
- `id` (BIGSERIAL PK)
- `username` (VARCHAR(50) UNIQUE NOT NULL)
- `password_hash` (VARCHAR(255) NOT NULL) — BCrypt
- `role` (VARCHAR(20) NOT NULL DEFAULT 'ADMIN')
- `created_at` (TIMESTAMP NOT NULL DEFAULT NOW())

### 2.2. `category`
- `id` (BIGSERIAL PK)
- `name` (VARCHAR(100) NOT NULL)
- `slug` (VARCHAR(120) UNIQUE NOT NULL)
- `sort_order` (INT NOT NULL DEFAULT 0)
- `is_visible` (BOOLEAN NOT NULL DEFAULT TRUE)
- `created_at` (TIMESTAMP NOT NULL DEFAULT NOW())

### 2.3. `characteristic_key` (Глобальный справочник ключей)
- `id` (BIGSERIAL PK)
- `name` (VARCHAR(100) UNIQUE NOT NULL) — например: "Проба", "Металл", "Вес"
- `sort_order` (INT NOT NULL DEFAULT 0)
- `is_filterable` (BOOLEAN NOT NULL DEFAULT TRUE)

### 2.4. `stone_type` (Справочник типов камней)
- `id` (BIGSERIAL PK)
- `name` (VARCHAR(100) UNIQUE NOT NULL) — например: "Бриллиант", "Сапфир"
- `is_active` (BOOLEAN NOT NULL DEFAULT TRUE)

### 2.5. `product`
- `id` (BIGSERIAL PK)
- `sku` (VARCHAR(50) UNIQUE NOT NULL)
- `name` (VARCHAR(255) NOT NULL)
- `slug` (VARCHAR(280) UNIQUE NOT NULL)
- `description` (TEXT)
- `category_id` (BIGINT REFERENCES category(id) ON DELETE RESTRICT)
- `is_visible` (BOOLEAN NOT NULL DEFAULT TRUE)
- `characteristics` (JSONB NOT NULL DEFAULT '[]') — массив объектов `{"name": "...", "value": "..."}`
- `created_at` (TIMESTAMP NOT NULL DEFAULT NOW())
- `updated_at` (TIMESTAMP NOT NULL DEFAULT NOW())

**Индексы:**
- `CREATE INDEX idx_product_characteristics ON product USING gin (characteristics);`
- `CREATE INDEX idx_product_trgm ON product USING gin (name gin_trgm_ops, sku gin_trgm_ops);`
- `CREATE INDEX idx_product_category ON product (category_id);`
- `CREATE INDEX idx_product_visible ON product (is_visible);`

### 2.6. `product_image`
- `id` (BIGSERIAL PK)
- `product_id` (BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE)
- `url` (VARCHAR(1000) NOT NULL) — Cloudinary URL
- `public_id` (VARCHAR(255)) — Cloudinary public_id
- `sort_order` (INT NOT NULL DEFAULT 0)

### 2.7. `product_stone`
- `id` (BIGSERIAL PK)
- `product_id` (BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE)
- `stone_type_id` (BIGINT NOT NULL REFERENCES stone_type(id) ON DELETE RESTRICT)
- `sort_order` (INT NOT NULL DEFAULT 0)
- `characteristics` (JSONB NOT NULL DEFAULT '[]') — массив `{"name": "...", "value": "..."}`

**Индексы:**
- `CREATE INDEX idx_product_stone_characteristics ON product_stone USING gin (characteristics);`
- `CREATE INDEX idx_product_stone_product ON product_stone (product_id);`
- `CREATE INDEX idx_product_stone_stone_type ON product_stone (stone_type_id);`

### 2.8. `inquiry`
- `id` (BIGSERIAL PK)
- `client_name` (VARCHAR(100) NOT NULL)
- `client_phone` (VARCHAR(30) NOT NULL)
- `comment` (TEXT)
- `status` (VARCHAR(20) NOT NULL DEFAULT 'NEW') — `NEW`, `CONTACTED`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`
- `created_at` (TIMESTAMP NOT NULL DEFAULT NOW())
- `updated_at` (TIMESTAMP NOT NULL DEFAULT NOW())

**Индексы:**
- `CREATE INDEX idx_inquiry_status ON inquiry (status);`
- `CREATE INDEX idx_inquiry_created ON inquiry (created_at DESC);`

### 2.9. `inquiry_item`
- `id` (BIGSERIAL PK)
- `inquiry_id` (BIGINT NOT NULL REFERENCES inquiry(id) ON DELETE CASCADE)
- `product_id` (BIGINT REFERENCES product(id) ON DELETE SET NULL)
- `quantity` (INT NOT NULL DEFAULT 1)
- `product_snapshot` (JSONB NOT NULL) — полный неизменяемый слепок изделия

### 2.10. `inquiry_status_history`
- `id` (BIGSERIAL PK)
- `inquiry_id` (BIGINT NOT NULL REFERENCES inquiry(id) ON DELETE CASCADE)
- `old_status` (VARCHAR(20))
- `new_status` (VARCHAR(20) NOT NULL)
- `changed_by` (VARCHAR(50) NOT NULL)
- `changed_at` (TIMESTAMP NOT NULL DEFAULT NOW())

### 2.11. `site_setting`
- `id` (BIGSERIAL PK)
- `key` (VARCHAR(50) UNIQUE NOT NULL)
- `value` (TEXT NOT NULL)
