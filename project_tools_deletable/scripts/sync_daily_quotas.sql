-- Sync sold_quantity and remaining_quantity in daily_quotas
-- Run this if you ever need to recompute quotas after bulk changes
-- Temporarily disable safe updates (needed in Workbench)
SET @OLD_SQL_SAFE_UPDATES := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

-- Refresh product metadata from master tables
UPDATE daily_quotas dq
JOIN products p ON p.id = dq.product_id
LEFT JOIN dealers d ON d.territory_name = dq.territory_name
SET dq.product_code = p.product_code,
    dq.product_name = p.name,
    dq.territory_id = COALESCE(d.territory_code, dq.territory_id);

UPDATE daily_quotas dq
SET sold_quantity = (
  SELECT COALESCE(SUM(oi.quantity), 0)
  FROM orders o
  JOIN dealers d ON d.id = o.dealer_id
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE DATE(o.created_at) = dq.date
    AND oi.product_id = dq.product_id
    AND d.territory_name = dq.territory_name
);

-- Restore safe updates mode
SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;

