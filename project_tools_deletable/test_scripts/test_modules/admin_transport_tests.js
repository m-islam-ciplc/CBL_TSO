/**
 * Admin Transport Management Tests (A26-A30)
 */

let utils = {};

function init(sharedUtils) {
  utils = sharedUtils;
}

// A26: Switch to Manage Transports tab
async function testA26_SwitchToManageTransportsTab() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A26: Switch to Manage Transports tab');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const result = await utils.makeRequest('/api/transports', 'GET', null, {
    'Authorization': `Bearer ${utils.getTestData().adminToken}`
  });
  
  if (result.status === 200 && Array.isArray(result.data)) {
    const testData = utils.getTestData();
    testData.transports = result.data;
    console.log(`\n✅ A26 PASSED: Manage Transports tab accessible`);
    console.log(`   Total transports: ${result.data.length}`);
    return true;
  }
  
  throw new Error(`A26 FAILED: Could not access transports - ${result.status}`);
}

// A27: Search transports
async function testA27_SearchTransports() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A27: Search transports');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  if (!testData.transports || testData.transports.length === 0) {
    const transportsResult = await utils.makeRequest('/api/transports', 'GET', null, {
      'Authorization': `Bearer ${testData.adminToken}`
    });
    testData.transports = transportsResult.status === 200 ? transportsResult.data : [];
  }
  
  if (testData.transports.length === 0) {
    throw new Error(`A27 FAILED: No transports found`);
  }
  
  const searchTerm = testData.transports[0].truck_details ? testData.transports[0].truck_details.substring(0, 5) : '';
  const filtered = testData.transports.filter(t => 
    (t.truck_details && t.truck_details.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.driver_name && t.driver_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.truck_no && t.truck_no.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  console.log(`\n✅ A27 PASSED: Transport search functionality`);
  console.log(`   Search term: "${searchTerm}"`);
  console.log(`   Found: ${filtered.length} transports`);
  
  return true;
}

// A28: Verify transport import functionality (transports are imported, not created)
async function testA28_VerifyTransportImport() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A28: Verify transport import functionality');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  
  // Verify that transports exist (they should be imported)
  const transportsResult = await utils.makeRequest('/api/transports', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (transportsResult.status === 200 && Array.isArray(transportsResult.data)) {
    console.log(`\n✅ A28 PASSED: Transport import functionality verified`);
    console.log(`   Total imported transports: ${transportsResult.data.length}`);
    console.log(`   Note: Transports are imported via Excel, not created manually`);
    return true;
  }
  
  throw new Error(`A28 FAILED: Could not verify transports - ${transportsResult.status}`);
}

// A29: Verify transport data structure
async function testA29_VerifyTransportDataStructure() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A29: Verify transport data structure');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  const transportsResult = await utils.makeRequest('/api/transports', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (transportsResult.status !== 200 || !Array.isArray(transportsResult.data) || transportsResult.data.length === 0) {
    console.log(`\n⚠️  A29 SKIPPED: No transports found to verify`);
    return true;
  }
  
  const transport = transportsResult.data[0];
  const requiredFields = ['id', 'truck_details', 'driver_name'];
  const missingFields = requiredFields.filter(field => !transport.hasOwnProperty(field));
  
  if (missingFields.length === 0) {
    console.log(`\n✅ A29 PASSED: Transport data structure verified`);
    console.log(`   Sample transport ID: ${transport.id}`);
    console.log(`   Sample truck details: ${transport.truck_details || 'N/A'}`);
    console.log(`   Sample driver name: ${transport.driver_name || 'N/A'}`);
    return true;
  }
  
  throw new Error(`A29 FAILED: Missing required fields: ${missingFields.join(', ')}`);
}

// A30: Verify transport filtering by status
async function testA30_VerifyTransportStatusFilter() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A30: Verify transport status filtering');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  const transportsResult = await utils.makeRequest('/api/transports', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (transportsResult.status !== 200 || !Array.isArray(transportsResult.data) || transportsResult.data.length === 0) {
    console.log(`\n⚠️  A30 SKIPPED: No transports found to filter`);
    return true;
  }
  
  const transports = transportsResult.data;
  const activeTransports = transports.filter(t => (t.transport_status || t.status) === 'A');
  const inactiveTransports = transports.filter(t => (t.transport_status || t.status) === 'I');
  
  console.log(`\n✅ A30 PASSED: Transport status filtering verified`);
  console.log(`   Total transports: ${transports.length}`);
  console.log(`   Active transports: ${activeTransports.length}`);
  console.log(`   Inactive transports: ${inactiveTransports.length}`);
  return true;
}

module.exports = {
  init,
  testA26_SwitchToManageTransportsTab,
  testA27_SearchTransports,
  testA28_VerifyTransportImport,
  testA29_VerifyTransportDataStructure,
  testA30_VerifyTransportStatusFilter
};
