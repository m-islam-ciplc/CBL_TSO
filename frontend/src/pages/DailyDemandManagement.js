import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import {
  Card,
  Typography,
  Table,
  Input,
  Select,
  Button,
  Tag,
  Tooltip,
  Spin,
  message,
  Row,
  Col,
  DatePicker,
  Space,
  Popconfirm,
  Modal,
  InputNumber,
  Form,
} from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  DeleteOutlined,
  ClearOutlined,
  ShoppingCartOutlined,
  EditOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { createStandardDatePickerConfig } from '../templates/UIConfig';
import { useStandardPagination } from '../templates/useStandardPagination';
import { FILTER_CARD_CONFIG, CONTENT_CARD_CONFIG } from '../templates/CardTemplates';
import { STANDARD_PAGE_TITLE_CONFIG, STANDARD_PAGE_SUBTITLE_CONFIG, COMPACT_ROW_GUTTER, STANDARD_FORM_LABEL_STYLE, STANDARD_INPUT_SIZE, STANDARD_SELECT_SIZE, STANDARD_TABLE_SIZE, STANDARD_TAG_STYLE, STANDARD_POPCONFIRM_CONFIG, STANDARD_TOOLTIP_CONFIG, STANDARD_SPIN_SIZE, STANDARD_DATE_PICKER_CONFIG, STANDARD_SPACE_SIZE_SMALL, STANDARD_MODAL_CONFIG, STANDARD_INPUT_NUMBER_SIZE, STANDARD_BUTTON_SIZE } from '../templates/UIElements';

const { Title, Text } = Typography;
const { Option } = Select;

// Helper function to remove M/S prefix from dealer names
const removeMSPrefix = (name) => {
  if (!name) return name;
  return name.replace(/^M\/S[.\s]*/i, '').trim();
};

function DailyDemandManagement() {
  const { userRole, isAdmin, isSalesManager } = useUser();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [productFilter, setProductFilter] = useState(null);
  const [dealerFilter, setDealerFilter] = useState(null);
  const [orderProducts, setOrderProducts] = useState({});
  const [productsList, setProductsList] = useState([]);
  const [dealersList, setDealersList] = useState([]);
  const { pagination, setPagination, handleTableChange } = useStandardPagination('daily-demand-orders', 20);
  const [availableDates, setAvailableDates] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderItems, setEditOrderItems] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [dealerAssignedProducts, setDealerAssignedProducts] = useState([]);

  const loadDropdownData = async () => {
    try {
      const [productsRes, dealersRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/dealers')
      ]);
      setProductsList(productsRes.data || []);
      setDealersList(dealersRes.data || []);
    } catch (_error) {
      console.error('Failed to load dropdown data:', _error);
    }
  };

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      // Load only dealer daily demand orders (DD orders with dealer_id and no warehouse_id)
      const response = await axios.get('/api/orders');
      // Filter for dealer orders (has dealer_id, warehouse_id is null)
      const dealerOrders = response.data.filter(order => 
        order.dealer_id && order.warehouse_id === null
      );
      setOrders(dealerOrders);

      // Load products for all orders automatically
      const productPromises = dealerOrders.map(async (order) => {
        try {
          const productResponse = await axios.get(`/api/orders/${order.order_id}`);
          return {
            orderId: order.order_id,
            products: productResponse.data.items || []
          };
        } catch (_error) {
          console.error(`Error loading products for order ${order.order_id}:`, _error);
          return {
            orderId: order.order_id,
            products: []
          };
        }
      });

      const productResults = await Promise.all(productPromises);
      const productsMap = {};
      productResults.forEach(result => {
        productsMap[result.orderId] = result.products;
      });
      setOrderProducts(productsMap);
    } catch (error) {
      console.error('Failed to load orders:', error);
      message.error('Failed to load daily demand orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDropdownData();
    loadOrders();
  }, [loadOrders]);

  const getAvailableDates = async () => {
    try {
      const response = await axios.get('/api/orders/available-dates');
      const formattedDates = response.data.dates.map(date => {
        return new Date(date).toISOString().split('T')[0];
      });
      setAvailableDates(formattedDates);
    } catch (error) {
      console.error('Error fetching available dates:', error);
    }
  };

  useEffect(() => {
    getAvailableDates();
  }, []);

  const filterOrders = () => {
    let filtered = orders;

    // Date filter - filter by order_date (the date the order is for)
    if (selectedDate) {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      filtered = filtered.filter(order => {
        const orderDate = order.order_date ? dayjs(order.order_date).format('YYYY-MM-DD') : dayjs(order.created_at).format('YYYY-MM-DD');
        return orderDate === dateStr;
      });
    }

    // Product filter
    if (productFilter) {
      filtered = filtered.filter(order => {
        const products = orderProducts[order.order_id] || [];
        return products.some(p => p.product_id === productFilter);
      });
    }

    // Dealer filter
    if (dealerFilter) {
      filtered = filtered.filter(order => order.dealer_id === dealerFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.order_id?.toLowerCase().includes(term) ||
        order.dealer_name?.toLowerCase().includes(term) ||
        order.dealer_territory?.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(filtered);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  useEffect(() => {
    filterOrders();
  }, [orders, selectedDate, productFilter, dealerFilter, searchTerm, orderProducts]);

  const clearFilters = () => {
    setSelectedDate(dayjs());
    setProductFilter(null);
    setDealerFilter(null);
    setSearchTerm('');
  };

  const handleEditOrder = async (order) => {
    // Load order details and dealer assigned products
    try {
      const [orderResponse, assignmentsResponse] = await Promise.all([
        axios.get(`/api/orders/${order.order_id}`),
        axios.get(`/api/dealer-assignments?dealer_id=${order.dealer_id}`)
      ]);
      
      const orderData = orderResponse.data;
      
      // Check if it's a DD order
      if (orderData.order_type_name !== 'DD') {
        message.warning('Only daily demand orders can be edited');
        return;
      }
      
      // Get assigned product IDs
      const assignedProductIds = (assignmentsResponse.data || [])
        .filter(a => a.assignment_type === 'product' && a.product_id)
        .map(a => a.product_id);
      
      setDealerAssignedProducts(assignedProductIds);
      setEditingOrder(order);
      setEditOrderItems(orderData.items || []);
      setEditModalVisible(true);
      editForm.setFieldsValue({
        items: (orderData.items || []).map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      });
    } catch (error) {
      console.error('Error loading order details:', error);
      message.error('Failed to load order details');
    }
  };

  const handleSaveEditOrder = async () => {
    if (!editingOrder) return;
    
    try {
      await editForm.validateFields();
      const values = editForm.getFieldsValue();
      const orderItems = values.items || [];
      
      if (orderItems.length === 0) {
        message.error('At least one product is required');
        return;
      }
      
      setEditLoading(true);
      
      await axios.put(`/api/orders/dealer/${editingOrder.order_id}`, {
        order_items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        user_role: userRole
      });
      
      message.success('Order updated successfully');
      setEditModalVisible(false);
      setEditingOrder(null);
      setEditOrderItems([]);
      editForm.resetFields();
      
      // Reload orders
      loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      message.error(error.response?.data?.error || 'Failed to update order');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId, orderCreatedAt) => {
    const orderDate = dayjs(orderCreatedAt).format('YYYY-MM-DD');
    const today = dayjs().format('YYYY-MM-DD');
    
    if (orderDate !== today) {
      message.error('Only today\'s orders can be deleted');
      return;
    }
    
    try {
      const response = await axios.delete(`/api/orders/${orderId}`);
      message.success(response.data.message || 'Order deleted successfully');
      loadOrders();
    } catch (_error) {
      const errorMessage = _error.response?.data?.error || _error.message || 'Failed to delete order';
      message.error(errorMessage);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size={STANDARD_SPIN_SIZE} />
      </div>
    );
  }

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      ellipsis: true,
      render: (orderId) => (
        <Tag color="blue" style={STANDARD_TAG_STYLE}>
          {orderId}
        </Tag>
      ),
      sorter: (a, b) => a.order_id.localeCompare(b.order_id),
    },
    {
      title: 'Dealer',
      dataIndex: 'dealer_name',
      key: 'dealer_name',
      ellipsis: {
        showTitle: true,
      },
      render: (name) => removeMSPrefix(name || 'N/A'),
      sorter: (a, b) => a.dealer_name.localeCompare(b.dealer_name),
    },
    {
      title: 'Territory',
      dataIndex: 'dealer_territory',
      key: 'dealer_territory',
      ellipsis: true,
      render: (territory) => territory || 'N/A',
      sorter: (a, b) => {
        const territoryA = a.dealer_territory || 'N/A';
        const territoryB = b.dealer_territory || 'N/A';
        return territoryA.localeCompare(territoryB);
      },
    },
    {
      title: 'Order Date',
      dataIndex: 'order_date',
      key: 'order_date',
      ellipsis: true,
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : 'N/A',
      sorter: (a, b) => {
        const dateA = a.order_date || a.created_at;
        const dateB = b.order_date || b.created_at;
        return new Date(dateA) - new Date(dateB);
      },
    },
    {
      title: 'Products',
      key: 'products',
      ellipsis: true,
      render: (_, record) => {
        return (
          <div>
            <Tag color="green" style={STANDARD_TAG_STYLE}>
              {record.item_count || 0} item{(record.item_count || 0) !== 1 ? 's' : ''}
            </Tag>
          </div>
        );
      },
      sorter: (a, b) => (a.item_count || 0) - (b.item_count || 0),
    },
    {
      title: 'Product Details',
      key: 'product_details',
      ellipsis: {
        showTitle: true,
      },
      render: (_, record) => {
        const products = orderProducts[record.order_id] || [];
        
        if (products.length === 0) {
          return (
            <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
              No products found
            </div>
          );
        }
        
        return (
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            {products.map((product, index) => (
              <div key={product.id} style={{ marginBottom: '2px' }}>
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                  #{index + 1}
                </span>{' '}
                <span style={{ color: '#666' }}>
                  {product.product_code}
                </span>{' '}
                <span style={{ fontWeight: 'bold' }}>
                  {product.product_name}
                </span>
                <span style={{ color: '#52c41a', marginLeft: '8px' }}>
                  (Qty: {product.quantity})
                </span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      ellipsis: true,
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const orderDate = dayjs(record.created_at).format('YYYY-MM-DD');
        const today = dayjs().format('YYYY-MM-DD');
        const isToday = orderDate === today;
        
        return (
          <Space>
            {(isAdmin || isSalesManager) && (
              <Tooltip {...STANDARD_TOOLTIP_CONFIG} title="Edit Order">
                <Button
                  type="text"
                  size={STANDARD_TABLE_SIZE}
                  icon={<EditOutlined />}
                  onClick={() => handleEditOrder(record)}
                />
              </Tooltip>
            )}
            {isToday ? (
              <Popconfirm
                {...STANDARD_POPCONFIRM_CONFIG}
                title="Delete Order"
                description={
                  <div>
                    <div>Are you sure you want to delete order {record.order_id}?</div>
                    <div>This action cannot be undone.</div>
                  </div>
                }
                onConfirm={() => handleDeleteOrder(record.id, record.created_at)}
                okText="Yes, Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Tooltip {...STANDARD_TOOLTIP_CONFIG} title="Delete Order">
                  <Button
                    type="text"
                    size={STANDARD_TABLE_SIZE}
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            ) : (
              <Tooltip {...STANDARD_TOOLTIP_CONFIG} title="Only today's orders can be deleted">
                <Button
                  type="text"
                  size={STANDARD_TABLE_SIZE}
                  danger
                  icon={<DeleteOutlined />}
                  disabled
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  // Standard date picker configuration
  const { disabledDate, dateCellRender } = createStandardDatePickerConfig(availableDates);

  return (
    <div>
      <Title {...STANDARD_PAGE_TITLE_CONFIG}>
        <ShoppingCartOutlined /> Daily Demand Orders
      </Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        View and manage dealer daily demand orders. Edit orders placed by dealers.
      </Text>

      {/* Filters */}
      <Card title="Filter Orders" {...FILTER_CARD_CONFIG}>
        <Row gutter={COMPACT_ROW_GUTTER}>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>Date</Text>
              <DatePicker
                {...STANDARD_DATE_PICKER_CONFIG}
                value={selectedDate}
                onChange={setSelectedDate}
                style={{ width: '100%' }}
                allowClear={false}
                disabledDate={disabledDate}
                dateRender={dateCellRender}
              />
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>Product</Text>
              <Select
                placeholder="All Products"
                value={productFilter}
                onChange={setProductFilter}
                style={{ width: '100%' }}
                size={STANDARD_INPUT_SIZE}
                allowClear
                showSearch
                filterOption={(input, option) => {
                  const optionText = option?.children?.toString() || '';
                  return optionText.toLowerCase().includes(input.toLowerCase());
                }}
              >
                {productsList.map(product => (
                  <Option key={product.id} value={product.id}>
                    {product.product_code} - {product.name}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>Dealer</Text>
              <Select
                placeholder="All Dealers"
                value={dealerFilter}
                onChange={setDealerFilter}
                style={{ width: '100%' }}
                size={STANDARD_INPUT_SIZE}
                allowClear
                showSearch
                filterOption={(input, option) => {
                  const optionText = option?.children?.toString() || '';
                  return optionText.toLowerCase().includes(input.toLowerCase());
                }}
              >
                {dealersList.map(dealer => (
                  <Option key={dealer.id} value={dealer.id}>
                    {removeMSPrefix(dealer.name)}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>Actions</Text>
              <Space style={{ width: '100%' }}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadOrders}
                  style={{ flex: 1 }}
                >
                  Refresh
                </Button>
                <Button
                  icon={<ClearOutlined />}
                  onClick={clearFilters}
                  style={{ flex: 1 }}
                >
                  Clear
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>Daily Demand Orders ({filteredOrders.length})</Text>
          <Input
            placeholder="Search orders..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="middle"
            allowClear
            style={{ width: '300px' }}
          />
        </div>

        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }}>📋</div>
            <Title level={5} type="secondary">
              No orders found
            </Title>
            <Text type="secondary">
              {searchTerm ? 'Try adjusting your search criteria' : 'No daily demand orders have been placed yet'}
            </Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="id"
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 'max-content' }}
            size="small"
          />
        )}
      </Card>

      {/* Edit Order Modal */}
      <Modal
        {...STANDARD_MODAL_CONFIG}
        title="Edit Daily Demand Order"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingOrder(null);
          setEditOrderItems([]);
          editForm.resetFields();
        }}
        footer={null}
      >
        {editingOrder && (
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleSaveEditOrder}
          >
            <Form.Item label="Order ID">
              <Text strong>{editingOrder.order_id}</Text>
            </Form.Item>
            <Form.Item label="Dealer">
              <Text>{removeMSPrefix(editingOrder.dealer_name || 'N/A')}</Text>
            </Form.Item>
            <Form.Item label="Order Date">
              <Text>{editingOrder.order_date ? dayjs(editingOrder.order_date).format('YYYY-MM-DD') : 'N/A'}</Text>
            </Form.Item>
            
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => {
                    const item = editOrderItems[index];
                    return (
                      <Card key={field.key} style={{ marginBottom: '16px' }} size="small">
                        <Row gutter={COMPACT_ROW_GUTTER}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              {...field}
                              name={[field.name, 'product_id']}
                              label="Product"
                              rules={[{ required: true, message: 'Please select a product' }]}
                            >
                              <Select
                                placeholder="Select Product"
                                size={STANDARD_SELECT_SIZE}
                                showSearch
                                filterOption={(input, option) => {
                                  const optionText = option?.children?.toString() || '';
                                  return optionText.toLowerCase().includes(input.toLowerCase());
                                }}
                              >
                                {productsList
                                  .filter(p => dealerAssignedProducts.includes(p.id))
                                  .map(product => (
                                    <Option key={product.id} value={product.id}>
                                      {product.product_code} - {product.name}
                                    </Option>
                                  ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item
                              {...field}
                              name={[field.name, 'quantity']}
                              label="Quantity"
                              rules={[
                                { required: true, message: 'Please enter quantity' },
                                { type: 'number', min: 1, message: 'Quantity must be at least 1' }
                              ]}
                            >
                              <InputNumber
                                min={1}
                                style={{ width: '100%' }}
                                size={STANDARD_INPUT_NUMBER_SIZE}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={4}>
                            <Form.Item label=" " style={{ marginTop: '30px' }}>
                              <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => remove(field.name)}
                                size={STANDARD_BUTTON_SIZE}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    );
                  })}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      size={STANDARD_BUTTON_SIZE}
                    >
                      Add Product
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={editLoading}
                  size={STANDARD_BUTTON_SIZE}
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => {
                    setEditModalVisible(false);
                    setEditingOrder(null);
                    setEditOrderItems([]);
                    editForm.resetFields();
                  }}
                  size={STANDARD_BUTTON_SIZE}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

    </div>
  );
}

export default DailyDemandManagement;

