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

import { Card, Row, Col, Button, DatePicker } from 'antd';
import { 
  DATE_SELECTION_CARD_CONFIG, 
  STANDARD_BUTTON_SIZE,
  STANDARD_DATE_PICKER_CONFIG,
  COMPACT_ROW_GUTTER,
} from './UITemplates';

/**
 * Daily Demand Multi-Day Add Dates Card Template
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (default: "Add Dates")
 * @param {Array<Object>} props.quickDateButtons - Array of quick date button configurations
 * @param {string} props.quickDateButtons[].label - Button label (e.g., "Today", "Tomorrow")
 * @param {Function} props.quickDateButtons[].onClick - onClick handler: () => void
 * @param {Object} props.datePicker - Date picker configuration
 * @param {dayjs.Dayjs|null} props.datePicker.value - Date value
 * @param {Function} props.datePicker.onChange - onChange handler: (date) => void
 * @param {string} props.datePicker.placeholder - Placeholder text (default: "Or select custom date")
 * @param {Function} props.datePicker.disabledDate - disabledDate function: (current) => boolean
 * @returns {JSX.Element} Daily Demand Multi-Day Add Dates card JSX
 */
export const DailyDemandMultiDayAddDatesCardTemplate = ({
  title = 'Add Dates',
  quickDateButtons = [],
  datePicker,
}) => {
  return (
    <Card 
      title={title} 
      {...DATE_SELECTION_CARD_CONFIG}
    >
      <Row gutter={COMPACT_ROW_GUTTER}>
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
              {...STANDARD_DATE_PICKER_CONFIG}
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


