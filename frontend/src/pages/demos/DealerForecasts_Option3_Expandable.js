import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Typography,
  Row,
  Col,
  Select,
  Button,
  Space,
  Tag,
  Input,
  message,
  Statistic,
  Tabs,
  Badge,
} from 'antd';
import {
  CalendarOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  SearchOutlined,
  BarChartOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Demo data
const mockForecastData = [
  {
    dealer_id: 990,
    dealer_code: '00990',
    dealer_name: 'M/S Diba Enterprise',
    territory_name: 'Cumilla Territory',
    total_products: 3,
    total_quantity: 150,
    products: [
      { product_code: 'E101GT108', product_name: '6DGA-1400 Gaston', quantity: 50 },
      { product_code: 'E101MN095', product_name: 'MR-180A/H Maniratna', quantity: 60 },
      { product_code: 'L101AF032', product_name: 'ET140TL Alpha', quantity: 40 },
    ],
  },
  {
    dealer_id: 1131,
    dealer_code: '01131',
    dealer_name: 'M/S Khalaq Motors-Feni',
    territory_name: 'Cumilla Territory',
    total_products: 2,
    total_quantity: 100,
    products: [
      { product_code: 'E101GT108', product_name: '6DGA-1400 Gaston', quantity: 50 },
      { product_code: 'L101AF032', product_name: 'ET140TL Alpha', quantity: 50 },
    ],
  },
  {
    dealer_id: 44,
    dealer_code: '00044',
    dealer_name: 'M/S Ultimate Tyre & Battery',
    territory_name: 'Tangail Territory',
    total_products: 1,
    total_quantity: 75,
    products: [
      { product_code: 'E101GT108', product_name: '6DGA-1400 Gaston', quantity: 75 },
    ],
  },
];

function DealerForecasts_Option3_Expandable() {
  const [forecasts, setForecasts] = useState(mockForecastData);
  const [filteredForecasts, setFilteredForecasts] = useState(mockForecastData);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('2025-11-18_2025-12-17');
  const [searchTerm, setSearchTerm] = useState('');
  const [territoryFilter, setTerritoryFilter] = useState('');
  const [activeTab, setActiveTab] = useState('by-dealer');
  const [expandedRowKeys, setExpandedRowKeys] = useState({
    byDealer: [],
    byProduct: [],
    byTerritory: [],
  });

  const periods = [
    { value: '2025-11-18_2025-12-17', label: 'Nov 2025 - Dec 2025', is_current: true },
    { value: '2025-10-18_2025-11-17', label: 'Oct 2025 - Nov 2025', is_current: false },
    { value: '2025-09-18_2025-10-17', label: 'Sep 2025 - Oct 2025', is_current: false },
  ];

  const territories = ['Cumilla Territory', 'Tangail Territory', 'Dhaka Territory'];

  useEffect(() => {
    filterForecasts();
  }, [searchTerm, territoryFilter, forecasts]);

  const filterForecasts = () => {
    let filtered = [...forecasts];

    if (searchTerm) {
      filtered = filtered.filter(
        (f) =>
          f.dealer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.dealer_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (territoryFilter) {
      filtered = filtered.filter((f) => f.territory_name === territoryFilter);
    }

    setFilteredForecasts(filtered);
  };

  const handleExport = () => {
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

  // Aggregate by product
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
      productSummary[product.product_code].total_quantity += product.quantity;
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

  // Aggregate by territory
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
    territorySummary[forecast.territory_name].total_quantity += forecast.total_quantity;
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

  const totalQuantity = filteredForecasts.reduce((sum, f) => sum + f.total_quantity, 0);
  const totalDealers = filteredForecasts.length;
  const totalProducts = filteredForecasts.reduce((sum, f) => sum + f.total_products, 0);

  // Dealer columns with expandable
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
      title: 'Total Quantity',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 130,
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
        const isExpanded = expandedRowKeys.byDealer.includes(record.dealer_id);
        return (
          <Badge count={record.total_products} showZero overflowCount={999}>
            <Button
              type="primary"
              icon={<AppstoreOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (isExpanded) {
                  setExpandedRowKeys({
                    ...expandedRowKeys,
                    byDealer: expandedRowKeys.byDealer.filter((key) => key !== record.dealer_id),
                  });
                } else {
                  setExpandedRowKeys({
                    ...expandedRowKeys,
                    byDealer: [...expandedRowKeys.byDealer, record.dealer_id],
                  });
                }
              }}
            >
              {isExpanded ? 'Hide Products' : 'View Products'}
            </Button>
          </Badge>
        );
      },
    },
  ];

  // Product columns with expandable
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
          <Badge count={record.dealer_count} showZero overflowCount={999}>
            <Button
              type="primary"
              icon={<AppstoreOutlined />}
              size="small"
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

  // Territory columns with expandable
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
          <Badge count={record.dealer_count} showZero overflowCount={999}>
            <Button
              type="primary"
              icon={<AppstoreOutlined />}
              size="small"
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

  // Expanded row renderers
  const renderDealerExpandedRow = (record) => {
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
        title: 'Forecast Quantity',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 150,
        align: 'right',
        render: (text) => <Text strong>{text.toLocaleString()}</Text>,
      },
    ];

    return (
      <Table
        columns={productColumns}
        dataSource={record.products}
        pagination={false}
        size="small"
        rowKey="product_code"
      />
    );
  };

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
        render: (text) => <Text strong>{text.toLocaleString()}</Text>,
      },
    ];

    return (
      <Table
        columns={dealerColumns}
        dataSource={record.dealers}
        pagination={false}
        size="small"
        rowKey="dealer_code"
      />
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
        render: (text) => <Tag color="blue">{text}</Tag>,
      },
      {
        title: 'Total Quantity',
        dataIndex: 'total_quantity',
        key: 'total_quantity',
        width: 130,
        align: 'right',
        render: (text) => <Text strong>{text.toLocaleString()}</Text>,
      },
    ];

    return (
      <Table
        columns={dealerColumns}
        dataSource={record.dealers}
        pagination={false}
        size="small"
        rowKey="dealer_code"
      />
    );
  };

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0, fontSize: '20px' }}>
              <BarChartOutlined /> Dealer Forecasts - Option 3: Summary View (Expandable)
            </Title>
            <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
              Tabbed view with expandable tables showing details by dealer, product, and territory
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Text strong>Period:</Text>
            <Select
              style={{ width: '100%', marginTop: '8px' }}
              value={selectedPeriod}
              onChange={setSelectedPeriod}
            >
              {periods.map((p) => (
                <Option key={p.value} value={p.value}>
                  {p.label} {p.is_current && <Tag color="green" size="small">Current</Tag>}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Territory:</Text>
            <Select
              style={{ width: '100%', marginTop: '8px' }}
              value={territoryFilter}
              onChange={setTerritoryFilter}
              allowClear
              placeholder="All Territories"
            >
              {territories.map((t) => (
                <Option key={t} value={t}>
                  {t}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Search:</Text>
            <Input
              style={{ marginTop: '8px' }}
              placeholder="Dealer name or code"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space style={{ marginTop: '32px' }}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExport}
                disabled={filteredForecasts.length === 0}
              >
                Export Excel
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Dealers"
              value={totalDealers}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Products"
              value={totalProducts}
              prefix={<FileExcelOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Forecast Quantity"
              value={totalQuantity}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabbed Views */}
      <Card style={{ borderRadius: '8px' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <AppstoreOutlined />
                By Dealer
              </span>
            }
            key="by-dealer"
          >
            <Table
              columns={dealerColumns}
              dataSource={filteredForecasts}
              rowKey="dealer_id"
              loading={loading}
              expandable={{
                expandedRowRender: renderDealerExpandedRow,
                expandedRowKeys: expandedRowKeys.byDealer,
                onExpandedRowsChange: (keys) => {
                  setExpandedRowKeys({
                    ...expandedRowKeys,
                    byDealer: keys,
                  });
                },
                expandRowByClick: false,
                showExpandColumn: false,
              }}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `${total} dealers`,
              }}
              scroll={{ x: 800 }}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <FileExcelOutlined />
                By Product
              </span>
            }
            key="by-product"
          >
            <Table
              columns={productColumns}
              dataSource={productSummaryData}
              rowKey="product_code"
              loading={loading}
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
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `${total} products`,
              }}
              scroll={{ x: 800 }}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                By Territory
              </span>
            }
            key="by-territory"
          >
            <Table
              columns={territoryColumns}
              dataSource={territorySummaryData}
              rowKey="territory_name"
              loading={loading}
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
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}

export default DealerForecasts_Option3_Expandable;

