import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

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
  const [message, setMessage] = useState({ type: '', text: '' });

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
      showMessage('error', 'Failed to load form data');
    }
  };

  const loadOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data);
    } catch (error) {
      showMessage('error', 'Failed to load orders');
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
        showMessage('success', `Order created successfully! Order ID: ${response.data.order_id}`);
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
      showMessage('error', 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>CBL Sales Order</h1>
          <p>TSO Order Management System</p>
        </div>
        
        <div className="form-container">
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="order-form">
            <div className="form-group">
              <label htmlFor="order_type_id">Order Type:</label>
              <select
                id="order_type_id"
                name="order_type_id"
                value={formData.order_type_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Order Type</option>
                {dropdownData.orderTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="dealer_id">Dealer Name:</label>
              <select
                id="dealer_id"
                name="dealer_id"
                value={formData.dealer_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Dealer</option>
                {dropdownData.dealers.map(dealer => (
                  <option key={dealer.id} value={dealer.id}>{dealer.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="warehouse_id">Warehouse:</label>
              <select
                id="warehouse_id"
                name="warehouse_id"
                value={formData.warehouse_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Warehouse</option>
                {dropdownData.warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="product_id">Product:</label>
              <select
                id="product_id"
                name="product_id"
                value={formData.product_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Product</option>
                {dropdownData.products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="quantity">Quantity:</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
            
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Creating Order...' : 'Create Order'}
            </button>
          </form>
        </div>
        
        <div className="orders-section">
          <h2>Recent Orders</h2>
          <div className="orders-list">
            {orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              orders.map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-header">Order ID: {order.order_id}</div>
                  <div className="order-details">
                    <strong>{order.order_type}</strong> | 
                    {order.dealer_name} | 
                    {order.warehouse_name} | 
                    {order.product_name} | 
                    Qty: {order.quantity} | 
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
