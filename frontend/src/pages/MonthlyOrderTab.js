import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Typography,
  Row,
  Col,
  Space,
  Tag,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

function MonthlyOrderTab() {
  const { dealerId } = useUser();
  const [demand, setDemand] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDemand, setEditingDemand] = useState(null);
  const [periodInfo, setPeriodInfo] = useState({ start: '', end: '' });
  const [form] = Form.useForm();

  useEffect(() => {
    if (dealerId) {
      loadPeriodInfo();
      loadProducts();
      loadDemand();
    }
  }, [dealerId]);

  const loadPeriodInfo = async () => {
    try {
      const response = await axios.get('/api/monthly-demand/current-period');
      setPeriodInfo(response.data);
    } catch (error) {
      console.error('Error loading period info:', error);
    }
  };

  const loadProducts = async () => {
    if (!dealerId) return;
    
    try {
      const response = await axios.get(`/api/products?dealer_id=${dealerId}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      message.error('Failed to load products');
    }
  };

  const loadDemand = async () => {
    if (!dealerId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/monthly-demand/dealer/${dealerId}`);
      setDemand(response.data.demand || []);
      setPeriodInfo({
        start: response.data.period_start,
        end: response.data.period_end
      });
    } catch (error) {
      console.error('Error loading demand:', error);
      message.error('Failed to load monthly demand');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingDemand(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (demandItem) => {
    setEditingDemand(demandItem);
    form.setFieldsValue({
      product_id: demandItem.product_id,
      quantity: demandItem.quantity
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/monthly-demand/${id}`);
      message.success('Monthly demand deleted successfully');
      loadDemand();
    } catch (error) {
      console.error('Error deleting demand:', error);
      message.error('Failed to delete monthly demand');
    }
  };

  const handleSubmit = async (values) => {
    try {
      await axios.post('/api/monthly-demand', {
        dealer_id: dealerId,
        product_id: values.product_id,
        quantity: values.quantity
      });
      
      message.success(editingDemand ? 'Monthly demand updated successfully' : 'Monthly demand submitted successfully');
      setModalVisible(false);
      form.resetFields();
      loadDemand();
    } catch (error) {
      console.error('Error saving demand:', error);
      message.error(error.response?.data?.error || 'Failed to save monthly demand');
    }
  };

  const columns = [
    {
      title: 'Product Code',
      dataIndex: 'product_code',
      key: 'product_code',
    },
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
      render: (quantity) => <Text strong>{quantity}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this demand?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
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
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Monthly Demand Management
            </Title>
            <div style={{ marginTop: 8 }}>
              <Tag icon={<CalendarOutlined />} color="blue">
                Period: {periodInfo.start ? dayjs(periodInfo.start).format('DD MMM YYYY') : ''} - {periodInfo.end ? dayjs(periodInfo.end).format('DD MMM YYYY') : ''}
              </Tag>
            </div>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Submit Monthly Demand
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={demand}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingDemand ? 'Edit Monthly Demand' : 'Submit Monthly Demand'}
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
            name="product_id"
            label="Product"
            rules={[{ required: true, message: 'Please select a product' }]}
          >
            <Select
              placeholder="Select a product"
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              disabled={!!editingDemand}
            >
              {products.map(product => (
                <Option key={product.id} value={product.id} label={`${product.product_code} - ${product.name}`}>
                  {product.product_code} - {product.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[
              { required: true, message: 'Please enter quantity' },
              { type: 'number', min: 0, message: 'Quantity must be 0 or greater' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Enter quantity"
              min={0}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingDemand ? 'Update' : 'Submit'}
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

export default MonthlyOrderTab;

