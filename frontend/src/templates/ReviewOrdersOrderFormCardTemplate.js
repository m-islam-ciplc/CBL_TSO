/**
 * REVIEW ORDERS ORDER FORM CARD TEMPLATE
 * 
 * Specialized template for the Order Form card in Review Orders page.
 * This template displays disabled Dealer and Transport select fields.
 * 
 * Features:
 * - No title (card without title)
 * - Loading state with spinner
 * - Form with Dealer and Transport fields (disabled)
 * - Uses STANDARD_CARD_CONFIG for styling
 * - Uses MINIMAL_ROW_GUTTER for spacing
 */

import { Card, Form, Select, Row, Col, Typography, Spin, Input } from 'antd';
import { 
  STANDARD_CARD_CONFIG, 
  STANDARD_FORM_SIZE,
  STANDARD_SELECT_SIZE,
  STANDARD_FORM_LABEL_STYLE,
  MINIMAL_ROW_GUTTER,
  STANDARD_SPIN_SIZE,
} from './UITemplates';

const { Text } = Typography;
const { Option } = Select;

/**
 * Review Orders Order Form Card Template
 * 
 * @param {Object} props
 * @param {boolean} props.loading - Whether form is loading (default: false)
 * @param {string} props.loadingText - Loading text (default: "Loading form data...")
 * @param {Object} props.dealerField - Dealer Select field configuration
 * @param {any} props.dealerField.value - Dealer value
 * @param {Array} props.dealerField.options - Dealer options array: [{ id, name }]
 * @param {Function} props.dealerField.removeMSPrefix - Function to remove M/S prefix: (name) => string
 * @param {Object} props.transportField - Transport Select field configuration
 * @param {any} props.transportField.value - Transport value
 * @param {Array} props.transportField.options - Transport options array: [{ id, truck_details }]
 * @param {Object} props.form - Ant Design Form instance (required)
 * @returns {JSX.Element} Review Orders Order Form card JSX
 */
export const ReviewOrdersOrderFormCardTemplate = ({
  loading = false,
  loadingText = 'Loading form data...',
  dealerField,
  transportField,
  form,
}) => {
  if (!form) {
    console.error('ReviewOrdersOrderFormCardTemplate: form prop is required');
    return null;
  }

  return (
    <Card 
      {...STANDARD_CARD_CONFIG}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size={STANDARD_SPIN_SIZE} />
          <div style={{ marginTop: '10px', color: '#666' }}>{loadingText}</div>
        </div>
      ) : (
        <Form
          form={form}
          layout="horizontal"
          size={STANDARD_FORM_SIZE}
        >
          <Form.Item name="orderType" hidden><Input /></Form.Item>
          <Form.Item name="warehouse" hidden><Input /></Form.Item>
          <Form.Item name="territoryCode" hidden><Input /></Form.Item>
          <Row gutter={MINIMAL_ROW_GUTTER} align="middle">
            <Col xs={24} sm={24} md={12} lg={12}>
              {dealerField && (
                <Form.Item
                  name="dealer"
                  label={<Text strong style={STANDARD_FORM_LABEL_STYLE}>Dealer</Text>}
                  rules={[{ required: true, message: 'Required' }]}
                  style={{ marginBottom: '8px' }}
                >
                  <Select
                    placeholder="Dealer"
                    size={STANDARD_SELECT_SIZE}
                    style={{ fontSize: '12px' }}
                    disabled
                    value={dealerField.value}
                  >
                    {dealerField.options && dealerField.options.length > 0 ? (
                      dealerField.options.map(dealer => {
                        const displayName = dealerField.removeMSPrefix 
                          ? dealerField.removeMSPrefix(dealer.name)
                          : dealer.name;
                        return (
                          <Option key={dealer.id} value={dealer.id}>
                            {displayName}
                          </Option>
                        );
                      })
                    ) : (
                      <Option disabled>No dealers loaded</Option>
                    )}
                  </Select>
                </Form.Item>
              )}
            </Col>

            <Col xs={24} sm={24} md={12} lg={12}>
              {transportField && (
                <Form.Item
                  name="transport"
                  label={<Text strong style={STANDARD_FORM_LABEL_STYLE}>Transport</Text>}
                  rules={[{ required: true, message: 'Required' }]}
                  style={{ marginBottom: '8px' }}
                >
                  <Select
                    placeholder="Transport"
                    size={STANDARD_SELECT_SIZE}
                    style={{ fontSize: '12px' }}
                    disabled
                    value={transportField.value}
                  >
                    {transportField.options && transportField.options.length > 0 ? (
                      transportField.options.map(transport => (
                        <Option key={transport.id} value={transport.id}>
                          {transport.truck_details}
                        </Option>
                      ))
                    ) : (
                      <Option disabled>No transports loaded</Option>
                    )}
                  </Select>
                </Form.Item>
              )}
            </Col>
          </Row>
        </Form>
      )}
    </Card>
  );
};

