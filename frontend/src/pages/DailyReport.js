import { useState, useEffect } from 'react';
import { Card, Button, message, Typography, Row, Col, Space, Spin, Table, Tag, Input, Select, Tabs, Badge } from 'antd';
import { SearchOutlined, BarChartOutlined, AppstoreOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { useUser } from '../contexts/UserContext';
import { 
  STANDARD_CARD_CONFIG, 
  FILTER_CARD_CONFIG, 
  DATE_SELECTION_CARD_CONFIG, 
  TABLE_CARD_CONFIG, 
  EXPANDABLE_TABLE_CARD_CONFIG,
  STANDARD_PAGE_TITLE_CONFIG, 
  STANDARD_PAGE_SUBTITLE_CONFIG, 
  STANDARD_ROW_GUTTER, 
  STANDARD_TABLE_SIZE, 
  STANDARD_TAG_STYLE, 
  STANDARD_TABS_CONFIG, 
  STANDARD_BADGE_CONFIG, 
  STANDARD_SPIN_SIZE, 
  STANDARD_INPUT_SIZE,
  createStandardDatePickerConfig
} from '../templates/UITemplates';
import { MonthlyForecastsFilterCardTemplate } from '../templates/MonthlyForecastsFilterCardTemplate';
import { STANDARD_EXPANDABLE_TABLE_CONFIG, renderProductDetailsStack } from '../templates/TableTemplate';
import { useCascadingFilters } from '../templates/useCascadingFilters';
import { getStandardPaginationConfig } from '../templates/useStandardPagination';

const { Title, Text } = Typography;
const { Option } = Select;

// Helper function to remove M/S prefix from dealer names
const removeMSPrefix = (name) => {
  if (!name) return name;
  // Remove "M/S", "M/S.", "M/S " prefix (case insensitive, with or without space/period)
  return name.replace(/^M\/S[.\s]*/i, '').trim();
};

function DailyReport() {
  const { territoryName, isTSO } = useUser();
  const [activeTab, setActiveTab] = useState('forecasts-by-dealer');

  // Forecast states
  const [forecasts, setForecasts] = useState([]);
  const [filteredForecasts, setFilteredForecasts] = useState([]);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [forecastSearchTerm, setForecastSearchTerm] = useState('');
  const [territoryFilter, setTerritoryFilter] = useState(isTSO ? territoryName : null);
  const [dealerFilter, setDealerFilter] = useState(null);
  const [forecastViewType, setForecastViewType] = useState('dealer'); // 'dealer', 'product', or 'territory'
  const [expandedRowKeys, setExpandedRowKeys] = useState({
    byDealer: [],
    byProduct: [],
    byTerritory: [],
  });

  // Load available periods on component mount
  useEffect(() => {
    loadPeriods();
  }, []);

  // Load forecasts when period changes
  useEffect(() => {
    if (selectedPeriod) {
      loadForecasts();
    }
  }, [selectedPeriod]);

  // Filter forecasts
  useEffect(() => {
    filterForecasts();
  }, [forecastSearchTerm, territoryFilter, dealerFilter, forecasts, forecastViewType]);

  // Load available periods
  const loadPeriods = async () => {
    try {
      const response = await axios.get('/api/monthly-forecast/current-period');
      const currentPeriod = response.data;
      
      // Generate last 12 months of periods
      const periodsList = [];
      for (let i = 0; i < 12; i++) {
        const period = calculatePeriodFromStartEnd(currentPeriod.start, i);
        periodsList.push({
          value: `${period.start}_${period.end}`,
          label: formatPeriodLabel(period.start, period.end),
          is_current: i === 0,
          start: period.start,
          end: period.end,
        });
      }
      
      setPeriods(periodsList);
      if (periodsList.length > 0) {
        setSelectedPeriod(periodsList[0].value);
      }
    } catch (error) {
      console.error('Error loading periods:', error);
    }
  };

  // Helper to calculate period from start date with offset
  const calculatePeriodFromStartEnd = (startDateStr, monthOffset) => {
    const startDate = dayjs(startDateStr);
    const periodStart = startDate.subtract(monthOffset, 'month');
    const periodEnd = periodStart.add(1, 'month').subtract(1, 'day');
    return {
      start: periodStart.format('YYYY-MM-DD'),
      end: periodEnd.format('YYYY-MM-DD'),
    };
  };

  // Helper to format period label
  const formatPeriodLabel = (start, end) => {
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    return `${startDate.format('MMM YYYY')} - ${endDate.format('MMM YYYY')}`;
  };

  // Load forecasts
  const loadForecasts = async () => {
    if (!selectedPeriod) return;
    
    setForecastLoading(true);
    try {
      const [periodStart, periodEnd] = selectedPeriod.split('_');
      const params = {
        period_start: periodStart,
        period_end: periodEnd,
      };
      
      // Only add territory filter for TSO users (server-side filtering for security)
      // Admin users will filter client-side
      if (isTSO && territoryName) {
        params.territory_name = territoryName;
      }
      
      const response = await axios.get('/api/monthly-forecast/all', { params });
      setForecasts(response.data.forecasts || []);
    } catch (error) {
      console.error('Error loading forecasts:', error);
      message.error('Failed to load forecasts');
      setForecasts([]);
    } finally {
      setForecastLoading(false);
    }
  };

  const filterForecasts = () => {
    let filtered = [...forecasts];

    // Territory filter is already applied in API call for TSO, but allow manual filter for admin
    if (!isTSO && territoryFilter) {
      filtered = filtered.filter((f) => f.territory_name === territoryFilter);
    }

    // Dealer filter (only for dealer view)
    if (forecastViewType === 'dealer' && dealerFilter) {
      filtered = filtered.filter((f) => f.dealer_id === parseInt(dealerFilter));
    }

    // Search filter (applied after dealer filter)
    if (forecastSearchTerm) {
      if (forecastViewType === 'dealer') {
        filtered = filtered.filter(
          (f) =>
            f.dealer_name.toLowerCase().includes(forecastSearchTerm.toLowerCase()) ||
            f.dealer_code.toLowerCase().includes(forecastSearchTerm.toLowerCase())
        );
      } else if (forecastViewType === 'product') {
        // Search in product names/codes within forecasts
        filtered = filtered.filter((f) =>
          f.products.some((p) =>
            p.product_name.toLowerCase().includes(forecastSearchTerm.toLowerCase()) ||
            p.product_code.toLowerCase().includes(forecastSearchTerm.toLowerCase())
          )
        );
      } else if (forecastViewType === 'territory') {
        filtered = filtered.filter((f) =>
          f.territory_name.toLowerCase().includes(forecastSearchTerm.toLowerCase())
        );
      }
    }

    setFilteredForecasts(filtered);
  };

  const handleForecastExport = () => {
    try {
      const exportData = filteredForecasts.flatMap((forecast) =>
        forecast.products.map((product) => ({
          'Dealer Code': forecast.dealer_code,
          'Dealer Name': forecast.dealer_name,
          'Territory': forecast.territory_name,
          'Product Code': product.product_code,
          'Product Name': product.product_name,
          'Forecast Quantity': product.quantity,
          'Period': periods.find((p) => p.value === selectedPeriod)?.label || selectedPeriod,
        }))
      );

      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set font style for all cells: Calibri size 8
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cellAddress]) continue;
          if (!ws[cellAddress].s) ws[cellAddress].s = {};
          ws[cellAddress].s.font = {
            name: 'Calibri',
            sz: 8,
            bold: R === range.s.r // Make header row bold
          };
        }
      }
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dealer Forecasts');

      const periodLabel = periods.find((p) => p.value === selectedPeriod)?.label || 'Forecast';
      const filename = `Dealer_Forecasts_${periodLabel.replace(/\s+/g, '_')}.xlsx`;
      XLSX.writeFile(wb, filename);

      message.success('Forecast data exported successfully!');
    } catch (error) {
      message.error('Failed to export data');
      console.error('Export error:', error);
    }
  };

  // Aggregate forecast data
  const productSummary = {};
  filteredForecasts.forEach((forecast) => {
    forecast.products.forEach((product) => {
      if (!productSummary[product.product_code]) {
        productSummary[product.product_code] = {
          product_code: product.product_code,
          product_name: product.product_name,
          total_quantity: 0,
          dealer_count: new Set(),
          dealers: [],
        };
      }
      productSummary[product.product_code].total_quantity += Number(product.quantity) || 0;
      productSummary[product.product_code].dealer_count.add(forecast.dealer_id);
      productSummary[product.product_code].dealers.push({
        dealer_code: forecast.dealer_code,
        dealer_name: forecast.dealer_name,
        territory_name: forecast.territory_name,
        quantity: product.quantity,
      });
    });
  });

  const productSummaryData = Object.values(productSummary).map((p) => ({
    ...p,
    dealer_count: p.dealer_count.size,
  }));

  const territorySummary = {};
  filteredForecasts.forEach((forecast) => {
    if (!territorySummary[forecast.territory_name]) {
      territorySummary[forecast.territory_name] = {
        territory_name: forecast.territory_name,
        total_quantity: 0,
        dealer_count: 0,
        product_count: new Set(),
        dealers: [],
      };
    }
    territorySummary[forecast.territory_name].total_quantity += Number(forecast.total_quantity) || 0;
    territorySummary[forecast.territory_name].dealer_count += 1;
    forecast.products.forEach((p) => {
      territorySummary[forecast.territory_name].product_count.add(p.product_code);
    });
    territorySummary[forecast.territory_name].dealers.push({
      dealer_code: forecast.dealer_code,
      dealer_name: forecast.dealer_name,
      total_products: forecast.total_products,
      total_quantity: forecast.total_quantity,
      products: forecast.products,
    });
  });

  const territorySummaryData = Object.values(territorySummary).map((t) => ({
    ...t,
    product_count: t.product_count.size,
  }));

  // Get unique territories for filter dropdown (only for admin)
  const uniqueTerritories = [...new Set(forecasts.map(f => f.territory_name))].sort();
  
  // Get unique dealers for filter dropdown
  const uniqueDealers = forecasts
    .map(f => ({ id: f.dealer_id, code: f.dealer_code, name: f.dealer_name, territory: f.territory_name }))
    .filter((dealer, index, self) => 
      index === self.findIndex(d => d.id === dealer.id)
    )
    .sort((a, b) => a.code.localeCompare(b.code));

  /**
   * Cascading filters
   */
  // Monthly Forecasts tab: Territory -> Dealer
  const { filteredOptions: forecastFilterOptions } = useCascadingFilters({
    filterConfigs: [
      {
        name: 'dealer',
        allOptions: uniqueDealers,
        dependsOn: isTSO ? [] : ['territory'],
        filterFn: (dealer, parentValues) => {
          if (isTSO) return true;
          if (!parentValues.territory) return true;
          return dealer.territory === parentValues.territory;
        },
        getValueKey: (dealer) => dealer.id?.toString?.() || dealer.id,
      },
    ],
    filterValues: {
      territory: territoryFilter,
      dealer: dealerFilter,
    },
    setFilterValues: {
      dealer: setDealerFilter,
    },
  });

  const filteredForecastDealers = forecastFilterOptions.dealer || uniqueDealers;

  // Forecast table columns and renderers
  const dealerColumns = [
    {
      title: 'Dealer Code',
      dataIndex: 'dealer_code',
      key: 'dealer_code',
      width: 120,
      fixed: 'left',
    },
    {
      title: 'Dealer Name',
      dataIndex: 'dealer_name',
      key: 'dealer_name',
      ellipsis: true,
    },
    {
      title: 'Territory',
      dataIndex: 'territory_name',
      key: 'territory_name',
      width: 180,
    },
    {
      title: 'Products',
      dataIndex: 'total_products',
      key: 'total_products',
      width: 100,
      align: 'center',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Product Details',
      key: 'product_details',
      ellipsis: {
        showTitle: true,
      },
      render: (_, record) =>
        renderProductDetailsStack({
          products: record.products || [],
          showPrice: false,
          showIndex: true,
        }),
    },
    {
      title: 'Total Quantity',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 130,
      align: 'right',
      render: (text) => <Text strong>{(Number(text) || 0).toLocaleString()}</Text>,
    },
  ];

  const productColumns = [
    {
      title: 'Product Code',
      dataIndex: 'product_code',
      key: 'product_code',
      width: 150,
    },
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
      ellipsis: true,
    },
    {
      title: 'Dealers',
      dataIndex: 'dealer_count',
      key: 'dealer_count',
      width: 100,
      align: 'center',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Total Forecast',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 150,
      align: 'right',
      render: (text) => <Text strong>{text.toLocaleString()}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right',
      align: 'center',
      render: (_text, record) => {
        const isExpanded = expandedRowKeys.byProduct.includes(record.product_code);
        return (
          <Badge {...STANDARD_BADGE_CONFIG} count={record.dealer_count}>
            <Button
              type="primary"
              icon={<AppstoreOutlined />}
              size={STANDARD_TABLE_SIZE}
              onClick={(e) => {
                e.stopPropagation();
                if (isExpanded) {
                  setExpandedRowKeys({
                    ...expandedRowKeys,
                    byProduct: expandedRowKeys.byProduct.filter((key) => key !== record.product_code),
                  });
                } else {
                  setExpandedRowKeys({
                    ...expandedRowKeys,
                    byProduct: [...expandedRowKeys.byProduct, record.product_code],
                  });
                }
              }}
            >
              {isExpanded ? 'Hide Dealers' : 'View Dealers'}
            </Button>
          </Badge>
        );
      },
    },
  ];

  const territoryColumns = [
    {
      title: 'Territory',
      dataIndex: 'territory_name',
      key: 'territory_name',
      width: 200,
    },
    {
      title: 'Dealers',
      dataIndex: 'dealer_count',
      key: 'dealer_count',
      width: 100,
      align: 'center',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Products',
      dataIndex: 'product_count',
      key: 'product_count',
      width: 100,
      align: 'center',
      render: (text) => <Tag color="green">{text}</Tag>,
    },
    {
      title: 'Total Forecast',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 150,
      align: 'right',
      render: (text) => <Text strong>{text.toLocaleString()}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right',
      align: 'center',
      render: (_text, record) => {
        const isExpanded = expandedRowKeys.byTerritory.includes(record.territory_name);
        return (
          <Badge {...STANDARD_BADGE_CONFIG} count={record.dealer_count}>
            <Button
              type="primary"
              icon={<AppstoreOutlined />}
              size={STANDARD_TABLE_SIZE}
              onClick={(e) => {
                e.stopPropagation();
                if (isExpanded) {
                  setExpandedRowKeys({
                    ...expandedRowKeys,
                    byTerritory: expandedRowKeys.byTerritory.filter((key) => key !== record.territory_name),
                  });
                } else {
                  setExpandedRowKeys({
                    ...expandedRowKeys,
                    byTerritory: [...expandedRowKeys.byTerritory, record.territory_name],
                  });
                }
              }}
            >
              {isExpanded ? 'Hide Dealers' : 'View Dealers'}
            </Button>
          </Badge>
        );
      },
    },
  ];

  const renderProductExpandedRow = (record) => {
    const dealerColumns = [
      {
        title: 'Dealer Code',
        dataIndex: 'dealer_code',
        key: 'dealer_code',
        width: 120,
      },
      {
        title: 'Dealer Name',
        dataIndex: 'dealer_name',
        key: 'dealer_name',
        ellipsis: true,
      },
      {
        title: 'Territory',
        dataIndex: 'territory_name',
        key: 'territory_name',
        width: 180,
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 120,
        align: 'right',
        render: (text) => <Text strong style={{ fontSize: STANDARD_EXPANDABLE_TABLE_CONFIG.fontSizes.strong }}>{text.toLocaleString()}</Text>,
      },
    ];

    return (
      <div style={STANDARD_EXPANDABLE_TABLE_CONFIG.expandedRowContent.container}>
        <Table
          columns={dealerColumns}
          dataSource={record.dealers}
          pagination={false}
          size={STANDARD_TABLE_SIZE}
          rowKey="dealer_code"
        />
      </div>
    );
  };

  const renderTerritoryExpandedRow = (record) => {
    const dealerColumns = [
      {
        title: 'Dealer Code',
        dataIndex: 'dealer_code',
        key: 'dealer_code',
        width: 120,
      },
      {
        title: 'Dealer Name',
        dataIndex: 'dealer_name',
        key: 'dealer_name',
        ellipsis: true,
      },
      {
        title: 'Products',
        dataIndex: 'total_products',
        key: 'total_products',
        width: 100,
        align: 'center',
        render: (text) => <Tag color="blue" style={STANDARD_TAG_STYLE}>{text}</Tag>,
      },
      {
        title: 'Total Quantity',
        dataIndex: 'total_quantity',
        key: 'total_quantity',
        width: 130,
        align: 'right',
        render: (text) => <Text strong style={{ fontSize: STANDARD_EXPANDABLE_TABLE_CONFIG.fontSizes.strong }}>{text.toLocaleString()}</Text>,
      },
    ];

    return (
      <div style={STANDARD_EXPANDABLE_TABLE_CONFIG.expandedRowContent.container}>
        <Table
          columns={dealerColumns}
          dataSource={record.dealers}
          pagination={false}
          size={STANDARD_TABLE_SIZE}
          rowKey="dealer_code"
        />
      </div>
    );
  };

  return (
    <div>
      <Title {...STANDARD_PAGE_TITLE_CONFIG}>
        <BarChartOutlined /> Reports
      </Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        Generate reports for orders and view dealer forecasts
      </Text>

      <Tabs {...STANDARD_TABS_CONFIG} activeKey={activeTab} onChange={setActiveTab}>
        {/* Monthly Forecasts Tab - Consolidated */}
        <Tabs.TabPane
          tab={
            <span>
              <AppstoreOutlined />
              Monthly Forecasts
            </span>
          }
          key="forecasts-by-dealer"
        >
          {/* Filters and Actions */}
          <MonthlyForecastsFilterCardTemplate
            title="Filter Forecasts"
            formFields={[
              {
                label: 'View Type',
                type: 'select',
                value: forecastViewType,
                onChange: setForecastViewType,
                placeholder: 'Select View',
                options: [
                  { value: 'dealer', label: 'By Dealer' },
                  { value: 'product', label: 'By Product' },
                  { value: 'territory', label: 'By Territory' },
                ],
                maxWidth: '12.5rem',
              },
              {
                label: 'Period',
                type: 'select',
                value: selectedPeriod,
                onChange: setSelectedPeriod,
                placeholder: 'Select Period',
                options: periods.map((p) => ({
                  value: p.value,
                  label: p.is_current ? `${p.label} (Current)` : p.label,
                })),
                loading: !selectedPeriod,
                allowClear: true,
                showSearch: true,
                maxWidth: '18rem',
              },
              ...(!isTSO ? [{
                label: 'Territory',
                type: 'select',
                value: territoryFilter,
                onChange: (value) => setTerritoryFilter(value || null),
                placeholder: 'All Territories',
                options: uniqueTerritories.map((t) => ({
                  value: t,
                  label: t,
                })),
                allowClear: true,
                showSearch: true,
                flex: 'auto',
              }] : []),
              ...(forecastViewType === 'dealer' ? [{
                label: 'Dealer',
                type: 'select',
                value: dealerFilter,
                onChange: (value) => setDealerFilter(value || null),
                placeholder: 'All Dealers',
                options: filteredForecastDealers.map((d) => ({
                  value: d.id.toString(),
                  label: `${d.code} - ${d.name}`,
                })),
                allowClear: true,
                showSearch: true,
              }] : []),
              {
                label: 'Search',
                type: 'input',
                value: forecastSearchTerm,
                onChange: (e) => setForecastSearchTerm(e.target.value),
                placeholder: forecastViewType === 'dealer' ? 'Dealer name or code' : forecastViewType === 'product' ? 'Product name or code' : 'Territory name',
                prefix: <SearchOutlined />,
                allowClear: true,
              },
            ].filter(Boolean).slice(0, 4)}
            buttons={[
              {
                label: 'Export Excel',
                type: 'primary',
                icon: <DownloadOutlined />,
                onClick: handleForecastExport,
                disabled: filteredForecasts.length === 0,
              },
            ]}
          />

          {/* Dealer View */}
          {forecastViewType === 'dealer' && (
            <Card {...TABLE_CARD_CONFIG}>
              <Table
                columns={dealerColumns}
                dataSource={filteredForecasts}
                rowKey="dealer_id"
                loading={forecastLoading}
                pagination={getStandardPaginationConfig('dealers', 20)}
                scroll={{ x: 800 }}
              />
            </Card>
          )}

          {/* Product View */}
          {forecastViewType === 'product' && (
            <Card {...EXPANDABLE_TABLE_CARD_CONFIG}>
              <Table
                columns={productColumns}
                dataSource={productSummaryData}
                rowKey="product_code"
                loading={forecastLoading}
                expandable={{
                  expandedRowRender: renderProductExpandedRow,
                  expandedRowKeys: expandedRowKeys.byProduct,
                  onExpandedRowsChange: (keys) => {
                    setExpandedRowKeys({
                      ...expandedRowKeys,
                      byProduct: keys,
                    });
                  },
                  expandRowByClick: false,
                  showExpandColumn: false,
                }}
                pagination={getStandardPaginationConfig('products', 20)}
                scroll={{ x: 800 }}
              />
            </Card>
          )}

          {/* Territory View */}
          {forecastViewType === 'territory' && (
            <Card {...EXPANDABLE_TABLE_CARD_CONFIG}>
              <Table
                columns={territoryColumns}
                dataSource={territorySummaryData}
                rowKey="territory_name"
                loading={forecastLoading}
                expandable={{
                  expandedRowRender: renderTerritoryExpandedRow,
                  expandedRowKeys: expandedRowKeys.byTerritory,
                  onExpandedRowsChange: (keys) => {
                    setExpandedRowKeys({
                      ...expandedRowKeys,
                      byTerritory: keys,
                    });
                  },
                  expandRowByClick: false,
                  showExpandColumn: false,
                }}
                pagination={false}
                scroll={{ x: 800 }}
              />
            </Card>
          )}
        </Tabs.TabPane>

      </Tabs>
    </div>
  );
}

export default DailyReport;
