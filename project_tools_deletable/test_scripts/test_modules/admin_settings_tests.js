/**
 * Admin Settings Tests (A43-A45)
 */

let utils = {};

function init(sharedUtils) {
  utils = sharedUtils;
}

// A43: View settings
async function testA43_ViewSettings() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A43: View settings');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  const result = await utils.makeRequest('/api/settings/monthly-forecast-start-day', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data) {
    console.log(`\n✅ A43 PASSED: Settings viewable`);
    console.log(`   Forecast start day: ${result.data.start_day || result.data.value || 'N/A'}`);
    return true;
  }
  
  throw new Error(`A43 FAILED: Could not view settings - ${result.status}`);
}

// A44: Update forecast start day
async function testA44_UpdateForecastStartDay() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A44: Update forecast start day');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  
  // Get current setting
  const getResult = await utils.makeRequest('/api/settings/monthly-forecast-start-day', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  const currentStartDay = getResult.status === 200 && getResult.data ? (getResult.data.start_day || getResult.data.value || 1) : 1;
  const newStartDay = currentStartDay === 1 ? 15 : 1;
  
  const result = await utils.makeRequest('/api/settings/monthly-forecast-start-day', 'PUT', {
    start_day: newStartDay
  }, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data) {
    // Restore original value
    await utils.makeRequest('/api/settings/monthly-forecast-start-day', 'PUT', {
      start_day: currentStartDay
    }, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    
    console.log(`\n✅ A44 PASSED: Forecast start day updated`);
    console.log(`   Changed from day ${currentStartDay} to day ${newStartDay} (restored)`);
    return true;
  }
  
  throw new Error(`A44 FAILED: Update failed - ${result.status} - ${JSON.stringify(result.data)}`);
}

// A45: View forecast start day
async function testA45_ViewForecastStartDay() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A45: View forecast start day');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  const result = await utils.makeRequest('/api/settings/monthly-forecast-start-day', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data) {
    console.log(`\n✅ A45 PASSED: Forecast start day viewable`);
    console.log(`   Start day: ${result.data.start_day || result.data.value || 'N/A'}`);
    return true;
  }
  
  throw new Error(`A45 FAILED: Could not view forecast start day - ${result.status}`);
}

module.exports = {
  init,
  testA43_ViewSettings,
  testA44_UpdateForecastStartDay,
  testA45_ViewForecastStartDay
};
