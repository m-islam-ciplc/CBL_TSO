import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';

function NewOrders() {
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

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      setDataLoading(true);
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
      console.error('Failed to load dropdown data:', error);
      showSnackbar('Failed to load form data', 'error');
    } finally {
      setDataLoading(false);
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
    <Container maxWidth="lg" sx={{ mt: 3, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        New Orders
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Create new sales orders for dealers
      </Typography>

      <Card sx={{ mx: 0 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AddIcon sx={{ mr: 1 }} />
            <Typography variant="h5">Create New Order</Typography>
          </Box>

          {dataLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading form data...</Typography>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8} md={6}>
                  <FormControl fullWidth sx={{ minWidth: 200 }}>
                    <InputLabel>Order Type</InputLabel>
                    <Select
                      name="order_type_id"
                      value={formData.order_type_id}
                      onChange={handleInputChange}
                      label="Order Type"
                      required
                      disabled={dropdownData.orderTypes.length === 0}
                      sx={{ minHeight: 48 }}
                    >
                      {dropdownData.orderTypes.map(type => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

              <Grid item xs={12} sm={8} md={6}>
                <FormControl fullWidth sx={{ minWidth: 200 }}>
                  <InputLabel>Dealer</InputLabel>
                  <Select
                    name="dealer_id"
                    value={formData.dealer_id}
                    onChange={handleInputChange}
                    label="Dealer"
                    required
                    sx={{ minHeight: 48 }}
                  >
                    {dropdownData.dealers.map(dealer => (
                      <MenuItem key={dealer.id} value={dealer.id}>
                        {dealer.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={8} md={6}>
                <FormControl fullWidth sx={{ minWidth: 200 }}>
                  <InputLabel>Warehouse</InputLabel>
                  <Select
                    name="warehouse_id"
                    value={formData.warehouse_id}
                    onChange={handleInputChange}
                    label="Warehouse"
                    required
                    sx={{ minHeight: 48 }}
                  >
                    {dropdownData.warehouses.map(warehouse => (
                      <MenuItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={8} md={6}>
                <FormControl fullWidth sx={{ minWidth: 200 }}>
                  <InputLabel>Product</InputLabel>
                  <Select
                    name="product_id"
                    value={formData.product_id}
                    onChange={handleInputChange}
                    label="Product"
                    required
                    sx={{ minHeight: 48 }}
                  >
                    {dropdownData.products.map(product => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4} md={3}>
                <TextField
                  fullWidth
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  inputProps={{ min: 1 }}
                  required
                  sx={{ minHeight: 48 }}
                />
              </Grid>

              <Grid item xs={12} sm={8} md={6}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                  sx={{ mt: 2, py: 1.5 }}
                >
                  {loading ? 'Creating Order...' : 'Create Order'}
                </Button>
              </Grid>
            </Grid>
          </Box>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {!dataLoading && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <BusinessIcon color="primary" sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="h6">{dropdownData.dealers.length}</Typography>
              <Typography variant="body2" color="text.secondary">Dealers</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <ShippingIcon color="primary" sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="h6">{dropdownData.warehouses.length}</Typography>
              <Typography variant="body2" color="text.secondary">Warehouses</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <InventoryIcon color="primary" sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="h6">{dropdownData.products.length}</Typography>
              <Typography variant="body2" color="text.secondary">Products</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <AddIcon color="primary" sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="h6">New Order</Typography>
              <Typography variant="body2" color="text.secondary">Ready to Create</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

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
    </Container>
  );
}

export default NewOrders;
