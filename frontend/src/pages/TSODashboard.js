import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import {
  Card,
  Table,
  Statistic,
  Typography,
  Row,
  Col,
  Alert,
  Space,
  Spin,
  Tag,
  Button,
} from 'antd';
import {
  GiftOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function TSODashboard() {
  const { territoryName, userName, quotaRefreshTrigger } = useUser();
  const [quotas, setQuotas] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadQuotas = useCallback(async () => {
    if (!territoryName) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/api/product-caps/tso-today', {
        params: { territory_name: territoryName }
      });
      setQuotas(response.data);
    } catch (error) {
      console.error('Failed to load quotas:', error);
    } finally {
      setLoading(false);
    }
  }, [territoryName]);

  useEffect(() => {
    if (territoryName) {
      loadQuotas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [territoryName, quotaRefreshTrigger]);

  // SSE for quota updates (for TSO users to see admin changes on different machines)
  useEffect(() => {
    if (!territoryName) return;

    // Use /api/quota-stream for Docker (Nginx proxy) or direct localhost for local dev
    const sseUrl = process.env.NODE_ENV === 'production' 
      ? '/api/quota-stream' 
      : 'http://localhost:3001/api/quota-stream';
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'quotaChanged') {
        loadQuotas();
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    return () => {
      eventSource.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [territoryName]);

  const columns = [
    {
      title: 'Product Code',
      dataIndex: 'product_code',
      key: 'product_code',
      width: 150,
    },
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Allocated',
      dataIndex: 'max_quantity',
      key: 'max_quantity',
      width: 100,
      align: 'right',
      render: (quantity) => (
        <Tag color="default" style={{ fontSize: '12px', padding: '2px 8px' }}>
          {quantity}
        </Tag>
      ),
    },
    {
      title: 'Sold',
      dataIndex: 'sold_quantity',
      key: 'sold_quantity',
      width: 80,
      align: 'right',
      render: (sold) => (
        <Tag color="orange" style={{ fontSize: '12px', padding: '2px 8px' }}>
          {sold || 0}
        </Tag>
      ),
    },
    {
      title: 'Remaining',
      dataIndex: 'remaining_quantity',
      key: 'remaining_quantity',
      width: 100,
      align: 'right',
      render: (quantity) => {
        const remaining = quantity !== undefined && quantity !== null ? quantity : 0;
        const isLow = remaining === 0;
        return (
          <Tag color={isLow ? 'red' : 'green'} style={{ fontSize: '12px', padding: '2px 8px' }}>
            {remaining}
          </Tag>
        );
      },
    },
  ];

  // Remove the old totalProducts and totalRemaining calculations as they're now in the Statistic components

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Title level={2}>Welcome, {userName}!</Title>
          <Text type="secondary">
            Territory: <Text strong>{territoryName}</Text>
          </Text>
        </div>

        <Alert
          message={<span style={{ color: 'white', fontSize: '14px' }}>{`Your quota allocations for ${dayjs().format('MMMM D, YYYY')}`}</span>}
          type="info"
          showIcon
          icon={<InfoCircleOutlined style={{ color: 'white', fontSize: '16px' }} />}
          style={{
            padding: '12px',
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            border: 'none',
          }}
        />

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                height: '100%',
              }}
              bodyStyle={{ padding: '12px' }}
            >
              <Statistic
                title={<span style={{ color: 'white' }}>Products Allocated</span>}
                value={quotas.length}
                prefix={<GiftOutlined />}
                suffix="items"
                valueStyle={{ color: 'white', fontSize: '24px' }}
                style={{ marginBottom: '16px' }}
              />
              <div
                style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  borderTop: '1px solid rgba(255,255,255,0.15)',
                  paddingTop: '12px',
                }}
              >
                {quotas.length === 0 ? (
                  <Text style={{ color: 'white', opacity: 0.8 }}>No products allocated</Text>
                ) : (
                  quotas.map((q) => (
                    <div
                      key={q.id}
                      style={{
                        color: 'white',
                        padding: '8px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.15)',
                        fontSize: '14px',
                      }}
                    >
                      {q.product_name || q.product_code} x {q.max_quantity || 0}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                height: '100%',
              }}
              bodyStyle={{ padding: '12px' }}
            >
              <Statistic
                title={<span style={{ color: 'white' }}>Sold Quantity</span>}
                value={quotas.reduce((sum, q) => sum + Number(q.sold_quantity || 0), 0)}
                prefix={<ShoppingCartOutlined />}
                suffix="units"
                valueStyle={{ color: 'white', fontSize: '24px' }}
                style={{ marginBottom: '16px' }}
              />
              <div
                style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  borderTop: '1px solid rgba(255,255,255,0.15)',
                  paddingTop: '12px',
                }}
              >
                {quotas.filter((q) => (q.sold_quantity || 0) > 0).length === 0 ? (
                  <Text style={{ color: 'white', opacity: 0.8 }}>No sales yet</Text>
                ) : (
                  quotas
                    .filter((q) => (q.sold_quantity || 0) > 0)
                    .map((q) => (
                      <div
                        key={q.id}
                        style={{
                          color: 'white',
                          padding: '8px 0',
                          borderBottom: '1px solid rgba(255,255,255,0.15)',
                          fontSize: '14px',
                        }}
                      >
                        {q.product_name || q.product_code} x {q.sold_quantity || 0}
                      </div>
                    ))
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                height: '100%',
              }}
              bodyStyle={{ padding: '12px' }}
            >
              <Statistic
                title={<span style={{ color: 'white' }}>Remaining Quantity</span>}
                value={quotas.reduce((sum, q) => sum + Number(q.remaining_quantity !== undefined && q.remaining_quantity !== null ? q.remaining_quantity : 0), 0)}
                prefix={<CheckCircleOutlined />}
                suffix="units"
                valueStyle={{ color: 'white', fontSize: '24px' }}
                style={{ marginBottom: '16px' }}
              />
              <div
                style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  borderTop: '1px solid rgba(255,255,255,0.15)',
                  paddingTop: '12px',
                }}
              >
                {quotas.filter((q) => {
                  const remaining = q.remaining_quantity !== undefined && q.remaining_quantity !== null ? q.remaining_quantity : 0;
                  return remaining > 0;
                }).length === 0 ? (
                  <Text style={{ color: 'white', opacity: 0.8 }}>No remaining quantity</Text>
                ) : (
                  quotas
                    .filter((q) => {
                      const remaining = q.remaining_quantity !== undefined && q.remaining_quantity !== null ? q.remaining_quantity : 0;
                      return remaining > 0;
                    })
                    .map((q) => (
                      <div
                        key={q.id}
                        style={{
                          color: 'white',
                          padding: '8px 0',
                          borderBottom: '1px solid rgba(255,255,255,0.15)',
                          fontSize: '14px',
                        }}
                      >
                        {q.product_name || q.product_code} x {q.remaining_quantity !== undefined && q.remaining_quantity !== null ? q.remaining_quantity : 0}
                      </div>
                    ))
                )}
              </div>
            </Card>
          </Col>
        </Row>

        <div>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadQuotas}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        <Card title="Product Allocations" bodyStyle={{ padding: '12px' }}>
          {quotas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <InfoCircleOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
              <Title level={5} type="secondary">
                No product allocations for today
              </Title>
              <Text type="secondary">
                Contact your sales manager for quota information
              </Text>
            </div>
          ) : (
            <Table
              dataSource={quotas}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 20 }}
              size="middle"
            />
          )}
        </Card>
      </Space>
    </div>
  );
}

export default TSODashboard;
