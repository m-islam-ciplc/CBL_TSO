import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Assignment as OrderIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';

function App() {
  const [formData, setFormData] = useState({
    order_type_id: '',
    dealer_id: '',
    warehouse_id: '',
    product_id: '',
    quantity: ''
  });
  
  const [dropdownData, setDropdownData] = useState({
    orderTypes: [],
    dealers: [],
    warehouses: [],
    products: []
  });
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadDropdownData();
    loadOrders();
  }, []);

  const loadDropdownData = async () => {
    try {
      const [orderTypes, dealers, warehouses, products] = await Promise.all([
        axios.get('/api/order-types'),
        axios.get('/api/dealers'),
        axios.get('/api/warehouses'),
        axios.get('/api/products')
      ]);

      setDropdownData({
        orderTypes: orderTypes.data,
        dealers: dealers.data,
        warehouses: warehouses.data,
        products: products.data
      });
    } catch (error) {
      showSnackbar('Failed to load form data', 'error');
    }
  };

  const loadOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data);
    } catch (error) {
      showSnackbar('Failed to load orders', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        ...formData,
        quantity: parseInt(formData.quantity)
      };

      const response = await axios.post('/api/orders', orderData);
      
      if (response.data.success) {
        showSnackbar(`Order created successfully! Order ID: ${response.data.order_id}`, 'success');
        setFormData({
          order_type_id: '',
          dealer_id: '',
          warehouse_id: '',
          product_id: '',
          quantity: ''
        });
        loadOrders();
      }
    } catch (error) {
      showSnackbar('Failed to create order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <OrderIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CBL Sales Order
          </Typography>
          <Chip 
            label="TSO Management System" 
            color="secondary" 
            variant="outlined"
            sx={{ color: 'white', borderColor: 'white' }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Dashboard Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <BusinessIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">{dropdownData.dealers.length}</Typography>
                <Typography color="text.secondary">Dealers</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <ShippingIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">{dropdownData.warehouses.length}</Typography>
                <Typography color="text.secondary">Warehouses</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <InventoryIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">{dropdownData.products.length}</Typography>
                <Typography color="text.secondary">Products</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <OrderIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">{orders.length}</Typography>
                <Typography color="text.secondary">Total Orders</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Order Form */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AddIcon sx={{ mr: 1 }} />
                  <Typography variant="h5">Create New Order</Typography>
                </Box>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Order Type</InputLabel>
                        <Select
                          name="order_type_id"
                          value={formData.order_type_id}
                          onChange={handleInputChange}
                          label="Order Type"
                          required
                        >
                          {dropdownData.orderTypes.map(type => (
                            <MenuItem key={type.id} value={type.id}>
                              {type.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Dealer</InputLabel>
                        <Select
                          name="dealer_id"
                          value={formData.dealer_id}
                          onChange={handleInputChange}
                          label="Dealer"
                          required
                        >
                          {dropdownData.dealers.map(dealer => (
                            <MenuItem key={dealer.id} value={dealer.id}>
                              {dealer.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Warehouse</InputLabel>
                        <Select
                          name="warehouse_id"
                          value={formData.warehouse_id}
                          onChange={handleInputChange}
                          label="Warehouse"
                          required
                        >
                          {dropdownData.warehouses.map(warehouse => (
                            <MenuItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Product</InputLabel>
                        <Select
                          name="product_id"
                          value={formData.product_id}
                          onChange={handleInputChange}
                          label="Product"
                          required
                        >
                          {dropdownData.products.map(product => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="quantity"
                        label="Quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        inputProps={{ min: 1 }}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                        sx={{ mt: 2 }}
                      >
                        {loading ? 'Creating Order...' : 'Create Order'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <OrderIcon sx={{ mr: 1 }} />
                    <Typography variant="h5">Recent Orders</Typography>
                  </Box>
                  <IconButton onClick={loadOrders} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </Box>
                
                {orders.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <OrderIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No orders found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create your first order to get started
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Order ID</strong></TableCell>
                          <TableCell><strong>Details</strong></TableCell>
                          <TableCell><strong>Date</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.slice(0, 5).map(order => (
                          <TableRow key={order.id} hover>
                            <TableCell>
                              <Chip 
                                label={order.order_id} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                <strong>{order.order_type}</strong>
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {order.dealer_name} • {order.warehouse_name} • {order.product_name} • Qty: {order.quantity}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {new Date(order.created_at).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* All Orders Table */}
        {orders.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3 }}>
                All Orders
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Order ID</strong></TableCell>
                      <TableCell><strong>Order Type</strong></TableCell>
                      <TableCell><strong>Dealer</strong></TableCell>
                      <TableCell><strong>Warehouse</strong></TableCell>
                      <TableCell><strong>Product</strong></TableCell>
                      <TableCell><strong>Quantity</strong></TableCell>
                      <TableCell><strong>Created</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map(order => (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Chip 
                            label={order.order_id} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{order.order_type}</TableCell>
                        <TableCell>{order.dealer_name}</TableCell>
                        <TableCell>{order.warehouse_name}</TableCell>
                        <TableCell>{order.product_name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={order.quantity} 
                            size="small" 
                            color="secondary"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
