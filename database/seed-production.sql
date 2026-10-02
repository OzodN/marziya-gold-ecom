-- ==============================================================================
-- Marziya Gold Jewelry E-Catalog: Production Seed & Reference Data Script
-- ==============================================================================
-- Purpose:
--   1. Ensures PostgreSQL extension 'pg_trgm' is enabled.
--   2. Seeds default Administrator credentials (BCrypt hash for 'admin123').
--   3. Seeds baseline jewelry categories, stone types, and characteristic keys.
--   4. Seeds initial workshop contacts and studio about text.
--   5. Seeds sample luxury catalog items with characteristics and stone relations.
--   6. Idempotent: Can be run multiple times safely (ON CONFLICT DO NOTHING / UPDATE).
--
-- Usage:
--   - Automatically applied by Flyway on startup via V1 and V2 migrations.
--   - For manual database bootstrapping or staging reset via psql:
--       psql "$DATABASE_URL" -f database/seed-production.sql
-- ==============================================================================

-- 1. Enable pg_trgm for fuzzy catalog search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Default Administrator Account
-- Username: admin
-- Default Password: admin123 (Hash: $2a$10$w/FMJOqbE0MrxTHXuPckROTcGAEhxDOXEfO8/J0ypYi7NWxnX1Coy)
-- NOTE: Immediately rotate this password via the Admin Settings UI upon first login!
INSERT INTO admin_user (username, password_hash, role)
VALUES ('admin', '$2a$10$w/FMJOqbE0MrxTHXuPckROTcGAEhxDOXEfO8/J0ypYi7NWxnX1Coy', 'ADMIN')
ON CONFLICT (username) DO NOTHING;

-- 3. Jewelry Categories
INSERT INTO category (name, slug, sort_order, is_visible) VALUES
('Кольца', 'koltsa', 1, true),
('Серьги', 'sergi', 2, true),
('Браслеты', 'braslety', 3, true),
('Колье и подвески', 'kolye-i-podveski', 4, true),
('Броши', 'broshi', 5, true)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible;

-- 4. Global Characteristic Keys
INSERT INTO characteristic_key (name, sort_order, is_filterable) VALUES
('Металл', 1, true),
('Проба', 2, true),
('Вес изделия', 3, false),
('Размер', 4, true),
('Покрытие', 5, false)
ON CONFLICT (name) DO UPDATE 
SET sort_order = EXCLUDED.sort_order,
    is_filterable = EXCLUDED.is_filterable;

-- 5. Gemstone / Mineral Types
INSERT INTO stone_type (name, is_active) VALUES
('Бриллиант', true),
('Сапфир', true),
('Изумруд', true),
('Рубин', true),
('Жемчуг', true),
('Топаз', true)
ON CONFLICT (name) DO UPDATE 
SET is_active = EXCLUDED.is_active;

-- 6. Studio & Workshop Contact Settings
INSERT INTO site_setting (key, value) VALUES
('contact_phone', '+998 90 123 45 67'),
('contact_telegram', 'marziyagold'),
('master_name', 'Марзия'),
('about_text', 'Авторская ювелирная мастерская Marziya Gold. Создание уникальных драгоценных украшений ручной работы в единственном экземпляре.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 7. Sample Catalog Items
-- 7.1. Кольцо «Сияние Востока» с бриллиантом
INSERT INTO product (id, sku, name, slug, description, category_id, is_visible, characteristics, created_at, updated_at)
VALUES (
    1,
    'MG-R-001',
    'Кольцо «Сияние Востока» с бриллиантом',
    'koltso-siyanie-vostoka-s-brilliantom',
    'Эксклюзивное авторское кольцо ручной работы из желтого золота с центральным чистейшим бриллиантом классической огранки.',
    (SELECT id FROM category WHERE slug = 'koltsa'),
    true,
    '[{"name": "Металл", "value": "Желтое золото"}, {"name": "Проба", "value": "585"}, {"name": "Вес изделия", "value": "4.85 г"}, {"name": "Размер", "value": "17.5"}]'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (sku) DO NOTHING;

-- 7.2. Серьги «Бухарская роза» с изумрудами
INSERT INTO product (id, sku, name, slug, description, category_id, is_visible, characteristics, created_at, updated_at)
VALUES (
    2,
    'MG-E-002',
    'Серьги «Бухарская роза» с изумрудами',
    'sergi-buharskaya-roza-s-izumrudami',
    'Изящные серьги ручной работы с натуральными колумбийскими изумрудами насыщенного зеленого оттенка в обрамлении золотых лепестков.',
    (SELECT id FROM category WHERE slug = 'sergi'),
    true,
    '[{"name": "Металл", "value": "Белое золото"}, {"name": "Проба", "value": "750"}, {"name": "Вес изделия", "value": "6.20 г"}]'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (sku) DO NOTHING;

-- 7.3. Браслет «Царица Самарканда»
INSERT INTO product (id, sku, name, slug, description, category_id, is_visible, characteristics, created_at, updated_at)
VALUES (
    3,
    'MG-B-003',
    'Браслет «Царица Самарканда»',
    'braslet-tsaritsa-samarkanda',
    'Массивный жесткий браслет с авторской гравировкой, филигранью и россыпью сапфиров глубокого синего цвета.',
    (SELECT id FROM category WHERE slug = 'braslety'),
    true,
    '[{"name": "Металл", "value": "Красное золото"}, {"name": "Проба", "value": "585"}, {"name": "Вес изделия", "value": "14.50 г"}, {"name": "Размер", "value": "18.0"}]'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (sku) DO NOTHING;

-- 7.4. Подвеска «Звезда Улугбека» с рубином
INSERT INTO product (id, sku, name, slug, description, category_id, is_visible, characteristics, created_at, updated_at)
VALUES (
    4,
    'MG-P-004',
    'Подвеска «Звезда Улугбека» с рубином',
    'podveska-zvezda-ulugbeka-s-rubinom',
    'Кулон тончайшей ювелирной работы, вдохновленный созвездиями и восточной астрономией, с природным бирманским рубином.',
    (SELECT id FROM category WHERE slug = 'kolye-i-podveski'),
    true,
    '[{"name": "Металл", "value": "Желтое золото"}, {"name": "Проба", "value": "585"}, {"name": "Вес изделия", "value": "3.90 г"}]'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (sku) DO NOTHING;

-- 7.5. Кольцо «Амир» с черным ониксом
INSERT INTO product (id, sku, name, slug, description, category_id, is_visible, characteristics, created_at, updated_at)
VALUES (
    5,
    'MG-R-005',
    'Кольцо «Амир» с черным ониксом',
    'koltso-amir-s-chernym-oniksom',
    'Статусная печатка ручной работы с контрастной геометрией, полированным ониксом и акцентными дорожками бриллиантов.',
    (SELECT id FROM category WHERE slug = 'koltsa'),
    true,
    '[{"name": "Металл", "value": "Белое золото"}, {"name": "Проба", "value": "750"}, {"name": "Вес изделия", "value": "9.10 г"}, {"name": "Размер", "value": "20.0"}]'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (sku) DO NOTHING;

-- 7.6. Серьги «Жемчужная симфония»
INSERT INTO product (id, sku, name, slug, description, category_id, is_visible, characteristics, created_at, updated_at)
VALUES (
    6,
    'MG-E-006',
    'Серьги «Жемчужная симфония»',
    'sergi-zhemchuzhnaya-simfoniya',
    'Вечерние длинные серьги с барочным морским жемчугом редкой каплевидной формы и кристаллами чистейших топазов.',
    (SELECT id FROM category WHERE slug = 'sergi'),
    true,
    '[{"name": "Металл", "value": "Желтое золото"}, {"name": "Проба", "value": "585"}, {"name": "Вес изделия", "value": "5.40 г"}]'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (sku) DO NOTHING;

-- Synchronize sequence
SELECT setval('product_id_seq', COALESCE((SELECT MAX(id) FROM product), 1));

-- 8. Product Images (Cloudflare R2 Compatible with Fallback)
INSERT INTO product_image (product_id, url, public_id, sort_order) VALUES
(1, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80', 'seed/ring_east_1', 0),
(1, 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80', 'seed/ring_east_2', 1),
(2, 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=80', 'seed/earrings_bukhara_1', 0),
(3, 'https://images.unsplash.com/photo-1611591475155-42646b5a371c?auto=format&fit=crop&w=1000&q=80', 'seed/bracelet_samarkand_1', 0),
(4, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80', 'seed/pendant_star_1', 0),
(5, 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=1000&q=80', 'seed/ring_amir_1', 0),
(6, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80', 'seed/earrings_pearl_1', 0)
ON CONFLICT DO NOTHING;

-- 9. Product Stones (Gemstone composition)
INSERT INTO product_stone (product_id, stone_type_id, sort_order, characteristics) VALUES
(1, (SELECT id FROM stone_type WHERE name = 'Бриллиант'), 0, '[{"name": "Количество", "value": "1"}, {"name": "Вес", "value": "0.50 ct"}, {"name": "Огранка", "value": "Круглая (57 граней)"}]'::jsonb),
(2, (SELECT id FROM stone_type WHERE name = 'Изумруд'), 0, '[{"name": "Количество", "value": "2"}, {"name": "Вес", "value": "1.20 ct"}, {"name": "Происхождение", "value": "Колумбия"}]'::jsonb),
(3, (SELECT id FROM stone_type WHERE name = 'Сапфир'), 0, '[{"name": "Количество", "value": "12"}, {"name": "Вес", "value": "2.40 ct"}]'::jsonb),
(4, (SELECT id FROM stone_type WHERE name = 'Рубин'), 0, '[{"name": "Количество", "value": "1"}, {"name": "Вес", "value": "0.85 ct"}]'::jsonb),
(5, (SELECT id FROM stone_type WHERE name = 'Бриллиант'), 0, '[{"name": "Количество", "value": "8"}, {"name": "Вес", "value": "0.24 ct"}]'::jsonb),
(6, (SELECT id FROM stone_type WHERE name = 'Жемчуг'), 0, '[{"name": "Количество", "value": "2"}, {"name": "Тип", "value": "Морской барочный"}]'::jsonb),
(6, (SELECT id FROM stone_type WHERE name = 'Топаз'), 1, '[{"name": "Количество", "value": "4"}, {"name": "Вес", "value": "0.60 ct"}]'::jsonb)
ON CONFLICT DO NOTHING;
