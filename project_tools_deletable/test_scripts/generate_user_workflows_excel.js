/**
 * Generate Excel file with all user workflows/steps in the application
 * Usage: node generate_user_workflows_excel.js
 */

const ExcelJS = require('../../backend/node_modules/exceljs');

// All user workflows organized by role
const userWorkflows = [
  // ===== DEALER WORKFLOWS =====
  {
    role: 'DEALER',
    category: 'Authentication',
    stepNumber: 'D1',
    stepName: 'Login to the system',
    description: 'Enter username and password to access dealer portal',
    page: 'Login',
    action: 'Enter credentials and click Login button',
    apiEndpoint: '/api/auth/login',
    creates: 'Session/token',
    prerequisites: 'Valid dealer account must exist'
  },
  {
    role: 'DEALER',
    category: 'Monthly Forecast',
    stepNumber: 'D2',
    stepName: 'View Monthly Forecast page',
    description: 'See available forecast periods and current period information',
    page: 'Monthly Forecast',
    action: 'Navigate to Monthly Forecast menu',
    apiEndpoint: '/api/monthly-forecast/dealer/:dealerId/periods',
    creates: 'None (view only)',
    prerequisites: 'Must be logged in as dealer'
  },
  {
    role: 'DEALER',
    category: 'Monthly Forecast',
    stepNumber: 'D3',
    stepName: 'Select forecast period',
    description: 'Choose which monthly period to view or edit forecast for',
    page: 'Monthly Forecast',
    action: 'Select period from dropdown',
    apiEndpoint: '/api/monthly-forecast/dealer/:dealerId/periods',
    creates: 'None',
    prerequisites: 'Periods must be available'
  },
  {
    role: 'DEALER',
    category: 'Monthly Forecast',
    stepNumber: 'D4',
    stepName: 'View assigned products',
    description: 'See all products assigned to the dealer for forecasting',
    page: 'Monthly Forecast',
    action: 'Products load automatically when period selected',
    apiEndpoint: '/api/products?dealer_id=:dealerId',
    creates: 'None (view only)',
    prerequisites: 'Products must be assigned to dealer'
  },
  {
    role: 'DEALER',
    category: 'Monthly Forecast',
    stepNumber: 'D5',
    stepName: 'Enter forecast quantities',
    description: 'Input expected quantities for each product for the selected period',
    page: 'Monthly Forecast',
    action: 'Enter quantity in InputNumber field for each product',
    apiEndpoint: 'None (local state)',
    creates: 'Forecast data in memory',
    prerequisites: 'Products must be loaded'
  },
  {
    role: 'DEALER',
    category: 'Monthly Forecast',
    stepNumber: 'D6',
    stepName: 'Save draft forecast',
    description: 'Save forecast without submitting (can edit later)',
    page: 'Monthly Forecast',
    action: 'Click Save Draft button',
    apiEndpoint: 'PUT /api/monthly-forecast',
    creates: 'Draft forecast record in database',
    prerequisites: 'Must have entered quantities'
  },
  {
    role: 'DEALER',
    category: 'Monthly Forecast',
    stepNumber: 'D7',
    stepName: 'Submit forecast',
    description: 'Submit finalized forecast (cannot edit after submission)',
    page: 'Monthly Forecast',
    action: 'Click Submit Forecast button',
    apiEndpoint: 'PUT /api/monthly-forecast (with is_submitted=true)',
    creates: 'Submitted forecast record in database',
    prerequisites: 'Must have entered quantities, not already submitted'
  },
  {
    role: 'DEALER',
    category: 'Monthly Forecast',
    stepNumber: 'D8',
    stepName: 'Clear forecast',
    description: 'Clear all entered quantities for current period',
    page: 'Monthly Forecast',
    action: 'Click Clear button',
    apiEndpoint: 'None (local state)',
    creates: 'None',
    prerequisites: 'Must have entered quantities'
  },
  {
    role: 'DEALER',
    category: 'Daily Demand',
    stepNumber: 'D9',
    stepName: 'View Daily Demand page',
    description: 'Access the daily demand order creation interface',
    page: 'Daily Demand',
    action: 'Navigate to Daily Demand menu',
    apiEndpoint: 'None',
    creates: 'None',
    prerequisites: 'Must be logged in as dealer'
  },
  {
    role: 'DEALER',
    category: 'Daily Demand',
    stepNumber: 'D10',
    stepName: 'Create single-day demand order',
    description: 'Create a daily demand order for one specific date',
    page: 'Daily Demand',
    action: 'Select date, add products with quantities, click Create Order',
    apiEndpoint: 'POST /api/orders',
    creates: 'Order with order_date set to selected date',
    prerequisites: 'Products must be assigned to dealer'
  },
  {
    role: 'DEALER',
    category: 'Daily Demand',
    stepNumber: 'D11',
    stepName: 'Create multi-day demand order',
    description: 'Create daily demand orders for multiple dates at once',
    page: 'Daily Demand',
    action: 'Select multiple dates, add products with quantities for each date, click Create Orders',
    apiEndpoint: 'POST /api/orders (multiple orders)',
    creates: 'Multiple orders with different order_date values',
    prerequisites: 'Products must be assigned to dealer'
  },
  {
    role: 'DEALER',
    category: 'Daily Demand',
    stepNumber: 'D12',
    stepName: 'Select date for order',
    description: 'Choose which date the demand order is for',
    page: 'Daily Demand',
    action: 'Select date from calendar widget',
    apiEndpoint: '/api/orders/dealer/available-dates',
    creates: 'None',
    prerequisites: 'Calendar widget loads available dates'
  },
  {
    role: 'DEALER',
    category: 'Daily Demand',
    stepNumber: 'D13',
    stepName: 'Add product to date',
    description: 'Add a product with quantity to a specific date in multi-day order',
    page: 'Daily Demand',
    action: 'Click Add button for a date, select product, enter quantity',
    apiEndpoint: 'None (local state)',
    creates: 'Product in order items list for that date',
    prerequisites: 'Date must be selected'
  },
  {
    role: 'DEALER',
    category: 'Daily Demand',
    stepNumber: 'D14',
    stepName: 'Modify product quantity',
    description: 'Change the quantity of a product in an order',
    page: 'Daily Demand',
    action: 'Edit quantity in InputNumber field',
    apiEndpoint: 'None (local state)',
    creates: 'Updated quantity in memory',
    prerequisites: 'Product must be in order items'
  },
  {
    role: 'DEALER',
    category: 'Reports',
    stepNumber: 'D15',
    stepName: 'View My Reports page',
    description: 'Access dealer reports (Daily Demand Orders and Monthly Forecasts)',
    page: 'My Reports',
    action: 'Navigate to My Reports menu',
    apiEndpoint: 'None',
    creates: 'None',
    prerequisites: 'Must be logged in as dealer'
  },
  {
    role: 'DEALER',
    category: 'Reports',
    stepNumber: 'D16',
    stepName: 'View Daily Demand Orders tab',
    description: 'See all daily demand orders with filtering options',
    page: 'My Reports → Daily Demand Orders',
    action: 'Click Daily Demand Orders tab',
    apiEndpoint: '/api/orders/dealer/available-dates',
    creates: 'None (view only)',
    prerequisites: 'Must have created orders'
  },
  {
    role: 'DEALER',
    category: 'Reports',
    stepNumber: 'D17',
    stepName: 'Filter orders by date',
    description: 'View orders for a specific date',
    page: 'My Reports → Daily Demand Orders',
    action: 'Select date from date picker',
    apiEndpoint: '/api/orders/dealer/date',
    creates: 'None (view only)',
    prerequisites: 'Must have orders for that date'
  },
  {
    role: 'DEALER',
    category: 'Reports',
    stepNumber: 'D18',
    stepName: 'View orders for date range',
    description: 'View orders across multiple dates',
    page: 'My Reports → Daily Demand Orders',
    action: 'Select start and end dates from date pickers',
    apiEndpoint: '/api/orders/dealer/range',
    creates: 'None (view only)',
    prerequisites: 'Must have orders in date range'
  },
  {
    role: 'DEALER',
    category: 'Reports',
    stepNumber: 'D19',
    stepName: 'Expand order details',
    description: 'View individual items within an order',
    page: 'My Reports → Daily Demand Orders',
    action: 'Click View Details button on order row',
    apiEndpoint: 'None (uses existing data)',
    creates: 'None (view only)',
    prerequisites: 'Order must be visible in table'
  },
  {
    role: 'DEALER',
    category: 'Reports',
    stepNumber: 'D20',
    stepName: 'Export Daily Demand Orders to Excel',
    description: 'Download orders as Excel file for a single date',
    page: 'My Reports → Daily Demand Orders',
    action: 'Click Export to Excel button',
    apiEndpoint: '/api/orders/dealer/daily-demand-report/:date',
    creates: 'Excel file download',
    prerequisites: 'Must have orders for selected date'
  },
  {
    role: 'DEALER',
    category: 'Reports',
    stepNumber: 'D21',
    stepName: 'Export Daily Demand Orders (Range) to Excel',
    description: 'Download orders as Excel file for a date range',
    page: 'My Reports → Daily Demand Orders',
    action: 'Select date range, click Export to Excel button',
    apiEndpoint: '/api/orders/dealer/daily-demand-report/:date (with range)',
    creates: 'Excel file download with pivot format',
    prerequisites: 'Must have orders in date range'
  },
  {
    role: 'DEALER',
    category: 'Reports',
    stepNumber: 'D22',
    stepName: 'View Monthly Forecasts tab',
    description: 'See all monthly forecasts',
    page: 'My Reports → Monthly Forecasts',
    action: 'Click Monthly Forecasts tab',
    apiEndpoint: '/api/monthly-forecast/dealer/:dealerId',
    creates: 'None (view only)',
    prerequisites: 'Must have submitted forecasts'
  },
  {
    role: 'DEALER',
    category: 'Reports',
    stepNumber: 'D23',
    stepName: 'Export Monthly Forecasts to Excel',
    description: 'Download monthly forecasts as Excel file',
    page: 'My Reports → Monthly Forecasts',
    action: 'Click Export to Excel button',
    apiEndpoint: 'None (frontend Excel generation)',
    creates: 'Excel file download',
    prerequisites: 'Must have forecasts to export'
  },
  {
    role: 'DEALER',
    category: 'Authentication',
    stepNumber: 'D24',
    stepName: 'Logout',
    description: 'End session and return to login page',
    page: 'Any',
    action: 'Click Logout button in header',
    apiEndpoint: 'None (local session clear)',
    creates: 'None',
    prerequisites: 'Must be logged in'
  },

  // ===== TSO WORKFLOWS =====
  {
    role: 'TSO',
    category: 'Authentication',
    stepNumber: 'T1',
    stepName: 'Login to the system',
    description: 'Enter username and password to access TSO portal',
    page: 'Login',
    action: 'Enter credentials and click Login button',
    apiEndpoint: '/api/auth/login',
    creates: 'Session/token',
    prerequisites: 'Valid TSO account must exist'
  },
  {
    role: 'TSO',
    category: 'Dashboard',
    stepNumber: 'T2',
    stepName: 'View TSO Dashboard',
    description: 'See overview of orders, quotas, and statistics',
    page: 'TSO Dashboard',
    action: 'Navigate to Dashboard (default page)',
    apiEndpoint: '/api/orders/tso/my-report/:date',
    creates: 'None (view only)',
    prerequisites: 'Must be logged in as TSO'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T3',
    stepName: 'View New Orders page',
    description: 'Access order creation interface',
    page: 'New Orders',
    action: 'Navigate to New Orders menu',
    apiEndpoint: '/api/order-types, /api/dealers, /api/products, etc.',
    creates: 'None',
    prerequisites: 'Must be logged in as TSO'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T4',
    stepName: 'Select order type',
    description: 'Choose SO (Sales Order) as order type',
    page: 'New Orders',
    action: 'Select from order type dropdown (SO auto-selected)',
    apiEndpoint: '/api/order-types',
    creates: 'None',
    prerequisites: 'Order types must be loaded'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T5',
    stepName: 'Select warehouse',
    description: 'Choose which warehouse to order from',
    page: 'New Orders',
    action: 'Select from warehouse dropdown',
    apiEndpoint: '/api/warehouses',
    creates: 'None',
    prerequisites: 'Warehouses must be loaded'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T6',
    stepName: 'Filter dealers by territory',
    description: 'Filter dealer list to show only dealers in TSO territory',
    page: 'New Orders',
    action: 'Dealers automatically filtered by TSO territory',
    apiEndpoint: '/api/dealers (filtered by territory)',
    creates: 'None',
    prerequisites: 'TSO must have territory assigned'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T7',
    stepName: 'Select dealer',
    description: 'Choose which dealer to create order for',
    page: 'New Orders',
    action: 'Select dealer from filtered dropdown',
    apiEndpoint: 'None',
    creates: 'None',
    prerequisites: 'Dealers must be loaded and filtered'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T8',
    stepName: 'Search products',
    description: 'Search for products to add to order',
    page: 'New Orders',
    action: 'Type product name/code in search field',
    apiEndpoint: '/api/products (with search filter)',
    creates: 'None',
    prerequisites: 'Products must be loaded'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T9',
    stepName: 'View product quotas',
    description: 'See available quota for each product before ordering',
    page: 'New Orders',
    action: 'Quotas displayed automatically when product selected',
    apiEndpoint: '/api/product-caps/tso-today',
    creates: 'None (view only)',
    prerequisites: 'Quotas must be allocated for today'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T10',
    stepName: 'Add product to order',
    description: 'Add a product with quantity to order items',
    page: 'New Orders',
    action: 'Select product, enter quantity, click Add button',
    apiEndpoint: 'None (local state)',
    creates: 'Product in order items list',
    prerequisites: 'Product quota must be available'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T11',
    stepName: 'Add multiple products to order',
    description: 'Add several products to the same order',
    page: 'New Orders',
    action: 'Repeat add product process for each product',
    apiEndpoint: 'None (local state)',
    creates: 'Multiple products in order items list',
    prerequisites: 'Quotas must be available for all products'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T12',
    stepName: 'Modify product quantity in order',
    description: 'Change quantity of a product already in order',
    page: 'New Orders',
    action: 'Edit quantity in InputNumber field',
    apiEndpoint: 'None (local state)',
    creates: 'Updated quantity in memory',
    prerequisites: 'Product must be in order items'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T13',
    stepName: 'Remove product from order',
    description: 'Remove a product from order items',
    page: 'New Orders',
    action: 'Click Remove button on product row',
    apiEndpoint: 'None (local state)',
    creates: 'Product removed from list',
    prerequisites: 'Product must be in order items'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T14',
    stepName: 'Validate order against quota',
    description: 'System checks if order quantity exceeds available quota',
    page: 'New Orders',
    action: 'Automatic validation when submitting order',
    apiEndpoint: '/api/product-caps/tso-today',
    creates: 'Validation result',
    prerequisites: 'Order must have items'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T15',
    stepName: 'Submit order',
    description: 'Create the order and deduct from quotas',
    page: 'New Orders',
    action: 'Click Submit Order button',
    apiEndpoint: 'POST /api/orders',
    creates: 'Order record in database, quota deduction',
    prerequisites: 'Order must pass quota validation'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T16',
    stepName: 'View Review Orders page',
    description: 'Review and manage pending orders before submission',
    page: 'Review Orders',
    action: 'Navigate to Review Orders menu',
    apiEndpoint: 'None',
    creates: 'None',
    prerequisites: 'Must be logged in as TSO'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T17',
    stepName: 'View Placed Orders page',
    description: 'See all submitted orders with filtering and search',
    page: 'Placed Orders',
    action: 'Navigate to Placed Orders menu',
    apiEndpoint: '/api/orders',
    creates: 'None (view only)',
    prerequisites: 'Must be logged in as TSO'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T18',
    stepName: 'Filter orders by date',
    description: 'View orders for a specific date',
    page: 'Placed Orders',
    action: 'Select date from date picker',
    apiEndpoint: '/api/orders (with date filter)',
    creates: 'None (view only)',
    prerequisites: 'Must have orders for that date'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T19',
    stepName: 'Filter orders by dealer',
    description: 'View orders for a specific dealer',
    page: 'Placed Orders',
    action: 'Select dealer from dropdown',
    apiEndpoint: '/api/orders (with dealer filter)',
    creates: 'None (view only)',
    prerequisites: 'Must have orders for that dealer'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T20',
    stepName: 'Filter orders by order type',
    description: 'View orders by type (SO, DD)',
    page: 'Placed Orders',
    action: 'Select order type from dropdown',
    apiEndpoint: '/api/orders (with order_type filter)',
    creates: 'None (view only)',
    prerequisites: 'Must have orders of that type'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T21',
    stepName: 'Search orders',
    description: 'Search orders by order ID or dealer name',
    page: 'Placed Orders',
    action: 'Enter search term in search field',
    apiEndpoint: '/api/orders (with search filter)',
    creates: 'None (view only)',
    prerequisites: 'Orders must exist'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T22',
    stepName: 'View order details',
    description: 'See full details of an order including all items',
    page: 'Placed Orders',
    action: 'Click on order row to expand details',
    apiEndpoint: '/api/orders/:orderId',
    creates: 'None (view only)',
    prerequisites: 'Order must be visible in table'
  },
  {
    role: 'TSO',
    category: 'Orders',
    stepNumber: 'T23',
    stepName: 'Delete order',
    description: 'Remove an order and restore quota',
    page: 'Placed Orders',
    action: 'Click Delete button on order row',
    apiEndpoint: 'DELETE /api/orders/:orderId',
    creates: 'Order deleted, quota restored',
    prerequisites: 'Order must exist and be visible'
  },
  {
    role: 'TSO',
    category: 'Reports',
    stepNumber: 'T24',
    stepName: 'View My Reports page',
    description: 'Access TSO reports and exports',
    page: 'My Reports',
    action: 'Navigate to My Reports menu',
    apiEndpoint: 'None',
    creates: 'None',
    prerequisites: 'Must be logged in as TSO'
  },
  {
    role: 'TSO',
    category: 'Reports',
    stepNumber: 'T25',
    stepName: 'View available dates with orders',
    description: 'See which dates have orders',
    page: 'My Reports',
    action: 'Dates loaded automatically',
    apiEndpoint: '/api/orders/tso/available-dates',
    creates: 'None (view only)',
    prerequisites: 'Must have created orders'
  },
  {
    role: 'TSO',
    category: 'Reports',
    stepNumber: 'T26',
    stepName: 'View orders for specific date',
    description: 'See all orders for a selected date',
    page: 'My Reports',
    action: 'Select date from date picker',
    apiEndpoint: '/api/orders/tso/date/:date',
    creates: 'None (view only)',
    prerequisites: 'Must have orders for that date'
  },
  {
    role: 'TSO',
    category: 'Reports',
    stepNumber: 'T27',
    stepName: 'View orders for date range',
    description: 'See all orders within a date range',
    page: 'My Reports',
    action: 'Select start and end dates',
    apiEndpoint: '/api/orders/tso/range',
    creates: 'None (view only)',
    prerequisites: 'Must have orders in date range'
  },
  {
    role: 'TSO',
    category: 'Reports',
    stepNumber: 'T28',
    stepName: 'Export orders to Excel (single date)',
    description: 'Download orders as Excel file for a specific date',
    page: 'My Reports',
    action: 'Select date, click Export to Excel button',
    apiEndpoint: '/api/orders/tso/my-report/:date',
    creates: 'Excel file download',
    prerequisites: 'Must have orders for that date'
  },
  {
    role: 'TSO',
    category: 'Reports',
    stepNumber: 'T29',
    stepName: 'Export orders to Excel (date range)',
    description: 'Download orders as Excel file for a date range',
    page: 'My Reports',
    action: 'Select date range, click Export to Excel button',
    apiEndpoint: '/api/orders/tso/my-report-range',
    creates: 'Excel file download',
    prerequisites: 'Must have orders in date range'
  },
  {
    role: 'TSO',
    category: 'Reports',
    stepNumber: 'T30',
    stepName: 'Generate Management Report (CSV)',
    description: 'Download management report as CSV file for a specific date',
    page: 'My Reports',
    action: 'Select date, click Generate MR Report button',
    apiEndpoint: '/api/orders/mr-report/:date',
    creates: 'CSV file download',
    prerequisites: 'Must have orders for that date'
  },
  {
    role: 'TSO',
    category: 'Authentication',
    stepNumber: 'T31',
    stepName: 'Logout',
    description: 'End session and return to login page',
    page: 'Any',
    action: 'Click Logout button in header',
    apiEndpoint: 'None (local session clear)',
    creates: 'None',
    prerequisites: 'Must be logged in'
  },

  // ===== ADMIN WORKFLOWS =====
  {
    role: 'ADMIN',
    category: 'Authentication',
    stepNumber: 'A1',
    stepName: 'Login to the system',
    description: 'Enter username and password to access admin portal',
    page: 'Login',
    action: 'Enter credentials and click Login button',
    apiEndpoint: '/api/auth/login',
    creates: 'Session/token',
    prerequisites: 'Valid admin account must exist'
  },
  {
    role: 'ADMIN',
    category: 'Dashboard',
    stepNumber: 'A2',
    stepName: 'View Admin Dashboard',
    description: 'See overview of system statistics',
    page: 'Dashboard',
    action: 'Navigate to Dashboard (default page)',
    apiEndpoint: '/api/orders, /api/dealers, /api/products, etc.',
    creates: 'None (view only)',
    prerequisites: 'Must be logged in as admin'
  },
  {
    role: 'ADMIN',
    category: 'User Management',
    stepNumber: 'A3',
    stepName: 'View Settings page',
    description: 'Access all admin management functions',
    page: 'Settings',
    action: 'Navigate to Settings menu',
    apiEndpoint: 'None',
    creates: 'None',
    prerequisites: 'Must be logged in as admin'
  },
  {
    role: 'ADMIN',
    category: 'User Management',
    stepNumber: 'A4',
    stepName: 'View Manage Users tab',
    description: 'See all system users',
    page: 'Settings → Manage Users',
    action: 'Click Manage Users tab',
    apiEndpoint: '/api/users',
    creates: 'None (view only)',
    prerequisites: 'Must be logged in as admin'
  },
  {
    role: 'ADMIN',
    category: 'User Management',
    stepNumber: 'A5',
    stepName: 'Filter users by role',
    description: 'View users by role (admin, TSO, dealer, sales_manager)',
    page: 'Settings → Manage Users',
    action: 'Select role from filter dropdown',
    apiEndpoint: '/api/users (with role filter)',
    creates: 'None (view only)',
    prerequisites: 'Users must exist'
  },
  {
    role: 'ADMIN',
    category: 'User Management',
    stepNumber: 'A6',
    stepName: 'Sort users',
    description: 'Sort users table by column (name, role, territory, status)',
    page: 'Settings → Manage Users',
    action: 'Click column header to sort',
    apiEndpoint: 'None (frontend sorting)',
    creates: 'None',
    prerequisites: 'Users must be loaded'
  },
  {
    role: 'ADMIN',
    category: 'User Management',
    stepNumber: 'A7',
    stepName: 'Create new user',
    description: 'Add a new user account to the system',
    page: 'Settings → Manage Users',
    action: 'Click Add User button, fill form, click Submit',
    apiEndpoint: 'POST /api/users',
    creates: 'New user record in database',
    prerequisites: 'Must have required user data (username, password, role, etc.)'
  },
  {
    role: 'ADMIN',
    category: 'User Management',
    stepNumber: 'A8',
    stepName: 'Edit user',
    description: 'Update user information',
    page: 'Settings → Manage Users',
    action: 'Click Edit button, modify fields, click Submit',
    apiEndpoint: 'PUT /api/users/:id',
    creates: 'Updated user record',
    prerequisites: 'User must exist'
  },
  {
    role: 'ADMIN',
    category: 'User Management',
    stepNumber: 'A9',
    stepName: 'Delete user',
    description: 'Remove a user account from the system',
    page: 'Settings → Manage Users',
    action: 'Click Delete button, confirm deletion',
    apiEndpoint: 'DELETE /api/users/:id',
    creates: 'User record deleted',
    prerequisites: 'User must exist'
  },
  {
    role: 'ADMIN',
    category: 'User Management',
    stepNumber: 'A10',
    stepName: 'Activate/Deactivate user',
    description: 'Enable or disable a user account',
    page: 'Settings → Manage Users',
    action: 'Edit user and toggle is_active status',
    apiEndpoint: 'PUT /api/users/:id',
    creates: 'Updated user status',
    prerequisites: 'User must exist'
  },
  {
    role: 'ADMIN',
    category: 'Dealer Management',
    stepNumber: 'A11',
    stepName: 'View Manage Dealers tab',
    description: 'See all dealers in the system',
    page: 'Settings → Manage Dealers',
    action: 'Click Manage Dealers tab',
    apiEndpoint: '/api/dealers',
    creates: 'None (view only)',
    prerequisites: 'Must be logged in as admin'
  },
  {
    role: 'ADMIN',
    category: 'Dealer Management',
    stepNumber: 'A12',
    stepName: 'Search dealers',
    description: 'Search dealers by name, code, or territory',
    page: 'Settings → Manage Dealers',
    action: 'Enter search term in search field',
    apiEndpoint: '/api/dealers (with search filter)',
    creates: 'None (view only)',
    prerequisites: 'Dealers must exist'
  },
  {
    role: 'ADMIN',
    category: 'Dealer Management',
    stepNumber: 'A13',
    stepName: 'Filter dealers by territory',
    description: 'View dealers in a specific territory',
    page: 'Settings → Manage Dealers',
    action: 'Select territory from filter dropdown',
    apiEndpoint: '/api/dealers (with territory filter)',
    creates: 'None (view only)',
    prerequisites: 'Dealers must exist'
  },
  {
    role: 'ADMIN',
    category: 'Dealer Management',
    stepNumber: 'A14',
    stepName: 'Import dealers from Excel',
    description: 'Bulk import dealers from Excel file',
    page: 'Settings → Manage Dealers',
    action: 'Click Import Dealers button, select Excel file, click Upload',
    apiEndpoint: 'POST /api/dealers/import',
    creates: 'Multiple dealer records in database',
    prerequisites: 'Excel file must be in correct format'
  },
  {
    role: 'ADMIN',
    category: 'Dealer Management',
    stepNumber: 'A15',
    stepName: 'Export dealers to Excel',
    description: 'Download dealer list as Excel file',
    page: 'Settings → Manage Dealers',
    action: 'Click Export to Excel button',
    apiEndpoint: 'None (frontend Excel generation)',
    creates: 'Excel file download',
    prerequisites: 'Dealers must exist'
  },
  {
    role: 'ADMIN',
    category: 'Dealer Management',
    stepNumber: 'A16',
    stepName: 'View dealer details',
    description: 'See full dealer information and product assignments',
    page: 'Settings → Manage Dealers',
    action: 'Click View Details button on dealer row',
    apiEndpoint: '/api/dealer-assignments/:dealerId',
    creates: 'None (view only)',
    prerequisites: 'Dealer must exist'
  },
  {
    role: 'ADMIN',
    category: 'Dealer Management',
    stepNumber: 'A17',
    stepName: 'Assign product to dealer',
    description: 'Assign a product to a dealer for forecasting/ordering',
    page: 'Settings → Manage Dealers',
    action: 'Expand dealer row, select product, click Add Assignment',
    apiEndpoint: 'POST /api/dealer-assignments',
    creates: 'Product assignment record',
    prerequisites: 'Dealer and product must exist'
  },
  {
    role: 'ADMIN',
    category: 'Dealer Management',
    stepNumber: 'A18',
    stepName: 'Assign multiple products to dealer',
    description: 'Assign several products to a dealer at once',
    page: 'Settings → Manage Dealers',
    action: 'Expand dealer row, select multiple products, click Add Assignment',
    apiEndpoint: 'POST /api/dealer-assignments/bulk',
    creates: 'Multiple product assignment records',
    prerequisites: 'Dealer and products must exist'
  },
  {
    role: 'ADMIN',
    category: 'Dealer Management',
    stepNumber: 'A19',
    stepName: 'Assign category/application to dealer',
    description: 'Assign products by category or application name',
    page: 'Settings → Manage Dealers',
    action: 'Expand dealer row, select category/application, click Add Assignment',
    apiEndpoint: 'POST /api/dealer-assignments (with category)',
    creates: 'Category-based assignment record',
    prerequisites: 'Dealer and category must exist'
  },
  {
    role: 'ADMIN',
    category: 'Dealer Management',
    stepNumber: 'A20',
    stepName: 'Remove product assignment from dealer',
    description: 'Unassign a product from a dealer',
    page: 'Settings → Manage Dealers',
    action: 'Expand dealer row, click Delete button on assignment',
    apiEndpoint: 'DELETE /api/dealer-assignments/:id',
    creates: 'Assignment record deleted',
    prerequisites: 'Assignment must exist'
  },
  {
    role: 'ADMIN',
    category: 'Product Management',
    stepNumber: 'A21',
    stepName: 'View Manage Products tab',
    description: 'See all products in the system',
    page: 'Settings → Manage Products',
    action: 'Click Manage Products tab',
    apiEndpoint: '/api/products',
    creates: 'None (view only)',
    prerequisites: 'Must be logged in as admin'
  },
  {
    role: 'ADMIN',
    category: 'Product Management',
    stepNumber: 'A22',
    stepName: 'Search products',
    description: 'Search products by name, code, or category',
    page: 'Settings → Manage Products',
    action: 'Enter search term in search field',
    apiEndpoint: '/api/products (with search filter)',
    creates: 'None (view only)',
    prerequisites: 'Products must exist'
  },
  {
    role: 'ADMIN',
    category: 'Product Management',
    stepNumber: 'A23',
    stepName: 'Filter products by category',
    description: 'View products in a specific category',
    page: 'Settings → Manage Products',
    action: 'Select category from filter dropdown',
    apiEndpoint: '/api/products (with category filter)',
    creates: 'None (view only)',
    prerequisites: 'Products must exist'
  },
  {
    role: 'ADMIN',
    category: 'Product Management',
    stepNumber: 'A24',
    stepName: 'Import products from Excel',
    description: 'Bulk import products from Excel file',
    page: 'Settings → Manage Products',
    action: 'Click Import Products button, select Excel file, click Upload',
    apiEndpoint: 'POST /api/products/import',
    creates: 'Multiple product records in database',
    prerequisites: 'Excel file must be in correct format'
  },
  {
    role: 'ADMIN',
    category: 'Product Management',
    stepNumber: 'A25',
    stepName: 'Export products to Excel',
    description: 'Download product list as Excel file',
    page: 'Settings → Manage Products',
    action: 'Click Export to Excel button',
    apiEndpoint: 'None (frontend Excel generation)',
    creates: 'Excel file download',
    prerequisites: 'Products must exist'
  },
  {
    role: 'ADMIN',
    category: 'Transport Management',
    stepNumber: 'A26',
    stepName: 'View Manage Transports tab',
    description: 'See all transports in the system',
    page: 'Settings → Manage Transports',
    action: 'Click Manage Transports tab',
    apiEndpoint: '/api/transports',
    creates: 'None (view only)',
    prerequisites: 'Must be logged in as admin'
  },
  {
    role: 'ADMIN',
    category: 'Transport Management',
    stepNumber: 'A27',
    stepName: 'Create new transport',
    description: 'Add a new transport to the system',
    page: 'Settings → Manage Transports',
    action: 'Click Add Transport button, fill form, click Submit',
    apiEndpoint: 'POST /api/transports',
    creates: 'New transport record in database',
    prerequisites: 'Must have transport data (name, etc.)'
  },
  {
    role: 'ADMIN',
    category: 'Transport Management',
    stepNumber: 'A28',
    stepName: 'Edit transport',
    description: 'Update transport information',
    page: 'Settings → Manage Transports',
    action: 'Click Edit button, modify fields, click Submit',
    apiEndpoint: 'PUT /api/transports/:id',
    creates: 'Updated transport record',
    prerequisites: 'Transport must exist'
  },
  {
    role: 'ADMIN',
    category: 'Transport Management',
    stepNumber: 'A29',
    stepName: 'Delete transport',
    description: 'Remove a transport from the system',
    page: 'Settings → Manage Transports',
    action: 'Click Delete button, confirm deletion',
    apiEndpoint: 'DELETE /api/transports/:id',
    creates: 'Transport record deleted',
    prerequisites: 'Transport must exist'
  },
  {
    role: 'ADMIN',
    category: 'Transport Management',
    stepNumber: 'A30',
    stepName: 'Import transports from Excel',
    description: 'Bulk import transports from Excel file',
    page: 'Settings → Manage Transports',
    action: 'Click Import Transports button, select Excel file, click Upload',
    apiEndpoint: 'POST /api/transports/import',
    creates: 'Multiple transport records in database',
    prerequisites: 'Excel file must be in correct format'
  },
  {
    role: 'ADMIN',
    category: 'Quota Management',
    stepNumber: 'A31',
    stepName: 'View Manage Quotas page',
    description: 'Access daily quota allocation interface',
    page: 'Manage Quotas',
    action: 'Navigate to Manage Quotas menu',
    apiEndpoint: '/api/products, /api/dealers/territories',
    creates: 'None',
    prerequisites: 'Must be logged in as admin'
  },
  {
    role: 'ADMIN',
    category: 'Quota Management',
    stepNumber: 'A32',
    stepName: 'Select date for quota allocation',
    description: 'Choose which date to allocate quotas for',
    page: 'Manage Quotas',
    action: 'Select date from date picker',
    apiEndpoint: '/api/product-caps',
    creates: 'None',
    prerequisites: 'Date picker must be available'
  },
  {
    role: 'ADMIN',
    category: 'Quota Management',
    stepNumber: 'A33',
    stepName: 'View existing quotas',
    description: 'See already allocated quotas for selected date',
    page: 'Manage Quotas',
    action: 'Quotas load automatically when date selected',
    apiEndpoint: '/api/product-caps',
    creates: 'None (view only)',
    prerequisites: 'Date must be selected'
  },
  {
    role: 'ADMIN',
    category: 'Quota Management',
    stepNumber: 'A34',
    stepName: 'Search products for quota',
    description: 'Search for products to allocate quotas',
    page: 'Manage Quotas',
    action: 'Type product name/code in search field',
    apiEndpoint: '/api/products (with search filter)',
    creates: 'None',
    prerequisites: 'Products must be loaded'
  },
  {
    role: 'ADMIN',
    category: 'Quota Management',
    stepNumber: 'A35',
    stepName: 'Select products for quota allocation',
    description: 'Choose which products to allocate quotas for',
    page: 'Manage Quotas',
    action: 'Select products from autocomplete dropdown',
    apiEndpoint: 'None',
    creates: 'Selected products list',
    prerequisites: 'Products must be searched/filtered'
  },
  {
    role: 'ADMIN',
    category: 'Quota Management',
    stepNumber: 'A36',
    stepName: 'Select territories for quota allocation',
    description: 'Choose which territories to allocate quotas for',
    page: 'Manage Quotas',
    action: 'Select territories from autocomplete dropdown',
    apiEndpoint: '/api/dealers/territories',
    creates: 'Selected territories list',
    prerequisites: 'Territories must be loaded'
  },
  {
    role: 'ADMIN',
    category: 'Quota Management',
    stepNumber: 'A37',
    stepName: 'Enter quota quantity',
    description: 'Input the quota quantity to allocate',
    page: 'Manage Quotas',
    action: 'Enter quantity in InputNumber field',
    apiEndpoint: 'None (local state)',
    creates: 'Quota value in memory',
    prerequisites: 'Products and territories must be selected'
  },
  {
    role: 'ADMIN',
    category: 'Quota Management',
    stepNumber: 'A38',
    stepName: 'Bulk allocate quotas',
    description: 'Allocate quotas for multiple products and territories at once',
    page: 'Manage Quotas',
    action: 'Select products, territories, enter quantity, click Allocate button',
    apiEndpoint: 'POST /api/product-caps/bulk',
    creates: 'Multiple quota records in database',
    prerequisites: 'Products, territories, and quantity must be selected'
  },
  {
    role: 'ADMIN',
    category: 'Quota Management',
    stepNumber: 'A39',
    stepName: 'Update existing quota',
    description: 'Modify an already allocated quota quantity',
    page: 'Manage Quotas',
    action: 'Click Edit button on quota row, enter new quantity, click Update',
    apiEndpoint: 'PUT /api/product-caps/:date/:productId/:territoryName',
    creates: 'Updated quota record',
    prerequisites: 'Quota must exist for that product/territory/date'
  },
  {
    role: 'ADMIN',
    category: 'Quota Management',
    stepNumber: 'A40',
    stepName: 'Delete quota',
    description: 'Remove a quota allocation',
    page: 'Manage Quotas',
    action: 'Click Delete button on quota row, confirm deletion',
    apiEndpoint: 'DELETE /api/product-caps/:date/:productId/:territoryName',
    creates: 'Quota record deleted',
    prerequisites: 'Quota must exist'
  },
  {
    role: 'ADMIN',
    category: 'Quota Management',
    stepNumber: 'A41',
    stepName: 'View quota history',
    description: 'See historical quota allocations for past dates',
    page: 'Manage Quotas → History tab',
    action: 'Click History tab, select date',
    apiEndpoint: '/api/product-caps (with date filter)',
    creates: 'None (view only)',
    prerequisites: 'Date must be selected'
  },
  {
    role: 'ADMIN',
    category: 'Quota Management',
    stepNumber: 'A42',
    stepName: 'View TSO quota view',
    description: 'See quotas from TSO perspective (by territory)',
    page: 'Manage Quotas → TSO View tab',
    action: 'Click TSO View tab',
    apiEndpoint: '/api/product-caps/tso-today',
    creates: 'None (view only)',
    prerequisites: 'Must have quotas allocated'
  },
  {
    role: 'ADMIN',
    category: 'Settings',
    stepNumber: 'A43',
    stepName: 'View Admin Settings tab',
    description: 'Access system-wide settings',
    page: 'Settings → Admin Settings',
    action: 'Click Admin Settings tab',
    apiEndpoint: '/api/settings/monthly-forecast-start-day',
    creates: 'None',
    prerequisites: 'Must be logged in as admin'
  },
  {
    role: 'ADMIN',
    category: 'Settings',
    stepNumber: 'A44',
    stepName: 'View monthly forecast start day setting',
    description: 'See the current monthly forecast period start day',
    page: 'Settings → Admin Settings',
    action: 'Setting displayed automatically',
    apiEndpoint: 'GET /api/settings/monthly-forecast-start-day',
    creates: 'None (view only)',
    prerequisites: 'Setting must exist'
  },
  {
    role: 'ADMIN',
    category: 'Settings',
    stepNumber: 'A45',
    stepName: 'Update monthly forecast start day',
    description: 'Change the day of month when forecast periods start',
    page: 'Settings → Admin Settings',
    action: 'Select new day, click Update button',
    apiEndpoint: 'PUT /api/settings/monthly-forecast-start-day',
    creates: 'Updated setting record',
    prerequisites: 'Must be logged in as admin'
  },
  {
    role: 'ADMIN',
    category: 'Reports',
    stepNumber: 'A46',
    stepName: 'View Reports page',
    description: 'Access system-wide reports',
    page: 'Reports',
    action: 'Navigate to Reports menu',
    apiEndpoint: '/api/orders',
    creates: 'None',
    prerequisites: 'Must be logged in as admin'
  },
  {
    role: 'ADMIN',
    category: 'Reports',
    stepNumber: 'A47',
    stepName: 'View Daily Report',
    description: 'See daily order reports with filtering',
    page: 'Reports',
    action: 'Navigate to Reports page (defaults to Daily Report)',
    apiEndpoint: '/api/orders',
    creates: 'None (view only)',
    prerequisites: 'Orders must exist'
  },
  {
    role: 'ADMIN',
    category: 'Reports',
    stepNumber: 'A48',
    stepName: 'Filter daily report by date',
    description: 'View daily report for a specific date',
    page: 'Reports',
    action: 'Select date from date picker',
    apiEndpoint: '/api/orders (with date filter)',
    creates: 'None (view only)',
    prerequisites: 'Must have orders for that date'
  },
  {
    role: 'ADMIN',
    category: 'Reports',
    stepNumber: 'A49',
    stepName: 'Filter daily report by dealer',
    description: 'View daily report for a specific dealer',
    page: 'Reports',
    action: 'Select dealer from dropdown',
    apiEndpoint: '/api/orders (with dealer filter)',
    creates: 'None (view only)',
    prerequisites: 'Must have orders for that dealer'
  },
  {
    role: 'ADMIN',
    category: 'Reports',
    stepNumber: 'A50',
    stepName: 'View order details in daily report',
    description: 'See expanded order details with items',
    page: 'Reports',
    action: 'Click expand button on order row',
    apiEndpoint: 'None (uses existing data)',
    creates: 'None (view only)',
    prerequisites: 'Order must be visible in table'
  },
  {
    role: 'ADMIN',
    category: 'Orders',
    stepNumber: 'A51',
    stepName: 'View Placed Orders page',
    description: 'See all orders in the system',
    page: 'Placed Orders',
    action: 'Navigate to Placed Orders menu',
    apiEndpoint: '/api/orders',
    creates: 'None (view only)',
    prerequisites: 'Must be logged in as admin'
  },
  {
    role: 'ADMIN',
    category: 'Orders',
    stepNumber: 'A52',
    stepName: 'Filter orders by date',
    description: 'View orders for a specific date',
    page: 'Placed Orders',
    action: 'Select date from date picker',
    apiEndpoint: '/api/orders (with date filter)',
    creates: 'None (view only)',
    prerequisites: 'Must have orders for that date'
  },
  {
    role: 'ADMIN',
    category: 'Orders',
    stepNumber: 'A53',
    stepName: 'Filter orders by dealer',
    description: 'View orders for a specific dealer',
    page: 'Placed Orders',
    action: 'Select dealer from dropdown',
    apiEndpoint: '/api/orders (with dealer filter)',
    creates: 'None (view only)',
    prerequisites: 'Must have orders for that dealer'
  },
  {
    role: 'ADMIN',
    category: 'Orders',
    stepNumber: 'A54',
    stepName: 'Filter orders by order type',
    description: 'View orders by type (SO, DD)',
    page: 'Placed Orders',
    action: 'Select order type from dropdown',
    apiEndpoint: '/api/orders (with order_type filter)',
    creates: 'None (view only)',
    prerequisites: 'Must have orders of that type'
  },
  {
    role: 'ADMIN',
    category: 'Orders',
    stepNumber: 'A55',
    stepName: 'Search orders',
    description: 'Search orders by order ID or dealer name',
    page: 'Placed Orders',
    action: 'Enter search term in search field',
    apiEndpoint: '/api/orders (with search filter)',
    creates: 'None (view only)',
    prerequisites: 'Orders must exist'
  },
  {
    role: 'ADMIN',
    category: 'Orders',
    stepNumber: 'A56',
    stepName: 'View order details',
    description: 'See full details of an order including all items',
    page: 'Placed Orders',
    action: 'Click on order row to expand details',
    apiEndpoint: '/api/orders/:orderId',
    creates: 'None (view only)',
    prerequisites: 'Order must be visible in table'
  },
  {
    role: 'ADMIN',
    category: 'Authentication',
    stepNumber: 'A57',
    stepName: 'Logout',
    description: 'End session and return to login page',
    page: 'Any',
    action: 'Click Logout button in header',
    apiEndpoint: 'None (local session clear)',
    creates: 'None',
    prerequisites: 'Must be logged in'
  },
];

// Generate Excel file
async function generateExcel() {
  const workbook = new ExcelJS.Workbook();
  
  // Create summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.addRow(['User Workflows Summary']);
  summarySheet.addRow([]);
  
  const roles = ['DEALER', 'TSO', 'ADMIN'];
  roles.forEach(role => {
    const roleWorkflows = userWorkflows.filter(w => w.role === role);
    summarySheet.addRow([`${role} Workflows: ${roleWorkflows.length} steps`]);
    roleWorkflows.forEach(workflow => {
      summarySheet.addRow(['', workflow.stepNumber, workflow.stepName, workflow.category]);
    });
    summarySheet.addRow([]);
  });
  
  // Create detailed sheet
  const detailSheet = workbook.addWorksheet('All Workflows');
  detailSheet.addRow([
    'Role',
    'Category',
    'Step Number',
    'Step Name',
    'Description',
    'Page',
    'Action',
    'API Endpoint',
    'Creates/Updates',
    'Prerequisites'
  ]);
  
  // Style header row
  const headerRow = detailSheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Add data rows
  userWorkflows.forEach(workflow => {
    const row = detailSheet.addRow([
      workflow.role,
      workflow.category,
      workflow.stepNumber,
      workflow.stepName,
      workflow.description,
      workflow.page,
      workflow.action,
      workflow.apiEndpoint,
      workflow.creates,
      workflow.prerequisites
    ]);
    
    // Color code by role
    if (workflow.role === 'DEALER') {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } };
    } else if (workflow.role === 'TSO') {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF4E6' } };
    } else if (workflow.role === 'ADMIN') {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6FFE6' } };
    }
  });
  
  // Set column widths
  detailSheet.columns = [
    { width: 12 }, // Role
    { width: 20 }, // Category
    { width: 12 }, // Step Number
    { width: 40 }, // Step Name
    { width: 50 }, // Description
    { width: 30 }, // Page
    { width: 40 }, // Action
    { width: 40 }, // API Endpoint
    { width: 30 }, // Creates/Updates
    { width: 40 }, // Prerequisites
  ];
  
  // Create role-specific sheets
  roles.forEach(role => {
    const roleSheet = workbook.addWorksheet(`${role} Workflows`);
    const roleWorkflows = userWorkflows.filter(w => w.role === role);
    
    roleSheet.addRow([`${role} Workflows - ${roleWorkflows.length} steps`]);
    roleSheet.addRow([]);
    roleSheet.addRow([
      'Category',
      'Step Number',
      'Step Name',
      'Description',
      'Page',
      'Action',
      'API Endpoint',
      'Creates/Updates',
      'Prerequisites'
    ]);
    
    // Style header row
    const roleHeaderRow = roleSheet.getRow(3);
    roleHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    roleHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    roleHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Group by category
    const categories = [...new Set(roleWorkflows.map(w => w.category))];
    categories.forEach(category => {
      const categoryWorkflows = roleWorkflows.filter(w => w.category === category);
      categoryWorkflows.forEach(workflow => {
        roleSheet.addRow([
          workflow.category,
          workflow.stepNumber,
          workflow.stepName,
          workflow.description,
          workflow.page,
          workflow.action,
          workflow.apiEndpoint,
          workflow.creates,
          workflow.prerequisites
        ]);
      });
      roleSheet.addRow([]); // Empty row between categories
    });
    
    // Set column widths
    roleSheet.columns = [
      { width: 20 }, // Category
      { width: 12 }, // Step Number
      { width: 40 }, // Step Name
      { width: 50 }, // Description
      { width: 30 }, // Page
      { width: 40 }, // Action
      { width: 40 }, // API Endpoint
      { width: 30 }, // Creates/Updates
      { width: 40 }, // Prerequisites
    ];
  });
  
  // Save file
  const outputPath = require('path').join(__dirname, 'user_workflows.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`✅ Excel file created: ${outputPath}`);
  console.log(`   Total workflows: ${userWorkflows.length}`);
  console.log(`   - Dealer: ${userWorkflows.filter(w => w.role === 'DEALER').length}`);
  console.log(`   - TSO: ${userWorkflows.filter(w => w.role === 'TSO').length}`);
  console.log(`   - Admin: ${userWorkflows.filter(w => w.role === 'ADMIN').length}`);
}

generateExcel().catch(console.error);

