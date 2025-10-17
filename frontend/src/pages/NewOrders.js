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
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

function NewOrders({ onOrderCreated }) {
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

  useEffect(() => {
    loadDropdownData();
  }, []);

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
        console.log('📝 Form initialized with values:', initialValues);
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

  const addOrderItem = () => {
    const newItem = {
      id: Date.now(),
      product_id: '',
      quantity: 1
    };
    setOrderItems([...orderItems, newItem]);
  };

  const removeOrderItem = (itemId) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  const updateOrderItem = (itemId, field, value) => {
    setOrderItems(orderItems.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async (values) => {
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
        onOrderCreated();
      }
    } catch (error) {
      message.error(`Failed to create order: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: '8px' }}>
        New Orders
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Create orders with multiple products for dealers
      </Text>

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', padding: '16px 24px 0' }}>
          <PlusOutlined style={{ marginRight: '8px' }} />
          <Title level={4} style={{ margin: 0 }}>Create New Order</Title>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit}
          onFinishFailed={() => message.error('Please fill all required fields correctly')}
          layout="vertical"
          style={{ padding: '0 24px 24px' }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={6} md={4}>
              <Form.Item
                name="orderType"
                label="Order Type"
                rules={[{ required: true, message: 'Please select order type' }]}
              >
                 <Select placeholder="Search order type" showSearch filterOption={(input, option) => {
                   const optionText = option?.children?.toString() || '';
                   return optionText.toLowerCase().includes(input.toLowerCase());
                 }} style={{ width: '100px' }}>
                  {dropdownData.orderTypes.map(type => (
                    <Option key={type.id} value={type.id}>{type.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={6} md={4}>
              <Form.Item
                name="warehouse"
                label="Warehouse"
                rules={[{ required: true, message: 'Please select warehouse' }]}
              >
                 <Select placeholder="Search warehouse" showSearch filterOption={(input, option) => {
                   const optionText = option?.children?.toString() || '';
                   return optionText.toLowerCase().includes(input.toLowerCase());
                 }} style={{ width: '140px' }}>
                  {dropdownData.warehouses.map(warehouse => (
                    <Option key={warehouse.id} value={warehouse.id}>{warehouse.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={6} md={4}>
              <Form.Item
                name="territoryCode"
                label="Territory Code"
                rules={[{ required: false, message: 'Please select territory code' }]}
              >
                 <Select placeholder="Code" showSearch filterOption={(input, option) => {
                   const optionText = option?.children?.toString() || '';
                   return optionText.toLowerCase().includes(input.toLowerCase());
                 }} onChange={(value) => handleTerritoryChange('territoryCode', value)} allowClear style={{ width: '100px' }}>
                  {dropdownData.territories.map(territory => (
                    <Option key={territory.code} value={territory.code}>{territory.code}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={6} md={4}>
              <Form.Item
                name="territoryName"
                label="Territory Name"
                rules={[{ required: false, message: 'Please select territory name' }]}
              >
                 <Select placeholder="Territory" showSearch filterOption={(input, option) => {
                   const optionText = option?.children?.toString() || '';
                   return optionText.toLowerCase().includes(input.toLowerCase());
                 }} onChange={(value) => handleTerritoryChange('territoryName', value)} allowClear>
                  {dropdownData.territories.map(territory => (
                    <Option key={territory.name} value={territory.name}>{territory.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="dealer"
                label="Dealer"
                rules={[{ required: true, message: 'Please select dealer' }]}
              >
                <Select 
                  placeholder={filteredDealers.length === 0 ? "Select territory first" : "Search dealer"} 
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

          {/* Order Items Section */}
          <div style={{ marginTop: '24px', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={5} style={{ margin: 0 }}>Order Items</Title>
              <Button 
                type="dashed" 
                icon={<PlusOutlined />} 
                onClick={addOrderItem}
                disabled={orderItems.length >= 10}
              >
                Add Product
              </Button>
            </div>

            {orderItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                <ShoppingCartOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                <div>No products added yet. Click "Add Product" to start.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orderItems.map((item, index) => (
                  <div key={item.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '12px', 
                    backgroundColor: 'white', 
                    borderRadius: '6px',
                    border: '1px solid #e8e8e8'
                  }}>
                    <div style={{ minWidth: '30px', fontWeight: 'bold', color: '#666' }}>
                      #{index + 1}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                       <Select
                         placeholder="Select Product"
                         value={item.product_id}
                         onChange={(value) => updateOrderItem(item.id, 'product_id', value)}
                         showSearch
                         filterOption={(input, option) => {
                           const optionText = option?.children?.toString() || '';
                           return optionText.toLowerCase().includes(input.toLowerCase());
                         }}
                         style={{ width: '100%' }}
                       >
                        {dropdownData.products.map(product => (
                          <Option key={product.id} value={product.id}>
                            {product.product_code} - {product.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    
                    <div style={{ minWidth: '120px' }}>
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(item.id, 'quantity', Number(e.target.value))}
                        min={1}
                        step={1}
                        style={{ width: '100%' }}
                      />
                    </div>
                    
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeOrderItem(item.id)}
                      style={{ minWidth: '40px' }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<PlusOutlined />}
                size="large"
                disabled={orderItems.length === 0}
              >
                {loading ? 'Creating...' : `Create Order (${orderItems.length} item${orderItems.length !== 1 ? 's' : ''})`}
              </Button>
            </div>
          </div>
        </Form>
      </Card>

      {/* Quick Stats */}
      <Row gutter={[16, 16]}>
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

export default NewOrders;
