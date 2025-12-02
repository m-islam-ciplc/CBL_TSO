import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import './NewOrdersTablet.css';
import {
  Card,
  Typography,
  Button,
  Form,
  Input,
  message,
  Row,
  Col,
  InputNumber,
  Modal,
  Tag,
  DatePicker,
  Space,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function DailyDemandMultiDay() {
  const { dealerId, userId, territoryName } = useUser();
  const [form] = Form.useForm();
  const [dropdownData, setDropdownData] = useState({
    orderTypes: [],
    products: [],
  });
  const [selectedDates, setSelectedDates] = useState([]);
  const [demands, setDemands] = useState({}); // { 'YYYY-MM-DD': { productId: quantity } }
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProductForPopup, setSelectedProductForPopup] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [dateQuantities, setDateQuantities] = useState({}); // { date: quantity } for popup
  const [loading, setLoading] = useState(false);
  const [dealerInfo, setDealerInfo] = useState(null);
  const [ddOrderTypeId, setDdOrderTypeId] = useState(null);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // Load dealer information
  useEffect(() => {
    if (dealerId) {
      loadDealerInfo();
    }
  }, [dealerId]);

  // Load dropdown data
  useEffect(() => {
    loadDropdownData();
  }, []);

  // Filter products based on search term
  useEffect(() => {
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

  const loadDealerInfo = async () => {
    if (!dealerId) return;
    try {
      const response = await axios.get('/api/dealers');
      const dealer = response.data.find(d => d.id === dealerId);
      if (dealer) {
        setDealerInfo(dealer);
      }
    } catch (error) {
      console.error('Error loading dealer info:', error);
    }
  };

  const loadDropdownData = async () => {
    try {
      const [orderTypesRes, productsRes, dealersRes] = await Promise.all([
        axios.get('/api/order-types'),
        axios.get(`/api/products?dealer_id=${dealerId}`),
        axios.get('/api/dealers')
      ]);

      const ddOrderType = orderTypesRes.data.find(ot => ot.name === 'DD');
      if (!ddOrderType) {
        message.error('DD order type not found. Please contact administrator.');
        return;
      }

      const dealer = dealersRes.data.find(d => d.id === dealerId);
      const dealerTerritory = dealer?.territory_name || territoryName || '';

      setDdOrderTypeId(ddOrderType.id);
      setDropdownData({
        orderTypes: orderTypesRes.data,
        products: productsRes.data,
      });

      form.setFieldsValue({
        orderType: ddOrderType.id,
        territory: dealerTerritory
      });
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      message.error('Failed to load form data');
    }
  };

  const [defaultDatePickerValue, setDefaultDatePickerValue] = useState(dayjs().add(2, 'day'));

  const handleAddDate = () => {
    // Always default to day after tomorrow (3 days from today)
    setDefaultDatePickerValue(dayjs().add(2, 'day'));
    setIsDatePickerVisible(true);
  };

  const handleDateSelect = (date) => {
    if (!date) return;
    
    const dateStr = date.format('YYYY-MM-DD');
    if (!selectedDates.find(d => d.format('YYYY-MM-DD') === dateStr)) {
      setSelectedDates([...selectedDates, date]);
      setIsDatePickerVisible(false);
      // Reset default to day after tomorrow for next time
      setDefaultDatePickerValue(dayjs().add(2, 'day'));
    } else {
      message.warning('This date is already selected');
    }
  };

  const handleQuickDateSelect = (daysFromToday) => {
    const date = dayjs().add(daysFromToday, 'day');
    const dateStr = date.format('YYYY-MM-DD');
    if (!selectedDates.find(d => d.format('YYYY-MM-DD') === dateStr)) {
      setSelectedDates([...selectedDates, date]);
    } else {
      message.warning('This date is already selected');
    }
  };

  const handleRemoveDate = (dateToRemove) => {
    const dateStr = dateToRemove.format('YYYY-MM-DD');
    const newDates = selectedDates.filter(d => !d.isSame(dateToRemove, 'day'));
    setSelectedDates(newDates);
    
    const newDemands = {};
    Object.keys(demands).forEach(d => {
      if (d !== dateStr) {
        newDemands[d] = { ...demands[d] };
      }
    });
    setDemands(newDemands);
    
    message.success('Date removed');
  };

  const showProductPopup = (product) => {
    if (selectedDates.length === 0) {
      message.warning('Please select at least one date first');
      return;
    }
    
    setSelectedProductForPopup(product);
    
    const initialQuantities = {};
    selectedDates.forEach(date => {
      const dateStr = date.format('YYYY-MM-DD');
      initialQuantities[dateStr] = demands[dateStr]?.[product.id] || 0;
    });
    setDateQuantities(initialQuantities);
    
    setIsPopupVisible(true);
  };

  const hideProductPopup = () => {
    setIsPopupVisible(false);
    setSelectedProductForPopup(null);
    setDateQuantities({});
  };

  const handleAddProductToDates = () => {
    if (!selectedProductForPopup) return;

    // Create a deep copy of existing demands to avoid mutation
    const newDemands = {};
    Object.keys(demands).forEach(dateStr => {
      newDemands[dateStr] = { ...demands[dateStr] };
    });
    
    let hasChanges = false;

    selectedDates.forEach(date => {
      const dateStr = date.format('YYYY-MM-DD');
      
      // Ensure each date has its own object (no shared references)
      if (!newDemands[dateStr]) {
        newDemands[dateStr] = {};
      } else {
        newDemands[dateStr] = { ...newDemands[dateStr] };
      }
      
      // Get quantity ONLY for this specific date from dateQuantities state
      // Use explicit undefined check to avoid falsy issues
      const quantity = dateQuantities.hasOwnProperty(dateStr) 
        ? (dateQuantities[dateStr] || 0)
        : (demands[dateStr]?.[selectedProductForPopup.id] || 0);
      
      if (quantity > 0) {
        // Create a completely new object for this date to avoid any reference sharing
        newDemands[dateStr] = {
          ...newDemands[dateStr],
          [selectedProductForPopup.id]: Number(quantity) // Ensure it's a number
        };
        hasChanges = true;
      } else {
        // Remove product from this date only
        const updatedDateDemands = { ...newDemands[dateStr] };
        delete updatedDateDemands[selectedProductForPopup.id];
        if (Object.keys(updatedDateDemands).length === 0) {
          delete newDemands[dateStr];
        } else {
          newDemands[dateStr] = updatedDateDemands;
        }
      }
    });

    if (hasChanges) {
      setDemands(newDemands);
      message.success(`${selectedProductForPopup.product_code} added to selected dates`);
    } else {
      message.warning('Please enter quantities for at least one date');
      return;
    }

    hideProductPopup();
  };

  const handleRemoveProductFromDate = (dateStr, productId) => {
    const newDemands = {};
    Object.keys(demands).forEach(d => {
      if (d === dateStr) {
        const updatedDateDemands = { ...demands[d] };
        delete updatedDateDemands[productId];
        if (Object.keys(updatedDateDemands).length > 0) {
          newDemands[d] = updatedDateDemands;
        }
      } else {
        newDemands[d] = { ...demands[d] };
      }
    });
    
    setDemands(newDemands);
    message.success('Item removed');
  };

  const handleSubmit = async () => {
    if (selectedDates.length === 0) {
      message.error('Please select at least one date');
      return;
    }

    const demandsArray = [];
    selectedDates.forEach(date => {
      const dateStr = date.format('YYYY-MM-DD');
      const dateDemands = demands[dateStr];
      if (dateDemands && Object.keys(dateDemands).length > 0) {
        const orderItems = Object.keys(dateDemands).map(productId => ({
          product_id: Number(productId),
          quantity: Number(dateDemands[productId])
        }));
        demandsArray.push({
          date: dateStr,
          order_items: orderItems
        });
      }
    });

    if (demandsArray.length === 0) {
      message.error('Please add at least one product to at least one date');
      return;
    }

    if (!ddOrderTypeId) {
      message.error('Order type not initialized. Please refresh the page.');
      return;
    }

    if (!dealerId) {
      message.error('Dealer ID not found');
      return;
    }

    const dealerTerritory = dealerInfo?.territory_name || territoryName;
    if (!dealerTerritory) {
      message.error('Territory information not found');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        dealer_id: dealerId,
        territory_name: dealerTerritory,
        user_id: userId,
        demands: demandsArray
      };

      const response = await axios.post('/api/orders/dealer/multi-day', orderData);
      
      if (response.data.success) {
        const totalOrders = response.data.total_orders || demandsArray.length;
        const totalItems = response.data.total_items || demandsArray.reduce((sum, d) => sum + d.order_items.length, 0);
        message.success(`Successfully created ${totalOrders} Daily Demand order(s) with ${totalItems} item(s)!`, 3);
        
        setSelectedDates([]);
        setDemands({});
        sessionStorage.removeItem('dealerOrderItems');
        form.resetFields();
        
        form.setFieldsValue({
          orderType: ddOrderTypeId,
          territory: dealerTerritory
        });
      }
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.details && Array.isArray(errorData.details)) {
        message.error(errorData.details.join(', '));
      } else {
        message.error(errorData?.error || 'Failed to create daily demand orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const getItemsForDate = (dateStr) => {
    return demands[dateStr] || {};
  };

  const getTotalItems = () => {
    return Object.values(demands).reduce((sum, dateDemands) => {
      return sum + Object.values(dateDemands).reduce((dateSum, qty) => dateSum + qty, 0);
    }, 0);
  };

  const dealerTerritory = dealerInfo?.territory_name || territoryName || '';

  return (
    <div>
      <Title level={3} style={{ marginBottom: '8px' }}>
        <ShoppingCartOutlined /> Daily Demand
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Create your daily product demand orders for multiple days
      </Text>

      {/* Dealer Info Card */}
      {dealerInfo && (
        <Card style={{ marginBottom: '16px', borderRadius: '8px', background: '#f0f7ff' }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Text strong>Dealer: </Text>
              <Text>{dealerInfo.name}</Text>
            </Col>
            <Col xs={24} md={12}>
              <Text strong>Territory: </Text>
              <Text>{dealerTerritory}</Text>
            </Col>
          </Row>
        </Card>
      )}

      {/* Order Details Card */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
        <Form
          form={form}
          layout="horizontal"
          size="small"
        >
          <Row gutter={[8, 8]} align="middle">
            <Col xs={24} md={12}>
              <Form.Item
                name="orderType"
                label={<Text strong style={{ fontSize: '12px' }}>Order Type</Text>}
                style={{ marginBottom: '8px' }}
              >
                <Input
                  value="DD (Daily Demand)"
                  disabled
                  style={{ fontSize: '12px', background: '#f5f5f5' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="territory"
                label={<Text strong style={{ fontSize: '12px' }}>Territory</Text>}
                style={{ marginBottom: '8px' }}
              >
                <Input
                  value={dealerTerritory}
                  disabled
                  style={{ fontSize: '12px', background: '#f5f5f5' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Date Selection Card */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
        <Form
          form={form}
          layout="horizontal"
          size="small"
        >
          <Row gutter={[8, 8]} align="middle">
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text strong style={{ fontSize: '12px' }}>Select Dates</Text>}
                style={{ marginBottom: '8px' }}
              >
                <Space wrap>
                  <Button size="small" onClick={() => handleQuickDateSelect(0)}>
                    Today
                  </Button>
                  <Button size="small" onClick={() => handleQuickDateSelect(1)}>
                    Tomorrow
                  </Button>
                  <Button size="small" onClick={() => handleQuickDateSelect(2)}>
                    Day After Tomorrow
                  </Button>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDate} size="small">
                    Add Date
                  </Button>
                </Space>
              </Form.Item>
            </Col>
            {isDatePickerVisible && (
              <Col xs={24} md={12}>
                <Form.Item
                  label={<Text strong style={{ fontSize: '12px' }}>Custom Date</Text>}
                  style={{ marginBottom: '8px' }}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    value={defaultDatePickerValue}
                    onChange={handleDateSelect}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                    open
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
        
        {selectedDates.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <Space wrap>
              {selectedDates.map((date, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => handleRemoveDate(date)}
                  color="blue"
                  style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '20px' }}
                >
                  {date.format('ddd, MMM D')}
                </Tag>
              ))}
            </Space>
          </div>
        )}
      </Card>

      {/* Product Search */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
        <Input
          size="small"
          placeholder="Search products by name or code..."
          prefix={<SearchOutlined />}
          suffix={
            searchTerm && (
              <CloseOutlined 
                onClick={() => setSearchTerm('')}
                style={{ 
                  cursor: 'pointer',
                  color: '#999'
                }}
              />
            )
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: '12px' }}
        />

        {/* Product Grid */}
        <div className="responsive-product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <Card
                key={product.id}
                style={{
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer'
                }}
                bodyStyle={{ padding: '12px' }}
                onClick={() => showProductPopup(product)}
              >
                <div style={{ marginBottom: '8px' }}>
                  <Text strong style={{ fontSize: '13px', display: 'block' }}>
                    {product.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    {product.product_code}
                  </Text>
                </div>
                {product.unit_tp && (
                  <Text style={{ fontSize: '11px', color: '#1890ff' }}>
                    TP: {product.unit_tp}
                  </Text>
                )}
              </Card>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999', gridColumn: '1 / -1' }}>
              {searchTerm ? 'No products found matching your search' : 'No products assigned to your dealer account'}
            </div>
          )}
        </div>
      </Card>

      {/* Order Items Summary - Grouped by Date */}
      {selectedDates.length > 0 && Object.keys(demands).length > 0 && (
        <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
          <Title level={5} style={{ marginBottom: '12px' }}>
            Daily Demands ({selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''})
          </Title>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {selectedDates.map((date, index) => {
              const dateStr = date.format('YYYY-MM-DD');
              const dateItems = getItemsForDate(dateStr);
              const itemCount = Object.keys(dateItems).length;

              if (itemCount === 0) return null;

              return (
                <div key={index} style={{ marginBottom: index < selectedDates.length - 1 ? '16px' : 0 }}>
                  <Text strong style={{ fontSize: '13px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                    {date.format('dddd, MMMM D, YYYY')} ({itemCount} item{itemCount !== 1 ? 's' : ''})
                  </Text>
                  {Object.keys(dateItems).map(productId => {
                    const product = dropdownData.products.find(p => p.id === parseInt(productId));
                    return (
                      <div
                        key={productId}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px',
                          borderBottom: '1px solid #f0f0f0'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <Text strong>{product?.product_code || productId}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>{product?.name || 'Unknown Product'}</Text>
                        </div>
                        <div style={{ textAlign: 'right', marginRight: '16px' }}>
                          <Text strong>Qty: {dateItems[productId]}</Text>
                        </div>
                        <Button
                          danger
                          size="small"
                          icon={<CloseOutlined />}
                          onClick={() => handleRemoveProductFromDate(dateStr, parseInt(productId))}
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleSubmit}
              loading={loading}
              size="large"
            >
              Submit All Daily Demands ({getTotalItems()} items)
            </Button>
          </div>
        </Card>
      )}

      {/* Product Popup Modal */}
      <Modal
        title={
          <div>
            <Text strong>{selectedProductForPopup?.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {selectedProductForPopup?.product_code}
            </Text>
          </div>
        }
        open={isPopupVisible}
        onCancel={hideProductPopup}
        footer={[
          <Button key="cancel" onClick={hideProductPopup}>
            Cancel
          </Button>,
          <Button
            key="add"
            type="primary"
            onClick={handleAddProductToDates}
          >
            Add to Selected Dates
          </Button>
        ]}
        width={600}
      >
        <div style={{ padding: '16px 0' }}>
          <Text strong style={{ display: 'block', marginBottom: '16px' }}>
            Enter quantities for each selected date:
          </Text>
          
          {selectedDates.map((date) => {
            const dateStr = date.format('YYYY-MM-DD');
            const uniqueKey = `${dateStr}-${selectedProductForPopup?.id || 'none'}`;
            
            return (
              <div key={uniqueKey} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Text>{date.format('dddd, MMM D, YYYY')}</Text>
                  <InputNumber
                    min={0}
                    value={dateQuantities[dateStr] || 0}
                    onChange={(value) => {
                      setDateQuantities(prev => ({
                        ...prev,
                        [dateStr]: value || 0
                      }));
                    }}
                    style={{ width: '120px' }}
                  />
                </div>
              </div>
            );
          })}
          
          <Divider />
          
          <div style={{ marginBottom: '12px' }}>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
              Quick presets (apply to all dates):
            </Text>
            <Space wrap>
              {[5, 10, 15, 20, 25, 50].map(presetQty => (
                <Button
                  key={presetQty}
                  size="small"
                  onClick={() => {
                    // Apply preset ONLY to dates that currently have 0 quantity
                    // Do not overwrite existing non-zero quantities
                    setDateQuantities(prev => {
                      const newQuantities = { ...prev };
                      selectedDates.forEach(date => {
                        const dateStr = date.format('YYYY-MM-DD');
                        // Only apply preset if current quantity is 0 or undefined
                        if (!newQuantities[dateStr] || newQuantities[dateStr] === 0) {
                          newQuantities[dateStr] = presetQty;
                        }
                      });
                      return newQuantities;
                    });
                  }}
                >
                  {presetQty}
                </Button>
              ))}
            </Space>
          </div>
          
          {selectedProductForPopup?.unit_tp && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Unit TP: {selectedProductForPopup.unit_tp}
            </Text>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default DailyDemandMultiDay;
