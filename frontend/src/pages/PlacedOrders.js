import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import {
  Card,
  Typography,
  Table,
  Input,
  Select,
  Button,
  Tag,
  Tooltip,
  Spin,
  message,
  Row,
  Col,
  Space,
  Popconfirm,
  Modal,
  InputNumber,
  Form,
  Alert,
} from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  ClearOutlined,
  OrderedListOutlined,
  EditOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { createStandardDatePickerConfig, createStandardDateRangePicker } from '../templates/UIConfig';
import { useStandardPagination } from '../templates/useStandardPagination';
import { useCascadingFilters } from '../templates/useCascadingFilters';
import { FILTER_CARD_CONFIG, TABLE_CARD_CONFIG } from '../templates/CardTemplates';
import { renderProductDetailsStack } from '../templates/TableTemplate';
import { STANDARD_PAGE_TITLE_CONFIG, STANDARD_PAGE_SUBTITLE_CONFIG, COMPACT_ROW_GUTTER, STANDARD_FORM_LABEL_STYLE, STANDARD_INPUT_SIZE, STANDARD_SELECT_SIZE, STANDARD_TABLE_SIZE, STANDARD_TAG_STYLE, STANDARD_POPCONFIRM_CONFIG, STANDARD_TOOLTIP_CONFIG, STANDARD_SPIN_SIZE, STANDARD_MODAL_CONFIG, STANDARD_INPUT_NUMBER_SIZE, STANDARD_BUTTON_SIZE, renderTableHeaderWithSearch } from '../templates/UIElements';

const { Title, Text } = Typography;
const { Option } = Select;

// Helper function to remove M/S prefix from dealer names
const removeMSPrefix = (name) => {
  if (!name) return name;
  // Remove "M/S", "M/S.", "M/S " prefix (case insensitive, with or without space/period)
  return name.replace(/^M\/S[.\s]*/i, '').trim();
};

function PlacedOrders({ refreshTrigger }) {
  const { isTSO, userId, userRole, isAdmin, isSalesManager } = useUser();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('tso'); // 'tso' = Sales Orders, 'dd' = Daily Demands, 'all' = All
  const [startDate, setStartDate] = useState(dayjs()); // Start date filter
  const [endDate, setEndDate] = useState(null); // End date filter (blank by default, optional)
  const [dateError, setDateError] = useState(''); // Date validation error message
  const [productFilter, setProductFilter] = useState(null);
  const [dealerFilter, setDealerFilter] = useState(null);
  const [territoryFilter, setTerritoryFilter] = useState(null);
  const [tsoUserFilter, setTsoUserFilter] = useState(null);
  const [orderProducts, setOrderProducts] = useState({});
  const [productsList, setProductsList] = useState([]);
  const [dealersList, setDealersList] = useState([]);
  const [territoriesList, setTerritoriesList] = useState([]);
  const [tsoUsersList, setTsoUsersList] = useState([]);
  const { pagination, setPagination, handleTableChange } = useStandardPagination('orders', 20);
  const [availableDates, setAvailableDates] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderItems, setEditOrderItems] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [dealerAssignedProducts, setDealerAssignedProducts] = useState([]);

  // Cascading filters: Territory -> Dealer -> Product
  const { filteredOptions: cascadingFilteredOptions } = useCascadingFilters({
    filterConfigs: [
      {
        name: 'dealer',
        allOptions: dealersList,
        dependsOn: ['territory'],
        filterFn: (dealer, parentValues) => {
          if (!parentValues.territory) return true;
          return dealer?.territory_name === parentValues.territory;
        },
        getValueKey: (dealer) => dealer.id,
      },
      {
        name: 'product',
        allOptions: productsList,
        dependsOn: ['territory', 'dealer'],
        filterFn: (product, parentValues, context) => {
          const { orders, orderProducts, orderTypeFilter } = context;
          // Limit products to those appearing in orders matching current territory/dealer/orderType filters
          const allowedProductIds = new Set();
          orders.forEach(order => {
            // Check territory filter
            if (parentValues.territory && order.dealer_territory !== parentValues.territory) return;
            // Check dealer filter
            if (parentValues.dealer && order.dealer_id !== parentValues.dealer) return;
            // Check order type filter
            if (orderTypeFilter === 'tso') {
              const isSO = order.order_type === 'SO' || order.order_type_name === 'SO';
              if (!isSO && !order.order_type && !order.order_type_name) {
                if (order.order_source !== 'tso') return;
              } else if (!isSO) return;
            } else if (orderTypeFilter === 'dd') {
              const isDD = order.order_type === 'DD' || order.order_type_name === 'DD';
              if (!isDD && !order.order_type && !order.order_type_name) {
                if (order.order_source !== 'dealer') return;
              } else if (!isDD) return;
            }
            // If order passes all filters, include its products
            const products = orderProducts[order.order_id] || [];
            products.forEach(p => {
              if (p.product_id) allowedProductIds.add(p.product_id);
              else if (p.id) allowedProductIds.add(p.id);
              else if (p.product_code) allowedProductIds.add(p.product_code);
            });
          });
          // If no filters applied, return all products
          if (!parentValues.territory && !parentValues.dealer) return true;
          return allowedProductIds.has(product.id) || allowedProductIds.has(product.product_code);
        },
        getValueKey: (product) => product.id || product.product_code,
      },
    ],
    filterValues: {
      territory: territoryFilter,
      dealer: dealerFilter,
      product: productFilter,
    },
    setFilterValues: {
      dealer: setDealerFilter,
      product: setProductFilter,
    },
    context: { orders, orderProducts, orderTypeFilter },
  });

  // Extract filtered options for easier access
  const filteredDealersForFilter = cascadingFilteredOptions.dealer || dealersList;
  const filteredProductsForFilter = cascadingFilteredOptions.product || productsList;

  const loadDropdownData = async () => {
    try {
      const [productsRes, dealersRes, usersRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/dealers'),
        axios.get('/api/users')
      ]);
      setProductsList(productsRes.data || []);
      setDealersList(dealersRes.data || []);
      
      // Extract unique territories from dealers
      const dealersData = dealersRes.data || [];
      const territories = [...new Set(dealersData
        .map(d => d?.territory_name)
        .filter(t => t && t.trim()))].sort();
      setTerritoriesList(territories);
      
      // Extract TSO users
      const usersData = usersRes.data || [];
      const tsoUsers = usersData
        .filter(u => u?.role === 'tso' && (u.is_active === 1 || u.is_active === true))
        .map(u => ({ id: u.id, name: u.full_name || u.username || 'Unknown' }))
        .filter(u => u.id); // Remove any entries without id
      setTsoUsersList(tsoUsers);
    } catch (_error) {
      console.error('Failed to load dropdown data:', _error);
    }
  };

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      // For TSO users, filter orders by their user_id
      const params = isTSO && userId ? { user_id: userId } : {};
      const response = await axios.get('/api/orders', { params });
      setOrders(response.data);

      // Load products for all orders automatically
      const productPromises = response.data.map(async (order) => {
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
    } catch (_error) {
      console.error('Failed to load orders:', _error);
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [isTSO, userId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    loadOrders();
  }, [refreshTrigger, loadOrders]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, orderTypeFilter, startDate, endDate, productFilter, dealerFilter, territoryFilter, tsoUserFilter]);

  // Load dropdown data
  useEffect(() => {
    loadDropdownData();
  }, []);

  // Fetch available dates with orders
  const getAvailableDates = async () => {
    try {
      const endpoint = isTSO && userId 
        ? `/api/orders/tso/available-dates?user_id=${userId}`
        : '/api/orders/available-dates';
      const response = await axios.get(endpoint);
      const dates = response.data.dates || response.data || [];
      const formattedDates = dates.map(date => {
        if (typeof date === 'string') {
          return date.split('T')[0]; // Extract date part if timestamp
        }
        return date;
      });
      setAvailableDates(formattedDates);
    } catch (error) {
      console.error('Failed to load available dates:', error);
      // Continue without graying out dates if API fails
      setAvailableDates([]);
    }
  };

  // Load available dates on mount and when user changes
  useEffect(() => {
    getAvailableDates();
  }, [isTSO, userId]);

  const filterOrders = () => {
    let filtered = orders;

    // Date range filter - use order_date (business date, always NOT NULL)
    // If only startDate is provided, filter for that single date
    // If both startDate and endDate are provided, filter for the range
    // Clear date error first
    setDateError('');
    
    if (startDate) {
      try {
        // Convert to dayjs if not already (handles both dayjs objects and strings/dates)
        const start = dayjs(startDate);
        
        if (!start.isValid()) {
          setDateError('Invalid start date');
          // Skip date filtering but continue with other filters
        } else {
          const startNormalized = start.startOf('day');
          
          if (endDate) {
            // Date range filter
            const end = dayjs(endDate);
            
            if (!end.isValid()) {
              setDateError('Invalid end date');
              // Skip date filtering but continue with other filters
            } else {
              const endNormalized = end.endOf('day');
              
              // Validate: end date must be >= start date
              if (endNormalized.isBefore(startNormalized)) {
                setDateError('End date cannot be before start date');
                // Still filter, but show error (user might want to see what's wrong)
              } else {
                setDateError(''); // Clear error if valid
              }
              
              filtered = filtered.filter(order => {
                try {
                  // Use order_date (business date) - this is always NOT NULL in database
                  // order_date represents the actual date the order is for, not when it was created
                  if (!order.order_date) {
                    // This shouldn't happen since order_date is NOT NULL, but handle gracefully
                    console.warn('Order missing order_date:', order.order_id);
                    return false;
                  }
                  
                  const dateToCheck = dayjs(order.order_date);
                  
                  if (!dateToCheck.isValid()) {
                    // If date is invalid, exclude from results
                    return false;
                  }
                  
                  // Normalize order date to start of day for comparison (removes time component)
                  const orderDateNormalized = dateToCheck.startOf('day');
                  
                  // Compare dates at day level (ignoring time)
                  // Use format('YYYY-MM-DD') for reliable date-only comparison
                  const orderDateStr = orderDateNormalized.format('YYYY-MM-DD');
                  const startDateStr = startNormalized.format('YYYY-MM-DD');
                  const endDateStr = endNormalized.format('YYYY-MM-DD');
                  
                  // Simple string comparison for dates (YYYY-MM-DD format is sortable)
                  return orderDateStr >= startDateStr && orderDateStr <= endDateStr;
                } catch (error) {
                  // Silently exclude orders with date parsing errors
                  return false;
                }
              });
            }
          } else {
            // Single date filter (only startDate)
            filtered = filtered.filter(order => {
              try {
                // Use order_date (business date) - always NOT NULL
                if (!order.order_date) {
                  return false;
                }
                const dateToCheck = dayjs(order.order_date);
                if (!dateToCheck.isValid()) return false;
                return dateToCheck.isSame(startNormalized, 'day');
              } catch {
                return false;
              }
            });
          }
        }
      } catch (error) {
        console.error('Error filtering by date range:', error);
        // Only show generic error if it's unexpected
        setDateError('Error processing dates. Please check your date selections.');
        // Continue with other filters even if date filtering fails
      }
    }

    // Product filter
    if (productFilter) {
      filtered = filtered.filter(order => {
        const products = orderProducts[order.order_id] || [];
        return products.some(p => p.product_id === productFilter || p.product_code === productFilter);
      });
    }

    // Dealer filter
    if (dealerFilter) {
      filtered = filtered.filter(order => order.dealer_id === dealerFilter);
    }

    // Territory filter
    if (territoryFilter) {
      filtered = filtered.filter(order => order.dealer_territory === territoryFilter);
    }

    // TSO User filter (only for Sales Orders)
    if (tsoUserFilter && (orderTypeFilter === 'tso' || orderTypeFilter === 'all')) {
      filtered = filtered.filter(order => 
        (order.order_type === 'SO' || order.order_type_name === 'SO') && order.user_id === tsoUserFilter
      );
    }

    // Search filter - Enhanced: includes product codes/names from orderProducts
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        // Basic order fields
        if (order.order_id?.toLowerCase().includes(searchLower)) return true;
        if (order.dealer_name?.toLowerCase().includes(searchLower)) return true;
        if (order.product_name?.toLowerCase().includes(searchLower)) return true;
        
        // Enhanced: Search in orderProducts for product codes and names
        const products = orderProducts[order.order_id] || [];
        const productMatch = products.some(p => 
          p.product_code?.toLowerCase().includes(searchLower) ||
          p.product_name?.toLowerCase().includes(searchLower) ||
          p.name?.toLowerCase().includes(searchLower)
        );
        if (productMatch) return true;
        
        return false;
      });
    }

    // Order Type filter: Use order_type field (SO or DD) - NOT warehouse_id
    // This is the correct way since we split tables: sales_orders = SO, demand_orders = DD
    // Fallback: If order_type is missing, use order_source ('tso' = SO, 'dealer' = DD)
    if (orderTypeFilter === 'tso') {
      filtered = filtered.filter(order => {
        const isSO = order.order_type === 'SO' || order.order_type_name === 'SO';
        // Fallback: if order_type is missing, check order_source
        if (!isSO && !order.order_type && !order.order_type_name) {
          return order.order_source === 'tso';
        }
        return isSO;
      });
    } else if (orderTypeFilter === 'dd') {
      filtered = filtered.filter(order => {
        const isDD = order.order_type === 'DD' || order.order_type_name === 'DD';
        // Fallback: if order_type is missing, check order_source
        if (!isDD && !order.order_type && !order.order_type_name) {
          return order.order_source === 'dealer';
        }
        return isDD;
      });
    }
    // If 'all', show everything (no filter)

    setFilteredOrders(filtered);
    // Reset pagination when filters change
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const clearFilters = () => {
    setStartDate(dayjs()); // Reset to today
    setEndDate(null); // Reset to blank (optional)
    setProductFilter(null);
    setDealerFilter(null);
    setTerritoryFilter(null);
    setTsoUserFilter(null);
    setSearchTerm('');
    setOrderTypeFilter('tso'); // Default to Sales Orders
  };



  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size={STANDARD_SPIN_SIZE} />
      </div>
    );
  }

  const handleEditOrder = async (order) => {
    // Check if order is a dealer order (order_type must be DD, not SO)
    // Use order_type field, not warehouse_id (since tables are split)
    if (!order.dealer_id || (order.order_type !== 'DD' && order.order_type_name !== 'DD')) {
      message.warning('Only dealer daily demand orders can be edited');
      return;
    }
    
    // Load order details and dealer assigned products
    try {
      const [orderResponse, assignmentsResponse] = await Promise.all([
        axios.get(`/api/orders/${order.order_id}`),
        axios.get(`/api/dealer-assignments?dealer_id=${order.dealer_id}`)
      ]);
      
      const orderData = orderResponse.data;
      
      // Check if it's a DD order (demand_orders can be edited, sales_orders cannot)
      if (orderData.order_type !== 'DD') {
        message.warning('Only daily demand orders can be edited');
        return;
      }
      
      // Get assigned product IDs
      const assignedProductIds = (assignmentsResponse.data || [])
        .filter(a => a.assignment_type === 'product' && a.product_id)
        .map(a => a.product_id);
      
      setDealerAssignedProducts(assignedProductIds);
      setEditingOrder(order);
      setEditOrderItems(orderData.items || []);
      setEditModalVisible(true);
      editForm.setFieldsValue({
        items: (orderData.items || []).map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      });
    } catch (error) {
      console.error('Error loading order details:', error);
      message.error('Failed to load order details');
    }
  };

  const handleSaveEditOrder = async () => {
    if (!editingOrder) return;
    
    try {
      await editForm.validateFields();
      const values = editForm.getFieldsValue();
      const orderItems = values.items || [];
      
      if (orderItems.length === 0) {
        message.error('At least one product is required');
        return;
      }
      
      setEditLoading(true);
      
      await axios.put(`/api/orders/dealer/${editingOrder.order_id}`, {
        order_items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        user_role: userRole
      });
      
      message.success('Order updated successfully');
      setEditModalVisible(false);
      setEditingOrder(null);
      setEditOrderItems([]);
      editForm.resetFields();
      
      // Reload orders
      loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      message.error(error.response?.data?.error || 'Failed to update order');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId, orderDate) => {
    // Additional safety check: only allow deletion of today's orders
    // Use order_date (business date), not created_at (database timestamp)
    const orderDateStr = orderDate ? dayjs(orderDate).format('YYYY-MM-DD') : null;
    const today = dayjs().format('YYYY-MM-DD');
    
    if (!orderDateStr || orderDateStr !== today) {
      message.error('Only today\'s orders can be deleted');
      return;
    }
    
    try {
      const response = await axios.delete(`/api/orders/${orderId}`);
      message.success(response.data.message || 'Order deleted successfully');
      loadOrders(); // Refresh the orders list
    } catch (_error) {
      const errorMessage = _error.response?.data?.error || _error.message || 'Failed to delete order';
      message.error(errorMessage);
    }
  };



  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      ellipsis: true,
      render: (orderId, record) => {
        // Use order_type field, not warehouse_id (since tables are split)
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
      title: 'Order Date',
      key: 'order_date',
      ellipsis: true,
      render: (_, record) => {
        // Use order_date (business date, always NOT NULL)
        return record.order_date ? dayjs(record.order_date).format('YYYY-MM-DD') : 'N/A';
      },
      sorter: (a, b) => {
        // Sort by order_date (business date, always NOT NULL)
        const dateA = a.order_date ? new Date(a.order_date) : new Date(0);
        const dateB = b.order_date ? new Date(b.order_date) : new Date(0);
        return dateA - dateB;
      },
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
        return renderProductDetailsStack({
          products,
          showPrice: true,
          isTSO,
        });
      },
    },
    {
      title: 'Order Type',
      key: 'order_type',
      width: 120,
      align: 'center',
      render: (_, record) => {
        // Use order_type field, not warehouse_id (since tables are split)
        const isTSOOrder = record.order_type === 'SO' || record.order_type_name === 'SO';
        return (
          <Tag color={isTSOOrder ? 'blue' : 'green'} style={STANDARD_TAG_STYLE}>
            {isTSOOrder ? 'Sales Order' : 'Daily Demand'}
          </Tag>
        );
      },
      sorter: (a, b) => {
        const aIsTSO = a.order_type === 'SO' || a.order_type_name === 'SO';
        const bIsTSO = b.order_type === 'SO' || b.order_type_name === 'SO';
        if (aIsTSO === bIsTSO) return 0;
        return aIsTSO ? 1 : -1;
      },
    },
    ...(!isTSO ? [{
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => {
        // Use order_date (business date) to determine if order can be deleted
        // Only today's orders can be deleted
        const orderDate = record.order_date ? dayjs(record.order_date).format('YYYY-MM-DD') : null;
        const today = dayjs().format('YYYY-MM-DD');
        const isToday = orderDate === today;
        // Use order_type field, not warehouse_id (since tables are split)
        const isDealerOrder = record.dealer_id && (record.order_type === 'DD' || record.order_type_name === 'DD');
        const canEditDealerOrder = isDealerOrder && (isAdmin || isSalesManager);
        
        return (
          <Space>
            {canEditDealerOrder && (
              <Tooltip {...STANDARD_TOOLTIP_CONFIG} title="Edit Order">
                <Button
                  type="text"
                  size={STANDARD_TABLE_SIZE}
                  icon={<EditOutlined />}
                  onClick={() => handleEditOrder(record)}
                />
              </Tooltip>
            )}
            {isToday ? (
              <Popconfirm
                {...STANDARD_POPCONFIRM_CONFIG}
                title="Delete Order"
                description={
                  <div>
                    <div>Are you sure you want to delete order {record.order_id}?</div>
                    <div>This will also delete all associated items, and quotas will revert to the TSO.</div>
                  </div>
                }
                onConfirm={() => handleDeleteOrder(record.id, record.order_date)}
                okText="Yes, Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Tooltip {...STANDARD_TOOLTIP_CONFIG} title="Delete Order">
                  <Button
                    type="text"
                    size={STANDARD_TABLE_SIZE}
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            ) : (
              <Tooltip {...STANDARD_TOOLTIP_CONFIG} title="Only today's orders can be deleted">
                <Button
                  type="text"
                  size={STANDARD_TABLE_SIZE}
                  danger
                  icon={<DeleteOutlined />}
                  disabled
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    }] : []),
  ];

  // Standard date picker configuration
  const { disabledDate, dateCellRender } = createStandardDatePickerConfig(availableDates);

  return (
    <div>
      <Title {...STANDARD_PAGE_TITLE_CONFIG}>
        <OrderedListOutlined /> Orders & Demands
      </Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        {isTSO ? "View orders you've placed and filter by date range, territory, dealer, product, and order type." : 'View and manage all Sales Orders and Daily Demands. Filter by date range, territory, dealer, product, and order type.'}
      </Text>

      {/* Filters */}
      <Card title="Filter Orders" {...FILTER_CARD_CONFIG}>
        {/* Row 1: Primary Filters - Order Type first (most important) */}
        <Row gutter={COMPACT_ROW_GUTTER} align="bottom" style={{ marginBottom: '12px' }}>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>Order Type</Text>
              <Select
                placeholder="Select Type"
                value={orderTypeFilter}
                onChange={setOrderTypeFilter}
                style={{ width: '100%' }}
                size={STANDARD_INPUT_SIZE}
              >
                <Option value="tso">Sales Orders</Option>
                <Option value="dd">Daily Demands</Option>
                <Option value="all">All Orders</Option>
              </Select>
            </Space>
          </Col>
          {createStandardDateRangePicker({
            startDate,
            setStartDate,
            endDate,
            setEndDate,
            disabledDate,
            dateCellRender,
            availableDates,
            colSpan: { xs: 24, sm: 12, md: 6 },
            onStartChange: () => {
              setDateError(''); // Clear error when start date changes
              filterOrders();
            },
            onEndChange: () => {
              filterOrders(); // Error will be set in filterOrders if invalid
            },
          })}
          {dateError && (
            <Col xs={24} sm={24} md={12}>
              <Alert
                message={dateError}
                type="error"
                showIcon
                closable
                onClose={() => setDateError('')}
                style={{ marginTop: '8px' }}
              />
            </Col>
          )}
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>Territory</Text>
              <Select
                placeholder="All Territories"
                value={territoryFilter}
                onChange={(value) => {
                  setTerritoryFilter(value);
                  // Clear dependent filters when territory changes
                  setDealerFilter(null);
                  setProductFilter(null);
                }}
                style={{ width: '100%' }}
                size={STANDARD_INPUT_SIZE}
                allowClear
                showSearch
                filterOption={(input, option) => {
                  const optionText = option?.children?.toString() || '';
                  return optionText.toLowerCase().includes(input.toLowerCase());
                }}
              >
                {territoriesList && territoriesList.length > 0 ? territoriesList.map(territory => (
                  <Option key={territory} value={territory}>
                    {territory}
                  </Option>
                )) : null}
              </Select>
            </Space>
          </Col>
        </Row>

        {/* Row 2: Secondary Filters */}
        <Row gutter={COMPACT_ROW_GUTTER} align="bottom" style={{ marginBottom: '12px' }}>
          {(orderTypeFilter === 'tso' || orderTypeFilter === 'all') && (
            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong style={STANDARD_FORM_LABEL_STYLE}>TSO User</Text>
                <Select
                  placeholder="All TSOs"
                  value={tsoUserFilter}
                  onChange={(value) => {
                    setTsoUserFilter(value);
                    // Auto-switch Order Type to SO when TSO user is selected (if currently 'all')
                    if (value && orderTypeFilter === 'all') {
                      setOrderTypeFilter('tso');
                    }
                  }}
                  style={{ width: '100%' }}
                  size={STANDARD_INPUT_SIZE}
                  allowClear
                  showSearch
                  filterOption={(input, option) => {
                    const optionText = option?.children?.toString() || '';
                    return optionText.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {tsoUsersList && tsoUsersList.length > 0 ? tsoUsersList.map(tso => (
                    <Option key={tso.id} value={tso.id}>
                      {tso.name}
                  </Option>
                  )) : null}
                </Select>
              </Space>
            </Col>
          )}
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>Dealer</Text>
              <Select
                placeholder={territoryFilter ? "Select Dealer" : "All Dealers"}
                value={dealerFilter}
                onChange={(value) => {
                  setDealerFilter(value);
                  // Clear dependent filter when dealer changes
                  setProductFilter(null);
                }}
                style={{ width: '100%' }}
                size={STANDARD_INPUT_SIZE}
                allowClear
                showSearch
                disabled={!territoryFilter && territoriesList.length > 0}
                filterOption={(input, option) => {
                  const optionText = option?.children?.toString() || '';
                  return optionText.toLowerCase().includes(input.toLowerCase());
                }}
              >
                {filteredDealersForFilter.map(dealer => (
                  <Option key={dealer.id} value={dealer.id}>
                    {removeMSPrefix(dealer.name)}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>Product</Text>
              <Select
                placeholder={!territoryFilter && !dealerFilter ? "Select Territory/Dealer first" : "All Products"}
                value={productFilter}
                onChange={setProductFilter}
                style={{ width: '100%' }}
                size={STANDARD_INPUT_SIZE}
                allowClear
                showSearch
                disabled={!territoryFilter && !dealerFilter && (territoriesList.length > 0 || dealersList.length > 0)}
                filterOption={(input, option) => {
                  const optionText = option?.children?.toString() || '';
                  return optionText.toLowerCase().includes(input.toLowerCase());
                }}
              >
                {filteredProductsForFilter.map(product => (
                  <Option key={product.id} value={product.id}>
                    {product.product_code} - {product.name}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>Search</Text>
              <Input
                placeholder="Search Order ID, Dealer, Product..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size={STANDARD_INPUT_SIZE}
                allowClear
              />
            </Space>
          </Col>
        </Row>

        {/* Row 3: Actions */}
        <Row gutter={COMPACT_ROW_GUTTER} align="bottom">
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>Actions</Text>
              <Space style={{ width: '100%' }}>
                <Tooltip {...STANDARD_TOOLTIP_CONFIG} title="Reload orders from server without changing current filters">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={loadOrders}
                    style={{ flex: 1 }}
                    size={STANDARD_INPUT_SIZE}
                  >
                    Refresh
                  </Button>
                </Tooltip>
                <Tooltip {...STANDARD_TOOLTIP_CONFIG} title="Clear all filters and reset to defaults">
                  <Button
                    icon={<ClearOutlined />}
                    onClick={clearFilters}
                    style={{ flex: 1 }}
                    size={STANDARD_INPUT_SIZE}
                  >
                    Clear
                  </Button>
                </Tooltip>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card {...TABLE_CARD_CONFIG}>
        {renderTableHeaderWithSearch({
          title: isTSO ? 'Orders' : 'Orders & Demands',
          count: filteredOrders.length,
          searchTerm: searchTerm,
          onSearchChange: (e) => setSearchTerm(e.target.value),
          searchPlaceholder: 'Search orders...'
        })}

        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }}>📋</div>
            <Title level={5} type="secondary">
              No orders found
            </Title>
            <Text type="secondary">
              {searchTerm ? 'Try adjusting your search criteria' : 'No orders have been placed yet'}
            </Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="id"
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 'max-content' }}
            size="small"
          />
        )}
      </Card>

      {/* Edit Order Modal */}
      <Modal
        {...STANDARD_MODAL_CONFIG}
        title="Edit Dealer Order"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingOrder(null);
          setEditOrderItems([]);
          editForm.resetFields();
        }}
        footer={null}
      >
        {editingOrder && (
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleSaveEditOrder}
          >
            <Form.Item label="Order ID">
              <Text strong>{editingOrder.order_id}</Text>
            </Form.Item>
            <Form.Item label="Dealer">
              <Text>{removeMSPrefix(editingOrder.dealer_name || 'N/A')}</Text>
            </Form.Item>
            <Form.Item label="Order Date">
              <Text>{editingOrder.order_date ? dayjs(editingOrder.order_date).format('YYYY-MM-DD') : 'N/A'}</Text>
            </Form.Item>
            
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => {
                    return (
                      <Card key={field.key} style={{ marginBottom: '16px' }} size="small">
                        <Row gutter={COMPACT_ROW_GUTTER}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              {...field}
                              name={[field.name, 'product_id']}
                              label="Product"
                              rules={[{ required: true, message: 'Please select a product' }]}
                            >
                              <Select
                                placeholder="Select Product"
                                size={STANDARD_SELECT_SIZE}
                                showSearch
                                filterOption={(input, option) => {
                                  const optionText = option?.children?.toString() || '';
                                  return optionText.toLowerCase().includes(input.toLowerCase());
                                }}
                              >
                                {productsList
                                  .filter(p => dealerAssignedProducts.includes(p.id))
                                  .map(product => (
                                    <Option key={product.id} value={product.id}>
                                      {product.product_code} - {product.name}
                                    </Option>
                                  ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item
                              {...field}
                              name={[field.name, 'quantity']}
                              label="Quantity"
                              rules={[
                                { required: true, message: 'Please enter quantity' },
                                { type: 'number', min: 1, message: 'Quantity must be at least 1' }
                              ]}
                            >
                              <InputNumber
                                min={1}
                                style={{ width: '100%' }}
                                size={STANDARD_INPUT_NUMBER_SIZE}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={4}>
                            <Form.Item label=" " style={{ marginTop: '30px' }}>
                              <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => remove(field.name)}
                                size={STANDARD_BUTTON_SIZE}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    );
                  })}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      size={STANDARD_BUTTON_SIZE}
                    >
                      Add Product
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={editLoading}
                  size={STANDARD_BUTTON_SIZE}
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => {
                    setEditModalVisible(false);
                    setEditingOrder(null);
                    setEditOrderItems([]);
                    editForm.resetFields();
                  }}
                  size={STANDARD_BUTTON_SIZE}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

    </div>
  );
}

export default PlacedOrders;
