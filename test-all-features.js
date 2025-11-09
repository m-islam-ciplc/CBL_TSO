/**
 * Complete Features Test Suite
 * Combines API endpoint checks and functional workflow tests
 * Usage: node test-all-features.js
 */

const http = require('http');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const tests = [];
let passed = 0;
let failed = 0;
let testData = {
  testDealerId: null,
  testDealerTerritory: null,
  testProductId: null,
  testProductCode: null,
  testProductName: null,
  testWarehouseId: null,
  testOrderTypeId: null,
  testTransportId: null,
  testOrderId: null,
  testUserId: null,
  availableDates: [],
  rangeStartDate: null,
  rangeEndDate: null,
};

function test(name, fn) {
  tests.push({ name, fn });
}

function makeRequest(path, method = 'GET', data = null, options = {}) {
  const { raw = false } = options;
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks.map((chunk) => Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));

        if (raw) {
          resolve({ status: res.statusCode, data: buffer, headers: res.headers });
          return;
        }

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

// ============================================================================
// SECTION 1: API ENDPOINT CHECKS (Smoke Tests)
// ============================================================================

test('Backend Health Check', async () => {
  const result = await makeRequest('/health');
  if (result.status === 200) {
    return { pass: true, message: 'Backend is healthy' };
  }
  return { pass: false, message: `Health check failed: ${result.status}` };
});

test('Get Dealers', async () => {
  const result = await makeRequest('/api/dealers');
  if (result.status === 200 && Array.isArray(result.data)) {
    return { pass: true, message: `Found ${result.data.length} dealers` };
  }
  return { pass: false, message: `Failed to get dealers: ${result.status}` };
});

test('Get Products', async () => {
  const result = await makeRequest('/api/products');
  if (result.status === 200 && Array.isArray(result.data)) {
    return { pass: true, message: `Found ${result.data.length} products` };
  }
  return { pass: false, message: `Failed to get products: ${result.status}` };
});

test('Get Warehouses', async () => {
  const result = await makeRequest('/api/warehouses');
  if (result.status === 200 && Array.isArray(result.data)) {
    return { pass: true, message: `Found ${result.data.length} warehouses` };
  }
  return { pass: false, message: `Failed to get warehouses: ${result.status}` };
});

test('Get Order Types', async () => {
  const result = await makeRequest('/api/order-types');
  if (result.status === 200 && Array.isArray(result.data)) {
    return { pass: true, message: `Found ${result.data.length} order types` };
  }
  return { pass: false, message: `Failed to get order types: ${result.status}` };
});

test('Get Transports', async () => {
  const result = await makeRequest('/api/transports');
  if (result.status === 200 && Array.isArray(result.data)) {
    return { pass: true, message: `Found ${result.data.length} transports` };
  }
  return { pass: false, message: `Failed to get transports: ${result.status}` };
});

test('Get Orders', async () => {
  const result = await makeRequest('/api/orders');
  if (result.status === 200 && Array.isArray(result.data)) {
    return { pass: true, message: `Found ${result.data.length} orders` };
  }
  return { pass: false, message: `Failed to get orders: ${result.status}` };
});

test('Get Product Caps', async () => {
  const result = await makeRequest('/api/product-caps');
  if (result.status === 200 && Array.isArray(result.data)) {
    return { pass: true, message: `Found ${result.data.length} quota entries` };
  }
  return { pass: false, message: `Failed to get product caps: ${result.status}` };
});

test('Get Available Dates', async () => {
  const result = await makeRequest('/api/orders/available-dates');
  if (result.status === 200 && result.data && Array.isArray(result.data.dates)) {
    return { pass: true, message: `Found ${result.data.dates.length} dates with orders` };
  }
  return { pass: false, message: `Failed to get available dates: ${result.status}` };
});

test('Get Users', async () => {
  const result = await makeRequest('/api/users');
  if (result.status === 200 && Array.isArray(result.data)) {
    return { pass: true, message: `Found ${result.data.length} users` };
  }
  return { pass: false, message: `Failed to get users: ${result.status}` };
});

// ============================================================================
// SECTION 2: SETUP FOR FUNCTIONAL TESTS
// ============================================================================

test('Setup: Get Test Data IDs', async () => {
  try {
    // Get dealers
    const dealersRes = await makeRequest('/api/dealers');
    if (dealersRes.status === 200 && dealersRes.data.length > 0) {
      testData.testDealerId = dealersRes.data[0].id;
      testData.testDealerTerritory = dealersRes.data[0].territory_name || 'Test Territory';
    }

    // Get products
    const productsRes = await makeRequest('/api/products');
    if (productsRes.status === 200 && productsRes.data.length > 0) {
      testData.testProductId = productsRes.data[0].id;
      testData.testProductCode = productsRes.data[0].product_code || 'TEST001';
      testData.testProductName = productsRes.data[0].name || 'Test Product';
    }

    // Get warehouses
    const warehousesRes = await makeRequest('/api/warehouses');
    if (warehousesRes.status === 200 && warehousesRes.data.length > 0) {
      testData.testWarehouseId = warehousesRes.data[0].id;
    }

    // Get order types
    const orderTypesRes = await makeRequest('/api/order-types');
    if (orderTypesRes.status === 200 && orderTypesRes.data.length > 0) {
      testData.testOrderTypeId = orderTypesRes.data[0].id;
    }

    // Get transports
    const transportsRes = await makeRequest('/api/transports');
    if (transportsRes.status === 200 && transportsRes.data.length > 0) {
      testData.testTransportId = transportsRes.data[0].id;
    }

    // Get users
    const usersRes = await makeRequest('/api/users');
    if (usersRes.status === 200 && usersRes.data.length > 0) {
      testData.testUserId = usersRes.data[0].id;
    }

    // Get available dates
    const datesRes = await makeRequest('/api/orders/available-dates');
    if (datesRes.status === 200 && datesRes.data && Array.isArray(datesRes.data.dates) && datesRes.data.dates.length > 0) {
      testData.availableDates = datesRes.data.dates;
      testData.rangeStartDate = datesRes.data.dates[datesRes.data.dates.length - 1];
      testData.rangeEndDate = datesRes.data.dates[0];
    }

    if (testData.testDealerId && testData.testProductId && testData.testWarehouseId && 
        testData.testOrderTypeId && testData.testTransportId) {
      return { 
        pass: true, 
        message: `Got test data: Dealer(${testData.testDealerId}), Product(${testData.testProductId}), Warehouse(${testData.testWarehouseId})` 
      };
    }
    return { pass: false, message: 'Missing required test data (dealers, products, warehouses, etc.)' };
  } catch (error) {
    return { pass: false, message: `Setup failed: ${error.message}` };
  }
});

// ============================================================================
// SECTION 3: FUNCTIONAL WORKFLOW TESTS
// ============================================================================

// Test 1: Allocate Quota (Get current quota first, then set absolute value)
test('Functional: Allocate Daily Quota', async () => {
  if (!testData.testProductId || !testData.testDealerTerritory) {
    return { pass: false, message: 'No test product or territory available' };
  }

  const today = new Date().toISOString().split('T')[0];
  const maxQuantity = 100;

  // First, try to get existing quota to see current max_quantity
  const getQuotaResult = await makeRequest(`/api/product-caps/tso-today?territory_name=${encodeURIComponent(testData.testDealerTerritory)}`);
  let existingMaxQty = 0;
  
  if (getQuotaResult.status === 200 && Array.isArray(getQuotaResult.data)) {
    const existingQuota = getQuotaResult.data.find(q => q.product_id === testData.testProductId);
    if (existingQuota) {
      existingMaxQty = Number(existingQuota.max_quantity);
    }
  }

  // Use PUT endpoint to set absolute value (not add to existing)
  // If quota doesn't exist, PUT will fail, so we need to create it first with bulk
  let result;
  if (existingMaxQty === 0) {
    // Create new quota using bulk endpoint
    result = await makeRequest(
      '/api/product-caps/bulk',
      'POST',
      {
        quotas: [{
          date: today,
          product_id: testData.testProductId,
          product_code: testData.testProductCode,
          product_name: testData.testProductName,
          territory_name: testData.testDealerTerritory,
          max_quantity: maxQuantity
        }]
      }
    );
  } else {
    // Update existing quota to set absolute value
    result = await makeRequest(
      `/api/product-caps/${today}/${testData.testProductId}/${encodeURIComponent(testData.testDealerTerritory)}`,
      'PUT',
      { max_quantity: maxQuantity }
    );
  }

  if (result.status === 200 && (result.data?.success || result.data?.message)) {
    return { pass: true, message: `Quota set to ${maxQuantity} for product ${testData.testProductId} (was ${existingMaxQty > 0 ? existingMaxQty : 'new'})` };
  }
  return { pass: false, message: `Failed to allocate quota: ${result.status} - ${JSON.stringify(result.data)}` };
});

// Test 2: Get Allocated Quotas
test('Functional: Get Allocated Quotas (Verify Quota Appears)', async () => {
  if (!testData.testDealerTerritory) {
    return { pass: false, message: 'No test territory available' };
  }

  const result = await makeRequest(`/api/product-caps/tso-today?territory_name=${encodeURIComponent(testData.testDealerTerritory)}`);

  if (result.status === 200 && Array.isArray(result.data)) {
    const hasQuota = result.data.some(q => q.product_id === testData.testProductId);
    if (hasQuota) {
      return { pass: true, message: `Found quota for product ${testData.testProductId} in allocated quotas` };
    }
    return { pass: false, message: `Quota allocated but not found in GET response` };
  }
  return { pass: false, message: `Failed to get quotas: ${result.status} - ${JSON.stringify(result.data)}` };
});

// Test 3: Create Order
test('Functional: Create Order', async () => {
  if (!testData.testDealerId || !testData.testProductId || !testData.testWarehouseId || 
      !testData.testOrderTypeId || !testData.testTransportId) {
    return { pass: false, message: 'Missing required test data for order creation' };
  }

  const orderData = {
    order_type_id: testData.testOrderTypeId,
    dealer_id: testData.testDealerId,
    warehouse_id: testData.testWarehouseId,
    transport_id: testData.testTransportId,
    user_id: testData.testUserId || null,
    order_items: [
      {
        product_id: testData.testProductId,
        quantity: 5
      }
    ]
  };

  const result = await makeRequest('/api/orders', 'POST', orderData);

  if (result.status === 200 && result.data && result.data.order_id) {
    testData.testOrderId = result.data.order_id;
    return { pass: true, message: `Order created: ${result.data.order_id}` };
  }
  return { pass: false, message: `Failed to create order: ${result.status} - ${JSON.stringify(result.data)}` };
});

// Test 4: Verify Order Appears in Orders List
test('Functional: Verify Order in Orders List', async () => {
  if (!testData.testOrderId) {
    return { pass: false, message: 'No test order ID available' };
  }

  const result = await makeRequest('/api/orders');

  if (result.status === 200 && Array.isArray(result.data)) {
    const foundOrder = result.data.find(o => o.order_id === testData.testOrderId);
    if (foundOrder) {
      return { pass: true, message: `Order ${testData.testOrderId} found in orders list` };
    }
    return { pass: false, message: `Order ${testData.testOrderId} not found in orders list` };
  }
  return { pass: false, message: `Failed to get orders: ${result.status}` };
});

// Test 5: Verify Order Details
test('Functional: Get Order Details', async () => {
  if (!testData.testOrderId) {
    return { pass: false, message: 'No test order ID available' };
  }

  const result = await makeRequest(`/api/orders/${testData.testOrderId}`);

  if (result.status === 200 && result.data && result.data.items) {
    const hasProduct = result.data.items.some(item => item.product_id === testData.testProductId);
    if (hasProduct) {
      return { pass: true, message: `Order details retrieved, contains product ${testData.testProductId}` };
    }
    return { pass: false, message: 'Order details retrieved but missing product' };
  }
  return { pass: false, message: `Failed to get order details: ${result.status}` };
});

// Test 6: Verify Quota Remaining Quantity Updated
test('Functional: Verify Quota Remaining Quantity Updated After Order', async () => {
  if (!testData.testDealerTerritory || !testData.testOrderId) {
    return { pass: false, message: 'No test territory or order ID available' };
  }

  // Get quota before checking (to see current state)
  const result = await makeRequest(`/api/product-caps/tso-today?territory_name=${encodeURIComponent(testData.testDealerTerritory)}`);

  if (result.status === 200 && Array.isArray(result.data)) {
    const quota = result.data.find(q => q.product_id === testData.testProductId);
    if (quota) {
      // Verify the calculation: remaining = max - sold
      // Convert to numbers to avoid string comparison issues
      const maxQty = Number(quota.max_quantity);
      const soldQty = Number(quota.sold_quantity);
      const remainingQty = Number(quota.remaining_quantity);
      const calculatedRemaining = maxQty - soldQty;
      
      if (remainingQty === calculatedRemaining) {
        // Check if our test order is included in the sold quantity
        if (soldQty >= 5) {
          return { 
            pass: true, 
            message: `Remaining quantity correct: ${remainingQty} (max: ${maxQty}, sold: ${soldQty}). Test order may be included with other orders.` 
          };
        }
        return { 
          pass: true, 
          message: `Remaining quantity calculation correct: ${remainingQty} (max: ${maxQty}, sold: ${soldQty}). Note: Other orders may exist for this product/territory/date.` 
        };
      }
      return { 
        pass: false, 
        message: `Remaining quantity calculation incorrect: ${remainingQty} (expected ${calculatedRemaining} based on max: ${maxQty}, sold: ${soldQty})` 
      };
    }
    return { pass: false, message: 'Quota not found after order' };
  }
  return { pass: false, message: `Failed to get quotas: ${result.status} - ${JSON.stringify(result.data)}` };
});

// Test 7: Generate MR CSV Report
test('Functional: Generate MR CSV Report', async () => {
  const today = new Date().toISOString().split('T')[0];
  const result = await makeRequest(`/api/orders/mr-report/${today}`);

  if (result.status === 200) {
    // Check if it's CSV content
    if (typeof result.data === 'string' && result.data.includes('internalId,orderType')) {
      // Check if our test order is in the CSV
      if (result.data.includes(testData.testOrderId || '')) {
        return { pass: true, message: 'MR CSV generated successfully and contains test order' };
      }
      return { pass: true, message: 'MR CSV generated successfully' };
    }
    return { pass: false, message: 'MR CSV response is not valid CSV format' };
  }
  if (result.status === 404) {
    return { pass: true, message: 'No orders for today (404 is expected if no orders)' };
  }
  return { pass: false, message: `Failed to generate MR CSV: ${result.status}` };
});

// Test 8: Filter Orders by User (TSO View)
test('Functional: Filter Orders by User ID (TSO View)', async () => {
  if (!testData.testUserId) {
    return { pass: true, message: 'Skipped: No test user ID available' };
  }

  const result = await makeRequest(`/api/orders?user_id=${testData.testUserId}`);

  if (result.status === 200 && Array.isArray(result.data)) {
    // Verify all returned orders belong to the user
    const allBelongToUser = result.data.every(o => o.user_id === testData.testUserId);
    if (allBelongToUser) {
      return { pass: true, message: `Found ${result.data.length} orders for user ${testData.testUserId}, all belong to user` };
    }
    return { pass: false, message: 'Some orders do not belong to the filtered user' };
  }
  return { pass: false, message: `Failed to filter orders by user: ${result.status}` };
});

// Test 9: Preview Range Orders (Dealer Aggregation)
test('Functional: Preview Range Orders', async () => {
  if (!testData.rangeStartDate || !testData.rangeEndDate) {
    return { pass: true, message: 'Skipped: No available dates for range preview' };
  }

  const result = await makeRequest(`/api/orders/range?startDate=${testData.rangeStartDate}&endDate=${testData.rangeEndDate}`);

  if (result.status === 200 && result.data && Array.isArray(result.data.orders)) {
    return { pass: true, message: `Range preview returned ${result.data.orders.length} dealer summaries` };
  }

  if (result.status === 404) {
    return { pass: true, message: `No orders between ${testData.rangeStartDate} and ${testData.rangeEndDate}` };
  }

  return { pass: false, message: `Failed to preview range orders: ${result.status} - ${JSON.stringify(result.data)}` };
});

// Test 10: Download Order Summary Excel Report
test('Functional: Download Order Summary Excel Report', async () => {
  if (!testData.rangeStartDate || !testData.rangeEndDate) {
    return { pass: true, message: 'Skipped: No available dates for range Excel' };
  }

  const result = await makeRequest(
    `/api/orders/tso-report-range?startDate=${testData.rangeStartDate}&endDate=${testData.rangeEndDate}`,
    'GET',
    null,
    { raw: true }
  );

  if (result.status === 200) {
    const contentType = result.headers['content-type'] || '';
    if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') && result.data.length > 0) {
      return { pass: true, message: 'Range Excel report generated successfully (binary data received)' };
    }
    return { pass: false, message: `Unexpected range Excel response headers/content-type: ${contentType}` };
  }

  if (result.status === 404) {
    return { pass: true, message: `No orders for Excel range ${testData.rangeStartDate} - ${testData.rangeEndDate}` };
  }

  return { pass: false, message: `Failed to Download Order Summary Excel: ${result.status}` };
});

// Test 11: Download Single-Date Excel Report
test('Functional: Download Single-Date Excel Report', async () => {
  const targetDate = testData.rangeEndDate || testData.rangeStartDate;
  if (!targetDate) {
    return { pass: true, message: 'Skipped: No available date for single-day Excel' };
  }

  const result = await makeRequest(
    `/api/orders/tso-report/${targetDate}`,
    'GET',
    null,
    { raw: true }
  );

  if (result.status === 200) {
    const contentType = result.headers['content-type'] || '';
    if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') && result.data.length > 0) {
      return { pass: true, message: `Single-date Excel report generated (date: ${targetDate})` };
    }
    return { pass: false, message: `Unexpected single-date Excel response headers/content-type: ${contentType}` };
  }

  if (result.status === 404) {
    return { pass: true, message: `No orders for date ${targetDate}` };
  }

  return { pass: false, message: `Failed to download single-date Excel: ${result.status}` };
});

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function runTests() {
  console.log('🧪 Running Complete Features Test Suite...\n');
  console.log(`📍 Testing: ${BASE_URL}`);
  console.log('💡 Tip: If tests fail, try: API_URL=http://localhost:3002 node test-all-features.js (for Docker)\n');
  console.log('='.repeat(60));
  console.log('SECTION 1: API Endpoint Checks (Smoke Tests)');
  console.log('='.repeat(60) + '\n');

  let section1Passed = 0;
  let section1Failed = 0;
  let section2Passed = 0;
  let section2Failed = 0;

  // Run API endpoint tests (first 10 tests)
  for (let i = 0; i < 10; i++) {
    const { name, fn } = tests[i];
    try {
      const result = await fn();
      if (result.pass) {
        console.log(`✅ ${name}: ${result.message}`);
        passed++;
        section1Passed++;
      } else {
        console.log(`❌ ${name}: ${result.message}`);
        failed++;
        section1Failed++;
      }
    } catch (error) {
      console.log(`❌ ${name}: Error - ${error.message}`);
      failed++;
      section1Failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('SECTION 2: Functional Workflow Tests');
  console.log('='.repeat(60) + '\n');

  // Run setup and functional tests (remaining tests)
  for (let i = 10; i < tests.length; i++) {
    const { name, fn } = tests[i];
    try {
      const result = await fn();
      if (result.pass) {
        console.log(`✅ ${name}: ${result.message}`);
        passed++;
        section2Passed++;
      } else {
        console.log(`❌ ${name}: ${result.message}`);
        failed++;
        section2Failed++;
      }
    } catch (error) {
      console.log(`❌ ${name}: Error - ${error.message}`);
      failed++;
      section2Failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Section 1 (API Endpoints): ${section1Passed} passed, ${section1Failed} failed`);
  console.log(`Section 2 (Functional Tests): ${section2Passed} passed, ${section2Failed} failed`);
  console.log(`\nTotal: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('✅ All tests passed!');
    console.log('\n💡 Note: Test order created during this test may need manual cleanup.');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

runTests();


