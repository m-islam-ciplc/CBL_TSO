import { useState } from 'react';
import { Card, Typography, Table, Tag, Space, Divider, Row, Col } from 'antd';
import { TableOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getStandardPagination } from '../../../templates/UIConfig';

const { Title, Text } = Typography;

/**
 * DEMO: Standard Tables
 * 
 * This is the standard table template for all tables in the application.
 * All tables must follow this exact pattern for consistency.
 */

const StandardTablesDemo = () => {
  const [loading] = useState(false);

  // Sample data
  const sampleData = [
    {
      id: 'ORD-001',
      dealer_name: 'Power Battery',
      territory: 'Dhaka',
      item_count: 3,
      total_quantity: 25,
      status: 'new',
      created_at: '2024-12-16T10:30:00',
    },
    {
      id: 'ORD-002',
      dealer_name: 'Green Energy',
      territory: 'Chittagong',
      item_count: 2,
      total_quantity: 15,
      status: 'confirmed',
      created_at: '2024-12-16T14:20:00',
    },
    {
      id: 'ORD-003',
      dealer_name: 'City Batteries',
      territory: 'Sylhet',
      item_count: 1,
      total_quantity: 20,
      status: 'dispatched',
      created_at: '2024-12-17T09:15:00',
    },
    {
      id: 'ORD-004',
      dealer_name: 'Auto Power',
      territory: 'Rajshahi',
      item_count: 4,
      total_quantity: 30,
      status: 'delivered',
      created_at: '2024-12-17T11:45:00',
    },
  ];

  // Standard pagination configuration
  const standardPagination = getStandardPagination('items');

  // Status tag helper
  const getStatusTag = (status) => {
    const statusMap = {
      new: { color: 'blue', text: 'New' },
      confirmed: { color: 'green', text: 'Confirmed' },
      dispatched: { color: 'orange', text: 'Dispatched' },
      delivered: { color: 'purple', text: 'Delivered' },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  // Standard table columns
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
      render: (id) => (
        <Tag color="blue" style={{ fontSize: '12px' }}>
          {id}
        </Tag>
      ),
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Dealer',
      dataIndex: 'dealer_name',
      key: 'dealer_name',
      ellipsis: {
        showTitle: true,
      },
      sorter: (a, b) => (a.dealer_name || '').localeCompare(b.dealer_name || ''),
    },
    {
      title: 'Territory',
      dataIndex: 'territory',
      key: 'territory',
      ellipsis: true,
      sorter: (a, b) => (a.territory || '').localeCompare(b.territory || ''),
    },
    {
      title: 'Products',
      key: 'products',
      ellipsis: true,
      render: (_, record) => (
        <Tag color="green" style={{ fontSize: '12px' }}>
          {record.item_count} item{(record.item_count || 0) !== 1 ? 's' : ''}
        </Tag>
      ),
      sorter: (a, b) => (a.item_count || 0) - (b.item_count || 0),
    },
    {
      title: 'Total Quantity',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      ellipsis: true,
      render: (qty) => <Text strong>{qty || 0}</Text>,
      sorter: (a, b) => (a.total_quantity || 0) - (b.total_quantity || 0),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => getStatusTag(status),
      sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      ellipsis: true,
      render: (date) => dayjs(date).format('DD MMM YYYY, HH:mm'),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Title level={3} style={{ marginBottom: '8px' }}>
        <TableOutlined /> Standard Tables Demo
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        This is the standard template for all tables in the application. All tables must follow this exact pattern.
      </Text>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Example 1: Standard Table */}
        <Card title="Example 1: Standard Table" style={{ borderRadius: '8px' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              Standard table with pagination, sorting, and ellipsis for long text.
            </Text>
            
            <Table
              columns={columns}
              dataSource={sampleData}
              loading={loading}
              rowKey="id"
              pagination={standardPagination}
            />
          </Space>
        </Card>

        {/* Design Specifications */}
        <Card title="Design Specifications" style={{ borderRadius: '8px', background: '#f0f7ff' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>Pagination Configuration:</Text>
              <Text type="secondary" style={{ fontSize: '12px', fontFamily: 'monospace', display: 'block' }}>
                {`{
  current: 1,
  pageSize: 20,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => \`\${range[0]}-\${range[1]} of \${total} items\`,
  pageSizeOptions: ['10', '20', '50', '100'],
  defaultPageSize: 20,
}`}
              </Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>Column Configuration:</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                - <code>ellipsis: true</code> - For text columns that may overflow{'\n'}
                - <code>ellipsis: {'{'} showTitle: true {'}'}</code> - Show full text on hover{'\n'}
                - <code>sorter</code> - Function for sorting{'\n'}
                - <code>render</code> - Custom rendering (Tags, Text components)
              </Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>ID Columns:</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Use <code>Tag</code> component with <code>color="blue"</code> and <code>fontSize: '12px'</code>
              </Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>Status Columns:</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Use <code>Tag</code> component with appropriate colors (blue, green, orange, purple)
              </Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>Card Wrapper:</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Wrap table in <code>Card</code> component with <code>borderRadius: '8px'</code>
              </Text>
            </div>
          </Space>
        </Card>

        {/* Usage Example */}
        <Card title="Usage Example" style={{ borderRadius: '8px' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              Copy this pattern for all standard tables:
            </Text>
            <Card 
              style={{ 
                background: '#fafafa', 
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}
              bodyStyle={{ padding: '12px' }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '11px' }}>
{`// Standard pagination configuration
const pagination = {
  current: 1,
  pageSize: 20,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => \`\${range[0]}-\${range[1]} of \${total} items\`,
  pageSizeOptions: ['10', '20', '50', '100'],
  defaultPageSize: 20,
};

// Standard columns with ellipsis and sorting
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    ellipsis: true,
    render: (id) => (
      <Tag color="blue" style={{ fontSize: '12px' }}>
        {id}
      </Tag>
    ),
    sorter: (a, b) => a.id.localeCompare(b.id),
  },
  // ... more columns
];

// Standard table
<Card style={{ borderRadius: '8px' }}>
  <Table
    columns={columns}
    dataSource={data}
    loading={loading}
    rowKey="id"
    pagination={pagination}
  />
</Card>`}
              </pre>
            </Card>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default StandardTablesDemo;

