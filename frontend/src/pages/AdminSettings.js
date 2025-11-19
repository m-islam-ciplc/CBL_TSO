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
  SettingOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

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
      const response = await axios.get('/api/settings/monthly-forecast-start-day');
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
      const response = await axios.get('/api/monthly-forecast/current-period');
      setCurrentPeriod(response.data);
    } catch (error) {
      console.error('Error loading current period:', error);
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      await axios.put('/api/settings/monthly-forecast-start-day', {
        start_day: values.start_day
      });
      setStartDay(values.start_day);
      // Reload current period after saving
      await loadCurrentPeriod();
      message.success('Monthly forecast start day updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: '8px' }}>
        <SettingOutlined /> Admin Settings
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Configure application settings and preferences.
      </Text>

      <Card 
        title="Monthly Forecast Period Settings" 
        style={{ marginBottom: '16px', borderRadius: '8px' }} 
        bodyStyle={{ padding: '12px' }}
      >
        <Form
          form={form}
          onFinish={handleSave}
          initialValues={{ start_day: startDay }}
        >
          <Row gutter={[16, 16]} align="top">
            <Col flex="none" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Space direction="vertical">
                <Text strong>Forecast Cycle Start Day:</Text>
                <Form.Item
                  name="start_day"
                  rules={[
                    { required: true, message: 'Please enter start day' },
                    { type: 'number', min: 1, max: 31, message: 'Day must be between 1 and 31' }
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber
                    style={{ width: '120px' }}
                    min={1}
                    max={31}
                    placeholder="Enter day (1-31)"
                    disabled={loading}
                  />
                </Form.Item>
              </Space>
            </Col>
            <Col flex="none" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Space direction="vertical">
                <Text strong>Forecast Cycle Preview:</Text>
                <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {currentPeriod.start} to {currentPeriod.end}
                </Tag>
              </Space>
            </Col>
            <Col flex="auto" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Period Information:</Text>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Monthly forecast cycle runs from the {startDay}{startDay === 1 ? 'st' : startDay === 2 ? 'nd' : startDay === 3 ? 'rd' : 'th'} of one month to the {(startDay - 1) === 0 ? 'last day' : (startDay - 1) + ((startDay - 1) === 1 ? 'st' : (startDay - 1) === 2 ? 'nd' : (startDay - 1) === 3 ? 'rd' : 'th')} of the next month.
                </Text>
              </Space>
            </Col>
            <Col flex="none" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Space direction="vertical">
                <Text>&nbsp;</Text>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={saving}
                >
                  Save Settings
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}

export default AdminSettings;

