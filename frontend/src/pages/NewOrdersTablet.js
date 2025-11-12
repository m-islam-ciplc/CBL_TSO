import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
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
  InputNumber,
  Modal,
  Tag,
} from 'antd';
import {
  SearchOutlined,
  CheckOutlined,
  DownOutlined,
  UpOutlined,
  CloseOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// Helper function to remove M/S prefix from dealer names
const removeMSPrefix = (name) => {
  if (!name) return name;
  // Remove "M/S", "M/S.", "M/S " prefix (case insensitive, with or without space/period)
  return name.replace(/^M\/S[.\s]*/i, '').trim();
};

function NewOrdersTablet({ onOrderCreated: _onOrderCreated }) {
  const { territoryName, isTSO, quotaRefreshTrigger } = useUser();
  const [form] = Form.useForm();
  const [dropdownData, setDropdownData] = useState({
    orderTypes: [],
    dealers: [],
    warehouses: [],
    products: [],
    territories: [],
    transports: []
  });
  const [filteredDealers, setFilteredDealers] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isDropdownCollapsed, setIsDropdownCollapsed] = useState(false);
  const [productQuantities, setProductQuantities] = useState({}); // Track quantities for each product
  const [selectedProductForPopup, setSelectedProductForPopup] = useState(null); // Product for popup modal
  const [isPopupVisible, setIsPopupVisible] = useState(false); // Control popup visibility
  const [formValues, setFormValues] = useState({}); // Store form values in state for validation
  const [isAddingMore, setIsAddingMore] = useState(false); // Track if user is adding more items
  const [productQuotas, setProductQuotas] = useState({}); // Store product quotas for today: { product_id: max_quantity }

  function filterDealersByTerritory(territoryCode, territoryName) {
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
  }

  function initializeFormDefaults(orderTypes, warehouses) {
    if (orderTypes.length > 0 && warehouses.length > 0) {
      const initialValues = {
        orderType: orderTypes[0].id,
        warehouse: warehouses[0].id,
        territoryCode: undefined,
        territoryName: undefined,
        dealer: undefined
      };
      form.setFieldsValue(initialValues);
      setFormValues(initialValues); // Store in state
    }
  }

  async function loadDropdownData() {
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

      // Build territory list from dealers
      const territoriesMap = new Map();
      dealersRes.data.forEach(dealer => {
        if (dealer.territory_code && dealer.territory_name) {
          const cleanTerritoryName = dealer.territory_name.replace(/\s+Territory$/i, '');
          territoriesMap.set(dealer.territory_code, {
            code: dealer.territory_code,
            name: cleanTerritoryName
          });
        }
      });
      const territoriesArray = Array.from(territoriesMap.values());
      setDropdownData(prev => ({
        ...prev,
        territories: territoriesArray
      }));

      // Initialize filtered collections
      setFilteredDealers([]);
      setFilteredProducts(productsRes.data);

      // Initialize form with default values if not already set
      const savedFormData = sessionStorage.getItem('tsoFormData');
      if (savedFormData) {
        try {
          const formData = JSON.parse(savedFormData);
          console.log('📁 Loaded saved form data:', formData);

          // Filter dealers synchronously first to check if dealer ID exists
          if (formData.territoryCode) {
            setTimeout(() => {
              const territory = territoriesArray.find(t => t.code === formData.territoryCode);
              if (territory) {
                const filtered = dealersRes.data.filter(dealer => dealer.territory_code === territory.code);
                setFilteredDealers(filtered);

                const dealerExists = formData.dealer && filtered.some(d => d.id === formData.dealer);
                const valuesToSet = { ...formData };
                if (!dealerExists) {
                  valuesToSet.dealer = undefined;
                }

                form.setFieldsValue(valuesToSet);
                setFormValues(valuesToSet);
              } else {
                const { dealer: _ignoredDealer, ...formDataWithoutDealer } = formData;
                form.setFieldsValue(formDataWithoutDealer);
                setFormValues(formDataWithoutDealer);
              }
            }, 100);
          } else {
            // No territory, set form values but clear dealer
            const { dealer: _ignoredDealer, ...formDataWithoutDealer } = formData;
            form.setFieldsValue(formDataWithoutDealer);
            setFormValues(formDataWithoutDealer);
          }
        } catch (_error) {
          console.error('Error parsing saved form data:', _error);
          // Fall back to defaults
          initializeFormDefaults(orderTypesRes.data, warehousesRes.data);
        }
      } else {
        // Initialize form with default values when data is loaded
        initializeFormDefaults(orderTypesRes.data, warehousesRes.data);
      }

    } catch (_error) {
      console.error('Error loading dropdown data:', _error);
      message.error('Failed to load form data');
    }
  }

  useEffect(() => {
    loadDropdownData();
    // Load existing order items from localStorage
    const savedOrderItems = sessionStorage.getItem('tsoOrderItems');
    if (savedOrderItems) {
      try {
        const parsedItems = JSON.parse(savedOrderItems);
        setOrderItems(parsedItems);
        console.log('Loaded existing order items:', parsedItems);
      } catch (_error) {
        console.error('Error parsing saved order items:', _error);
      }
    }
    
    // Check if we have saved form data (means user clicked "Add More")
    const savedFormData = sessionStorage.getItem('tsoFormData');
    if (savedFormData && savedOrderItems) {
      // User has both saved form data and existing order items - they're adding more
      setIsAddingMore(true);
    }
  }, []);

  // Auto-select territory for TSO users
  useEffect(() => {
    if (isTSO && territoryName && dropdownData.territories.length > 0) {
      const savedFormData = sessionStorage.getItem('tsoFormData');
      if (!savedFormData) {
        // Clean territory name from context (remove " Territory" suffix)
        const cleanTerritoryName = territoryName.replace(/\s+Territory$/i, '');
        console.log('🔍 TSO territory lookup:', { territoryName, cleanTerritoryName, availableTerritories: dropdownData.territories });
        
        // Find matching territory
        const matchingTerritory = dropdownData.territories.find(t => t.name === cleanTerritoryName);
        if (matchingTerritory) {
          console.log('✅ Auto-selecting territory for TSO:', matchingTerritory);
          form.setFieldsValue({
            territoryCode: matchingTerritory.code,
            territoryName: matchingTerritory.name
          });
          setFormValues(prev => ({
            ...prev,
            territoryCode: matchingTerritory.code,
            territoryName: matchingTerritory.name
          }));
          filterDealersByTerritory(matchingTerritory.code, matchingTerritory.name);
        } else {
          console.log('❌ No matching territory found for:', cleanTerritoryName);
        }
      }
    }
  }, [isTSO, territoryName, dropdownData.territories]);

  // Load product quotas for TSO users
  const loadProductQuotas = useCallback(async () => {
    if (isTSO && territoryName) {
      try {
        // Add timestamp to prevent caching
        const timestamp = Date.now();
        const response = await axios.get('/api/product-caps/tso-today', {
          params: { 
            territory_name: territoryName,
            _t: timestamp // Cache buster
          }
        });
        
        // Convert array to object: { product_id: { max: max_quantity, remaining: remaining_quantity } }
        const quotasObj = {};
        response.data.forEach(cap => {
          quotasObj[cap.product_id] = {
            max: parseInt(cap.max_quantity) || 0,
            remaining: parseInt(cap.remaining_quantity) || 0 // 0 is a valid remaining quantity value
          };
        });
        
        setProductQuotas(quotasObj);
      } catch (_error) {
        console.error('Failed to load product quotas:', _error);
      }
    }
  }, [isTSO, territoryName]);

  useEffect(() => {
    loadProductQuotas();
  }, [isTSO, territoryName, quotaRefreshTrigger]);

  // SSE for quota updates (for TSO users to see admin changes on different machines)
  useEffect(() => {
    if (!isTSO || !territoryName) return;

    // Use /api/quota-stream for Docker (Nginx proxy) or direct localhost for local dev
    // In Docker: /api/ proxies to backend:3001
    // In local dev: react-scripts proxy doesn't support SSE, so we bypass it
    const sseUrl = process.env.NODE_ENV === 'production' 
      ? '/api/quota-stream' 
      : 'http://localhost:3001/api/quota-stream';
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'quotaChanged') {
        loadProductQuotas();
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [isTSO, territoryName, loadProductQuotas]);

  useEffect(() => {
    // Filter products based on search term AND quota (for TSO users)
    let baseProducts = dropdownData.products;
    
    // For TSO users, only show products that have quotas allocated
    // If there are no quotas allocated, show no products
    if (isTSO) {
        if (Object.keys(productQuotas).length > 0) {
          baseProducts = dropdownData.products.filter(product =>
            Object.prototype.hasOwnProperty.call(productQuotas, product.id)
          );
      } else {
        // No quotas allocated, show no products
        baseProducts = [];
      }
    }
    
    if (searchTerm) {
      const filtered = baseProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(baseProducts);
    }
  }, [searchTerm, dropdownData.products, isTSO, productQuotas]);

  const handleTransportChange = (_value) => {
    // Transport selection handler - no auto-collapse
  };

  const handleDealerChange = (dealerId) => {
    const dealer = dropdownData.dealers.find(d => d.id === dealerId);
    if (dealer) {
      form.setFieldsValue({
        territoryCode: dealer.territory_code,
        territoryName: dealer.territory_name,
        transport: undefined // Clear transport when dealer changes
      });
      filterDealersByTerritory(dealer.territory_code, dealer.territory_name);
    } else {
      // Clear transport when dealer is cleared
      form.setFieldsValue({ transport: undefined });
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

    // Check product quota for TSO users
    if (isTSO && productQuotas) {
      const quotaInfo = productQuotas[product.id];
      
      if (quotaInfo === undefined || quotaInfo === null) {
        message.error(`This product (${product.product_code}) is not allocated to your territory for today.`);
        return false;
      }
      
      const remaining = quotaInfo.remaining;
      
      // Check if quota is exhausted
      if (remaining <= 0) {
        message.error(`Quota exhausted! This product has no remaining units available.`);
        return false;
      }
      
      // Get total quantity for this product in order
      const existingItem = orderItems.find(item => item.product_id === product.id);
      const currentOrderQty = existingItem ? existingItem.quantity : 0;
      const newTotalQty = currentOrderQty + quantity;
      
      if (newTotalQty > remaining) {
        message.error(`Quota exceeded! You have ${remaining} units remaining. Current order: ${currentOrderQty}, trying to add: ${quantity}`);
        return false;
      }
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
    sessionStorage.setItem('tsoOrderItems', JSON.stringify(updatedItems));
    
    // Reset quantity for this product
    setProductQuantities(prev => ({
      ...prev,
      [product.id]: 0
    }));
    
    
    message.success(`${product.product_code} (Qty: ${quantity}) added to order!`);
    return true;
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
                    {form.getFieldValue('dealer') && removeMSPrefix(filteredDealers.find(d => d.id === form.getFieldValue('dealer'))?.name)} • {' '}
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
              // Auto-save form data to localStorage so it persists when navigating via navbar
              const individualValues = {
                orderType: allValues.orderType,
                warehouse: allValues.warehouse,
                territoryCode: allValues.territoryCode,
                dealer: allValues.dealer,
                transport: allValues.transport
              };
              // Only save if there are actual values
              const hasValues = Object.values(individualValues).some(value => value !== undefined && value !== null && value !== '');
              if (hasValues) {
                sessionStorage.setItem('tsoFormData', JSON.stringify(individualValues));
              }
            }}
          >
            <Form.Item name="orderType" hidden><Input /></Form.Item>
            <Form.Item name="warehouse" hidden><Input /></Form.Item>
            <Form.Item name="territoryCode" hidden><Input /></Form.Item>
            <Form.Item name="territoryName" hidden><Input /></Form.Item>

            <Row gutter={[8, 8]} align="middle">
              <Col xs={24} md={12}>
                <Form.Item
                  name="dealer"
                  label={<Text strong style={{ fontSize: '12px' }}>Dealer</Text>}
                  rules={[{ required: true, message: 'Required' }]}
                  style={{ marginBottom: '8px' }}
                >
                    <Select
                    placeholder={form.getFieldValue('territoryCode') ? "Dealer" : "Select territory first"} 
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
                      <Option key={dealer.id} value={dealer.id}>{removeMSPrefix(dealer.name)}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="transport"
                  label={<Text strong style={{ fontSize: '12px' }}>Transport</Text>}
                  rules={[{ required: true, message: 'Required' }]}
                  style={{ marginBottom: '8px' }}
                >
                    <Select
                     placeholder={form.getFieldValue('dealer') ? "Transport" : "Select dealer first"} 
                     size="small"
                     style={{ fontSize: '12px' }}
                     allowClear
                     showSearch
                     onChange={handleTransportChange}
                     disabled={!form.getFieldValue('dealer')}
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
            const allocatedQuota = isTSO && productQuotas[product.id];
            
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
                
                {/* Show allocated quota for TSO users */}
                {isTSO && allocatedQuota && (
                  <div style={{ 
                    fontSize: '10px', 
                    color: allocatedQuota.remaining > 0 ? '#722ed1' : '#ff4d4f',
                    fontWeight: 'bold',
                    backgroundColor: allocatedQuota.remaining > 0 ? '#f9f0ff' : '#fff1f0',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginBottom: '4px'
                  }}>
                    {allocatedQuota.remaining > 0 ? `Remaining: ${allocatedQuota.remaining}` : 'Out of stock'}
                  </div>
                )}
                
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
                    sessionStorage.setItem('tsoFormData', JSON.stringify(individualValues));
                    console.log('✅ Form data saved to localStorage:', individualValues);
                  } else {
                    console.log('❌ No form values to save - form might be empty');
                  }
                  
                  // Verify it was saved
                  const saved = sessionStorage.getItem('tsoFormData');
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
              
              {/* Show remaining quota for TSO users */}
              {isTSO && productQuotas[selectedProductForPopup.id] && (
                <div style={{ 
                  fontSize: '12px', 
                  marginBottom: '16px'
                }}>
                  <Tag color={productQuotas[selectedProductForPopup.id].remaining > 0 ? 'green' : 'red'} style={{ fontSize: '12px', padding: '4px 12px' }}>
                    {productQuotas[selectedProductForPopup.id].remaining > 0 
                      ? `Remaining: ${productQuotas[selectedProductForPopup.id].remaining} units` 
                      : 'Out of stock'}
                  </Tag>
                </div>
              )}
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
                value={productQuantities[selectedProductForPopup.id] > 0 ? productQuantities[selectedProductForPopup.id] : null}
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
                placeholder=""
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
              {[2, 3, 5, 10].map(quickQty => (
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
