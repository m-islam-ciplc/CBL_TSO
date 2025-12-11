import { useState, useEffect } from 'react';
import { Card, DatePicker, Button, message, Typography, Row, Col, Space, Spin, Table, Tag, Input, Select, Tabs, Badge } from 'antd';
import { DownloadOutlined, FileExcelOutlined, EyeOutlined, SearchOutlined, BarChartOutlined, AppstoreOutlined } from '@ant-design/icons';
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
  createStandardDatePickerConfig, 
  createStandardDateRangePicker,
  STANDARD_PAGE_TITLE_CONFIG, 
  STANDARD_PAGE_SUBTITLE_CONFIG, 
  STANDARD_ROW_GUTTER, 
  STANDARD_TABLE_SIZE, 
  STANDARD_TAG_STYLE, 
  STANDARD_TABS_CONFIG, 
  STANDARD_BADGE_CONFIG, 
  STANDARD_SPIN_SIZE, 
  STANDARD_DATE_PICKER_CONFIG, 
  STANDARD_INPUT_SIZE, 
  renderTableHeaderWithSearch,
  COMPACT_ROW_GUTTER
} from '../templates/UITemplates';
import { DailyOrderReportCardTemplate } from '../templates/DailyOrderReportCardTemplate';
import { OrderSummaryReportCardTemplate } from '../templates/OrderSummaryReportCardTemplate';
import { MonthlyForecastsFilterCardTemplate } from '../templates/MonthlyForecastsFilterCardTemplate';
import { getStandardPaginationConfig } from '../templates/useStandardPagination';
import { STANDARD_EXPANDABLE_TABLE_CONFIG, renderProductDetailsStack } from '../templates/TableTemplate';
import { useCascadingFilters } from '../templates/useCascadingFilters';

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
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [filteredPreviewData, setFilteredPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [orderProducts, setOrderProducts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(dayjs()); // On page load, end date is today
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
  const [territoryFilter, setTerritoryFilter] = useState(isTSO ? territoryName : null);
  const [dealerFilter, setDealerFilter] = useState(null);
  const [forecastViewType, setForecastViewType] = useState('dealer'); // 'dealer', 'product', or 'territory'
  const [expandedRowKeys, setExpandedRowKeys] = useState({
    byDealer: [],
    byProduct: [],
    byTerritory: [],
  });

  const [autoPreviewDone, setAutoPreviewDone] = useState(false);

  // Prefill selected date with today if available, otherwise first available date
  useEffect(() => {
    if (!availableDates || availableDates.length === 0) return;
    const today = dayjs().format('YYYY-MM-DD');
    if (availableDates.includes(today)) {
      setSelectedDate(dayjs(today));
      return;
    }
    const current = selectedDate ? selectedDate.format('YYYY-MM-DD') : null;
    if (current && availableDates.includes(current)) return;
    setSelectedDate(dayjs(availableDates[0]));
  }, [availableDates, selectedDate]);

  // Auto-load Daily Order Report preview once dates are available and a date is selected
  useEffect(() => {
    if (autoPreviewDone) return;
    if (!selectedDate) return;
    if (!availableDates || availableDates.length === 0) return;
    setAutoPreviewDone(true);
    handlePreviewData();
  }, [autoPreviewDone, selectedDate, availableDates]);

  // Load available dates on component mount
  useEffect(() => {
    getAvailableDates();
    loadPeriods();
  }, []);

  // Auto-load orders on page load (after available dates are loaded) - only for Order Summary tab
  useEffect(() => {
    if (activeTab === 'order-summary' && rangeEnd && availableDates.length > 0) {
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        handlePreviewRange();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab, rangeEnd, availableDates.length]); // Run when tab is active, availableDates are loaded, or rangeEnd is set

  // Auto-load when end date or start date changes - only for Order Summary tab
  useEffect(() => {
    if (activeTab === 'order-summary' && rangeEnd && availableDates.length > 0) {
      // Small delay to avoid rapid calls
      const timer = setTimeout(() => {
        handlePreviewRange();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab, rangeEnd, rangeStart]); // Run when tab is active, or rangeEnd/rangeStart changes

  // Load forecasts when period changes
  useEffect(() => {
    if (selectedPeriod) {
      loadForecasts();
    }
  }, [selectedPeriod]);

  // Filter preview data when search term changes
  useEffect(() => {
    filterPreviewData();
  }, [previewData, searchTerm, previewMode]);

  // Filter forecasts
  useEffect(() => {
    filterForecasts();
  }, [forecastSearchTerm, territoryFilter, dealerFilter, forecasts, forecastViewType]);

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
    if (!rangeEnd) {
      message.error('Please select an end date');
      return;
    }

    // If only end date is selected (no start date), use it as single date
    if (!rangeStart) {
      const dateString = rangeEnd.format('YYYY-MM-DD');
      setLoading(true);
      try {
        const params = {
          date: dateString,
        };
        if (isTSO && territoryName) {
          params.territory_name = territoryName;
        }
        
        const response = await axios.get('/api/orders/tso-report', {
          responseType: 'blob',
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          },
          params,
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `TSO_Order_Report_${dateString}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        message.success(`Excel report generated for ${dateString}`);
      } catch (error) {
        console.error('Error generating report:', error);
        if (error.response?.status === 404) {
          message.error(`No orders found for ${dateString}`);
        } else if (error.response?.data?.error) {
          message.error(error.response.data.error);
        } else {
          message.error('Failed to generate report. Please try again.');
        }
      } finally {
        setLoading(false);
      }
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
    if (!rangeEnd) {
      message.error('Please select an end date to preview');
      return;
    }

    // If only end date is selected (no start date), use it as single date
    if (!rangeStart) {
      const dateString = rangeEnd.format('YYYY-MM-DD');
      setLoading(true);
      try {
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
          } catch (_error) {
            console.error(`Error loading products for order ${order.order_id}:`, _error);
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
        setPreviewData([]);
        setShowPreview(false);
        setPreviewInfo('');
        return;
      }

      setOrderProducts({});
      setPreviewMode('range');
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

      // Check response status and content type
      const contentType = response.headers['content-type'] || '';
      const status = response.status;
      
      // If status is not 200 or content type is JSON, it's an error
      if (status !== 200 || contentType.includes('application/json')) {
        // Response is JSON error, not CSV - need to parse the blob
        const text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Failed to read error response'));
          reader.readAsText(response.data);
        });
        
        try {
          const errorData = JSON.parse(text);
          if (errorData.error) {
            message.error(errorData.error);
            return;
          }
        } catch (e) {
          // If parsing fails, show generic error
          console.error('Failed to parse error response:', e);
        }
        
        if (status === 404) {
          message.error(`No orders found for ${dateString}`);
        } else {
          message.error('Failed to generate MR report. Please try again.');
        }
        return;
      }

      // Verify it's actually CSV
      if (!contentType.includes('text/csv') && !contentType.includes('text/plain')) {
        console.error('Unexpected content type:', contentType, 'Status:', status);
        message.error('Unexpected response format. Please try again.');
        return;
      }

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
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
      console.error('Error response:', error.response);
      
      // Try to extract error message from blob response if it's an error
      if (error.response?.data && error.response.data instanceof Blob) {
        try {
          const text = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read error response'));
            reader.readAsText(error.response.data);
          });
          const errorData = JSON.parse(text);
          if (errorData.error) {
            message.error(errorData.error);
            return;
          }
        } catch (e) {
          // If parsing fails, continue with generic error
          console.error('Failed to parse error blob:', e);
        }
      }
      
      if (error.response?.status === 404) {
        message.error(`No orders found for ${selectedDate ? selectedDate.format('YYYY-MM-DD') : 'selected date'}`);
      } else if (error.response?.data?.error) {
        message.error(error.response.data.error);
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
      render: (orderId, record) => {
        // Use order_type field to determine prefix
        const isTSOOrder = record.order_type === 'SO' || record.order_type_name === 'SO';
        const prefix = isTSOOrder ? 'SO' : 'DD';
        return (
          <Tag color={isTSOOrder ? 'blue' : 'green'} style={STANDARD_TAG_STYLE}>
            {prefix}-{orderId}
        </Tag>
        );
      },
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
      render: (_, record) =>
        renderProductDetailsStack({
          products: orderProducts[record.order_id] || [],
          showPrice: false,
          isTSO,
          showIndex: true,
        }),
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
        <Tag color="green" style={STANDARD_TAG_STYLE}>
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
        const products = (record.product_summaries || []).map((p) => ({
          ...p,
          quantity: p.total_quantity ?? p.quantity ?? 0,
        }));
        return renderProductDetailsStack({
          products,
          showPrice: false,
          showIndex: true,
        });
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
          <DailyOrderReportCardTemplate
            title="Daily Order Report"
            datePicker1={{
              label: 'Select Date',
              value: selectedDate,
              onChange: setSelectedDate,
              placeholder: 'Select date for report',
              disabledDate,
              dateRender: dateCellRender,
            }}
            buttons={[
              {
                label: 'Preview Orders',
                type: 'default',
                icon: <EyeOutlined />,
                onClick: handlePreviewData,
                loading: loading,
              },
              {
                label: 'Download Daily Order Report',
                type: 'primary',
                icon: <DownloadOutlined />,
                onClick: handleGenerateReport,
                loading: loading,
              },
              {
                label: 'Download MR CSV',
                type: 'default',
                icon: <DownloadOutlined />,
                onClick: handleGenerateMRReport,
                loading: loading,
              },
            ]}
            gutter={COMPACT_ROW_GUTTER}
          />

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
          <OrderSummaryReportCardTemplate
            title="Order Summary Report"
            datePicker1={{
              label: 'Start Date',
              value: rangeStart,
              onChange: (date) => {
                // When selecting a start date, if a startDate already exists,
                // move it to endDate, and set the new date as startDate
                if (date) {
                  if (rangeStart && rangeStart.isBefore(rangeEnd)) {
                    // Move previous startDate to endDate
                    setRangeEnd(rangeStart);
                  }
                  setRangeStart(date);
                } else {
                  setRangeStart(null);
                }
              },
              placeholder: 'Select start date',
                disabledDate,
              dateRender: dateCellRender,
            }}
            datePicker2={{
              label: 'End Date',
              value: rangeEnd,
              onChange: setRangeEnd,
              placeholder: 'Select end date',
              disabledDate,
              dateRender: dateCellRender,
            }}
            buttons={[
              {
                label: rangeStart ? 'Preview Range Orders' : 'Preview Orders',
                type: 'default',
                icon: <EyeOutlined />,
                onClick: handlePreviewRange,
                loading: loading,
              },
              {
                label: rangeStart ? 'Download Order Summary' : 'Download Daily Order Report',
                type: 'primary',
                icon: rangeStart ? <FileExcelOutlined /> : <DownloadOutlined />,
                onClick: handleGenerateRangeReport,
                loading: loading,
              },
            ]}
            gutter={COMPACT_ROW_GUTTER}
          />

      {/* Preview Table - Single Date Mode */}
          {showPreview && previewMode === 'single' && previewData.length > 0 && (
        <Card {...TABLE_CARD_CONFIG}>
          {renderTableHeaderWithSearch({
            title: previewInfo || 'Orders',
            count: filteredPreviewData.length,
            searchTerm: searchTerm,
            onSearchChange: (e) => setSearchTerm(e.target.value),
            searchPlaceholder: 'Search orders...'
          })}

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

      {/* Preview Table - Range Mode */}
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
