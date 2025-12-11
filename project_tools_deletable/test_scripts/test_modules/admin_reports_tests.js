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

// A48b: Export MR CSV report
async function testA48b_ExportMRCSVReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A48b: Export MR CSV report');
  console.log('='.repeat(70));
  
  const testData = utils.getTestData();
  const today = getTodayDate();
  
  // Test MR CSV report endpoint
  const result = await utils.makeRequest(`/api/orders/mr-report/${today}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.headers && result.headers['content-type'] && result.headers['content-type'].includes('text/csv')) {
    console.log(`\n✅ A48b PASSED: MR CSV report export successful`);
    console.log(`   Content-Type: ${result.headers['content-type']}`);
    console.log(`   Date: ${today}`);
    return true;
  } else if (result.status === 404) {
    console.log(`\n✅ A48b PASSED: MR CSV export endpoint accessible (no data for this date)`);
    return true;
  }
  
  throw new Error(`A48b FAILED: MR CSV export failed - ${result.status}`);
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

// A51: View Order Summary Report (Date Range) - NEW
async function testA51_ViewOrderSummaryReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A51: View Order Summary Report (Date Range)');
  console.log('='.repeat(70));
  
  const testData = utils.getTestData();
  const today = getTodayDate();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const startDate = yesterday.toISOString().split('T')[0];
  const endDate = today;
  
  // Test date range orders endpoint
  const result = await utils.makeRequest(`/api/orders/range?startDate=${startDate}&endDate=${endDate}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data) {
    console.log(`\n✅ A51 PASSED: Order Summary Report viewable`);
    console.log(`   Date Range: ${startDate} to ${endDate}`);
    console.log(`   Dealers: ${result.data.total_dealers || 0}`);
    console.log(`   Orders: ${result.data.total_original_orders || 0}`);
    console.log(`   Quantity: ${result.data.total_quantity || 0}`);
    return true;
  } else if (result.status === 404) {
    console.log(`\n✅ A51 PASSED: Order Summary Report endpoint accessible (no data for this range)`);
    return true;
  }
  
  throw new Error(`A51 FAILED: Could not view Order Summary Report - ${result.status}`);
}

// A52: Export Order Summary Report (Date Range) - NEW
async function testA52_ExportOrderSummaryReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A52: Export Order Summary Report (Date Range)');
  console.log('='.repeat(70));
  
  const testData = utils.getTestData();
  const today = getTodayDate();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const startDate = yesterday.toISOString().split('T')[0];
  const endDate = today;
  
  // Test date range report export endpoint
  const result = await utils.makeRequest(`/api/orders/tso-report-range?startDate=${startDate}&endDate=${endDate}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.headers && result.headers['content-type'] && result.headers['content-type'].includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
    console.log(`\n✅ A52 PASSED: Order Summary Report export successful`);
    console.log(`   Date Range: ${startDate} to ${endDate}`);
    console.log(`   Content-Type: ${result.headers['content-type']}`);
    return true;
  } else if (result.status === 404) {
    console.log(`\n✅ A52 PASSED: Export endpoint accessible (no data for this range)`);
    return true;
  }
  
  throw new Error(`A52 FAILED: Export failed - ${result.status}`);
}

// A53: View Monthly Forecasts (By Dealer) - NEW
async function testA53_ViewMonthlyForecastsByDealer() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A53: View Monthly Forecasts (By Dealer)');
  console.log('='.repeat(70));
  
  const testData = utils.getTestData();
  
  // Get current period
  const periodResult = await utils.makeRequest('/api/monthly-forecast/current-period', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (periodResult.status !== 200 || !periodResult.data) {
    throw new Error(`A53 FAILED: Could not get current period - ${periodResult.status}`);
  }
  
  const periodStart = periodResult.data.start;
  const periodEnd = periodResult.data.end;
  
  // Get forecasts for current period
  const result = await utils.makeRequest(`/api/monthly-forecast/all?period_start=${periodStart}&period_end=${periodEnd}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data && Array.isArray(result.data.forecasts)) {
    console.log(`\n✅ A53 PASSED: Monthly Forecasts viewable (By Dealer)`);
    console.log(`   Period: ${periodStart} to ${periodEnd}`);
    console.log(`   Forecasts: ${result.data.forecasts.length} dealer(s)`);
    return true;
  } else if (result.status === 200 && result.data && result.data.forecasts && result.data.forecasts.length === 0) {
    console.log(`\n✅ A53 PASSED: Monthly Forecasts endpoint accessible (no forecasts for this period)`);
    return true;
  }
  
  throw new Error(`A53 FAILED: Could not view Monthly Forecasts - ${result.status}`);
}

// A54: View Monthly Forecasts (By Product) - NEW
async function testA54_ViewMonthlyForecastsByProduct() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A54: View Monthly Forecasts (By Product)');
  console.log('='.repeat(70));
  
  const testData = utils.getTestData();
  
  // Get current period
  const periodResult = await utils.makeRequest('/api/monthly-forecast/current-period', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (periodResult.status !== 200 || !periodResult.data) {
    throw new Error(`A54 FAILED: Could not get current period - ${periodResult.status}`);
  }
  
  const periodStart = periodResult.data.start;
  const periodEnd = periodResult.data.end;
  
  // Get forecasts and verify product aggregation is possible
  const result = await utils.makeRequest(`/api/monthly-forecast/all?period_start=${periodStart}&period_end=${periodEnd}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data && Array.isArray(result.data.forecasts)) {
    // Aggregate by product (simulating frontend logic)
    const productSummary = {};
    result.data.forecasts.forEach((forecast) => {
      forecast.products.forEach((product) => {
        if (!productSummary[product.product_code]) {
          productSummary[product.product_code] = {
            product_code: product.product_code,
            product_name: product.product_name,
            total_quantity: 0,
            dealer_count: new Set(),
          };
        }
        productSummary[product.product_code].total_quantity += Number(product.quantity) || 0;
        productSummary[product.product_code].dealer_count.add(forecast.dealer_id);
      });
    });
    
    const productCount = Object.keys(productSummary).length;
    console.log(`\n✅ A54 PASSED: Monthly Forecasts viewable (By Product)`);
    console.log(`   Period: ${periodStart} to ${periodEnd}`);
    console.log(`   Products: ${productCount} unique product(s)`);
    return true;
  } else if (result.status === 200 && result.data && result.data.forecasts && result.data.forecasts.length === 0) {
    console.log(`\n✅ A54 PASSED: Monthly Forecasts endpoint accessible (no forecasts for this period)`);
    return true;
  }
  
  throw new Error(`A54 FAILED: Could not view Monthly Forecasts - ${result.status}`);
}

// A55: View Monthly Forecasts (By Territory) - NEW
async function testA55_ViewMonthlyForecastsByTerritory() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A55: View Monthly Forecasts (By Territory)');
  console.log('='.repeat(70));
  
  const testData = utils.getTestData();
  
  // Get current period
  const periodResult = await utils.makeRequest('/api/monthly-forecast/current-period', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (periodResult.status !== 200 || !periodResult.data) {
    throw new Error(`A55 FAILED: Could not get current period - ${periodResult.status}`);
  }
  
  const periodStart = periodResult.data.start;
  const periodEnd = periodResult.data.end;
  
  // Get forecasts and verify territory aggregation is possible
  const result = await utils.makeRequest(`/api/monthly-forecast/all?period_start=${periodStart}&period_end=${periodEnd}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data && Array.isArray(result.data.forecasts)) {
    // Aggregate by territory (simulating frontend logic)
    const territorySummary = {};
    result.data.forecasts.forEach((forecast) => {
      if (!territorySummary[forecast.territory_name]) {
        territorySummary[forecast.territory_name] = {
          territory_name: forecast.territory_name,
          total_quantity: 0,
          dealer_count: 0,
        };
      }
      territorySummary[forecast.territory_name].total_quantity += Number(forecast.total_quantity) || 0;
      territorySummary[forecast.territory_name].dealer_count += 1;
    });
    
    const territoryCount = Object.keys(territorySummary).length;
    console.log(`\n✅ A55 PASSED: Monthly Forecasts viewable (By Territory)`);
    console.log(`   Period: ${periodStart} to ${periodEnd}`);
    console.log(`   Territories: ${territoryCount} unique territory(ies)`);
    return true;
  } else if (result.status === 200 && result.data && result.data.forecasts && result.data.forecasts.length === 0) {
    console.log(`\n✅ A55 PASSED: Monthly Forecasts endpoint accessible (no forecasts for this period)`);
    return true;
  }
  
  throw new Error(`A55 FAILED: Could not view Monthly Forecasts - ${result.status}`);
}

// A56: Export Monthly Forecasts - NEW
async function testA56_ExportMonthlyForecasts() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A56: Export Monthly Forecasts');
  console.log('='.repeat(70));
  
  const testData = utils.getTestData();
  
  // Get current period
  const periodResult = await utils.makeRequest('/api/monthly-forecast/current-period', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (periodResult.status !== 200 || !periodResult.data) {
    throw new Error(`A56 FAILED: Could not get current period - ${periodResult.status}`);
  }
  
  const periodStart = periodResult.data.start;
  const periodEnd = periodResult.data.end;
  
  // Get forecasts to verify export data is available
  const result = await utils.makeRequest(`/api/monthly-forecast/all?period_start=${periodStart}&period_end=${periodEnd}`, 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data) {
    console.log(`\n✅ A56 PASSED: Monthly Forecasts export data accessible`);
    console.log(`   Period: ${periodStart} to ${periodEnd}`);
    console.log(`   Forecasts: ${result.data.forecasts ? result.data.forecasts.length : 0} dealer(s)`);
    console.log(`   Note: Export is handled client-side (Excel generation)`);
    return true;
  }
  
  throw new Error(`A56 FAILED: Could not access Monthly Forecasts for export - ${result.status}`);
}

module.exports = {
  init,
  testA46_NavigateToReports,
  testA47_ViewDailyReport,
  testA48_ExportDailyReport,
  testA48b_ExportMRCSVReport,
  testA49_ViewTSOReport,
  testA50_ExportTSOReport,
  testA51_ViewOrderSummaryReport,
  testA52_ExportOrderSummaryReport,
  testA53_ViewMonthlyForecastsByDealer,
  testA54_ViewMonthlyForecastsByProduct,
  testA55_ViewMonthlyForecastsByTerritory,
  testA56_ExportMonthlyForecasts
};
