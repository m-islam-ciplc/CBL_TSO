/**
 * Generate Excel file with workflow test execution order
 * Usage: node generate_workflow_excel.js
 */

const fs = require('fs');
const path = require('path');

// Test workflow data - Execution order when running "all"
const workflowData = [
  // Phase 1: Foundation Setup
  { testNum: 1, testName: 'adduser_test - Create random admin, TSO, and dealer users', execOrder: 1, phase: 'Foundation Setup', dependencies: 'None', creates: 'Creates: admin/TSO/dealer users', notes: '' },
  { testNum: 2, testName: 'import_resources_test - Import dealers, transports, products', execOrder: 2, phase: 'Foundation Setup', dependencies: 'None', creates: 'Creates: dealers/products/transports + assigns products to all dealers', notes: '' },
  
  // Phase 2: TSO Orders (Validation & Creation)
  { testNum: 3, testName: 'TSO tries second order (5 units) - should FAIL', execOrder: 3, phase: 'TSO Orders (Validation)', dependencies: 'Test 2 (quotas/products)', creates: 'Tests: quota validation', notes: '' },
  { testNum: 4, testName: 'Create order with multiple products', execOrder: 4, phase: 'TSO Orders (Creation)', dependencies: 'Test 2 (quotas/products)', creates: 'Creates: Multi-product TSO order ✅', notes: 'CREATES ORDER' },
  { testNum: 5, testName: 'Update quota (add more units)', execOrder: 5, phase: 'TSO Orders (Setup)', dependencies: 'Test 2', creates: 'Updates: quota quantities', notes: '' },
  
  // Phase 3: Order Queries (Before Deletion)
  { testNum: 6, testName: 'Retrieve order history', execOrder: 6, phase: 'Order Queries', dependencies: 'Test 4 (needs orders)', creates: 'Reads: order history', notes: '' },
  { testNum: 7, testName: 'TSO dashboard/reports', execOrder: 7, phase: 'Order Queries', dependencies: 'Test 4 (needs orders)', creates: 'Reads: TSO dashboard data', notes: '' },
  
  // Phase 4: Product Assignments
  { testNum: 9, testName: 'Product assignment to dealer', execOrder: 8, phase: 'Product Assignments', dependencies: 'Test 2 (dealers/products)', creates: 'Creates: product assignment', notes: '' },
  { testNum: 10, testName: 'Monthly forecast submission', execOrder: 9, phase: 'Monthly Forecasts', dependencies: 'Test 9 (product assignment)', creates: 'Creates: monthly forecast', notes: '' },
  { testNum: 44, testName: 'Add random monthly forecasts for all dealers', execOrder: 10, phase: 'Monthly Forecasts', dependencies: 'Test 2 (dealers/products)', creates: 'Creates: forecasts for all dealers', notes: 'MOVED EARLY' },
  { testNum: 11, testName: 'Bulk product assignments', execOrder: 11, phase: 'Product Assignments', dependencies: 'Test 2', creates: 'Creates: multiple product assignments', notes: '' },
  { testNum: 12, testName: 'Category/Application assignment', execOrder: 12, phase: 'Product Assignments', dependencies: 'Test 2', creates: 'Creates: category assignment', notes: '' },
  { testNum: 13, testName: 'Get territories and filter dealers', execOrder: 13, phase: 'Product Assignments', dependencies: 'Test 2', creates: 'Reads: territories and dealers', notes: '' },
  { testNum: 14, testName: 'Get product categories', execOrder: 14, phase: 'Product Assignments', dependencies: 'Test 2', creates: 'Reads: product categories', notes: '' },
  { testNum: 15, testName: 'Delete product assignment', execOrder: 15, phase: 'Product Assignments', dependencies: 'Test 11 (needs assignment)', creates: 'Deletes: product assignment', notes: '' },
  { testNum: 16, testName: 'Get all assignments (Dealer Modal)', execOrder: 16, phase: 'Product Assignments', dependencies: 'Test 9/11 (needs assignments)', creates: 'Reads: all dealer assignments', notes: '' },
  { testNum: 17, testName: 'Mixed bulk assignment', execOrder: 17, phase: 'Product Assignments', dependencies: 'Test 2', creates: 'Creates: mixed assignments', notes: '' },
  
  // Phase 5: Daily Demand Orders
  { testNum: 18, testName: 'Create single-day daily demand order', execOrder: 18, phase: 'Daily Demand Orders', dependencies: 'Test 9 (product assignment)', creates: 'Creates: single-day DD order', notes: '' },
  { testNum: 19, testName: 'Create multi-day daily demand orders', execOrder: 19, phase: 'Daily Demand Orders', dependencies: 'Test 9 (product assignment)', creates: 'Creates: multi-day DD orders', notes: '' },
  { testNum: 20, testName: 'Get available dates with orders', execOrder: 20, phase: 'Daily Demand Reports', dependencies: 'Test 18/19 (needs orders)', creates: 'Reads: available dates', notes: '' },
  { testNum: 21, testName: 'Get orders for a specific date', execOrder: 21, phase: 'Daily Demand Reports', dependencies: 'Test 18/19 (needs orders)', creates: 'Reads: orders for date', notes: '' },
  { testNum: 22, testName: 'Get orders for a date range', execOrder: 22, phase: 'Daily Demand Reports', dependencies: 'Test 18/19 (needs orders)', creates: 'Reads: orders for range', notes: '' },
  { testNum: 23, testName: 'Generate Excel report for a date', execOrder: 23, phase: 'Daily Demand Reports', dependencies: 'Test 18/19 (needs orders)', creates: 'Generates: Excel report', notes: '' },
  { testNum: 24, testName: 'Generate Excel report for a date range', execOrder: 24, phase: 'Daily Demand Reports', dependencies: 'Test 18/19 (needs orders)', creates: 'Generates: Excel report range', notes: '' },
  { testNum: 25, testName: 'Generate pivot-style daily demand report', execOrder: 25, phase: 'Daily Demand Reports', dependencies: 'Test 18/19 (needs orders)', creates: 'Generates: pivot Excel report', notes: '' },
  { testNum: 45, testName: 'Add random daily demand orders for all dealers', execOrder: 26, phase: 'Daily Demand Orders', dependencies: 'Test 2 (dealers/products)', creates: 'Creates: DD orders for all dealers', notes: 'MOVED HERE' },
  
  // Phase 6: Monthly Forecast Queries
  { testNum: 26, testName: 'Get monthly forecast periods', execOrder: 27, phase: 'Monthly Forecast Queries', dependencies: 'Test 10 (needs forecast)', creates: 'Reads: forecast periods', notes: '' },
  { testNum: 27, testName: 'Get monthly forecast data', execOrder: 28, phase: 'Monthly Forecast Queries', dependencies: 'Test 10 (needs forecast)', creates: 'Reads: forecast data', notes: '' },
  
  // Phase 7: TSO Reports (BEFORE Deletion)
  { testNum: 28, testName: 'TSO Get available dates with orders', execOrder: 29, phase: 'TSO Reports (BEFORE DELETION)', dependencies: 'Test 4 (needs orders)', creates: 'Reads: TSO available dates', notes: '' },
  { testNum: 29, testName: 'TSO Get orders for a specific date', execOrder: 30, phase: 'TSO Reports (BEFORE DELETION)', dependencies: 'Test 4 (needs orders)', creates: 'Reads: TSO orders for date', notes: '' },
  { testNum: 30, testName: 'TSO Get orders for a date range', execOrder: 31, phase: 'TSO Reports (BEFORE DELETION)', dependencies: 'Test 4 (needs orders)', creates: 'Reads: TSO orders for range', notes: '' },
  { testNum: 31, testName: 'TSO Generate Excel report for a date range', execOrder: 32, phase: 'TSO Reports (BEFORE DELETION)', dependencies: 'Test 4 (needs orders)', creates: 'Generates: TSO Excel report', notes: '' },
  { testNum: 32, testName: 'TSO Get management report', execOrder: 33, phase: 'TSO Reports (BEFORE DELETION)', dependencies: 'Test 4 (needs orders)', creates: 'Generates: MR CSV report', notes: '' },
  { testNum: 8, testName: 'Delete an order', execOrder: 34, phase: 'Order Deletion', dependencies: 'Test 4 (needs orders)', creates: 'Deletes: TSO order', notes: 'MOVED AFTER REPORTS' },
  
  // Phase 8: Admin Management
  { testNum: 33, testName: 'Admin Create user', execOrder: 35, phase: 'Admin Management', dependencies: 'Test 1 (admin user)', creates: 'Creates: new user', notes: '' },
  { testNum: 34, testName: 'Admin Get all users', execOrder: 36, phase: 'Admin Management', dependencies: 'Test 1 (admin user)', creates: 'Reads: all users', notes: '' },
  { testNum: 35, testName: 'Admin Update user', execOrder: 37, phase: 'Admin Management', dependencies: 'Test 33 (needs user to update)', creates: 'Updates: user data', notes: '' },
  { testNum: 36, testName: 'Admin Create transport', execOrder: 38, phase: 'Admin Management', dependencies: 'Test 1 (admin user)', creates: 'Creates: new transport', notes: '' },
  { testNum: 37, testName: 'Admin Update transport', execOrder: 39, phase: 'Admin Management', dependencies: 'Test 36 (needs transport)', creates: 'Updates: transport data', notes: '' },
  { testNum: 38, testName: 'Admin Get monthly forecast start day setting', execOrder: 40, phase: 'Admin Management', dependencies: 'Test 1 (admin user)', creates: 'Reads: forecast start day', notes: '' },
  { testNum: 39, testName: 'Admin Update monthly forecast start day setting', execOrder: 41, phase: 'Admin Management', dependencies: 'Test 1 (admin user)', creates: 'Updates: forecast start day', notes: '' },
  { testNum: 40, testName: 'Admin Delete user', execOrder: 42, phase: 'Admin Management', dependencies: 'Test 33 (needs user)', creates: 'Deletes: user', notes: '' },
  { testNum: 41, testName: 'Admin Delete transport', execOrder: 43, phase: 'Admin Management', dependencies: 'Test 36 (needs transport)', creates: 'Deletes: transport', notes: '' },
  { testNum: 42, testName: 'Admin Get transport by ID', execOrder: 44, phase: 'Admin Management', dependencies: 'Test 36 (needs transport)', creates: 'Reads: transport by ID', notes: '' },
  
  // Phase 9: Quota Allocation (Comprehensive)
  { testNum: 43, testName: 'quota_allocation_test - Random quota allocation workflows', execOrder: 45, phase: 'Quota Allocation (Comprehensive)', dependencies: 'Test 2 (products/territories)', creates: 'Tests: all quota workflows', notes: '' },
];

// Generate CSV content
function generateCSV() {
  const headers = ['Test Number', 'Test Name', 'Execution Order', 'Phase/Group', 'Dependencies', 'Creates/Needs', 'Notes'];
  const rows = workflowData.map(test => [
    test.testNum.toString(),
    test.testName,
    test.execOrder.toString(),
    test.phase,
    test.dependencies,
    test.creates,
    test.notes
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  return csvContent;
}

// Generate Excel using ExcelJS if available, otherwise CSV
async function generateExcel() {
  try {
    // Try to use ExcelJS from backend
    const exceljsPath = path.join(__dirname, '../../backend/node_modules/exceljs/dist/exceljs.bare');
    let ExcelJS;
    try {
      ExcelJS = require('../../backend/node_modules/exceljs');
    } catch (e) {
      throw new Error('ExcelJS not found');
    }
    
    if (ExcelJS) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Workflow Execution Order');
      
      // Add header row
      worksheet.addRow(['Test Number', 'Test Name', 'Execution Order', 'Phase/Group', 'Dependencies', 'Creates/Needs', 'Notes']);
      
      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Add data rows
      workflowData.forEach(test => {
        const row = worksheet.addRow([
          test.testNum,
          test.testName,
          test.execOrder,
          test.phase,
          test.dependencies,
          test.creates,
          test.notes
        ]);
        
        // Highlight moved tests
        if (test.notes.includes('MOVED')) {
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
        }
        
        // Highlight order creation
        if (test.creates.includes('CREATES ORDER')) {
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } };
        }
      });
      
      // Set column widths
      worksheet.columns = [
        { width: 12 }, // Test Number
        { width: 60 }, // Test Name
        { width: 16 }, // Execution Order
        { width: 25 }, // Phase/Group
        { width: 30 }, // Dependencies
        { width: 40 }, // Creates/Needs
        { width: 20 }, // Notes
      ];
      
      // Add summary sheet
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.addRow(['Workflow Test Execution Order Summary']);
      summarySheet.addRow([]);
      
      const phases = [...new Set(workflowData.map(t => t.phase))];
      phases.forEach((phase, idx) => {
        const phaseTests = workflowData.filter(t => t.phase === phase);
        summarySheet.addRow([`Phase ${idx + 1}: ${phase}`]);
        summarySheet.addRow(['Execution Order', 'Test Number', 'Test Name']);
        phaseTests.forEach(test => {
          summarySheet.addRow([test.execOrder, test.testNum, test.testName]);
        });
        summarySheet.addRow([]);
      });
      
      // Save file
      const outputPath = path.join(__dirname, 'workflow_execution_order.xlsx');
      await workbook.xlsx.writeFile(outputPath);
      console.log(`✅ Excel file created: ${outputPath}`);
      return outputPath;
    } else {
      throw new Error('ExcelJS not found, using CSV instead');
    }
  } catch (error) {
    // Fallback to CSV
    console.log(`⚠️  ExcelJS not available, generating CSV file instead...`);
    const csvContent = generateCSV();
    const outputPath = path.join(__dirname, 'workflow_execution_order.csv');
    fs.writeFileSync(outputPath, csvContent, 'utf8');
    console.log(`✅ CSV file created: ${outputPath}`);
    console.log(`   (You can open this in Excel and save as .xlsx)`);
    return outputPath;
  }
}

// Run
generateExcel().catch(console.error);

