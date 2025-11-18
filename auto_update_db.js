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

    // 2. Create/Update dealer_monthly_demand table
    console.log('\n2. Creating/updating dealer_monthly_demand table...');
    
    // Check if table exists
    const [tableCheck] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'dealer_monthly_demand'
    `, [config.database]);
    
    if (tableCheck[0].count === 0) {
      // Create new table with demand_date
      await connection.query(`
        CREATE TABLE dealer_monthly_demand (
          id INT AUTO_INCREMENT PRIMARY KEY,
          dealer_id INT NOT NULL,
          product_id INT NOT NULL,
          period_start DATE NOT NULL,
          period_end DATE NOT NULL,
          demand_date DATE NOT NULL,
          quantity INT NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          UNIQUE KEY unique_dealer_product_date (dealer_id, product_id, demand_date),
          INDEX idx_dealer_id (dealer_id),
          INDEX idx_product_id (product_id),
          INDEX idx_period (period_start, period_end),
          INDEX idx_demand_date (demand_date)
        )
      `);
      console.log('   ✓ Created dealer_monthly_demand table with demand_date');
    } else {
      // Check if demand_date column exists
      const [colCheck] = await connection.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'dealer_monthly_demand' AND COLUMN_NAME = 'demand_date'
      `, [config.database]);
      
      if (colCheck[0].count === 0) {
        // Delete all old demand data (user doesn't need it)
        await connection.query(`DELETE FROM dealer_monthly_demand`);
        console.log('   ✓ Deleted old demand data');
        
        // Add demand_date column
        await connection.query(`
          ALTER TABLE dealer_monthly_demand 
          ADD COLUMN demand_date DATE NOT NULL AFTER period_end
        `);
        console.log('   ✓ Added demand_date column');
        
        // Drop old unique constraint if exists
        try {
          await connection.query(`
            ALTER TABLE dealer_monthly_demand 
            DROP INDEX unique_dealer_product_period
          `);
        } catch (e) {
          // Ignore if doesn't exist
        }
        
        // Add new unique constraint
        try {
          await connection.query(`
            ALTER TABLE dealer_monthly_demand 
            ADD UNIQUE KEY unique_dealer_product_date (dealer_id, product_id, demand_date)
          `);
          console.log('   ✓ Updated unique constraint');
        } catch (e) {
          // May already exist
        }
        
        // Add index on demand_date if not exists
        try {
          await connection.query(`
            ALTER TABLE dealer_monthly_demand 
            ADD INDEX idx_demand_date (demand_date)
          `);
          console.log('   ✓ Added demand_date index');
        } catch (e) {
          // May already exist
        }
      } else {
        console.log('   ✓ dealer_monthly_demand table already has demand_date');
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

    // Insert default monthly demand start day setting
    await connection.query(`
      INSERT INTO settings (setting_key, setting_value, description) 
      VALUES ('monthly_demand_start_day', '18', 'Day of month when monthly demand period starts (1-31)')
      ON DUPLICATE KEY UPDATE setting_value = setting_value
    `);
    console.log('   ✓ Default setting inserted');

    // 4. Create dealer_product_assignments table
    console.log('\n4. Creating dealer_product_assignments table...');
    await connection.query(`
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
        INDEX idx_assignment_type (assignment_type)
      )
    `);
    console.log('   ✓ dealer_product_assignments table ready');

    console.log('\n✅ Database updated successfully!');
    console.log('\nChanges applied:');
    console.log('  ✓ Users table: Added dealer role and dealer_id');
    console.log('  ✓ Created dealer_monthly_demand table');
    console.log('  ✓ Created settings table');
    console.log('  ✓ Created dealer_product_assignments table');

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
