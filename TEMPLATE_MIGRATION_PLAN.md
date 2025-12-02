# Template Migration Plan

## Current Structure
- `frontend/src/standard_templates/` - Reusable template code (StandardTableConfig.js, ExpandableTableTemplate.js, etc.)
- `frontend/src/pages/demos/` - Demo/showcase pages (to be renamed to templates)

## Changes Needed

### 1. Rename Demos to Templates
- Rename folder: `demos` → `templates`
- Update routes: `/demo-*` → `/template-*`
- Update menu: "Demo" → "Templates"
- Update menu items: "Demo Tables" → "Table Templates", etc.

### 2. Link Codebase to Standard Templates
All pages should IMPORT from `standard_templates/` instead of hardcoding:

**Tables:**
- Import: `import { getStandardPagination } from '../standard_templates/StandardTableConfig';`
- Use: `pagination={getStandardPagination('orders')}`

**DatePickers:**
- Import: `import { createStandardDatePickerConfig } from '../standard_templates/StandardTableConfig';`
- Use: `const { disabledDate, dateCellRender } = createStandardDatePickerConfig(availableDates);`

**Expandable Tables:**
- Import: `import { StandardExpandableTable, renderStandardExpandedRow } from '../standard_templates/ExpandableTableTemplate';`
- Use: `<StandardExpandableTable ... />`

### 3. Files to Update

**Pages with Tables:**
- PlacedOrders.js
- TSOReport.js
- DailyReport.js
- ProductManagement.js
- UserManagement.js
- TransportManagement.js
- ProductQuotaManagement.js
- TSODashboard.js
- DealerReports.js (already uses StandardExpandableTable)

**Pages with DatePickers:**
- DealerReports.js
- DailyReport.js
- TSOReport.js
- ProductQuotaManagement.js
- DailyDemandMultiDay.js
- PlacedOrders.js

