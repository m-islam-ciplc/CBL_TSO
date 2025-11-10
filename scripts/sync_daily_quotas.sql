-- Sync sold_quantity and remaining_quantity in daily_quotas
-- Run this if you ever need to recompute quotas after bulk changes
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

