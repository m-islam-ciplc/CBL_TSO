/**
 * DAILY ORDER REPORT CARD TEMPLATE
 * 
 * Specialized template for the "Daily Order Report" card in Reports page.
 * This template has a simple layout:
 * - 1 date picker (Select Date)
 * - 3 buttons (Preview Orders, Download Daily Order Report, Download MR CSV) - right aligned
 * 
 * Used in: Reports page - Daily Order Report tab
 * Route: /reports
 */

import { Row, Col, Space, Typography, DatePicker, Button, Card } from 'antd';
import {
  UNIVERSAL_CARD_CONFIG,
  STANDARD_FORM_LABEL_STYLE,
  STANDARD_BUTTON_SIZE,
  STANDARD_DATE_PICKER_CONFIG,
  COMPACT_ROW_GUTTER,
} from './UITemplates';

const { Text } = Typography;

/**
 * Daily Order Report Card Template
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (default: "Daily Order Report")
 * @param {Object} props.datePicker1 - Date picker configuration
 * @param {Array<Object>} props.buttons - Array of button configurations (3 buttons: Preview, Download Report, Download MR CSV)
 * @param {Array} props.gutter - Row gutter configuration (default: COMPACT_ROW_GUTTER)
 * @returns {JSX.Element} Daily Order Report card JSX
 */
export const DailyOrderReportCardTemplate = ({
  title = 'Daily Order Report',
  datePicker1,
  buttons = [],
  gutter = COMPACT_ROW_GUTTER,
}) => {
  // Ensure we have exactly 3 buttons (pad with null if needed)
  const paddedButtons = [...buttons];
  while (paddedButtons.length < 3) {
    paddedButtons.push(null);
  }
  const displayButtons = paddedButtons.slice(0, 3);

  return (
    <Card title={title} {...UNIVERSAL_CARD_CONFIG} headStyle={{ textAlign: 'left' }}>
      <Row gutter={gutter} align="top">
        {/* Date Picker */}
        {datePicker1 && (
          <Col xs={24} sm={12} flex={1} style={{ maxWidth: '12.5rem' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>
                {datePicker1.label || 'Select Date'}
              </Text>
              <DatePicker
                {...STANDARD_DATE_PICKER_CONFIG}
                value={datePicker1.value}
                onChange={datePicker1.onChange}
                placeholder={datePicker1.placeholder || 'Select date for report'}
                style={{ width: '100%' }}
                disabledDate={datePicker1.disabledDate}
                dateRender={datePicker1.dateRender}
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
                  onClick={button.onClick}
                  icon={button.icon}
                  disabled={button.disabled}
                  loading={button.loading}
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


