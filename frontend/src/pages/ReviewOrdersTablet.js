import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  Typography,
  Button,
  Form,
  Row,
  Col,
  Space,
  InputNumber,
  message,
  Empty,
  Spin,
  Select,
} from 'antd';
import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useUser } from '../contexts/UserContext';

const { Title, Text } = Typography;
const { Option } = Select;

function ReviewOrdersTablet({ onOrderCreated }) {
  const { isTSO } = useUser();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [dropdownData, setDropdownData] = useState({
    orderTypes: [],
    dealers: [],
    warehouses: [],
    products: []
  });

  useEffect(() => {
    loadDropdownData();
    // Load order items from localStorage or context
    const savedOrderItems = localStorage.getItem('tsoOrderItems');
    if (savedOrderItems) {
      setOrderItems(JSON.parse(savedOrderItems));
    }
    
    // Load form data from localStorage
    const savedFormData = localStorage.getItem('tsoFormData');
    if (savedFormData) {
      try {
        const formData = JSON.parse(savedFormData);
        // Set form values after a short delay to ensure form is initialized
        setTimeout(() => {
          form.setFieldsValue(formData);
        }, 100);
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
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
        products: productsRes.data
      });

      // Initialize form with default values only if no saved form data exists
      const savedFormData = localStorage.getItem('tsoFormData');
      if (!savedFormData && orderTypesRes.data.length > 0 && warehousesRes.data.length > 0) {
        const initialValues = {
          orderType: orderTypesRes.data[0].id,
          warehouse: warehousesRes.data[0].id,
          dealer: ''
        };
        form.setFieldsValue(initialValues);
      }

    } catch (error) {
      console.error('Error loading dropdown data:', error);
      message.error('Failed to load form data');
    }
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

  const clearAllItems = () => {
    setOrderItems([]);
    localStorage.removeItem('tsoOrderItems');
    localStorage.removeItem('tsoFormData');
    form.resetFields();
    message.success('All items and form data cleared');
  };

  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      message.error('Please add at least one product to the order');
      return;
    }

    const values = form.getFieldsValue();
    if (!values.dealer) {
      message.error('Please select a dealer');
      return;
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
        
        // Clear the order and form data
        setOrderItems([]);
        localStorage.removeItem('tsoOrderItems');
        localStorage.removeItem('tsoFormData');
        form.resetFields();
        
        onOrderCreated();
        
        // Redirect to new orders
        window.location.href = '/new-orders';
      }
    } catch (error) {
      message.error(`Failed to create order: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (orderItems.length === 0) {
    return (
      <div style={{ padding: '16px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={3} style={{ color: '#1890ff', marginBottom: '8px' }}>
            📋 Review Orders
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            No items to review yet
          </Text>
        </div>

        <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No items in your order"
            style={{ padding: '40px 0' }}
          >
            <Button
              type="primary"
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={() => window.location.href = '/new-orders'}
              style={{
                height: '48px',
                fontSize: '16px',
                borderRadius: '8px'
              }}
            >
              Go to New Orders
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 8px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <Title level={4} style={{ marginBottom: '4px', color: '#1890ff' }}>
          📋 Review & Edit Order
        </Title>
        <Text type="secondary" style={{ fontSize: '14px' }}>
          Review your order before submitting
        </Text>
      </div>

      {/* Order Form */}
      <Card style={{ marginBottom: '12px', borderRadius: '8px' }}>
        <Form
          form={form}
          layout="horizontal"
          size="small"
        >
          <Row gutter={[8, 8]} align="middle">
            <Col xs={24} sm={8}>
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

            <Col xs={24} sm={8}>
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

            <Col xs={24} sm={8}>
              <Form.Item
                name="dealer"
                label={<Text strong style={{ fontSize: '12px' }}>Dealer</Text>}
                rules={[{ required: true, message: 'Required' }]}
                style={{ marginBottom: '8px' }}
              >
                <Select 
                  placeholder="Select dealer" 
                  size="small"
                  style={{ fontSize: '12px' }}
                  showSearch 
                  filterOption={(input, option) => {
                    const optionText = option?.children?.toString() || '';
                    return optionText.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {dropdownData.dealers.map(dealer => (
                    <Option key={dealer.id} value={dealer.id}>{dealer.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Order Items Review */}
      <Card style={{ marginBottom: '12px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={5} style={{ margin: 0, color: '#1890ff' }}>
            📦 Order Items ({orderItems.length})
          </Title>
          <Button
            type="link"
            size="small"
            onClick={clearAllItems}
            style={{ color: '#ff4d4f', fontSize: '12px' }}
          >
            Clear All
          </Button>
        </div>
        
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {orderItems.map((item, index) => (
            <Card
              key={item.id}
              size="small"
              style={{ 
                marginBottom: '12px',
                borderRadius: '8px',
                border: '2px solid #f0f0f0'
              }}
            >
              <Row gutter={[8, 8]} align="middle">
                <Col xs={2} sm={3}>
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
                <Col xs={7} sm={9}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1890ff' }}>
                      {item.product_code}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.3' }}>
                      {item.product_name}
                    </div>
                  </div>
                </Col>
                <Col xs={9} sm={6}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                    <Button
                      type="primary"
                      shape="circle"
                      size="small"
                      icon={<span style={{ fontSize: '12px' }}>-</span>}
                      onClick={() => updateOrderItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                      style={{ 
                        width: '28px', 
                        height: '28px',
                        minWidth: '28px',
                        padding: '0'
                      }}
                    />
                    <div style={{
                      minWidth: '45px',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#52c41a',
                      padding: '4px 6px',
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
                        width: '28px', 
                        height: '28px',
                        minWidth: '28px',
                        padding: '0'
                      }}
                    />
                  </div>
                </Col>
                <Col xs={6} sm={6}>
                  <Button
                    type="primary"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeOrderItem(item.id)}
                    style={{ 
                      fontSize: '11px',
                      width: '100%',
                      height: '28px'
                    }}
                  >
                    Remove
                  </Button>
                </Col>
              </Row>
            </Card>
          ))}
        </div>
      </Card>

      {/* Order Summary */}
      <Card style={{ marginBottom: '20px', borderRadius: '8px' }}>
        <Row gutter={[8, 12]} align="middle">
          <Col xs={24} sm={12}>
            <div>
              <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                Order Summary
              </Text>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                {orderItems.length} item{orderItems.length !== 1 ? 's' : ''} • 
                Total Quantity: {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              type="default"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => {
                // Save current form data before navigating
                const formValues = form.getFieldsValue();
                localStorage.setItem('tsoFormData', JSON.stringify(formValues));
                window.location.href = '/new-orders';
              }}
              style={{ 
                width: '100%',
                height: '44px',
                fontSize: '13px',
                borderRadius: '8px'
              }}
            >
              Add More
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              type="primary"
              size="large"
              loading={loading}
              icon={<CheckOutlined />}
              onClick={handleSubmit}
              style={{ 
                width: '100%',
                height: '44px',
                fontSize: '14px',
                borderRadius: '8px'
              }}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default ReviewOrdersTablet;
