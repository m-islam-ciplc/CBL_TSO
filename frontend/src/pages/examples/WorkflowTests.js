import { useState } from 'react';
import { Card, Typography, Button, Space, Divider, Tag, Alert, Collapse, Tabs, message } from 'antd';
import { PlayCircleOutlined, CopyOutlined, CheckCircleOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import { 
  STANDARD_CARD_CONFIG,
  STANDARD_TABS_CONFIG, 
  STANDARD_DIVIDER_CONFIG 
} from '../../templates/UITemplates';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;

function WorkflowTests() {
  const [copiedCommands, setCopiedCommands] = useState({});

  const adminCommands = [
    {
      label: 'From project root (Recommended)',
      command: 'node project_tools_deletable/test_scripts/test_workflows.js admin',
      description: 'Run from the project root directory'
    },
    {
      label: 'From backend directory',
      command: 'cd backend\nnode ../project_tools_deletable/test_scripts/test_workflows.js admin',
      description: 'Run from the backend directory'
    },
    {
      label: 'For Docker (port 3002)',
      command: '$env:API_URL=\'http://localhost:3002\'\nnode project_tools_deletable/test_scripts/test_workflows.js admin',
      description: 'If using Docker with different port',
      os: 'Windows'
    },
    {
      label: 'For Docker (port 3002) - Linux/Mac',
      command: 'API_URL=\'http://localhost:3002\' node project_tools_deletable/test_scripts/test_workflows.js admin',
      description: 'If using Docker with different port',
      os: 'Linux/Mac'
    }
  ];

  const tsoCommands = [
    {
      label: 'From project root (Recommended)',
      command: 'node project_tools_deletable/test_scripts/test_workflows.js tso',
      description: 'Run from the project root directory'
    },
    {
      label: 'From backend directory',
      command: 'cd backend\nnode ../project_tools_deletable/test_scripts/test_workflows.js tso',
      description: 'Run from the backend directory'
    },
    {
      label: 'For Docker (port 3002)',
      command: '$env:API_URL=\'http://localhost:3002\'\nnode project_tools_deletable/test_scripts/test_workflows.js tso',
      description: 'If using Docker with different port',
      os: 'Windows'
    },
    {
      label: 'For Docker (port 3002) - Linux/Mac',
      command: 'API_URL=\'http://localhost:3002\' node project_tools_deletable/test_scripts/test_workflows.js tso',
      description: 'If using Docker with different port',
      os: 'Linux/Mac'
    }
  ];

  const dealerCommands = [
    {
      label: 'From project root (Recommended)',
      command: 'node project_tools_deletable/test_scripts/test_workflows.js dealer',
      description: 'Run from the project root directory'
    },
    {
      label: 'From backend directory',
      command: 'cd backend\nnode ../project_tools_deletable/test_scripts/test_workflows.js dealer',
      description: 'Run from the backend directory'
    },
    {
      label: 'For Docker (port 3002)',
      command: '$env:API_URL=\'http://localhost:3002\'\nnode project_tools_deletable/test_scripts/test_workflows.js dealer',
      description: 'If using Docker with different port',
      os: 'Windows'
    },
    {
      label: 'For Docker (port 3002) - Linux/Mac',
      command: 'API_URL=\'http://localhost:3002\' node project_tools_deletable/test_scripts/test_workflows.js dealer',
      description: 'If using Docker with different port',
      os: 'Linux/Mac'
    }
  ];

  const setupCommands = [
    {
      label: 'From project root (Recommended)',
      command: 'node project_tools_deletable/test_scripts/test_workflows.js setup',
      description: 'Run from the project root directory'
    },
    {
      label: 'From backend directory',
      command: 'cd backend\nnode ../project_tools_deletable/test_scripts/test_workflows.js setup',
      description: 'Run from the backend directory'
    },
    {
      label: 'For Docker (port 3002)',
      command: '$env:API_URL=\'http://localhost:3002\'\nnode project_tools_deletable/test_scripts/test_workflows.js setup',
      description: 'If using Docker with different port',
      os: 'Windows'
    },
    {
      label: 'For Docker (port 3002) - Linux/Mac',
      command: 'API_URL=\'http://localhost:3002\' node project_tools_deletable/test_scripts/test_workflows.js setup',
      description: 'If using Docker with different port',
      os: 'Linux/Mac'
    }
  ];

  const truncateCommands = [
    {
      label: 'From backend directory (Recommended)',
      command: 'cd backend\nnode ../project_tools_deletable/test_scripts/truncate_tables.js',
      description: 'Run from the backend directory with detailed logging'
    },
    {
      label: 'One-liner from project root (PowerShell)',
      command: '(cd backend; node ../project_tools_deletable/test_scripts/truncate_tables.js)',
      description: 'One command from project root',
      os: 'Windows'
    },
    {
      label: 'One-liner from project root (Linux/Git Bash)',
      command: 'cd backend && node ../project_tools_deletable/test_scripts/truncate_tables.js',
      description: 'One command from project root',
      os: 'Linux/Mac'
    },
    {
      label: 'Alternative: Direct SQL Script',
      command: 'mysql -u root -p cbl_so < project_tools_deletable/test_scripts/truncate_tables.sql',
      description: 'Using MySQL command line directly'
    }
  ];

  const adminTestCategories = [
    {
      title: 'User Management (A1-A10)',
      tests: [
        'Login', 'Navigate to Dashboard', 'Navigate to Settings',
        'Switch to Manage Users tab', 'Filter users by role',
        'Sort users', 'Create new user', 'Edit user',
        'Delete user', 'Activate/Deactivate user'
      ]
    },
    {
      title: 'Dealer Management (A11-A20)',
      tests: [
        'Switch to Manage Dealers tab', 'Search dealers',
        'Filter dealers by territory', 'Import dealers from Excel',
        'Export dealers to Excel', 'View dealer details',
        'Assign product to dealer',
        'Bulk assign products to dealer', 'Remove product assignment from dealer'
      ]
    },
    {
      title: 'Product Management (A21-A25)',
      tests: [
        'Switch to Manage Products tab', 'Search products',
        'Import products from Excel', 'Export products to Excel',
        'View product details'
      ]
    },
    {
      title: 'Transport Management (A26-A30)',
      tests: [
        'Switch to Manage Transports tab', 'Search transports',
        'Create transport', 'Edit transport', 'Delete transport'
      ]
    },
    {
      title: 'Quota Management (A31-A42)',
      tests: [
        'Switch to Manage Quotas tab', 'View quotas',
        'Bulk allocate quotas', 'Update quota', 'Delete quota',
        'Filter quotas by date', 'Filter quotas by territory',
        'Filter quotas by product', 'View TSO quota view',
        'Import quotas from Excel', 'Export quotas to Excel',
        'View quota summary'
      ]
    },
    {
      title: 'Settings (A43-A45)',
      tests: [
        'View settings', 'Update forecast start day',
        'View forecast start day'
      ]
    },
    {
      title: 'Reports (A46-A50)',
      tests: [
        'Navigate to Reports', 'View daily report',
        'Export daily report', 'View TSO report',
        'Export TSO report'
      ]
    },
    {
      title: 'Orders (A51-A56)',
      tests: [
        'View all orders', 'Filter orders by date',
        'Filter orders by dealer', 'View order details',
        'Delete order', 'Export orders report'
      ]
    },
    {
      title: 'Logout (A57)',
      tests: ['Logout functionality']
    }
  ];

  const tsoTestCategories = [
    {
      title: 'Dashboard (T1-T5)',
      tests: [
        'Login as TSO', 'Navigate to Dashboard',
        'View today\'s quotas', 'Check quota availability',
        'View quota details'
      ]
    },
    {
      title: 'Orders (T6-T15)',
      tests: [
        'Get order requirements', 'Navigate to New Orders page',
        'Select order type', 'Select warehouse', 'Select dealer',
        'Select transport', 'Get available products',
        'Add product to order', 'Create order', 'View created order'
      ]
    },
    {
      title: 'Reports (T16-T28)',
      tests: [
        'Navigate to Placed Orders page', 'Get available dates with orders',
        'View orders for a specific date', 'View orders for date range',
        'Navigate to My Reports page', 'Generate report for a specific date',
        'Generate report for date range', 'Export report to Excel for a date',
        'Export report to Excel for date range', 'View order details',
        'Filter orders by dealer', 'Sort orders', 'Logout'
      ]
    }
  ];

  const dealerTestCategories = [
    {
      title: 'Dashboard (D1-D5)',
      tests: [
        'Login as Dealer', 'Navigate to Dashboard',
        'View dealer information', 'View assigned products',
        'View order types'
      ]
    },
    {
      title: 'Orders (D6-D15)',
      tests: [
        'Get order requirements', 'Navigate to Daily Demand page',
        'Select product for order', 'Add product to order',
        'Create single-day daily demand order', 'Create multi-day daily demand orders',
        'View created order', 'Get available dates with orders',
        'View orders for a specific date', 'View orders for date range'
      ]
    },
    {
      title: 'Reports (D16-D23)',
      tests: [
        'Navigate to Dealer Reports page', 'Generate daily demand report for a date',
        'Generate daily demand report for date range', 'Export daily demand report to Excel for a date',
        'View monthly forecast periods', 'View monthly forecast data',
        'Submit monthly forecast', 'Logout'
      ]
    }
  ];

  const copyToClipboard = (text, commandId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCommands(prev => ({ ...prev, [commandId]: true }));
      message.success('Command copied to clipboard!');
      setTimeout(() => {
        setCopiedCommands(prev => ({ ...prev, [commandId]: false }));
      }, 2000);
    });
  };

  const renderCommands = (commands) => {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {commands.map((cmd, index) => {
          const commandId = `${cmd.label}-${index}`;
          const isCopied = copiedCommands[commandId];
          return (
            <div key={index}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <Text strong>{cmd.label}</Text>
                  {cmd.os && <Tag color="blue" style={{ marginLeft: '8px' }}>{cmd.os}</Tag>}
                  {cmd.description && (
                    <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                      {cmd.description}
                    </Text>
                  )}
                </div>
                <Button
                  icon={isCopied ? <CheckCircleOutlined /> : <CopyOutlined />}
                  size="small"
                  onClick={() => copyToClipboard(cmd.command, commandId)}
                >
                  {isCopied ? 'Copied!' : 'Copy'}
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
          );
        })}
      </Space>
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>
        <PlayCircleOutlined style={{ marginRight: '8px' }} />
        Workflow Tests
      </Title>
      
      <Paragraph>
        This page provides instructions for running workflow test suites via command line.
        Each test suite automatically tests all workflow steps from the Manual_Steps.xlsx file.
      </Paragraph>

      <Alert
        message="Test Coverage"
        description={
          <div>
            <div><strong>Admin Tests:</strong> 56 tests covering User Management, Dealer Management, Product Management, Transport Management, Quota Management, Settings, Reports, and Orders.</div>
            <div style={{ marginTop: '8px' }}><strong>TSO Tests:</strong> 28 tests covering Dashboard, Orders, and Reports functionality.</div>
            <div style={{ marginTop: '8px' }}><strong>Dealer Tests:</strong> 23 tests covering Dashboard, Daily Demand Orders, and Reports functionality.</div>
            <div style={{ marginTop: '8px' }}><strong>Setup:</strong> Imports resources (dealers, products, transports) and creates test users.</div>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      <Tabs {...STANDARD_TABS_CONFIG} defaultActiveKey="admin">
        <TabPane tab="Admin Tests (56 tests)" key="admin">
          <Card title="How to Run Admin Tests" {...STANDARD_CARD_CONFIG}>
            {renderCommands(adminCommands)}
          </Card>

          <Card title="Configuration" {...STANDARD_CARD_CONFIG}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Default API URL: </Text>
                <Tag>http://localhost:3001</Tag>
              </div>
              <div>
                <Text strong>Docker API URL: </Text>
                <Tag>http://localhost:3002</Tag>
              </div>
              <Paragraph type="secondary" style={{ marginTop: '8px' }}>
                You can override the API URL using the <Text code>API_URL</Text> environment variable.
              </Paragraph>
            </Space>
          </Card>

          <Divider {...STANDARD_DIVIDER_CONFIG} />

          <Card title="Test Coverage Details" {...STANDARD_CARD_CONFIG}>
            <Collapse>
              {adminTestCategories.map((category, idx) => (
                <Panel header={category.title} key={idx}>
                  <ul>
                    {category.tests.map((test, testIdx) => (
                      <li key={testIdx}>{test}</li>
                    ))}
                  </ul>
                </Panel>
              ))}
            </Collapse>
          </Card>

          <Card title="What the Test Does" {...STANDARD_CARD_CONFIG}>
            <Paragraph>
              The Admin test script will:
            </Paragraph>
            <ul>
              <li>Import resources (dealers, products, transports)</li>
              <li>Create test users (if they don&apos;t exist)</li>
              <li>Run all 56 Admin tests sequentially</li>
              <li>Show detailed results for each test</li>
              <li>Provide a summary at the end with pass/fail counts</li>
            </ul>
          </Card>
        </TabPane>

        <TabPane tab="TSO Tests (28 tests)" key="tso">
          <Card title="How to Run TSO Tests" {...STANDARD_CARD_CONFIG}>
            {renderCommands(tsoCommands)}
          </Card>

          <Alert
            message="Important"
            description="TSO tests require setup to be run first (via 'Setup' tab or Admin tests). TSO tests use existing resources and test users."
            type="warning"
            showIcon
            style={{ marginBottom: '24px' }}
          />

          <Card title="Configuration" {...STANDARD_CARD_CONFIG}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Default API URL: </Text>
                <Tag>http://localhost:3001</Tag>
              </div>
              <div>
                <Text strong>Docker API URL: </Text>
                <Tag>http://localhost:3002</Tag>
              </div>
              <Paragraph type="secondary" style={{ marginTop: '8px' }}>
                You can override the API URL using the <Text code>API_URL</Text> environment variable.
              </Paragraph>
            </Space>
          </Card>

          <Divider {...STANDARD_DIVIDER_CONFIG} />

          <Card title="Test Coverage Details" {...STANDARD_CARD_CONFIG}>
            <Collapse>
              {tsoTestCategories.map((category, idx) => (
                <Panel header={category.title} key={idx}>
                  <ul>
                    {category.tests.map((test, testIdx) => (
                      <li key={testIdx}>{test}</li>
                    ))}
                  </ul>
                </Panel>
              ))}
            </Collapse>
          </Card>

          <Card title="What the Test Does" {...STANDARD_CARD_CONFIG}>
            <Paragraph>
              The TSO test script will:
            </Paragraph>
            <ul>
              <li>Use existing resources (imported via setup or admin tests)</li>
              <li>Login as TSO user</li>
              <li>Run all 28 TSO tests sequentially</li>
              <li>Show detailed results for each test</li>
              <li>Provide a summary at the end with pass/fail counts</li>
            </ul>
          </Card>
        </TabPane>

        <TabPane tab="Dealer Tests (23 tests)" key="dealer">
          <Card title="How to Run Dealer Tests" {...STANDARD_CARD_CONFIG}>
            {renderCommands(dealerCommands)}
          </Card>

          <Alert
            message="Important"
            description="Dealer tests require setup to be run first (via 'Setup' tab or Admin tests). Dealer tests use existing resources and test users. The dealer user is configured for Scrap Territory (Argus metal pvt ltd)."
            type="warning"
            showIcon
            style={{ marginBottom: '24px' }}
          />

          <Card title="Configuration" {...STANDARD_CARD_CONFIG}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Default API URL: </Text>
                <Tag>http://localhost:3001</Tag>
              </div>
              <div>
                <Text strong>Docker API URL: </Text>
                <Tag>http://localhost:3002</Tag>
              </div>
              <div>
                <Text strong>Test Dealer: </Text>
                <Tag>Argus metal pvt ltd (Scrap Territory)</Tag>
              </div>
              <div>
                <Text strong>Dealer Username: </Text>
                <Tag>test_workflows_dealer</Tag>
              </div>
              <Paragraph type="secondary" style={{ marginTop: '8px' }}>
                You can override the API URL using the <Text code>API_URL</Text> environment variable.
              </Paragraph>
            </Space>
          </Card>

          <Divider {...STANDARD_DIVIDER_CONFIG} />

          <Card title="Test Coverage Details" {...STANDARD_CARD_CONFIG}>
            <Collapse>
              {dealerTestCategories.map((category, idx) => (
                <Panel header={category.title} key={idx}>
                  <ul>
                    {category.tests.map((test, testIdx) => (
                      <li key={testIdx}>{test}</li>
                    ))}
                  </ul>
                </Panel>
              ))}
            </Collapse>
          </Card>

          <Card title="What the Test Does" {...STANDARD_CARD_CONFIG}>
            <Paragraph>
              The Dealer test script will:
            </Paragraph>
            <ul>
              <li>Use existing resources (imported via setup or admin tests)</li>
              <li>Login as Dealer user (test_workflows_dealer)</li>
              <li>Run all 23 Dealer tests sequentially</li>
              <li>Test daily demand order creation (single-day and multi-day)</li>
              <li>Test report generation and Excel export</li>
              <li>Test monthly forecast viewing and submission</li>
              <li>Show detailed results for each test</li>
              <li>Provide a summary at the end with pass/fail counts</li>
            </ul>
          </Card>
        </TabPane>

        <TabPane tab="Setup" key="setup">
          <Card title="How to Run Setup" {...STANDARD_CARD_CONFIG}>
            {renderCommands(setupCommands)}
          </Card>

          <Card title="What Setup Does" {...STANDARD_CARD_CONFIG}>
            <Paragraph>
              The setup script will:
            </Paragraph>
            <ul>
              <li>Import dealers from <Text code>Resources/VW_ALL_CUSTOMER_INFO.xlsx</Text></li>
              <li>Import products from <Text code>Resources/PRODUCT_PRICE_ERP2.xlsx</Text></li>
              <li>Import transports from <Text code>Resources/TRANSPORT_INFO.xlsx</Text></li>
              <li>Create test users:
                <ul>
                  <li>2 Admin users (test_workflows_admin, test_workflows_admin_2)</li>
                  <li>2 TSO users (test_workflows_tso, test_workflows_tso_2) - Territory: Cumilla Territory</li>
                  <li>2 Sales Manager users (test_workflows_sales_manager, test_workflows_sales_manager_2)</li>
                  <li>2 Dealer users (test_workflows_dealer, test_workflows_dealer_2) - Dealers: Argus metal pvt ltd, B- Trac Engineering Ltd</li>
                </ul>
              </li>
              <li>Assign products to specific dealers (dealer 00324 and first dealer)</li>
            </ul>
            <Paragraph type="secondary" style={{ marginTop: '16px' }}>
              <strong>Note:</strong> All test users have password: <Text code>123</Text>
            </Paragraph>
          </Card>

          <Alert
            message="When to Run Setup"
            description="Run setup when you need to prepare the database with test data. This is usually done once before running tests, or after truncating the database."
            type="info"
            showIcon
            style={{ marginTop: '24px' }}
          />
        </TabPane>

        <TabPane tab={<span><DeleteOutlined /> Truncate Tables</span>} key="truncate">
          <Alert
            message="⚠️ Warning: Destructive Operation"
            description={
              <div>
                <Text strong>This operation will permanently delete data from the following tables:</Text>
                <ul style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <li>orders, order_items</li>
                  <li>dealers, products, transports</li>
                  <li>daily_quotas, monthly_forecast</li>
                  <li>dealer_products</li>
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

          <Card title="How to Run" {...STANDARD_CARD_CONFIG}>
            {renderCommands(truncateCommands)}
          </Card>

          <Card title="What Gets Truncated" {...STANDARD_CARD_CONFIG}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ color: '#ff4d4f' }}>Tables Deleted (All Data Removed):</Text>
                <ul>
                  <li><Text code>order_items</Text> - Order line items</li>
                  <li><Text code>orders</Text> - All orders</li>
                  <li><Text code>daily_quotas</Text> - Daily quota allocations</li>
                  <li><Text code>monthly_forecast</Text> - Monthly forecasts</li>
                  <li><Text code>dealer_products</Text> - Product assignments to dealers</li>
                  <li><Text code>dealers</Text> - All dealers</li>
                  <li><Text code>products</Text> - All products</li>
                  <li><Text code>transports</Text> - All transports</li>
                </ul>
              </div>
              <Divider {...STANDARD_DIVIDER_CONFIG} />
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

          <Card title="When to Run" {...STANDARD_CARD_CONFIG}>
            <Paragraph>
              Run the truncate script when you need to:
            </Paragraph>
            <ul>
              <li>Clear all test data and start fresh</li>
              <li>Reset the database for a new test cycle</li>
              <li>Remove all orders, dealers, products, etc. while keeping users</li>
            </ul>
            <Paragraph type="secondary" style={{ marginTop: '16px' }}>
              <strong>Typical workflow:</strong> Truncate Tables → Setup → Run Tests
            </Paragraph>
          </Card>

          <Card title="File Location" {...STANDARD_CARD_CONFIG}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Node.js Script: </Text>
                <Text code>project_tools_deletable/test_scripts/truncate_tables.js</Text>
              </div>
              <div>
                <Text strong>SQL Script: </Text>
                <Text code>project_tools_deletable/test_scripts/truncate_tables.sql</Text>
              </div>
            </Space>
          </Card>
        </TabPane>
      </Tabs>

      <Card title="File Location" {...STANDARD_CARD_CONFIG}>
        <Text code>
          project_tools_deletable/test_scripts/test_workflows.js
        </Text>
      </Card>
    </div>
  );
}

export default WorkflowTests;

