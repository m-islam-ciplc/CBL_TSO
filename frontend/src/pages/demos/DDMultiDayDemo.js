import { useState } from 'react';
import { Card, Typography, Button, DatePicker, Tag, Space, Input, Row, Col, InputNumber, Modal, Divider } from 'antd';
import { ShoppingCartOutlined, CalendarOutlined, CheckOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './DDMultiDayDemo.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Demo component showing Option 4 (Recommended) approach
function DDMultiDayDemo() {
  const [selectedDates, setSelectedDates] = useState([dayjs(), dayjs().add(1, 'day')]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [demands, setDemands] = useState({}); // { date: { productId: quantity } }
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Mock products
  const products = [
    { id: 25, code: 'L101GT003', name: 'ET140T- L Gaston', tp: 1250 },
    { id: 30, code: 'L101GM130', name: 'EV200T Gaston Premium', tp: 1500 },
    { id: 46, code: 'L101SN127', name: 'EV-250T Sunrise Power', tp: 1800 },
    { id: 36, code: 'L101KI141', name: '6DGA-225(H) Kingshuk Power', tp: 2000 },
  ];

  const handleAddDate = () => {
    // In real implementation, show DatePicker
    const newDate = dayjs().add(selectedDates.length, 'day');
    setSelectedDates([...selectedDates, newDate]);
  };

  const handleRemoveDate = (dateToRemove) => {
    setSelectedDates(selectedDates.filter(d => !d.isSame(dateToRemove, 'day')));
    // Remove demands for this date
    const dateStr = dateToRemove.format('YYYY-MM-DD');
    const newDemands = { ...demands };
    delete newDemands[dateStr];
    setDemands(newDemands);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsProductModalVisible(true);
  };

  const handleAddProductToDates = (productId, quantities) => {
    // quantities: { date: quantity }
    const newDemands = { ...demands };
    Object.keys(quantities).forEach(date => {
      if (!newDemands[date]) newDemands[date] = {};
      if (quantities[date] > 0) {
        newDemands[date][productId] = quantities[date];
      } else {
        delete newDemands[date][productId];
      }
    });
    setDemands(newDemands);
    
    if (!selectedProducts.includes(productId)) {
      setSelectedProducts([...selectedProducts, productId]);
    }
    setIsProductModalVisible(false);
  };

  const handleRemoveProductFromDate = (date, productId) => {
    const dateStr = date.format('YYYY-MM-DD');
    const newDemands = { ...demands };
    if (newDemands[dateStr]) {
      delete newDemands[dateStr][productId];
      if (Object.keys(newDemands[dateStr]).length === 0) {
        delete newDemands[dateStr];
      }
    }
    setDemands(newDemands);
  };

  const getItemsForDate = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    return demands[dateStr] || {};
  };

  const getTotalItems = () => {
    return Object.values(demands).reduce((sum, dateDemands) => {
      return sum + Object.values(dateDemands).reduce((dateSum, qty) => dateSum + qty, 0);
    }, 0);
  };

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Title level={3} style={{ marginBottom: '8px' }}>
        <ShoppingCartOutlined /> Daily Demand - Multi-Day Demo (Option 4)
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Recommended approach: Select dates → Add products → Review grouped by date
      </Text>

      {/* Dealer Info */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px', background: '#f0f7ff' }}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Text strong>Dealer: </Text>
            <Text>M/S Power Battery</Text>
          </Col>
          <Col xs={24} md={12}>
            <Text strong>Territory: </Text>
            <Text>Cumilla Territory</Text>
          </Col>
        </Row>
      </Card>

      {/* Order Details */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
        <Row gutter={[8, 8]}>
          <Col xs={24} md={12}>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Order Type</Text>
            <Input value="DD (Daily Demand)" disabled style={{ background: '#f5f5f5' }} />
          </Col>
          <Col xs={24} md={12}>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Territory</Text>
            <Input value="Cumilla Territory" disabled style={{ background: '#f5f5f5' }} />
          </Col>
        </Row>
      </Card>

      {/* Step 1: Date Selection */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px', background: '#f0f7ff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <Text strong style={{ fontSize: '14px' }}>📅 Step 1: Select Dates for Daily Demand</Text>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Select one or more dates to place demand orders
            </div>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDate}>
            Add Date
          </Button>
        </div>
        
        <Space wrap style={{ marginTop: '12px' }}>
          {selectedDates.map((date, index) => (
            <Tag
              key={index}
              closable
              onClose={() => handleRemoveDate(date)}
              color="blue"
              style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '20px' }}
            >
              📅 {date.format('ddd, MMM D')}
            </Tag>
          ))}
        </Space>
      </Card>

      {/* Step 2: Product Selection */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
        <div style={{ marginBottom: '12px' }}>
          <Text strong style={{ fontSize: '14px' }}>📦 Step 2: Select Products</Text>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Click product to add quantities for selected dates
          </div>
        </div>
        
        <Input
          placeholder="Search products..."
          style={{ marginBottom: '12px' }}
        />

        <div className="responsive-product-grid">
          {products.map(product => (
            <Card
              key={product.id}
              style={{
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }}
              bodyStyle={{ padding: '12px' }}
              onClick={() => handleProductClick(product)}
            >
              <div style={{ marginBottom: '8px' }}>
                <Text strong style={{ fontSize: '13px', display: 'block' }}>
                  {product.name}
                </Text>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {product.code}
                </Text>
              </div>
              <Text style={{ fontSize: '11px', color: '#1890ff' }}>
                TP: {product.tp}
              </Text>
            </Card>
          ))}
        </div>
      </Card>

      {/* Step 3: Demand Summary */}
      {selectedDates.length > 0 && (
        <Card style={{ marginBottom: '16px', borderRadius: '8px', background: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Text strong style={{ fontSize: '14px' }}>📋 Step 3: Review Daily Demands</Text>
            <Space>
              <Tag color="blue">{selectedDates.length} dates</Tag>
              <Tag color="green">{selectedProducts.length} products</Tag>
              <Tag color="orange">{getTotalItems()} total items</Tag>
            </Space>
          </div>

          {selectedDates.map((date, index) => {
            const dateItems = getItemsForDate(date);
            const itemCount = Object.keys(dateItems).length;
            const totalQty = Object.values(dateItems).reduce((sum, qty) => sum + qty, 0);

            if (itemCount === 0 && index === selectedDates.length - 1) return null;

            return (
              <div key={index} style={{ marginBottom: index < selectedDates.length - 1 ? '20px' : 0, paddingBottom: index < selectedDates.length - 1 ? '16px' : 0, borderBottom: index < selectedDates.length - 1 ? '2px solid #e8e8e8' : 'none' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📅 {date.format('dddd, MMMM D, YYYY')}
                  {itemCount > 0 && <Tag color="green">{itemCount} items</Tag>}
                </div>
                
                {itemCount > 0 ? (
                  Object.keys(dateItems).map(productId => {
                    const product = products.find(p => p.id === parseInt(productId));
                    return (
                      <div
                        key={productId}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px',
                          background: 'white',
                          borderRadius: '4px',
                          marginBottom: '8px',
                          border: '1px solid #f0f0f0'
                        }}
                      >
                        <div>
                          <Text strong>{product?.code}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>{product?.name}</Text>
                        </div>
                        <Space>
                          <Text strong>Qty: {dateItems[productId]}</Text>
                          <Button
                            danger
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={() => handleRemoveProductFromDate(date, parseInt(productId))}
                          >
                            Remove
                          </Button>
                        </Space>
                      </div>
                    );
                  })
                ) : (
                  <Text type="secondary" style={{ fontStyle: 'italic' }}>No products added for this date</Text>
                )}
              </div>
            );
          })}
        </Card>
      )}

      {/* Submit Button */}
      {getTotalItems() > 0 && (
        <Card style={{ borderRadius: '8px' }}>
          <div style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              size="large"
              icon={<CheckOutlined />}
              style={{ background: '#52c41a', borderColor: '#52c41a', fontWeight: 'bold' }}
            >
              Submit All Daily Demands ({selectedDates.length} dates, {getTotalItems()} items)
            </Button>
          </div>
        </Card>
      )}

      {/* Product Modal */}
      <Modal
        title={
          <div>
            <Text strong>{selectedProduct?.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {selectedProduct?.code}
            </Text>
          </div>
        }
        open={isProductModalVisible}
        onCancel={() => setIsProductModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsProductModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="add"
            type="primary"
            onClick={() => {
              // In real implementation, get quantities from form
              const quantities = {};
              selectedDates.forEach(date => {
                quantities[date.format('YYYY-MM-DD')] = 5; // Mock value
              });
              handleAddProductToDates(selectedProduct.id, quantities);
            }}
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
          
          {selectedDates.map((date, index) => (
            <div key={index} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>{date.format('dddd, MMM D, YYYY')}</Text>
                <InputNumber
                  min={0}
                  defaultValue={0}
                  style={{ width: '120px' }}
                />
              </div>
            </div>
          ))}
          
          <Divider />
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {[5, 10, 15, 20, 25, 50].map(presetQty => (
              <Button
                key={presetQty}
                size="small"
                onClick={() => {
                  // Apply preset to all dates
                }}
              >
                {presetQty}
              </Button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default DDMultiDayDemo;

