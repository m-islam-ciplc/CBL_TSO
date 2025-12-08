// Auto-update local database script
// Uses backend's mysql2 package
const path = require('path');
const fs = require('fs');

// Try to load mysql2 from backend/node_modules
let mysql;
try {
  mysql = require(path.join(__dirname, 'backend/node_modules/mysql2/promise'));
} catch (e) {
  try {
    mysql = require('mysql2/promise');
  } catch (e2) {
    console.error('Error: mysql2 not found. Please install: npm install mysql2');
    process.exit(1);
  }
}

async function updateDatabase() {
  // Database connection config - uses same settings as backend
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '#lme11@@', // Default password from backend
    database: process.env.DB_NAME || 'cbl_so'
  };

  let connection;
  
  try {
    console.log('Connecting to MySQL...');
    connection = await mysql.createConnection(config);
    console.log('Connected successfully!\n');

    // Check if database exists, create if not
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
    await connection.query(`USE ${config.database}`);
    console.log(`Using database: ${config.database}\n`);

    // 1. Update users table: Add dealer role and dealer_id column
    console.log('1. Updating users table...');
    
    // Check if dealer role exists in ENUM
    const [roleCheck] = await connection.query(`
      SELECT COLUMN_TYPE 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
    `, [config.database]);
    
    if (roleCheck.length > 0 && !roleCheck[0].COLUMN_TYPE.includes("'dealer'")) {
      await connection.query(`
        ALTER TABLE users MODIFY COLUMN role ENUM('tso', 'sales_manager', 'admin', 'dealer') NOT NULL
      `);
      console.log('   ✓ Added dealer role to ENUM');
    } else {
      console.log('   ✓ Dealer role already exists');
    }

    // Check if dealer_id column exists
    const [colCheck] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'dealer_id'
    `, [config.database]);

    if (colCheck[0].count === 0) {
      await connection.query(`
        ALTER TABLE users ADD COLUMN dealer_id INT DEFAULT NULL AFTER territory_name
      `);
      console.log('   ✓ Added dealer_id column');
    } else {
      console.log('   ✓ dealer_id column already exists');
    }

    // Check if index exists
    const [idxCheck] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.STATISTICS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_dealer_id'
    `, [config.database]);

    if (idxCheck[0].count === 0) {
      await connection.query(`ALTER TABLE users ADD INDEX idx_dealer_id (dealer_id)`);
      console.log('   ✓ Added idx_dealer_id index');
    } else {
      console.log('   ✓ idx_dealer_id index already exists');
    }

    // Check if foreign key exists
    const [fkCheck] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.table_constraints 
      WHERE constraint_schema = ? AND table_name = 'users' AND constraint_name LIKE '%dealer_id%'
    `, [config.database]);

    if (fkCheck[0].count === 0) {
      await connection.query(`
        ALTER TABLE users ADD CONSTRAINT users_ibfk_dealer_id 
        FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE SET NULL
      `);
      console.log('   ✓ Added foreign key constraint');
    } else {
      console.log('   ✓ Foreign key constraint already exists');
    }

    // 2. Create/Update monthly_forecast table
    console.log('\n2. Creating/updating monthly_forecast table...');
    
    // Drop old table if exists (user doesn't need old data)
    try {
      await connection.query(`DROP TABLE IF EXISTS dealer_monthly_demand`);
      console.log('   ✓ Dropped old dealer_monthly_demand table');
    } catch (e) {
      // Ignore if doesn't exist
    }
    
    // Check if new table exists
    const [tableCheck] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'monthly_forecast'
    `, [config.database]);
    
    if (tableCheck[0].count === 0) {
      // Create new table with forecast_date
      await connection.query(`
        CREATE TABLE monthly_forecast (
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
        )
      `);
      console.log('   ✓ Created monthly_forecast table');
    } else {
      console.log('   ✓ monthly_forecast table already exists');
      
      // Check if is_submitted column exists
      const [colCheck] = await connection.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'monthly_forecast' AND COLUMN_NAME = 'is_submitted'
      `, [config.database]);
      
      if (colCheck[0].count === 0) {
        await connection.query(`
          ALTER TABLE monthly_forecast 
          ADD COLUMN is_submitted BOOLEAN DEFAULT FALSE AFTER quantity,
          ADD COLUMN submitted_at TIMESTAMP NULL DEFAULT NULL AFTER is_submitted,
          ADD INDEX idx_is_submitted (is_submitted)
        `);
        console.log('   ✓ Added is_submitted and submitted_at columns');
      } else {
        console.log('   ✓ is_submitted and submitted_at columns already exist');
      }
    }

    // 3. Create settings table
    console.log('\n3. Creating settings table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_setting_key (setting_key)
      )
    `);
    console.log('   ✓ settings table ready');

    // Insert default monthly forecast start day setting
    await connection.query(`
      INSERT INTO settings (setting_key, setting_value, description) 
      VALUES ('monthly_forecast_start_day', '18', 'Day of month when monthly forecast period starts (1-31)')
      ON DUPLICATE KEY UPDATE setting_value = setting_value
    `);
    console.log('   ✓ Default setting inserted');

    // 4. Create dealer_products table
    console.log('\n4. Creating dealer_products table...');
    await connection.query(`
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
        INDEX idx_assignment_type (assignment_type)
      )
    `);
    console.log('   ✓ dealer_products table ready');

    console.log('\n✅ Database updated successfully!');
    console.log('\nChanges applied:');
    console.log('  ✓ Users table: Added dealer role and dealer_id');
    console.log('  ✓ Created monthly_forecast table');
    console.log('  ✓ Created settings table');
    console.log('  ✓ Created dealer_products table');

  } catch (error) {
    console.error('\n❌ Error updating database:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   → Check your MySQL username and password');
      console.error('   → Update config in auto_update_db.js if needed');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   → Make sure MySQL is running');
    } else {
      console.error('   →', error.message);
      console.error('   → Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

// Run the update
updateDatabase();
