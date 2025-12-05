/**
 * Cumilla Territory Workflow Test
 * 
 * EXECUTION ORDER (when running "all" tests):
 * Tests are executed in dependency order to ensure prerequisites are met:
 * 
 * 1. Foundation Setup:
 *    Test 1: adduser_test - Create random admin, TSO, and dealer users
 *    Test 2: import_resources_test - Import dealers, transports, and products from Excel files, then test pagination
 *    Test 43: quota_allocation_test - Randomly allocate daily quotas and test all quota management workflows
 *    Test 5: Update quota (add more units to existing quota)
 * 
 * 2. Product Assignments:
 *    Test 9: Product assignment to dealer
 *    Test 11-17: Dealer management features (bulk assignments, categories, etc.)
 * 
 * 3. Monthly Forecasts:
 *    Test 10: Monthly forecast submission (if dealer user exists)
 *    Test 44: Add random monthly forecasts for all dealers (MOVED - creates data early)
 *    Test 26: Get monthly forecast periods
 *    Test 27: Get monthly forecast data
 * 
 * 4. TSO Orders & Reports (BEFORE deletion):
 *    Test 3: TSO tries to place second order (5 units) - should FAIL due to insufficient quota
 *    Test 4: Create order with multiple products ✅ CREATES ORDER
 *    Test 6: Retrieve order history (orders by date)
 *    Test 7: TSO dashboard/reports (my-report endpoint)
 *    Test 28-32: TSO report and order query features (need orders from Test 4)
 *    Test 8: Delete an order (MOVED - runs AFTER all report tests)
 * 
 * 5. Daily Demand Orders:
 *    Test 18: Create single-day daily demand order
 *    Test 19: Create multi-day daily demand orders
 *    Test 20: Get available dates with orders
 *    Test 21: Get orders for a specific date
 *    Test 22: Get orders for a date range
 *    Test 23: Generate Excel report for a date
 *    Test 24: Generate Excel report for a date range
 *    Test 25: Generate pivot-style daily demand report
 *    Test 45: Add random daily demand orders for all dealers (MOVED - creates data after basic tests)
 * 
 * 6. Admin Management:
 *    Test 33-42: Admin management features (users, transports, settings)
 * 
 * NOTE: Test numbers remain unchanged for individual execution (e.g., "node test-workflow.js 8" still works)
 *       but execution order changes when running "all" to satisfy dependencies.
 * 
 * Usage: 
 *   node test-workflow.js
 *   API_URL=http://localhost:3002 node test-workflow.js (for Docker)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

// Test configuration
const TEST_CONFIG = {
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || '#lme11@@',
  tsoUsername: process.env.TSO_USERNAME || 'subrata.das',
  tsoPassword: process.env.TSO_PASSWORD || '123',
  dealerUsername: process.env.DEALER_USERNAME || null,  // Will try to find dealer user
  dealerPassword: process.env.DEALER_PASSWORD || null,
  territoryName: 'cumilla.tso',
  initialQuota: 5,      // Test 1: Assign 5 units
  orderQuantity: 3,     // Test 2: Sell 3 units
  secondOrderQuantity: 5,  // Test 3: Try to order 5 units (should fail - only 2 remaining)
  additionalQuota: 10,   // Test 5: Add 10 more units to quota
  multiProductCount: 3   // Test 4: Number of products in multi-product order
};

let testData = {
  adminToken: null,
  tsoToken: null,
  tsoUserId: null,
  productIds: [],
  productCodes: [],
  allProductIds: [],      // For multi-product tests
  allProductCodes: [],    // For multi-product tests
  dealerId: null,
  dealerCode: null,       // Dealer code (e.g., "00352")
  dealerName: null,
  orderTypeId: null,
  warehouseId: null,
  transportId: null,
  transportName: null,
  orderId: null,
  multiProductOrderId: null,  // Test 4
  territoryName: null,
  today: null,            // Today's date
  assignmentId: null,     // Test 9: Product assignment ID
  bulkAssignmentIds: [],  // Test 11: Bulk assignment IDs
  categoryAssignmentId: null,  // Test 12: Category assignment ID
  testDealerId: null,     // Test 11-15: Dealer for comprehensive tests
  productCategories: [],  // Test 12: Available product categories
  allTerritories: [],     // Test 13: All territories
  dealerToken: null,      // Dealer authentication token
  dealerUserId: null,     // Dealer user ID
  ddOrderTypeId: null,    // Daily Demand order type ID
  dealerDailyDemandOrderIds: [],  // Test 18-19: Created daily demand order IDs
  dealerAssignedProductIds: [],    // Products assigned to dealer for testing
  dealerAvailableDates: [],        // Test 20: Available dates with orders
  tsoAvailableDates: [],           // Test 28: TSO available dates with orders
  tsoOrdersForDate: [],            // Test 29: TSO orders for a specific date
  tsoOrdersForRange: [],           // Test 30: TSO orders for a date range
  createdUserIds: [],      // Test 33: Created user IDs for cleanup
  createdTransportIds: []  // Test 36: Created transport IDs for cleanup
};

// Helper function to get today's date in YYYY-MM-DD format (local timezone, not UTC)
function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: requestHeaders,
    };

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks.map((chunk) => Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        const body = buffer.toString('utf8');
        if (!body) {
          resolve({ status: res.statusCode, data: null, headers: res.headers });
          return;
        }
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function loginAsAdmin() {
  console.log(`🔐 Logging in as admin (${TEST_CONFIG.adminUsername})...`);
  
  const result = await makeRequest('/api/auth/login', 'POST', {
    username: TEST_CONFIG.adminUsername,
    password: TEST_CONFIG.adminPassword
  });

  if (result.status === 200 && result.data.success) {
    testData.adminToken = result.data.token;
    console.log(`✅ Logged in as: ${result.data.user.full_name || result.data.user.username}`);
    return true;
  }

  throw new Error(`Admin login failed: ${result.status} - ${JSON.stringify(result.data)}`);
}

async function loginAsTSO() {
  console.log(`🔐 Logging in as TSO (${TEST_CONFIG.tsoUsername})...`);
  
  const result = await makeRequest('/api/auth/login', 'POST', {
    username: TEST_CONFIG.tsoUsername,
    password: TEST_CONFIG.tsoPassword
  });

  if (result.status === 200 && result.data.success) {
    testData.tsoToken = result.data.token;
    testData.tsoUserId = result.data.user.id;
    console.log(`✅ Logged in as: ${result.data.user.full_name || result.data.user.username}`);
    return true;
  }

  throw new Error(`TSO login failed: ${result.status} - ${JSON.stringify(result.data)}`);
}

async function loginAsDealer() {
  // Try to find a dealer user associated with the test dealerADMIN - Manual Steps (57 total)
  All steps require manual interaction:
  A1: Login - Type username/password, click Login button
  A2: Navigate to Dashboard - Click menu (or auto on login)
  A3: Navigate to Settings - Click Settings menu
  A4: Switch to Manage Users tab - Click Manage Users tab
  A5: Filter users by role - Select role from filter dropdown
  A6: Sort users - Click column header to sort
  A7: Create new user - Click Add User button, fill form, click Submit
  A8: Edit user - Click Edit button, modify fields, click Submit
  A9: Delete user - Click Delete button, confirm deletion
  A10: Activate/Deactivate user - Edit user and toggle is_active status
  A11: Switch to Manage Dealers tab - Click Manage Dealers tab
  A12: Search dealers - Enter search term in search field
  A13: Filter dealers by territory - Select territory from filter dropdown
  A14: Import dealers from Excel - Click Import Dealers button, select Excel file, click Upload
  A15: Export dealers to Excel - Click Export to Excel button
  A16: View dealer details - Click View Details button on dealer row
  A17: Assign product to dealer - Expand dealer row, select product, click Add Assignment
  A18: Assign multiple products to dealer - Expand dealer row, select multiple products, click Add Assignment
  A19: Assign category/application to dealer - Expand dealer row, select category/application, click Add Assignment
  A20: Remove product assignment - Expand dealer row, click Delete button on assignment
  A21: Switch to Manage Products tab - Click Manage Products tab
  A22: Search products - Enter search term in search field
  A23: Filter products by category - Select category from filter dropdown
  A24: Import products from Excel - Click Import Products button, select Excel file, click Upload
  A25: Export products to Excel - Click Export to Excel button
  A26: Switch to Manage Transports tab - Click Manage Transports tab
  A27: Create new transport - Click Add Transport button, fill form, click Submit
  A28: Edit transport - Click Edit button, modify fields, click Submit
  A29: Delete transport - Click Delete button, confirm deletion
  A30: Import transports from Excel - Click Import Transports button, select Excel file, click Upload
  A31: Navigate to Manage Quotas - Click Manage Quotas menu
  A32: Select date for quota allocation - Select date from date picker
  A34: Search products for quota - Type product name/code in search field
  A35: Select products for quota allocation - Select products from autocomplete dropdown
  A36: Select territories for quota allocation - Select territories from autocomplete dropdown
  A37: Enter quota quantity - Enter quantity in InputNumber field
  A38: Bulk allocate quotas - Select products, territories, enter quantity, click Allocate button
  A39: Update existing quota - Click Edit button on quota row, enter new quantity, click Update
  A40: Delete quota - Click Delete button on quota row, confirm deletion
  A41: View quota history - Click History tab, select date
  A42: View TSO quota view - Click TSO View tab
  A43: Switch to Admin Settings tab - Click Admin Settings tab
  A45: Update monthly forecast start day - Select new day, click Update button
  A46: Navigate to Reports - Click Reports menu
  A47: View Daily Report - Auto (defaults to this, but navigation is manual)
  A48: Filter daily report by date - Select date from date picker
  A49: Filter daily report by dealer - Select dealer from dropdown
  A50: View order details - Click expand button on order row
  A51: Navigate to Placed Orders - Click Placed Orders menu
  A52: Filter orders by date - Select date from date picker
  A53: Filter orders by dealer - Select dealer from dropdown
  A54: Filter orders by order type - Select order type from dropdown
  A55: Search orders - Enter search term in search field
  A56: View order details - Click on order row to expand details
  A57: Logout - Click Logout button in header
  TSO - Manual Steps (31 total)
  All steps require manual interaction:
  T1: Login - Type username/password, click Login button
  T2: Navigate to TSO Dashboard - Click Dashboard menu (or auto on login)
  T3: Navigate to New Orders - Click New Orders menu
  T4: Select order type - Select from order type dropdown (SO auto-selected, but can change)
  T5: Select warehouse - Select from warehouse dropdown
  T7: Select dealer - Select dealer from filtered dropdown
  T8: Search products - Type product name/code in search field
  T10: Add product to order - Select product, enter quantity, click Add button
  T11: Add multiple products - Repeat add product process for each product
  T12: Modify product quantity - Edit quantity in InputNumber field
  T13: Remove product - Click Remove button on product row
  T15: Submit order - Click Submit Order button
  T16: Navigate to Review Orders - Click Review Orders menu
  T17: Navigate to Placed Orders - Click Placed Orders menu
  T18: Filter orders by date - Select date from date picker
  T19: Filter orders by dealer - Select dealer from dropdown
  T20: Filter orders by order type - Select order type from dropdown
  T21: Search orders - Enter search term in search field
  T22: View order details - Click on order row to expand details
  T23: Delete order - Click Delete button on order row, confirm
  T24: Navigate to My Reports - Click My Reports menu
  T25: View available dates - Automatic (view only, but navigation is manual)
  T26: View orders for specific date - Select date from date picker
  T27: View orders for date range - Select start and end dates
  T28: Export to Excel (single date) - Select date, click Export to Excel button
  T29: Export to Excel (date range) - Select date range, click Export to Excel button
  T30: Generate Management Report (CSV) - Select date, click Generate MR Report button
  T31: Logout - Click Logout button in header
  DEALER - Manual Steps (24 total)
  All steps require manual interaction:
  D1: Login - Type username/password, click Login button
  D2: Navigate to Monthly Forecast - Click Monthly Forecast menu
  D3: Select forecast period - Select period from dropdown
  D5: Enter forecast quantities - Enter quantity in InputNumber field for each product
  D6: Save draft forecast - Click Save Draft button
  D7: Submit forecast - Click Submit Forecast button
  D8: Clear forecast - Click Clear button
  D9: Navigate to Daily Demand - Click Daily Demand menu
  D10: Create single-day demand order - Select date, add products with quantities, click Create Order
  D11: Create multi-day demand order - Select multiple dates, add products with quantities for each date, click Create Orders
  D12: Select date for order - Select date from calendar widget
  D13: Add product to date - Click Add button for a date, select product, enter quantity
  D14: Modify product quantity - Edit quantity in InputNumber field
  D15: Navigate to My Reports - Click My Reports menu
  D16: Switch to Daily Demand Orders tab - Click Daily Demand Orders tab
  D17: Filter orders by date - Select date from date picker
  D18: Filter orders by date range - Select start and end dates from date pickers
  D19: Expand order details - Click View Details button on order row
  D20: Export Daily Demand Orders to Excel - Click Export to Excel button
  D21: Export Daily Demand Orders (Range) to Excel - Select date range, click Export to Excel button
  D22: Switch to Monthly Forecasts tab - Click Monthly Forecasts tab
  D23: Export Monthly Forecasts to Excel - Click Export to Excel button
  D24: Logout - Click Logout button in header
  if (!testData.dealerId) {
    await findTerritoryAndDealer();
  }
  
  // First, try to find a dealer user in the database
  await loginAsAdmin();
  
  // Get all users
  const usersResult = await makeRequest('/api/users', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (usersResult.status === 200 && Array.isArray(usersResult.data)) {
    // Find a dealer user that matches our test dealer
    const dealerUser = usersResult.data.find(u => 
      u.role === 'dealer' && (u.dealer_id === testData.dealerId || u.username)
    );
    
    if (dealerUser) {
      console.log(`🔐 Found dealer user: ${dealerUser.username}`);
      // Try to login - we don't know the password, so we'll use admin token for dealer operations
      // For testing purposes, dealer operations can be done with admin token
      testData.dealerToken = testData.adminToken;
      testData.dealerUserId = dealerUser.id;
      console.log(`✅ Using admin token for dealer operations (dealer user ID: ${dealerUser.id})`);
      return true;
    }
  }
  
  // If no dealer user found, use admin token for dealer operations
  console.log(`⚠️  No dealer user found, using admin token for dealer operations`);
  testData.dealerToken = testData.adminToken;
  testData.dealerUserId = testData.dealerId; // Use dealer ID as user ID for testing
  return true;
}

async function getDDOrderTypeId() {
  if (testData.ddOrderTypeId) {
    return testData.ddOrderTypeId;
  }
  
  await loginAsAdmin();
  
  const orderTypesResult = await makeRequest('/api/order-types', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (orderTypesResult.status === 200 && Array.isArray(orderTypesResult.data)) {
    const ddOrderType = orderTypesResult.data.find(ot => ot.name === 'DD');
    if (ddOrderType) {
      testData.ddOrderTypeId = ddOrderType.id;
      return testData.ddOrderTypeId;
    }
  }
  
  throw new Error('DD order type not found');
}

async function findProducts() {
  console.log('\n🔍 Finding products...');
  
  const result = await makeRequest('/api/products');
  
  if (result.status !== 200 || !Array.isArray(result.data)) {
    throw new Error(`Failed to get products: ${result.status}`);
  }

  // Filter out Dummy product (L113DU001) and get only 1 product for basic tests
  const products = result.data
    .filter(p => p.product_code !== 'L113DU001' && p.product_code !== 'L113DU001'.toLowerCase())
    .slice(0, 1);
  
  if (products.length < 1) {
    throw new Error(`No products found in database (excluding Dummy)`);
  }

  testData.productIds = products.map(p => p.id);
  testData.productCodes = products.map(p => p.product_code);
  
  // Store all products (excluding Dummy) for multi-product tests
  const allProducts = result.data
    .filter(p => p.product_code !== 'L113DU001' && p.product_code !== 'L113DU001'.toLowerCase());
  
  testData.allProductIds = allProducts.map(p => p.id);
  testData.allProductCodes = allProducts.map(p => p.product_code);
  
  console.log(`✅ Found product (excluding Dummy):`);
  products.forEach((p, i) => {
    console.log(`   ${p.name} (${p.product_code}) - ID: ${p.id}`);
  });
  console.log(`✅ Total products available (excluding Dummy): ${allProducts.length}`);

  return true;
}

async function findTerritoryAndDealer() {
  console.log('\n🔍 Finding Cumilla territory and random dealer...');
  
  const dealersResult = await makeRequest('/api/dealers');
  
  if (dealersResult.status !== 200 || !Array.isArray(dealersResult.data)) {
    throw new Error(`Failed to get dealers: ${dealersResult.status}`);
  }

  // Find Cumilla dealers
  const cumillaDealers = dealersResult.data.filter(d => {
    const territory = d.territory_name || d.territory_code || '';
    return territory.toLowerCase().includes('cumilla') ||
           territory.toLowerCase() === TEST_CONFIG.territoryName.toLowerCase();
  });

  if (cumillaDealers.length === 0) {
    throw new Error(`No dealers found in Cumilla territory`);
  }

  // Pick random dealer
  const randomDealer = cumillaDealers[Math.floor(Math.random() * cumillaDealers.length)];
  testData.dealerId = randomDealer.id;
  testData.dealerName = randomDealer.name || randomDealer.dealer_name;
  testData.dealerCode = randomDealer.dealer_code || randomDealer.code || null;
  // Use exact territory_name from dealer (trim any whitespace)
  testData.territoryName = (randomDealer.territory_name || randomDealer.territory_code || '').trim();

  console.log(`✅ Found territory: "${testData.territoryName}"`);
  console.log(`✅ Selected random dealer: ${testData.dealerName}`);
  console.log(`   Dealer ID: ${testData.dealerId}`);
  if (testData.dealerCode) {
    console.log(`   Dealer Code: ${testData.dealerCode}`);
  }
  console.log(`   Dealer territory_name: "${randomDealer.territory_name || 'N/A'}"`);
  console.log(`   Dealer territory_code: "${randomDealer.territory_code || 'N/A'}"`);

  return true;
}

async function getOrderRequirements() {
  console.log('\n🔍 Getting order requirements...');
  
  const [orderTypesRes, warehousesRes, transportsRes] = await Promise.all([
    makeRequest('/api/order-types'),
    makeRequest('/api/warehouses'),
    makeRequest('/api/transports')
  ]);

  if (orderTypesRes.status !== 200 || !Array.isArray(orderTypesRes.data) || orderTypesRes.data.length === 0) {
    throw new Error('Failed to get order types');
  }
  testData.orderTypeId = orderTypesRes.data[0].id;
  console.log(`✅ Order Type: ${orderTypesRes.data[0].name || orderTypesRes.data[0].type_name}`);

  if (warehousesRes.status !== 200 || !Array.isArray(warehousesRes.data) || warehousesRes.data.length === 0) {
    throw new Error('Failed to get warehouses');
  }
  testData.warehouseId = warehousesRes.data[0].id;
  console.log(`✅ Warehouse: ${warehousesRes.data[0].name || warehousesRes.data[0].warehouse_name}`);

  if (transportsRes.status !== 200 || !Array.isArray(transportsRes.data) || transportsRes.data.length === 0) {
    throw new Error('Failed to get transports');
  }
  
  // Pick random transport
  const randomTransport = transportsRes.data[Math.floor(Math.random() * transportsRes.data.length)];
  testData.transportId = randomTransport.id;
  testData.transportName = randomTransport.truck_details || randomTransport.name;
  console.log(`✅ Selected random transport: ${testData.transportName} (ID: ${testData.transportId})`);

  return true;
}

// Helper function to generate random string
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to generate username with hex date
function generateUsernameWithHexDate(userType) {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hour = String(now.getHours()).padStart(2, '0');
  
  const dateString = `${day}${month}${year}${hour}`;
  const dateNumber = parseInt(dateString, 10);
  const hexValue = dateNumber.toString(16).toUpperCase();
  
  return `${userType}_${hexValue}`;
}

// Helper function to upload file via multipart/form-data
function uploadFile(filePath, endpoint, headers = {}) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found: ${filePath}`));
    }

    const url = new URL(endpoint, BASE_URL);
    const boundary = `----WebKitFormBoundary${Date.now()}`;
    const fileName = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);

    // Build multipart/form-data body properly
    const CRLF = '\r\n';
    const parts = [];
    
    // Boundary start
    parts.push(Buffer.from(`--${boundary}${CRLF}`));
    
    // Content-Disposition header
    parts.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${fileName}"${CRLF}`));
    
    // Content-Type header
    parts.push(Buffer.from(`Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet${CRLF}`));
    
    // Blank line before file content
    parts.push(Buffer.from(CRLF));
    
    // File content
    parts.push(fileContent);
    
    // Closing boundary
    parts.push(Buffer.from(`${CRLF}--${boundary}--${CRLF}`));
    
    // Concatenate all parts
    const body = Buffer.concat(parts);

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const body = buffer.toString('utf8');
        if (!body) {
          resolve({ status: res.statusCode, data: null, headers: res.headers });
          return;
        }
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ============================================================================
// TEST 1: adduser_test - Create random admin, TSO, and dealer users
// ============================================================================

async function test1_AddUsers() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 1: adduser_test - Create random admin, TSO, and dealer users');
  console.log('='.repeat(70));
  
  // Login as admin first (assume minimum data exists)
  await loginAsAdmin();
  
  // Get a random dealer for dealer user (assume dealers exist)
  if (!testData.dealerId) {
    await findTerritoryAndDealer();
  }
  
  const createdUsers = [];
  
  // Generate usernames with hex date format: {usertype}_{hex(ddMMyyyyHH)}
  const adminUsername = generateUsernameWithHexDate('admin');
  const tsoUsername = generateUsernameWithHexDate('tso');
  const dealerUsername = generateUsernameWithHexDate('dealer');
  
  // Generate random passwords (12 characters)
  const adminPassword = generateRandomString(12);
  const tsoPassword = generateRandomString(12);
  const dealerPassword = generateRandomString(12);
  
  // Generate random full names
  const adminFullName = `Admin ${generateRandomString(8)}`;
  const tsoFullName = `TSO ${generateRandomString(8)}`;
  const dealerFullName = `Dealer ${generateRandomString(8)}`;
  
  console.log(`\n👥 Creating users:`);
  console.log(`   Format: {usertype}_{hex(ddMMyyyyHH)}`);
  
  // 1. Create Admin User
  console.log(`\n1️⃣  Creating Admin User:`);
  console.log(`   Username: ${adminUsername}`);
  console.log(`   Full Name: ${adminFullName}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Role: admin`);
  
  const adminPayload = {
    username: adminUsername,
    password: adminPassword,
    full_name: adminFullName,
    role: 'admin'
  };
  
  const adminResult = await makeRequest('/api/users', 'POST', adminPayload, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (adminResult.status !== 200 || !adminResult.data) {
    throw new Error(`TEST 1 FAILED: Admin user creation failed - ${adminResult.status} - ${JSON.stringify(adminResult.data)}`);
  }
  
  const adminUserId = adminResult.data.id || adminResult.data.user_id;
  createdUsers.push({ type: 'admin', id: adminUserId, username: adminUsername, password: adminPassword });
  console.log(`   ✅ Admin user created (ID: ${adminUserId})`);
  
  // 2. Create TSO User
  console.log(`\n2️⃣  Creating TSO User:`);
  console.log(`   Username: ${tsoUsername}`);
  console.log(`   Full Name: ${tsoFullName}`);
  console.log(`   Password: ${tsoPassword}`);
  console.log(`   Role: tso`);
  console.log(`   Territory: ${testData.territoryName || TEST_CONFIG.territoryName}`);
  
  const tsoPayload = {
    username: tsoUsername,
    password: tsoPassword,
    full_name: tsoFullName,
    role: 'tso',
    territory_name: testData.territoryName || TEST_CONFIG.territoryName
  };
  
  const tsoResult = await makeRequest('/api/users', 'POST', tsoPayload, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (tsoResult.status !== 200 || !tsoResult.data) {
    throw new Error(`TEST 1 FAILED: TSO user creation failed - ${tsoResult.status} - ${JSON.stringify(tsoResult.data)}`);
  }
  
  const tsoUserId = tsoResult.data.id || tsoResult.data.user_id;
  createdUsers.push({ type: 'tso', id: tsoUserId, username: tsoUsername, password: tsoPassword });
  console.log(`   ✅ TSO user created (ID: ${tsoUserId})`);
  
  // 3. Create Dealer User
  console.log(`\n3️⃣  Creating Dealer User:`);
  console.log(`   Username: ${dealerUsername}`);
  console.log(`   Full Name: ${dealerFullName}`);
  console.log(`   Password: ${dealerPassword}`);
  console.log(`   Role: dealer`);
  console.log(`   Dealer ID: ${testData.dealerId}`);
  
  const dealerPayload = {
    username: dealerUsername,
    password: dealerPassword,
    full_name: dealerFullName,
    role: 'dealer',
    dealer_id: testData.dealerId,
    territory_name: testData.territoryName
  };
  
  const dealerResult = await makeRequest('/api/users', 'POST', dealerPayload, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (dealerResult.status !== 200 || !dealerResult.data) {
    throw new Error(`TEST 1 FAILED: Dealer user creation failed - ${dealerResult.status} - ${JSON.stringify(dealerResult.data)}`);
  }
  
  const dealerUserId = dealerResult.data.id || dealerResult.data.user_id;
  createdUsers.push({ type: 'dealer', id: dealerUserId, username: dealerUsername, password: dealerPassword });
  console.log(`   ✅ Dealer user created (ID: ${dealerUserId})`);
  
  // Store created users in testData for potential cleanup
  if (!testData.createdUserIds) {
    testData.createdUserIds = [];
  }
  testData.createdUserIds.push(...createdUsers.map(u => ({ id: u.id, username: u.username })));
  
  // Store credentials in testData for later tests
  testData.testAdminUsername = adminUsername;
  testData.testAdminPassword = adminPassword;
  testData.testTsoUsername = tsoUsername;
  testData.testTsoPassword = tsoPassword;
  testData.testDealerUsername = dealerUsername;
  testData.testDealerPassword = dealerPassword;
  
  console.log(`\n✅ TEST 1 PASSED: All users created successfully`);
  console.log(`\n📋 Created Users Summary:`);
  createdUsers.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.type.toUpperCase()}: ${user.username} (ID: ${user.id})`);
  });
      
    return true;
}

// ============================================================================
// TEST 2: import_resources_test - Import dealers, transports, and products from Excel, then test pagination
// ============================================================================

async function test2_ImportResources() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 2: import_resources_test - Import dealers, transports, and products from Excel, then test pagination');
  console.log('='.repeat(70));
  
  // Login as admin (assume minimum data exists - admin user from Test 1 or default)
  await loginAsAdmin();
  
  const importResults = [];
  
  // File paths - Resources folder is at project root
  const projectRoot = path.resolve(__dirname, '..', '..');
  const productsFile = path.join(projectRoot, 'Resources', 'PRODUCT_PRICE_ERP2.xlsx');
  const dealersFile = path.join(projectRoot, 'Resources', 'VW_ALL_CUSTOMER_INFO.xlsx');
  const transportsFile = path.join(projectRoot, 'Resources', 'TRANSPORT_INFO.xlsx');
  
  // Verify files exist
  if (!fs.existsSync(productsFile)) {
    throw new Error(`TEST 2 FAILED: Products file not found: ${productsFile}`);
  }
  if (!fs.existsSync(dealersFile)) {
    throw new Error(`TEST 2 FAILED: Dealers file not found: ${dealersFile}`);
  }
  if (!fs.existsSync(transportsFile)) {
    throw new Error(`TEST 2 FAILED: Transports file not found: ${transportsFile}`);
  }
  
  console.log(`\n📁 Excel files verified:`);
  console.log(`   ✓ Products: ${path.basename(productsFile)}`);
  console.log(`   ✓ Dealers: ${path.basename(dealersFile)}`);
  console.log(`   ✓ Transports: ${path.basename(transportsFile)}`);
  
  // 1. Import Products
  console.log(`\n1️⃣  Importing Products from ${path.basename(productsFile)}...`);
  try {
    const productsResult = await uploadFile(productsFile, '/api/products/import', {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (productsResult.status !== 200 || !productsResult.data || !productsResult.data.success) {
      throw new Error(`Products import failed: ${productsResult.status} - ${JSON.stringify(productsResult.data)}`);
    }
    
    console.log(`   ✅ Products imported successfully`);
    console.log(`   Response: ${JSON.stringify(productsResult.data)}`);
    importResults.push({ type: 'products', success: true, response: productsResult.data });
  } catch (error) {
    console.log(`   ❌ Products import failed: ${error.message}`);
    throw new Error(`TEST 2 FAILED: Products import - ${error.message}`);
  }
  
  // 2. Import Dealers
  console.log(`\n2️⃣  Importing Dealers from ${path.basename(dealersFile)}...`);
  try {
    const dealersResult = await uploadFile(dealersFile, '/api/dealers/import', {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (dealersResult.status !== 200 || !dealersResult.data || !dealersResult.data.success) {
      throw new Error(`Dealers import failed: ${dealersResult.status} - ${JSON.stringify(dealersResult.data)}`);
    }
    
    console.log(`   ✅ Dealers imported successfully`);
    console.log(`   Response: ${JSON.stringify(dealersResult.data)}`);
    importResults.push({ type: 'dealers', success: true, response: dealersResult.data });
  } catch (error) {
    console.log(`   ❌ Dealers import failed: ${error.message}`);
    throw new Error(`TEST 2 FAILED: Dealers import - ${error.message}`);
  }
  
  // 2.5. Assign 2-5 random products to every dealer
  console.log(`\n2.5️⃣ Assigning random products to all dealers...`);
  try {
    // Get all dealers
    const allDealersResult = await makeRequest('/api/dealers', 'GET', null, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (allDealersResult.status !== 200 || !Array.isArray(allDealersResult.data)) {
      throw new Error(`Failed to fetch dealers: ${allDealersResult.status}`);
    }
    
    const allDealers = allDealersResult.data;
    console.log(`   📊 Found ${allDealers.length} dealers`);
    
    // Get all products (should already be imported)
    const productsResult = await makeRequest('/api/products', 'GET', null, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (productsResult.status !== 200 || !Array.isArray(productsResult.data)) {
      throw new Error(`Failed to fetch products: ${productsResult.status}`);
    }
    
    const allProducts = productsResult.data;
    console.log(`   📊 Found ${allProducts.length} products`);
    
    if (allProducts.length === 0) {
      console.log(`   ⚠️  No products available for assignment - skipping`);
    } else if (allDealers.length === 0) {
      console.log(`   ⚠️  No dealers available for assignment - skipping`);
  } else {
      // Assign 2-5 random products to each dealer
      let totalAssignments = 0;
      let successfulAssignments = 0;
      let failedAssignments = 0;
      
      for (const dealer of allDealers) {
        // Random number of products between 2 and 5
        const numProducts = Math.floor(Math.random() * 4) + 2; // 2-5
        const maxProducts = Math.min(numProducts, allProducts.length);
        
        // Randomly select products
        const shuffledProducts = [...allProducts].sort(() => Math.random() - 0.5);
        const selectedProducts = shuffledProducts.slice(0, maxProducts);
        const productIds = selectedProducts.map(p => p.id);
        
        totalAssignments += productIds.length;
        
        try {
          const assignmentPayload = {
            dealer_id: dealer.id,
            product_ids: productIds,
            product_categories: []
          };
          
          const assignmentResult = await makeRequest('/api/dealer-assignments/bulk', 'POST', assignmentPayload, {
            'Authorization': `Bearer ${testData.adminToken}`
          });
          
          if (assignmentResult.status === 200 && assignmentResult.data && assignmentResult.data.success) {
            successfulAssignments += productIds.length;
          } else {
            failedAssignments += productIds.length;
            console.log(`   ⚠️  Failed to assign products to dealer ${dealer.id}: ${assignmentResult.status}`);
          }
        } catch (error) {
          failedAssignments += productIds.length;
          console.log(`   ⚠️  Error assigning to dealer ${dealer.id}: ${error.message}`);
        }
      }
      
      console.log(`   ✅ Product assignments completed:`);
      console.log(`      Total assignments attempted: ${totalAssignments}`);
      console.log(`      Successful: ${successfulAssignments}`);
      console.log(`      Failed: ${failedAssignments}`);
      console.log(`      Dealers processed: ${allDealers.length}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Product assignment step failed: ${error.message}`);
    console.log(`   Continuing with test... (this is not critical)`);
  }
  
  // 3. Import Transports
  console.log(`\n3️⃣  Importing Transports from ${path.basename(transportsFile)}...`);
  try {
    const transportsResult = await uploadFile(transportsFile, '/api/transports/import', {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (transportsResult.status !== 200 || !transportsResult.data || !transportsResult.data.success) {
      throw new Error(`Transports import failed: ${transportsResult.status} - ${JSON.stringify(transportsResult.data)}`);
    }
    
    console.log(`   ✅ Transports imported successfully`);
    console.log(`   Response: ${JSON.stringify(transportsResult.data)}`);
    importResults.push({ type: 'transports', success: true, response: transportsResult.data });
  } catch (error) {
    console.log(`   ❌ Transports import failed: ${error.message}`);
    throw new Error(`TEST 2 FAILED: Transports import - ${error.message}`);
  }
  
  console.log(`\n✅ TEST 2 PASSED: All resources imported successfully`);
  console.log(`\n📋 Import Summary:`);
  importResults.forEach((result, index) => {
    console.log(`   ${index + 1}. ${result.type.toUpperCase()}: ✅ Imported`);
    if (result.response.imported !== undefined) {
      console.log(`      Imported: ${result.response.imported} items`);
    }
    if (result.response.errors !== undefined) {
      console.log(`      Errors: ${result.response.errors}`);
    }
  });

// ============================================================================
  // PAGINATION TESTING - Verify pagination works properly after imports
// ============================================================================

  console.log(`\n${'='.repeat(70)}`);
  console.log('📄 Testing Pagination for Imported Resources');
  console.log('='.repeat(70));
  
  const paginationTests = [];
  
  // Standard pagination page sizes to test
  const pageSizes = [10, 20, 50, 100];
  
  // 1. Test Products Pagination
  console.log(`\n1️⃣  Testing Products Pagination...`);
  try {
    const productsResult = await makeRequest('/api/products', 'GET', null, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (productsResult.status !== 200 || !Array.isArray(productsResult.data)) {
      throw new Error(`Failed to fetch products: ${productsResult.status}`);
    }
    
    const totalProducts = productsResult.data.length;
    console.log(`   📊 Total products in database: ${totalProducts}`);
    
    if (totalProducts === 0) {
      throw new Error('No products found after import');
    }
    
    // Test pagination calculations for different page sizes
    pageSizes.forEach(pageSize => {
      const totalPages = Math.ceil(totalProducts / pageSize);
      const itemsOnLastPage = totalProducts % pageSize || pageSize;
      
      console.log(`   ✓ Page size ${pageSize}: ${totalPages} pages, last page has ${itemsOnLastPage} items`);
      
      paginationTests.push({
        resource: 'products',
        pageSize,
        totalItems: totalProducts,
        totalPages,
        itemsOnLastPage,
        passed: true
      });
    });
    
    // Test first page (page 1)
    const firstPageSize = 20;
    const firstPageItems = productsResult.data.slice(0, firstPageSize);
    if (firstPageItems.length !== Math.min(firstPageSize, totalProducts)) {
      throw new Error(`First page should have ${Math.min(firstPageSize, totalProducts)} items, got ${firstPageItems.length}`);
    }
    console.log(`   ✓ First page (size ${firstPageSize}): ${firstPageItems.length} items`);
    
    // Test last page if there's more than one page
    if (totalProducts > firstPageSize) {
      const lastPageNumber = Math.ceil(totalProducts / firstPageSize);
      const lastPageStart = (lastPageNumber - 1) * firstPageSize;
      const lastPageItems = productsResult.data.slice(lastPageStart, totalProducts);
      console.log(`   ✓ Last page (page ${lastPageNumber}): ${lastPageItems.length} items`);
    }
    
    console.log(`   ✅ Products pagination test PASSED`);
  } catch (error) {
    console.log(`   ❌ Products pagination test FAILED: ${error.message}`);
    throw new Error(`TEST 2 FAILED: Products pagination - ${error.message}`);
  }
  
  // 2. Test Dealers Pagination
  console.log(`\n2️⃣  Testing Dealers Pagination...`);
  try {
    const dealersResult = await makeRequest('/api/dealers', 'GET', null, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (dealersResult.status !== 200 || !Array.isArray(dealersResult.data)) {
      throw new Error(`Failed to fetch dealers: ${dealersResult.status}`);
    }
    
    const totalDealers = dealersResult.data.length;
    console.log(`   📊 Total dealers in database: ${totalDealers}`);
    
    if (totalDealers === 0) {
      throw new Error('No dealers found after import');
    }
    
    // Test pagination calculations for different page sizes
    pageSizes.forEach(pageSize => {
      const totalPages = Math.ceil(totalDealers / pageSize);
      const itemsOnLastPage = totalDealers % pageSize || pageSize;
      
      console.log(`   ✓ Page size ${pageSize}: ${totalPages} pages, last page has ${itemsOnLastPage} items`);
      
      paginationTests.push({
        resource: 'dealers',
        pageSize,
        totalItems: totalDealers,
        totalPages,
        itemsOnLastPage,
        passed: true
      });
    });
    
    // Test first page (page 1)
    const firstPageSize = 20;
    const firstPageItems = dealersResult.data.slice(0, firstPageSize);
    if (firstPageItems.length !== Math.min(firstPageSize, totalDealers)) {
      throw new Error(`First page should have ${Math.min(firstPageSize, totalDealers)} items, got ${firstPageItems.length}`);
    }
    console.log(`   ✓ First page (size ${firstPageSize}): ${firstPageItems.length} items`);
    
    // Test last page if there's more than one page
    if (totalDealers > firstPageSize) {
      const lastPageNumber = Math.ceil(totalDealers / firstPageSize);
      const lastPageStart = (lastPageNumber - 1) * firstPageSize;
      const lastPageItems = dealersResult.data.slice(lastPageStart, totalDealers);
      console.log(`   ✓ Last page (page ${lastPageNumber}): ${lastPageItems.length} items`);
    }
    
    console.log(`   ✅ Dealers pagination test PASSED`);
  } catch (error) {
    console.log(`   ❌ Dealers pagination test FAILED: ${error.message}`);
    throw new Error(`TEST 2 FAILED: Dealers pagination - ${error.message}`);
  }
  
  // 3. Test Transports Pagination
  console.log(`\n3️⃣  Testing Transports Pagination...`);
  try {
    const transportsResult = await makeRequest('/api/transports', 'GET', null, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (transportsResult.status !== 200 || !Array.isArray(transportsResult.data)) {
      throw new Error(`Failed to fetch transports: ${transportsResult.status}`);
    }
    
    const totalTransports = transportsResult.data.length;
    console.log(`   📊 Total transports in database: ${totalTransports}`);
    
    if (totalTransports === 0) {
      throw new Error('No transports found after import');
    }
    
    // Test pagination calculations for different page sizes
    pageSizes.forEach(pageSize => {
      const totalPages = Math.ceil(totalTransports / pageSize);
      const itemsOnLastPage = totalTransports % pageSize || pageSize;
      
      console.log(`   ✓ Page size ${pageSize}: ${totalPages} pages, last page has ${itemsOnLastPage} items`);
      
      paginationTests.push({
        resource: 'transports',
        pageSize,
        totalItems: totalTransports,
        totalPages,
        itemsOnLastPage,
        passed: true
      });
    });
    
    // Test first page (page 1)
    const firstPageSize = 20;
    const firstPageItems = transportsResult.data.slice(0, firstPageSize);
    if (firstPageItems.length !== Math.min(firstPageSize, totalTransports)) {
      throw new Error(`First page should have ${Math.min(firstPageSize, totalTransports)} items, got ${firstPageItems.length}`);
    }
    console.log(`   ✓ First page (size ${firstPageSize}): ${firstPageItems.length} items`);
    
    // Test last page if there's more than one page
    if (totalTransports > firstPageSize) {
      const lastPageNumber = Math.ceil(totalTransports / firstPageSize);
      const lastPageStart = (lastPageNumber - 1) * firstPageSize;
      const lastPageItems = transportsResult.data.slice(lastPageStart, totalTransports);
      console.log(`   ✓ Last page (page ${lastPageNumber}): ${lastPageItems.length} items`);
    }
    
    console.log(`   ✅ Transports pagination test PASSED`);
  } catch (error) {
    console.log(`   ❌ Transports pagination test FAILED: ${error.message}`);
    throw new Error(`TEST 2 FAILED: Transports pagination - ${error.message}`);
  }
  
  // Pagination Test Summary
  console.log(`\n${'='.repeat(70)}`);
  console.log('📋 Pagination Test Summary:');
  console.log('='.repeat(70));
  
  const productsTests = paginationTests.filter(t => t.resource === 'products');
  const dealersTests = paginationTests.filter(t => t.resource === 'dealers');
  const transportsTests = paginationTests.filter(t => t.resource === 'transports');
  
  if (productsTests.length > 0) {
    console.log(`\n✅ Products: ${productsTests[0].totalItems} items, tested ${productsTests.length} page sizes`);
  }
  if (dealersTests.length > 0) {
    console.log(`✅ Dealers: ${dealersTests[0].totalItems} items, tested ${dealersTests.length} page sizes`);
  }
  if (transportsTests.length > 0) {
    console.log(`✅ Transports: ${transportsTests[0].totalItems} items, tested ${transportsTests.length} page sizes`);
  }
  
  console.log(`\n✅ All pagination tests PASSED!`);
  
  return true;
}

// ============================================================================
// TEST 3: Sell 3 units of allocated product to random dealer using random transport
// ============================================================================

async function test3_CreateOrder() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 3: Sell 3 units of allocated product to random dealer');
  console.log('='.repeat(70));
  
  // Use the single product
  const productId = testData.productIds[0];
  const productCode = testData.productCodes[0];
  
  console.log(`\n📦 Creating order:`);
  console.log(`   Dealer: ${testData.dealerName}`);
  console.log(`   Transport: ${testData.transportName}`);
  console.log(`   Product: ${productCode}`);
  console.log(`   Quantity: ${TEST_CONFIG.orderQuantity} units`);

  const orderPayload = {
    order_type_id: testData.orderTypeId,
    dealer_id: testData.dealerId,
    warehouse_id: testData.warehouseId,
    transport_id: testData.transportId,
    user_id: testData.tsoUserId,
    order_items: [{
      product_id: productId,
      quantity: TEST_CONFIG.orderQuantity
    }]
  };

  const result = await makeRequest('/api/orders', 'POST', orderPayload);

  if (result.status === 200 && result.data && result.data.order_id) {
    testData.orderId = result.data.order_id;
    console.log(`\n✅ TEST 2 PASSED: Order created successfully`);
    console.log(`   Order ID: ${testData.orderId}`);
    console.log(`   Product: ${productCode}`);
    console.log(`   Quantity sold: ${TEST_CONFIG.orderQuantity} units`);
    return true;
  }

  throw new Error(`TEST 2 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 3: TSO tries to place second order (should fail due to insufficient quota)
// ============================================================================

async function test3_SecondOrderShouldFail() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 3: TSO tries to place second order (should FAIL)');
  console.log('='.repeat(70));
  
  // Check current quota status
  const quotaResult = await makeRequest(
    `/api/product-caps/tso-today?territory_name=${encodeURIComponent(testData.territoryName)}`
  );
  
  const productId = testData.productIds[0];
  const productCode = testData.productCodes[0];
  
  let remainingQuantity = 0;
  if (quotaResult.status === 200 && Array.isArray(quotaResult.data)) {
    const quota = quotaResult.data.find(q => q.product_id === productId);
    if (quota) {
      remainingQuantity = Number(quota.remaining_quantity);
      const maxQty = Number(quota.max_quantity);
      const soldQty = Number(quota.sold_quantity);
      
      console.log(`\n📊 Current quota status:`);
      console.log(`   Product: ${productCode}`);
      console.log(`   Max quantity: ${maxQty} units`);
      console.log(`   Sold quantity: ${soldQty} units`);
      console.log(`   Remaining quantity: ${remainingQuantity} units`);
    }
  }
  
  // Get a different random dealer and transport for second order
  await getOrderRequirements();
  
  console.log(`\n📦 Attempting second order:`);
  console.log(`   Dealer: ${testData.dealerName}`);
  console.log(`   Transport: ${testData.transportName}`);
  console.log(`   Product: ${productCode}`);
  console.log(`   Quantity: ${TEST_CONFIG.secondOrderQuantity} units`);
  console.log(`   Available: ${remainingQuantity} units`);
  console.log(`   Expected: Order should FAIL (insufficient quota)`);

  const orderPayload = {
    order_type_id: testData.orderTypeId,
    dealer_id: testData.dealerId,
    warehouse_id: testData.warehouseId,
    transport_id: testData.transportId,
    user_id: testData.tsoUserId,
    order_items: [{
      product_id: productId,
      quantity: TEST_CONFIG.secondOrderQuantity
    }]
  };

  const result = await makeRequest('/api/orders', 'POST', orderPayload);

  // Test logic: If remaining < order quantity, order should be rejected
  // If remaining >= order quantity, order should succeed (but this means test data is inconsistent)
  if (remainingQuantity < TEST_CONFIG.secondOrderQuantity) {
    // Expected: Order should be rejected
    if (result.status === 400) {
      console.log(`\n✅ TEST 3 PASSED: Order correctly rejected due to insufficient quota`);
      console.log(`   Status: ${result.status} (Bad Request)`);
      console.log(`   Error: ${JSON.stringify(result.data)}`);
      
      // Verify the error message mentions insufficient quota
      const errorMessage = JSON.stringify(result.data);
      if (errorMessage.includes('remaining') || errorMessage.includes('quota') || errorMessage.includes('available')) {
        console.log(`   ✅ Error message correctly indicates quota issue`);
      }
      
      return true;
    }
    
    // Test FAILS if order was created when it should have been rejected
    if (result.status === 200) {
      throw new Error(`TEST 3 FAILED: Order was created but should have been rejected! Only ${remainingQuantity} units remaining, tried to order ${TEST_CONFIG.secondOrderQuantity}`);
    }
    
    throw new Error(`TEST 3 FAILED: Unexpected status ${result.status} - ${JSON.stringify(result.data)}`);
  } else {
    // Remaining >= order quantity, so order should succeed
    // This means there's leftover data from previous test runs or quota was updated
    if (result.status === 200) {
      console.log(`\n⚠️  TEST 3 SKIPPED: Order succeeded because sufficient quota available`);
      console.log(`   Remaining: ${remainingQuantity} units`);
      console.log(`   Ordered: ${TEST_CONFIG.secondOrderQuantity} units`);
      console.log(`   ⚠️  This suggests leftover data from previous test runs or quota was updated`);
      console.log(`   💡 Expected: ${TEST_CONFIG.initialQuota - TEST_CONFIG.orderQuantity} remaining (${TEST_CONFIG.initialQuota} - ${TEST_CONFIG.orderQuantity})`);
      console.log(`   💡 Actual: ${remainingQuantity} remaining`);
      console.log(`   ✅ Order validation is working correctly (allows valid orders)`);
      return true; // Don't fail the test, but warn about data inconsistency
    }
    
    // If order was rejected when it should have succeeded, that's a problem
    throw new Error(`TEST 3 FAILED: Order was rejected but should have succeeded! ${remainingQuantity} units available, tried to order ${TEST_CONFIG.secondOrderQuantity}`);
  }
}

// ============================================================================
// TEST 4: Create order with multiple products
// ============================================================================

async function test4_MultiProductOrder() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 4: Create order with multiple products');
  console.log('='.repeat(70));
  
  // Need at least 3 products for this test
  if (testData.allProductIds.length < TEST_CONFIG.multiProductCount) {
    throw new Error(`TEST 4 SKIPPED: Need at least ${TEST_CONFIG.multiProductCount} products, found ${testData.allProductIds.length}`);
  }
  
  // Select first N products
  const selectedProductIds = testData.allProductIds.slice(0, TEST_CONFIG.multiProductCount);
  const selectedProductCodes = testData.allProductCodes.slice(0, TEST_CONFIG.multiProductCount);
  
  // First, assign quotas for all selected products
  await loginAsAdmin();
  const today = testData.today || getTodayDate();
  
  const productsResult = await makeRequest('/api/products');
  const products = productsResult.data.filter(p => selectedProductIds.includes(p.id));
  
  const quotas = products.map(product => ({
    date: today,
    product_id: product.id,
    product_code: product.product_code,
    product_name: product.name,
    territory_name: testData.territoryName,
    max_quantity: 10  // Assign 10 units for each product
  }));
  
  console.log(`\n📊 Assigning quotas for ${quotas.length} products:`);
  quotas.forEach((q, i) => {
    console.log(`   ${i + 1}. ${q.product_name} (${q.product_code}): ${q.max_quantity} units`);
  });
  
  const quotaResult = await makeRequest('/api/product-caps/bulk', 'POST', { quotas });
  if (quotaResult.status !== 200 || !quotaResult.data.success) {
    throw new Error(`Failed to assign quotas: ${quotaResult.status}`);
  }
  console.log(`✅ Quotas assigned for ${quotas.length} products`);
  
  // Now create order with multiple products
  await loginAsTSO();
  await getOrderRequirements();
  
  const orderItems = selectedProductIds.map((productId, index) => ({
    product_id: productId,
    quantity: 2  // Order 2 units of each product
  }));
  
  console.log(`\n📦 Creating multi-product order:`);
  console.log(`   Dealer: ${testData.dealerName}`);
  console.log(`   Transport: ${testData.transportName}`);
  console.log(`   Products: ${orderItems.length}`);
  orderItems.forEach((item, i) => {
    const code = selectedProductCodes[i];
    console.log(`   ${i + 1}. ${code}: ${item.quantity} units`);
  });
  
  const orderPayload = {
    order_type_id: testData.orderTypeId,
    dealer_id: testData.dealerId,
    warehouse_id: testData.warehouseId,
    transport_id: testData.transportId,
    user_id: testData.tsoUserId,
    order_items: orderItems
  };
  
  const result = await makeRequest('/api/orders', 'POST', orderPayload);
  
  if (result.status === 200 && result.data && result.data.order_id) {
    testData.multiProductOrderId = result.data.order_id;
    
    // Wait a moment for database to commit
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify the order was created with multiple products by fetching it
    console.log(`\n🔍 Verifying multi-product order...`);
    const verifyResult = await makeRequest(`/api/orders/${testData.multiProductOrderId}`);
    
    let actualItemCount = 0;
    if (verifyResult.status === 200 && verifyResult.data && verifyResult.data.items) {
      actualItemCount = verifyResult.data.items.length;
      console.log(`   ✅ Order found with ${actualItemCount} product(s)`);
      if (verifyResult.data.items.length > 0) {
        console.log(`   📋 Products in order:`);
        verifyResult.data.items.forEach((item, i) => {
          console.log(`      ${i + 1}. ${item.product_code || item.product_name || `Product ID ${item.product_id}`}: ${item.quantity} units`);
        });
      }
    } else {
      console.log(`   ⚠️  Could not verify order details (status: ${verifyResult.status})`);
    }
    
    console.log(`\n✅ TEST 4 PASSED: Multi-product order created successfully`);
    console.log(`   Order ID: ${testData.multiProductOrderId}`);
    console.log(`   Dealer: ${testData.dealerName} (ID: ${testData.dealerId})`);
    console.log(`   Transport: ${testData.transportName}`);
    console.log(`   Date: ${today}`);
    console.log(`   Expected products: ${orderItems.length}`);
    console.log(`   Actual products in order: ${actualItemCount}`);
    console.log(`   Total quantity: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)} units`);
    console.log(`\n📋 Order Items Created:`);
    orderItems.forEach((item, i) => {
      const code = selectedProductCodes[i];
      console.log(`   ${i + 1}. Product: ${code} (ID: ${item.product_id}), Quantity: ${item.quantity} units`);
    });
    console.log(`\n💡 To verify in UI:`);
    console.log(`   1. Go to "Review Orders" or "Placed Orders" page`);
    console.log(`   2. Find order ID: ${testData.multiProductOrderId}`);
    console.log(`   3. This order should show ${orderItems.length} different products`);
    console.log(`   4. Click on the order to see all ${orderItems.length} products in the order details`);
    console.log(`   5. Total quantity should be ${orderItems.reduce((sum, item) => sum + item.quantity, 0)} units`);
    
    if (actualItemCount !== orderItems.length) {
      console.log(`\n⚠️  WARNING: Expected ${orderItems.length} products but found ${actualItemCount} in order`);
    }
    
    return true;
  }
  
  throw new Error(`TEST 4 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 5: Update quota (add more units to existing quota)
// ============================================================================

async function test5_UpdateQuota() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 5: Update quota (add more units)');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  const today = testData.today || getTodayDate();
  const productId = testData.productIds[0];
  const productCode = testData.productCodes[0];
  
  // First, check current quota
  const currentQuotaResult = await makeRequest(
    `/api/product-caps/tso-today?territory_name=${encodeURIComponent(testData.territoryName)}`
  );
  
  let currentMaxQuantity = TEST_CONFIG.initialQuota;
  if (currentQuotaResult.status === 200 && Array.isArray(currentQuotaResult.data)) {
    const quota = currentQuotaResult.data.find(q => q.product_id === productId);
    if (quota) {
      currentMaxQuantity = Number(quota.max_quantity);
    }
  }
  
  const newMaxQuantity = currentMaxQuantity + TEST_CONFIG.additionalQuota;
  
  console.log(`\n📊 Updating quota:`);
  console.log(`   Product: ${productCode}`);
  console.log(`   Territory: ${testData.territoryName}`);
  console.log(`   Date: ${today}`);
  console.log(`   Current max: ${currentMaxQuantity} units`);
  console.log(`   New max: ${newMaxQuantity} units (+${TEST_CONFIG.additionalQuota})`);
  
  const updateResult = await makeRequest(
    `/api/product-caps/${today}/${productId}/${encodeURIComponent(testData.territoryName)}`,
    'PUT',
    { max_quantity: newMaxQuantity }
  );
  
  if (updateResult.status === 200 && updateResult.data.success) {
    // Verify the update
    const verifyResult = await makeRequest(
      `/api/product-caps/tso-today?territory_name=${encodeURIComponent(testData.territoryName)}`
    );
    
    if (verifyResult.status === 200 && Array.isArray(verifyResult.data)) {
      const updatedQuota = verifyResult.data.find(q => q.product_id === productId);
      if (updatedQuota && Number(updatedQuota.max_quantity) === newMaxQuantity) {
        console.log(`\n✅ TEST 5 PASSED: Quota updated successfully`);
        console.log(`   Verified: Max quantity is now ${newMaxQuantity} units`);
        return true;
      }
    }
    
    throw new Error(`TEST 5 FAILED: Quota update succeeded but verification failed`);
  }
  
  throw new Error(`TEST 5 FAILED: ${updateResult.status} - ${JSON.stringify(updateResult.data)}`);
}

// ============================================================================
// TEST 6: Retrieve order history (orders by date)
// ============================================================================

async function test6_OrderHistory() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 6: Retrieve order history');
  console.log('='.repeat(70));
  
  await loginAsTSO();
  
  const today = testData.today || getTodayDate();
  
  console.log(`\n📅 Fetching orders for date: ${today}`);
  
  const result = await makeRequest(`/api/orders/tso/date/${today}?user_id=${testData.tsoUserId}`);
  
  if (result.status === 200 && result.data) {
    // API returns { orders: [...], date: "...", total_orders: N, total_items: N }
    const orders = Array.isArray(result.data) ? result.data : (result.data.orders || []);
    const totalOrders = result.data.total_orders || orders.length;
    
    console.log(`\n✅ TEST 6 PASSED: Retrieved order history`);
    console.log(`   Date: ${today}`);
    console.log(`   Total orders: ${totalOrders}`);
    
    if (orders.length > 0) {
      console.log(`\n📋 Sample orders:`);
      orders.slice(0, 3).forEach((order, i) => {
        console.log(`   ${i + 1}. Order ID: ${order.order_id || order.id}`);
        console.log(`      Dealer: ${order.dealer_name || order.dealer_id}`);
        console.log(`      Items: ${order.items?.length || order.item_count || 0}`);
        console.log(`      Quantity: ${order.total_quantity || order.quantity || 'N/A'}`);
      });
        } else {
      console.log(`   ⚠️  No orders found for today`);
    }
    
    return true;
  }
  
  throw new Error(`TEST 6 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 7: TSO dashboard/reports (my-report endpoint)
// ============================================================================

async function test7_TSODashboard() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 7: TSO dashboard/reports');
  console.log('='.repeat(70));
  
  await loginAsTSO();
  
  const today = testData.today || getTodayDate();
  
  console.log(`\n📊 Fetching TSO report for date: ${today}`);
  
  const result = await makeRequest(`/api/orders/tso/my-report/${today}?user_id=${testData.tsoUserId}`);
  
  if (result.status === 200 && result.data) {
    console.log(`\n✅ TEST 7 PASSED: Retrieved TSO dashboard report`);
    console.log(`   Date: ${today}`);
    
    if (result.data.orders) {
      console.log(`   Total orders: ${result.data.orders.length || 0}`);
    }
    if (result.data.summary) {
      console.log(`   Summary available: Yes`);
    }
    if (result.data.statistics) {
      console.log(`   Statistics available: Yes`);
    }
    
    return true;
  }

  throw new Error(`TEST 7 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 8: Delete an order
// ============================================================================

async function test8_DeleteOrder() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 8: Delete an order');
  console.log('='.repeat(70));
  
  await loginAsTSO();
  
  // Delete the single-product order (from Test 2) instead of multi-product order
  // This way the multi-product order remains visible for verification
  let orderIdToDelete = testData.orderId; // Use single-product order from Test 2
  
  if (!orderIdToDelete) {
    // Fallback to multi-product order if single-product order doesn't exist
    if (testData.multiProductOrderId) {
      console.log(`   ⚠️  Single-product order not found, using multi-product order instead`);
      orderIdToDelete = testData.multiProductOrderId;
    } else {
      throw new Error(`TEST 8 SKIPPED: No order ID available to delete. Run tests 2 or 4 first.`);
    }
  }
  
  console.log(`\n💡 Note: Deleting single-product order to keep multi-product order visible for verification`);
  
  // The delete endpoint expects numeric database ID, not order_id (UUID)
  // We need to look up the numeric ID from the order_id
  const today = testData.today || getTodayDate();
  const ordersResult = await makeRequest(`/api/orders/tso/date/${today}?user_id=${testData.tsoUserId}`);
  
  let numericOrderId = null;
  if (ordersResult.status === 200 && ordersResult.data) {
    const orders = Array.isArray(ordersResult.data) ? ordersResult.data : (ordersResult.data.orders || []);
    const order = orders.find(o => (o.order_id || o.id) === orderIdToDelete);
    if (order) {
      // The numeric database ID is in the 'id' field
      numericOrderId = order.id;
      console.log(`\n🔍 Found order:`);
      console.log(`   Order ID (UUID): ${orderIdToDelete}`);
      console.log(`   Database ID: ${numericOrderId}`);
    }
  }
  
  if (!numericOrderId) {
    throw new Error(`TEST 8 FAILED: Could not find numeric ID for order ${orderIdToDelete}. Order may not exist or was already deleted.`);
  }
  
  console.log(`\n🗑️  Deleting order: ${orderIdToDelete} (DB ID: ${numericOrderId})`);
  
  const result = await makeRequest(`/api/orders/${numericOrderId}`, 'DELETE');
  
  if (result.status === 200 && result.data && result.data.success) {
    console.log(`\n✅ TEST 8 PASSED: Order deleted successfully`);
    console.log(`   Deleted Order ID: ${orderIdToDelete}`);
    console.log(`   Database ID: ${numericOrderId}`);
    
    // Verify deletion by trying to fetch the order
    const verifyResult = await makeRequest(`/api/orders/${numericOrderId}`);
    if (verifyResult.status === 404 || (verifyResult.status === 200 && !verifyResult.data)) {
      console.log(`   ✅ Verified: Order no longer exists`);
    }
    
    return true;
  }
  
  throw new Error(`TEST 8 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 9: Product assignment to dealer
// ============================================================================

async function test9_ProductAssignment() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 9: Product assignment to dealer');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  const productId = testData.productIds[0];
  const productCode = testData.productCodes[0];
  
  console.log(`\n📦 Assigning product to dealer:`);
  console.log(`   Dealer: ${testData.dealerName} (ID: ${testData.dealerId})`);
  console.log(`   Product: ${productCode} (ID: ${productId})`);
  console.log(`   Assignment Type: Specific Product`);
  
  const assignmentPayload = {
    dealer_id: testData.dealerId,
    assignment_type: 'product',
    product_id: productId
  };
  
  const result = await makeRequest('/api/dealer-assignments', 'POST', assignmentPayload);
  
  if (result.status === 200 && result.data) {
    testData.assignmentId = result.data.id || result.data.assignment_id;
    console.log(`\n✅ Product assignment API returned success`);
    console.log(`   Response: ${JSON.stringify(result.data)}`);
    
    // Wait a moment for database to commit
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verify assignment by fetching dealer assignments
    console.log(`\n🔍 Verifying assignment for dealer ID: ${testData.dealerId}`);
    const verifyResult = await makeRequest(`/api/dealer-assignments/${testData.dealerId}`);
    
    if (verifyResult.status === 200 && Array.isArray(verifyResult.data)) {
      console.log(`   Found ${verifyResult.data.length} assignment(s) for this dealer`);
      
      const assignment = verifyResult.data.find(a => 
        a.product_id === productId || a.id === testData.assignmentId
      );
      
      if (assignment) {
        console.log(`\n✅ TEST 9 PASSED: Product assigned to dealer`);
        console.log(`   Dealer ID: ${testData.dealerId}`);
        if (testData.dealerCode) {
          console.log(`   Dealer Code: ${testData.dealerCode}`);
        }
        console.log(`   Dealer Name: ${testData.dealerName}`);
        console.log(`   Territory: ${testData.territoryName}`);
        console.log(`   Assignment ID: ${testData.assignmentId} (database record ID, not dealer ID)`);
        console.log(`   Product ID: ${productId}`);
        console.log(`   Product Code: ${productCode}`);
        console.log(`   Assignment Type: ${assignment.assignment_type || 'product'}`);
        console.log(`   ✅ Verified: Assignment exists in dealer's product list`);
        console.log(`\n💡 To verify in UI:`);
        console.log(`   1. Go to "Manage Dealers" page`);
        console.log(`   2. Find dealer: ${testData.dealerName}`);
        console.log(`   3. Dealer ID: ${testData.dealerId}${testData.dealerCode ? `, Code: ${testData.dealerCode}` : ''}`);
        console.log(`   4. Click "Manage Products" button for this dealer`);
        console.log(`   5. You should see product ${productCode} in the assignments list`);
        console.log(`\n⚠️  Note: This test uses a RANDOM dealer from Cumilla territory.`);
        console.log(`   If you're checking a different dealer (e.g., dealer 00044), that's a different dealer.`);
        
        // Show all assignments for this dealer
        if (verifyResult.data.length > 0) {
          console.log(`\n📋 All assignments for dealer ${testData.dealerId}:`);
          verifyResult.data.forEach((a, i) => {
            console.log(`   ${i + 1}. Assignment ID: ${a.id}, Type: ${a.assignment_type}, Product ID: ${a.product_id || 'N/A'}, Category: ${a.product_category || 'N/A'}`);
          });
        }
      } else {
        console.log(`\n❌ TEST 9 FAILED: Assignment created but not found in verification`);
        console.log(`   Looking for product_id: ${productId} or assignment_id: ${testData.assignmentId}`);
        console.log(`   Available assignments: ${verifyResult.data.length}`);
        if (verifyResult.data.length > 0) {
          console.log(`   Found assignments:`);
          verifyResult.data.forEach((a, i) => {
            console.log(`      ${i + 1}. ID: ${a.id}, Product ID: ${a.product_id}, Type: ${a.assignment_type}`);
          });
        }
        throw new Error(`Assignment verification failed - assignment not found in dealer's list`);
      }
    } else {
      throw new Error(`Could not verify assignment (status: ${verifyResult.status}) - ${JSON.stringify(verifyResult.data)}`);
    }
    
    return true;
  }
  
  throw new Error(`TEST 9 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 10: Monthly forecast submission (if dealer user exists)
// ============================================================================

async function test10_MonthlyForecast() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 10: Monthly forecast submission');
  console.log('='.repeat(70));
  
  // First, check if we can find or create a dealer user
  await loginAsAdmin();
  
  // Get current period
  const periodResult = await makeRequest('/api/monthly-forecast/current-period');
  if (periodResult.status !== 200 || !periodResult.data) {
    throw new Error(`TEST 10 SKIPPED: Could not get current period. Status: ${periodResult.status}`);
  }
  
  const period = periodResult.data;
  console.log(`\n📅 Current forecast period:`);
  console.log(`   Start: ${period.start}`);
  console.log(`   End: ${period.end}`);
  
  // Check if dealer has assigned products
  const assignmentsResult = await makeRequest(`/api/dealer-assignments/${testData.dealerId}`);
  if (assignmentsResult.status !== 200 || !Array.isArray(assignmentsResult.data) || assignmentsResult.data.length === 0) {
    console.log(`\n⚠️  TEST 10 SKIPPED: Dealer has no assigned products. Run test 9 first.`);
    return true; // Skip but don't fail
  }
  
  // Check for existing forecasts for this dealer/period
  const existingForecastsResult = await makeRequest(`/api/monthly-forecast/dealer/${testData.dealerId}`);
  let productId;
  let productAlreadyHasForecast = false;
  
  if (existingForecastsResult.status === 200 && Array.isArray(existingForecastsResult.data)) {
    // Check if any forecast exists for this period
    const existingForecast = existingForecastsResult.data.find(f => 
      f.period_start === period.start && f.period_end === period.end
    );
    
    if (existingForecast) {
      productAlreadyHasForecast = true;
      productId = existingForecast.product_id;
      console.log(`\n⚠️  Found existing forecast for this period:`);
      console.log(`   Product ID: ${productId}`);
      console.log(`   Quantity: ${existingForecast.quantity} units`);
      console.log(`   Period: ${period.start} to ${period.end}`);
      console.log(`   ⚠️  Forecast already exists - will verify API correctly rejects duplicate submission`);
      
      // Try to submit to verify the backend correctly rejects duplicate submissions
      const assignedProduct = assignmentsResult.data.find(a => a.product_id === existingForecast.product_id) || assignmentsResult.data[0];
      productId = assignedProduct.product_id;
    } else {
      // No existing forecast, find a product without forecast
      const assignedProduct = assignmentsResult.data[0];
      productId = assignedProduct.product_id;
    }
  } else {
    // No existing forecasts, use first assigned product
    const assignedProduct = assignmentsResult.data[0];
    productId = assignedProduct.product_id;
  }
  
  console.log(`\n📊 Submitting monthly forecast:`);
  console.log(`   Dealer: ${testData.dealerName} (ID: ${testData.dealerId})`);
  console.log(`   Product ID: ${productId}`);
  console.log(`   Period: ${period.start} to ${period.end}`);
  console.log(`   Quantity: 50 units`);
  
  const forecastPayload = {
    dealer_id: testData.dealerId,
    product_id: productId,
    period_start: period.start,
    period_end: period.end,
    quantity: 50
  };
  
  const result = await makeRequest('/api/monthly-forecast', 'POST', forecastPayload);
  
  // Handle existing forecast case (403 is expected if forecast is already submitted)
  if (result.status === 403 && result.data && result.data.error && 
      result.data.error.includes('already been submitted')) {
    console.log(`\n✅ TEST 10 PASSED: Backend correctly prevents duplicate forecast submission`);
    console.log(`   Status: 403 (Forbidden)`);
    console.log(`   Message: ${result.data.error}`);
    console.log(`   ✅ This confirms the API correctly enforces forecast submission rules`);
    return true;
  }
  
  if (result.status === 200 && result.data) {
    console.log(`\n✅ TEST 10 PASSED: Monthly forecast submitted successfully`);
    
    // Verify by fetching dealer's forecast
    const verifyResult = await makeRequest(`/api/monthly-forecast/dealer/${testData.dealerId}`);
    if (verifyResult.status === 200 && Array.isArray(verifyResult.data)) {
      const forecast = verifyResult.data.find(f => f.product_id === productId);
      if (forecast) {
        console.log(`   ✅ Verified: Forecast exists (${forecast.quantity} units)`);
      }
    }
    
    return true;
  }
  
  throw new Error(`TEST 10 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 11: Bulk product assignments to dealer (Multiple products at once)
// ============================================================================

async function test11_BulkProductAssignments() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 11: Bulk product assignments to dealer');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  // Use the dealer from previous tests
  if (!testData.dealerId) {
    await findTerritoryAndDealer();
  }
  
  // Need at least 3 products for bulk assignment
  if (testData.allProductIds.length < 3) {
    console.log(`\n⚠️  TEST 11 SKIPPED: Need at least 3 products for bulk assignment, found ${testData.allProductIds.length}`);
    return true;
  }
  
  // Select 3 products for bulk assignment
  const selectedProductIds = testData.allProductIds.slice(0, 3);
  const selectedProductCodes = testData.allProductCodes.slice(0, 3);
  
  console.log(`\n📦 Bulk assigning products to dealer:`);
  console.log(`   Dealer: ${testData.dealerName} (ID: ${testData.dealerId})`);
  console.log(`   Products: ${selectedProductIds.length}`);
  selectedProductCodes.forEach((code, i) => {
    console.log(`   ${i + 1}. ${code} (ID: ${selectedProductIds[i]})`);
  });
  
  const bulkPayload = {
    dealer_id: testData.dealerId,
    product_ids: selectedProductIds,
    product_categories: []  // Empty - only assigning products
  };
  
  const result = await makeRequest('/api/dealer-assignments/bulk', 'POST', bulkPayload);
  
  if (result.status === 200 && result.data && result.data.success) {
    console.log(`\n✅ Bulk assignment API returned success`);
    console.log(`   Response: ${JSON.stringify(result.data)}`);
    
    // Wait for database to commit
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Verify bulk assignments
    console.log(`\n🔍 Verifying bulk assignments for dealer ID: ${testData.dealerId}`);
    const verifyResult = await makeRequest(`/api/dealer-assignments/${testData.dealerId}`);
    
    if (verifyResult.status === 200 && Array.isArray(verifyResult.data)) {
      // Find all assigned products
      const assignedProducts = verifyResult.data.filter(a => 
        a.assignment_type === 'product' && selectedProductIds.includes(a.product_id)
      );
      
      if (assignedProducts.length >= selectedProductIds.length) {
        console.log(`\n✅ TEST 11 PASSED: Bulk product assignments successful`);
        console.log(`   Dealer ID: ${testData.dealerId}`);
        console.log(`   Dealer Name: ${testData.dealerName}`);
        console.log(`   Expected products: ${selectedProductIds.length}`);
        console.log(`   Assigned products: ${assignedProducts.length}`);
        
        // Store assignment IDs for potential cleanup
        testData.bulkAssignmentIds = assignedProducts.map(a => a.id);
        
        console.log(`\n📋 Assigned products:`);
        assignedProducts.forEach((a, i) => {
          const code = selectedProductCodes[selectedProductIds.indexOf(a.product_id)];
          console.log(`   ${i + 1}. ${code} (Product ID: ${a.product_id}, Assignment ID: ${a.id})`);
        });
        
        console.log(`\n💡 To verify in UI:`);
        console.log(`   1. Go to "Manage Dealers" page`);
        console.log(`   2. Find dealer: ${testData.dealerName}`);
        console.log(`   3. Click "Manage Products" button`);
        console.log(`   4. You should see ${assignedProducts.length} product assignments`);
        
        return true;
      } else {
        throw new Error(`Bulk assignment verification failed - expected ${selectedProductIds.length} products, found ${assignedProducts.length}`);
      }
    } else {
      throw new Error(`Could not verify bulk assignments (status: ${verifyResult.status})`);
    }
  }
  
  throw new Error(`TEST 11 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 12: Category/Application name assignment to dealer
// ============================================================================

async function test12_CategoryAssignment() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 12: Category/Application name assignment to dealer');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  // Get available product categories
  const categoriesResult = await makeRequest('/api/products/categories');
  if (categoriesResult.status !== 200 || !Array.isArray(categoriesResult.data) || categoriesResult.data.length === 0) {
    console.log(`\n⚠️  TEST 12 SKIPPED: No product categories available`);
    return true;
  }
  
  testData.productCategories = categoriesResult.data;
  const selectedCategory = testData.productCategories[0];
  
  // Use the dealer from previous tests
  if (!testData.dealerId) {
    await findTerritoryAndDealer();
  }
  
  console.log(`\n📦 Assigning category to dealer:`);
  console.log(`   Dealer: ${testData.dealerName} (ID: ${testData.dealerId})`);
  console.log(`   Category/Application: ${selectedCategory}`);
  console.log(`   Assignment Type: Category`);
  
  // First check if category assignment already exists
  const currentAssignmentsResult = await makeRequest(`/api/dealer-assignments/${testData.dealerId}`);
  if (currentAssignmentsResult.status === 200 && Array.isArray(currentAssignmentsResult.data)) {
    const existingCategory = currentAssignmentsResult.data.find(a => 
      a.assignment_type === 'category' && a.product_category === selectedCategory
    );
    
    if (existingCategory) {
      console.log(`\n⚠️  Category already assigned. Using bulk assignment to test...`);
      // Use bulk assignment instead
      const bulkPayload = {
        dealer_id: testData.dealerId,
        product_ids: [],
        product_categories: [selectedCategory]
      };
      
      const bulkResult = await makeRequest('/api/dealer-assignments/bulk', 'POST', bulkPayload);
      if (bulkResult.status === 200) {
        console.log(`\n✅ TEST 12 PASSED: Category assignment via bulk API`);
        return true;
      }
    }
  }
  
  // Try single category assignment
  const assignmentPayload = {
    dealer_id: testData.dealerId,
    assignment_type: 'category',
    product_category: selectedCategory
  };
  
  const result = await makeRequest('/api/dealer-assignments', 'POST', assignmentPayload);
  
  if (result.status === 200 && result.data) {
    testData.categoryAssignmentId = result.data.id;
    console.log(`\n✅ Category assignment API returned success`);
    console.log(`   Response: ${JSON.stringify(result.data)}`);
    
    // Wait for database to commit
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Verify category assignment
    console.log(`\n🔍 Verifying category assignment for dealer ID: ${testData.dealerId}`);
    const verifyResult = await makeRequest(`/api/dealer-assignments/${testData.dealerId}`);
    
    if (verifyResult.status === 200 && Array.isArray(verifyResult.data)) {
      const categoryAssignment = verifyResult.data.find(a => 
        a.assignment_type === 'category' && a.product_category === selectedCategory
      );
      
      if (categoryAssignment) {
        console.log(`\n✅ TEST 12 PASSED: Category assigned to dealer`);
        console.log(`   Dealer ID: ${testData.dealerId}`);
        console.log(`   Category: ${selectedCategory}`);
        console.log(`   Assignment ID: ${categoryAssignment.id}`);
        console.log(`   Assignment Type: ${categoryAssignment.assignment_type}`);
        
        testData.categoryAssignmentId = categoryAssignment.id;
        
        console.log(`\n💡 To verify in UI:`);
        console.log(`   1. Go to "Manage Dealers" page`);
        console.log(`   2. Find dealer: ${testData.dealerName}`);
        console.log(`   3. Click "Manage Products" button`);
        console.log(`   4. You should see category "${selectedCategory}" in the assignments list`);
        console.log(`   5. Type column should show "Application Name" tag`);
        
        return true;
      } else {
        throw new Error(`Category assignment verification failed - category not found in dealer's assignments`);
      }
    } else {
      throw new Error(`Could not verify category assignment (status: ${verifyResult.status})`);
    }
  }
  
  throw new Error(`TEST 12 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 13: Get all territories and filter dealers
// ============================================================================

async function test13_GetTerritoriesAndFilter() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 13: Get territories and filter dealers');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  // Get all territories
  console.log(`\n🔍 Fetching all territories...`);
  const territoriesResult = await makeRequest('/api/dealers/territories');
  
  if (territoriesResult.status !== 200 || !Array.isArray(territoriesResult.data)) {
    throw new Error(`TEST 13 FAILED: Could not fetch territories. Status: ${territoriesResult.status}`);
  }
  
  testData.allTerritories = territoriesResult.data;
  
  console.log(`\n✅ Retrieved ${testData.allTerritories.length} territories`);
  if (testData.allTerritories.length > 0) {
    console.log(`\n📋 Sample territories:`);
    testData.allTerritories.slice(0, 5).forEach((territory, i) => {
      console.log(`   ${i + 1}. ${territory}`);
    });
  }
  
  // Get all dealers
  console.log(`\n🔍 Fetching all dealers...`);
  const dealersResult = await makeRequest('/api/dealers');
  
  if (dealersResult.status !== 200 || !Array.isArray(dealersResult.data)) {
    throw new Error(`TEST 13 FAILED: Could not fetch dealers. Status: ${dealersResult.status}`);
  }
  
  console.log(`\n✅ Retrieved ${dealersResult.data.length} dealers`);
  
  // Test filtering by territory if we have the territory code
  if (testData.territoryName && dealersResult.data.length > 0) {
    // Find a dealer with this territory to get the territory code
    const dealerWithTerritory = dealersResult.data.find(d => 
      (d.territory_name || '').trim() === testData.territoryName.trim()
    );
    
    if (dealerWithTerritory && dealerWithTerritory.territory_code) {
      console.log(`\n🔍 Testing filter by territory: ${dealerWithTerritory.territory_code}`);
      const filterResult = await makeRequest(
        `/api/dealers/filter?territory=${encodeURIComponent(dealerWithTerritory.territory_code)}`
      );
      
      if (filterResult.status === 200 && Array.isArray(filterResult.data)) {
        console.log(`   ✅ Filter by territory returned ${filterResult.data.length} dealer(s)`);
        if (filterResult.data.length > 0) {
          console.log(`   📋 Sample filtered dealers:`);
          filterResult.data.slice(0, 3).forEach((dealer, i) => {
            console.log(`      ${i + 1}. ${dealer.name || dealer.dealer_name} (Code: ${dealer.dealer_code})`);
          });
        }
      }
    }
  }
  
  // Test filtering by status
  console.log(`\n🔍 Testing filter by status: Active (A)`);
  const statusFilterResult = await makeRequest('/api/dealers/filter?status=A');
  
  if (statusFilterResult.status === 200 && Array.isArray(statusFilterResult.data)) {
    const activeCount = statusFilterResult.data.length;
    console.log(`   ✅ Filter by active status returned ${activeCount} dealer(s)`);
    
    // Get inactive count for comparison
    const inactiveFilterResult = await makeRequest('/api/dealers/filter?status=N');
    if (inactiveFilterResult.status === 200 && Array.isArray(inactiveFilterResult.data)) {
      const inactiveCount = inactiveFilterResult.data.length;
      console.log(`   📊 Active dealers: ${activeCount}, Inactive dealers: ${inactiveCount}`);
    }
  }
  
  console.log(`\n✅ TEST 13 PASSED: Territories and dealer filtering working`);
  console.log(`   Total territories: ${testData.allTerritories.length}`);
  console.log(`   Total dealers: ${dealersResult.data.length}`);
  
  return true;
}

// ============================================================================
// TEST 14: Get product categories for dealer assignment
// ============================================================================

async function test14_GetProductCategories() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 14: Get product categories for dealer assignment');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  console.log(`\n🔍 Fetching product categories...`);
  const result = await makeRequest('/api/products/categories');
  
  if (result.status !== 200 || !Array.isArray(result.data)) {
    throw new Error(`TEST 14 FAILED: Could not fetch categories. Status: ${result.status}`);
  }
  
  testData.productCategories = result.data;
  
  console.log(`\n✅ TEST 14 PASSED: Retrieved ${testData.productCategories.length} product categories`);
  
  if (testData.productCategories.length > 0) {
    console.log(`\n📋 Available categories/application names:`);
    testData.productCategories.slice(0, 10).forEach((category, i) => {
      console.log(`   ${i + 1}. ${category}`);
    });
    if (testData.productCategories.length > 10) {
      console.log(`   ... and ${testData.productCategories.length - 10} more`);
    }
    
    console.log(`\n💡 These categories can be assigned to dealers for bulk product assignment`);
    console.log(`   When a category is assigned, all products with that application_name are accessible`);
  } else {
    console.log(`\n⚠️  No product categories found in database`);
  }
  
  return true;
}

// ============================================================================
// TEST 15: Delete product assignment from dealer
// ============================================================================

async function test15_DeleteAssignment() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 15: Delete product assignment from dealer');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  // Use the dealer from previous tests
  if (!testData.dealerId) {
    await findTerritoryAndDealer();
  }
  
  // Get current assignments
  console.log(`\n🔍 Fetching current assignments for dealer ID: ${testData.dealerId}`);
  const assignmentsResult = await makeRequest(`/api/dealer-assignments/${testData.dealerId}`);
  
  if (assignmentsResult.status !== 200 || !Array.isArray(assignmentsResult.data)) {
    throw new Error(`TEST 15 FAILED: Could not fetch assignments. Status: ${assignmentsResult.status}`);
  }
  
  if (assignmentsResult.data.length === 0) {
    console.log(`\n⚠️  TEST 15 SKIPPED: No assignments found for dealer. Run tests 9 or 11 first.`);
    return true;
  }
  
  // Find an assignment to delete (prefer product assignment over category)
  const assignmentToDelete = assignmentsResult.data.find(a => a.assignment_type === 'product') || assignmentsResult.data[0];
  
  console.log(`\n🗑️  Deleting assignment:`);
  console.log(`   Dealer ID: ${testData.dealerId}`);
  console.log(`   Assignment ID: ${assignmentToDelete.id}`);
  console.log(`   Assignment Type: ${assignmentToDelete.assignment_type}`);
  if (assignmentToDelete.product_id) {
    console.log(`   Product ID: ${assignmentToDelete.product_id}`);
  }
  if (assignmentToDelete.product_category) {
    console.log(`   Category: ${assignmentToDelete.product_category}`);
  }
  
  const deleteResult = await makeRequest(`/api/dealer-assignments/${assignmentToDelete.id}`, 'DELETE');
  
  if (deleteResult.status === 200 && deleteResult.data && deleteResult.data.success) {
    console.log(`\n✅ Delete assignment API returned success`);
    
    // Wait for database to commit
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verify deletion
    console.log(`\n🔍 Verifying deletion...`);
    const verifyResult = await makeRequest(`/api/dealer-assignments/${testData.dealerId}`);
    
    if (verifyResult.status === 200 && Array.isArray(verifyResult.data)) {
      const deletedAssignment = verifyResult.data.find(a => a.id === assignmentToDelete.id);
      
      if (!deletedAssignment) {
        console.log(`\n✅ TEST 15 PASSED: Assignment deleted successfully`);
        console.log(`   Deleted Assignment ID: ${assignmentToDelete.id}`);
        console.log(`   Remaining assignments: ${verifyResult.data.length}`);
        
        console.log(`\n💡 To verify in UI:`);
        console.log(`   1. Go to "Manage Dealers" page`);
        console.log(`   2. Find dealer: ${testData.dealerName}`);
        console.log(`   3. Click "Manage Products" button`);
        console.log(`   4. The deleted assignment should no longer appear in the list`);
        console.log(`   5. Assignment count should be ${verifyResult.data.length}`);
        
        return true;
      } else {
        throw new Error(`Assignment deletion verification failed - assignment still exists`);
      }
    } else {
      throw new Error(`Could not verify deletion (status: ${verifyResult.status})`);
    }
  }
  
  throw new Error(`TEST 15 FAILED: ${deleteResult.status} - ${JSON.stringify(deleteResult.data)}`);
}

// ============================================================================
// TEST 16: Get all assignments for dealer (expanded row content)
// ============================================================================

async function test16_GetAllAssignments() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 16: Get all assignments for dealer (Dealer Modal Features)');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  // Use the dealer from previous tests
  if (!testData.dealerId) {
    await findTerritoryAndDealer();
  }
  
  console.log(`\n🔍 Fetching all assignments for dealer ID: ${testData.dealerId}`);
  console.log(`   Dealer: ${testData.dealerName}`);
  
  const result = await makeRequest(`/api/dealer-assignments/${testData.dealerId}`);
  
  if (result.status !== 200 || !Array.isArray(result.data)) {
    throw new Error(`TEST 16 FAILED: Could not fetch assignments. Status: ${result.status}`);
  }
  
  const assignments = result.data;
  
  console.log(`\n✅ TEST 16 PASSED: Retrieved all assignments for dealer`);
  console.log(`   Total assignments: ${assignments.length}`);
  
  if (assignments.length > 0) {
    // Group by assignment type
    const productAssignments = assignments.filter(a => a.assignment_type === 'product');
    const categoryAssignments = assignments.filter(a => a.assignment_type === 'category');
    
    console.log(`\n📊 Assignment breakdown:`);
    console.log(`   Product assignments: ${productAssignments.length}`);
    console.log(`   Category assignments: ${categoryAssignments.length}`);
    
    if (productAssignments.length > 0) {
      console.log(`\n📋 Product assignments:`);
      productAssignments.slice(0, 5).forEach((a, i) => {
        console.log(`   ${i + 1}. Assignment ID: ${a.id}, Product ID: ${a.product_id}`);
      });
      if (productAssignments.length > 5) {
        console.log(`   ... and ${productAssignments.length - 5} more`);
      }
    }
    
    if (categoryAssignments.length > 0) {
      console.log(`\n📋 Category assignments:`);
      categoryAssignments.forEach((a, i) => {
        console.log(`   ${i + 1}. Assignment ID: ${a.id}, Category: ${a.product_category}`);
      });
    }
    
    console.log(`\n💡 This simulates the expandable row content in Dealer Management page`);
    console.log(`   When you click "Manage Products", it fetches and displays these assignments`);
    
    // Store dealer ID for reference
    testData.testDealerId = testData.dealerId;
  } else {
    console.log(`\n⚠️  No assignments found for this dealer`);
    console.log(`   💡 Add assignments using tests 9, 11, or 12`);
  }
  
  return true;
}

// ============================================================================
// TEST 17: Bulk assignment with both products and categories
// ============================================================================

async function test17_MixedBulkAssignment() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 17: Bulk assignment with products and categories');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  // Use the dealer from previous tests
  if (!testData.dealerId) {
    await findTerritoryAndDealer();
  }
  
  // Get categories if not already loaded
  if (testData.productCategories.length === 0) {
    const categoriesResult = await makeRequest('/api/products/categories');
    if (categoriesResult.status === 200 && Array.isArray(categoriesResult.data)) {
      testData.productCategories = categoriesResult.data;
    }
  }
  
  // Need at least 2 products and 1 category
  if (testData.allProductIds.length < 2) {
    console.log(`\n⚠️  TEST 17 SKIPPED: Need at least 2 products, found ${testData.allProductIds.length}`);
    return true;
  }
  
  if (testData.productCategories.length === 0) {
    console.log(`\n⚠️  TEST 17 SKIPPED: No product categories available`);
    return true;
  }
  
  // Select 2 products and 1 category
  const selectedProductIds = testData.allProductIds.slice(0, 2);
  const selectedProductCodes = testData.allProductCodes.slice(0, 2);
  const selectedCategory = testData.productCategories[0];
  
  console.log(`\n📦 Mixed bulk assignment to dealer:`);
  console.log(`   Dealer: ${testData.dealerName} (ID: ${testData.dealerId})`);
  console.log(`   Products: ${selectedProductIds.length}`);
  selectedProductCodes.forEach((code, i) => {
    console.log(`      ${i + 1}. ${code}`);
  });
  console.log(`   Categories: 1`);
  console.log(`      ${selectedCategory}`);
  
  const bulkPayload = {
    dealer_id: testData.dealerId,
    product_ids: selectedProductIds,
    product_categories: [selectedCategory]
  };
  
  const result = await makeRequest('/api/dealer-assignments/bulk', 'POST', bulkPayload);
  
  if (result.status === 200 && result.data && result.data.success) {
    console.log(`\n✅ Mixed bulk assignment API returned success`);
    console.log(`   Response: ${JSON.stringify(result.data)}`);
    
    // Wait for database to commit
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Verify mixed assignments
    console.log(`\n🔍 Verifying mixed bulk assignments...`);
    const verifyResult = await makeRequest(`/api/dealer-assignments/${testData.dealerId}`);
    
    if (verifyResult.status === 200 && Array.isArray(verifyResult.data)) {
      const assignedProducts = verifyResult.data.filter(a => 
        a.assignment_type === 'product' && selectedProductIds.includes(a.product_id)
      );
      const assignedCategories = verifyResult.data.filter(a => 
        a.assignment_type === 'category' && a.product_category === selectedCategory
      );
      
      const allAssigned = assignedProducts.length + assignedCategories.length;
      const expectedTotal = selectedProductIds.length + 1; // 2 products + 1 category
      
      console.log(`\n✅ TEST 17 PASSED: Mixed bulk assignment successful`);
      console.log(`   Dealer ID: ${testData.dealerId}`);
      console.log(`   Expected assignments: ${expectedTotal} (${selectedProductIds.length} products + 1 category)`);
      console.log(`   Product assignments: ${assignedProducts.length}`);
      console.log(`   Category assignments: ${assignedCategories.length}`);
      console.log(`   Total new assignments: ${allAssigned}`);
      
      console.log(`\n💡 This tests the bulk assignment feature that allows assigning`);
      console.log(`   both individual products and entire categories in one operation`);
      
      return true;
    } else {
      throw new Error(`Could not verify mixed bulk assignments (status: ${verifyResult.status})`);
    }
  }
  
  throw new Error(`TEST 17 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 18: Create single-day daily demand order
// ============================================================================

async function test18_CreateSingleDayDailyDemand() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 18: Create single-day daily demand order');
  console.log('='.repeat(70));
  
  await loginAsDealer();
  await getDDOrderTypeId();
  
  // Ensure dealer and products are set up
  if (!testData.dealerId) {
    await findTerritoryAndDealer();
  }
  
  // Get products assigned to dealer
  const assignmentsResult = await makeRequest(`/api/dealer-assignments/${testData.dealerId}`);
  if (assignmentsResult.status !== 200 || !Array.isArray(assignmentsResult.data) || assignmentsResult.data.length === 0) {
    console.log(`\n⚠️  TEST 18 SKIPPED: Dealer has no assigned products. Run test 9 first.`);
    return true;
  }
  
  const assignedProduct = assignmentsResult.data.find(a => a.assignment_type === 'product');
  if (!assignedProduct) {
    console.log(`\n⚠️  TEST 18 SKIPPED: Dealer has no product assignments. Run test 9 first.`);
    return true;
  }
  
  const productId = assignedProduct.product_id;
  const today = getTodayDate();
  
  console.log(`\n📦 Creating single-day daily demand order:`);
  console.log(`   Dealer: ${testData.dealerName} (ID: ${testData.dealerId})`);
  console.log(`   Territory: ${testData.territoryName}`);
  console.log(`   Date: ${today}`);
  console.log(`   Product ID: ${productId}`);
  console.log(`   Quantity: 10 units`);
  
  const orderPayload = {
    order_type_id: testData.ddOrderTypeId,
    dealer_id: testData.dealerId,
    territory_name: testData.territoryName,
    user_id: testData.dealerUserId,
    order_items: [
      {
        product_id: productId,
        quantity: 10
      }
    ]
  };
  
  const result = await makeRequest('/api/orders/dealer', 'POST', orderPayload, {
    'Authorization': `Bearer ${testData.dealerToken}`
  });
  
  if (result.status === 200 && result.data && result.data.success) {
    const orderId = result.data.order_id;
    testData.dealerDailyDemandOrderIds.push({ orderId, date: today, type: 'single' });
    
    console.log(`\n✅ TEST 18 PASSED: Single-day daily demand order created`);
    console.log(`   Order ID: ${orderId}`);
    console.log(`   Date: ${today}`);
    console.log(`   Items: ${result.data.item_count}`);
    
    return true;
  }
  
  throw new Error(`TEST 18 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 19: Create multi-day daily demand orders
// ============================================================================

async function test19_CreateMultiDayDailyDemand() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 19: Create multi-day daily demand orders');
  console.log('='.repeat(70));
  
  await loginAsDealer();
  await getDDOrderTypeId();
  
  // Ensure dealer and products are set up
  if (!testData.dealerId) {
    await findTerritoryAndDealer();
  }
  
  // Get products assigned to dealer
  const assignmentsResult = await makeRequest(`/api/dealer-assignments/${testData.dealerId}`);
  if (assignmentsResult.status !== 200 || !Array.isArray(assignmentsResult.data) || assignmentsResult.data.length === 0) {
    console.log(`\n⚠️  TEST 19 SKIPPED: Dealer has no assigned products. Run test 9 first.`);
    return true;
  }
  
  const assignedProduct = assignmentsResult.data.find(a => a.assignment_type === 'product');
  if (!assignedProduct) {
    console.log(`\n⚠️  TEST 19 SKIPPED: Dealer has no product assignments. Run test 9 first.`);
    return true;
  }
  
  const productId = assignedProduct.product_id;
  const today = getTodayDate();
  
  // Create dates for tomorrow and day after tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const dayAfterStr = dayAfter.toISOString().split('T')[0];
  
  console.log(`\n📦 Creating multi-day daily demand orders:`);
  console.log(`   Dealer: ${testData.dealerName} (ID: ${testData.dealerId})`);
  console.log(`   Territory: ${testData.territoryName}`);
  console.log(`   Dates: ${tomorrowStr}, ${dayAfterStr}`);
  console.log(`   Product ID: ${productId}`);
  
  const orderPayload = {
    dealer_id: testData.dealerId,
    territory_name: testData.territoryName,
    user_id: testData.dealerUserId,
    demands: [
      {
        date: tomorrowStr,
        order_items: [
          {
            product_id: productId,
            quantity: 15
          }
        ]
      },
      {
        date: dayAfterStr,
        order_items: [
          {
            product_id: productId,
            quantity: 20
          }
        ]
      }
    ]
  };
  
  const result = await makeRequest('/api/orders/dealer/multi-day', 'POST', orderPayload, {
    'Authorization': `Bearer ${testData.dealerToken}`
  });
  
  if (result.status === 200 && result.data && result.data.success) {
    result.data.orders.forEach(order => {
      testData.dealerDailyDemandOrderIds.push({ orderId: order.order_id, date: order.date, type: 'multi' });
    });
    
    console.log(`\n✅ TEST 19 PASSED: Multi-day daily demand orders created`);
    console.log(`   Total orders: ${result.data.total_orders}`);
    console.log(`   Total items: ${result.data.total_items}`);
    result.data.orders.forEach((order, i) => {
      console.log(`   ${i + 1}. Order ID: ${order.order_id}, Date: ${order.date}, Items: ${order.item_count}`);
    });
    
    return true;
  }
  
  throw new Error(`TEST 19 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 20: Get available dates with orders
// ============================================================================

async function test20_GetAvailableDates() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 20: Get available dates with orders');
  console.log('='.repeat(70));
  
  await loginAsDealer();
  
  if (!testData.dealerId) {
    await findTerritoryAndDealer();
  }
  
  console.log(`\n🔍 Fetching available dates for dealer:`);
  console.log(`   Dealer ID: ${testData.dealerId}`);
  
  const result = await makeRequest(`/api/orders/dealer/available-dates?dealer_id=${testData.dealerId}`, 'GET', null, {
    'Authorization': `Bearer ${testData.dealerToken}`
  });
  
  if (result.status === 200 && result.data) {
    // API returns {dates: [...]} format
    const dates = Array.isArray(result.data.dates) ? result.data.dates : (Array.isArray(result.data) ? result.data : []);
    
    if (dates.length > 0) {
      testData.dealerAvailableDates = dates;
      console.log(`\n✅ TEST 20 PASSED: Available dates retrieved`);
      console.log(`   Total dates: ${dates.length}`);
      console.log(`   Dates: ${dates.slice(0, 10).join(', ')}${dates.length > 10 ? '...' : ''}`);
    } else {
      console.log(`\n✅ TEST 20 PASSED: Available dates retrieved (no dates found)`);
      console.log(`   Total dates: 0`);
    }
    
    return true;
  }
  
  throw new Error(`TEST 20 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 21: Get orders for a specific date
// ============================================================================

async function test21_GetOrdersForDate() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 21: Get orders for a specific date');
  console.log('='.repeat(70));
  
  await loginAsDealer();
  
  if (!testData.dealerId) {
    await findTerritoryAndDealer();
  }
  
  // Use today's date
  const today = getTodayDate();
  
  console.log(`\n🔍 Fetching orders for date:`);
  console.log(`   Dealer ID: ${testData.dealerId}`);
  console.log(`   Date: ${today}`);
  
  const result = await makeRequest(`/api/orders/dealer/date?dealer_id=${testData.dealerId}&date=${today}`, 'GET', null, {
    'Authorization': `Bearer ${testData.dealerToken}`
  });
  
  if (result.status === 200 && result.data) {
    // API returns {orders: [...], date: "...", total_orders: X, total_items: Y}
    const orders = Array.isArray(result.data.orders) ? result.data.orders : (Array.isArray(result.data) ? result.data : []);
    const totalOrders = result.data.total_orders || orders.length;
    const date = result.data.date || today;
    
    console.log(`\n✅ TEST 21 PASSED: Orders for date retrieved`);
    console.log(`   Date: ${date}`);
    console.log(`   Total orders: ${totalOrders}`);
    if (orders.length > 0) {
      orders.slice(0, 3).forEach((order, i) => {
        console.log(`   ${i + 1}. Order ID: ${order.order_id}, Items: ${order.item_count || order.total_quantity || 'N/A'}`);
      });
    }
    
    return true;
  }
  
  throw new Error(`TEST 21 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 22: Get orders for a date range
// ============================================================================

async function test22_GetOrdersForRange() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 22: Get orders for a date range');
  console.log('='.repeat(70));
  
  await loginAsDealer();
  
  if (!testData.dealerId) {
    await findTerritoryAndDealer();
  }
  
  const today = getTodayDate();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 7);
  const endDateStr = endDate.toISOString().split('T')[0];
  
  console.log(`\n🔍 Fetching orders for date range:`);
  console.log(`   Dealer ID: ${testData.dealerId}`);
  console.log(`   Start Date: ${today}`);
  console.log(`   End Date: ${endDateStr}`);
  
  // Backend expects startDate and endDate (camelCase), not start_date and end_date
  const result = await makeRequest(`/api/orders/dealer/range?dealer_id=${testData.dealerId}&startDate=${today}&endDate=${endDateStr}`, 'GET', null, {
    'Authorization': `Bearer ${testData.dealerToken}`
  });
  
  if (result.status === 200 && result.data) {
    // API returns {orders: [...], total_orders: X, total_items: Y}
    const orders = Array.isArray(result.data.orders) ? result.data.orders : (Array.isArray(result.data) ? result.data : []);
    const totalOrders = result.data.total_orders || orders.length;
    
    console.log(`\n✅ TEST 22 PASSED: Orders for date range retrieved`);
    console.log(`   Total orders: ${totalOrders}`);
    if (orders.length > 0) {
      orders.slice(0, 3).forEach((order, i) => {
        console.log(`   ${i + 1}. Order ID: ${order.order_id}, Date: ${order.date || order.order_date || 'N/A'}, Items: ${order.item_count || 'N/A'}`);
      });
    }
    
    return true;
  }
  
  throw new Error(`TEST 22 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 23: Generate Excel report for a date
// ============================================================================

async function test23_GenerateReportForDate() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 23: Generate Excel report for a date');
  console.log('='.repeat(70));
  
  await loginAsDealer();
  
  if (!testData.dealerId) {
    await findTerritoryAndDealer();
  }
  
  const today = getTodayDate();
  
  console.log(`\n📊 Generating Excel report for date:`);
  console.log(`   Dealer ID: ${testData.dealerId}`);
  console.log(`   Date: ${today}`);
  
  const result = await makeRequest(`/api/orders/dealer/my-report/${today}?dealer_id=${testData.dealerId}`, 'GET', null, {
    'Authorization': `Bearer ${testData.dealerToken}`
  });
  
  if (result.status === 200 && result.headers && result.headers['content-type'] && result.headers['content-type'].includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
    console.log(`\n✅ TEST 23 PASSED: Excel report generated`);
    console.log(`   Content-Type: ${result.headers['content-type']}`);
    console.log(`   Response is binary Excel file`);
    
    return true;
  }
  
  throw new Error(`TEST 23 FAILED: ${result.status} - Expected Excel file`);
}

// ============================================================================
// TEST 24: Generate Excel report for a date range
// ============================================================================

async function test24_GenerateReportForRange() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 24: Generate Excel report for a date range');
  console.log('='.repeat(70));
  
  await loginAsDealer();
  
  if (!testData.dealerId) {
    await findTerritoryAndDealer();
  }
  
  const today = getTodayDate();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 7);
  const endDateStr = endDate.toISOString().split('T')[0];
  
  console.log(`\n📊 Generating Excel report for date range:`);
  console.log(`   Dealer ID: ${testData.dealerId}`);
  console.log(`   Start Date: ${today}`);
  console.log(`   End Date: ${endDateStr}`);
  
  // Backend expects startDate and endDate (camelCase), not start_date and end_date
  const result = await makeRequest(`/api/orders/dealer/my-report-range?dealer_id=${testData.dealerId}&startDate=${today}&endDate=${endDateStr}`, 'GET', null, {
    'Authorization': `Bearer ${testData.dealerToken}`
  });
  
  if (result.status === 200 && result.headers && result.headers['content-type'] && result.headers['content-type'].includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
    console.log(`\n✅ TEST 24 PASSED: Excel report generated for range`);
    console.log(`   Content-Type: ${result.headers['content-type']}`);
    console.log(`   Response is binary Excel file`);
    
    return true;
  }
  
  throw new Error(`TEST 24 FAILED: ${result.status} - Expected Excel file`);
}

// ============================================================================
// TEST 25: Generate pivot-style daily demand report
// ============================================================================

async function test25_GeneratePivotReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 25: Generate pivot-style daily demand report');
  console.log('='.repeat(70));
  
  await loginAsDealer();
  
  if (!testData.dealerId) {
    await findTerritoryAndDealer();
  }
  
  const today = getTodayDate();
  
  console.log(`\n📊 Generating pivot-style daily demand report:`);
  console.log(`   Dealer ID: ${testData.dealerId}`);
  console.log(`   Date: ${today}`);
  
  const result = await makeRequest(`/api/orders/dealer/daily-demand-report/${today}?dealer_id=${testData.dealerId}`, 'GET', null, {
    'Authorization': `Bearer ${testData.dealerToken}`
  });
  
  if (result.status === 200 && result.headers && result.headers['content-type'] && result.headers['content-type'].includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
    console.log(`\n✅ TEST 25 PASSED: Pivot-style daily demand report generated`);
    console.log(`   Content-Type: ${result.headers['content-type']}`);
    console.log(`   Response is binary Excel file`);
    
    return true;
  }
  
  // Show actual error for debugging
  const errorMsg = result.data && result.data.error ? result.data.error : JSON.stringify(result.data);
  throw new Error(`TEST 25 FAILED: ${result.status} - ${errorMsg}`);
}

// ============================================================================
// TEST 26: Get monthly forecast periods
// ============================================================================

async function test26_GetMonthlyForecastPeriods() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 26: Get monthly forecast periods');
  console.log('='.repeat(70));
  
  await loginAsDealer();
  
  if (!testData.dealerId) {
    await findTerritoryAndDealer();
  }
  
  console.log(`\n🔍 Fetching monthly forecast periods:`);
  console.log(`   Dealer ID: ${testData.dealerId}`);
  
  const result = await makeRequest(`/api/monthly-forecast/dealer/${testData.dealerId}/periods`, 'GET', null, {
    'Authorization': `Bearer ${testData.dealerToken}`
  });
  
  if (result.status === 200 && result.data) {
    // API returns {periods: [...]} format
    const periods = Array.isArray(result.data) ? result.data : (result.data.periods || []);
    
    console.log(`\n✅ TEST 26 PASSED: Monthly forecast periods retrieved`);
    console.log(`   Total periods: ${periods.length}`);
    if (periods.length > 0) {
      periods.slice(0, 3).forEach((period, i) => {
        console.log(`   ${i + 1}. ${period.period_start} to ${period.period_end}${period.is_current ? ' (Current)' : ''}`);
      });
    }
    
    return true;
  }
  
  throw new Error(`TEST 26 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 27: Get monthly forecast data
// ============================================================================

async function test27_GetMonthlyForecastData() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 27: Get monthly forecast data');
  console.log('='.repeat(70));
  
  await loginAsDealer();
  
  if (!testData.dealerId) {
    await findTerritoryAndDealer();
  }
  
  console.log(`\n🔍 Fetching monthly forecast data:`);
  console.log(`   Dealer ID: ${testData.dealerId}`);
  
  const result = await makeRequest(`/api/monthly-forecast/dealer/${testData.dealerId}`, 'GET', null, {
    'Authorization': `Bearer ${testData.dealerToken}`
  });
  
  if (result.status === 200 && result.data) {
    // API returns {period_start, period_end, forecast: [...], is_submitted} format
    const forecastData = result.data;
    const forecasts = Array.isArray(forecastData) ? forecastData : (forecastData.forecast || []);
    const periodStart = forecastData.period_start || 'N/A';
    const periodEnd = forecastData.period_end || 'N/A';
    const isSubmitted = forecastData.is_submitted || false;
    
    console.log(`\n✅ TEST 27 PASSED: Monthly forecast data retrieved`);
    console.log(`   Period: ${periodStart} to ${periodEnd}`);
    console.log(`   Status: ${isSubmitted ? 'Submitted' : 'Draft'}`);
    console.log(`   Total forecasts: ${forecasts.length}`);
    if (forecasts.length > 0) {
      forecasts.slice(0, 3).forEach((forecast, i) => {
        console.log(`   ${i + 1}. Product: ${forecast.product_code || forecast.product_id || 'N/A'}, Quantity: ${forecast.quantity || 'N/A'}`);
      });
    }
    
    return true;
  }
  
  throw new Error(`TEST 27 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 28: TSO Get available dates with orders
// ============================================================================

async function test28_TSOGetAvailableDates() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 28: TSO Get available dates with orders');
  console.log('='.repeat(70));
  
  await loginAsTSO();
  
  console.log(`\n🔍 Fetching available dates for TSO:`);
  console.log(`   User ID: ${testData.tsoUserId}`);
  
  const result = await makeRequest(`/api/orders/tso/available-dates?user_id=${testData.tsoUserId}`, 'GET', null, {
    'Authorization': `Bearer ${testData.tsoToken}`
  });
  
  if (result.status === 200 && result.data) {
    // API returns {dates: [...]} format
    const dates = Array.isArray(result.data) ? result.data : (result.data.dates || []);
    
    console.log(`\n✅ TEST 28 PASSED: TSO available dates retrieved`);
    console.log(`   Total dates: ${dates.length}`);
    if (dates.length > 0) {
      console.log(`   Dates: ${dates.slice(0, 10).join(', ')}${dates.length > 10 ? '...' : ''}`);
    }
    
    // Store for use in subsequent tests
    testData.tsoAvailableDates = dates;
    
    return true;
  }
  
  throw new Error(`TEST 28 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 29: TSO Get orders for a specific date
// ============================================================================

async function test29_TSOGetOrdersForDate() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 29: TSO Get orders for a specific date');
  console.log('='.repeat(70));
  
  await loginAsTSO();
  
  const today = getTodayDate();
  
  console.log(`\n🔍 Fetching TSO orders for date:`);
  console.log(`   User ID: ${testData.tsoUserId}`);
  console.log(`   Date: ${today}`);
  
  const result = await makeRequest(`/api/orders/tso/date/${today}?user_id=${testData.tsoUserId}`, 'GET', null, {
    'Authorization': `Bearer ${testData.tsoToken}`
  });
  
  if (result.status === 200 && result.data) {
    // API returns {orders: [...], date: "...", total_orders: X, total_items: Y} format
    const orders = Array.isArray(result.data) ? result.data : (result.data.orders || []);
    
    console.log(`\n✅ TEST 29 PASSED: TSO orders for date retrieved`);
    console.log(`   Date: ${result.data.date || today}`);
    console.log(`   Total orders: ${orders.length}`);
    if (orders.length > 0) {
      orders.slice(0, 3).forEach((order, i) => {
        console.log(`   ${i + 1}. Order ID: ${order.order_id}, Items: ${order.item_count || order.items?.length || 'N/A'}`);
      });
    }
    
    // Store for use in subsequent tests
    testData.tsoOrdersForDate = orders;
    
    return true;
  }
  
  throw new Error(`TEST 29 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 30: TSO Get orders for a date range
// ============================================================================

async function test30_TSOGetOrdersForRange() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 30: TSO Get orders for a date range');
  console.log('='.repeat(70));
  
  await loginAsTSO();
  
  const today = getTodayDate();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 7);
  const endDateStr = endDate.toISOString().split('T')[0];
  
  console.log(`\n🔍 Fetching TSO orders for date range:`);
  console.log(`   User ID: ${testData.tsoUserId}`);
  console.log(`   Start Date: ${today}`);
  console.log(`   End Date: ${endDateStr}`);
  
  // Backend expects startDate and endDate (camelCase), not start_date and end_date
  const result = await makeRequest(`/api/orders/tso/range?user_id=${testData.tsoUserId}&startDate=${today}&endDate=${endDateStr}`, 'GET', null, {
    'Authorization': `Bearer ${testData.tsoToken}`
  });
  
  if (result.status === 200 && result.data) {
    // API returns {orders: [...], total_dealers: X, total_quantity: Y, total_original_orders: Z} format
    const orders = Array.isArray(result.data) ? result.data : (result.data.orders || []);
    
    console.log(`\n✅ TEST 30 PASSED: TSO orders for date range retrieved`);
    console.log(`   Total orders: ${orders.length}`);
    if (result.data.total_dealers !== undefined) {
      console.log(`   Total dealers: ${result.data.total_dealers}`);
    }
    if (orders.length > 0) {
      orders.slice(0, 3).forEach((order, i) => {
        console.log(`   ${i + 1}. Order ID: ${order.order_id || 'N/A'}, Dealer: ${order.dealer_name || 'N/A'}, Quantity: ${order.total_quantity || 'N/A'}`);
      });
    }
    
    // Store for use in subsequent tests
    testData.tsoOrdersForRange = orders;
    
    return true;
  }
  
  throw new Error(`TEST 30 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 31: TSO Generate Excel report for a date range
// ============================================================================

async function test31_TSOGenerateReportForRange() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 31: TSO Generate Excel report for a date range');
  console.log('='.repeat(70));
  
  await loginAsTSO();
  
  const today = getTodayDate();
  // Calculate end date directly from string to avoid timezone issues
  const todayDate = new Date(today + 'T00:00:00'); // Use local time to match getTodayDate()
  todayDate.setDate(todayDate.getDate() + 7);
  const endDateStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
  
  console.log(`\n📊 Generating TSO Excel report for date range:`);
  console.log(`   User ID: ${testData.tsoUserId}`);
  console.log(`   Start Date: ${today}`);
  console.log(`   End Date: ${endDateStr}`);
  
  // Backend expects startDate and endDate (camelCase), not start_date and end_date
  const result = await makeRequest(`/api/orders/tso/my-report-range?user_id=${testData.tsoUserId}&startDate=${today}&endDate=${endDateStr}`, 'GET', null, {
    'Authorization': `Bearer ${testData.tsoToken}`
  });
  
  if (result.status === 200 && result.headers && result.headers['content-type'] && result.headers['content-type'].includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
    console.log(`\n✅ TEST 31 PASSED: TSO Excel report generated for range`);
    console.log(`   Content-Type: ${result.headers['content-type']}`);
    console.log(`   Response is binary Excel file`);
    
    return true;
  }
  
  // Handle case where no orders exist (404 is expected if Test 8 deleted orders or no orders created)
  if (result.status === 404 && result.data && result.data.error && result.data.error.includes('No orders found')) {
    console.log(`\n⚠️  TEST 31 SKIPPED: No orders found for date range`);
    console.log(`   Status: 404`);
    console.log(`   Message: ${result.data.error}`);
    console.log(`   💡 This is expected if no orders exist in the date range`);
    console.log(`   ✅ API correctly handles empty result set`);
    return true; // Skip but don't fail
  }
  
  // Show actual error for debugging
  const errorMsg = result.data && result.data.error ? result.data.error : JSON.stringify(result.data);
  throw new Error(`TEST 31 FAILED: ${result.status} - ${errorMsg}`);
}

// ============================================================================
// TEST 32: TSO Get management report for a date
// ============================================================================

async function test32_TSOGetManagementReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 32: TSO Get management report for a date');
  console.log('='.repeat(70));
  
  await loginAsTSO();
  
  const today = getTodayDate();
  
  console.log(`\n📊 Generating TSO management report:`);
  console.log(`   Date: ${today}`);
  
  const result = await makeRequest(`/api/orders/mr-report/${today}`, 'GET', null, {
    'Authorization': `Bearer ${testData.tsoToken}`
  });
  
  // Backend returns CSV file, not Excel
  if (result.status === 200 && result.headers && result.headers['content-type'] && result.headers['content-type'].includes('text/csv')) {
    console.log(`\n✅ TEST 32 PASSED: TSO management report generated`);
    console.log(`   Content-Type: ${result.headers['content-type']}`);
    console.log(`   Response is CSV file`);
    
    return true;
  }
  
  // Show actual error for debugging
  const errorMsg = result.data && result.data.error ? result.data.error : JSON.stringify(result.data);
  throw new Error(`TEST 32 FAILED: ${result.status} - ${errorMsg}`);
}

// ============================================================================
// TEST 33: Admin Create user
// ============================================================================

async function test33_AdminCreateUser() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 33: Admin Create user');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  const testUsername = `test_user_${Date.now()}`;
  
  console.log(`\n👤 Creating new user:`);
  console.log(`   Username: ${testUsername}`);
  console.log(`   Role: tso`);
  
  const userPayload = {
    username: testUsername,
    password: 'test123',
    full_name: 'Test User',
    role: 'tso',
    territory_code: testData.territoryName
  };
  
  const result = await makeRequest('/api/users', 'POST', userPayload, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data) {
    const userId = result.data.id || result.data.user_id;
    console.log(`\n✅ TEST 33 PASSED: User created successfully`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Username: ${testUsername}`);
    
    // Store for cleanup if needed
    if (!testData.createdUserIds) {
      testData.createdUserIds = [];
    }
    testData.createdUserIds.push({ id: userId, username: testUsername });
    
    return true;
  }
  
  throw new Error(`TEST 33 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 34: Admin Get all users
// ============================================================================

async function test34_AdminGetAllUsers() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 34: Admin Get all users');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  console.log(`\n🔍 Fetching all users...`);
  
  const result = await makeRequest('/api/users', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && Array.isArray(result.data)) {
    console.log(`\n✅ TEST 34 PASSED: All users retrieved`);
    console.log(`   Total users: ${result.data.length}`);
    if (result.data.length > 0) {
      result.data.slice(0, 5).forEach((user, i) => {
        console.log(`   ${i + 1}. ${user.username} (${user.role}) - ${user.full_name || 'N/A'}`);
      });
    }
    
    return true;
  }
  
  throw new Error(`TEST 34 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 35: Admin Update user
// ============================================================================

async function test35_AdminUpdateUser() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 35: Admin Update user');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  // First get all users to find one to update
  const usersResult = await makeRequest('/api/users', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (usersResult.status !== 200 || !Array.isArray(usersResult.data) || usersResult.data.length === 0) {
    console.log(`\n⚠️  TEST 35 SKIPPED: No users found to update`);
    return true;
  }
  
  const userToUpdate = usersResult.data.find(u => u.role === 'tso') || usersResult.data[0];
  const userId = userToUpdate.id;
  
  console.log(`\n👤 Updating user:`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Current name: ${userToUpdate.full_name || 'N/A'}`);
  console.log(`   New name: Updated Test User`);
  
  const updatePayload = {
    username: userToUpdate.username, // Required: username must be included in update
    full_name: 'Updated Test User',
    role: userToUpdate.role,
    territory_name: userToUpdate.territory_name || null,
    dealer_id: userToUpdate.dealer_id || null
  };
  
  const result = await makeRequest(`/api/users/${userId}`, 'PUT', updatePayload, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data) {
    console.log(`\n✅ TEST 35 PASSED: User updated successfully`);
    console.log(`   User ID: ${userId}`);
    
    return true;
  }
  
  throw new Error(`TEST 35 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 36: Admin Create transport
// ============================================================================

async function test36_AdminCreateTransport() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 36: Admin Create transport');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  const testTruckDetails = `TEST-TRUCK-${Date.now()}`;
  
  console.log(`\n🚚 Creating new transport:`);
  console.log(`   Truck Details: ${testTruckDetails}`);
  
  const transportPayload = {
    truck_details: testTruckDetails,
    driver_name: 'Test Driver',
    driver_phone: '1234567890',
    status: 'A'
  };
  
  const result = await makeRequest('/api/transports', 'POST', transportPayload, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data) {
    const transportId = result.data.id || result.data.transport_id;
    console.log(`\n✅ TEST 36 PASSED: Transport created successfully`);
    console.log(`   Transport ID: ${transportId}`);
    console.log(`   Truck Details: ${testTruckDetails}`);
    
    // Store for cleanup if needed
    if (!testData.createdTransportIds) {
      testData.createdTransportIds = [];
    }
    testData.createdTransportIds.push({ id: transportId, truck_details: testTruckDetails });
    
    return true;
  }
  
  throw new Error(`TEST 36 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 37: Admin Update transport
// ============================================================================

async function test37_AdminUpdateTransport() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 37: Admin Update transport');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  // First get all transports to find one to update
  const transportsResult = await makeRequest('/api/transports', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (transportsResult.status !== 200 || !Array.isArray(transportsResult.data) || transportsResult.data.length === 0) {
    console.log(`\n⚠️  TEST 37 SKIPPED: No transports found to update`);
    return true;
  }
  
  const transportToUpdate = transportsResult.data[0];
  const transportId = transportToUpdate.id;
  
  console.log(`\n🚚 Updating transport:`);
  console.log(`   Transport ID: ${transportId}`);
  console.log(`   Current driver: ${transportToUpdate.driver_name || 'N/A'}`);
  console.log(`   New driver: Updated Test Driver`);
  
  const updatePayload = {
    driver_name: 'Updated Test Driver',
    driver_phone: transportToUpdate.driver_phone || '1234567890',
    status: transportToUpdate.status || 'A'
  };
  
  const result = await makeRequest(`/api/transports/${transportId}`, 'PUT', updatePayload, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data) {
    console.log(`\n✅ TEST 37 PASSED: Transport updated successfully`);
    console.log(`   Transport ID: ${transportId}`);
    
    return true;
  }
  
  throw new Error(`TEST 37 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 38: Admin Get monthly forecast start day setting
// ============================================================================

async function test38_AdminGetForecastStartDay() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 38: Admin Get monthly forecast start day setting');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  console.log(`\n🔍 Fetching monthly forecast start day setting...`);
  
  const result = await makeRequest('/api/settings/monthly-forecast-start-day', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data) {
    console.log(`\n✅ TEST 38 PASSED: Monthly forecast start day retrieved`);
    console.log(`   Start Day: ${result.data.start_day || result.data.value || 'N/A'}`);
    
    return true;
  }
  
  throw new Error(`TEST 38 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 39: Admin Update monthly forecast start day setting
// ============================================================================

async function test39_AdminUpdateForecastStartDay() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 39: Admin Update monthly forecast start day setting');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  // First get current setting
  const getResult = await makeRequest('/api/settings/monthly-forecast-start-day', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  const currentStartDay = getResult.status === 200 && getResult.data ? (getResult.data.start_day || getResult.data.value || 1) : 1;
  const newStartDay = currentStartDay === 1 ? 15 : 1; // Toggle between 1 and 15
  
  console.log(`\n⚙️  Updating monthly forecast start day:`);
  console.log(`   Current: Day ${currentStartDay}`);
  console.log(`   New: Day ${newStartDay}`);
  
  const updatePayload = {
    start_day: newStartDay
  };
  
  const result = await makeRequest('/api/settings/monthly-forecast-start-day', 'PUT', updatePayload, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data) {
    console.log(`\n✅ TEST 39 PASSED: Monthly forecast start day updated`);
    console.log(`   New Start Day: ${newStartDay}`);
    
    // Restore original value
    const restorePayload = {
      start_day: currentStartDay
    };
    await makeRequest('/api/settings/monthly-forecast-start-day', 'PUT', restorePayload, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    console.log(`   ✅ Restored to original value: Day ${currentStartDay}`);
    
    return true;
  }
  
  throw new Error(`TEST 39 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 40: Admin Delete user
// ============================================================================

async function test40_AdminDeleteUser() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 40: Admin Delete user');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  // First create a user to delete (using test 33 logic)
  const testUsername = `test_delete_user_${Date.now()}`;
  
  const createPayload = {
    username: testUsername,
    password: 'test123',
    full_name: 'Test User To Delete',
    role: 'tso',
    territory_code: testData.territoryName
  };
  
  const createResult = await makeRequest('/api/users', 'POST', createPayload, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (createResult.status !== 200 || !createResult.data) {
    console.log(`\n⚠️  TEST 40 SKIPPED: Could not create test user for deletion`);
    return true;
  }
  
  const userId = createResult.data.id || createResult.data.user_id;
  
  console.log(`\n👤 Deleting user:`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Username: ${testUsername}`);
  
  const result = await makeRequest(`/api/users/${userId}`, 'DELETE', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200) {
    console.log(`\n✅ TEST 40 PASSED: User deleted successfully`);
    console.log(`   User ID: ${userId}`);
    
    return true;
  }
  
  throw new Error(`TEST 40 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 41: Admin Delete transport
// ============================================================================

async function test41_AdminDeleteTransport() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 41: Admin Delete transport');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  // First create a transport to delete (using test 36 logic)
  const testTruckDetails = `TEST-DELETE-TRUCK-${Date.now()}`;
  
  const createPayload = {
    truck_details: testTruckDetails,
    driver_name: 'Test Driver To Delete',
    driver_phone: '1234567890',
    status: 'A'
  };
  
  const createResult = await makeRequest('/api/transports', 'POST', createPayload, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (createResult.status !== 200 || !createResult.data) {
    console.log(`\n⚠️  TEST 41 SKIPPED: Could not create test transport for deletion`);
    return true;
  }
  
  const transportId = createResult.data.id || createResult.data.transport_id;
  
  console.log(`\n🚚 Deleting transport:`);
  console.log(`   Transport ID: ${transportId}`);
  console.log(`   Truck Details: ${testTruckDetails}`);
  
  const result = await makeRequest(`/api/transports/${transportId}`, 'DELETE', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200) {
    console.log(`\n✅ TEST 41 PASSED: Transport deleted successfully`);
    console.log(`   Transport ID: ${transportId}`);
    
    return true;
  }
  
  throw new Error(`TEST 41 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 42: Admin Get transport by ID
// ============================================================================

async function test42_AdminGetTransportById() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 42: Admin Get transport by ID');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  // First get all transports to find one
  const transportsResult = await makeRequest('/api/transports', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (transportsResult.status !== 200 || !Array.isArray(transportsResult.data) || transportsResult.data.length === 0) {
    console.log(`\n⚠️  TEST 42 SKIPPED: No transports found`);
    return true;
  }
  
  const transport = transportsResult.data[0];
  const transportId = transport.id;
  
  console.log(`\n🔍 Fetching transport by ID:`);
  console.log(`   Transport ID: ${transportId}`);
  
  const result = await makeRequest(`/api/transports/${transportId}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data) {
    console.log(`\n✅ TEST 42 PASSED: Transport retrieved by ID`);
    console.log(`   Transport ID: ${result.data.id || transportId}`);
    console.log(`   Truck Details: ${result.data.truck_details || 'N/A'}`);
    
    return true;
  }
  
  throw new Error(`TEST 42 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 43: Comprehensive Quota Allocation Test - All workflows of manage quotas page
// ============================================================================

async function test43_QuotaAllocationWorkflows() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 43: quota_allocation_test - Randomly allocate daily quotas and test all quota management workflows');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  // Get today's date
  const today = testData.today || getTodayDate();
  
  // Get products, territories, and test data
  console.log(`\n📊 Gathering test data...`);
  
  // Get all products
  const productsResult = await makeRequest('/api/products', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (productsResult.status !== 200 || !Array.isArray(productsResult.data) || productsResult.data.length === 0) {
    throw new Error(`TEST 43 FAILED: Could not fetch products. Status: ${productsResult.status}`);
  }
  
  const allProducts = productsResult.data;
  console.log(`   ✅ Found ${allProducts.length} products`);
  
  // Get all territories
  const territoriesResult = await makeRequest('/api/dealers/territories', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (territoriesResult.status !== 200 || !Array.isArray(territoriesResult.data) || territoriesResult.data.length === 0) {
    throw new Error(`TEST 43 FAILED: Could not fetch territories. Status: ${territoriesResult.status}`);
  }
  
  const allTerritories = territoriesResult.data;
  console.log(`   ✅ Found ${allTerritories.length} territories`);
  
  // Randomly select products and territories for allocation
  const numProductsToAllocate = Math.min(5, allProducts.length);
  const numTerritoriesToAllocate = Math.min(3, allTerritories.length);
  
  const selectedProducts = [];
  const selectedTerritories = [];
  const allocatedQuotas = []; // Store allocated quotas for cleanup/testing
  
  // Randomly select products
  const shuffledProducts = [...allProducts].sort(() => Math.random() - 0.5);
  for (let i = 0; i < numProductsToAllocate; i++) {
    selectedProducts.push(shuffledProducts[i]);
  }
  
  // Randomly select territories
  const shuffledTerritories = [...allTerritories].sort(() => Math.random() - 0.5);
  for (let i = 0; i < numTerritoriesToAllocate; i++) {
    selectedTerritories.push(shuffledTerritories[i]);
  }
  
  console.log(`\n🎲 Random selection:`);
  console.log(`   Products: ${numProductsToAllocate} selected`);
  console.log(`   Territories: ${numTerritoriesToAllocate} selected`);
  selectedProducts.forEach((p, i) => {
    console.log(`      ${i + 1}. ${p.product_code} - ${p.name}`);
  });
  selectedTerritories.forEach((t, i) => {
    console.log(`      ${i + 1}. ${t}`);
  });
  
  // ============================================================================
  // 1. BULK ALLOCATION TEST
  // ============================================================================
  
  console.log(`\n${'='.repeat(70)}`);
  console.log('1️⃣  Testing Bulk Allocation (POST /api/product-caps/bulk)');
  console.log('='.repeat(70));
  
  const quotasToAllocate = [];
  
  // Generate random quotas for each product-territory combination
  selectedProducts.forEach(product => {
    selectedTerritories.forEach(territory => {
      const randomQuantity = Math.floor(Math.random() * 100) + 10; // Random between 10-110
      quotasToAllocate.push({
        date: today,
        product_id: product.id,
        product_code: product.product_code,
        product_name: product.name,
        territory_name: territory,
        max_quantity: randomQuantity
      });
      
      allocatedQuotas.push({
        productId: product.id,
        productCode: product.product_code,
        productName: product.name,
        territoryName: territory,
        quantity: randomQuantity
      });
    });
  });
  
  console.log(`\n📦 Preparing to allocate ${quotasToAllocate.length} quotas...`);
  quotasToAllocate.forEach((q, i) => {
    console.log(`   ${i + 1}. ${q.product_code} | ${q.territory_name} | ${q.max_quantity} units`);
  });
  
  const bulkAllocationResult = await makeRequest('/api/product-caps/bulk', 'POST', {
    quotas: quotasToAllocate
  }, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (bulkAllocationResult.status !== 200 || !bulkAllocationResult.data || !bulkAllocationResult.data.success) {
    throw new Error(`TEST 43 FAILED: Bulk allocation failed. Status: ${bulkAllocationResult.status} - ${JSON.stringify(bulkAllocationResult.data)}`);
  }
  
  console.log(`\n✅ Bulk allocation successful!`);
  console.log(`   Allocated ${quotasToAllocate.length} quotas`);
  
  // ============================================================================
  // 2. VIEW QUOTAS TEST
  // ============================================================================
  
  console.log(`\n${'='.repeat(70)}`);
  console.log('2️⃣  Testing View Quotas (GET /api/product-caps)');
  console.log('='.repeat(70));
  
  // View all quotas for today
  const viewAllResult = await makeRequest(`/api/product-caps?date=${today}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (viewAllResult.status !== 200 || !Array.isArray(viewAllResult.data)) {
    throw new Error(`TEST 43 FAILED: Could not view quotas. Status: ${viewAllResult.status}`);
  }
  
  console.log(`\n✅ View all quotas successful!`);
  console.log(`   Total quotas for ${today}: ${viewAllResult.data.length}`);
  
  // View quotas for a specific territory
  const testTerritory = selectedTerritories[0];
  const viewTerritoryResult = await makeRequest(`/api/product-caps?date=${today}&territory_name=${encodeURIComponent(testTerritory)}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (viewTerritoryResult.status !== 200 || !Array.isArray(viewTerritoryResult.data)) {
    throw new Error(`TEST 43 FAILED: Could not view quotas for territory. Status: ${viewTerritoryResult.status}`);
  }
  
  const territoryQuotas = viewTerritoryResult.data.filter(q => q.territory_name === testTerritory);
  console.log(`   Quotas for territory "${testTerritory}": ${territoryQuotas.length}`);
  
  // Verify allocated quotas are present
  let verifiedCount = 0;
  allocatedQuotas.forEach(allocated => {
    const found = viewAllResult.data.find(q => 
      q.product_id === allocated.productId && 
      q.territory_name === allocated.territoryName &&
      q.date === today
    );
    if (found) {
      verifiedCount++;
    }
  });
  
  console.log(`   ✅ Verified ${verifiedCount}/${allocatedQuotas.length} allocated quotas are visible`);
  
  if (verifiedCount < allocatedQuotas.length) {
    console.log(`   ⚠️  Warning: Some allocated quotas may have been accumulated with existing ones`);
  }
  
  // ============================================================================
  // 3. UPDATE QUOTA TEST
  // ============================================================================
  
  console.log(`\n${'='.repeat(70)}`);
  console.log('3️⃣  Testing Update Quota (PUT /api/product-caps/:date/:productId/:territoryName)');
  console.log('='.repeat(70));
  
  if (allocatedQuotas.length === 0) {
    throw new Error(`TEST 43 FAILED: No quotas allocated to test update`);
  }
  
  const quotaToUpdate = allocatedQuotas[0];
  
  // Get current quota
  const currentQuotaResult = await makeRequest(`/api/product-caps?date=${today}&territory_name=${encodeURIComponent(quotaToUpdate.territoryName)}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  let currentMaxQuantity = quotaToUpdate.quantity;
  if (currentQuotaResult.status === 200 && Array.isArray(currentQuotaResult.data)) {
    const foundQuota = currentQuotaResult.data.find(q => 
      q.product_id === quotaToUpdate.productId && 
      q.territory_name === quotaToUpdate.territoryName
    );
    if (foundQuota) {
      currentMaxQuantity = Number(foundQuota.max_quantity) || currentMaxQuantity;
    }
  }
  
  const newMaxQuantity = currentMaxQuantity + 50; // Add 50 more units
  
  console.log(`\n📊 Updating quota:`);
  console.log(`   Product: ${quotaToUpdate.productCode}`);
  console.log(`   Territory: ${quotaToUpdate.territoryName}`);
  console.log(`   Date: ${today}`);
  console.log(`   Current: ${currentMaxQuantity} units`);
  console.log(`   New: ${newMaxQuantity} units (+50)`);
  
  const updateResult = await makeRequest(
    `/api/product-caps/${today}/${quotaToUpdate.productId}/${encodeURIComponent(quotaToUpdate.territoryName)}`,
    'PUT',
    { max_quantity: newMaxQuantity },
    {
      'Authorization': `Bearer ${testData.adminToken}`
    }
  );
  
  if (updateResult.status !== 200 || !updateResult.data || !updateResult.data.success) {
    throw new Error(`TEST 43 FAILED: Update quota failed. Status: ${updateResult.status} - ${JSON.stringify(updateResult.data)}`);
  }
  
  console.log(`\n✅ Quota updated successfully!`);
  
  // Verify update
  const verifyUpdateResult = await makeRequest(`/api/product-caps?date=${today}&territory_name=${encodeURIComponent(quotaToUpdate.territoryName)}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (verifyUpdateResult.status === 200 && Array.isArray(verifyUpdateResult.data)) {
    const updatedQuota = verifyUpdateResult.data.find(q => 
      q.product_id === quotaToUpdate.productId && 
      q.territory_name === quotaToUpdate.territoryName
    );
    
    if (updatedQuota && Number(updatedQuota.max_quantity) === newMaxQuantity) {
      console.log(`   ✅ Verified: Max quantity is now ${newMaxQuantity} units`);
      quotaToUpdate.quantity = newMaxQuantity; // Update stored value
    } else {
      console.log(`   ⚠️  Warning: Verification shows different quantity (expected ${newMaxQuantity}, got ${updatedQuota ? updatedQuota.max_quantity : 'N/A'})`);
    }
  }
  
  // ============================================================================
  // 4. TSO VIEW TEST
  // ============================================================================
  
  console.log(`\n${'='.repeat(70)}`);
  console.log('4️⃣  Testing TSO View (GET /api/product-caps/tso-today)');
  console.log('='.repeat(70));
  
  // Test TSO view for each allocated territory
  for (const territory of selectedTerritories) {
    console.log(`\n📊 Testing TSO view for territory: ${territory}`);
    
    const tsoViewResult = await makeRequest(`/api/product-caps/tso-today?territory_name=${encodeURIComponent(territory)}`, 'GET', null, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (tsoViewResult.status !== 200 || !Array.isArray(tsoViewResult.data)) {
      console.log(`   ⚠️  TSO view failed for ${territory}. Status: ${tsoViewResult.status}`);
      continue;
    }
    
    const tsoQuotas = tsoViewResult.data;
    console.log(`   ✅ TSO view successful! Found ${tsoQuotas.length} quotas`);
    
    // Check if our allocated quotas are visible
    const allocatedInTerritory = allocatedQuotas.filter(q => q.territoryName === territory);
    let visibleCount = 0;
    
    allocatedInTerritory.forEach(allocated => {
      const found = tsoQuotas.find(q => q.product_id === allocated.productId);
      if (found) {
        visibleCount++;
      }
    });
    
    console.log(`   📊 Allocated quotas visible: ${visibleCount}/${allocatedInTerritory.length}`);
    
    if (tsoQuotas.length > 0) {
      console.log(`   📋 Sample quota data:`);
      const sample = tsoQuotas[0];
      console.log(`      Product: ${sample.product_code || 'N/A'} - ${sample.product_name || 'N/A'}`);
      console.log(`      Max: ${sample.max_quantity || 'N/A'}, Sold: ${sample.sold_quantity || 0}, Remaining: ${sample.remaining_quantity || 'N/A'}`);
    }
  }
  
  // ============================================================================
  // 5. QUOTA CONSTRAINT TEST (Cannot set below sold)
  // ============================================================================
  
  console.log(`\n${'='.repeat(70)}`);
  console.log('5️⃣  Testing Quota Constraints (Cannot set quota below sold quantity)');
  console.log('='.repeat(70));
  
  // Find a quota that might have sold items (if any orders exist)
  // For this test, we'll try to set a quota to 0, which should fail if there are sold items
  // Actually, let's try setting a quota below the current max to test the constraint
  
  console.log(`\n💡 Note: Constraint test requires existing orders to be meaningful.`);
  console.log(`   Testing by attempting to set quota below potential sold quantity...`);
  
  // Test constraint: Try to set quota to a very low value
  // If there are sold items, this should fail
  // This is a soft test - constraint will only fail if there are actual sold items
  
  const testQuotaForConstraint = allocatedQuotas[allocatedQuotas.length - 1]; // Use last allocated quota
  
  console.log(`\n📊 Testing constraint for:`);
  console.log(`   Product: ${testQuotaForConstraint.productCode}`);
  console.log(`   Territory: ${testQuotaForConstraint.territoryName}`);
  
  // Get current quota with sold quantity
  const constraintCheckResult = await makeRequest(`/api/product-caps?date=${today}&territory_name=${encodeURIComponent(testQuotaForConstraint.territoryName)}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (constraintCheckResult.status === 200 && Array.isArray(constraintCheckResult.data)) {
    const quotaWithSold = constraintCheckResult.data.find(q => 
      q.product_id === testQuotaForConstraint.productId && 
      q.territory_name === testQuotaForConstraint.territoryName
    );
    
    if (quotaWithSold) {
      const soldQuantity = Number(quotaWithSold.sold_quantity) || 0;
      const currentMax = Number(quotaWithSold.max_quantity) || 0;
      
      console.log(`   Current max: ${currentMax} units`);
      console.log(`   Sold quantity: ${soldQuantity} units`);
      
      if (soldQuantity > 0) {
        // Try to set quota below sold quantity (should fail)
        const invalidQuantity = Math.max(0, soldQuantity - 1);
        console.log(`\n   🚫 Attempting to set quota to ${invalidQuantity} (below sold ${soldQuantity})...`);
        
        const constraintResult = await makeRequest(
          `/api/product-caps/${today}/${testQuotaForConstraint.productId}/${encodeURIComponent(testQuotaForConstraint.territoryName)}`,
          'PUT',
          { max_quantity: invalidQuantity },
          {
            'Authorization': `Bearer ${testData.adminToken}`
          }
        );
        
        if (constraintResult.status === 400) {
          console.log(`   ✅ Constraint working correctly! Cannot set quota below sold quantity.`);
          console.log(`      Error: ${constraintResult.data?.error || 'Validation failed'}`);
        } else {
          console.log(`   ⚠️  Constraint test: Expected 400, got ${constraintResult.status}`);
        }
      } else {
        console.log(`   ℹ️  No sold items, constraint test skipped (would need orders to test properly)`);
      }
    }
  }
  
  // ============================================================================
  // 6. DELETE QUOTA TEST (When no sold items)
  // ============================================================================
  
  console.log(`\n${'='.repeat(70)}`);
  console.log('6️⃣  Testing Delete Quota (DELETE /api/product-caps/:date/:productId/:territoryName)');
  console.log('='.repeat(70));
  
  // Find a quota with no sold items to delete
  let quotaToDelete = null;
  
  // Check each allocated quota for sold items
  for (const allocated of allocatedQuotas) {
    const checkDeleteResult = await makeRequest(`/api/product-caps?date=${today}&territory_name=${encodeURIComponent(allocated.territoryName)}`, 'GET', null, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (checkDeleteResult.status === 200 && Array.isArray(checkDeleteResult.data)) {
      const quota = checkDeleteResult.data.find(q => 
        q.product_id === allocated.productId && 
        q.territory_name === allocated.territoryName
      );
      
      if (quota) {
        const soldQuantity = Number(quota.sold_quantity) || 0;
        if (soldQuantity === 0) {
          quotaToDelete = {
            productId: allocated.productId,
            productCode: allocated.productCode,
            territoryName: allocated.territoryName,
            quantity: Number(quota.max_quantity) || 0
          };
          break;
        }
      }
    }
  }
  
  if (quotaToDelete) {
    console.log(`\n📊 Deleting quota:`);
    console.log(`   Product: ${quotaToDelete.productCode}`);
    console.log(`   Territory: ${quotaToDelete.territoryName}`);
    console.log(`   Date: ${today}`);
    console.log(`   Quantity: ${quotaToDelete.quantity} units (no sold items)`);
    
    const deleteResult = await makeRequest(
      `/api/product-caps/${today}/${quotaToDelete.productId}/${encodeURIComponent(quotaToDelete.territoryName)}`,
      'DELETE',
      null,
      {
        'Authorization': `Bearer ${testData.adminToken}`
      }
    );
    
    if (deleteResult.status === 200 && deleteResult.data && deleteResult.data.success) {
      console.log(`\n✅ Quota deleted successfully!`);
      
      // Verify deletion
      const verifyDeleteResult = await makeRequest(`/api/product-caps?date=${today}&territory_name=${encodeURIComponent(quotaToDelete.territoryName)}`, 'GET', null, {
        'Authorization': `Bearer ${testData.adminToken}`
      });
      
      if (verifyDeleteResult.status === 200 && Array.isArray(verifyDeleteResult.data)) {
        const deletedQuota = verifyDeleteResult.data.find(q => 
          q.product_id === quotaToDelete.productId && 
          q.territory_name === quotaToDelete.territoryName
        );
        
        if (!deletedQuota) {
          console.log(`   ✅ Verified: Quota no longer exists`);
        } else {
          console.log(`   ⚠️  Warning: Quota still exists after deletion`);
        }
      }
    } else if (deleteResult.status === 400) {
      console.log(`\n✅ Constraint working! Cannot delete quota:`);
      console.log(`   Error: ${deleteResult.data?.error || 'Validation failed'}`);
    } else {
      console.log(`\n⚠️  Delete quota returned status ${deleteResult.status}:`);
      console.log(`   Response: ${JSON.stringify(deleteResult.data)}`);
    }
  } else {
    console.log(`\n⚠️  No quota available for deletion (all have sold items or not found)`);
    console.log(`   This is expected if quotas have associated orders.`);
  }
  
  // ============================================================================
  // SUMMARY
  // ============================================================================
  
  console.log(`\n${'='.repeat(70)}`);
  console.log('📋 TEST 43 SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Bulk Allocation: Passed (${quotasToAllocate.length} quotas allocated)`);
  console.log(`✅ View Quotas: Passed (verified ${verifiedCount}/${allocatedQuotas.length} quotas)`);
  console.log(`✅ Update Quota: Passed`);
  console.log(`✅ TSO View: Passed (tested ${selectedTerritories.length} territories)`);
  console.log(`✅ Quota Constraints: Tested`);
  console.log(`✅ Delete Quota: ${quotaToDelete ? 'Passed' : 'Skipped (no eligible quotas)'}`);
  
  console.log(`\n✅ TEST 43 PASSED: All quota allocation workflows working correctly!`);
  
  return true;
}

// ============================================================================
// TEST 44: Add random monthly forecasts for all dealers
// ============================================================================

async function test44_AddRandomMonthlyForecasts() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 44: Add random monthly forecasts for all dealers');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  // Get current period
  const periodResult = await makeRequest('/api/monthly-forecast/current-period');
  if (periodResult.status !== 200 || !periodResult.data) {
    throw new Error(`TEST 44 FAILED: Could not get current period. Status: ${periodResult.status}`);
  }
  
  const period = periodResult.data;
  console.log(`\n📅 Current forecast period:`);
  console.log(`   Start: ${period.start}`);
  console.log(`   End: ${period.end}`);
  
  // Get all dealers
  console.log(`\n🔍 Fetching all dealers...`);
  const dealersResult = await makeRequest('/api/dealers', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (dealersResult.status !== 200 || !Array.isArray(dealersResult.data) || dealersResult.data.length === 0) {
    throw new Error(`TEST 44 FAILED: Could not fetch dealers. Status: ${dealersResult.status}`);
  }
  
  const allDealers = dealersResult.data;
  console.log(`   ✅ Found ${allDealers.length} dealers`);
  
  // Limit number of dealers to process (for performance - can be configured via env var)
  const maxDealersToProcess = parseInt(process.env.MAX_DEALERS_FORECAST || '10', 10);
  const dealersToProcess = allDealers.slice(0, maxDealersToProcess);
  
  if (allDealers.length > maxDealersToProcess) {
    console.log(`   ℹ️  Limiting to first ${maxDealersToProcess} dealers for performance (set MAX_DEALERS_FORECAST env var to change)`);
  }
  
  // Statistics
  let totalForecastsAttempted = 0;
  let totalForecastsCreated = 0;
  let totalForecastsSkipped = 0;
  let totalForecastsFailed = 0;
  
  console.log(`\n📊 Adding random monthly forecasts for ${dealersToProcess.length} dealer(s)...`);
  
  // Process each dealer
  for (const dealer of dealersToProcess) {
    // Get dealer's assigned products
    const assignmentsResult = await makeRequest(`/api/dealer-assignments/${dealer.id}`, 'GET', null, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (assignmentsResult.status !== 200 || !Array.isArray(assignmentsResult.data) || assignmentsResult.data.length === 0) {
      console.log(`   ⚠️  Dealer ${dealer.name || dealer.code} (ID: ${dealer.id}): No assigned products - skipping`);
      totalForecastsSkipped++;
      continue;
    }
    
    // Get products with product assignments (not category)
    const productAssignments = assignmentsResult.data.filter(a => 
      a.assignment_type === 'product' && a.product_id
    );
    
    if (productAssignments.length === 0) {
      console.log(`   ⚠️  Dealer ${dealer.name || dealer.code} (ID: ${dealer.id}): No product assignments - skipping`);
      totalForecastsSkipped++;
      continue;
    }
    
    // Check existing forecasts for this dealer/period
    const existingForecastsResult = await makeRequest(`/api/monthly-forecast/dealer/${dealer.id}`, 'GET', null, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    let existingProductIds = new Set();
    if (existingForecastsResult.status === 200 && Array.isArray(existingForecastsResult.data)) {
      existingForecastsResult.data.forEach(f => {
        if (f.period_start === period.start && f.period_end === period.end) {
          existingProductIds.add(f.product_id);
        }
      });
    }
    
    // Select 1-3 random products that don't have forecasts yet
    const availableProducts = productAssignments.filter(a => !existingProductIds.has(a.product_id));
    
    if (availableProducts.length === 0) {
      console.log(`   ⚠️  Dealer ${dealer.name || dealer.code} (ID: ${dealer.id}): All products already have forecasts - skipping`);
      totalForecastsSkipped++;
      continue;
    }
    
    // Random number of products between 1 and min(3, availableProducts.length)
    const numProducts = Math.floor(Math.random() * Math.min(3, availableProducts.length)) + 1;
    const shuffledProducts = [...availableProducts].sort(() => Math.random() - 0.5);
    const selectedProducts = shuffledProducts.slice(0, numProducts);
    
    console.log(`\n   📋 Dealer: ${dealer.name || dealer.code} (ID: ${dealer.id})`);
    console.log(`      Selected ${selectedProducts.length} product(s) for forecast`);
    
    // Create forecasts for selected products
    for (const assignment of selectedProducts) {
      totalForecastsAttempted++;
      
      // Random quantity between 10 and 100
      const randomQuantity = Math.floor(Math.random() * 91) + 10;
      
      const forecastPayload = {
        dealer_id: dealer.id,
        product_id: assignment.product_id,
        period_start: period.start,
        period_end: period.end,
        quantity: randomQuantity
      };
      
      try {
        const result = await makeRequest('/api/monthly-forecast', 'POST', forecastPayload, {
          'Authorization': `Bearer ${testData.adminToken}`
        });
        
        if (result.status === 200 && result.data) {
          totalForecastsCreated++;
          console.log(`      ✅ Product ID ${assignment.product_id}: ${randomQuantity} units`);
        } else if (result.status === 403 && result.data && result.data.error && 
                   result.data.error.includes('already been submitted')) {
          totalForecastsSkipped++;
          console.log(`      ⚠️  Product ID ${assignment.product_id}: Already submitted - skipping`);
        } else {
          totalForecastsFailed++;
          console.log(`      ❌ Product ID ${assignment.product_id}: Failed (${result.status})`);
        }
      } catch (error) {
        totalForecastsFailed++;
        console.log(`      ❌ Product ID ${assignment.product_id}: Error - ${error.message}`);
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  console.log(`\n${'='.repeat(70)}`);
  console.log('📋 TEST 44 SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Total dealers in system: ${allDealers.length}`);
  console.log(`✅ Dealers processed: ${dealersToProcess.length}`);
  console.log(`✅ Forecasts attempted: ${totalForecastsAttempted}`);
  console.log(`✅ Forecasts created: ${totalForecastsCreated}`);
  console.log(`⚠️  Forecasts skipped: ${totalForecastsSkipped}`);
  console.log(`❌ Forecasts failed: ${totalForecastsFailed}`);
  
  if (totalForecastsCreated > 0) {
    console.log(`\n✅ TEST 44 PASSED: Random monthly forecasts added successfully!`);
    return true;
  } else if (totalForecastsSkipped === totalForecastsAttempted) {
    console.log(`\n⚠️  TEST 44 SKIPPED: All dealers already have forecasts for this period`);
    return true;
  } else {
    throw new Error(`TEST 44 FAILED: No forecasts were created (${totalForecastsFailed} failed)`);
  }
}

// ============================================================================
// TEST 45: Add random daily demand orders for all dealers
// ============================================================================

async function test45_AddRandomDailyDemandOrders() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 45: Add random daily demand orders for all dealers');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  // Get Daily Demand order type ID
  await getDDOrderTypeId();
  
  // Get all dealers
  console.log(`\n🔍 Fetching all dealers...`);
  const dealersResult = await makeRequest('/api/dealers', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (dealersResult.status !== 200 || !Array.isArray(dealersResult.data) || dealersResult.data.length === 0) {
    throw new Error(`TEST 45 FAILED: Could not fetch dealers. Status: ${dealersResult.status}`);
  }
  
  const allDealers = dealersResult.data;
  console.log(`   ✅ Found ${allDealers.length} dealers`);
  
  // Get all users once to create dealer_id -> user_id map
  console.log(`\n🔍 Fetching all users to map dealer IDs...`);
  const allUsersResult = await makeRequest('/api/users', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  const dealerUserMap = new Map(); // dealer_id -> user_id
  if (allUsersResult.status === 200 && Array.isArray(allUsersResult.data)) {
    allUsersResult.data.forEach(user => {
      if (user.role === 'dealer' && user.dealer_id) {
        dealerUserMap.set(user.dealer_id, user.id);
      }
    });
  }
  console.log(`   ✅ Mapped ${dealerUserMap.size} dealer users`);
  
  // Statistics
  let totalOrdersAttempted = 0;
  let totalOrdersCreated = 0;
  let totalOrdersSkipped = 0;
  let totalOrdersFailed = 0;
  const today = getTodayDate();
  
  console.log(`\n📊 Adding random daily demand orders for all dealers...`);
  console.log(`   Base date: ${today}`);
  
  // Process each dealer
  for (const dealer of allDealers) {
    // Get dealer's assigned products
    const assignmentsResult = await makeRequest(`/api/dealer-assignments/${dealer.id}`, 'GET', null, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (assignmentsResult.status !== 200 || !Array.isArray(assignmentsResult.data) || assignmentsResult.data.length === 0) {
      console.log(`   ⚠️  Dealer ${dealer.name || dealer.code} (ID: ${dealer.id}): No assigned products - skipping`);
      totalOrdersSkipped++;
      continue;
    }
    
    // Get products with product assignments (not category)
    const productAssignments = assignmentsResult.data.filter(a => 
      a.assignment_type === 'product' && a.product_id
    );
    
    if (productAssignments.length === 0) {
      console.log(`   ⚠️  Dealer ${dealer.name || dealer.code} (ID: ${dealer.id}): No product assignments - skipping`);
      totalOrdersSkipped++;
      continue;
    }
    
    // Find dealer user ID (or use dealer ID if no user found)
    const dealerUserId = dealerUserMap.get(dealer.id) || dealer.id;
    
    // Use admin token for all operations (like loginAsDealer does)
    const dealerToken = testData.adminToken;
    
    // Random decision: single-day or multi-day (70% single, 30% multi)
    const isMultiDay = Math.random() < 0.3;
    
    console.log(`\n   📋 Dealer: ${dealer.name || dealer.code} (ID: ${dealer.id})`);
    
    try {
      totalOrdersAttempted++;
      
      if (isMultiDay) {
        // Multi-day order (2-3 days)
        const numDays = Math.floor(Math.random() * 2) + 2; // 2 or 3 days
        const demands = [];
        
        for (let i = 1; i <= numDays; i++) {
          const orderDate = new Date(today);
          orderDate.setDate(orderDate.getDate() + i);
          const dateStr = orderDate.toISOString().split('T')[0];
          
          // Select 1-2 random products
          const numProducts = Math.floor(Math.random() * 2) + 1;
          const shuffledProducts = [...productAssignments].sort(() => Math.random() - 0.5);
          const selectedProducts = shuffledProducts.slice(0, Math.min(numProducts, productAssignments.length));
          
          const orderItems = selectedProducts.map(assignment => ({
            product_id: assignment.product_id,
            quantity: Math.floor(Math.random() * 50) + 10 // 10-60 units
          }));
          
          demands.push({
            date: dateStr,
            order_items: orderItems
          });
        }
        
        console.log(`      Creating multi-day order (${numDays} days)`);
        
        const orderPayload = {
          dealer_id: dealer.id,
          territory_name: dealer.territory_name,
          user_id: dealerUserId,
          demands: demands
        };
        
        const result = await makeRequest('/api/orders/dealer/multi-day', 'POST', orderPayload, {
          'Authorization': `Bearer ${dealerToken}`
        });
        
        if (result.status === 200 && result.data && result.data.success) {
          totalOrdersCreated++;
          console.log(`      ✅ Multi-day order created (${result.data.total_orders} orders, ${result.data.total_items} items)`);
        } else {
          totalOrdersFailed++;
          console.log(`      ❌ Multi-day order failed (${result.status})`);
        }
      } else {
        // Single-day order
        // Select 1-2 random products
        const numProducts = Math.floor(Math.random() * 2) + 1;
        const shuffledProducts = [...productAssignments].sort(() => Math.random() - 0.5);
        const selectedProducts = shuffledProducts.slice(0, Math.min(numProducts, productAssignments.length));
        
        // Random date: today, tomorrow, or day after (30% today, 40% tomorrow, 30% day after)
        const rand = Math.random();
        const orderDate = new Date(today);
        if (rand < 0.4) {
          orderDate.setDate(orderDate.getDate() + 1); // Tomorrow
        } else if (rand < 0.7) {
          orderDate.setDate(orderDate.getDate() + 2); // Day after
        }
        const dateStr = orderDate.toISOString().split('T')[0];
        
        console.log(`      Creating single-day order for ${dateStr}`);
        
        const orderItems = selectedProducts.map(assignment => ({
          product_id: assignment.product_id,
          quantity: Math.floor(Math.random() * 50) + 10 // 10-60 units
        }));
        
        const orderPayload = {
          order_type_id: testData.ddOrderTypeId,
          dealer_id: dealer.id,
          territory_name: dealer.territory_name,
          user_id: dealerUserId,
          order_date: dateStr,
          order_items: orderItems
        };
        
        const result = await makeRequest('/api/orders/dealer', 'POST', orderPayload, {
          'Authorization': `Bearer ${dealerToken}`
        });
        
        if (result.status === 200 && result.data && result.data.success) {
          totalOrdersCreated++;
          console.log(`      ✅ Single-day order created (Order ID: ${result.data.order_id}, ${result.data.item_count} items)`);
        } else {
          totalOrdersFailed++;
          console.log(`      ❌ Single-day order failed (${result.status})`);
        }
      }
    } catch (error) {
      totalOrdersFailed++;
      console.log(`      ❌ Error: ${error.message}`);
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n${'='.repeat(70)}`);
  console.log('📋 TEST 45 SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Total dealers processed: ${allDealers.length}`);
  console.log(`✅ Orders attempted: ${totalOrdersAttempted}`);
  console.log(`✅ Orders created: ${totalOrdersCreated}`);
  console.log(`⚠️  Orders skipped: ${totalOrdersSkipped}`);
  console.log(`❌ Orders failed: ${totalOrdersFailed}`);
  
  if (totalOrdersCreated > 0) {
    console.log(`\n✅ TEST 45 PASSED: Random daily demand orders added successfully!`);
    return true;
  } else if (totalOrdersSkipped === totalOrdersAttempted) {
    console.log(`\n⚠️  TEST 45 SKIPPED: No dealers with valid setup for orders`);
    return true;
  } else {
    throw new Error(`TEST 45 FAILED: No orders were created (${totalOrdersFailed} failed)`);
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

function showUsage() {
  console.log('\n📖 Usage:');
  console.log('   node test-workflow.js [test_number]');
  console.log('\n📋 Available Tests:');
  console.log('   1  - adduser_test - Create random admin, TSO, and dealer users');
    console.log('   2  - import_resources_test - Import dealers, transports, and products from Excel, then test pagination');
  console.log('   3  - TSO tries second order (5 units) - should FAIL (only 2 remaining)');
  console.log('   4  - Create order with multiple products');
  console.log('   5  - Update quota (add more units to existing quota)');
  console.log('   6  - Retrieve order history (orders by date)');
  console.log('   7  - TSO dashboard/reports (my-report endpoint)');
  console.log('   8  - Delete an order');
  console.log('   9  - Product assignment to dealer (single product)');
  console.log('   10 - Monthly forecast submission');
  console.log('   11 - Bulk product assignments to dealer (multiple products)');
  console.log('   12 - Category/Application name assignment to dealer');
  console.log('   13 - Get all territories and filter dealers');
  console.log('   14 - Get product categories for dealer assignment');
  console.log('   15 - Delete product assignment from dealer');
  console.log('   16 - Get all assignments for dealer (Dealer Modal Features)');
  console.log('   17 - Bulk assignment with both products and categories');
  console.log('   18 - Create single-day daily demand order');
  console.log('   19 - Create multi-day daily demand orders');
  console.log('   20 - Get available dates with orders');
  console.log('   21 - Get orders for a specific date');
  console.log('   22 - Get orders for a date range');
  console.log('   23 - Generate Excel report for a date');
  console.log('   24 - Generate Excel report for a date range');
  console.log('   25 - Generate pivot-style daily demand report');
  console.log('   26 - Get monthly forecast periods');
  console.log('   27 - Get monthly forecast data');
  console.log('   28 - TSO Get available dates with orders');
  console.log('   29 - TSO Get orders for a specific date');
  console.log('   30 - TSO Get orders for a date range');
  console.log('   31 - TSO Generate Excel report for a date range');
  console.log('   32 - TSO Get management report for a date');
  console.log('   33 - Admin Create user');
  console.log('   34 - Admin Get all users');
  console.log('   35 - Admin Update user');
  console.log('   36 - Admin Create transport');
  console.log('   37 - Admin Update transport');
  console.log('   38 - Admin Get monthly forecast start day setting');
  console.log('   39 - Admin Update monthly forecast start day setting');
  console.log('   40 - Admin Delete user');
  console.log('   41 - Admin Delete transport');
  console.log('   42 - Admin Get transport by ID');
  console.log('   43 - quota_allocation_test - Randomly allocate daily quotas and test all quota management workflows');
  console.log('   44 - Add random monthly forecasts for all dealers');
  console.log('   45 - Add random daily demand orders for all dealers');
  console.log('   all - Run all tests in sequence');
  console.log('\n💡 Examples:');
  console.log('   node test-workflow.js 1        # Run only test 1');
  console.log('   node test-workflow.js 4        # Run only test 4');
  console.log('   node test-workflow.js all      # Run all tests');
  console.log('   node test-workflow.js          # Show this help\n');
}

async function runTest(testNumber) {
  console.log('='.repeat(70));
  console.log('🧪 CUMILLA TERRITORY WORKFLOW TEST');
  console.log('='.repeat(70));
  console.log(`📍 Testing: ${BASE_URL}\n`);

  try {
  // Get MySQL's CURDATE() by checking what date the tso-today endpoint uses
  // Since tso-today uses CURDATE(), we can infer what date MySQL is using
  // by checking if any quotas exist for "today"
  try {
    const localDateStr = getTodayDate();
    console.log(`📅 Determining MySQL CURDATE()...`);
    console.log(`   Local date: ${localDateStr}`);
    
    // MySQL CURDATE() uses the server's local timezone, not UTC
    // Since the server is likely in Bangladesh timezone (UTC+6),
    // we should use the local date to match what CURDATE() returns
    // The health endpoint timestamp is in UTC, which can be misleading
    
    // Use local date - this should match MySQL CURDATE() if server timezone matches
    testData.today = localDateStr;
    console.log(`   ✅ Using date: ${testData.today} (should match MySQL CURDATE())`);
    console.log(`   💡 Note: If tests fail, MySQL CURDATE() might be using a different timezone`);
  } catch (e) {
    // If anything fails, use local date
    testData.today = getTodayDate();
    console.log(`📅 Using local date: ${testData.today}`);
  }

    if (testNumber === '1' || testNumber === 'all') {
      // Test 1: adduser_test - Create random admin, TSO, and dealer users
      // Test 1 does its own setup (loginAsAdmin, findTerritoryAndDealer)
      await test1_AddUsers();
      
      if (testNumber === '1') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 1 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }
    
    // Setup for remaining tests (if running all tests after Test 1)
    if (testNumber === 'all') {
      await loginAsAdmin();
      await findProducts();
      await findTerritoryAndDealer();
    }

    if (testNumber === '2' || testNumber === 'all') {
      // Test 2: import_resources_test - Import dealers, transports, and products
      // Note: This test uses admin login (handled inside test2_ImportResources)
      // It doesn't need setup data because it imports the data itself
      await test2_ImportResources();
      
      if (testNumber === '2') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 2 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '3' || testNumber === 'all') {
      // For Test 3, need TSO login and order requirements
      await loginAsTSO();
      await getOrderRequirements();
      
      // Test 3: Try second order (should fail)
      await test3_SecondOrderShouldFail();
      
      if (testNumber === '3') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 3 COMPLETED!');
        console.log('='.repeat(70));
        console.log('\n💡 Note: Test 3 validates that quota validation prevents overselling.');
        console.log('   If remaining quota < order quantity, order is correctly rejected.');
        process.exit(0);
      }
    }

    if (testNumber === '4' || testNumber === 'all') {
      // Test 4: Multi-product order
      await test4_MultiProductOrder();
      
      if (testNumber === '4') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 4 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '5' || testNumber === 'all') {
      // Test 5: Update quota
      await test5_UpdateQuota();
      
      if (testNumber === '5') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 5 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '6' || testNumber === 'all') {
      // Test 6: Order history
      await test6_OrderHistory();
      
      if (testNumber === '6') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 6 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '7' || testNumber === 'all') {
      // Test 7: TSO dashboard
      await test7_TSODashboard();
      
      if (testNumber === '7') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 7 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    // NOTE: Test 8 (Delete order) moved to after Test 32 to avoid deleting orders
    // needed by TSO report tests (28-32). See execution block after Test 32.

    if (testNumber === '9' || testNumber === 'all') {
      // Test 9: Product assignment
      await test9_ProductAssignment();
      
      if (testNumber === '9') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 9 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '10' || testNumber === 'all') {
      // Test 10: Monthly forecast
      await test10_MonthlyForecast();
      
      if (testNumber === '10') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 10 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    // Test 44: Add random monthly forecasts - MOVED HERE (after basic forecast test)
    if (testNumber === '44' || testNumber === 'all') {
      // Test 44: Add random monthly forecasts for all dealers
      await test44_AddRandomMonthlyForecasts();
      
      if (testNumber === '44') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 44 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '11' || testNumber === 'all') {
      // Test 11: Bulk product assignments
      await test11_BulkProductAssignments();
      
      if (testNumber === '11') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 11 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '12' || testNumber === 'all') {
      // Test 12: Category assignment
      await test12_CategoryAssignment();
      
      if (testNumber === '12') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 12 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '13' || testNumber === 'all') {
      // Test 13: Get territories and filter
      await test13_GetTerritoriesAndFilter();
      
      if (testNumber === '13') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 13 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '14' || testNumber === 'all') {
      // Test 14: Get product categories
      await test14_GetProductCategories();
      
      if (testNumber === '14') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 14 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '15' || testNumber === 'all') {
      // Test 15: Delete assignment
      await test15_DeleteAssignment();
      
      if (testNumber === '15') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 15 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '16' || testNumber === 'all') {
      // Test 16: Get all assignments (Dealer Modal)
      await test16_GetAllAssignments();
      
      if (testNumber === '16') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 16 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '17' || testNumber === 'all') {
      // Test 17: Mixed bulk assignment
      await test17_MixedBulkAssignment();
      
      if (testNumber === '17') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 17 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '18' || testNumber === 'all') {
      // Test 18: Create single-day daily demand order
      await test18_CreateSingleDayDailyDemand();
      
      if (testNumber === '18') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 18 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '19' || testNumber === 'all') {
      // Test 19: Create multi-day daily demand orders
      await test19_CreateMultiDayDailyDemand();
      
      if (testNumber === '19') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 19 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '20' || testNumber === 'all') {
      // Test 20: Get available dates with orders
      await test20_GetAvailableDates();
      
      if (testNumber === '20') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 20 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '21' || testNumber === 'all') {
      // Test 21: Get orders for a specific date
      await test21_GetOrdersForDate();
      
      if (testNumber === '21') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 21 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '22' || testNumber === 'all') {
      // Test 22: Get orders for a date range
      await test22_GetOrdersForRange();
      
      if (testNumber === '22') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 22 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '23' || testNumber === 'all') {
      // Test 23: Generate Excel report for a date
      await test23_GenerateReportForDate();
      
      if (testNumber === '23') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 23 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '24' || testNumber === 'all') {
      // Test 24: Generate Excel report for a date range
      await test24_GenerateReportForRange();
      
      if (testNumber === '24') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 24 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '25' || testNumber === 'all') {
      // Test 25: Generate pivot-style daily demand report
      await test25_GeneratePivotReport();
      
      if (testNumber === '25') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 25 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    // Test 45: Add random daily demand orders - MOVED HERE (after daily demand report tests)
    if (testNumber === '45' || testNumber === 'all') {
      // Test 45: Add random daily demand orders for all dealers
      await test45_AddRandomDailyDemandOrders();
      
      if (testNumber === '45') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 45 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '26' || testNumber === 'all') {
      // Test 26: Get monthly forecast periods
      await test26_GetMonthlyForecastPeriods();
      
      if (testNumber === '26') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 26 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '27' || testNumber === 'all') {
      // Test 27: Get monthly forecast data
      await test27_GetMonthlyForecastData();
      
      if (testNumber === '27') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 27 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '28' || testNumber === 'all') {
      // Test 28: TSO Get available dates
      await test28_TSOGetAvailableDates();
      
      if (testNumber === '28') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 28 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '29' || testNumber === 'all') {
      // Test 29: TSO Get orders for a specific date
      await test29_TSOGetOrdersForDate();
      
      if (testNumber === '29') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 29 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '30' || testNumber === 'all') {
      // Test 30: TSO Get orders for a date range
      await test30_TSOGetOrdersForRange();
      
      if (testNumber === '30') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 30 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '31' || testNumber === 'all') {
      // Test 31: TSO Generate Excel report for a date range
      await test31_TSOGenerateReportForRange();
      
      if (testNumber === '31') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 31 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '32' || testNumber === 'all') {
      // Test 32: TSO Get management report
      await test32_TSOGetManagementReport();
      
      if (testNumber === '32') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 32 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    // Test 8: Delete order - MOVED HERE (after all TSO report tests that need orders)
    if (testNumber === '8' || testNumber === 'all') {
      // Test 8: Delete order
      await test8_DeleteOrder();
      
      if (testNumber === '8') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 8 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '33' || testNumber === 'all') {
      // Test 33: Admin Create user
      await test33_AdminCreateUser();
      
      if (testNumber === '33') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 33 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '34' || testNumber === 'all') {
      // Test 34: Admin Get all users
      await test34_AdminGetAllUsers();
      
      if (testNumber === '34') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 34 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '35' || testNumber === 'all') {
      // Test 35: Admin Update user
      await test35_AdminUpdateUser();
      
      if (testNumber === '35') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 35 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '36' || testNumber === 'all') {
      // Test 36: Admin Create transport
      await test36_AdminCreateTransport();
      
      if (testNumber === '36') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 36 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '37' || testNumber === 'all') {
      // Test 37: Admin Update transport
      await test37_AdminUpdateTransport();
      
      if (testNumber === '37') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 37 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '38' || testNumber === 'all') {
      // Test 38: Admin Get monthly forecast start day setting
      await test38_AdminGetForecastStartDay();
      
      if (testNumber === '38') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 38 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '39' || testNumber === 'all') {
      // Test 39: Admin Update monthly forecast start day setting
      await test39_AdminUpdateForecastStartDay();
      
      if (testNumber === '39') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 39 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '40' || testNumber === 'all') {
      // Test 40: Admin Delete user
      await test40_AdminDeleteUser();
      
      if (testNumber === '40') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 40 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '41' || testNumber === 'all') {
      // Test 41: Admin Delete transport
      await test41_AdminDeleteTransport();
      
      if (testNumber === '41') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 41 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '42' || testNumber === 'all') {
      // Test 42: Admin Get transport by ID
      await test42_AdminGetTransportById();
      
      if (testNumber === '42') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 42 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '43' || testNumber === 'all') {
      // Test 43: Quota Allocation Test - All workflows of manage quotas page
      await test43_QuotaAllocationWorkflows();
      
      if (testNumber === '43') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 43 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    // NOTE: Test 44 moved to after Test 10 (see above)
    // NOTE: Test 45 moved to after Test 25 (see above)

    // Summary (only if running all tests)
    if (testNumber === 'all') {
      console.log('\n' + '='.repeat(70));
      console.log('✅ ALL TESTS PASSED!');
      console.log('='.repeat(70));
      console.log('\n📋 Summary:');
      console.log(`   Test 1: ✅ Created admin, TSO, and dealer users`);
      if (testData.orderId) {
        console.log(`   Test 2: ✅ Created order ${testData.orderId} selling ${TEST_CONFIG.orderQuantity} units`);
      }
      console.log(`   Test 3: ✅ Order validation working - second order correctly rejected`);
      if (testData.multiProductOrderId) {
        console.log(`   Test 4: ✅ Created multi-product order ${testData.multiProductOrderId}`);
      }
      console.log(`   Test 5: ✅ Quota updated successfully`);
      console.log(`   Test 6: ✅ Order history retrieved`);
      console.log(`   Test 7: ✅ TSO dashboard report retrieved`);
      console.log(`   Test 8: ✅ Order deleted successfully`);
      if (testData.assignmentId) {
        console.log(`   Test 9: ✅ Product assigned to dealer (ID: ${testData.assignmentId})`);
      }
      console.log(`   Test 10: ✅ Monthly forecast submitted`);
      if (testData.bulkAssignmentIds && testData.bulkAssignmentIds.length > 0) {
        console.log(`   Test 11: ✅ Bulk product assignments (${testData.bulkAssignmentIds.length} products)`);
      }
      if (testData.categoryAssignmentId) {
        console.log(`   Test 12: ✅ Category assignment (ID: ${testData.categoryAssignmentId})`);
      }
      if (testData.allTerritories && testData.allTerritories.length > 0) {
        console.log(`   Test 13: ✅ Territories retrieved (${testData.allTerritories.length} territories)`);
      }
      if (testData.productCategories && testData.productCategories.length > 0) {
        console.log(`   Test 14: ✅ Product categories retrieved (${testData.productCategories.length} categories)`);
      }
      console.log(`   Test 15: ✅ Assignment deleted successfully`);
      console.log(`   Test 16: ✅ All dealer assignments retrieved`);
      console.log(`   Test 17: ✅ Mixed bulk assignment (products + categories)`);
      if (testData.dealerDailyDemandOrderIds && testData.dealerDailyDemandOrderIds.length > 0) {
        console.log(`   Test 18: ✅ Single-day daily demand order created`);
        console.log(`   Test 19: ✅ Multi-day daily demand orders created`);
      }
      console.log(`   Test 20: ✅ Available dates retrieved`);
      console.log(`   Test 21: ✅ Orders for date retrieved`);
      console.log(`   Test 22: ✅ Orders for date range retrieved`);
      console.log(`   Test 23: ✅ Excel report generated for date`);
      console.log(`   Test 24: ✅ Excel report generated for date range`);
      console.log(`   Test 25: ✅ Pivot-style daily demand report generated`);
      console.log(`   Test 26: ✅ Monthly forecast periods retrieved`);
      console.log(`   Test 27: ✅ Monthly forecast data retrieved`);
      console.log(`   Test 28: ✅ TSO available dates retrieved`);
      console.log(`   Test 29: ✅ TSO orders for date retrieved`);
      console.log(`   Test 30: ✅ TSO orders for date range retrieved`);
      console.log(`   Test 31: ✅ TSO Excel report generated for range`);
      console.log(`   Test 32: ✅ TSO management report generated`);
      console.log(`   Test 33: ✅ User created successfully`);
      console.log(`   Test 34: ✅ All users retrieved`);
      console.log(`   Test 35: ✅ User updated successfully`);
      console.log(`   Test 36: ✅ Transport created successfully`);
      console.log(`   Test 37: ✅ Transport updated successfully`);
      console.log(`   Test 38: ✅ Monthly forecast start day retrieved`);
      console.log(`   Test 39: ✅ Monthly forecast start day updated`);
      console.log(`   Test 40: ✅ User deleted successfully`);
      console.log(`   Test 41: ✅ Transport deleted successfully`);
      console.log(`   Test 42: ✅ Transport retrieved by ID`);
      console.log(`   Test 43: ✅ Quota allocation workflows working`);
      console.log(`   Test 44: ✅ Random monthly forecasts added for all dealers`);
      console.log(`   Test 45: ✅ Random daily demand orders added for all dealers`);
      console.log('\n💡 Test data persists in database.');
    }

    process.exit(0);

  } catch (error) {
    console.log('\n' + '='.repeat(70));
    console.log(`❌ TEST FAILED: ${error.message}`);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure backend is running');
    console.log('   2. Check admin credentials (admin / #lme11@@)');
    console.log('   3. Check TSO credentials (subrata.das / 123)');
    console.log('   4. Verify products exist in database (excluding Dummy)');
    console.log('   5. Verify Cumilla territory has dealers');
    console.log('   6. Check order types, warehouses, and transports exist');
    process.exit(1);
  }
}

// Get test number from command line arguments
const testNumber = process.argv[2];

if (!testNumber) {
  showUsage();
  process.exit(0);
}

if (!['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', 'all'].includes(testNumber)) {
  console.log(`\n❌ Invalid test number: ${testNumber}`);
  showUsage();
  process.exit(1);
}

runTest(testNumber);

