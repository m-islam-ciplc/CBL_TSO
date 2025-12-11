/**
 * MONTHLY FORECAST SELECT PERIOD CARD TEMPLATE
 * 
 * Specialized template for the "Select Period" card in Monthly Forecast page.
 * This template displays a period selector with tags showing Current/Historical status.
 * 
 * Features:
 * - Title: "Select Period"
 * - Period Select dropdown with tags (Current, Historical, No Data)
 * - Period info display (Current Period/Historical Period tag with date range)
 * - Uses DATE_SELECTION_CARD_CONFIG for styling
 */

import { Card, Select, Space, Typography, Tag } from 'antd';
import { HistoryOutlined, CheckCircleOutlined, FileOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { 
  DATE_SELECTION_CARD_CONFIG,
} from './UITemplates';
import type { MonthlyForecastSelectPeriodCardTemplateProps } from './types';

const { Text } = Typography;
const { Option } = Select;

/**
 * Monthly Forecast Select Period Card Template
 */
export const MonthlyForecastSelectPeriodCardTemplate: FC<MonthlyForecastSelectPeriodCardTemplateProps> = ({
  title = 'Select Period',
  periodSelect,
  periodInfo,
}) => {
  return (
    <Card 
      title={title} 
      {...DATE_SELECTION_CARD_CONFIG}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {periodSelect && (
          <Select
            style={{ width: 280 }}
            value={periodSelect.value}
            onChange={periodSelect.onChange}
            loading={periodSelect.loading}
            placeholder={periodSelect.placeholder || 'Select forecast period'}
          >
            {periodSelect.options && periodSelect.options.map((period) => {
              const periodValue = `${period.period_start}_${period.period_end}`;
              const label = periodSelect.formatLabel 
                ? periodSelect.formatLabel(period)
                : period.label || `${period.period_start} - ${period.period_end}`;
              
              return (
                <Option key={periodValue} value={periodValue}>
                  <Space>
                    {label}
                    {period.is_current && (
                      <Tag color="green">
                        <CheckCircleOutlined /> Current
                      </Tag>
                    )}
                    {!period.is_current && period.has_forecast && (
                      <Tag color="blue">
                        <HistoryOutlined /> Historical
                      </Tag>
                    )}
                    {!period.has_forecast && !period.is_current && (
                      <Tag color="default">
                        <FileOutlined /> No Data
                      </Tag>
                    )}
                  </Space>
                </Option>
              );
            })}
          </Select>
        )}
        {periodInfo && periodInfo.start && (
          <>
            <Text strong style={{ marginLeft: '8px' }}>
              {periodInfo.isCurrent ? 'Current Period' : 'Historical Period'}
            </Text>
            <Tag 
              color={periodInfo.isCurrent ? 'green' : 'blue'} 
              style={{ 
                marginLeft: '8px',
                fontWeight: 'bold'
              }}
            >
              {periodInfo.start ? dayjs(periodInfo.start).format('DD MMM YYYY') : ''} - {periodInfo.end ? dayjs(periodInfo.end).format('DD MMM YYYY') : ''}
            </Tag>
          </>
        )}
      </div>
    </Card>
  );
};

