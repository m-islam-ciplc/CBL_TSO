-- Truncate all database tables except users, warehouses, settings, and order_types
-- This script disables foreign key checks, truncates tables, then re-enables checks

USE cbl_so;

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Truncate tables (child tables first)
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE daily_quotas;
TRUNCATE TABLE monthly_forecast;
TRUNCATE TABLE dealer_products;
TRUNCATE TABLE dealers;
TRUNCATE TABLE products;
TRUNCATE TABLE transports;
-- Note: order_types is NOT truncated (preserved)

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify truncation (optional - comment out if not needed)
SELECT 'order_items' as table_name, COUNT(*) as row_count FROM order_items
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'daily_quotas', COUNT(*) FROM daily_quotas
UNION ALL
SELECT 'monthly_forecast', COUNT(*) FROM monthly_forecast
UNION ALL
SELECT 'dealer_products', COUNT(*) FROM dealer_products
UNION ALL
SELECT 'dealers', COUNT(*) FROM dealers
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'transports', COUNT(*) FROM transports;

-- Verify kept tables still have data
SELECT 'users (KEPT)' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'warehouses (KEPT)', COUNT(*) FROM warehouses
UNION ALL
SELECT 'settings (KEPT)', COUNT(*) FROM settings
UNION ALL
SELECT 'order_types (KEPT)', COUNT(*) FROM order_types;

