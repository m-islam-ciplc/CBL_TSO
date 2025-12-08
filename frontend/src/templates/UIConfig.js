/**
 * UI CONFIGURATION
 * 
 * Standard UI component configurations for the application.
 * Contains pagination, date picker, and other UI utility configurations.
 * Use these configurations to ensure consistency across all components.
 */

import { Row, Col, Space, Typography, DatePicker } from 'antd';
import { STANDARD_ROW_GUTTER, STANDARD_FORM_LABEL_STYLE, STANDARD_DATE_PICKER_CONFIG } from './UIElements';

const { Text } = Typography;

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

/**
 * STANDARD DATE PICKER CONFIGURATION
 * 
 * Standard disabled date function and date cell renderer for all calendars.
 */
export const createStandardDatePickerConfig = (availableDates = []) => {
  // Standard: Disable dates that don't have data
  const disabledDate = (current) => {
    if (!current) return false;
    const dateString = current.format('YYYY-MM-DD');
    return !availableDates.includes(dateString);
  };

  // Standard: Custom date cell renderer to gray out dates with no data
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
 * STANDARD DATE RANGE SELECTION TEMPLATE
 * 
 * Standard pattern for date range selection using two separate DatePicker components.
 * This is the recommended approach instead of using RangePicker.
 * Based on the design used in TSOReport.js "My Reports View Orders" and DealerReports.js.
 * 
 * Usage example:
 * 
 * ```jsx
 * import { createStandardDateRangePicker } from '../templates/UIConfig';
 * import { STANDARD_ROW_GUTTER } from '../templates/UIElements';
 * import { createStandardDatePickerConfig } from '../templates/UIConfig';
 * 
 * const [startDate, setStartDate] = useState(dayjs());
 * const [endDate, setEndDate] = useState(null); // Blank by default (optional)
 * const { disabledDate, dateCellRender } = createStandardDatePickerConfig(availableDates);
 * 
 * <Row gutter={STANDARD_ROW_GUTTER} align="bottom">
 *   {createStandardDateRangePicker({
 *     startDate,
 *     setStartDate,
 *     endDate,
 *     setEndDate,
 *     disabledDate,
 *     dateCellRender,
 *     availableDates,
 *     colSpan: { xs: 24, sm: 12, md: 6 } // Optional, defaults to xs={24} sm={12} md={6}
 *   })}
 * </Row>
 * ```
 * 
 * Key features (based on DealerReports.js design):
 * - Row with `gutter={STANDARD_ROW_GUTTER}` and `align="bottom"`
 * - Column span: `xs={24} sm={12} md={6}` (4 fields per row on medium+ screens) by default
 * - Space with `direction="vertical"` and `width: '100%'` (no size prop)
 * - End Date starts as `null` (blank) - it's optional
 * - End Date label: "End Date (Optional)" (directly in the label, not as secondary text)
 * - End Date placeholder: "End date (optional)" (simpler, clearer)
 * - End Date has `allowClear` prop to allow clearing the selection
 * - End Date picker disables dates before Start Date
 * - Filter logic: If only startDate is provided, filter for that single date. If both are provided, filter for the range.
 * - Both use `disabledDate` and `dateRender` from `createStandardDatePickerConfig`
 * 
 * This pattern is used in:
 * - DealerReports.js (Daily Demand Orders - View Orders) - **TEMPLATE DESIGN**
 * - PlacedOrders.js (Date Range filter)
 */

/**
 * Creates a standard date range picker component with Start Date and End Date (optional)
 * Based on the design used in DealerReports.js "Daily Demand Orders" tab.
 * 
 * @param {Object} props - Configuration object
 * @param {dayjs.Dayjs|null} props.startDate - Start date value
 * @param {Function} props.setStartDate - Function to update start date
 * @param {dayjs.Dayjs|null} props.endDate - End date value (null for optional)
 * @param {Function} props.setEndDate - Function to update end date
 * @param {Function} props.disabledDate - Function to disable dates (from createStandardDatePickerConfig)
 * @param {Function} props.dateCellRender - Function to render date cells (from createStandardDatePickerConfig)
 * @param {Array<string>} props.availableDates - Array of available date strings in 'YYYY-MM-DD' format
 * @param {Object} props.colSpan - Optional column span configuration { xs, sm, md }
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
  colSpan = { xs: 24, sm: 12, md: 6 }
}) => {
  return (
    <>
      <Col xs={colSpan.xs} sm={colSpan.sm} md={colSpan.md}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong style={STANDARD_FORM_LABEL_STYLE}>Start Date</Text>
          <DatePicker
            {...STANDARD_DATE_PICKER_CONFIG}
            value={startDate}
            onChange={setStartDate}
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
            onChange={setEndDate}
            style={{ width: '100%' }}
            placeholder="End date (optional)"
            disabledDate={(current) => {
              if (!current) return false;
              // Disable dates before start date
              if (startDate && current < startDate.startOf('day')) {
                return true;
              }
              // Disable dates that don't have data
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

