import { useState } from 'react';
import { Card, Typography, Button, Space, Divider, Alert, Tabs, message } from 'antd';
import { CodeOutlined, CopyOutlined, CheckCircleOutlined, FileSearchOutlined, WarningOutlined } from '@ant-design/icons';
import { STANDARD_CARD_CONFIG } from '../../templates/CardTemplates';
import { STANDARD_TABS_CONFIG, STANDARD_DIVIDER_CONFIG } from '../../templates/UIElements';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

function DeadCodeCheck() {
  const [copiedCommands, setCopiedCommands] = useState({});

  const deadCodeCommands = [
    {
      label: 'Check Backend',
      command: 'npm run lint:deadcode:backend',
      description: 'Check backend code for unused variables, imports, and dead code'
    },
    {
      label: 'Check Frontend',
      command: 'npm run lint:deadcode:frontend',
      description: 'Check frontend code for unused variables, imports, and dead code'
    },
    {
      label: 'Check All',
      command: 'npm run lint:deadcode:all',
      description: 'Check both backend and frontend for dead code'
    }
  ];

  const dependencyCommands = [
    {
      label: 'Check Backend Dependencies',
      command: 'npm run depcheck:backend',
      description: 'Find unused npm packages in backend'
    },
    {
      label: 'Check Frontend Dependencies',
      command: 'npm run depcheck:frontend',
      description: 'Find unused npm packages in frontend'
    }
  ];

  const copyToClipboard = async (command, key) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommands(prev => ({ ...prev, [key]: true }));
      message.success('Command copied to clipboard!');
      setTimeout(() => {
        setCopiedCommands(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      message.error('Failed to copy to clipboard');
    }
  };

  const renderCommandCard = (cmd, index, prefix) => {
    const key = `${prefix}-${index}`;
    const isCopied = copiedCommands[key];

    return (
      <Card
        key={key}
        {...STANDARD_CARD_CONFIG}
        style={{ marginBottom: '16px' }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                {cmd.label}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '12px' }}>
                {cmd.description}
              </Text>
              <div
                style={{
                  background: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  wordBreak: 'break-all',
                  border: '1px solid #d9d9d9'
                }}
              >
                {cmd.command}
              </div>
            </div>
            <Button
              type="primary"
              icon={isCopied ? <CheckCircleOutlined /> : <CopyOutlined />}
              onClick={() => copyToClipboard(cmd.command, key)}
              style={{ marginLeft: '12px' }}
            >
              {isCopied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </Space>
      </Card>
    );
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: '8px' }}>
        <CodeOutlined /> Dead Code Check
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Check for unused code, imports, and dependencies in your codebase
      </Text>

      <Alert
        message="Instructions"
        description="Copy the commands below and run them in your terminal from the project root directory. These commands will help you identify unused code and dependencies."
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      <Tabs {...STANDARD_TABS_CONFIG}>
        <TabPane tab={<span><FileSearchOutlined /> Dead Code Detection</span>} key="deadcode">
          <div style={{ marginTop: '16px' }}>
            <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '16px' }}>
              ESLint Dead Code Checks
            </Text>
            <Paragraph type="secondary" style={{ marginBottom: '24px' }}>
              These commands use ESLint to detect unused variables, imports, and dead code paths in your JavaScript/JSX files.
            </Paragraph>
            {deadCodeCommands.map((cmd, index) => renderCommandCard(cmd, index, 'deadcode'))}
          </div>
        </TabPane>

        <TabPane tab={<span><WarningOutlined /> Dependency Checks</span>} key="dependencies">
          <div style={{ marginTop: '16px' }}>
            <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '16px' }}>
              Unused Dependency Detection
            </Text>
            <Paragraph type="secondary" style={{ marginBottom: '24px' }}>
              These commands use depcheck to find npm packages in your package.json that are not being used in your code.
            </Paragraph>
            {dependencyCommands.map((cmd, index) => renderCommandCard(cmd, index, 'depcheck'))}
          </div>
        </TabPane>
      </Tabs>

      <Divider {...STANDARD_DIVIDER_CONFIG} />

      <Card {...STANDARD_CARD_CONFIG}>
        <Title level={4} style={{ marginBottom: '12px' }}>
          <WarningOutlined /> Important Notes
        </Title>
        <Space direction="vertical" size="small">
          <Text>
            • Always review the output carefully - some &quot;unused&quot; code may be exported for external use
          </Text>
          <Text>
            • Some packages may be used indirectly (e.g., plugins, build tools) and should not be removed
          </Text>
          <Text>
            • Test your application after removing unused code to ensure nothing breaks
          </Text>
          <Text>
            • For more information, see: <code>project_tools_deletable/test_scripts/deadcode-check.md</code>
          </Text>
        </Space>
      </Card>
    </div>
  );
}

export default DeadCodeCheck;

