import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Button, message, Typography, Row, Col, Space, Spin, Table, Tag, Tooltip, Input, Select } from 'antd';
import { DownloadOutlined, FileExcelOutlined, EyeOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Helper function to remove M/S prefix from dealer names
const removeMSPrefix = (name) => {
  if (!name) return name;
  // Remove "M/S", "M/S.", "M/S " prefix (case insensitive, with or without space/period)
  return name.replace(/^M\/S[.\s]*/i, '').trim();
};

function DailyReport() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [filteredPreviewData, setFilteredPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [orderProducts, setOrderProducts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load available dates on component mount
  useEffect(() => {
    getAvailableDates();
  }, []);

  // Filter preview data when search term or status filter changes
  useEffect(() => {
    filterPreviewData();
  }, [previewData, searchTerm, statusFilter]);

  const getAvailableDates = async () => {
    try {
      console.log('Fetching available dates...');
      const response = await axios.get('/api/orders/available-dates');
      console.log('Available dates response:', response.data);
      
      // Convert ISO dates to YYYY-MM-DD format
      const formattedDates = response.data.dates.map(date => {
        return new Date(date).toISOString().split('T')[0];
      });
      
      console.log('Formatted dates:', formattedDates);
      setAvailableDates(formattedDates);
    } catch (error) {
      console.error('Error fetching available dates:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  // Disable dates without orders
  const disabledDate = (current) => {
    const dateString = current.format('YYYY-MM-DD');
    console.log('Checking date:', dateString, 'Available dates:', availableDates);
    const isDisabled = !availableDates.includes(dateString);
    console.log('Date disabled:', isDisabled);
    return isDisabled;
  };

  // Custom date cell renderer
  const dateCellRender = (current) => {
    const dateString = current.format('YYYY-MM-DD');
    const hasOrders = availableDates.includes(dateString);
    
    return (
      <div style={{
        color: hasOrders ? '#000' : '#d9d9d9',
        backgroundColor: hasOrders ? 'transparent' : '#f5f5f5',
        cursor: hasOrders ? 'pointer' : 'not-allowed',
        borderRadius: '4px',
        padding: '2px'
      }}>
        {current.date()}
      </div>
    );
  };

  const handleGenerateReport = async () => {
    if (!selectedDate) {
      message.error('Please select a date');
      return;
    }

    setLoading(true);
    try {
      const dateString = selectedDate ? selectedDate.format('YYYY-MM-DD') : '';
      if (!dateString) {
        message.error('Please select a valid date');
        return;
      }
      
      // Generate Excel report
      const response = await axios.get(`/api/orders/tso-report/${dateString}`, {
        responseType: 'blob', // Important for file download
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TSO_Order_Report_${dateString}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success(`Excel report generated successfully for ${dateString}`);
    } catch (error) {
      console.error('Error generating report:', error);
      if (error.response?.status === 404) {
        message.error(`No orders found for ${selectedDate ? selectedDate.format('YYYY-MM-DD') : 'selected date'}`);
      } else {
        message.error('Failed to generate report. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMRReport = async () => {
    if (!selectedDate) {
      message.error('Please select a date');
      return;
    }

    setLoading(true);
    try {
      const dateString = selectedDate ? selectedDate.format('YYYY-MM-DD') : '';
      if (!dateString) {
        message.error('Please select a valid date');
        return;
      }
      
      // Generate MR CSV report
      const response = await axios.get(`/api/orders/mr-report/${dateString}`, {
        responseType: 'blob', // Important for file download
        headers: {
          'Accept': 'text/csv'
        }
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MR_Order_Report_${dateString}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success(`MR CSV report generated successfully for ${dateString}`);
    } catch (error) {
      console.error('Error generating MR report:', error);
      if (error.response?.status === 404) {
        message.error(`No orders found for ${selectedDate ? selectedDate.format('YYYY-MM-DD') : 'selected date'}`);
      } else {
        message.error('Failed to generate MR report. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewData = async () => {
    if (!selectedDate) {
      message.error('Please select a date');
      return;
    }

    setLoading(true);
    try {
      const dateString = selectedDate ? selectedDate.format('YYYY-MM-DD') : '';
      if (!dateString) {
        message.error('Please select a valid date');
        return;
      }
      const response = await axios.get(`/api/orders/date/${dateString}`);
      
      const { orders, total_orders, total_items } = response.data;
      
      if (orders.length === 0) {
        message.info(`No orders found for ${dateString}`);
        setShowPreview(false);
        return;
      }

      // Load products for all orders
      const productPromises = orders.map(async (order) => {
        try {
          const productResponse = await axios.get(`/api/orders/${order.order_id}`);
          return {
            orderId: order.order_id,
            products: productResponse.data.items || []
          };
        } catch (error) {
          console.error(`Error loading products for order ${order.order_id}:`, error);
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

      // Set preview data and show table
      setPreviewData(orders);
      setShowPreview(true);
      
      // Show summary
      message.success(`Found ${total_orders} orders with ${total_items} items for ${dateString}`);
      
    } catch (error) {
      console.error('Error fetching order data:', error);
      message.error('Failed to fetch order data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter preview data
  const filterPreviewData = () => {
    let filtered = previewData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.dealer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.dealer_territory.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => (order.status || 'new') === statusFilter);
    }

    setFilteredPreviewData(filtered);
  };

  // Table columns for preview (same as Placed Orders)
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      ellipsis: true,
      render: (orderId) => (
        <Tag color="blue" style={{ fontSize: '12px' }}>
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
      title: 'Products',
      key: 'products',
      ellipsis: true,
      render: (_, record) => {
        return (
          <div>
            <Tag color="green" style={{ fontSize: '12px' }}>
              {record.item_count} item{record.item_count !== 1 ? 's' : ''}
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
                <span style={{ fontWeight: 'bold' }}>
                  {product.product_code}
                </span>{' '}
                <span style={{ color: '#666' }}>
                  {product.product_name}
                </span>
                <span style={{ color: '#52c41a', marginLeft: '8px' }}>
                  (Qty: {product.quantity})
                </span>
                {product.unit_tp && (
                  <span style={{ color: '#1890ff', marginLeft: '8px' }}>
                    @৳{product.unit_tp.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => <Tag color="default">New</Tag>,
      sorter: (a, b) => {
        const statusA = a.status || 'new';
        const statusB = b.status || 'new';
        return statusA.localeCompare(statusB);
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
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: '8px' }}>
        Daily Order Report Generator
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Generate Excel reports for orders placed on a specific date
      </Text>

      {/* Actions */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Select Date</Text>
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
                placeholder="Select date for report"
                disabledDate={disabledDate}
                dateRender={dateCellRender}
              />
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={handlePreviewData}
              loading={loading}
              style={{ width: '100%' }}
            >
              Preview Orders
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleGenerateReport}
              loading={loading}
              style={{ width: '100%' }}
            >
              Download TSO Excel
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleGenerateMRReport}
              loading={loading}
              style={{ width: '100%' }}
            >
              Download MR CSV
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Preview Table */}
      {showPreview && previewData.length > 0 && (
        <Card>
          <div style={{ marginBottom: '16px' }}>
            <Text strong>Orders ({filteredPreviewData.length})</Text>
          </div>
          
          {/* Filters */}
          <Card size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder="Search orders..."
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Select
                  placeholder="Filter by status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: '100%' }}
                  allowClear
                >
                  <Select.Option value="all">All Status</Select.Option>
                  <Select.Option value="new">New</Select.Option>
                  <Select.Option value="processing">Processing</Select.Option>
                  <Select.Option value="completed">Completed</Select.Option>
                  <Select.Option value="shipped">Shipped</Select.Option>
                </Select>
              </Col>
            </Row>
          </Card>

          <Table
            columns={columns}
            dataSource={filteredPreviewData}
            rowKey="id"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
              pageSizeOptions: ['10', '20', '50', '100'],
              defaultPageSize: 20,
            }}
            scroll={{ x: 'max-content' }}
            size="small"
          />
        </Card>
      )}

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text>Processing your request...</Text>
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyReport;
