# Database Truncate Scripts

This directory contains scripts to truncate all database tables except `users`, `warehouses`, `settings`, and `order_types`.

## Files

1. **`truncate_tables.js`** - Node.js script with verification and detailed logging
2. **`truncate_tables.sql`** - Direct SQL script for manual execution

## Usage

### Option 1: Node.js Script (Recommended)

From the backend directory:
```bash
cd backend
node ../project_tools_deletable/test_scripts/truncate_tables.js
```

Or from project root:
```bash
cd backend && node ../project_tools_deletable/test_scripts/truncate_tables.js
```

**Features:**
- ✅ Automatic verification of truncation
- ✅ Detailed logging and progress updates
- ✅ Error handling and recovery
- ✅ Verification that preserved tables still have data

### Option 2: Direct SQL Script

Using MySQL command line:
```bash
mysql -u root -p cbl_so < project_tools_deletable/test_scripts/truncate_tables.sql
```

Or execute in MySQL client:
```sql
source project_tools_deletable/test_scripts/truncate_tables.sql
```

## What Gets Truncated

**Tables Preserved (data kept):**
- `users` - All user accounts
- `warehouses` - Warehouse definitions
- `settings` - Application settings
- `order_types` - Order type definitions (SO, DD)

**Tables Truncated (all data deleted):**
- `order_items`
- `orders`
- `daily_quotas`
- `monthly_forecast`
- `dealer_product_assignments`
- `dealers`
- `products`
- `transports`

## Database Configuration

The Node.js script uses environment variables or defaults:
- `DB_HOST` (default: `localhost`)
- `DB_USER` (default: `root`)
- `DB_PASSWORD` (default: `#lme11@@`)
- `DB_NAME` (default: `cbl_so`)
- `DB_PORT` (default: `3306`)

## Safety Features

1. **Foreign Key Handling**: Automatically disables/enables foreign key checks
2. **Verification**: Confirms all truncated tables are empty
3. **Preservation Check**: Verifies kept tables still have data
4. **Error Recovery**: Re-enables foreign key checks even on error

## Example Output

```
======================================================================
🗑️  TRUNCATING DATABASE TABLES
======================================================================
📍 Database: cbl_so
📍 Host: localhost:3306

🔌 Connecting to database...
✅ Connected to database

🔓 Disabling foreign key checks...
✅ Foreign key checks disabled

📋 Getting list of tables...
   Found 12 tables: ...

🗑️  Truncating tables...
   ✅ Truncated: order_items
   ✅ Truncated: orders
   ...

📊 Verifying truncation...
   ✅ order_items: Empty (0 rows)
   ✅ orders: Empty (0 rows)
   ...

📊 Verifying kept tables...
   ✅ users: 35 row(s) preserved
   ✅ warehouses: 1 row(s) preserved
   ✅ settings: 1 row(s) preserved
   ✅ order_types: 2 row(s) preserved

✅ TRUNCATION COMPLETE
```

## Notes

- This script is safe to run multiple times
- It will always preserve `users`, `warehouses`, `settings`, and `order_types` tables
- All other tables will be completely emptied
- Foreign key constraints are properly handled

