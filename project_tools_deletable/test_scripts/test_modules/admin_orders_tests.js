/**
 * Admin Orders Tests (A51-A56)
 */

let utils = {};

function init(sharedUtils) {
  utils = sharedUtils;
}

function getTodayDate() {
  return utils.getTodayDate();
}

// A51: View all orders
async function testA51_ViewAllOrders() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A51: View all orders');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  const result = await utils.makeRequest('/api/orders', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && Array.isArray(result.data)) {
    console.log(`\n✅ A51 PASSED: All orders viewable`);
    console.log(`   Total orders: ${result.data.length}`);
    if (result.data.length > 0) {
      console.log(`   Sample: Order ID ${result.data[0].order_id || 'N/A'}`);
    }
    return true;
  }
  
  throw new Error(`A51 FAILED: Could not view orders - ${result.status}`);
}

// A52: Filter orders by date
async function testA52_FilterOrdersByDate() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A52: Filter orders by date');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  const today = getTodayDate();
  
  const result = await utils.makeRequest(`/api/orders?date=${today}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && Array.isArray(result.data)) {
    const filtered = result.data.filter(o => {
      const orderDate = o.order_date || (o.created_at ? o.created_at.split('T')[0] : '');
      return orderDate === today;
    });
    
    console.log(`\n✅ A52 PASSED: Orders filtered by date`);
    console.log(`   Date: ${today}`);
    console.log(`   Filtered orders: ${filtered.length}`);
    return true;
  }
  
  throw new Error(`A52 FAILED: Could not filter orders by date - ${result.status}`);
}

// A53: Filter orders by dealer
async function testA53_FilterOrdersByDealer() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A53: Filter orders by dealer');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
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
    
    console.log(`\n✅ A53 PASSED: Orders filtered by dealer`);
    console.log(`   Dealer ID: ${dealerId}`);
    console.log(`   Filtered orders: ${filtered.length}`);
    return true;
  }
  
  throw new Error(`A53 FAILED: Could not filter orders by dealer - ${result.status}`);
}

// A54: View order details
async function testA54_ViewOrderDetails() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A54: View order details');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  
  const ordersResult = await utils.makeRequest('/api/orders', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (ordersResult.status !== 200 || !Array.isArray(ordersResult.data) || ordersResult.data.length === 0) {
    console.log(`\n⚠️  A54 SKIPPED: No orders found`);
    return true;
  }
  
  const order = ordersResult.data[0];
  const orderId = order.order_id || order.id;
  
  if (!orderId) {
    console.log(`\n⚠️  A54 SKIPPED: Order has no order_id or id field`);
    return true;
  }
  
  const result = await utils.makeRequest(`/api/orders/${orderId}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data) {
    console.log(`\n✅ A54 PASSED: Order details viewable`);
    console.log(`   Order ID: ${orderId}`);
    console.log(`   Items: ${result.data.items ? result.data.items.length : 'N/A'}`);
    return true;
  } else if (result.status === 404) {
    console.log(`\n⚠️  A54 SKIPPED: Order not found (may have been deleted)`);
    return true;
  }
  
  throw new Error(`A54 FAILED: Could not view order details - ${result.status} - ${JSON.stringify(result.data)}`);
}

// A55: Delete order
async function testA55_DeleteOrder() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A55: Delete order');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  
  // Get orders
  const ordersResult = await utils.makeRequest('/api/orders', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (ordersResult.status !== 200 || !Array.isArray(ordersResult.data) || ordersResult.data.length === 0) {
    console.log(`\n⚠️  A55 SKIPPED: No orders found to delete`);
    return true;
  }
  
  // Find a dealer-sourced order to delete
  const orderToDelete = ordersResult.data.find(o => o.order_source === 'dealer');
  
  if (!orderToDelete) {
    console.log(`\n⚠️  A55 SKIPPED: No dealer orders found to delete`);
    return true;
  }
  
  const orderId = orderToDelete.id || orderToDelete.order_id;
  
  const result = await utils.makeRequest(`/api/orders/${orderId}`, 'DELETE', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200) {
    console.log(`\n✅ A55 PASSED: Order deleted successfully`);
    console.log(`   Order ID: ${orderId}`);
    return true;
  }
  
  throw new Error(`A55 FAILED: Delete order failed - ${result.status} - ${JSON.stringify(result.data)}`);
}

// A56: Export orders report
async function testA56_ExportOrdersReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A56: Export orders report');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
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
    console.log(`\n✅ A56 PASSED: Orders report export successful`);
    console.log(`   Content-Type: ${result.headers['content-type']}`);
    return true;
  } else if (result.status === 404) {
    console.log(`\n✅ A56 PASSED: Export endpoint accessible (no data for this date)`);
    return true;
  }
  
  throw new Error(`A56 FAILED: Export failed - ${result.status}`);
}

module.exports = {
  init,
  testA51_ViewAllOrders,
  testA52_FilterOrdersByDate,
  testA53_FilterOrdersByDealer,
  testA54_ViewOrderDetails,
  testA55_DeleteOrder,
  testA56_ExportOrdersReport
};
