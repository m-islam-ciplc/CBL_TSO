# Templates

**Location**: `frontend/src/templates/`

## Purpose

This folder contains **reusable template code** that is imported into application pages. These templates ensure design consistency across the entire application.

## Key Principle

**EVERY UI element MUST use a template. NO EXCEPTIONS.**

- **Templates** (this folder) = Code imported into application pages  
  Example: `UIConfig.js` imported in PlacedOrders.js, DealerReports.js, etc.

- **UnifiedUITemplate.js** (`frontend/src/pages/examples/UnifiedUITemplate.js`) = Single visual reference showing ALL standardized UI elements  
  Access via: `/template-ui` route or "Templates > UI Templates" menu

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
- `STANDARD_CARD_CONFIG` - Unified card configuration for all cards (with or without title, with or without buttons)
- `TABLE_CARD_CONFIG` - For table cards
- `STANDARD_CARD_STYLES` - Standard styling constants
- `FILTER_CARD_CONFIG` - @deprecated Use `STANDARD_CARD_CONFIG` instead
- `CONTENT_CARD_CONFIG` - @deprecated Use `STANDARD_CARD_CONFIG` instead

**Used in application pages:**
- All pages use these patterns for consistent card styling

**Visual reference:**
- `/template-ui` - See UnifiedUITemplate.js for all card patterns

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
- `/template-ui` - See UnifiedUITemplate.js for DealerProductCard pattern

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
