/**
 * STANDARD UI ELEMENTS TEMPLATE
 * 
 * Standardized configurations for all UI elements ACTUALLY USED in the codebase.
 * 
 * Only elements that exist in production pages are included here.
 */

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
};
