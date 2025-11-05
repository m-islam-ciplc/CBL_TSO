const mysql = require('mysql2/promise');

(async () => {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '#lme11@@',
    database: 'cbl_so'
  });

  // Change this to the table you want to truncate
  const tableName = process.argv[2] || 'products';

  console.log(`\n=== Truncating Table: ${tableName} ===\n`);

  try {
    // Disable foreign key checks temporarily
    await db.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✅ Foreign key checks disabled');

    // Truncate the table
    await db.execute(`TRUNCATE TABLE ${tableName}`);
    console.log(`✅ Table '${tableName}' truncated successfully`);

    // Re-enable foreign key checks
    await db.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Foreign key checks re-enabled');

    // Verify the table is empty
    const [rows] = await db.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
    console.log(`\n📊 Current row count in '${tableName}': ${rows[0].count}`);
    
  } catch (error) {
    // Make sure to re-enable foreign key checks even on error
    await db.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.error('\n❌ Error truncating table:', error.message);
  } finally {
    await db.end();
  }
})();
