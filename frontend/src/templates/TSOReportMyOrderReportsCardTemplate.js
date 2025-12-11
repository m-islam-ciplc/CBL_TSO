/**
 * TSO REPORT MY ORDER REPORTS CARD TEMPLATE
 * 
 * Unified template for the "My Order Reports" card in TSO Report page.
 * This template displays start date and end date pickers with two buttons (Preview, Download).
 * 
 * Features:
 * - Title: "My Order Reports"
 * - Start Date picker (required)
 * - End Date picker (optional - if not selected, shows single date report)
 * - 2 buttons (Preview Orders/Range Orders, Download Daily Order Report/Order Summary)
 * - Uses FORM_CARD_CONFIG for styling
 * - Uses COMPACT_ROW_GUTTER for spacing
 * - All fields and buttons in one row
 */

import { Row, Col, Space, Typography, DatePicker, Button, Card } from 'antd';
import {
  FORM_CARD_CONFIG,
  STANDARD_FORM_LABEL_STYLE,
  STANDARD_BUTTON_SIZE,
  STANDARD_DATE_PICKER_CONFIG,
  COMPACT_ROW_GUTTER,
} from './UITemplates';

const { Text } = Typography;

/**
 * TSO Report My Order Reports Card Template
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (default: "My Order Reports")
 * @param {Object} props.dateRangePicker - Date range picker configuration
 * @param {dayjs.Dayjs|null} props.dateRangePicker.startDate - Start date value
 * @param {Function} props.dateRangePicker.setStartDate - Function to update start date
 * @param {dayjs.Dayjs|null} props.dateRangePicker.endDate - End date value (optional)
 * @param {Function} props.dateRangePicker.setEndDate - Function to update end date
 * @param {Function} props.dateRangePicker.disabledDate - disabledDate function: (current) => boolean
 * @param {Function} props.dateRangePicker.dateRender - dateRender function: (current) => ReactNode
 * @param {Array<string>} props.dateRangePicker.availableDates - Array of available date strings
 * @param {Array<Object>} props.buttons - Array of button configurations (2 buttons: Preview, Download)
 * @returns {JSX.Element} TSO Report My Order Reports card JSX
 */
export const TSOReportMyOrderReportsCardTemplate = ({
  title = 'My Order Reports',
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
      {...FORM_CARD_CONFIG}
    >
      <Row gutter={COMPACT_ROW_GUTTER} align="bottom">
        {/* Start Date Picker */}
        {dateRangePicker && (
          <Col xs={24} sm={12} flex={1} style={{ maxWidth: '12.5rem' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>Start Date</Text>
              <DatePicker
                {...STANDARD_DATE_PICKER_CONFIG}
                size="small"
                value={dateRangePicker.startDate}
                onChange={dateRangePicker.setStartDate}
                placeholder="Select start date"
                style={{ width: '100%' }}
                disabledDate={dateRangePicker.disabledDate}
                dateRender={dateRangePicker.dateRender}
              />
            </Space>
          </Col>
        )}

        {/* End Date Picker */}
        {dateRangePicker && (
          <Col xs={24} sm={12} flex={1} style={{ maxWidth: '12.5rem' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>End Date</Text>
              <DatePicker
                {...STANDARD_DATE_PICKER_CONFIG}
                size="small"
                value={dateRangePicker.endDate}
                onChange={dateRangePicker.setEndDate}
                placeholder="Select end date"
                style={{ width: '100%' }}
                disabledDate={(current) => {
                  if (!current) return false;
                  if (dateRangePicker.startDate && current < dateRangePicker.startDate.startOf('day')) {
                    return true;
                  }
                  if (dateRangePicker.availableDates && dateRangePicker.availableDates.length > 0) {
                    const dateString = current.format('YYYY-MM-DD');
                    return !dateRangePicker.availableDates.includes(dateString);
                  }
                  if (dateRangePicker.disabledDate) {
                    return dateRangePicker.disabledDate(current);
                  }
                  return false;
                }}
                dateRender={dateRangePicker.dateRender}
                allowClear
              />
            </Space>
          </Col>
        )}

        {/* Buttons */}
        {displayButtons.map((button, index) => {
          if (!button) return null;
          return (
            <Col xs={24} sm={12} flex="none" key={`button-${index}`}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong style={{ ...STANDARD_FORM_LABEL_STYLE, opacity: 0, lineHeight: '1.5', display: 'block', minHeight: '20px' }}>
                  &nbsp;
                </Text>
                <Button
                  type={button.type || 'default'}
                  icon={button.icon}
                  onClick={button.onClick}
                  loading={button.loading}
                  disabled={button.disabled}
                  size={STANDARD_BUTTON_SIZE}
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

