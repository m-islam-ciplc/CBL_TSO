import { useState } from 'react';
import { Card, Typography, Row, Col, Space, Tag, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  TableOutlined,
  FormOutlined,
  FileTextOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  FileExcelOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * DEMO INDEX PAGE
 * 
 * Central navigation hub for all UI component and feature demos.
 * This page helps developers find and understand available design patterns.
 */

const DemoIndex = () => {
  const navigate = useNavigate();

  const demoCategories = [
    {
      title: 'UI Components',
      description: 'Standard UI components and design patterns',
      icon: <AppstoreOutlined style={{ fontSize: '24px' }} />,
      color: '#1890ff',
      items: [
        {
          name: 'Expandable Tables',
          description: 'Standard expandable table template',
          path: '/demo-expandable-table-template',
          tags: ['Table', 'Template', 'Standard'],
          icon: <TableOutlined />
        },
        {
          name: 'Calendar Widget',
          description: 'Standard calendar widget with disabled dates',
          path: '/demo-calendar-widget',
          tags: ['Calendar', 'DatePicker', 'Standard'],
          icon: <CalendarOutlined />
        },
        // Add more UI component demos here as they are created
      ]
    },
    {
      title: 'Features',
      description: 'Feature-specific demo implementations',
      icon: <DashboardOutlined style={{ fontSize: '24px' }} />,
      color: '#52c41a',
      items: [
        {
          name: 'Dealer Forecasts - Table View',
          description: 'Table-based forecast view',
          path: '/demo-forecasts-option1',
          tags: ['Forecast', 'Table'],
          icon: <FileTextOutlined />
        },
        {
          name: 'Dealer Forecasts - Cards View',
          description: 'Card-based forecast view',
          path: '/demo-forecasts-option2',
          tags: ['Forecast', 'Cards'],
          icon: <FileTextOutlined />
        },
        {
          name: 'Dealer Forecasts - Summary View',
          description: 'Summary view with expandable sections',
          path: '/demo-forecasts-option3',
          tags: ['Forecast', 'Summary'],
          icon: <FileTextOutlined />
        },
        {
          name: 'Dealer Forecasts - Expandable',
          description: 'Expandable forecast view',
          path: '/demo-forecasts-option3-expandable',
          tags: ['Forecast', 'Expandable'],
          icon: <FileTextOutlined />
        },
        {
          name: 'Daily Report with Forecasts',
          description: 'Daily report combined with forecasts',
          path: '/demo-daily-report-forecasts',
          tags: ['Report', 'Forecast'],
          icon: <FileExcelOutlined />
        },
        {
          name: 'Daily Demand Multi-Day',
          description: 'Multi-day daily demand interface',
          path: '/demo-dd-multiday',
          tags: ['Daily Demand', 'Multi-Day'],
          icon: <ShoppingCartOutlined />
        },
      ]
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Title level={2} style={{ marginBottom: '8px' }}>
        UI Component & Feature Demos
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Browse all available UI component demos and feature implementations. Use these as references when building new features.
      </Text>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {demoCategories.map((category, categoryIdx) => (
          <Card
            key={categoryIdx}
            style={{
              borderRadius: '8px',
              borderLeft: `4px solid ${category.color}`
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ color: category.color }}>
                  {category.icon}
                </div>
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    {category.title}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {category.description}
                  </Text>
                </div>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <Row gutter={[16, 16]}>
                {category.items.map((item, itemIdx) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={itemIdx}>
                    <Card
                      hoverable
                      style={{
                        height: '100%',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      bodyStyle={{ padding: '16px' }}
                      onClick={() => navigate(item.path)}
                    >
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ color: category.color }}>
                            {item.icon}
                          </div>
                          <Text strong style={{ fontSize: '14px' }}>
                            {item.name}
                          </Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                          {item.description}
                        </Text>
                        <div style={{ marginTop: '8px' }}>
                          {item.tags.map((tag, tagIdx) => (
                            <Tag key={tagIdx} size="small" style={{ fontSize: '11px' }}>
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Space>
          </Card>
        ))}
      </Space>

      <Card
        style={{
          marginTop: '24px',
          borderRadius: '8px',
          background: '#f0f7ff'
        }}
      >
        <Title level={4} style={{ marginBottom: '8px' }}>
          📝 Creating New Demos
        </Title>
        <Space direction="vertical" size="small">
          <Text>
            When creating new UI component demos:
          </Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Place UI component demos in <code>demos/ui-components/</code></li>
            <li>Place feature demos in <code>demos/features/</code></li>
            <li>Add routes in <code>App.js</code> under demo routes</li>
            <li>Register the demo in this index page</li>
            <li>Follow the naming convention: <code>ComponentNameDemo.js</code></li>
          </ul>
        </Space>
      </Card>
    </div>
  );
};

export default DemoIndex;

