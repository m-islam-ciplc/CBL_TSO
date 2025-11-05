import React, { useState, useEffect } from 'react';
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
  DatePicker,
  Space,
} from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  DeleteOutlined,
  DownOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

function PlacedOrders({ refreshTrigger }) {
  const { isTSO, userId } = useUser();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(dayjs()); // Default to today
  const [productFilter, setProductFilter] = useState(null);
  const [dealerFilter, setDealerFilter] = useState(null);
  const [transportFilter, setTransportFilter] = useState(null);
  const [orderProducts, setOrderProducts] = useState({});
  const [productsList, setProductsList] = useState([]);
  const [dealersList, setDealersList] = useState([]);
  const [transportsList, setTransportsList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
    pageSizeOptions: ['10', '20', '50', '100'],
    defaultPageSize: 20,
  });

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [refreshTrigger]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, selectedDate, productFilter, dealerFilter, transportFilter]);

  // Load dropdown data
  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      const [productsRes, dealersRes, transportsRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/dealers'),
        axios.get('/api/transports')
      ]);
      setProductsList(productsRes.data || []);
      setDealersList(dealersRes.data || []);
      setTransportsList(transportsRes.data || []);
    } catch (error) {
      console.error('Failed to load dropdown data:', error);
    }
  };

  const loadOrders = async () => {
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
          console.log(`Loaded products for order ${order.order_id}:`, productResponse.data.items);
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
      console.log('Final products map:', productsMap);
      setOrderProducts(productsMap);
    } catch (error) {
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Date filter - default to today
    if (selectedDate) {
      const selectedDateStr = selectedDate.format('YYYY-MM-DD');
      filtered = filtered.filter(order => {
        const orderDate = dayjs(order.created_at).format('YYYY-MM-DD');
        return orderDate === selectedDateStr;
      });
    }

    // Product filter
    if (productFilter) {
      filtered = filtered.filter(order => {
        const products = orderProducts[order.order_id] || [];
        return products.some(p => p.product_id === productFilter || p.product_code === productFilter);
      });
    }

    // Dealer/Vendor filter
    if (dealerFilter) {
      filtered = filtered.filter(order => order.dealer_id === dealerFilter);
    }

    // Transport filter
    if (transportFilter) {
      filtered = filtered.filter(order => order.transport_id === transportFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.dealer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter (for now all are 'new' since we don't have status field yet)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
    // Reset pagination when filters change
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const clearFilters = () => {
    setSelectedDate(dayjs()); // Reset to today
    setProductFilter(null);
    setDealerFilter(null);
    setTransportFilter(null);
    setSearchTerm('');
    setStatusFilter('all');
  };

  const handleTableChange = (newPagination) => {
    console.log('Table pagination changed:', newPagination);
    setPagination(newPagination);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'completed':
        return <Tag color="success" icon={<CheckCircleOutlined />}>Completed</Tag>;
      case 'processing':
        return <Tag color="warning" icon={<ClockCircleOutlined />}>Processing</Tag>;
      case 'shipped':
        return <Tag color="blue" icon={<CarOutlined />}>Shipped</Tag>;
      default:
        return <Tag color="default">New</Tag>;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`/api/orders/${orderId}`);
      message.success('Order deleted successfully');
      loadOrders(); // Refresh the orders list
    } catch (error) {
      message.error('Failed to delete order');
    }
  };



  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      render: (orderId) => (
        <Tag color="blue" style={{ fontSize: '12px' }}>
          {orderId}
        </Tag>
      ),
      width: 120,
      sorter: (a, b) => a.order_id.localeCompare(b.order_id),
    },
    {
      title: 'Dealer',
      dataIndex: 'dealer_name',
      key: 'dealer_name',
      ellipsis: true,
      width: 300,
      sorter: (a, b) => a.dealer_name.localeCompare(b.dealer_name),
    },
    {
      title: 'Territory',
      dataIndex: 'dealer_territory',
      key: 'dealer_territory',
      ellipsis: true,
      width: 120,
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
      render: (_, record) => {
        return (
          <div>
            <Tag color="green" style={{ fontSize: '12px' }}>
              {record.item_count} item{record.item_count !== 1 ? 's' : ''}
            </Tag>
          </div>
        );
      },
      width: 70,
      sorter: (a, b) => (a.item_count || 0) - (b.item_count || 0),
    },
    {
      title: 'Product Details',
      key: 'product_details',
      render: (_, record) => {
        const products = orderProducts[record.order_id] || [];
        console.log(`Rendering products for order ${record.order_id}:`, products);
        
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
      width: 400,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status || 'new'),
      width: 80,
      sorter: (a, b) => {
        const statusA = a.status || 'new';
        const statusB = b.status || 'new';
        return statusA.localeCompare(statusB);
      },
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
      width: 150,
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Tooltip title="Delete Order">
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteOrder(record.id)}
          />
        </Tooltip>
      ),
      width: 60,
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: '8px' }}>
        Placed Orders
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        View and manage orders placed by TSOs
      </Text>

      {/* Filters */}
      <Card style={{ marginBottom: '16px' }} bodyStyle={{ padding: '12px' }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Text strong style={{ fontSize: '12px' }}>Date</Text>
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
                size="middle"
                allowClear={false}
              />
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Text strong style={{ fontSize: '12px' }}>Product</Text>
              <Select
                placeholder="All Products"
                value={productFilter}
                onChange={setProductFilter}
                style={{ width: '100%' }}
                size="middle"
                allowClear
                showSearch
                filterOption={(input, option) => {
                  const optionText = option?.children?.toString() || '';
                  return optionText.toLowerCase().includes(input.toLowerCase());
                }}
              >
                {productsList.map(product => (
                  <Option key={product.id} value={product.id}>
                    {product.product_code} - {product.name}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Text strong style={{ fontSize: '12px' }}>Dealer</Text>
              <Select
                placeholder="All Dealers"
                value={dealerFilter}
                onChange={setDealerFilter}
                style={{ width: '100%' }}
                size="middle"
                allowClear
                showSearch
                filterOption={(input, option) => {
                  const optionText = option?.children?.toString() || '';
                  return optionText.toLowerCase().includes(input.toLowerCase());
                }}
              >
                {dealersList.map(dealer => (
                  <Option key={dealer.id} value={dealer.id}>
                    {dealer.name}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Text strong style={{ fontSize: '12px' }}>Transport</Text>
              <Select
                placeholder="All Transports"
                value={transportFilter}
                onChange={setTransportFilter}
                style={{ width: '100%' }}
                size="middle"
                allowClear
                showSearch
                filterOption={(input, option) => {
                  const optionText = option?.children?.toString() || '';
                  return optionText.toLowerCase().includes(input.toLowerCase());
                }}
              >
                {transportsList.map(transport => (
                  <Option key={transport.id} value={transport.id}>
                    {transport.truck_details || transport.truck_no || `Transport #${transport.id}`}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Text strong style={{ fontSize: '12px' }}>Search</Text>
              <Input
                placeholder="Search orders..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="middle"
                allowClear
              />
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Text strong style={{ fontSize: '12px' }}>Status</Text>
              <Select
                placeholder="All Status"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
                size="middle"
                allowClear
              >
                <Option value="all">All Orders</Option>
                <Option value="new">New</Option>
                <Option value="processing">Processing</Option>
                <Option value="shipped">Shipped</Option>
                <Option value="completed">Completed</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Text strong style={{ fontSize: '12px' }}>Actions</Text>
              <Space style={{ width: '100%' }}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadOrders}
                  style={{ flex: 1 }}
                >
                  Refresh
                </Button>
                <Button
                  icon={<ClearOutlined />}
                  onClick={clearFilters}
                  style={{ flex: 1 }}
                >
                  Clear
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Text strong>Orders ({filteredOrders.length})</Text>
        </div>

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
            scroll={{ x: 1200 }}
            size="small"
          />
        )}
      </Card>

    </div>
  );
}

export default PlacedOrders;
