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

function NewOrders() {
  const [form] = Form.useForm();
  const [dropdownData, setDropdownData] = useState({
    orderTypes: [],
    dealers: [],
    warehouses: [],
    products: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDropdownData();
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
      console.error('Failed to load dropdown data:', error);
      message.error('Failed to load form data');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Get the single warehouse ID (since there's only one warehouse)
      const warehouses = await axios.get('/api/warehouses');
      const warehouseId = warehouses.data[0]?.id;

      const orderData = {
        order_type_id: values.orderType,
        dealer_id: values.dealer,
        warehouse_id: warehouseId, // Auto-filled warehouse
        product_id: values.product,
        quantity: parseInt(values.quantity)
      };

      const response = await axios.post('/api/orders', orderData);

      if (response.data.success) {
        message.success(`Order created successfully! Order ID: ${response.data.order_id}`);
        form.resetFields();
      }
    } catch (error) {
      message.error('Failed to create order');
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
          layout="vertical"
          style={{ padding: '0 24px 24px' }}
        >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="orderType"
                  label="Order Type"
                  rules={[{ required: true, message: 'Please select order type' }]}
                >
                  <Select placeholder="Select order type" size="middle">
                    {dropdownData.orderTypes.map(type => (
                      <Option key={type.id} value={type.id}>
                        {type.name}
                      </Option>
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
                    placeholder="Search and select dealer"
                    size="middle"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {dropdownData.dealers.map(dealer => (
                      <Option key={dealer.id} value={dealer.id}>
                        {dealer.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="product"
                  label="Product"
                  rules={[{ required: true, message: 'Please select product' }]}
                >
                  <Select
                    placeholder="Search and select product"
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

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="quantity"
                  label="Quantity"
                  rules={[
                    { required: true, message: 'Please enter quantity' },
                    { type: 'number', min: 1, message: 'Quantity must be at least 1' }
                  ]}
                >
                  <Input type="number" placeholder="Enter quantity" size="middle" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<PlusOutlined />}
                    size="large"
                    block
                  >
                    {loading ? 'Creating Order...' : 'Create Order'}
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
