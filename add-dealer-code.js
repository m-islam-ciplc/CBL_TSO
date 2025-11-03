const XLSX = require('xlsx');
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '#lme11@@',
    database: 'cbl_so'
});

console.log('🔄 Adding DEALER_CODE column to dealers table...\n');

// Read the Excel file
const workbook = XLSX.readFile('VW_ALL_CUSTOMER_INFO.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

const headers = jsonData[0];
const dealerCodeIndex = headers.findIndex(h => h?.toString().toUpperCase().includes('DEALER_CODE'));
const dealerNameIndex = headers.findIndex(h => h?.toString().toUpperCase().includes('DEALER_NAME'));
const dealerAddressIndex = headers.findIndex(h => h?.toString().toUpperCase().includes('DEALER_ADDRESS'));
const dealerContactIndex = headers.findIndex(h => h?.toString().toUpperCase().includes('DEALER_CONTACT'));
const territoryCodeIndex = headers.findIndex(h => h?.toString().toUpperCase().includes('TERRITORY_CODE'));
const territoryNameIndex = headers.findIndex(h => h?.toString().toUpperCase().includes('TERRITORY_NAME'));

console.log(`📋 Column indices:`);
console.log(`  DEALER_CODE: ${dealerCodeIndex}`);
console.log(`  DEALER_NAME: ${dealerNameIndex}`);
console.log(`  DEALER_ADDRESS: ${dealerAddressIndex}`);
console.log(`  DEALER_CONTACT: ${dealerContactIndex}`);
console.log(`  TERRITORY_CODE: ${territoryCodeIndex}`);
console.log(`  TERRITORY_NAME: ${territoryNameIndex}`);

// Connect to database and update schema
db.connect(async (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }

    console.log('✅ Connected to database');

    try {
        // Start transaction
        await db.promise().beginTransaction();

        // Temporarily disable foreign key checks
        await db.promise().query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('🔓 Disabled foreign key checks');

        // Delete all orders first (to remove foreign key references)
        await db.promise().query('DELETE FROM orders');
        console.log('🗑️  Deleted all orders');

        // Drop existing dealers table
        await db.promise().query('DROP TABLE IF EXISTS dealers');
        console.log('🗑️  Dropped existing dealers table');

        // Create new dealers table with DEALER_CODE
        await db.promise().query(`
            CREATE TABLE dealers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                dealer_code VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                address TEXT,
                contact VARCHAR(100),
                territory_code VARCHAR(50),
                territory_name VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created new dealers table with DEALER_CODE');

        // Insert data from Excel file (skip duplicates)
        let insertedCount = 0;
        let duplicateCount = 0;
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row[dealerCodeIndex] && row[dealerCodeIndex].trim() && row[dealerNameIndex] && row[dealerNameIndex].trim()) {
                const dealerData = [
                    row[dealerCodeIndex]?.trim(),
                    row[dealerNameIndex]?.trim(),
                    row[dealerAddressIndex]?.trim() || null,
                    row[dealerContactIndex]?.trim() || null,
                    row[territoryCodeIndex]?.trim() || null,
                    row[territoryNameIndex]?.trim() || null
                ];

                try {
                    await db.promise().query(
                        'INSERT INTO dealers (dealer_code, name, address, contact, territory_code, territory_name) VALUES (?, ?, ?, ?, ?, ?)',
                        dealerData
                    );
                    insertedCount++;
                } catch (error) {
                    if (error.code === 'ER_DUP_ENTRY') {
                        duplicateCount++;
                        console.log(`⚠️ Skipped duplicate dealer code: ${dealerData[0]}`);
                    } else {
                        throw error;
                    }
                }
            }
        }

        console.log(`✅ Inserted ${insertedCount} dealers with DEALER_CODE`);
        if (duplicateCount > 0) {
            console.log(`⚠️ Skipped ${duplicateCount} duplicate dealer codes`);
        }

        // Re-enable foreign key checks
        await db.promise().query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('🔒 Re-enabled foreign key checks');

        // Commit transaction
        await db.promise().commit();
        console.log('✅ Transaction committed');

        // Verify the import
        const [count] = await db.promise().query('SELECT COUNT(*) as count FROM dealers');
        console.log(`📊 Verification: ${count[0].count} dealers in database`);

        // Show sample data with DEALER_CODE
        const [sample] = await db.promise().query('SELECT dealer_code, name, territory_name FROM dealers LIMIT 3');
        console.log('📋 Sample dealers with DEALER_CODE:');
        sample.forEach(dealer => console.log(`  - ${dealer.dealer_code}: ${dealer.name} (${dealer.territory_name})`));

    } catch (error) {
        console.error('❌ Error during update:', error.message);
        await db.promise().rollback();
        console.log('❌ Transaction rolled back');
    } finally {
        db.end();
        console.log('\n🔚 DEALER_CODE column addition completed!');
    }
});
