import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Popconfirm,
  Space,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    loadUsers();
    loadTerritories();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadTerritories = async () => {
    try {
      const response = await axios.get('/api/dealers/territories');
      setTerritories(response.data);
    } catch (error) {
      console.error('Failed to load territories:', error);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setSelectedRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    form.setFieldsValue({
      ...user,
      password: '', // Don't show password
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`);
      message.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      message.error('Failed to delete user');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await axios.put(`/api/users/${user.id}`, {
        is_active: !user.is_active
      });
      message.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
      loadUsers();
    } catch (error) {
      message.error('Failed to update user status');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        // Update existing user
        const updateData = { ...values };
        if (!updateData.password) {
          delete updateData.password; // Don't update password if empty
        }
        await axios.put(`/api/users/${editingUser.id}`, updateData);
        message.success('User updated successfully');
      } else {
        // Create new user
        await axios.post('/api/users', values);
        message.success('User created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      loadUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to save user';
      console.error('Error saving user:', error);
      message.error(errorMsg);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const colors = {
          admin: 'red',
          sales_manager: 'blue',
          tso: 'green',
        };
        return <Tag color={colors[role]}>{role.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Sales Manager', value: 'sales_manager' },
        { text: 'TSO', value: 'tso' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Territory',
      dataIndex: 'territory_name',
      key: 'territory_name',
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title={record.is_active ? 'Deactivate this user?' : 'Activate this user?'}
            onConfirm={() => handleToggleActive(record)}
          >
            <Button
              size="small"
              danger={record.is_active}
            >
              {record.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={3} style={{ margin: 0 }}>
          <UserOutlined /> User Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add User
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} users`,
          }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select role" onChange={(value) => {
              setSelectedRole(value);
              // Clear territory if not TSO
              if (value !== 'tso') {
                form.setFieldsValue({ territory_name: null });
              }
            }}>
              <Option value="admin">Admin</Option>
              <Option value="sales_manager">Sales Manager</Option>
              <Option value="tso">TSO</Option>
            </Select>
          </Form.Item>

          {(selectedRole === 'tso' || editingUser?.role === 'tso') && (
            <Form.Item
              name="territory_name"
              label="Territory"
              rules={[{ required: true, message: 'Please select territory for TSO users' }]}
            >
              <Select placeholder="Select territory" showSearch optionFilterProp="children" filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }>
                {territories.map(territory => (
                  <Option key={territory} value={territory}>{territory}</Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="password"
            label={editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
            rules={[{ required: !editingUser, message: 'Please enter password' }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UserManagement;
