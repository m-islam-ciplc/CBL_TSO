/**
 * DAILY DEMAND ORDER DETAILS CARD TEMPLATE
 * 
 * Specialized template for the "Order Details" card in Daily Demand page.
 * This template displays fixed order type and territory information (disabled inputs).
 * 
 * Features:
 * - No title (card without title)
 * - Two disabled input fields: Order Type and Territory
 * - Uses STANDARD_CARD_CONFIG for styling
 * - Uses COMPACT_ROW_GUTTER for spacing
 */

import { useEffect } from 'react';
import { Card, Form, Input, Row, Col, Typography } from 'antd';
import { 
  STANDARD_CARD_CONFIG, 
  STANDARD_FORM_SIZE,
  STANDARD_FORM_LABEL_STYLE,
  COMPACT_ROW_GUTTER,
} from './UITemplates';

const { Text } = Typography;

/**
 * Daily Demand Order Details Card Template
 * 
 * @param {Object} props
 * @param {string} props.orderType - Order type value (default: "DD (Daily Demand)")
 * @param {string} props.territory - Territory value
 * @param {Object} props.form - Ant Design Form instance (optional, will create one if not provided)
 * @returns {JSX.Element} Daily Demand Order Details card JSX
 */
export const DailyDemandOrderDetailsCardTemplate = ({
  orderType = 'DD (Daily Demand)',
  territory,
  form: providedForm,
}) => {
  const [form] = Form.useForm();
  const formInstance = providedForm || form;

  // Set form values
  useEffect(() => {
    formInstance.setFieldsValue({
      orderType,
      territory,
    });
  }, [formInstance, orderType, territory]);

  return (
    <Card 
      {...STANDARD_CARD_CONFIG}
    >
      <Form
        form={formInstance}
        layout="horizontal"
        size={STANDARD_FORM_SIZE}
      >
        <Row gutter={COMPACT_ROW_GUTTER} align="middle">
          <Col xs={24} md={12}>
            <Form.Item
              name="orderType"
              label={<Text strong style={STANDARD_FORM_LABEL_STYLE}>Order Type</Text>}
              style={{ marginBottom: '8px' }}
            >
              <Input
                value={orderType}
                disabled
                style={{ fontSize: '12px', background: '#f5f5f5' }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="territory"
              label={<Text strong style={STANDARD_FORM_LABEL_STYLE}>Territory</Text>}
              style={{ marginBottom: '8px' }}
            >
              <Input
                value={territory}
                disabled
                style={{ fontSize: '12px', background: '#f5f5f5' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

