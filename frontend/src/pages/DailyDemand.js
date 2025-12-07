import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import './NewOrdersTablet.css';
import { STANDARD_CARD_CONFIG } from '../templates/CardTemplates';
import { STANDARD_PAGE_TITLE_CONFIG, STANDARD_PAGE_SUBTITLE_CONFIG, SINGLE_ROW_GUTTER, STANDARD_MODAL_CONFIG, STANDARD_INPUT_NUMBER_SIZE, STANDARD_INPUT_SIZE, STANDARD_FORM_SIZE, STANDARD_BUTTON_SIZE } from '../templates/UIElements';
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
} from 'antd';
import {
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

function DailyDemand() {
  const { dealerId, userId, territoryName, isDealer } = useUser();
  const [form] = Form.useForm();
  const [dropdownData, setDropdownData] = useState({
    orderTypes: [],
    products: [],
  });
  const [orderItems, setOrderItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const [selectedProductForPopup, setSelectedProductForPopup] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dealerInfo, setDealerInfo] = useState(null);
  const [ddOrderTypeId, setDdOrderTypeId] = useState(null);

  // Load dealer information
  useEffect(() => {
    if (dealerId) {
      loadDealerInfo();
    }
  }, [dealerId]);

  // Load dropdown data
  useEffect(() => {
    loadDropdownData();
    // Load existing order items from sessionStorage
    const savedOrderItems = sessionStorage.getItem('dealerOrderItems');
    if (savedOrderItems) {
      try {
        const parsedItems = JSON.parse(savedOrderItems);
        setOrderItems(parsedItems);
      } catch (error) {
        console.error('Error parsing saved order items:', error);
      }
    }
  }, []);

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
        axios.get(`/api/products?dealer_id=${dealerId}`), // Show all allocated products (no quota filter for DD)
        axios.get('/api/dealers')
      ]);

      // Find DD order type
      const ddOrderType = orderTypesRes.data.find(ot => ot.name === 'DD');
      if (!ddOrderType) {
        message.error('DD order type not found. Please contact administrator.');
        return;
      }

      // Get dealer info if not already loaded
      const dealer = dealersRes.data.find(d => d.id === dealerId);
      const dealerTerritory = dealer?.territory_name || territoryName || '';

      setDdOrderTypeId(ddOrderType.id);
      setDropdownData({
        orderTypes: orderTypesRes.data,
        products: productsRes.data,
      });

      // Set form with DD order type (fixed, not changeable) and territory
      form.setFieldsValue({
        orderType: ddOrderType.id,
        territory: dealerTerritory
      });
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      message.error('Failed to load form data');
    }
  };

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

  const showProductPopup = (product) => {
    setSelectedProductForPopup(product);
    setIsPopupVisible(true);
  };

  const hideProductPopup = () => {
    setIsPopupVisible(false);
    setSelectedProductForPopup(null);
  };

  const addProductToOrder = (product) => {
    const quantity = productQuantities[product.id] || 1;
    if (quantity === 0) {
      message.warning('Please select a quantity first');
      return false;
    }

    // Validate DD order type is set
    if (!ddOrderTypeId) {
      message.error('Order type not initialized. Please refresh the page.');
      return false;
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
    sessionStorage.setItem('dealerOrderItems', JSON.stringify(updatedItems));
    
    // Reset quantity for this product
    setProductQuantities(prev => ({
      ...prev,
      [product.id]: 0
    }));
    
    message.success(`${product.product_code} (Qty: ${quantity}) added to order!`);
    return true;
  };

  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      message.error('Please add at least one product to the order');
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
        order_type_id: ddOrderTypeId, // Always DD for dealers
        dealer_id: dealerId,
        territory_name: dealerTerritory, // Send territory instead of warehouse
        user_id: userId,
        order_items: orderItems.map(item => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity)
        }))
      };

      const response = await axios.post('/api/orders/dealer', orderData);
      
      if (response.data.success) {
        message.success(`Daily Demand order created successfully! Order ID: ${response.data.order_id} with ${response.data.item_count} product(s)`, 2);
        
        // Clear the order and form data
        setOrderItems([]);
        sessionStorage.removeItem('dealerOrderItems');
        form.resetFields();
        
        // Reset form with DD order type
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
        message.error(errorData?.error || 'Failed to create daily demand order');
      }
    } finally {
      setLoading(false);
    }
  };

  const dealerTerritory = dealerInfo?.territory_name || territoryName || '';

  return (
    <div>
      <Title {...STANDARD_PAGE_TITLE_CONFIG}>
        <ShoppingCartOutlined /> Daily Demand
      </Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        Create your daily product demand orders
      </Text>

      {/* Dealer Info Card */}
      {dealerInfo && (
        <Card title="Dealer Information" {...STANDARD_CARD_CONFIG}>
          <Row gutter={SINGLE_ROW_GUTTER}>
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

      {/* Order Details Card - Fixed Values */}
      <Card {...STANDARD_CARD_CONFIG}>
        <Form
          form={form}
          layout="horizontal"
          size={STANDARD_FORM_SIZE}
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

      {/* Product Search */}
      <Card {...STANDARD_CARD_CONFIG}>
        <Input
          size={STANDARD_INPUT_SIZE}
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
                {!isDealer && product.unit_tp && (
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

      {/* Order Items Summary */}
      {orderItems.length > 0 && (
        <Card {...STANDARD_CARD_CONFIG}>
          <Title level={5} style={{ marginBottom: '12px' }}>
            Order Items ({orderItems.length})
          </Title>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {orderItems.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  borderBottom: '1px solid #f0f0f0'
                }}
              >
                <div style={{ flex: 1 }}>
                  <Text strong>{item.product_code}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>{item.product_name}</Text>
                </div>
                <div style={{ textAlign: 'right', marginRight: '16px' }}>
                  <Text strong>Qty: {item.quantity}</Text>
                </div>
                <Button
                  danger
                  size={STANDARD_BUTTON_SIZE}
                  icon={<CloseOutlined />}
                  onClick={() => {
                    const updatedItems = orderItems.filter(i => i.id !== item.id);
                    setOrderItems(updatedItems);
                    sessionStorage.setItem('dealerOrderItems', JSON.stringify(updatedItems));
                    message.success('Item removed');
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleSubmit}
              loading={loading}
              size={STANDARD_BUTTON_SIZE}
            >
              Submit Daily Demand Order
            </Button>
          </div>
        </Card>
      )}

      {/* Product Popup Modal */}
      <Modal
        {...STANDARD_MODAL_CONFIG}
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
      >
        <div style={{ padding: '16px 0' }}>
          <Text strong style={{ display: 'block', marginBottom: '8px' }}>
            Quantity:
          </Text>
          <InputNumber
            size={STANDARD_INPUT_NUMBER_SIZE}
            min={1}
            value={productQuantities[selectedProductForPopup?.id] || 1}
            onChange={(value) => {
              if (selectedProductForPopup) {
                setProductQuantities(prev => ({
                  ...prev,
                  [selectedProductForPopup.id]: value || 1
                }));
              }
            }}
            style={{ width: '100%', marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {[5, 10, 15, 20, 25, 50].map(presetQty => (
              <Button
                key={presetQty}
                size={STANDARD_BUTTON_SIZE}
                type={productQuantities[selectedProductForPopup?.id] === presetQty ? 'primary' : 'default'}
                onClick={() => {
                  if (selectedProductForPopup) {
                    setProductQuantities(prev => ({
                      ...prev,
                      [selectedProductForPopup.id]: presetQty
                    }));
                  }
                }}
              >
                {presetQty}
              </Button>
            ))}
          </div>
          {!isDealer && selectedProductForPopup?.unit_tp && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Unit TP: {selectedProductForPopup.unit_tp}
            </Text>
          )}
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button size={STANDARD_BUTTON_SIZE} onClick={hideProductPopup}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => {
                if (addProductToOrder(selectedProductForPopup)) {
                  hideProductPopup();
                }
              }}
            >
              Add to Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default DailyDemand;
