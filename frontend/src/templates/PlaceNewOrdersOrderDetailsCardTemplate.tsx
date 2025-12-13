/**
 * PLACE NEW ORDERS ORDER DETAILS CARD TEMPLATE
 * 
 * Specialized template for the "Order Details" card in Place New Orders page.
 * This template displays a collapsible card with form fields for Dealer and Transport.
 * 
 * Features:
 * - Title: "Order Details"
 * - Collapsible header with summary display
 * - Form fields: Dealer (Select), Transport (Select)
 * - Uses STANDARD_CARD_CONFIG for styling
 * - Horizontal layout with gutter spacing
 */

import { FC } from 'react';
import { Card, Form, Select, Row, Col, Typography } from 'antd';
import type { Gutter } from 'antd/es/grid/row';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { 
  STANDARD_CARD_CONFIG, 
  STANDARD_INPUT_SIZE,
  STANDARD_FORM_LABEL_STYLE,
  COMPACT_ROW_GUTTER,
} from './UITemplates';
import type { PlaceNewOrdersOrderDetailsCardTemplateProps } from './types';

const { Text } = Typography;
const { Option } = Select;

/**
 * Place New Orders Order Details Card Template
 */
export const PlaceNewOrdersOrderDetailsCardTemplate: FC<PlaceNewOrdersOrderDetailsCardTemplateProps> = ({
  title = 'Order Details',
  collapsed = false,
  onToggleCollapse,
  summary = {},
  dealerField,
  transportField,
  form,
  onFormValuesChange,
}) => {
  if (!form) {
    console.error('PlaceNewOrdersOrderDetailsCardTemplate: form prop is required');
    return null;
  }

  const hasSummary = summary.orderType || summary.warehouse || summary.territory || summary.dealer || summary.transport;

  return (
    <Card 
      title={title} 
      {...STANDARD_CARD_CONFIG}
    >
      {/* Collapsible Header */}
      <div 
        style={{ 
          cursor: 'pointer', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px 0'
        }}
        onClick={onToggleCollapse}
      >
        <div>
          <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>
            📋 Order Details
          </Text>
          {hasSummary && (
            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
              <Text style={{ fontSize: '11px' }}>
                {summary.orderType && `${summary.orderType} • `}
                {summary.warehouse && `${summary.warehouse} • `}
                {summary.territory && `${summary.territory} • `}
                {summary.dealer && `${summary.dealer} • `}
                {summary.transport && summary.transport}
              </Text>
            </div>
          )}
        </div>
        {collapsed ? <DownOutlined /> : <UpOutlined />}
      </div>

      {/* Form Fields (shown when not collapsed) */}
      {!collapsed && (
        <Form
          form={form}
          layout="horizontal"
          size={STANDARD_INPUT_SIZE}
          style={{ marginTop: '12px' }}
          onValuesChange={onFormValuesChange}
        >
          <Row gutter={COMPACT_ROW_GUTTER as Gutter} align="middle">
            {/* Dealer Field */}
            {dealerField && (
              <Col xs={24} md={12}>
                <Form.Item
                  name="dealer"
                  label={<Text strong style={STANDARD_FORM_LABEL_STYLE}>Dealer</Text>}
                  rules={[{ required: true, message: 'Required' }]}
                  style={{ marginBottom: '8px' }}
                >
                  <Select
                    placeholder={dealerField.placeholder || 'Dealer'}
                    size={STANDARD_INPUT_SIZE}
                    style={{ fontSize: '12px' }}
                    allowClear
                    showSearch
                    filterOption={(input, option) => {
                      const optionText = option?.children?.toString() || '';
                      return optionText.toLowerCase().includes(input.toLowerCase());
                    }}
                    disabled={dealerField.disabled}
                    onChange={dealerField.onChange}
                    value={dealerField.value}
                  >
                    {dealerField.options && dealerField.options.map(dealer => {
                      const displayName = dealerField.removeMSPrefix 
                        ? dealerField.removeMSPrefix(dealer.name)
                        : dealer.name;
                      return (
                        <Option key={dealer.id} value={dealer.id}>
                          {displayName}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
            )}

            {/* Transport Field */}
            {transportField && (
              <Col xs={24} md={12}>
                <Form.Item
                  name="transport"
                  label={<Text strong style={STANDARD_FORM_LABEL_STYLE}>Transport</Text>}
                  rules={[{ required: true, message: 'Required' }]}
                  style={{ marginBottom: '8px' }}
                >
                  <Select
                    placeholder={transportField.placeholder || 'Transport'}
                    size={STANDARD_INPUT_SIZE}
                    style={{ fontSize: '12px' }}
                    allowClear
                    showSearch
                    filterOption={(input, option) => {
                      const optionText = option?.children?.toString() || '';
                      return optionText.toLowerCase().includes(input.toLowerCase());
                    }}
                    disabled={transportField.disabled}
                    onChange={transportField.onChange}
                    value={transportField.value}
                  >
                    {transportField.options && transportField.options.map(transport => (
                      <Option key={transport.id} value={transport.id}>
                        {transport.truck_details}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      )}
    </Card>
  );
};

