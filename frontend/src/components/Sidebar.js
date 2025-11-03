import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

function Sidebar({ activePage, setActivePage, stats = { dealers: 0, warehouses: 0, products: 0, orders: 0 } }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'new-orders', label: 'New Orders', icon: <AddIcon /> },
    { id: 'placed-orders', label: 'Placed Orders', icon: <AssignmentIcon /> },
  ];

  const statistics = [
    { label: 'Dealers', value: stats.dealers, icon: <BusinessIcon /> },
    { label: 'Warehouses', value: stats.warehouses, icon: <ShippingIcon /> },
    { label: 'Products', value: stats.products, icon: <InventoryIcon /> },
    { label: 'Total Orders', value: stats.orders, icon: <AssignmentIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)',
          color: 'white',
        },
      }}
    >
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          CBL SO
        </Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.7)">
          TSO Management System
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 2 }} />

      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => setActivePage(item.id)}
              sx={{
                borderRadius: 2,
                backgroundColor: activePage === item.id ? 'rgba(52, 152, 219, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(52, 152, 219, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: 'white',
                    fontWeight: activePage === item.id ? 600 : 400,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 2, my: 2 }} />

      <Box sx={{ px: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          Statistics
        </Typography>
        {statistics.map((stat, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ color: 'rgba(255,255,255,0.7)', mr: 2 }}>
              {stat.icon}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontSize: '1.1rem' }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                {stat.label}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Drawer>
  );
}

export default Sidebar;
