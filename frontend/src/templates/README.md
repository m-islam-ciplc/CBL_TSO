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

### CardTemplates.js
**Type**: Configuration template  
**Purpose**: Standard card configurations and patterns for consistent card styling across the application.

**Configurations:**
- `FILTER_CARD_CONFIG` - For filter/input cards with title
- `CONTENT_CARD_CONFIG` - For content cards without title
- `TABLE_CARD_CONFIG` - For table cards
- `STANDARD_CARD_STYLES` - Standard styling constants

**Used in application pages:**
- All pages use these patterns for consistent card styling

**Demo page:**
- `/template-standard-cards` - See CardTemplatesDemo.js

### DealerProductCard.js
**Type**: Component template  
**Purpose**: Reusable product card component based on Monthly Forecast design. Provides a consistent card layout for dealer products with quantity input, preset buttons, and optional clear functionality.

**Component:**
- `DealerProductCard` - Standard product card with quantity input and preset buttons

**Props:**
- `product` - Product object with id, name, product_code, and optional unit_tp (required)
- `quantity` - Current quantity value (default: null)
- `onQuantityChange` - Callback when quantity changes: (productId, value) => void (required)
- `onClear` - Optional callback when clear button is clicked: (productId) => void
- `canEdit` - Whether the card is in edit mode (default: true)
- `labelText` - Label text for quantity input (default: "Quantity:")
- `presetValues` - Array of preset quantity values (default: [5, 10, 15, 20])
- `showClearButton` - Whether to show clear button (default: true)
- `cardStyle` - Additional card style overrides (optional)
- `bodyStyle` - Additional card body style overrides (optional)

**Features:**
- Responsive grid layout (uses responsive-product-grid class)
- Product name and code display
- Optional unit TP tag
- Quantity input with preset buttons
- Optional clear button
- Edit mode support
- Consistent styling matching Monthly Forecast design

**Used in application pages:**
- (Available for use in any dealer product interface)

**Demo page:**
- `/template-dealer-product-card` - See DealerProductCardTemplateDemo.js

## Import Examples

```javascript
// From application pages (frontend/src/pages/)
import { getStandardPagination } from '../templates/UIConfig';
import { StandardExpandableTable } from '../templates/TableTemplate';
import { FILTER_CARD_CONFIG, CONTENT_CARD_CONFIG } from '../templates/CardTemplates';
import { DealerProductCard } from '../templates/DealerProductCard';

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
