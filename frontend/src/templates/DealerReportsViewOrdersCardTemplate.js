/**
 * DEALER REPORTS VIEW ORDERS CARD TEMPLATE
 * 
 * Specialized template for the "View Orders" card in Dealer Reports page.
 * This template displays a date range picker and two buttons (View, Export Excel).
 * 
 * Features:
 * - Title: "View Orders"
 * - Date range picker (Start Date, End Date)
 * - 2 buttons (View Orders/View Range, Export Excel)
 * - Uses FILTER_CARD_CONFIG for styling
 * - Uses STANDARD_ROW_GUTTER for spacing
 */

import { Row, Col, Button, Card, Space, Typography, DatePicker } from 'antd';
import {
  FILTER_CARD_CONFIG,
  STANDARD_BUTTON_SIZE,
  STANDARD_ROW_GUTTER,
  STANDARD_FORM_LABEL_STYLE,
  STANDARD_DATE_PICKER_CONFIG,
} from './UITemplates';

const { Text } = Typography;

/**
 * Dealer Reports View Orders Card Template
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (default: "View Orders")
 * @param {Object} props.dateRangePicker - Date range picker configuration
 * @param {dayjs.Dayjs|null} props.dateRangePicker.startDate - Start date value
 * @param {Function} props.dateRangePicker.setStartDate - Function to update start date
 * @param {dayjs.Dayjs|null} props.dateRangePicker.endDate - End date value
 * @param {Function} props.dateRangePicker.setEndDate - Function to update end date
 * @param {Function} props.dateRangePicker.disabledDate - disabledDate function: (current) => boolean
 * @param {Function} props.dateRangePicker.dateRender - dateRender function: (current) => ReactNode
 * @param {Array<string>} props.dateRangePicker.availableDates - Array of available date strings
 * @param {Object} props.dateRangePicker.colSpan - Column span configuration (default: { xs: 24, sm: 12, md: 2 })
 * @param {Array<Object>} props.buttons - Array of button configurations (2 buttons: View, Export)
 * @returns {JSX.Element} Dealer Reports View Orders card JSX
 */
export const DealerReportsViewOrdersCardTemplate = ({
  title = 'View Orders',
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
        {/* Start Date */}
        {dateRangePicker && (
          <Col xs={24} sm={12} flex={1} style={{ maxWidth: '12.5rem' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>Start Date</Text>
              <DatePicker
                {...STANDARD_DATE_PICKER_CONFIG}
                value={dateRangePicker.startDate}
                onChange={dateRangePicker.setStartDate}
                placeholder="Start date"
                style={{ width: '100%' }}
                disabledDate={dateRangePicker.disabledDate}
                dateRender={dateRangePicker.dateRender}
              />
            </Space>
          </Col>
        )}

        {/* End Date */}
        {dateRangePicker && (
          <Col xs={24} sm={12} flex={1} style={{ maxWidth: '12.5rem' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>End Date (Optional)</Text>
              <DatePicker
                {...STANDARD_DATE_PICKER_CONFIG}
                value={dateRangePicker.endDate}
                onChange={dateRangePicker.setEndDate}
                placeholder="End date (optional)"
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


