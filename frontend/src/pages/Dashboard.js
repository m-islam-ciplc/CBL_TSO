import { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Card, Statistic, Typography, Spin, Space, DatePicker, Radio } from 'antd';
import { useUser } from '../contexts/UserContext';
import dayjs from 'dayjs';
import {
  AppstoreOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  FileTextOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { 
  STANDARD_CARD_CONFIG,
  STANDARD_PAGE_TITLE_CONFIG, 
  STANDARD_PAGE_SUBTITLE_CONFIG, 
  STANDARD_ROW_GUTTER, 
  COMPACT_ROW_GUTTER, 
  STANDARD_RADIO_SIZE, 
  STANDARD_STATISTIC_CONFIG, 
  STANDARD_SPIN_SIZE, 
  STANDARD_DATE_PICKER_CONFIG 
} from '../templates/UITemplates';

const { Title, Text } = Typography;

// Helper function to remove M/S prefix from dealer names
const removeMSPrefix = (name) => {
  if (!name) return name;
  // Remove "M/S", "M/S.", "M/S " prefix (case insensitive, with or without space/period)
  return name.replace(/^M\/S[.\s]*/i, '').trim();
};

function Dashboard({ setStats }) {
  const { userName } = useUser();
  const [data, setData] = useState({
    orderTypes: [],
    products: [],
    orders: []
  });
  const [stats, setLocalStats] = useState({
    totalQuantity: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('today'); // 'today' or 'all'
  const [selectedDate, setSelectedDate] = useState(dayjs());

  useEffect(() => {
    loadData();
  }, [dateFilter, selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orderTypes, products] = await Promise.all([
        axios.get('/api/order-types'),
        axios.get('/api/products')
      ]);

      // Fetch orders based on date filter
      let orders;
      if (dateFilter === 'today') {
        const today = selectedDate.format('YYYY-MM-DD');
        const response = await axios.get(`/api/orders/date/${today}`);
        orders = response.data.orders || [];
      } else {
        const response = await axios.get('/api/orders');
        orders = response.data || [];
      }

      // Calculate total quantity from orders
      const totalQuantity = orders.reduce((sum, order) => sum + (parseInt(order.quantity) || 0), 0);

      // Fetch order items to calculate total value
      let totalValue = 0;
      try {
        // Fetch each order with its items to get unit_tp
        const orderPromises = orders.map(order => 
          axios.get(`/api/orders/${order.order_id}`).catch(() => ({ data: { items: [] } }))
        );
        const orderResponses = await Promise.all(orderPromises);
        
        orderResponses.forEach(response => {
          if (response.data && response.data.items && Array.isArray(response.data.items)) {
            response.data.items.forEach(item => {
              const quantity = parseInt(item.quantity) || 0;
              const unitTp = parseFloat(item.unit_tp) || 0;
              totalValue += quantity * unitTp;
            });
          }
        });
      } catch (error) {
        console.error('Error fetching order items for value calculation:', error);
      }

      const newData = {
        orderTypes: orderTypes.data,
        products: products.data,
        orders: orders
      };

      setData(newData);
      setLocalStats({
        totalQuantity,
        totalValue
      });
      setStats({
        products: products.data.length,
        orders: orders.length,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size={STANDARD_SPIN_SIZE} />
      </div>
    );
  }

  return (
    <div>
      <Title {...STANDARD_PAGE_TITLE_CONFIG}>
        <DashboardOutlined /> Welcome, {userName}!
      </Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        Overview of products, users, dealers, transports, and recent orders
      </Text>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Space>
          <Radio.Group 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            size={STANDARD_RADIO_SIZE}
          >
            <Radio.Button value="today">Today</Radio.Button>
            <Radio.Button value="all">All Orders</Radio.Button>
          </Radio.Group>
          {dateFilter === 'today' && (
            <DatePicker
              {...STANDARD_DATE_PICKER_CONFIG}
              value={selectedDate}
              onChange={(date) => setSelectedDate(date || dayjs())}
            />
          )}
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={STANDARD_ROW_GUTTER} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '8px' }}>
            <Statistic
              title={<span style={{ color: 'white' }}>Products</span>}
              value={data.products.length}
              prefix={<AppstoreOutlined />}
              valueStyle={{ ...STANDARD_STATISTIC_CONFIG.valueStyle, color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', borderRadius: '8px' }}>
            <Statistic
              {...STANDARD_STATISTIC_CONFIG}
              title={<span style={{ color: 'white' }}>Total Orders</span>}
              value={data.orders.length}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ ...STANDARD_STATISTIC_CONFIG.valueStyle, color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: '8px' }}>
            <Statistic
              {...STANDARD_STATISTIC_CONFIG}
              title={<span style={{ color: 'white' }}>Total Quantity</span>}
              value={stats.totalQuantity}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ ...STANDARD_STATISTIC_CONFIG.valueStyle, color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', color: 'white', borderRadius: '8px' }}>
            <Statistic
              {...STANDARD_STATISTIC_CONFIG}
              title={<span style={{ color: 'white' }}>Total Value</span>}
              value={stats.totalValue.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              prefix="৳"
              valueStyle={{ ...STANDARD_STATISTIC_CONFIG.valueStyle, color: 'white' }}
            />
          </Card>
        </Col>
      </Row>

      {/* System Status Cards */}
      <Row gutter={COMPACT_ROW_GUTTER} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8} md={8}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #fd7e14 0%, #ff9500 50%, #ffaa00 100%)', 
              color: 'white'
            }}
            bodyStyle={{ padding: '12px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircleOutlined style={{ fontSize: '24px', color: 'white' }} />
              <div>
                <div style={{ color: 'white' }}>
                  Backend Connected
                </div>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>
                  API server is responding correctly
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8} md={8}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #20c997 0%, #17a2b8 50%, #6f42c1 100%)', 
              color: 'white'
            }}
            bodyStyle={{ padding: '12px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <DatabaseOutlined style={{ fontSize: '24px', color: 'white' }} />
              <div>
                <div style={{ color: 'white' }}>
                  Database Connected
                </div>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>
                  {data.products.length} products, {data.orders.length} orders
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8} md={8}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #c41d7f 0%, #eb2f96 50%, #ff69b4 100%)', 
              color: 'white'
            }}
            bodyStyle={{ padding: '12px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShoppingCartOutlined style={{ fontSize: '24px', color: 'white' }} />
              <div>
                <div style={{ color: 'white' }}>
                  {data.orders.length} Orders Processed
                </div>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>
                  System operational
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Grid */}
      <Card
        {...STANDARD_CARD_CONFIG}
        title={
          <Space>
            <BarChartOutlined />
            Recent Orders
          </Space>
        }
        style={{ marginBottom: '24px' }}
      >
        {data.orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <ShoppingCartOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
            <Title level={5} type="secondary">
              No orders yet
            </Title>
            <Text type="secondary">
              Create your first order to get started
            </Text>
          </div>
        ) : (
          <Row gutter={STANDARD_ROW_GUTTER} className="order-cards-row">
            {data.orders.slice(0, 10).map(order => (
              <Col 
                xs={24} 
                sm={12} 
                md={12}
                key={order.id}
                className="order-card-col"
              >
                <Card
                  size="small"
                  style={{
                    height: '100%',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                  }}
                  bodyStyle={{ padding: '12px' }}
                >
                  <div style={{ marginBottom: '8px' }}>
                    <Space>
                      <FileTextOutlined style={{ color: '#1890ff' }} />
                      <Text strong style={{ fontSize: '14px' }}>
                        {order.order_id}
                      </Text>
                    </Space>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Dealer:{' '}
                    </Text>
                    <Text style={{ fontSize: '13px' }}>
                      {removeMSPrefix(order.dealer_name) || 'N/A'}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {order.item_count > 1 
                        ? `${order.item_count} items • Total Qty: ${order.quantity || 0}` 
                        : `${order.product_name || 'N/A'} • Qty: ${order.quantity || 0}`}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>
    </div>
  );
}

export default Dashboard;
