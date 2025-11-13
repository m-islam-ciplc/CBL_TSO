import { useState, useEffect, cloneElement } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {
  Card,
  Typography,
  Button,
  Upload,
  Table,
  Input,
  message,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  ShopOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
  }, [products, searchTerm]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (_error) {
      message.error('Failed to load products');
      console.error('Error loading products:', _error);
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
        product.brand_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.application_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
    } catch (_error) {
      message.error('Import failed: ' + (_error.response?.data?.error || _error.message));
      console.error('Import error:', _error);
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
          'SHIPPER_QTY'
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
          10
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
          10
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

  const columns = [
    {
      title: 'Product Code',
      dataIndex: 'product_code',
      key: 'product_code',
      ellipsis: true,
      render: (text) => text,
      sorter: (a, b) => a.product_code.localeCompare(b.product_code),
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: {
        showTitle: true,
      },
      render: (text) => text,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Brand Code',
      dataIndex: 'brand_code',
      key: 'brand_code',
      ellipsis: true,
      render: (text) => text || '-',
      sorter: (a, b) => ((a.brand_code || '-') + '').localeCompare((b.brand_code || '-') + ''),
    },
    {
      title: 'Brand Name',
      dataIndex: 'brand_name',
      key: 'brand_name',
      ellipsis: {
        showTitle: true,
      },
      render: (text) => text || '-',
      sorter: (a, b) => ((a.brand_name || '-') + '').localeCompare((b.brand_name || '-') + ''),
    },
    {
      title: 'Application Name',
      dataIndex: 'application_name',
      key: 'application_name',
      ellipsis: {
        showTitle: true,
      },
      render: (text) => text || '-',
      sorter: (a, b) => ((a.application_name || '-') + '').localeCompare((b.application_name || '-') + ''),
    },
    {
      title: 'Unit TP',
      dataIndex: 'unit_tp',
      key: 'unit_tp',
      ellipsis: true,
      render: (value) => value ? `৳${value.toLocaleString()}` : '-',
      sorter: (a, b) => (a.unit_tp || 0) - (b.unit_tp || 0),
    },
  ];

  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      icon: <ShopOutlined style={{ color: '#1890ff' }} />,
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: '8px' }}>
        <AppstoreOutlined /> Manage Products
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Import and manage product database
      </Text>

      {/* Import Section */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
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
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        {stats.map((stat, index) => {
          const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink/Red
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue/Cyan
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green/Teal
          ];
          return (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card 
                size="small"
                style={{ background: gradients[index % gradients.length], color: 'white' }}
              >
                <Statistic
                  title={<span style={{ color: 'white' }}>{stat.title}</span>}
                  value={stat.value}
                  prefix={cloneElement(stat.icon, { style: { color: 'white' } })}
                  valueStyle={{ color: 'white', fontSize: '20px' }}
                />
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
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
          scroll={{ x: 'max-content' }}
          size="small"
        />
      </Card>
    </div>
  );
}

export default ProductManagement;
