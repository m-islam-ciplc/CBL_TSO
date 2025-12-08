
import { useState, useEffect, useCallback } from 'react';
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
} from 'antd';
import {
  GiftOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getStandardPaginationConfig } from '../templates/useStandardPagination';
import { TABLE_CARD_CONFIG } from '../templates/CardTemplates';
import { STANDARD_PAGE_TITLE_CONFIG, STANDARD_PAGE_SUBTITLE_CONFIG, STANDARD_ROW_GUTTER, STANDARD_TAG_STYLE, STANDARD_ALERT_CONFIG, STANDARD_STATISTIC_CONFIG, STANDARD_SPIN_SIZE, STANDARD_SPACE_SIZE_LARGE } from '../templates/UIElements';

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
    } catch (_error) {
      console.error('Failed to load quotas:', _error);
    } finally {
      setLoading(false);
    }
  }, [territoryName]);

  useEffect(() => {
    if (territoryName) {
      loadQuotas();
    }
  }, [territoryName, quotaRefreshTrigger, loadQuotas]);

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
  }, [territoryName, loadQuotas]);

  const columns = [
    {
      title: 'Product Code',
      dataIndex: 'product_code',
      key: 'product_code',
      ellipsis: true,
      sorter: (a, b) => ((a.product_code || '') + '').localeCompare((b.product_code || '') + ''),
    },
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
      ellipsis: {
        showTitle: true,
      },
      sorter: (a, b) => ((a.product_name || '') + '').localeCompare((b.product_name || '') + ''),
    },
    {
      title: 'Allocated',
      dataIndex: 'max_quantity',
      key: 'max_quantity',
      align: 'right',
      ellipsis: true,
      sorter: (a, b) => (a.max_quantity || 0) - (b.max_quantity || 0),
      render: (quantity) => (
        <Tag color="default" style={STANDARD_TAG_STYLE}>
          {quantity}
        </Tag>
      ),
    },
    {
      title: 'Sold',
      dataIndex: 'sold_quantity',
      key: 'sold_quantity',
      align: 'right',
      ellipsis: true,
      sorter: (a, b) => (a.sold_quantity || 0) - (b.sold_quantity || 0),
      render: (sold) => (
        <Tag color="orange" style={STANDARD_TAG_STYLE}>
          {sold || 0}
        </Tag>
      ),
    },
    {
      title: 'Remaining',
      dataIndex: 'remaining_quantity',
      key: 'remaining_quantity',
      align: 'right',
      ellipsis: true,
      sorter: (a, b) => (a.remaining_quantity || 0) - (b.remaining_quantity || 0),
      render: (quantity) => {
        const remaining = quantity !== undefined && quantity !== null ? quantity : 0;
        const isLow = remaining === 0;
        return (
          <Tag color={isLow ? 'red' : 'green'} style={STANDARD_TAG_STYLE}>
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
        <Spin size={STANDARD_SPIN_SIZE} />
      </div>
    );
  }

  return (
    <div>
      <Title {...STANDARD_PAGE_TITLE_CONFIG}><DashboardOutlined /> Welcome, {userName}!</Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        Territory: <Text strong>{territoryName}</Text>
      </Text>
      <Space direction="vertical" style={{ width: '100%' }} size={STANDARD_SPACE_SIZE_LARGE}>

        <Alert
          {...STANDARD_ALERT_CONFIG}
          message={<span style={{ color: 'white', fontSize: '14px' }}>{`Your quota allocations for ${dayjs().format('MMMM D, YYYY')}`}</span>}
          type="info"
          icon={<InfoCircleOutlined style={{ color: 'white', fontSize: '16px' }} />}
          style={{
            ...STANDARD_ALERT_CONFIG.style,
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            border: 'none',
          }}
        />

        <Row gutter={STANDARD_ROW_GUTTER}>
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
                {...STANDARD_STATISTIC_CONFIG}
                title={<span style={{ color: 'white' }}>Products Allocated</span>}
                value={quotas.length}
                prefix={<GiftOutlined />}
                suffix="items"
                valueStyle={{ ...STANDARD_STATISTIC_CONFIG.valueStyle, color: 'white' }}
              />
              <div
                style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  marginTop: '16px',
                }}
              >
                {quotas.filter((q) => (q.max_quantity || 0) > 0).length === 0 ? (
                  <Text style={{ color: 'white', opacity: 0.8, fontSize: '14px' }}>No products allocated</Text>
                ) : (
                  quotas
                    .filter((q) => (q.max_quantity || 0) > 0)
                    .map((q) => (
                      <div
                        key={q.id}
                        style={{
                          padding: '8px 0',
                        }}
                      >
                        <Text style={{ color: 'white', fontSize: '14px' }}>
                          {q.product_name || q.product_code} x {q.max_quantity}
                        </Text>
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
                {...STANDARD_STATISTIC_CONFIG}
                title={<span style={{ color: 'white' }}>Sold Quantity</span>}
                value={quotas.reduce((sum, q) => sum + Number(q.sold_quantity || 0), 0)}
                prefix={<ShoppingCartOutlined />}
                suffix="units"
                valueStyle={{ ...STANDARD_STATISTIC_CONFIG.valueStyle, color: 'white' }}
              />
              <div
                style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  marginTop: '16px',
                }}
              >
                {quotas.filter((q) => (q.sold_quantity || 0) > 0).length === 0 ? (
                  <Text style={{ color: 'white', opacity: 0.8, fontSize: '14px' }}>No sales yet</Text>
                ) : (
                  quotas
                    .filter((q) => (q.sold_quantity || 0) > 0)
                    .map((q) => (
                      <div
                        key={q.id}
                        style={{
                          padding: '8px 0',
                        }}
                      >
                        <Text style={{ color: 'white', fontSize: '14px' }}>
                          {q.product_name || q.product_code} x {q.sold_quantity || 0}
                        </Text>
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
                {...STANDARD_STATISTIC_CONFIG}
                title={<span style={{ color: 'white' }}>Remaining Quantity</span>}
                value={quotas.reduce((sum, q) => sum + Number(q.remaining_quantity !== undefined && q.remaining_quantity !== null ? q.remaining_quantity : 0), 0)}
                prefix={<CheckCircleOutlined />}
                suffix="units"
                valueStyle={{ ...STANDARD_STATISTIC_CONFIG.valueStyle, color: 'white' }}
              />
              <div
                style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  marginTop: '16px',
                }}
              >
                {quotas.filter((q) => {
                  const remaining = q.remaining_quantity !== undefined && q.remaining_quantity !== null ? q.remaining_quantity : 0;
                  return remaining > 0;
                }).length === 0 ? (
                  <Text style={{ color: 'white', opacity: 0.8, fontSize: '14px' }}>No remaining quantity</Text>
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
                          padding: '8px 0',
                        }}
                      >
                        <Text style={{ color: 'white', fontSize: '14px' }}>
                          {q.product_name || q.product_code} x {q.remaining_quantity !== undefined && q.remaining_quantity !== null ? q.remaining_quantity : 0}
                        </Text>
                      </div>
                    ))
                )}
              </div>
            </Card>
          </Col>
        </Row>

        <Card title="Product Allocations" {...TABLE_CARD_CONFIG}>
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
              pagination={getStandardPaginationConfig('quotas', 20)}
              size="small"
            />
          )}
        </Card>
      </Space>
    </div>
  );
}

export default TSODashboard;
