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

import { Row, Col, Space, Typography, DatePicker, Button, Card, Select } from 'antd';
import type { ReactNode } from 'react';
import type { Dayjs } from 'dayjs';
import type { Gutter } from 'antd/es/grid/row';
import {
  UNIVERSAL_CARD_CONFIG,
  STANDARD_FORM_LABEL_STYLE,
  STANDARD_BUTTON_SIZE,
  STANDARD_DATE_PICKER_CONFIG,
  STANDARD_INPUT_SIZE,
  COMPACT_ROW_GUTTER,
} from './UITemplates';
import type { DailyOrderReportCardTemplateProps, ButtonConfig } from './types';

const { Text } = Typography;
const { Option } = Select;

/**
 * Daily Order Report Card Template
 */
export const DailyOrderReportCardTemplate: React.FC<DailyOrderReportCardTemplateProps> = ({
  title = 'Daily Order Report',
  datePicker1,
  orderTypeFilter,
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
      <Row gutter={gutter as Gutter} align="top">
        {/* Order Type Filter */}
        {orderTypeFilter && (
          <Col xs={24} sm={12} flex={1} style={{ maxWidth: '12.5rem' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>
                Order Type
              </Text>
              <Select
                size={STANDARD_INPUT_SIZE}
                value={orderTypeFilter.value}
                onChange={orderTypeFilter.onChange}
                placeholder="Select Type"
                style={{ width: '100%' }}
              >
                <Option value="tso">Sales Orders</Option>
                <Option value="dd">Daily Demands</Option>
                <Option value="all">All Orders</Option>
              </Select>
            </Space>
          </Col>
        )}

        {/* Date Picker */}
        {datePicker1 && (
          <Col xs={24} sm={12} flex={1} style={{ maxWidth: '12.5rem' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>
                {datePicker1.label || 'Select Date'}
              </Text>
              <DatePicker
                format={STANDARD_DATE_PICKER_CONFIG.format}
                size="small"
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

