import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {
  Card,
  Typography,
  Button,
  Upload,
  Table,
  Tag,
  Select,
  message,
  Row,
  Col,
  Form,
  Space,
  Popconfirm,
  Badge,
} from 'antd';
import { useStandardPagination, getStandardPaginationConfig } from '../templates/useStandardPagination';
import { STANDARD_EXPANDABLE_TABLE_CONFIG } from '../templates/TableTemplate';
import { 
  EXPANDABLE_TABLE_CARD_CONFIG,
  STANDARD_PAGE_TITLE_CONFIG, 
  STANDARD_PAGE_SUBTITLE_CONFIG, 
  STANDARD_ROW_GUTTER, 
  STANDARD_BADGE_CONFIG, 
  STANDARD_BUTTON_SIZE, 
  renderTableHeaderWithSearchAndFilter 
} from '../templates/UITemplates';
import { DealerManagementImportCardTemplate } from '../templates/DealerManagementImportCardTemplate';
import {
  UploadOutlined,
  DownloadOutlined,
  ShopOutlined,
  AppstoreOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// Helper function to remove M/S prefix from dealer names
const removeMSPrefix = (name) => {
  if (!name) return name;
  return name.replace(/^M\/S[.\s]*/i, '').trim();
};

// Expanded Row Component (separate component that uses hooks)
const ExpandedRowContent = ({ 
  dealerId, 
  assignments, 
  assignmentsLoading, 
  showForm, 
  products, 
  onToggleForm,
  onSubmitAssignment,
  onDeleteAssignment
}) => {
  const [form] = Form.useForm();
  return (
    <div style={STANDARD_EXPANDABLE_TABLE_CONFIG.expandedRowContent.container}>
      <Card size="small" style={{ marginBottom: STANDARD_EXPANDABLE_TABLE_CONFIG.spacing.cardMargin }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Text strong style={{ fontSize: STANDARD_EXPANDABLE_TABLE_CONFIG.fontSizes.title }}>
              <AppstoreOutlined /> Product Assignments
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={onToggleForm}
            >
              {showForm ? 'Cancel' : 'Add Assignment'}
            </Button>
          </Col>
        </Row>

        {showForm && (
          <Card size="small" style={{ marginBottom: STANDARD_EXPANDABLE_TABLE_CONFIG.spacing.cardMargin, background: STANDARD_EXPANDABLE_TABLE_CONFIG.colors.background.itemCard }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={(values) => {
                onSubmitAssignment(dealerId, values);
                form.resetFields();
              }}
            >
              <Form.Item
                name="product_ids"
                label={<Text style={{ fontSize: STANDARD_EXPANDABLE_TABLE_CONFIG.fontSizes.label }}>Select Products</Text>}
                rules={[{ required: true, message: 'Please select at least one product' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select products"
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {products.map(product => (
                    <Option key={product.id} value={product.id} label={`${product.product_code} - ${product.name}`}>
                      {product.product_code} - {product.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" size={STANDARD_BUTTON_SIZE}>
                    Add Assignment
                  </Button>
                  <Button size={STANDARD_BUTTON_SIZE} onClick={() => {
                    form.resetFields();
                    onToggleForm();
                  }}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        )}

        <Table
          columns={[
            {
              title: 'Product',
              key: 'product',
              render: (_, record) => {
                if (record.assignment_type === 'product' && record.product_id) {
                  const product = products.find(p => p.id === record.product_id);
                  return product ? `${product.product_code} - ${product.name}` : `Product ID: ${record.product_id}`;
                }
                return '-';
              },
            },
            {
              title: 'Actions',
              key: 'actions',
              align: 'center',
              width: 80,
              render: (_, record) => (
                <Popconfirm
                  title="Are you sure you want to delete this assignment?"
                  onConfirm={() => onDeleteAssignment(dealerId, record.id)}
                >
                  <Button
                    icon={<DeleteOutlined />}
                    size="small"
                    danger
                  />
                </Popconfirm>
              ),
            },
          ]}
          dataSource={assignments}
          loading={assignmentsLoading}
          rowKey="id"
          pagination={getStandardPaginationConfig('assignments', 10)}
          size="small"
        />
      </Card>
    </div>
  );
};

function DealerManagement() {
  const [dealers, setDealers] = useState([]);
  const [filteredDealers, setFilteredDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [territoryFilter, setTerritoryFilter] = useState(null);
  const [territories, setTerritories] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  
  // Product assignment state per dealer
  const [assignmentsData, setAssignmentsData] = useState({}); // { dealerId: { assignments, loading } }
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState({}); // { dealerId: boolean }
  const [productCounts, setProductCounts] = useState({}); // { dealerId: count }
  const countsLoadedForLengthRef = useRef(0);

  const { pagination, setPagination, handleTableChange } = useStandardPagination('dealers', 20);

  useEffect(() => {
    loadDealers();
    loadProducts();
  }, []);

  useEffect(() => {
    filterDealers();
  }, [dealers, searchTerm, territoryFilter]);

  // Load product counts for all dealers (batched loading)
  useEffect(() => {
    // Only load if dealers are available and we haven't loaded for this length yet
    if (dealers.length === 0 || countsLoadedForLengthRef.current === dealers.length) {
      return;
    }
    
    countsLoadedForLengthRef.current = dealers.length;
    
    const loadAllCounts = async () => {
      // Process 50 dealers at a time to avoid overwhelming browser/network
      const BATCH_SIZE = 50;
      const counts = {};
      
      // Process dealers in batches
      for (let i = 0; i < dealers.length; i += BATCH_SIZE) {
        const batch = dealers.slice(i, i + BATCH_SIZE);
        
        // Process this batch in parallel
        const batchPromises = batch.map(async (dealer) => {
          try {
            const response = await axios.get(`/api/dealer-assignments/${dealer.id}`);
            counts[dealer.id] = (response.data || []).length;
            return { dealerId: dealer.id, success: true };
          } catch (error) {
            counts[dealer.id] = 0;
            return { dealerId: dealer.id, success: false };
          }
        });
        
        // Wait for this batch to complete before starting the next
        await Promise.all(batchPromises);
        
        // Update counts incrementally so UI shows progress
        setProductCounts({ ...counts });
      }
      
      setProductCounts(counts);
    };
    
    loadAllCounts();
  }, [dealers.length]);

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

  const loadProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };


  const loadAssignments = async (dealerId) => {
    if (!dealerId) return;
    
    setAssignmentsData(prev => ({
      ...prev,
      [dealerId]: { ...prev[dealerId], loading: true }
    }));

    try {
      const response = await axios.get(`/api/dealer-assignments/${dealerId}`);
      const assignments = response.data || [];
      setAssignmentsData(prev => ({
        ...prev,
        [dealerId]: { assignments, loading: false }
      }));
      // Update product count
      setProductCounts(prev => ({
        ...prev,
        [dealerId]: assignments.length
      }));
    } catch (error) {
      console.error('Error loading assignments:', error);
      message.error('Failed to load assignments');
      setAssignmentsData(prev => ({
        ...prev,
        [dealerId]: { ...prev[dealerId], loading: false }
      }));
    }
  };

  const handleDeleteAssignment = async (dealerId, assignmentId) => {
    try {
      await axios.delete(`/api/dealer-assignments/${assignmentId}`);
      message.success('Assignment deleted successfully');
      loadAssignments(dealerId); // This will update the count automatically
    } catch (error) {
      console.error('Error deleting assignment:', error);
      message.error('Failed to delete assignment');
    }
  };

  const handleSubmitAssignment = async (dealerId, values) => {
    try {
      if (!values.product_ids || values.product_ids.length === 0) {
        message.error('Please select at least one product');
        return;
      }
      
      await axios.post('/api/dealer-assignments/bulk', {
        dealer_id: dealerId,
        product_ids: values.product_ids || [],
      });
      const productCount = (values.product_ids || []).length;
      message.success(`Successfully assigned ${productCount} product${productCount !== 1 ? 's' : ''}`);
      setShowAddForm(prev => ({ ...prev, [dealerId]: false }));
      loadAssignments(dealerId);
    } catch (error) {
      console.error('Error saving assignment:', error);
      message.error(error.response?.data?.error || 'Failed to save assignment');
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

    setFilteredDealers(filtered);
    // Reset pagination when filters change
    setPagination(prev => ({ ...prev, current: 1 }));
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
        const { imported = 0, duplicates = 0, errors = 0 } = response.data;
        message.success(`Imported ${imported} dealers successfully. ${duplicates} duplicates, ${errors} errors.`);
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
      ellipsis: true,
      width: 120,
      sorter: (a, b) => a.dealer_code.localeCompare(b.dealer_code),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: {
        showTitle: true,
      },
      render: (text) => removeMSPrefix(text),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Territory',
      dataIndex: 'territory_name',
      key: 'territory_name',
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
      ellipsis: {
        showTitle: true,
      },
      render: (address) => address || 'N/A',
      sorter: (a, b) => {
        const addressA = a.address || 'N/A';
        const addressB = b.address || 'N/A';
        return addressA.localeCompare(addressB);
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const isExpanded = expandedRowKeys.includes(record.id);
        const count = productCounts[record.id] || 0;
        
        return (
          <Badge 
            {...STANDARD_BADGE_CONFIG}
            count={count}
          >
            <Button
              type="primary"
              icon={<AppstoreOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // Prevent row click
                if (isExpanded) {
                  setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.id));
                } else {
                  setExpandedRowKeys([...expandedRowKeys, record.id]);
                  loadAssignments(record.id);
                }
              }}
            >
              {isExpanded ? 'Hide Products' : 'Manage Products'}
            </Button>
          </Badge>
        );
      },
    },
  ];

  const renderExpandedRow = (record) => {
    const dealerId = record.id;
    const assignments = assignmentsData[dealerId]?.assignments || [];
    const assignmentsLoading = assignmentsData[dealerId]?.loading || false;
    const showForm = showAddForm[dealerId] || false;

    return (
      <ExpandedRowContent
        dealerId={dealerId}
        assignments={assignments}
        assignmentsLoading={assignmentsLoading}
        showForm={showForm}
        products={products}
        onToggleForm={() => {
          setShowAddForm(prev => ({ ...prev, [dealerId]: !prev[dealerId] }));
        }}
        onSubmitAssignment={handleSubmitAssignment}
        onDeleteAssignment={handleDeleteAssignment}
      />
    );
  };

  return (
    <div>
      <Title {...STANDARD_PAGE_TITLE_CONFIG}>
        <ShopOutlined /> Manage Dealers
      </Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        Import and manage dealer database. Click &quot;Manage Products&quot; to assign products to dealers.
      </Text>

      {/* Import Section */}
      <DealerManagementImportCardTemplate
        title="Import Dealers"
        uploadButton={{
          label: 'Import Dealers (Excel)',
          icon: <UploadOutlined />,
          onUpload: handleImport,
          loading: importLoading,
        }}
        downloadButton={{
          label: 'Download Template',
          icon: <DownloadOutlined />,
          onClick: downloadTemplate,
        }}
      />

      {/* Dealers Table */}
      <Card {...EXPANDABLE_TABLE_CARD_CONFIG}>
        {renderTableHeaderWithSearchAndFilter({
          title: 'Dealers',
          count: filteredDealers.length,
          searchTerm: searchTerm,
          onSearchChange: (e) => setSearchTerm(e.target.value),
          searchPlaceholder: 'Search by dealer name or code...',
          filter: {
            value: territoryFilter,
            onChange: setTerritoryFilter,
            placeholder: 'Filter by territory',
            options: territories.map(territory => ({ value: territory.code, label: territory.name })),
            width: '200px',
            showSearch: true
          }
        })}

        <Table
          columns={columns}
          dataSource={filteredDealers}
          loading={loading}
          rowKey="id"
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          size="small"
          expandable={{
            expandedRowKeys,
            onExpand: (_expanded, _record) => {
              // Only expand/collapse when triggered by the Actions button
            },
            expandedRowRender: renderExpandedRow,
            expandRowByClick: false, // Disable row click expansion
            showExpandColumn: false, // Completely remove the expand column (no blank space)
          }}
        />
      </Card>
    </div>
  );
}

export default DealerManagement;
