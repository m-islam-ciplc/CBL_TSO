import { useState, useEffect } from 'react';
import { Card, Typography, DatePicker, Space, Tag, Divider, Row, Col } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { createStandardDatePickerConfig } from '../../../standard_templates/StandardTableConfig';

const { Title, Text } = Typography;

/**
 * DEMO: Standard Calendar Widget
 * 
 * This is the standard calendar widget template for all calendars in the application.
 * All calendars must follow this exact pattern:
 * - Only enable dates that have data
 * - Gray out dates with no data
 * - Show visual feedback for available vs unavailable dates
 */

const CalendarWidgetDemo = () => {
  // Sample available dates (dates that have data)
  // In real usage, this would come from an API call
  const [availableDates, setAvailableDates] = useState([
    '2024-12-10',
    '2024-12-11',
    '2024-12-12',
    '2024-12-13',
    '2024-12-16',
    '2024-12-17',
    '2024-12-18',
    '2024-12-20',
    '2024-12-23',
    '2024-12-24',
    '2024-12-25',
    '2024-12-27',
  ]);

  const [selectedDate, setSelectedDate] = useState(null);

  // Standard date picker configuration
  const { disabledDate, dateCellRender } = createStandardDatePickerConfig(availableDates);

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Title level={3} style={{ marginBottom: '8px' }}>
        <CalendarOutlined /> Standard Calendar Widget Demo
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        This is the standard template for all calendar widgets. All calendars in the application must follow this exact pattern.
      </Text>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Example 1: Basic Calendar Widget */}
        <Card title="Example 1: Standard Calendar Widget" style={{ borderRadius: '8px' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              Only dates with data are selectable. Dates without data are grayed out and disabled.
            </Text>
            
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
                  Select Date
                </Text>
                <DatePicker
                  style={{ width: '100%' }}
                  value={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  disabledDate={disabledDate}
                  dateRender={dateCellRender}
                  format="DD MMM YYYY"
                  placeholder="Select a date with data"
                />
              </Col>
              <Col xs={24} md={12}>
                <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
                  Selected Date
                </Text>
                {selectedDate ? (
                  <Tag color="blue" style={{ fontSize: '12px', padding: '4px 12px' }}>
                    {selectedDate.format('DD MMM YYYY')}
                  </Tag>
                ) : (
                  <Text type="secondary" style={{ fontSize: '12px' }}>No date selected</Text>
                )}
              </Col>
            </Row>

          </Space>
        </Card>

        {/* Example 2: Calendar with Range Selection */}
        <Card title="Example 2: Date Range Picker" style={{ borderRadius: '8px' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              Date range picker with the same disabled date pattern.
            </Text>
            
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
                  Start Date
                </Text>
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={disabledDate}
                  dateRender={dateCellRender}
                  format="DD MMM YYYY"
                  placeholder="Select start date"
                />
              </Col>
              <Col xs={24} md={12}>
                <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
                  End Date
                </Text>
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={disabledDate}
                  dateRender={dateCellRender}
                  format="DD MMM YYYY"
                  placeholder="Select end date"
                />
              </Col>
            </Row>
          </Space>
        </Card>

        {/* Design Specifications */}
        <Card title="Design Specifications" style={{ borderRadius: '8px', background: '#f0f7ff' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>Disabled Date Function:</Text>
              <Text type="secondary" style={{ fontSize: '12px', fontFamily: 'monospace', display: 'block' }}>
                const disabledDate = (current) =&gt; {'{'}{'\n'}
                {'  '}const dateString = current.format('YYYY-MM-DD');{'\n'}
                {'  '}return !availableDates.includes(dateString);{'\n'}
                {'}'};
              </Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>Date Cell Renderer:</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                - Available dates: color: '#000', transparent background{'\n'}
                - Unavailable dates: color: '#d9d9d9', backgroundColor: '#f5f5f5', cursor: 'not-allowed'
              </Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>Required Props:</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                - <code>disabledDate={'{'}disabledDate{'}'}</code> - Disables dates without data{'\n'}
                - <code>dateRender={'{'}dateCellRender{'}'}</code> - Custom rendering to gray out unavailable dates{'\n'}
                - <code>format="DD MMM YYYY"</code> - Standard date format
              </Text>
            </div>
          </Space>
        </Card>

        {/* Usage Example */}
        <Card title="Usage Example" style={{ borderRadius: '8px' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              Copy this pattern for all calendar widgets:
            </Text>
            <Card 
              style={{ 
                background: '#fafafa', 
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}
              bodyStyle={{ padding: '12px' }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '11px' }}>
{`// 1. Maintain available dates array (from API)
const [availableDates, setAvailableDates] = useState([]);

// 2. Standard disabled date function
const disabledDate = (current) => {
  if (!current) return false;
  const dateString = current.format('YYYY-MM-DD');
  return !availableDates.includes(dateString);
};

// 3. Standard date cell renderer
const dateCellRender = (current) => {
  const dateString = current.format('YYYY-MM-DD');
  const hasData = availableDates.includes(dateString);
  
  return (
    <div style={{
      color: hasData ? '#000' : '#d9d9d9',
      backgroundColor: hasData ? 'transparent' : '#f5f5f5',
      cursor: hasData ? 'pointer' : 'not-allowed',
      borderRadius: '4px',
      padding: '2px'
    }}>
      {current.date()}
    </div>
  );
};

// 4. Use in DatePicker
<DatePicker
  disabledDate={disabledDate}
  dateRender={dateCellRender}
  format="DD MMM YYYY"
/>`}
              </pre>
            </Card>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default CalendarWidgetDemo;

