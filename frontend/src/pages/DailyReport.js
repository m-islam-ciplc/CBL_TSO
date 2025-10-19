import React, { useState } from 'react';
import { Card, DatePicker, Button, message, Typography, Row, Col, Space, Spin } from 'antd';
import { DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function DailyReport() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!selectedDate) {
      message.error('Please select a date');
      return;
    }

    setLoading(true);
    try {
      const dateString = selectedDate.format('YYYY-MM-DD');
      
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
        message.error(`No orders found for ${selectedDate.format('YYYY-MM-DD')}`);
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
      const dateString = selectedDate.format('YYYY-MM-DD');
      const response = await axios.get(`/api/orders/date/${dateString}`);
      
      const { orders, total_orders, total_items } = response.data;
      
      if (orders.length === 0) {
        message.info(`No orders found for ${dateString}`);
        return;
      }

      // Show summary
      message.success(`Found ${total_orders} orders with ${total_items} items for ${dateString}`);
      
      // Log detailed info for debugging
      console.log('Orders for date:', orders);
      
    } catch (error) {
      console.error('Error fetching order data:', error);
      message.error('Failed to fetch order data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
                  icon={<FileExcelOutlined />}
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

        <Card style={{ marginTop: '24px' }}>
          <Title level={4}>Report Features</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <ul>
                <li><strong>Segment Summary:</strong> PC, CV, SPB, ET, RB, GSB, IPS totals</li>
                <li><strong>Product Matrix:</strong> All products as columns with quantities</li>
                <li><strong>Dealer Details:</strong> Territory, name, address, contact info</li>
                <li><strong>Financial Calculations:</strong> Invoice values, gross values, totals</li>
              </ul>
            </Col>
            <Col xs={24} sm={12}>
              <ul>
                <li><strong>Date Format:</strong> Matches Book1.xlsx structure exactly</li>
                <li><strong>Auto-categorization:</strong> Products grouped by segments</li>
                <li><strong>Professional Layout:</strong> Ready for business use</li>
                <li><strong>Download Ready:</strong> Instant Excel file generation</li>
              </ul>
            </Col>
          </Row>
        </Card>

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
