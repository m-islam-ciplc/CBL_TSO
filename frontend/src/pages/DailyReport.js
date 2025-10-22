import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Button, message, Typography, Row, Col, Space, Spin, Table, Tag, Tooltip } from 'antd';
import { DownloadOutlined, FileExcelOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function DailyReport() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [orderProducts, setOrderProducts] = useState({});

  // Load available dates on component mount
  useEffect(() => {
    getAvailableDates();
  }, []);

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
      const response = await axios.get(`/api/orders/report/${dateString}`, {
        responseType: 'blob', // Important for file download
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Daily_Order_Report_${dateString}.xlsx`);
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

  // Table columns for preview (same as Placed Orders)
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
      width: 300,
    },
    {
      title: 'Territory',
      dataIndex: 'dealer_territory',
      key: 'dealer_territory',
      ellipsis: true,
      width: 120,
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
      width: 60,
    },
    {
      title: 'Product Details',
      key: 'product_details',
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
      width: 400,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color="default">New</Tag>,
      width: 80,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
      width: 150,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>
          <FileExcelOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          Daily Order Report Generator
        </Title>
        
        <Text type="secondary" style={{ fontSize: '16px', marginBottom: '24px', display: 'block' }}>
          Generate Excel reports for orders placed on a specific date in the format matching Book1.xlsx
        </Text>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" style={{ height: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={4}>Select Date</Title>
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  placeholder="Select date for report"
                  size="large"
                  disabledDate={disabledDate}
                  dateRender={dateCellRender}
                />
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card size="small" style={{ height: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={4}>Preview Data</Title>
                <Button
                  type="default"
                  icon={<EyeOutlined />}
                  onClick={handlePreviewData}
                  loading={loading}
                  style={{ width: '100%' }}
                  size="large"
                >
                  Preview Orders
                </Button>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Check what orders exist for the selected date
                </Text>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card size="small" style={{ height: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={4}>Generate Report</Title>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleGenerateReport}
                  loading={loading}
                  style={{ width: '100%' }}
                  size="large"
                >
                  Download Excel Report
                </Button>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Generate and download Excel file in Book1.xlsx format
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Preview Table */}
        {showPreview && previewData.length > 0 && (
          <Card style={{ marginTop: '24px' }}>
            <Title level={3} style={{ marginBottom: '16px' }}>
              Orders for {selectedDate ? selectedDate.format('YYYY-MM-DD') : 'Selected Date'}
            </Title>
            <Table
              columns={columns}
              dataSource={previewData}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
                pageSizeOptions: ['5', '10', '20', '50'],
                defaultPageSize: 10,
              }}
              scroll={{ x: 1200 }}
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
      </Card>
    </div>
  );
}

export default DailyReport;
