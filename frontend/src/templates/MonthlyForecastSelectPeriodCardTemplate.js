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
import { 
  DATE_SELECTION_CARD_CONFIG,
} from './UITemplates';

const { Text } = Typography;
const { Option } = Select;

/**
 * Monthly Forecast Select Period Card Template
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (default: "Select Period")
 * @param {Object} props.periodSelect - Period select configuration
 * @param {any} props.periodSelect.value - Selected period value (format: "period_start_period_end")
 * @param {Function} props.periodSelect.onChange - onChange handler: (value) => void
 * @param {string} props.periodSelect.placeholder - Placeholder text (default: "Select forecast period")
 * @param {boolean} props.periodSelect.loading - Whether select is loading (optional)
 * @param {Array<Object>} props.periodSelect.options - Period options array: [{ period_start, period_end, is_current, has_forecast, label }]
 * @param {Function} props.periodSelect.formatLabel - Function to format period label: (period) => string
 * @param {Object} props.periodInfo - Period info display configuration
 * @param {boolean} props.periodInfo.isCurrent - Whether selected period is current
 * @param {string} props.periodInfo.start - Period start date string
 * @param {string} props.periodInfo.end - Period end date string
 * @returns {JSX.Element} Monthly Forecast Select Period card JSX
 */
export const MonthlyForecastSelectPeriodCardTemplate = ({
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
                      <Tag color="green" size="small">
                        <CheckCircleOutlined /> Current
                      </Tag>
                    )}
                    {!period.is_current && period.has_forecast && (
                      <Tag color="blue" size="small">
                        <HistoryOutlined /> Historical
                      </Tag>
                    )}
                    {!period.has_forecast && !period.is_current && (
                      <Tag color="default" size="small">
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


