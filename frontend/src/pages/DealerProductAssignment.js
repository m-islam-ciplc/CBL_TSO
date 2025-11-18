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

function DealerProductAssignment() {
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [form] = Form.useForm();

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
      await axios.post('/api/dealer-assignments/bulk', {
        dealer_id: selectedDealer,
        product_ids: values.product_ids || [],
        product_categories: values.product_categories || [],
      });
      
      const productCount = (values.product_ids || []).length;
      const categoryCount = (values.product_categories || []).length;
      const totalCount = productCount + categoryCount;
      
      message.success(`Successfully assigned ${totalCount} item${totalCount !== 1 ? 's' : ''}`);
      setModalVisible(false);
      form.resetFields();
      loadAssignments();
    } catch (error) {
      console.error('Error saving assignment:', error);
      message.error(error.response?.data?.error || 'Failed to save assignment');
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
      title: 'Application Name',
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
            icon={<DeleteOutlined />}
            size="small"
            danger
          />
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
              optionFilterProp="label"
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              value={selectedDealer}
              onChange={handleDealerSelect}
            >
              {dealers.map(dealer => (
                <Option key={dealer.id} value={dealer.id} label={`${dealer.dealer_code} - ${dealer.name}`}>
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

              <Table
                columns={assignmentColumns}
                dataSource={assignments}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 20 }}
                size="small"
              />
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
            name="product_ids"
            label="Select Products (Brand Name)"
          >
            <Select
              mode="multiple"
              placeholder="Select products"
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {products.map(product => (
                <Option key={product.id} value={product.id} label={`${product.product_code} - ${product.name}`}>
                  {product.product_code} - {product.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider>OR</Divider>

          <Form.Item
            name="product_categories"
            label="Select Application Names"
          >
            <Select
              mode="multiple"
              placeholder="Select application names"
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {categories.map(category => (
                <Option key={category} value={category} label={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Assignment
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

