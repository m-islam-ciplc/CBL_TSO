# Test Dependencies Analysis

## Current Issues:
- Test 8 (Delete order) runs BEFORE Test 31 (TSO Excel report) which needs orders
- Test 44 & 45 (data generation) run too late

## Dependency Map:

### Foundation (No dependencies):
- Test 1: Create users
- Test 2: Import dealers/products/transports + assign products

### Quotas & Setup:
- Test 43: Quota allocation (needs Test 2)
- Test 5: Update quota (independent)

### Product Assignments:
- Test 9-17: Dealer product assignments (needs Test 2)

### TSO Orders & Reports (NEED ORDERS):
- Test 3: Try order (validation test)
- Test 4: Create multi-product order ✅ CREATES ORDER
- Test 6: Order history (needs Test 4)
- Test 7: TSO dashboard (needs Test 4)
- Test 28-32: TSO reports (need Test 4) ⚠️ BEFORE DELETION
- Test 8: Delete order ❌ MOVES HERE (after Test 32)

### Daily Demand Orders:
- Test 18-19: Create daily demand orders (needs Test 9)
- Test 20-25: Daily demand reports (need Test 18-19)

### Monthly Forecasts:
- Test 10: Create forecast (needs Test 9)
- Test 26-27: Get forecast data (need Test 10)

### Data Generation (Can run early):
- Test 44: Random forecasts for all dealers (needs Test 2) - Run after Test 10
- Test 45: Random daily demand for all dealers (needs Test 2) - Run after Test 18-25

### Admin Management (Independent):
- Test 33-42: Admin features (mostly independent)

## Proposed New Order:

1. Test 1: Create users
2. Test 2: Import resources
3. Test 43: Quota allocation (needs 2)
4. Test 5: Update quota
5. Test 9-17: Product assignments (needs 2)
6. Test 44: Random forecasts for all dealers (needs 2) ✅ MOVED EARLY
7. Test 3: Try order (validation)
8. Test 4: Create TSO order ✅ CREATES ORDER
9. Test 6: Order history (needs 4)
10. Test 7: TSO dashboard (needs 4)
11. Test 28-32: TSO reports (need 4) ⚠️ BEFORE DELETION
12. Test 8: Delete order ❌ MOVED HERE (after all reports)
13. Test 18-19: Daily demand orders (needs 9)
14. Test 20-25: Daily demand reports (need 18-19)
15. Test 45: Random daily demand for all dealers (needs 2) ✅ MOVED HERE
16. Test 10: Monthly forecast (needs 9)
17. Test 26-27: Monthly forecast data (need 10)
18. Test 33-42: Admin management

