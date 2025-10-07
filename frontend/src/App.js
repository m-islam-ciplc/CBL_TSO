import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import NewOrders from './pages/NewOrders';
import PlacedOrders from './pages/PlacedOrders';

function AppContent() {
  const [stats, setStats] = useState({
    dealers: 0,
    warehouses: 0,
    products: 0,
    orders: 0,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const handlePageChange = (page) => {
    navigate(`/${page}`);
  };

  const getActivePage = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path === '/new-orders') return 'new-orders';
    if (path === '/placed-orders') return 'placed-orders';
    return 'dashboard';
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar
        activePage={getActivePage()}
        setActivePage={handlePageChange}
        stats={stats}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          width: { sm: `calc(100% - 280px)` }
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard setStats={setStats} />} />
          <Route path="/dashboard" element={<Dashboard setStats={setStats} />} />
          <Route path="/new-orders" element={<NewOrders />} />
          <Route path="/placed-orders" element={<PlacedOrders />} />
        </Routes>
      </Box>
    </Box>
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
