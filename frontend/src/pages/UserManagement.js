import { useState, useEffect } from 'react';
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
  Row,
  Col,
} from 'antd';
import { useStandardPagination } from '../templates/useStandardPagination';
import { 
  ACTION_CARD_CONFIG, 
  TABLE_CARD_CONFIG,
  STANDARD_PAGE_TITLE_CONFIG, 
  STANDARD_PAGE_SUBTITLE_CONFIG, 
  STANDARD_ROW_GUTTER, 
  STANDARD_MODAL_CONFIG, 
  STANDARD_POPCONFIRM_CONFIG, 
  renderTableHeaderWithSearchAndFilter 
} from '../templates/UITemplates';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { pagination, handleTableChange } = useStandardPagination('users', 20);

  useEffect(() => {
    loadUsers();
    loadTerritories();
    loadDealers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (_error) {
      console.error('Failed to load users:', _error);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadTerritories = async () => {
    try {
      const response = await axios.get('/api/dealers/territories');
      setTerritories(response.data);
    } catch (_error) {
      console.error('Failed to load territories:', _error);
    }
  };

  const loadDealers = async () => {
    try {
      const response = await axios.get('/api/dealers');
      setDealers(response.data || []);
    } catch (_error) {
      console.error('Failed to load dealers:', _error);
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
      setUsers(users.filter(user => user.id !== id));
      setSelectedRowKeys((prev) => prev.filter(key => key !== id));
    } catch (_error) {
      console.error('Failed to delete user:', _error);
      message.error('Failed to delete user');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedRowKeys.length) return;
    try {
      await axios.post('/api/users/bulk-delete', { ids: selectedRowKeys });
      message.success(`Deleted ${selectedRowKeys.length} user(s)`);
      setUsers(users.filter(user => !selectedRowKeys.includes(user.id)));
      setSelectedRowKeys([]);
    } catch (_error) {
      console.error('Failed to bulk delete users:', _error);
      message.error('Failed to delete selected users');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await axios.put(`/api/users/${user.id}`, {
        is_active: !user.is_active
      });
      message.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
      loadUsers();
    } catch (_error) {
      console.error('Failed to update user status:', _error);
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
    } catch (_error) {
      const errorMsg = _error.response?.data?.message || _error.response?.data?.error || _error.message || 'Failed to save user';
      console.error('Error saving user:', _error);
      message.error(errorMsg);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
      width: 60,
      sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      ellipsis: true,
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
      ellipsis: {
        showTitle: true,
      },
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      ellipsis: true,
      render: (role) => {
        const colors = {
          admin: 'red',
          sales_manager: 'blue',
          tso: 'green',
          dealer: 'orange',
        };
        return <Tag color={colors[role] || 'default'}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Territory',
      dataIndex: 'territory_name',
      key: 'territory_name',
      ellipsis: true,
      sorter: (a, b) => {
        const territoryA = a.territory_name || '';
        const territoryB = b.territory_name || '';
        return territoryA.localeCompare(territoryB);
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      align: 'center',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
      sorter: (a, b) => {
        // Sort by active status: true (1) comes before false (0)
        return (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0);
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            {...STANDARD_POPCONFIRM_CONFIG}
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
            {...STANDARD_POPCONFIRM_CONFIG}
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

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <Title {...STANDARD_PAGE_TITLE_CONFIG}>
        <UserOutlined /> Manage Users
      </Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        Manage user accounts and permissions
      </Text>

      {/* Add User Button */}
      <Card
        title="Actions"
        {...ACTION_CARD_CONFIG}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Add User
            </Button>
            <Popconfirm
              {...STANDARD_POPCONFIRM_CONFIG}
              title="Are you sure you want to delete the selected users?"
              onConfirm={handleBulkDelete}
              disabled={!selectedRowKeys.length}
            >
              <Button
                icon={<DeleteOutlined />}
                danger
                disabled={!selectedRowKeys.length}
              >
                Delete Selected
              </Button>
            </Popconfirm>
          </Space>
        }
      />

      {/* Users Table */}
      <Card {...TABLE_CARD_CONFIG}>
        {renderTableHeaderWithSearchAndFilter({
          title: 'Users',
          count: filteredUsers.length,
          searchTerm: searchTerm,
          onSearchChange: (e) => setSearchTerm(e.target.value),
          searchPlaceholder: 'Search by username or full name...',
          filter: {
            value: roleFilter,
            onChange: setRoleFilter,
            placeholder: 'Filter by role',
            options: [
              { value: 'admin', label: 'Admin' },
              { value: 'sales_manager', label: 'Sales Manager' },
              { value: 'tso', label: 'TSO' },
              { value: 'dealer', label: 'Dealer' }
            ],
            width: '200px',
            showSearch: true
          }
        })}
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={pagination}
          onChange={handleTableChange}
          size="small"
        />
      </Card>

      <Modal
        {...STANDARD_MODAL_CONFIG}
        title={editingUser ? 'Edit User' : 'Add User'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
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
              // Clear dealer if not dealer
              if (value !== 'dealer') {
                form.setFieldsValue({ dealer_id: null });
              }
            }}>
              <Option value="admin">Admin</Option>
              <Option value="sales_manager">Sales Manager</Option>
              <Option value="tso">TSO</Option>
              <Option value="dealer">Dealer</Option>
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

          {(selectedRole === 'dealer' || editingUser?.role === 'dealer') && (
            <Form.Item
              name="dealer_id"
              label="Dealer"
              rules={[{ required: true, message: 'Please select dealer for dealer users' }]}
            >
              <Select 
                placeholder="Select dealer" 
                showSearch 
                optionFilterProp="label"
                onChange={(dealerId) => {
                  const selectedDealer = dealers.find(d => d.id === dealerId);
                  if (selectedDealer && selectedDealer.name) {
                    form.setFieldsValue({ full_name: selectedDealer.name });
                  }
                }}
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {dealers.map(dealer => (
                  <Option key={dealer.id} value={dealer.id} label={`${dealer.dealer_code} - ${dealer.name}`}>
                    {dealer.dealer_code} - {dealer.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

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
