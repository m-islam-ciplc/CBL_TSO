/**
 * MONTHLY FORECAST FOOTER ACTIONS CARD TEMPLATE
 * 
 * Specialized template for the Footer Actions card in Monthly Forecast page.
 * This template displays Save All and Reset All buttons.
 * 
 * Features:
 * - No title (card without title)
 * - 2 buttons: Reset All, Save All
 * - Uses STANDARD_CARD_CONFIG for styling
 */

import { Card, Button, Row, Col, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { 
  STANDARD_CARD_CONFIG, 
  STANDARD_BUTTON_SIZE,
} from './UITemplates';

/**
 * Monthly Forecast Footer Actions Card Template
 * 
 * @param {Object} props
 * @param {Object} props.resetButton - Reset All button configuration
 * @param {string} props.resetButton.label - Button label (default: "Reset All")
 * @param {Function} props.resetButton.onClick - onClick handler: () => void
 * @param {Object} props.saveButton - Save All button configuration
 * @param {string} props.saveButton.label - Button label (default: "Save All")
 * @param {ReactNode} props.saveButton.icon - Button icon (optional)
 * @param {Function} props.saveButton.onClick - onClick handler: () => void
 * @param {boolean} props.saveButton.loading - Whether button is loading (optional)
 * @returns {JSX.Element} Monthly Forecast Footer Actions card JSX
 */
export const MonthlyForecastFooterActionsCardTemplate = ({
  resetButton,
  saveButton,
}) => {
  return (
    <Card 
      {...STANDARD_CARD_CONFIG}
    >
      <Row justify="end">
        <Col>
          <Space>
            {resetButton && (
              <Button 
                onClick={resetButton.onClick}
                size={STANDARD_BUTTON_SIZE}
              >
                {resetButton.label || 'Reset All'}
              </Button>
            )}
            {saveButton && (
              <Button 
                type="primary" 
                icon={saveButton.icon}
                onClick={saveButton.onClick} 
                loading={saveButton.loading}
                size={STANDARD_BUTTON_SIZE}
              >
                {saveButton.label || 'Save All'}
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    </Card>
  );
};


