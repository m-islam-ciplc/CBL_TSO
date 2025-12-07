import { useState, useEffect } from 'react';
import { Card, DatePicker, Button, message, Typography, Row, Col, Space, Spin, Table, Tag, Input, Tabs, Select, Badge } from 'antd';
import { DownloadOutlined, FileExcelOutlined, EyeOutlined, SearchOutlined, CalendarOutlined, ShoppingCartOutlined, AppstoreOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { useUser } from '../contexts/UserContext';
import { StandardExpandableTable, renderStandardExpandedRow } from '../templates/TableTemplate';
import { createStandardDatePickerConfig, createStandardDateRangePicker } from '../templates/UIConfig';
import { getStandardPaginationConfig } from '../templates/useStandardPagination';
import { STANDARD_CARD_CONFIG, FILTER_CARD_CONFIG, TABLE_CARD_CONFIG } from '../templates/CardTemplates';
import { STANDARD_PAGE_TITLE_CONFIG, STANDARD_PAGE_SUBTITLE_CONFIG, SINGLE_ROW_GUTTER, STANDARD_ROW_GUTTER, STANDARD_FORM_LABEL_STYLE, STANDARD_TAG_STYLE, STANDARD_TABS_CONFIG, STANDARD_BADGE_CONFIG, STANDARD_SPIN_SIZE, STANDARD_DATE_PICKER_CONFIG, STANDARD_SPACE_SIZE_MIDDLE, STANDARD_BUTTON_SIZE, STANDARD_INPUT_SIZE, renderTableHeaderWithSearch } from '../templates/UIElements';

const { Title, Text } = Typography;

function DealerReports() {
  const { dealerId, isDealer } = useUser();
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orderProducts, setOrderProducts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [previewInfo, setPreviewInfo] = useState('');
  const [activeTab, setActiveTab] = useState('daily-demand');
  
  // Monthly Forecast states
  const [forecasts, setForecasts] = useState([]);
  const [filteredForecasts, setFilteredForecasts] = useState([]);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [forecastSearchTerm, setForecastSearchTerm] = useState('');
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  // Load available dates for Daily Demand orders
  useEffect(() => {
    if (dealerId) {
      getAvailableDates();
    }
  }, [dealerId]);

  // Set rangeStart to most recent available date when availableDates are loaded
  useEffect(() => {
    if (availableDates.length > 0 && dealerId && !rangeStart) {
      // Set to most recent date (first in array, sorted DESC)
      const mostRecentDate = availableDates[0];
      setRangeStart(dayjs(mostRecentDate));
    } else if (availableDates.length > 0 && dealerId && rangeStart) {
      // If rangeStart exists but doesn't have orders, switch to most recent date with orders
      const currentDateStr = rangeStart.format('YYYY-MM-DD');
      if (!availableDates.includes(currentDateStr)) {
        const mostRecentDate = availableDates[0];
        setRangeStart(dayjs(mostRecentDate));
      }
    }
  }, [availableDates, dealerId]);

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
    if (!rangeStart || !dealerId) {
      message.error('Please select a start date');
      return;
    }

    // If both dates are selected, treat as date range
    if (rangeEnd) {
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
    } else {
      // Single date mode
      setLoading(true);
      try {
        const dateString = rangeStart.format('YYYY-MM-DD');
        const response = await axios.get('/api/orders/dealer/date', {
          params: {
            dealer_id: dealerId,
            date: dateString
          }
        });
        
        const ordersData = response.data.orders || [];
        setOrders(ordersData);
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
      
      // Set font style for all cells: Calibri size 8
      const defaultFontStyle = {
        font: {
          name: 'Calibri',
          sz: 8,
          bold: false
        }
      };
      
      // Apply default font to all cells
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!worksheet[cellAddress]) continue;
          if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
          worksheet[cellAddress].s.font = {
            ...defaultFontStyle.font,
            ...(worksheet[cellAddress].s.font || {})
          };
        }
      }
      
      // Make header row (row 4, index 3) bold
      const headerRowIndex = 3;
      ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
        const cellAddress = col + (headerRowIndex + 1);
        if (worksheet[cellAddress]) {
          if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
          if (!worksheet[cellAddress].s.font) worksheet[cellAddress].s.font = {};
          worksheet[cellAddress].s.font.bold = true;
          worksheet[cellAddress].s.font.name = 'Calibri';
          worksheet[cellAddress].s.font.sz = 8;
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
    if (!rangeStart) {
      message.error('Please select a start date');
      return;
    }

    setLoading(true);
    try {
      // If both dates are selected, treat as date range
      if (rangeEnd) {
        if (rangeStart.isAfter(rangeEnd)) {
          message.error('Start date cannot be after end date');
          setLoading(false);
          return;
        }

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
      } else {
        // Single date mode
        const dateString = rangeStart.format('YYYY-MM-DD');
        
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
      }
    } catch (error) {
      console.error('Error generating report:', error);
      if (error.response?.status === 404) {
        if (rangeEnd) {
          message.error(`No orders found between ${rangeStart.format('YYYY-MM-DD')} and ${rangeEnd.format('YYYY-MM-DD')}`);
        } else {
          message.error(`No orders found for ${rangeStart.format('YYYY-MM-DD')}`);
        }
      } else {
        message.error('Failed to generate report. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Standard date picker configuration
  const { disabledDate, dateCellRender } = createStandardDatePickerConfig(availableDates);

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      ellipsis: true,
      render: (orderId) => (
        <Tag color="blue" style={STANDARD_TAG_STYLE}>
          {orderId}
        </Tag>
      ),
      sorter: (a, b) => a.order_id.localeCompare(b.order_id),
    },
    {
      title: 'Date',
      dataIndex: 'order_date',
      key: 'order_date',
      ellipsis: true,
      render: (date, record) => {
        // Use order_date (date the demand is for), fallback to created_at if order_date doesn't exist
        const displayDate = date || record.created_at;
        return displayDate ? dayjs(displayDate).format('DD MMM YYYY') : 'N/A';
      },
      sorter: (a, b) => {
        const dateA = a.order_date || a.created_at;
        const dateB = b.order_date || b.created_at;
        return new Date(dateA) - new Date(dateB);
      },
    },
    {
      title: 'Order Type',
      dataIndex: 'order_type',
      key: 'order_type',
      width: 120,
      align: 'center',
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
            <Tag color="green" style={STANDARD_TAG_STYLE}>
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
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const isExpanded = expandedRowKeys.includes(record.order_id);
        const itemCount = record.item_count || 0;
        
        return (
          <Badge 
            {...STANDARD_BADGE_CONFIG}
            count={itemCount}
          >
            <Button
              type="primary"
              icon={<AppstoreOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // Prevent row click
                if (isExpanded) {
                  setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.order_id));
                } else {
                  setExpandedRowKeys([...expandedRowKeys, record.order_id]);
                }
              }}
            >
              {isExpanded ? 'Hide Details' : 'View Details'}
            </Button>
          </Badge>
        );
      },
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
      <Title {...STANDARD_PAGE_TITLE_CONFIG}>
        <FileExcelOutlined /> My Reports
      </Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        View your Daily Demand orders and Monthly Forecasts
      </Text>

      <Tabs {...STANDARD_TABS_CONFIG} activeKey={activeTab} onChange={(key) => {
        setActiveTab(key);
        // Clear data when switching tabs
        if (key !== 'daily-demand') {
          setOrders([]);
          setOrderProducts({});
          setPreviewInfo('');
          setFilteredOrders([]);
        }
      }}>
        {/* Daily Demand Orders Tab - Unified Single Date and Date Range */}
        <Tabs.TabPane
          tab={
            <span>
              <ShoppingCartOutlined />
              Daily Demand Orders
            </span>
          }
          key="daily-demand"
        >
          <Card title="View Orders" {...FILTER_CARD_CONFIG}>
            <Row gutter={STANDARD_ROW_GUTTER} align="bottom">
              {createStandardDateRangePicker({
                startDate: rangeStart,
                setStartDate: setRangeStart,
                endDate: rangeEnd,
                setEndDate: setRangeEnd,
                disabledDate,
                dateCellRender,
                availableDates,
                colSpan: { xs: 24, sm: 12, md: 6 }
              })}
              <Col xs={24} sm={12} md={6}>
                <Button
                  type="default"
                  icon={<EyeOutlined />}
                  onClick={loadOrders}
                  loading={loading}
                  disabled={!rangeStart}
                  style={{ width: '100%' }}
                >
                  {rangeEnd ? 'View Range' : 'View Orders'}
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleGenerateReport}
                  loading={loading}
                  disabled={!rangeStart}
                  style={{ width: '100%' }}
                >
                  Export Excel
                </Button>
              </Col>
            </Row>
          </Card>

          {previewInfo && (
            <Card title="Preview Info" {...STANDARD_CARD_CONFIG}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {previewInfo}
              </Text>
            </Card>
          )}
          
          <StandardExpandableTable
            columns={orderColumns}
            dataSource={filteredOrders}
            loading={loading}
            rowKey="order_id"
            expandedRowKeys={expandedRowKeys}
            onExpand={(expanded, record) => {
              if (expanded) {
                setExpandedRowKeys([...expandedRowKeys, record.order_id]);
              } else {
                setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.order_id));
              }
            }}
            expandedRowRender={(record) => {
              const products = orderProducts[record.order_id] || [];
              return renderStandardExpandedRow(
                record,
                products,
                (item) => (
                  <>
                    <Text strong>{item.product_code}</Text> - {item.product_name}
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Quantity: {item.quantity}
                    </Text>
                    {!isDealer && item.unit_tp && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {' | '}Unit TP: ৳{item.unit_tp}
                      </Text>
                    )}
                  </>
                ),
                'Order Items:'
              );
            }}
            pagination={getStandardPaginationConfig('orders', 10)}
            header={renderTableHeaderWithSearch({
              title: 'Orders',
              count: filteredOrders.length,
              searchTerm: searchTerm,
              onSearchChange: (e) => setSearchTerm(e.target.value),
              searchPlaceholder: 'Search orders by Order ID or Product...'
            })}
          />
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
          <Card {...STANDARD_CARD_CONFIG}>
            <Row gutter={SINGLE_ROW_GUTTER} style={{ marginBottom: '16px' }}>
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
                <Spin size={STANDARD_SPIN_SIZE} />
              </div>
            )}

            {!forecastLoading && selectedPeriod && (
              <Card {...TABLE_CARD_CONFIG} style={{ marginTop: '16px' }}>
                <Table
                  columns={forecastColumns}
                  dataSource={filteredForecasts}
                  rowKey="product_id"
                  pagination={getStandardPaginationConfig('products', 20)}
                />
              </Card>
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

