-- Migration: Add default order types (SO for TSOs, DD for Dealers)
-- Date: 2024
-- Description: Adds default order types if they don't exist

USE cbl_so;

-- Insert default order types (ignore if already exist)
INSERT INTO order_types (name) VALUES ('SO') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO order_types (name) VALUES ('DD') ON DUPLICATE KEY UPDATE name=name;

-- Verification query
SELECT id, name FROM order_types ORDER BY id;

