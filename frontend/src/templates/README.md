# Templates

**Location**: `frontend/src/templates/`

## Purpose

This folder contains **reusable template code** that is imported into application pages. These templates ensure design consistency across the entire application.

## Key Principle

**SINGLE SOURCE OF TRUTH: `UITemplates.js`**

- All UI configs (cards, sizes, styles, gutters, typography, date/pagination helpers, table headers) live in `UITemplates.js`.  
- Do **not** create new UI template files without confirmation. If unsure, ask for clarification.  
- Every UI element must use the templates from `UITemplates.js`. No exceptions.

Visual reference: See `TemplateCards.js`, `TSOTemplateCards.js`, and `DealerTemplateCards.js` in `frontend/src/pages/examples/` for standardized UI patterns. Access via the Templates menu.

## Available Templates

### UITemplates.js
**Type**: Single source of truth for ALL UI configurations  
**Purpose**: Consolidated card configs, sizes, styles, gutters, typography, date helpers, pagination helpers, and table header renderers.

**Key Exports (non-exhaustive):**
- Card configs: `STANDARD_CARD_CONFIG`, `FILTER_CARD_CONFIG`, `TABLE_CARD_CONFIG`, `EXPANDABLE_TABLE_CARD_CONFIG`, `FORM_CARD_CONFIG`, `DATE_SELECTION_CARD_CONFIG`, `ACTION_CARD_CONFIG`, `IMPORT_CARD_CONFIG`
- Sizes & styles: `STANDARD_INPUT_SIZE`, `STANDARD_BUTTON_SIZE`, `STANDARD_TAG_STYLE`, `STANDARD_FORM_LABEL_STYLE`, `STANDARD_ROW_GUTTER`, `COMPACT_ROW_GUTTER`, etc.
- Date/pagination helpers: `createStandardDatePickerConfig`, `createStandardDateRangePicker`, `STANDARD_DATE_PICKER_CONFIG`, `STANDARD_PAGINATION`, `getStandardPagination`
- Table header helpers: `renderTableHeaderWithSearch`, `renderTableHeaderWithSearchAndFilter`

**Used in application pages:** All pages that render cards, forms, tables, or date pickers (e.g., PlacedOrders, DealerReports, DailyReport, TSOReport, ProductQuotaManagement, DealerManagement, ProductManagement, TransportManagement, UserManagement, Dashboard, etc.)

### TableTemplate.js
**Type**: Component template  
**Purpose**: Standard design for expandable tables

**Used in application pages:**
- DealerReports.js

### TableTemplate.js
**Type**: Component template  
**Purpose**: Standard design for expandable tables

**Used in application pages:**
- DealerReports.js

**Visual reference:**
- `/template-cards` - See TemplateCards.js for all card patterns

### useCascadingFilters.js
**Type**: React Hook  
**Purpose**: Reusable hook for implementing cascading (dependent) filter behavior. When a parent filter changes, child filters are automatically updated and cleared if invalid.

**Hook:**
- `useCascadingFilters(config)` - Returns filtered options and clear function

**Parameters:**
- `filterConfigs` - Array of filter configurations, each with:
  - `name` - Filter name (e.g., 'dealer', 'product')
  - `allOptions` - All available options for this filter
  - `dependsOn` - Array of parent filter names this depends on
  - `filterFn` - Custom filter function: (item, parentValues, context) => boolean
  - `getValueKey` - Function to get the value/key for matching: (item) => any
- `filterValues` - Current filter values object (e.g., { territory: null, dealer: null })
- `setFilterValues` - Setters for filter values (e.g., { dealer: setDealer })
- `context` - Additional context data needed for filtering (e.g., orders, orderProducts)

**Returns:**
- `filteredOptions` - Object with filtered options for each filter (e.g., { dealer: [...], product: [...] })
- `clearFilters` - Function to clear all filters: (defaultValues?) => void

**Features:**
- Automatic filtering of options based on parent selections
- Automatic clearing of dependent filters when parent changes
- Support for complex filtering logic using context data
- Flexible configuration for different filter relationships

**Used in application pages:**
- PlacedOrders.js (Territory -> Dealer -> Product)

**Example:**
```javascript
const { filteredOptions, clearFilters } = useCascadingFilters({
  filterConfigs: [
    {
      name: 'dealer',
      allOptions: dealersList,
      dependsOn: ['territory'],
      filterFn: (dealer, parentValues) => {
        if (!parentValues.territory) return true;
        return dealer?.territory_name === parentValues.territory;
      },
      getValueKey: (dealer) => dealer.id,
    },
    {
      name: 'product',
      allOptions: productsList,
      dependsOn: ['territory', 'dealer'],
      filterFn: (product, parentValues, context) => {
        // Complex filtering logic using context
        const { orders, orderProducts } = context;
        // ... filtering logic ...
      },
      getValueKey: (product) => product.id || product.product_code,
    },
  ],
  filterValues: { territory: territoryFilter, dealer: dealerFilter, product: productFilter },
  setFilterValues: { dealer: setDealerFilter, product: setProductFilter },
  context: { orders, orderProducts },
});

// Use filtered options
const filteredDealers = filteredOptions.dealer || dealersList;
const filteredProducts = filteredOptions.product || productsList;
```

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
- MonthlyForecastTab.js
- DailyDemandMultiDay.js

**Visual reference:**
- `/dealer-template-cards` - See DealerTemplateCards.js for DealerProductCard pattern

### useStandardPagination.js
**Type**: React Hook  
**Purpose**: Universal pagination hook for all tables in the application. Provides consistent pagination behavior across all pages.

**Hook:**
- `useStandardPagination(itemName, defaultPageSize)` - Returns pagination state and handlers

**Parameters:**
- `itemName` - Name of the items (e.g., 'orders', 'products', 'users')
- `defaultPageSize` - Default page size (default: 20)

**Returns:**
- `pagination` - Pagination state object
- `setPagination` - Function to update pagination state
- `handleTableChange` - Handler for table change events

**Used in application pages:**
- PlacedOrders.js
- DealerReports.js
- TSOReport.js
- UserManagement.js
- ProductManagement.js
- TransportManagement.js

## Import Examples

```javascript
// From application pages (frontend/src/pages/)
import { getStandardPagination } from '../templates/UIConfig';
import { StandardExpandableTable } from '../templates/TableTemplate';
import { STANDARD_CARD_CONFIG } from '../templates/CardTemplates';
import { DealerProductCard } from '../templates/DealerProductCard';
import { useCascadingFilters } from '../templates/useCascadingFilters';
import { useStandardPagination } from '../templates/useStandardPagination';

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
