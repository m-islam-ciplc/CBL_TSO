# Cumilla Workflow Test Guide

This guide explains how to run tests selectively to validate each step of the workflow.

## Quick Start

```bash
# Show available tests
node test-cumilla-workflow.js

# Run individual tests
node test-cumilla-workflow.js 1    # Test 1: Add quota
node test-cumilla-workflow.js 2    # Test 2: Create order
node test-cumilla-workflow.js 3    # Test 3: Update quota
node test-cumilla-workflow.js all  # Run all tests
```

## Available Tests

### Test 1: Add Product Quota
**What it does:**
- Logs in as admin
- Finds 1 product (excluding Dummy product L113DU001)
- Assigns quota: 5 units in Cumilla territory

**Run:**
```bash
npm run test:workflow:1
# or
node test-cumilla-workflow.js 1
```

**What to validate:**
- ✅ Quota was assigned successfully
- ✅ Product appears in quota list
- ✅ Quota shows 5 units max, 5 remaining

---

### Test 2: Create Order
**What it does:**
- Logs in as TSO (subrata.das)
- Finds random Cumilla dealer
- Finds random transport
- Creates order: 3 units of the allocated product

**Run:**
```bash
npm run test:workflow:2
# or
node test-cumilla-workflow.js 2
```

**What to validate:**
- ✅ Order was created successfully
- ✅ Order ID was generated
- ✅ Order appears in orders list
- ✅ Quota remaining decreased (5 → 2)

---

### Test 3: Second Order Should Fail
**What it does:**
- Logs in as TSO (subrata.das)
- Tries to place second order: 5 units
- After first order (3 units), only 2 units remaining
- Order should be REJECTED (validation working)

**Run:**
```bash
npm run test:workflow:3
# or
node test-cumilla-workflow.js 3
```

**What to validate:**
- ✅ Order was correctly rejected (status 400)
- ✅ Error message indicates insufficient quota
- ✅ Only 2 units remaining, tried to order 5
- ✅ Validation prevents overselling

---

## Step-by-Step Workflow Example

### Step 1: Add Quota
```bash
npm run test:workflow:1
```

**Expected Output:**
```
📋 TEST 1: Add 1 product in Cumilla territory
📊 Assigning quotas:
   Territory: Cumilla Territory
   Date: 2024-01-15
   Products: 1
   1. Product Name (L101AF032): 5 units

✅ TEST 1 PASSED: Assigned 1 product with 5 units
```

**Validate:**
- Check in UI: Go to "Manage Quotas" → Verify product shows 5 units
- Check database: Verify `daily_quotas` table has entry

---

### Step 2: Create Order
```bash
npm run test:workflow:2
```

**Expected Output:**
```
📋 TEST 2: Sell 3 units of allocated product to random dealer
📦 Creating order:
   Dealer: Random Dealer Name
   Transport: Random Transport Name
   Product: L101AF032
   Quantity: 3 units

✅ TEST 2 PASSED: Order created successfully
   Order ID: ABC12345
   Product: L101AF032
   Quantity sold: 3 units
```

**Validate:**
- Check in UI: Go to "Placed Orders" → Verify order exists
- Check quota: Remaining should be 2 (5 - 3 = 2)
- Check database: Verify `orders` and `order_items` tables

---

### Step 3: Second Order Should Fail
```bash
npm run test:workflow:3
```

**Expected Output:**
```
📋 TEST 3: TSO tries to place second order (should FAIL)
📊 Current quota status:
   Product: L101AF032
   Max quantity: 5 units
   Sold quantity: 3 units
   Remaining quantity: 2 units

📦 Attempting second order:
   Dealer: Random Dealer Name
   Transport: Random Transport Name
   Product: L101AF032
   Quantity: 5 units
   Available: 2 units
   Expected: Order should FAIL (insufficient quota)

✅ TEST 3 PASSED: Order correctly rejected due to insufficient quota
   Status: 400 (Bad Request)
   Error: {"error":"Order validation failed","details":["Product L101AF032: Ordered 5 units, but only 2 units remaining."]}
   ✅ Error message correctly indicates quota issue
```

**Validate:**
- ✅ Order was rejected (status 400)
- ✅ Error message shows "only 2 units remaining"
- ✅ Validation prevents ordering more than available
- ✅ No order was created in database

---

## Running All Tests

To run all tests in sequence:

```bash
npm run test:workflow:all
# or
node test-cumilla-workflow.js all
```

This will:
1. Run Test 1 (Add quota)
2. Run Test 2 (Create order)
3. Run Test 3 (Update quota)
4. Show summary of all tests

---

## Docker Usage

For Docker backend (port 3002):

```bash
# Set environment variable
$env:API_URL="http://localhost:3002"

# Then run tests
node test-cumilla-workflow.js 1
node test-cumilla-workflow.js 2
node test-cumilla-workflow.js 3
```

Or use npm scripts with Docker URL:
```bash
# Modify package.json scripts to use Docker URL
# Then use npm run commands
```

---

## Troubleshooting

### Test 1 Fails
- **Issue:** "No products found"
  - **Fix:** Make sure products exist in database (excluding Dummy)
- **Issue:** "No dealers found in Cumilla territory"
  - **Fix:** Verify Cumilla territory has dealers

### Test 2 Fails
- **Issue:** "Order validation failed - only X units remaining"
  - **Fix:** Run Test 1 first to assign quota, or increase quota manually
- **Issue:** "Missing required data"
  - **Fix:** Make sure Test 1 ran successfully first

### Test 3 Fails
- **Issue:** "Order was created but should have been rejected"
  - **Fix:** This means validation is not working - check backend quota validation logic
- **Issue:** "Order validation failed" but test expects failure
  - **Note:** This is CORRECT - Test 3 expects the order to fail (status 400)
  - If you see status 400, the test is passing!

---

## Test Configuration

Edit `test-cumilla-workflow.js` to change:

```javascript
const TEST_CONFIG = {
  initialQuota: 5,         // Quota to assign in Test 1
  orderQuantity: 3,        // Quantity to sell in Test 2
  secondOrderQuantity: 5    // Quantity to try in Test 3 (should fail)
};
```

---

## Notes

- **Test data persists:** Tests don't clean up data - you can verify in UI/database
- **Dummy product excluded:** Product code `L113DU001` is automatically excluded
- **Random selection:** Dealer and transport are randomly selected each run
- **Sequential dependency:** Test 2 requires Test 1, Test 3 requires Test 2 (needs first order to consume quota)

---

## Quick Reference

| Test | Command | What It Tests |
|------|---------|---------------|
| 1 | `npm run test:workflow:1` | Quota assignment |
| 2 | `npm run test:workflow:2` | Order creation |
| 3 | `npm run test:workflow:3` | Order validation (should fail) |
| All | `npm run test:workflow:all` | Complete workflow |

---

## Example Validation Workflow

1. **Run Test 1**
   ```bash
   npm run test:workflow:1
   ```
   → Open UI → Check "Manage Quotas" → Verify quota assigned

2. **Run Test 2**
   ```bash
   npm run test:workflow:2
   ```
   → Open UI → Check "Placed Orders" → Verify order created
   → Check "Manage Quotas" → Verify remaining decreased

3. **Run Test 3**
   ```bash
   npm run test:workflow:3
   ```
   → Verify order was rejected (status 400)
   → Check error message shows insufficient quota
   → Verify no order was created

---

**Happy Testing! 🧪**

