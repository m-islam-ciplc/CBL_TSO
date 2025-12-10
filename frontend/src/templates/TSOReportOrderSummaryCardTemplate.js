/**
 * TSO REPORT ORDER SUMMARY CARD TEMPLATE
 * 
 * Specialized template for the "Order Summary (Date Range)" card in TSO Report page.
 * This template displays a date range picker and two buttons (Preview, Download).
 * 
 * Features:
 * - Title: "Order Summary (Date Range)"
 * - Date range picker (Start Date, End Date)
 * - 2 buttons (Preview Range Orders, Download Order Summary)
 * - Uses FILTER_CARD_CONFIG for styling
 * - Uses STANDARD_ROW_GUTTER for spacing
 */

import { Row, Col, Space, Typography, DatePicker, Button, Card } from 'antd';
import {
  FILTER_CARD_CONFIG,
  STANDARD_FORM_LABEL_STYLE,
  STANDARD_BUTTON_SIZE,
  STANDARD_DATE_PICKER_CONFIG,
  STANDARD_ROW_GUTTER,
  createStandardDateRangePicker,
} from './UITemplates';

const { Text } = Typography;

/**
 * TSO Report Order Summary Card Template
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (default: "Order Summary (Date Range)")
 * @param {Object} props.dateRangePicker - Date range picker configuration
 * @param {dayjs.Dayjs|null} props.dateRangePicker.startDate - Start date value
 * @param {Function} props.dateRangePicker.setStartDate - Function to update start date
 * @param {dayjs.Dayjs|null} props.dateRangePicker.endDate - End date value
 * @param {Function} props.dateRangePicker.setEndDate - Function to update end date
 * @param {Function} props.dateRangePicker.disabledDate - disabledDate function: (current) => boolean
 * @param {Function} props.dateRangePicker.dateRender - dateRender function: (current) => ReactNode
 * @param {Array<string>} props.dateRangePicker.availableDates - Array of available date strings
 * @param {Object} props.dateRangePicker.colSpan - Column span configuration (default: { xs: 24, sm: 12, md: 2 })
 * @param {Array<Object>} props.buttons - Array of button configurations (2 buttons: Preview, Download)
 * @returns {JSX.Element} TSO Report Order Summary card JSX
 */
export const TSOReportOrderSummaryCardTemplate = ({
  title = 'Order Summary (Date Range)',
  dateRangePicker,
  buttons = [],
}) => {
  // Ensure we have exactly 2 buttons (pad with null if needed)
  const paddedButtons = [...buttons];
  while (paddedButtons.length < 2) {
    paddedButtons.push(null);
  }
  const displayButtons = paddedButtons.slice(0, 2);

  return (
    <Card 
      title={title} 
      {...FILTER_CARD_CONFIG}
    >
      <Row gutter={STANDARD_ROW_GUTTER} align="bottom">
        {/* Date Range Picker */}
        {dateRangePicker && createStandardDateRangePicker({
          startDate: dateRangePicker.startDate,
          setStartDate: dateRangePicker.setStartDate,
          endDate: dateRangePicker.endDate,
          setEndDate: dateRangePicker.setEndDate,
          disabledDate: dateRangePicker.disabledDate,
          dateCellRender: dateRangePicker.dateRender,
          availableDates: dateRangePicker.availableDates || [],
          colSpan: dateRangePicker.colSpan || { xs: 24, sm: 12, md: 2 },
        })}

        {/* Buttons */}
        {displayButtons.map((button, index) => {
          if (!button) return null;
          return (
            <Col xs={24} sm={24} md={6} key={`button-${index}`}>
              <Button
                type={button.type || 'default'}
                icon={button.icon}
                onClick={button.onClick}
                loading={button.loading}
                disabled={button.disabled}
                size={STANDARD_BUTTON_SIZE}
                style={{ width: '100%' }}
              >
                {button.label || `Button ${index + 1}`}
              </Button>
            </Col>
          );
        })}
      </Row>
    </Card>
  );
};


