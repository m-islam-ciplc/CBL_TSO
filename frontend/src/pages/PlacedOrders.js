import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  Typography,
  Table,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Tooltip,
  Spin,
  message,
  Row,
  Col,
  Modal,
  List,
} from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  DeleteOutlined,
  DownOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

function PlacedOrders({ refreshTrigger }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsModal, setOrderDetailsModal] = useState(false);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [orderProducts, setOrderProducts] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
    pageSizeOptions: ['5', '10', '20', '50', '100'],
    defaultPageSize: 10,
  });

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [refreshTrigger]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders');
      setOrders(response.data);
    } catch (error) {
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.dealer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter (for now all are 'new' since we don't have status field yet)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
    // Reset pagination when filters change
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (newPagination) => {
    console.log('Table pagination changed:', newPagination);
    setPagination(newPagination);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'completed':
        return <Tag color="success" icon={<CheckCircleOutlined />}>Completed</Tag>;
      case 'processing':
        return <Tag color="warning" icon={<ClockCircleOutlined />}>Processing</Tag>;
      case 'shipped':
        return <Tag color="blue" icon={<CarOutlined />}>Shipped</Tag>;
      default:
        return <Tag color="default" icon={<EyeOutlined />}>New</Tag>;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`/api/orders/${orderId}`);
      message.success('Order deleted successfully');
      loadOrders(); // Refresh the orders list
    } catch (error) {
      message.error('Failed to delete order');
    }
  };

  const handleExpand = async (expanded, record) => {
    if (expanded && !orderProducts[record.order_id]) {
      // Load products for this order if not already loaded
      try {
        const response = await axios.get(`/api/orders/${record.order_id}`);
        setOrderProducts(prev => ({
          ...prev,
          [record.order_id]: response.data.items || []
        }));
      } catch (error) {
        console.error('Failed to load products for order:', error);
        setOrderProducts(prev => ({
          ...prev,
          [record.order_id]: []
        }));
      }
    }
  };

  const handleViewProducts = async (orderId) => {
    setOrderDetailsLoading(true);
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      setSelectedOrder(response.data);
      setOrderDetailsModal(true);
    } catch (error) {
      message.error('Failed to load order details');
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      render: (orderId) => (
        <Tag color="blue" style={{ fontSize: '12px' }}>
          {orderId}
        </Tag>
      ),
      width: 120,
    },
    {
      title: 'Dealer',
      dataIndex: 'dealer_name',
      key: 'dealer_name',
      ellipsis: true,
    },
    {
      title: 'Territory',
      dataIndex: 'dealer_territory',
      key: 'dealer_territory',
      ellipsis: true,
      render: (territory) => territory || 'N/A',
    },
    {
      title: 'Products',
      key: 'products',
      render: (_, record) => {
        return (
          <div>
            <Tag color="green" style={{ fontSize: '12px' }}>
              {record.item_count} item{record.item_count !== 1 ? 's' : ''}
            </Tag>
          </div>
        );
      },
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status || 'new'),
      width: 120,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="text" size="small" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Delete Order">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteOrder(record.id)}
            />
          </Tooltip>
        </Space>
      ),
      width: 100,
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: '8px' }}>
        Placed Orders
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        View and manage orders placed by TSOs
      </Text>

      {/* Filters */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle" style={{ padding: '16px 0' }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search orders..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="middle"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              size="middle"
            >
              <Option value="all">All Orders</Option>
              <Option value="new">New</Option>
              <Option value="processing">Processing</Option>
              <Option value="shipped">Shipped</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadOrders}
              style={{ width: '100%' }}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Text strong style={{ fontSize: '16px' }}>
            Orders ({filteredOrders.length})
          </Text>
        </div>

        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <EyeOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
            <Title level={5} type="secondary">
              No orders found
            </Title>
            <Text type="secondary">
              {searchTerm ? 'Try adjusting your search criteria' : 'No orders have been placed yet'}
            </Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="id"
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 800 }}
            size="small"
            expandable={{
              expandedRowKeys,
              onExpandedRowsChange: setExpandedRowKeys,
              onExpand: handleExpand,
              expandedRowRender: (record) => {
                const products = orderProducts[record.order_id] || [];
                return (
                  <div style={{ padding: '16px', backgroundColor: '#fafafa', margin: '8px 0', borderRadius: '6px' }}>
                    <Title level={5} style={{ marginBottom: '12px' }}>
                      Products ({products.length} items)
                    </Title>
                    {products.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {products.map((product, index) => (
                          <div key={product.id} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '8px 12px',
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            border: '1px solid #e8e8e8'
                          }}>
                            <div>
                              <Text strong>#{index + 1}</Text>
                              <br />
                              <Text strong style={{ color: '#1890ff' }}>{product.product_code}</Text> - {product.product_name}
                            </div>
                            <Tag color="blue" style={{ fontSize: '12px', padding: '2px 8px' }}>
                              Qty: {product.quantity}
                            </Tag>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Text type="secondary">Loading products...</Text>
                    )}
                  </div>
                );
              }
            }}
          />
        )}
      </Card>

      {/* Order Details Modal */}
      <Modal
        title={`Order Details - ${selectedOrder?.order_id || ''}`}
        open={orderDetailsModal}
        onCancel={() => setOrderDetailsModal(false)}
        footer={[
          <Button key="close" onClick={() => setOrderDetailsModal(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {orderDetailsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : selectedOrder ? (
          <div>
            {/* Order Summary */}
            <Card size="small" style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text strong>Order ID:</Text> {selectedOrder.order_id}
                </Col>
                <Col span={12}>
                  <Text strong>Dealer:</Text> {selectedOrder.dealer_name}
                </Col>
                <Col span={12}>
                  <Text strong>Territory:</Text> {selectedOrder.dealer_territory || 'N/A'}
                </Col>
                <Col span={12}>
                  <Text strong>Warehouse:</Text> {selectedOrder.warehouse_name}
                </Col>
                <Col span={12}>
                  <Text strong>Order Type:</Text> {selectedOrder.order_type}
                </Col>
                <Col span={12}>
                  <Text strong>Created:</Text> {new Date(selectedOrder.created_at).toLocaleString()}
                </Col>
              </Row>
            </Card>

            {/* Products List */}
            <Title level={5}>Products ({selectedOrder.items?.length || 0} items)</Title>
            {selectedOrder.items && selectedOrder.items.length > 0 ? (
              <List
                dataSource={selectedOrder.items}
                renderItem={(item, index) => (
                  <List.Item>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <div>
                        <Text strong>#{index + 1}</Text>
                        <br />
                        <Text strong>{item.product_code}</Text> - {item.product_name}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
                          Qty: {item.quantity}
                        </Tag>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Text type="secondary">No products found</Text>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default PlacedOrders;
