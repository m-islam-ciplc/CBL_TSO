import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  Button,
  InputNumber,
  Typography,
  Row,
  Col,
  Space,
  Tag,
  message,
  Select,
} from 'antd';
import {
  CalendarOutlined,
  ClearOutlined,
  SaveOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import dayjs from 'dayjs';
import './NewOrdersTablet.css';

const { Title, Text } = Typography;
const { Option } = Select;

function MonthlyForecastTab() {
  const { dealerId, userRole, isAdmin, isTSO } = useUser();
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

    // Check if forecast is submitted and user is not admin/TSO
    if (isSubmitted && !isAdmin && !isTSO) {
      message.error('This forecast has already been submitted and cannot be modified. Please contact admin or TSO for changes.');
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
  const hasForecast = selectedPeriod?.has_forecast;
  const canEdit = isCurrentPeriod && (!isSubmitted || isAdmin || isTSO);

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
        <Row justify="space-between" align="middle">
          <Col flex="auto">
            <Title level={3} style={{ margin: 0, fontSize: '20px' }}>
              <CalendarOutlined /> Monthly Forecast
            </Title>
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <Text strong style={{ marginRight: '8px' }}>Select Period:</Text>
                <Select
                  style={{ width: 280 }}
                  value={selectedPeriod ? `${selectedPeriod.period_start}_${selectedPeriod.period_end}` : undefined}
                  onChange={(value) => {
                    const period = availablePeriods.find(p => `${p.period_start}_${p.period_end}` === value);
                    setSelectedPeriod(period);
                  }}
                  loading={loadingPeriods}
                  placeholder="Select forecast period"
                >
                  {availablePeriods.map((period, index) => (
                    <Option key={`${period.period_start}_${period.period_end}`} value={`${period.period_start}_${period.period_end}`}>
                      <Space>
                        {formatPeriodLabel(period)}
                        {period.is_current && <Tag color="green" size="small">Current</Tag>}
                        {!period.is_current && period.has_forecast && <Tag color="blue" size="small"><HistoryOutlined /> Historical</Tag>}
                        {!period.has_forecast && !period.is_current && <Tag color="default" size="small">No Data</Tag>}
                      </Space>
                    </Option>
                  ))}
                </Select>
                {selectedPeriod && (
                  <>
                    <Text strong style={{ marginLeft: '8px' }}>
                      {isCurrentPeriod ? 'Current Period' : 'Historical Period'}
                    </Text>
                    <Tag 
                      color={isCurrentPeriod ? 'green' : 'blue'} 
                      style={{ 
                        marginLeft: '8px',
                        fontWeight: 'bold'
                      }}
                    >
                      {periodInfo.start ? dayjs(periodInfo.start).format('DD MMM YYYY') : ''} - {periodInfo.end ? dayjs(periodInfo.end).format('DD MMM YYYY') : ''}
                    </Tag>
                  </>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Products Card Grid */}
      <Card style={{ borderRadius: '8px', marginBottom: '16px' }}>
        {products.length > 0 ? (
          <div className="responsive-product-grid">
            {products.map(product => (
              <Card
                key={product.id}
                style={{
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                bodyStyle={{ padding: '16px' }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                    {product.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {product.product_code}
                  </Text>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <Text style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                    Monthly Forecast Quantity:
                  </Text>
                  <InputNumber
                    size="large"
                    min={0}
                    value={forecastData[product.id] || null}
                    onChange={(value) => handleQuantityChange(product.id, value)}
                    placeholder="Enter quantity"
                    style={{ width: '100%' }}
                    controls={true}
                    disabled={!canEdit}
                    readOnly={!canEdit}
                  />
                  {canEdit && (
                    <div style={{ 
                      display: 'flex', 
                      gap: '6px', 
                      marginTop: '8px',
                      flexWrap: 'nowrap'
                    }}>
                      {[5, 10, 15, 20].map(presetQty => (
                        <Button
                          key={presetQty}
                          size="small"
                          type={forecastData[product.id] === presetQty ? 'primary' : 'default'}
                          onClick={() => handleQuantityChange(product.id, presetQty)}
                          style={{
                            flex: '1 1 0',
                            fontSize: '12px'
                          }}
                        >
                          {presetQty}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  danger
                  icon={<ClearOutlined />}
                  onClick={() => handleClearProduct(product.id)}
                  style={{ width: '100%' }}
                  size="small"
                  disabled={!canEdit}
                >
                  Clear
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            {loading ? 'Loading products...' : 'No products assigned to this dealer'}
          </div>
        )}
      </Card>

      {/* Footer Actions */}
      {isCurrentPeriod && canEdit && (
        <Card style={{ borderRadius: '8px' }}>
          <Row justify="end">
            <Col>
              <Space>
                <Button onClick={() => {
                  const updated = {};
                  products.forEach(product => {
                    updated[product.id] = null;
                  });
                  setForecastData(updated);
                  message.success('All data reset');
                }}>
                  Reset All
                </Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveAll} loading={saving}>
                  Save All
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      )}
      {isCurrentPeriod && isSubmitted && !isAdmin && !isTSO && (
        <Card style={{ borderRadius: '8px', background: '#fff7e6', border: '1px solid #ffd591' }}>
          <Row justify="center">
            <Col>
              <Text type="warning" strong>
                ⚠️ This forecast has been submitted and cannot be modified. Please contact admin or TSO for changes.
              </Text>
            </Col>
          </Row>
        </Card>
      )}
      {!isCurrentPeriod && (
        <Card style={{ borderRadius: '8px', background: '#fafafa' }}>
          <Row justify="center">
            <Col>
              <Text type="secondary" italic>
                <HistoryOutlined /> This is a historical forecast. You can view but not edit past forecasts.
              </Text>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
}

export default MonthlyForecastTab;

