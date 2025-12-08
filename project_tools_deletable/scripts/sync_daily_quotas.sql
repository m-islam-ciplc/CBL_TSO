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

-- CRITICAL: Only update from sales_orders (not demand_orders)
-- Daily demand orders do NOT count towards quota sold_quantity
UPDATE daily_quotas dq
SET sold_quantity = (
  SELECT COALESCE(SUM(soi.quantity), 0)
  FROM sales_orders so
  INNER JOIN sales_order_items soi ON so.order_id = soi.order_id
  INNER JOIN dealers d ON d.id = so.dealer_id
  WHERE so.order_date = dq.date
    AND soi.product_id = dq.product_id
    AND d.territory_name = dq.territory_name
);

-- Restore safe updates mode
SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;

