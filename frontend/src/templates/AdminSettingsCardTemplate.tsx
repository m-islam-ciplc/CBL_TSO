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

import { FC } from 'react';
import { Card, Form, InputNumber, Button, Row, Col, Space, Typography, Tag } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { 
  STANDARD_CARD_CONFIG, 
  STANDARD_ROW_GUTTER,
  STANDARD_TAG_STYLE
} from './UITemplates';
import type { AdminSettingsCardTemplateProps } from './types';

const { Text } = Typography;

/**
 * Admin Settings Card Template
 */
export const AdminSettingsCardTemplate: FC<AdminSettingsCardTemplateProps> = ({
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
  
  const formInstance = form as FormInstance;

  const handleFinish = (values: { start_day: number }) => {
    if (onFormFinish) {
      onFormFinish(values);
    }
  };

  const getOrdinalSuffix = (day: number): string => {
    if (day === 1) return 'st';
    if (day === 2) return 'nd';
    if (day === 3) return 'rd';
    return 'th';
  };

  const getPeriodDescription = (): string => {
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
        <Row gutter={STANDARD_ROW_GUTTER as [number, number]} align="top">
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

