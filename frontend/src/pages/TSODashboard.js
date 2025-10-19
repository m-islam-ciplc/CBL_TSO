import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Space,
  Statistic,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  OrderedListOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  TabletOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

function TSODashboard({ setStats }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState({
    dealers: 0,
    products: 0,
    orders: 0,
    warehouses: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [dealersRes, productsRes, ordersRes, warehousesRes] = await Promise.all([
        axios.get('/api/dealers'),
        axios.get('/api/products'),
        axios.get('/api/orders'),
        axios.get('/api/warehouses')
      ]);

      const stats = {
        dealers: dealersRes.data.length,
        products: productsRes.data.length,
        orders: ordersRes.data.length,
        warehouses: warehousesRes.data.length,
      };

      setQuickStats(stats);
      setStats(stats);
      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  const quickActions = [
    {
      key: 'new-order',
      title: 'Create New Order',
      description: 'Start creating a sales order',
      icon: <PlusOutlined style={{ fontSize: '32px' }} />,
      color: '#52c41a',
      action: () => navigate('/new-orders-tablet'),
      badge: null,
    },
  ];

  return (
    <div style={{ padding: '16px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '12px',
          backgroundColor: 'white',
          padding: '16px 24px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '16px'
        }}>
          <TabletOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            TSO Dashboard
          </Title>
        </div>
        <Text type="secondary" style={{ fontSize: '16px', display: 'block' }}>
          Territory Sales Officer - Touch Optimized Interface
        </Text>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
            <Statistic
              title="Total Dealers"
              value={quickStats.dealers}
              prefix={<span style={{ color: '#1890ff' }}>👥</span>}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
            <Statistic
              title="Products"
              value={quickStats.products}
              prefix={<span style={{ color: '#52c41a' }}>📦</span>}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
            <Statistic
              title="Orders"
              value={quickStats.orders}
              prefix={<span style={{ color: '#fa8c16' }}>🛒</span>}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
            <Statistic
              title="Warehouses"
              value={quickStats.warehouses}
              prefix={<span style={{ color: '#722ed1' }}>🏪</span>}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>
            🚀 Ready to Create Orders
          </Title>
          {quickActions.map((action) => (
            <Card
              key={action.key}
              hoverable
              onClick={action.action}
              style={{
                borderRadius: '20px',
                border: '3px solid #52c41a',
                transition: 'all 0.3s',
                cursor: 'pointer',
                height: '250px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                backgroundColor: '#f6ffed',
              }}
              bodyStyle={{ padding: '32px' }}
            >
              <div style={{ 
                color: action.color, 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {action.icon}
              </div>
              <Title level={3} style={{ margin: '0 0 12px 0', color: '#333' }}>
                {action.title}
              </Title>
              <Text type="secondary" style={{ fontSize: '16px', marginBottom: '20px' }}>
                {action.description}
              </Text>
              <div style={{ 
                fontSize: '14px', 
                color: '#52c41a', 
                fontWeight: 'bold',
                backgroundColor: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '2px solid #52c41a'
              }}>
                Tap to Start
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* TSO Tips */}
      <Card style={{ borderRadius: '12px', marginTop: '24px' }}>
        <Title level={4} style={{ textAlign: 'center', marginBottom: '16px' }}>
          💡 TSO Tips
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Touch Friendly</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                All buttons and controls are optimized for tablet touch
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Quick Access</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Most common actions are easily accessible from the dashboard
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Portrait/Landscape</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Works great in both portrait and landscape orientations
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default TSODashboard;
