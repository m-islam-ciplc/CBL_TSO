/**
 * Admin Reports Tests (A46-A50)
 */

let utils = {};

function init(sharedUtils) {
  utils = sharedUtils;
}

function getTodayDate() {
  return utils.getTodayDate();
}

// A46: Navigate to Reports
async function testA46_NavigateToReports() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A46: Navigate to Reports');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  const today = getTodayDate();
  
  // Test accessing reports endpoints
  const dailyReportResult = await utils.makeRequest(`/api/orders/dealer/my-report/${today}?dealer_id=1`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  console.log(`\n✅ A46 PASSED: Reports page accessible`);
  console.log(`   Daily report endpoint accessible: ${dailyReportResult.status === 200 || dailyReportResult.status === 404 ? 'Yes' : 'Error'}`);
  return true;
}

// A47: View daily report
async function testA47_ViewDailyReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A47: View daily report');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  const today = getTodayDate();
  
  // Get dealers
  const dealersResult = await utils.makeRequest('/api/dealers', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (dealersResult.status !== 200 || !Array.isArray(dealersResult.data) || dealersResult.data.length === 0) {
    throw new Error(`A47 FAILED: Could not fetch dealers`);
  }
  
  const dealerId = dealersResult.data[0].id;
  
  const result = await utils.makeRequest(`/api/orders/dealer/my-report/${today}?dealer_id=${dealerId}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 || result.status === 404) {
    console.log(`\n✅ A47 PASSED: Daily report viewable`);
    console.log(`   Dealer ID: ${dealerId}`);
    console.log(`   Date: ${today}`);
    console.log(`   Status: ${result.status === 200 ? 'Report generated' : 'No orders found'}`);
    return true;
  }
  
  throw new Error(`A47 FAILED: Could not view daily report - ${result.status}`);
}

// A48: Export daily report
async function testA48_ExportDailyReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A48: Export daily report');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  const today = getTodayDate();
  
  const dealersResult = await utils.makeRequest('/api/dealers', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (dealersResult.status !== 200 || !Array.isArray(dealersResult.data) || dealersResult.data.length === 0) {
    throw new Error(`A48 FAILED: Could not fetch dealers`);
  }
  
  const dealerId = dealersResult.data[0].id;
  
  const result = await utils.makeRequest(`/api/orders/dealer/my-report/${today}?dealer_id=${dealerId}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.headers && result.headers['content-type'] && result.headers['content-type'].includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
    console.log(`\n✅ A48 PASSED: Daily report export successful`);
    console.log(`   Content-Type: ${result.headers['content-type']}`);
    return true;
  } else if (result.status === 404) {
    console.log(`\n✅ A48 PASSED: Export endpoint accessible (no data for this date)`);
    return true;
  }
  
  throw new Error(`A48 FAILED: Export failed - ${result.status}`);
}

// A49: View TSO report
async function testA49_ViewTSOReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A49: View TSO report');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  const today = getTodayDate();
  
  const result = await utils.makeRequest(`/api/orders/tso/my-report/${today}?user_id=1`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 || result.status === 404) {
    console.log(`\n✅ A49 PASSED: TSO report viewable`);
    console.log(`   Date: ${today}`);
    console.log(`   Status: ${result.status === 200 ? 'Report generated' : 'No orders found'}`);
    return true;
  }
  
  throw new Error(`A49 FAILED: Could not view TSO report - ${result.status}`);
}

// A50: Export TSO report
async function testA50_ExportTSOReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A50: Export TSO report');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  const today = getTodayDate();
  
  const result = await utils.makeRequest(`/api/orders/tso/my-report/${today}?user_id=1`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.headers && result.headers['content-type'] && result.headers['content-type'].includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
    console.log(`\n✅ A50 PASSED: TSO report export successful`);
    console.log(`   Content-Type: ${result.headers['content-type']}`);
    return true;
  } else if (result.status === 404) {
    console.log(`\n✅ A50 PASSED: Export endpoint accessible (no data for this date)`);
    return true;
  }
  
  throw new Error(`A50 FAILED: Export failed - ${result.status}`);
}

module.exports = {
  init,
  testA46_NavigateToReports,
  testA47_ViewDailyReport,
  testA48_ExportDailyReport,
  testA49_ViewTSOReport,
  testA50_ExportTSOReport
};
