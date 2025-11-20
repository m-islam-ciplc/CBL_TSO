import { useState, useEffect } from 'react';
import {
  Card,
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
  Divider,
} from 'antd';
import {
  CalendarOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  SearchOutlined,
  BarChartOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { Option } = Select;

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

function DealerForecasts_Option2_Cards() {
  const [forecasts, setForecasts] = useState(mockForecastData);
  const [filteredForecasts, setFilteredForecasts] = useState(mockForecastData);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('2025-11-18_2025-12-17');
  const [searchTerm, setSearchTerm] = useState('');
  const [territoryFilter, setTerritoryFilter] = useState('');

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

  const totalQuantity = filteredForecasts.reduce((sum, f) => sum + f.total_quantity, 0);
  const totalDealers = filteredForecasts.length;
  const totalProducts = filteredForecasts.reduce((sum, f) => sum + f.total_products, 0);

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0, fontSize: '20px' }}>
              <BarChartOutlined /> Dealer Forecasts - Option 2: Card View
            </Title>
            <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
              Card-based layout showing dealer forecasts with product details
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

      {/* Forecast Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
        {filteredForecasts.map((forecast) => (
          <Card
            key={forecast.dealer_id}
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            title={
              <Space>
                <ShopOutlined />
                <Text strong>{forecast.dealer_name}</Text>
              </Space>
            }
            extra={
              <Tag color="blue">{forecast.dealer_code}</Tag>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <div>
                <Text type="secondary">Territory: </Text>
                <Text strong>{forecast.territory_name}</Text>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Products"
                    value={forecast.total_products}
                    prefix={<FileExcelOutlined />}
                    valueStyle={{ fontSize: '18px' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Total Quantity"
                    value={forecast.total_quantity}
                    prefix={<CalendarOutlined />}
                    valueStyle={{ fontSize: '18px' }}
                  />
                </Col>
              </Row>
              <Divider style={{ margin: '12px 0' }} />
              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                  Products:
                </Text>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {forecast.products.map((product) => (
                    <div
                      key={product.product_code}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px',
                        background: '#fafafa',
                        borderRadius: '4px',
                      }}
                    >
                      <div>
                        <Text strong>{product.product_code}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {product.product_name}
                        </Text>
                      </div>
                      <Tag color="green" style={{ fontSize: '14px', padding: '4px 8px' }}>
                        {product.quantity}
                      </Tag>
                    </div>
                  ))}
                </Space>
              </div>
            </Space>
          </Card>
        ))}
      </div>

      {filteredForecasts.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">No forecasts found matching your filters</Text>
        </Card>
      )}
    </div>
  );
}

export default DealerForecasts_Option2_Cards;

