import { useState } from 'react';
import { Form } from 'antd';
import { 
  Card, 
  Typography,
  Button,
} from 'antd';
import {
  LayoutOutlined,
  SaveOutlined,
  HistoryOutlined,
  EyeOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  STANDARD_CARD_CONFIG, 
  STANDARD_PAGE_TITLE_CONFIG, 
  STANDARD_PAGE_SUBTITLE_CONFIG,
} from '../../templates/UITemplates';
import { DailyDemandMultiDayAddDatesCardTemplate } from '../../templates/DailyDemandMultiDayAddDatesCardTemplate';
import { DailyDemandMultiDaySelectProductsCardTemplate } from '../../templates/DailyDemandMultiDaySelectProductsCardTemplate';
import { MonthlyForecastSelectPeriodCardTemplate } from '../../templates/MonthlyForecastSelectPeriodCardTemplate';
import { MonthlyForecastWarningCardTemplate } from '../../templates/MonthlyForecastWarningCardTemplate';
import { MonthlyForecastProductsCardTemplate } from '../../templates/MonthlyForecastProductsCardTemplate';
import { DealerReportsViewOrdersCardTemplate } from '../../templates/DealerReportsViewOrdersCardTemplate';
import { DealerReportsPeriodSelectorCardTemplate } from '../../templates/DealerReportsPeriodSelectorCardTemplate';
import '../../App.css';

const { Title, Text } = Typography;

function DealerTemplateCards() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01-01_2024-01-31');
  const [rangeStart, setRangeStart] = useState(dayjs());
  const [rangeEnd, setRangeEnd] = useState(dayjs().add(7, 'day'));

  const formatPeriodLabel = (period) => {
    if (!period) return '';
    const start = dayjs(period.period_start);
    const end = dayjs(period.period_end);
    return `${start.format('MMM YYYY')} - ${end.format('MMM YYYY')}`;
  };

  const demoPeriods = [
    { period_start: '2024-01-01', period_end: '2024-01-31', is_current: false, has_forecast: true, label: 'Jan 2024 - Jan 2024' },
    { period_start: '2024-02-01', period_end: '2024-02-29', is_current: true, has_forecast: true, label: 'Feb 2024 - Feb 2024' },
    { period_start: '2024-03-01', period_end: '2024-03-31', is_current: false, has_forecast: false, label: 'Mar 2024 - Mar 2024' },
  ];

  return (
    <div>
      <Title {...STANDARD_PAGE_TITLE_CONFIG}>
        <LayoutOutlined /> Dealer Card Templates
      </Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        Individual template files for Dealer-specific card layouts. Each card has its own dedicated template file.
      </Text>

      {/* DAILY DEMAND MULTI-DAY ADD DATES CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="Dealer > /daily-demand > Daily Demand (Multi-Day) > Add Dates">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>DailyDemandMultiDayAddDatesCardTemplate.js</code><br/>
          Used in: Daily Demand Multi-Day page - Add Dates card<br/>
          Features: Quick date buttons (Today, Tomorrow, Day After, 3 Days) and date picker<br/>
          Horizontal gap: 12px (COMPACT_ROW_GUTTER)
        </Text>
        <DailyDemandMultiDayAddDatesCardTemplate
          title="Add Dates"
          quickDateButtons={[
            { label: 'Today', onClick: () => {} },
            { label: 'Tomorrow', onClick: () => {} },
            { label: 'Day After', onClick: () => {} },
            { label: '3 Days', onClick: () => {} },
          ]}
          datePicker={{
            placeholder: 'Or select custom date',
            onChange: () => {},
            disabledDate: () => false,
          }}
        />
      </Card>

      {/* DAILY DEMAND MULTI-DAY SELECT PRODUCTS CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="Dealer > /daily-demand > Daily Demand (Multi-Day) > Select Products">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>DailyDemandMultiDaySelectProductsCardTemplate.js</code><br/>
          Used in: Daily Demand Multi-Day page - Select Products card<br/>
          Features: Tabs for each selected date, product search, product grid, inline submit button<br/>
          Horizontal gap: N/A (tabs layout)
        </Text>
        <DailyDemandMultiDaySelectProductsCardTemplate
          selectedDates={[dayjs(), dayjs().add(1, 'day')]}
          activeDateTab={dayjs().format('YYYY-MM-DD')}
          setActiveDateTab={() => {}}
          removeDate={() => {}}
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          filteredProducts={[
            { id: 1, name: '6DGA-1400 Gaston', product_code: 'E101GT108' },
            { id: 2, name: 'TRB130 Dimitris', product_code: 'L104DT030' },
            { id: 3, name: 'TRB-190 Z Power', product_code: 'L104ZR162' },
          ]}
          quantities={{ '2024-12-11_1': 10, '2024-12-11_3': 15 }}
          onQuantityChange={() => {}}
          onClearProduct={() => {}}
          presetValues={[5, 10, 15, 20]}
          getTotalItems={() => 2}
          onSubmit={() => {}}
          loading={false}
        />
      </Card>

      {/* MONTHLY FORECAST SELECT PERIOD CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="Dealer > /monthly-forecast > Monthly Forecast > Select Period">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>MonthlyForecastSelectPeriodCardTemplate.tsx</code><br/>
          Used in: Monthly Forecast page - Select Period card<br/>
          Features: Period selector with tags (Current, Historical, No Data) and period info display<br/>
          Horizontal gap: N/A (flex wrap layout)
        </Text>
        <MonthlyForecastSelectPeriodCardTemplate
          periodSelect={{
            value: selectedPeriod,
            onChange: setSelectedPeriod,
            placeholder: 'Select forecast period',
            loading: false,
            options: demoPeriods,
            formatLabel: formatPeriodLabel,
          }}
          periodInfo={{
            isCurrent: true,
            start: '2024-02-01',
            end: '2024-02-29',
          }}
        />
      </Card>

      {/* MONTHLY FORECAST PRODUCTS CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="Dealer > /monthly-forecast > Monthly Forecast > Products Card">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>MonthlyForecastProductsCardTemplate.js</code><br/>
          Used in: Monthly Forecast page - Products Card Grid<br/>
          Features: Grid of product cards with quantity inputs, empty state message, inline footer buttons<br/>
          Horizontal gap: N/A (grid layout)
        </Text>
        <MonthlyForecastProductsCardTemplate
          products={[
            { id: 1, name: '6DGA-1400 Gaston', product_code: 'E101GT108' },
            { id: 2, name: 'TRB130 Dimitris', product_code: 'L104DT030' },
            { id: 3, name: 'TRB-190 Z Power', product_code: 'L104ZR162' },
          ]}
          forecastData={{ 1: 10, 2: null, 3: 15 }}
          onQuantityChange={() => {}}
          onClearProduct={() => {}}
          canEdit={true}
          labelText="Monthly Forecast Quantity:"
          presetValues={[5, 10, 15, 20]}
          loading={false}
          resetButton={{
            label: 'Reset All',
            onClick: () => {},
          }}
          saveButton={{
            label: 'Save All',
            icon: <SaveOutlined />,
            onClick: () => {},
            loading: false,
          }}
          getTotalItems={() => 2}
        />
      </Card>

      {/* MONTHLY FORECAST WARNING CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="Dealer > /monthly-forecast > Monthly Forecast > Warning/Info Cards">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>MonthlyForecastWarningCardTemplate.js</code><br/>
          Used in: Monthly Forecast page - Warning and Info cards<br/>
          Features: Warning card (submitted forecast) and Info card (historical forecast)<br/>
          Horizontal gap: N/A (single card)
        </Text>
        <MonthlyForecastWarningCardTemplate
          type="warning"
          message="⚠️ This forecast has been submitted and cannot be modified. Please contact admin or TSO for changes."
        />
        <div style={{ marginTop: '16px' }}>
          <MonthlyForecastWarningCardTemplate
            type="info"
            message="This is a historical forecast. You can view but not edit past forecasts."
            icon={<HistoryOutlined />}
          />
        </div>
      </Card>

      {/* DEALER REPORTS VIEW ORDERS CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="Dealer > /my-reports > My Reports > View Orders">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>DealerReportsViewOrdersCardTemplate.tsx</code><br/>
          Used in: Dealer Reports page - View Orders card<br/>
          Features: Date range picker and 2 buttons (View Orders/View Range, Export Excel)<br/>
          Horizontal gap: 16px (STANDARD_ROW_GUTTER)
        </Text>
        <DealerReportsViewOrdersCardTemplate
          dateRangePicker={{
            startDate: rangeStart,
            setStartDate: setRangeStart,
            endDate: rangeEnd,
            setEndDate: setRangeEnd,
            disabledDate: () => false,
            dateRender: () => null,
            availableDates: [],
            colSpan: { xs: 24, sm: 12, md: 2 },
          }}
          buttons={[
            {
              type: 'default',
              icon: <EyeOutlined />,
              label: rangeEnd ? 'View Range' : 'View Orders',
              onClick: () => {},
              loading: false,
              disabled: false,
            },
            {
              type: 'primary',
              icon: <DownloadOutlined />,
              label: 'Export Excel',
              onClick: () => {},
              loading: false,
              disabled: false,
            },
          ]}
        />
      </Card>

      {/* DEALER REPORTS PERIOD SELECTOR CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="Dealer > /my-reports > My Reports > Period Selector">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>DealerReportsPeriodSelectorCardTemplate.js</code><br/>
          Used in: Dealer Reports page - Monthly Forecasts tab - Period Selector card<br/>
          Features: Period select dropdown<br/>
          Horizontal gap: 16px (SINGLE_ROW_GUTTER)
        </Text>
        <DealerReportsPeriodSelectorCardTemplate
          periodSelect={{
            value: selectedPeriod,
            onChange: setSelectedPeriod,
            placeholder: 'Select forecast period',
            options: demoPeriods.map(p => ({
              period_start: p.period_start,
              period_end: p.period_end,
              label: p.label,
              is_current: p.is_current,
              value: `${p.period_start}_${p.period_end}`,
            })),
          }}
        />
      </Card>
    </div>
  );
}

export default DealerTemplateCards;

