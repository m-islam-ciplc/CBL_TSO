import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  Typography,
  Button,
  Form,
  Input,
  Select,
  message,
  Row,
  Col,
  Space,
  Statistic,
  InputNumber,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

function NewOrdersTablet({ onOrderCreated }) {
  const [form] = Form.useForm();
  const [dropdownData, setDropdownData] = useState({
    orderTypes: [],
    dealers: [],
    warehouses: [],
    products: [],
    territories: []
  });
  const [loading, setLoading] = useState(false);
  const [filteredDealers, setFilteredDealers] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [currentStep, setCurrentStep] = useState('dealer'); // 'dealer', 'products', 'review'
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productQuantities, setProductQuantities] = useState({}); // Track quantities for each product

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    // Filter products based on search term
    if (searchTerm) {
      const filtered = dropdownData.products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(dropdownData.products);
    }
  }, [searchTerm, dropdownData.products]);

  const loadDropdownData = async () => {
    try {
      const [orderTypesRes, dealersRes, warehousesRes, productsRes] = await Promise.all([
        axios.get('/api/order-types'),
        axios.get('/api/dealers'),
        axios.get('/api/warehouses'),
        axios.get('/api/products')
      ]);

      setDropdownData({
        orderTypes: orderTypesRes.data,
        dealers: dealersRes.data,
        warehouses: warehousesRes.data,
        products: productsRes.data,
        territories: []
      });

      // Extract unique territories from dealers
      const territoriesMap = new Map();
      dealersRes.data.forEach(dealer => {
        if (dealer.territory_code && dealer.territory_name) {
          territoriesMap.set(dealer.territory_code, {
            code: dealer.territory_code,
            name: dealer.territory_name
          });
        }
      });
      const territories = Array.from(territoriesMap.values());
      setDropdownData(prev => ({ ...prev, territories }));
      setFilteredDealers(dealersRes.data);
      setFilteredProducts(productsRes.data);

      // Initialize form with default values when data is loaded
      if (orderTypesRes.data.length > 0 && warehousesRes.data.length > 0) {
        const initialValues = {
          orderType: orderTypesRes.data[0].id,
          warehouse: warehousesRes.data[0].id,
          territoryCode: '',
          territoryName: '',
          dealer: ''
        };

        form.setFieldsValue(initialValues);
      }

    } catch (error) {
      console.error('Error loading dropdown data:', error);
      message.error('Failed to load form data');
    }
  };

  const filterDealersByTerritory = (territoryCode, territoryName) => {
    let filtered = dropdownData.dealers;
    
    if (territoryCode) {
      filtered = filtered.filter(dealer => dealer.territory_code === territoryCode);
    } else if (territoryName) {
      filtered = filtered.filter(dealer => dealer.territory_name === territoryName);
    }
    
    setFilteredDealers(filtered);
  };

  const handleTerritoryChange = (field, value) => {
    if (field === 'territoryCode') {
      const territory = dropdownData.territories.find(t => t.code === value);
      if (territory) {
        form.setFieldsValue({ territoryName: territory.name });
        filterDealersByTerritory(territory.code, territory.name);
      } else {
        form.setFieldsValue({ territoryName: '' });
        filterDealersByTerritory(null, null);
      }
    } else if (field === 'territoryName') {
      const territory = dropdownData.territories.find(t => t.name === value);
      if (territory) {
        form.setFieldsValue({ territoryCode: territory.code });
        filterDealersByTerritory(territory.code, territory.name);
      } else {
        form.setFieldsValue({ territoryCode: '' });
        filterDealersByTerritory(null, null);
      }
    }
  };

  const handleDealerChange = (dealerId) => {
    const dealer = dropdownData.dealers.find(d => d.id === dealerId);
    if (dealer) {
      form.setFieldsValue({
        territoryCode: dealer.territory_code,
        territoryName: dealer.territory_name
      });
      filterDealersByTerritory(dealer.territory_code, dealer.territory_name);
    }
  };

  const updateProductQuantity = (productId, change) => {
    setProductQuantities(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, currentQty + change);
      return {
        ...prev,
        [productId]: newQty
      };
    });
  };

  const addProductToOrder = (product) => {
    const quantity = productQuantities[product.id] || 1;
    if (quantity === 0) {
      message.warning('Please select a quantity first');
      return;
    }

    const existingItem = orderItems.find(item => item.product_id === product.id);
    if (existingItem) {
      updateOrderItem(existingItem.id, 'quantity', existingItem.quantity + quantity);
    } else {
      const newItem = {
        id: Date.now(),
        product_id: product.id,
        product_name: product.name,
        product_code: product.product_code,
        quantity: quantity,
        unit_tp: product.unit_tp,
        mrp: product.mrp
      };
      setOrderItems([...orderItems, newItem]);
    }
    
    // Reset quantity for this product
    setProductQuantities(prev => ({
      ...prev,
      [product.id]: 0
    }));
    
    message.success(`${product.product_code} (Qty: ${quantity}) added to order!`);
  };

  const updateOrderItem = (itemId, field, value) => {
    setOrderItems(orderItems.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const removeOrderItem = (itemId) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      message.error('Please add at least one product to the order');
      return;
    }

    for (const item of orderItems) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        message.error('All order items must have a product and valid quantity');
        return;
      }
    }

    const values = form.getFieldsValue();
    setLoading(true);

    try {
      const orderData = {
        order_type_id: values.orderType,
        dealer_id: values.dealer,
        warehouse_id: values.warehouse,
        order_items: orderItems.map(item => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity)
        }))
      };

      const response = await axios.post('/api/orders', orderData);

      if (response.data.success) {
        message.success(`Order created successfully! Order ID: ${response.data.order_id} with ${response.data.item_count} product(s)`);
        form.resetFields();
        setOrderItems([]);
        setFilteredDealers(dropdownData.dealers);
        setCurrentStep('dealer');
        setSearchTerm('');
        onOrderCreated();
      }
    } catch (error) {
      message.error(`Failed to create order: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    const values = form.getFieldsValue();
    if (!values.dealer) {
      message.error('Please select a dealer first');
      return;
    }
    setCurrentStep('products');
  };

  const prevStep = () => {
    if (currentStep === 'products') {
      setCurrentStep('dealer');
    } else if (currentStep === 'review') {
      setCurrentStep('products');
    }
  };

  const goToReview = () => {
    if (orderItems.length === 0) {
      message.error('Please add at least one product to the order');
      return;
    }
    setCurrentStep('review');
  };

  const renderDealerSelection = () => (
    <Card style={{ minHeight: '70vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
          📋 Select Dealer
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Choose the dealer for this order
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="orderType"
              label={<Text strong style={{ fontSize: '16px' }}>Order Type</Text>}
              rules={[{ required: true, message: 'Please select order type' }]}
            >
              <Select 
                placeholder="Select order type" 
                size="large"
                style={{ fontSize: '16px', height: '48px' }}
              >
                {dropdownData.orderTypes.map(type => (
                  <Option key={type.id} value={type.id}>{type.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="warehouse"
              label={<Text strong style={{ fontSize: '16px' }}>Warehouse</Text>}
              rules={[{ required: true, message: 'Please select warehouse' }]}
            >
              <Select 
                placeholder="Select warehouse" 
                size="large"
                style={{ fontSize: '16px', height: '48px' }}
              >
                {dropdownData.warehouses.map(warehouse => (
                  <Option key={warehouse.id} value={warehouse.id}>{warehouse.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="territoryCode"
              label={<Text strong style={{ fontSize: '16px' }}>Territory Code</Text>}
            >
              <Select 
                placeholder="Select territory code" 
                size="large"
                style={{ fontSize: '16px', height: '48px' }}
                onChange={(value) => handleTerritoryChange('territoryCode', value)} 
                allowClear
              >
                {dropdownData.territories.map(territory => (
                  <Option key={territory.code} value={territory.code}>{territory.code}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="territoryName"
              label={<Text strong style={{ fontSize: '16px' }}>Territory Name</Text>}
            >
              <Select 
                placeholder="Select territory name" 
                size="large"
                style={{ fontSize: '16px', height: '48px' }}
                onChange={(value) => handleTerritoryChange('territoryName', value)} 
                allowClear
              >
                {dropdownData.territories.map(territory => (
                  <Option key={territory.name} value={territory.name}>{territory.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="dealer"
              label={<Text strong style={{ fontSize: '16px' }}>Dealer</Text>}
              rules={[{ required: true, message: 'Please select dealer' }]}
            >
              <Select 
                placeholder={filteredDealers.length === 0 ? "Select territory first" : "Search dealer"} 
                size="large"
                style={{ fontSize: '16px', height: '48px' }}
                showSearch 
                filterOption={(input, option) => {
                  const optionText = option?.children?.toString() || '';
                  return optionText.toLowerCase().includes(input.toLowerCase());
                }} 
                disabled={filteredDealers.length === 0} 
                onChange={handleDealerChange}
              >
                {filteredDealers.map(dealer => (
                  <Option key={dealer.id} value={dealer.id}>{dealer.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Button
            type="primary"
            size="large"
            icon={<ArrowLeftOutlined style={{ transform: 'rotate(180deg)' }} />}
            onClick={nextStep}
            style={{ 
              height: '60px', 
              fontSize: '18px', 
              padding: '0 40px',
              borderRadius: '12px'
            }}
          >
            Next: Select Products
          </Button>
        </div>
      </Form>
    </Card>
  );

  const renderProductSelection = () => (
    <Card style={{ minHeight: '70vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={prevStep}
          style={{ position: 'absolute', left: '24px', top: '24px' }}
        >
          Back
        </Button>
        <Title level={2} style={{ color: '#52c41a', marginBottom: '8px' }}>
          🛒 Select Products
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Tap products to add them to your order
        </Text>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
        <Input
          size="large"
          placeholder="Search products by name or code..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            height: '48px', 
            fontSize: '16px',
            borderRadius: '12px'
          }}
        />
      </div>

      {/* Product Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '16px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {filteredProducts.map(product => {
          const quantity = productQuantities[product.id] || 0;
          return (
            <Card
              key={product.id}
              style={{ 
                borderRadius: '12px',
                border: quantity > 0 ? '2px solid #52c41a' : '2px solid #f0f0f0',
                transition: 'all 0.3s',
                backgroundColor: quantity > 0 ? '#f6ffed' : 'white'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#1890ff',
                  marginBottom: '8px'
                }}>
                  {product.product_code}
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  color: '#333',
                  marginBottom: '16px',
                  lineHeight: '1.4'
                }}>
                  {product.name}
                </div>
                
                {/* Quantity Controls */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>-</span>}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateProductQuantity(product.id, -1);
                    }}
                    disabled={quantity === 0}
                    style={{ 
                      width: '40px', 
                      height: '40px',
                      backgroundColor: quantity > 0 ? '#ff4d4f' : '#d9d9d9',
                      borderColor: quantity > 0 ? '#ff4d4f' : '#d9d9d9'
                    }}
                  />
                  
                  <div style={{
                    minWidth: '60px',
                    textAlign: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: quantity > 0 ? '#52c41a' : '#999',
                    padding: '8px 12px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '2px solid #f0f0f0'
                  }}>
                    {quantity}
                  </div>
                  
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span>}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateProductQuantity(product.id, 1);
                    }}
                    style={{ 
                      width: '40px', 
                      height: '40px',
                      backgroundColor: '#52c41a',
                      borderColor: '#52c41a'
                    }}
                  />
                </div>
                
                {/* Add Button */}
                <Button
                  type="primary"
                  onClick={() => addProductToOrder(product)}
                  disabled={quantity === 0}
                  style={{
                    width: '100%',
                    height: '44px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    backgroundColor: quantity > 0 ? '#52c41a' : '#d9d9d9',
                    borderColor: quantity > 0 ? '#52c41a' : '#d9d9d9'
                  }}
                >
                  {quantity > 0 ? `Add ${quantity} to Order` : 'Select Quantity'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Current Order Summary */}
      {orderItems.length > 0 && (
        <div style={{ 
          position: 'fixed', 
          bottom: '0', 
          left: '0', 
          right: '0', 
          backgroundColor: 'white', 
          borderTop: '2px solid #1890ff',
          padding: '16px 24px',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong style={{ fontSize: '16px' }}>
                {orderItems.length} item{orderItems.length !== 1 ? 's' : ''} selected
              </Text>
              <div style={{ color: '#666' }}>
                Total Qty: {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<CheckOutlined />}
              onClick={goToReview}
              style={{ 
                height: '48px', 
                fontSize: '16px',
                borderRadius: '12px'
              }}
            >
              Review Order
            </Button>
          </div>
        </div>
      )}
    </Card>
  );

  const renderOrderReview = () => (
    <Card style={{ minHeight: '70vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={prevStep}
          style={{ position: 'absolute', left: '24px', top: '24px' }}
        >
          Back
        </Button>
        <Title level={2} style={{ color: '#722ed1', marginBottom: '8px' }}>
          ✅ Review Order
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Review and confirm your order details
        </Text>
      </div>

      {/* Order Items */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {orderItems.map((item, index) => (
          <Card
            key={item.id}
            style={{ 
              marginBottom: '16px',
              borderRadius: '12px',
              border: '2px solid #f0f0f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                minWidth: '40px', 
                height: '40px',
                backgroundColor: '#1890ff',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                {index + 1}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                  {item.product_code}
                </div>
                <div style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>
                  {item.product_name}
                </div>
              </div>
              
              <div style={{ minWidth: '120px' }}>
                <InputNumber
                  value={item.quantity}
                  onChange={(value) => updateOrderItem(item.id, 'quantity', value || 1)}
                  min={1}
                  max={999}
                  size="large"
                  style={{ 
                    width: '100%',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeOrderItem(item.id)}
                size="large"
                style={{ minWidth: '48px' }}
              />
            </div>
          </Card>
        ))}

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Button
            type="primary"
            size="large"
            loading={loading}
            icon={<CheckOutlined />}
            onClick={handleSubmit}
            style={{ 
              height: '60px', 
              fontSize: '18px', 
              padding: '0 40px',
              borderRadius: '12px'
            }}
          >
            {loading ? 'Creating Order...' : `Create Order (${orderItems.length} items)`}
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div style={{ padding: '16px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Title level={3} style={{ marginBottom: '8px', textAlign: 'center' }}>
        📱 TSO Order Entry
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block', textAlign: 'center' }}>
        Touch-optimized order creation for tablets
      </Text>

      {currentStep === 'dealer' && renderDealerSelection()}
      {currentStep === 'products' && renderProductSelection()}
      {currentStep === 'review' && renderOrderReview()}

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Dealers"
              value={dropdownData.dealers.length}
              prefix={<span style={{ color: '#1890ff' }}>👥</span>}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={dropdownData.products.length}
              prefix={<span style={{ color: '#52c41a' }}>📦</span>}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Order Items"
              value={orderItems.length}
              prefix={<span style={{ color: '#fa8c16' }}>🛒</span>}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Quantity"
              value={orderItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)}
              prefix={<span style={{ color: '#722ed1' }}>🔢</span>}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default NewOrdersTablet;
