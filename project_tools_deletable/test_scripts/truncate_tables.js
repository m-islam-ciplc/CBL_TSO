/**
 * Truncate all database tables except users, warehouses, and settings
 * 
 * This script will:
 * - Disable foreign key checks
 * - Truncate all tables except the three specified
 * - Re-enable foreign key checks
 * - Verify truncation and preservation
 * 
 * Usage:
 *   From backend directory:
 *     node ../project_tools_deletable/test_scripts/truncate_tables.js
 *   
 *   Or from project root:
 *     cd backend && node ../project_tools_deletable/test_scripts/truncate_tables.js
 * 
 * Database Configuration:
 *   Uses environment variables or defaults from backend/server.js:
 *   - DB_HOST (default: localhost)
 *   - DB_USER (default: root)
 *   - DB_PASSWORD (default: #lme11@@)
 *   - DB_NAME (default: cbl_so)
 *   - DB_PORT (default: 3306)
 * 
 * Tables Preserved:
 *   - users (all user accounts)
 *   - warehouses (warehouse definitions)
 *   - settings (application settings)
 *   - order_types (SO, DD order types)
 * 
 * Tables Truncated:
 *   - order_items, orders, daily_quotas, monthly_forecast
 *   - dealer_product_assignments, dealers, products
 *   - transports
 */

const path = require('path');
const fs = require('fs');

// Try to load mysql2 from backend directory
let mysql;
try {
  const backendPath = path.join(__dirname, '../../backend/node_modules/mysql2/promise');
  if (fs.existsSync(path.join(__dirname, '../../backend/node_modules/mysql2'))) {
    mysql = require(backendPath);
  } else {
    throw new Error('mysql2 not found in backend');
  }
} catch (error) {
  console.error('❌ Error: mysql2 module not found. Please run this script from the backend directory.');
  console.error('   Or install mysql2: npm install mysql2');
  process.exit(1);
}

// Database configuration (matches backend/server.js)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '#lme11@@',
  database: process.env.DB_NAME || 'cbl_so',
  port: parseInt(process.env.DB_PORT || '3306', 10)
};

// Tables to KEEP (not truncate)
const TABLES_TO_KEEP = ['users', 'warehouses', 'settings', 'order_types'];

// Tables to truncate (in order - child tables first)
const TABLES_TO_TRUNCATE = [
  'order_items',           // Child of orders, products
  'orders',                // Child of dealers, warehouses, order_types, users
  'daily_quotas',          // Child of products
  'monthly_forecast',      // Child of dealers, products
  'dealer_product_assignments', // Child of dealers, products
  'dealers',               // Parent of users (but FK is ON DELETE SET NULL, so safe)
  'products',              // Parent of many tables
  'transports'             // No dependencies
  // Note: order_types is preserved (in TABLES_TO_KEEP)
];

async function truncateTables() {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🗑️  TRUNCATING DATABASE TABLES');
    console.log('='.repeat(70));
    console.log(`📍 Database: ${dbConfig.database}`);
    console.log(`📍 Host: ${dbConfig.host}:${dbConfig.port}`);
    
    // Connect to database
    console.log('\n🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Disable foreign key checks
    console.log('\n🔓 Disabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✅ Foreign key checks disabled');
    
    // Get all tables in the database
    console.log('\n📋 Getting list of tables...');
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `, [dbConfig.database]);
    
    const allTables = tables.map(row => row.TABLE_NAME);
    console.log(`   Found ${allTables.length} tables: ${allTables.join(', ')}`);
    
    // Filter out tables to keep (preserve these tables)
    const tablesToTruncate = allTables.filter(table => !TABLES_TO_KEEP.includes(table));
    
    console.log('\n📋 Tables to TRUNCATE:');
    tablesToTruncate.forEach(table => {
      console.log(`   - ${table}`);
    });
    
    console.log('\n🔒 Tables to KEEP:');
    TABLES_TO_KEEP.forEach(table => {
      if (allTables.includes(table)) {
        console.log(`   ✅ ${table}`);
      }
    });
    
    // Confirm
    console.log('\n⚠️  WARNING: This will DELETE ALL DATA from the tables listed above!');
    console.log(`   ${tablesToTruncate.length} table(s) will be truncated.`);
    
    // Truncate each table
    console.log('\n🗑️  Truncating tables...');
    let truncatedCount = 0;
    
    for (const table of tablesToTruncate) {
      try {
        await connection.query(`TRUNCATE TABLE \`${table}\``);
        console.log(`   ✅ Truncated: ${table}`);
        truncatedCount++;
      } catch (error) {
        console.log(`   ⚠️  Failed to truncate ${table}: ${error.message}`);
      }
    }
    
    // Re-enable foreign key checks
    console.log('\n🔒 Re-enabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Foreign key checks re-enabled');
    
    // Verify tables are empty (except kept ones)
    console.log('\n📊 Verifying truncation...');
    for (const table of tablesToTruncate) {
      try {
        const [rows] = await connection.query(`SELECT COUNT(*) as count FROM \`${table}\``);
        const count = rows[0].count;
        if (count === 0) {
          console.log(`   ✅ ${table}: Empty (${count} rows)`);
        } else {
          console.log(`   ⚠️  ${table}: Still has ${count} row(s)`);
        }
      } catch (error) {
        console.log(`   ⚠️  Could not verify ${table}: ${error.message}`);
      }
    }
    
    // Verify kept tables still have data
    console.log('\n📊 Verifying kept tables...');
    for (const table of TABLES_TO_KEEP) {
      if (allTables.includes(table)) {
        try {
          const [rows] = await connection.query(`SELECT COUNT(*) as count FROM \`${table}\``);
          const count = rows[0].count;
          console.log(`   ✅ ${table}: ${count} row(s) preserved`);
        } catch (error) {
          console.log(`   ⚠️  Could not verify ${table}: ${error.message}`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ TRUNCATION COMPLETE');
    console.log('='.repeat(70));
    console.log(`   ✅ Truncated: ${truncatedCount} table(s)`);
    console.log(`   ✅ Preserved: ${TABLES_TO_KEEP.length} table(s)`);
    console.log('   ✅ Foreign key constraints restored\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    
    // Try to re-enable foreign key checks if there was an error
    if (connection) {
      try {
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('\n✅ Foreign key checks re-enabled (error recovery)');
      } catch (recoverError) {
        console.error('\n❌ Failed to re-enable foreign key checks:', recoverError.message);
      }
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed\n');
    }
  }
}

// Run the script
if (require.main === module) {
  truncateTables().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = { truncateTables };

