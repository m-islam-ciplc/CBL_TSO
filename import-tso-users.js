const mysql = require('mysql2');
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '#lme11@@',
    database: process.env.DB_NAME || 'cbl_so',
    port: process.env.DB_PORT || 3306
});

// Function to clean name by removing prefixes
function cleanName(name) {
    if (!name) return '';
    
    let cleaned = name.trim();
    
    // Remove common prefixes (case-insensitive)
    const prefixes = ['Mr.', 'Mrs.', 'Miss.', 'Md.', 'Md ', 'Dr.', 'Eng.', 'Eng '];
    
    for (const prefix of prefixes) {
        if (cleaned.toLowerCase().startsWith(prefix.toLowerCase())) {
            cleaned = cleaned.substring(prefix.length).trim();
        }
    }
    
    return cleaned;
}

// Function to extract username from email
function getUsernameFromEmail(email) {
    if (!email) return '';
    return email.replace('@cg-bd.com', '').trim();
}

async function importTSOUsers() {
    try {
        console.log('📖 Reading TSO List.xlsx...');
        
        // Read the Excel file
        const workbook = XLSX.readFile('TSO List.xlsx');
        const sheetName = 'TSO List';
        
        if (!workbook.SheetNames.includes(sheetName)) {
            console.error(`❌ Sheet "${sheetName}" not found!`);
            console.log('Available sheets:', workbook.SheetNames);
            process.exit(1);
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`✅ Found ${data.length} rows in "${sheetName}" sheet`);
        
        // Hash password once for all users
        const passwordHash = await bcrypt.hash('123', 10);
        console.log('✅ Password hash generated');
        
        let imported = 0;
        let skipped = 0;
        let errors = [];
        
        // Process each row
        for (const row of data) {
            try {
                // Get email and name from row (handle exact column names with spaces)
                const email = row['Email'] || row.Email || row.email || '';
                const name = row['Employee Name'] || row['employee_name'] || row.name || '';
                const territory = row['Territory'] || row.Territory || row.territory || '';
                
                // Skip if essential data is missing
                if (!email || !name) {
                    console.log(`⚠️  Skipping row: Missing email or name`, { email, name });
                    skipped++;
                    continue;
                }
                
                // Extract username from email (remove @cg-bd.com)
                const username = getUsernameFromEmail(email);
                
                if (!username) {
                    console.log(`⚠️  Skipping row: Invalid email format`, { email });
                    skipped++;
                    continue;
                }
                
                // Clean name (remove prefixes)
                const fullName = cleanName(name);
                
                if (!fullName) {
                    console.log(`⚠️  Skipping row: Name is empty after cleaning`, { name });
                    skipped++;
                    continue;
                }
                
                // Clean territory name (trim whitespace and append " Territory" if not present)
                let territoryName = territory ? territory.trim() : null;
                if (territoryName && !territoryName.toLowerCase().endsWith('territory')) {
                    territoryName = territoryName + ' Territory';
                }
                
                // Insert user into database
                const query = `
                    INSERT INTO users (username, password_hash, full_name, role, territory_name)
                    VALUES (?, ?, ?, 'tso', ?)
                    ON DUPLICATE KEY UPDATE
                        full_name = VALUES(full_name),
                        territory_name = VALUES(territory_name),
                        password_hash = VALUES(password_hash)
                `;
                
                await new Promise((resolve, reject) => {
                    db.query(query, [username, passwordHash, fullName, territoryName], (err, result) => {
                        if (err) {
                            if (err.code === 'ER_DUP_ENTRY') {
                                console.log(`🔄 Updated existing user: ${username}`);
                                imported++;
                                resolve();
                            } else {
                                reject(err);
                            }
                        } else {
                            console.log(`✅ Imported user: ${username} (${fullName})`);
                            imported++;
                            resolve();
                        }
                    });
                });
                
            } catch (error) {
                console.error(`❌ Error processing row:`, error.message);
                errors.push({ row, error: error.message });
            }
        }
        
        console.log('\n📊 Import Summary:');
        console.log(`   ✅ Imported/Updated: ${imported}`);
        console.log(`   ⚠️  Skipped: ${skipped}`);
        console.log(`   ❌ Errors: ${errors.length}`);
        
        if (errors.length > 0) {
            console.log('\n❌ Errors:');
            errors.forEach((err, idx) => {
                console.log(`   ${idx + 1}. ${err.error}`);
            });
        }
        
        db.end();
        console.log('\n✅ Import completed!');
        
    } catch (error) {
        console.error('❌ Import failed:', error);
        db.end();
        process.exit(1);
    }
}

// Run the import
importTSOUsers();
