/**
 * DEALER REPORTS PERIOD SELECTOR CARD TEMPLATE
 * 
 * Specialized template for the Period Selector card in Dealer Reports page (Monthly Forecasts tab).
 * This template displays a period selector dropdown.
 * 
 * Features:
 * - No title (card without title)
 * - Period Select dropdown
 * - Uses STANDARD_CARD_CONFIG for styling
 * - Uses SINGLE_ROW_GUTTER for spacing
 */

import { Card, Select, Row, Col, Typography, Tag } from 'antd';
import { 
  STANDARD_CARD_CONFIG, 
  SINGLE_ROW_GUTTER,
} from './UITemplates';

const { Text } = Typography;
const { Option } = Select;

/**
 * Dealer Reports Period Selector Card Template
 * 
 * @param {Object} props
 * @param {Object} props.periodSelect - Period select configuration
 * @param {any} props.periodSelect.value - Selected period value
 * @param {Function} props.periodSelect.onChange - onChange handler: (value) => void
 * @param {string} props.periodSelect.placeholder - Placeholder text (default: "Select forecast period")
 * @param {Array<Object>} props.periodSelect.options - Period options array: [{ period_start, period_end, label, is_current }]
 * @returns {JSX.Element} Dealer Reports Period Selector card JSX
 */
export const DealerReportsPeriodSelectorCardTemplate = ({
  periodSelect,
}) => {
  return (
    <Card 
      {...STANDARD_CARD_CONFIG}
    >
      <Row gutter={SINGLE_ROW_GUTTER} style={{ marginBottom: '16px' }}>
        <Col xs={24} md={8}>
          <Text strong style={{ display: 'block', marginBottom: '8px' }}>Select Period</Text>
          <Select
            style={{ width: '100%' }}
            value={periodSelect?.value}
            onChange={periodSelect?.onChange}
            placeholder={periodSelect?.placeholder || 'Select forecast period'}
          >
            {periodSelect?.options && periodSelect.options.map((period) => {
              const periodValue = period.value || `${period.period_start}_${period.period_end}`;
              return (
                <Option key={periodValue} value={periodValue}>
                  {period.label}
                  {period.is_current && <Tag color="green" style={{ marginLeft: '8px' }}>Current</Tag>}
                </Option>
              );
            })}
          </Select>
        </Col>
      </Row>
    </Card>
  );
};


