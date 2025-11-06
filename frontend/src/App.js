import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { Layout, Menu, Typography, Button } from 'antd';
import './App.css';
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
  TeamOutlined,
  BarChartOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewOrdersTablet from './pages/NewOrdersTablet';
import ReviewOrdersTablet from './pages/ReviewOrdersTablet';
import PlacedOrders from './pages/PlacedOrders';
import DealerManagement from './pages/DealerManagement';
import ProductManagement from './pages/ProductManagement';
import TransportManagement from './pages/TransportManagement';
import DailyReport from './pages/DailyReport';
import TSODashboard from './pages/TSODashboard';
import UserManagement from './pages/UserManagement';
import ProductQuotaManagement from './pages/ProductQuotaManagement';

const { Header, Content } = Layout;
const { Title } = Typography;

function AppContent() {
  const { userRole, isTSO, setUserRole, setUserName } = useUser();
  const [stats, setStats] = useState({
    dealers: 0,
    warehouses: 0,
    products: 0,
    orders: 0,
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    if (!savedUser && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [navigate, location.pathname]);

  const refreshOrders = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    
    // Clear form data
    sessionStorage.removeItem('tsoFormData');
    sessionStorage.removeItem('tsoOrderItems');
    
    // Clear user context
    setUserRole(null);
    setUserName(null);
    
    // Navigate to login
    navigate('/login');
  };

  const handleMenuClick = (e) => {
    navigate(`/${e.key}`);
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path === '/new-orders') return 'new-orders';
    if (path === '/review-orders') return 'review-orders';
    if (path === '/placed-orders') return 'placed-orders';
    if (path === '/manage-dealers') return 'manage-dealers';
    if (path === '/manage-products') return 'manage-products';
    if (path === '/manage-transports') return 'manage-transports';
    if (path === '/manage-quotas') return 'manage-quotas';
    if (path === '/user-management') return 'user-management';
    if (path === '/daily-report') return 'daily-report';
    return 'dashboard';
  };

  const menuItems = isTSO ? [
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
      key: 'review-orders',
      icon: <CheckOutlined />,
      label: 'Review Orders',
    },
    {
      key: 'placed-orders',
      icon: <OrderedListOutlined />,
      label: 'Placed Orders',
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
      key: 'manage-dealers',
      icon: <UserOutlined />,
      label: 'Manage Dealers',
    },
    {
      key: 'manage-products',
      icon: <ShoppingCartOutlined />,
      label: 'Manage Products',
    },
    {
      key: 'manage-transports',
      icon: <TruckOutlined />,
      label: 'Manage Transports',
    },
    ...(userRole === 'admin' ? [{
      key: 'user-management',
      icon: <TeamOutlined />,
      label: 'Manage Users',
    },
    {
      key: 'manage-quotas',
      icon: <BarChartOutlined />,
      label: 'Manage Quotas',
    }] : []),
    {
      key: 'daily-report',
      icon: <FileExcelOutlined />,
      label: 'Daily Report',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {userRole && (
        <Header style={{
          height: '40px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo and Title */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Title level={4} style={{ color: 'white', margin: 0, marginRight: '24px' }} className="header-logo">
              CBL SO
            </Title>
          </div>

          {/* Navigation Menu */}
          <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[getSelectedKey()]}
              onClick={handleMenuClick}
              items={menuItems}
              style={{
                background: 'transparent',
                border: 'none',
                width: '100%',
                justifyContent: 'center',
              }}
              overflowedIndicator={null}
            />
          </div>

          {/* User Role Display and Logout */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginLeft: '16px'
          }} className="header-logout">
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ 
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '4px'
              }}
            >
              {userRole === 'admin' ? 'Admin Logout' : userRole === 'tso' ? 'TSO Logout' : `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Logout`}
            </Button>
          </div>
        </Header>
      )}

      <Content style={{ 
        padding: userRole ? '12px' : '0', 
        background: '#f0f2f5',
        minHeight: userRole ? 'calc(100vh - 40px)' : '100vh',
      }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            isTSO ? 
            <TSODashboard /> : 
            <Dashboard setStats={setStats} />
          } />
          <Route path="/dashboard" element={
            isTSO ? 
            <TSODashboard /> : 
            <Dashboard setStats={setStats} />
          } />
          <Route path="/new-orders" element={<NewOrdersTablet onOrderCreated={refreshOrders} />} />
          <Route path="/review-orders" element={<ReviewOrdersTablet onOrderCreated={refreshOrders} />} />
          <Route path="/placed-orders" element={<PlacedOrders refreshTrigger={refreshTrigger} />} />
          <Route path="/manage-dealers" element={
            isTSO ? 
            <NewOrdersTablet onOrderCreated={refreshOrders} /> : 
            <DealerManagement />
          } />
          <Route path="/manage-products" element={
            isTSO ? 
            <NewOrdersTablet onOrderCreated={refreshOrders} /> : 
            <ProductManagement />
          } />
          <Route path="/manage-transports" element={
            isTSO ? 
            <NewOrdersTablet onOrderCreated={refreshOrders} /> : 
            <TransportManagement />
          } />
          <Route path="/daily-report" element={
            isTSO ? 
            <NewOrdersTablet onOrderCreated={refreshOrders} /> : 
            <DailyReport />
          } />
          <Route path="/user-management" element={
            userRole === 'admin' ? 
            <UserManagement /> : 
            <Dashboard setStats={setStats} />
          } />
          <Route path="/manage-quotas" element={
            userRole === 'admin' ? 
            <ProductQuotaManagement /> : 
            <Dashboard setStats={setStats} />
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
