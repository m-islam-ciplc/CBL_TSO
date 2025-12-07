import { useState, useEffect } from 'react';
import { Card, DatePicker, Button, message, Typography, Row, Col, Space, Spin, Table, Tag, Input, Select, Tabs, Badge, Statistic } from 'antd';
import { DownloadOutlined, FileExcelOutlined, EyeOutlined, SearchOutlined, BarChartOutlined, AppstoreOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { useUser } from '../contexts/UserContext';
import { createStandardDatePickerConfig, createStandardDateRangePicker } from '../templates/UIConfig';
import { getStandardPaginationConfig } from '../templates/useStandardPagination';
import { STANDARD_EXPANDABLE_TABLE_CONFIG } from '../templates/TableTemplate';
import { STANDARD_CARD_CONFIG, FILTER_CARD_CONFIG, DATE_SELECTION_CARD_CONFIG, TABLE_CARD_CONFIG, EXPANDABLE_TABLE_CARD_CONFIG } from '../templates/CardTemplates';
// All cards now use STANDARD_CARD_CONFIG
import { STANDARD_PAGE_TITLE_CONFIG, STANDARD_PAGE_SUBTITLE_CONFIG, STANDARD_ROW_GUTTER, SINGLE_ROW_GUTTER, TIGHT_ROW_GUTTER, STANDARD_FORM_LABEL_STYLE, STANDARD_INPUT_SIZE, STANDARD_TABLE_SIZE, STANDARD_TAG_STYLE, STANDARD_TABS_CONFIG, STANDARD_BADGE_CONFIG, STANDARD_STATISTIC_CONFIG, STANDARD_SPIN_SIZE, STANDARD_DATE_PICKER_CONFIG, STANDARD_SPACE_SIZE_MIDDLE, renderTableHeaderWithSearch } from '../templates/UIElements';

const { Title, Text } = Typography;
const { Option } = Select;

// Helper function to remove M/S prefix from dealer names
const removeMSPrefix = (name) => {
  if (!name) return name;
  // Remove "M/S", "M/S.", "M/S " prefix (case insensitive, with or without space/period)
  return name.replace(/^M\/S[.\s]*/i, '').trim();
};

function DailyReport() {
  const { territoryName, isTSO, isAdmin, isSalesManager } = useUser();
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
  const [activeTab, setActiveTab] = useState('daily-report');

  // Forecast states
  const [forecasts, setForecasts] = useState([]);
  const [filteredForecasts, setFilteredForecasts] = useState([]);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [forecastSearchTerm, setForecastSearchTerm] = useState('');
  const [territoryFilter, setTerritoryFilter] = useState(isTSO ? territoryName : '');
  const [dealerFilter, setDealerFilter] = useState('');
  const [expandedRowKeys, setExpandedRowKeys] = useState({
    byDealer: [],
    byProduct: [],
    byTerritory: [],
  });

  // Forecast Report tab states (separate from existing forecast tabs)
  const [forecastReportPeriod, setForecastReportPeriod] = useState(null);
  const [forecastReportTerritory, setForecastReportTerritory] = useState(isTSO ? territoryName : '');
  const [forecastReportDealer, setForecastReportDealer] = useState('');
  const [forecastReportProduct, setForecastReportProduct] = useState('');
  const [forecastReportData, setForecastReportData] = useState([]);
  const [filteredForecastReportData, setFilteredForecastReportData] = useState([]);
  const [forecastReportLoading, setForecastReportLoading] = useState(false);
  const [forecastReportExpandedKeys, setForecastReportExpandedKeys] = useState({
    dealers: [],
    products: [],
    territories: [],
  });

  // Load available dates on component mount
  useEffect(() => {
    getAvailableDates();
    loadPeriods();
  }, []);

  // Load forecasts when period changes
  useEffect(() => {
    if (selectedPeriod) {
      loadForecasts();
    }
  }, [selectedPeriod]);

  // Filter preview data when search term or status filter changes
  useEffect(() => {
    filterPreviewData();
  }, [previewData, searchTerm, statusFilter, previewMode]);

  // Filter forecasts
  useEffect(() => {
    filterForecasts();
  }, [forecastSearchTerm, territoryFilter, dealerFilter, forecasts]);

  // Load forecast report data when period changes
  useEffect(() => {
    if (forecastReportPeriod) {
      loadForecastReportData();
    } else {
      setForecastReportData([]);
      setFilteredForecastReportData([]);
    }
  }, [forecastReportPeriod]);

  // Filter forecast report data when filters or data change
  useEffect(() => {
    if (forecastReportData.length > 0) {
      filterForecastReportData();
    } else {
      setFilteredForecastReportData([]);
    }
  }, [forecastReportTerritory, forecastReportDealer, forecastReportProduct, forecastReportData]);

  const getAvailableDates = async () => {
    try {
      console.log('Fetching available dates...');
      const response = await axios.get('/api/orders/available-dates');
      console.log('Available dates response:', response.data);
      
      // Convert ISO dates to YYYY-MM-DD format
      const formattedDates = response.data.dates.map(date => {
        return new Date(date).toISOString().split('T')[0];
      });
      
      console.log('Formatted dates:', formattedDates);
      setAvailableDates(formattedDates);
    } catch (error) {
      console.error('Error fetching available dates:', error);
      console.error('Error details:', error.response?.data);
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

    const startDate = rangeStart.format('YYYY-MM-DD');
    const endDate = rangeEnd.format('YYYY-MM-DD');

    setLoading(true);
    try {
      // Add territory filter for TSO users
      const params = {
        startDate,
        endDate,
      };
      if (isTSO && territoryName) {
        params.territory_name = territoryName;
      }
      
      const response = await axios.get('/api/orders/tso-report-range', {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        params,
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
      } else if (error.response?.data?.error) {
        message.error(error.response.data.error);
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
      // Add territory filter for TSO users
      const params = {
          startDate,
          endDate,
      };
      if (isTSO && territoryName) {
        params.territory_name = territoryName;
      }
      
      const response = await axios.get('/api/orders/range', { params });

      const {
        orders,
        total_dealers,
        total_quantity,
        total_value,
        total_original_orders,
      } = response.data;

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
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error('Failed to fetch range order data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Disable dates without orders
  // Standard date picker configuration
  const { disabledDate, dateCellRender } = createStandardDatePickerConfig(availableDates);

  const handleGenerateReport = async () => {
    if (!selectedDate) {
      message.error('Please select a date');
      return;
    }

    setLoading(true);
    try {
      const dateString = selectedDate ? selectedDate.format('YYYY-MM-DD') : '';
      if (!dateString) {
        message.error('Please select a valid date');
        return;
      }
      
      // Add territory filter for TSO users
      const params = {};
      if (isTSO && territoryName) {
        params.territory_name = territoryName;
      }
      
      // Generate Excel report
      const response = await axios.get(`/api/orders/tso-report/${dateString}`, {
        responseType: 'blob', // Important for file download
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        params,
      });

      // Create blob link to download
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
        message.error(`No orders found for ${selectedDate ? selectedDate.format('YYYY-MM-DD') : 'selected date'}`);
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
      const dateString = selectedDate ? selectedDate.format('YYYY-MM-DD') : '';
      if (!dateString) {
        message.error('Please select a valid date');
        return;
      }
      
      // Generate MR CSV report
      const response = await axios.get(`/api/orders/mr-report/${dateString}`, {
        responseType: 'blob', // Important for file download
        headers: {
          'Accept': 'text/csv'
        }
      });

      // Create blob link to download
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
        message.error(`No orders found for ${selectedDate ? selectedDate.format('YYYY-MM-DD') : 'selected date'}`);
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
      const dateString = selectedDate ? selectedDate.format('YYYY-MM-DD') : '';
      if (!dateString) {
        message.error('Please select a valid date');
        return;
      }
      // Add territory filter for TSO users
      const params = {};
      if (isTSO && territoryName) {
        params.territory_name = territoryName;
      }
      
      const response = await axios.get(`/api/orders/date/${dateString}`, { params });
      
      const { orders, total_orders, total_items } = response.data;
      
      if (orders.length === 0) {
        message.info(`No orders found for ${dateString}`);
        setPreviewMode('single');
        setShowPreview(false);
        setPreviewInfo('');
        return;
      }

      // Load products for all orders
      const productPromises = orders.map(async (order) => {
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

      // Set preview data and show table
      setPreviewMode('single');
      setPreviewData(orders);
      setShowPreview(true);
      setPreviewInfo(`Orders for ${dateString}`);
      
      // Show summary
      message.success(`Found ${total_orders} orders with ${total_items} items for ${dateString}`);
      
    } catch (error) {
      console.error('Error fetching order data:', error);
      message.error('Failed to fetch order data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter preview data
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

    // Dealer filter
    if (dealerFilter) {
      filtered = filtered.filter((f) => f.dealer_id === parseInt(dealerFilter));
    }

    // Search filter (applied after dealer filter)
    if (forecastSearchTerm) {
      filtered = filtered.filter(
        (f) =>
          f.dealer_name.toLowerCase().includes(forecastSearchTerm.toLowerCase()) ||
          f.dealer_code.toLowerCase().includes(forecastSearchTerm.toLowerCase())
      );
    }

    setFilteredForecasts(filtered);
  };

  // Load forecast report data
  const loadForecastReportData = async () => {
    if (!forecastReportPeriod) return;
    
    setForecastReportLoading(true);
    try {
      const [periodStart, periodEnd] = forecastReportPeriod.split('_');
      const params = {
        period_start: periodStart,
        period_end: periodEnd,
      };
      
      // Only add territory filter for TSO users (server-side filtering for security)
      if (isTSO && territoryName) {
        params.territory_name = territoryName;
      }
      
      const response = await axios.get('/api/monthly-forecast/all', { params });
      const data = response.data.forecasts || [];
      setForecastReportData(data);
      // Initial filter will be applied by useEffect
    } catch (error) {
      console.error('Error loading forecast report data:', error);
      message.error('Failed to load forecast data');
      setForecastReportData([]);
      setFilteredForecastReportData([]);
    } finally {
      setForecastReportLoading(false);
    }
  };

  // Filter forecast report data based on hierarchical filters
  const filterForecastReportData = () => {
    let filtered = [...forecastReportData];

    // Territory filter (hierarchical level 1)
    if (!isTSO && forecastReportTerritory) {
      filtered = filtered.filter((f) => f.territory_name === forecastReportTerritory);
    }

    // Dealer filter (hierarchical level 2)
    if (forecastReportDealer) {
      filtered = filtered.filter((f) => f.dealer_id === parseInt(forecastReportDealer));
    }

    // Product filter (hierarchical level 3)
    if (forecastReportProduct) {
      filtered = filtered.map((f) => {
        const filteredProducts = f.products.filter(
          (p) => p.product_code === forecastReportProduct
        );
        if (filteredProducts.length > 0) {
          return {
            ...f,
            products: filteredProducts,
            total_quantity: filteredProducts.reduce((sum, p) => sum + p.quantity, 0),
            total_products: filteredProducts.length,
          };
        }
        return null;
      }).filter(Boolean);
    }

    setFilteredForecastReportData(filtered);
  };

  // Determine view type based on filter combination
  const getForecastReportViewType = () => {
    // If product is selected but no dealer/territory -> Product view
    if (forecastReportProduct && !forecastReportDealer && !forecastReportTerritory) {
      return 'product';
    }
    // If dealer is selected -> Dealer view
    if (forecastReportDealer) {
      return 'dealer';
    }
    // If territory is selected but no dealer/product -> Territory view
    if (forecastReportTerritory && !forecastReportDealer && !forecastReportProduct) {
      return 'territory';
    }
    // Default: Dealer view
    return 'dealer';
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
      // Ignore status filter for aggregated view
    } else {
      // Search filter for single-day orders
      if (searchTerm) {
        filtered = filtered.filter(order =>
          order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.dealer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.dealer_territory.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Status filter for single-day orders
      if (statusFilter !== 'all') {
        filtered = filtered.filter(order => (order.status || 'new') === statusFilter);
      }
    }

    setFilteredPreviewData(filtered);
  };

  // Table columns for single-date preview (same as Placed Orders)
  const singleColumns = [
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
      title: 'Dealer',
      dataIndex: 'dealer_name',
      key: 'dealer_name',
      ellipsis: {
        showTitle: true,
      },
      render: (name) => removeMSPrefix(name || 'N/A'),
      sorter: (a, b) => a.dealer_name.localeCompare(b.dealer_name),
    },
    {
      title: 'Territory',
      dataIndex: 'dealer_territory',
      key: 'dealer_territory',
      ellipsis: true,
      render: (territory) => territory || 'N/A',
      sorter: (a, b) => {
        const territoryA = a.dealer_territory || 'N/A';
        const territoryB = b.dealer_territory || 'N/A';
        return territoryA.localeCompare(territoryB);
      },
    },
    {
      title: 'Products',
      key: 'products',
      ellipsis: true,
      render: (_, record) => {
        return (
          <div>
            <Tag color="green" style={STANDARD_TAG_STYLE}>
              {record.item_count} item{record.item_count !== 1 ? 's' : ''}
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
              <div key={product.id} style={{ marginBottom: '2px' }}>
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
                {!isTSO && product.unit_tp && (
                  <span style={{ color: '#1890ff', marginLeft: '8px' }}>
                    @৳{product.unit_tp.toLocaleString()}
                  </span>
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
      sorter: (a, b) => {
        const getTransportValue = (record) => {
          const names = record.transport_name
            ? [record.transport_name]
            : record.transport_names || [];
          if (Array.isArray(names) && names.length > 1) {
            return 'Different Transport Providers';
          }
          const value = Array.isArray(names) ? names[0] : record.transport_name;
          return value || 'N/A';
        };
        return getTransportValue(a).localeCompare(getTransportValue(b));
      },
      render: (_, record) => {
        const names = record.transport_name
          ? [record.transport_name]
          : record.transport_names || [];
        if (Array.isArray(names) && names.length > 1) {
          return 'Different Transport Providers';
        }
        const value = Array.isArray(names) ? names[0] : record.transport_name;
        return value || 'N/A';
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: () => <Tag color="default">New</Tag>,
      sorter: (a, b) => {
        const statusA = a.status || 'new';
        const statusB = b.status || 'new';
        return statusA.localeCompare(statusB);
      },
    },
  ];

  const rangeColumns = [
    {
      title: 'Orders',
      dataIndex: 'order_count',
      key: 'order_count',
      width: 90,
      align: 'center',
      sorter: (a, b) => (a.order_count || 0) - (b.order_count || 0),
    },
    {
      title: 'Dealer',
      dataIndex: 'dealer_name',
      key: 'dealer_name',
      ellipsis: {
        showTitle: true,
      },
      render: (name) => removeMSPrefix(name || 'N/A'),
      sorter: (a, b) => (a.dealer_name || '').localeCompare(b.dealer_name || ''),
    },
    {
      title: 'Territory',
      dataIndex: 'dealer_territory',
      key: 'dealer_territory',
      ellipsis: true,
      render: (territory) => territory || 'N/A',
      sorter: (a, b) => (a.dealer_territory || '').localeCompare(b.dealer_territory || ''),
    },
    {
      title: 'Products',
      dataIndex: 'distinct_products',
      key: 'distinct_products',
      width: 110,
      align: 'center',
      sorter: (a, b) => (a.distinct_products || 0) - (b.distinct_products || 0),
      render: (count) => (
        <Tag color="green" style={{ fontSize: '12px' }}>
          {count || 0} item{count === 1 ? '' : 's'}
        </Tag>
      ),
    },
    {
      title: 'Product Details',
      key: 'product_details',
      ellipsis: {
        showTitle: true,
      },
      render: (_, record) => {
        const products = record.product_summaries || [];
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
              <div key={`${record.id}-${product.product_code}`} style={{ marginBottom: '2px' }}>
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
                {!isTSO && product.unit_tp != null && (
                  <span style={{ color: '#1890ff', marginLeft: '8px' }}>
                    @৳{Number(product.unit_tp).toLocaleString()}
                  </span>
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
      sorter: (a, b) => {
        const getTransportValue = (record) => {
          const names = record.transport_names || [];
          if (!names || names.length === 0) {
            return 'N/A';
          }
          if (names.length === 1) {
            return names[0];
          }
          return 'Different Transport Providers';
        };
        return getTransportValue(a).localeCompare(getTransportValue(b));
      },
      render: (names = []) => {
        if (!names || names.length === 0) {
          return 'N/A';
        }
        if (names.length === 1) {
          return names[0];
        }
        return 'Different Transport Providers';
      },
    },
    {
      title: 'Total Qty',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 110,
      align: 'center',
      sorter: (a, b) => (a.total_quantity || 0) - (b.total_quantity || 0),
    },
    {
      title: 'Total Value',
      dataIndex: 'total_value',
      key: 'total_value',
      width: 140,
      align: 'center',
      sorter: (a, b) => (Number(a.total_value || 0)) - (Number(b.total_value || 0)),
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
      sorter: (a, b) => {
        const spanA = a.date_span || 'N/A';
        const spanB = b.date_span || 'N/A';
        return spanA.localeCompare(spanB);
      },
      render: (span) => span || 'N/A',
    },
  ];

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

  // Get unique territories for filter dropdown (only for admin)
  const uniqueTerritories = [...new Set(forecasts.map(f => f.territory_name))].sort();
  
  // Get unique dealers for filter dropdown
  const uniqueDealers = forecasts
    .map(f => ({ id: f.dealer_id, code: f.dealer_code, name: f.dealer_name }))
    .filter((dealer, index, self) => 
      index === self.findIndex(d => d.id === dealer.id)
    )
    .sort((a, b) => a.code.localeCompare(b.code));

  // Get unique products from forecast report data
  const getUniqueProductsFromForecastReport = () => {
    const productSet = new Set();
    forecastReportData.forEach((f) => {
      f.products.forEach((p) => {
        productSet.add(JSON.stringify({ code: p.product_code, name: p.product_name }));
      });
    });
    return Array.from(productSet)
      .map((str) => JSON.parse(str))
      .sort((a, b) => a.code.localeCompare(b.code));
  };

  // Get unique dealers from forecast report data (filtered by territory if selected)
  const getUniqueDealersFromForecastReport = () => {
    let dealers = forecastReportData.map(f => ({ 
      id: f.dealer_id, 
      code: f.dealer_code, 
      name: f.dealer_name,
      territory: f.territory_name 
    }));
    
    // Filter by territory if selected
    if (forecastReportTerritory) {
      dealers = dealers.filter(d => d.territory === forecastReportTerritory);
    }
    
    return dealers
      .filter((dealer, index, self) => 
        index === self.findIndex(d => d.id === dealer.id)
      )
      .sort((a, b) => a.code.localeCompare(b.code));
  };

  // Get unique territories from forecast report data
  const getUniqueTerritoriesFromForecastReport = () => {
    return [...new Set(forecastReportData.map(f => f.territory_name))].sort();
  };

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
          <Badge {...STANDARD_BADGE_CONFIG} count={record.total_products}>
            <Button
              type="primary"
              icon={<AppstoreOutlined />}
              size={STANDARD_TABLE_SIZE}
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
        render: (text) => <Text strong style={{ fontSize: STANDARD_EXPANDABLE_TABLE_CONFIG.fontSizes.strong }}>{text.toLocaleString()}</Text>,
      },
    ];

    return (
      <div style={STANDARD_EXPANDABLE_TABLE_CONFIG.expandedRowContent.container}>
        <Table
          columns={productColumns}
          dataSource={record.products}
          pagination={false}
          size={STANDARD_TABLE_SIZE}
          rowKey="product_code"
        />
      </div>
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

  // Forecast Report tab column definitions (using forecastReportExpandedKeys)
  const forecastReportDealerColumns = [
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
        const isExpanded = forecastReportExpandedKeys.dealers.includes(record.dealer_id);
        return (
          <Badge {...STANDARD_BADGE_CONFIG} count={record.total_products}>
            <Button
              type="primary"
              icon={<AppstoreOutlined />}
              size={STANDARD_TABLE_SIZE}
              onClick={(e) => {
                e.stopPropagation();
                if (isExpanded) {
                  setForecastReportExpandedKeys({
                    ...forecastReportExpandedKeys,
                    dealers: forecastReportExpandedKeys.dealers.filter((key) => key !== record.dealer_id),
                  });
                } else {
                  setForecastReportExpandedKeys({
                    ...forecastReportExpandedKeys,
                    dealers: [...forecastReportExpandedKeys.dealers, record.dealer_id],
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

  const forecastReportProductColumns = [
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
        const isExpanded = forecastReportExpandedKeys.products.includes(record.product_code);
        return (
          <Badge {...STANDARD_BADGE_CONFIG} count={record.dealer_count}>
            <Button
              type="primary"
              icon={<AppstoreOutlined />}
              size={STANDARD_TABLE_SIZE}
              onClick={(e) => {
                e.stopPropagation();
                if (isExpanded) {
                  setForecastReportExpandedKeys({
                    ...forecastReportExpandedKeys,
                    products: forecastReportExpandedKeys.products.filter((key) => key !== record.product_code),
                  });
                } else {
                  setForecastReportExpandedKeys({
                    ...forecastReportExpandedKeys,
                    products: [...forecastReportExpandedKeys.products, record.product_code],
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

  const forecastReportTerritoryColumns = [
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
        const isExpanded = forecastReportExpandedKeys.territories.includes(record.territory_name);
        return (
          <Badge {...STANDARD_BADGE_CONFIG} count={record.dealer_count}>
            <Button
              type="primary"
              icon={<AppstoreOutlined />}
              size={STANDARD_TABLE_SIZE}
              onClick={(e) => {
                e.stopPropagation();
                if (isExpanded) {
                  setForecastReportExpandedKeys({
                    ...forecastReportExpandedKeys,
                    territories: forecastReportExpandedKeys.territories.filter((key) => key !== record.territory_name),
                  });
                } else {
                  setForecastReportExpandedKeys({
                    ...forecastReportExpandedKeys,
                    territories: [...forecastReportExpandedKeys.territories, record.territory_name],
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
          <Card title="Daily Order Report" {...DATE_SELECTION_CARD_CONFIG}>
        <Row gutter={STANDARD_ROW_GUTTER} align="bottom">
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Select Date</Text>
              <DatePicker
                {...STANDARD_DATE_PICKER_CONFIG}
                value={selectedDate}
                onChange={setSelectedDate}
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
            <Card {...TABLE_CARD_CONFIG}>
              {renderTableHeaderWithSearch({
                title: previewInfo || 'Orders',
                count: filteredPreviewData.length,
                searchTerm: searchTerm,
                onSearchChange: (e) => setSearchTerm(e.target.value),
                searchPlaceholder: 'Search orders...'
              })}
              
              {/* Filters */}
              <Card title="Filter Orders" {...FILTER_CARD_CONFIG} style={{ marginTop: '16px' }}>
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} sm={12} md={8}>
                    <Select
                      placeholder="Filter by status"
                      value={statusFilter}
                      onChange={setStatusFilter}
                      style={{ width: '100%' }}
                      allowClear
                      showSearch
                      filterOption={(input, option) => {
                        const optionText = option?.children?.toString() || '';
                        return optionText.toLowerCase().includes(input.toLowerCase());
                      }}
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
                pagination={getStandardPaginationConfig('orders', 20)}
                scroll={{ x: 'max-content' }}
                size={STANDARD_TABLE_SIZE}
              />
            </Card>
          )}

          {loading && activeTab === 'daily-report' && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Spin size={STANDARD_SPIN_SIZE} />
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
          <Card title="Order Summary Report" {...FILTER_CARD_CONFIG}>
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
        <Card {...TABLE_CARD_CONFIG}>
          {renderTableHeaderWithSearch({
            title: previewInfo || 'Orders',
            count: filteredPreviewData.length,
            searchTerm: searchTerm,
            onSearchChange: (e) => setSearchTerm(e.target.value),
            searchPlaceholder: 'Search dealers or products...'
          })}

          <Table
                columns={rangeColumns}
            dataSource={filteredPreviewData}
                rowKey={(record) => record.id}
            pagination={getStandardPaginationConfig('dealers', 20)}
            scroll={{ x: 'max-content' }}
            size={STANDARD_TABLE_SIZE}
          />
        </Card>
      )}

          {loading && activeTab === 'order-summary' && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Spin size={STANDARD_SPIN_SIZE} />
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
          <Card title="Filter Orders" {...FILTER_CARD_CONFIG}>
            <Row gutter={[8, 8]} align="middle">
              <Col flex="1">
                <Text strong>Period:</Text>
                <Select
                  style={{ width: '100%', marginTop: '8px' }}
                  value={selectedPeriod}
                  onChange={setSelectedPeriod}
                  loading={!selectedPeriod}
                  allowClear
                  showSearch
                  filterOption={(input, option) => {
                    const optionText = option?.children?.toString() || '';
                    return optionText.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {periods.map((p) => (
                    <Option key={p.value} value={p.value}>
                      {p.label} {p.is_current && <Tag color="green" size="small">Current</Tag>}
                    </Option>
                  ))}
                </Select>
              </Col>
              {!isTSO && (
                <Col flex="1">
                  <Text strong>Territory:</Text>
                  <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    value={territoryFilter}
                    onChange={setTerritoryFilter}
                    allowClear
                    showSearch
                    placeholder="All Territories"
                    filterOption={(input, option) => {
                      const optionText = option?.children?.toString() || '';
                      return optionText.toLowerCase().includes(input.toLowerCase());
                    }}
                  >
                    {uniqueTerritories.map((t) => (
                      <Option key={t} value={t}>
                        {t}
                      </Option>
                    ))}
                  </Select>
                </Col>
              )}
              <Col flex="1">
                <Text strong>Dealer:</Text>
                <Select
                  style={{ width: '100%', marginTop: '8px' }}
                  value={dealerFilter}
                  onChange={setDealerFilter}
                  allowClear
                  showSearch
                  placeholder="All Dealers"
                  filterOption={(input, option) => {
                    const optionText = option?.children?.toString() || '';
                    return optionText.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {uniqueDealers.map((d) => (
                    <Option key={d.id} value={d.id.toString()}>
                      {d.code} - {d.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col flex="1">
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
              <Col flex="none" style={{ alignSelf: 'flex-end' }}>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleForecastExport}
                  disabled={filteredForecasts.length === 0}
                  style={{ marginTop: '32px' }}
                >
                  Export Excel
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Summary Statistics */}
          <Row gutter={SINGLE_ROW_GUTTER} style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  {...STANDARD_STATISTIC_CONFIG}
                  title="Total Dealers"
                  value={totalDealers}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  {...STANDARD_STATISTIC_CONFIG}
                  title="Total Products"
                  value={totalProducts}
                  prefix={<FileExcelOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  {...STANDARD_STATISTIC_CONFIG}
                  title="Total Forecast Quantity"
                  value={totalQuantity}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Card {...EXPANDABLE_TABLE_CARD_CONFIG}>
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
              pagination={getStandardPaginationConfig('dealers', 20)}
              scroll={{ x: 800 }}
            />
          </Card>
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
          {/* Filters and Actions - Same as by Dealer */}
          <Card title="Filter Forecasts" {...FILTER_CARD_CONFIG}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={6}>
                <Text strong>Period:</Text>
                <Select
                  style={{ width: '100%', marginTop: '8px' }}
                  value={selectedPeriod}
                  onChange={setSelectedPeriod}
                  loading={!selectedPeriod}
                  allowClear
                  showSearch
                  filterOption={(input, option) => {
                    const optionText = option?.children?.toString() || '';
                    return optionText.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {periods.map((p) => (
                    <Option key={p.value} value={p.value}>
                      {p.label} {p.is_current && <Tag color="green" size="small">Current</Tag>}
                    </Option>
                  ))}
                </Select>
              </Col>
              {!isTSO && (
                <Col xs={24} sm={12} md={6}>
                  <Text strong>Territory:</Text>
                  <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    value={territoryFilter}
                    onChange={setTerritoryFilter}
                    allowClear
                    showSearch
                    placeholder="All Territories"
                    filterOption={(input, option) => {
                      const optionText = option?.children?.toString() || '';
                      return optionText.toLowerCase().includes(input.toLowerCase());
                    }}
                  >
                    {uniqueTerritories.map((t) => (
                      <Option key={t} value={t}>
                        {t}
                      </Option>
                    ))}
                  </Select>
                </Col>
              )}
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
          <Row gutter={SINGLE_ROW_GUTTER} style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  {...STANDARD_STATISTIC_CONFIG}
                  title="Total Dealers"
                  value={totalDealers}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  {...STANDARD_STATISTIC_CONFIG}
                  title="Total Products"
                  value={totalProducts}
                  prefix={<FileExcelOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  {...STANDARD_STATISTIC_CONFIG}
                  title="Total Forecast Quantity"
                  value={totalQuantity}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
          </Row>

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
          {/* Filters and Actions - Same as by Dealer */}
          <Card title="Filter Forecasts" {...FILTER_CARD_CONFIG}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={6}>
                <Text strong>Period:</Text>
                <Select
                  style={{ width: '100%', marginTop: '8px' }}
                  value={selectedPeriod}
                  onChange={setSelectedPeriod}
                  loading={!selectedPeriod}
                  allowClear
                  showSearch
                  filterOption={(input, option) => {
                    const optionText = option?.children?.toString() || '';
                    return optionText.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {periods.map((p) => (
                    <Option key={p.value} value={p.value}>
                      {p.label} {p.is_current && <Tag color="green" size="small">Current</Tag>}
                    </Option>
                  ))}
                </Select>
              </Col>
              {!isTSO && (
                <Col xs={24} sm={12} md={6}>
                  <Text strong>Territory:</Text>
                  <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    value={territoryFilter}
                    onChange={setTerritoryFilter}
                    allowClear
                    showSearch
                    placeholder="All Territories"
                    filterOption={(input, option) => {
                      const optionText = option?.children?.toString() || '';
                      return optionText.toLowerCase().includes(input.toLowerCase());
                    }}
                  >
                    {uniqueTerritories.map((t) => (
                      <Option key={t} value={t}>
                        {t}
                      </Option>
                    ))}
                  </Select>
                </Col>
              )}
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
          <Row gutter={SINGLE_ROW_GUTTER} style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  {...STANDARD_STATISTIC_CONFIG}
                  title="Total Dealers"
                  value={totalDealers}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  {...STANDARD_STATISTIC_CONFIG}
                  title="Total Products"
                  value={totalProducts}
                  prefix={<FileExcelOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  {...STANDARD_STATISTIC_CONFIG}
                  title="Total Forecast Quantity"
                  value={totalQuantity}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
          </Row>

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
        </Tabs.TabPane>

        {/* Forecast Report Tab - Hierarchical Filtering */}
        <Tabs.TabPane
          tab={
            <span>
              <BarChartOutlined />
              Forecast Report
            </span>
          }
          key="forecast-report"
        >
          {/* Filters */}
          <Card title="Filter Forecasts" {...FILTER_CARD_CONFIG}>
            <Row gutter={[8, 8]} align="middle">
              <Col flex="1">
                <Text strong>Period:</Text>
                <Select
                  style={{ width: '100%', marginTop: '8px' }}
                  value={forecastReportPeriod}
                  onChange={(value) => {
                    setForecastReportPeriod(value);
                    // Reset other filters when period changes
                    setForecastReportTerritory(isTSO ? territoryName : '');
                    setForecastReportDealer('');
                    setForecastReportProduct('');
                  }}
                  loading={periods.length === 0}
                  placeholder="Select Period"
                  allowClear
                  showSearch
                  filterOption={(input, option) => {
                    const optionText = option?.children?.toString() || '';
                    return optionText.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {periods.map((p) => (
                    <Option key={p.value} value={p.value}>
                      {p.label} {p.is_current && <Tag color="green" size="small">Current</Tag>}
                    </Option>
                  ))}
                </Select>
              </Col>
              {!isTSO && (
                <Col flex="1">
                  <Text strong>Territory:</Text>
                  <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    value={forecastReportTerritory}
                    onChange={(value) => {
                      setForecastReportTerritory(value || '');
                      // Reset dealer and product when territory changes
                      setForecastReportDealer('');
                      setForecastReportProduct('');
                    }}
                    allowClear
                    showSearch
                    placeholder="All Territories"
                    disabled={!forecastReportPeriod}
                    filterOption={(input, option) => {
                      const optionText = option?.children?.toString() || '';
                      return optionText.toLowerCase().includes(input.toLowerCase());
                    }}
                  >
                    {getUniqueTerritoriesFromForecastReport().map((t) => (
                      <Option key={t} value={t}>
                        {t}
                      </Option>
                    ))}
                  </Select>
                </Col>
              )}
              <Col flex="1">
                <Text strong>Dealer:</Text>
                <Select
                  style={{ width: '100%', marginTop: '8px' }}
                  value={forecastReportDealer}
                  onChange={(value) => {
                    setForecastReportDealer(value || '');
                    // Reset product when dealer changes
                    setForecastReportProduct('');
                  }}
                  allowClear
                  showSearch
                  placeholder="All Dealers"
                  disabled={!forecastReportPeriod}
                  filterOption={(input, option) => {
                    const optionText = option?.children?.toString() || '';
                    return optionText.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {getUniqueDealersFromForecastReport().map((d) => (
                    <Option key={d.id} value={d.id.toString()}>
                      {d.code} - {d.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col flex="1">
                <Text strong>Product:</Text>
                <Select
                  style={{ width: '100%', marginTop: '8px' }}
                  value={forecastReportProduct}
                  onChange={(value) => setForecastReportProduct(value || '')}
                  allowClear
                  showSearch
                  placeholder="All Products"
                  disabled={!forecastReportPeriod}
                  filterOption={(input, option) => {
                    const optionText = option?.children?.toString() || '';
                    return optionText.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {getUniqueProductsFromForecastReport().map((p) => (
                    <Option key={p.code} value={p.code}>
                      {p.code} - {p.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col flex="none" style={{ alignSelf: 'flex-end' }}>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    try {
                      const exportData = filteredForecastReportData.flatMap((forecast) =>
                        forecast.products.map((product) => ({
                          'Dealer Code': forecast.dealer_code,
                          'Dealer Name': forecast.dealer_name,
                          'Territory': forecast.territory_name,
                          'Product Code': product.product_code,
                          'Product Name': product.product_name,
                          'Forecast Quantity': product.quantity,
                          'Period': periods.find((p) => p.value === forecastReportPeriod)?.label || forecastReportPeriod,
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
                      XLSX.utils.book_append_sheet(wb, ws, 'Forecast Report');

                      const periodLabel = periods.find((p) => p.value === forecastReportPeriod)?.label || 'Forecast';
                      const filename = `Forecast_Report_${periodLabel.replace(/\s+/g, '_')}.xlsx`;
                      XLSX.writeFile(wb, filename);

                      message.success('Forecast report exported successfully!');
                    } catch (error) {
                      message.error('Failed to export data');
                      console.error('Export error:', error);
                    }
                  }}
                  disabled={filteredForecastReportData.length === 0}
                  style={{ marginTop: '32px' }}
                >
                  Export Excel
                </Button>
              </Col>
            </Row>
          </Card>

          {/* View Type Indicator */}
          {forecastReportPeriod && (
            <Card title="View Type" {...STANDARD_CARD_CONFIG}>
              <Text strong>
                Viewing: 
                <Tag color={getForecastReportViewType() === 'product' ? 'blue' : getForecastReportViewType() === 'territory' ? 'green' : 'default'} style={{ marginLeft: '8px' }}>
                  {getForecastReportViewType() === 'product' ? 'By Product' : getForecastReportViewType() === 'territory' ? 'By Territory' : 'By Dealer'}
                </Tag>
              </Text>
            </Card>
          )}

          {/* Summary Statistics */}
          {forecastReportPeriod && (
            <Row gutter={SINGLE_ROW_GUTTER} style={{ marginBottom: '16px' }}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Total Dealers"
                    value={filteredForecastReportData.length}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                <Statistic
                  {...STANDARD_STATISTIC_CONFIG}
                  title="Total Products"
                    value={filteredForecastReportData.reduce((sum, f) => sum + f.total_products, 0)}
                    prefix={<FileExcelOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                <Statistic
                  {...STANDARD_STATISTIC_CONFIG}
                  title="Total Forecast Quantity"
                    value={filteredForecastReportData.reduce((sum, f) => sum + f.total_quantity, 0)}
                    prefix={<CalendarOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* Dynamic Table based on View Type */}
          {forecastReportPeriod ? (
            getForecastReportViewType() === 'product' ? (
              // Product View: Show products as rows, dealers in expanded rows
              <Card {...EXPANDABLE_TABLE_CARD_CONFIG}>
                <Table
                  columns={forecastReportProductColumns}
                  dataSource={(() => {
                    const productSummary = {};
                    filteredForecastReportData.forEach((forecast) => {
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
                    return Object.values(productSummary).map((p) => ({
                      ...p,
                      dealer_count: p.dealer_count.size,
                    }));
                  })()}
                  rowKey="product_code"
                  loading={forecastReportLoading}
                  expandable={{
                    expandedRowRender: renderProductExpandedRow,
                    expandedRowKeys: forecastReportExpandedKeys.products,
                    onExpandedRowsChange: (keys) => {
                      setForecastReportExpandedKeys({
                        ...forecastReportExpandedKeys,
                        products: keys,
                      });
                    },
                    expandRowByClick: false,
                    showExpandColumn: false,
                  }}
                  pagination={getStandardPaginationConfig('products', 20)}
                  scroll={{ x: 800 }}
                />
              </Card>
            ) : getForecastReportViewType() === 'territory' ? (
              // Territory View: Show territories as rows, dealers in expanded rows
              <Card {...EXPANDABLE_TABLE_CARD_CONFIG}>
                <Table
                  columns={forecastReportTerritoryColumns}
                  dataSource={(() => {
                    const territorySummary = {};
                    filteredForecastReportData.forEach((forecast) => {
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
                    return Object.values(territorySummary).map((t) => ({
                      ...t,
                      product_count: t.product_count.size,
                    }));
                  })()}
                  rowKey="territory_name"
                  loading={forecastReportLoading}
                  expandable={{
                    expandedRowRender: renderTerritoryExpandedRow,
                    expandedRowKeys: forecastReportExpandedKeys.territories,
                    onExpandedRowsChange: (keys) => {
                      setForecastReportExpandedKeys({
                        ...forecastReportExpandedKeys,
                        territories: keys,
                      });
                    },
                    expandRowByClick: false,
                    showExpandColumn: false,
                  }}
                  pagination={false}
                  scroll={{ x: 800 }}
                />
              </Card>
            ) : (
              // Dealer View: Show dealers as rows, products in expanded rows (default)
              <Card {...EXPANDABLE_TABLE_CARD_CONFIG}>
                <Table
                  columns={forecastReportDealerColumns}
                  dataSource={filteredForecastReportData}
                  rowKey="dealer_id"
                  loading={forecastReportLoading}
                  expandable={{
                    expandedRowRender: renderDealerExpandedRow,
                    expandedRowKeys: forecastReportExpandedKeys.dealers,
                    onExpandedRowsChange: (keys) => {
                      setForecastReportExpandedKeys({
                        ...forecastReportExpandedKeys,
                        dealers: keys,
                      });
                    },
                    expandRowByClick: false,
                    showExpandColumn: false,
                  }}
                  pagination={getStandardPaginationConfig('dealers', 20)}
                  scroll={{ x: 800 }}
                />
              </Card>
            )
          ) : (
            <Card>
              <Text type="secondary">Please select a period to view forecast data.</Text>
            </Card>
          )}
        </Tabs.TabPane>
      </Tabs>

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Spin size={STANDARD_SPIN_SIZE} />
          <div style={{ marginTop: '16px' }}>
            <Text>Processing your request...</Text>
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyReport;
