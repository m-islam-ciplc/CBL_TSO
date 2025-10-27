import React, { useState, useEffect } from 'react';
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
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function TSODashboard() {
  const { territoryName, userName } = useUser();
  const [quotas, setQuotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (territoryName) {
      loadQuotas();
    }
  }, [territoryName]);

  const loadQuotas = async () => {
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
  };

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
      title: 'Allocated Quantity',
      dataIndex: 'max_quantity',
      key: 'max_quantity',
      width: 150,
      align: 'right',
      render: (quantity) => (
        <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
          {quantity}
        </Tag>
      ),
    },
  ];

  const totalProducts = quotas.length;
  const totalQuantity = quotas.reduce((sum, q) => sum + q.max_quantity, 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Title level={2}>Welcome, {userName}!</Title>
          <Text type="secondary">
            Territory: <Text strong>{territoryName}</Text>
          </Text>
        </div>

        <Alert
          message="Today's Product Allocations"
          description={`Your quota allocations for ${dayjs().format('MMMM D, YYYY')}`}
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
        />

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="Products Allocated"
                value={totalProducts}
                prefix={<GiftOutlined />}
                suffix="items"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="Total Quantity"
                value={totalQuantity}
                prefix={<CheckCircleOutlined />}
                suffix="units"
                valueStyle={{ color: '#52c41a' }}
              />
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

        <Card title="Product Allocations">
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
