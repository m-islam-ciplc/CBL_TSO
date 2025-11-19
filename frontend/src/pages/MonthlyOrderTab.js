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

function MonthlyOrderTab() {
  const { dealerId } = useUser();
  const [periodInfo, setPeriodInfo] = useState({ start: '', end: '' });
  const [products, setProducts] = useState([]);
  const [demandData, setDemandData] = useState({}); // { productId: quantity }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const previousProductIdsRef = useRef(new Set());

  useEffect(() => {
    if (dealerId) {
      loadPeriodInfo();
      loadProducts();
      loadDemand();
    }
  }, [dealerId]);

  const loadPeriodInfo = async () => {
    try {
      const response = await axios.get('/api/monthly-demand/current-period');
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
        // New products were added - preserve existing demand data and initialize new products
        setDemandData(prev => {
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

  const loadDemand = async () => {
    if (!dealerId || !periodInfo.start) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/monthly-demand/dealer/${dealerId}`);
      const demand = response.data.demand || [];
      
      // Initialize demand data structure: { productId: quantity }
      const initialData = {};
      products.forEach(product => {
        initialData[product.id] = null;
      });
      
      // Populate with existing demand data - sum all quantities for the period
      demand.forEach(item => {
        if (initialData[item.product_id] === null || initialData[item.product_id] === undefined) {
          initialData[item.product_id] = 0;
        }
        initialData[item.product_id] += item.quantity || 0;
      });
      
      setDemandData(initialData);
    } catch (error) {
      console.error('Error loading demand:', error);
      message.error('Failed to load monthly demand');
    } finally {
      setLoading(false);
    }
  };

  // Reload demand when products or period changes
  useEffect(() => {
    if (products.length > 0 && periodInfo.start) {
      loadDemand();
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
    setDemandData(prev => ({
      ...prev,
      [productId]: value || null,
    }));
  };

  // Clear demand for a product
  const handleClearProduct = (productId) => {
    setDemandData(prev => ({
      ...prev,
      [productId]: null,
    }));
    message.success('Demand cleared');
  };

  // Save all demand data
  const handleSaveAll = async () => {
    if (!dealerId) {
      message.error('Dealer ID not found');
      return;
    }

    setSaving(true);
    try {
      // Prepare bulk data: only include non-null quantities
      const demands = [];
      products.forEach(product => {
        const quantity = demandData[product.id];
        if (quantity !== null && quantity !== undefined && quantity > 0) {
          demands.push({
            product_id: product.id,
            quantity: quantity,
          });
        }
      });

      if (demands.length === 0) {
        message.warning('No data to save. Please enter quantities first.');
        setSaving(false);
        return;
      }

      // Save each product's demand
      const savePromises = demands.map(demand =>
        axios.post('/api/monthly-demand', {
          dealer_id: dealerId,
          product_id: demand.product_id,
          quantity: demand.quantity,
        })
      );

      await Promise.all(savePromises);

      message.success(`Successfully saved ${demands.length} product demand(s)!`);
      // Reload to get updated data
      loadDemand();
    } catch (error) {
      console.error('Error saving demand:', error);
      message.error(error.response?.data?.error || 'Failed to save monthly demand');
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
              <CalendarOutlined /> Monthly Demand
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
                    Monthly Demand Quantity:
                  </Text>
                  <InputNumber
                    size="large"
                    min={0}
                    value={demandData[product.id] || null}
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
                setDemandData(updated);
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

export default MonthlyOrderTab;
