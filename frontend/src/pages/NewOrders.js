import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Typography,
  Spin,
  message,
  Space,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  ShopOutlined,
  AppstoreOutlined,
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

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      console.log('🔄 Loading dropdown data...');
      const [orderTypes, dealers, warehouses, products] = await Promise.all([
        axios.get('/api/order-types'),
        axios.get('/api/dealers'),
        axios.get('/api/warehouses'),
        axios.get('/api/products')
      ]);

      console.log('📊 Data loaded:', {
        orderTypes: orderTypes.data.length,
        dealers: dealers.data.length,
        warehouses: warehouses.data.length,
        products: products.data.length
      });

      // Extract unique territories from dealers data
      const territoriesMap = new Map();
      dealers.data.forEach(dealer => {
        if (dealer.territory_code && dealer.territory_name) {
          territoriesMap.set(dealer.territory_code, {
            code: dealer.territory_code,
            name: dealer.territory_name
          });
        }
      });
      const territories = Array.from(territoriesMap.values());

      console.log('🏷️ Territories extracted:', territories.length);

      setDropdownData({
        orderTypes: orderTypes.data,
        dealers: dealers.data,
        warehouses: warehouses.data,
        products: products.data,
        territories: territories
      });

      setFilteredDealers(dealers.data);

      // Initialize form with default values when data is loaded
      if (orderTypes.data.length > 0 && warehouses.data.length > 0 && products.data.length > 0) {
        form.setFieldsValue({
          orderType: orderTypes.data[0].id,
          warehouse: warehouses.data[0].id,
          territoryCode: '',
          territoryName: '',
          dealer: '',
          product: products.data[0].id,
          quantity: 1
        });
      }

      console.log('✅ Data loading complete');
    } catch (error) {
      console.error('❌ Failed to load dropdown data:', error);
      message.error('Failed to load form data');
    }
  };

  // Territory filtering logic
  const filterDealersByTerritory = (territoryCode, territoryName) => {
    if ((!territoryCode || territoryCode === '') && (!territoryName || territoryName === '')) {
      setFilteredDealers(dropdownData.dealers);
      return;
    }

    const filtered = dropdownData.dealers.filter(dealer => {
      if (territoryCode && territoryCode !== '' && dealer.territory_code !== territoryCode) return false;
      if (territoryName && territoryName !== '' && dealer.territory_name !== territoryName) return false;
      return true;
    });

    setFilteredDealers(filtered);
  };

  const handleTerritoryChange = (field, value) => {
    if (field === 'territoryCode') {
      // Find the corresponding territory name
      const territory = dropdownData.territories.find(t => t.code === value);
      if (territory) {
        form.setFieldsValue({ territoryName: territory.name });
        filterDealersByTerritory(value, territory.name);
      } else {
        filterDealersByTerritory(value, null);
      }
    } else if (field === 'territoryName') {
      // Find the corresponding territory code
      const territory = dropdownData.territories.find(t => t.name === value);
      if (territory) {
        form.setFieldsValue({ territoryCode: territory.code });
        filterDealersByTerritory(territory.code, value);
      } else {
        filterDealersByTerritory(null, value);
      }
    }
  };

  const handleDealerChange = (dealerId) => {
    // Find the selected dealer and auto-populate territory fields
    const dealer = dropdownData.dealers.find(d => d.id === dealerId);
    if (dealer) {
      form.setFieldsValue({
        territoryCode: dealer.territory_code,
        territoryName: dealer.territory_name
      });
      // Filter dealers to show only this dealer's territory
      filterDealersByTerritory(dealer.territory_code, dealer.territory_name);
    }
  };

  const handleSubmit = async (values) => {
    console.log('🚀 Form submitted with values:', values);
    console.log('📋 Form validation passed, processing order...');
    setLoading(true);

    try {
      const orderData = {
        order_type_id: values.orderType,
        dealer_id: values.dealer,
        warehouse_id: values.warehouse, // Use form value
        product_id: values.product,
        quantity: parseInt(values.quantity)
      };

      console.log('📤 Sending order data:', orderData);

      const response = await axios.post('/api/orders', orderData);
      console.log('✅ Order creation response:', response.data);

      if (response.data.success) {
        message.success(`Order created successfully! Order ID: ${response.data.order_id}`);
        form.resetFields();
        setFilteredDealers(dropdownData.dealers); // Reset dealer filter
        onOrderCreated(); // Trigger refresh of orders table
      }
    } catch (error) {
      console.error('❌ Order creation failed:', error);
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
        Create new sales orders for dealers
      </Text>

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', padding: '16px 24px 0' }}>
          <PlusOutlined style={{ marginRight: '8px' }} />
          <Title level={4} style={{ margin: 0 }}>Create New Order</Title>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit}
          onFinishFailed={(errorInfo) => {
            console.log('❌ Form validation failed:', errorInfo);
            message.error('Please fill all required fields correctly');
          }}
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
                  <Select placeholder="Type" size="middle" style={{ width: '80px' }}>
                    {dropdownData.orderTypes.map(type => (
                      <Option key={type.id} value={type.id}>
                        {type.name}
                      </Option>
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
                  <Select placeholder="Warehouse" size="middle" style={{ width: '120px' }}>
                    {dropdownData.warehouses.map(warehouse => (
                      <Option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </Option>
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
                  <Select
                    placeholder="Code"
                    size="middle"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={(value) => handleTerritoryChange('territoryCode', value)}
                    allowClear
                    style={{ width: '100px' }}
                  >
                    {dropdownData.territories.map(territory => (
                      <Option key={territory.code} value={territory.code}>
                        {territory.code}
                      </Option>
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
                  <Select
                    placeholder="Territory"
                    size="middle"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={(value) => handleTerritoryChange('territoryName', value)}
                    allowClear
                  >
                    {dropdownData.territories.map(territory => (
                      <Option key={territory.name} value={territory.name}>
                        {territory.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={6} md={4}>
                <Form.Item
                  name="dealer"
                  label="Dealer"
                  rules={[{ required: true, message: 'Please select dealer' }]}
                >
                  <Select
                    placeholder={filteredDealers.length === 0 ? "Select territory first" : "Select dealer"}
                    size="middle"
                    disabled={filteredDealers.length === 0}
                    onChange={handleDealerChange}
                  >
                    {filteredDealers.map(dealer => (
                      <Option key={dealer.id} value={dealer.id}>
                        {dealer.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={6} md={4}>
                <Form.Item
                  name="product"
                  label="Product"
                  rules={[{ required: true, message: 'Please select product' }]}
                >
                  <Select
                    placeholder="Product"
                    size="middle"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {dropdownData.products.map(product => (
                      <Option key={product.id} value={product.id}>
                        {product.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={4} md={3}>
                <Form.Item
                  name="quantity"
                  label="Quantity"
                  rules={[
                    { required: true, message: 'Please enter quantity' },
                    { type: 'number', min: 1, message: 'Quantity must be at least 1' }
                  ]}
                >
                  <Input type="number" placeholder="Qty" size="middle" style={{ width: '80px' }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={8} md={5}>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<PlusOutlined />}
                    size="large"
                    style={{ width: '100%' }}
                  >
                    {loading ? 'Creating...' : 'Create Order'}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Card>

      {/* Quick Stats */}
      <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title="Dealers"
                value={dropdownData.dealers.length}
                prefix={<UserOutlined />}
                valueStyle={{ fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title="Products"
                value={dropdownData.products.length}
                prefix={<AppstoreOutlined />}
                valueStyle={{ fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title="New Order"
                value="Ready"
                prefix={<PlusOutlined />}
                valueStyle={{ fontSize: '16px', color: '#52c41a' }}
              />
              <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                Ready to Create
              </div>
            </Card>
          </Col>
        </Row>
    </div>
  );
}

export default NewOrders;
