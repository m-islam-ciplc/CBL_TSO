/**
 * DAILY DEMAND MULTI-DAY ADD DATES CARD TEMPLATE
 * 
 * Specialized template for the "Add Dates" card in Daily Demand Multi-Day page.
 * This template displays quick date selection buttons and a date picker.
 * 
 * Features:
 * - Title: "Add Dates"
 * - Quick date buttons: Today, Tomorrow, Day After, 3 Days
 * - Date picker for custom date selection
 * - Uses DATE_SELECTION_CARD_CONFIG for styling
 */

import { FC } from 'react';
import { Card, Row, Col, Button, DatePicker } from 'antd';
import type { Gutter } from 'antd/es/grid/row';
import { 
  DATE_SELECTION_CARD_CONFIG, 
  STANDARD_BUTTON_SIZE,
  STANDARD_DATE_PICKER_CONFIG,
  COMPACT_ROW_GUTTER,
} from './UITemplates';
import type { DailyDemandMultiDayAddDatesCardTemplateProps } from './types';

/**
 * Daily Demand Multi-Day Add Dates Card Template
 */
export const DailyDemandMultiDayAddDatesCardTemplate: FC<DailyDemandMultiDayAddDatesCardTemplateProps> = ({
  title = 'Add Dates',
  quickDateButtons = [],
  datePicker,
}) => {
  return (
    <Card 
      title={title} 
      {...DATE_SELECTION_CARD_CONFIG}
    >
      <Row gutter={COMPACT_ROW_GUTTER as Gutter}>
        {quickDateButtons.map((button, index) => (
          <Col key={`quick-date-${index}`}>
            <Button 
              size={STANDARD_BUTTON_SIZE} 
              onClick={button.onClick}
            >
              {button.label}
            </Button>
          </Col>
        ))}
        {datePicker && (
          <Col>
            <DatePicker
              size={STANDARD_DATE_PICKER_CONFIG.size as 'small' | 'middle' | 'large'}
              format={STANDARD_DATE_PICKER_CONFIG.format}
              placeholder={datePicker.placeholder || 'Or select custom date'}
              onChange={datePicker.onChange}
              value={datePicker.value}
              disabledDate={datePicker.disabledDate}
              style={{ minWidth: '200px' }}
            />
          </Col>
        )}
      </Row>
    </Card>
  );
};

