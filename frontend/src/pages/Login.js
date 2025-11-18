import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, SafetyOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const { Title, Text } = Typography;

function Login() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { setUserRole, setUserName, setTerritoryName, setUserId, setDealerId } = useUser();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', values);
      
      if (response.data.success) {
        const { user } = response.data;
        
        // Set user context
        setUserName(user.full_name);
        setTerritoryName(user.territory_name);
        setUserRole(user.role);
        setUserId(user.id);
        if (user.dealer_id) {
          setDealerId(user.dealer_id);
        }
        
        // Store in sessionStorage
        sessionStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('token', response.data.token);
        
        message.success(`Welcome ${user.full_name}!`);
        
        // Navigate based on role
        if (user.role === 'tso') {
          navigate('/dashboard');
        } else if (user.role === 'dealer') {
          navigate('/monthly-orders');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <SafetyOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={2} style={{ marginBottom: '8px' }}>CBL SO</Title>
          <Text type="secondary">Please login to continue</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              icon={<LoginOutlined />}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
