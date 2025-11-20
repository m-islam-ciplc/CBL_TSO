import { useState, useEffect } from 'react';
import {
  Card,
  DatePicker,
  Button,
  message,
  Typography,
  Row,
  Col,
  Space,
  Spin,
  Table,
  Tag,
  Input,
  Select,
  Tabs,
  Badge,
  Statistic,
} from 'antd';
import {
  DownloadOutlined,
  FileExcelOutlined,
  EyeOutlined,
  SearchOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { Option } = Select;

// Helper function to remove M/S prefix from dealer names
const removeMSPrefix = (name) => {
  if (!name) return name;
  return name.replace(/^M\/S[.\s]*/i, '').trim();
};

// Demo forecast data
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

function DailyReport_WithForecasts() {
  // Daily Report states
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [filteredPreviewData, setFilteredPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [orderProducts, setOrderProducts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [previewInfo, setPreviewInfo] = useState('');
  const [previewMode, setPreviewMode] = useState('single');
  const [activeMainTab, setActiveMainTab] = useState('daily-report');

  // Forecast states
  const [forecasts, setForecasts] = useState(mockForecastData);
  const [filteredForecasts, setFilteredForecasts] = useState(mockForecastData);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('2025-11-18_2025-12-17');
  const [forecastSearchTerm, setForecastSearchTerm] = useState('');
  const [territoryFilter, setTerritoryFilter] = useState('');
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

  // Load available dates on component mount
  useEffect(() => {
    getAvailableDates();
  }, []);

  // Filter preview data when search term or status filter changes
  useEffect(() => {
    filterPreviewData();
  }, [previewData, searchTerm, statusFilter, previewMode]);

  // Filter forecasts
  useEffect(() => {
    filterForecasts();
  }, [forecastSearchTerm, territoryFilter, forecasts]);

  const getAvailableDates = async () => {
    try {
      const response = await axios.get('/api/orders/available-dates');
      const formattedDates = response.data.dates.map(date => {
        return new Date(date).toISOString().split('T')[0];
      });
      setAvailableDates(formattedDates);
    } catch (error) {
      console.error('Error fetching available dates:', error);
    }
  };

  const filterForecasts = () => {
    let filtered = [...forecasts];

    if (forecastSearchTerm) {
      filtered = filtered.filter(
        (f) =>
          f.dealer_name.toLowerCase().includes(forecastSearchTerm.toLowerCase()) ||
          f.dealer_code.toLowerCase().includes(forecastSearchTerm.toLowerCase())
      );
    }

    if (territoryFilter) {
      filtered = filtered.filter((f) => f.territory_name === territoryFilter);
    }

    setFilteredForecasts(filtered);
  };

  // Daily Report handlers
  const handleGenerateRangeReport = async () => {
    if (!rangeStart || !rangeEnd) {
      message.error('Please select both start and end dates');
      return;
    }

    if (rangeStart.isAfter(rangeEnd)) {
      message.error('Start date cannot be after end date');
      return;
    }

    const startDate = rangeStart.format('YYYY-MM-DD');
    const endDate = rangeEnd.format('YYYY-MM-DD');

    setLoading(true);
    try {
      const response = await axios.get('/api/orders/tso-report-range', {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        params: { startDate, endDate },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TSO_Order_Report_${startDate}_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success(`Excel report generated for ${startDate} to ${endDate}`);
    } catch (error) {
      console.error('Error generating range report:', error);
      if (error.response?.status === 404) {
        message.error(`No orders found between ${startDate} and ${endDate}`);
      } else {
        message.error('Failed to generate range report. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewRange = async () => {
    if (!rangeStart || !rangeEnd) {
      message.error('Please select both start and end dates to preview');
      return;
    }

    if (rangeStart.isAfter(rangeEnd)) {
      message.error('Start date cannot be after end date');
      return;
    }

    const startDate = rangeStart.format('YYYY-MM-DD');
    const endDate = rangeEnd.format('YYYY-MM-DD');

    setLoading(true);
    try {
      const response = await axios.get('/api/orders/range', {
        params: { startDate, endDate },
      });

      const { orders, total_dealers, total_quantity, total_value, total_original_orders } = response.data;

      if (!orders || orders.length === 0) {
        message.info(`No orders found between ${startDate} and ${endDate}`);
        setPreviewMode('range');
        setStatusFilter('all');
        setPreviewData([]);
        setShowPreview(false);
        setPreviewInfo('');
        return;
      }

      setOrderProducts({});
      setPreviewMode('range');
      setStatusFilter('all');
      setPreviewData(orders);
      setShowPreview(true);
      setPreviewInfo(`Dealer summary from ${startDate} to ${endDate}`);

      const dealerLabel = total_dealers === 1 ? 'dealer' : 'dealers';
      const orderLabel = total_original_orders === 1 ? 'order' : 'orders';
      const quantityLabel = total_quantity === 1 ? 'unit' : 'units';
      const valueNumber = Number(total_value || 0);
      const valueText = valueNumber > 0 ? ` (৳${valueNumber.toLocaleString()})` : '';

      message.success(
        `Found ${total_dealers} ${dealerLabel} covering ${total_original_orders} ${orderLabel} with ${total_quantity} ${quantityLabel}${valueText}`
      );
    } catch (error) {
      console.error('Error fetching range order data:', error);
      message.error('Failed to fetch range order data. Please try again.');
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

  const handleGenerateReport = async () => {
    if (!selectedDate) {
      message.error('Please select a date');
      return;
    }

    setLoading(true);
    try {
      const dateString = selectedDate.format('YYYY-MM-DD');
      const response = await axios.get(`/api/orders/tso-report/${dateString}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TSO_Order_Report_${dateString}.xlsx`);
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

  const handleGenerateMRReport = async () => {
    if (!selectedDate) {
      message.error('Please select a date');
      return;
    }

    setLoading(true);
    try {
      const dateString = selectedDate.format('YYYY-MM-DD');
      const response = await axios.get(`/api/orders/mr-report/${dateString}`, {
        responseType: 'blob',
        headers: { 'Accept': 'text/csv' }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MR_Order_Report_${dateString}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success(`MR CSV report generated successfully for ${dateString}`);
    } catch (error) {
      console.error('Error generating MR report:', error);
      if (error.response?.status === 404) {
        message.error(`No orders found for ${selectedDate.format('YYYY-MM-DD')}`);
      } else {
        message.error('Failed to generate MR report. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewData = async () => {
    if (!selectedDate) {
      message.error('Please select a date');
      return;
    }

    setLoading(true);
    try {
      const dateString = selectedDate.format('YYYY-MM-DD');
      const response = await axios.get(`/api/orders/date/${dateString}`);
      
      const { orders, total_orders, total_items } = response.data;
      
      if (orders.length === 0) {
        message.info(`No orders found for ${dateString}`);
        setPreviewMode('single');
        setShowPreview(false);
        setPreviewInfo('');
        return;
      }

      const productPromises = orders.map(async (order) => {
        try {
          const productResponse = await axios.get(`/api/orders/${order.order_id}`);
          return {
            orderId: order.order_id,
            products: productResponse.data.items || []
          };
        } catch (error) {
          console.error(`Error loading products for order ${order.order_id}:`, error);
          return { orderId: order.order_id, products: [] };
        }
      });

      const productResults = await Promise.all(productPromises);
      const productsMap = {};
      productResults.forEach(result => {
        productsMap[result.orderId] = result.products;
      });
      setOrderProducts(productsMap);

      setPreviewMode('single');
      setPreviewData(orders);
      setShowPreview(true);
      setPreviewInfo(`Orders for ${dateString}`);
      
      message.success(`Found ${total_orders} orders with ${total_items} items for ${dateString}`);
    } catch (error) {
      console.error('Error fetching order data:', error);
      message.error('Failed to fetch order data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterPreviewData = () => {
    let filtered = previewData;

    if (previewMode === 'range') {
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        filtered = filtered.filter(entry => {
          const dealerMatch = (entry.dealer_name || '').toLowerCase().includes(query);
          const territoryMatch = (entry.dealer_territory || '').toLowerCase().includes(query);
          const productMatch = (entry.product_summaries || []).some(product =>
            (product.product_name || '').toLowerCase().includes(query) ||
            (product.product_code || '').toLowerCase().includes(query)
          );
          return dealerMatch || territoryMatch || productMatch;
        });
      }
    } else {
      if (searchTerm) {
        filtered = filtered.filter(order =>
          order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.dealer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.dealer_territory.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter(order => (order.status || 'new') === statusFilter);
      }
    }

    setFilteredPreviewData(filtered);
  };

  // Forecast export handler
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

  // Forecast table columns and renderers (same as DealerForecasts_Option3_Expandable)
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

  // Daily Report table columns (abbreviated for space)
  const singleColumns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      ellipsis: true,
      render: (orderId) => (
        <Tag color="blue" style={{ fontSize: '12px' }}>{orderId}</Tag>
      ),
    },
    {
      title: 'Dealer',
      dataIndex: 'dealer_name',
      key: 'dealer_name',
      ellipsis: { showTitle: true },
      render: (name) => removeMSPrefix(name || 'N/A'),
    },
    {
      title: 'Territory',
      dataIndex: 'dealer_territory',
      key: 'dealer_territory',
      ellipsis: true,
    },
    {
      title: 'Products',
      key: 'products',
      render: (_, record) => (
        <Tag color="green" style={{ fontSize: '12px' }}>
          {record.item_count} item{record.item_count !== 1 ? 's' : ''}
        </Tag>
      ),
    },
    {
      title: 'Product Details',
      key: 'product_details',
      ellipsis: { showTitle: true },
      render: (_, record) => {
        const products = orderProducts[record.order_id] || [];
        if (products.length === 0) {
          return <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>No products found</div>;
        }
        return (
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            {products.map((product, index) => (
              <div key={product.id} style={{ marginBottom: '2px' }}>
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>#{index + 1}</span>{' '}
                <span style={{ fontWeight: 'bold' }}>{product.product_code}</span>{' '}
                <span style={{ color: '#666' }}>{product.product_name}</span>
                <span style={{ color: '#52c41a', marginLeft: '8px' }}>(Qty: {product.quantity})</span>
                {product.unit_tp && (
                  <span style={{ color: '#1890ff', marginLeft: '8px' }}>@৳{product.unit_tp.toLocaleString()}</span>
                )}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Transport',
      dataIndex: 'transport_name',
      key: 'transport_name',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: () => <Tag color="default">New</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      ellipsis: true,
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  const rangeColumns = [
    {
      title: 'Orders',
      dataIndex: 'order_count',
      key: 'order_count',
      width: 90,
      align: 'center',
    },
    {
      title: 'Dealer',
      dataIndex: 'dealer_name',
      key: 'dealer_name',
      ellipsis: { showTitle: true },
      render: (name) => removeMSPrefix(name || 'N/A'),
    },
    {
      title: 'Territory',
      dataIndex: 'dealer_territory',
      key: 'dealer_territory',
      ellipsis: true,
    },
    {
      title: 'Products',
      dataIndex: 'distinct_products',
      key: 'distinct_products',
      width: 110,
      align: 'center',
      render: (count) => (
        <Tag color="green" style={{ fontSize: '12px' }}>
          {count || 0} item{count === 1 ? '' : 's'}
        </Tag>
      ),
    },
    {
      title: 'Product Details',
      key: 'product_details',
      ellipsis: { showTitle: true },
      render: (_, record) => {
        const products = record.product_summaries || [];
        if (products.length === 0) {
          return <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>No products found</div>;
        }
        return (
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            {products.map((product, index) => (
              <div key={`${record.id}-${product.product_code}`} style={{ marginBottom: '2px' }}>
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>#{index + 1}</span>{' '}
                <span style={{ fontWeight: 'bold' }}>{product.product_code}</span>{' '}
                <span style={{ color: '#666' }}>{product.product_name}</span>
                <span style={{ color: '#52c41a', marginLeft: '8px' }}>(Qty: {product.quantity})</span>
                {product.unit_tp != null && (
                  <span style={{ color: '#1890ff', marginLeft: '8px' }}>@৳{Number(product.unit_tp).toLocaleString()}</span>
                )}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Transport',
      dataIndex: 'transport_names',
      key: 'transport_names',
      ellipsis: true,
      render: (names = []) => {
        if (!names || names.length === 0) return 'N/A';
        if (names.length === 1) return names[0];
        return 'Different Transport Providers';
      },
    },
    {
      title: 'Total Qty',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 110,
      align: 'center',
    },
    {
      title: 'Total Value',
      dataIndex: 'total_value',
      key: 'total_value',
      width: 140,
      align: 'center',
      render: (value) => {
        const numeric = Number(value || 0);
        return numeric > 0 ? `৳${numeric.toLocaleString()}` : '৳0';
      },
    },
    {
      title: 'Date Span',
      dataIndex: 'date_span',
      key: 'date_span',
      ellipsis: true,
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: '8px' }}>
        <BarChartOutlined /> Reports
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Generate reports for orders and view dealer forecasts
      </Text>

      <Tabs activeKey={activeMainTab} onChange={setActiveMainTab}>
        {/* Daily Order Report Tab */}
        <Tabs.TabPane
          tab={
            <span>
              <FileExcelOutlined />
              Daily Order Report
            </span>
          }
          key="daily-report"
        >
          <Card title="Daily Order Report" style={{ marginBottom: '16px', borderRadius: '8px' }} bodyStyle={{ padding: '12px' }}>
            <Row gutter={[16, 16]} align="bottom">
              <Col xs={24} sm={12} md={6}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Select Date</Text>
                  <DatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    format="YYYY-MM-DD"
                    style={{ width: '100%' }}
                    placeholder="Select date for report"
                    disabledDate={disabledDate}
                    dateRender={dateCellRender}
                  />
                </Space>
              </Col>
              <Col xs={24} sm={24} md={6}>
                <Button
                  type="default"
                  icon={<EyeOutlined />}
                  onClick={handlePreviewData}
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  Preview Orders
                </Button>
              </Col>
              <Col xs={24} sm={24} md={6}>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleGenerateReport}
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  Download Daily Order Report Excel
                </Button>
              </Col>
              <Col xs={24} sm={24} md={6}>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleGenerateMRReport}
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  Download MR CSV
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Preview Table */}
          {showPreview && previewMode === 'single' && previewData.length > 0 && (
            <Card>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>
                  {previewInfo || 'Orders'} ({filteredPreviewData.length})
                </Text>
              </div>
              
              <Card size="small" style={{ marginBottom: '16px', borderRadius: '8px' }}>
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} sm={12} md={8}>
                    <Input
                      placeholder="Search orders..."
                      prefix={<SearchOutlined />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Select
                      placeholder="Filter by status"
                      value={statusFilter}
                      onChange={setStatusFilter}
                      style={{ width: '100%' }}
                      allowClear
                    >
                      <Select.Option value="all">All Status</Select.Option>
                      <Select.Option value="new">New</Select.Option>
                      <Select.Option value="processing">Processing</Select.Option>
                      <Select.Option value="completed">Completed</Select.Option>
                      <Select.Option value="shipped">Shipped</Select.Option>
                    </Select>
                  </Col>
                </Row>
              </Card>

              <Table
                columns={singleColumns}
                dataSource={filteredPreviewData}
                rowKey={(record) => record.order_id || record.id}
                pagination={{
                  pageSize: 20,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} orders`,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  defaultPageSize: 20,
                }}
                scroll={{ x: 'max-content' }}
                size="small"
              />
            </Card>
          )}

          {loading && activeMainTab === 'daily-report' && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px' }}>
                <Text>Processing your request...</Text>
              </div>
            </div>
          )}
        </Tabs.TabPane>

        {/* Order Summary Report Tab */}
        <Tabs.TabPane
          tab={
            <span>
              <BarChartOutlined />
              Order Summary Report
            </span>
          }
          key="order-summary"
        >
          <Card title="Order Summary Report" style={{ marginBottom: '16px', borderRadius: '8px' }} bodyStyle={{ padding: '12px' }}>
            <Row gutter={[16, 16]} align="bottom">
              <Col xs={24} sm={12} md={6}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Start Date</Text>
                  <DatePicker
                    value={rangeStart}
                    onChange={setRangeStart}
                    format="YYYY-MM-DD"
                    style={{ width: '100%' }}
                    placeholder="Start date"
                    dateRender={dateCellRender}
                  />
                </Space>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>End Date</Text>
                  <DatePicker
                    value={rangeEnd}
                    onChange={setRangeEnd}
                    format="YYYY-MM-DD"
                    style={{ width: '100%' }}
                    placeholder="End date"
                    dateRender={dateCellRender}
                  />
                </Space>
              </Col>
              <Col xs={24} sm={24} md={6}>
                <Button
                  type="default"
                  icon={<EyeOutlined />}
                  onClick={handlePreviewRange}
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  Preview Range Orders
                </Button>
              </Col>
              <Col xs={24} sm={24} md={6}>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={handleGenerateRangeReport}
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  Download Order Summary Excel
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Preview Table */}
          {showPreview && previewMode === 'range' && previewData.length > 0 && (
            <Card>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>
                  {previewInfo || 'Orders'} ({filteredPreviewData.length})
                </Text>
              </div>
              
              <Card size="small" style={{ marginBottom: '16px', borderRadius: '8px' }}>
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} sm={12} md={8}>
                    <Input
                      placeholder="Search dealers or products..."
                      prefix={<SearchOutlined />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Col>
                </Row>
              </Card>

              <Table
                columns={rangeColumns}
                dataSource={filteredPreviewData}
                rowKey={(record) => record.id}
                pagination={{
                  pageSize: 20,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} dealers`,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  defaultPageSize: 20,
                }}
                scroll={{ x: 'max-content' }}
                size="small"
              />
            </Card>
          )}

          {loading && activeMainTab === 'order-summary' && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px' }}>
                <Text>Processing your request...</Text>
              </div>
            </div>
          )}
        </Tabs.TabPane>

        {/* Forecasts by Dealer Tab */}
        <Tabs.TabPane
          tab={
            <span>
              <AppstoreOutlined />
              Forecasts by Dealer
            </span>
          }
          key="forecasts-by-dealer"
        >
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
                  value={forecastSearchTerm}
                  onChange={(e) => setForecastSearchTerm(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space style={{ marginTop: '32px' }}>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleForecastExport}
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

          <Table
            columns={dealerColumns}
            dataSource={filteredForecasts}
            rowKey="dealer_id"
            loading={forecastLoading}
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
        </Tabs.TabPane>

        {/* Forecasts by Product Tab */}
        <Tabs.TabPane
          tab={
            <span>
              <FileExcelOutlined />
              Forecasts by Product
            </span>
          }
          key="forecasts-by-product"
        >
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
                  value={forecastSearchTerm}
                  onChange={(e) => setForecastSearchTerm(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space style={{ marginTop: '32px' }}>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleForecastExport}
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
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `${total} products`,
            }}
            scroll={{ x: 800 }}
          />
        </Tabs.TabPane>

        {/* Forecasts by Territory Tab */}
        <Tabs.TabPane
          tab={
            <span>
              <BarChartOutlined />
              Forecasts by Territory
            </span>
          }
          key="forecasts-by-territory"
        >
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
                  value={forecastSearchTerm}
                  onChange={(e) => setForecastSearchTerm(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space style={{ marginTop: '32px' }}>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleForecastExport}
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
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

export default DailyReport_WithForecasts;

