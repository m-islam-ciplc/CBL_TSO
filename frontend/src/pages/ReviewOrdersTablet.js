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
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useUser } from '../contexts/UserContext';

const { Title, Text } = Typography;
const { Option } = Select;

function ReviewOrdersTablet({ onOrderCreated }) {
  const { isTSO } = useUser();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [orderItems, setOrderItems] = useState([]);
  const [dropdownData, setDropdownData] = useState({
    orderTypes: [],
    dealers: [],
    warehouses: [],
    products: [],
    territories: [],
    transports: []
  });
  const [formInitialValues, setFormInitialValues] = useState({});

  // Set form values when initial values change
  useEffect(() => {
    if (Object.keys(formInitialValues).length > 0) {
      console.log('🔍 Setting form values from initial values:', formInitialValues);
      form.setFieldsValue(formInitialValues);
      // Verify the values were set
      setTimeout(() => {
        const currentValues = form.getFieldsValue();
        console.log('✅ Form values after setting from initial values:', currentValues);
      }, 100);
    }
  }, [formInitialValues, form]);

  // Also try to load form data on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('tsoFormData');
    if (savedFormData && !dataLoading) {
      try {
        const formData = JSON.parse(savedFormData);
        console.log('🔍 Auto-loading form data on mount:', formData);
        if (Object.keys(formData).length > 0) {
          form.setFieldsValue(formData);
          console.log('✅ Form values auto-set on mount');
        }
      } catch (error) {
        console.error('Error auto-loading form data:', error);
      }
    }
  }, [dataLoading, form]);

  useEffect(() => {
    loadDropdownData();
    // Load order items from localStorage or context
    const savedOrderItems = localStorage.getItem('tsoOrderItems');
    if (savedOrderItems) {
      setOrderItems(JSON.parse(savedOrderItems));
    }
    
  }, []);

  const loadDropdownData = async () => {
    setDataLoading(true);
    try {
      const [orderTypesRes, dealersRes, warehousesRes, productsRes, transportsRes] = await Promise.all([
        axios.get('/api/order-types'),
        axios.get('/api/dealers'),
        axios.get('/api/warehouses'),
        axios.get('/api/products'),
        axios.get('/api/transports')
      ]);

      // Extract unique territories from dealers
      const territoriesMap = new Map();
      dealersRes.data.forEach(dealer => {
        if (dealer.territory_code && dealer.territory_name) {
          territoriesMap.set(dealer.territory_code, {
            code: dealer.territory_code,
            name: dealer.territory_name.replace(' Territory', '') // Clean territory names
          });
        }
      });
      const territories = Array.from(territoriesMap.values());

      console.log('🔍 Debug - API Data Loaded:');
      console.log('Order Types:', orderTypesRes.data.length);
      console.log('Dealers:', dealersRes.data.length);
      console.log('Warehouses:', warehousesRes.data.length);
      console.log('Products:', productsRes.data.length);
      console.log('Territories:', territories.length);
      console.log('Transports:', transportsRes.data.length);
      console.log('Sample Territory:', territories[0]);
      console.log('Sample Transport:', transportsRes.data[0]);

      setDropdownData({
        orderTypes: orderTypesRes.data,
        dealers: dealersRes.data,
        filteredDealers: dealersRes.data, // Initialize filteredDealers with all dealers
        warehouses: warehousesRes.data,
        products: productsRes.data,
        territories: territories,
        transports: transportsRes.data
      });

      // Load saved form data if it exists - only after dropdown data is ready
      const savedFormData = localStorage.getItem('tsoFormData');
      console.log('🔍 Raw saved form data from localStorage:', savedFormData);
      if (savedFormData) {
        try {
          const formData = JSON.parse(savedFormData);
          console.log('✅ Parsed form data:', formData);
          
          // Wait a bit more to ensure form is fully initialized
          setTimeout(() => {
            setFormInitialValues(formData);
            
            // If territory is selected, filter dealers accordingly
            if (formData.territoryCode) {
              console.log('🔍 Territory code found:', formData.territoryCode);
              const territory = territories.find(t => t.code === formData.territoryCode);
              if (territory) {
                console.log('✅ Territory found:', territory);
                const filtered = dealersRes.data.filter(dealer => 
                  dealer.territory_code === territory.code
                );
                console.log('✅ Filtered dealers:', filtered.length);
                setDropdownData(prev => ({
                  ...prev,
                  filteredDealers: filtered
                }));
              }
            }
          }, 200);
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      } else if (orderTypesRes.data.length > 0 && warehousesRes.data.length > 0) {
        // Initialize form with default values only if no saved form data exists
        const initialValues = {
          orderType: orderTypesRes.data[0].id,
          warehouse: warehousesRes.data[0].id,
          dealer: ''
        };
        setTimeout(() => {
          setFormInitialValues(initialValues);
        }, 200);
      }

    } catch (error) {
      console.error('Error loading dropdown data:', error);
      console.error('Error details:', error.response?.data || error.message);
      message.error(`Failed to load form data: ${error.response?.data?.error || error.message}`);
    } finally {
      setDataLoading(false);
    }
  };

  const handleTerritoryChange = (field, value) => {
    if (field === 'territoryCode') {
      const territory = dropdownData.territories.find(t => t.code === value);
      if (territory) {
        form.setFieldsValue({ 
          territoryName: territory.name,
          dealer: '' // Clear dealer when territory changes
        });
        // Filter dealers by territory
        const filtered = dropdownData.dealers.filter(dealer => 
          dealer.territory_code === territory.code
        );
        setDropdownData(prev => ({
          ...prev,
          filteredDealers: filtered
        }));
      } else {
        form.setFieldsValue({ 
          territoryName: '',
          dealer: '' // Clear dealer when territory is cleared
        });
        setDropdownData(prev => ({
          ...prev,
          filteredDealers: dropdownData.dealers
        }));
      }
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
    if (!values.orderType) {
      message.error('Please select an Order Type');
      return;
    }
    if (!values.warehouse) {
      message.error('Please select a Warehouse');
      return;
    }
    if (!values.territoryCode) {
      message.error('Please select a Territory');
      return;
    }
    if (!values.dealer) {
      message.error('Please select a dealer');
      return;
    }
    if (!values.transport) {
      message.error('Please select a transport');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        order_type_id: values.orderType,
        dealer_id: values.dealer,
        warehouse_id: values.warehouse,
        transport_id: values.transport,
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
              size="small"
              icon={<ArrowLeftOutlined />}
              onClick={() => window.location.href = '/new-orders'}
              style={{
                fontSize: '13px',
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
        {dataLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '10px', color: '#666' }}>Loading form data...</div>
          </div>
        ) : (
        <div>
          
        <Form
          form={form}
          layout="horizontal"
          size="small"
        >
          <Row gutter={[4, 6]} align="middle">
            <Col xs={12} sm={12} md={3} lg={3}>
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
                  disabled
                >
                  {dropdownData.orderTypes.map(type => (
                    <Option key={type.id} value={type.id}>{type.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={12} sm={12} md={4} lg={4}>
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
                  disabled
                >
                  {dropdownData.warehouses.map(warehouse => (
                    <Option key={warehouse.id} value={warehouse.id}>{warehouse.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={4} lg={4}>
              <Form.Item
                name="territoryCode"
                label={<Text strong style={{ fontSize: '12px' }}>Territory</Text>}
                rules={[{ required: true, message: 'Required' }]}
                style={{ marginBottom: '8px' }}
              >
                  <Select
                  placeholder="Territory"
                  size="small"
                  style={{ fontSize: '12px' }}
                  disabled
                >
                  {dropdownData.territories && dropdownData.territories.length > 0 ? dropdownData.territories.map(territory => (
                    <Option key={territory.code} value={territory.code}>{territory.name}</Option>
                  )) : (
                    <Option disabled>No territories loaded</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={7} lg={7}>
              <Form.Item
                name="dealer"
                label={<Text strong style={{ fontSize: '12px' }}>Dealer</Text>}
                rules={[{ required: true, message: 'Required' }]}
                style={{ marginBottom: '8px' }}
              >
                  <Select
                  placeholder="Dealer" 
                  size="small"
                  style={{ fontSize: '12px' }}
                  disabled
                >
                  {(dropdownData.filteredDealers || dropdownData.dealers) && (dropdownData.filteredDealers || dropdownData.dealers).length > 0 ? (dropdownData.filteredDealers || dropdownData.dealers).map(dealer => (
                    <Option key={dealer.id} value={dealer.id}>{dealer.name}</Option>
                  )) : (
                    <Option disabled>No dealers loaded</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={6} lg={6}>
              <Form.Item
                name="transport"
                label={<Text strong style={{ fontSize: '12px' }}>Transport</Text>}
                rules={[{ required: true, message: 'Required' }]}
                style={{ marginBottom: '8px' }}
              >
                  <Select
                  placeholder="Transport" 
                  size="small"
                  style={{ fontSize: '12px' }}
                  disabled
                >
                  {dropdownData.transports && dropdownData.transports.length > 0 ? dropdownData.transports.map(transport => (
                    <Option key={transport.id} value={transport.id}>{transport.truck_details}</Option>
                  )) : (
                    <Option disabled>No transports loaded</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        </div>
        )}
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
            style={{ color: '#ff4d4f', fontSize: '13px' }}
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
                      {item.product_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.3' }}>
                      {item.product_code}
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
                      fontSize: '13px',
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
           <Col xs={8} sm={4}>
             <Button
               danger
               size="small"
               onClick={() => {
                 // Clear all order data
                 setOrderItems([]);
                 localStorage.removeItem('tsoOrderItems');
                 localStorage.removeItem('tsoFormData');
                 form.resetFields();
                 message.info('Order cancelled');
                 window.location.href = '/new-orders';
               }}
               style={{ 
                 width: '100%',
                 fontSize: '13px',
                 borderRadius: '8px'
               }}
             >
               Cancel This Order
             </Button>
           </Col>
           <Col xs={8} sm={4}>
             <Button
               type="default"
               size="small"
               icon={<PlusOutlined />}
               onClick={() => {
                 // Save current form data before navigating
                 const formValues = form.getFieldsValue();
                 localStorage.setItem('tsoFormData', JSON.stringify(formValues));
                 window.location.href = '/new-orders';
               }}
               style={{ 
                 width: '100%',
                 fontSize: '13px',
                 borderRadius: '8px'
               }}
             >
               Add More
             </Button>
           </Col>
           <Col xs={8} sm={4}>
             <Button
               type="primary"
               size="small"
               loading={loading}
               icon={<CheckOutlined />}
               onClick={handleSubmit}
               style={{ 
                 width: '100%',
                 fontSize: '13px',
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

