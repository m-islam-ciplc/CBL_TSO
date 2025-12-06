-- Fix: Insert DD Order Type if Missing
-- Run this SQL script to fix the "DD order type not found" error

USE cbl_so;

-- Insert DD (Daily Demand) order type if it doesn't exist
INSERT INTO order_types (name) VALUES ('DD') 
ON DUPLICATE KEY UPDATE name=name;

-- Also ensure SO (Sales Order) order type exists
INSERT INTO order_types (name) VALUES ('SO') 
ON DUPLICATE KEY UPDATE name=name;

-- Verify both order types exist
SELECT * FROM order_types WHERE name IN ('SO', 'DD');

-- Expected output: 2 rows (one for SO, one for DD)

