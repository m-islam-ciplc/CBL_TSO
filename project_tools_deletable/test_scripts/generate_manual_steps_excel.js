/**
 * Generate Excel file with all manual user steps organized by role in separate worksheets
 * Usage: node generate_manual_steps_excel.js
 */

const ExcelJS = require('../../backend/node_modules/exceljs');

// All manual steps organized by role
const manualSteps = {
  ADMIN: [
    { stepNumber: 'A1', stepName: 'Login', action: 'Type username/password, click Login button' },
    { stepNumber: 'A2', stepName: 'Navigate to Dashboard', action: 'Click menu (or auto on login)' },
    { stepNumber: 'A3', stepName: 'Navigate to Settings', action: 'Click Settings menu' },
    { stepNumber: 'A4', stepName: 'Switch to Manage Users tab', action: 'Click Manage Users tab' },
    { stepNumber: 'A5', stepName: 'Filter users by role', action: 'Select role from filter dropdown' },
    { stepNumber: 'A6', stepName: 'Sort users', action: 'Click column header to sort' },
    { stepNumber: 'A7', stepName: 'Create new user', action: 'Click Add User button, fill form, click Submit' },
    { stepNumber: 'A8', stepName: 'Edit user', action: 'Click Edit button, modify fields, click Submit' },
    { stepNumber: 'A9', stepName: 'Delete user', action: 'Click Delete button, confirm deletion' },
    { stepNumber: 'A10', stepName: 'Activate/Deactivate user', action: 'Edit user and toggle is_active status' },
    { stepNumber: 'A11', stepName: 'Switch to Manage Dealers tab', action: 'Click Manage Dealers tab' },
    { stepNumber: 'A12', stepName: 'Search dealers', action: 'Enter search term in search field' },
    { stepNumber: 'A13', stepName: 'Filter dealers by territory', action: 'Select territory from filter dropdown' },
    { stepNumber: 'A14', stepName: 'Import dealers from Excel', action: 'Click Import Dealers button, select Excel file, click Upload' },
    { stepNumber: 'A15', stepName: 'Export dealers to Excel', action: 'Click Export to Excel button' },
    { stepNumber: 'A16', stepName: 'View dealer details', action: 'Click View Details button on dealer row' },
    { stepNumber: 'A17', stepName: 'Assign product to dealer', action: 'Expand dealer row, select product, click Add Assignment' },
    { stepNumber: 'A18', stepName: 'Assign multiple products to dealer', action: 'Expand dealer row, select multiple products, click Add Assignment' },
    { stepNumber: 'A19', stepName: 'Assign category/application to dealer', action: 'Expand dealer row, select category/application, click Add Assignment' },
    { stepNumber: 'A20', stepName: 'Remove product assignment', action: 'Expand dealer row, click Delete button on assignment' },
    { stepNumber: 'A21', stepName: 'Switch to Manage Products tab', action: 'Click Manage Products tab' },
    { stepNumber: 'A22', stepName: 'Search products', action: 'Enter search term in search field' },
    { stepNumber: 'A23', stepName: 'Filter products by category', action: 'Select category from filter dropdown' },
    { stepNumber: 'A24', stepName: 'Import products from Excel', action: 'Click Import Products button, select Excel file, click Upload' },
    { stepNumber: 'A25', stepName: 'Export products to Excel', action: 'Click Export to Excel button' },
    { stepNumber: 'A26', stepName: 'Switch to Manage Transports tab', action: 'Click Manage Transports tab' },
    { stepNumber: 'A27', stepName: 'Create new transport', action: 'Click Add Transport button, fill form, click Submit' },
    { stepNumber: 'A28', stepName: 'Edit transport', action: 'Click Edit button, modify fields, click Submit' },
    { stepNumber: 'A29', stepName: 'Delete transport', action: 'Click Delete button, confirm deletion' },
    { stepNumber: 'A30', stepName: 'Import transports from Excel', action: 'Click Import Transports button, select Excel file, click Upload' },
    { stepNumber: 'A31', stepName: 'Navigate to Manage Quotas', action: 'Click Manage Quotas menu' },
    { stepNumber: 'A32', stepName: 'Select date for quota allocation', action: 'Select date from date picker' },
    { stepNumber: 'A34', stepName: 'Search products for quota', action: 'Type product name/code in search field' },
    { stepNumber: 'A35', stepName: 'Select products for quota allocation', action: 'Select products from autocomplete dropdown' },
    { stepNumber: 'A36', stepName: 'Select territories for quota allocation', action: 'Select territories from autocomplete dropdown' },
    { stepNumber: 'A37', stepName: 'Enter quota quantity', action: 'Enter quantity in InputNumber field' },
    { stepNumber: 'A38', stepName: 'Bulk allocate quotas', action: 'Select products, territories, enter quantity, click Allocate button' },
    { stepNumber: 'A39', stepName: 'Update existing quota', action: 'Click Edit button on quota row, enter new quantity, click Update' },
    { stepNumber: 'A40', stepName: 'Delete quota', action: 'Click Delete button on quota row, confirm deletion' },
    { stepNumber: 'A41', stepName: 'View quota history', action: 'Click History tab, select date' },
    { stepNumber: 'A42', stepName: 'View TSO quota view', action: 'Click TSO View tab' },
    { stepNumber: 'A43', stepName: 'Switch to Admin Settings tab', action: 'Click Admin Settings tab' },
    { stepNumber: 'A45', stepName: 'Update monthly forecast start day', action: 'Select new day, click Update button' },
    { stepNumber: 'A46', stepName: 'Navigate to Reports', action: 'Click Reports menu' },
    { stepNumber: 'A47', stepName: 'View Daily Report', action: 'Auto (defaults to this, but navigation is manual)' },
    { stepNumber: 'A48', stepName: 'Filter daily report by date', action: 'Select date from date picker' },
    { stepNumber: 'A49', stepName: 'Filter daily report by dealer', action: 'Select dealer from dropdown' },
    { stepNumber: 'A50', stepName: 'View order details', action: 'Click expand button on order row' },
    { stepNumber: 'A51', stepName: 'Navigate to Placed Orders', action: 'Click Placed Orders menu' },
    { stepNumber: 'A52', stepName: 'Filter orders by date', action: 'Select date from date picker' },
    { stepNumber: 'A53', stepName: 'Filter orders by dealer', action: 'Select dealer from dropdown' },
    { stepNumber: 'A54', stepName: 'Filter orders by order type', action: 'Select order type from dropdown' },
    { stepNumber: 'A55', stepName: 'Search orders', action: 'Enter search term in search field' },
    { stepNumber: 'A56', stepName: 'View order details', action: 'Click on order row to expand details' },
    { stepNumber: 'A57', stepName: 'Logout', action: 'Click Logout button in header' },
  ],
  TSO: [
    { stepNumber: 'T1', stepName: 'Login', action: 'Type username/password, click Login button' },
    { stepNumber: 'T2', stepName: 'Navigate to TSO Dashboard', action: 'Click Dashboard menu (or auto on login)' },
    { stepNumber: 'T3', stepName: 'Navigate to New Orders', action: 'Click New Orders menu' },
    { stepNumber: 'T4', stepName: 'Select order type', action: 'Select from order type dropdown (SO auto-selected, but can change)' },
    { stepNumber: 'T5', stepName: 'Select warehouse', action: 'Select from warehouse dropdown' },
    { stepNumber: 'T7', stepName: 'Select dealer', action: 'Select dealer from filtered dropdown' },
    { stepNumber: 'T8', stepName: 'Search products', action: 'Type product name/code in search field' },
    { stepNumber: 'T10', stepName: 'Add product to order', action: 'Select product, enter quantity, click Add button' },
    { stepNumber: 'T11', stepName: 'Add multiple products', action: 'Repeat add product process for each product' },
    { stepNumber: 'T12', stepName: 'Modify product quantity', action: 'Edit quantity in InputNumber field' },
    { stepNumber: 'T13', stepName: 'Remove product', action: 'Click Remove button on product row' },
    { stepNumber: 'T15', stepName: 'Submit order', action: 'Click Submit Order button' },
    { stepNumber: 'T16', stepName: 'Navigate to Review Orders', action: 'Click Review Orders menu' },
    { stepNumber: 'T17', stepName: 'Navigate to Placed Orders', action: 'Click Placed Orders menu' },
    { stepNumber: 'T18', stepName: 'Filter orders by date', action: 'Select date from date picker' },
    { stepNumber: 'T19', stepName: 'Filter orders by dealer', action: 'Select dealer from dropdown' },
    { stepNumber: 'T20', stepName: 'Filter orders by order type', action: 'Select order type from dropdown' },
    { stepNumber: 'T21', stepName: 'Search orders', action: 'Enter search term in search field' },
    { stepNumber: 'T22', stepName: 'View order details', action: 'Click on order row to expand details' },
    { stepNumber: 'T23', stepName: 'Delete order', action: 'Click Delete button on order row, confirm' },
    { stepNumber: 'T24', stepName: 'Navigate to My Reports', action: 'Click My Reports menu' },
    { stepNumber: 'T25', stepName: 'View available dates', action: 'Automatic (view only, but navigation is manual)' },
    { stepNumber: 'T26', stepName: 'View orders for specific date', action: 'Select date from date picker' },
    { stepNumber: 'T27', stepName: 'View orders for date range', action: 'Select start and end dates' },
    { stepNumber: 'T28', stepName: 'Export to Excel (single date)', action: 'Select date, click Export to Excel button' },
    { stepNumber: 'T29', stepName: 'Export to Excel (date range)', action: 'Select date range, click Export to Excel button' },
    { stepNumber: 'T30', stepName: 'Generate Management Report (CSV)', action: 'Select date, click Generate MR Report button' },
    { stepNumber: 'T31', stepName: 'Logout', action: 'Click Logout button in header' },
  ],
  DEALER: [
    { stepNumber: 'D1', stepName: 'Login', action: 'Type username/password, click Login button' },
    { stepNumber: 'D2', stepName: 'Navigate to Monthly Forecast', action: 'Click Monthly Forecast menu' },
    { stepNumber: 'D3', stepName: 'Select forecast period', action: 'Select period from dropdown' },
    { stepNumber: 'D5', stepName: 'Enter forecast quantities', action: 'Enter quantity in InputNumber field for each product' },
    { stepNumber: 'D6', stepName: 'Save draft forecast', action: 'Click Save Draft button' },
    { stepNumber: 'D7', stepName: 'Submit forecast', action: 'Click Submit Forecast button' },
    { stepNumber: 'D8', stepName: 'Clear forecast', action: 'Click Clear button' },
    { stepNumber: 'D9', stepName: 'Navigate to Daily Demand', action: 'Click Daily Demand menu' },
    { stepNumber: 'D10', stepName: 'Create single-day demand order', action: 'Select date, add products with quantities, click Create Order' },
    { stepNumber: 'D11', stepName: 'Create multi-day demand order', action: 'Select multiple dates, add products with quantities for each date, click Create Orders' },
    { stepNumber: 'D12', stepName: 'Select date for order', action: 'Select date from calendar widget' },
    { stepNumber: 'D13', stepName: 'Add product to date', action: 'Click Add button for a date, select product, enter quantity' },
    { stepNumber: 'D14', stepName: 'Modify product quantity', action: 'Edit quantity in InputNumber field' },
    { stepNumber: 'D15', stepName: 'Navigate to My Reports', action: 'Click My Reports menu' },
    { stepNumber: 'D16', stepName: 'Switch to Daily Demand Orders tab', action: 'Click Daily Demand Orders tab' },
    { stepNumber: 'D17', stepName: 'Filter orders by date', action: 'Select date from date picker' },
    { stepNumber: 'D18', stepName: 'Filter orders by date range', action: 'Select start and end dates from date pickers' },
    { stepNumber: 'D19', stepName: 'Expand order details', action: 'Click View Details button on order row' },
    { stepNumber: 'D20', stepName: 'Export Daily Demand Orders to Excel', action: 'Click Export to Excel button' },
    { stepNumber: 'D21', stepName: 'Export Daily Demand Orders (Range) to Excel', action: 'Select date range, click Export to Excel button' },
    { stepNumber: 'D22', stepName: 'Switch to Monthly Forecasts tab', action: 'Click Monthly Forecasts tab' },
    { stepNumber: 'D23', stepName: 'Export Monthly Forecasts to Excel', action: 'Click Export to Excel button' },
    { stepNumber: 'D24', stepName: 'Logout', action: 'Click Logout button in header' },
  ]
};

// Generate Excel file
async function generateExcel() {
  const workbook = new ExcelJS.Workbook();
  const path = require('path');
  
  // Create summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.addRow(['Manual User Steps Summary']);
  summarySheet.addRow([]);
  summarySheet.addRow(['Role', 'Total Steps']);
  summarySheet.addRow(['Admin', manualSteps.ADMIN.length]);
  summarySheet.addRow(['TSO', manualSteps.TSO.length]);
  summarySheet.addRow(['Dealer', manualSteps.DEALER.length]);
  summarySheet.addRow(['TOTAL', manualSteps.ADMIN.length + manualSteps.TSO.length + manualSteps.DEALER.length]);
  
  // Style summary header
  const summaryHeaderRow = summarySheet.getRow(3);
  summaryHeaderRow.font = { bold: true };
  summaryHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  
  // Set summary column widths
  summarySheet.columns = [
    { width: 20 },
    { width: 15 }
  ];
  
  // Create worksheet for each role
  const roles = ['ADMIN', 'TSO', 'DEALER'];
  
  roles.forEach(role => {
    const worksheet = workbook.addWorksheet(role);
    const steps = manualSteps[role];
    
    // Add header row
    worksheet.addRow(['Step Number', 'Step Name', 'Manual Action Required']);
    
    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Add data rows
    steps.forEach(step => {
      const row = worksheet.addRow([
        step.stepNumber,
        step.stepName,
        step.action
      ]);
      
      // Alternate row colors for readability
      if (row.number % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
      }
    });
    
    // Set column widths
    worksheet.columns = [
      { width: 15 }, // Step Number
      { width: 50 }, // Step Name
      { width: 80 }  // Manual Action Required
    ];
    
    // Freeze header row
    worksheet.views = [
      { state: 'frozen', ySplit: 1 }
    ];
  });
  
  // Save file
  const outputPath = path.join(__dirname, 'Manual_Steps.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`✅ Excel file created: ${outputPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   - Admin: ${manualSteps.ADMIN.length} steps`);
  console.log(`   - TSO: ${manualSteps.TSO.length} steps`);
  console.log(`   - Dealer: ${manualSteps.DEALER.length} steps`);
  console.log(`   - Total: ${manualSteps.ADMIN.length + manualSteps.TSO.length + manualSteps.DEALER.length} steps`);
  console.log(`\n📋 Worksheets:`);
  console.log(`   1. Summary`);
  console.log(`   2. ADMIN (${manualSteps.ADMIN.length} steps)`);
  console.log(`   3. TSO (${manualSteps.TSO.length} steps)`);
  console.log(`   4. DEALER (${manualSteps.DEALER.length} steps)`);
}

generateExcel().catch(console.error);

