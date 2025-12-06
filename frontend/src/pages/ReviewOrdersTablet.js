import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  Typography,
  Button,
  Form,
  Row,
  Col,
  message,
  Empty,
  Spin,
  Select,
  Input,
} from 'antd';
import {
  CheckOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useUser } from '../contexts/UserContext';
import { CONTENT_CARD_CONFIG } from '../templates/CardTemplates';
import { STANDARD_PAGE_TITLE_CONFIG, STANDARD_PAGE_SUBTITLE_CONFIG, MINIMAL_ROW_GUTTER, TIGHT_ROW_GUTTER, TIGHT_VERTICAL_ROW_GUTTER, STANDARD_FORM_LABEL_STYLE, STANDARD_FORM_SIZE, STANDARD_INPUT_SIZE, STANDARD_SELECT_SIZE, STANDARD_EMPTY_CONFIG, STANDARD_SPIN_SIZE } from '../templates/UIElements';

const { Title, Text } = Typography;
const { Option } = Select;

// Helper function to remove M/S prefix from dealer names
const removeMSPrefix = (name) => {
  if (!name) return name;
  // Remove "M/S", "M/S.", "M/S " prefix (case insensitive, with or without space/period)
  return name.replace(/^M\/S[.\s]*/i, '').trim();
};

function ReviewOrdersTablet({ onOrderCreated }) {
const { userId } = useUser();
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

  // Load form data when dropdown data is ready
  useEffect(() => {
    if (!dataLoading && dropdownData.orderTypes && dropdownData.orderTypes.length > 0) {
      const savedFormData = sessionStorage.getItem('tsoFormData');
      if (savedFormData) {
        try {
          const formData = JSON.parse(savedFormData);
          console.log('🔍 Auto-loading form data after dropdown data loaded:', formData);
          if (Object.keys(formData).length > 0) {
            // Use setTimeout to ensure form is fully initialized
            setTimeout(() => {
              form.setFieldsValue(formData);
              console.log('✅ Form values auto-set after dropdown loaded');
            }, 100);
          }
        } catch (_error) {
          console.error('Error auto-loading form data:', _error);
        }
      }
    }
  }, [dataLoading, dropdownData, form]);

  useEffect(() => {
    loadDropdownData();
    // Load order items from localStorage or context
    const savedOrderItems = sessionStorage.getItem('tsoOrderItems');
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
      const savedFormData = sessionStorage.getItem('tsoFormData');
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
        } catch (_error) {
          console.error('Error parsing saved form data:', _error);
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

    } catch (_error) {
      console.error('Error loading dropdown data:', _error);
      console.error('Error details:', _error.response?.data || _error.message);
      message.error(`Failed to load form data: ${_error.response?.data?.error || _error.message}`);
    } finally {
      setDataLoading(false);
    }
  };

  const updateOrderItem = (itemId, field, value) => {
    const updatedItems = orderItems.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    );
    setOrderItems(updatedItems);
    sessionStorage.setItem('tsoOrderItems', JSON.stringify(updatedItems));
  };

  const removeOrderItem = (itemId) => {
    const updatedItems = orderItems.filter(item => item.id !== itemId);
    setOrderItems(updatedItems);
    sessionStorage.setItem('tsoOrderItems', JSON.stringify(updatedItems));
  };

  const clearAllItems = () => {
    setOrderItems([]);
    sessionStorage.removeItem('tsoOrderItems');
    sessionStorage.removeItem('tsoFormData');
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
        user_id: userId, // Include user_id to track which TSO created the order
        order_items: orderItems.map(item => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity)
        }))
      };

      // Log order submission attempt
      console.log('📦 Submitting order:', {
        orderData,
        orderItems: orderItems.map(item => ({
          product_id: item.product_id,
          product_code: dropdownData.products.find(p => p.id === item.product_id)?.product_code,
          product_name: item.product_name,
          quantity: item.quantity
        })),
        territory: values.territoryCode,
        dealer: values.dealer
      });

      const response = await axios.post('/api/orders', orderData);
      
      console.log('✅ Order submitted successfully:', response.data);

      if (response.data.success) {
        message.success(`Order created successfully! Order ID: ${response.data.order_id} with ${response.data.item_count} product(s)`, 2);
        
        // Clear the order and form data
        setOrderItems([]);
        sessionStorage.removeItem('tsoOrderItems');
        sessionStorage.removeItem('tsoFormData');
        form.resetFields();
        
        onOrderCreated();
        
        // Redirect to new orders after showing the message
        setTimeout(() => {
          window.location.href = '/new-orders';
        }, 1000);
      }
    } catch (_error) {
      const errorData = _error.response?.data;
      
      // Log full error details to console for debugging
      console.error('❌ Order submission error:', {
        error: _error,
        response: _error.response,
        data: errorData,
        request: {
          url: _error.config?.url,
          method: _error.config?.method,
          data: _error.config?.data
        }
      });
      
      if (errorData?.details && Array.isArray(errorData.details)) {
        // Log validation details to console
        console.error('⚠️ Validation errors:', errorData.details);
        
        // Show detailed validation errors
        message.error({
          content: (
            <div>
              <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>{errorData.error || 'Order validation failed'}:</div>
              {errorData.details.map((error, index) => (
                <div key={index} style={{ marginBottom: '4px' }}>• {error}</div>
              ))}
            </div>
          ),
          duration: 5
        });
      } else {
        console.error('❌ Order submission failed:', errorData?.error || _error.message);
        message.error(`Failed to create order: ${errorData?.error || _error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (orderItems.length === 0) {
    return (
      <div>
        <Title level={3} style={{ marginBottom: '8px' }}>
          <EyeOutlined /> Review Orders
        </Title>
        <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
          Review and submit your orders
        </Text>

        <Card {...CONTENT_CARD_CONFIG} style={{ ...CONTENT_CARD_CONFIG.style, textAlign: 'center' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No items in your order"
            {...STANDARD_EMPTY_CONFIG}
          >
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => window.location.href = '/new-orders'}
            >
              Go to New Orders
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Title {...STANDARD_PAGE_TITLE_CONFIG}>
        <EditOutlined /> Review & Edit Order
      </Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        Review your order before submitting
      </Text>

      {/* Order Form */}
      <Card {...CONTENT_CARD_CONFIG}>
        {dataLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size={STANDARD_SPIN_SIZE} />
            <div style={{ marginTop: '10px', color: '#666' }}>Loading form data...</div>
          </div>
        ) : (
        <div>
          
        <Form
          form={form}
          layout="horizontal"
          size={STANDARD_FORM_SIZE}
        >
          <Row gutter={MINIMAL_ROW_GUTTER} align="middle">
            <Form.Item name="orderType" hidden><Input /></Form.Item>
            <Form.Item name="warehouse" hidden><Input /></Form.Item>
            <Form.Item name="territoryCode" hidden><Input /></Form.Item>

            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                name="dealer"
                label={<Text strong style={STANDARD_FORM_LABEL_STYLE}>Dealer</Text>}
                rules={[{ required: true, message: 'Required' }]}
                style={{ marginBottom: '8px' }}
              >
                  <Select
                  placeholder="Dealer" 
                  size={STANDARD_SELECT_SIZE}
                  style={{ fontSize: '12px' }}
                  disabled
                >
                  {(dropdownData.filteredDealers || dropdownData.dealers) && (dropdownData.filteredDealers || dropdownData.dealers).length > 0 ? (dropdownData.filteredDealers || dropdownData.dealers).map(dealer => (
                    <Option key={dealer.id} value={dealer.id}>{removeMSPrefix(dealer.name)}</Option>
                  )) : (
                    <Option disabled>No dealers loaded</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                name="transport"
                label={<Text strong style={{ fontSize: '12px' }}>Transport</Text>}
                rules={[{ required: true, message: 'Required' }]}
                style={{ marginBottom: '8px' }}
              >
                  <Select
                  placeholder="Transport" 
                  size={STANDARD_SELECT_SIZE}
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
      <Card {...CONTENT_CARD_CONFIG}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={5} style={{ margin: 0 }}>
            📦 Order Items ({orderItems.length})
          </Title>
          <Button
            type="link"
            onClick={clearAllItems}
            style={{ color: '#ff4d4f' }}
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
              <Row gutter={TIGHT_ROW_GUTTER} align="middle">
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
                <Col xs={10} sm={9}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    color: '#1890ff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.product_name}
                  </div>
                </Col>
                <Col xs={12} sm={12} style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Button
                      type="primary"
                      shape="circle"
                      size={STANDARD_SELECT_SIZE}
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
                      minWidth: '35px',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#52c41a',
                      padding: '4px 4px',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      border: '1px solid #f0f0f0'
                    }}>
                      {item.quantity}
                    </div>
                    <Button
                      type="primary"
                      shape="circle"
                      size={STANDARD_SELECT_SIZE}
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
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeOrderItem(item.id)}
                  />
                </Col>
              </Row>
            </Card>
          ))}
        </div>
      </Card>

             {/* Order Summary */}
       <Card {...CONTENT_CARD_CONFIG}>
         <Row gutter={TIGHT_VERTICAL_ROW_GUTTER} align="middle">
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
               onClick={() => {
                 // Clear all order data
                 setOrderItems([]);
                 sessionStorage.removeItem('tsoOrderItems');
                 sessionStorage.removeItem('tsoFormData');
                 form.resetFields();
                 message.info('Order cancelled');
                 window.location.href = '/new-orders';
               }}
              style={{ 
                width: '100%'
              }}
            >
              Cancel Order
            </Button>
          </Col>
          <Col xs={8} sm={4}>
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={() => {
                // Save current form data before navigating
                const formValues = form.getFieldsValue();
                sessionStorage.setItem('tsoFormData', JSON.stringify(formValues));
                window.location.href = '/new-orders';
              }}
              style={{ 
                width: '100%'
              }}
            >
              Add More
            </Button>
          </Col>
          <Col xs={8} sm={4}>
            <Button
              type="primary"
              loading={loading}
              icon={<CheckOutlined />}
              onClick={handleSubmit}
              style={{ 
                width: '100%'
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

