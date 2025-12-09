import { useState, useEffect } from 'react';
import { Tabs, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import DealerManagement from './DealerManagement';
import ProductManagement from './ProductManagement';
import TransportManagement from './TransportManagement';
import AdminSettings from './AdminSettings';
import UserManagement from './UserManagement';
import { useUser } from '../contexts/UserContext';
import { 
  STANDARD_PAGE_TITLE_CONFIG, 
  STANDARD_PAGE_SUBTITLE_CONFIG 
} from '../templates/UITemplates';

const { Title, Text } = Typography;

function Settings() {
  const { userRole } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dealers');

  // Handle legacy routes - redirect to /settings with appropriate tab
  useEffect(() => {
    const path = location.pathname;
    if (path === '/manage-dealers') {
      navigate('/settings?tab=dealers', { replace: true });
      setActiveTab('dealers');
    } else if (path === '/manage-products') {
      navigate('/settings?tab=products', { replace: true });
      setActiveTab('products');
    } else if (path === '/manage-transports') {
      navigate('/settings?tab=transports', { replace: true });
      setActiveTab('transports');
    } else if (path === '/admin-settings') {
      navigate('/settings?tab=admin-settings', { replace: true });
      setActiveTab('admin-settings');
    } else if (path === '/user-management') {
      navigate('/settings?tab=users', { replace: true });
      setActiveTab('users');
    } else {
      // Check URL params for tab
      // eslint-disable-next-line no-undef
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');
      if (tab && ['users', 'dealers', 'products', 'transports', 'admin-settings'].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [location.pathname, location.search, navigate]);

  return (
    <div>
      <Title {...STANDARD_PAGE_TITLE_CONFIG}>
        <SettingOutlined /> Settings
      </Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        Manage users, dealers, products, transports, and application settings
      </Text>

      <Tabs 
        activeKey={activeTab} 
        onChange={(key) => {
          setActiveTab(key);
          navigate(`/settings?tab=${key}`, { replace: true });
        }}
      >
        {userRole === 'admin' && (
          <Tabs.TabPane
            tab={
              <span>
                <TeamOutlined />
                Manage Users
              </span>
            }
            key="users"
          >
            <UserManagement />
          </Tabs.TabPane>
        )}

        <Tabs.TabPane
          tab={
            <span>
              <UserOutlined />
              Manage Dealers
            </span>
          }
          key="dealers"
        >
          <DealerManagement />
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <ShoppingCartOutlined />
              Manage Products
            </span>
          }
          key="products"
        >
          <ProductManagement />
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <TruckOutlined />
              Manage Transports
            </span>
          }
          key="transports"
        >
          <TransportManagement />
        </Tabs.TabPane>

        {userRole === 'admin' && (
          <Tabs.TabPane
            tab={
              <span>
                <SettingOutlined />
                Admin Settings
              </span>
            }
            key="admin-settings"
          >
            <AdminSettings />
          </Tabs.TabPane>
        )}
      </Tabs>
    </div>
  );
}

export default Settings;

