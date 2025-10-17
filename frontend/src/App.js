import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Badge, Row, Col, Card, Statistic, Space } from 'antd';
import {
  DashboardOutlined,
  PlusOutlined,
  OrderedListOutlined,
  UserOutlined,
  ShopOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import NewOrders from './pages/NewOrders';
import PlacedOrders from './pages/PlacedOrders';
import DealerManagement from './pages/DealerManagement';
import ProductManagement from './pages/ProductManagement';

const { Header, Content } = Layout;
const { Title } = Typography;

function AppContent() {
  const [stats, setStats] = useState({
    dealers: 0,
    warehouses: 0,
    products: 0,
    orders: 0,
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const refreshOrders = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleMenuClick = (e) => {
    navigate(`/${e.key}`);
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path === '/new-orders') return 'new-orders';
    if (path === '/placed-orders') return 'placed-orders';
    if (path === '/dealer-management') return 'dealer-management';
    return 'dashboard';
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'new-orders',
      icon: <PlusOutlined />,
      label: 'New Orders',
    },
    {
      key: 'placed-orders',
      icon: <OrderedListOutlined />,
      label: 'Placed Orders',
    },
    {
      key: 'dealer-management',
      icon: <UserOutlined />,
      label: 'Dealer Management',
    },
    {
      key: 'product-management',
      icon: <ShoppingCartOutlined />,
      label: 'Product Management',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        background: 'linear-gradient(90deg, #2c3e50 0%, #34495e 100%)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
      }}>
        {/* Logo and Title */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={4} style={{ color: 'white', margin: 0, marginRight: '24px' }}>
            CBL Sales Order
          </Title>
        </div>

        {/* Navigation Menu */}
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{
            background: 'transparent',
            border: 'none',
            flex: 1,
            justifyContent: 'center',
          }}
        />

        {/* Statistics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Space size="small">
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>DEALERS</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{stats.dealers}</div>
            </div>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>WAREHOUSES</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{stats.warehouses}</div>
            </div>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>PRODUCTS</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{stats.products}</div>
            </div>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>ORDERS</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{stats.orders}</div>
            </div>
          </Space>
        </div>
      </Header>

      <Content style={{ 
        padding: '24px', 
        background: '#f0f2f5',
        minHeight: 'calc(100vh - 64px)',
      }}>
        <Routes>
          <Route path="/" element={<Dashboard setStats={setStats} />} />
          <Route path="/dashboard" element={<Dashboard setStats={setStats} />} />
          <Route path="/new-orders" element={<NewOrders onOrderCreated={refreshOrders} />} />
          <Route path="/placed-orders" element={<PlacedOrders refreshTrigger={refreshTrigger} />} />
          <Route path="/dealer-management" element={<DealerManagement />} />
          <Route path="/product-management" element={<ProductManagement />} />
        </Routes>
      </Content>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
