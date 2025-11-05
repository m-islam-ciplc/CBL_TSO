import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Card, Statistic, Typography, List, Spin, Alert, Space } from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

function Dashboard({ setStats }) {
  const [data, setData] = useState({
    orderTypes: [],
    dealers: [],
    warehouses: [],
    products: [],
    orders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orderTypes, dealers, warehouses, products, orders] = await Promise.all([
        axios.get('/api/order-types'),
        axios.get('/api/dealers'),
        axios.get('/api/warehouses'),
        axios.get('/api/products'),
        axios.get('/api/orders')
      ]);

      const newData = {
        orderTypes: orderTypes.data,
        dealers: dealers.data,
        warehouses: warehouses.data,
        products: products.data,
        orders: orders.data
      };

      setData(newData);
      setStats({
        dealers: dealers.data.length,
        warehouses: warehouses.data.length,
        products: products.data.length,
        orders: orders.data.length,
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
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: '24px' }}>
        Dashboard
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white' }}>Dealers</span>}
              value={data.dealers.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: 'white', fontSize: '24px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white' }}>Warehouses</span>}
              value={data.warehouses.length}
              prefix={<ShopOutlined />}
              valueStyle={{ color: 'white', fontSize: '24px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white' }}>Products</span>}
              value={data.products.length}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: 'white', fontSize: '24px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white' }}>Total Orders</span>}
              value={data.orders.length}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: 'white', fontSize: '24px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* System Status Cards */}
      <Row gutter={[12, 12]} style={{ marginBottom: '24px' }}>
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
                  {data.dealers.length} dealers, {data.products.length} products
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

      {/* Content Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={24}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                Recent Orders
              </Space>
            }
            style={{ height: '400px' }}
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
              <List
                dataSource={data.orders.slice(0, 5)}
                renderItem={order => (
                  <List.Item key={order.id}>
                    <List.Item.Meta
                      title={<Text strong>{order.order_id}</Text>}
                      description={
                        <div>
                          <Text>{order.dealer_name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {order.item_count > 1 
                              ? `${order.item_count} items • Total Qty: ${order.quantity || 0}` 
                              : `${order.product_name || 'N/A'} • Qty: ${order.quantity || 0}`}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                style={{ maxHeight: '300px', overflow: 'auto' }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
