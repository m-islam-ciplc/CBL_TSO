/**
 * Cumilla Territory Workflow Test
 * 
 * Test 1: Add 1 product in Cumilla territory (assign quota of 5 units)
 * Test 2: Sell 3 units of the allocated product to a random dealer using random transport
 * Test 3: TSO tries to place second order (5 units) - should FAIL due to insufficient quota (only 2 remaining)
 * 
 * Usage: 
 *   node test-cumilla-workflow.js
 *   API_URL=http://localhost:3002 node test-cumilla-workflow.js (for Docker)
 */

const http = require('http');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

// Test configuration
const TEST_CONFIG = {
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || '#lme11@@',
  tsoUsername: process.env.TSO_USERNAME || 'subrata.das',
  tsoPassword: process.env.TSO_PASSWORD || '123',
  territoryName: 'cumilla.tso',
  initialQuota: 5,      // Test 1: Assign 5 units
  orderQuantity: 3,     // Test 2: Sell 3 units
  secondOrderQuantity: 5  // Test 3: Try to order 5 units (should fail - only 2 remaining)
};

let testData = {
  adminToken: null,
  tsoToken: null,
  tsoUserId: null,
  productIds: [],
  productCodes: [],
  dealerId: null,
  dealerName: null,
  orderTypeId: null,
  warehouseId: null,
  transportId: null,
  transportName: null,
  orderId: null,
  territoryName: null
};

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

async function findProducts() {
  console.log('\n🔍 Finding products...');
  
  const result = await makeRequest('/api/products');
  
  if (result.status !== 200 || !Array.isArray(result.data)) {
    throw new Error(`Failed to get products: ${result.status}`);
  }

  // Filter out Dummy product (L113DU001) and get only 1 product
  const products = result.data
    .filter(p => p.product_code !== 'L113DU001' && p.product_code !== 'L113DU001'.toLowerCase())
    .slice(0, 1);
  
  if (products.length < 1) {
    throw new Error(`No products found in database (excluding Dummy)`);
  }

  testData.productIds = products.map(p => p.id);
  testData.productCodes = products.map(p => p.product_code);
  
  console.log(`✅ Found product (excluding Dummy):`);
  products.forEach((p, i) => {
    console.log(`   ${p.name} (${p.product_code}) - ID: ${p.id}`);
  });

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
  testData.territoryName = randomDealer.territory_name || randomDealer.territory_code;

  console.log(`✅ Found territory: ${testData.territoryName}`);
  console.log(`✅ Selected random dealer: ${testData.dealerName} (ID: ${testData.dealerId})`);

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

// ============================================================================
// TEST 1: Add 1 product in Cumilla territory
// ============================================================================

async function test1_AssignQuotas() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 1: Add 1 product in Cumilla territory');
  console.log('='.repeat(70));
  
  const today = new Date().toISOString().split('T')[0];
  
  // Get product details
  const productsResult = await makeRequest('/api/products');
  const products = productsResult.data.filter(p => testData.productIds.includes(p.id));
  
  const quotas = products.map(product => ({
    date: today,
    product_id: product.id,
    product_code: product.product_code,
    product_name: product.name,
    territory_name: testData.territoryName,
    max_quantity: TEST_CONFIG.initialQuota
  }));

  console.log(`\n📊 Assigning quotas:`);
  console.log(`   Territory: ${testData.territoryName}`);
  console.log(`   Date: ${today}`);
  console.log(`   Products: ${quotas.length}`);
  quotas.forEach((q, i) => {
    console.log(`   ${i + 1}. ${q.product_name} (${q.product_code}): ${q.max_quantity} units`);
  });

  const result = await makeRequest('/api/product-caps/bulk', 'POST', { quotas });

  if (result.status === 200 && result.data.success) {
    console.log(`\n✅ TEST 1 PASSED: Assigned 1 product with ${TEST_CONFIG.initialQuota} units`);
    return true;
  }

  throw new Error(`TEST 1 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// TEST 2: Sell 3 units of allocated product to random dealer using random transport
// ============================================================================

async function test2_CreateOrder() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 2: Sell 3 units of allocated product to random dealer');
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

  // Test PASSES if order is rejected (status 400)
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

  // Test FAILS if order was created (status 200) - validation didn't work!
  if (result.status === 200) {
    throw new Error(`TEST 3 FAILED: Order was created but should have been rejected! Only ${remainingQuantity} units remaining, tried to order ${TEST_CONFIG.secondOrderQuantity}`);
  }

  throw new Error(`TEST 3 FAILED: Unexpected status ${result.status} - ${JSON.stringify(result.data)}`);
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

function showUsage() {
  console.log('\n📖 Usage:');
  console.log('   node test-cumilla-workflow.js [test_number]');
  console.log('\n📋 Available Tests:');
  console.log('   1 - Add 1 product in Cumilla territory (assign quota)');
  console.log('   2 - Sell 3 units to random dealer using random transport');
  console.log('   3 - TSO tries second order (5 units) - should FAIL (only 2 remaining)');
  console.log('   all - Run all tests in sequence');
  console.log('\n💡 Examples:');
  console.log('   node test-cumilla-workflow.js 1        # Run only test 1');
  console.log('   node test-cumilla-workflow.js 2        # Run only test 2');
  console.log('   node test-cumilla-workflow.js 3        # Run only test 3');
  console.log('   node test-cumilla-workflow.js all      # Run all tests');
  console.log('   node test-cumilla-workflow.js          # Show this help\n');
}

async function runTest(testNumber) {
  console.log('='.repeat(70));
  console.log('🧪 CUMILLA TERRITORY WORKFLOW TEST');
  console.log('='.repeat(70));
  console.log(`📍 Testing: ${BASE_URL}\n`);

  try {
    // Setup (required for all tests)
    await loginAsAdmin();
    await findProducts();
    await findTerritoryAndDealer();

    if (testNumber === '1' || testNumber === 'all') {
      // Test 1: Assign quotas
      await test1_AssignQuotas();
      
      if (testNumber === '1') {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST 1 COMPLETED!');
        console.log('='.repeat(70));
        process.exit(0);
      }
    }

    if (testNumber === '2' || testNumber === 'all') {
      // Switch to TSO for order creation
      await loginAsTSO();
      await getOrderRequirements();
      
      // Test 2: Create order
      await test2_CreateOrder();
      
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

    // Summary (only if running all tests)
    if (testNumber === 'all') {
      console.log('\n' + '='.repeat(70));
      console.log('✅ ALL TESTS PASSED!');
      console.log('='.repeat(70));
      console.log('\n📋 Summary:');
      console.log(`   Test 1: ✅ Assigned 1 product with ${TEST_CONFIG.initialQuota} units`);
      if (testData.orderId) {
        console.log(`   Test 2: ✅ Created order ${testData.orderId} selling ${TEST_CONFIG.orderQuantity} units`);
      }
      console.log(`   Test 3: ✅ Order validation working - second order correctly rejected`);
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

if (!['1', '2', '3', 'all'].includes(testNumber)) {
  console.log(`\n❌ Invalid test number: ${testNumber}`);
  showUsage();
  process.exit(1);
}

runTest(testNumber);

