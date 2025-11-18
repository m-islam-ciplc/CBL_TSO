import { useState, useEffect } from 'react';
import {
  Card,
  Table,
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
  CopyOutlined,
  ClearOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function MonthlyOrderTab() {
  const { dealerId } = useUser();
  const [periodInfo, setPeriodInfo] = useState({ start: '', end: '' });
  const [products, setProducts] = useState([]);
  const [demandData, setDemandData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const loadProducts = async () => {
    if (!dealerId) return;
    
    try {
      const response = await axios.get(`/api/products?dealer_id=${dealerId}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      message.error('Failed to load products');
    }
  };

  const loadDemand = async () => {
    if (!dealerId || !periodInfo.start) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/monthly-demand/dealer/${dealerId}`);
      const demand = response.data.demand || [];
      
      // Initialize demand data structure: { productId: { date: quantity } }
      const initialData = {};
      products.forEach(product => {
        initialData[product.id] = {};
      });
      
      // Populate with existing demand data
      demand.forEach(item => {
        if (!initialData[item.product_id]) {
          initialData[item.product_id] = {};
        }
        if (item.demand_date) {
          initialData[item.product_id][item.demand_date] = item.quantity;
        }
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

  // Generate dates for the period
  const generateDates = () => {
    if (!periodInfo.start || !periodInfo.end) return [];
    
    const dates = [];
    const start = dayjs(periodInfo.start);
    const end = dayjs(periodInfo.end);
    let current = start;
    
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      dates.push({
        date: current.format('YYYY-MM-DD'),
        label: current.format('D MMM'),
        dayLabel: current.format('D'),
        monthLabel: current.format('MMM'),
      });
      current = current.add(1, 'day');
    }
    
    return dates;
  };

  const dates = generateDates();

  // Initialize demand data for all products and dates
  useEffect(() => {
    if (products.length > 0 && dates.length > 0) {
      const initial = {};
      products.forEach(product => {
        if (!initial[product.id]) {
          initial[product.id] = {};
        }
        dates.forEach(date => {
          if (initial[product.id][date.date] === undefined) {
            initial[product.id][date.date] = demandData[product.id]?.[date.date] || null;
          }
        });
      });
      setDemandData(prev => ({ ...prev, ...initial }));
    }
  }, [products.length, dates.length]);

  // Calculate total for a product
  const calculateTotal = (productId) => {
    const productDemand = demandData[productId] || {};
    return Object.values(productDemand).reduce((sum, qty) => sum + (qty || 0), 0);
  };

  // Handle quantity change
  const handleQuantityChange = (productId, date, value) => {
    setDemandData(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [date]: value || null,
      },
    }));
  };

  // Copy first value to all empty cells in row
  const handleCopyRow = (productId) => {
    const productDemand = demandData[productId] || {};
    const firstValue = Object.values(productDemand).find(qty => qty !== null && qty !== undefined);
    
    if (firstValue === undefined) {
      message.warning('No value to copy. Please enter a value first.');
      return;
    }

    const updated = { ...demandData };
    dates.forEach(date => {
      if (!updated[productId][date.date]) {
        updated[productId][date.date] = firstValue;
      }
    });
    setDemandData(updated);
    message.success('Copied value to empty cells');
  };

  // Clear entire row
  const handleClearRow = (productId) => {
    const updated = { ...demandData };
    dates.forEach(date => {
      updated[productId][date.date] = null;
    });
    setDemandData(updated);
    message.success('Row cleared');
  };

  // Fill weekdays
  const handleFillWeekdays = () => {
    const updated = { ...demandData };
    let filledCount = 0;
    
    products.forEach(product => {
      const productDemand = demandData[product.id] || {};
      const firstValue = Object.values(productDemand).find(qty => qty !== null && qty !== undefined);
      
      if (firstValue !== undefined) {
        dates.forEach(date => {
          const dayOfWeek = dayjs(date.date).day();
          // 0 = Sunday, 6 = Saturday, so weekdays are 1-5
          if (dayOfWeek >= 1 && dayOfWeek <= 5 && !updated[product.id][date.date]) {
            updated[product.id][date.date] = firstValue;
            filledCount++;
          }
        });
      }
    });
    
    setDemandData(updated);
    if (filledCount > 0) {
      message.success(`Filled ${filledCount} weekday cells`);
    } else {
      message.warning('No empty weekday cells to fill. Enter a value first.');
    }
  };

  // Fill weekends
  const handleFillWeekends = () => {
    const updated = { ...demandData };
    let filledCount = 0;
    
    products.forEach(product => {
      const productDemand = demandData[product.id] || {};
      const firstValue = Object.values(productDemand).find(qty => qty !== null && qty !== undefined);
      
      if (firstValue !== undefined) {
        dates.forEach(date => {
          const dayOfWeek = dayjs(date.date).day();
          // 0 = Sunday, 6 = Saturday
          if ((dayOfWeek === 0 || dayOfWeek === 6) && !updated[product.id][date.date]) {
            updated[product.id][date.date] = firstValue;
            filledCount++;
          }
        });
      }
    });
    
    setDemandData(updated);
    if (filledCount > 0) {
      message.success(`Filled ${filledCount} weekend cells`);
    } else {
      message.warning('No empty weekend cells to fill. Enter a value first.');
    }
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
        const productDemand = demandData[product.id] || {};
        dates.forEach(date => {
          const quantity = productDemand[date.date];
          if (quantity !== null && quantity !== undefined && quantity > 0) {
            demands.push({
              product_id: product.id,
              demand_date: date.date,
              quantity: quantity,
            });
          }
        });
      });

      if (demands.length === 0) {
        message.warning('No data to save. Please enter quantities first.');
        setSaving(false);
        return;
      }

      await axios.post('/api/monthly-demand/bulk', {
        dealer_id: dealerId,
        demands: demands,
      });

      message.success(`Successfully saved ${demands.length} demand entries!`);
      // Reload to get updated data
      loadDemand();
    } catch (error) {
      console.error('Error saving demand:', error);
      message.error(error.response?.data?.error || 'Failed to save monthly demand');
    } finally {
      setSaving(false);
    }
  };

  // Build table columns
  const buildColumns = () => {
    const columns = [
      {
        title: 'Product',
        key: 'product',
        fixed: 'left',
        width: 180,
        render: (_, record) => (
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
              {record.name}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.product_code}
            </div>
          </div>
        ),
      },
    ];

    // Add date columns
    dates.forEach(date => {
      columns.push({
        title: (
          <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: '1.2' }}>
            <div style={{ fontWeight: 'bold' }}>{date.dayLabel}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{date.monthLabel}</div>
          </div>
        ),
        key: date.date,
        width: 55,
        align: 'center',
        render: (_, record) => (
          <InputNumber
            size="small"
            min={0}
            value={demandData[record.id]?.[date.date] || null}
            onChange={(value) => handleQuantityChange(record.id, date.date, value)}
            placeholder="0"
            style={{ width: '100%', maxWidth: '50px', fontSize: '12px' }}
            controls={false}
          />
        ),
      });
    });

    // Add total column
    columns.push({
      title: 'Total',
      key: 'total',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Text strong style={{ color: '#1890ff', fontSize: '14px' }}>
          {calculateTotal(record.id)}
        </Text>
      ),
    });

    // Add actions column
    columns.push({
      title: 'Actions',
      key: 'actions',
      width: 60,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopyRow(record.id)}
            title="Copy first value to empty cells"
            style={{ padding: '2px', minWidth: 'auto' }}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<ClearOutlined />}
            onClick={() => handleClearRow(record.id)}
            title="Clear row"
            style={{ padding: '2px', minWidth: 'auto' }}
          />
        </Space>
      ),
    });

    return columns;
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

      {/* Table Card */}
      <Card style={{ borderRadius: '8px' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Table
            columns={buildColumns()}
            dataSource={products}
            rowKey="id"
            pagination={false}
            scroll={{ x: 'max-content', y: 400 }}
            size="small"
            style={{ minWidth: 800 }}
            loading={loading}
          />
        </div>

        {/* Footer Actions */}
        <Row style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
          <Col xs={24} sm={12}>
            <Space wrap>
              <Button size="small" onClick={handleFillWeekdays}>
                Fill Weekdays
              </Button>
              <Button size="small" onClick={handleFillWeekends}>
                Fill Weekends
              </Button>
            </Space>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right', marginTop: '8px' }}>
            <Space>
              <Button onClick={() => {
                const updated = {};
                products.forEach(product => {
                  updated[product.id] = {};
                  dates.forEach(date => {
                    updated[product.id][date.date] = null;
                  });
                });
                setDemandData(updated);
                message.success('All data reset');
              }}>
                Reset
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
