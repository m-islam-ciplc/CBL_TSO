-- Migration: Add order_source column to orders table
-- Date: 2024
-- Description: Adds order_source field to track whether orders are created by TSO, Dealer, or Admin
--              This improves query performance and makes reporting easier

USE cbl_so;

-- Step 1: Add order_source column
ALTER TABLE orders 
ADD COLUMN order_source ENUM('tso', 'dealer', 'admin') DEFAULT NULL 
AFTER user_id;

-- Step 2: Add index for faster filtering
CREATE INDEX idx_order_source ON orders(order_source);

-- Step 3: Populate existing orders based on user role
UPDATE orders o
JOIN users u ON u.id = o.user_id
SET o.order_source = CASE 
    WHEN u.role IN ('tso', 'sales_manager') THEN 'tso'
    WHEN u.role = 'dealer' THEN 'dealer'
    WHEN u.role = 'admin' THEN 'admin'
    ELSE NULL
END
WHERE o.user_id IS NOT NULL;

-- Step 4: Drop and recreate triggers to include order_source logic
DROP TRIGGER IF EXISTS trg_orders_bi;
DROP TRIGGER IF EXISTS trg_orders_bu;

DELIMITER //

CREATE TRIGGER trg_orders_bi
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    DECLARE v_order_type_name VARCHAR(100);
    DECLARE v_dealer_name VARCHAR(255);
    DECLARE v_territory_name VARCHAR(100);
    DECLARE v_territory_code VARCHAR(50);
    DECLARE v_warehouse_name VARCHAR(100);
    DECLARE v_transport_name VARCHAR(255);
    DECLARE v_user_name VARCHAR(100);
    DECLARE v_user_role VARCHAR(50);

    SELECT name
      INTO v_order_type_name
      FROM order_types
     WHERE id = NEW.order_type_id
     LIMIT 1;

    SELECT name, territory_name, territory_code
      INTO v_dealer_name, v_territory_name, v_territory_code
      FROM dealers
     WHERE id = NEW.dealer_id
     LIMIT 1;

    SELECT name
      INTO v_warehouse_name
      FROM warehouses
     WHERE id = NEW.warehouse_id
     LIMIT 1;

    IF NEW.transport_id IS NOT NULL THEN
        SELECT truck_details
          INTO v_transport_name
          FROM transports
         WHERE id = NEW.transport_id
         LIMIT 1;
    ELSE
        SET v_transport_name = NULL;
    END IF;

    IF NEW.user_id IS NOT NULL THEN
        SELECT full_name, role
          INTO v_user_name, v_user_role
          FROM users
         WHERE id = NEW.user_id
         LIMIT 1;
        
        -- Set order_source based on user role
        SET NEW.order_source = CASE 
            WHEN v_user_role IN ('tso', 'sales_manager') THEN 'tso'
            WHEN v_user_role = 'dealer' THEN 'dealer'
            WHEN v_user_role = 'admin' THEN 'admin'
            ELSE NULL
        END;
    ELSE
        SET v_user_name = NULL;
        SET NEW.order_source = NULL;
    END IF;

    SET NEW.order_type_name = v_order_type_name;
    SET NEW.dealer_name = v_dealer_name;
    SET NEW.territory_id = v_territory_code;
    SET NEW.territory_name = v_territory_name;
    SET NEW.warehouse_name = v_warehouse_name;
    SET NEW.transport_name = v_transport_name;
    SET NEW.user_name = v_user_name;
END//

CREATE TRIGGER trg_orders_bu
BEFORE UPDATE ON orders
FOR EACH ROW
BEGIN
    DECLARE v_order_type_name VARCHAR(100);
    DECLARE v_dealer_name VARCHAR(255);
    DECLARE v_territory_name VARCHAR(100);
    DECLARE v_territory_code VARCHAR(50);
    DECLARE v_warehouse_name VARCHAR(100);
    DECLARE v_transport_name VARCHAR(255);
    DECLARE v_user_name VARCHAR(100);
    DECLARE v_user_role VARCHAR(50);

    IF NEW.order_type_id IS NOT NULL THEN
        SELECT name
          INTO v_order_type_name
          FROM order_types
         WHERE id = NEW.order_type_id
         LIMIT 1;
    ELSE
        SET v_order_type_name = NULL;
    END IF;

    IF NEW.dealer_id IS NOT NULL THEN
        SELECT name, territory_name, territory_code
          INTO v_dealer_name, v_territory_name, v_territory_code
          FROM dealers
         WHERE id = NEW.dealer_id
         LIMIT 1;
    ELSE
        SET v_dealer_name = NULL;
        SET v_territory_name = NULL;
        SET v_territory_code = NULL;
    END IF;

    IF NEW.warehouse_id IS NOT NULL THEN
        SELECT name
          INTO v_warehouse_name
          FROM warehouses
         WHERE id = NEW.warehouse_id
         LIMIT 1;
    ELSE
        SET v_warehouse_name = NULL;
    END IF;

    IF NEW.transport_id IS NOT NULL THEN
        SELECT truck_details
          INTO v_transport_name
          FROM transports
         WHERE id = NEW.transport_id
         LIMIT 1;
    ELSE
        SET v_transport_name = NULL;
    END IF;

    IF NEW.user_id IS NOT NULL THEN
        SELECT full_name, role
          INTO v_user_name, v_user_role
          FROM users
         WHERE id = NEW.user_id
         LIMIT 1;
        
        -- Update order_source based on user role if user_id changed
        IF NEW.user_id != OLD.user_id OR NEW.order_source IS NULL THEN
            SET NEW.order_source = CASE 
                WHEN v_user_role IN ('tso', 'sales_manager') THEN 'tso'
                WHEN v_user_role = 'dealer' THEN 'dealer'
                WHEN v_user_role = 'admin' THEN 'admin'
                ELSE NULL
            END;
        END IF;
    ELSE
        SET v_user_name = NULL;
        SET NEW.order_source = NULL;
    END IF;

    SET NEW.order_type_name = v_order_type_name;
    SET NEW.dealer_name = v_dealer_name;
    SET NEW.territory_id = v_territory_code;
    SET NEW.territory_name = v_territory_name;
    SET NEW.warehouse_name = v_warehouse_name;
    SET NEW.transport_name = v_transport_name;
    SET NEW.user_name = v_user_name;
END//

DELIMITER ;

-- Verification query
SELECT 
    order_source,
    COUNT(*) as order_count,
    SUM(total_quantity) as total_quantity
FROM orders
GROUP BY order_source;

