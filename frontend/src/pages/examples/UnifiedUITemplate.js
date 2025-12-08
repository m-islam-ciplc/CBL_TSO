import { useState } from 'react';
import { 
  Layout, 
  Typography, 
  Button, 
  Drawer, 
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
  FileExcelOutlined,
  BarChartOutlined,
  LogoutOutlined,
  MoreOutlined,
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
  DownloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { DealerProductCard } from '../../templates/DealerProductCard';
import { STANDARD_CARD_CONFIG, FILTER_CARD_CONFIG, DATE_SELECTION_CARD_CONFIG, FORM_CARD_CONFIG, IMPORT_CARD_CONFIG, ACTION_CARD_CONFIG, TABLE_CARD_CONFIG } from '../../templates/CardTemplates';
import { 
  STANDARD_ROW_GUTTER, 
  STANDARD_TAG_STYLE, 
  STANDARD_FORM_LABEL_STYLE, 
  STANDARD_INPUT_SIZE,
  STANDARD_RADIO_SIZE,
  STANDARD_ALERT_CONFIG,
  STANDARD_STATISTIC_CONFIG,
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
  renderTableHeaderWithSearch,
  renderTableHeaderWithSearchAndFilter,
} from '../../templates/UIElements';
import { STANDARD_PAGE_TITLE_CONFIG, STANDARD_PAGE_SUBTITLE_CONFIG } from '../../templates/UIElements';
import { createStandardDatePickerConfig, createStandardDateRangePicker } from '../../templates/UIConfig';
import { getStandardPagination } from '../../templates/UIConfig';
import { renderStandardExpandedRow, StandardExpandableTable, renderProductDetailsStack } from '../../templates/TableTemplate';
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
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
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

  const tableProductsData = [
    {
      key: '1',
      id: '001',
      order_id: '001',
      order_date: '2024-12-16',
      dealer: 'Power Battery',
      territory: 'Dhaka',
      warehouse_id: 5, // SO
      item_count: 2,
      products: [
        { id: 'p1', product_code: '6DGA-225(H)', product_name: '6DGA-225(H)', quantity: 10, unit_tp: 1250 },
        { id: 'p2', product_code: '6DGA-180(H)', product_name: 'Kingshuk Power', quantity: 8, unit_tp: 1100 },
      ],
    },
    {
      key: '2',
      id: '002',
      order_id: '002',
      order_date: '2024-12-17',
      dealer: 'Green Energy',
      territory: 'Chittagong',
      warehouse_id: null, // DD
      item_count: 1,
      products: [
        { id: 'p3', product_code: '6DGA-200(H)', product_name: '6DGA-200(H)', quantity: 5, unit_tp: 1200 },
      ],
    },
  ];

  const expandableData = [
    {
      key: '1',
      order_id: 'ORD-001',
      created_at: '2024-12-16T10:30:00',
      order_date: '2024-12-16',
      order_type: 'Daily Demand',
      item_count: 3,
      total_quantity: 25,
      items: [
        { product_code: '6DGA-225(H)', product_name: 'Kingshuk Power', quantity: 10, unit_tp: 1250 },
        { product_code: '6DGA-180(H)', product_name: 'Kingshuk Power 180', quantity: 8, unit_tp: 1100 },
        { product_code: '6DGA-200(H)', product_name: 'Kingshuk Power 200', quantity: 7, unit_tp: 1200 },
      ]
    },
  ];

  const expandableColumns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      ellipsis: true,
      render: (id) => <Tag color="blue" style={STANDARD_TAG_STYLE}>{id}</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'order_date',
      key: 'order_date',
      ellipsis: true,
    },
    {
      title: 'Order Type',
      dataIndex: 'order_type',
      key: 'order_type',
      ellipsis: true,
      render: (type) => <Tag color="green" style={STANDARD_TAG_STYLE}>{type}</Tag>,
    },
    {
      title: 'Products',
      key: 'products',
      ellipsis: true,
      render: (_, record) => (
        <Tag color="green" style={STANDARD_TAG_STYLE}>
          {record.item_count || 0} item{(record.item_count || 0) !== 1 ? 's' : ''}
        </Tag>
      ),
    },
    {
      title: 'Total Quantity',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      ellipsis: true,
      render: (qty) => <Text strong>{qty || 0}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const isExpanded = expandedRowKeys.includes(record.order_id);
        return (
          <Badge {...STANDARD_BADGE_CONFIG} count={record.item_count || 0}>
            <Button
              type="primary"
              icon={<AppstoreOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (isExpanded) {
                  setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.order_id));
                } else {
                  setExpandedRowKeys([...expandedRowKeys, record.order_id]);
                }
              }}
            >
              {isExpanded ? 'Hide Details' : 'View Details'}
            </Button>
          </Badge>
        );
      },
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
      <Card {...STANDARD_CARD_CONFIG} title="1. Navigation Bar">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          This is the navigation bar template used across all pages in App.js.
          Includes menu items, drawer for overflow, and user actions. Used in all pages with navigation.
        </Text>
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
      <Card {...STANDARD_CARD_CONFIG} title="2. Page Title & Subtitle">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          Standard page title and subtitle pattern used on all pages.
          Title includes icon, subtitle provides context below the title. Used in PlacedOrders page, Orders & Demands section.
        </Text>
        <Title {...STANDARD_PAGE_TITLE_CONFIG}>
          <TableOutlined /> Page Title
        </Title>
        <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
          This is the page subtitle that appears below the title on all pages.
        </Text>
      </Card>

      {/* 3. CARD TEMPLATES */}
      <Card {...STANDARD_CARD_CONFIG} title="3. Card Templates">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          Standard card templates from CardTemplates.js used throughout the application.
          Each card type has a specific background color and styling. Table Card uses light indigo background (#f0f0ff).
          Expandable Table Card uses very light purple background (#faf5ff). Used in Dealer My Reports page, View Orders section, and Manage Dealers page.
        </Text>
        <Space direction="vertical" style={{ width: '100%' }} size={STANDARD_SPACE_SIZE_LARGE}>
          <div>
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
            <Card {...DATE_SELECTION_CARD_CONFIG} title="Date Selection Card">
              <Row gutter={STANDARD_ROW_GUTTER}>
                <Col span={12}>
                  <Text strong style={STANDARD_FORM_LABEL_STYLE}>Select Date</Text>
                  <DatePicker {...STANDARD_DATE_PICKER_CONFIG} style={{ width: '100%' }} />
                </Col>
              </Row>
            </Card>
          </div>

          <div>
            <Card {...FORM_CARD_CONFIG} title="Form Card">
              <Row gutter={STANDARD_ROW_GUTTER}>
                <Col span={12}>
                  <Text strong style={STANDARD_FORM_LABEL_STYLE}>Date</Text>
                  <DatePicker {...STANDARD_DATE_PICKER_CONFIG} style={{ width: '100%' }} />
                </Col>
                <Col span={12}>
                  <Text strong style={STANDARD_FORM_LABEL_STYLE}>Quantity</Text>
                  <InputNumber style={{ width: '100%' }} placeholder="Enter quantity" />
                </Col>
              </Row>
            </Card>
          </div>

          <div>
            <Card {...IMPORT_CARD_CONFIG} title="Import Card">
              <Row gutter={STANDARD_ROW_GUTTER} align="middle">
                <Col>
                  <Button type="primary" icon={<UploadOutlined />}>
                    Import Data (Excel)
                  </Button>
                </Col>
                <Col>
                  <Button icon={<DownloadOutlined />}>
                    Download Template
                  </Button>
                </Col>
              </Row>
            </Card>
          </div>

          <div>
            <Card {...ACTION_CARD_CONFIG} title="Action Card">
              <Row gutter={STANDARD_ROW_GUTTER} align="middle">
                <Col>
                  <Button type="primary" icon={<PlusOutlined />}>
                    Add User
                  </Button>
                </Col>
              </Row>
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

          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Table Card with Inline Search</Text>
            <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>
              Table header with inline search box. This is the template design used in PlacedOrders.js &quot;Orders & Demands&quot; table.
            </Text>
            <Card {...TABLE_CARD_CONFIG}>
              {renderTableHeaderWithSearch({
                title: 'Orders',
                count: 25,
                searchTerm: '',
                onSearchChange: () => {},
                searchPlaceholder: 'Search orders...'
              })}
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

          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Table Card with Products (Orders &amp; Demands)</Text>
            <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>
              Product details stacked with product name bold, code muted, quantity in green. Matches Orders &amp; Demands table.
            </Text>
            <Card {...TABLE_CARD_CONFIG}>
              <Table
                dataSource={tableProductsData}
                columns={[
                  {
                    title: 'Order ID',
                    dataIndex: 'order_id',
                    key: 'order_id',
                    render: (orderId, record) => {
                    const isTSOOrder = record.order_type === 'SO' || record.order_type_name === 'SO';
                      const prefix = isTSOOrder ? 'SO' : 'DD';
                      return (
                        <Tag color={isTSOOrder ? 'blue' : 'green'} style={STANDARD_TAG_STYLE}>
                          {prefix}-{orderId}
                        </Tag>
                      );
                    },
                  },
                  {
                    title: 'Order Date',
                    dataIndex: 'order_date',
                    key: 'order_date',
                  },
                  { title: 'Dealer', dataIndex: 'dealer', key: 'dealer', ellipsis: true },
                  { title: 'Territory', dataIndex: 'territory', key: 'territory', ellipsis: true },
                  {
                    title: 'Products',
                    key: 'products',
                    render: (_, record) => (
                      <Tag color="green" style={STANDARD_TAG_STYLE}>
                        {record.item_count} item{record.item_count !== 1 ? 's' : ''}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Product Details',
                    key: 'product_details',
                    ellipsis: true,
                    render: (_, record) =>
                      renderProductDetailsStack({
                        products: record.products,
                        showPrice: false,
                        showIndex: true,
                      }),
                  },
                  {
                    title: 'Order Type',
                    key: 'order_type',
                    render: (_, record) => {
                    const isTSOOrder = record.order_type === 'SO' || record.order_type_name === 'SO';
                      return (
                        <Tag color={isTSOOrder ? 'blue' : 'green'} style={STANDARD_TAG_STYLE}>
                          {isTSOOrder ? 'Sales Order' : 'Daily Demand'}
                        </Tag>
                      );
                    },
                  },
                ]}
                pagination={false}
                size="small"
              />
            </Card>
          </div>

          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Table Card with Inline Search and Filter</Text>
            <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>
              Table header with inline filter dropdown and search box. This is the template design used in DealerManagement.js &quot;Dealers&quot; table.
              Filter appears first, then search box. Both are aligned to the right, title on the left.
            </Text>
            <Card {...TABLE_CARD_CONFIG}>
              {renderTableHeaderWithSearchAndFilter({
                title: 'Dealers',
                count: 15,
                searchTerm: '',
                onSearchChange: () => {},
                searchPlaceholder: 'Search by dealer name or code...',
                filter: {
                  value: null,
                  onChange: () => {},
                  placeholder: 'Filter by territory',
                  options: [
                    { value: 'T1', label: 'Territory 1' },
                    { value: 'T2', label: 'Territory 2' },
                    { value: 'T3', label: 'Territory 3' }
                  ],
                  width: '200px',
                  showSearch: true
                }
              })}
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

          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Expandable Table Card</Text>
            <StandardExpandableTable
              columns={expandableColumns}
              dataSource={expandableData}
              loading={false}
              rowKey="order_id"
              expandedRowKeys={expandedRowKeys}
              onExpand={(expanded, record) => {
                if (expanded) {
                  setExpandedRowKeys([...expandedRowKeys, record.order_id]);
                } else {
                  setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.order_id));
                }
              }}
              expandedRowRender={(record) => {
                const items = record.items || [];
                return renderStandardExpandedRow(
                  record,
                  items,
                  (item) => (
                    <>
                      <Text strong>{item.product_code}</Text> - {item.product_name}
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Quantity: {item.quantity}
                      </Text>
                      {item.unit_tp && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {' | '}Unit TP: ৳{item.unit_tp}
                        </Text>
                      )}
                    </>
                  ),
                  'Order Items:'
                );
              }}
              pagination={getStandardPagination('orders', 10)}
            />
          </div>
        </Space>
      </Card>

      {/* 4. TABLE TEMPLATES */}
      <Card {...STANDARD_CARD_CONFIG} title="4. Table Templates">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          Standard table templates with pagination from UIConfig.js and expandable rows from TableTemplate.js.
          Used in Dealer My Reports page, View Orders section, and Manage Dealers page.
        </Text>
      </Card>

      {/* 5. CALENDAR WIDGET */}
      <Card {...STANDARD_CARD_CONFIG} title="5. Calendar Widget">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          Standard date picker with disabled dates and custom date cell rendering from UIConfig.js.
          Only dates with available data are selectable. Used in TSO My Reports page, Order Summary section.
        </Text>
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
      <Card {...STANDARD_CARD_CONFIG} title="6. Dealer Product Card">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          Dealer product card template from DealerProductCard.js used in DailyDemandMultiDay.js and MonthlyForecastTab.js.
          Displays product information with quantity input and preset values. Used in Dealer Daily Demand page, Multi-Day Orders section.
        </Text>
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
      <Card {...STANDARD_CARD_CONFIG} title="7. Tabs">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          Standard tabs configuration from UIElements.js used in TSOReport.js, DailyReport.js, and DealerReports.js.
          Provides consistent tab styling and behavior across the application. Used in Dealer My Reports page, Daily Demand Orders and Monthly Forecasts tabs.
        </Text>
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
            <Card {...STANDARD_CARD_CONFIG}>Content in Tab 2</Card>
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* 8. INLINE FILTERS */}
      <Card {...FILTER_CARD_CONFIG} title="8. Inline Filters (Dashboard Pattern)">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          Inline filter pattern used in Dashboard.js and TSODashboard.js.
          Radio buttons for quick filters combined with date picker for date-based filtering. Used in TSO Dashboard page, Orders section.
        </Text>
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
      <Card {...STANDARD_CARD_CONFIG} title="9. Alert / Info Sections">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          Standard alert configuration from UIElements.js used for info messages and notifications.
          Supports gradient backgrounds and custom styling for different alert types. Used in TSO Dashboard page, Quota alerts section.
        </Text>
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
      <Card {...STANDARD_CARD_CONFIG} title="10. Statistics Cards">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          Statistics cards with gradient backgrounds used in Dashboard.js and TSODashboard.js.
          Displays key metrics with icons and formatted numbers using STANDARD_STATISTIC_CONFIG. Used in TSO Dashboard page, Statistics section.
        </Text>
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

      {/* 11. UI ELEMENTS */}
      <Card {...STANDARD_CARD_CONFIG} title="11. UI ELEMENTS">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          Standard UI element configurations from UIElements.js used throughout the application.
          Includes row gutters, tags, form elements, and other reusable component configurations. Used in Admin Orders & Demands page, Filter section.
        </Text>
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

      {/* 12. EMPTY STATES */}
      <Card {...STANDARD_CARD_CONFIG} title="12. Empty States">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          Empty state patterns used when no data is available. Includes Empty component from Ant Design with STANDARD_EMPTY_CONFIG.
          Used in ProductManagement.js, DealerManagement.js, and other pages with conditional content. Used in Admin Product Management page, Empty state section.
        </Text>
        <Space direction="vertical" style={{ width: '100%' }} size={STANDARD_SPACE_SIZE_LARGE}>
          <Card {...STANDARD_CARD_CONFIG} style={{ textAlign: 'center' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No items found"
              {...STANDARD_EMPTY_CONFIG}
            >
              <Button size={STANDARD_BUTTON_SIZE} type="primary" icon={<PlusOutlined />}>Add Item</Button>
            </Empty>
          </Card>
          <Card {...STANDARD_CARD_CONFIG}>
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              No products assigned
            </div>
          </Card>
        </Space>
      </Card>

      {/* 13. LOADING STATES */}
      <Card {...STANDARD_CARD_CONFIG} title="13. Loading States">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          Loading state patterns using Spin component with STANDARD_SPIN_SIZE from UIElements.js.
          Used for full page loading, inline loading, and table loading states across all pages. Used in Dealer My Reports page, Loading states section.
        </Text>
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

      {/* 14. MODALS */}
      <Card {...STANDARD_CARD_CONFIG} title="14. Modals">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          Standard modal configuration from UIElements.js used in PlacedOrders.js, UserManagement.js, and other pages.
          Provides consistent modal styling and behavior for forms and confirmations. Used in Admin Orders & Demands page, Edit Order modal.
        </Text>
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

      {/* 15. POPCONFIRM / CONFIRMATION DIALOGS */}
      <Card {...STANDARD_CARD_CONFIG} title="15. Popconfirm / Confirmation Dialogs">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          Popconfirm component with STANDARD_POPCONFIRM_CONFIG from UIElements.js used for delete confirmations.
          Used in PlacedOrders.js, UserManagement.js, and other pages requiring user confirmation before actions. Used in Admin Orders & Demands page, Delete confirmation.
        </Text>
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

      {/* 16. BADGE */}
      <Card {...STANDARD_CARD_CONFIG} title="16. Badge">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          Badge component with STANDARD_BADGE_CONFIG from UIElements.js used in DealerReports.js and other pages.
          Displays counts and notifications on buttons and other UI elements. Used in Dealer My Reports page, View Details button.
        </Text>
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

      {/* 17. TOOLTIP */}
      <Card {...STANDARD_CARD_CONFIG} title="17. Tooltip">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          Tooltip component with STANDARD_TOOLTIP_CONFIG from UIElements.js used throughout the application.
          Provides helpful hints and explanations on hover, especially for disabled buttons and icons. Used in Admin Orders & Demands page, Action buttons.
        </Text>
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

      {/* 18. RADIO */}
      <Card {...STANDARD_CARD_CONFIG} title="18. Radio">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          Radio button group with STANDARD_RADIO_SIZE from UIElements.js used in Dashboard.js and filter sections.
          Provides toggle options for filtering and selection with consistent sizing. Used in TSO Dashboard page, Filter section.
        </Text>
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

      {/* 19. DATE PICKER */}
      <Card {...STANDARD_CARD_CONFIG} title="19. Date Picker">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          Standard single date picker with STANDARD_DATE_PICKER_CONFIG from UIElements.js used throughout the application.
          Used in ProductQuotaManagement.js, Dashboard.js, and other pages requiring single date selection. Used in Admin Product Quota Management page, Date selection.
        </Text>
        <Space direction="vertical" style={{ width: '100%' }} size={STANDARD_SPACE_SIZE_MIDDLE}>
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Standard Date Picker</Text>
            <DatePicker {...STANDARD_DATE_PICKER_CONFIG} style={{ width: '100%' }} />
          </div>
        </Space>
      </Card>

      {/* 19.5. DATE RANGE PICKER TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="19.5. Date Range Picker Template">
        <Space direction="vertical" style={{ width: '100%' }} size={STANDARD_SPACE_SIZE_MIDDLE}>
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
              Standard Date Range Picker (Template from DealerReports.js)
            </Text>
            <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
              This is the template design used in DealerReports.js &quot;Daily Demand Orders&quot; tab.
              End Date is optional - leave blank for single date filtering.
            </Text>
            <Card {...STANDARD_CARD_CONFIG}>
              <Row gutter={STANDARD_ROW_GUTTER} align="bottom">
                {createStandardDateRangePicker({
                  startDate: rangeStart,
                  setStartDate: setRangeStart,
                  endDate: rangeEnd,
                  setEndDate: setRangeEnd,
                  disabledDate,
                  dateCellRender,
                  availableDates,
                  colSpan: { xs: 24, sm: 12, md: 6 }
                })}
              </Row>
            </Card>
          </div>
        </Space>
      </Card>

      {/* 20. INPUT NUMBER */}
      <Card {...STANDARD_CARD_CONFIG} title="20. Input Number">
        <Space direction="vertical" style={{ width: '100%' }} size={STANDARD_SPACE_SIZE_MIDDLE}>
          <div>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Standard Input Number</Text>
            <InputNumber size={STANDARD_INPUT_NUMBER_SIZE} style={{ width: '100%' }} placeholder="Enter number" />
          </div>
        </Space>
      </Card>

      {/* 21. SPACE */}
      <Card {...STANDARD_CARD_CONFIG} title="21. Space">
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

      {/* 22. DIVIDER */}
      <Card {...STANDARD_CARD_CONFIG} title="22. Divider">
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

