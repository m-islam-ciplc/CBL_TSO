import { useState, useEffect } from 'react';
import { Card, DatePicker, Button, message, Typography, Row, Col, Space, Spin, Table, Tag, Input, Tabs } from 'antd';
import { DownloadOutlined, FileExcelOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { useUser } from '../contexts/UserContext';

const { Title, Text } = Typography;

// Helper function to remove M/S prefix from dealer names
const removeMSPrefix = (name) => {
  if (!name) return name;
  return name.replace(/^M\/S[.\s]*/i, '').trim();
};

function TSOReport() {
  const { userId } = useUser();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [filteredPreviewData, setFilteredPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [orderProducts, setOrderProducts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [previewInfo, setPreviewInfo] = useState('');
  const [previewMode, setPreviewMode] = useState('single');
  const [activeTab, setActiveTab] = useState('single');

  // Load available dates on component mount
  useEffect(() => {
    if (userId) {
      getAvailableDates();
    }
  }, [userId]);

  // Filter preview data when search term changes
  useEffect(() => {
    filterPreviewData();
  }, [previewData, searchTerm, previewMode]);

  const getAvailableDates = async () => {
    try {
      const response = await axios.get('/api/orders/tso/available-dates', {
        params: { user_id: userId }
      });
      
      const formattedDates = response.data.dates.map(date => {
        return new Date(date).toISOString().split('T')[0];
      });
      
      setAvailableDates(formattedDates);
    } catch (_error) {
      console.error('Error fetching available dates:', _error);
    }
  };

  const handleGenerateRangeReport = async () => {
    if (!rangeStart || !rangeEnd) {
      message.error('Please select both start and end dates');
      return;
    }

    if (rangeStart.isAfter(rangeEnd)) {
      message.error('Start date cannot be after end date');
      return;
    }

    const startDate = rangeStart.format('YYYY-MM-DD');
    const endDate = rangeEnd.format('YYYY-MM-DD');

    setLoading(true);
    try {
      const response = await axios.get('/api/orders/tso/my-report-range', {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        params: {
          startDate,
          endDate,
          user_id: userId,
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TSO_My_Order_Report_${startDate}_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success(`Excel report generated for ${startDate} to ${endDate}`);
    } catch (_error) {
      console.error('Error generating range report:', _error);
      if (_error.response?.status === 404) {
        message.error(`No orders found between ${startDate} and ${endDate}`);
      } else if (_error.response?.data?.error) {
        message.error(_error.response.data.error);
      } else {
        message.error('Failed to generate range report. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewRange = async () => {
    if (!rangeStart || !rangeEnd) {
      message.error('Please select both start and end dates to preview');
      return;
    }

    if (rangeStart.isAfter(rangeEnd)) {
      message.error('Start date cannot be after end date');
      return;
    }

    const startDate = rangeStart.format('YYYY-MM-DD');
    const endDate = rangeEnd.format('YYYY-MM-DD');

    setLoading(true);
    try {
      const response = await axios.get('/api/orders/tso/range', {
        params: {
          startDate,
          endDate,
          user_id: userId,
        },
      });

      const {
        orders,
        total_dealers,
        total_quantity,
        total_original_orders,
      } = response.data;

      if (!orders || orders.length === 0) {
        message.info(`No orders found between ${startDate} and ${endDate}`);
        setPreviewMode('range');
        setPreviewData([]);
        setShowPreview(false);
        setPreviewInfo('');
        return;
      }

      setOrderProducts({});
      setPreviewMode('range');
      setPreviewData(orders);
      setShowPreview(true);
      setPreviewInfo(`Dealer summary from ${startDate} to ${endDate}`);

      const dealerLabel = total_dealers === 1 ? 'dealer' : 'dealers';
      const orderLabel = total_original_orders === 1 ? 'order' : 'orders';
      const quantityLabel = total_quantity === 1 ? 'unit' : 'units';

      message.success(
        `Found ${total_dealers} ${dealerLabel} covering ${total_original_orders} ${orderLabel} with ${total_quantity} ${quantityLabel}`
      );
    } catch (_error) {
      console.error('Error fetching range order data:', _error);
      if (_error.response?.data?.error) {
        message.error(_error.response.data.error);
      } else {
        message.error('Failed to fetch range order data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Disable dates without orders
  const disabledDate = (current) => {
    const dateString = current.format('YYYY-MM-DD');
    return !availableDates.includes(dateString);
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
      
      const response = await axios.get(`/api/orders/tso/my-report/${dateString}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        params: {
          user_id: userId,
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TSO_My_Order_Report_${dateString}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success(`Excel report generated successfully for ${dateString}`);
    } catch (_error) {
      console.error('Error generating report:', _error);
      if (_error.response?.status === 404) {
        message.error(`No orders found for ${selectedDate ? selectedDate.format('YYYY-MM-DD') : 'selected date'}`);
      } else {
        message.error('Failed to generate report. Please try again.');
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
      const response = await axios.get(`/api/orders/tso/date/${dateString}`, {
        params: { user_id: userId }
      });
      
      const { orders, total_orders, total_items } = response.data;
      
      if (orders.length === 0) {
        message.info(`No orders found for ${dateString}`);
        setPreviewMode('single');
        setShowPreview(false);
        setPreviewInfo('');
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

      setPreviewMode('single');
      setPreviewData(orders);
      setShowPreview(true);
      setPreviewInfo(`Orders for ${dateString}`);
      
      message.success(`Found ${total_orders} orders with ${total_items} items for ${dateString}`);
      
    } catch (_error) {
      console.error('Error fetching order data:', _error);
      message.error('Failed to fetch order data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter preview data
  const filterPreviewData = () => {
    let filtered = previewData;

    if (previewMode === 'range') {
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        filtered = filtered.filter(entry => {
          const dealerMatch = (entry.dealer_name || '').toLowerCase().includes(query);
          const territoryMatch = (entry.dealer_territory || '').toLowerCase().includes(query);
          const productMatch = (entry.product_summaries || []).some(product =>
            (product.product_name || '').toLowerCase().includes(query) ||
            (product.product_code || '').toLowerCase().includes(query)
          );
          return dealerMatch || territoryMatch || productMatch;
        });
      }
    } else {
      if (searchTerm) {
        filtered = filtered.filter(order =>
          order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.dealer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.dealer_territory.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    }

    setFilteredPreviewData(filtered);
  };

  // Table columns for single-date preview (no prices)
  const singleColumns = [
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
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Transport',
      dataIndex: 'transport_name',
      key: 'transport_name',
      ellipsis: true,
      sorter: (a, b) => {
        const getTransportValue = (record) => {
          const names = record.transport_name
            ? [record.transport_name]
            : record.transport_names || [];
          if (Array.isArray(names) && names.length > 1) {
            return 'Different Transport Providers';
          }
          const value = Array.isArray(names) ? names[0] : record.transport_name;
          return value || 'N/A';
        };
        return getTransportValue(a).localeCompare(getTransportValue(b));
      },
      render: (_, record) => {
        const names = record.transport_name
          ? [record.transport_name]
          : record.transport_names || [];
        if (Array.isArray(names) && names.length > 1) {
          return 'Different Transport Providers';
        }
        const value = Array.isArray(names) ? names[0] : record.transport_name;
        return value || 'N/A';
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: () => <Tag color="default">New</Tag>,
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

  const rangeColumns = [
    {
      title: 'Orders',
      dataIndex: 'order_count',
      key: 'order_count',
      width: 90,
      align: 'center',
      sorter: (a, b) => (a.order_count || 0) - (b.order_count || 0),
    },
    {
      title: 'Dealer',
      dataIndex: 'dealer_name',
      key: 'dealer_name',
      ellipsis: {
        showTitle: true,
      },
      render: (name) => removeMSPrefix(name || 'N/A'),
      sorter: (a, b) => (a.dealer_name || '').localeCompare(b.dealer_name || ''),
    },
    {
      title: 'Territory',
      dataIndex: 'dealer_territory',
      key: 'dealer_territory',
      ellipsis: true,
      render: (territory) => territory || 'N/A',
      sorter: (a, b) => (a.dealer_territory || '').localeCompare(b.dealer_territory || ''),
    },
    {
      title: 'Products',
      dataIndex: 'distinct_products',
      key: 'distinct_products',
      width: 110,
      align: 'center',
      sorter: (a, b) => (a.distinct_products || 0) - (b.distinct_products || 0),
      render: (count) => (
        <Tag color="green" style={{ fontSize: '12px' }}>
          {count || 0} item{count === 1 ? '' : 's'}
        </Tag>
      ),
    },
    {
      title: 'Product Details',
      key: 'product_details',
      ellipsis: {
        showTitle: true,
      },
      render: (_, record) => {
        const products = record.product_summaries || [];
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
              <div key={`${record.id}-${product.product_code}`} style={{ marginBottom: '2px' }}>
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
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Transport',
      dataIndex: 'transport_names',
      key: 'transport_names',
      ellipsis: true,
      sorter: (a, b) => {
        const getTransportValue = (record) => {
          const names = record.transport_names || [];
          if (!names || names.length === 0) {
            return 'N/A';
          }
          if (names.length === 1) {
            return names[0];
          }
          return 'Different Transport Providers';
        };
        return getTransportValue(a).localeCompare(getTransportValue(b));
      },
      render: (names = []) => {
        if (!names || names.length === 0) {
          return 'N/A';
        }
        if (names.length === 1) {
          return names[0];
        }
        return 'Different Transport Providers';
      },
    },
    {
      title: 'Total Qty',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 110,
      align: 'center',
      sorter: (a, b) => (a.total_quantity || 0) - (b.total_quantity || 0),
    },
    {
      title: 'Date Span',
      dataIndex: 'date_span',
      key: 'date_span',
      ellipsis: true,
      sorter: (a, b) => {
        const spanA = a.date_span || 'N/A';
        const spanB = b.date_span || 'N/A';
        return spanA.localeCompare(spanB);
      },
      render: (span) => span || 'N/A',
    },
  ];

  if (!userId) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text type="danger">User ID not found. Please log in again.</Text>
      </div>
    );
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: '8px' }}>
        My Order Reports
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Generate Excel reports for your orders placed on a specific date or across a date range
      </Text>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Daily Report (Single Date)" key="single">
          <Card title="Daily Report (Single Date)" style={{ marginBottom: '16px', borderRadius: '8px' }} bodyStyle={{ padding: '12px' }}>
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
                  Download Daily Order Report
                </Button>
              </Col>
            </Row>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Order Summary (Date Range)" key="range">
          <Card title="Order Summary (Date Range)" style={{ marginBottom: '16px', borderRadius: '8px' }} bodyStyle={{ padding: '12px' }}>
            <Row gutter={[16, 16]} align="bottom">
              <Col xs={24} sm={12} md={6}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Start Date</Text>
                  <DatePicker
                    value={rangeStart}
                    onChange={setRangeStart}
                    format="YYYY-MM-DD"
                    style={{ width: '100%' }}
                    placeholder="Start date"
                    dateRender={dateCellRender}
                  />
                </Space>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>End Date</Text>
                  <DatePicker
                    value={rangeEnd}
                    onChange={setRangeEnd}
                    format="YYYY-MM-DD"
                    style={{ width: '100%' }}
                    placeholder="End date"
                    dateRender={dateCellRender}
                  />
                </Space>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button
                  type="default"
                  icon={<EyeOutlined />}
                  onClick={handlePreviewRange}
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  Preview Range Orders
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={handleGenerateRangeReport}
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  Download Order Summary
                </Button>
              </Col>
            </Row>
          </Card>
        </Tabs.TabPane>
      </Tabs>

      {/* Preview Table */}
      {showPreview && previewData.length > 0 && (
        <Card>
          <div style={{ marginBottom: '16px' }}>
            <Text strong>
              {previewInfo || 'Orders'} ({filteredPreviewData.length})
            </Text>
          </div>
          
          {/* Filters */}
          <Card size="small" style={{ marginBottom: '16px', borderRadius: '8px' }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder={previewMode === 'range' ? 'Search dealers or products...' : 'Search orders...'}
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
            </Row>
          </Card>

          <Table
            columns={previewMode === 'range' ? rangeColumns : singleColumns}
            dataSource={filteredPreviewData}
            rowKey={(record) =>
              previewMode === 'range'
                ? record.id
                : record.order_id || record.id
            }
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} ${previewMode === 'range' ? 'dealers' : 'orders'}`,
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

export default TSOReport;

