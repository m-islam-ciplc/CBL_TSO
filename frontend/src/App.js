import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { Layout, Typography, Button, Drawer, Alert, Dropdown } from 'antd';
import './App.css';
import {
  DashboardOutlined,
  PlusOutlined,
  OrderedListOutlined,
  ShoppingCartOutlined,
  CheckOutlined,
  FileExcelOutlined,
  BarChartOutlined,
  LogoutOutlined,
  MoreOutlined,
  CalendarOutlined,
  SettingOutlined,
  ExperimentOutlined,
  TableOutlined,
  DownOutlined,
  PlayCircleOutlined,
  LayoutOutlined,
} from '@ant-design/icons';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewOrdersTablet from './pages/NewOrdersTablet';
import ReviewOrdersTablet from './pages/ReviewOrdersTablet';
import PlacedOrders from './pages/PlacedOrders';
import Settings from './pages/Settings';
import DailyReport from './pages/DailyReport';
import TSOReport from './pages/TSOReport';
import TSODashboard from './pages/TSODashboard';
import DealerDashboard from './pages/DealerDashboard';
import ProductQuotaManagement from './pages/ProductQuotaManagement';
import MonthlyForecastTab from './pages/MonthlyForecastTab';
import DailyDemandMultiDay from './pages/DailyDemandMultiDay';
import DealerReports from './pages/DealerReports';
import DebugPanel from './components/DebugPanel';
import UnifiedUITemplate from './pages/examples/UnifiedUITemplate';
import WorkflowTests from './pages/examples/WorkflowTests';

const { Header, Content } = Layout;
const { Title } = Typography;

function AppContent() {
  const { userRole, isTSO, isDealer, isAdmin, isSalesManager, setUserRole, setUserName } = useUser();
  const [, setStats] = useState({
    dealers: 0,
    warehouses: 0,
    products: 0,
    orders: 0,
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOverflow, setMenuOverflow] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(200);
  const [visibleMenuItems, setVisibleMenuItems] = useState([]); // Keys of items that fit in menu bar
  const [hiddenMenuItems, setHiddenMenuItems] = useState([]); // Keys of items that don't fit
  const menuBarRef = useRef(null);
  const menuContainerRef = useRef(null);
  const menuItemsRef = useRef([]); // Store menuItems for access in callback
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to login if not authenticated (except for demo pages and login page)
  useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    const isTemplatePage = location.pathname.startsWith('/template-');
    const isExamplePage = location.pathname.startsWith('/example-');
    const isDemoPage = location.pathname.startsWith('/demo-');
    const isLoginPage = location.pathname === '/login';
    
    if (!savedUser && !isLoginPage && !isTemplatePage && !isExamplePage && !isDemoPage) {
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

  const handleMenuClick = (key) => {
    navigate(`/${key}`);
    setDrawerOpen(false); // Close drawer after navigation
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path === '/new-orders') return 'new-orders';
    if (path === '/review-orders') return 'review-orders';
    if (path === '/placed-orders') return 'placed-orders';
    if (path === '/settings' || path === '/manage-dealers' || path === '/manage-products' || path === '/manage-transports' || path === '/admin-settings' || path === '/user-management') return 'settings';
    if (path === '/manage-quotas') return 'manage-quotas';
    if (path === '/reports') return 'reports';
    if (path === '/tso-report') return 'tso-report';
    if (path === '/monthly-forecast') return 'monthly-forecast';
    if (path === '/daily-demand') return 'daily-demand';
    if (path === '/my-reports') return 'my-reports';
    return 'dashboard';
  };

  // Dynamic overflow detection for menu bar - determines which items fit
  const checkMenuOverflow = useCallback(() => {
    if (!menuBarRef.current || !menuContainerRef.current) {
      return;
    }

    const container = menuContainerRef.current;
    
    // Get container width (available space)
    const containerWidth = container.offsetWidth;
    
    if (containerWidth === 0 || containerWidth < 100) {
      return; // Container not ready yet
    }
    
    // Get all menu items from ref (all items, not filtered)
    const allMenuItems = menuItemsRef.current;
    if (allMenuItems.length === 0) {
      return; // Menu items not available yet
    }
    
    // Estimate ellipsis button width (ellipsis icon only)
    // This is approximate: icon (~14px) + padding (~16px) ≈ 30px
    const ellipsisButtonWidth = 30;
    
    // Always reserve space for ellipsis button - we'll check if we need it
    const availableWidth = containerWidth - 10 - ellipsisButtonWidth;
    
    // Create a temporary container to measure ALL menu items accurately
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.display = 'flex';
    tempContainer.className = 'custom-menu-bar';
    tempContainer.style.width = 'auto';
    document.body.appendChild(tempContainer);
    
    // Create temporary menu items for measurement - clone actual rendered structure
    allMenuItems.forEach(item => {
      const tempItem = document.createElement('div');
      tempItem.className = 'custom-menu-item';
      tempItem.setAttribute('data-menu-key', item.key);
      
      // Apply all styles that affect width
      tempItem.style.display = 'inline-flex';
      tempItem.style.alignItems = 'center';
      tempItem.style.padding = '0 8px';
      tempItem.style.height = '40px';
      tempItem.style.lineHeight = '40px';
      tempItem.style.whiteSpace = 'nowrap';
      tempItem.style.fontSize = '14px';
      tempItem.style.flexShrink = '0';
      
      // Create icon span with React icon (clone the actual icon element)
      const iconSpan = document.createElement('span');
      iconSpan.className = 'custom-menu-icon';
      iconSpan.style.marginRight = '4px';
      iconSpan.style.display = 'inline-flex';
      iconSpan.style.alignItems = 'center';
      // Use actual icon width - Ant Design icons are typically 14px
      iconSpan.style.width = '14px';
      iconSpan.style.height = '14px';
      
      // Create label span
      const labelSpan = document.createElement('span');
      labelSpan.className = 'custom-menu-label';
      labelSpan.textContent = item.label;
      labelSpan.style.fontSize = '14px';
      
      tempItem.appendChild(iconSpan);
      tempItem.appendChild(labelSpan);
      tempContainer.appendChild(tempItem);
    });
    
    // Force reflow to measure
    void tempContainer.offsetWidth;
    
    // Measure each menu item to see which ones fit
    const items = Array.from(tempContainer.querySelectorAll('.custom-menu-item'));
    const visibleItemKeys = [];
    const hiddenItemKeys = [];
    let accumulatedWidth = 0;
    
    items.forEach((itemElement) => {
      const itemRect = itemElement.getBoundingClientRect();
      const itemWidth = itemRect.width;
      const itemKey = itemElement.getAttribute('data-menu-key');
      
      if (!itemKey) return;
      
      // Check if this item fits (with ellipsis button space reserved)
      if (accumulatedWidth + itemWidth <= availableWidth) {
        visibleItemKeys.push(itemKey);
        accumulatedWidth += itemWidth;
      } else {
        hiddenItemKeys.push(itemKey);
      }
    });
    
    // Clean up temp container
    document.body.removeChild(tempContainer);
    
    // Check if there's overflow
    const hasOverflow = hiddenItemKeys.length > 0;
    
    // Update states - store keys, we'll filter menuItems in render
    setMenuOverflow(hasOverflow);
    setVisibleMenuItems(visibleItemKeys);
    setHiddenMenuItems(hiddenItemKeys);
  }, [isTSO, isDealer, userRole]);

  // Check overflow on mount, resize, and when menu items change
  useEffect(() => {
    if (!userRole) return;
    
    // Initial check with delays to ensure DOM is ready
    const timeouts = [
      setTimeout(() => checkMenuOverflow(), 200),
      setTimeout(() => checkMenuOverflow(), 500),
      setTimeout(() => checkMenuOverflow(), 1000),
    ];

    // Set up resize observer and window resize listener
    // eslint-disable-next-line no-undef
    const resizeObserver = new ResizeObserver(() => {
      // eslint-disable-next-line no-undef
      requestAnimationFrame(() => {
        checkMenuOverflow();
      });
    });

    if (menuContainerRef.current) {
      resizeObserver.observe(menuContainerRef.current);
    }

    const handleResize = () => {
      let timeoutId;
      const check = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          // eslint-disable-next-line no-undef
          requestAnimationFrame(() => {
            checkMenuOverflow();
          });
        }, 150);
      };
      check();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      timeouts.forEach(clearTimeout);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [userRole, isTSO, isDealer, checkMenuOverflow]);

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
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Daily Demands',
    },
    {
      key: 'tso-report',
      icon: <FileExcelOutlined />,
      label: 'My Reports',
    },
  ] : isDealer ? [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'monthly-forecast',
      icon: <CalendarOutlined />,
      label: 'Monthly Forecast',
    },
    {
      key: 'daily-demand',
      icon: <ShoppingCartOutlined />,
      label: 'Daily Demand',
    },
    {
      key: 'my-reports',
      icon: <FileExcelOutlined />,
      label: 'My Reports',
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
      label: 'Orders & Demands',
    },
    ...(userRole === 'admin' ? [{
      key: 'manage-quotas',
      icon: <BarChartOutlined />,
      label: 'Manage Quotas',
    }] : []),
    {
      key: 'reports',
      icon: <FileExcelOutlined />,
      label: 'Reports',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];
  
  // Update ref when menuItems changes so callback can access it
  useEffect(() => {
    menuItemsRef.current = menuItems;
    // Trigger overflow check when menuItems change
    if (userRole) {
      setTimeout(() => checkMenuOverflow(), 100);
    }
    
    // Calculate drawer width based on longest menu item
    if (menuItems.length > 0) {
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.whiteSpace = 'nowrap';
      tempDiv.style.fontSize = '14px';
      tempDiv.style.padding = '0 8px';
      document.body.appendChild(tempDiv);
      
      let maxWidth = 0;
      menuItems.forEach(item => {
        tempDiv.textContent = item.label;
        const width = tempDiv.offsetWidth;
        if (width > maxWidth) {
          maxWidth = width;
        }
      });
      
      document.body.removeChild(tempDiv);
      
      // Add padding for icon (16px) + icon margin (4px) + left/right padding (32px) + some buffer
      const calculatedWidth = maxWidth + 16 + 4 + 32 + 20;
      setDrawerWidth(Math.min(Math.max(calculatedWidth, 180), 250));
    }
  }, [menuItems, userRole, checkMenuOverflow]);

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

          {/* Navigation Menu - Custom Menu Bar */}
          <div 
            ref={menuContainerRef}
            style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }} 
            className="menu-container"
          >
            <div 
              ref={menuBarRef}
              className="custom-menu-bar"
              style={{
                display: 'flex',
                visibility: 'visible',
                opacity: 1,
                transition: 'opacity 0.2s ease, visibility 0.2s ease'
              }}
            >
              {/* Show only items that fit in the menu bar */}
              {(visibleMenuItems.length > 0 
                ? menuItems.filter(item => visibleMenuItems.includes(item.key))
                : menuItems.slice(0, 1) // On initial render, show only first item to prevent overflow
              ).map(item => {
                const isSelected = getSelectedKey() === item.key;
                return (
                  <div
                    key={item.key}
                    data-menu-key={item.key}
                    className={`custom-menu-item ${isSelected ? 'custom-menu-item-selected' : ''}`}
                    onClick={() => handleMenuClick(item.key)}
                  >
                    <span className="custom-menu-icon">{item.icon}</span>
                    <span className="custom-menu-label">{item.label}</span>
                  </div>
                );
              })}
              
              {/* Show ellipsis button inline if there are hidden items OR if overflow detection hasn't run yet and we have multiple items */}
              {(menuOverflow && hiddenMenuItems.length > 0) || (visibleMenuItems.length === 0 && menuItems.length > 1) ? (
                <div
                  className="custom-menu-item custom-menu-item-ellipsis"
                  onClick={() => setDrawerOpen(true)}
                  title="More menu items"
                >
                  <span className="custom-menu-icon"><MoreOutlined /></span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Demo Button and User Role Display and Logout */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginLeft: '16px'
          }} className="header-actions">
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'ui-templates',
                    label: 'UI Templates',
                    icon: <LayoutOutlined />,
                    onClick: () => navigate('/template-ui')
                  },
                  {
                    key: 'workflow-tests',
                    label: 'Workflow Tests',
                    icon: <PlayCircleOutlined />,
                    onClick: () => navigate('/template-workflow-tests')
                  },
                ]
              }}
              trigger={['click']}
            >
              <Button
                type="text"
              icon={<ExperimentOutlined />}
              style={{ 
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '4px'
              }}
            >
              Templates <DownOutlined />
            </Button>
            </Dropdown>
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
              {userRole === 'admin' ? 'Admin Logout' : userRole === 'tso' ? 'TSO Logout' : userRole === 'dealer' ? 'Dealer Logout' : `${userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : ''} Logout`}
            </Button>
          </div>
        </Header>
      )}

      <Content style={{ 
        padding: userRole ? '12px' : '0', 
        background: '#f0f2f5',
        minHeight: userRole ? 'calc(100vh - 40px)' : '100vh',
      }}>
        {userRole && (
          <Alert
            type="warning"
            showIcon
            banner
            message="WARNING: UAT Environment Only - This software is for testing only. Sales orders may be deleted without notice. Do NOT use this software for real orders—use production systems instead."
            style={{ marginBottom: '12px' }}
          />
        )}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            isTSO ? 
            <TSODashboard /> : 
            isDealer ?
            <DealerDashboard /> :
            <Dashboard setStats={setStats} />
          } />
          <Route path="/dashboard" element={
            isDealer ? 
            <DealerDashboard /> : 
            isTSO ? 
            <TSODashboard /> : 
            <Dashboard setStats={setStats} />
          } />
          <Route path="/monthly-forecast" element={
            isDealer ?
            <MonthlyForecastTab /> :
            <Dashboard setStats={setStats} />
          } />
          <Route path="/daily-demand" element={
            isDealer ? 
            <DailyDemandMultiDay /> :
            <Dashboard setStats={setStats} />
          } />
          <Route path="/my-reports" element={
            isDealer ? 
            <DealerReports /> :
            <Dashboard setStats={setStats} />
          } />
          <Route path="/new-orders" element={<NewOrdersTablet onOrderCreated={refreshOrders} />} />
          <Route path="/review-orders" element={<ReviewOrdersTablet onOrderCreated={refreshOrders} />} />
          <Route path="/placed-orders" element={<PlacedOrders refreshTrigger={refreshTrigger} />} />
          <Route path="/settings" element={
            isTSO ? 
            <NewOrdersTablet onOrderCreated={refreshOrders} /> : 
            <Settings />
          } />
          {/* Legacy routes - redirect to settings */}
          <Route path="/manage-dealers" element={
            isTSO ? 
            <NewOrdersTablet onOrderCreated={refreshOrders} /> : 
            <Settings />
          } />
          <Route path="/manage-products" element={
            isTSO ? 
            <NewOrdersTablet onOrderCreated={refreshOrders} /> : 
            <Settings />
          } />
          <Route path="/manage-transports" element={
            isTSO ? 
            <NewOrdersTablet onOrderCreated={refreshOrders} /> : 
            <Settings />
          } />
          <Route path="/reports" element={
            (isTSO || isAdmin || isSalesManager) ? 
            <DailyReport /> : 
            <Dashboard setStats={setStats} />
          } />
          <Route path="/tso-report" element={
            isTSO ? 
            <TSOReport /> : 
            <Dashboard setStats={setStats} />
          } />
          <Route path="/user-management" element={
            userRole === 'admin' ? 
            <Settings /> : 
            <Dashboard setStats={setStats} />
          } />
          <Route path="/admin-settings" element={
            userRole === 'admin' ? 
            <Settings /> : 
            <Dashboard setStats={setStats} />
          } />
          <Route path="/manage-quotas" element={
            userRole === 'admin' ? 
            <ProductQuotaManagement /> : 
            <Dashboard setStats={setStats} />
          } />
          {/* Template Routes - accessible without login */}
          <Route path="/template-ui" element={<UnifiedUITemplate />} />
          <Route path="/template-workflow-tests" element={<WorkflowTests />} />
        </Routes>
      </Content>

      {/* Drawer for overflow menu items (opened by ellipsis button) */}
      {userRole && (
        <Drawer
          title="Navigation Menu"
          placement="right"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          width={drawerWidth}
          className="navigation-drawer"
        >
          <div className="drawer-menu-items">
            {/* Show only hidden menu items when overflow, otherwise show all */}
            {(menuOverflow && hiddenMenuItems.length > 0 
              ? menuItems.filter(item => hiddenMenuItems.includes(item.key))
              : menuItems
            ).map(item => {
              const isSelected = getSelectedKey() === item.key;
              return (
                <div
                  key={item.key}
                  className={`drawer-menu-item ${isSelected ? 'drawer-menu-item-selected' : ''}`}
                  onClick={() => handleMenuClick(item.key)}
                >
                  <span className="drawer-menu-item-icon">{item.icon}</span>
                  <span className="drawer-menu-item-label">{item.label}</span>
                </div>
              );
            })}
          </div>
        </Drawer>
      )}
    </Layout>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
      <DebugPanel />
    </UserProvider>
  );
}

export default App;
