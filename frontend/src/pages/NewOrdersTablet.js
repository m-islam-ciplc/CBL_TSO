import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NewOrdersTablet.css';
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
  Collapse,
  Modal,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  DownOutlined,
  UpOutlined,
  CloseOutlined,
  CloseCircleOutlined,
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
    territories: [],
    transports: []
  });
  const [loading, setLoading] = useState(false);
  const [filteredDealers, setFilteredDealers] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isDropdownCollapsed, setIsDropdownCollapsed] = useState(false);
  const [productQuantities, setProductQuantities] = useState({}); // Track quantities for each product
  const [showReview, setShowReview] = useState(false); // Control review modal/page
  const [expandedProductId, setExpandedProductId] = useState(null); // Track single expanded product card
  const [selectedProductForPopup, setSelectedProductForPopup] = useState(null); // Product for popup modal
  const [isPopupVisible, setIsPopupVisible] = useState(false); // Control popup visibility
  const [formValues, setFormValues] = useState({}); // Store form values in state for validation
  const [isAddingMore, setIsAddingMore] = useState(false); // Track if user is adding more items

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
    
    // Check if we have saved form data (means user clicked "Add More")
    const savedFormData = localStorage.getItem('tsoFormData');
    if (savedFormData && savedOrderItems) {
      // User has both saved form data and existing order items - they're adding more
      setIsAddingMore(true);
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
      const [orderTypesRes, dealersRes, warehousesRes, productsRes, transportsRes] = await Promise.all([
        axios.get('/api/order-types'),
        axios.get('/api/dealers'),
        axios.get('/api/warehouses'),
        axios.get('/api/products'),
        axios.get('/api/transports')
      ]);

      setDropdownData({
        orderTypes: orderTypesRes.data,
        dealers: dealersRes.data,
        warehouses: warehousesRes.data,
        products: productsRes.data,
        territories: [],
        transports: transportsRes.data
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
      setFilteredDealers([]); // Start with empty dealers - only show when territory is selected
      setFilteredProducts(productsRes.data); // Initialize filtered products

      // Try to restore saved form data, otherwise use defaults
      const savedFormData = localStorage.getItem('tsoFormData');
      if (savedFormData) {
        try {
          const formData = JSON.parse(savedFormData);
          console.log('Loading saved form data in loadDropdownData:', formData);
          
          // Set form values
          setTimeout(() => {
            form.setFieldsValue(formData);
            setFormValues(formData); // Store in state for validation
            // If territory is saved, filter dealers accordingly
            if (formData.territoryCode) {
              const territory = territories.find(t => t.code === formData.territoryCode);
              if (territory) {
                filterDealersByTerritory(territory.code, territory.name);
              }
            }
          }, 100);
        } catch (error) {
          console.error('Error parsing saved form data:', error);
          // Fall back to defaults
          initializeFormDefaults(orderTypesRes.data, warehousesRes.data);
        }
      } else {
        // Initialize form with default values when data is loaded
        initializeFormDefaults(orderTypesRes.data, warehousesRes.data);
      }

    } catch (error) {
      console.error('Error loading dropdown data:', error);
      message.error('Failed to load form data');
    }
  };

  const initializeFormDefaults = (orderTypes, warehouses) => {
    if (orderTypes.length > 0 && warehouses.length > 0) {
      const initialValues = {
        orderType: orderTypes[0].id,
        warehouse: warehouses[0].id,
        territoryCode: '',
        territoryName: '',
        dealer: ''
      };
      form.setFieldsValue(initialValues);
      setFormValues(initialValues); // Store in state
    }
  };

  // Load products separately when needed
  const loadProducts = async () => {
    try {
      const productsRes = await axios.get('/api/products');
      setDropdownData(prev => ({
        ...prev,
        products: productsRes.data
      }));
      setFilteredProducts(productsRes.data);
    } catch (error) {
      console.error('Error loading products:', error);
      message.error('Failed to load products');
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
    console.log('🔄 Territory change:', { field, value });
    if (field === 'territoryCode') {
      const territory = dropdownData.territories.find(t => t.code === value);
      console.log('🔍 Found territory:', territory);
      if (territory) {
        form.setFieldsValue({ 
          territoryName: territory.name,
          dealer: '' // Clear dealer when territory changes
        });
        filterDealersByTerritory(territory.code, territory.name);
      } else {
        // Clear both territory and dealer when territory is cleared
        form.setFieldsValue({ 
          territoryName: '',
          dealer: '' // Clear dealer when territory is cleared
        });
        filterDealersByTerritory(null, null);
      }
    } else if (field === 'territoryName') {
      const territory = dropdownData.territories.find(t => t.name === value);
      console.log('🔍 Found territory:', territory);
      if (territory) {
        form.setFieldsValue({ 
          territoryCode: territory.code,
          dealer: '' // Clear dealer when territory changes
        });
        filterDealersByTerritory(territory.code, territory.name);
      } else {
        // Clear both territory and dealer when territory is cleared
        form.setFieldsValue({ 
          territoryCode: '',
          dealer: '' // Clear dealer when territory is cleared
        });
        filterDealersByTerritory(null, null);
      }
    }
    // Auto-expand dropdown section when user makes a selection
    if (isDropdownCollapsed) {
      setIsDropdownCollapsed(false);
    }
  };

  const handleTransportChange = (value) => {
    // Auto-collapse the Order Details card when transport is selected
    if (value) {
      setIsDropdownCollapsed(true);
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
    // Auto-expand dropdown section when user makes a selection
    if (isDropdownCollapsed) {
      setIsDropdownCollapsed(false);
    }
  };

  // Show product popup modal
  const showProductPopup = (product) => {
    setSelectedProductForPopup(product);
    setIsPopupVisible(true);
  };

  // Hide product popup modal
  const hideProductPopup = () => {
    setIsPopupVisible(false);
    setSelectedProductForPopup(null);
  };

  // Collapse any expanded card
  const collapseExpandedCard = () => {
    setExpandedProductId(null);
  };

  // Check if dealer is selected (simpler condition)
  const isDealerSelected = () => {
    const formValues = form.getFieldsValue();
    return formValues.dealer;
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
      return false;
    }

    // If adding more products (isAddingMore = true), skip form validation
    // because order details are already set and hidden
    if (!isAddingMore) {
      // Validate that all required order details are filled - use both form.getFieldsValue() and state
      const formCurrentValues = form.getFieldsValue();
      const values = { ...formValues, ...formCurrentValues }; // Merge state and current form values
      
      console.log('🔍 Form values when adding product (from state):', formValues);
      console.log('🔍 Form values when adding product (from form):', formCurrentValues);
      console.log('🔍 Merged values:', values);
      
      if (!values.orderType) {
        message.error('Please select an Order Type first');
        return false;
      }
      if (!values.warehouse) {
        message.error('Please select a Warehouse first');
        return false;
      }
      if (!values.territoryCode) {
        message.error('Please select a Territory first');
        return false;
      }
      if (!values.dealer) {
        message.error('Please select a Dealer first');
        return false;
      }
      if (!values.transport) {
        message.error('Please select a Transport first');
        return false;
      }
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
    
    
    message.success(`${product.product_code} (Qty: ${quantity}) added to order!`);
    return true;
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
    
    // Validate all required fields
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
      message.error('Please select a Dealer');
      return;
    }
    if (!values.transport) {
      message.error('Please select a Transport');
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
        form.resetFields();
        setOrderItems([]);
        setFilteredDealers(dropdownData.dealers);
        setSearchTerm('');
        setIsAddingMore(false);
        localStorage.removeItem('tsoFormData'); // Clear saved form data
        setFormValues({});
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

      {/* Collapsible Order Details - Hide when adding more items to existing order */}
      {!isAddingMore && (
        <Card style={{ marginBottom: '8px', borderRadius: '8px' }}>
          <div 
            style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '8px 0'
            }}
            onClick={() => setIsDropdownCollapsed(!isDropdownCollapsed)}
          >
            <div>
              <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>
                📋 Order Details
              </Text>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                {form.getFieldValue('orderType') && dropdownData.orderTypes.find(t => t.id === form.getFieldValue('orderType'))?.name && (
                  <Text style={{ fontSize: '11px' }}>
                    {dropdownData.orderTypes.find(t => t.id === form.getFieldValue('orderType'))?.name} • {' '}
                    {form.getFieldValue('warehouse') && dropdownData.warehouses.find(w => w.id === form.getFieldValue('warehouse'))?.name} • {' '}
                    {form.getFieldValue('territoryCode') && dropdownData.territories.find(t => t.code === form.getFieldValue('territoryCode'))?.name} • {' '}
                    {form.getFieldValue('dealer') && filteredDealers.find(d => d.id === form.getFieldValue('dealer'))?.name} • {' '}
                    {form.getFieldValue('transport') && dropdownData.transports.find(t => t.id === form.getFieldValue('transport'))?.truck_details}
                  </Text>
                )}
              </div>
            </div>
            {isDropdownCollapsed ? <DownOutlined /> : <UpOutlined />}
          </div>
        
        {!isDropdownCollapsed && (
          <Form
            form={form}
            layout="horizontal"
            size="small"
            style={{ marginTop: '12px' }}
            onValuesChange={(changedValues, allValues) => {
              setFormValues(allValues);
            }}
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
                     allowClear
                     showSearch
                     filterOption={(input, option) => {
                       const optionText = option?.children?.toString() || '';
                       return optionText.toLowerCase().includes(input.toLowerCase());
                     }}
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
                     allowClear
                     showSearch
                     filterOption={(input, option) => {
                       const optionText = option?.children?.toString() || '';
                       return optionText.toLowerCase().includes(input.toLowerCase());
                     }}
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
                     allowClear
                     showSearch
                     filterOption={(input, option) => {
                       const optionText = option?.children?.toString() || '';
                       return optionText.toLowerCase().includes(input.toLowerCase());
                     }}
                     onChange={(value) => handleTerritoryChange('territoryCode', value || '')}
                   >
                    {dropdownData.territories.map(territory => (
                      <Option key={territory.code} value={territory.code}>{territory.name}</Option>
                    ))}
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
                    placeholder={filteredDealers.length === 0 ? "Select territory first" : "Dealer"} 
                    size="small"
                    style={{ fontSize: '12px' }}
                    allowClear
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
                     allowClear
                     showSearch
                     onChange={handleTransportChange}
                     filterOption={(input, option) => {
                       const optionText = option?.children?.toString() || '';
                       return optionText.toLowerCase().includes(input.toLowerCase());
                     }}
                   >
                    {dropdownData.transports.map(transport => (
                      <Option key={transport.id} value={transport.id}>{transport.truck_details}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Card>
      )}

      {/* Compact Product Search */}
      <Card style={{ marginBottom: '12px', borderRadius: '8px' }}>
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
                  color: '#666',
                  fontSize: '14px',
                  padding: '4px',
                  borderRadius: '4px',
                  backgroundColor: '#f0f0f0',
                  minWidth: '20px',
                  minHeight: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            )
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            fontSize: '14px',
            borderRadius: '6px'
          }}
        />
      </Card>

       {/* Responsive Product Grid */}
       <div className="responsive-product-grid">
         {filteredProducts.map(product => {
            const quantity = productQuantities[product.id] || 0;
            
            return (
              <Card
                key={product.id}
                style={{ 
                  borderRadius: '8px',
                  border: quantity > 0 ? '2px solid #52c41a' : '1px solid #f0f0f0',
                  transition: 'all 0.3s',
                  backgroundColor: quantity > 0 ? '#f6ffed' : 'white',
                  cursor: 'pointer'
                }}
                bodyStyle={{ padding: '6px' }}
                onClick={() => showProductPopup(product)}
              >
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#1890ff',
                  marginBottom: '4px'
                }}>
                  {product.name}
                </div>
                <div 
                  className="product-name"
                  style={{ 
                    fontSize: '12px', 
                    color: '#333',
                    marginBottom: '8px',
                    lineHeight: '1.2'
                  }}
                >
                  {product.product_code}
                </div>
                
                {/* Show quantity if added */}
                {quantity > 0 && (
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#52c41a',
                    fontWeight: 'bold',
                    backgroundColor: '#f6ffed',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginBottom: '4px'
                  }}>
                    Qty: {quantity}
                  </div>
                )}
                
                {/* Tap hint */}
                <div style={{ 
                  fontSize: '10px', 
                  color: '#999'
                }}>
                  Tap to configure
                </div>
                
              </div>
            </Card>
          );
        })}
        </div>

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
                  Added: {orderItems.map(item => `${item.product_name} x ${item.quantity}`).join(' • ')}
                </Text>
              </div>
            </Col>
            <Col xs={10} sm={8}>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => {
                  // Save form data to localStorage before navigating
                  const formValues = form.getFieldsValue();
                  console.log('🔍 Raw form.getFieldsValue():', formValues);
                  
                  // Also try to get values individually
                  const individualValues = {
                    orderType: form.getFieldValue('orderType'),
                    warehouse: form.getFieldValue('warehouse'),
                    territoryCode: form.getFieldValue('territoryCode'),
                    dealer: form.getFieldValue('dealer'),
                    transport: form.getFieldValue('transport')
                  };
                  console.log('🔍 Individual field values:', individualValues);
                  
                  // Check if we have any values to save
                  const hasValues = Object.values(individualValues).some(value => value !== undefined && value !== null && value !== '');
                  console.log('🔍 Has form values to save:', hasValues);
                  
                  if (hasValues) {
                    localStorage.setItem('tsoFormData', JSON.stringify(individualValues));
                    console.log('✅ Form data saved to localStorage:', individualValues);
                  } else {
                    console.log('❌ No form values to save - form might be empty');
                  }
                  
                  // Verify it was saved
                  const saved = localStorage.getItem('tsoFormData');
                  console.log('🔍 Verification - saved data:', saved);
                  
                  window.location.href = '/review-orders';
                }}
                style={{ 
                  width: '100%',
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

      {/* Product Configuration Popup Modal */}
      <Modal
        title={
          <div style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}>
            {selectedProductForPopup?.product_code} - {selectedProductForPopup?.name}
          </div>
        }
        open={isPopupVisible}
        onCancel={hideProductPopup}
        footer={null}
        width={400}
        centered
        style={{ top: 20 }}
      >
        {selectedProductForPopup && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            {/* Product Info */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#1890ff',
                marginBottom: '8px'
              }}>
                {selectedProductForPopup.product_code}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#333',
                marginBottom: '16px'
              }}>
                {selectedProductForPopup.name}
              </div>
            </div>

            {/* Quantity Controls */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>-</span>}
                onClick={() => updateProductQuantity(selectedProductForPopup.id, -1)}
                disabled={productQuantities[selectedProductForPopup.id] === 0}
                style={{ 
                  width: '40px', 
                  height: '40px',
                  backgroundColor: productQuantities[selectedProductForPopup.id] > 0 ? '#ff4d4f' : '#d9d9d9',
                  borderColor: productQuantities[selectedProductForPopup.id] > 0 ? '#ff4d4f' : '#d9d9d9'
                }}
              />
              
              <InputNumber
                min={0}
                max={9999}
                value={productQuantities[selectedProductForPopup.id] || 0}
                onChange={(value) => {
                  const newQty = value || 0;
                  setProductQuantities(prev => ({
                    ...prev,
                    [selectedProductForPopup.id]: newQty
                  }));
                }}
                style={{
                  width: '100px',
                  textAlign: 'center',
                  fontSize: '18px',
                  height: '40px'
                }}
                controls={false}
                placeholder="0"
              />
              
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span>}
                onClick={() => {
                  updateProductQuantity(selectedProductForPopup.id, 1);
                }}
                style={{ 
                  width: '40px', 
                  height: '40px',
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a'
                }}
              />
            </div>
            
            {/* Quick Quantity Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              marginBottom: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {[50, 100, 150, 200].map(quickQty => (
                <Button
                  key={quickQty}
                  size="large"
                  type={productQuantities[selectedProductForPopup.id] === quickQty ? 'primary' : 'default'}
                  onClick={() => {
                    setProductQuantities(prev => ({
                      ...prev,
                      [selectedProductForPopup.id]: quickQty
                    }));
                  }}
                  style={{
                    fontSize: '14px',
                    height: '40px',
                    minWidth: '60px',
                    fontWeight: 'bold',
                    padding: '0 16px'
                  }}
                >
                  {quickQty}
                </Button>
              ))}
            </div>

            {/* Add Button */}
            <Button
              type="primary"
              size="large"
              onClick={() => {
                const success = addProductToOrder(selectedProductForPopup);
                if (success) {
                  hideProductPopup();
                }
              }}
              disabled={productQuantities[selectedProductForPopup.id] === 0}
              style={{
                width: '100%',
                height: '50px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '8px',
                backgroundColor: productQuantities[selectedProductForPopup.id] > 0 ? '#52c41a' : '#d9d9d9',
                borderColor: productQuantities[selectedProductForPopup.id] > 0 ? '#52c41a' : '#d9d9d9'
              }}
            >
              {productQuantities[selectedProductForPopup.id] > 0 
                ? `Add ${productQuantities[selectedProductForPopup.id]} to Order` 
                : 'Select Quantity First'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default NewOrdersTablet;
