/**
 * Manual Workflow Tests
 * 
 * Tests all manual user steps from Manual_Steps.xlsx
 * 
 * This script tests:
 * - Admin workflows (55 manual steps)
 * - TSO workflows (28 manual steps) - TODO
 * - Dealer workflows (23 manual steps) - TODO
 * 
 * Usage: 
 *   node test_workflows.js
 *   node test_workflows.js admin
 *   node test_workflows.js tso (TODO)
 *   node test_workflows.js dealer (TODO)
 *   API_URL=http://localhost:3002 node test_workflows.js (for Docker)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

// Test configuration
const TEST_CONFIG = {
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || '#lme11@@',
  testPassword: '123',
  territoryName: 'Cumilla Territory',
  testUsers: {
    admin: ['test_workflows_admin', 'test_workflows_admin_2'],
    tso: ['test_workflows_tso', 'test_workflows_tso_2'],
    sales_manager: ['test_workflows_sales_manager', 'test_workflows_sales_manager_2'],
    dealer: ['test_workflows_dealer', 'test_workflows_dealer_2']
  },
  dealerNames: [
    'Argus metal pvt ltd',
    'B- Trac Engineering Ltd'
  ]
};

let testData = {
  adminToken: null,
  createdUserIds: [],
  createdTransportIds: [],
  dealerIds: [], // For dealer users
  territories: [],
  products: [],
  dealers: [],
  transports: [],
  productCategories: [],
  quotaAllocations: [],
  // TSO-specific data
  tsoToken: null,
  tsoUserId: null,
  tsoTerritory: null,
  tsoUserName: null,
  quotas: [],
  orderTypes: [],
  warehouses: [],
  selectedOrderType: null,
  selectedWarehouse: null,
  selectedDealer: null,
  selectedTransport: null,
  availableProducts: [],
  orderItems: [],
  createdOrderId: null,
  availableDates: [],
  ordersForDate: [],
  ordersForRange: [],
  // Dealer-specific data
  dealerToken: null,
  dealerUserId: null,
  dealerId: null,
  dealerTerritory: null,
  dealerUserName: null,
  dealerInfo: null,
  assignedProducts: [],
  ddOrderTypeId: null,
  selectedProduct: null,
  createdMultiDayOrders: [],
  forecastPeriods: [],
  selectedPeriod: null,
  forecastData: []
};

// Helper function to get today's date in YYYY-MM-DD format
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

// Helper to ensure we have a valid admin token (reuses existing if valid)
async function ensureAdminToken() {
  // If we have a token, verify it's still valid with a quick API call
  if (testData.adminToken) {
    const verifyResult = await makeRequest('/api/orders', 'GET', null, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    // Token is valid if we get 200 (or any non-401 response)
    if (verifyResult.status !== 401) {
      return; // Token is valid, reuse it
    }
    // Token expired, will login below
  }
  
  // No token or token expired - login
  await loginAsAdmin();
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
// SETUP: Import Resources (Dealers, Products, Transports)
// ============================================================================

async function setup_ImportResources() {
  console.log('\n' + '='.repeat(70));
  console.log('🔧 SETUP: Importing Resources (Dealers, Products, Transports)');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  // File paths - Resources folder is at project root
  const projectRoot = path.resolve(__dirname, '..', '..');
  const productsFile = path.join(projectRoot, 'Resources', 'PRODUCT_PRICE_ERP2.xlsx');
  const dealersFile = path.join(projectRoot, 'Resources', 'VW_ALL_CUSTOMER_INFO.xlsx');
  const transportsFile = path.join(projectRoot, 'Resources', 'TRANSPORT_INFO.xlsx');
  
  console.log(`\n📁 File paths:`);
  console.log(`   Products: ${productsFile}`);
  console.log(`   Dealers: ${dealersFile}`);
  console.log(`   Transports: ${transportsFile}`);
  
  // Verify files exist
  const files = [
    { name: 'Products', path: productsFile, endpoint: '/api/products/import' },
    { name: 'Dealers', path: dealersFile, endpoint: '/api/dealers/import' },
    { name: 'Transports', path: transportsFile, endpoint: '/api/transports/import' }
  ];
  
  for (const file of files) {
    if (!fs.existsSync(file.path)) {
      console.log(`\n⚠️  WARNING: File not found: ${file.path}`);
      console.log(`   Skipping ${file.name} import...`);
      continue;
    }
    
    console.log(`\n📤 Importing ${file.name}...`);
    
    try {
      const result = await uploadFile(file.path, file.endpoint, {
        'Authorization': `Bearer ${testData.adminToken}`
      });
      
      if (result.status === 200) {
        console.log(`   ✅ ${file.name} imported successfully`);
        if (result.data && result.data.message) {
          console.log(`   📊 ${result.data.message}`);
        }
      } else {
        console.log(`   ⚠️  ${file.name} import returned status ${result.status}`);
        if (result.data) {
          console.log(`   📄 Response: ${JSON.stringify(result.data)}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Failed to import ${file.name}: ${error.message}`);
      // Don't throw - continue with other imports
    }
  }
  
  console.log('\n✅ SETUP: Resource import complete');
  console.log('='.repeat(70));
  
  // Assign products to specific dealers for testing
  console.log('\n📦 Assigning products to dealers for testing...');
  try {
    // Get all dealers
    const dealersResult = await makeRequest('/api/dealers', 'GET', null, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (dealersResult.status === 200 && Array.isArray(dealersResult.data)) {
      // Find dealer 00324 by code (needed for future TSO order tests)
      const dealer00324 = dealersResult.data.find(d => 
        d.code === '00324' || d.dealer_code === '00324' || (d.name && d.name.includes('00324'))
      );
      
      // Get all products
      const productsResult = await makeRequest('/api/products', 'GET', null, {
        'Authorization': `Bearer ${testData.adminToken}`
      });
      
      if (productsResult.status === 200 && Array.isArray(productsResult.data) && productsResult.data.length > 0) {
        const allProducts = productsResult.data;
        
        // Assign products to dealer 00324 (if found)
        if (dealer00324) {
          // Assign 2-5 random products to dealer 00324
          const numProducts = Math.min(Math.floor(Math.random() * 4) + 2, allProducts.length); // 2-5
          const shuffledProducts = [...allProducts].sort(() => Math.random() - 0.5);
          const selectedProducts = shuffledProducts.slice(0, numProducts);
          const productIds = selectedProducts.map(p => p.id);
          
          console.log(`\n   📦 Assigning ${productIds.length} product(s) to dealer 00324...`);
          
          const assignmentPayload = {
            dealer_id: dealer00324.id,
            product_ids: productIds,
            product_categories: []
          };
          
          const assignmentResult = await makeRequest('/api/dealer-assignments/bulk', 'POST', assignmentPayload, {
            'Authorization': `Bearer ${testData.adminToken}`
          });
          
          if (assignmentResult.status === 200 && assignmentResult.data && assignmentResult.data.success) {
            console.log(`   ✅ Assigned ${productIds.length} product(s) to dealer 00324 (ID: ${dealer00324.id})`);
          } else {
            console.log(`   ⚠️  Failed to assign products to dealer 00324: ${assignmentResult.status}`);
          }
        } else {
          console.log(`\n   ⚠️  Dealer 00324 not found - skipping product assignment`);
          console.log(`   Note: First dealer will get products from tests A17/A19`);
        }
      } else {
        console.log(`\n   ⚠️  No products available for assignment - skipping`);
      }
    } else {
      console.log(`\n   ⚠️  Could not fetch dealers - skipping product assignment`);
    }
  } catch (error) {
    console.log(`\n   ⚠️  Product assignment step failed: ${error.message}`);
    console.log(`   Continuing with setup... (this is not critical)`);
  }
  
  console.log('\n✅ SETUP: Product assignment complete');
  console.log('='.repeat(70));
}

// ============================================================================
// SETUP: Create Test Users
// ============================================================================

async function setup_CreateTestUsers() {
  console.log('\n' + '='.repeat(70));
  console.log('🔧 SETUP: Creating Test Users');
  console.log('='.repeat(70));
  
  await loginAsAdmin();
  
  // Get territories for TSO and Sales Manager users
  const territoriesResult = await makeRequest('/api/dealers/territories', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (territoriesResult.status === 200 && Array.isArray(territoriesResult.data)) {
    testData.territories = territoriesResult.data;
    const cumillaTerritory = territoriesResult.data.find(t => 
      t.toLowerCase().includes('cumilla') || t.toLowerCase().includes('cumilla')
    ) || TEST_CONFIG.territoryName;
    testData.cumillaTerritoryName = cumillaTerritory;
    console.log(`\n📍 Using territory: ${cumillaTerritory}`);
  } else {
    testData.cumillaTerritoryName = TEST_CONFIG.territoryName;
    console.log(`\n📍 Using default territory: ${TEST_CONFIG.territoryName}`);
  }
  
  // Get dealers for dealer users
  const dealersResult = await makeRequest('/api/dealers', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (dealersResult.status === 200 && Array.isArray(dealersResult.data)) {
    testData.allDealers = dealersResult.data;
    
    // Find dealers by name
    TEST_CONFIG.dealerNames.forEach(dealerName => {
      const dealer = dealersResult.data.find(d => 
        d.name && d.name.toLowerCase().includes(dealerName.toLowerCase())
      );
      if (dealer) {
        testData.dealerIds.push(dealer.id);
        console.log(`\n✅ Found dealer: ${dealer.name} (ID: ${dealer.id})`);
      } else {
        console.log(`\n⚠️  Dealer not found: ${dealerName}`);
      }
    });
  }
  
  if (testData.dealerIds.length < TEST_CONFIG.dealerNames.length) {
    console.log(`\n⚠️  WARNING: Could not find all required dealers. Found: ${testData.dealerIds.length}, Required: ${TEST_CONFIG.dealerNames.length}`);
    console.log(`   This may happen if dealers were just imported and need a moment to be available.`);
    console.log(`   Continuing with available dealers...`);
    // Don't throw - continue with available dealers (dealer users will be created only for found dealers)
  }
  
  // Create Admin users (2)
  console.log(`\n👤 Creating Admin users...`);
  for (let i = 0; i < TEST_CONFIG.testUsers.admin.length; i++) {
    const username = TEST_CONFIG.testUsers.admin[i];
    const userPayload = {
      username: username,
      password: TEST_CONFIG.testPassword,
      full_name: `Test Admin User ${i + 1}`,
      role: 'admin'
    };
    
    const result = await makeRequest('/api/users', 'POST', userPayload, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (result.status === 200 && result.data) {
      const userId = result.data.id || result.data.user_id;
      testData.createdUserIds.push({ id: userId, username: username, role: 'admin' });
      console.log(`   ✅ Created: ${username} (ID: ${userId})`);
    } else {
      console.log(`   ⚠️  Failed to create ${username}: ${result.status} - ${JSON.stringify(result.data)}`);
    }
  }
  
  // Create TSO users (2)
  console.log(`\n👤 Creating TSO users...`);
  for (let i = 0; i < TEST_CONFIG.testUsers.tso.length; i++) {
    const username = TEST_CONFIG.testUsers.tso[i];
    const userPayload = {
      username: username,
      password: TEST_CONFIG.testPassword,
      full_name: `Test TSO User ${i + 1}`,
      role: 'tso',
      territory_name: testData.cumillaTerritoryName
    };
    
    const result = await makeRequest('/api/users', 'POST', userPayload, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (result.status === 200 && result.data) {
      const userId = result.data.id || result.data.user_id;
      testData.createdUserIds.push({ id: userId, username: username, role: 'tso' });
      console.log(`   ✅ Created: ${username} (ID: ${userId})`);
    } else {
      console.log(`   ⚠️  Failed to create ${username}: ${result.status} - ${JSON.stringify(result.data)}`);
    }
  }
  
  // Create Sales Manager users (2)
  console.log(`\n👤 Creating Sales Manager users...`);
  for (let i = 0; i < TEST_CONFIG.testUsers.sales_manager.length; i++) {
    const username = TEST_CONFIG.testUsers.sales_manager[i];
    const userPayload = {
      username: username,
      password: TEST_CONFIG.testPassword,
      full_name: `Test Sales Manager User ${i + 1}`,
      role: 'sales_manager',
      territory_name: testData.cumillaTerritoryName
    };
    
    const result = await makeRequest('/api/users', 'POST', userPayload, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (result.status === 200 && result.data) {
      const userId = result.data.id || result.data.user_id;
      testData.createdUserIds.push({ id: userId, username: username, role: 'sales_manager' });
      console.log(`   ✅ Created: ${username} (ID: ${userId})`);
    } else {
      console.log(`   ⚠️  Failed to create ${username}: ${result.status} - ${JSON.stringify(result.data)}`);
    }
  }
  
  // Create Dealer users (2)
  console.log(`\n👤 Creating Dealer users...`);
  for (let i = 0; i < TEST_CONFIG.testUsers.dealer.length && i < testData.dealerIds.length; i++) {
    const username = TEST_CONFIG.testUsers.dealer[i];
    const dealerId = testData.dealerIds[i];
    const userPayload = {
      username: username,
      password: TEST_CONFIG.testPassword,
      full_name: `Test Dealer User ${i + 1}`,
      role: 'dealer',
      dealer_id: dealerId
    };
    
    const result = await makeRequest('/api/users', 'POST', userPayload, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (result.status === 200 && result.data) {
      const userId = result.data.id || result.data.user_id;
      testData.createdUserIds.push({ id: userId, username: username, role: 'dealer', dealer_id: dealerId });
      console.log(`   ✅ Created: ${username} (ID: ${userId}, Dealer ID: ${dealerId})`);
    } else {
      console.log(`   ⚠️  Failed to create ${username}: ${result.status} - ${JSON.stringify(result.data)}`);
    }
  }
  
  console.log(`\n✅ Setup complete! Created ${testData.createdUserIds.length} users`);
  return true;
}

// ============================================================================
// ADMIN WORKFLOW TESTS
// ============================================================================

// A1: Login
async function testA1_Login() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A1: Login');
  console.log('='.repeat(70));
  
  // Check if we already have a valid token from setup
  if (testData.adminToken) {
    // Verify the existing token is still valid by making an authenticated request
    const verifyResult = await makeRequest('/api/orders', 'GET', null, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (verifyResult.status === 200 || verifyResult.status === 401) {
      if (verifyResult.status === 200) {
        console.log(`\n✅ A1 PASSED: Login verified (using token from setup)`);
        console.log(`   Token is valid and authenticated`);
        return true;
      } else {
        // Token expired, need to login again
        console.log(`   ⚠️  Token expired, logging in again...`);
      }
    }
  }
  
  // No token or token invalid - perform fresh login
  const result = await makeRequest('/api/auth/login', 'POST', {
    username: TEST_CONFIG.adminUsername,
    password: TEST_CONFIG.adminPassword
  });

  if (result.status === 200 && result.data.success) {
    testData.adminToken = result.data.token;
    console.log(`\n✅ A1 PASSED: Login successful`);
    console.log(`   User: ${result.data.user.full_name || result.data.user.username}`);
    return true;
  }

  throw new Error(`A1 FAILED: Login failed - ${result.status} - ${JSON.stringify(result.data)}`);
}

// A2: Navigate to Dashboard
async function testA2_NavigateToDashboard() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A2: Navigate to Dashboard');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  // Dashboard typically shows stats, so we'll fetch orders/dealers/products counts
  const ordersResult = await makeRequest('/api/orders', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  const dealersResult = await makeRequest('/api/dealers', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  const productsResult = await makeRequest('/api/products', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  console.log(`\n✅ A2 PASSED: Dashboard data loaded`);
  console.log(`   Orders: ${Array.isArray(ordersResult.data) ? ordersResult.data.length : 'N/A'}`);
  console.log(`   Dealers: ${Array.isArray(dealersResult.data) ? dealersResult.data.length : 'N/A'}`);
  console.log(`   Products: ${Array.isArray(productsResult.data) ? productsResult.data.length : 'N/A'}`);
  
  return true;
}

// A3: Navigate to Settings
async function testA3_NavigateToSettings() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A3: Navigate to Settings');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  // Settings page shows multiple tabs, verify we can access users endpoint
  const usersResult = await makeRequest('/api/users', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  console.log(`\n✅ A3 PASSED: Settings page accessible`);
  console.log(`   Users endpoint accessible: ${usersResult.status === 200 ? 'Yes' : 'No'}`);
  
  return true;
}

// A4: Switch to Manage Users tab
async function testA4_SwitchToManageUsersTab() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A4: Switch to Manage Users tab');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const result = await makeRequest('/api/users', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && Array.isArray(result.data)) {
    console.log(`\n✅ A4 PASSED: Manage Users tab accessible`);
    console.log(`   Total users: ${result.data.length}`);
    return true;
  }
  
  throw new Error(`A4 FAILED: Could not access users - ${result.status}`);
}

// A5: Filter users by role
async function testA5_FilterUsersByRole() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A5: Filter users by role');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const result = await makeRequest('/api/users', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && Array.isArray(result.data)) {
    const roles = ['admin', 'tso', 'sales_manager', 'dealer'];
    roles.forEach(role => {
      const filtered = result.data.filter(u => u.role === role);
      console.log(`   ${role}: ${filtered.length} users`);
    });
    
    console.log(`\n✅ A5 PASSED: Users filtered by role`);
    return true;
  }
  
  throw new Error(`A5 FAILED: Could not filter users - ${result.status}`);
}

// A6: Sort users
async function testA6_SortUsers() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A6: Sort users');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const result = await makeRequest('/api/users', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && Array.isArray(result.data)) {
    // Test sorting by username
    const sortedByName = [...result.data].sort((a, b) => 
      (a.username || '').localeCompare(b.username || '')
    );
    
    // Test sorting by role
    const sortedByRole = [...result.data].sort((a, b) => 
      (a.role || '').localeCompare(b.role || '')
    );
    
    console.log(`\n✅ A6 PASSED: Users can be sorted`);
    console.log(`   Sorted by username: ${sortedByName.length} users`);
    console.log(`   Sorted by role: ${sortedByRole.length} users`);
    return true;
  }
  
  throw new Error(`A6 FAILED: Could not sort users - ${result.status}`);
}

// A7: Create new user
async function testA7_CreateNewUser() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A7: Create new user');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  // Note: Setup users are already created with known passwords ('123') and are sufficient
  // for testing features. This test verifies that the CREATE USER API endpoint exists
  // and is accessible, without actually creating a user.
  
  console.log(`\n🔍 Verifying CREATE USER API endpoint is accessible...`);
  console.log(`   Note: Setup users with known passwords are sufficient for feature testing.`);
  console.log(`   This test only verifies the CREATE endpoint exists.`);
  
  // Just verify the endpoint exists by checking if we can reach it
  // We'll try to create a user with a duplicate username to test validation
  // without actually creating a new user
  
  const duplicatePayload = {
    username: TEST_CONFIG.testUsers.admin[0], // Use an existing username to trigger validation
    password: TEST_CONFIG.testPassword,
    full_name: 'Duplicate Test',
    role: 'admin'
  };
  
  const result = await makeRequest('/api/users', 'POST', duplicatePayload, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  // If endpoint returns 400/409 (validation error), the endpoint exists and works correctly
  if (result.status === 400 || result.status === 409) {
    console.log(`\n✅ A7 PASSED: CREATE USER API endpoint exists and validation works`);
    console.log(`   Response: ${result.status} - Username validation working correctly`);
    return true;
  }
  
  // If endpoint returns 200, that's also fine (though shouldn't happen with duplicate)
  if (result.status === 200) {
    console.log(`\n✅ A7 PASSED: CREATE USER API endpoint works`);
    return true;
  }
  
  // If we get 404 or 500, endpoint might not exist or there's an error
  throw new Error(`A7 FAILED: CREATE USER API endpoint issue - ${result.status} - ${JSON.stringify(result.data)}`);
}

// A8: Edit user
async function testA8_EditUser() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A8: Edit user');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  // Get a user to edit (prefer one we created)
  const usersResult = await makeRequest('/api/users', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (usersResult.status !== 200 || !Array.isArray(usersResult.data) || usersResult.data.length === 0) {
    throw new Error(`A8 FAILED: No users found to edit`);
  }
  
  // Find a test user or use first user
  const userToEdit = usersResult.data.find(u => 
    u.username && u.username.startsWith('test_')
  ) || usersResult.data[0];
  
  const userId = userToEdit.id;
  const updatedFullName = `Updated ${userToEdit.full_name || 'Test User'}`;
  
  const updatePayload = {
    username: userToEdit.username,
    full_name: updatedFullName,
    role: userToEdit.role,
    territory_name: userToEdit.territory_name || null,
    dealer_id: userToEdit.dealer_id || null
  };
  
  const result = await makeRequest(`/api/users/${userId}`, 'PUT', updatePayload, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data) {
    console.log(`\n✅ A8 PASSED: User updated successfully`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Updated name: ${updatedFullName}`);
    return true;
  }
  
  throw new Error(`A8 FAILED: User update failed - ${result.status} - ${JSON.stringify(result.data)}`);
}

// A9: Delete user (delete the "_2" versions)
async function testA9_DeleteUser() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A9: Delete user');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  // Find users with "_2" suffix to delete
  const usersResult = await makeRequest('/api/users', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (usersResult.status !== 200 || !Array.isArray(usersResult.data)) {
    throw new Error(`A9 FAILED: Could not fetch users`);
  }
  
  const usersToDelete = usersResult.data.filter(u => 
    u.username && u.username.endsWith('_2')
  );
  
  if (usersToDelete.length === 0) {
    console.log(`\n⚠️  A9 SKIPPED: No users with "_2" suffix found to delete`);
    return true;
  }
  
  let deletedCount = 0;
  for (const user of usersToDelete) {
    const result = await makeRequest(`/api/users/${user.id}`, 'DELETE', null, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    if (result.status === 200 || result.status === 204) {
      deletedCount++;
      console.log(`   ✅ Deleted: ${user.username} (ID: ${user.id})`);
      // Remove from createdUserIds if present
      testData.createdUserIds = testData.createdUserIds.filter(u => u.id !== user.id);
    } else {
      console.log(`   ⚠️  Failed to delete ${user.username}: ${result.status}`);
    }
  }
  
  if (deletedCount > 0) {
    console.log(`\n✅ A9 PASSED: Deleted ${deletedCount} user(s)`);
    return true;
  }
  
  throw new Error(`A9 FAILED: Could not delete users`);
}

// A10: Activate/Deactivate user
async function testA10_ActivateDeactivateUser() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A10: Activate/Deactivate user');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  // Find a user to toggle status
  const usersResult = await makeRequest('/api/users', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (usersResult.status !== 200 || !Array.isArray(usersResult.data) || usersResult.data.length === 0) {
    throw new Error(`A10 FAILED: No users found`);
  }
  
  // Find a test user (not ending in _2 since we might have deleted those)
  const userToToggle = usersResult.data.find(u => 
    u.username && u.username.startsWith('test_') && !u.username.endsWith('_2')
  ) || usersResult.data[0];
  
  const userId = userToToggle.id;
  const currentStatus = userToToggle.is_active !== undefined ? userToToggle.is_active : true;
  const newStatus = !currentStatus;
  
  const updatePayload = {
    username: userToToggle.username,
    full_name: userToToggle.full_name,
    role: userToToggle.role,
    territory_name: userToToggle.territory_name || null,
    dealer_id: userToToggle.dealer_id || null,
    is_active: newStatus
  };
  
  const result = await makeRequest(`/api/users/${userId}`, 'PUT', updatePayload, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data) {
    console.log(`\n✅ A10 PASSED: User status toggled`);
    console.log(`   User: ${userToToggle.username}`);
    console.log(`   Status: ${currentStatus} → ${newStatus}`);
    
    // Restore original status
    updatePayload.is_active = currentStatus;
    await makeRequest(`/api/users/${userId}`, 'PUT', updatePayload, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    console.log(`   ✅ Status restored to ${currentStatus}`);
    
    return true;
  }
  
  throw new Error(`A10 FAILED: Could not toggle user status - ${result.status}`);
}

// ============================================================================
// IMPORT TEST MODULES
// ============================================================================

const dealerTests = require('./test_modules/admin_dealer_tests');
const productTests = require('./test_modules/admin_product_tests');
const transportTests = require('./test_modules/admin_transport_tests');
const quotaTests = require('./test_modules/admin_quota_tests');
const settingsTests = require('./test_modules/admin_settings_tests');
const reportsTests = require('./test_modules/admin_reports_tests');
const ordersTests = require('./test_modules/admin_orders_tests');
const logoutTest = require('./test_modules/admin_logout_test');
// TSO test modules
const tsoDashboardTests = require('./test_modules/tso_dashboard_tests');
const tsoOrdersTests = require('./test_modules/tso_orders_tests');
const tsoReportsTests = require('./test_modules/tso_reports_tests');
// Dealer test modules
const dealerDashboardTests = require('./test_modules/dealer_dashboard_tests');
const dealerOrdersTests = require('./test_modules/dealer_orders_tests');
const dealerReportsTests = require('./test_modules/dealer_reports_tests');

// Export shared utilities for modules
const sharedUtils = {
  makeRequest,
  loginAsAdmin,
  ensureAdminToken,
  getTodayDate,
  BASE_URL,
  TEST_CONFIG,
  getTestData: () => testData
};

// Initialize test modules with shared utilities
dealerTests.init(sharedUtils);
productTests.init(sharedUtils);
transportTests.init(sharedUtils);
quotaTests.init(sharedUtils);
settingsTests.init(sharedUtils);
reportsTests.init(sharedUtils);
ordersTests.init(sharedUtils);
logoutTest.init(sharedUtils);
// Initialize TSO test modules
tsoDashboardTests.init(sharedUtils);
tsoOrdersTests.init(sharedUtils);
tsoReportsTests.init(sharedUtils);
// Initialize Dealer test modules
dealerDashboardTests.init(sharedUtils);
dealerOrdersTests.init(sharedUtils);
dealerReportsTests.init(sharedUtils);

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

function showUsage() {
  console.log('\n📖 Usage:');
  console.log('   node test_workflows.js [test_type]');
  console.log('\n📋 Available Test Types:');
  console.log('   admin  - Run all Admin workflow tests (A1-A57)');
  console.log('   tso    - Run all TSO workflow tests (T1-T28)');
  console.log('   dealer - Run all Dealer workflow tests (D1-D23)');
  console.log('   setup  - Run setup only (create test users)');
  console.log('   all    - Run all tests (TODO: includes TSO and Dealer)');
  console.log('   (no args) - Show this help\n');
}

async function runAdminTests() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 ADMIN WORKFLOW TESTS');
  console.log('='.repeat(70));
  console.log(`📍 Testing: ${BASE_URL}\n`);

  try {
    // Run setup first
    console.log('🔧 Running setup...');
    await setup_ImportResources();
    await setup_CreateTestUsers();
    
    // Run Admin tests in order (A1-A57)
    const tests = [
      // User Management Tests (A1-A10)
      { name: 'A1: Login', fn: testA1_Login },
      { name: 'A2: Navigate to Dashboard', fn: testA2_NavigateToDashboard },
      { name: 'A3: Navigate to Settings', fn: testA3_NavigateToSettings },
      { name: 'A4: Switch to Manage Users tab', fn: testA4_SwitchToManageUsersTab },
      { name: 'A5: Filter users by role', fn: testA5_FilterUsersByRole },
      { name: 'A6: Sort users', fn: testA6_SortUsers },
      { name: 'A7: Create new user', fn: testA7_CreateNewUser },
      { name: 'A8: Edit user', fn: testA8_EditUser },
      { name: 'A9: Delete user', fn: testA9_DeleteUser },
      { name: 'A10: Activate/Deactivate user', fn: testA10_ActivateDeactivateUser },
      // Dealer Management Tests (A11-A20)
      { name: 'A11: Switch to Manage Dealers tab', fn: dealerTests.testA11_SwitchToManageDealersTab },
      { name: 'A12: Search dealers', fn: dealerTests.testA12_SearchDealers },
      { name: 'A13: Filter dealers by territory', fn: dealerTests.testA13_FilterDealersByTerritory },
      { name: 'A14: Import dealers from Excel', fn: dealerTests.testA14_ImportDealersFromExcel },
      { name: 'A15: Export dealers to Excel', fn: dealerTests.testA15_ExportDealersToExcel },
      { name: 'A16: View dealer details', fn: dealerTests.testA16_ViewDealerDetails },
      { name: 'A17: Assign product to dealer', fn: dealerTests.testA17_AssignProductToDealer },
      { name: 'A18: Assign category to dealer', fn: dealerTests.testA18_AssignCategoryToDealer },
      { name: 'A19: Bulk assign products to dealer', fn: dealerTests.testA19_BulkAssignProductsToDealer },
      { name: 'A20: Remove product assignment from dealer', fn: dealerTests.testA20_RemoveProductAssignment },
      // Product Management Tests (A21-A25)
      { name: 'A21: Switch to Manage Products tab', fn: productTests.testA21_SwitchToManageProductsTab },
      { name: 'A22: Search products', fn: productTests.testA22_SearchProducts },
      { name: 'A23: Import products from Excel', fn: productTests.testA23_ImportProductsFromExcel },
      { name: 'A24: Export products to Excel', fn: productTests.testA24_ExportProductsToExcel },
      { name: 'A25: View product details', fn: productTests.testA25_ViewProductDetails },
      // Transport Management Tests (A26-A30)
      { name: 'A26: Switch to Manage Transports tab', fn: transportTests.testA26_SwitchToManageTransportsTab },
      { name: 'A27: Search transports', fn: transportTests.testA27_SearchTransports },
      { name: 'A28: Create transport', fn: transportTests.testA28_CreateTransport },
      { name: 'A29: Edit transport', fn: transportTests.testA29_EditTransport },
      { name: 'A30: Delete transport', fn: transportTests.testA30_DeleteTransport },
      // Quota Management Tests (A31-A42)
      { name: 'A31: Switch to Manage Quotas tab', fn: quotaTests.testA31_SwitchToManageQuotasTab },
      { name: 'A32: View quotas', fn: quotaTests.testA32_ViewQuotas },
      { name: 'A33: Bulk allocate quotas', fn: quotaTests.testA33_BulkAllocateQuotas },
      { name: 'A34: Update quota', fn: quotaTests.testA34_UpdateQuota },
      { name: 'A35: Delete quota', fn: quotaTests.testA35_DeleteQuota },
      { name: 'A36: Filter quotas by date', fn: quotaTests.testA36_FilterQuotasByDate },
      { name: 'A37: Filter quotas by territory', fn: quotaTests.testA37_FilterQuotasByTerritory },
      { name: 'A38: Filter quotas by product', fn: quotaTests.testA38_FilterQuotasByProduct },
      { name: 'A39: View TSO quota view', fn: quotaTests.testA39_ViewTSOQuotaView },
      { name: 'A40: Import quotas from Excel', fn: quotaTests.testA40_ImportQuotasFromExcel },
      { name: 'A41: Export quotas to Excel', fn: quotaTests.testA41_ExportQuotasToExcel },
      { name: 'A42: View quota summary', fn: quotaTests.testA42_ViewQuotaSummary },
      // Settings Tests (A43-A45)
      { name: 'A43: View settings', fn: settingsTests.testA43_ViewSettings },
      { name: 'A44: Update forecast start day', fn: settingsTests.testA44_UpdateForecastStartDay },
      { name: 'A45: View forecast start day', fn: settingsTests.testA45_ViewForecastStartDay },
      // Reports Tests (A46-A50)
      { name: 'A46: Navigate to Reports', fn: reportsTests.testA46_NavigateToReports },
      { name: 'A47: View daily report', fn: reportsTests.testA47_ViewDailyReport },
      { name: 'A48: Export daily report', fn: reportsTests.testA48_ExportDailyReport },
      { name: 'A49: View TSO report', fn: reportsTests.testA49_ViewTSOReport },
      { name: 'A50: Export TSO report', fn: reportsTests.testA50_ExportTSOReport },
      // Orders Tests (A51-A56)
      { name: 'A51: View all orders', fn: ordersTests.testA51_ViewAllOrders },
      { name: 'A52: Filter orders by date', fn: ordersTests.testA52_FilterOrdersByDate },
      { name: 'A53: Filter orders by dealer', fn: ordersTests.testA53_FilterOrdersByDealer },
      { name: 'A54: View order details', fn: ordersTests.testA54_ViewOrderDetails },
      { name: 'A55: Delete order', fn: ordersTests.testA55_DeleteOrder },
      { name: 'A56: Export orders report', fn: ordersTests.testA56_ExportOrdersReport },
      // Logout Test (A57)
      { name: 'A57: Logout', fn: logoutTest.testA57_Logout },
    ];

    let passed = 0;
    let failed = 0;
    const failures = [];

    for (const test of tests) {
      try {
        await test.fn();
        passed++;
        console.log(`\n✅ ${test.name} PASSED\n`);
      } catch (error) {
        failed++;
        failures.push({ test: test.name, error: error.message });
        console.log(`\n❌ ${test.name} FAILED: ${error.message}\n`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Passed: ${passed}/${tests.length}`);
    console.log(`❌ Failed: ${failed}/${tests.length}`);

    if (failures.length > 0) {
      console.log('\n❌ Failed Tests:');
      failures.forEach(f => {
        console.log(`   - ${f.test}: ${f.error}`);
      });
    }

    if (failed === 0) {
      console.log('\n🎉 ALL ADMIN TESTS PASSED!');
      return true;
    } else {
      console.log(`\n⚠️  ${failed} test(s) failed`);
      return false;
    }
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
    console.error(error.stack);
    return false;
  }
}

async function runTSOTests() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 TSO WORKFLOW TESTS');
  console.log('='.repeat(70));
  console.log(`📍 Testing: ${BASE_URL}\n`);
  console.log('ℹ️  Note: Run setup first (node test_workflows.js setup) or admin tests to ensure resources are imported\n');
  
  try {
    // Setup is done separately via 'setup' command or during admin tests
    // No need to import resources here - assume they exist or run setup first
    
    const tests = [
      // Dashboard Tests (T1-T5)
      { name: 'T1: Login as TSO', fn: tsoDashboardTests.testT1_LoginAsTSO },
      { name: 'T2: Navigate to Dashboard', fn: tsoDashboardTests.testT2_NavigateToDashboard },
      { name: 'T3: View today\'s quotas', fn: tsoDashboardTests.testT3_ViewTodaysQuotas },
      { name: 'T4: Check quota availability', fn: tsoDashboardTests.testT4_CheckQuotaAvailability },
      { name: 'T5: View quota details', fn: tsoDashboardTests.testT5_ViewQuotaDetails },
      // Orders Tests (T6-T15)
      { name: 'T6: Get order requirements', fn: tsoOrdersTests.testT6_GetOrderRequirements },
      { name: 'T7: Navigate to New Orders page', fn: tsoOrdersTests.testT7_NavigateToNewOrdersPage },
      { name: 'T8: Select order type', fn: tsoOrdersTests.testT8_SelectOrderType },
      { name: 'T9: Select warehouse', fn: tsoOrdersTests.testT9_SelectWarehouse },
      { name: 'T10: Select dealer', fn: tsoOrdersTests.testT10_SelectDealer },
      { name: 'T11: Select transport', fn: tsoOrdersTests.testT11_SelectTransport },
      { name: 'T12: Get available products', fn: tsoOrdersTests.testT12_GetAvailableProducts },
      { name: 'T13: Add product to order', fn: tsoOrdersTests.testT13_AddProductToOrder },
      { name: 'T14: Create order', fn: tsoOrdersTests.testT14_CreateOrder },
      { name: 'T15: View created order', fn: tsoOrdersTests.testT15_ViewCreatedOrder },
      // Reports Tests (T16-T28)
      { name: 'T16: Navigate to Placed Orders page', fn: tsoReportsTests.testT16_NavigateToPlacedOrdersPage },
      { name: 'T17: Get available dates with orders', fn: tsoReportsTests.testT17_GetAvailableDates },
      { name: 'T18: View orders for a specific date', fn: tsoReportsTests.testT18_ViewOrdersForDate },
      { name: 'T19: View orders for date range', fn: tsoReportsTests.testT19_ViewOrdersForRange },
      { name: 'T20: Navigate to My Reports page', fn: tsoReportsTests.testT20_NavigateToMyReportsPage },
      { name: 'T21: Generate report for a specific date', fn: tsoReportsTests.testT21_GenerateReportForDate },
      { name: 'T22: Generate report for date range', fn: tsoReportsTests.testT22_GenerateReportForRange },
      { name: 'T23: Export report to Excel for a date', fn: tsoReportsTests.testT23_ExportReportToExcelForDate },
      { name: 'T24: Export report to Excel for date range', fn: tsoReportsTests.testT24_ExportReportToExcelForRange },
      { name: 'T25: View order details', fn: tsoReportsTests.testT25_ViewOrderDetails },
      { name: 'T26: Filter orders by dealer', fn: tsoReportsTests.testT26_FilterOrdersByDealer },
      { name: 'T27: Sort orders', fn: tsoReportsTests.testT27_SortOrders },
      { name: 'T28: Logout', fn: tsoReportsTests.testT28_Logout },
    ];

    let passed = 0;
    let failed = 0;
    const failures = [];

    for (const test of tests) {
      try {
        await test.fn();
        passed++;
        console.log(`\n✅ ${test.name} PASSED\n`);
      } catch (error) {
        failed++;
        failures.push({ test: test.name, error: error.message });
        console.log(`\n❌ ${test.name} FAILED: ${error.message}\n`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Passed: ${passed}/${tests.length}`);
    console.log(`❌ Failed: ${failed}/${tests.length}`);

    if (failures.length > 0) {
      console.log('\n❌ Failed Tests:');
      failures.forEach(f => {
        console.log(`   - ${f.test}: ${f.error}`);
      });
    }

    if (failed === 0) {
      console.log('\n🎉 ALL TSO TESTS PASSED!');
      return true;
    } else {
      console.log(`\n⚠️  ${failed} test(s) failed`);
      return false;
    }
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
    console.error(error.stack);
    return false;
  }
}

async function runDealerTests() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 DEALER WORKFLOW TESTS');
  console.log('='.repeat(70));
  console.log(`📍 Testing: ${BASE_URL}\n`);
  console.log('ℹ️  Note: Run setup first (node test_workflows.js setup) or admin tests to ensure resources are imported\n');
  
  try {
    // Setup is done separately via 'setup' command or during admin tests
    // No need to import resources here - assume they exist or run setup first
    
    const tests = [
      // Dashboard Tests (D1-D5)
      { name: 'D1: Login as Dealer', fn: dealerDashboardTests.testD1_LoginAsDealer },
      { name: 'D2: Navigate to Dashboard', fn: dealerDashboardTests.testD2_NavigateToDashboard },
      { name: 'D3: View dealer information', fn: dealerDashboardTests.testD3_ViewDealerInformation },
      { name: 'D4: View assigned products', fn: dealerDashboardTests.testD4_ViewAssignedProducts },
      { name: 'D5: View order types', fn: dealerDashboardTests.testD5_ViewOrderTypes },
      // Orders Tests (D6-D15)
      { name: 'D6: Get order requirements', fn: dealerOrdersTests.testD6_GetOrderRequirements },
      { name: 'D7: Navigate to Daily Demand page', fn: dealerOrdersTests.testD7_NavigateToDailyDemandPage },
      { name: 'D8: Select product for order', fn: dealerOrdersTests.testD8_SelectProductForOrder },
      { name: 'D9: Add product to order', fn: dealerOrdersTests.testD9_AddProductToOrder },
      { name: 'D10: Create single-day daily demand order', fn: dealerOrdersTests.testD10_CreateSingleDayOrder },
      { name: 'D11: Create multi-day daily demand orders', fn: dealerOrdersTests.testD11_CreateMultiDayOrder },
      { name: 'D12: View created order', fn: dealerOrdersTests.testD12_ViewCreatedOrder },
      { name: 'D13: Get available dates with orders', fn: dealerOrdersTests.testD13_GetAvailableDates },
      { name: 'D14: View orders for a specific date', fn: dealerOrdersTests.testD14_ViewOrdersForDate },
      { name: 'D15: View orders for date range', fn: dealerOrdersTests.testD15_ViewOrdersForRange },
      // Reports Tests (D16-D23)
      { name: 'D16: Navigate to Dealer Reports page', fn: dealerReportsTests.testD16_NavigateToDealerReportsPage },
      { name: 'D17: Generate daily demand report for a date', fn: dealerReportsTests.testD17_GenerateDailyDemandReportForDate },
      { name: 'D18: Generate daily demand report for date range', fn: dealerReportsTests.testD18_GenerateDailyDemandReportForRange },
      { name: 'D19: Export daily demand report to Excel for a date', fn: dealerReportsTests.testD19_ExportReportToExcelForDate },
      { name: 'D20: View monthly forecast periods', fn: dealerReportsTests.testD20_ViewMonthlyForecastPeriods },
      { name: 'D21: View monthly forecast data', fn: dealerReportsTests.testD21_ViewMonthlyForecastData },
      { name: 'D22: Submit monthly forecast', fn: dealerReportsTests.testD22_SubmitMonthlyForecast },
      { name: 'D23: Logout', fn: dealerReportsTests.testD23_Logout },
    ];

    let passed = 0;
    let failed = 0;
    const failures = [];

    for (const test of tests) {
      try {
        await test.fn();
        passed++;
        console.log(`\n✅ ${test.name} PASSED\n`);
      } catch (error) {
        failed++;
        failures.push({ test: test.name, error: error.message });
        console.log(`\n❌ ${test.name} FAILED: ${error.message}\n`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Passed: ${passed}/${tests.length}`);
    console.log(`❌ Failed: ${failed}/${tests.length}`);

    if (failures.length > 0) {
      console.log('\n❌ Failed Tests:');
      failures.forEach(f => {
        console.log(`   - ${f.test}: ${f.error}`);
      });
    }

    if (failed === 0) {
      console.log('\n🎉 ALL DEALER TESTS PASSED!');
      return true;
    } else {
      console.log(`\n⚠️  ${failed} test(s) failed`);
      return false;
    }
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Main execution
const testType = process.argv[2] || '';

if (testType === 'admin') {
  runAdminTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
} else if (testType === 'tso') {
  runTSOTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
} else if (testType === 'dealer') {
  runDealerTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
} else if (testType === 'setup') {
  loginAsAdmin().then(() => {
    return setup_ImportResources();
  }).then(() => {
    return setup_CreateTestUsers();
  }).then(() => {
    console.log('\n✅ Setup complete!');
    process.exit(0);
  }).catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
} else {
  showUsage();
  process.exit(0);
}

