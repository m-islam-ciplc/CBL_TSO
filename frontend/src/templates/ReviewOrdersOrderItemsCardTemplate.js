/**
 * REVIEW ORDERS ORDER ITEMS CARD TEMPLATE
 * 
 * Specialized template for the "Order Items" card in Review Orders page.
 * This template displays a list of order items with quantity controls and delete buttons.
 * 
 * Features:
 * - No title (card without title)
 * - Header with item count and "Clear All" button
 * - Scrollable list of order items
 * - Each item has quantity controls (+/-) and delete button
 * - Uses STANDARD_CARD_CONFIG for styling
 */

import { Card, Button, Row, Col, Typography, Input } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { 
  STANDARD_CARD_CONFIG, 
  STANDARD_SELECT_SIZE,
  TIGHT_ROW_GUTTER,
} from './UITemplates';

const { Title } = Typography;

/**
 * Review Orders Order Items Card Template
 * 
 * @param {Object} props
 * @param {Array<Object>} props.orderItems - Array of order items
 * @param {number|string} props.orderItems[].id - Item ID
 * @param {string} props.orderItems[].product_name - Product name
 * @param {number} props.orderItems[].quantity - Item quantity
 * @param {Function} props.onQuantityChange - Quantity change handler: (itemId, newQuantity) => void
 * @param {Function} props.onDeleteItem - Delete item handler: (itemId) => void
 * @param {Function} props.onClearAll - Clear all items handler: () => void
 * @returns {JSX.Element} Review Orders Order Items card JSX
 */
export const ReviewOrdersOrderItemsCardTemplate = ({
  orderItems = [],
  onQuantityChange,
  onDeleteItem,
  onClearAll,
}) => {
  return (
    <Card 
      {...STANDARD_CARD_CONFIG}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={5} style={{ margin: 0 }}>
          📦 Order Items ({orderItems.length})
        </Title>
        <Button
          type="link"
          onClick={onClearAll}
          style={{ color: '#ff4d4f' }}
        >
          Clear All
        </Button>
      </div>
      
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {orderItems.map((item, index) => (
          <Card
            key={item.id}
            size="small"
            style={{ 
              marginBottom: '12px',
              borderRadius: '8px',
              border: '2px solid #f0f0f0'
            }}
          >
            <Row gutter={TIGHT_ROW_GUTTER} align="middle">
              <Col xs={2} sm={3}>
                <div style={{ 
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#1890ff',
                  backgroundColor: '#f0f8ff',
                  padding: '4px',
                  borderRadius: '4px'
                }}>
                  #{index + 1}
                </div>
              </Col>
              <Col xs={10} sm={9}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#1890ff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.product_name}
                </div>
              </Col>
              <Col xs={12} sm={12} style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Button
                    type="primary"
                    shape="circle"
                    size={STANDARD_SELECT_SIZE}
                    icon={<span style={{ fontSize: '12px' }}>-</span>}
                    onClick={() => onQuantityChange && onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                    style={{ 
                      width: '28px', 
                      height: '28px',
                      minWidth: '28px',
                      padding: '0'
                    }}
                  />
                  <div style={{
                    minWidth: '35px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#52c41a',
                    padding: '4px 4px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    border: '1px solid #f0f0f0'
                  }}>
                    {item.quantity}
                  </div>
                  <Button
                    type="primary"
                    shape="circle"
                    size={STANDARD_SELECT_SIZE}
                    icon={<span style={{ fontSize: '12px' }}>+</span>}
                    onClick={() => onQuantityChange && onQuantityChange(item.id, item.quantity + 1)}
                    style={{ 
                      width: '28px', 
                      height: '28px',
                      minWidth: '28px',
                      padding: '0'
                    }}
                  />
                </div>
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDeleteItem && onDeleteItem(item.id)}
                />
              </Col>
            </Row>
          </Card>
        ))}
      </div>
    </Card>
  );
};


