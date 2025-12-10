/**
 * ORDER SUMMARY REPORT CARD TEMPLATE
 * 
 * Specialized template for the "Order Summary Report" card in Reports page.
 * This template has a simple layout:
 * - 2 date pickers (Start Date, End Date)
 * - 2 buttons (Preview Range Orders, Download Order Summary) - right aligned
 * 
 * Used in: Reports page - Order Summary Report tab
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
 * Order Summary Report Card Template
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (default: "Order Summary Report")
 * @param {Object} props.datePicker1 - Start date picker configuration
 * @param {Object} props.datePicker2 - End date picker configuration
 * @param {Array<Object>} props.buttons - Array of button configurations (2 buttons: Preview, Download)
 * @param {Array} props.gutter - Row gutter configuration (default: COMPACT_ROW_GUTTER)
 * @returns {JSX.Element} Order Summary Report card JSX
 */
export const OrderSummaryReportCardTemplate = ({
  title = 'Order Summary Report',
  datePicker1,
  datePicker2,
  buttons = [],
  gutter = COMPACT_ROW_GUTTER,
}) => {
  // Ensure we have exactly 2 buttons (pad with null if needed)
  const paddedButtons = [...buttons];
  while (paddedButtons.length < 2) {
    paddedButtons.push(null);
  }
  const displayButtons = paddedButtons.slice(0, 2);

  return (
    <Card title={title} {...UNIVERSAL_CARD_CONFIG} headStyle={{ textAlign: 'left' }}>
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


