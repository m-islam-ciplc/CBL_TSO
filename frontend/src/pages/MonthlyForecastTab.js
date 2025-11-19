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
} from 'antd';
import {
  CalendarOutlined,
  ClearOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import dayjs from 'dayjs';
import './NewOrdersTablet.css';

const { Title, Text } = Typography;

function MonthlyForecastTab() {
  const { dealerId } = useUser();
  const [periodInfo, setPeriodInfo] = useState({ start: '', end: '' });
  const [products, setProducts] = useState([]);
  const [forecastData, setForecastData] = useState({}); // { productId: quantity }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const previousProductIdsRef = useRef(new Set());

  useEffect(() => {
    if (dealerId) {
      loadPeriodInfo();
      loadProducts();
      loadForecast();
    }
  }, [dealerId]);

  const loadPeriodInfo = async () => {
    try {
      const response = await axios.get('/api/monthly-forecast/current-period');
      setPeriodInfo(response.data);
    } catch (error) {
      console.error('Error loading period info:', error);
      message.error('Failed to load period information');
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
    if (!dealerId || !periodInfo.start) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/monthly-forecast/dealer/${dealerId}`);
      const forecast = response.data.forecast || [];
      
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

  // Reload forecast when products or period changes
  useEffect(() => {
    if (products.length > 0 && periodInfo.start) {
      loadForecast();
    }
  }, [products.length, periodInfo.start]);

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
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadProducts();
      }
    }, 5000);

    // Also reload when page becomes visible
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
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
        })
      );

      await Promise.all(savePromises);

      message.success(`Successfully saved ${forecasts.length} product forecast(s)!`);
      // Reload to get updated data
      loadForecast();
    } catch (error) {
      console.error('Error saving forecast:', error);
      message.error(error.response?.data?.error || 'Failed to save monthly forecast');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0, fontSize: '20px' }}>
              <CalendarOutlined /> Monthly Forecast
            </Title>
            <Tag color="blue" style={{ marginTop: '8px' }}>
              Period: {periodInfo.start ? dayjs(periodInfo.start).format('DD MMM YYYY') : ''} - {periodInfo.end ? dayjs(periodInfo.end).format('DD MMM YYYY') : ''}
            </Tag>
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
                  />
                </div>

                <Button
                  danger
                  icon={<ClearOutlined />}
                  onClick={() => handleClearProduct(product.id)}
                  style={{ width: '100%' }}
                  size="small"
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
    </div>
  );
}

export default MonthlyForecastTab;

