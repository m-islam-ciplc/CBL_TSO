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
  SettingOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { 
  STANDARD_PAGE_TITLE_CONFIG, 
  STANDARD_PAGE_SUBTITLE_CONFIG
} from '../templates/UITemplates';
import { AdminSettingsCardTemplate } from '../templates/AdminSettingsCardTemplate';

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
      <Title {...STANDARD_PAGE_TITLE_CONFIG}>
        <SettingOutlined /> Admin Settings
      </Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        Configure application settings and preferences.
      </Text>

      <AdminSettingsCardTemplate
        title="Monthly Forecast Period Settings"
        startDayField={{
          value: startDay,
          onChange: (value) => form.setFieldsValue({ start_day: value }),
          disabled: loading,
        }}
        currentPeriod={currentPeriod}
        startDay={startDay}
        saveButton={{
          label: 'Save Settings',
          icon: <SaveOutlined />,
          loading: saving,
        }}
        onFormFinish={handleSave}
        form={form}
      />
    </div>
  );
}

export default AdminSettings;

