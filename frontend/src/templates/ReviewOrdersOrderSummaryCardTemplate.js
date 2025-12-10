/**
 * REVIEW ORDERS ORDER SUMMARY CARD TEMPLATE
 * 
 * Specialized template for the "Order Summary" card in Review Orders page.
 * This template displays order summary information and action buttons.
 * 
 * Features:
 * - No title (card without title)
 * - Order summary text (item count, total quantity)
 * - 3 buttons: Cancel Order, Add More, Submit
 * - Uses STANDARD_CARD_CONFIG for styling
 * - Uses TIGHT_VERTICAL_ROW_GUTTER for spacing
 */

import { Card, Button, Row, Col, Typography } from 'antd';
import { 
  STANDARD_CARD_CONFIG, 
  TIGHT_VERTICAL_ROW_GUTTER,
  STANDARD_BUTTON_SIZE,
} from './UITemplates';

const { Text } = Typography;

/**
 * Review Orders Order Summary Card Template
 * 
 * @param {Object} props
 * @param {number} props.itemCount - Number of items in order
 * @param {number} props.totalQuantity - Total quantity of all items
 * @param {Object} props.cancelButton - Cancel button configuration
 * @param {string} props.cancelButton.label - Button label (default: "Cancel Order")
 * @param {Function} props.cancelButton.onClick - onClick handler: () => void
 * @param {Object} props.addMoreButton - Add More button configuration
 * @param {string} props.addMoreButton.label - Button label (default: "Add More")
 * @param {ReactNode} props.addMoreButton.icon - Button icon (optional)
 * @param {Function} props.addMoreButton.onClick - onClick handler: () => void
 * @param {Object} props.submitButton - Submit button configuration
 * @param {string} props.submitButton.label - Button label (default: "Submit")
 * @param {ReactNode} props.submitButton.icon - Button icon (optional)
 * @param {Function} props.submitButton.onClick - onClick handler: () => void
 * @param {boolean} props.submitButton.loading - Whether button is loading (optional)
 * @param {boolean} props.submitButton.disabled - Whether button is disabled (optional)
 * @returns {JSX.Element} Review Orders Order Summary card JSX
 */
export const ReviewOrdersOrderSummaryCardTemplate = ({
  itemCount = 0,
  totalQuantity = 0,
  cancelButton,
  addMoreButton,
  submitButton,
}) => {
  return (
    <Card 
      {...STANDARD_CARD_CONFIG}
    >
      <Row gutter={TIGHT_VERTICAL_ROW_GUTTER} align="middle">
        <Col xs={24} sm={12}>
          <div>
            <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
              Order Summary
            </Text>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              {itemCount} item{itemCount !== 1 ? 's' : ''} • 
              Total Quantity: {totalQuantity}
            </div>
          </div>
        </Col>
        {cancelButton && (
          <Col xs={8} sm={4}>
            <Button
              danger
              onClick={cancelButton.onClick}
              size={STANDARD_BUTTON_SIZE}
              style={{ width: '100%' }}
            >
              {cancelButton.label || 'Cancel Order'}
            </Button>
          </Col>
        )}
        {addMoreButton && (
          <Col xs={8} sm={4}>
            <Button
              type="default"
              icon={addMoreButton.icon}
              onClick={addMoreButton.onClick}
              size={STANDARD_BUTTON_SIZE}
              style={{ width: '100%' }}
            >
              {addMoreButton.label || 'Add More'}
            </Button>
          </Col>
        )}
        {submitButton && (
          <Col xs={8} sm={4}>
            <Button
              type="primary"
              icon={submitButton.icon}
              onClick={submitButton.onClick}
              loading={submitButton.loading}
              disabled={submitButton.disabled}
              size={STANDARD_BUTTON_SIZE}
              style={{ width: '100%' }}
            >
              {submitButton.label || 'Submit'}
            </Button>
          </Col>
        )}
      </Row>
    </Card>
  );
};

