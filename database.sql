-- CBL Sales Orders Database Schema
CREATE DATABASE IF NOT EXISTS cbl_so;
USE cbl_so;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('tso', 'sales_manager', 'admin') NOT NULL,
    territory_name VARCHAR(100) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_territory_name (territory_name)
);

-- Daily Quotas table
CREATE TABLE IF NOT EXISTS daily_quotas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    product_id INT NOT NULL,
    product_code VARCHAR(50),
    product_name VARCHAR(255),
    territory_name VARCHAR(100) NOT NULL,
    max_quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_territory_product_date (date, product_id, territory_name),
    INDEX idx_date_territory (date, territory_name),
    INDEX idx_date_product (date, product_id)
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

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL UNIQUE,
    order_type_id INT NOT NULL,
    dealer_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_type_id) REFERENCES order_types(id),
    FOREIGN KEY (dealer_id) REFERENCES dealers(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
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
