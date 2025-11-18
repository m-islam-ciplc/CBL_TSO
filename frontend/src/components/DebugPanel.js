import { useState, useEffect } from 'react';
import { Drawer, Button, Typography, Tag, Space, Divider } from 'antd';
import { BugOutlined, CloseOutlined, ClearOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

function DebugPanel() {
  const [visible, setVisible] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Check for logs every second
    const interval = setInterval(() => {
      if (window.apiLogs && window.apiLogs.length > 0) {
        setLogs([...window.apiLogs]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const clearLogs = () => {
    if (window.apiLogs) {
      window.apiLogs = [];
      setLogs([]);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    if (status >= 200 && status < 300) return 'success';
    if (status >= 400 && status < 500) return 'warning';
    if (status >= 500) return 'error';
    return 'default';
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'request': return 'blue';
      case 'response': return 'green';
      case 'error': return 'red';
      default: return 'default';
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<BugOutlined />}
        onClick={() => setVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
      />
      
      <Drawer
        title={
          <Space>
            <BugOutlined />
            <Title level={5} style={{ margin: 0 }}>API Debug Logs</Title>
            <Button
              type="text"
              icon={<ClearOutlined />}
              onClick={clearLogs}
              size="small"
            >
              Clear
            </Button>
          </Space>
        }
        placement="right"
        width={600}
        onClose={() => setVisible(false)}
        open={visible}
        extra={
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setVisible(false)}
          />
        }
      >
        <div style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
          {logs.length === 0 ? (
            <Text type="secondary">No API logs yet. Make some API calls to see them here.</Text>
          ) : (
            logs.slice().reverse().map((log, index) => (
              <div key={index} style={{ marginBottom: '16px', padding: '12px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                <Space style={{ marginBottom: '8px' }}>
                  <Tag color={getTypeColor(log.type)}>{log.type.toUpperCase()}</Tag>
                  <Tag color={getStatusColor(log.status)}>
                    {log.method} {log.status || ''}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Text>
                </Space>
                <div style={{ marginBottom: '4px' }}>
                  <Text strong>URL: </Text>
                  <Text code>{log.url}</Text>
                </div>
                {log.data && (
                  <div style={{ marginTop: '8px' }}>
                    <Text strong>Data: </Text>
                    <pre style={{ 
                      background: '#f5f5f5', 
                      padding: '8px', 
                      borderRadius: '4px',
                      fontSize: '11px',
                      maxHeight: '200px',
                      overflow: 'auto',
                      marginTop: '4px'
                    }}>
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </div>
                )}
                {log.message && (
                  <div style={{ marginTop: '8px' }}>
                    <Text type="danger" strong>Error: </Text>
                    <Text type="danger">{log.message}</Text>
                  </div>
                )}
                <Divider style={{ margin: '8px 0' }} />
              </div>
            ))
          )}
        </div>
      </Drawer>
    </>
  );
}

export default DebugPanel;







