const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');

// Excel report generation function
function generateExcelReport(orders, date) {
    // Product segmentation mapping based on Book1.xlsx analysis
    const productSegments = {
        'PC': ['NS 40Z', 'NS 40ZL', 'NS 60', 'NS 60L', 'NS 60S', 'N50Z', 'N50ZL', 'NS 70', 'NS70L', 'N70', 'N70Z', 'N70ZL', 'NX 120-7', 'NX 120-7L', 'CCV 15', 'CCV 17', 'CCV 21', 'CCV 27', 'CCV 29', 'N 100', 'N 100Z', 'N 120', 'N 150', 'N 200'],
        'CV': ['SPB 50', 'SPB 70', 'SPB 100', 'SPB 130', 'SPB 165', 'SPB 200', 'SPB 100T', 'SPB 130T', 'SPB 165T', 'SPB 220T', 'SPB165T Gaston Premium', 'SPB200T Gaston Premium', 'TTB 165', 'TTB 200', 'TTB 230 Gasto Premium', '3CBL-165 Dimitris (18Months)', '3CBL-200 Dimitris (18Months)', '3CBL-165 Dimitris (30M)', '3CBL-200 Dimitris (30M)'],
        'SPB': ['400VA', '650VA', '600VA', '1050VA', '1450VA'],
        'ET': ['GSB 20', 'GSB 30', 'GSB 40', 'GSB 55', 'GSB 60', 'GSB 80 (1)', 'GSB 100 (1)', 'GSB 130'],
        'RB': ['R 45', 'R 50', 'GR 70', 'GR 80', 'GR 90', 'Dimitris 90', 'TRB 120', 'TRB 130', 'TRB 140', 'TRB-160 Gaston Plus', 'TRB 170', 'TRB210-CBL2020', 'TRB-200 Pongkhiraj', 'TRB210T-Volt Master', 'TRB190 Z Power', 'MISHUK-215 Kingshuk Power', 'MISHUK-215 Zynga Power', 'MISHUK-220 Kingshuk Power', 'Mishuk Z Power- 220 ', 'MISHUK-220-A+\r\n Zodiac Power', 'TRB-215T Banskhali King', 'TRB-400 Mishuk King', 'CTC-440 SURJO', '6TSN-1650 Tuffan', 'TRB400 Alpha Plus', 'MISHUK-400T Power Run', 'TRB480 Target Plus', 'TRB160 Alpha Plus', 'R 50T', 'R 60T', 'R 70T', 'AR 45', 'AR 50', 'AR 65', 'AR 70'],
        'GSB': ['30 AH', '75 AH', '90 AH', '95 AH', 'ET 120T-L', 'TYPHOON-180', 'TYPHOON-200 (H)'],
        'IPS': ['IPS Battery', 'IPS Control Unit', 'Solar Battery']
    };
    
    // Get all unique products from orders
    const allProducts = [];
    const productPriceMap = {};
    
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!allProducts.find(p => p.product_code === item.product_code)) {
                allProducts.push({
                    product_code: item.product_code,
                    product_name: item.product_name,
                    unit_tp: item.unit_tp,
                    mrp: item.mrp
                });
                productPriceMap[item.product_code] = {
                    unit_tp: item.unit_tp,
                    mrp: item.mrp
                };
            }
        });
    });
    
    // Sort products by code
    allProducts.sort((a, b) => a.product_code.localeCompare(b.product_code));
    
    // Calculate segment totals
    const segmentTotals = {};
    Object.keys(productSegments).forEach(segment => {
        segmentTotals[segment] = { qty: 0, value: 0 };
    });
    
    // Process orders and calculate totals
    const dealerData = [];
    let serialNo = 1;
    
    orders.forEach(order => {
        const dealerRow = {
            serialNo: serialNo++,
            territory: order.dealer_territory || '',
            dealerName: order.dealer_name || '',
            address: order.dealer_address || '',
            contact: order.dealer_contact || '',
            products: {},
            invoiceValue: 0,
            grossValue: 0,
            transport: 'Direct Rent Truck',
            totalInvoice: 0,
            totalGross: 0
        };
        
        // Initialize all products with 0 quantity
        allProducts.forEach(product => {
            dealerRow.products[product.product_code] = 0;
        });
        
        // Fill in actual quantities
        order.items.forEach(item => {
            dealerRow.products[item.product_code] = (dealerRow.products[item.product_code] || 0) + item.quantity;
            
            // Calculate values
            const itemValue = item.quantity * (item.unit_tp || 0);
            dealerRow.invoiceValue += itemValue;
            
            // Determine segment for this product
            Object.keys(productSegments).forEach(segment => {
                if (productSegments[segment].includes(item.product_code)) {
                    segmentTotals[segment].qty += item.quantity;
                    segmentTotals[segment].value += itemValue;
                }
            });
        });
        
        dealerRow.grossValue = dealerRow.invoiceValue * 1.11; // Assuming 11% markup
        dealerRow.totalInvoice = dealerRow.invoiceValue;
        dealerRow.totalGross = dealerRow.grossValue;
        
        dealerData.push(dealerRow);
    });
    
    // Create Excel workbook
    const workbook = XLSX.utils.book_new();
    
    // Prepare data array matching Book1.xlsx structure
    const excelData = [];
    
    // Summary section (rows 1-9)
    excelData.push(['Seg', 'Qty', 'Invoice Value']);
    excelData.push(['PC', segmentTotals.PC?.qty || 0, segmentTotals.PC?.value || 0]);
    excelData.push(['CV', segmentTotals.CV?.qty || 0, 'Gross Value']);
    excelData.push(['SPB', segmentTotals.SPB?.qty || 0, segmentTotals.SPB?.value || 0]);
    excelData.push(['ET', segmentTotals.ET?.qty || 0]);
    excelData.push(['RB', segmentTotals.RB?.qty || 0, 'Status']);
    excelData.push(['GSB', segmentTotals.GSB?.qty || 0, 'Open']);
    excelData.push(['IPS', segmentTotals.IPS?.qty || 0]);
    
    // Total row
    const totalQty = Object.values(segmentTotals).reduce((sum, seg) => sum + (seg.qty || 0), 0);
    const totalValue = Object.values(segmentTotals).reduce((sum, seg) => sum + (seg.value || 0), 0);
    excelData.push(['Total', totalQty, totalValue]);
    
    // Empty row
    excelData.push([]);
    
    // Header row
    const headerRow = [
        'Sl. No.', 'Territory', 'Name of Dealer', 'Address', 'Contact Person & Number'
    ];
    
    // Add product columns
    allProducts.forEach(product => {
        headerRow.push(product.product_code);
    });
    
    headerRow.push('Invoice Value', 'Gross Value', 'Transport', 'Total Invoice Value', 'Total Gross Value');
    excelData.push(headerRow);
    
    // Product codes row (same as products)
    const productCodesRow = ['', '', '', '', ''];
    allProducts.forEach(product => {
        productCodesRow.push(product.product_code);
    });
    productCodesRow.push('', '', '', '', '');
    excelData.push(productCodesRow);
    
    // Prices row
    const pricesRow = ['', '', '', '', ''];
    allProducts.forEach(product => {
        pricesRow.push(product.unit_tp || 0);
    });
    pricesRow.push('', '', '', '', '');
    excelData.push(pricesRow);
    
    // Dealer data rows
    dealerData.forEach(dealer => {
        const row = [
            dealer.serialNo,
            dealer.territory,
            dealer.dealerName,
            dealer.address,
            dealer.contact
        ];
        
        // Add product quantities
        allProducts.forEach(product => {
            row.push(dealer.products[product.product_code] || 0);
        });
        
        row.push(
            dealer.invoiceValue,
            dealer.grossValue,
            dealer.transport,
            dealer.totalInvoice,
            dealer.totalGross
        );
        
        excelData.push(row);
    });
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, `Invoice ${date.replace(/-/g, '.')}`);
    
    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    return excelBuffer;
}

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

// Create transport table if it doesn't exist
const createTransportTable = () => {
    const createTransportTableQuery = `
        CREATE TABLE IF NOT EXISTS transports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            truck_slno INT,
            truck_no VARCHAR(50),
            engine_no VARCHAR(100),
            truck_details VARCHAR(255),
            driver_name VARCHAR(100),
            route_no VARCHAR(50),
            load_size VARCHAR(50),
            load_weight VARCHAR(50),
            remarks TEXT,
            truck_type VARCHAR(50),
            entered_by VARCHAR(100),
            entered_date DATE,
            entered_terminal VARCHAR(100),
            updated_by VARCHAR(100),
            updated_date DATE,
            updated_terminal VARCHAR(100),
            license_no VARCHAR(100),
            transport_status VARCHAR(10) DEFAULT 'A',
            vehicle_no VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    
    db.query(createTransportTableQuery, (err, result) => {
        if (err) {
            console.error('Error creating transport table:', err);
        } else {
            console.log('Transport table created successfully');
        }
    });
};

// Connect to database first, then start server
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1); // Exit if database connection fails
    } else {
        console.log('Connected to MySQL database');

        // Create transport table
        createTransportTable();

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

        console.log('📁 Processing uploaded product file (CBL products only):', req.file.filename);

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
            const productCategory = row[columnMap.productCategory]?.toString().trim();
            
            // Skip if required fields are missing
            if (!productCode || !productName) {
                console.log(`⚠️ Skipping row ${i}: Missing required fields (product_code: ${productCode}, product_name: ${productName})`);
                errorCount++;
                continue;
            }

            // Skip if product category is not CBL
            if (productCategory !== 'CBL') {
                console.log(`⚠️ Skipping row ${i}: Product category is not CBL (${productCategory})`);
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
PRODUCT_CATEGORY
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
            message: 'CBL products imported successfully',
            imported: importedCount,
            duplicates: duplicateCount,
            errors: errorCount,
            note: 'Only products with PRODUCT_CATEGORY = CBL were imported'
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
    db.query('SELECT id, name FROM order_types', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get all warehouses
app.get('/api/warehouses', (req, res) => {
    db.query('SELECT id, name FROM warehouses', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get all dealers
app.get('/api/dealers', (req, res) => {
    db.query('SELECT id, name, territory_code, territory_name FROM dealers ORDER BY name', (err, results) => {
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
    db.query('SELECT id, name, product_code, unit_tp, mrp FROM products', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Create new order with multiple products
app.post('/api/orders', async (req, res) => {
    try {
        const { order_type_id, dealer_id, warehouse_id, transport_id, order_items } = req.body;
        
        // Validate required fields
        if (!order_type_id || !dealer_id || !warehouse_id || !transport_id || !order_items || !Array.isArray(order_items) || order_items.length === 0) {
            return res.status(400).json({ 
                error: 'Missing required fields: order_type_id, dealer_id, warehouse_id, transport_id, and order_items array' 
            });
        }

        // Validate each order item
        for (const item of order_items) {
            if (!item.product_id || !item.quantity || item.quantity <= 0) {
                return res.status(400).json({ 
                    error: 'Each order item must have product_id and quantity > 0' 
                });
            }
        }

        const order_id = 'ORD-' + uuidv4().substring(0, 8).toUpperCase();
        
        // Start transaction
        await db.promise().beginTransaction();
        
        try {
            // Create the main order
            await db.promise().query(`
                INSERT INTO orders (order_id, order_type_id, dealer_id, warehouse_id, transport_id) 
                VALUES (?, ?, ?, ?, ?)
            `, [order_id, order_type_id, dealer_id, warehouse_id]);

            // Add order items
            for (const item of order_items) {
                await db.promise().query(`
                    INSERT INTO order_items (order_id, product_id, quantity) 
                    VALUES (?, ?, ?)
                `, [order_id, item.product_id, item.quantity]);
            }

            // Commit transaction
            await db.promise().commit();

            res.json({ 
                success: true, 
                order_id: order_id,
                message: `Order created successfully with ${order_items.length} product(s)`,
                item_count: order_items.length
            });

        } catch (error) {
            // Rollback transaction on error
            await db.promise().rollback();
            throw error;
        }

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all orders with their items
app.get('/api/orders', (req, res) => {
    const query = `
        SELECT 
            o.*, 
            ot.name as order_type, 
            d.name as dealer_name, 
            d.territory_name as dealer_territory, 
            w.name as warehouse_name,
            COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN order_types ot ON o.order_type_id = ot.id
        LEFT JOIN dealers d ON o.dealer_id = d.id
        LEFT JOIN warehouses w ON o.warehouse_id = w.id
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        GROUP BY o.id, o.order_id, o.order_type_id, o.dealer_id, o.warehouse_id, o.created_at, ot.name, d.name, d.territory_name, w.name
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

// Get order details with items
app.get('/api/orders/:orderId', (req, res) => {
    const { orderId } = req.params;
    
    // Get order details
    const orderQuery = `
        SELECT o.*, ot.name as order_type, d.name as dealer_name, d.territory_name as dealer_territory, w.name as warehouse_name
        FROM orders o
        LEFT JOIN order_types ot ON o.order_type_id = ot.id
        LEFT JOIN dealers d ON o.dealer_id = d.id
        LEFT JOIN warehouses w ON o.warehouse_id = w.id
        WHERE o.order_id = ?
    `;
    
    db.query(orderQuery, [orderId], (err, orderResults) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (orderResults.length === 0) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        
        // Get order items
        const itemsQuery = `
            SELECT oi.*, p.name as product_name, p.product_code, p.unit_tp, p.mrp, p.unit_trade_price
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
            ORDER BY oi.id
        `;
        
        db.query(itemsQuery, [orderId], (err, itemsResults) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            const order = orderResults[0];
            order.items = itemsResults;
            
            res.json(order);
        });
    });
});

// Get orders for a specific date
app.get('/api/orders/date/:date', async (req, res) => {
    try {
        const { date } = req.params;
        
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }
        
        // Get orders for the specific date
        const ordersQuery = `
            SELECT 
                o.*, 
                ot.name as order_type, 
                d.name as dealer_name, 
                d.territory_name as dealer_territory,
                d.address as dealer_address,
                d.contact as dealer_contact,
                w.name as warehouse_name,
                DATE(o.created_at) as order_date
            FROM orders o
            LEFT JOIN order_types ot ON o.order_type_id = ot.id
            LEFT JOIN dealers d ON o.dealer_id = d.id
            LEFT JOIN warehouses w ON o.warehouse_id = w.id
            WHERE DATE(o.created_at) = ?
            ORDER BY o.created_at ASC
        `;
        
        const orders = await db.promise().query(ordersQuery, [date]);
        
        if (orders[0].length === 0) {
            return res.json({ 
                orders: [], 
                message: `No orders found for date: ${date}` 
            });
        }
        
        // Get order items for each order
        const ordersWithItems = [];
        for (const order of orders[0]) {
            const itemsQuery = `
                SELECT oi.*, p.name as product_name, p.product_code, p.unit_tp, p.mrp, p.unit_trade_price
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
                ORDER BY oi.id
            `;
            
            const items = await db.promise().query(itemsQuery, [order.order_id]);
            order.items = items[0];
            ordersWithItems.push(order);
        }
        
        res.json({ 
            orders: ordersWithItems,
            date: date,
            total_orders: ordersWithItems.length,
            total_items: ordersWithItems.reduce((sum, order) => sum + order.items.length, 0)
        });
        
    } catch (error) {
        console.error('Error fetching orders by date:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate Excel report for orders on a specific date
app.get('/api/orders/report/:date', async (req, res) => {
    try {
        const { date } = req.params;
        
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }
        
        // Get orders for the specific date (same query as above)
        const ordersQuery = `
            SELECT 
                o.*, 
                ot.name as order_type, 
                d.name as dealer_name, 
                d.territory_name as dealer_territory,
                d.address as dealer_address,
                d.contact as dealer_contact,
                w.name as warehouse_name,
                DATE(o.created_at) as order_date
            FROM orders o
            LEFT JOIN order_types ot ON o.order_type_id = ot.id
            LEFT JOIN dealers d ON o.dealer_id = d.id
            LEFT JOIN warehouses w ON o.warehouse_id = w.id
            WHERE DATE(o.created_at) = ?
            ORDER BY o.created_at ASC
        `;
        
        const orders = await db.promise().query(ordersQuery, [date]);
        
        if (orders[0].length === 0) {
            return res.status(404).json({ 
                error: `No orders found for date: ${date}` 
            });
        }
        
        // Get order items for each order
        const ordersWithItems = [];
        for (const order of orders[0]) {
            const itemsQuery = `
                SELECT oi.*, p.name as product_name, p.product_code, p.unit_tp, p.mrp, p.unit_trade_price
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
                ORDER BY oi.id
            `;
            
            const items = await db.promise().query(itemsQuery, [order.order_id]);
            order.items = items[0];
            ordersWithItems.push(order);
        }
        
        // Generate Excel report
        const reportData = generateExcelReport(ordersWithItems, date);
        
        // Set headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Daily_Order_Report_${date}.xlsx"`);
        
        res.send(reportData);
        
    } catch (error) {
        console.error('Error generating Excel report:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== TRANSPORT MANAGEMENT API ENDPOINTS =====

// Get all transports
app.get('/api/transports', (req, res) => {
    const query = 'SELECT id, truck_details FROM transports ORDER BY truck_details ASC';
    
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get transport by ID
app.get('/api/transports/:id', (req, res) => {
    const transportId = req.params.id;
    const query = 'SELECT * FROM transports WHERE id = ?';
    
    db.query(query, [transportId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'Transport not found' });
        } else {
            res.json(results[0]);
        }
    });
});

// Create new transport
app.post('/api/transports', (req, res) => {
    const {
        truck_slno, truck_no, engine_no, truck_details, driver_name, route_no,
        load_size, load_weight, remarks, truck_type, entered_by, entered_date,
        entered_terminal, updated_by, updated_date, updated_terminal,
        license_no, transport_status, vehicle_no
    } = req.body;

    const query = `
        INSERT INTO transports (
            truck_slno, truck_no, engine_no, truck_details, driver_name, route_no,
            load_size, load_weight, remarks, truck_type, entered_by, entered_date,
            entered_terminal, updated_by, updated_date, updated_terminal,
            license_no, transport_status, vehicle_no
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        truck_slno, truck_no, engine_no, truck_details, driver_name, route_no,
        load_size, load_weight, remarks, truck_type, entered_by, entered_date,
        entered_terminal, updated_by, updated_date, updated_terminal,
        license_no, transport_status, vehicle_no
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ 
                success: true, 
                id: result.insertId,
                message: 'Transport created successfully' 
            });
        }
    });
});

// Update transport
app.put('/api/transports/:id', (req, res) => {
    const transportId = req.params.id;
    const {
        truck_slno, truck_no, engine_no, truck_details, driver_name, route_no,
        load_size, load_weight, remarks, truck_type, entered_by, entered_date,
        entered_terminal, updated_by, updated_date, updated_terminal,
        license_no, transport_status, vehicle_no
    } = req.body;

    const query = `
        UPDATE transports SET 
            truck_slno = ?, truck_no = ?, engine_no = ?, truck_details = ?, 
            driver_name = ?, route_no = ?, load_size = ?, load_weight = ?, 
            remarks = ?, truck_type = ?, entered_by = ?, entered_date = ?, 
            entered_terminal = ?, updated_by = ?, updated_date = ?, 
            updated_terminal = ?, license_no = ?, transport_status = ?, 
            vehicle_no = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;

    const values = [
        truck_slno, truck_no, engine_no, truck_details, driver_name, route_no,
        load_size, load_weight, remarks, truck_type, entered_by, entered_date,
        entered_terminal, updated_by, updated_date, updated_terminal,
        license_no, transport_status, vehicle_no, transportId
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ 
                success: true, 
                message: 'Transport updated successfully' 
            });
        }
    });
});

// Delete transport
app.delete('/api/transports/:id', (req, res) => {
    const transportId = req.params.id;
    const query = 'DELETE FROM transports WHERE id = ?';

    db.query(query, [transportId], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Transport deleted successfully' });
        }
    });
});

// Import transports from Excel file
app.post('/api/transports/import', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row
        const rows = data.slice(1);

        let importedCount = 0;
        let errorCount = 0;

        for (const row of rows) {
            if (row.length < 17) continue; // Skip incomplete rows

            const [
                truck_slno, truck_no, engine_no, truck_details, driver_name, route_no,
                load_size, load_weight, remarks, truck_type, entered_by, entered_date,
                entered_terminal, updated_by, updated_date, updated_terminal,
                license_no, transport_status, vehicle_no
            ] = row;

            // Skip if truck_details is empty (required field)
            if (!truck_details) continue;

            const insertQuery = `
                INSERT INTO transports (
                    truck_slno, truck_no, engine_no, truck_details, driver_name, route_no,
                    load_size, load_weight, remarks, truck_type, entered_by, entered_date,
                    entered_terminal, updated_by, updated_date, updated_terminal,
                    license_no, transport_status, vehicle_no
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                truck_slno || null, truck_no || null, engine_no || null, truck_details || null,
                driver_name || null, route_no || null, load_size || null, load_weight || null,
                remarks || null, truck_type || null, entered_by || null, entered_date || null,
                entered_terminal || null, updated_by || null, updated_date || null,
                updated_terminal || null, license_no || null, transport_status || 'A',
                vehicle_no || null
            ];

            try {
                await db.promise().query(insertQuery, values);
                importedCount++;
            } catch (error) {
                console.error('Error importing transport:', error);
                errorCount++;
            }
        }

        // Delete the uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            message: `Transport import completed. ${importedCount} transports imported, ${errorCount} errors.`,
            imported: importedCount,
            errors: errorCount
        });

    } catch (error) {
        console.error('Transport import error:', error);
        res.status(500).json({ error: error.message });
    }
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

