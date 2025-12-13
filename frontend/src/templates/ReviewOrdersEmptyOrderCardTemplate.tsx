/**
 * REVIEW ORDERS EMPTY ORDER CARD TEMPLATE
 * 
 * Specialized template for the "Empty Order" card in Review Orders page.
 * This template displays an empty state when there are no order items.
 * 
 * Features:
 * - Title: "Empty Order"
 * - Empty component with description
 * - Button to navigate to New Orders
 * - Uses STANDARD_CARD_CONFIG for styling
 */

import { FC } from 'react';
import { Card, Empty, Button } from 'antd';
import { 
  STANDARD_CARD_CONFIG, 
  STANDARD_EMPTY_CONFIG,
} from './UITemplates';
import type { ReviewOrdersEmptyOrderCardTemplateProps } from './types';

/**
 * Review Orders Empty Order Card Template
 */
export const ReviewOrdersEmptyOrderCardTemplate: FC<ReviewOrdersEmptyOrderCardTemplateProps> = ({
  title = 'Empty Order',
  description = 'No items in your order',
  button,
}) => {
  return (
    <Card 
      title={title} 
      {...STANDARD_CARD_CONFIG}
    >
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={description}
        {...STANDARD_EMPTY_CONFIG}
      >
        {button && (
          <Button
            type="primary"
            icon={button.icon}
            onClick={button.onClick}
          >
            {button.label || 'Go to New Orders'}
          </Button>
        )}
      </Empty>
    </Card>
  );
};

