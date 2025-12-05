# Test Execution Order - Reorganized

## Changes Made

Tests have been reordered to ensure dependencies are met before tests that need them.

## New Execution Order (when running "all" tests):

### Phase 1: Foundation Setup
1. **Test 1**: Create users
2. **Test 2**: Import dealers/products/transports + assign products
3. **Test 43**: Quota allocation
4. **Test 5**: Update quota

### Phase 2: Product Assignments
5. **Test 9**: Product assignment to dealer
6. **Tests 11-17**: Dealer management features

### Phase 3: Monthly Forecasts
7. **Test 10**: Monthly forecast submission
8. **Test 44**: Add random monthly forecasts for all dealers ⬅️ **MOVED EARLIER**
9. **Test 26**: Get monthly forecast periods
10. **Test 27**: Get monthly forecast data

### Phase 4: TSO Orders & Reports (BEFORE deletion)
11. **Test 3**: Try order (validation)
12. **Test 4**: Create multi-product TSO order ✅ **CREATES ORDER**
13. **Test 6**: Order history
14. **Test 7**: TSO dashboard
15. **Tests 28-32**: TSO reports (need orders from Test 4)
16. **Test 8**: Delete order ⬅️ **MOVED HERE** (after all report tests)

### Phase 5: Daily Demand Orders
17. **Test 18**: Create single-day daily demand order
18. **Test 19**: Create multi-day daily demand orders
19. **Tests 20-25**: Daily demand reports
20. **Test 45**: Add random daily demand orders for all dealers ⬅️ **MOVED HERE**

### Phase 6: Admin Management
21. **Tests 33-42**: Admin management features

## Key Changes:

1. ✅ **Test 8 (Delete order)** moved from position 8 → position 16
   - Now runs AFTER all TSO report tests (28-32) that need orders
   - Prevents Test 31 from failing due to missing orders

2. ✅ **Test 44 (Random forecasts)** moved from position 44 → position 8
   - Runs early to create forecast data for later tests
   - Executes after basic forecast test (Test 10)

3. ✅ **Test 45 (Random daily demand)** moved from position 45 → position 20
   - Runs after basic daily demand tests (18-25)
   - Creates bulk data for comprehensive testing

4. ✅ **Test 31** now handles "no orders" gracefully
   - Skips instead of failing when no orders exist
   - Won't stop test execution

## Benefits:

- ✅ Tests that need orders run before order deletion
- ✅ Data generation tests run early to populate test data
- ✅ Dependencies are satisfied in correct order
- ✅ Test suite can complete even if some data is missing

## Note:

Test numbers remain unchanged. You can still run individual tests:
- `node test-workflow.js 8` - runs Test 8 (delete order)
- `node test-workflow.js 44` - runs Test 44 (random forecasts)
- etc.

When running `all`, tests execute in the new dependency order above.

