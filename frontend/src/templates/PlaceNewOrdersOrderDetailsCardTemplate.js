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

import { Card, Form, Select, Row, Col, Typography, Space } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { 
  STANDARD_CARD_CONFIG, 
  STANDARD_INPUT_SIZE,
  STANDARD_FORM_LABEL_STYLE,
  COMPACT_ROW_GUTTER,
} from './UITemplates';

const { Text } = Typography;
const { Option } = Select;

/**
 * Place New Orders Order Details Card Template
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (default: "Order Details")
 * @param {boolean} props.collapsed - Whether the card is collapsed (default: false)
 * @param {Function} props.onToggleCollapse - Toggle collapse handler: () => void
 * @param {Object} props.summary - Summary display configuration
 * @param {string} props.summary.orderType - Order type name
 * @param {string} props.summary.warehouse - Warehouse name
 * @param {string} props.summary.territory - Territory name
 * @param {string} props.summary.dealer - Dealer name
 * @param {string} props.summary.transport - Transport truck details
 * @param {Object} props.dealerField - Dealer Select field configuration
 * @param {any} props.dealerField.value - Dealer value
 * @param {Function} props.dealerField.onChange - onChange handler: (value) => void
 * @param {string} props.dealerField.placeholder - Placeholder text
 * @param {Array} props.dealerField.options - Dealer options array: [{ id, name }]
 * @param {boolean} props.dealerField.disabled - Whether field is disabled
 * @param {Function} props.dealerField.removeMSPrefix - Function to remove M/S prefix from dealer names: (name) => string
 * @param {Object} props.transportField - Transport Select field configuration
 * @param {any} props.transportField.value - Transport value
 * @param {Function} props.transportField.onChange - onChange handler: (value) => void
 * @param {string} props.transportField.placeholder - Placeholder text
 * @param {Array} props.transportField.options - Transport options array: [{ id, truck_details }]
 * @param {boolean} props.transportField.disabled - Whether field is disabled
 * @param {Object} props.form - Ant Design Form instance (required)
 * @param {Function} props.onFormValuesChange - Form onValuesChange handler: (changedValues, allValues) => void
 * @returns {JSX.Element} Place New Orders Order Details card JSX
 */
export const PlaceNewOrdersOrderDetailsCardTemplate = ({
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
          <Row gutter={COMPACT_ROW_GUTTER} align="middle">
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


