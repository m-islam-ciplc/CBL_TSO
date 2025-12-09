# Workflow Test Scripts

Location: `project_tools_deletable/test_scripts/`

## Environment
- Default API base: `http://localhost:3002` (set `API_URL` to override)
- Uses split order tables: `sales_orders` / `sales_order_items` and `demand_orders` / `demand_order_items`
- Pass `order_type` where applicable: `SO` for sales orders, `DD` for daily demand (e.g., `/api/orders/available-dates?order_type=SO|DD`)

## Coverage notes
- Admin, TSO, and Dealer workflows are exercised via `test_workflows.js` and the test modules under `test_modules/`.
- Order flows use the new SO/DD separation; available-dates calls include `order_type` for TSO and Dealer paths.
- Price hiding: TSO and Dealer order views now assert that `unit_tp` is not returned in items.
- Reports and exports are covered via existing tests (orders, TSO, dealer). Exports are validated by content-type where applicable.

## Running
- From project root (recommended):
  - `node project_tools_deletable/test_scripts/test_workflows.js admin`
  - `node project_tools_deletable/test_scripts/test_workflows.js tso`
  - `node project_tools_deletable/test_scripts/test_workflows.js dealer`
- From backend directory:
  - `cd backend && node ../project_tools_deletable/test_scripts/test_workflows.js <role>`
- Docker port 3002:
  - Windows: `$env:API_URL='http://localhost:3002'; node project_tools_deletable/test_scripts/test_workflows.js <role>`
  - Linux/Mac: `API_URL='http://localhost:3002' node project_tools_deletable/test_scripts/test_workflows.js <role>`

## Data safety
- Scripts create and delete test users/orders/quotas; do not run against production.

