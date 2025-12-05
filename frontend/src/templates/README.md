# Templates

**Location**: `frontend/src/templates/`

## Purpose

This folder contains **reusable template code** that is imported into application pages. These templates ensure design consistency across the entire application.

## Key Distinction

- **Templates** (this folder) = Code imported into application pages  
  Example: `UIConfig.js` imported in PlacedOrders.js, DealerReports.js, etc.

- **Examples** (`frontend/src/pages/examples/`) = Showcase pages that demonstrate templates  
  These are only accessed via routes, not imported into application code.

## Available Templates

### UIConfig.js
**Type**: Configuration utilities  
**Purpose**: Standard UI component configurations

**Functions:**
- `getStandardPagination(itemName)` - Standard table pagination configuration
- `createStandardDatePickerConfig(availableDates)` - Standard date picker configuration

**Used in application pages:**
- PlacedOrders.js
- DealerReports.js
- DailyReport.js
- TSOReport.js
- UserManagement.js
- DealerManagement.js
- ProductManagement.js
- TransportManagement.js

### TableTemplate.js
**Type**: Component template  
**Purpose**: Standard design for expandable tables

**Used in application pages:**
- DealerReports.js

## Import Examples

```javascript
// From application pages (frontend/src/pages/)
import { getStandardPagination } from '../templates/UIConfig';
import { StandardExpandableTable } from '../templates/TableTemplate';

// From example pages (frontend/src/pages/examples/)
import { createStandardDatePickerConfig } from '../../templates/UIConfig';

// From example subfolder (frontend/src/pages/examples/ui-components/)
import { getStandardPagination } from '../../../templates/UIConfig';
```

## Adding New Templates

1. Create template file in this folder
2. Export reusable functions/components
3. Update this README
4. Import in application pages as needed

**⚠️ Rule**: Only add code here if it will be imported into application pages.
