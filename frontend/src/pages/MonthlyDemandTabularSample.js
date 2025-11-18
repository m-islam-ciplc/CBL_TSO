import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  InputNumber,
  Typography,
  Row,
  Col,
  Space,
  Tag,
  message,
} from 'antd';
import {
  CalendarOutlined,
  CopyOutlined,
  ClearOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function MonthlyDemandTabularSample() {
  const [periodInfo, setPeriodInfo] = useState({ start: '2025-01-18', end: '2025-02-18' });
  const [products] = useState([
    { id: 1, code: 'L101AF032', name: 'ET140TL Alpha' },
    { id: 2, code: 'L101CX042', name: '6DGA-180 (D) Cox Power' },
  ]);
  
  // Generate dates for the period
  const generateDates = () => {
    const dates = [];
    const start = dayjs(periodInfo.start);
    const end = dayjs(periodInfo.end);
    let current = start;
    
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      dates.push({
        date: current.format('YYYY-MM-DD'),
        label: current.format('D MMM'),
        dayLabel: current.format('D'),
        monthLabel: current.format('MMM'),
      });
      current = current.add(1, 'day');
    }
    
    return dates;
  };

  const dates = generateDates();
  
  // Initialize demand data: { productId: { date: quantity } }
  const [demandData, setDemandData] = useState(() => {
    const initial = {};
    products.forEach(product => {
      initial[product.id] = {};
      dates.forEach(date => {
        initial[product.id][date.date] = null;
      });
    });
    // Set some sample data
    initial[1]['2025-01-18'] = 10;
    initial[1]['2025-01-19'] = 5;
    initial[1]['2025-01-20'] = 3;
    return initial;
  });

  // Calculate total for a product
  const calculateTotal = (productId) => {
    const productDemand = demandData[productId] || {};
    return Object.values(productDemand).reduce((sum, qty) => sum + (qty || 0), 0);
  };

  // Handle quantity change
  const handleQuantityChange = (productId, date, value) => {
    setDemandData(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [date]: value || null,
      },
    }));
  };

  // Copy first value to all empty cells in row
  const handleCopyRow = (productId) => {
    const productDemand = demandData[productId] || {};
    const firstValue = Object.values(productDemand).find(qty => qty !== null && qty !== undefined);
    
    if (firstValue === undefined) {
      message.warning('No value to copy. Please enter a value first.');
      return;
    }

    const updated = { ...demandData };
    dates.forEach(date => {
      if (!updated[productId][date.date]) {
        updated[productId][date.date] = firstValue;
      }
    });
    setDemandData(updated);
    message.success('Copied value to empty cells');
  };

  // Clear entire row
  const handleClearRow = (productId) => {
    const updated = { ...demandData };
    dates.forEach(date => {
      updated[productId][date.date] = null;
    });
    setDemandData(updated);
    message.success('Row cleared');
  };

  // Fill weekdays
  const handleFillWeekdays = () => {
    message.info('Fill weekdays feature - to be implemented');
  };

  // Fill weekends
  const handleFillWeekends = () => {
    message.info('Fill weekends feature - to be implemented');
  };

  // Save all
  const handleSaveAll = () => {
    message.success('All demand data saved successfully!');
  };

  // Build table columns
  const buildColumns = () => {
    const columns = [
      {
        title: 'Product',
        key: 'product',
        fixed: 'left',
        width: 180,
        render: (_, record) => (
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
              {record.name}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.code}
            </div>
          </div>
        ),
      },
    ];

    // Add date columns
    dates.forEach(date => {
      columns.push({
        title: (
          <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: '1.2' }}>
            <div style={{ fontWeight: 'bold' }}>{date.dayLabel}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{date.monthLabel}</div>
          </div>
        ),
        key: date.date,
        width: 55,
        align: 'center',
        render: (_, record) => (
          <InputNumber
            size="small"
            min={0}
            value={demandData[record.id]?.[date.date] || null}
            onChange={(value) => handleQuantityChange(record.id, date.date, value)}
            placeholder="0"
            style={{ width: '100%', maxWidth: '50px', fontSize: '12px' }}
            controls={false}
          />
        ),
      });
    });

    // Add total column
    columns.push({
      title: 'Total',
      key: 'total',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Text strong style={{ color: '#1890ff', fontSize: '14px' }}>
          {calculateTotal(record.id)}
        </Text>
      ),
    });

    // Add actions column
    columns.push({
      title: 'Actions',
      key: 'actions',
      width: 60,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopyRow(record.id)}
            title="Copy first value to empty cells"
            style={{ padding: '2px', minWidth: 'auto' }}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<ClearOutlined />}
            onClick={() => handleClearRow(record.id)}
            title="Clear row"
            style={{ padding: '2px', minWidth: 'auto' }}
          />
        </Space>
      ),
    });

    return columns;
  };

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0, fontSize: '20px' }}>
              <CalendarOutlined /> Monthly Demand
            </Title>
            <Tag color="blue" style={{ marginTop: '8px' }}>
              Period: {dayjs(periodInfo.start).format('DD MMM YYYY')} - {dayjs(periodInfo.end).format('DD MMM YYYY')}
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* Table Card */}
      <Card style={{ borderRadius: '8px' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Table
            columns={buildColumns()}
            dataSource={products}
            rowKey="id"
            pagination={false}
            scroll={{ x: 'max-content', y: 400 }}
            size="small"
            style={{ minWidth: 800 }}
          />
        </div>

        {/* Footer Actions */}
        <Row style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
          <Col xs={24} sm={12}>
            <Space wrap>
              <Button size="small" onClick={handleFillWeekdays}>
                Fill Weekdays
              </Button>
              <Button size="small" onClick={handleFillWeekends}>
                Fill Weekends
              </Button>
            </Space>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right', marginTop: '8px' }}>
            <Space>
              <Button onClick={() => message.info('Reset feature')}>
                Reset
              </Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveAll}>
                Save All
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default MonthlyDemandTabularSample;

