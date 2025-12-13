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

import { FC } from 'react';
import { Card, Button, Row, Col, Typography } from 'antd';
import type { Gutter } from 'antd/es/grid/row';
import { 
  STANDARD_CARD_CONFIG, 
  TIGHT_VERTICAL_ROW_GUTTER,
  STANDARD_BUTTON_SIZE,
} from './UITemplates';
import type { ReviewOrdersOrderSummaryCardTemplateProps } from './types';

const { Text } = Typography;

/**
 * Review Orders Order Summary Card Template
 */
export const ReviewOrdersOrderSummaryCardTemplate: FC<ReviewOrdersOrderSummaryCardTemplateProps> = ({
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
      <Row gutter={TIGHT_VERTICAL_ROW_GUTTER as Gutter} align="middle">
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

