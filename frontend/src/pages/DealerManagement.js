import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  UserOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

function DealerManagement() {
  const [dealers, setDealers] = useState([]);
  const [filteredDealers, setFilteredDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [territoryFilter, setTerritoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [territories, setTerritories] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} dealers`,
    pageSizeOptions: ['10', '20', '50', '100'],
    defaultPageSize: 20,
  });

  useEffect(() => {
    loadDealers();
  }, []);

  useEffect(() => {
    filterDealers();
  }, [dealers, searchTerm, territoryFilter, statusFilter]);

  const downloadTemplate = () => {
    // Create template data matching VW_ALL_CUSTOMER_INFO format
    const templateData = [
      [
        'DEALER_CODE',
        'DEALER_NAME',
        'SHORT_NAME',
        'PROPRIETOR_NAME',
        'DEALER_ADDRESS',
        'DEALER_CONTACT',
        'DEALER_EMAIL',
        'NAT_CODE',
        'NAT_NAME',
        'DIV_CODE',
        'DIV_NAME',
        'TERRITORY_CODE',
        'TERRITORY_NAME',
        'DIST_CODE',
        'DIST_NAME',
        'THANA_CODE',
        'THANA_NAME',
        'SR_CODE',
        'SR_NAME',
        'NSM_CODE',
        'NSM_NAME',
        'CUST_ORIGIN',
        'DEALER_STATUS',
        'ACTIVE_STATUS',
        'DEALER_PROPTR',
        'DEALER_TYPE',
        'PRICE_TYPE',
        'CUST_DISC_CATEGORY',
        'PARTY_TYPE',
        'ERP_STATUS'
      ],
      [
        'NEW001', // DEALER_CODE - User should replace with actual code
        'Sample Dealer Name', // DEALER_NAME - User should replace
        'Sample Dealer', // SHORT_NAME - User should replace
        'Sample Proprietor', // PROPRIETOR_NAME - User should replace
        'Sample Address, City, Country', // DEALER_ADDRESS - User should replace
        '01712345678', // DEALER_CONTACT - User should replace
        'sample@email.com', // DEALER_EMAIL - User should replace
        '01', // NAT_CODE - National code
        'National-1', // NAT_NAME - National name
        '005', // DIV_CODE - Division code
        'Tangail Zone', // DIV_NAME - Division name
        '0017', // TERRITORY_CODE - Territory code
        'Tangail Territory', // TERRITORY_NAME - Territory name
        '0063', // DIST_CODE - District code
        'Tangail', // DIST_NAME - District name
        '0315', // THANA_CODE - Thana code
        'Tangail Sadar', // THANA_NAME - Thana name
        'SR0009', // SR_CODE - Sales rep code
        'Md. Shamsir Ali', // SR_NAME - Sales rep name
        'NSM001', // NSM_CODE - NSM code
        'Karar Kabir Rabib', // NSM_NAME - NSM name
        'CBL', // CUST_ORIGIN - Customer origin
        'O', // DEALER_STATUS - O for active, N for inactive
        'A', // ACTIVE_STATUS - A for active
        'Y', // DEALER_PROPTR - Y for proprietor
        'DI', // DEALER_TYPE - DI for distributor
        'T', // PRICE_TYPE - T for trade price
        'N', // CUST_DISC_CATEGORY - N for normal
        'Credit', // PARTY_TYPE - Credit or Cash
        'ERP-2' // ERP_STATUS - ERP system status
      ],
      [
        'NEW002', // Another sample row
        'Another Dealer Name',
        'Another Dealer',
        'Another Proprietor',
        'Another Address, City, Country',
        '01812345678',
        'another@email.com',
        '01',
        'National-1',
        '005',
        'Tangail Zone',
        '0017',
        'Tangail Territory',
        '0063',
        'Tangail',
        '0315',
        'Tangail Sadar',
        'SR0009',
        'Md. Shamsir Ali',
        'NSM001',
        'Karar Kabir Rabib',
        'CBL',
        'O',
        'A',
        'Y',
        'DI',
        'T',
        'N',
        'Credit',
        'ERP-2'
      ]
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 12 }, // DEALER_CODE
      { wch: 25 }, // DEALER_NAME
      { wch: 20 }, // SHORT_NAME
      { wch: 18 }, // PROPRIETOR_NAME
      { wch: 30 }, // DEALER_ADDRESS
      { wch: 15 }, // DEALER_CONTACT
      { wch: 20 }, // DEALER_EMAIL
      { wch: 10 }, // NAT_CODE
      { wch: 12 }, // NAT_NAME
      { wch: 10 }, // DIV_CODE
      { wch: 15 }, // DIV_NAME
      { wch: 12 }, // TERRITORY_CODE
      { wch: 18 }, // TERRITORY_NAME
      { wch: 10 }, // DIST_CODE
      { wch: 12 }, // DIST_NAME
      { wch: 10 }, // THANA_CODE
      { wch: 15 }, // THANA_NAME
      { wch: 10 }, // SR_CODE
      { wch: 18 }, // SR_NAME
      { wch: 10 }, // NSM_CODE
      { wch: 18 }, // NSM_NAME
      { wch: 10 }, // CUST_ORIGIN
      { wch: 12 }, // DEALER_STATUS
      { wch: 12 }, // ACTIVE_STATUS
      { wch: 12 }, // DEALER_PROPTR
      { wch: 10 }, // DEALER_TYPE
      { wch: 10 }, // PRICE_TYPE
      { wch: 15 }, // CUST_DISC_CATEGORY
      { wch: 10 }, // PARTY_TYPE
      { wch: 10 }  // ERP_STATUS
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Dealer_Template');

    // Generate and download file
    const fileName = `dealer_import_template_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    message.success(`Template downloaded: ${fileName}`);
  };

  const loadDealers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/dealers');
      setDealers(response.data);

      // Extract unique territories
      const territoryMap = new Map();
      response.data.forEach(dealer => {
        if (dealer.territory_name) {
          territoryMap.set(dealer.territory_code, dealer.territory_name);
        }
      });
      setTerritories(Array.from(territoryMap.entries()).map(([code, name]) => ({ code, name })));
    } catch (error) {
      message.error('Failed to load dealers');
    } finally {
      setLoading(false);
    }
  };

  const filterDealers = () => {
    let filtered = dealers;

    if (searchTerm) {
      filtered = filtered.filter(dealer =>
        dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealer.dealer_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (territoryFilter) {
      filtered = filtered.filter(dealer => dealer.territory_code === territoryFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(dealer => dealer.dealer_status === statusFilter);
    }

    setFilteredDealers(filtered);
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

    try {
      setImportLoading(true);
      const response = await axios.post('/api/dealers/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        message.success(`Imported ${response.data.imported} dealers successfully`);
        loadDealers(); // Refresh the list
      } else {
        message.error('Import failed');
      }
    } catch (error) {
      message.error('Import failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setImportLoading(false);
    }

    return false; // Prevent default upload behavior
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'O':
        return <Tag color="green">Active</Tag>;
      case 'N':
        return <Tag color="red">Inactive</Tag>;
      default:
        return <Tag color="default">{status || 'Unknown'}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Dealer Code',
      dataIndex: 'dealer_code',
      key: 'dealer_code',
      width: 100,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Territory',
      dataIndex: 'territory_name',
      key: 'territory_name',
      render: (territory) => territory || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'dealer_status',
      key: 'dealer_status',
      render: getStatusTag,
      width: 100,
    },
    {
      title: 'Type',
      dataIndex: 'dealer_type',
      key: 'dealer_type',
      width: 80,
    },
    {
      title: 'Contact',
      dataIndex: 'contact',
      key: 'contact',
      width: 150,
      render: (contact) => contact || 'N/A',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      render: (address) => address ? address.substring(0, 50) + '...' : 'N/A',
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: '8px' }}>
        Dealer Management
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Import and manage dealer database
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
                Import Dealers (Excel)
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
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Total Dealers"
              value={dealers.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Active Dealers"
              value={dealers.filter(d => d.dealer_status === 'O').length}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Territories"
              value={territories.length}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="With Contact"
              value={dealers.filter(d => d.contact).length}
              prefix={<PhoneOutlined />}
              suffix="/1580"
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search dealers..."
              prefix={<UserOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by territory"
              value={territoryFilter}
              onChange={setTerritoryFilter}
              style={{ width: '100%' }}
              allowClear
            >
              {territories.map(territory => (
                <Option key={territory.code} value={territory.code}>
                  {territory.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="O">Active</Option>
              <Option value="N">Inactive</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Dealers Table */}
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Text strong>Dealers ({filteredDealers.length})</Text>
        </div>

        <Table
          columns={columns}
          dataSource={filteredDealers}
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

export default DealerManagement;

