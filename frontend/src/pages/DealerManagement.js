import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

  useEffect(() => {
    loadDealers();
  }, []);

  useEffect(() => {
    filterDealers();
  }, [dealers, searchTerm, territoryFilter, statusFilter]);

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
              onClick={() => message.info('Template download feature coming soon')}
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
          pagination={{
            total: filteredDealers.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} dealers`,
          }}
          scroll={{ x: 1000 }}
          size="small"
        />
      </Card>
    </div>
  );
}

export default DealerManagement;

