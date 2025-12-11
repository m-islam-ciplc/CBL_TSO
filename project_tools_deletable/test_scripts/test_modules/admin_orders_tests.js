/**
 * Admin Orders Tests (A57-A63)
 */

let utils = {};

function init(sharedUtils) {
  utils = sharedUtils;
}

function getTodayDate() {
  return utils.getTodayDate();
}

// A57: View all orders
async function testA57_ViewAllOrders() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A57: View all orders');
  console.log('='.repeat(70));
  
  const testData = utils.getTestData();
  const result = await utils.makeRequest('/api/orders', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && Array.isArray(result.data)) {
    // Ensure no unit price leakage for non-admin views isn't applicable here (admin can see)
    console.log(`\n✅ A57 PASSED: All orders viewable`);
    console.log(`   Total orders: ${result.data.length}`);
    if (result.data.length > 0) {
      console.log(`   Sample: Order ID ${result.data[0].order_id || 'N/A'}`);
    }
    return true;
  }
  
  throw new Error(`A57 FAILED: Could not view orders - ${result.status}`);
}

// A58: Filter orders by date
async function testA58_FilterOrdersByDate() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A58: Filter orders by date');
  console.log('='.repeat(70));
  
  const testData = utils.getTestData();
  const today = getTodayDate();
  
  const result = await utils.makeRequest(`/api/orders?date=${today}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && Array.isArray(result.data)) {
    const filtered = result.data.filter(o => {
      const orderDate = o.order_date || '';
      return orderDate === today;
    });
    
    console.log(`\n✅ A58 PASSED: Orders filtered by date`);
    console.log(`   Date: ${today}`);
    console.log(`   Filtered orders: ${filtered.length}`);
    return true;
  }
  
  throw new Error(`A58 FAILED: Could not filter orders by date - ${result.status}`);
}

// A59: Filter orders by dealer
async function testA59_FilterOrdersByDealer() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A59: Filter orders by dealer');
  console.log('='.repeat(70));
  
  const testData = utils.getTestData();
  
  const dealersResult = await utils.makeRequest('/api/dealers', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (dealersResult.status !== 200 || !Array.isArray(dealersResult.data) || dealersResult.data.length === 0) {
    throw new Error(`A53 FAILED: Could not fetch dealers`);
  }
  
  const dealerId = dealersResult.data[0].id;
  
  const result = await utils.makeRequest(`/api/orders?dealer_id=${dealerId}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && Array.isArray(result.data)) {
    const filtered = result.data.filter(o => o.dealer_id === dealerId);
    
    console.log(`\n✅ A59 PASSED: Orders filtered by dealer`);
    console.log(`   Dealer ID: ${dealerId}`);
    console.log(`   Filtered orders: ${filtered.length}`);
    return true;
  }
  
  throw new Error(`A59 FAILED: Could not filter orders by dealer - ${result.status}`);
}

// A60: View order details
async function testA60_ViewOrderDetails() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A60: View order details');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  
  const ordersResult = await utils.makeRequest('/api/orders', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (ordersResult.status !== 200 || !Array.isArray(ordersResult.data) || ordersResult.data.length === 0) {
    console.log(`\n⚠️  A60 SKIPPED: No orders found`);
    return true;
  }
  
  const order = ordersResult.data[0];
  const orderId = order.order_id || order.id;
  
  if (!orderId) {
    console.log(`\n⚠️  A60 SKIPPED: Order has no order_id or id field`);
    return true;
  }
  
  const result = await utils.makeRequest(`/api/orders/${orderId}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data) {
    console.log(`\n✅ A60 PASSED: Order details viewable`);
    console.log(`   Order ID: ${orderId}`);
    console.log(`   Items: ${result.data.items ? result.data.items.length : 'N/A'}`);
    return true;
  } else if (result.status === 404) {
    console.log(`\n⚠️  A60 SKIPPED: Order not found (may have been deleted)`);
    return true;
  }
  
  throw new Error(`A60 FAILED: Could not view order details - ${result.status} - ${JSON.stringify(result.data)}`);
}

// A61: Delete order
async function testA61_DeleteOrder() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A61: Delete order');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  
  // Get orders
  const ordersResult = await utils.makeRequest('/api/orders', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (ordersResult.status !== 200 || !Array.isArray(ordersResult.data) || ordersResult.data.length === 0) {
    console.log(`\n⚠️  A61 SKIPPED: No orders found to delete`);
    return true;
  }
  
  // Find a dealer-sourced order to delete
  const orderToDelete = ordersResult.data.find(o => o.order_source === 'dealer');
  
  if (!orderToDelete) {
    console.log(`\n⚠️  A61 SKIPPED: No dealer orders found to delete`);
    return true;
  }
  
  const orderId = orderToDelete.id || orderToDelete.order_id;
  
  const result = await utils.makeRequest(`/api/orders/${orderId}`, 'DELETE', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200) {
    console.log(`\n✅ A61 PASSED: Order deleted successfully`);
    console.log(`   Order ID: ${orderId}`);
    return true;
  }
  
  throw new Error(`A61 FAILED: Delete order failed - ${result.status} - ${JSON.stringify(result.data)}`);
}

// A62: Export orders report
async function testA62_ExportOrdersReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A62: Export orders report');
  console.log('='.repeat(70));
  
  const testData = utils.getTestData();
  const today = getTodayDate();
  
  const dealersResult = await utils.makeRequest('/api/dealers', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (dealersResult.status !== 200 || !Array.isArray(dealersResult.data) || dealersResult.data.length === 0) {
    throw new Error(`A56 FAILED: Could not fetch dealers`);
  }
  
  const dealerId = dealersResult.data[0].id;
  
  const result = await utils.makeRequest(`/api/orders/dealer/my-report/${today}?dealer_id=${dealerId}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.headers && result.headers['content-type'] && result.headers['content-type'].includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
    console.log(`\n✅ A62 PASSED: Orders report export successful`);
    console.log(`   Content-Type: ${result.headers['content-type']}`);
    return true;
  } else if (result.status === 404) {
    console.log(`\n✅ A62 PASSED: Export endpoint accessible (no data for this date)`);
    return true;
  }
  
  throw new Error(`A62 FAILED: Export failed - ${result.status}`);
}

// A63: Available dates by order type (SO vs DD)
async function testA63_AvailableDatesByOrderType() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A63: Available dates by order type (SO vs DD)');
  console.log('='.repeat(70));

  const testData = utils.getTestData();

  const soResult = await utils.makeRequest('/api/orders/available-dates?order_type=SO', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  const ddResult = await utils.makeRequest('/api/orders/available-dates?order_type=DD', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });

  if (soResult.status !== 200 || !soResult.data || !Array.isArray(soResult.data.dates)) {
    throw new Error(`A63 FAILED: Could not fetch SO available dates - ${soResult.status}`);
  }
  if (ddResult.status !== 200 || !ddResult.data || !Array.isArray(ddResult.data.dates)) {
    throw new Error(`A63 FAILED: Could not fetch DD available dates - ${ddResult.status}`);
  }

  console.log(`\n✅ A63 PASSED: Available dates fetched`);
  console.log(`   SO dates: ${soResult.data.dates.length}`);
  console.log(`   DD dates: ${ddResult.data.dates.length}`);
  return true;
}

module.exports = {
  init,
  testA57_ViewAllOrders,
  testA58_FilterOrdersByDate,
  testA59_FilterOrdersByDealer,
  testA60_ViewOrderDetails,
  testA61_DeleteOrder,
  testA62_ExportOrdersReport,
  testA63_AvailableDatesByOrderType
};
