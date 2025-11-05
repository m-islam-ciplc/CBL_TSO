const mysql = require('mysql2/promise');

(async () => {
  const db = await mysql.createConnection({
    host: '172.16.50.50',
    port: 3307,
    user: 'root',
    password: 'cbl_so_root_password',
    database: 'cbl_so',
    multipleStatements: true // Allow multiple SQL statements
  });

  console.log('\n🔧 Migrating Products Table on Remote Docker Database\n');
  console.log('=' .repeat(60));

  try {
    // First, check current structure
    console.log('\n📊 Checking current table structure...');
    const [columns] = await db.execute('DESCRIBE products');
    const existingColumns = columns.map(col => col.Field);
    console.log(`   Current columns: ${existingColumns.join(', ')}`);

    // List of columns that need to be added
    const columnsToAdd = [
      { name: 'product_code', def: 'VARCHAR(50) NOT NULL UNIQUE' },
      { name: 'unit_measure', def: 'VARCHAR(50)' },
      { name: 'product_category', def: 'VARCHAR(50)' },
      { name: 'brand_code', def: 'VARCHAR(50)' },
      { name: 'brand_name', def: 'VARCHAR(100)' },
      { name: 'application_code', def: 'VARCHAR(50)' },
      { name: 'application_name', def: 'VARCHAR(100)' },
      { name: 'price_date', def: 'DATE' },
      { name: 'unit_tp', def: 'DECIMAL(10, 2)' },
      { name: 'oem_price', def: 'DECIMAL(10, 2)' },
      { name: 'b2b_price', def: 'DECIMAL(10, 2)' },
      { name: 'special_price', def: 'DECIMAL(10, 2)' },
      { name: 'employee_price', def: 'DECIMAL(10, 2)' },
      { name: 'cash_price', def: 'DECIMAL(10, 2)' },
      { name: 'mrp', def: 'DECIMAL(10, 2)' },
      { name: 'unit_trade_price', def: 'DECIMAL(10, 2)' },
      { name: 'unit_vat', def: 'DECIMAL(10, 2)' },
      { name: 'supp_tax', def: 'DECIMAL(10, 2)' },
      { name: 'gross_profit', def: 'DECIMAL(10, 2)' },
      { name: 'bonus_allow', def: 'VARCHAR(10)' },
      { name: 'discount_allow', def: 'VARCHAR(10)' },
      { name: 'discount_type', def: 'VARCHAR(50)' },
      { name: 'discount_val', def: 'DECIMAL(10, 2)' },
      { name: 'pack_size', def: 'VARCHAR(50)' },
      { name: 'shipper_qty', def: 'INT' },
      { name: 'status', def: 'VARCHAR(50)' },
      { name: 'updated_at', def: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
    ];

    // Check which columns are missing
    const missingColumns = columnsToAdd.filter(col => !existingColumns.includes(col.name));
    
    if (missingColumns.length === 0) {
      console.log('\n✅ All required columns already exist!');
      await db.end();
      return;
    }

    console.log(`\n📝 Found ${missingColumns.length} missing columns to add:`);
    missingColumns.forEach(col => console.log(`   - ${col.name}`));

    // Special handling for product_code (needs to be added with a default or we need to populate it)
    const productCodeColumn = missingColumns.find(col => col.name === 'product_code');
    if (productCodeColumn) {
      console.log('\n⚠️  NOTE: product_code is required (NOT NULL UNIQUE)');
      console.log('   Since the table might have existing data, we need to handle this carefully.');
      
      // Check if there are any rows
      const [rows] = await db.execute('SELECT COUNT(*) as count FROM products');
      const rowCount = rows[0].count;
      
      if (rowCount > 0) {
        console.log(`\n   ⚠️  WARNING: Table has ${rowCount} existing rows!`);
        console.log('   We will need to generate product_code values for existing rows.');
        console.log('   This script will:');
        console.log('   1. Add product_code as nullable first');
        console.log('   2. Generate product_code values (CODE-{id})');
        console.log('   3. Make it NOT NULL UNIQUE');
      }
    }

    // Start migration
    console.log('\n🚀 Starting migration...\n');

    // If product_code exists but is missing, handle it specially
    if (productCodeColumn) {
      const [rows] = await db.execute('SELECT COUNT(*) as count FROM products');
      const rowCount = rows[0].count;

      if (rowCount > 0) {
        // Step 1: Add product_code as nullable
        console.log('   1. Adding product_code as nullable...');
        await db.execute(`ALTER TABLE products ADD COLUMN product_code VARCHAR(50) NULL`);
        
        // Step 2: Generate product_code for existing rows
        console.log('   2. Generating product_code for existing rows...');
        await db.execute(`UPDATE products SET product_code = CONCAT('PROD-', id) WHERE product_code IS NULL`);
        
        // Step 3: Make it NOT NULL UNIQUE
        console.log('   3. Making product_code NOT NULL UNIQUE...');
        await db.execute(`ALTER TABLE products MODIFY COLUMN product_code VARCHAR(50) NOT NULL`);
        await db.execute(`ALTER TABLE products ADD UNIQUE KEY unique_product_code (product_code)`);
        
        // Remove from missingColumns list
        missingColumns.splice(missingColumns.indexOf(productCodeColumn), 1);
      } else {
        // No existing data, add directly as NOT NULL UNIQUE
        console.log('   1. Adding product_code...');
        await db.execute(`ALTER TABLE products ADD COLUMN product_code VARCHAR(50) NOT NULL UNIQUE`);
        missingColumns.splice(missingColumns.indexOf(productCodeColumn), 1);
      }
    }

    // Add remaining columns
    for (const col of missingColumns) {
      console.log(`   Adding ${col.name}...`);
      await db.execute(`ALTER TABLE products ADD COLUMN ${col.name} ${col.def}`);
    }

    // Add indexes if they don't exist
    console.log('\n   Adding indexes...');
    try {
      await db.execute(`CREATE INDEX idx_product_code ON products(product_code)`);
    } catch (e) {
      if (!e.message.includes('Duplicate key name')) {
        console.log(`   Warning: Could not create idx_product_code: ${e.message}`);
      }
    }
    
    try {
      await db.execute(`CREATE INDEX idx_product_category ON products(product_category)`);
    } catch (e) {
      if (!e.message.includes('Duplicate key name')) {
        console.log(`   Warning: Could not create idx_product_category: ${e.message}`);
      }
    }

    // Verify migration
    console.log('\n✅ Migration complete! Verifying...');
    const [newColumns] = await db.execute('DESCRIBE products');
    console.log(`   Total columns now: ${newColumns.length}`);
    console.log(`   Expected: ${existingColumns.length + columnsToAdd.length}`);
    
    if (newColumns.length >= 27) {
      console.log('\n✅ Migration successful! Products table is ready for import.');
    } else {
      console.log('\n⚠️  Migration completed but column count seems incorrect.');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('   Error code:', error.code);
    if (error.sql) {
      console.error('   SQL:', error.sql);
    }
  } finally {
    await db.end();
  }
})();
