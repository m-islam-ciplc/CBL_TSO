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

import { Card, Empty, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { 
  STANDARD_CARD_CONFIG, 
  STANDARD_EMPTY_CONFIG,
} from './UITemplates';

/**
 * Review Orders Empty Order Card Template
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (default: "Empty Order")
 * @param {string} props.description - Empty description (default: "No items in your order")
 * @param {Object} props.button - Button configuration
 * @param {string} props.button.label - Button label (default: "Go to New Orders")
 * @param {ReactNode} props.button.icon - Button icon (optional)
 * @param {Function} props.button.onClick - onClick handler: () => void
 * @returns {JSX.Element} Review Orders Empty Order card JSX
 */
export const ReviewOrdersEmptyOrderCardTemplate = ({
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


