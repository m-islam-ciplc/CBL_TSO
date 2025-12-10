import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import {
  Typography,
  message,
} from 'antd';
import {
  ShoppingCartOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './NewOrdersTablet.css';
import { 
  STANDARD_PAGE_TITLE_CONFIG, 
  STANDARD_PAGE_SUBTITLE_CONFIG, 
} from '../templates/UITemplates';
import { DailyDemandMultiDayAddDatesCardTemplate } from '../templates/DailyDemandMultiDayAddDatesCardTemplate';
import { DailyDemandMultiDaySelectProductsCardTemplate } from '../templates/DailyDemandMultiDaySelectProductsCardTemplate';

const { Title, Text } = Typography;

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
      const [orderTypesRes, productsRes] = await Promise.all([
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
      
      // Check if error is about existing orders
      if (errorData?.existingOrders) {
        const existingOrders = errorData.existingOrders;
        const datesList = existingOrders.map(e => e.date).join(', ');
        const orderIdsList = existingOrders.map(e => e.order_id).join(', ');
        message.error(`Daily demand order already exists for date(s): ${datesList}. Order ID(s): ${orderIdsList}. You cannot modify existing orders.`, 5);
        
        // Remove dates that already have orders from selected dates
        const datesWithOrdersList = existingOrders.map(e => e.date);
        setSelectedDates(prev => prev.filter(d => !datesWithOrdersList.includes(d.format('YYYY-MM-DD'))));
      } else if (errorData?.details && Array.isArray(errorData.details)) {
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

  return (
    <div>
      <Title {...STANDARD_PAGE_TITLE_CONFIG}>
        <ShoppingCartOutlined /> Daily Demand
      </Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        Create your daily product demand orders for multiple days. Select a date, then add products with quantities for that date.
      </Text>

      {/* Date Selection Card */}
      <DailyDemandMultiDayAddDatesCardTemplate
        title="Add Dates"
        quickDateButtons={[
          { label: 'Today', onClick: () => handleQuickDateSelect(0) },
          { label: 'Tomorrow', onClick: () => handleQuickDateSelect(1) },
          { label: 'Day After', onClick: () => handleQuickDateSelect(2) },
          { label: '3 Days', onClick: () => handleQuickDateSelect(3) },
        ]}
        datePicker={{
          placeholder: 'Or select custom date',
          onChange: handleDateSelect,
          disabledDate: (current) => current && current < dayjs().startOf('day'),
        }}
      />

      {/* Date Tabs with Product Cards */}
      <DailyDemandMultiDaySelectProductsCardTemplate
        selectedDates={selectedDates}
        activeDateTab={activeDateTab}
        setActiveDateTab={setActiveDateTab}
        removeDate={(targetKey) => {
          if (selectedDates.length > 1) {
            removeDate(targetKey);
          } else {
            message.warning('Cannot remove the last date. Add another date first.');
          }
        }}
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        filteredProducts={filteredProducts}
        quantities={quantities}
        onQuantityChange={handleQuantityChange}
        onClearProduct={handleClearProduct}
        presetValues={presetValues}
        getTotalItems={getTotalItems}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}

export default DailyDemandMultiDay;
