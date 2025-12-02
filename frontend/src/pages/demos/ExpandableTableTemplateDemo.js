import { useState } from 'react';
import { Card, Typography, Table, Tag, Space, Divider } from 'antd';
import { 
  renderStandardExpandedRow,
  StandardExpandableTable
} from '../../standard_templates/ExpandableTableTemplate';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

/**
 * DEMO PAGE: Expandable Table Template
 * 
 * This page demonstrates the standard expandable table design.
 * Use this as a reference when creating new expandable tables.
 */

const ExpandableTableTemplateDemo = () => {
  const [loading] = useState(false);

  // Sample data for demonstration
  const sampleOrders = [
    {
      order_id: 'ORD-001',
      created_at: '2024-12-16T10:30:00',
      order_type: 'Daily Demand',
      item_count: 3,
      total_quantity: 25,
      items: [
        {
          product_code: '6DGA-225(H)',
          product_name: 'Kingshuk Power',
          quantity: 10,
          unit_tp: 1250
        },
        {
          product_code: '6DGA-180(H)',
          product_name: 'Kingshuk Power',
          quantity: 8,
          unit_tp: 1100
        },
        {
          product_code: '6DGA-200(H)',
          product_name: 'Kingshuk Power',
          quantity: 7,
          unit_tp: 1200
        }
      ]
    },
    {
      order_id: 'ORD-002',
      created_at: '2024-12-16T14:20:00',
      order_type: 'Monthly Forecast',
      item_count: 2,
      total_quantity: 15,
      items: [
        {
          product_code: '6DGA-225(H)',
          product_name: 'Kingshuk Power',
          quantity: 10,
          unit_tp: 1250
        },
        {
          product_code: '6DGA-180(H)',
          product_name: 'Kingshuk Power',
          quantity: 5,
          unit_tp: 1100
        }
      ]
    },
    {
      order_id: 'ORD-003',
      created_at: '2024-12-17T09:15:00',
      order_type: 'Daily Demand',
      item_count: 1,
      total_quantity: 20,
      items: [
        {
          product_code: '6DGA-200(H)',
          product_name: 'Kingshuk Power',
          quantity: 20,
          unit_tp: 1200
        }
      ]
    },
    {
      order_id: 'ORD-004',
      created_at: '2024-12-17T11:45:00',
      order_type: 'Daily Demand',
      item_count: 4,
      total_quantity: 30,
      items: [
        {
          product_code: '6DGA-225(H)',
          product_name: 'Kingshuk Power',
          quantity: 10,
          unit_tp: 1250
        },
        {
          product_code: '6DGA-180(H)',
          product_name: 'Kingshuk Power',
          quantity: 5,
          unit_tp: 1100
        },
        {
          product_code: '6DGA-200(H)',
          product_name: 'Kingshuk Power',
          quantity: 8,
          unit_tp: 1200
        },
        {
          product_code: '6DGA-150(H)',
          product_name: 'Kingshuk Power',
          quantity: 7,
          unit_tp: 1000
        }
      ]
    }
  ];

  // Columns following the standard template
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      ellipsis: true,
      render: (orderId) => (
        <Tag color="blue" style={{ fontSize: '12px' }}>
          {orderId}
        </Tag>
      ),
      sorter: (a, b) => a.order_id.localeCompare(b.order_id),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      ellipsis: true,
      render: (date) => dayjs(date).format('DD MMM YYYY'),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Order Type',
      dataIndex: 'order_type',
      key: 'order_type',
      ellipsis: true,
      render: (type) => <Tag color="green">{type || 'DD'}</Tag>,
      sorter: (a, b) => (a.order_type || 'DD').localeCompare(b.order_type || 'DD'),
    },
    {
      title: 'Products',
      key: 'products',
      ellipsis: true,
      render: (_, record) => (
        <div>
          <Tag color="green" style={{ fontSize: '12px' }}>
            {record.item_count || 0} item{(record.item_count || 0) !== 1 ? 's' : ''}
          </Tag>
        </div>
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
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3} style={{ marginBottom: '8px' }}>
        Expandable Table Template Demo
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        This page demonstrates the standard expandable table design. All expandable tables in the application should follow this exact design pattern.
      </Text>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Example 1: Using StandardExpandableTable Component */}
        <Card 
          title="Example 1: Using StandardExpandableTable Component" 
          style={{ borderRadius: '8px' }}
        >
          <Text type="secondary" style={{ marginBottom: '16px', display: 'block', fontSize: '12px' }}>
            This is the standard template for all expandable tables. Use <code>StandardExpandableTable</code> component for all expandable tables in the application.
          </Text>
          
          <StandardExpandableTable
            columns={columns}
            dataSource={sampleOrders}
            loading={loading}
            rowKey="order_id"
            expandedRowRender={(record) => renderStandardExpandedRow(
              record,
              record.items || [],
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
            )}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} orders`,
              pageSizeOptions: ['10', '20', '50', '100'],
              defaultPageSize: 10
            }}
          />
        </Card>

        {/* Design Specifications */}
        <Card 
          title="Design Specifications" 
          style={{ borderRadius: '8px', background: '#f0f7ff' }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>Expanded Row Container:</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                padding: &apos;16px&apos;, background: &apos;#fafafa&apos;
              </Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>Title:</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                fontSize: &apos;14px&apos;, marginBottom: &apos;8px&apos;, display: &apos;block&apos; (use Text strong)
              </Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>Item Container:</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                marginBottom: &apos;8px&apos;, padding: &apos;8px&apos;, background: &apos;white&apos;, borderRadius: &apos;4px&apos;
              </Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>Font Sizes:</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Title: 14px, Body: 12px, Tags: 12px
              </Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>Tags:</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                ID tags: color=&quot;blue&quot;, fontSize: &apos;12px&apos; | Status tags: color=&quot;green&quot;
              </Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>Pagination:</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                showSizeChanger: true, showTotal: function, pageSizeOptions: [&apos;10&apos;, &apos;20&apos;, &apos;50&apos;, &apos;100&apos;]
              </Text>
            </div>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default ExpandableTableTemplateDemo;

