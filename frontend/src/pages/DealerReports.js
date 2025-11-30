import { useState, useEffect } from 'react';
import { Card, DatePicker, Button, message, Typography, Row, Col, Space, Spin, Table, Tag, Input, Tabs, Select } from 'antd';
import { DownloadOutlined, FileExcelOutlined, EyeOutlined, SearchOutlined, CalendarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { useUser } from '../contexts/UserContext';

const { Title, Text } = Typography;

function DealerReports() {
  const { dealerId, userId } = useUser();
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orderProducts, setOrderProducts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [previewInfo, setPreviewInfo] = useState('');
  const [previewMode, setPreviewMode] = useState('single');
  const [activeTab, setActiveTab] = useState('daily-demand');
  
  // Monthly Forecast states
  const [forecasts, setForecasts] = useState([]);
  const [filteredForecasts, setFilteredForecasts] = useState([]);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [forecastSearchTerm, setForecastSearchTerm] = useState('');

  // Load available dates for Daily Demand orders
  useEffect(() => {
    if (dealerId) {
      getAvailableDates();
    }
  }, [dealerId]);

  // Set selectedDate to most recent available date when availableDates are loaded
  useEffect(() => {
    if (availableDates.length > 0 && dealerId && !selectedDate) {
      // Set to most recent date (first in array, sorted DESC)
      const mostRecentDate = availableDates[0];
      setSelectedDate(dayjs(mostRecentDate));
    } else if (availableDates.length > 0 && dealerId && selectedDate) {
      // If selectedDate exists but doesn't have orders, switch to most recent date with orders
      const currentDateStr = selectedDate.format('YYYY-MM-DD');
      if (!availableDates.includes(currentDateStr)) {
        const mostRecentDate = availableDates[0];
        setSelectedDate(dayjs(mostRecentDate));
      }
    }
  }, [availableDates, dealerId]);

  // Load orders when date changes
  useEffect(() => {
    if (selectedDate && dealerId && availableDates.length > 0) {
      const dateString = selectedDate.format('YYYY-MM-DD');
      // Only load if the date has orders
      if (availableDates.includes(dateString)) {
        loadOrders();
      }
    }
  }, [selectedDate, dealerId]);

  // Load periods for forecasts
  useEffect(() => {
    if (dealerId) {
      loadPeriods();
    }
  }, [dealerId]);

  // Load forecasts when period changes
  useEffect(() => {
    if (selectedPeriod && dealerId) {
      loadForecasts();
    }
  }, [selectedPeriod, dealerId]);

  // Filter orders
  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm]);

  // Filter forecasts
  useEffect(() => {
    filterForecasts();
  }, [forecasts, forecastSearchTerm]);

  const getAvailableDates = async () => {
    try {
      const response = await axios.get('/api/orders/dealer/available-dates', {
        params: { dealer_id: dealerId }
      });
      
      const formattedDates = response.data.dates.map(date => {
        return new Date(date).toISOString().split('T')[0];
      });
      
      setAvailableDates(formattedDates);
    } catch (error) {
      console.error('Error fetching available dates:', error);
    }
  };

  const loadOrders = async () => {
    if (!selectedDate || !dealerId) return;
    
    setLoading(true);
    try {
      const dateString = selectedDate.format('YYYY-MM-DD');
      const response = await axios.get('/api/orders/dealer/date', {
        params: {
          dealer_id: dealerId,
          date: dateString
        }
      });
      
      const ordersData = response.data.orders || [];
      setOrders(ordersData);
      setPreviewMode('single');
      setPreviewInfo(`Orders for ${dateString}`);

      // Load products for all orders
      const productPromises = ordersData.map(async (order) => {
        try {
          const productResponse = await axios.get(`/api/orders/${order.order_id}`);
          return {
            orderId: order.order_id,
            products: productResponse.data.items || []
          };
        } catch (error) {
          console.error(`Error loading products for order ${order.order_id}:`, error);
          return {
            orderId: order.order_id,
            products: []
          };
        }
      });

      const productResults = await Promise.all(productPromises);
      const productsMap = {};
      productResults.forEach(result => {
        productsMap[result.orderId] = result.products;
      });
      setOrderProducts(productsMap);
    } catch (error) {
      console.error('Error loading orders:', error);
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const loadOrdersRange = async () => {
    if (!rangeStart || !rangeEnd || !dealerId) {
      message.error('Please select both start and end dates');
      return;
    }

    if (rangeStart.isAfter(rangeEnd)) {
      message.error('Start date cannot be after end date');
      return;
    }

    setLoading(true);
    try {
      const startDate = rangeStart.format('YYYY-MM-DD');
      const endDate = rangeEnd.format('YYYY-MM-DD');
      
      const response = await axios.get('/api/orders/dealer/range', {
        params: {
          dealer_id: dealerId,
          startDate,
          endDate
        }
      });
      
      const ordersData = response.data.orders || [];
      setOrders(ordersData);
      setPreviewMode('range');
      setPreviewInfo(`Orders from ${startDate} to ${endDate} (${ordersData.length} orders)`);

      // Load products for all orders
      const productPromises = ordersData.map(async (order) => {
        try {
          const productResponse = await axios.get(`/api/orders/${order.order_id}`);
          return {
            orderId: order.order_id,
            products: productResponse.data.items || []
          };
        } catch (error) {
          console.error(`Error loading products for order ${order.order_id}:`, error);
          return {
            orderId: order.order_id,
            products: []
          };
        }
      });

      const productResults = await Promise.all(productPromises);
      const productsMap = {};
      productResults.forEach(result => {
        productsMap[result.orderId] = result.products;
      });
      setOrderProducts(productsMap);

      message.success(`Loaded ${ordersData.length} orders from ${startDate} to ${endDate}`);
    } catch (error) {
      console.error('Error loading range orders:', error);
      if (error.response?.status === 404) {
        message.info(`No orders found between ${rangeStart.format('YYYY-MM-DD')} and ${rangeEnd.format('YYYY-MM-DD')}`);
        setOrders([]);
        setOrderProducts({});
      } else {
        message.error('Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPeriods = async () => {
    if (!dealerId) return;
    
    try {
      const response = await axios.get(`/api/monthly-forecast/dealer/${dealerId}/periods`);
      const periodsData = response.data.periods || [];
      
      const formattedPeriods = periodsData.map(period => ({
        value: `${period.period_start}_${period.period_end}`,
        label: `${dayjs(period.period_start).format('DD MMM YYYY')} - ${dayjs(period.period_end).format('DD MMM YYYY')}`,
        ...period
      }));
      
      setPeriods(formattedPeriods);
      
      // Set current period as default
      const currentPeriod = periodsData.find(p => p.is_current);
      if (currentPeriod) {
        setSelectedPeriod(currentPeriod);
      } else if (periodsData.length > 0) {
        setSelectedPeriod(periodsData[0]);
      }
    } catch (error) {
      console.error('Error loading periods:', error);
    }
  };

  const loadForecasts = async () => {
    if (!dealerId || !selectedPeriod) return;
    
    setForecastLoading(true);
    try {
      const response = await axios.get(`/api/monthly-forecast/dealer/${dealerId}`, {
        params: {
          period_start: selectedPeriod.period_start,
          period_end: selectedPeriod.period_end
        }
      });
      
      const forecastData = response.data.forecast || [];
      setForecasts(forecastData);
    } catch (error) {
      console.error('Error loading forecasts:', error);
      message.error('Failed to load forecasts');
    } finally {
      setForecastLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const filterForecasts = () => {
    let filtered = forecasts;

    if (forecastSearchTerm) {
      filtered = filtered.filter(forecast =>
        forecast.product_code?.toLowerCase().includes(forecastSearchTerm.toLowerCase()) ||
        forecast.product_name?.toLowerCase().includes(forecastSearchTerm.toLowerCase())
      );
    }

    setFilteredForecasts(filtered);
  };

  const handleExportForecasts = async () => {
    if (!selectedPeriod) {
      message.error('Please select a period to export');
      return;
    }

    if (filteredForecasts.length === 0) {
      message.warning('No forecast data to export');
      return;
    }

    try {
      setForecastLoading(true);
      
      // Fetch dealer info to get territory name
      const dealerResponse = await axios.get('/api/dealers');
      const dealer = dealerResponse.data.find(d => d.id === dealerId);
      const dealerName = dealer?.name || 'Unknown Dealer';
      const territoryName = dealer?.territory_name || 'Unknown Territory';
      
      const periodStart = dayjs(selectedPeriod.period_start).format('YYYY-MM-DD');
      const periodEnd = dayjs(selectedPeriod.period_end).format('YYYY-MM-DD');
      const periodLabel = `${periodStart} to ${periodEnd}`;
      
      // Create worksheet with proper structure matching the image format
      const worksheetData = [
        ['Dealer Monthly Forecast Report'],
        ['Forecast Period', periodLabel],
        [],
        ['Territory Name', 'Dealer Name', 'Product Code', 'Product Name', 'Application', 'Forecast Quantity'],
        ...filteredForecasts.map(forecast => [
          territoryName,
          dealerName,
          forecast.product_code || '',
          forecast.product_name || '',
          forecast.application_name || '',
          forecast.quantity || 0
        ])
      ];
      
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Set column widths
      worksheet['!cols'] = [
        { wch: 20 }, // Territory Name
        { wch: 30 }, // Dealer Name
        { wch: 15 }, // Product Code
        { wch: 35 }, // Product Name
        { wch: 15 }, // Application
        { wch: 18 }  // Forecast Quantity
      ];
      
      // Make header row (row 4, index 3) bold
      const headerRowIndex = 3;
      ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
        const cellAddress = col + (headerRowIndex + 1);
        if (worksheet[cellAddress]) {
          if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
          if (!worksheet[cellAddress].s.font) worksheet[cellAddress].s.font = {};
          worksheet[cellAddress].s.font.bold = true;
        }
      });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Forecast');
      
      // Generate filename
      const filename = `Monthly_Forecast_${periodStart}_${periodEnd}.xlsx`;
      
      // Download
      XLSX.writeFile(workbook, filename);
      message.success(`Monthly Forecast exported successfully for ${periodLabel}`);
    } catch (error) {
      console.error('Error exporting forecasts:', error);
      message.error('Failed to export forecasts');
    } finally {
      setForecastLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedDate) {
      message.error('Please select a date');
      return;
    }

    setLoading(true);
    try {
      const dateString = selectedDate.format('YYYY-MM-DD');
      
      const response = await axios.get(`/api/orders/dealer/daily-demand-report/${dateString}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        params: {
          dealer_id: dealerId,
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Dealer_Daily_Demand_Report_${dateString}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success(`Excel report generated successfully for ${dateString}`);
    } catch (error) {
      console.error('Error generating report:', error);
      if (error.response?.status === 404) {
        message.error(`No orders found for ${selectedDate.format('YYYY-MM-DD')}`);
      } else {
        message.error('Failed to generate report. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRangeReport = async () => {
    if (!rangeStart || !rangeEnd) {
      message.error('Please select both start and end dates');
      return;
    }

    if (rangeStart.isAfter(rangeEnd)) {
      message.error('Start date cannot be after end date');
      return;
    }

    setLoading(true);
    try {
      const startDate = rangeStart.format('YYYY-MM-DD');
      const endDate = rangeEnd.format('YYYY-MM-DD');
      
      const response = await axios.get('/api/orders/dealer/my-report-range', {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        params: {
          dealer_id: dealerId,
          startDate,
          endDate
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Dealer_Daily_Demand_Report_${startDate}_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success(`Excel report generated successfully for ${startDate} to ${endDate}`);
    } catch (error) {
      console.error('Error generating range report:', error);
      if (error.response?.status === 404) {
        message.error(`No orders found between ${rangeStart.format('YYYY-MM-DD')} and ${rangeEnd.format('YYYY-MM-DD')}`);
      } else {
        message.error('Failed to generate report. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current) => {
    const dateString = current.format('YYYY-MM-DD');
    return !availableDates.includes(dateString);
  };

  const dateCellRender = (current) => {
    const dateString = current.format('YYYY-MM-DD');
    const hasOrders = availableDates.includes(dateString);
    
    return (
      <div style={{
        color: hasOrders ? '#000' : '#d9d9d9',
        backgroundColor: hasOrders ? 'transparent' : '#f5f5f5',
        cursor: hasOrders ? 'pointer' : 'not-allowed',
        borderRadius: '4px',
        padding: '2px'
      }}>
        {current.date()}
      </div>
    );
  };

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      ellipsis: true,
      render: (orderId) => (
        <Tag color="blue" style={{ fontSize: '12px' }}>
          {orderId}
        </Tag>
      ),
      sorter: (a, b) => a.order_id.localeCompare(b.order_id),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      ellipsis: true,
      render: (date) => dayjs(date).format('DD MMM YYYY'),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Order Type',
      dataIndex: 'order_type',
      key: 'order_type',
      ellipsis: true,
      render: (type) => <Tag color="green">{type || 'DD'}</Tag>,
      sorter: (a, b) => (a.order_type || 'DD').localeCompare(b.order_type || 'DD'),
    },
    {
      title: 'Products',
      key: 'products',
      ellipsis: true,
      render: (_, record) => {
        return (
          <div>
            <Tag color="green" style={{ fontSize: '12px' }}>
              {record.item_count || 0} item{(record.item_count || 0) !== 1 ? 's' : ''}
            </Tag>
          </div>
        );
      },
      sorter: (a, b) => (a.item_count || 0) - (b.item_count || 0),
    },
    {
      title: 'Product Details',
      key: 'product_details',
      ellipsis: {
        showTitle: true,
      },
      render: (_, record) => {
        const products = orderProducts[record.order_id] || [];
        
        if (products.length === 0) {
          return (
            <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
              No products found
            </div>
          );
        }
        
        return (
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            {products.map((product, index) => (
              <div key={product.id || index} style={{ marginBottom: '2px' }}>
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                  #{index + 1}
                </span>{' '}
                <span style={{ fontWeight: 'bold' }}>
                  {product.product_code}
                </span>{' '}
                <span style={{ color: '#666' }}>
                  {product.product_name}
                </span>
                <span style={{ color: '#52c41a', marginLeft: '8px' }}>
                  (Qty: {product.quantity})
                </span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Total Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      ellipsis: true,
      render: (qty) => <Text strong>{qty || 0}</Text>,
      sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      ellipsis: true,
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
  ];

  const forecastColumns = [
    {
      title: 'Product Code',
      dataIndex: 'product_code',
      key: 'product_code',
      ellipsis: true,
      render: (code) => <Text strong>{code}</Text>,
      sorter: (a, b) => (a.product_code || '').localeCompare(b.product_code || ''),
    },
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
      ellipsis: {
        showTitle: true,
      },
      sorter: (a, b) => (a.product_name || '').localeCompare(b.product_name || ''),
    },
    {
      title: 'Forecast Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      ellipsis: true,
      render: (qty) => <Text strong>{qty || 0}</Text>,
      sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0),
    },
  ];

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Title level={3} style={{ marginBottom: '8px' }}>
        <FileExcelOutlined /> My Reports
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        View your Daily Demand orders and Monthly Forecasts
      </Text>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* Daily Demand Orders Tab */}
        <Tabs.TabPane
          tab={
            <span>
              <ShoppingCartOutlined />
              Daily Demand Orders
            </span>
          }
          key="daily-demand"
        >
          <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col xs={24} md={8}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Select Date</Text>
                <DatePicker
                  style={{ width: '100%' }}
                  value={selectedDate}
                  onChange={setSelectedDate}
                  disabledDate={disabledDate}
                  dateRender={dateCellRender}
                  format="DD MMM YYYY"
                />
              </Col>
              <Col xs={24} md={8}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Date Range</Text>
                <Space>
                  <DatePicker
                    placeholder="Start Date"
                    value={rangeStart}
                    onChange={setRangeStart}
                    format="DD MMM YYYY"
                  />
                  <DatePicker
                    placeholder="End Date"
                    value={rangeEnd}
                    onChange={setRangeEnd}
                    format="DD MMM YYYY"
                  />
                </Space>
              </Col>
              <Col xs={24} md={8}>
                <Space style={{ marginTop: '28px' }}>
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={loadOrders}
                    loading={loading}
                  >
                    View Orders
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleGenerateReport}
                    loading={loading}
                  >
                    Export Excel
                  </Button>
                  {rangeStart && rangeEnd && (
                    <>
                      <Button
                        type="default"
                        icon={<EyeOutlined />}
                        onClick={loadOrdersRange}
                        loading={loading}
                      >
                        View Range
                      </Button>
                      <Button
                        icon={<FileExcelOutlined />}
                        onClick={handleGenerateRangeReport}
                        loading={loading}
                      >
                        Export Range
                      </Button>
                    </>
                  )}
                </Space>
              </Col>
            </Row>

            {previewInfo && (
              <div style={{ marginBottom: '12px', padding: '8px 12px', background: '#f0f7ff', borderRadius: '4px', border: '1px solid #d4edda' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {previewInfo}
                </Text>
              </div>
            )}
            
            <Input
              placeholder="Search orders by Order ID or Product..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: '16px' }}
            />

            {loading && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
              </div>
            )}

            {!loading && (
              <Table
                columns={orderColumns}
                dataSource={filteredOrders}
                rowKey="order_id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} orders`,
                }}
                expandable={{
                  expandedRowRender: (record) => {
                    const products = orderProducts[record.order_id] || [];
                    return (
                      <div style={{ padding: '16px', background: '#fafafa' }}>
                        <Text strong style={{ marginBottom: '8px', display: 'block' }}>Order Items:</Text>
                        {products.map((product, idx) => (
                          <div key={idx} style={{ marginBottom: '8px', padding: '8px', background: 'white', borderRadius: '4px' }}>
                            <Text strong>{product.product_code}</Text> - {product.product_name}
                            <br />
                            <Text type="secondary">Quantity: {product.quantity}</Text>
                            {product.unit_tp && (
                              <Text type="secondary"> | Unit TP: ৳{product.unit_tp}</Text>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  },
                }}
              />
            )}
          </Card>
        </Tabs.TabPane>

        {/* Monthly Forecasts Tab */}
        <Tabs.TabPane
          tab={
            <span>
              <CalendarOutlined />
              Monthly Forecasts
            </span>
          }
          key="monthly-forecast"
        >
          <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col xs={24} md={8}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Select Period</Text>
                <Select
                  style={{ width: '100%' }}
                  value={selectedPeriod ? `${selectedPeriod.period_start}_${selectedPeriod.period_end}` : undefined}
                  onChange={(value) => {
                    const period = periods.find(p => `${p.period_start}_${p.period_end}` === value);
                    setSelectedPeriod(period);
                  }}
                  placeholder="Select forecast period"
                >
                  {periods.map((period) => (
                    <Select.Option key={`${period.period_start}_${period.period_end}`} value={`${period.period_start}_${period.period_end}`}>
                      {period.label}
                      {period.is_current && <Tag color="green" style={{ marginLeft: '8px' }}>Current</Tag>}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} md={8}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Search Products</Text>
                <Input
                  placeholder="Search by product code or name..."
                  prefix={<SearchOutlined />}
                  value={forecastSearchTerm}
                  onChange={(e) => setForecastSearchTerm(e.target.value)}
                />
              </Col>
              <Col xs={24} md={8}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Actions</Text>
                <Space style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleExportForecasts}
                    disabled={!selectedPeriod || filteredForecasts.length === 0}
                    loading={forecastLoading}
                  >
                    Export Excel
                  </Button>
                </Space>
              </Col>
            </Row>

            {forecastLoading && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
              </div>
            )}

            {!forecastLoading && selectedPeriod && (
              <Table
                columns={forecastColumns}
                dataSource={filteredForecasts}
                rowKey="product_id"
                pagination={{
                  pageSize: 20,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} products`,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  defaultPageSize: 20,
                }}
              />
            )}

            {!selectedPeriod && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                Please select a period to view forecasts
              </div>
            )}
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

export default DealerReports;

