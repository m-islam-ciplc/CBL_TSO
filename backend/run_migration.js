const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

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
        
        // Check if column already exists
        const [existingColumns] = await connection.execute(
            `SHOW COLUMNS FROM orders LIKE 'order_date'`
        );
        
        if (existingColumns.length > 0) {
            console.log('⚠️  order_date column already exists. Checking if migration is needed...');
            const column = existingColumns[0];
            if (column.Null === 'NO') {
                console.log('✅ Column already exists and is properly configured.');
                await connection.end();
                return;
            }
        }
        
        // Read migration file
        const migrationPath = path.join(__dirname, '..', 'database_migration_add_order_date.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('📝 Running migration...\n');
        
        // Step 1: Add column if it doesn't exist
        try {
            console.log('Step 1: Adding order_date column...');
            await connection.execute(`
                ALTER TABLE orders 
                ADD COLUMN order_date DATE NULL AFTER created_at
            `);
            console.log('✅ Column added');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠️  Column already exists, skipping...');
            } else {
                throw err;
            }
        }
        
        // Step 2: Set order_date for existing orders
        console.log('Step 2: Setting order_date for existing orders...');
        await connection.execute(`
            UPDATE orders 
            SET order_date = DATE(created_at) 
            WHERE order_date IS NULL
        `);
        console.log('✅ Existing orders updated');
        
        // Step 3: Make column NOT NULL
        console.log('Step 3: Making order_date NOT NULL...');
        try {
            await connection.execute(`
                ALTER TABLE orders 
                MODIFY COLUMN order_date DATE NOT NULL
            `);
            console.log('✅ Column set to NOT NULL');
        } catch (err) {
            console.log(`⚠️  Could not set to NOT NULL: ${err.message.split('\n')[0]}`);
        }
        
        // Step 4: Add indexes
        console.log('Step 4: Adding indexes...');
        
        const indexes = [
            { name: 'idx_order_date', sql: 'CREATE INDEX idx_order_date ON orders(order_date)' },
            { name: 'idx_dealer_order_date', sql: 'CREATE INDEX idx_dealer_order_date ON orders(dealer_id, order_date)' },
            { name: 'idx_order_source_date', sql: 'CREATE INDEX idx_order_source_date ON orders(order_source, order_date)' }
        ];
        
        for (const idx of indexes) {
            try {
                await connection.execute(idx.sql);
                console.log(`✅ Index ${idx.name} created`);
            } catch (err) {
                if (err.code === 'ER_DUP_KEYNAME') {
                    console.log(`⚠️  Index ${idx.name} already exists, skipping...`);
                } else {
                    console.log(`⚠️  Could not create ${idx.name}: ${err.message.split('\n')[0]}`);
                }
            }
        }
        
        console.log('\n✅ Migration completed successfully!');
        
        // Verify
        const [columns] = await connection.execute(
            `SHOW COLUMNS FROM orders LIKE 'order_date'`
        );
        
        if (columns.length > 0) {
            console.log('\n✅ Verified: order_date column exists');
            console.log(`   Type: ${columns[0].Type}, Null: ${columns[0].Null}`);
        }
        
        await connection.end();
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        if (error.code) {
            console.error(`   Error Code: ${error.code}`);
        }
        if (connection) await connection.end();
        process.exit(1);
    }
}

runMigration();
