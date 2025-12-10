/**
 * SINGLE SOURCE OF TRUTH FOR ALL UI TEMPLATES
 * 
 * This file contains ALL UI configurations, styles, sizes, and helper functions.
 * DO NOT split UI templates into multiple files - this is the ONLY file for UI templates.
 * 
 * If you're confused about where something should go, ASK FOR CLARIFICATION before creating new files.
 * 
 * Organization:
 * 1. CARD CONFIGURATIONS - All Card component styling configs
 * 2. COMPONENT SIZES - All component size configurations
 * 3. STYLES - All style objects (tags, labels, etc.)
 * 4. ROW GUTTERS - All Row gutter configurations
 * 5. TYPOGRAPHY - Page title/subtitle configs
 * 6. MODAL/DIALOG CONFIGS - Modal, Popconfirm, Tooltip configs
 * 7. TABLE CONFIGS - Table-specific configurations
 * 8. FORM CONFIGS - Form, Input, Select, Button configs
 * 9. DATE PICKER CONFIGS - Date picker configurations and helpers
 * 10. PAGINATION - Pagination configurations
 * 11. HELPER FUNCTIONS - Reusable component generators
 */

import { Row, Col, Space, Typography, DatePicker, Input, Select, InputNumber, Button, Card } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

// ============================================================================
// 1. CARD CONFIGURATIONS
// ============================================================================

/**
 * STANDARD CARD CONFIGURATION
 * Standard card configuration used throughout the application.
 */
export const STANDARD_CARD_CONFIG = {
  style: {
    marginBottom: '16px',
    borderRadius: '8px',
  },
  bodyStyle: {
    padding: '12px',
  },
};

/**
 * FILTER CARD CONFIGURATION
 * Standard configuration for filter/search cards only.
 * Includes light lavender background (#f9f0ff) to distinguish filter cards.
 */
export const FILTER_CARD_CONFIG = {
  bordered: true,
  style: {
    marginBottom: '16px',
    borderRadius: '8px',
    background: '#f9f0ff',
  },
  bodyStyle: {
    padding: '12px',
  },
};

/**
 * DATE SELECTION CARD CONFIGURATION
 * Standard configuration for date selection/viewing cards only.
 * Includes blue-grey background (#e6f0ff) to distinguish date selection cards.
 */
export const DATE_SELECTION_CARD_CONFIG = {
  style: {
    marginBottom: '16px',
    borderRadius: '8px',
    background: '#e6f0ff',
  },
  bodyStyle: {
    padding: '12px',
  },
};

/**
 * FORM CARD CONFIGURATION
 * Standard configuration for form/input cards only.
 * Includes honeydew background (#f0fff4) to distinguish form cards.
 */
export const FORM_CARD_CONFIG = {
  style: {
    marginBottom: '16px',
    borderRadius: '8px',
    background: '#f0fff4',
  },
  bodyStyle: {
    padding: '12px',
  },
};

/**
 * IMPORT CARD CONFIGURATION
 * Standard configuration for import/upload section cards only.
 * Includes light cream background (#fefce8) to distinguish import cards.
 */
export const IMPORT_CARD_CONFIG = {
  style: {
    marginBottom: '16px',
    borderRadius: '8px',
    background: '#fefce8',
  },
  bodyStyle: {
    padding: '12px',
  },
};

/**
 * ACTION CARD CONFIGURATION
 * Standard configuration for action button cards only.
 * Includes light sky blue background (#f0f9ff) to distinguish action cards.
 */
export const ACTION_CARD_CONFIG = {
  style: {
    marginBottom: '16px',
    borderRadius: '8px',
    background: '#f0f9ff',
  },
  bodyStyle: {
    padding: '12px',
  },
};

/**
 * TABLE CARD CONFIGURATION
 * Standard configuration for table cards only.
 * Includes light indigo background (#f0f0ff) to distinguish table cards.
 */
export const TABLE_CARD_CONFIG = {
  style: {
    borderRadius: '8px',
    background: '#f0f0ff',
  },
  bodyStyle: {
    padding: '12px',
  },
};

/**
 * EXPANDABLE TABLE CARD CONFIGURATION
 * Standard configuration for expandable table cards only.
 * Includes very light purple background (#faf5ff) to distinguish expandable table cards.
 */
export const EXPANDABLE_TABLE_CARD_CONFIG = {
  style: {
    borderRadius: '8px',
    background: '#faf5ff',
  },
  bodyStyle: {
    padding: '12px',
  },
};

/**
 * @deprecated Use STANDARD_CARD_CONFIG instead. Kept for backward compatibility.
 */
export const CONTENT_CARD_CONFIG = STANDARD_CARD_CONFIG;

/**
 * STANDARD CARD STYLING CONSTANTS
 */
export const STANDARD_CARD_STYLES = {
  marginBottom: '16px',
  borderRadius: '8px',
  filterCardBodyPadding: '12px',
};

// ============================================================================
// 2. COMPONENT SIZES
// ============================================================================

/**
 * Standard component sizes - 'small' is used for most Forms, Inputs, Selects, Buttons, Tables
 */
export const STANDARD_FORM_SIZE = 'small';
export const STANDARD_INPUT_SIZE = 'small';
export const STANDARD_SELECT_SIZE = 'small';
export const STANDARD_BUTTON_SIZE = 'small';
export const STANDARD_TABLE_SIZE = 'small';
export const STANDARD_RADIO_SIZE = 'small';
export const STANDARD_INPUT_NUMBER_SIZE = 'small';

// ============================================================================
// 3. STYLES
// ============================================================================

/**
 * STANDARD TAG STYLE
 * fontSize: '12px', padding: '2px 8px' - Used in TSODashboard, ProductQuotaManagement
 */
export const STANDARD_TAG_STYLE = {
  fontSize: '12px',
  padding: '2px 8px',
};

/**
 * STANDARD FORM LABEL STYLE
 * fontSize: '12px', fontWeight: 'bold' - Used in ReviewOrdersTablet, DailyDemand
 */
export const STANDARD_FORM_LABEL_STYLE = {
  fontSize: '12px',
  fontWeight: 'bold',
};

/**
 * STANDARD TABLE HEADER STYLE
 * Light grey background for table headers in table cards
 */
export const STANDARD_TABLE_HEADER_STYLE = {
  backgroundColor: '#f5f5f5',
};

// ============================================================================
// 4. ROW GUTTERS
// ============================================================================

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

// ============================================================================
// 5. TYPOGRAPHY
// ============================================================================

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

// ============================================================================
// 6. MODAL/DIALOG CONFIGS
// ============================================================================

/**
 * Standard modal configuration - footer={null}, width={600}
 */
export const STANDARD_MODAL_CONFIG = {
  footer: null,
  width: 600,
};

/**
 * Standard popconfirm configuration - Used in UserManagement, PlacedOrders
 */
export const STANDARD_POPCONFIRM_CONFIG = {
  okText: 'Yes',
  cancelText: 'No',
};

/**
 * Standard tooltip - basic configuration used in PlacedOrders
 */
export const STANDARD_TOOLTIP_CONFIG = {};

// ============================================================================
// 7. TABLE CONFIGS
// ============================================================================

/**
 * Table wrapper card - Used in ProductManagement and other pages with tables
 */
export const STANDARD_TABLE_CARD_CONFIG = {
  style: {
    borderRadius: '8px',
  },
};

/**
 * Standard empty state configuration
 */
export const STANDARD_EMPTY_CONFIG = {
  style: {
    padding: '40px 0',
  },
};

// ============================================================================
// 8. FORM CONFIGS
// ============================================================================

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
 * Standard statistic configuration for white text on gradient cards
 */
export const STANDARD_STATISTIC_CONFIG = {
  valueStyle: {
    fontSize: '24px',
  },
};

/**
 * Standard upload configuration for Excel imports
 */
export const STANDARD_UPLOAD_CONFIG = {
  accept: '.xlsx,.xls',
  showUploadList: false,
};

/**
 * Standard badge configuration
 */
export const STANDARD_BADGE_CONFIG = {
  showZero: true,
  overflowCount: 999,
};

/**
 * Standard tabs - basic configuration
 */
export const STANDARD_TABS_CONFIG = {};

/**
 * Standard divider - basic configuration
 */
export const STANDARD_DIVIDER_CONFIG = {};

// ============================================================================
// 9. DATE PICKER CONFIGS
// ============================================================================

/**
 * Standard date picker configuration - size: 'small', format: 'YYYY-MM-DD'
 */
export const STANDARD_DATE_PICKER_CONFIG = {
  size: 'small',
  format: 'YYYY-MM-DD',
};

/**
 * Creates a standard date picker configuration with disabled dates and custom date cell renderer
 * @param {Array<string>} availableDates - Array of available date strings in 'YYYY-MM-DD' format
 * @returns {Object} Object with disabledDate and dateCellRender functions
 */
export const createStandardDatePickerConfig = (availableDates = []) => {
  const disabledDate = (current) => {
    if (!current) return false;
    const dateString = current.format('YYYY-MM-DD');
    return !availableDates.includes(dateString);
  };

  const dateCellRender = (current) => {
    const dateString = current.format('YYYY-MM-DD');
    const hasData = availableDates.includes(dateString);
    
    return (
      <div style={{
        color: hasData ? '#000' : '#d9d9d9',
        backgroundColor: hasData ? 'transparent' : '#f5f5f5',
        cursor: hasData ? 'pointer' : 'not-allowed',
        borderRadius: '4px',
        padding: '2px'
      }}>
        {current.date()}
      </div>
    );
  };

  return {
    disabledDate,
    dateCellRender,
  };
};

/**
 * Creates a standard date range picker component with Start Date and End Date (optional)
 * @param {Object} props - Configuration object
 * @param {dayjs.Dayjs|null} props.startDate - Start date value
 * @param {Function} props.setStartDate - Function to update start date
 * @param {dayjs.Dayjs|null} props.endDate - End date value (null for optional)
 * @param {Function} props.setEndDate - Function to update end date
 * @param {Function} props.disabledDate - Function to disable dates (from createStandardDatePickerConfig)
 * @param {Function} props.dateCellRender - Function to render date cells (from createStandardDatePickerConfig)
 * @param {Array<string>} props.availableDates - Array of available date strings in 'YYYY-MM-DD' format
 * @param {Object} props.colSpan - Optional column span configuration { xs, sm, md } (default: { xs: 24, sm: 12, md: 2 })
 * @param {Function} props.onStartChange - Optional callback when start date changes
 * @param {Function} props.onEndChange - Optional callback when end date changes
 * @returns {JSX.Element} Date range picker JSX (two Col components)
 */
export const createStandardDateRangePicker = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  disabledDate,
  dateCellRender,
  availableDates = [],
  colSpan = { xs: 24, sm: 12, md: 2 },
  onStartChange,
  onEndChange,
}) => {
  return (
    <>
      <Col xs={colSpan.xs} sm={colSpan.sm} md={colSpan.md}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong style={STANDARD_FORM_LABEL_STYLE}>Start Date</Text>
          <DatePicker
            {...STANDARD_DATE_PICKER_CONFIG}
            value={startDate}
            onChange={(date) => {
              setStartDate(date);
              if (onStartChange) onStartChange(date);
            }}
            style={{ width: '100%' }}
            placeholder="Start date"
            disabledDate={disabledDate}
            dateRender={dateCellRender}
          />
        </Space>
      </Col>
      <Col xs={colSpan.xs} sm={colSpan.sm} md={colSpan.md}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong style={STANDARD_FORM_LABEL_STYLE}>End Date (Optional)</Text>
          <DatePicker
            {...STANDARD_DATE_PICKER_CONFIG}
            value={endDate}
            onChange={(date) => {
              setEndDate(date);
              if (onEndChange) onEndChange(date);
            }}
            style={{ width: '100%' }}
            placeholder="End date (optional)"
            disabledDate={(current) => {
              if (!current) return false;
              if (startDate && current < startDate.startOf('day')) {
                return true;
              }
              const dateString = current.format('YYYY-MM-DD');
              return !availableDates.includes(dateString);
            }}
            dateRender={dateCellRender}
            allowClear
          />
        </Space>
      </Col>
    </>
  );
};

// ============================================================================
// 10. PAGINATION
// ============================================================================

/**
 * Standard pagination configuration
 */
export const STANDARD_PAGINATION = {
  current: 1,
  pageSize: 20,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  pageSizeOptions: ['10', '20', '50', '100'],
  defaultPageSize: 20,
};

/**
 * Get standard pagination config with custom showTotal message
 * @param {string} itemName - Name of the items (e.g., 'orders', 'products', 'users')
 * @returns {Object} Standard pagination configuration
 */
export const getStandardPagination = (itemName = 'items') => ({
  current: 1,
  pageSize: 20,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ${itemName}`,
  pageSizeOptions: ['10', '20', '50', '100'],
  defaultPageSize: 20,
});

// ============================================================================
// 11. HELPER FUNCTIONS
// ============================================================================

/**
 * STANDARD SPACE SIZES
 */
export const STANDARD_SPACE_SIZE_SMALL = 'small';
export const STANDARD_SPACE_SIZE_MIDDLE = 'middle';
export const STANDARD_SPACE_SIZE_LARGE = 'large';

/**
 * STANDARD SPIN SIZE
 */
export const STANDARD_SPIN_SIZE = 'large';

/**
 * TABLE HEADER WITH INLINE SEARCH
 * 
 * Standard table header component with title and inline search box.
 * Works for BOTH static tables and expandable tables.
 * 
 * @param {Object} props
 * @param {string} props.title - Table title (e.g., "Orders", "Users")
 * @param {number} props.count - Item count to display
 * @param {string} props.searchTerm - Current search term value
 * @param {Function} props.onSearchChange - Search input onChange handler: (e) => setSearchTerm(e.target.value)
 * @param {string} props.searchPlaceholder - Placeholder text for search input (default: "Search...")
 * @param {boolean} props.showCount - Whether to show count in title (default: true)
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
        size="small"
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
 * Works for BOTH static tables and expandable tables.
 * 
 * @param {Object} props
 * @param {string} props.title - Table title (e.g., "Dealers", "Orders")
 * @param {number} props.count - Item count to display
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
            size="small"
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
          size="small"
          allowClear
          style={{ width: '300px' }}
        />
      </div>
    </div>
  );
};

/**
 * UNIVERSAL CARD TEMPLATE
 * 
 * Consolidated template for Filter Card, Form Card, and Date Selection Card.
 * This universal template includes:
 * - 2 date pickers
 * - 4 form fields (Select or Input)
 * - 1 quantity form field (InputNumber)
 * - 1 search bar (Input with SearchOutlined)
 * - 3 buttons
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (default: "Filter")
 * @param {Object} props.cardConfig - Card configuration object (default: FILTER_CARD_CONFIG)
 * @param {Object} props.datePicker1 - First date picker configuration
 * @param {string} props.datePicker1.label - Label text (default: "Start Date")
 * @param {dayjs.Dayjs|null} props.datePicker1.value - Date value
 * @param {Function} props.datePicker1.onChange - onChange handler: (date) => void
 * @param {string} props.datePicker1.placeholder - Placeholder text
 * @param {Object} props.datePicker2 - Second date picker configuration
 * @param {string} props.datePicker2.label - Label text (default: "End Date")
 * @param {dayjs.Dayjs|null} props.datePicker2.value - Date value
 * @param {Function} props.datePicker2.onChange - onChange handler: (date) => void
 * @param {string} props.datePicker2.placeholder - Placeholder text
 * @param {Array<Object>} props.formFields - Array of 4 form field configurations
 * @param {string} props.formFields[].label - Field label
 * @param {string} props.formFields[].type - Field type: 'select' or 'input' (default: 'select')
 * @param {any} props.formFields[].value - Field value
 * @param {Function} props.formFields[].onChange - onChange handler
 * @param {string} props.formFields[].placeholder - Placeholder text
 * @param {Array} props.formFields[].options - Options array for Select (only for type: 'select')
 * @param {Object} props.quantityField - Quantity field configuration
 * @param {string} props.quantityField.label - Label text (default: "Quantity")
 * @param {number|null} props.quantityField.value - Quantity value
 * @param {Function} props.quantityField.onChange - onChange handler: (value) => void
 * @param {string} props.quantityField.placeholder - Placeholder text
 * @param {Object} props.searchBar - Search bar configuration
 * @param {string} props.searchBar.placeholder - Placeholder text (default: "Search...")
 * @param {string} props.searchBar.value - Search value
 * @param {Function} props.searchBar.onChange - onChange handler: (e) => void
 * @param {Array<Object>} props.buttons - Array of 3 button configurations
 * @param {string} props.buttons[].label - Button label
 * @param {string} props.buttons[].type - Button type: 'primary', 'default', 'dashed', 'link', 'text' (default: 'default')
 * @param {Function} props.buttons[].onClick - onClick handler: () => void
 * @param {string|ReactNode} props.buttons[].icon - Button icon (optional)
 * @param {Array} props.gutter - Row gutter configuration (default: STANDARD_ROW_GUTTER)
 * @returns {JSX.Element} Universal card template JSX
 */
export const UniversalCardTemplate = ({
  title = 'Filter',
  cardConfig = FILTER_CARD_CONFIG,
  datePicker1,
  datePicker2,
  formFields = [],
  quantityField,
  searchBar,
  buttons = [],
  gutter = STANDARD_ROW_GUTTER,
}) => {
  // Ensure we have exactly 4 form fields (pad with empty if needed)
  const paddedFormFields = [...formFields];
  while (paddedFormFields.length < 4) {
    paddedFormFields.push(null);
  }
  const displayFormFields = paddedFormFields.slice(0, 4);

  // Ensure we have exactly 3 buttons (pad with null if needed)
  const paddedButtons = [...buttons];
  while (paddedButtons.length < 3) {
    paddedButtons.push(null);
  }
  const displayButtons = paddedButtons.slice(0, 3);

  return (
    <Card title={title} {...cardConfig}>
      <Row gutter={gutter} align="top">
        {/* Date Pickers */}
        {datePicker1 && (
          <Col xs={24} sm={12} flex={1} style={{ maxWidth: '12.5rem' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>
                {datePicker1.label || 'Start Date'}
              </Text>
              <DatePicker
                {...STANDARD_DATE_PICKER_CONFIG}
                value={datePicker1.value}
                onChange={datePicker1.onChange}
                placeholder={datePicker1.placeholder || 'Select start date'}
                style={{ width: '100%' }}
                disabledDate={datePicker1.disabledDate}
                dateRender={datePicker1.dateRender}
              />
            </Space>
          </Col>
        )}
        {datePicker2 && (
          <Col xs={24} sm={12} flex={1} style={{ maxWidth: '12.5rem' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>
                {datePicker2.label || 'End Date'}
              </Text>
              <DatePicker
                {...STANDARD_DATE_PICKER_CONFIG}
                value={datePicker2.value}
                onChange={datePicker2.onChange}
                placeholder={datePicker2.placeholder || 'Select end date'}
                style={{ width: '100%' }}
                disabledDate={datePicker2.disabledDate}
                dateRender={datePicker2.dateRender}
              />
            </Space>
          </Col>
        )}

        {/* 4 Form Fields */}
        {displayFormFields.map((field, index) => {
          if (!field) return null;
          return (
            <Col xs={24} sm={12} flex={1} style={{ maxWidth: '12.5rem' }} key={`form-field-${index}`}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong style={STANDARD_FORM_LABEL_STYLE}>
                  {field.label || `Field ${index + 1}`}
                </Text>
                {field.type === 'input' ? (
                  <Input
                    size={STANDARD_INPUT_SIZE}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={field.placeholder || `Enter ${field.label || 'value'}`}
                    style={{ width: '100%' }}
                  />
                ) : (
                  <Select
                    size={STANDARD_INPUT_SIZE}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={field.placeholder || `Select ${field.label || 'option'}`}
                    style={{ width: '100%' }}
                    allowClear={field.allowClear !== false}
                    showSearch={field.showSearch !== false}
                    filterOption={field.showSearch !== false ? (input, option) => {
                      const optionText = option?.children?.toString() || '';
                      return optionText.toLowerCase().includes(input.toLowerCase());
                    } : undefined}
                  >
                    {field.options && field.options.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                )}
              </Space>
            </Col>
          );
        })}

        {/* Quantity Field */}
        {quantityField && (
          <Col xs={24} sm={12} flex={1} style={{ maxWidth: '12.5rem' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>
                {quantityField.label || 'Quantity'}
              </Text>
              <InputNumber
                size={STANDARD_INPUT_NUMBER_SIZE}
                value={quantityField.value}
                onChange={quantityField.onChange}
                placeholder={quantityField.placeholder || 'Enter quantity'}
                style={{ width: '100%' }}
                min={quantityField.min}
                max={quantityField.max}
              />
            </Space>
          </Col>
        )}

        {/* Search Bar */}
        {searchBar && (
          <Col xs={24} sm={12} flex={1} style={{ maxWidth: '12.5rem' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>
                Search
              </Text>
              <Input
                size={STANDARD_INPUT_SIZE}
                prefix={<SearchOutlined />}
                value={searchBar.value}
                onChange={searchBar.onChange}
                placeholder={searchBar.placeholder || 'Search...'}
                style={{ width: '100%' }}
                allowClear
              />
            </Space>
          </Col>
        )}

        {/* Buttons */}
        {displayButtons.map((button, index) => {
          if (!button) return null;
          return (
            <Col xs={24} sm={12} flex={1} key={`button-${index}`} style={{ maxWidth: '12.5rem' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong style={{ ...STANDARD_FORM_LABEL_STYLE, opacity: 0, lineHeight: '1.5', display: 'block', minHeight: '20px' }}>
                  &nbsp;
                </Text>
                <Button
                  type={button.type || 'default'}
                  onClick={button.onClick}
                  icon={button.icon}
                  size={STANDARD_BUTTON_SIZE}
                  style={{ width: '100%' }}
                >
                  {button.label || `Button ${index + 1}`}
                </Button>
              </Space>
            </Col>
          );
        })}
      </Row>
    </Card>
  );
};

