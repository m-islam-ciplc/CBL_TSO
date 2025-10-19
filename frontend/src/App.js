import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { Layout, Menu, Typography, Badge, Row, Col, Card, Statistic, Space, Button, Switch } from 'antd';
import {
  DashboardOutlined,
  PlusOutlined,
  OrderedListOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  CheckOutlined,
  FileExcelOutlined,
  TruckOutlined,
  TabletOutlined,
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import NewOrdersTablet from './pages/NewOrdersTablet';
import ReviewOrdersTablet from './pages/ReviewOrdersTablet';
import PlacedOrders from './pages/PlacedOrders';
import DealerManagement from './pages/DealerManagement';
import ProductManagement from './pages/ProductManagement';
import TransportManagement from './pages/TransportManagement';
import DailyReport from './pages/DailyReport';
import TSODashboard from './pages/TSODashboard';

const { Header, Content } = Layout;
const { Title } = Typography;

function AppContent() {
  const { userRole, userName, isTabletMode, setIsTabletMode, switchToAdmin, switchToTSO, isAdmin, isTSO } = useUser();
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

  const menuItems = isTSO ? [
    {
      key: 'new-orders',
      icon: <PlusOutlined />,
      label: 'New Orders',
    },
    {
      key: 'review-orders',
      icon: <CheckOutlined />,
      label: 'Review Orders',
    },
  ] : [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
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
    {
      key: 'transport-management',
      icon: <TruckOutlined />,
      label: 'Transport Management',
    },
    {
      key: 'daily-report',
      icon: <FileExcelOutlined />,
      label: 'Daily Report',
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

        {/* User Role and Mode Toggle */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '8px 12px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          marginLeft: '16px'
        }}>
          <TabletOutlined style={{ color: 'white', fontSize: '16px' }} />
          <span style={{ color: 'white', fontSize: '12px' }}>{userRole.toUpperCase()} Mode</span>
          <Switch
            size="small"
            checked={isTabletMode}
            onChange={(checked) => {
              setIsTabletMode(checked);
              if (checked) {
                switchToTSO();
              } else {
                switchToAdmin();
              }
            }}
            style={{ backgroundColor: isTabletMode ? '#52c41a' : '#d9d9d9' }}
          />
        </div>
      </Header>

      <Content style={{ 
        padding: '24px', 
        background: '#f0f2f5',
        minHeight: 'calc(100vh - 64px)',
      }}>
        <Routes>
          <Route path="/" element={
            isTSO ? 
            <NewOrdersTablet onOrderCreated={refreshOrders} /> : 
            <Dashboard setStats={setStats} />
          } />
          <Route path="/dashboard" element={
            isTSO ? 
            <NewOrdersTablet onOrderCreated={refreshOrders} /> : 
            <Dashboard setStats={setStats} />
          } />
          <Route path="/new-orders" element={<NewOrdersTablet onOrderCreated={refreshOrders} />} />
          <Route path="/review-orders" element={<ReviewOrdersTablet onOrderCreated={refreshOrders} />} />
          <Route path="/placed-orders" element={
            isTSO ? 
            <NewOrdersTablet onOrderCreated={refreshOrders} /> : 
            <PlacedOrders refreshTrigger={refreshTrigger} />
          } />
          <Route path="/dealer-management" element={
            isTSO ? 
            <NewOrdersTablet onOrderCreated={refreshOrders} /> : 
            <DealerManagement />
          } />
          <Route path="/product-management" element={
            isTSO ? 
            <NewOrdersTablet onOrderCreated={refreshOrders} /> : 
            <ProductManagement />
          } />
          <Route path="/transport-management" element={
            isTSO ? 
            <NewOrdersTablet onOrderCreated={refreshOrders} /> : 
            <TransportManagement />
          } />
          <Route path="/daily-report" element={
            isTSO ? 
            <NewOrdersTablet onOrderCreated={refreshOrders} /> : 
            <DailyReport />
          } />
        </Routes>
      </Content>
    </Layout>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;
