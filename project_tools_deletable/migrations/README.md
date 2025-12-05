# Database Migration: Add order_source Column

## Overview
This migration adds an `order_source` column to the `orders` table to track whether orders are created by TSO, Dealer, or Admin users. This improves query performance and makes reporting easier.

## Changes Made

### 1. Database Schema (`database.sql`)
- Added `order_source ENUM('tso', 'dealer', 'admin')` column to `orders` table
- Added index `idx_order_source` for faster filtering
- Updated triggers `trg_orders_bi` and `trg_orders_bu` to auto-populate `order_source` based on user role

### 2. Migration Script (`add_order_source.sql`)
- Standalone migration script for existing databases
- Populates existing orders with `order_source` based on user role
- Updates triggers to maintain `order_source` for new orders

### 3. Backend API (`server.js`)
- Added optional `order_source` query parameter to `/api/orders` endpoint
- Allows filtering orders by source: `?order_source=tso`, `?order_source=dealer`, or `?order_source=admin`

## How to Run Migration

### For New Databases
The updated `database.sql` will automatically create the column when setting up a new database.

### For Existing Databases
Run the migration script:

```bash
mysql -u your_username -p cbl_so < migrations/add_order_source.sql
```

Or manually execute the SQL commands in `migrations/add_order_source.sql`.

## Usage Examples

### Query Orders by Source
```sql
-- Get all dealer-created orders
SELECT * FROM orders WHERE order_source = 'dealer';

-- Get all TSO-created orders
SELECT * FROM orders WHERE order_source = 'tso';

-- Count orders by source
SELECT order_source, COUNT(*) as count 
FROM orders 
GROUP BY order_source;
```

### API Endpoints
```javascript
// Get all dealer orders
GET /api/orders?order_source=dealer

// Get all TSO orders
GET /api/orders?order_source=tso

// Get orders for specific user (existing functionality)
GET /api/orders?user_id=123
```

## Benefits

1. **Performance**: No JOIN required to filter by order source
2. **Reporting**: Easier analytics and reporting on order types
3. **Clarity**: Self-documenting schema - order source is explicit
4. **Backward Compatible**: Existing code continues to work, new filtering is optional

## Verification

After running the migration, verify with:

```sql
SELECT 
    order_source,
    COUNT(*) as order_count,
    SUM(total_quantity) as total_quantity
FROM orders
GROUP BY order_source;
```

This should show counts for each order source type.

## Notes

- The `order_source` field is automatically populated by database triggers
- No application code changes required - triggers handle everything
- Existing orders are backfilled based on user role
- The field is nullable for edge cases (orders without user_id)

---

## Order Types Setup

### Default Order Types
The system uses two default order types:
- **SO** (Sales Order) - Auto-selected for TSO users
- **DD** (Daily Demand) - Auto-selected for Dealer users

### Migration Script (`add_order_types.sql`)
Run this script to add order types to existing databases:

```bash
mysql -u your_username -p cbl_so < migrations/add_order_types.sql
```

### Auto-Selection Behavior
- **TSOs**: When creating orders, "SO" is automatically selected
- **Dealers**: When creating daily demand, "DD" is automatically selected
- Users can still change the order type if needed

### Verification
After running the migration, verify order types exist:

```sql
SELECT id, name FROM order_types ORDER BY id;
```

Expected output:
- id: 1, name: SO
- id: 2, name: DD

