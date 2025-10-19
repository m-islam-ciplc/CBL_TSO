import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {
  Card,
  Typography,
  Button,
  Upload,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Row,
  Col,
  Space,
  Popconfirm,
  Tag,
  Divider,
  DatePicker
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  TruckOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

function TransportManagement() {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransport, setEditingTransport] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTransports();
  }, []);

  const fetchTransports = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/transports');
      setTransports(response.data);
    } catch (error) {
      message.error('Failed to fetch transports');
      console.error('Error fetching transports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTransport(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (transport) => {
    setEditingTransport(transport);
    form.setFieldsValue({
      ...transport,
      entered_date: transport.entered_date ? dayjs(transport.entered_date) : null,
      updated_date: transport.updated_date ? dayjs(transport.updated_date) : null
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/transports/${id}`);
      message.success('Transport deleted successfully');
      fetchTransports();
    } catch (error) {
      message.error('Failed to delete transport');
      console.error('Error deleting transport:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        entered_date: values.entered_date ? values.entered_date.format('YYYY-MM-DD') : null,
        updated_date: values.updated_date ? values.updated_date.format('YYYY-MM-DD') : null
      };

      if (editingTransport) {
        await axios.put(`/api/transports/${editingTransport.id}`, formattedValues);
        message.success('Transport updated successfully');
      } else {
        await axios.post('/api/transports', formattedValues);
        message.success('Transport created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      fetchTransports();
    } catch (error) {
      message.error(`Failed to ${editingTransport ? 'update' : 'create'} transport`);
      console.error('Error saving transport:', error);
    }
  };

  const handleImport = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await axios.post('/api/transports/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      message.success(response.data.message);
      fetchTransports();
    } catch (error) {
      message.error('Failed to import transports');
      console.error('Import error:', error);
    } finally {
      setLoading(false);
    }

    return false; // Prevent upload
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(transports);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transports');
    XLSX.writeFile(wb, `Transports_${new Date().toISOString().split('T')[0]}.xlsx`);
    message.success('Transports exported successfully');
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Truck No',
      dataIndex: 'truck_no',
      key: 'truck_no',
      width: 100,
    },
    {
      title: 'Truck Details',
      dataIndex: 'truck_details',
      key: 'truck_details',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Driver Name',
      dataIndex: 'driver_name',
      key: 'driver_name',
      width: 120,
    },
    {
      title: 'Route No',
      dataIndex: 'route_no',
      key: 'route_no',
      width: 80,
    },
    {
      title: 'Load Size',
      dataIndex: 'load_size',
      key: 'load_size',
      width: 100,
    },
    {
      title: 'Load Weight',
      dataIndex: 'load_weight',
      key: 'load_weight',
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'transport_status',
      key: 'transport_status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'A' ? 'green' : 'red'}>
          {status === 'A' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this transport?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2}>
            <TruckOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Transport Management
          </Title>
        </div>

        {/* Action Buttons */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Add Transport
            </Button>
          </Col>
          <Col>
            <Upload
              accept=".xlsx,.xls"
              beforeUpload={handleImport}
              showUploadList={false}
            >
              <Button
                icon={<UploadOutlined />}
                loading={loading}
              >
                Import Excel
              </Button>
            </Upload>
          </Col>
          <Col>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={transports.length === 0}
            >
              Export Excel
            </Button>
          </Col>
        </Row>

        <Divider />

        {/* Transports Table */}
        <Table
          columns={columns}
          dataSource={transports}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} transports`
          }}
        />

        {/* Add/Edit Modal */}
        <Modal
          title={editingTransport ? 'Edit Transport' : 'Add Transport'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="truck_slno"
                  label="Truck Serial No"
                >
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="truck_no"
                  label="Truck No"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="engine_no"
                  label="Engine No"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="vehicle_no"
                  label="Vehicle No"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="truck_details"
              label="Truck Details"
              rules={[{ required: true, message: 'Please enter truck details' }]}
            >
              <Input />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="driver_name"
                  label="Driver Name"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="license_no"
                  label="License No"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="route_no"
                  label="Route No"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="load_size"
                  label="Load Size"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="load_weight"
                  label="Load Weight"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="truck_type"
                  label="Truck Type"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="transport_status"
                  label="Status"
                  initialValue="A"
                >
                  <Select>
                    <Option value="A">Active</Option>
                    <Option value="I">Inactive</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="entered_by"
                  label="Entered By"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="entered_date"
                  label="Entered Date"
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="entered_terminal"
                  label="Entered Terminal"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="updated_by"
                  label="Updated By"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="updated_date"
                  label="Updated Date"
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="updated_terminal"
                  label="Updated Terminal"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="remarks"
              label="Remarks"
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingTransport ? 'Update' : 'Create'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}

export default TransportManagement;
