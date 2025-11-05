import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {
  Card,
  Typography,
  Button,
  Upload,
  Table,
  Input,
  Select,
  message,
  Row,
  Col,
  Tag,
  Statistic
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  TruckOutlined,
  SearchOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

function TransportManagement() {
  const [transports, setTransports] = useState([]);
  const [filteredTransports, setFilteredTransports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transports`,
    pageSizeOptions: ['10', '20', '50', '100'],
    defaultPageSize: 20,
  });

  useEffect(() => {
    fetchTransports();
  }, []);

  useEffect(() => {
    filterTransports();
  }, [transports, searchTerm, statusFilter]);

  const fetchTransports = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/transports');
      setTransports(response.data);
    } catch (error) {
      message.error('Failed to fetch transports');
      console.error('Error fetching transports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransports = () => {
    let filtered = transports;

    if (searchTerm) {
      filtered = filtered.filter(transport =>
        transport.truck_details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transport.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transport.truck_no?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(transport => {
        const status = transport.transport_status || transport.status;
        return status === statusFilter;
      });
    }

    setFilteredTransports(filtered);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleImport = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setImportLoading(true);
      const response = await axios.post('/api/transports/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      message.success(response.data.message || 'Imported transports successfully');
      fetchTransports();
    } catch (error) {
      message.error('Failed to import transports');
      console.error('Import error:', error);
    } finally {
      setImportLoading(false);
    }

    return false;
  };

  const downloadTemplate = () => {
    // Create template structure
    const templateData = [
      ['TRUCK_SLNO', 'TRUCK_NO', 'ENGINE_NO', 'VEHICLE_NO', 'TRUCK_DETAILS', 'DRIVER_NAME', 'DRIVER_PHONE', 'LICENSE_NUMBER', 'ROUTE_NO', 'LOAD_SIZE', 'LOAD_WEIGHT', 'TRUCK_TYPE', 'TRANSPORT_STATUS'],
      ['1', 'TR-001', 'ENG-001', 'V-001', 'Sample Truck Details', 'Driver Name', '01712345678', 'LIC-001', 'RT-001', 'Large', '5000', 'Heavy', 'A'],
      ['2', 'TR-002', 'ENG-002', 'V-002', 'Another Truck Details', 'Another Driver', '01812345678', 'LIC-002', 'RT-002', 'Medium', '3000', 'Medium', 'A']
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    ws['!cols'] = [
      { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
      { wch: 30 }, { wch: 18 }, { wch: 15 }, { wch: 15 },
      { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Transport_Template');
    const fileName = `Transport_Import_Template_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    message.success(`Template downloaded: ${fileName}`);
  };

  const getStatusTag = (status) => {
    if (status === 'A') {
      return <Tag color="green">Active</Tag>;
    } else if (status === 'I' || status === 'inactive') {
      return <Tag color="red">Inactive</Tag>;
    }
    return <Tag color="default">{status || 'Unknown'}</Tag>;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 50,
      render: (text) => <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{text}</div>,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Truck No',
      dataIndex: 'truck_no',
      key: 'truck_no',
      width: 100,
      render: (text) => <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{text}</div>,
      sorter: (a, b) => (a.truck_no || '').localeCompare(b.truck_no || ''),
    },
    {
      title: 'Truck Details',
      dataIndex: 'truck_details',
      key: 'truck_details',
      width: 250,
      render: (text) => <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{text}</div>,
      sorter: (a, b) => (a.truck_details || '').localeCompare(b.truck_details || ''),
    },
    {
      title: 'Driver Name',
      dataIndex: 'driver_name',
      key: 'driver_name',
      width: 120,
      render: (text) => <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{text}</div>,
      sorter: (a, b) => (a.driver_name || '').localeCompare(b.driver_name || ''),
    },
    {
      title: 'Route No',
      dataIndex: 'route_no',
      key: 'route_no',
      width: 80,
      render: (text) => <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{text}</div>,
      sorter: (a, b) => (a.route_no || '').localeCompare(b.route_no || ''),
    },
    {
      title: 'Load Size',
      dataIndex: 'load_size',
      key: 'load_size',
      width: 100,
      render: (text) => <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{text}</div>,
      sorter: (a, b) => (a.load_size || '').localeCompare(b.load_size || ''),
    },
  ];

  const activeCount = transports.filter(t => t.transport_status === 'A').length;
  const inactiveCount = transports.filter(t => t.transport_status === 'I').length;

  return (
    <div>
      <Title level={3} style={{ marginBottom: '8px' }}>
        Manage Transports
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Import and manage transport database
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
                Import Transports (Excel)
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
              title={<span style={{ color: 'white' }}>Total Transports</span>}
              value={transports.length}
              prefix={<TruckOutlined style={{ color: 'white' }} />}
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
              title={<span style={{ color: 'white' }}>Active Transports</span>}
              value={activeCount}
              prefix={<CheckCircleOutlined style={{ color: 'white' }} />}
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
              title={<span style={{ color: 'white' }}>Inactive Transports</span>}
              value={inactiveCount}
              prefix={<CheckCircleOutlined style={{ color: 'white' }} />}
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
              title={<span style={{ color: 'white' }}>Displayed</span>}
              value={filteredTransports.length}
              prefix={<SearchOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: '20px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search transports..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="all">All Status</Option>
              <Option value="A">Active</Option>
              <Option value="I">Inactive</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Transports Table */}
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Text strong>Transports ({filteredTransports.length})</Text>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTransports}
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

export default TransportManagement;
