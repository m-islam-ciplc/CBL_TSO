-- Debug query to check quota allocation for product L105GP006 and Cumilla Territory
-- Run this in MySQL to see what's actually in the database

USE cbl_so;

-- 1. Check if product exists
SELECT id, product_code, name 
FROM products 
WHERE product_code = 'L105GP006';

-- 2. Check all quotas for this product (any territory, any date)
SELECT 
    dq.id,
    dq.date,
    dq.territory_name,
    dq.max_quantity,
    dq.sold_quantity,
    dq.product_id,
    p.product_code,
    p.name as product_name
FROM daily_quotas dq
JOIN products p ON dq.product_id = p.id
WHERE p.product_code = 'L105GP006'
ORDER BY dq.date DESC, dq.territory_name;

-- 3. Check quotas for Cumilla Territory today
SELECT 
    dq.id,
    dq.date,
    dq.territory_name,
    dq.max_quantity,
    dq.sold_quantity,
    dq.product_id,
    p.product_code,
    p.name as product_name,
    CURDATE() as today,
    DATE(dq.date) as quota_date
FROM daily_quotas dq
JOIN products p ON dq.product_id = p.id
WHERE p.product_code = 'L105GP006'
  AND dq.territory_name LIKE '%Cumilla%'
  AND DATE(dq.date) = CURDATE();

-- 4. Check all distinct territory names that contain "Cumilla"
SELECT DISTINCT territory_name 
FROM daily_quotas 
WHERE territory_name LIKE '%Cumilla%'
ORDER BY territory_name;

-- 5. Check what territories have quotas for L105GP006 today
SELECT 
    dq.territory_name,
    dq.max_quantity,
    dq.sold_quantity,
    DATE(dq.date) as quota_date
FROM daily_quotas dq
JOIN products p ON dq.product_id = p.id
WHERE p.product_code = 'L105GP006'
  AND DATE(dq.date) = CURDATE()
ORDER BY dq.territory_name;







