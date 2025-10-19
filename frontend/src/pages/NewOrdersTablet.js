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
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productQuantities, setProductQuantities] = useState({}); // Track quantities for each product
  const [showReview, setShowReview] = useState(false); // Control review modal/page
  const [lastSelectedProductId, setLastSelectedProductId] = useState(null); // Track last selected product

  useEffect(() => {
    loadDropdownData();
    // Load existing order items from localStorage
    const savedOrderItems = localStorage.getItem('tsoOrderItems');
    if (savedOrderItems) {
      try {
        const parsedItems = JSON.parse(savedOrderItems);
        setOrderItems(parsedItems);
        console.log('Loaded existing order items:', parsedItems);
      } catch (error) {
        console.error('Error parsing saved order items:', error);
      }
    }
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
          // Clean territory name by removing " Territory" suffix if it exists
          const cleanTerritoryName = dealer.territory_name.replace(/\s+Territory$/i, '');
          territoriesMap.set(dealer.territory_code, {
            code: dealer.territory_code,
            name: cleanTerritoryName
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
    
    console.log('🔍 Filtering dealers by territory:', { territoryCode, territoryName });
    console.log('📊 Total dealers before filtering:', filtered.length);
    
    if (territoryCode) {
      filtered = filtered.filter(dealer => dealer.territory_code === territoryCode);
      console.log('✅ Filtered by territory code:', territoryCode, 'Result:', filtered.length, 'dealers');
    } else if (territoryName) {
      // Compare with cleaned territory name
      filtered = filtered.filter(dealer => {
        const cleanDealerTerritory = dealer.territory_name.replace(/\s+Territory$/i, '');
        return cleanDealerTerritory === territoryName;
      });
      console.log('✅ Filtered by territory name:', territoryName, 'Result:', filtered.length, 'dealers');
    }
    
    console.log('📋 Filtered dealers:', filtered.map(d => ({ name: d.name, territory_code: d.territory_code })));
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

  const autoAddPreviousProduct = (newProductId) => {
    if (lastSelectedProductId && lastSelectedProductId !== newProductId) {
      const previousQuantity = productQuantities[lastSelectedProductId] || 0;
      if (previousQuantity > 0) {
        // Find the product details
        const product = dropdownData.products.find(p => p.id === lastSelectedProductId);
        if (product) {
          // Auto-add the previous product
          const existingItem = orderItems.find(item => item.product_id === lastSelectedProductId);
          let updatedItems;
          
          if (existingItem) {
            updatedItems = orderItems.map(item => 
              item.id === existingItem.id ? { ...item, quantity: item.quantity + previousQuantity } : item
            );
          } else {
            const newItem = {
              id: Date.now(),
              product_id: lastSelectedProductId,
              product_name: product.name,
              product_code: product.product_code,
              quantity: previousQuantity,
              unit_tp: product.unit_tp,
              mrp: product.mrp
            };
            updatedItems = [...orderItems, newItem];
          }
          
          setOrderItems(updatedItems);
          localStorage.setItem('tsoOrderItems', JSON.stringify(updatedItems));
          
          // Reset the quantity for the previous product
          setProductQuantities(prev => ({
            ...prev,
            [lastSelectedProductId]: 0
          }));
          
          message.success(`${product.product_code} (Qty: ${previousQuantity}) auto-added to order!`);
        }
      }
    }
    setLastSelectedProductId(newProductId);
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
    let updatedItems;
    
    if (existingItem) {
      updatedItems = orderItems.map(item => 
        item.id === existingItem.id ? { ...item, quantity: item.quantity + quantity } : item
      );
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
      updatedItems = [...orderItems, newItem];
    }
    
    setOrderItems(updatedItems);
    
    // Save to localStorage
    localStorage.setItem('tsoOrderItems', JSON.stringify(updatedItems));
    
    // Reset quantity for this product
    setProductQuantities(prev => ({
      ...prev,
      [product.id]: 0
    }));
    
    // Clear the last selected product since it's been manually added
    setLastSelectedProductId(null);
    
    message.success(`${product.product_code} (Qty: ${quantity}) added to order!`);
  };

  const updateOrderItem = (itemId, field, value) => {
    const updatedItems = orderItems.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    );
    setOrderItems(updatedItems);
    localStorage.setItem('tsoOrderItems', JSON.stringify(updatedItems));
  };

  const removeOrderItem = (itemId) => {
    const updatedItems = orderItems.filter(item => item.id !== itemId);
    setOrderItems(updatedItems);
    localStorage.setItem('tsoOrderItems', JSON.stringify(updatedItems));
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
        setSearchTerm('');
        onOrderCreated();
      }
    } catch (error) {
      message.error(`Failed to create order: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{ 
      padding: '4px 8px', 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh' 
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
          📱 TSO Order Entry
        </Title>
        <div>
          <Text strong style={{ fontSize: '12px', color: '#1890ff' }}>
            Items: {orderItems.length} | Qty: {orderItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)}
          </Text>
        </div>
      </div>

      {/* Compact Dealer Selection */}
      <Card style={{ marginBottom: '12px', borderRadius: '8px' }}>
        <Form
          form={form}
          layout="horizontal"
          size="small"
        >
          <Row gutter={[8, 12]} align="middle">
            <Col xs={24} sm={12} md={4} lg={3}>
              <Form.Item
                name="orderType"
                label={<Text strong style={{ fontSize: '12px' }}>Order Type</Text>}
                rules={[{ required: true, message: 'Required' }]}
                style={{ marginBottom: '8px' }}
              >
                <Select 
                  placeholder="Type" 
                  size="small"
                  style={{ fontSize: '12px' }}
                >
                  {dropdownData.orderTypes.map(type => (
                    <Option key={type.id} value={type.id}>{type.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4} lg={3}>
              <Form.Item
                name="warehouse"
                label={<Text strong style={{ fontSize: '12px' }}>Warehouse</Text>}
                rules={[{ required: true, message: 'Required' }]}
                style={{ marginBottom: '8px' }}
              >
                <Select 
                  placeholder="Warehouse" 
                  size="small"
                  style={{ fontSize: '12px' }}
                >
                  {dropdownData.warehouses.map(warehouse => (
                    <Option key={warehouse.id} value={warehouse.id}>{warehouse.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4} lg={3}>
              <Form.Item
                name="territoryCode"
                label={<Text strong style={{ fontSize: '12px' }}>Territory</Text>}
                style={{ marginBottom: '8px' }}
              >
                <Select 
                  placeholder="Territory" 
                  size="small"
                  style={{ fontSize: '12px' }}
                  allowClear
                  showSearch
                  filterOption={(input, option) => {
                    const optionText = option?.children?.toString() || '';
                    return optionText.toLowerCase().includes(input.toLowerCase());
                  }}
                  onChange={(value) => handleTerritoryChange('territoryCode', value)}
                >
                  {dropdownData.territories.map(territory => (
                    <Option key={territory.code} value={territory.code}>{territory.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={12} lg={15}>
              <Form.Item
                name="dealer"
                label={<Text strong style={{ fontSize: '12px' }}>Dealer</Text>}
                rules={[{ required: true, message: 'Required' }]}
                style={{ marginBottom: '8px' }}
              >
                <Select 
                  placeholder={filteredDealers.length === 0 ? "Select territory first" : "Dealer"} 
                  size="small"
                  style={{ fontSize: '12px' }}
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
        </Form>
      </Card>

      {/* Compact Product Search */}
      <Card style={{ marginBottom: '12px', borderRadius: '8px' }}>
        <Input
          size="small"
          placeholder="Search products by name or code..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            fontSize: '14px',
            borderRadius: '6px'
          }}
        />
      </Card>

      {/* Compact Product Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
        gap: '12px',
        marginBottom: '100px'
      }}>
        {filteredProducts.map(product => {
          const quantity = productQuantities[product.id] || 0;
          return (
            <Card
              key={product.id}
              style={{ 
                borderRadius: '8px',
                border: quantity > 0 ? '2px solid #52c41a' : '1px solid #f0f0f0',
                transition: 'all 0.3s',
                backgroundColor: quantity > 0 ? '#f6ffed' : 'white'
              }}
              bodyStyle={{ padding: '12px' }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  color: '#1890ff',
                  marginBottom: '6px'
                }}>
                  {product.product_code}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#333',
                  marginBottom: '12px',
                  lineHeight: '1.3'
                }}>
                  {product.name}
                </div>
                
                {/* Compact Quantity Controls */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <Button
                    type="primary"
                    shape="circle"
                    size="small"
                    icon={<span style={{ fontSize: '14px', fontWeight: 'bold' }}>-</span>}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateProductQuantity(product.id, -1);
                    }}
                    disabled={quantity === 0}
                    style={{ 
                      width: '32px', 
                      height: '32px',
                      backgroundColor: quantity > 0 ? '#ff4d4f' : '#d9d9d9',
                      borderColor: quantity > 0 ? '#ff4d4f' : '#d9d9d9'
                    }}
                  />
                  
                  <InputNumber
                    min={0}
                    max={9999}
                    value={quantity}
                    onChange={(value) => {
                      const newQty = value || 0;
                      setProductQuantities(prev => ({
                        ...prev,
                        [product.id]: newQty
                      }));
                      // Auto-add previous product if switching to different product
                      autoAddPreviousProduct(product.id);
                    }}
                    style={{
                      width: '60px',
                      textAlign: 'center'
                    }}
                    controls={false}
                    placeholder="0"
                  />
                  
                  <Button
                    type="primary"
                    shape="circle"
                    size="small"
                    icon={<span style={{ fontSize: '14px', fontWeight: 'bold' }}>+</span>}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Auto-add previous product if switching to different product
                      autoAddPreviousProduct(product.id);
                      updateProductQuantity(product.id, 1);
                    }}
                    style={{ 
                      width: '32px', 
                      height: '32px',
                      backgroundColor: '#52c41a',
                      borderColor: '#52c41a'
                    }}
                  />
                </div>
                
                {/* Quick Quantity Buttons - Only Common Quantities */}
                <div style={{ 
                  display: 'flex', 
                  gap: '3px', 
                  marginBottom: '8px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  {[50, 100, 150, 200].map(quickQty => (
                    <Button
                      key={quickQty}
                      size="small"
                      type={quantity === quickQty ? 'primary' : 'default'}
                      onClick={() => {
                        setProductQuantities(prev => ({
                          ...prev,
                          [product.id]: quickQty
                        }));
                        autoAddPreviousProduct(product.id);
                      }}
                      style={{
                        fontSize: '10px',
                        height: '24px',
                        minWidth: '40px',
                        fontWeight: 'bold',
                        padding: '0 6px'
                      }}
                    >
                      {quickQty}
                    </Button>
                  ))}
                </div>

                {/* Compact Add Button */}
                <Button
                  type="primary"
                  size="small"
                  onClick={() => addProductToOrder(product)}
                  disabled={quantity === 0}
                  style={{
                    width: '100%',
                    height: '32px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    borderRadius: '6px',
                    backgroundColor: quantity > 0 ? '#52c41a' : '#d9d9d9',
                    borderColor: quantity > 0 ? '#52c41a' : '#d9d9d9'
                  }}
                >
                  {quantity > 0 ? `Add ${quantity}` : 'Select Qty'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Order Review Section */}
      {orderItems.length > 0 && (
        <Card style={{ marginBottom: '12px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <Title level={5} style={{ margin: 0, color: '#1890ff' }}>
              📋 Order Review ({orderItems.length} item{orderItems.length !== 1 ? 's' : ''})
            </Title>
            <Button
              type="link"
              size="small"
              onClick={() => setOrderItems([])}
              style={{ color: '#ff4d4f', fontSize: '12px' }}
            >
              Clear All
            </Button>
          </div>
          
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {orderItems.map((item, index) => (
              <Card
                key={item.id}
                size="small"
                style={{ 
                  marginBottom: '8px',
                  borderRadius: '6px',
                  border: '1px solid #f0f0f0'
                }}
              >
                <Row gutter={[8, 8]} align="middle">
                  <Col xs={4}>
                    <div style={{ 
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#1890ff',
                      backgroundColor: '#f0f8ff',
                      padding: '4px',
                      borderRadius: '4px'
                    }}>
                      #{index + 1}
                    </div>
                  </Col>
                  <Col xs={8}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1890ff' }}>
                        {item.product_code}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.2' }}>
                        {item.product_name}
                      </div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Button
                        type="primary"
                        shape="circle"
                        size="small"
                        icon={<span style={{ fontSize: '12px' }}>-</span>}
                        onClick={() => updateOrderItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                        style={{ 
                          width: '24px', 
                          height: '24px',
                          fontSize: '10px'
                        }}
                      />
                      <div style={{
                        minWidth: '40px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#52c41a',
                        padding: '2px 6px',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        border: '1px solid #f0f0f0'
                      }}>
                        {item.quantity}
                      </div>
                      <Button
                        type="primary"
                        shape="circle"
                        size="small"
                        icon={<span style={{ fontSize: '12px' }}>+</span>}
                        onClick={() => updateOrderItem(item.id, 'quantity', item.quantity + 1)}
                        style={{ 
                          width: '24px', 
                          height: '24px',
                          fontSize: '10px'
                        }}
                      />
                    </div>
                  </Col>
                  <Col xs={6}>
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeOrderItem(item.id)}
                      style={{ fontSize: '12px' }}
                    />
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Fixed Bottom Order Summary & Submit */}
      {orderItems.length > 0 && (
        <div style={{ 
          position: 'fixed', 
          bottom: '0', 
          left: '0', 
          right: '0', 
          backgroundColor: 'white', 
          borderTop: '2px solid #1890ff',
          padding: '16px 12px',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <Row gutter={[8, 8]} align="middle">
            <Col xs={14} sm={16}>
              <div style={{ paddingRight: '8px' }}>
                <Text strong style={{ fontSize: '13px', lineHeight: '1.2' }}>
                  Ready: {orderItems.length} item{orderItems.length !== 1 ? 's' : ''}
                </Text>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                  Qty: {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                </div>
              </div>
            </Col>
            <Col xs={10} sm={8}>
              <Button
                type="primary"
                size="large"
                icon={<CheckOutlined />}
                onClick={() => {
                  // Save form data to localStorage before navigating
                  const formValues = form.getFieldsValue();
                  localStorage.setItem('tsoFormData', JSON.stringify(formValues));
                  window.location.href = '/review-orders';
                }}
                style={{ 
                  width: '100%',
                  height: '44px',
                  fontSize: '13px',
                  borderRadius: '8px'
                }}
              >
                Review Order
              </Button>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}

export default NewOrdersTablet;
