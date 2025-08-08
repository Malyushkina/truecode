-- Скрипт создания таблиц для проекта TrueCode
-- Создает таблицу Product с полями id и uid

-- Подключаемся к базе данных truecode
\c truecode;

-- Создаем таблицу Product
CREATE TABLE "Product" (
    "id" SERIAL PRIMARY KEY,
    "uid" TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "discountPrice" DOUBLE PRECISION,
    "sku" TEXT NOT NULL UNIQUE,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создаем индексы для оптимизации
CREATE INDEX "Product_uid_idx" ON "Product"("uid");
CREATE INDEX "Product_sku_idx" ON "Product"("sku");
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");

-- Добавляем несколько тестовых товаров
INSERT INTO "Product" ("name", "description", "price", "discountPrice", "sku", "imageUrl") VALUES
('iPhone 15 Pro Max', 'Смартфон с камерой 48 Мп, процессор A17 Pro, 256GB', 149999, 129999, 'IPHONE-15-PRO-MAX-256GB', NULL),
('MacBook Pro 14', 'Ноутбук с процессором M3 Pro, 512GB SSD, 18GB RAM', 249999, 229999, 'MACBOOK-PRO-14-M3', NULL),
('AirPods Pro 2', 'Беспроводные наушники с активным шумоподавлением', 29999, 24999, 'AIRPODS-PRO-2', NULL),
('iPad Air', 'Планшет с процессором M1, 256GB, Wi-Fi + Cellular', 89999, 79999, 'IPAD-AIR-256GB', NULL),
('Apple Watch Series 9', 'Умные часы с Always-On Retina дисплеем', 49999, 44999, 'APPLE-WATCH-SERIES-9', NULL);

-- Проверяем созданные данные
SELECT COUNT(*) as total_products FROM "Product"; 