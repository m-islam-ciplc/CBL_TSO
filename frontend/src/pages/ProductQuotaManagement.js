import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
} from 'antd';
import {
  SaveOutlined,
  CalendarOutlined,
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function ProductQuotaManagement() {
  const [products, setProducts] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [quotas, setQuotas] = useState({}); // { productId_territory: quantity }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // New allocation flow state
  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [territoryInput, setTerritoryInput] = useState('');
  const [selectedTerritories, setSelectedTerritories] = useState([]);
  const [quotaValue, setQuotaValue] = useState('');
  
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
    } catch (error) {
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadTerritories = async () => {
    try {
      const response = await axios.get('/api/dealers/territories');
      setTerritories(response.data);
    } catch (error) {
      console.error('Failed to load territories:', error);
    }
  };

  const loadQuotas = async () => {
    if (!selectedDate) return;
    
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const response = await axios.get(`/api/product-caps?date=${dateStr}`);
      
      // Convert API response to quotas object
      const quotasObj = {};
      response.data.forEach(cap => {
        const key = `${cap.product_id}_${cap.territory_name}`;
        quotasObj[key] = cap.max_quantity;
      });
      
      setQuotas(quotasObj);
    } catch (error) {
      // No quotas for this date is normal
      setQuotas({});
    }
  };

  const handleQuotaChange = (productId, territoryName, value) => {
    const key = `${productId}_${territoryName}`;
    setQuotas(prev => ({
      ...prev,
      [key]: value || 0
    }));
  };

  const handleSave = async () => {
    if (!selectedDate) {
      message.error('Please select a date');
      return;
    }

    setSaving(true);
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const quotasToSave = [];

      Object.entries(quotas).forEach(([key, quantity]) => {
        if (quantity > 0) {
          const [productId, territoryName] = key.split('_');
          const product = products.find(p => p.id == productId);
          if (product) {
            quotasToSave.push({
              date: dateStr,
              product_id: parseInt(productId),
              product_code: product.product_code,
              product_name: product.name,
              territory_name: territoryName,
              max_quantity: quantity
            });
          }
        }
      });

      console.log('🔍 Saving quotas:', quotasToSave.length, 'items');

      if (quotasToSave.length === 0) {
        message.warning('No quotas to save');
        setSaving(false);
        return;
      }

      const response = await axios.post('/api/product-caps/bulk', { quotas: quotasToSave });
      console.log('✅ Save response:', response.data);
      message.success('Quotas saved successfully');
      loadQuotas();
    } catch (error) {
      console.error('❌ Error saving quotas:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        message.error(`Failed to save quotas: ${error.response.data.error || error.message}`);
      } else {
        message.error(`Failed to save quotas: ${error.message}`);
      }
    } finally {
      setSaving(false);
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

  const handleAddAllocation = () => {
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

    // Add allocation for each product and territory combination
    const newQuotas = { ...quotas };
    selectedProducts.forEach(product => {
      selectedTerritories.forEach(territory => {
        const key = `${product.id}_${territory}`;
        newQuotas[key] = parseInt(quotaValue);
      });
    });
    setQuotas(newQuotas);

    message.success(`Allocated ${quotaValue} units of ${selectedProducts.length} product(s) to ${selectedTerritories.length} territory/ies`);
    
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
    } catch (error) {
      console.error('Error deleting quota:', error);
      message.error('Failed to delete quota from database');
    }
  };

  // Get all current allocations for display
  const getAllocations = () => {
    const allocations = [];
    
    Object.entries(quotas).forEach(([key, quantity]) => {
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
            quantity
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

  const handleUpdateQuota = (productId, territoryName, newQuantity) => {
    const key = `${productId}_${territoryName}`;
    setQuotas(prev => ({
      ...prev,
      [key]: parseInt(newQuantity) || 0
    }));
    message.success('Quota updated');
  };

  const allocationColumns = [
    {
      title: 'Territory',
      dataIndex: 'territoryName',
      key: 'territoryName',
      width: 200,
    },
    {
      title: 'Product Code',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      width: 250,
    },
    {
      title: 'Quota',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 150,
      align: 'right',
      render: (quantity, record) => (
        <InputNumber
          min={0}
          max={999999}
          value={quantity}
          onChange={(value) => handleUpdateQuota(record.productId, record.territoryName, value)}
          style={{ width: '100px' }}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteAllocation(record.productId, record.territoryName)}
        >
          Delete From Database
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: '8px' }}>
        Product Quota Management
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Allocate product quotas per territory by date
      </Text>

      {/* Allocation Form */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="bottom">
            <Col>
              <Space direction="vertical">
                <Text strong>Date:</Text>
                <Space>
                  <CalendarOutlined />
                  <DatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    format="YYYY-MM-DD"
                  />
                </Space>
              </Space>
            </Col>
            <Col flex="auto">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Products:</Text>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <AutoComplete
                    style={{ width: '100%', minWidth: '300px' }}
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
                    <div style={{ marginTop: '4px' }}>
                      {selectedProducts.map(product => (
                        <Tag
                          key={product.id}
                          closable
                          onClose={() => handleRemoveProduct(product.id)}
                          style={{ marginBottom: '4px' }}
                        >
                          {product.name} ({product.product_code})
                        </Tag>
                      ))}
                    </div>
                  )}
                </Space>
              </Space>
            </Col>
            <Col>
              <Space direction="vertical">
                <Text strong>Territories:</Text>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <AutoComplete
                    style={{ width: '200px' }}
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
                    <div style={{ marginTop: '4px' }}>
                      {selectedTerritories.map(territory => (
                        <Tag
                          key={territory}
                          closable
                          onClose={() => handleRemoveTerritory(territory)}
                          style={{ marginBottom: '4px' }}
                        >
                          {territory}
                        </Tag>
                      ))}
                    </div>
                  )}
                </Space>
              </Space>
            </Col>
            <Col>
              <Space direction="vertical">
                <Text strong>Quota:</Text>
                <Input
                  style={{ width: '100px' }}
                  placeholder="Enter quantity"
                  value={quotaValue}
                  onChange={(e) => setQuotaValue(e.target.value)}
                  onPressEnter={handleAddAllocation}
                />
              </Space>
            </Col>
            <Col>
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
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
            >
              Save All Quotas
            </Button>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadQuotas}
            >
              Refresh
            </Button>
          </Col>
          <Col>
            <Text type="secondary">
              {getAllocations().length} allocation(s) ready to save
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Current Allocations Table */}
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Text strong>Quotas ({getAllocations().length})</Text>
        </div>
        <Table
          dataSource={getAllocations()}
          columns={allocationColumns}
          rowKey="key"
          pagination={{ pageSize: 20 }}
          locale={{ emptyText: 'No allocations yet. Add allocations using the form above.' }}
          size="small"
        />
      </Card>
    </div>
  );
}

export default ProductQuotaManagement;
