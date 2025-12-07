/**
 * STANDARD UI ELEMENTS TEMPLATE
 * 
 * Standardized configurations for all UI elements ACTUALLY USED in the codebase.
 * 
 * Only elements that exist in production pages are included here.
 */

import { Input, Typography, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

/**
 * STANDARD ROW GUTTER CONFIGURATIONS
 * Based on actual usage in frontend/src/pages
 */

/**
 * [16, 16] - Most common gutter (used in most pages)
 */
export const STANDARD_ROW_GUTTER = [16, 16];

/**
 * [12, 12] - Used in PlacedOrders, Dashboard
 */
export const COMPACT_ROW_GUTTER = [12, 12];

/**
 * [8, 8] - Used in ReviewOrdersTablet, DailyDemand, NewOrdersTablet, DailyReport
 */
export const TIGHT_ROW_GUTTER = [8, 8];

/**
 * [4, 6] - Used in ReviewOrdersTablet
 */
export const MINIMAL_ROW_GUTTER = [4, 6];

/**
 * [8, 12] - Used in ReviewOrdersTablet
 */
export const TIGHT_VERTICAL_ROW_GUTTER = [8, 12];

/**
 * Single number 16 - Used in DealerReports, DailyReport
 */
export const SINGLE_ROW_GUTTER = 16;

/**
 * STANDARD TAG STYLES
 * Based on actual usage in frontend/src/pages
 */

/**
 * fontSize: '12px', padding: '2px 8px' - Used in TSODashboard, ProductQuotaManagement
 * This is the most common pattern for table tags
 */
export const STANDARD_TAG_STYLE = {
  fontSize: '12px',
  padding: '2px 8px',
};

/**
 * STANDARD FORM ITEM LABEL STYLES
 * Based on actual usage in frontend/src/pages
 */

/**
 * fontSize: '12px', fontWeight: 'bold' - Used in ReviewOrdersTablet, DailyDemand
 */
export const STANDARD_FORM_LABEL_STYLE = {
  fontSize: '12px',
  fontWeight: 'bold',
};

/**
 * STANDARD COMPONENT SIZES
 * Based on actual usage in frontend/src/pages
 */

/**
 * 'small' - Used for most Forms, Inputs, Selects, Buttons, Tables throughout the codebase
 */
export const STANDARD_FORM_SIZE = 'small';
export const STANDARD_INPUT_SIZE = 'small';
export const STANDARD_SELECT_SIZE = 'small';
export const STANDARD_BUTTON_SIZE = 'small';
export const STANDARD_TABLE_SIZE = 'small';

/**
 * STANDARD TABLE CONFIGURATION
 * Based on actual usage in frontend/src/pages
 */

/**
 * Table wrapper card - Used in ProductManagement and other pages with tables
 */
export const STANDARD_TABLE_CARD_CONFIG = {
  style: {
    borderRadius: '8px',
  },
};

/**
 * STANDARD TABLE HEADER STYLE
 * Light grey background for table headers in table cards
 */
export const STANDARD_TABLE_HEADER_STYLE = {
  backgroundColor: '#f5f5f5',
};

/**
 * STANDARD TYPOGRAPHY
 * Based on actual usage in frontend/src/pages
 */

/**
 * Page title - level 3, marginBottom 8px - Used in ALL pages
 */
export const STANDARD_PAGE_TITLE_CONFIG = {
  level: 3,
  style: { marginBottom: '8px' },
};

/**
 * Page subtitle - type secondary, marginBottom 24px, display block - Used in ALL pages
 */
export const STANDARD_PAGE_SUBTITLE_CONFIG = {
  type: 'secondary',
  style: { marginBottom: '24px', display: 'block' },
};

/**
 * STANDARD MODAL CONFIGURATION
 * Based on actual usage in frontend/src/pages
 */

/**
 * Standard modal configuration - footer={null}, width={600} - Used in UserManagement, NewOrdersTablet, DailyDemand
 */
export const STANDARD_MODAL_CONFIG = {
  footer: null,
  width: 600,
};

/**
 * STANDARD RADIO CONFIGURATION
 * Based on actual usage in frontend/src/pages
 */

/**
 * Standard radio group size - 'small' - Used in Dashboard
 */
export const STANDARD_RADIO_SIZE = 'small';

/**
 * STANDARD ALERT CONFIGURATION
 * Based on actual usage in frontend/src/pages
 */

/**
 * Standard alert configuration - Used in TSODashboard
 */
export const STANDARD_ALERT_CONFIG = {
  showIcon: true,
  style: {
    padding: '12px',
  },
};

/**
 * STANDARD STATISTIC CONFIGURATION
 * Based on actual usage in frontend/src/pages
 */

/**
 * Standard statistic configuration for white text on gradient cards - Used in Dashboard, TSODashboard, TransportManagement, DailyReport
 */
export const STANDARD_STATISTIC_CONFIG = {
  valueStyle: {
    fontSize: '24px',
  },
};

/**
 * STANDARD UPLOAD CONFIGURATION
 * Based on actual usage in frontend/src/pages
 */

/**
 * Standard upload configuration for Excel imports - Used in ProductManagement, TransportManagement, DealerManagement
 */
export const STANDARD_UPLOAD_CONFIG = {
  accept: '.xlsx,.xls',
  showUploadList: false,
};

/**
 * STANDARD EMPTY CONFIGURATION
 * Based on actual usage in frontend/src/pages
 */

/**
 * Standard empty state configuration - Used in ReviewOrdersTablet, UnifiedUITemplate
 * Note: Use image={Empty.PRESENTED_IMAGE_SIMPLE} from Empty component
 */
export const STANDARD_EMPTY_CONFIG = {
  style: {
    padding: '40px 0',
  },
};

/**
 * STANDARD SPIN CONFIGURATION
 * Based on actual usage in frontend/src/pages
 */

/**
 * Standard spin size - 'large' - Used throughout the application
 */
export const STANDARD_SPIN_SIZE = 'large';

/**
 * STANDARD POPCONFIRM CONFIGURATION
 * Based on actual usage in frontend/src/pages
 */

/**
 * Standard popconfirm configuration - Used in UserManagement, PlacedOrders
 */
export const STANDARD_POPCONFIRM_CONFIG = {
  okText: 'Yes',
  cancelText: 'No',
};

/**
 * STANDARD TOOLTIP CONFIGURATION
 * Based on actual usage in frontend/src/pages
 */

/**
 * Standard tooltip - basic configuration used in PlacedOrders
 */
export const STANDARD_TOOLTIP_CONFIG = {};

/**
 * STANDARD BADGE CONFIGURATION
 * Based on actual usage in frontend/src/pages
 */

/**
 * Standard badge configuration - Used in DailyReport, DealerReports, DealerManagement
 */
export const STANDARD_BADGE_CONFIG = {
  showZero: true,
  overflowCount: 999,
};

/**
 * STANDARD TABS CONFIGURATION
 * Based on actual usage in frontend/src/pages
 */

/**
 * Standard tabs - basic configuration used in DailyReport, DealerReports, ProductQuotaManagement, DailyDemandMultiDay, TSOReport, Settings, WorkflowTests
 */
export const STANDARD_TABS_CONFIG = {};

/**
 * STANDARD INPUT NUMBER CONFIGURATION
 * Based on actual usage in frontend/src/pages
 */

/**
 * Standard input number size - 'small' - Used in DailyDemand, NewOrdersTablet, ProductQuotaManagement, MonthlyForecastTab, DailyDemandMultiDay, AdminSettings
 * Note: Some pages use 'large' for modal inputs, but standard is 'small'
 */
export const STANDARD_INPUT_NUMBER_SIZE = 'small';

/**
 * STANDARD DATE PICKER CONFIGURATION
 * Based on actual usage in frontend/src/pages
 */

/**
 * Standard date picker configuration - Used in Dashboard, DailyReport, DealerReports, ProductQuotaManagement, PlacedOrders, DailyDemandMultiDay
 */
export const STANDARD_DATE_PICKER_CONFIG = {
  size: 'small',
  format: 'YYYY-MM-DD',
};

/**
 * STANDARD SPACE CONFIGURATION
 * Based on actual usage in frontend/src/pages
 */

/**
 * Standard space sizes - Used throughout the application
 * 'small' - Used in PlacedOrders, UserManagement
 * 'middle' - Used in UnifiedUITemplate, DealerReports
 * 'large' - Used in UnifiedUITemplate, DailyReport, TSODashboard
 */
export const STANDARD_SPACE_SIZE_SMALL = 'small';
export const STANDARD_SPACE_SIZE_MIDDLE = 'middle';
export const STANDARD_SPACE_SIZE_LARGE = 'large';

/**
 * STANDARD DIVIDER CONFIGURATION
 * Based on actual usage in frontend/src/pages
 */

/**
 * Standard divider - basic configuration used in WorkflowTests
 */
export const STANDARD_DIVIDER_CONFIG = {};

/**
 * TABLE HEADER WITH INLINE SEARCH
 * 
 * Standard table header component with title and inline search box.
 * This template works for BOTH static tables and expandable tables - the header content is identical.
 * This is the template design used in PlacedOrders.js "Orders & Demands" table.
 * 
 * USAGE PATTERNS:
 * 
 * 1. Static Table (using TABLE_CARD_CONFIG):
 *    <Card {...TABLE_CARD_CONFIG}>
 *      {renderTableHeaderWithSearch({...})}
 *      <Table ... />
 *    </Card>
 * 
 * 2. Expandable Table (using EXPANDABLE_TABLE_CARD_CONFIG):
 *    <Card {...EXPANDABLE_TABLE_CARD_CONFIG}>
 *      {renderTableHeaderWithSearch({...})}
 *      <Table expandable={{...}} ... />
 *    </Card>
 * 
 * 3. Expandable Table (using StandardExpandableTable component):
 *    <StandardExpandableTable
 *      header={renderTableHeaderWithSearch({...})}
 *      ...
 *    />
 * 
 * @param {Object} props
 * @param {string} props.title - Table title (e.g., "Orders", "Users")
 * @param {number} props.count - Item count to display (e.g., filteredOrders.length)
 * @param {string} props.searchTerm - Current search term value
 * @param {Function} props.onSearchChange - Search input onChange handler: (e) => setSearchTerm(e.target.value)
 * @param {string} props.searchPlaceholder - Placeholder text for search input (default: "Search...")
 * @param {boolean} props.showCount - Whether to show count in title (default: true)
 * 
 * @example
 * // Static Table
 * import { renderTableHeaderWithSearch } from '../templates/UIElements';
 * import { TABLE_CARD_CONFIG } from '../templates/CardTemplates';
 * 
 * <Card {...TABLE_CARD_CONFIG}>
 *   {renderTableHeaderWithSearch({
 *     title: 'Orders',
 *     count: filteredOrders.length,
 *     searchTerm: searchTerm,
 *     onSearchChange: (e) => setSearchTerm(e.target.value),
 *     searchPlaceholder: 'Search orders...'
 *   })}
 *   <Table ... />
 * </Card>
 * 
 * @example
 * // Expandable Table
 * import { renderTableHeaderWithSearch } from '../templates/UIElements';
 * import { StandardExpandableTable } from '../templates/TableTemplate';
 * 
 * <StandardExpandableTable
 *   header={renderTableHeaderWithSearch({
 *     title: 'Orders',
 *     count: filteredOrders.length,
 *     searchTerm: searchTerm,
 *     onSearchChange: (e) => setSearchTerm(e.target.value),
 *     searchPlaceholder: 'Search orders...'
 *   })}
 *   ...
 * />
 */
export const renderTableHeaderWithSearch = ({
  title,
  count,
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  showCount = true
}) => {
  return (
    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text strong>{showCount ? `${title} (${count})` : title}</Text>
      <Input
        placeholder={searchPlaceholder}
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={onSearchChange}
        size="middle"
        allowClear
        style={{ width: '300px' }}
      />
    </div>
  );
};

/**
 * TABLE HEADER WITH INLINE SEARCH AND FILTER
 * 
 * Standard table header component with title, inline filter dropdown, and inline search box.
 * This template works for BOTH static tables and expandable tables - the header content is identical.
 * This is the template design used in DealerManagement.js "Dealers" table.
 * 
 * USAGE PATTERNS:
 * 
 * 1. Static Table (using TABLE_CARD_CONFIG):
 *    <Card {...TABLE_CARD_CONFIG}>
 *      {renderTableHeaderWithSearchAndFilter({...})}
 *      <Table ... />
 *    </Card>
 * 
 * 2. Expandable Table (using EXPANDABLE_TABLE_CARD_CONFIG):
 *    <Card {...EXPANDABLE_TABLE_CARD_CONFIG}>
 *      {renderTableHeaderWithSearchAndFilter({...})}
 *      <Table expandable={{...}} ... />
 *    </Card>
 * 
 * 3. Expandable Table (using StandardExpandableTable component):
 *    <StandardExpandableTable
 *      header={renderTableHeaderWithSearchAndFilter({...})}
 *      ...
 *    />
 * 
 * @param {Object} props
 * @param {string} props.title - Table title (e.g., "Dealers", "Orders")
 * @param {number} props.count - Item count to display (e.g., filteredItems.length)
 * @param {string} props.searchTerm - Current search term value
 * @param {Function} props.onSearchChange - Search input onChange handler: (e) => setSearchTerm(e.target.value)
 * @param {string} props.searchPlaceholder - Placeholder text for search input (default: "Search...")
 * @param {boolean} props.showCount - Whether to show count in title (default: true)
 * @param {Object} props.filter - Optional filter configuration
 * @param {string} props.filter.value - Current filter value
 * @param {Function} props.filter.onChange - Filter onChange handler: (value) => setFilter(value)
 * @param {string} props.filter.placeholder - Filter placeholder text
 * @param {Array} props.filter.options - Filter options array: [{ value: 'val', label: 'Label' }]
 * @param {string} props.filter.width - Filter dropdown width (default: '200px')
 * @param {boolean} props.filter.showSearch - Whether filter dropdown is searchable (default: true)
 * 
 * @example
 * // Static Table
 * import { renderTableHeaderWithSearchAndFilter } from '../templates/UIElements';
 * import { TABLE_CARD_CONFIG } from '../templates/CardTemplates';
 * 
 * <Card {...TABLE_CARD_CONFIG}>
 *   {renderTableHeaderWithSearchAndFilter({
 *     title: 'Products',
 *     count: filteredProducts.length,
 *     searchTerm: searchTerm,
 *     onSearchChange: (e) => setSearchTerm(e.target.value),
 *     searchPlaceholder: 'Search products...',
 *     filter: {
 *       value: categoryFilter,
 *       onChange: setCategoryFilter,
 *       placeholder: 'Filter by category',
 *       options: categories.map(c => ({ value: c.id, label: c.name })),
 *       width: '200px',
 *       showSearch: true
 *     }
 *   })}
 *   <Table ... />
 * </Card>
 * 
 * @example
 * // Expandable Table
 * import { renderTableHeaderWithSearchAndFilter } from '../templates/UIElements';
 * import { EXPANDABLE_TABLE_CARD_CONFIG } from '../templates/CardTemplates';
 * 
 * <Card {...EXPANDABLE_TABLE_CARD_CONFIG}>
 *   {renderTableHeaderWithSearchAndFilter({
 *     title: 'Dealers',
 *     count: filteredDealers.length,
 *     searchTerm: searchTerm,
 *     onSearchChange: (e) => setSearchTerm(e.target.value),
 *     searchPlaceholder: 'Search by dealer name or code...',
 *     filter: {
 *       value: territoryFilter,
 *       onChange: setTerritoryFilter,
 *       placeholder: 'Filter by territory',
 *       options: territories.map(t => ({ value: t.code, label: t.name })),
 *       width: '200px',
 *       showSearch: true
 *     }
 *   })}
 *   <Table expandable={{...}} ... />
 * </Card>
 */
export const renderTableHeaderWithSearchAndFilter = ({
  title,
  count,
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  showCount = true,
  filter
}) => {
  return (
    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
      <Text strong>{showCount ? `${title} (${count})` : title}</Text>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        {filter && (
          <Select
            placeholder={filter.placeholder}
            value={filter.value}
            onChange={filter.onChange}
            size="middle"
            style={{ width: filter.width || '200px' }}
            allowClear
            showSearch={filter.showSearch !== false}
            filterOption={filter.showSearch !== false ? (input, option) => {
              const optionText = option?.children?.toString() || '';
              return optionText.toLowerCase().includes(input.toLowerCase());
            } : undefined}
          >
            {filter.options.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        )}
        <Input
          placeholder={searchPlaceholder}
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={onSearchChange}
          size="middle"
          allowClear
          style={{ width: '300px' }}
        />
      </div>
    </div>
  );
};

export default {
  // Row Gutters (actual values from codebase)
  STANDARD_ROW_GUTTER,
  COMPACT_ROW_GUTTER,
  TIGHT_ROW_GUTTER,
  MINIMAL_ROW_GUTTER,
  TIGHT_VERTICAL_ROW_GUTTER,
  SINGLE_ROW_GUTTER,
  
  // Tag Styles (actual pattern from codebase)
  STANDARD_TAG_STYLE,
  
  // Form Labels (actual pattern from codebase)
  STANDARD_FORM_LABEL_STYLE,
  
  // Component Sizes (actual sizes from codebase)
  STANDARD_FORM_SIZE,
  STANDARD_INPUT_SIZE,
  STANDARD_SELECT_SIZE,
  STANDARD_BUTTON_SIZE,
  STANDARD_TABLE_SIZE,
  
  // Table Config (actual pattern from codebase)
  STANDARD_TABLE_CARD_CONFIG,
  STANDARD_TABLE_HEADER_STYLE,
  
  // Typography (actual patterns from codebase)
  STANDARD_PAGE_TITLE_CONFIG,
  STANDARD_PAGE_SUBTITLE_CONFIG,
  
  // Modal (actual pattern from codebase)
  STANDARD_MODAL_CONFIG,
  
  // Radio (actual pattern from codebase)
  STANDARD_RADIO_SIZE,
  
  // Alert (actual pattern from codebase)
  STANDARD_ALERT_CONFIG,
  
  // Statistic (actual pattern from codebase)
  STANDARD_STATISTIC_CONFIG,
  
  // Upload (actual pattern from codebase)
  STANDARD_UPLOAD_CONFIG,
  
  // Empty (actual pattern from codebase)
  STANDARD_EMPTY_CONFIG,
  
  // Spin (actual pattern from codebase)
  STANDARD_SPIN_SIZE,
  
  // Popconfirm (actual pattern from codebase)
  STANDARD_POPCONFIRM_CONFIG,
  
  // Tooltip (actual pattern from codebase)
  STANDARD_TOOLTIP_CONFIG,
  
  // Badge (actual pattern from codebase)
  STANDARD_BADGE_CONFIG,
  
  // Tabs (actual pattern from codebase)
  STANDARD_TABS_CONFIG,
  
  // InputNumber (actual pattern from codebase)
  STANDARD_INPUT_NUMBER_SIZE,
  
  // DatePicker (actual pattern from codebase)
  STANDARD_DATE_PICKER_CONFIG,
  
  // Space (actual patterns from codebase)
  STANDARD_SPACE_SIZE_SMALL,
  STANDARD_SPACE_SIZE_MIDDLE,
  STANDARD_SPACE_SIZE_LARGE,
  
  // Divider (actual pattern from codebase)
  STANDARD_DIVIDER_CONFIG,
  
  // Table Header Templates
  renderTableHeaderWithSearch,
  renderTableHeaderWithSearchAndFilter,
};
