# Testing Checklist

Use this checklist after code updates to verify all features are working.

## Automated Tests

### Automated Test Suite
Runs both API endpoint checks and functional workflow tests:
```bash
# For local backend
node test-all-features.js

# For Docker backend
$env:API_URL="http://localhost:3002"; node test-all-features.js
```

This comprehensive test will:
- ✅ Check all API endpoints are accessible (10 tests)
- ✅ Allocate a daily quota
- ✅ Verify quota appears in the system
- ✅ Create a test order
- ✅ Verify order appears in orders list
- ✅ Verify quota remaining quantity updates correctly
- ✅ Test MR CSV generation
- ✅ Test TSO order filtering

## Manual Testing Checklist

### 🔐 Authentication
- [ ] Login works for admin users
- [ ] Login works for TSO users
- [ ] Logout works correctly
- [ ] Session persists after page refresh
- [ ] Unauthorized access redirects to login

### 📊 Dashboard (Admin)
- [ ] All 4 stat cards display correctly (Dealers, Warehouses, Products, Orders)
- [ ] All 3 System Status cards display correctly (Backend, Database, Orders Processed)
- [ ] Recent Orders list shows orders with correct details
- [ ] Order IDs display without "ORD-" prefix
- [ ] Quantities and product names display correctly

### 📊 TSO Dashboard
- [ ] "Today's Product Allocations" alert displays with correct date
- [ ] All 3 stat cards display (Products Allocated, Sold Quantity, Remaining Quantity)
- [ ] Quantities are calculated correctly (not concatenated as strings)
- [ ] "Today's Orders" table shows orders correctly
- [ ] Product allocations table displays correctly

### 📝 Order Management
- [ ] Create new order (TSO)
- [ ] Select order type, dealer, warehouse, transport
- [ ] Add products to cart
- [ ] Review order before submission
- [ ] Submit order successfully
- [ ] Order appears in "Placed Orders" immediately
- [ ] Order ID is generated correctly (no "ORD-" prefix)

### 📋 Placed Orders (TSO)
- [ ] Shows only orders placed by logged-in TSO
- [ ] Date filter defaults to today
- [ ] Can filter by date, product, dealer, transport
- [ ] Search bar works correctly
- [ ] Table displays all order details correctly
- [ ] Product details show correctly
- [ ] Cannot delete orders (no delete button for TSO)

### 📋 Placed Orders (Admin)
- [ ] Shows all orders from all TSOs
- [ ] Date filter works
- [ ] Can filter by date, product, dealer, transport
- [ ] Search bar works correctly
- [ ] Can delete today's orders only
- [ ] Delete button disabled for old orders
- [ ] Tooltip shows correct message for disabled delete

### 👥 User Management
- [ ] View all users
- [ ] Create new user
- [ ] Edit user details
- [ ] Delete user
- [ ] User roles work correctly

### 🏢 Dealer Management
- [ ] View all dealers
- [ ] Import dealers from Excel
- [ ] Stat cards display correctly
- [ ] Search and filter work

### 📦 Product Management
- [ ] View all products
- [ ] Import products from Excel
- [ ] Stat cards display correctly
- [ ] Search and filter work

### 🚚 Transport Management
- [ ] View all transports
- [ ] Import transports from Excel
- [ ] Stat cards display correctly
- [ ] Search and filter work

### 📈 Daily Quota Management
- [ ] Date picker allows any date (not restricted to today)
- [ ] Allocate quotas for products and territories
- [ ] View allocated quotas table
- [ ] Edit quota quantities
- [ ] Quotas update correctly in database
- [ ] TSO dashboard reflects quota changes

### 📄 Daily Report
- [ ] Select date works
- [ ] Preview orders works
- [ ] Download TSO Excel works
- [ ] Download MR CSV works
- [ ] MR CSV only shows ordered products (not all products)
- [ ] Excel report generates correctly

### 🎨 UI/UX
- [ ] Navbar displays correctly (gradient, height 40px)
- [ ] Menu buttons are inline and styled correctly
- [ ] Selected menu item has golden gradient
- [ ] All cards have consistent 12px padding
- [ ] All info cards use gradients
- [ ] Table names use default Ant Design font size
- [ ] Responsive design works on tablet portrait mode
- [ ] No console errors in browser

### 🔧 Backend API
- [ ] All endpoints return correct status codes
- [ ] Error handling works correctly
- [ ] File uploads work (products, dealers, transports)
- [ ] Database queries execute correctly
- [ ] No errors in server logs

## Critical Paths to Test

### TSO Order Flow
1. Login as TSO
2. Go to "New Orders"
3. Create an order with multiple products
4. Review and submit
5. Verify order appears in "Placed Orders"
6. Verify order appears in admin "Placed Orders"
7. Verify order appears in Daily Report

### Admin Quota Flow
1. Login as Admin
2. Go to "Manage Quotas"
3. Allocate quotas for today
4. Login as TSO
5. Verify quotas appear in TSO Dashboard
6. Place an order using quota
7. Verify remaining quantity decreases

### Report Generation
1. Login as Admin
2. Go to "Daily Report"
3. Select a date with orders
4. Download MR CSV
5. Verify CSV only contains ordered products
6. Download TSO Excel
7. Verify Excel generates correctly

## Notes
- Run smoke test first: `node test-critical-features.js`
- Test critical paths after major changes
- Test UI/UX after styling changes
- Check browser console for errors
- Check server logs for backend errors

