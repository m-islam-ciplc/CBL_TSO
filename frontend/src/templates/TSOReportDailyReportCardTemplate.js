/**
 * TSO REPORT DAILY REPORT CARD TEMPLATE
 * 
 * Specialized template for the "Daily Report (Single Date)" card in TSO Report page.
 * This template displays a date picker and two buttons (Preview, Download).
 * 
 * Features:
 * - Title: "Daily Report (Single Date)"
 * - 1 date picker (Select Date)
 * - 2 buttons (Preview Orders, Download Daily Order Report)
 * - Uses DATE_SELECTION_CARD_CONFIG for styling
 * - Uses STANDARD_ROW_GUTTER for spacing
 */

import { Row, Col, Space, Typography, DatePicker, Button, Card } from 'antd';
import {
  DATE_SELECTION_CARD_CONFIG,
  STANDARD_FORM_LABEL_STYLE,
  STANDARD_BUTTON_SIZE,
  STANDARD_DATE_PICKER_CONFIG,
  STANDARD_ROW_GUTTER,
} from './UITemplates';

const { Text } = Typography;

/**
 * TSO Report Daily Report Card Template
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (default: "Daily Report (Single Date)")
 * @param {Object} props.datePicker - Date picker configuration
 * @param {dayjs.Dayjs|null} props.datePicker.value - Date value
 * @param {Function} props.datePicker.onChange - onChange handler: (date) => void
 * @param {string} props.datePicker.placeholder - Placeholder text (default: "Select date for report")
 * @param {Function} props.datePicker.disabledDate - disabledDate function: (current) => boolean
 * @param {Function} props.datePicker.dateRender - dateRender function: (current) => ReactNode
 * @param {Array<Object>} props.buttons - Array of button configurations (2 buttons: Preview, Download)
 * @returns {JSX.Element} TSO Report Daily Report card JSX
 */
export const TSOReportDailyReportCardTemplate = ({
  title = 'Daily Report (Single Date)',
  datePicker,
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
      {...DATE_SELECTION_CARD_CONFIG}
    >
      <Row gutter={STANDARD_ROW_GUTTER} align="bottom">
        {/* Date Picker */}
        {datePicker && (
          <Col xs={24} sm={12} md={2}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>Select Date</Text>
              <DatePicker
                {...STANDARD_DATE_PICKER_CONFIG}
                value={datePicker.value}
                onChange={datePicker.onChange}
                style={{ width: '100%' }}
                placeholder={datePicker.placeholder || 'Select date for report'}
                disabledDate={datePicker.disabledDate}
                dateRender={datePicker.dateRender}
              />
            </Space>
          </Col>
        )}

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


