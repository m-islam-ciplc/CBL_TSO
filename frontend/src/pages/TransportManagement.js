import { useState, useEffect } from 'react';
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
  Col
} from 'antd';
import { useStandardPagination } from '../templates/useStandardPagination';
import { STANDARD_CARD_CONFIG, IMPORT_CARD_CONFIG, TABLE_CARD_CONFIG } from '../templates/CardTemplates';
import { STANDARD_PAGE_TITLE_CONFIG, STANDARD_PAGE_SUBTITLE_CONFIG, STANDARD_ROW_GUTTER, STANDARD_UPLOAD_CONFIG, renderTableHeaderWithSearchAndFilter } from '../templates/UIElements';
import {
  UploadOutlined,
  DownloadOutlined,
  TruckOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

function TransportManagement() {
  const [transports, setTransports] = useState([]);
  const [filteredTransports, setFilteredTransports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [idFilter, setIdFilter] = useState(null);
  const { pagination, setPagination, handleTableChange } = useStandardPagination('transports', 20);

  useEffect(() => {
    fetchTransports();
  }, []);

  useEffect(() => {
    filterTransports();
  }, [transports, searchTerm, idFilter]);

  const fetchTransports = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/transports');
      setTransports(response.data);
    } catch (_error) {
      message.error('Failed to fetch transports');
      console.error('Error fetching transports:', _error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransports = () => {
    let filtered = transports;

    // Search by Truck Details only
    if (searchTerm) {
      filtered = filtered.filter(transport =>
        transport.truck_details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by ID
    if (idFilter) {
      filtered = filtered.filter(transport => transport.id === idFilter);
    }

    setFilteredTransports(filtered);
    setPagination(prev => ({ ...prev, current: 1 }));
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
    } catch (_error) {
      message.error('Failed to import transports');
      console.error('Import error:', _error);
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

    // Set font style for all cells: Calibri size 8
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        ws[cellAddress].s.font = {
          name: 'Calibri',
          sz: 8,
          bold: R === range.s.r // Make header row bold
        };
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Transport_Template');
    const fileName = `Transport_Import_Template_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    message.success(`Template downloaded: ${fileName}`);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
      render: (text) => text,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Truck No',
      dataIndex: 'truck_no',
      key: 'truck_no',
      ellipsis: true,
      render: (text) => text,
      sorter: (a, b) => (a.truck_no || '').localeCompare(b.truck_no || ''),
    },
    {
      title: 'Truck Details',
      dataIndex: 'truck_details',
      key: 'truck_details',
      ellipsis: {
        showTitle: true,
      },
      render: (text) => text,
      sorter: (a, b) => (a.truck_details || '').localeCompare(b.truck_details || ''),
    },
    {
      title: 'Driver Name',
      dataIndex: 'driver_name',
      key: 'driver_name',
      ellipsis: true,
      render: (text) => text,
      sorter: (a, b) => (a.driver_name || '').localeCompare(b.driver_name || ''),
    },
    {
      title: 'Route No',
      dataIndex: 'route_no',
      key: 'route_no',
      ellipsis: true,
      render: (text) => text,
      sorter: (a, b) => (a.route_no || '').localeCompare(b.route_no || ''),
    },
    {
      title: 'Load Size',
      dataIndex: 'load_size',
      key: 'load_size',
      ellipsis: true,
      render: (text) => text,
      sorter: (a, b) => (a.load_size || '').localeCompare(b.load_size || ''),
    },
  ];

  return (
    <div>
      <Title {...STANDARD_PAGE_TITLE_CONFIG}>
        <TruckOutlined /> Manage Transports
      </Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        Import and manage transport database
      </Text>

      {/* Import Section */}
      <Card title="Import Transports" {...IMPORT_CARD_CONFIG}>
        <Row gutter={STANDARD_ROW_GUTTER} align="middle">
          <Col>
            <Upload
              {...STANDARD_UPLOAD_CONFIG}
              beforeUpload={handleImport}
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

      {/* Transports Table */}
      <Card {...TABLE_CARD_CONFIG}>
        {renderTableHeaderWithSearchAndFilter({
          title: 'Transports',
          count: filteredTransports.length,
          searchTerm: searchTerm,
          onSearchChange: (e) => setSearchTerm(e.target.value),
          searchPlaceholder: 'Search by truck details...',
          filter: {
            value: idFilter,
            onChange: setIdFilter,
            placeholder: 'Filter by ID',
            options: transports.map(transport => ({
              value: transport.id,
              label: `ID: ${transport.id}`
            })),
            width: '200px',
            showSearch: true
          }
        })}

        <Table
          columns={columns}
          dataSource={filteredTransports}
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

export default TransportManagement;
