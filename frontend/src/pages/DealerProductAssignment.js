import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Select,
  message,
  Typography,
  Row,
  Col,
  Space,
  Tag,
  Popconfirm,
  Tabs,
  Checkbox,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

function DealerProductAssignment() {
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('assignments');

  useEffect(() => {
    loadDealers();
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedDealer) {
      loadAssignments();
    }
  }, [selectedDealer]);

  const loadDealers = async () => {
    try {
      const response = await axios.get('/api/dealers');
      setDealers(response.data || []);
    } catch (error) {
      console.error('Failed to load dealers:', error);
      message.error('Failed to load dealers');
    }
  };

  const loadProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      message.error('Failed to load products');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/products/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      message.error('Failed to load categories');
    }
  };

  const loadAssignments = async () => {
    if (!selectedDealer) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/dealer-assignments/${selectedDealer}`);
      setAssignments(response.data || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
      message.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDealerSelect = (dealerId) => {
    setSelectedDealer(dealerId);
    setActiveTab('assignments');
  };

  const handleAddAssignment = () => {
    if (!selectedDealer) {
      message.warning('Please select a dealer first');
      return;
    }
    form.resetFields();
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/dealer-assignments/${id}`);
      message.success('Assignment deleted successfully');
      loadAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      message.error('Failed to delete assignment');
    }
  };

  const handleSubmit = async (values) => {
    try {
      await axios.post('/api/dealer-assignments', {
        dealer_id: selectedDealer,
        assignment_type: values.assignment_type,
        product_id: values.assignment_type === 'product' ? values.product_id : null,
        product_category: values.assignment_type === 'category' ? values.product_category : null,
      });
      
      message.success('Assignment added successfully');
      setModalVisible(false);
      form.resetFields();
      loadAssignments();
    } catch (error) {
      console.error('Error saving assignment:', error);
      message.error(error.response?.data?.error || 'Failed to save assignment');
    }
  };

  const handleBulkAssign = async (values) => {
    try {
      await axios.post('/api/dealer-assignments/bulk', {
        dealer_id: selectedDealer,
        product_ids: values.product_ids || [],
        product_categories: values.product_categories || [],
      });
      
      message.success('Bulk assignment completed successfully');
      form.resetFields();
      loadAssignments();
    } catch (error) {
      console.error('Error bulk assigning:', error);
      message.error(error.response?.data?.error || 'Failed to bulk assign');
    }
  };

  const assignmentColumns = [
    {
      title: 'Type',
      dataIndex: 'assignment_type',
      key: 'assignment_type',
      render: (type) => (
        <Tag color={type === 'product' ? 'blue' : 'green'}>
          {type === 'product' ? 'Product' : 'Category'}
        </Tag>
      ),
    },
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => {
        if (record.assignment_type === 'product') {
          const product = products.find(p => p.id === record.product_id);
          return product ? `${product.product_code} - ${product.name}` : `Product ID: ${record.product_id}`;
        }
        return '-';
      },
    },
    {
      title: 'Category',
      dataIndex: 'product_category',
      key: 'product_category',
      render: (category) => category || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to delete this assignment?"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            size="small"
          >
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const selectedDealerName = dealers.find(d => d.id === selectedDealer)?.name || '';

  return (
    <div>
      <Card>
        <Title level={3} style={{ marginBottom: 24 }}>
          <ShoppingCartOutlined /> Dealer Product Assignment
        </Title>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Select Dealer:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Select a dealer"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children?.[1]?.props?.children || '').toLowerCase().includes(input.toLowerCase()) ||
                (option?.children?.[0]?.props?.children || '').toLowerCase().includes(input.toLowerCase())
              }
              value={selectedDealer}
              onChange={handleDealerSelect}
            >
              {dealers.map(dealer => (
                <Option key={dealer.id} value={dealer.id}>
                  {dealer.dealer_code} - {dealer.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {selectedDealer && (
          <>
            <Card>
              <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                  <Title level={4} style={{ margin: 0 }}>
                    Assignments for: {selectedDealerName}
                  </Title>
                  <Text type="secondary">
                    Products and categories assigned to this dealer
                  </Text>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddAssignment}
                  >
                    Add Assignment
                  </Button>
                </Col>
              </Row>

              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="Current Assignments" key="assignments">
                  <Table
                    columns={assignmentColumns}
                    dataSource={assignments}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 20 }}
                  />
                </TabPane>

                <TabPane tab="Bulk Assign" key="bulk">
                  <Card>
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleBulkAssign}
                    >
                      <Form.Item
                        name="product_ids"
                        label="Select Products"
                      >
                        <Select
                          mode="multiple"
                          placeholder="Select products"
                          showSearch
                          filterOption={(input, option) =>
                            (option?.children?.[1]?.props?.children || '').toLowerCase().includes(input.toLowerCase()) ||
                            (option?.children?.[0]?.props?.children || '').toLowerCase().includes(input.toLowerCase())
                          }
                          style={{ width: '100%' }}
                        >
                          {products.map(product => (
                            <Option key={product.id} value={product.id}>
                              {product.product_code} - {product.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Divider>OR</Divider>

                      <Form.Item
                        name="product_categories"
                        label="Select Categories"
                      >
                        <Select
                          mode="multiple"
                          placeholder="Select categories"
                          showSearch
                          filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                          }
                          style={{ width: '100%' }}
                        >
                          {categories.map(category => (
                            <Option key={category} value={category}>
                              {category}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item>
                        <Button type="primary" htmlType="submit">
                          Bulk Assign
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>
                </TabPane>
              </Tabs>
            </Card>
          </>
        )}
      </Card>

      <Modal
        title="Add Product Assignment"
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
            name="assignment_type"
            label="Assignment Type"
            rules={[{ required: true, message: 'Please select assignment type' }]}
          >
            <Select placeholder="Select type">
              <Option value="product">Specific Product</Option>
              <Option value="category">Product Category</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.assignment_type !== currentValues.assignment_type
            }
          >
            {({ getFieldValue }) => {
              const assignmentType = getFieldValue('assignment_type');
              
              if (assignmentType === 'product') {
                return (
                  <Form.Item
                    name="product_id"
                    label="Product"
                    rules={[{ required: true, message: 'Please select a product' }]}
                  >
                    <Select
                      placeholder="Select product"
                      showSearch
                      filterOption={(input, option) =>
                        (option?.children?.[1]?.props?.children || '').toLowerCase().includes(input.toLowerCase()) ||
                        (option?.children?.[0]?.props?.children || '').toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {products.map(product => (
                        <Option key={product.id} value={product.id}>
                          {product.product_code} - {product.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              
              if (assignmentType === 'category') {
                return (
                  <Form.Item
                    name="product_category"
                    label="Product Category"
                    rules={[{ required: true, message: 'Please select a category' }]}
                  >
                    <Select
                      placeholder="Select category"
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {categories.map(category => (
                        <Option key={category} value={category}>
                          {category}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              
              return null;
            }}
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add
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

export default DealerProductAssignment;

