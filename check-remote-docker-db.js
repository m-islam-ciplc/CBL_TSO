const mysql = require('mysql2/promise');

(async () => {
  const db = await mysql.createConnection({
    host: '172.16.50.50',
    port: 3307,
    user: 'root',
    password: 'cbl_so_root_password',
    database: 'cbl_so'
  });

  console.log('\n🔍 Checking Remote Docker Database (172.16.50.50:3307)\n');
  console.log('=' .repeat(60));

  try {
    // Check products table structure
    console.log('\n📊 Products Table Structure:');
    console.log('-'.repeat(60));
    const [columns] = await db.execute('DESCRIBE products');
    
    console.table(columns.map(col => ({
      Field: col.Field,
      Type: col.Type,
      Null: col.Null,
      Key: col.Key,
      Default: col.Default
    })));

    const columnCount = columns.length;
    console.log(`\n📈 Total columns: ${columnCount}`);

    if (columnCount === 3) {
      console.log('\n❌ ISSUE FOUND: Products table only has 3 columns!');
      console.log('   This matches the OLD schema in database.sql');
      console.log('   The import code expects 27 columns.');
      console.log('\n🔧 SOLUTION:');
      console.log('   1. Update database.sql (already done)');
      console.log('   2. Rebuild Docker containers with:');
      console.log('      docker-compose down -v');
      console.log('      docker-compose up -d --build');
    } else if (columnCount >= 27) {
      console.log('\n✅ Products table has correct number of columns');
    } else {
      console.log(`\n⚠️  Products table has ${columnCount} columns (expected 27)`);
    }

    // Check if table has any data
    const [rowCount] = await db.execute('SELECT COUNT(*) as count FROM products');
    console.log(`\n📦 Current products in table: ${rowCount[0].count}`);

    // Check uploads directory via a test query (if possible)
    console.log('\n📁 Checking if we can access container info...');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Cannot connect to database. Is Docker running?');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   Access denied. Check username/password.');
    }
  } finally {
    await db.end();
  }
})();
