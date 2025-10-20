import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import * as XLSX from 'xlsx';
import {
  Card,
  Typography,
  Button,
  Upload,
  Table,
  Tag,
  Space,
  Input,
  Select,
  message,
  Statistic,
  Row,
  Col,
  Divider,
  Alert,
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  ShopOutlined,
  DollarOutlined,
  TagOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

function ProductManagement() {
  const { isTSO } = useUser();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} products`,
    pageSizeOptions: ['10', '20', '50', '100'],
    defaultPageSize: 20,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, brandFilter, statusFilter]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
      
      // Extract unique categories and brands for filters
      const uniqueCategories = [...new Set(response.data.map(p => p.product_category).filter(Boolean))];
      const uniqueBrands = [...new Set(response.data.map(p => p.brand_name).filter(Boolean))];
      
      setCategories(uniqueCategories);
      setBrands(uniqueBrands);
    } catch (error) {
      message.error('Failed to load products');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(product => product.product_category === categoryFilter);
    }

    if (brandFilter) {
      filtered = filtered.filter(product => product.brand_name === brandFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
    // Reset pagination when filters change
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (newPagination) => {
    console.log('Table pagination changed:', newPagination);
    setPagination(newPagination);
  };

  const handleImport = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    setImportLoading(true);

    try {
      const response = await axios.post('/api/products/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        message.success(
          `Imported ${response.data.imported} products successfully. ` +
          `${response.data.duplicates} duplicates, ${response.data.errors} errors.`
        );
        loadProducts(); // Reload products after import
      } else {
        message.error('Import failed');
      }
    } catch (error) {
      message.error('Import failed: ' + (error.response?.data?.error || error.message));
      console.error('Import error:', error);
    } finally {
      setImportLoading(false);
    }
  };

  const downloadTemplate = () => {
    try {
      // Create sample data matching PRODUCT_PRICE_ERP2.xlsx format
      const sampleData = [
        [
          'PRODUCT_CODE',
          'PRODUCT_NAME',
          'UNIT_MEASURE',
          'PRODUCT_CATEGORY',
          'BRAND_CODE',
          'BRAND_NAME',
          'APPLICATION_CODE',
          'APPLICATION_NAME',
          'PRICE_DATE',
          'UNIT_TP',
          'OEM_PRICE',
          'B2B_PRICE',
          'SPECIAL_PRICE',
          'EMPLOYEE_PRICE',
          'CASH_PRICE',
          'MRP',
          'UNIT_TRADE_PRICE',
          'UNIT_VAT',
          'SUPP_TAX',
          'GROSS_PROFIT',
          'BONUS_ALLOW',
          'DISCOUNT_ALLOW',
          'DISCOUNT_TYPE',
          'DISCOUNT_VAL',
          'PACK_SIZE',
          'SHIPPER_QTY',
          'STATUS'
        ],
        [
          'L113DU001',
          'Sample Product 1',
          'Pcs',
          'CBL',
          'BN074',
          'Sample Brand',
          '13',
          'Sample Application',
          '2024-01-01',
          14050,
          500,
          500,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          'Y',
          'Y',
          'P',
          0,
          '1',
          10,
          'A'
        ],
        [
          'L101AF032',
          'Sample Product 2',
          'Pcs',
          'CBL',
          'BN040',
          'Sample Brand 2',
          '01',
          'Sample Application 2',
          '2024-01-01',
          14250,
          0,
          0,
          13700,
          13700,
          13800,
          0,
          0,
          0,
          0,
          0,
          'Y',
          'Y',
          'P',
          0,
          '1',
          10,
          'A'
        ]
      ];

      const ws = XLSX.utils.aoa_to_sheet(sampleData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `Product_Import_Template_${timestamp}.xlsx`;

      XLSX.writeFile(wb, filename);
      message.success('Template downloaded successfully!');
    } catch (error) {
      message.error('Failed to download template');
      console.error('Download template error:', error);
    }
  };

  const baseColumns = [
    {
      title: 'Product Code',
      dataIndex: 'product_code',
      key: 'product_code',
      width: 120,
      sorter: (a, b) => a.product_code.localeCompare(b.product_code),
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Brand',
      dataIndex: 'brand_name',
      key: 'brand_name',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: 'Category',
      dataIndex: 'product_category',
      key: 'product_category',
      width: 100,
      render: (text) => text || '-',
    },
  ];

  const priceColumns = [
    {
      title: 'Unit TP',
      dataIndex: 'unit_tp',
      key: 'unit_tp',
      width: 100,
      render: (value) => value ? `৳${value.toLocaleString()}` : '-',
      sorter: (a, b) => (a.unit_tp || 0) - (b.unit_tp || 0),
    },
    {
      title: 'MRP',
      dataIndex: 'mrp',
      key: 'mrp',
      width: 100,
      render: (value) => value ? `৳${value.toLocaleString()}` : '-',
      sorter: (a, b) => (a.mrp || 0) - (b.mrp || 0),
    },
  ];

  const otherColumns = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'A' ? 'green' : 'red'}>
          {status === 'A' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
  ];

  const columns = isTSO ? [...baseColumns, ...otherColumns] : [...baseColumns, ...priceColumns, ...otherColumns];

  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      icon: <ShopOutlined style={{ color: '#1890ff' }} />,
    },
    {
      title: 'Active Products',
      value: products.filter(p => p.status === 'A').length,
      icon: <TagOutlined style={{ color: '#52c41a' }} />,
    },
    {
      title: 'Brands',
      value: brands.length,
      icon: <TagOutlined style={{ color: '#722ed1' }} />,
    },
    {
      title: 'Categories',
      value: categories.length,
      icon: <ShopOutlined style={{ color: '#fa8c16' }} />,
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: '8px' }}>
        Product Management
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Import and manage product database
      </Text>

      {/* Import Section */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Upload
              accept=".xlsx,.xls"
              beforeUpload={handleImport}
              showUploadList={false}
            >
              <Button
                type="primary"
                icon={<UploadOutlined />}
                loading={importLoading}
              >
                Import Products (Excel)
              </Button>
            </Upload>
          </Col>
          <Col>
            <Button
              icon={<DownloadOutlined />}
              onClick={downloadTemplate}
            >
              Download Template
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        {stats.map((stat, index) => (
          <Col xs={12} sm={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ fontSize: '20px' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Select
              placeholder="Category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              allowClear
              showSearch
              filterOption={(input, option) => {
                const optionText = option?.children?.toString() || '';
                return optionText.toLowerCase().includes(input.toLowerCase());
              }}
              style={{ width: '100%' }}
            >
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Select
              placeholder="Brand"
              value={brandFilter}
              onChange={setBrandFilter}
              allowClear
              showSearch
              filterOption={(input, option) => {
                const optionText = option?.children?.toString() || '';
                return optionText.toLowerCase().includes(input.toLowerCase());
              }}
              style={{ width: '100%' }}
            >
              {brands.map(brand => (
                <Option key={brand} value={brand}>{brand}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Select
              placeholder="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              showSearch
              filterOption={(input, option) => {
                const optionText = option?.children?.toString() || '';
                return optionText.toLowerCase().includes(input.toLowerCase());
              }}
              style={{ width: '100%' }}
            >
              <Option value="A">Active</Option>
              <Option value="I">Inactive</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Products Table */}
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Text strong>Products ({filteredProducts.length})</Text>
        </div>

        <Table
          columns={columns}
          dataSource={filteredProducts}
          loading={loading}
          rowKey="id"
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          size="small"
        />
      </Card>
    </div>
  );
}

export default ProductManagement;
