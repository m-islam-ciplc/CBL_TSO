/**
 * MONTHLY FORECAST FOOTER ACTIONS CARD TEMPLATE
 *
 * Specialized template for the Footer Actions card in Monthly Forecast page.
 * This template displays Save All and Reset All buttons.
 */

import { FC } from 'react';
import { Card, Button, Row, Col, Space } from 'antd';
import {
  STANDARD_CARD_CONFIG,
  STANDARD_BUTTON_SIZE,
} from './UITemplates';
import type { MonthlyForecastFooterActionsCardTemplateProps } from './types';

export const MonthlyForecastFooterActionsCardTemplate: FC<MonthlyForecastFooterActionsCardTemplateProps> = ({
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
                type={resetButton.type || 'default'}
                icon={resetButton.icon}
                disabled={resetButton.disabled}
                loading={resetButton.loading}
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

export default MonthlyForecastFooterActionsCardTemplate;

