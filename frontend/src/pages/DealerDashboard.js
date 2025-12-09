import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import {
  Card,
  Table,
  Statistic,
  Typography,
  Row,
  Col,
  Alert,
  Space,
  Spin,
  Tag,
} from 'antd';
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getStandardPaginationConfig } from '../templates/useStandardPagination';
import { 
  STANDARD_CARD_CONFIG, 
  TABLE_CARD_CONFIG,
  STANDARD_PAGE_TITLE_CONFIG, 
  STANDARD_PAGE_SUBTITLE_CONFIG, 
  STANDARD_ROW_GUTTER, 
  STANDARD_TAG_STYLE, 
  STANDARD_ALERT_CONFIG, 
  STANDARD_STATISTIC_CONFIG, 
  STANDARD_SPIN_SIZE, 
  STANDARD_SPACE_SIZE_LARGE 
} from '../templates/UITemplates';

const { Title, Text } = Typography;

function DealerDashboard() {
  const { dealerId, userName, territoryName } = useUser();
  const [dealerInfo, setDealerInfo] = useState(null);
  const [assignedProducts, setAssignedProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDealerInfo = useCallback(async () => {
    if (!dealerId) return;
    
    try {
      const response = await axios.get('/api/dealers');
      const dealer = response.data.find(d => d.id === dealerId);
      if (dealer) {
        setDealerInfo(dealer);
      }
    } catch (error) {
      console.error('Failed to load dealer info:', error);
    }
  }, [dealerId]);

  const loadAssignedProducts = useCallback(async () => {
    if (!dealerId) return;
    
    try {
      const response = await axios.get(`/api/products?dealer_id=${dealerId}`);
      setAssignedProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load assigned products:', error);
      setAssignedProducts([]);
    }
  }, [dealerId]);

  const loadRecentOrders = useCallback(async () => {
    if (!dealerId) return;
    
    try {
      // Get all dealer orders and filter for recent ones
      const response = await axios.get('/api/orders');
      // Filter for dealer orders (Daily Demand) using order_type, not warehouse_id
      const dealerOrders = (response.data || []).filter(order => 
        order.dealer_id === dealerId && (order.order_type === 'DD' || order.order_type_name === 'DD')
      );
      
      // Load item_count for each order
      const ordersWithCounts = await Promise.all(
        dealerOrders.map(async (order) => {
          try {
            const orderDetailResponse = await axios.get(`/api/orders/${order.order_id}`);
            return {
              ...order,
              item_count: orderDetailResponse.data.items?.length || 0
            };
          } catch (error) {
            console.error(`Error loading order ${order.order_id}:`, error);
            return {
              ...order,
              item_count: 0
            };
          }
        })
      );
      
      // Sort by order_date descending (business date, not database timestamp)
      const sortedOrders = ordersWithCounts
        .sort((a, b) => {
          const dateA = a.order_date ? new Date(a.order_date) : new Date(0);
          const dateB = b.order_date ? new Date(b.order_date) : new Date(0);
          return dateB - dateA; // Descending order
        })
        .slice(0, 5);
      setRecentOrders(sortedOrders);
    } catch (error) {
      console.error('Failed to load recent orders:', error);
      setRecentOrders([]);
    }
  }, [dealerId]);

  useEffect(() => {
    if (dealerId) {
      setLoading(true);
      Promise.all([
        loadDealerInfo(),
        loadAssignedProducts(),
        loadRecentOrders()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [dealerId, loadDealerInfo, loadAssignedProducts, loadRecentOrders]);

  const columns = [
    {
      title: 'Product Code',
      dataIndex: 'product_code',
      key: 'product_code',
      ellipsis: true,
      sorter: (a, b) => ((a.product_code || '') + '').localeCompare((b.product_code || '') + ''),
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: {
        showTitle: true,
      },
      sorter: (a, b) => ((a.name || '') + '').localeCompare((b.name || '') + ''),
    },
  ];

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
    },
    {
      title: 'Date',
      dataIndex: 'order_date',
      key: 'order_date',
      ellipsis: true,
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : 'N/A',
    },
    {
      title: 'Items',
      dataIndex: 'item_count',
      key: 'item_count',
      align: 'right',
      ellipsis: true,
      render: (count) => (
        <Tag color="green" style={STANDARD_TAG_STYLE}>
          {count || 0}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size={STANDARD_SPIN_SIZE} />
      </div>
    );
  }

  return (
    <div>
      <Title {...STANDARD_PAGE_TITLE_CONFIG}><DashboardOutlined /> Welcome, {userName}!</Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        {dealerInfo && (
          <>
            Dealer: <Text strong>{dealerInfo.name}</Text>
            {territoryName && (
              <> | Territory: <Text strong>{territoryName}</Text></>
            )}
          </>
        )}
      </Text>
      <Space direction="vertical" style={{ width: '100%' }} size={STANDARD_SPACE_SIZE_LARGE}>

        <Alert
          {...STANDARD_ALERT_CONFIG}
          message={<span style={{ color: 'white', fontSize: '14px' }}>{`Your dashboard overview for ${dayjs().format('MMMM D, YYYY')}`}</span>}
          type="info"
          icon={<InfoCircleOutlined style={{ color: 'white', fontSize: '16px' }} />}
          style={{
            ...STANDARD_ALERT_CONFIG.style,
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            border: 'none',
          }}
        />

        <Row gutter={STANDARD_ROW_GUTTER}>
          <Col xs={24} sm={8}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                height: '100%',
              }}
              bodyStyle={{ padding: '12px' }}
            >
              <Statistic
                {...STANDARD_STATISTIC_CONFIG}
                title={<span style={{ color: 'white' }}>Assigned Products</span>}
                value={assignedProducts.length}
                prefix={<CheckCircleOutlined />}
                suffix="items"
                valueStyle={{ ...STANDARD_STATISTIC_CONFIG.valueStyle, color: 'white' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                height: '100%',
              }}
              bodyStyle={{ padding: '12px' }}
            >
              <Statistic
                {...STANDARD_STATISTIC_CONFIG}
                title={<span style={{ color: 'white' }}>Today&apos;s Orders</span>}
                value={recentOrders.length}
                prefix={<ShoppingCartOutlined />}
                suffix="orders"
                valueStyle={{ ...STANDARD_STATISTIC_CONFIG.valueStyle, color: 'white' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                height: '100%',
              }}
              bodyStyle={{ padding: '12px' }}
            >
              <Statistic
                {...STANDARD_STATISTIC_CONFIG}
                title={<span style={{ color: 'white' }}>Monthly Forecasts</span>}
                value={0}
                prefix={<CalendarOutlined />}
                suffix="submitted"
                valueStyle={{ ...STANDARD_STATISTIC_CONFIG.valueStyle, color: 'white' }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Assigned Products" {...TABLE_CARD_CONFIG}>
          {assignedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <InfoCircleOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
              <Title level={5} type="secondary">
                No products assigned
              </Title>
              <Text type="secondary">
                Contact your sales manager for product assignments
              </Text>
            </div>
          ) : (
            <Table
              dataSource={assignedProducts}
              columns={columns}
              rowKey="product_id"
              pagination={getStandardPaginationConfig('products', 20)}
              size="small"
            />
          )}
        </Card>

        <Card title="Recent Orders" {...TABLE_CARD_CONFIG}>
          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <ShoppingCartOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
              <Title level={5} type="secondary">
                No orders today
              </Title>
              <Text type="secondary">
                Create daily demand orders to see them here
              </Text>
            </div>
          ) : (
            <Table
              dataSource={recentOrders}
              columns={orderColumns}
              rowKey="order_id"
              pagination={false}
              size="small"
            />
          )}
        </Card>
      </Space>
    </div>
  );
}

export default DealerDashboard;

