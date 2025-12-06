import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import {
  Card,
  Typography,
  Button,
  Input,
  message,
  Row,
  Col,
  InputNumber,
  Tag,
  DatePicker,
  Space,
  Tabs,
} from 'antd';
import {
  SearchOutlined,
  CheckOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './NewOrdersTablet.css';
import { DealerProductCard } from '../templates/DealerProductCard';
import { FILTER_CARD_CONFIG, CONTENT_CARD_CONFIG } from '../templates/CardTemplates';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

function DailyDemandMultiDay() {
  const { dealerId, userId, territoryName } = useUser();
  const [dropdownData, setDropdownData] = useState({
    orderTypes: [],
    products: [],
  });
  const [selectedDates, setSelectedDates] = useState([]);
  const [activeDateTab, setActiveDateTab] = useState(null);
  const [selectedProductsForDate, setSelectedProductsForDate] = useState({}); // { 'YYYY-MM-DD': [productIds] }
  const [quantities, setQuantities] = useState({}); // { 'YYYY-MM-DD_productId': quantity }
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dealerInfo, setDealerInfo] = useState(null);
  const [ddOrderTypeId, setDdOrderTypeId] = useState(null);
  const presetValues = [5, 10, 15, 20];

  // Load dealer information
  useEffect(() => {
    if (dealerId) {
      loadDealerInfo();
    }
  }, [dealerId]);

  // Load dropdown data
  useEffect(() => {
    if (dealerId) {
      loadDropdownData();
    }
  }, [dealerId]);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = dropdownData.products.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_code?.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (!dealerId) return;
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

      setDdOrderTypeId(ddOrderType.id);
      setDropdownData({
        orderTypes: orderTypesRes.data,
        products: productsRes.data || [],
      });
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      message.error('Failed to load form data');
    }
  };

  const handleDateSelect = (date) => {
    if (!date) return;
    const dateStr = date.format('YYYY-MM-DD');
    
    if (!selectedDates.find(d => d.format('YYYY-MM-DD') === dateStr)) {
      const newDates = [...selectedDates, date].sort((a, b) => a.diff(b));
      setSelectedDates(newDates);
      setActiveDateTab(dateStr);
      
      // Initialize empty selection for this date
      setSelectedProductsForDate(prev => ({
        ...prev,
        [dateStr]: []
      }));
    } else {
      message.warning('This date is already selected');
    }
  };

  const handleQuickDateSelect = (daysFromToday) => {
    const date = dayjs().add(daysFromToday, 'day');
    handleDateSelect(date);
  };

  const handleQuantityChange = (dateStr, productId, value) => {
    const key = `${dateStr}_${productId}`;
    const qty = value || 0;
    
    setQuantities(prev => ({
      ...prev,
      [key]: qty
    }));
    
    // Auto-select product when quantity > 0, deselect when 0
    if (qty > 0) {
      setSelectedProductsForDate(prev => {
        const current = prev[dateStr] || [];
        if (!current.includes(productId)) {
          return {
            ...prev,
            [dateStr]: [...current, productId]
          };
        }
        return prev;
      });
    } else {
      setSelectedProductsForDate(prev => {
        const current = prev[dateStr] || [];
        return {
          ...prev,
          [dateStr]: current.filter(id => id !== productId)
        };
      });
    }
  };

  const handleClearProduct = (dateStr, productId) => {
    const key = `${dateStr}_${productId}`;
    
    // Clear quantity
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[key];
      return newQuantities;
    });
    
    // Remove from selected products
    setSelectedProductsForDate(prev => {
      const current = prev[dateStr] || [];
      return {
        ...prev,
        [dateStr]: current.filter(id => id !== productId)
      };
    });
  };

  const removeDate = (dateStr) => {
    const newDates = selectedDates.filter(d => d.format('YYYY-MM-DD') !== dateStr);
    setSelectedDates(newDates);
    
    setSelectedProductsForDate(prev => {
      const newState = { ...prev };
      delete newState[dateStr];
      return newState;
    });
    
    setQuantities(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        if (key.startsWith(`${dateStr}_`)) {
          delete newState[key];
        }
      });
      return newState;
    });
    
    if (activeDateTab === dateStr && newDates.length > 0) {
      setActiveDateTab(newDates[0].format('YYYY-MM-DD'));
    } else if (newDates.length === 0) {
      setActiveDateTab(null);
    }
  };

  const handleSubmit = async () => {
    if (selectedDates.length === 0) {
      message.error('Please select at least one date');
      return;
    }

    // Build demands array from quantities
    const demandsArray = [];
    selectedDates.forEach(date => {
      const dateStr = date.format('YYYY-MM-DD');
      const productIds = selectedProductsForDate[dateStr] || [];
      
      if (productIds.length > 0) {
        const orderItems = productIds
          .map(productId => {
            const quantityKey = `${dateStr}_${productId}`;
            const quantity = quantities[quantityKey] || 0;
            if (quantity > 0) {
              return {
                product_id: Number(productId),
                quantity: Number(quantity)
              };
            }
            return null;
          })
          .filter(item => item !== null);
        
        if (orderItems.length > 0) {
          demandsArray.push({
            date: dateStr,
            order_items: orderItems
          });
        }
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
        
        // Reset form
        setSelectedDates([]);
        setSelectedProductsForDate({});
        setQuantities({});
        setActiveDateTab(null);
        setSearchTerm('');
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

  const getTotalItems = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + (qty || 0), 0);
  };

  const dealerTerritory = dealerInfo?.territory_name || territoryName || '';

  return (
    <div>
      <Title level={3} style={{ marginBottom: '8px' }}>
        <ShoppingCartOutlined /> Daily Demand
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Create your daily product demand orders for multiple days. Select a date, then add products with quantities for that date.
      </Text>

      {/* Date Selection Card */}
      <Card title="Add Dates" {...FILTER_CARD_CONFIG}>
        <Space wrap>
          <Button size="small" onClick={() => handleQuickDateSelect(0)}>
            Today
          </Button>
          <Button size="small" onClick={() => handleQuickDateSelect(1)}>
            Tomorrow
          </Button>
          <Button size="small" onClick={() => handleQuickDateSelect(2)}>
            Day After
          </Button>
          <Button size="small" onClick={() => handleQuickDateSelect(3)}>
            3 Days
          </Button>
          <DatePicker
            placeholder="Or select custom date"
            onChange={handleDateSelect}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            size="small"
          />
        </Space>
      </Card>

      {/* Date Tabs with Product Cards */}
      {selectedDates.length > 0 && (
        <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
          <Tabs
            activeKey={activeDateTab || selectedDates[0]?.format('YYYY-MM-DD')}
            onChange={setActiveDateTab}
            type="editable-card"
            onEdit={(targetKey, action) => {
              if (action === 'remove' && selectedDates.length > 1) {
                removeDate(targetKey);
              } else if (selectedDates.length === 1) {
                message.warning('Cannot remove the last date. Add another date first.');
              }
            }}
            hideAdd
          >
            {selectedDates.map((date) => {
              const dateStr = date.format('YYYY-MM-DD');
              const isToday = date.isSame(dayjs(), 'day');
              const isTomorrow = date.isSame(dayjs().add(1, 'day'), 'day');
              
              let tabLabel = date.format('MMM D');
              if (isToday) tabLabel += ' (Today)';
              else if (isTomorrow) tabLabel += ' (Tomorrow)';

              return (
                <TabPane
                  tab={
                    <span>
                      <CalendarOutlined /> {tabLabel}
                    </span>
                  }
                  key={dateStr}
                >
                  <div style={{ padding: '16px 0' }}>
                    <Title level={5} style={{ marginBottom: '16px' }}>
                      Select Products for {date.format('MMMM D, YYYY')}
                    </Title>

                    <Input
                      placeholder="Search products..."
                      prefix={<SearchOutlined />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ marginBottom: '16px', maxWidth: '300px' }}
                      allowClear
                    />

                    {/* Product Cards Grid */}
                    {filteredProducts.length > 0 ? (
                      <div className="responsive-product-grid">
                        {filteredProducts.map((product) => {
                          const quantityKey = `${dateStr}_${product.id}`;
                          const quantity = quantities[quantityKey] || 0;

                          // Wrapper function to adapt template callback to date-specific handler
                          const handleProductQuantityChange = (productId, value) => {
                            handleQuantityChange(dateStr, productId, value);
                          };

                          const handleProductClear = (productId) => {
                            handleClearProduct(dateStr, productId);
                          };

                          return (
                            <DealerProductCard
                              key={product.id}
                              product={product}
                              quantity={quantity || null}
                              onQuantityChange={handleProductQuantityChange}
                              onClear={handleProductClear}
                              canEdit={true}
                              labelText="Quantity:"
                              presetValues={presetValues}
                              showClearButton={true}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        {searchTerm ? 'No products found matching your search' : 'No products assigned to your dealer account'}
                      </div>
                    )}
                  </div>
                </TabPane>
              );
            })}
          </Tabs>

          {/* Submit Button */}
          {getTotalItems() > 0 && (
            <div style={{ marginTop: '24px', textAlign: 'right', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleSubmit}
                loading={loading}
                size="large"
              >
                Submit All Daily Demands ({getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''})
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default DailyDemandMultiDay;
