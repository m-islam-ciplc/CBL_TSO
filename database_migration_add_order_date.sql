-- Migration: Add order_date field to orders table
-- This allows storing the demand/order date separately from creation date

USE cbl_so;

-- Add order_date column (nullable, defaults to DATE(created_at) for existing orders)
ALTER TABLE orders 
ADD COLUMN order_date DATE NULL AFTER created_at;

-- Set order_date for existing orders to DATE(created_at)
UPDATE orders 
SET order_date = DATE(created_at) 
WHERE order_date IS NULL;

-- Make order_date NOT NULL after populating existing data
ALTER TABLE orders 
MODIFY COLUMN order_date DATE NOT NULL;

-- Add index for faster queries on order_date
CREATE INDEX idx_order_date ON orders(order_date);

-- Add composite index for common queries
CREATE INDEX idx_dealer_order_date ON orders(dealer_id, order_date);
CREATE INDEX idx_order_source_date ON orders(order_source, order_date);

