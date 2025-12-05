# Database Update Instructions

## Quick Update (All-in-One Script)

Run the complete migration script:

```bash
mysql -u your_username -p cbl_so < migrations/update_database_complete.sql
```

Or if using Docker:

```bash
docker exec -i cbl_tso_db mysql -u root -pYourPassword cbl_so < migrations/update_database_complete.sql
```

## What This Script Does

1. ✅ Adds `order_source` column to `orders` table
2. ✅ Adds index for faster queries
3. ✅ Populates existing orders with `order_source` based on user role
4. ✅ Adds order types: "SO" (Sales Order) and "DD" (Daily Demand)
5. ✅ Updates triggers to auto-populate `order_source` for new orders

## Verification

After running the script, verify everything worked:

```sql
-- Check order_source column exists
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'order_source';

-- Check order types
SELECT id, name FROM order_types;

-- Check order distribution
SELECT order_source, COUNT(*) FROM orders GROUP BY order_source;
```

## Expected Results

### Order Types:
- id: 1, name: SO
- id: 2, name: DD

### Order Source Distribution:
- tso: [count of TSO orders]
- dealer: [count of dealer orders]
- admin: [count of admin orders] (if any)

## Troubleshooting

If you get errors:
1. Make sure you're connected to the correct database (`cbl_so`)
2. Check MySQL user has ALTER, CREATE, UPDATE permissions
3. The script is idempotent - safe to run multiple times

## Manual Steps (if script fails)

If the automated script doesn't work, run these separately:

```sql
-- 1. Add order_source column
ALTER TABLE orders 
ADD COLUMN order_source ENUM('tso', 'dealer', 'admin') DEFAULT NULL 
AFTER user_id;

-- 2. Add index
CREATE INDEX idx_order_source ON orders(order_source);

-- 3. Populate existing orders
UPDATE orders o
JOIN users u ON u.id = o.user_id
SET o.order_source = CASE 
    WHEN u.role IN ('tso', 'sales_manager') THEN 'tso'
    WHEN u.role = 'dealer' THEN 'dealer'
    WHEN u.role = 'admin' THEN 'admin'
    ELSE NULL
END
WHERE o.user_id IS NOT NULL;

-- 4. Add order types
INSERT INTO order_types (name) VALUES ('SO') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO order_types (name) VALUES ('DD') ON DUPLICATE KEY UPDATE name=name;
```

