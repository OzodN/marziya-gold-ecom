-- Flyway Migration V1: Initial Database Schema
-- DBMS: PostgreSQL 16+
-- Project: Marziya Gold Master Jewelry Catalog (marziya-gold_ecom)

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- 2. MASTER & SECURITY TABLES
-- ============================================================================

-- Admin User: Master credentials for admin portal access
CREATE TABLE IF NOT EXISTS admin_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. CATALOG & ATTRIBUTE DICTIONARIES
-- ============================================================================

-- Category: Product grouping (e.g. Rings, Necklaces, Earrings, Bracelets)
CREATE TABLE IF NOT EXISTS category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    sort_order INT NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Characteristic Key: Global registry of product attribute names to prevent duplicates/typos
CREATE TABLE IF NOT EXISTS characteristic_key (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    sort_order INT NOT NULL DEFAULT 0,
    is_filterable BOOLEAN NOT NULL DEFAULT TRUE
);

-- Stone Type: Global registry of gemstone types (e.g. Diamond, Sapphire, Ruby, Emerald)
CREATE TABLE IF NOT EXISTS stone_type (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================================
-- 4. PRODUCTS & ASSOCIATED ENTITIES
-- ============================================================================

-- Product: Core jewelry catalog item
CREATE TABLE IF NOT EXISTS product (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(280) NOT NULL UNIQUE,
    description TEXT,
    category_id BIGINT REFERENCES category(id) ON DELETE RESTRICT,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    characteristics JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Product Image: Cloudinary-backed image assets for product gallery
CREATE TABLE IF NOT EXISTS product_image (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    public_id VARCHAR(255),
    sort_order INT NOT NULL DEFAULT 0
);

-- Product Stone: Gemstone inserts per jewelry piece with dynamic parameters
CREATE TABLE IF NOT EXISTS product_stone (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    stone_type_id BIGINT NOT NULL REFERENCES stone_type(id) ON DELETE RESTRICT,
    sort_order INT NOT NULL DEFAULT 0,
    characteristics JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- ============================================================================
-- 5. INQUIRIES & AUDIT LOGS
-- ============================================================================

-- Inquiry: Customer order request initiated from the selection basket
CREATE TABLE IF NOT EXISTS inquiry (
    id BIGSERIAL PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL,
    client_phone VARCHAR(30) NOT NULL,
    comment TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'NEW',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Inquiry Item: Immutable item reference inside inquiry with full JSON snapshot
CREATE TABLE IF NOT EXISTS inquiry_item (
    id BIGSERIAL PRIMARY KEY,
    inquiry_id BIGINT NOT NULL REFERENCES inquiry(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES product(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    product_snapshot JSONB NOT NULL
);

-- Inquiry Status History: Status change timeline and audit record
CREATE TABLE IF NOT EXISTS inquiry_status_history (
    id BIGSERIAL PRIMARY KEY,
    inquiry_id BIGINT NOT NULL REFERENCES inquiry(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. SYSTEM SETTINGS
-- ============================================================================

-- Site Setting: Key-value store for contact details and master profile
CREATE TABLE IF NOT EXISTS site_setting (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(50) NOT NULL UNIQUE,
    value TEXT NOT NULL
);

-- ============================================================================
-- 7. INDEXES
-- ============================================================================

-- GIN index for dynamic product attributes
CREATE INDEX IF NOT EXISTS idx_product_characteristics ON product USING gin (characteristics);

-- GIN index for dynamic stone attributes
CREATE INDEX IF NOT EXISTS idx_product_stone_characteristics ON product_stone USING gin (characteristics);

-- GIN pg_trgm index for fuzzy text search across product name and SKU
CREATE INDEX IF NOT EXISTS idx_product_trgm ON product USING gin (name gin_trgm_ops, sku gin_trgm_ops);

-- B-Tree indexes for product lookups and filtering
CREATE INDEX IF NOT EXISTS idx_product_category ON product (category_id);
CREATE INDEX IF NOT EXISTS idx_product_visible ON product (is_visible);

-- B-Tree indexes for foreign key cascading and joins
CREATE INDEX IF NOT EXISTS idx_product_image_product ON product_image (product_id);
CREATE INDEX IF NOT EXISTS idx_product_stone_product ON product_stone (product_id);
CREATE INDEX IF NOT EXISTS idx_product_stone_stone_type ON product_stone (stone_type_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_item_inquiry ON inquiry_item (inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_item_product ON inquiry_item (product_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_status_history_inquiry ON inquiry_status_history (inquiry_id);

-- B-Tree indexes for inquiry status filtering and chronological sorting
CREATE INDEX IF NOT EXISTS idx_inquiry_status ON inquiry (status);
CREATE INDEX IF NOT EXISTS idx_inquiry_created ON inquiry (created_at DESC);
