import { useState } from 'react';
import { 
  Layout, 
  Typography, 
  Button, 
  Drawer, 
  Dropdown, 
  Card, 
  Space, 
  Divider, 
  Tag, 
  Select, 
  Table, 
  DatePicker, 
  Row, 
  Col, 
  Input,
  InputNumber,
  Form,
  Badge,
  Tabs,
  Radio,
  Alert,
  Statistic,
  Upload,
  Empty,
  Spin,
  Modal,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  DashboardOutlined,
  PlusOutlined,
  OrderedListOutlined,
  ShoppingCartOutlined,
  CheckOutlined,
  FileExcelOutlined,
  BarChartOutlined,
  LogoutOutlined,
  MoreOutlined,
  CalendarOutlined,
  SettingOutlined,
  ExperimentOutlined,
  TableOutlined,
  DownOutlined,
  LayoutOutlined,
  SearchOutlined,
  AppstoreOutlined,
  GiftOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  UserOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { DealerProductCard } from '../../templates/DealerProductCard';
import { FILTER_CARD_CONFIG, CONTENT_CARD_CONFIG, TABLE_CARD_CONFIG } from '../../templates/CardTemplates';
import { 
  STANDARD_ROW_GUTTER, 
  STANDARD_TAG_STYLE, 
  STANDARD_FORM_LABEL_STYLE, 
  STANDARD_INPUT_SIZE,
  STANDARD_RADIO_SIZE,
  STANDARD_ALERT_CONFIG,
  STANDARD_STATISTIC_CONFIG,
  STANDARD_UPLOAD_CONFIG,
  STANDARD_EMPTY_CONFIG,
  STANDARD_SPIN_SIZE,
  STANDARD_POPCONFIRM_CONFIG,
  STANDARD_TOOLTIP_CONFIG,
  STANDARD_BADGE_CONFIG,
  STANDARD_TABS_CONFIG,
  STANDARD_INPUT_NUMBER_SIZE,
  STANDARD_DATE_PICKER_CONFIG,
  STANDARD_SPACE_SIZE_SMALL,
  STANDARD_SPACE_SIZE_MIDDLE,
  STANDARD_SPACE_SIZE_LARGE,
  STANDARD_DIVIDER_CONFIG,
  STANDARD_MODAL_CONFIG,
  STANDARD_BUTTON_SIZE,
} from '../../templates/UIElements';
import { STANDARD_PAGE_TITLE_CONFIG, STANDARD_PAGE_SUBTITLE_CONFIG } from '../../templates/UIElements';
import { createStandardDatePickerConfig } from '../../templates/UIConfig';
import { getStandardPagination } from '../../templates/UIConfig';
import { renderStandardExpandedRow, StandardExpandableTable } from '../../templates/TableTemplate';
import '../../App.css';
import '../NewOrdersTablet.css';

const { Header } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

function UnifiedUITemplate() {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Menu items for navbar demo
  const adminMenuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'placed-orders', icon: <OrderedListOutlined />, label: 'Placed Orders' },
    { key: 'manage-quotas', icon: <BarChartOutlined />, label: 'Manage Quotas' },
    { key: 'reports', icon: <FileExcelOutlined />, label: 'Reports' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  const getMenuItems = () => {
    if (selectedRole === 'admin') return adminMenuItems;
    return adminMenuItems;
  };

  // Sample data
  const availableDates = ['2024-12-10', '2024-12-11', '2024-12-16', '2024-12-17', '2024-12-20'];
  const { disabledDate, dateCellRender } = createStandardDatePickerConfig(availableDates);

  const sampleProducts = [
    { id: 1, name: '6DGA-225(H)', product_code: '6DGA-225(H)', unit_tp: 1250 },
    { id: 2, name: 'Kingshuk Power', product_code: '6DGA-180(H)', unit_tp: 1100 },
    { id: 3, name: '6DGA-200(H)', product_code: '6DGA-200(H)', unit_tp: 1200 },
  ];

  const tableData = [
    { key: '1', id: 'ORD-001', dealer: 'Power Battery', territory: 'Dhaka', qty: 25, status: 'new' },
    { key: '2', id: 'ORD-002', dealer: 'Green Energy', territory: 'Chittagong', qty: 15, status: 'confirmed' },
  ];

  const expandableData = [
    {
      key: '1',
      order_id: 'ORD-001',
      created_at: '2024-12-16T10:30:00',
      order_type: 'Daily Demand',
      item_count: 3,
      total_quantity: 25,
      items: [
        { product_code: '6DGA-225(H)', product_name: 'Kingshuk Power', quantity: 10, unit_tp: 1250 },
      ]
    },
  ];

  return (
    <div>
      <Title {...STANDARD_PAGE_TITLE_CONFIG}>
        <LayoutOutlined /> Unified UI Templates
      </Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        All standard UI elements and templates used across the application.
      </Text>

      {/* 1. NAVBAR TEMPLATE */}
      <Card {...CONTENT_CARD_CONFIG} title="1. Navigation Bar" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Select
            value={selectedRole}
            onChange={setSelectedRole}
            style={{ width: 150 }}
            size={STANDARD_INPUT_SIZE}
          >
            <Option value="admin">Admin</Option>
            <Option value="tso">TSO</Option>
            <Option value="dealer">Dealer</Option>
          </Select>
          
          <div style={{ border: '2px solid #e8e8e8', borderRadius: '4px', overflow: 'hidden' }}>
            <Header style={{
              height: '40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Title level={4} style={{ color: 'white', margin: 0, marginRight: '24px' }}>
                  CBL SO
                </Title>
              </div>
              <div className="menu-container" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div className="custom-menu-bar" style={{ display: 'flex' }}>
                  {getMenuItems().map(item => (
                    <div
                      key={item.key}
                      className={`custom-menu-item ${selectedMenuItem === item.key ? 'custom-menu-item-selected' : ''}`}
                      onClick={() => setSelectedMenuItem(item.key)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="custom-menu-icon">{item.icon}</span>
                      <span className="custom-menu-label">{item.label}</span>
                    </div>
                  ))}
                  <div className="custom-menu-item" onClick={() => setDrawerOpen(true)} style={{ cursor: 'pointer' }}>
                    <span className="custom-menu-icon"><MoreOutlined /></span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginLeft: '16px' }}>
                <Button size={STANDARD_BUTTON_SIZE} type="text" icon={<ExperimentOutlined />} style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                  Templates <DownOutlined />
                </Button>
                <Button size={STANDARD_BUTTON_SIZE} type="text" icon={<LogoutOutlined />} style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                  Logout
                </Button>
              </div>
            </Header>
          </div>
        </Space>
      </Card>

      {/* 2. PAGE TITLE & SUBTITLE */}
      <Card {...CONTENT_CARD_CONFIG} title="2. Page Title & Subtitle" style={{ marginBottom: '16px' }}>
        <Title {...STANDARD_PAGE_TITLE_CONFIG}>
          <TableOutlined /> Page Title
        </Title>
        <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
          This is the page subtitle that appears below the title on all pages.
        </Text>
      </Card>

      {/* 3. CARD TEMPLATES */}
      <Card {...CONTENT_CARD_CONFIG} title="3. Card Templates" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size={STANDARD_SPACE_SIZE_LARGE}>
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Filter Card</Text>
            <Card {...FILTER_CARD_CONFIG} title="Filter Card">
              <Row gutter={STANDARD_ROW_GUTTER}>
                <Col span={8}>
                  <Text strong style={STANDARD_FORM_LABEL_STYLE}>Search</Text>
                  <Input size={STANDARD_INPUT_SIZE} prefix={<SearchOutlined />} placeholder="Search..." />
                </Col>
                <Col span={8}>
                  <Text strong style={STANDARD_FORM_LABEL_STYLE}>Date</Text>
                  <DatePicker {...STANDARD_DATE_PICKER_CONFIG} style={{ width: '100%' }} />
                </Col>
              </Row>
            </Card>
          </div>

          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Content Card</Text>
            <Card {...CONTENT_CARD_CONFIG}>
              <Text>This is a content card with standard padding and spacing.</Text>
            </Card>
          </div>

          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Table Card</Text>
            <Card {...TABLE_CARD_CONFIG}>
              <Table
                dataSource={tableData.slice(0, 2)}
                columns={[
                  { title: 'ID', dataIndex: 'id', key: 'id' },
                  { title: 'Dealer', dataIndex: 'dealer', key: 'dealer' },
                  { title: 'Qty', dataIndex: 'qty', key: 'qty' },
                ]}
                pagination={false}
                size="small"
              />
            </Card>
          </div>
        </Space>
      </Card>

      {/* 4. TABLE TEMPLATES */}
      <Card {...CONTENT_CARD_CONFIG} title="4. Table Templates" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size={STANDARD_SPACE_SIZE_LARGE}>
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Standard Table</Text>
            <Table
              dataSource={tableData}
              columns={[
                {
                  title: 'Order ID',
                  dataIndex: 'id',
                  key: 'id',
                  render: (id) => <Tag color="blue" style={STANDARD_TAG_STYLE}>{id}</Tag>,
                },
                { title: 'Dealer', dataIndex: 'dealer', key: 'dealer', ellipsis: true },
                { title: 'Territory', dataIndex: 'territory', key: 'territory' },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => <Tag color={status === 'new' ? 'blue' : 'green'} style={STANDARD_TAG_STYLE}>{status}</Tag>,
                },
              ]}
              pagination={getStandardPagination('orders')}
              size="small"
            />
          </div>

          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Expandable Table</Text>
            <StandardExpandableTable
              dataSource={expandableData}
              expandedRowKeys={expandedRowKeys}
              onExpandedRowsChange={setExpandedRowKeys}
              loading={false}
            />
          </div>
        </Space>
      </Card>

      {/* 5. CALENDAR WIDGET */}
      <Card {...CONTENT_CARD_CONFIG} title="5. Calendar Widget" style={{ marginBottom: '16px' }}>
        <Row gutter={STANDARD_ROW_GUTTER}>
          <Col xs={24} md={12}>
            <Text strong style={STANDARD_FORM_LABEL_STYLE}>Select Date</Text>
            <DatePicker
              style={{ width: '100%' }}
              value={selectedDate}
              onChange={setSelectedDate}
              disabledDate={disabledDate}
              dateRender={dateCellRender}
              format="DD MMM YYYY"
              size={STANDARD_INPUT_SIZE}
            />
            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
              Only dates with data are selectable
            </Text>
          </Col>
        </Row>
      </Card>

      {/* 6. DEALER PRODUCT CARD */}
      <Card {...CONTENT_CARD_CONFIG} title="6. Dealer Product Card" style={{ marginBottom: '16px' }}>
        <div className="responsive-product-grid">
          {sampleProducts.map(product => (
            <DealerProductCard
              key={product.id}
              product={product}
              quantity={quantities[product.id] || 0}
              onQuantityChange={(value) => setQuantities(prev => ({ ...prev, [product.id]: value }))}
              onClear={() => {
                const newQty = { ...quantities };
                delete newQty[product.id];
                setQuantities(newQty);
              }}
              labelText="Quantity:"
              presetValues={[5, 10, 15, 20]}
              showClearButton={true}
            />
          ))}
        </div>
      </Card>

      {/* 7. TABS */}
      <Card {...CONTENT_CARD_CONFIG} title="7. Tabs" style={{ marginBottom: '16px' }}>
        <Tabs {...STANDARD_TABS_CONFIG} defaultActiveKey="tab1">
          <Tabs.TabPane tab="Tab 1" key="tab1">
            <Card {...FILTER_CARD_CONFIG} title="Filter Card in Tab">
              <Row gutter={STANDARD_ROW_GUTTER}>
                <Col span={12}>
                  <Text strong style={STANDARD_FORM_LABEL_STYLE}>Date</Text>
                  <DatePicker {...STANDARD_DATE_PICKER_CONFIG} style={{ width: '100%' }} />
                </Col>
              </Row>
            </Card>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Tab 2" key="tab2">
            <Card {...CONTENT_CARD_CONFIG}>Content in Tab 2</Card>
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* 8. INLINE FILTERS */}
      <Card {...CONTENT_CARD_CONFIG} title="8. Inline Filters (Dashboard Pattern)" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Space>
            <Radio.Group size={STANDARD_RADIO_SIZE}>
              <Radio.Button value="today">Today</Radio.Button>
              <Radio.Button value="all">All Orders</Radio.Button>
            </Radio.Group>
            <DatePicker {...STANDARD_DATE_PICKER_CONFIG} />
          </Space>
        </div>
      </Card>

      {/* 9. ALERT / INFO SECTIONS */}
      <Card {...CONTENT_CARD_CONFIG} title="9. Alert / Info Sections" style={{ marginBottom: '16px' }}>
        <Alert
          {...STANDARD_ALERT_CONFIG}
          message={<span style={{ color: 'white', fontSize: '14px' }}>Info Alert with Gradient Background</span>}
          type="info"
          icon={<InfoCircleOutlined style={{ color: 'white', fontSize: '16px' }} />}
          style={{
            ...STANDARD_ALERT_CONFIG.style,
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            border: 'none',
          }}
        />
      </Card>

      {/* 10. STATISTICS CARDS */}
      <Card {...CONTENT_CARD_CONFIG} title="10. Statistics Cards" style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '8px' }}>
              <Statistic
                {...STANDARD_STATISTIC_CONFIG}
                title={<span style={{ color: 'white' }}>Products</span>}
                value={123}
                prefix={<AppstoreOutlined />}
                valueStyle={{ ...STANDARD_STATISTIC_CONFIG.valueStyle, color: 'white' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', borderRadius: '8px' }}>
              <Statistic
                {...STANDARD_STATISTIC_CONFIG}
                title={<span style={{ color: 'white' }}>Total Orders</span>}
                value={456}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ ...STANDARD_STATISTIC_CONFIG.valueStyle, color: 'white' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', height: '100%' }} bodyStyle={{ padding: '12px' }}>
              <Statistic
                {...STANDARD_STATISTIC_CONFIG}
                title={<span style={{ color: 'white' }}>Products Allocated</span>}
                value={78}
                prefix={<GiftOutlined />}
                suffix="items"
                valueStyle={{ ...STANDARD_STATISTIC_CONFIG.valueStyle, color: 'white' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 11. IMPORT SECTION CARDS */}
      <Card {...CONTENT_CARD_CONFIG} title="11. Import Section Cards" style={{ marginBottom: '16px' }}>
        <Card {...CONTENT_CARD_CONFIG}>
          <Row gutter={[16, 16]} align="middle">
            <Col>
              <Upload accept=".xlsx,.xls" beforeUpload={() => false}>
                <Button size={STANDARD_BUTTON_SIZE} icon={<UploadOutlined />}>Import Excel</Button>
              </Upload>
            </Col>
            <Col>
              <Button size={STANDARD_BUTTON_SIZE} icon={<FileExcelOutlined />}>Download Template</Button>
            </Col>
          </Row>
        </Card>
      </Card>

      {/* 12. BUTTON SECTIONS IN CONTENT CARDS */}
      <Card {...CONTENT_CARD_CONFIG} title="12. Button Sections in Content Cards" style={{ marginBottom: '16px' }}>
        <Card {...CONTENT_CARD_CONFIG}>
          <Row gutter={[16, 16]} align="middle">
            <Col>
              <Button size={STANDARD_BUTTON_SIZE} type="primary" icon={<PlusOutlined />}>Add User</Button>
            </Col>
          </Row>
        </Card>
      </Card>

      {/* 13. SEARCH IN CONTENT CARDS */}
      <Card {...CONTENT_CARD_CONFIG} title="13. Search in Content Cards" style={{ marginBottom: '16px' }}>
        <Card {...CONTENT_CARD_CONFIG}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search products..."
                prefix={<SearchOutlined />}
                allowClear
                size={STANDARD_INPUT_SIZE}
              />
            </Col>
          </Row>
        </Card>
      </Card>

      {/* 14. UI ELEMENTS */}
      <Card {...CONTENT_CARD_CONFIG} title="14. UI Elements" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size={STANDARD_SPACE_SIZE_LARGE}>
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Row Gutter</Text>
            <Row gutter={STANDARD_ROW_GUTTER}>
              <Col span={12}>
                <Card size="small">Column 1</Card>
              </Col>
              <Col span={12}>
                <Card size="small">Column 2</Card>
              </Col>
            </Row>
          </div>

          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Tags</Text>
            <Space>
              <Tag color="blue" style={STANDARD_TAG_STYLE}>Blue Tag</Tag>
              <Tag color="green" style={STANDARD_TAG_STYLE}>Green Tag</Tag>
              <Tag color="orange" style={STANDARD_TAG_STYLE}>Orange Tag</Tag>
            </Space>
          </div>

          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Form Elements</Text>
            <Form layout="vertical" size={STANDARD_INPUT_SIZE}>
              <Form.Item label={<Text strong style={STANDARD_FORM_LABEL_STYLE}>Label</Text>}>
                <Input size={STANDARD_INPUT_SIZE} placeholder="Input field" />
              </Form.Item>
              <Form.Item label={<Text strong style={STANDARD_FORM_LABEL_STYLE}>Number</Text>}>
                <InputNumber size={STANDARD_INPUT_NUMBER_SIZE} style={{ width: '100%' }} />
              </Form.Item>
            </Form>
          </div>
        </Space>
      </Card>

      {/* 15. EMPTY STATES */}
      <Card {...CONTENT_CARD_CONFIG} title="15. Empty States" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size={STANDARD_SPACE_SIZE_LARGE}>
          <Card {...CONTENT_CARD_CONFIG} style={{ textAlign: 'center' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No items found"
              {...STANDARD_EMPTY_CONFIG}
            >
              <Button size={STANDARD_BUTTON_SIZE} type="primary" icon={<PlusOutlined />}>Add Item</Button>
            </Empty>
          </Card>
          <Card {...CONTENT_CARD_CONFIG}>
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              No products assigned
            </div>
          </Card>
        </Space>
      </Card>

      {/* 16. LOADING STATES */}
      <Card {...CONTENT_CARD_CONFIG} title="16. Loading States" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size={STANDARD_SPACE_SIZE_LARGE}>
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Full Page Loading</Text>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
              <Spin size={STANDARD_SPIN_SIZE} />
            </div>
          </div>
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Inline Loading with Text</Text>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size={STANDARD_SPIN_SIZE} />
              <div style={{ marginTop: '10px', color: '#666' }}>Loading form data...</div>
            </div>
          </div>
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Table Loading</Text>
            <Table
              dataSource={[]}
              columns={[{ title: 'Column', dataIndex: 'col', key: 'col' }]}
              loading={true}
              size="small"
            />
          </div>
        </Space>
      </Card>

      {/* 17. MODALS */}
      <Card {...CONTENT_CARD_CONFIG} title="17. Modals" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Button size={STANDARD_BUTTON_SIZE} type="primary" onClick={() => setModalVisible(true)}>Open Modal</Button>
          <Modal
            {...STANDARD_MODAL_CONFIG}
            title="Example Modal"
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
          >
            <Form layout="vertical">
              <Form.Item label="Name">
                <Input placeholder="Enter name" />
              </Form.Item>
              <Form.Item>
                <Button size={STANDARD_BUTTON_SIZE} type="primary">Submit</Button>
                <Button size={STANDARD_BUTTON_SIZE} style={{ marginLeft: '8px' }} onClick={() => setModalVisible(false)}>Cancel</Button>
              </Form.Item>
            </Form>
          </Modal>
        </Space>
      </Card>

      {/* 18. POPCONFIRM / CONFIRMATION DIALOGS */}
      <Card {...CONTENT_CARD_CONFIG} title="18. Popconfirm / Confirmation Dialogs" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Simple Popconfirm</Text>
            <Popconfirm
              {...STANDARD_POPCONFIRM_CONFIG}
              title="Delete this item?"
              onConfirm={() => console.log('Confirmed')}
            >
              <Button size={STANDARD_BUTTON_SIZE} danger>Delete</Button>
            </Popconfirm>
          </div>
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Popconfirm with Description</Text>
            <Popconfirm
              title="Delete Order"
              description="Are you sure? This action cannot be undone."
              onConfirm={() => console.log('Confirmed')}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button size={STANDARD_BUTTON_SIZE} danger icon={<DeleteOutlined />}>Delete Order</Button>
            </Popconfirm>
          </div>
        </Space>
      </Card>

      {/* 19. BADGE */}
      <Card {...CONTENT_CARD_CONFIG} title="19. Badge" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Badge on Button</Text>
            <Badge {...STANDARD_BADGE_CONFIG} count={5}>
              <Button type="primary" icon={<AppstoreOutlined />} size={STANDARD_BUTTON_SIZE}>
                View Products
              </Button>
            </Badge>
          </div>
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Badge with Zero Count</Text>
            <Badge {...STANDARD_BADGE_CONFIG} count={0}>
              <Button size={STANDARD_BUTTON_SIZE} icon={<ShoppingCartOutlined />}>Cart</Button>
            </Badge>
          </div>
        </Space>
      </Card>

      {/* 20. TOOLTIP */}
      <Card {...CONTENT_CARD_CONFIG} title="20. Tooltip" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Tooltip on Button</Text>
            <Tooltip {...STANDARD_TOOLTIP_CONFIG} title="This is a tooltip message">
              <Button size={STANDARD_BUTTON_SIZE}>Hover me</Button>
            </Tooltip>
          </div>
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Tooltip on Disabled Button</Text>
            <Tooltip {...STANDARD_TOOLTIP_CONFIG} title="Only today's orders can be deleted">
              <Button danger icon={<DeleteOutlined />} disabled>Delete Order</Button>
            </Tooltip>
          </div>
        </Space>
      </Card>

      {/* 21. RADIO */}
      <Card {...CONTENT_CARD_CONFIG} title="21. Radio" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size={STANDARD_SPACE_SIZE_MIDDLE}>
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Radio Group</Text>
            <Radio.Group size={STANDARD_RADIO_SIZE}>
              <Radio.Button value="today">Today</Radio.Button>
              <Radio.Button value="all">All Orders</Radio.Button>
            </Radio.Group>
          </div>
        </Space>
      </Card>

      {/* 22. DATE PICKER */}
      <Card {...CONTENT_CARD_CONFIG} title="22. Date Picker" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size={STANDARD_SPACE_SIZE_MIDDLE}>
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Standard Date Picker</Text>
            <DatePicker {...STANDARD_DATE_PICKER_CONFIG} style={{ width: '100%' }} />
          </div>
        </Space>
      </Card>

      {/* 23. INPUT NUMBER */}
      <Card {...CONTENT_CARD_CONFIG} title="23. Input Number" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size={STANDARD_SPACE_SIZE_MIDDLE}>
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Standard Input Number</Text>
            <InputNumber size={STANDARD_INPUT_NUMBER_SIZE} style={{ width: '100%' }} placeholder="Enter number" />
          </div>
        </Space>
      </Card>

      {/* 24. SPACE */}
      <Card {...CONTENT_CARD_CONFIG} title="24. Space" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size={STANDARD_SPACE_SIZE_MIDDLE}>
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Space - Small</Text>
            <Space size={STANDARD_SPACE_SIZE_SMALL}>
              <Button>Button 1</Button>
              <Button>Button 2</Button>
              <Button>Button 3</Button>
            </Space>
          </div>
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Space - Middle</Text>
            <Space size={STANDARD_SPACE_SIZE_MIDDLE}>
              <Button>Button 1</Button>
              <Button>Button 2</Button>
              <Button>Button 3</Button>
            </Space>
          </div>
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Space - Large</Text>
            <Space size={STANDARD_SPACE_SIZE_LARGE}>
              <Button>Button 1</Button>
              <Button>Button 2</Button>
              <Button>Button 3</Button>
            </Space>
          </div>
        </Space>
      </Card>

      {/* 25. DIVIDER */}
      <Card {...CONTENT_CARD_CONFIG} title="25. Divider" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size={STANDARD_SPACE_SIZE_MIDDLE}>
          <div>
            <Text>Content above divider</Text>
            <Divider {...STANDARD_DIVIDER_CONFIG} />
            <Text>Content below divider</Text>
          </div>
          <div>
            <Text>Horizontal divider with text</Text>
            <Divider {...STANDARD_DIVIDER_CONFIG}>OR</Divider>
            <Text>More content</Text>
          </div>
        </Space>
      </Card>

      {/* Drawer for navbar demo */}
      <Drawer
        title="Navigation Menu"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={200}
        className="navigation-drawer"
      >
        <div className="drawer-menu-items">
          {getMenuItems().map(item => (
            <div
              key={item.key}
              className={`drawer-menu-item ${selectedMenuItem === item.key ? 'drawer-menu-item-selected' : ''}`}
              onClick={() => {
                setSelectedMenuItem(item.key);
                setDrawerOpen(false);
              }}
              style={{ cursor: 'pointer' }}
            >
              <span className="drawer-menu-item-icon">{item.icon}</span>
              <span className="drawer-menu-item-label">{item.label}</span>
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
}

export default UnifiedUITemplate;

