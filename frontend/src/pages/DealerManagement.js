import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {
  Card,
  Typography,
  Button,
  Upload,
  Table,
  Tag,
  Input,
  Select,
  message,
  Statistic,
  Row,
  Col,
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

// Helper function to remove M/S prefix from dealer names
const removeMSPrefix = (name) => {
  if (!name) return name;
  // Remove "M/S", "M/S.", "M/S " prefix (case insensitive, with or without space/period)
  return name.replace(/^M\/S[.\s]*/i, '').trim();
};
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
    const fileName = `Dealer_Import_Template_${new Date().toISOString().split('T')[0]}.xlsx`;
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
    } catch (_error) {
      console.error('Failed to load dealers:', _error);
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
      filtered = filtered.filter(dealer => dealer.active_status === statusFilter);
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
    } catch (_error) {
      const errorMessage = _error.response?.data?.error || _error.message || 'Import failed';
      message.error('Import failed: ' + errorMessage);
    } finally {
      setImportLoading(false);
    }

    return false; // Prevent default upload behavior
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'A':
      case 'O':
        return <Tag color="green">Active</Tag>;
      case 'N':
      case 'I':
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
      // Auto-size based on content
      ellipsis: true,
      sorter: (a, b) => a.dealer_code.localeCompare(b.dealer_code),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      // Auto-size based on content with ellipsis for long names
      ellipsis: {
        showTitle: true, // Show full text on hover
      },
      render: (text) => removeMSPrefix(text),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Territory',
      dataIndex: 'territory_name',
      key: 'territory_name',
      // Auto-size based on content
      ellipsis: true,
      render: (territory) => territory || 'N/A',
      sorter: (a, b) => {
        const territoryA = a.territory_name || 'N/A';
        const territoryB = b.territory_name || 'N/A';
        return territoryA.localeCompare(territoryB);
      },
    },
    {
      title: 'Status',
      dataIndex: 'active_status',
      key: 'active_status',
      // Fixed width for status tags (they're small)
      width: 100,
      align: 'center',
      render: (status) => getStatusTag(status),
      sorter: (a, b) => {
        const statusA = a.active_status || '';
        const statusB = b.active_status || '';
        return statusA.localeCompare(statusB);
      },
    },
    {
      title: 'Type',
      dataIndex: 'dealer_type',
      key: 'dealer_type',
      // Auto-size based on content
      ellipsis: true,
      sorter: (a, b) => {
        const typeA = a.dealer_type || '';
        const typeB = b.dealer_type || '';
        return typeA.localeCompare(typeB);
      },
    },
    {
      title: 'Contact',
      dataIndex: 'contact',
      key: 'contact',
      // Auto-size based on content
      ellipsis: true,
      render: (contact) => contact || 'N/A',
      sorter: (a, b) => {
        const contactA = a.contact || 'N/A';
        const contactB = b.contact || 'N/A';
        return contactA.localeCompare(contactB);
      },
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      // Auto-size based on content with ellipsis for long addresses
      ellipsis: {
        showTitle: true, // Show full address on hover
      },
      render: (address) => address || 'N/A',
      sorter: (a, b) => {
        const addressA = a.address || 'N/A';
        const addressB = b.address || 'N/A';
        return addressA.localeCompare(addressB);
      },
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: '8px' }}>
        Manage Dealers
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Import and manage dealer database
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
          <Card 
            size="small"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
          >
            <Statistic
              title={<span style={{ color: 'white' }}>Total Dealers</span>}
              value={dealers.length}
              prefix={<UserOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            size="small"
            style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}
          >
            <Statistic
              title={<span style={{ color: 'white' }}>Active Dealers</span>}
              value={dealers.filter(d => d.active_status === 'A').length}
              prefix={<ShopOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            size="small"
            style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}
          >
            <Statistic
              title={<span style={{ color: 'white' }}>Territories</span>}
              value={territories.length}
              prefix={<EnvironmentOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            size="small"
            style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}
          >
            <Statistic
              title={<span style={{ color: 'white' }}>With Contact</span>}
              value={dealers.filter(d => d.contact).length}
              prefix={<PhoneOutlined style={{ color: 'white' }} />}
              suffix={<span style={{ color: 'rgba(255,255,255,0.8)' }}>/1580</span>}
              valueStyle={{ color: 'white', fontSize: '20px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
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
              showSearch
              filterOption={(input, option) => {
                const optionText = option?.children?.toString() || '';
                return optionText.toLowerCase().includes(input.toLowerCase());
              }}
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
              showSearch
              filterOption={(input, option) => {
                const optionText = option?.children?.toString() || '';
                return optionText.toLowerCase().includes(input.toLowerCase());
              }}
            >
              <Option value="A">Active</Option>
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
          scroll={{ x: 'max-content' }}
          size="small"
        />
      </Card>
    </div>
  );
}

export default DealerManagement;

