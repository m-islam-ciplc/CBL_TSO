import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Badge, Row, Col, Card, Statistic } from 'antd';
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

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function AppContent() {
  const [stats, setStats] = useState({
    dealers: 0,
    warehouses: 0,
    products: 0,
    orders: 0,
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
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
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        style={{
          background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)',
          color: 'white',
        }}
      >
        <div style={{
          padding: collapsed ? '16px 8px' : '24px 16px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
        }}>
          <Title level={collapsed ? 5 : 4} style={{ color: 'white', margin: 0 }}>
            {!collapsed && 'CBL Sales Order'}
          </Title>
          {collapsed && <div style={{ color: 'rgba(255,255,255,0.7)' }}>CBL</div>}
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{
            background: 'transparent',
            border: 'none',
          }}
        />

        {/* Statistics Section */}
        <div style={{
          padding: collapsed ? '8px' : '16px',
          borderTop: '1px solid rgba(255,255,255,0.2)',
        }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <UserOutlined style={{ color: 'rgba(255,255,255,0.7)', marginRight: '8px' }} />
              {!collapsed && <span style={{ color: 'white', fontSize: '12px' }}>DEALERS</span>}
            </div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
              {stats.dealers}
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <ShopOutlined style={{ color: 'rgba(255,255,255,0.7)', marginRight: '8px' }} />
              {!collapsed && <span style={{ color: 'white', fontSize: '12px' }}>WAREHOUSES</span>}
            </div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
              {stats.warehouses}
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <AppstoreOutlined style={{ color: 'rgba(255,255,255,0.7)', marginRight: '8px' }} />
              {!collapsed && <span style={{ color: 'white', fontSize: '12px' }}>PRODUCTS</span>}
            </div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
              {stats.products}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <ShoppingCartOutlined style={{ color: 'rgba(255,255,255,0.7)', marginRight: '8px' }} />
              {!collapsed && <span style={{ color: 'white', fontSize: '12px' }}>ORDERS</span>}
            </div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
              {stats.orders}
            </div>
          </div>
        </div>
      </Sider>

      <Layout>
        <Content style={{ margin: '16px', padding: '16px', background: '#fff' }}>
          <Routes>
            <Route path="/" element={<Dashboard setStats={setStats} />} />
            <Route path="/dashboard" element={<Dashboard setStats={setStats} />} />
            <Route path="/new-orders" element={<NewOrders onOrderCreated={refreshOrders} />} />
            <Route path="/placed-orders" element={<PlacedOrders refreshTrigger={refreshTrigger} />} />
            <Route path="/dealer-management" element={<DealerManagement />} />
          </Routes>
        </Content>
      </Layout>
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
