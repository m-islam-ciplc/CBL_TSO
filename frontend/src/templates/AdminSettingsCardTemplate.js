/**
 * ADMIN SETTINGS CARD TEMPLATE
 * 
 * Specialized template for the "Monthly Forecast Period Settings" card in Admin Settings page.
 * This template displays form fields and a save button in a horizontal layout.
 * 
 * Features:
 * - Title: "Monthly Forecast Period Settings"
 * - InputNumber field for start day
 * - Tag display for current period preview
 * - Text description for period information
 * - Save button
 * - Uses STANDARD_CARD_CONFIG for styling
 * - Uses STANDARD_ROW_GUTTER for spacing
 */

import { Card, Form, InputNumber, Button, Row, Col, Space, Typography, Tag } from 'antd';
import { 
  STANDARD_CARD_CONFIG, 
  STANDARD_ROW_GUTTER,
  STANDARD_TAG_STYLE
} from './UITemplates';

const { Text } = Typography;

/**
 * Admin Settings Card Template
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (default: "Monthly Forecast Period Settings")
 * @param {Object} props.startDayField - Start day InputNumber field configuration
 * @param {number} props.startDayField.value - Start day value
 * @param {Function} props.startDayField.onChange - onChange handler: (value) => void
 * @param {boolean} props.startDayField.disabled - Whether field is disabled (optional)
 * @param {Object} props.currentPeriod - Current period display configuration
 * @param {string} props.currentPeriod.start - Start date string
 * @param {string} props.currentPeriod.end - End date string
 * @param {number} props.startDay - Current start day value (for description text)
 * @param {Object} props.saveButton - Save button configuration
 * @param {string} props.saveButton.label - Save button label (default: "Save Settings")
 * @param {ReactNode} props.saveButton.icon - Save button icon (optional)
 * @param {Function} props.saveButton.onClick - onClick handler: () => void
 * @param {boolean} props.saveButton.loading - Whether save is loading (optional)
 * @param {Function} props.onFormFinish - Form onFinish handler: (values) => void
 * @param {Object} props.form - Ant Design Form instance (required)
 * @returns {JSX.Element} Admin Settings card JSX
 */
export const AdminSettingsCardTemplate = ({
  title = 'Monthly Forecast Period Settings',
  startDayField,
  currentPeriod,
  startDay,
  saveButton,
  onFormFinish,
  form,
}) => {
  if (!form) {
    console.error('AdminSettingsCardTemplate: form prop is required');
    return null;
  }
  
  const formInstance = form;

  const handleFinish = (values) => {
    if (onFormFinish) {
      onFormFinish(values);
    }
  };

  const getOrdinalSuffix = (day) => {
    if (day === 1) return 'st';
    if (day === 2) return 'nd';
    if (day === 3) return 'rd';
    return 'th';
  };

  const getPeriodDescription = () => {
    if (!startDay) return '';
    const prevDay = startDay - 1;
    if (prevDay === 0) {
      return `Monthly forecast cycle runs from the ${startDay}${getOrdinalSuffix(startDay)} of one month to the last day of the next month.`;
    }
    return `Monthly forecast cycle runs from the ${startDay}${getOrdinalSuffix(startDay)} of one month to the ${prevDay}${getOrdinalSuffix(prevDay)} of the next month.`;
  };

  return (
    <Card 
      {...STANDARD_CARD_CONFIG}
      title={title} 
    >
      <Form
        form={formInstance}
        onFinish={handleFinish}
        initialValues={{ start_day: startDayField?.value || startDay }}
      >
        <Row gutter={STANDARD_ROW_GUTTER} align="top">
          {/* Start Day Field */}
          <Col flex="none" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Space direction="vertical">
              <Text strong>Forecast Cycle Start Day:</Text>
              <Form.Item
                name="start_day"
                rules={[
                  { required: true, message: 'Please enter start day' },
                  { type: 'number', min: 1, max: 31, message: 'Day must be between 1 and 31' }
                ]}
                style={{ marginBottom: 0 }}
              >
                <InputNumber
                  style={{ width: '120px' }}
                  min={1}
                  max={31}
                  placeholder="Enter day (1-31)"
                  disabled={startDayField?.disabled}
                  onChange={startDayField?.onChange}
                />
              </Form.Item>
            </Space>
          </Col>

          {/* Current Period Preview */}
          {currentPeriod && (
            <Col flex="none" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Space direction="vertical">
                <Text strong>Forecast Cycle Preview:</Text>
                <Tag color="blue" style={{ fontSize: '12px', fontWeight: 'bold', padding: '4px 12px' }}>
                  {currentPeriod.start} to {currentPeriod.end}
                </Tag>
              </Space>
            </Col>
          )}

          {/* Period Information */}
          <Col flex="auto" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Period Information:</Text>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                {getPeriodDescription()}
              </Text>
            </Space>
          </Col>

          {/* Save Button */}
          {saveButton && (
            <Col flex="none" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Space direction="vertical">
                <Text>&nbsp;</Text>
                <Button
                  type="primary"
                  icon={saveButton.icon}
                  htmlType="submit"
                  loading={saveButton.loading}
                  onClick={saveButton.onClick}
                >
                  {saveButton.label || 'Save Settings'}
                </Button>
              </Space>
            </Col>
          )}
        </Row>
      </Form>
    </Card>
  );
};

