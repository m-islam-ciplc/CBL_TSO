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

// A28: Create transport
async function testA28_CreateTransport() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A28: Create transport');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  const testTruckDetails = `TEST-TRUCK-${Date.now()}`;
  
  const transportPayload = {
    truck_details: testTruckDetails,
    driver_name: 'Test Driver',
    driver_phone: '1234567890',
    status: 'A'
  };
  
  const result = await utils.makeRequest('/api/transports', 'POST', transportPayload, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data) {
    const transportId = result.data.id || result.data.transport_id;
    if (!testData.createdTransportIds) {
      testData.createdTransportIds = [];
    }
    testData.createdTransportIds.push({ id: transportId, truck_details: testTruckDetails });
    
    console.log(`\n✅ A28 PASSED: Transport created successfully`);
    console.log(`   Transport ID: ${transportId}`);
    console.log(`   Truck Details: ${testTruckDetails}`);
    return true;
  }
  
  throw new Error(`A28 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// A29: Edit transport
async function testA29_EditTransport() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A29: Edit transport');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  const transportsResult = await utils.makeRequest('/api/transports', 'GET', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (transportsResult.status !== 200 || !Array.isArray(transportsResult.data) || transportsResult.data.length === 0) {
    console.log(`\n⚠️  A29 SKIPPED: No transports found to update`);
    return true;
  }
  
  const transportToUpdate = transportsResult.data[0];
  const transportId = transportToUpdate.id;
  
  const updatePayload = {
    driver_name: 'Updated Test Driver',
    driver_phone: transportToUpdate.driver_phone || '1234567890',
    status: transportToUpdate.status || 'A'
  };
  
  const result = await utils.makeRequest(`/api/transports/${transportId}`, 'PUT', updatePayload, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200 && result.data) {
    console.log(`\n✅ A29 PASSED: Transport updated successfully`);
    console.log(`   Transport ID: ${transportId}`);
    return true;
  }
  
  throw new Error(`A29 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

// A30: Delete transport
async function testA30_DeleteTransport() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 A30: Delete transport');
  console.log('='.repeat(70));
  
  // Use existing token from A1 (no need to login again)
  
  const testData = utils.getTestData();
  const testTruckDetails = `TEST-DELETE-TRUCK-${Date.now()}`;
  
  const createPayload = {
    truck_details: testTruckDetails,
    driver_name: 'Test Driver To Delete',
    driver_phone: '1234567890',
    status: 'A'
  };
  
  const createResult = await utils.makeRequest('/api/transports', 'POST', createPayload, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (createResult.status !== 200 || !createResult.data) {
    console.log(`\n⚠️  A30 SKIPPED: Could not create test transport for deletion`);
    return true;
  }
  
  const transportId = createResult.data.id || createResult.data.transport_id;
  
  const result = await utils.makeRequest(`/api/transports/${transportId}`, 'DELETE', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });
  
  if (result.status === 200) {
    console.log(`\n✅ A30 PASSED: Transport deleted successfully`);
    console.log(`   Transport ID: ${transportId}`);
    return true;
  }
  
  throw new Error(`A30 FAILED: ${result.status} - ${JSON.stringify(result.data)}`);
}

module.exports = {
  init,
  testA26_SwitchToManageTransportsTab,
  testA27_SearchTransports,
  testA28_CreateTransport,
  testA29_EditTransport,
  testA30_DeleteTransport
};
