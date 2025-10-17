const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept Excel and CSV files
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel' ||
            file.mimetype === 'text/csv' ||
            file.originalname.endsWith('.xlsx') ||
            file.originalname.endsWith('.xls') ||
            file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel and CSV files are allowed'), false);
        }
    }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '#lme11@@',
    database: 'cbl_ordres'
});

// Connect to database first, then start server
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1); // Exit if database connection fails
    } else {
        console.log('Connected to MySQL database');

        // Start server only after database connection is established
        app.listen(PORT, () => {
            console.log(`CBL Sales Order server running on port ${PORT}`);
        });
    }
});

// Routes

// Import products from Excel file
app.post('/api/products/import', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('📁 Processing uploaded product file:', req.file.filename);

        // Read the uploaded Excel file
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
            return res.status(400).json({ error: 'Excel file is empty' });
        }

        const headers = jsonData[0];
        console.log('📋 Headers found:', headers.length);

        // Map column indices - comprehensive mapping for all 27 columns
        const columnMap = {};
        headers.forEach((header, index) => {
            const headerStr = header?.toString().toLowerCase().trim() || '';
            
            // Map all columns from PRODUCT_PRICE_ERP2.xlsx
            if (headerStr.includes('product_code') || headerStr.includes('product code')) columnMap.productCode = index;
            if (headerStr.includes('product_name') || headerStr.includes('product name')) columnMap.productName = index;
            if (headerStr.includes('unit_measure') || headerStr.includes('unit measure')) columnMap.unitMeasure = index;
            if (headerStr.includes('product_category') || headerStr.includes('product category')) columnMap.productCategory = index;
            if (headerStr.includes('brand_code') || headerStr.includes('brand code')) columnMap.brandCode = index;
            if (headerStr.includes('brand_name') || headerStr.includes('brand name')) columnMap.brandName = index;
            if (headerStr.includes('application_code') || headerStr.includes('application code')) columnMap.applicationCode = index;
            if (headerStr.includes('application_name') || headerStr.includes('application name')) columnMap.applicationName = index;
            if (headerStr.includes('price_date') || headerStr.includes('price date')) columnMap.priceDate = index;
            if (headerStr.includes('unit_tp') || headerStr.includes('unit tp')) columnMap.unitTp = index;
            if (headerStr.includes('oem_price') || headerStr.includes('oem price')) columnMap.oemPrice = index;
            if (headerStr.includes('b2b_price') || headerStr.includes('b2b price')) columnMap.b2bPrice = index;
            if (headerStr.includes('special_price') || headerStr.includes('special price')) columnMap.specialPrice = index;
            if (headerStr.includes('employee_price') || headerStr.includes('employee price')) columnMap.employeePrice = index;
            if (headerStr.includes('cash_price') || headerStr.includes('cash price')) columnMap.cashPrice = index;
            if (headerStr.includes('mrp')) columnMap.mrp = index;
            if (headerStr.includes('unit_trade_price') || headerStr.includes('unit trade price')) columnMap.unitTradePrice = index;
            if (headerStr.includes('unit_vat') || headerStr.includes('unit vat')) columnMap.unitVat = index;
            if (headerStr.includes('supp_tax') || headerStr.includes('supp tax')) columnMap.suppTax = index;
            if (headerStr.includes('gross_profit') || headerStr.includes('gross profit')) columnMap.grossProfit = index;
            if (headerStr.includes('bonus_allow') || headerStr.includes('bonus allow')) columnMap.bonusAllow = index;
            if (headerStr.includes('discount_allow') || headerStr.includes('discount allow')) columnMap.discountAllow = index;
            if (headerStr.includes('discount_type') || headerStr.includes('discount type')) columnMap.discountType = index;
            if (headerStr.includes('discount_val') || headerStr.includes('discount val')) columnMap.discountVal = index;
            if (headerStr.includes('pack_size') || headerStr.includes('pack size')) columnMap.packSize = index;
            if (headerStr.includes('shipper_qty') || headerStr.includes('shipper qty')) columnMap.shipperQty = index;
            if (headerStr.includes('status')) columnMap.status = index;
        });

        console.log('📋 Column mapping:', columnMap);

        // Check if required columns are found
        if (columnMap.productCode === undefined || columnMap.productName === undefined) {
            console.log('❌ Required columns not found. Available headers:', headers);
            return res.status(400).json({ 
                error: 'Required columns (PRODUCT_CODE and PRODUCT_NAME) not found in Excel file',
                availableHeaders: headers
            });
        }

        // Start transaction
        await db.promise().beginTransaction();

        let importedCount = 0;
        let duplicateCount = 0;
        let errorCount = 0;

        // Process each row (skip header row)
        console.log(`📊 Processing ${jsonData.length - 1} data rows...`);
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;
            
            console.log(`📝 Processing row ${i}:`, row.slice(0, 5)); // Log first 5 columns

            const productCode = row[columnMap.productCode]?.toString().trim();
            const productName = row[columnMap.productName]?.toString().trim();
            
            // Skip if required fields are missing
            if (!productCode || !productName) {
                console.log(`⚠️ Skipping row ${i}: Missing required fields (product_code: ${productCode}, product_name: ${productName})`);
                errorCount++;
                continue;
            }

            const productData = [
                productCode,
                productName,
                row[columnMap.unitMeasure]?.toString().trim() || null,
                row[columnMap.productCategory]?.toString().trim() || null,
                row[columnMap.brandCode]?.toString().trim() || null,
                row[columnMap.brandName]?.toString().trim() || null,
                row[columnMap.applicationCode]?.toString().trim() || null,
                row[columnMap.applicationName]?.toString().trim() || null,
                row[columnMap.priceDate] ? new Date((row[columnMap.priceDate] - 25569) * 86400 * 1000) : null,
                row[columnMap.unitTp] ? parseFloat(row[columnMap.unitTp]) : null,
                row[columnMap.oemPrice] ? parseFloat(row[columnMap.oemPrice]) : null,
                row[columnMap.b2bPrice] ? parseFloat(row[columnMap.b2bPrice]) : null,
                row[columnMap.specialPrice] ? parseFloat(row[columnMap.specialPrice]) : null,
                row[columnMap.employeePrice] ? parseFloat(row[columnMap.employeePrice]) : null,
                row[columnMap.cashPrice] ? parseFloat(row[columnMap.cashPrice]) : null,
                row[columnMap.mrp] ? parseFloat(row[columnMap.mrp]) : null,
                row[columnMap.unitTradePrice] ? parseFloat(row[columnMap.unitTradePrice]) : null,
                row[columnMap.unitVat] ? parseFloat(row[columnMap.unitVat]) : null,
                row[columnMap.suppTax] ? parseFloat(row[columnMap.suppTax]) : null,
                row[columnMap.grossProfit] ? parseFloat(row[columnMap.grossProfit]) : null,
                row[columnMap.bonusAllow]?.toString().trim() || null,
                row[columnMap.discountAllow]?.toString().trim() || null,
                row[columnMap.discountType]?.toString().trim() || null,
                row[columnMap.discountVal] ? parseFloat(row[columnMap.discountVal]) : null,
                row[columnMap.packSize]?.toString().trim() || null,
                row[columnMap.shipperQty] ? parseInt(row[columnMap.shipperQty]) : null,
                row[columnMap.status]?.toString().trim() || null
            ];

            try {

                await db.promise().query(`
                    INSERT INTO products (
                        product_code, name, unit_measure, product_category, brand_code, brand_name,
                        application_code, application_name, price_date, unit_tp, oem_price, b2b_price,
                        special_price, employee_price, cash_price, mrp, unit_trade_price, unit_vat,
                        supp_tax, gross_profit, bonus_allow, discount_allow, discount_type,
                        discount_val, pack_size, shipper_qty, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, productData);

                importedCount++;
                console.log(`✅ Imported product: ${productData[1]} (${productData[0]})`);

            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    console.log(`🔄 Duplicate product: ${productData[1]} (${productData[0]})`);
                    duplicateCount++;
                } else {
                    console.log(`❌ Error importing row ${i}:`, error.message);
                    console.log(`❌ Product data:`, productData || 'Not defined');
                    errorCount++;
                }
            }
        }

        // Commit transaction
        await db.promise().commit();

        console.log(`✅ Import completed: ${importedCount} imported, ${duplicateCount} duplicates, ${errorCount} errors`);

        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('🗑️ Cleaned up uploaded file');
        }

        res.json({
            success: true,
            message: 'Products imported successfully',
            imported: importedCount,
            duplicates: duplicateCount,
            errors: errorCount
        });

    } catch (error) {
        console.error('❌ Import failed:', error.message);
        res.status(500).json({ error: 'Import failed: ' + error.message });
    }
});

// Import dealers from Excel file
app.post('/api/dealers/import', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('📁 Processing uploaded file:', req.file.filename);

        // Read the uploaded Excel file
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
            return res.status(400).json({ error: 'Excel file is empty' });
        }

        const headers = jsonData[0];
        console.log('📋 Headers found:', headers.length);

        // Map column indices - comprehensive mapping for all 30 columns
        const columnMap = {};
        headers.forEach((header, index) => {
            const headerStr = header?.toString().toLowerCase().trim() || '';
            
            // Map all columns from VW_ALL_CUSTOMER_INFO.xlsx
            if (headerStr.includes('dealer_code') || headerStr.includes('dealer code')) columnMap.dealerCode = index;
            if (headerStr.includes('dealer_name') || headerStr.includes('dealer name') || headerStr === 'dealername') columnMap.dealerName = index;
            if (headerStr.includes('short_name') || headerStr.includes('short name')) columnMap.shortName = index;
            if (headerStr.includes('proprietor_name') || headerStr.includes('proprietor name')) columnMap.proprietorName = index;
            if (headerStr.includes('dealer_address') || headerStr.includes('dealer address')) columnMap.address = index;
            if (headerStr.includes('dealer_contact') || headerStr.includes('dealer contact')) columnMap.contact = index;
            if (headerStr.includes('dealer_email') || headerStr.includes('dealer email')) columnMap.email = index;
            if (headerStr.includes('nat_code') || headerStr.includes('nat code')) columnMap.natCode = index;
            if (headerStr.includes('nat_name') || headerStr.includes('nat name')) columnMap.natName = index;
            if (headerStr.includes('div_code') || headerStr.includes('div code')) columnMap.divCode = index;
            if (headerStr.includes('div_name') || headerStr.includes('div name')) columnMap.divName = index;
            if (headerStr.includes('territory_code') || headerStr.includes('territory code')) columnMap.territoryCode = index;
            if (headerStr.includes('territory_name') || headerStr.includes('territory name')) columnMap.territoryName = index;
            if (headerStr.includes('dist_code') || headerStr.includes('dist code')) columnMap.distCode = index;
            if (headerStr.includes('dist_name') || headerStr.includes('dist name')) columnMap.distName = index;
            if (headerStr.includes('thana_code') || headerStr.includes('thana code')) columnMap.thanaCode = index;
            if (headerStr.includes('thana_name') || headerStr.includes('thana name')) columnMap.thanaName = index;
            if (headerStr.includes('sr_code') || headerStr.includes('sr code')) columnMap.srCode = index;
            if (headerStr.includes('sr_name') || headerStr.includes('sr name')) columnMap.srName = index;
            if (headerStr.includes('nsm_code') || headerStr.includes('nsm code')) columnMap.nsmCode = index;
            if (headerStr.includes('nsm_name') || headerStr.includes('nsm name')) columnMap.nsmName = index;
            if (headerStr.includes('cust_origin') || headerStr.includes('cust origin')) columnMap.custOrigin = index;
            if (headerStr.includes('dealer_status') || headerStr.includes('dealer status')) columnMap.dealerStatus = index;
            if (headerStr.includes('active_status') || headerStr.includes('active status')) columnMap.activeStatus = index;
            if (headerStr.includes('dealer_proptr') || headerStr.includes('dealer proptr')) columnMap.dealerProptr = index;
            if (headerStr.includes('dealer_type') || headerStr.includes('dealer type')) columnMap.dealerType = index;
            if (headerStr.includes('price_type') || headerStr.includes('price type')) columnMap.priceType = index;
            if (headerStr.includes('cust_disc_category') || headerStr.includes('cust disc category')) columnMap.custDiscCategory = index;
            if (headerStr.includes('party_type') || headerStr.includes('party type')) columnMap.partyType = index;
            if (headerStr.includes('erp_status') || headerStr.includes('erp status')) columnMap.erpStatus = index;
        });

        console.log('📋 Column mapping:', columnMap);

        // Check if required columns are found
        if (columnMap.dealerName === undefined) {
            console.log('❌ Required DEALER_NAME column not found. Available headers:', headers);
            return res.status(400).json({ 
                error: 'Required column (DEALER_NAME) not found in Excel file',
                availableHeaders: headers
            });
        }

        // If dealer_code is missing, we'll generate it from dealer_name
        const hasDealerCode = columnMap.dealerCode !== undefined;
        console.log(`📋 Dealer code column: ${hasDealerCode ? 'Found' : 'Will generate from dealer name'}`);

        // Start transaction
        await db.promise().beginTransaction();

        let importedCount = 0;
        let duplicateCount = 0;
        let errorCount = 0;

        // Process each row
        console.log(`📊 Processing ${jsonData.length - 1} data rows...`);
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;
            
            console.log(`📝 Processing row ${i}:`, row.slice(0, 5)); // Log first 5 columns

            const dealerName = row[columnMap.dealerName]?.toString().trim();
            
            // Skip if dealer name is missing
            if (!dealerName) {
                console.log(`⚠️ Skipping row ${i}: Missing dealer name`);
                errorCount++;
                continue;
            }

            // Generate dealer_code from dealer_name if not provided
            const dealerCode = hasDealerCode 
                ? row[columnMap.dealerCode]?.toString().trim() 
                : dealerName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 20);

            const dealerData = [
                dealerCode,
                dealerName,
                row[columnMap.shortName]?.toString().trim() || null,
                row[columnMap.proprietorName]?.toString().trim() || null,
                row[columnMap.address]?.toString().trim() || null,
                row[columnMap.contact]?.toString().trim() || null,
                row[columnMap.email]?.toString().trim() || null,
                row[columnMap.natCode]?.toString().trim() || null,
                row[columnMap.natName]?.toString().trim() || null,
                row[columnMap.divCode]?.toString().trim() || null,
                row[columnMap.divName]?.toString().trim() || null,
                row[columnMap.territoryCode]?.toString().trim() || null,
                row[columnMap.territoryName]?.toString().trim() || null,
                row[columnMap.distCode]?.toString().trim() || null,
                row[columnMap.distName]?.toString().trim() || null,
                row[columnMap.thanaCode]?.toString().trim() || null,
                row[columnMap.thanaName]?.toString().trim() || null,
                row[columnMap.srCode]?.toString().trim() || null,
                row[columnMap.srName]?.toString().trim() || null,
                row[columnMap.nsmCode]?.toString().trim() || null,
                row[columnMap.nsmName]?.toString().trim() || null,
                row[columnMap.custOrigin]?.toString().trim() || null,
                row[columnMap.dealerStatus]?.toString().trim() || null,
                row[columnMap.activeStatus]?.toString().trim() || null,
                row[columnMap.dealerProptr]?.toString().trim() || null,
                row[columnMap.dealerType]?.toString().trim() || null,
                row[columnMap.priceType]?.toString().trim() || null,
                row[columnMap.custDiscCategory]?.toString().trim() || null,
                row[columnMap.partyType]?.toString().trim() || null,
                row[columnMap.erpStatus]?.toString().trim() || null
            ];

            try {

                await db.promise().query(`
                    INSERT INTO dealers (
                        dealer_code, name, short_name, proprietor_name, address, contact, email,
                        nat_code, nat_name, div_code, div_name, territory_code, territory_name,
                        dist_code, dist_name, thana_code, thana_name, sr_code, sr_name,
                        nsm_code, nsm_name, cust_origin, dealer_status, active_status,
                        dealer_proptr, dealer_type, price_type, cust_disc_category, party_type, erp_status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, dealerData);

                importedCount++;
                console.log(`✅ Imported dealer: ${dealerData[1]} (${dealerData[0]})`);

            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    console.log(`🔄 Duplicate dealer: ${dealerData[1]} (${dealerData[0]})`);
                    duplicateCount++;
                } else {
                    console.log(`❌ Error importing row ${i}:`, error.message);
                    console.log(`❌ Dealer data:`, dealerData || 'Not defined');
                    console.log(`❌ Full error:`, error);
                    errorCount++;
                }
            }
        }

        // Commit transaction
        await db.promise().commit();

        console.log(`✅ Import completed: ${importedCount} imported, ${duplicateCount} duplicates, ${errorCount} errors`);

        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('🗑️ Cleaned up uploaded file');
        }

        res.json({
            success: true,
            message: 'Dealers imported successfully',
            imported: importedCount,
            duplicates: duplicateCount,
            errors: errorCount
        });

    } catch (error) {
        console.error('❌ Import failed:', error.message);
        res.status(500).json({ error: 'Import failed: ' + error.message });
    }
});

// Get all order types
app.get('/api/order-types', (req, res) => {
    db.query('SELECT * FROM order_types', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get all warehouses
app.get('/api/warehouses', (req, res) => {
    db.query('SELECT * FROM warehouses', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get all dealers
app.get('/api/dealers', (req, res) => {
    db.query('SELECT * FROM dealers ORDER BY name', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get dealers with filtering options
app.get('/api/dealers/filter', (req, res) => {
    const { territory, status, type } = req.query;
    let query = 'SELECT * FROM dealers WHERE 1=1';
    let params = [];

    if (territory) {
        query += ' AND (territory_name LIKE ? OR territory_code LIKE ?)';
        params.push(`%${territory}%`, `%${territory}%`);
    }

    if (status) {
        query += ' AND dealer_status = ?';
        params.push(status);
    }

    if (type) {
        query += ' AND dealer_type = ?';
        params.push(type);
    }

    query += ' ORDER BY name';

    db.query(query, params, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get all products
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Create new order
app.post('/api/orders', (req, res) => {
    const { order_type_id, dealer_id, warehouse_id, product_id, quantity } = req.body;
    const order_id = 'ORD-' + uuidv4().substring(0, 8).toUpperCase();
    
    const query = `
        INSERT INTO orders (order_id, order_type_id, dealer_id, warehouse_id, product_id, quantity) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [order_id, order_type_id, dealer_id, warehouse_id, product_id, quantity], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ 
                success: true, 
                order_id: order_id,
                message: 'Order created successfully' 
            });
        }
    });
});

// Get all orders
app.get('/api/orders', (req, res) => {
    const query = `
        SELECT o.*, ot.name as order_type, d.name as dealer_name, d.territory_name as dealer_territory, w.name as warehouse_name, p.name as product_name
        FROM orders o
        JOIN order_types ot ON o.order_type_id = ot.id
        JOIN dealers d ON o.dealer_id = d.id
        JOIN warehouses w ON o.warehouse_id = w.id
        JOIN products p ON o.product_id = p.id
        ORDER BY o.created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Delete an order by ID
app.delete('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;

    const query = 'DELETE FROM orders WHERE id = ?';

    db.query(query, [orderId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Order not found' });
        } else {
            res.json({
                success: true,
                message: 'Order deleted successfully'
            });
        }
    });
});

