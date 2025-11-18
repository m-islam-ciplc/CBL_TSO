import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Button,
  message,
  Typography,
  Row,
  Col,
  Space,
  Tag,
} from 'antd';
import {
  SaveOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startDay, setStartDay] = useState(18);
  const [currentPeriod, setCurrentPeriod] = useState({ start: '', end: '' });
  const [form] = Form.useForm();

  useEffect(() => {
    loadSettings();
    loadCurrentPeriod();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/settings/monthly-demand-start-day');
      setStartDay(response.data.start_day);
      form.setFieldsValue({ start_day: response.data.start_day });
    } catch (error) {
      console.error('Error loading settings:', error);
      message.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentPeriod = async () => {
    try {
      const response = await axios.get('/api/monthly-demand/current-period');
      setCurrentPeriod(response.data);
    } catch (error) {
      console.error('Error loading current period:', error);
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      await axios.put('/api/settings/monthly-demand-start-day', {
        start_day: values.start_day
      });
      setStartDay(values.start_day);
      // Reload current period after saving
      await loadCurrentPeriod();
      message.success('Monthly demand start day updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Card>
        <Title level={3}>Admin Settings</Title>
        
        <Card
          title={
            <Space>
              <CalendarOutlined />
              <span>Monthly Demand Period Settings</span>
            </Space>
          }
          style={{ marginTop: 24 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={{ start_day: startDay }}
          >
            <Row gutter={24}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="start_day"
                  label="Monthly Period Start Day"
                  rules={[
                    { required: true, message: 'Please enter start day' },
                    { type: 'number', min: 1, max: 31, message: 'Day must be between 1 and 31' }
                  ]}
                  tooltip="The day of the month when the monthly demand period starts. For example, if set to 18, the period runs from the 18th of one month to the 17th of the next month."
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    max={31}
                    placeholder="Enter day (1-31)"
                    disabled={loading}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={16}>
                <div style={{ marginTop: 32 }}>
                  <Text strong>Current Period Preview:</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                      {currentPeriod.start} to {currentPeriod.end}
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                    Monthly demand periods run from the {startDay}{startDay === 1 ? 'st' : startDay === 2 ? 'nd' : startDay === 3 ? 'rd' : 'th'} of one month to the {(startDay - 1) === 0 ? 'last day' : (startDay - 1) + ((startDay - 1) === 1 ? 'st' : (startDay - 1) === 2 ? 'nd' : (startDay - 1) === 3 ? 'rd' : 'th')} of the next month.
                  </Text>
                </div>
              </Col>
            </Row>

            <Form.Item>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                htmlType="submit"
                loading={saving}
              >
                Save Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Card>
    </div>
  );
}

export default AdminSettings;

