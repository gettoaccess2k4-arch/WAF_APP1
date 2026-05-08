-- ============================================================
--  WAFLab Database Schema & Seed Data
--  Engine: PostgreSQL 16
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Categories ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    slug       VARCHAR(100) UNIQUE NOT NULL,
    icon       VARCHAR(10)  DEFAULT '📦',
    sort_order INT          DEFAULT 0
);

-- ── Brands ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brands (
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    slug     VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT
);

-- ── Products ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    slug           VARCHAR(255) UNIQUE NOT NULL,
    description    TEXT,
    price          NUMERIC(12,2) NOT NULL,
    original_price NUMERIC(12,2),
    stock          INT           DEFAULT 0,
    category_id    INT           REFERENCES categories(id) ON DELETE SET NULL,
    brand_id       INT           REFERENCES brands(id)     ON DELETE SET NULL,
    image_url      TEXT,
    specs          JSONB         DEFAULT '{}',
    is_featured    BOOLEAN       DEFAULT false,
    created_at     TIMESTAMPTZ   DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   DEFAULT NOW()
);

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(100) UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT         NOT NULL,
    role          VARCHAR(20)  DEFAULT 'user' CHECK (role IN ('user','admin')),
    refresh_token TEXT,
    created_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Orders ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID        REFERENCES users(id) ON DELETE CASCADE,
    total            NUMERIC(12,2) NOT NULL,
    status           VARCHAR(50)  DEFAULT 'pending'
                       CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
    shipping_address JSONB,
    created_at       TIMESTAMPTZ  DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Order Items ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id          SERIAL PRIMARY KEY,
    order_id    UUID          REFERENCES orders(id)   ON DELETE CASCADE,
    product_id  INT           REFERENCES products(id) ON DELETE SET NULL,
    name        VARCHAR(255),
    price       NUMERIC(12,2),
    quantity    INT           DEFAULT 1
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand     ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_slug      ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user        ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order  ON order_items(order_id);

-- ============================================================
--  SEED DATA
-- ============================================================

-- Categories
INSERT INTO categories (name, slug, icon, sort_order) VALUES
    ('Điện thoại',          'dien-thoai',   '📱', 1),
    ('Laptop',               'laptop',        '💻', 2),
    ('Tablet',               'tablet',        '📟', 3),
    ('Phụ kiện',             'phu-kien',      '🎧', 4),
    ('Đồng hồ thông minh',  'dong-ho',       '⌚', 5)
ON CONFLICT (slug) DO NOTHING;

-- Brands
INSERT INTO brands (name, slug) VALUES
    ('Apple',   'apple'),
    ('Samsung', 'samsung'),
    ('Xiaomi',  'xiaomi'),
    ('OPPO',    'oppo'),
    ('Dell',    'dell'),
    ('Lenovo',  'lenovo')
ON CONFLICT (slug) DO NOTHING;

-- Admin user  (password: Admin@123)
INSERT INTO users (username, email, password_hash, role) VALUES
    ('admin', 'admin@admin.lab.local',
     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Regular users  (password: User@123)
INSERT INTO users (username, email, password_hash, role) VALUES
    ('alice', 'alice@shop.lab.local',
     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
    ('bob',   'bob@shop.lab.local',
     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user')
ON CONFLICT (email) DO NOTHING;

-- Products — Smartphones
INSERT INTO products (name, slug, description, price, original_price, stock, category_id, brand_id, image_url, specs, is_featured) VALUES
(
    'iPhone 15 Pro Max 256GB',
    'iphone-15-pro-max-256gb',
    'iPhone 15 Pro Max với chip A17 Pro, khung Titanium, camera 48MP ProRAW, màn hình Super Retina XDR 6.7".',
    34990000, 36990000, 45,
    (SELECT id FROM categories WHERE slug='dien-thoai'),
    (SELECT id FROM brands     WHERE slug='apple'),
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
    '{"ram":"8GB","storage":"256GB","display":"6.7 inch OLED","camera":"48MP + 12MP + 12MP","battery":"4422 mAh","os":"iOS 17"}',
    true
),
(
    'iPhone 15 128GB',
    'iphone-15-128gb',
    'iPhone 15 với Dynamic Island, chip A16 Bionic, camera 48MP, sạc USB-C.',
    22990000, 24990000, 80,
    (SELECT id FROM categories WHERE slug='dien-thoai'),
    (SELECT id FROM brands     WHERE slug='apple'),
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    '{"ram":"6GB","storage":"128GB","display":"6.1 inch OLED","camera":"48MP + 12MP","battery":"3877 mAh","os":"iOS 17"}',
    true
),
(
    'Samsung Galaxy S24 Ultra 256GB',
    'samsung-galaxy-s24-ultra-256gb',
    'Galaxy S24 Ultra với bút S Pen tích hợp, camera 200MP, chip Snapdragon 8 Gen 3.',
    31990000, 33990000, 35,
    (SELECT id FROM categories WHERE slug='dien-thoai'),
    (SELECT id FROM brands     WHERE slug='samsung'),
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
    '{"ram":"12GB","storage":"256GB","display":"6.8 inch AMOLED 120Hz","camera":"200MP + 12MP + 10MP + 50MP","battery":"5000 mAh","os":"Android 14"}',
    true
),
(
    'Samsung Galaxy A55 5G 256GB',
    'samsung-galaxy-a55-5g-256gb',
    'Galaxy A55 5G với camera 50MP OIS, màn hình Super AMOLED 120Hz, pin 5000 mAh.',
    11990000, 13490000, 120,
    (SELECT id FROM categories WHERE slug='dien-thoai'),
    (SELECT id FROM brands     WHERE slug='samsung'),
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    '{"ram":"8GB","storage":"256GB","display":"6.6 inch Super AMOLED 120Hz","camera":"50MP + 12MP + 5MP","battery":"5000 mAh","os":"Android 14"}',
    false
),
(
    'Xiaomi 14 Ultra 512GB',
    'xiaomi-14-ultra-512gb',
    'Xiaomi 14 Ultra với hệ thống camera Leica, chip Snapdragon 8 Gen 3, sạc 90W.',
    20990000, 22990000, 50,
    (SELECT id FROM categories WHERE slug='dien-thoai'),
    (SELECT id FROM brands     WHERE slug='xiaomi'),
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400',
    '{"ram":"16GB","storage":"512GB","display":"6.73 inch AMOLED 120Hz","camera":"50MP Leica + 50MP + 50MP","battery":"5000 mAh","os":"Android 14"}',
    true
),
(
    'OPPO Reno 12 Pro 5G 256GB',
    'oppo-reno-12-pro-5g-256gb',
    'OPPO Reno 12 Pro với AI Camera, màn hình AMOLED curved, sạc nhanh SUPERVOOC 80W.',
    13490000, 15990000, 70,
    (SELECT id FROM categories WHERE slug='dien-thoai'),
    (SELECT id FROM brands     WHERE slug='oppo'),
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400',
    '{"ram":"12GB","storage":"256GB","display":"6.7 inch AMOLED 120Hz","camera":"50MP + 8MP + 2MP","battery":"5000 mAh","os":"Android 14"}',
    false
),
-- Products — Laptops
(
    'MacBook Air M3 16GB 512GB',
    'macbook-air-m3-16gb-512gb',
    'MacBook Air M3 mỏng nhẹ nhất của Apple, hiệu năng vượt trội, pin 18 giờ.',
    37990000, 39990000, 25,
    (SELECT id FROM categories WHERE slug='laptop'),
    (SELECT id FROM brands     WHERE slug='apple'),
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    '{"cpu":"Apple M3","ram":"16GB Unified","storage":"512GB SSD","display":"13.6 inch Liquid Retina","battery":"18 giờ","os":"macOS Sonoma"}',
    true
),
(
    'Dell XPS 15 Core i7 Gen 13',
    'dell-xps-15-core-i7-gen13',
    'Dell XPS 15 với màn hình OLED 3.5K, card rời RTX 4060, thiết kế cao cấp.',
    42990000, 45990000, 15,
    (SELECT id FROM categories WHERE slug='laptop'),
    (SELECT id FROM brands     WHERE slug='dell'),
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
    '{"cpu":"Intel Core i7-13700H","ram":"32GB DDR5","storage":"1TB NVMe","display":"15.6 inch OLED 3.5K","gpu":"RTX 4060 8GB","os":"Windows 11"}',
    false
),
(
    'Lenovo ThinkPad X1 Carbon Gen 12',
    'lenovo-thinkpad-x1-carbon-gen12',
    'ThinkPad X1 Carbon siêu nhẹ 1.12kg, màn hình IPS 2.8K, bảo mật doanh nghiệp.',
    45990000, 49990000, 10,
    (SELECT id FROM categories WHERE slug='laptop'),
    (SELECT id FROM brands     WHERE slug='lenovo'),
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    '{"cpu":"Intel Core Ultra 7 165U","ram":"32GB LPDDR5","storage":"1TB NVMe","display":"14 inch IPS 2.8K","weight":"1.12kg","os":"Windows 11 Pro"}',
    false
),
-- Products — Tablets
(
    'iPad Pro M4 11 inch WiFi 256GB',
    'ipad-pro-m4-11-wifi-256gb',
    'iPad Pro M4 với màn hình Ultra Retina XDR, chip M4 siêu mạnh, mỏng nhất 5.1mm.',
    28990000, 30990000, 30,
    (SELECT id FROM categories WHERE slug='tablet'),
    (SELECT id FROM brands     WHERE slug='apple'),
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    '{"cpu":"Apple M4","ram":"8GB","storage":"256GB","display":"11 inch Ultra Retina XDR","camera":"12MP","battery":"10 giờ"}',
    true
),
-- Products — Phụ kiện
(
    'AirPods Pro (thế hệ 2)',
    'airpods-pro-gen-2',
    'AirPods Pro 2 với ANC nâng cấp, âm thanh không gian, chip H2, chống nước IPX4.',
    6390000, 6990000, 200,
    (SELECT id FROM categories WHERE slug='phu-kien'),
    (SELECT id FROM brands     WHERE slug='apple'),
    'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400',
    '{"driver":"11mm","anc":"Chủ động","codec":"AAC","battery":"6h (30h với hộp)","resistance":"IPX4"}',
    false
),
-- Products — Smartwatch
(
    'Apple Watch Series 10 GPS 46mm',
    'apple-watch-series-10-gps-46mm',
    'Apple Watch Series 10 mỏng nhất, màn hình lớn hơn 30%, sạc nhanh 80% trong 30 phút.',
    11990000, 12990000, 60,
    (SELECT id FROM categories WHERE slug='dong-ho'),
    (SELECT id FROM brands     WHERE slug='apple'),
    'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400',
    '{"display":"46mm Always-On Retina","health":"ECG, SpO2, nhiệt độ","battery":"18 giờ","resistance":"50m water"}',
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Sample orders
INSERT INTO orders (id, user_id, total, status, shipping_address) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    (SELECT id FROM users WHERE email='alice@shop.lab.local'),
    57980000,
    'delivered',
    '{"fullName":"Nguyễn Thị Alice","phone":"0901234567","address":"123 Nguyễn Huệ","city":"TP. Hồ Chí Minh"}'
),
(
    'a0000000-0000-0000-0000-000000000002',
    (SELECT id FROM users WHERE email='bob@shop.lab.local'),
    22990000,
    'processing',
    '{"fullName":"Trần Văn Bob","phone":"0912345678","address":"45 Hoàn Kiếm","city":"Hà Nội"}'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, name, price, quantity) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    (SELECT id FROM products WHERE slug='iphone-15-pro-max-256gb'),
    'iPhone 15 Pro Max 256GB', 34990000, 1
),
(
    'a0000000-0000-0000-0000-000000000001',
    (SELECT id FROM products WHERE slug='airpods-pro-gen-2'),
    'AirPods Pro (thế hệ 2)', 6390000, 2
),
(
    'a0000000-0000-0000-0000-000000000002',
    (SELECT id FROM products WHERE slug='iphone-15-128gb'),
    'iPhone 15 128GB', 22990000, 1
)
ON CONFLICT DO NOTHING;
