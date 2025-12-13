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

import { FC } from 'react';
import { Card, Select, Row, Col, Typography, Tag } from 'antd';
import type { Gutter } from 'antd/es/grid/row';
import { 
  STANDARD_CARD_CONFIG, 
  SINGLE_ROW_GUTTER,
} from './UITemplates';
import type { DealerReportsPeriodSelectorCardTemplateProps } from './types';

const { Text } = Typography;
const { Option } = Select;

/**
 * Dealer Reports Period Selector Card Template
 */
export const DealerReportsPeriodSelectorCardTemplate: FC<DealerReportsPeriodSelectorCardTemplateProps> = ({
  periodSelect,
}) => {
  return (
    <Card 
      {...STANDARD_CARD_CONFIG}
    >
      <Row gutter={SINGLE_ROW_GUTTER as Gutter} style={{ marginBottom: '16px' }}>
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

