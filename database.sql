-- CBL Sales Orders Database Schema
-- The database is automatically created in Docker, but include guard for local usage

CREATE DATABASE IF NOT EXISTS cbl_so;
USE cbl_so;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('tso', 'sales_manager', 'admin', 'dealer') NOT NULL,
    territory_name VARCHAR(100) DEFAULT NULL,
    dealer_id INT DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_territory_name (territory_name),
    INDEX idx_dealer_id (dealer_id),
    FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE SET NULL
);

-- Order Types table
CREATE TABLE IF NOT EXISTS order_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    alias VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dealers table - Comprehensive schema with all columns from VW_ALL_CUSTOMER_INFO
CREATE TABLE IF NOT EXISTS dealers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dealer_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(255),
    proprietor_name VARCHAR(255),
    address TEXT,
    contact VARCHAR(100),
    email VARCHAR(100),
    nat_code VARCHAR(50),
    nat_name VARCHAR(100),
    div_code VARCHAR(50),
    div_name VARCHAR(100),
    territory_code VARCHAR(50),
    territory_name VARCHAR(100),
    dist_code VARCHAR(50),
    dist_name VARCHAR(100),
    thana_code VARCHAR(50),
    thana_name VARCHAR(100),
    sr_code VARCHAR(50),
    sr_name VARCHAR(100),
    nsm_code VARCHAR(50),
    nsm_name VARCHAR(100),
    cust_origin VARCHAR(50),
    dealer_status VARCHAR(10),
    active_status VARCHAR(10),
    dealer_proptr VARCHAR(10),
    dealer_type VARCHAR(10),
    price_type VARCHAR(10),
    cust_disc_category VARCHAR(10),
    party_type VARCHAR(50),
    erp_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table (must come before daily_quotas)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    unit_measure VARCHAR(50),
    product_category VARCHAR(50),
    brand_code VARCHAR(50),
    brand_name VARCHAR(100),
    application_code VARCHAR(50),
    application_name VARCHAR(100),
    price_date DATE,
    unit_tp DECIMAL(10, 2),
    oem_price DECIMAL(10, 2),
    b2b_price DECIMAL(10, 2),
    special_price DECIMAL(10, 2),
    employee_price DECIMAL(10, 2),
    cash_price DECIMAL(10, 2),
    mrp DECIMAL(10, 2),
    unit_trade_price DECIMAL(10, 2),
    unit_vat DECIMAL(10, 2),
    supp_tax DECIMAL(10, 2),
    gross_profit DECIMAL(10, 2),
    bonus_allow VARCHAR(10),
    discount_allow VARCHAR(10),
    discount_type VARCHAR(50),
    discount_val DECIMAL(10, 2),
    pack_size VARCHAR(50),
    shipper_qty INT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product_code (product_code),
    INDEX idx_product_category (product_category)
);

-- Daily Quotas table
CREATE TABLE IF NOT EXISTS daily_quotas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255),
    product_code VARCHAR(50),
    territory_id VARCHAR(50),
    territory_name VARCHAR(100) NOT NULL,
    max_quantity INT NOT NULL,
    sold_quantity INT NOT NULL DEFAULT 0,
    remaining_quantity INT AS (max_quantity - sold_quantity) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_territory_product_date (date, product_id, territory_name),
    INDEX idx_date_territory (date, territory_name),
    INDEX idx_date_product (date, product_id),
    INDEX idx_product_code (product_code)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL UNIQUE,
    order_type_id INT NOT NULL,
    order_type_name VARCHAR(100),
    dealer_id INT NOT NULL,
    dealer_name VARCHAR(255),
    territory_id VARCHAR(50),
    territory_name VARCHAR(100),
    warehouse_id INT NOT NULL,
    warehouse_name VARCHAR(100),
    transport_id INT,
    transport_name VARCHAR(255),
    user_id INT,
    user_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_quantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (order_type_id) REFERENCES order_types(id),
    FOREIGN KEY (dealer_id) REFERENCES dealers(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id)
);

-- Order Items table (separate table for order items)
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255),
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
);

-- Transports table
CREATE TABLE IF NOT EXISTS transports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    truck_slno INT,
    truck_no VARCHAR(50),
    engine_no VARCHAR(100),
    truck_details VARCHAR(255),
    driver_name VARCHAR(100),
    route_no VARCHAR(50),
    load_size VARCHAR(50),
    load_weight VARCHAR(50),
    remarks TEXT,
    truck_type VARCHAR(50),
    entered_by VARCHAR(100),
    entered_date DATE,
    entered_terminal VARCHAR(100),
    updated_by VARCHAR(100),
    updated_date DATE,
    updated_terminal VARCHAR(100),
    license_no VARCHAR(100),
    transport_status VARCHAR(10) DEFAULT 'A',
    vehicle_no VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Monthly Forecast table (dealers submit their monthly battery forecast/needs)
CREATE TABLE IF NOT EXISTS monthly_forecast (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dealer_id INT NOT NULL,
    product_id INT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    forecast_date DATE NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    is_submitted BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_dealer_product_date (dealer_id, product_id, forecast_date),
    INDEX idx_dealer_id (dealer_id),
    INDEX idx_product_id (product_id),
    INDEX idx_period (period_start, period_end),
    INDEX idx_forecast_date (forecast_date),
    INDEX idx_is_submitted (is_submitted)
);

-- Settings table for application configuration
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
);

-- Insert default monthly forecast period start day setting (18th to 18th)
INSERT INTO settings (setting_key, setting_value, description) 
VALUES ('monthly_forecast_start_day', '18', 'Day of month when monthly forecast period starts (1-31)')
ON DUPLICATE KEY UPDATE setting_value = setting_value;

-- Dealer Product Assignments table (assigns products or categories to dealers)
CREATE TABLE IF NOT EXISTS dealer_product_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dealer_id INT NOT NULL,
    assignment_type ENUM('product', 'category') NOT NULL,
    product_id INT DEFAULT NULL,
    product_category VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_dealer_product (dealer_id, product_id),
    UNIQUE KEY unique_dealer_category (dealer_id, product_category),
    INDEX idx_dealer_id (dealer_id),
    INDEX idx_product_id (product_id),
    INDEX idx_product_category (product_category),
    INDEX idx_assignment_type (assignment_type),
    CHECK (
        (assignment_type = 'product' AND product_id IS NOT NULL AND product_category IS NULL) OR
        (assignment_type = 'category' AND product_category IS NOT NULL AND product_id IS NULL)
    )
);

-- Maintain denormalized name columns, sold quantities, and totals
DROP TRIGGER IF EXISTS trg_orders_bi;
DROP TRIGGER IF EXISTS trg_orders_bu;
DROP TRIGGER IF EXISTS trg_order_items_bi;
DROP TRIGGER IF EXISTS trg_order_items_bu;
DROP TRIGGER IF EXISTS trg_order_items_ai;
DROP TRIGGER IF EXISTS trg_order_items_au;
DROP TRIGGER IF EXISTS trg_order_items_ad;
DROP TRIGGER IF EXISTS trg_daily_quotas_bi;
DROP TRIGGER IF EXISTS trg_daily_quotas_bu;

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
        SELECT full_name
          INTO v_user_name
          FROM users
         WHERE id = NEW.user_id
         LIMIT 1;
    ELSE
        SET v_user_name = NULL;
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
        SELECT full_name
          INTO v_user_name
          FROM users
         WHERE id = NEW.user_id
         LIMIT 1;
    ELSE
        SET v_user_name = NULL;
    END IF;

    SET NEW.order_type_name = v_order_type_name;
    SET NEW.dealer_name = v_dealer_name;
    SET NEW.territory_id = v_territory_code;
    SET NEW.territory_name = v_territory_name;
    SET NEW.warehouse_name = v_warehouse_name;
    SET NEW.transport_name = v_transport_name;
    SET NEW.user_name = v_user_name;
END//

CREATE TRIGGER trg_order_items_bi
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
    DECLARE v_product_name VARCHAR(255);

    SELECT name
      INTO v_product_name
      FROM products
     WHERE id = NEW.product_id
     LIMIT 1;

    SET NEW.product_name = v_product_name;
END//

CREATE TRIGGER trg_order_items_bu
BEFORE UPDATE ON order_items
FOR EACH ROW
BEGIN
    DECLARE v_product_name VARCHAR(255);

    SELECT name
      INTO v_product_name
      FROM products
     WHERE id = NEW.product_id
     LIMIT 1;

    SET NEW.product_name = v_product_name;
END//

CREATE TRIGGER trg_order_items_ai
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    DECLARE v_order_date DATE;
    DECLARE v_territory VARCHAR(255);

    UPDATE orders
       SET total_quantity = total_quantity + NEW.quantity
     WHERE order_id = NEW.order_id;

    SELECT DATE(o.created_at), d.territory_name
      INTO v_order_date, v_territory
      FROM orders o
      JOIN dealers d ON d.id = o.dealer_id
     WHERE o.order_id = NEW.order_id
     LIMIT 1;

    IF v_order_date IS NOT NULL AND v_territory IS NOT NULL THEN
        UPDATE daily_quotas
           SET sold_quantity = sold_quantity + NEW.quantity
         WHERE date = v_order_date
           AND product_id = NEW.product_id
           AND territory_name = v_territory;
    END IF;
END//

CREATE TRIGGER trg_order_items_au
AFTER UPDATE ON order_items
FOR EACH ROW
BEGIN
    DECLARE v_order_date DATE;
    DECLARE v_territory VARCHAR(255);

    UPDATE orders
       SET total_quantity = GREATEST(total_quantity - OLD.quantity, 0) + NEW.quantity
     WHERE order_id = NEW.order_id;

    SELECT DATE(o.created_at), d.territory_name
      INTO v_order_date, v_territory
      FROM orders o
      JOIN dealers d ON d.id = o.dealer_id
     WHERE o.order_id = NEW.order_id
     LIMIT 1;

    IF v_order_date IS NOT NULL AND v_territory IS NOT NULL THEN
        UPDATE daily_quotas
           SET sold_quantity = GREATEST(sold_quantity - OLD.quantity, 0)
         WHERE date = v_order_date
           AND product_id = OLD.product_id
           AND territory_name = v_territory;

        UPDATE daily_quotas
           SET sold_quantity = sold_quantity + NEW.quantity
         WHERE date = v_order_date
           AND product_id = NEW.product_id
           AND territory_name = v_territory;
    END IF;
END//

CREATE TRIGGER trg_order_items_ad
AFTER DELETE ON order_items
FOR EACH ROW
BEGIN
    DECLARE v_order_date DATE;
    DECLARE v_territory VARCHAR(255);

    UPDATE orders
       SET total_quantity = GREATEST(total_quantity - OLD.quantity, 0)
     WHERE order_id = OLD.order_id;

    SELECT DATE(o.created_at), d.territory_name
      INTO v_order_date, v_territory
      FROM orders o
      JOIN dealers d ON d.id = o.dealer_id
     WHERE o.order_id = OLD.order_id
     LIMIT 1;

    IF v_order_date IS NOT NULL AND v_territory IS NOT NULL THEN
        UPDATE daily_quotas
           SET sold_quantity = GREATEST(sold_quantity - OLD.quantity, 0)
         WHERE date = v_order_date
           AND product_id = OLD.product_id
           AND territory_name = v_territory;
    END IF;
END//

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_daily_quotas_bi
BEFORE INSERT ON daily_quotas
FOR EACH ROW
BEGIN
    DECLARE v_product_name VARCHAR(255);
    DECLARE v_product_code VARCHAR(50);
    DECLARE v_territory_name VARCHAR(100);
    DECLARE v_territory_code VARCHAR(50);

    IF NEW.product_id IS NOT NULL THEN
        SELECT name, product_code
          INTO v_product_name, v_product_code
          FROM products
         WHERE id = NEW.product_id
         LIMIT 1;
    END IF;

    IF NEW.territory_id IS NOT NULL AND NEW.territory_id <> '' THEN
        SELECT territory_name
          INTO v_territory_name
          FROM dealers
         WHERE territory_code = NEW.territory_id
           AND territory_name IS NOT NULL
         LIMIT 1;
    ELSEIF NEW.territory_name IS NOT NULL AND NEW.territory_name <> '' THEN
        SELECT territory_code
          INTO v_territory_code
          FROM dealers
         WHERE territory_name = NEW.territory_name
           AND territory_code IS NOT NULL
         LIMIT 1;
        SET NEW.territory_id = v_territory_code;
        SET v_territory_name = NEW.territory_name;
    END IF;

    IF v_product_name IS NOT NULL THEN
        SET NEW.product_name = v_product_name;
    END IF;

    IF v_product_code IS NOT NULL THEN
        SET NEW.product_code = v_product_code;
    END IF;

    IF v_territory_name IS NOT NULL THEN
        SET NEW.territory_name = v_territory_name;
    END IF;
END//

CREATE TRIGGER trg_daily_quotas_bu
BEFORE UPDATE ON daily_quotas
FOR EACH ROW
BEGIN
    DECLARE v_product_name VARCHAR(255);
    DECLARE v_product_code VARCHAR(50);
    DECLARE v_territory_name VARCHAR(100);
    DECLARE v_territory_code VARCHAR(50);

    IF NEW.product_id IS NOT NULL THEN
        SELECT name, product_code
          INTO v_product_name, v_product_code
          FROM products
         WHERE id = NEW.product_id
         LIMIT 1;
    END IF;

    IF NEW.territory_id IS NOT NULL AND NEW.territory_id <> '' THEN
        SELECT territory_name
          INTO v_territory_name
          FROM dealers
         WHERE territory_code = NEW.territory_id
           AND territory_name IS NOT NULL
         LIMIT 1;
    ELSEIF NEW.territory_name IS NOT NULL AND NEW.territory_name <> '' THEN
        SELECT territory_code
          INTO v_territory_code
          FROM dealers
         WHERE territory_name = NEW.territory_name
           AND territory_code IS NOT NULL
         LIMIT 1;
        SET NEW.territory_id = v_territory_code;
        SET v_territory_name = NEW.territory_name;
    END IF;

    IF v_product_name IS NOT NULL THEN
        SET NEW.product_name = v_product_name;
    END IF;

    IF v_product_code IS NOT NULL THEN
        SET NEW.product_code = v_product_code;
    END IF;

    IF v_territory_name IS NOT NULL THEN
        SET NEW.territory_name = v_territory_name;
    END IF;
END//

DELIMITER ;

-- Summarized view of daily quotas with sold and remaining quantities
CREATE OR REPLACE VIEW daily_quota_summary AS
SELECT
    d.id,
    d.date,
    d.product_id,
    d.product_code,
    d.product_name,
    d.territory_name,
    d.max_quantity,
    COALESCE(SUM(oi.quantity), 0) AS sold_quantity,
    d.max_quantity - COALESCE(SUM(oi.quantity), 0) AS remaining_quantity
FROM daily_quotas d
LEFT JOIN orders o ON DATE(o.created_at) = d.date
LEFT JOIN dealers de ON de.id = o.dealer_id AND de.territory_name = d.territory_name
LEFT JOIN order_items oi ON oi.order_id = o.order_id AND oi.product_id = d.product_id
GROUP BY d.id, d.date, d.product_id, d.product_name, d.territory_name, d.max_quantity;

-- Readable views for manual inspection
CREATE OR REPLACE VIEW orders_readable AS
SELECT
    o.order_id,
    o.created_at,
    o.total_quantity,
    ot.name AS order_type,
    d.name AS dealer_name,
    d.territory_name,
    w.name AS warehouse_name,
    t.truck_details AS transport_name,
    u.full_name AS created_by
FROM orders o
LEFT JOIN order_types ot ON ot.id = o.order_type_id
LEFT JOIN dealers d ON d.id = o.dealer_id
LEFT JOIN warehouses w ON w.id = o.warehouse_id
LEFT JOIN transports t ON t.id = o.transport_id
LEFT JOIN users u ON u.id = o.user_id;

CREATE OR REPLACE VIEW order_items_readable AS
SELECT
    oi.id,
    oi.order_id,
    oi.product_id,
    p.name AS product_name,
    oi.quantity,
    oi.created_at
FROM order_items oi
LEFT JOIN products p ON p.id = oi.product_id;
