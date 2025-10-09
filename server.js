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
        // Accept Excel files only
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel' ||
            file.originalname.endsWith('.xlsx') ||
            file.originalname.endsWith('.xls')) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'), false);
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

        // Map column indices
        const columnMap = {};
        headers.forEach((header, index) => {
            const headerStr = header?.toString().toUpperCase() || '';
            if (headerStr.includes('DEALER_CODE')) columnMap.dealerCode = index;
            if (headerStr.includes('DEALER_NAME')) columnMap.dealerName = index;
            if (headerStr.includes('SHORT_NAME')) columnMap.shortName = index;
            if (headerStr.includes('PROPRIETOR_NAME')) columnMap.proprietorName = index;
            if (headerStr.includes('DEALER_ADDRESS')) columnMap.address = index;
            if (headerStr.includes('DEALER_CONTACT')) columnMap.contact = index;
            if (headerStr.includes('DEALER_EMAIL')) columnMap.email = index;
            if (headerStr.includes('TERRITORY_CODE')) columnMap.territoryCode = index;
            if (headerStr.includes('TERRITORY_NAME')) columnMap.territoryName = index;
            if (headerStr.includes('DEALER_STATUS')) columnMap.status = index;
            if (headerStr.includes('DEALER_TYPE')) columnMap.type = index;
        });

        console.log('📋 Column mapping:', columnMap);

        // Start transaction
        await db.promise().beginTransaction();

        let importedCount = 0;
        let duplicateCount = 0;
        let errorCount = 0;

        // Process each row
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];

            try {
                const dealerData = [
                    row[columnMap.dealerCode]?.toString().trim(),
                    row[columnMap.dealerName]?.toString().trim(),
                    row[columnMap.shortName]?.toString().trim() || null,
                    row[columnMap.proprietorName]?.toString().trim() || null,
                    row[columnMap.address]?.toString().trim() || null,
                    row[columnMap.contact]?.toString().trim() || null,
                    row[columnMap.email]?.toString().trim() || null,
                    row[columnMap.territoryCode]?.toString().trim() || null,
                    row[columnMap.territoryName]?.toString().trim() || null,
                    row[columnMap.status]?.toString().trim() || null,
                    row[columnMap.type]?.toString().trim() || null
                ];

                // Skip if required fields are missing
                if (!dealerData[0] || !dealerData[1]) {
                    errorCount++;
                    continue;
                }

                await db.promise().query(`
                    INSERT INTO dealers (
                        dealer_code, name, short_name, proprietor_name, address, contact, email,
                        territory_code, territory_name, dealer_status, dealer_type
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, dealerData);

                importedCount++;

            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    duplicateCount++;
                } else {
                    console.error('Error inserting row:', error.message);
                    errorCount++;
                }
            }
        }

        // Commit transaction
        await db.promise().commit();

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        console.log(`✅ Import completed: ${importedCount} imported, ${duplicateCount} duplicates, ${errorCount} errors`);

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

