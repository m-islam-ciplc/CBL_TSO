import React, { useState } from 'react';
import { Card, Typography, Button, Space, Divider, Tag, Alert, message } from 'antd';
import { DatabaseOutlined, CopyOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { FILTER_CARD_CONFIG } from '../../templates/CardTemplates';

const { Title, Text, Paragraph } = Typography;

function TruncateTables() {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const commands = [
    {
      label: 'From project root (Recommended)',
      command: 'node project_tools_deletable/test_scripts/truncate_tables.js',
      description: 'Simple one-liner from project root'
    },
    {
      label: 'From test_scripts folder',
      command: 'cd project_tools_deletable/test_scripts\nnode truncate_tables.js',
      description: 'Run from the test_scripts directory'
    },
    {
      label: 'Alternative: Direct SQL',
      command: 'mysql -u root -p cbl_so < project_tools_deletable/test_scripts/truncate_tables.sql',
      description: 'Using MySQL command line directly'
    }
  ];

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      message.success('Command copied to clipboard!');
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>
        <DatabaseOutlined style={{ marginRight: '8px' }} />
        Truncate Database Tables
      </Title>
      
      <Paragraph>
        This page provides instructions for running the database truncate script via command line.
        The script will delete all data from most tables while preserving users, warehouses, settings, and order_types.
      </Paragraph>

      <Alert
        message="⚠️ Warning: Destructive Operation"
        description={
          <div>
            <Text strong>This operation will permanently delete data from the following tables:</Text>
            <ul style={{ marginTop: '8px', marginBottom: '8px' }}>
              <li>orders, order_items</li>
              <li>dealers, products, transports</li>
              <li>daily_quotas, monthly_forecast</li>
              <li>dealer_product_assignments</li>
            </ul>
            <Text strong style={{ color: '#52c41a' }}>The following tables will be preserved:</Text>
            <ul style={{ marginTop: '8px', marginBottom: '0' }}>
              <li>users (all user accounts)</li>
              <li>warehouses (warehouse definitions)</li>
              <li>settings (application settings)</li>
              <li>order_types (SO, DD order type definitions)</li>
            </ul>
          </div>
        }
        type="warning"
        icon={<WarningOutlined />}
        showIcon
        style={{ marginBottom: '24px' }}
      />

      <Card title="How to Run" {...FILTER_CARD_CONFIG}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {commands.map((cmd, index) => (
            <div key={index}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <Text strong>{cmd.label}</Text>
                  {cmd.description && (
                    <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                      {cmd.description}
                    </Text>
                  )}
                </div>
                <Button
                  icon={copiedIndex === index ? <CheckCircleOutlined /> : <CopyOutlined />}
                  size="small"
                  onClick={() => copyToClipboard(cmd.command, index)}
                >
                  {copiedIndex === index ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <Card
                size="small"
                style={{
                  backgroundColor: '#f5f5f5',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  whiteSpace: 'pre-wrap',
                  marginTop: '8px'
                }}
              >
                {cmd.command}
              </Card>
            </div>
          ))}
        </Space>
      </Card>

      <Card title="What Gets Truncated" {...FILTER_CARD_CONFIG}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ color: '#ff4d4f' }}>Tables Deleted (All Data Removed):</Text>
            <ul>
              <li><Text code>order_items</Text> - Order line items</li>
              <li><Text code>orders</Text> - All orders</li>
              <li><Text code>daily_quotas</Text> - Daily quota allocations</li>
              <li><Text code>monthly_forecast</Text> - Monthly forecasts</li>
              <li><Text code>dealer_product_assignments</Text> - Product assignments to dealers</li>
              <li><Text code>dealers</Text> - All dealers</li>
              <li><Text code>products</Text> - All products</li>
              <li><Text code>transports</Text> - All transports</li>
            </ul>
          </div>
          <Divider />
          <div>
            <Text strong style={{ color: '#52c41a' }}>Tables Preserved (Data Kept):</Text>
            <ul>
              <li><Text code>users</Text> - All user accounts and credentials</li>
              <li><Text code>warehouses</Text> - Warehouse definitions</li>
              <li><Text code>settings</Text> - Application settings and configuration</li>
              <li><Text code>order_types</Text> - Order type definitions (SO, DD)</li>
            </ul>
          </div>
        </Space>
      </Card>

      <Card title="Database Configuration" {...FILTER_CARD_CONFIG}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Database: </Text>
            <Tag>cbl_so</Tag>
          </div>
          <div>
            <Text strong>Default Host: </Text>
            <Tag>localhost:3306</Tag>
          </div>
          <div>
            <Text strong>Default User: </Text>
            <Tag>root</Tag>
          </div>
          <Paragraph type="secondary" style={{ marginTop: '8px' }}>
            The script uses environment variables or defaults. You can override using:
            <br />
            <Text code>DB_HOST</Text>, <Text code>DB_USER</Text>, <Text code>DB_PASSWORD</Text>, <Text code>DB_NAME</Text>, <Text code>DB_PORT</Text>
          </Paragraph>
        </Space>
      </Card>

      <Card title="What the Script Does" {...FILTER_CARD_CONFIG}>
        <Paragraph>The script will:</Paragraph>
        <ul>
          <li>Disable foreign key checks temporarily</li>
          <li>Truncate all tables except users, warehouses, settings, and order_types</li>
          <li>Re-enable foreign key checks</li>
          <li>Verify that truncated tables are empty</li>
          <li>Verify that preserved tables still have data</li>
          <li>Show detailed progress and verification results</li>
        </ul>
      </Card>

      <Card title="File Locations" {...FILTER_CARD_CONFIG}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Node.js Script: </Text>
            <Text code>project_tools_deletable/test_scripts/truncate_tables.js</Text>
          </div>
          <div>
            <Text strong>SQL Script: </Text>
            <Text code>project_tools_deletable/test_scripts/truncate_tables.sql</Text>
          </div>
          <div>
            <Text strong>Documentation: </Text>
            <Text code>project_tools_deletable/test_scripts/TRUNCATE_TABLES_README.md</Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}

export default TruncateTables;

