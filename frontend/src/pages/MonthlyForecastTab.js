import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Button,
  InputNumber,
  Typography,
  message,
} from 'antd';
import {
  CalendarOutlined,
  SaveOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import dayjs from 'dayjs';
import './NewOrdersTablet.css';
import { 
  STANDARD_PAGE_TITLE_CONFIG, 
  STANDARD_PAGE_SUBTITLE_CONFIG 
} from '../templates/UITemplates';
import { MonthlyForecastSelectPeriodCardTemplate } from '../templates/MonthlyForecastSelectPeriodCardTemplate';
import { MonthlyForecastWarningCardTemplate } from '../templates/MonthlyForecastWarningCardTemplate';
import { MonthlyForecastProductsCardTemplate } from '../templates/MonthlyForecastProductsCardTemplate';

const { Title, Text } = Typography;

function MonthlyForecastTab() {
  const { dealerId, userRole, isTSO, isAdmin, isSalesManager } = useUser();
  const [periodInfo, setPeriodInfo] = useState({ start: '', end: '' });
  const [selectedPeriod, setSelectedPeriod] = useState(null); // { period_start, period_end, is_current }
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [products, setProducts] = useState([]);
  const [forecastData, setForecastData] = useState({}); // { productId: quantity }
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const previousProductIdsRef = useRef(new Set());

  useEffect(() => {
    if (dealerId) {
      loadPeriodInfo();
      loadAvailablePeriods();
      loadProducts();
    }
  }, [dealerId]);

  // Load forecast when period changes
  useEffect(() => {
    if (selectedPeriod && products.length > 0) {
      loadForecast();
    }
  }, [selectedPeriod, products.length]);

  const loadPeriodInfo = async () => {
    try {
      const response = await axios.get('/api/monthly-forecast/current-period');
      setPeriodInfo(response.data);
    } catch (error) {
      console.error('Error loading period info:', error);
      message.error('Failed to load period information');
    }
  };

  const loadAvailablePeriods = async () => {
    if (!dealerId) return;
    
    setLoadingPeriods(true);
    try {
      const response = await axios.get(`/api/monthly-forecast/dealer/${dealerId}/periods`);
      const periods = response.data.periods || [];
      setAvailablePeriods(periods);
      
      // Set current period as default selection
      const currentPeriod = periods.find(p => p.is_current);
      if (currentPeriod) {
        setSelectedPeriod(currentPeriod);
      } else if (periods.length > 0) {
        setSelectedPeriod(periods[0]);
      }
    } catch (error) {
      console.error('Error loading available periods:', error);
      message.error('Failed to load available periods');
    } finally {
      setLoadingPeriods(false);
    }
  };

  const loadProducts = useCallback(async () => {
    if (!dealerId) return;
    
    try {
      const response = await axios.get(`/api/products?dealer_id=${dealerId}`);
      const newProducts = response.data;
      
      // Check if new products were added
      const currentProductIds = new Set(newProducts.map(p => p.id));
      const previousIds = previousProductIdsRef.current;
      const newProductIds = new Set([...currentProductIds].filter(id => !previousIds.has(id)));
      
      if (newProductIds.size > 0) {
        // New products were added - preserve existing forecast data and initialize new products
        setForecastData(prev => {
          const updated = { ...prev };
          newProductIds.forEach(productId => {
            if (updated[productId] === undefined) {
              updated[productId] = null;
            }
          });
          return updated;
        });
        message.success(`${newProductIds.size} new product(s) added!`);
      }
      
      setProducts(newProducts);
      previousProductIdsRef.current = currentProductIds;
    } catch (error) {
      console.error('Error loading products:', error);
      message.error('Failed to load products');
    }
  }, [dealerId]);

  const loadForecast = async () => {
    if (!dealerId || !selectedPeriod) return;
    
    setLoading(true);
    try {
      const params = {
        period_start: selectedPeriod.period_start,
        period_end: selectedPeriod.period_end
      };
      const response = await axios.get(`/api/monthly-forecast/dealer/${dealerId}`, { params });
      const forecast = response.data.forecast || [];
      
      // Update period info from response
      if (response.data.period_start && response.data.period_end) {
        setPeriodInfo({
          start: response.data.period_start,
          end: response.data.period_end
        });
      }
      
      // Update submission status
      setIsSubmitted(response.data.is_submitted || false);
      
      // Initialize forecast data structure: { productId: quantity }
      const initialData = {};
      products.forEach(product => {
        initialData[product.id] = null;
      });
      
      // Populate with existing forecast data - sum all quantities for the period
      forecast.forEach(item => {
        if (initialData[item.product_id] === null || initialData[item.product_id] === undefined) {
          initialData[item.product_id] = 0;
        }
        initialData[item.product_id] += item.quantity || 0;
      });
      
      setForecastData(initialData);
    } catch (error) {
      console.error('Error loading forecast:', error);
      message.error('Failed to load monthly forecast');
    } finally {
      setLoading(false);
    }
  };

  // Format period for display
  const formatPeriodLabel = (period) => {
    if (!period) return '';
    const start = dayjs(period.period_start);
    const end = dayjs(period.period_end);
    const label = `${start.format('MMM YYYY')} - ${end.format('MMM YYYY')}`;
    return label;
  };

  // Auto-refresh products when dealer assignments change (polling every 5 seconds)
  useEffect(() => {
    if (!dealerId) return;

    // Only poll when page is visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProducts();
      }
    };

    // Poll every 5 seconds
    // eslint-disable-next-line no-undef
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadProducts();
      }
    }, 5000);

    // Also reload when page becomes visible
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // eslint-disable-next-line no-undef
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dealerId, loadProducts]);

  // Handle quantity change for a product
  const handleQuantityChange = (productId, value) => {
    setForecastData(prev => ({
      ...prev,
      [productId]: value || null,
    }));
  };

  // Clear forecast for a product
  const handleClearProduct = (productId) => {
    setForecastData(prev => ({
      ...prev,
      [productId]: null,
    }));
    message.success('Forecast cleared');
  };

  // Save all forecast data
  const handleSaveAll = async () => {
    if (!dealerId) {
      message.error('Dealer ID not found');
      return;
    }

    // Only allow saving for current period
    if (!selectedPeriod || !selectedPeriod.is_current) {
      message.warning('You can only edit forecasts for the current period');
      return;
    }

    // Check if forecast is submitted and user is not admin/sales manager
    if (isSubmitted && !isAdmin && !isSalesManager) {
      message.error('This forecast has already been submitted and cannot be modified. Please contact admin or sales manager for changes.');
      return;
    }

    setSaving(true);
    try {
      // Prepare bulk data: only include non-null quantities
      const forecasts = [];
      products.forEach(product => {
        const quantity = forecastData[product.id];
        if (quantity !== null && quantity !== undefined && quantity > 0) {
          forecasts.push({
            product_id: product.id,
            quantity: quantity,
          });
        }
      });

      if (forecasts.length === 0) {
        message.warning('No data to save. Please enter quantities first.');
        setSaving(false);
        return;
      }

      // Save each product's forecast
      const savePromises = forecasts.map(forecast =>
        axios.post('/api/monthly-forecast', {
          dealer_id: dealerId,
          product_id: forecast.product_id,
          quantity: forecast.quantity,
          user_role: userRole, // Pass user role to backend
        })
      );

      await Promise.all(savePromises);

      message.success(`Successfully saved ${forecasts.length} product forecast(s)!`);
      // Reload to get updated data
      loadForecast();
      loadAvailablePeriods(); // Refresh periods to update has_forecast flags
    } catch (error) {
      console.error('Error saving forecast:', error);
      message.error(error.response?.data?.error || 'Failed to save monthly forecast');
    } finally {
      setSaving(false);
    }
  };

  const isCurrentPeriod = selectedPeriod?.is_current;
  const canEdit = isCurrentPeriod && (!isSubmitted || isAdmin || isSalesManager);

  return (
    <div>
      <Title {...STANDARD_PAGE_TITLE_CONFIG}>
        <CalendarOutlined /> Monthly Forecast
      </Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        Submit your monthly product forecast for the selected period.
      </Text>

      {/* Period Selection Card */}
      <MonthlyForecastSelectPeriodCardTemplate
        periodSelect={{
          value: selectedPeriod ? `${selectedPeriod.period_start}_${selectedPeriod.period_end}` : undefined,
          onChange: (value) => {
            const period = availablePeriods.find(p => `${p.period_start}_${p.period_end}` === value);
            setSelectedPeriod(period);
          },
          loading: loadingPeriods,
          placeholder: 'Select forecast period',
          options: availablePeriods,
          formatLabel: formatPeriodLabel,
        }}
        periodInfo={selectedPeriod ? {
          isCurrent: isCurrentPeriod,
          start: periodInfo.start,
          end: periodInfo.end,
        } : null}
      />

      {/* Products Card Grid */}
      <MonthlyForecastProductsCardTemplate
        products={products}
        forecastData={forecastData}
        onQuantityChange={handleQuantityChange}
        onClearProduct={handleClearProduct}
        canEdit={canEdit}
        labelText="Monthly Forecast Quantity:"
        presetValues={[5, 10, 15, 20]}
        loading={loading}
        resetButton={isCurrentPeriod && canEdit ? {
          label: 'Reset All',
          onClick: () => {
            const updated = {};
            products.forEach(product => {
              updated[product.id] = null;
            });
            setForecastData(updated);
            message.success('All data reset');
          },
        } : null}
        saveButton={isCurrentPeriod && canEdit ? {
          label: 'Save All',
          icon: <SaveOutlined />,
          onClick: handleSaveAll,
          loading: saving,
        } : null}
        getTotalItems={() => Object.values(forecastData).filter(qty => qty !== null && qty !== undefined && qty > 0).length}
      />
      {isCurrentPeriod && isSubmitted && !isAdmin && !isSalesManager && (
        <MonthlyForecastWarningCardTemplate
          type="warning"
          message="⚠️ This forecast has been submitted and cannot be modified. Please contact admin or TSO for changes."
        />
      )}
      {!isCurrentPeriod && (
        <MonthlyForecastWarningCardTemplate
          type="info"
          message="This is a historical forecast. You can view but not edit past forecasts."
          icon={<HistoryOutlined />}
        />
      )}
    </div>
  );
}

export default MonthlyForecastTab;

