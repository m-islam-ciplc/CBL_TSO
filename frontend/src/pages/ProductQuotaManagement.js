import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import {
  Card,
  Table,
  Button,
  InputNumber,
  DatePicker,
  message,
  Space,
  Typography,
  Row,
  Col,
  Input,
  AutoComplete,
  Tag,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getStandardPaginationConfig } from '../templates/useStandardPagination';

const { Title, Text } = Typography;

function ProductQuotaManagement() {
  const { triggerQuotaRefresh } = useUser();
  const [products, setProducts] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [quotas, setQuotas] = useState({}); // { productId_territory: quantity }
  const [, setLoading] = useState(false);
  const [editingQuota, setEditingQuota] = useState(null); // Track which quota is being edited
  const [pendingQuotaValue, setPendingQuotaValue] = useState(null); // Track pending edit value
  
  // New allocation flow state
  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [territoryInput, setTerritoryInput] = useState('');
  const [selectedTerritories, setSelectedTerritories] = useState([]);
  const [quotaValue, setQuotaValue] = useState('');

  // Historical quotas view state
  const [historyDate, setHistoryDate] = useState(dayjs());
  const [historyAllocations, setHistoryAllocations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('allocate');
  
  // Filtered options for dropdowns
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredTerritories, setFilteredTerritories] = useState([]);

  useEffect(() => {
    loadProducts();
    loadTerritories();
  }, []);

  useEffect(() => {
    loadQuotas();
  }, [selectedDate]);

useEffect(() => {
  if (activeTab === 'history') {
    loadHistoryQuotas();
  }
}, [historyDate, activeTab]);

  // SSE for real-time quota updates when TSO creates orders
  useEffect(() => {
    // Use /api/quota-stream for Docker (Nginx proxy) or direct localhost for local dev
    const sseUrl = process.env.NODE_ENV === 'production' 
      ? '/api/quota-stream' 
      : 'http://localhost:3001/api/quota-stream';
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'quotaChanged') {
        loadQuotas();
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [selectedDate]);

  useEffect(() => {
    if (productSearch) {
      // Filter out already selected products
      const filtered = products.filter(p => 
        !selectedProducts.some(sp => sp.id === p.id) &&
        (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
         p.product_code.toLowerCase().includes(productSearch.toLowerCase()))
      );
      setFilteredProducts(filtered);
    } else {
      const filtered = products.filter(p => !selectedProducts.some(sp => sp.id === p.id));
      setFilteredProducts(filtered);
    }
  }, [productSearch, products, selectedProducts]);

  useEffect(() => {
    if (territoryInput) {
      // Filter out already selected territories
      const filtered = territories.filter(t => 
        !selectedTerritories.includes(t) &&
        t.toLowerCase().includes(territoryInput.toLowerCase())
      );
      setFilteredTerritories(filtered);
    } else {
      const filtered = territories.filter(t => !selectedTerritories.includes(t));
      setFilteredTerritories(filtered);
    }
  }, [territoryInput, territories, selectedTerritories]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (_error) {
      console.error('Failed to load products:', _error);
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadTerritories = async () => {
    try {
      const response = await axios.get('/api/dealers/territories');
      setTerritories(response.data);
    } catch (_error) {
      console.error('Failed to load territories:', _error);
    }
  };

  const loadQuotas = async () => {
    if (!selectedDate) return;
    
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const response = await axios.get(`/api/product-caps?date=${dateStr}`);
      
      // Convert API response to quotas object with sold info
      const quotasObj = {};
      response.data.forEach(cap => {
        const key = `${cap.product_id}_${cap.territory_name}`;
        quotasObj[key] = {
          max_quantity: cap.max_quantity,
          remaining_quantity: cap.remaining_quantity !== undefined && cap.remaining_quantity !== null ? cap.remaining_quantity : 0, // remaining_quantity can be 0, preserve 0 as valid value
          sold_quantity: cap.sold_quantity !== undefined && cap.sold_quantity !== null ? cap.sold_quantity : 0 // Use actual sold quantity from orders
        };
      });
      
      setQuotas(quotasObj);
    } catch (_error) {
      console.error('Failed to load quotas:', _error);
      // No quotas for this date is normal
      setQuotas({});
    }
  };

  const loadHistoryQuotas = async () => {
    if (!historyDate) {
      setHistoryAllocations([]);
      return;
    }

    try {
      setHistoryLoading(true);
      const dateStr = historyDate.format('YYYY-MM-DD');
      const response = await axios.get(`/api/product-caps?date=${dateStr}`);
      const rows = (response.data || []).map(cap => ({
        key: `${cap.product_id}_${cap.territory_name}_${cap.date}`,
        date: cap.date,
        territoryName: cap.territory_name,
        productCode: cap.product_code,
        productName: cap.product_name,
        quantity: Number(cap.max_quantity) || 0,
        sold: Number(cap.sold_quantity) || 0,
        remaining: Number(cap.remaining_quantity) || 0,
      }));
      setHistoryAllocations(rows);
    } catch (_error) {
      console.error('Failed to load historical quotas:', _error);
      setHistoryAllocations([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAddProduct = (product) => {
    if (!selectedProducts.some(p => p.id === product.id)) {
      setSelectedProducts(prev => [...prev, product]);
      setProductSearch('');
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleAddTerritory = (territory) => {
    if (!selectedTerritories.includes(territory)) {
      setSelectedTerritories(prev => [...prev, territory]);
      setTerritoryInput('');
    }
  };

  const handleRemoveTerritory = (territory) => {
    setSelectedTerritories(prev => prev.filter(t => t !== territory));
  };

  const handleAddAllocation = async () => {
    if (selectedProducts.length === 0) {
      message.error('Please select at least one product');
      return;
    }
    if (selectedTerritories.length === 0) {
      message.error('Please select at least one territory');
      return;
    }
    if (!quotaValue || isNaN(quotaValue) || parseInt(quotaValue) <= 0) {
      message.error('Please enter a valid quota amount');
      return;
    }
    if (!selectedDate) {
      message.error('Please select a date');
      return;
    }

    // Prepare quotas to save
    const dateStr = selectedDate.format('YYYY-MM-DD');
    const quotasToSave = [];
    
    selectedProducts.forEach(product => {
      selectedTerritories.forEach(territory => {
        quotasToSave.push({
          date: dateStr,
          product_id: product.id,
          product_code: product.product_code,
          product_name: product.name,
          territory_name: territory,
          max_quantity: parseInt(quotaValue)
        });
      });
    });

    // Update local state first
    const newQuotas = { ...quotas };
    selectedProducts.forEach(product => {
      selectedTerritories.forEach(territory => {
        const key = `${product.id}_${territory}`;
        const existingQuota = newQuotas[key];
        const currentMax = typeof existingQuota === 'number' ? existingQuota : (existingQuota?.max_quantity || 0);
        const newMax = currentMax + parseInt(quotaValue);
        newQuotas[key] = {
          max_quantity: newMax
        };
      });
    });
    setQuotas(newQuotas);

    // Save to database
    try {
      await axios.post('/api/product-caps/bulk', { quotas: quotasToSave });
      message.success(`Allocated ${quotaValue} units of ${selectedProducts.length} product(s) to ${selectedTerritories.length} territory/ies`);
      
      // Reload to ensure consistency
      await loadQuotas();
      
      // Trigger refresh in all TSO pages
      triggerQuotaRefresh();
    } catch (_error) {
      console.error('Error adding quotas:', _error);
      message.error('Failed to save quotas to database');
      // Revert local state on error
      loadQuotas();
    }
    
    // Reset form
    setSelectedProducts([]);
    setSelectedTerritories([]);
    setProductSearch('');
    setTerritoryInput('');
    setQuotaValue('');
  };

  const handleDeleteAllocation = async (productId, territoryName) => {
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const response = await axios.delete(`/api/product-caps/${dateStr}/${productId}/${encodeURIComponent(territoryName)}`);
      
      if (response.data.success) {
        // Remove from local state
        const key = `${productId}_${territoryName}`;
        const newQuotas = { ...quotas };
        delete newQuotas[key];
        setQuotas(newQuotas);
        message.success('Quota deleted from database');
      }
    } catch (_error) {
      console.error('Error deleting quota:', _error);
      message.error('Failed to delete quota from database');
    }
  };

  // Get all current allocations for display
  const getAllocations = () => {
    const allocations = [];
    
    Object.entries(quotas).forEach(([key, quotaData]) => {
      const quantity = typeof quotaData === 'number' ? quotaData : quotaData.max_quantity;
      const remaining = typeof quotaData === 'number' ? quotaData : quotaData.remaining_quantity;
      // Use sold_quantity from backend (calculated from actual orders), fallback to calculation if not available
      const sold = typeof quotaData === 'object' && quotaData.sold_quantity !== undefined 
        ? quotaData.sold_quantity 
        : quantity - remaining;
      
      if (quantity > 0) {
        const [productId, territoryName] = key.split('_');
        const product = products.find(p => p.id == productId);
        if (product) {
          allocations.push({
            key,
            productId: product.id,
            productCode: product.product_code,
            productName: product.name,
            territoryName,
            quantity,
            remaining,
            sold,
            date: selectedDate ? selectedDate.format('YYYY-MM-DD') : ''
          });
        }
      }
    });

    return allocations.sort((a, b) => {
      if (a.territoryName !== b.territoryName) {
        return a.territoryName.localeCompare(b.territoryName);
      }
      return a.productName.localeCompare(b.productName);
    });
  };

  const handleQuotaInputChange = (productId, territoryName, value) => {
    const key = `${productId}_${territoryName}`;
    setEditingQuota(key);
    setPendingQuotaValue(value);
  };

  const handleConfirmQuotaUpdate = async () => {
    if (!editingQuota || pendingQuotaValue === null) return;
    
    const key = editingQuota;
    const [productId, territoryName] = key.split('_');
    const newMaxQuantity = parseInt(pendingQuotaValue) || 0;
    
    // Clear editing state
    setEditingQuota(null);
    setPendingQuotaValue(null);
    
    // If quota is set to 0, delete it from database
    if (newMaxQuantity === 0) {
      try {
        const dateStr = selectedDate.format('YYYY-MM-DD');
        
        await axios.delete(`/api/product-caps/${dateStr}/${productId}/${encodeURIComponent(territoryName)}`);
        
        // Remove from local state
        const newQuotas = { ...quotas };
        delete newQuotas[key];
        setQuotas(newQuotas);
        
        message.success('Quota deleted successfully');
        // Reload to ensure consistency
        await loadQuotas();
        
        // Trigger refresh in all TSO pages
        triggerQuotaRefresh();
      } catch (_error) {
        console.error('Error deleting quota:', _error);
        message.error('Failed to delete quota from database');
        // Revert local state on error
        loadQuotas();
      }
      return;
    }
    
    // Otherwise, update the quota
    const currentQuota = quotas[key];
    const soldQuantity = typeof currentQuota === 'object' && currentQuota.sold_quantity !== undefined 
      ? parseInt(currentQuota.sold_quantity) || 0 
      : 0;
    
    // Validate: newMaxQuantity cannot be less than soldQuantity
    if (newMaxQuantity < soldQuantity) {
      message.error(`Cannot reduce quota below sold quantity (${soldQuantity}). You cannot set max_quantity to ${newMaxQuantity} when ${soldQuantity} has already been sold.`);
      return;
    }
    
    // Update local state first for immediate UI feedback
    setQuotas(prev => ({
      ...prev,
      [key]: {
        max_quantity: newMaxQuantity,
        remaining_quantity: null // Will be calculated by backend
      }
    }));
    
    // Save to database using the PUT endpoint
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      
      await axios.put(`/api/product-caps/${dateStr}/${productId}/${encodeURIComponent(territoryName)}`, {
        max_quantity: newMaxQuantity
      });
      
      message.success('Quota updated successfully');
      // Reload to ensure consistency
      await loadQuotas();
      
      // Trigger refresh in all TSO pages
      triggerQuotaRefresh();
    } catch (_error) {
      console.error('Error updating quota:', _error);
      message.error('Failed to update quota in database');
      // Revert local state on error
      loadQuotas();
    }
  };

  // Disable all dates except today
  const disabledDate = (current) => {
    if (!current) return false;
    const today = dayjs().startOf('day');
    return !current.isSame(today, 'day');
  };

  const disabledHistoryDate = (current) => {
    if (!current) return false;
    return current.isAfter(dayjs(), 'day');
  };

  const allocationColumns = [
    {
      title: 'Territory',
      dataIndex: 'territoryName',
      key: 'territoryName',
      ellipsis: true,
      sorter: (a, b) => (a.territoryName || '').localeCompare(b.territoryName || ''),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      ellipsis: true,
      sorter: (a, b) => (a.date || '').localeCompare(b.date || ''),
    },
    {
      title: 'Product Code',
      dataIndex: 'productCode',
      key: 'productCode',
      ellipsis: true,
      sorter: (a, b) => (a.productCode || '').localeCompare(b.productCode || ''),
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: {
        showTitle: true,
      },
      sorter: (a, b) => (a.productName || '').localeCompare(b.productName || ''),
    },
    {
      title: 'Quota',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
      ellipsis: true,
      sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0),
      render: (quantity, record) => {
        const key = `${record.productId}_${record.territoryName}`;
        const isEditing = editingQuota === key;
        const displayValue = isEditing ? pendingQuotaValue : quantity;
        
        return (
          <InputNumber
            min={0}
            max={999999}
            value={displayValue}
            onChange={(value) => handleQuotaInputChange(record.productId, record.territoryName, value)}
            style={{ width: '100%' }}
          />
        );
      },
    },
    {
      title: 'Update',
      key: 'update',
      width: 90,
      align: 'center',
      render: (_, record) => {
        const key = `${record.productId}_${record.territoryName}`;
        const isEditing = editingQuota === key;
        const displayValue = isEditing ? pendingQuotaValue : record.quantity;
        const hasChanged = isEditing && displayValue !== record.quantity;
        
        return (
          <Button
            type={hasChanged ? 'primary' : 'default'}
            icon={<CheckOutlined />}
            onClick={handleConfirmQuotaUpdate}
            disabled={!hasChanged}
            size="small"
          >
            Update
          </Button>
        );
      },
    },
    {
      title: 'Sold',
      dataIndex: 'sold',
      key: 'sold',
      align: 'right',
      ellipsis: true,
      sorter: (a, b) => (a.sold || 0) - (b.sold || 0),
      render: (sold) => (
        <Tag color="orange" style={{ fontSize: '12px', padding: '2px 8px' }}>
          {sold || 0}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 70,
      align: 'center',
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteAllocation(record.productId, record.territoryName)}
        />
      ),
    },
  ];

  const historyColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      ellipsis: true,
      sorter: (a, b) => (a.date || '').localeCompare(b.date || ''),
    },
    {
      title: 'Territory',
      dataIndex: 'territoryName',
      key: 'territoryName',
      ellipsis: true,
      sorter: (a, b) => (a.territoryName || '').localeCompare(b.territoryName || ''),
    },
    {
      title: 'Product Code',
      dataIndex: 'productCode',
      key: 'productCode',
      ellipsis: true,
      sorter: (a, b) => (a.productCode || '').localeCompare(b.productCode || ''),
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: {
        showTitle: true,
      },
      sorter: (a, b) => (a.productName || '').localeCompare(b.productName || ''),
    },
    {
      title: 'Quota',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
      ellipsis: true,
      sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0),
    },
    {
      title: 'Sold',
      dataIndex: 'sold',
      key: 'sold',
      align: 'right',
      ellipsis: true,
      sorter: (a, b) => (a.sold || 0) - (b.sold || 0),
    },
    {
      title: 'Remaining',
      dataIndex: 'remaining',
      key: 'remaining',
      align: 'right',
      ellipsis: true,
      sorter: (a, b) => (a.remaining || 0) - (b.remaining || 0),
    },
  ];

  const { TabPane } = Tabs;

  return (
    <div>
      <Title level={3} style={{ marginBottom: '8px' }}>
        <BarChartOutlined /> Daily Quota Management
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Allocate daily sales quotas by territory and monitor consumption in real time.
      </Text>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Allocate Daily Quotas" key="allocate">
          {/* Allocation Form */}
          <Card title="Allocate Daily Quotas" style={{ marginBottom: '16px', borderRadius: '8px' }} bodyStyle={{ padding: '12px' }}>
            <Row gutter={[16, 16]} align="top">
            <Col flex="none" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Space direction="vertical">
                <Text strong>Date:</Text>
                <DatePicker
                  value={selectedDate}
                  onChange={(date) => setSelectedDate(date || dayjs())}
                  format="YYYY-MM-DD"
                  disabledDate={disabledDate}
                />
              </Space>
            </Col>
            <Col flex="none" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Products:</Text>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <AutoComplete
                    style={{ width: '800px' }}
                    placeholder="Type product name (e.g., dimitris, alpha)"
                    value={productSearch}
                    options={filteredProducts.map(p => ({
                      value: `${p.name} (${p.product_code})`,
                      label: `${p.name} (${p.product_code})`
                    }))}
                    onSearch={setProductSearch}
                    onSelect={(value) => {
                      const selected = filteredProducts.find(p => 
                        `${p.name} (${p.product_code})` === value
                      );
                      if (selected) {
                        handleAddProduct(selected);
                      }
                    }}
                    allowClear
                  />
                  {selectedProducts.length > 0 && (
                    <div style={{ 
                      marginTop: '4px', 
                      width: '800px', 
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px'
                    }}>
                      {selectedProducts.map(product => (
                        <Tag
                          key={product.id}
                          closable
                          onClose={() => handleRemoveProduct(product.id)}
                          style={{ marginBottom: '4px', marginRight: '0' }}
                        >
                          {product.name} ({product.product_code})
                        </Tag>
                      ))}
                    </div>
                  )}
                </Space>
              </Space>
            </Col>
            <Col flex="none" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Space direction="vertical">
                <Text strong>Territories:</Text>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <AutoComplete
                    style={{ width: '320px' }}
                    placeholder="Type territory (e.g., bari, bagura)"
                    value={territoryInput}
                    options={filteredTerritories.map(t => ({
                      value: t,
                      label: t
                    }))}
                    onSearch={setTerritoryInput}
                    onSelect={(value) => {
                      handleAddTerritory(value);
                    }}
                    allowClear
                  />
                  {selectedTerritories.length > 0 && (
                    <div style={{ 
                      marginTop: '4px', 
                      width: '100%', 
                      maxWidth: '320px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px'
                    }}>
                      {selectedTerritories.map(territory => (
                        <Tag
                          key={territory}
                          closable
                          onClose={() => handleRemoveTerritory(territory)}
                          style={{ marginBottom: '4px', marginRight: '0' }}
                        >
                          {territory}
                        </Tag>
                      ))}
                    </div>
                  )}
                </Space>
              </Space>
            </Col>
            <Col flex="none" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Space direction="vertical">
                <Text strong>Quota:</Text>
                <Input
                  style={{ width: '70px' }}
                  placeholder="Enter quantity"
                  value={quotaValue}
                  onChange={(e) => setQuotaValue(e.target.value)}
                  onPressEnter={handleAddAllocation}
                />
              </Space>
            </Col>
            <Col flex="none" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Space direction="vertical">
                <Text>&nbsp;</Text>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddAllocation}
                  disabled={selectedProducts.length === 0 || selectedTerritories.length === 0 || !quotaValue}
                >
                  Add
                </Button>
              </Space>
            </Col>
          </Row>

            <Row gutter={[16, 16]} align="middle" style={{ marginTop: '16px' }}>
              <Col>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadQuotas}
                >
                  Refresh
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Current Allocations Table */}
          <Card title="Allocated Daily Quotas" style={{ marginBottom: '16px', borderRadius: '8px' }} bodyStyle={{ padding: '12px' }}>
            <Table
              dataSource={getAllocations()}
              columns={allocationColumns}
              rowKey="key"
              pagination={getStandardPaginationConfig('allocations', 20)}
              scroll={{ x: 'max-content' }}
              locale={{ emptyText: 'No allocations yet. Add allocations using the form above.' }}
              size="small"
            />
          </Card>
        </TabPane>

        <TabPane tab="Previously Allocated Quotas" key="history">
          <Card title="Previously Allocated Quotas" style={{ marginBottom: '16px', borderRadius: '8px' }} bodyStyle={{ padding: '12px' }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Select Date</Text>
                  <DatePicker
                    value={historyDate}
                    onChange={(value) => setHistoryDate(value || dayjs())}
                    format="YYYY-MM-DD"
                    style={{ width: '100%' }}
                    disabledDate={disabledHistoryDate}
                    allowClear={false}
                  />
                </Space>
              </Col>
            </Row>
            <Row gutter={[16, 16]} align="middle" style={{ marginTop: 16, marginBottom: 12 }}>
              <Col>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadHistoryQuotas}
                  disabled={historyLoading}
                >
                  Refresh
                </Button>
              </Col>
            </Row>
            <Table
              dataSource={historyAllocations}
              columns={historyColumns}
              rowKey="key"
              pagination={getStandardPaginationConfig('allocations', 20)}
              scroll={{ x: 'max-content' }}
              size="small"
              loading={historyLoading}
              locale={{ emptyText: 'No quotas found for this date.' }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
}

export default ProductQuotaManagement;
