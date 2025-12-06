import { Card, Typography, Button, Row, Col, Space, Input, DatePicker, Table, Alert, Divider } from 'antd';
import { 
  FilterOutlined, 
  PlusOutlined, 
  TableOutlined, 
  UploadOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { FILTER_CARD_CONFIG, CONTENT_CARD_CONFIG, TABLE_CARD_CONFIG, STANDARD_CARD_STYLES } from '../../templates/CardTemplates';

const { Title, Text } = Typography;

/**
 * DEMO PAGE: Standard Card Templates
 * 
 * This page demonstrates the standard card patterns used across the application.
 * All cards MUST follow these patterns for consistency.
 */
function CardTemplatesDemo() {
  // Sample table data
  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
  ];

  const tableData = [
    { key: '1', name: 'Product 1', code: 'P001' },
    { key: '2', name: 'Product 2', code: 'P002' },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: '8px' }}>
        <TableOutlined /> Standard Card Templates
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Standard card patterns and configurations for consistent card styling across the application.
      </Text>

      {/* Pattern 1: Filter Card with Title */}
      <Card 
        title="Pattern 1: Filter/Input Card with Title"
        style={FILTER_CARD_CONFIG.style}
        bodyStyle={FILTER_CARD_CONFIG.bodyStyle}
      >
        <Alert
          message="Use this pattern for filter sections, input forms, and titled content sections."
          description={
            <div>
              <Text>Standard Configuration:</Text>
              <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                <li>Card title prop: <code>title="Card Title"</code></li>
                <li>Style: <code>{`{ marginBottom: '16px', borderRadius: '8px' }`}</code></li>
                <li>Body style: <code>{`{ padding: '12px' }`}</code></li>
              </ul>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />

        <Card 
          title="Filter Orders" 
          style={FILTER_CARD_CONFIG.style} 
          bodyStyle={FILTER_CARD_CONFIG.bodyStyle}
        >
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Text strong style={{ fontSize: '12px' }}>Date</Text>
                <DatePicker 
                  style={{ width: '100%' }} 
                  size="middle"
                  placeholder="Select date"
                />
              </Space>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Text strong style={{ fontSize: '12px' }}>Product</Text>
                <Input 
                  placeholder="Search products..."
                  style={{ width: '100%' }}
                />
              </Space>
            </Col>
          </Row>
        </Card>
      </Card>

      {/* Pattern 2: Content Card without Title */}
      <Card 
        title="Pattern 2: Content Card without Title"
        style={FILTER_CARD_CONFIG.style}
        bodyStyle={FILTER_CARD_CONFIG.bodyStyle}
      >
        <Alert
          message="Use this pattern for simple content cards without titles (buttons, actions, simple sections)."
          description={
            <div>
              <Text>Standard Configuration:</Text>
              <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                <li>No title prop</li>
                <li>Style: <code>{`{ marginBottom: '16px', borderRadius: '8px' }`}</code></li>
                <li>No bodyStyle padding (uses default)</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />

        <Card style={CONTENT_CARD_CONFIG.style}>
          <Row gutter={[16, 16]} align="middle">
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
              >
                Add Item
              </Button>
            </Col>
            <Col>
              <Button
                icon={<UploadOutlined />}
              >
                Upload
              </Button>
            </Col>
          </Row>
        </Card>
      </Card>

      {/* Pattern 3: Table Card */}
      <Card 
        title="Pattern 3: Table Card"
        style={FILTER_CARD_CONFIG.style}
        bodyStyle={FILTER_CARD_CONFIG.bodyStyle}
      >
        <Alert
          message="Use this pattern for cards containing tables."
          description={
            <div>
              <Text>Standard Configuration:</Text>
              <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                <li>No title prop (or optional title)</li>
                <li>Style: <code>{`{ borderRadius: '8px' }`}</code></li>
                <li>No marginBottom (tables usually don't need spacing below)</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />

        <Card style={TABLE_CARD_CONFIG.style}>
          <Table
            columns={tableColumns}
            dataSource={tableData}
            pagination={false}
            size="small"
          />
        </Card>
      </Card>

      <Divider />

      {/* Code Examples */}
      <Card 
        title="Code Examples"
        style={FILTER_CARD_CONFIG.style}
        bodyStyle={FILTER_CARD_CONFIG.bodyStyle}
      >
        <Title level={5}>Pattern 1 - Filter Card with Title:</Title>
        <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', overflow: 'auto', marginBottom: '24px' }}>
          <code>{`import { FILTER_CARD_CONFIG } from '../templates/CardTemplates';

<Card 
  title="Filter Orders" 
  style={FILTER_CARD_CONFIG.style} 
  bodyStyle={FILTER_CARD_CONFIG.bodyStyle}
>
  {/* Filter content */}
</Card>`}</code>
        </pre>

        <Title level={5}>Pattern 2 - Content Card without Title:</Title>
        <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', overflow: 'auto', marginBottom: '24px' }}>
          <code>{`import { CONTENT_CARD_CONFIG } from '../templates/CardTemplates';

<Card style={CONTENT_CARD_CONFIG.style}>
  {/* Content */}
</Card>`}</code>
        </pre>

        <Title level={5}>Pattern 3 - Table Card:</Title>
        <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', overflow: 'auto' }}>
          <code>{`import { TABLE_CARD_CONFIG } from '../templates/CardTemplates';

<Card style={TABLE_CARD_CONFIG.style}>
  <Table {...tableProps} />
</Card>`}</code>
        </pre>
      </Card>

      {/* Used In */}
      <Card 
        title="Currently Used In"
        style={FILTER_CARD_CONFIG.style}
        bodyStyle={FILTER_CARD_CONFIG.bodyStyle}
      >
        <Title level={5}>Pattern 1 (Filter Card):</Title>
        <ul>
          <li>✅ <strong>PlacedOrders.js</strong> - Filter Orders card</li>
          <li>✅ <strong>TSOReport.js</strong> - Report filter cards</li>
          <li>✅ <strong>DailyReport.js</strong> - Report filter cards</li>
        </ul>

        <Title level={5} style={{ marginTop: '16px' }}>Pattern 2 (Content Card):</Title>
        <ul>
          <li>✅ <strong>ProductManagement.js</strong> - Import Section card</li>
          <li>✅ <strong>UserManagement.js</strong> - Add User Button card</li>
        </ul>

        <Title level={5} style={{ marginTop: '16px' }}>Pattern 3 (Table Card):</Title>
        <ul>
          <li>✅ <strong>ProductManagement.js</strong> - Products Table card</li>
        </ul>
      </Card>
    </div>
  );
}

export default CardTemplatesDemo;

