-- CBL Sales Orders schema
-- Local MySQL connection: host=localhost port=3306 user=root password=#lme11@@

CREATE DATABASE IF NOT EXISTS cbl_so;
USE cbl_so;

-- Order Types table (no dependencies)
CREATE TABLE IF NOT EXISTS order_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default order types
INSERT INTO order_types (name) VALUES ('SO') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO order_types (name) VALUES ('DD') ON DUPLICATE KEY UPDATE name=name;

-- Warehouses table (no dependencies)
CREATE TABLE IF NOT EXISTS warehouses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    alias VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dealers table - Comprehensive schema with all columns from VW_ALL_CUSTOMER_INFO (no dependencies)
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

-- Users table for authentication (must come after dealers due to FK constraint)
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

-- Transports table (must be created before sales_orders due to FK constraint)
CREATE TABLE IF NOT EXISTS transports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    truck_slno INT,
    truck_no VARCHAR(50) UNIQUE,
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

-- ======================================================================================
-- SALES ORDERS (TSO Orders - Quota-based, requires warehouse/transport)
-- ======================================================================================
-- CRITICAL: These are TSO Sales Orders that count towards quota sold_quantity
-- Daily Demand orders are in a separate table (demand_orders)
-- ======================================================================================
CREATE TABLE IF NOT EXISTS sales_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL UNIQUE,
    dealer_id INT NOT NULL,
    dealer_name VARCHAR(255),
    territory_id VARCHAR(50),
    territory_name VARCHAR(100),
    warehouse_id INT NOT NULL,  -- REQUIRED for sales orders
    warehouse_name VARCHAR(100),
    transport_id INT NOT NULL,  -- REQUIRED for sales orders
    transport_name VARCHAR(255),
    user_id INT,  -- TSO who created the order
    user_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    total_quantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (dealer_id) REFERENCES dealers(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (transport_id) REFERENCES transports(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_order_date (order_date),
    INDEX idx_dealer_order_date (dealer_id, order_date),
    INDEX idx_territory_date (territory_name, order_date),
    INDEX idx_warehouse_date (warehouse_id, order_date)
);

-- Sales Order Items table
CREATE TABLE IF NOT EXISTS sales_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255),
    product_code VARCHAR(50),
    quantity INT NOT NULL,
    unit_tp DECIMAL(10, 2),
    unit_trade_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (order_id) REFERENCES sales_orders(order_id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
);

-- ======================================================================================
-- DEMAND ORDERS (Dealer Orders - Non-quota, no warehouse/transport)
-- ======================================================================================
-- CRITICAL: These are Dealer Demand orders that DO NOT count towards quota
-- Sales orders are in a separate table (sales_orders)
-- ======================================================================================
CREATE TABLE IF NOT EXISTS demand_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL UNIQUE,
    dealer_id INT NOT NULL,
    dealer_name VARCHAR(255),
    territory_id VARCHAR(50),
    territory_name VARCHAR(100),
    user_id INT,  -- Dealer user who created the order
    user_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_date DATE NOT NULL,
    total_quantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (dealer_id) REFERENCES dealers(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_dealer_date (dealer_id, order_date),  -- One DD order per dealer per day
    INDEX idx_user_id (user_id),
    INDEX idx_order_date (order_date),
    INDEX idx_dealer_order_date (dealer_id, order_date),
    INDEX idx_territory_date (territory_name, order_date)
);

-- Demand Order Items table
CREATE TABLE IF NOT EXISTS demand_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255),
    product_code VARCHAR(50),
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (order_id) REFERENCES demand_orders(order_id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
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

-- Dealer Products table (assigns products or categories to dealers)
CREATE TABLE IF NOT EXISTS dealer_products (
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

-- Maintain denormalized name columns for daily_quotas
DROP TRIGGER IF EXISTS trg_daily_quotas_bi;
DROP TRIGGER IF EXISTS trg_daily_quotas_bu;

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

-- Drop old views that reference removed tables
DROP VIEW IF EXISTS orders_readable;
DROP VIEW IF EXISTS order_items_readable;
DROP VIEW IF EXISTS daily_quota_summary;

-- Summarized view of daily quotas with sold and remaining quantities (from sales_orders only)
CREATE OR REPLACE VIEW daily_quota_summary AS
SELECT
    d.id,
    d.date,
    d.product_id,
    d.product_code,
    d.product_name,
    d.territory_name,
    d.max_quantity,
    COALESCE((
        SELECT SUM(soi.quantity)
        FROM sales_orders so
        INNER JOIN sales_order_items soi ON so.order_id = soi.order_id
        INNER JOIN dealers de ON de.id = so.dealer_id
        WHERE soi.product_id = d.product_id
          AND de.territory_name = d.territory_name
          AND so.order_date = d.date
    ), 0) AS sold_quantity,
    d.max_quantity - COALESCE((
        SELECT SUM(soi.quantity)
        FROM sales_orders so
        INNER JOIN sales_order_items soi ON so.order_id = soi.order_id
        INNER JOIN dealers de ON de.id = so.dealer_id
        WHERE soi.product_id = d.product_id
          AND de.territory_name = d.territory_name
          AND so.order_date = d.date
    ), 0) AS remaining_quantity
FROM daily_quotas d;
