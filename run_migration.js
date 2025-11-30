const mysql = require('mysql2/promise');
const fs = require('fs');

async function runMigration() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '#lme11@@',
            database: process.env.DB_NAME || 'cbl_so',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            multipleStatements: true
        });

        console.log('✅ Connected to database');
        
        // Read migration file
        const migrationSQL = fs.readFileSync('database_migration_add_order_date.sql', 'utf8');
        
        // Remove USE statement (we're already connected to the database)
        const cleanedSQL = migrationSQL.replace(/USE cbl_so;?\s*/i, '');
        
        console.log('📝 Running migration...\n');
        
        // Split by semicolon and execute each statement
        const statements = cleanedSQL.split(';').filter(s => s.trim().length > 0);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            if (statement) {
                try {
                    console.log(`Executing statement ${i + 1}/${statements.length}...`);
                    await connection.execute(statement);
                    console.log(`✅ Statement ${i + 1} completed`);
                } catch (err) {
                    // Check if column/index already exists
                    if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEYNAME') {
                        console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${err.message}`);
                    } else {
                        throw err;
                    }
                }
            }
        }
        
        console.log('\n✅ Migration completed successfully!');
        
        // Verify the column was added
        const [columns] = await connection.execute(
            `SHOW COLUMNS FROM orders LIKE 'order_date'`
        );
        
        if (columns.length > 0) {
            console.log('\n✅ Verified: order_date column exists in orders table');
        }
        
        await connection.end();
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        if (connection) await connection.end();
        process.exit(1);
    }
}

runMigration();

