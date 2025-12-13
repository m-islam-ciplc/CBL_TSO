import { useState } from 'react';
import { 
  Card, 
  Typography,
  Form,
  Select,
  Button,
  Modal,
  InputNumber,
  Tag,
} from 'antd';
import {
  LayoutOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  STANDARD_CARD_CONFIG, 
  STANDARD_PAGE_TITLE_CONFIG, 
  STANDARD_PAGE_SUBTITLE_CONFIG,
  COMPACT_ROW_GUTTER,
  STANDARD_MODAL_CONFIG,
  STANDARD_INPUT_NUMBER_SIZE,
} from '../../templates/UITemplates';
import { PlaceNewOrdersOrderDetailsCardTemplate } from '../../templates/PlaceNewOrdersOrderDetailsCardTemplate';
import { PlaceNewOrdersSearchProductsCardTemplate } from '../../templates/PlaceNewOrdersSearchProductsCardTemplate';
import { ReviewOrdersEmptyOrderCardTemplate } from '../../templates/ReviewOrdersEmptyOrderCardTemplate';
import { ReviewOrdersOrderFormCardTemplate } from '../../templates/ReviewOrdersOrderFormCardTemplate';
import { ReviewOrdersOrderItemsCardTemplate } from '../../templates/ReviewOrdersOrderItemsCardTemplate';
import { ReviewOrdersOrderSummaryCardTemplate } from '../../templates/ReviewOrdersOrderSummaryCardTemplate';
import { TSOReportMyOrderReportsCardTemplate } from '../../templates/TSOReportMyOrderReportsCardTemplate';
import '../../App.css';
import '../NewOrdersTablet.css';

const { Title, Text } = Typography;
const { Option } = Select;

function TSOTemplateCards() {
  const [orderDetailsForm] = Form.useForm();
  const [reviewOrderForm] = Form.useForm();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(dayjs()); // On page load, end date is today
  const [orderItems, setOrderItems] = useState([
    { id: 1, product_name: 'Product A', quantity: 5 },
    { id: 2, product_name: 'Product B', quantity: 10 },
    { id: 3, product_name: 'Product C', quantity: 3 },
  ]);
  
  // Demo data
  const demoDealers = [
    { id: 1, name: 'M/S Dealer One', territory_code: 'T001' },
    { id: 2, name: 'M/S Dealer Two', territory_code: 'T001' },
    { id: 3, name: 'M/S Dealer Three', territory_code: 'T002' },
  ];
  
  const demoTransports = [
    { id: 1, truck_details: 'Truck-001 - Route A' },
    { id: 2, truck_details: 'Truck-002 - Route B' },
    { id: 3, truck_details: 'Truck-003 - Route C' },
  ];

  const removeMSPrefix = (name) => {
    if (!name) return name;
    return name.replace(/^M\/S[.\s]*/i, '').trim();
  };

  const updateOrderItem = (itemId, field, value) => {
    setOrderItems(items => items.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const removeOrderItem = (itemId) => {
    setOrderItems(items => items.filter(item => item.id !== itemId));
  };

  const clearAllItems = () => {
    setOrderItems([]);
  };

  const totalQuantity = orderItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  // Demo product data for TSO product cards
  const demoProducts = [
    { id: 1, name: '6DGA-1400 Gaston', product_code: 'E101GT108', quantity: 5, quota: { remaining: 45, total: 50 } },
    { id: 2, name: '8DGA-1600 Gaston', product_code: 'E102GT108', quantity: 0, quota: { remaining: 0, total: 20 } },
    { id: 3, name: '10DGA-1800 Gaston', product_code: 'E103GT108', quantity: 0, quota: { remaining: 30, total: 30 } },
    { id: 4, name: '12DGA-2000 Gaston', product_code: 'E104GT108', quantity: 10, quota: { remaining: 15, total: 25 } },
  ];

  // Product popup modal state
  const [selectedProductForPopup, setSelectedProductForPopup] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [productQuantities, setProductQuantities] = useState({});

  const showProductPopup = (product) => {
    setSelectedProductForPopup(product);
    setIsPopupVisible(true);
  };

  const hideProductPopup = () => {
    setIsPopupVisible(false);
    setSelectedProductForPopup(null);
  };

  const updateProductQuantity = (productId, change) => {
    setProductQuantities(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, currentQty + change);
      return {
        ...prev,
        [productId]: newQty
      };
    });
  };

  return (
    <div>
      <Title {...STANDARD_PAGE_TITLE_CONFIG}>
        <LayoutOutlined /> TSO Card Templates
      </Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        Individual template files for TSO-specific card layouts. Each card has its own dedicated template file.
      </Text>

      {/* PLACE NEW ORDERS ORDER DETAILS CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="TSO > /new-orders > Place New Orders > Order Details">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>PlaceNewOrdersOrderDetailsCardTemplate.js</code><br/>
          Used in: Place New Orders page - Order Details card<br/>
          Features: Collapsible card with summary display, Dealer and Transport form fields<br/>
          Horizontal gap: 8px (COMPACT_ROW_GUTTER)
        </Text>
        <PlaceNewOrdersOrderDetailsCardTemplate
          title="Order Details"
          collapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          summary={{
            orderType: 'SO',
            warehouse: 'Warehouse 1',
            territory: 'Territory A',
            dealer: 'Dealer One',
            transport: 'Truck-001 - Route A',
          }}
          dealerField={{
            value: orderDetailsForm.getFieldValue('dealer'),
            onChange: (value) => orderDetailsForm.setFieldsValue({ dealer: value }),
            placeholder: 'Dealer',
            options: demoDealers,
            disabled: false,
            removeMSPrefix,
          }}
          transportField={{
            value: orderDetailsForm.getFieldValue('transport'),
            onChange: (value) => orderDetailsForm.setFieldsValue({ transport: value }),
            placeholder: 'Transport',
            options: demoTransports,
            disabled: false,
          }}
          form={orderDetailsForm}
          onFormValuesChange={() => {}}
        />
      </Card>

      {/* PLACE NEW ORDERS SEARCH PRODUCTS CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="TSO > /new-orders > Place New Orders > Search Products">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>PlaceNewOrdersSearchProductsCardTemplate.js</code><br/>
          Used in: Place New Orders page - Search Products card<br/>
          Features: Search input with prefix icon and clear button<br/>
          Horizontal gap: N/A (single input field)
        </Text>
        <PlaceNewOrdersSearchProductsCardTemplate
          title="Search Products"
          searchInput={{
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            placeholder: 'Search products by name or code...',
            onClear: () => setSearchTerm(''),
          }}
        />
      </Card>

      {/* TSO PRODUCT CARDS GRID */}
      <Card {...STANDARD_CARD_CONFIG} title="TSO > /new-orders > Place New Orders > Product Cards Grid">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>NewOrdersTablet.js</code> (inline product cards)<br/>
          Used in: Place New Orders page - Product Cards Grid<br/>
          Features: Responsive grid of product cards with name, code, allocated quota, and quantity display<br/>
          Horizontal gap: N/A (responsive grid layout)
        </Text>
        <div className="responsive-product-grid">
          {demoProducts.map(product => {
            const quantity = product.quantity || 0;
            const allocatedQuota = product.quota;
            
            return (
              <Card
                key={product.id}
                style={{ 
                  borderRadius: '8px',
                  border: quantity > 0 ? '2px solid #52c41a' : '1px solid #f0f0f0',
                  transition: 'all 0.3s',
                  backgroundColor: quantity > 0 ? '#f6ffed' : 'white',
                  cursor: 'pointer'
                }}
                bodyStyle={{ padding: '6px' }}
                onClick={() => showProductPopup(product)}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    color: '#1890ff',
                    marginBottom: '4px'
                  }}>
                    {product.name}
                  </div>
                  <div 
                    className="product-name"
                    style={{ 
                      fontSize: '12px', 
                      color: '#333',
                      marginBottom: '8px',
                      lineHeight: '1.2'
                    }}
                  >
                    {product.product_code}
                  </div>
                  
                  {/* Show allocated quota for TSO users */}
                  {allocatedQuota && (
                    <div style={{ 
                      fontSize: '10px', 
                      color: allocatedQuota.remaining > 0 ? '#722ed1' : '#ff4d4f',
                      fontWeight: 'bold',
                      backgroundColor: allocatedQuota.remaining > 0 ? '#f9f0ff' : '#fff1f0',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      marginBottom: '4px'
                    }}>
                      {allocatedQuota.remaining > 0 ? `Remaining: ${allocatedQuota.remaining}` : 'Out of stock'}
                    </div>
                  )}
                  
                  {/* Show quantity if added */}
                  {quantity > 0 && (
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#52c41a',
                      fontWeight: 'bold',
                      backgroundColor: '#f6ffed',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      marginBottom: '4px'
                    }}>
                      Qty: {quantity}
                    </div>
                  )}
                  
                  {/* Tap hint */}
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#999'
                  }}>
                    Tap to configure
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* REVIEW ORDERS EMPTY ORDER CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="TSO > /review-orders > Review Orders > Empty Order">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>ReviewOrdersEmptyOrderCardTemplate.js</code><br/>
          Used in: Review Orders page - Empty Order card<br/>
          Features: Empty state with description and navigation button<br/>
          Horizontal gap: N/A (empty state)
        </Text>
        <ReviewOrdersEmptyOrderCardTemplate
          button={{
            label: 'Go to New Orders',
            icon: <ArrowLeftOutlined />,
            onClick: () => {},
          }}
        />
      </Card>

      {/* REVIEW ORDERS ORDER FORM CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="TSO > /review-orders > Review Orders > Order Form">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>ReviewOrdersOrderFormCardTemplate.js</code><br/>
          Used in: Review Orders page - Order Form card<br/>
          Features: Disabled Dealer and Transport select fields<br/>
          Horizontal gap: 8px (MINIMAL_ROW_GUTTER)
        </Text>
        <ReviewOrdersOrderFormCardTemplate
          loading={false}
          form={reviewOrderForm}
          dealerField={{
            value: 1,
            options: demoDealers,
            removeMSPrefix,
          }}
          transportField={{
            value: 1,
            options: demoTransports,
          }}
        />
      </Card>

      {/* REVIEW ORDERS ORDER ITEMS CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="TSO > /review-orders > Review Orders > Order Items">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>ReviewOrdersOrderItemsCardTemplate.js</code><br/>
          Used in: Review Orders page - Order Items card<br/>
          Features: List of order items with quantity controls (+/-) and delete buttons<br/>
          Horizontal gap: N/A (item cards)
        </Text>
        <ReviewOrdersOrderItemsCardTemplate
          orderItems={orderItems}
          onQuantityChange={updateOrderItem}
          onDeleteItem={removeOrderItem}
          onClearAll={clearAllItems}
        />
      </Card>

      {/* REVIEW ORDERS ORDER SUMMARY CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="TSO > /review-orders > Review Orders > Order Summary">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>ReviewOrdersOrderSummaryCardTemplate.js</code><br/>
          Used in: Review Orders page - Order Summary card<br/>
          Features: Order summary text and 3 action buttons (Cancel, Add More, Submit)<br/>
          Horizontal gap: 8px (TIGHT_VERTICAL_ROW_GUTTER)
        </Text>
        <ReviewOrdersOrderSummaryCardTemplate
          itemCount={orderItems.length}
          totalQuantity={totalQuantity}
          cancelButton={{
            label: 'Cancel Order',
            onClick: () => {},
          }}
          addMoreButton={{
            label: 'Add More',
            icon: <PlusOutlined />,
            onClick: () => {},
          }}
          submitButton={{
            label: 'Submit',
            icon: <CheckOutlined />,
            onClick: () => {},
            loading: false,
          }}
        />
      </Card>

      {/* TSO REPORT MY ORDER REPORTS CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="TSO > /my-reports > My Order Reports">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>TSOReportMyOrderReportsCardTemplate.js</code><br/>
          Used in: TSO Report page - My Order Reports card<br/>
          Features: Start Date and End Date (optional) pickers, 2 buttons (Preview Orders/Range Orders, Download Daily Order Report/Order Summary)<br/>
          Horizontal gap: 12px (COMPACT_ROW_GUTTER)<br/>
          Logic: If only start date is selected, shows single date report. If both dates are selected, shows date range report.
        </Text>
        <TSOReportMyOrderReportsCardTemplate
          title="My Order Reports"
          dateRangePicker={{
            startDate: rangeStart,
            setStartDate: setRangeStart,
            endDate: rangeEnd,
            setEndDate: setRangeEnd,
            disabledDate: () => false,
            dateRender: () => null,
            availableDates: [],
          }}
          buttons={[
            {
              type: 'default',
              icon: <EyeOutlined />,
              label: rangeEnd ? 'Preview Range Orders' : 'Preview Orders',
              onClick: () => {},
              loading: false,
            },
            {
              type: 'primary',
              icon: rangeEnd ? <FileExcelOutlined /> : <DownloadOutlined />,
              label: rangeEnd ? 'Download Order Summary' : 'Download Daily Order Report',
              onClick: () => {},
              loading: false,
            },
          ]}
        />
      </Card>

      {/* PRODUCT CONFIGURATION POPUP MODAL */}
      <Card {...STANDARD_CARD_CONFIG} title="TSO > /new-orders > Place New Orders > Product Configuration Popup Modal">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>NewOrdersTablet.js</code> (inline modal)<br/>
          Used in: Place New Orders page - Product Configuration Popup<br/>
          Features: Modal that opens when clicking a product card, shows quota, quantity controls, quick quantity buttons, and add button<br/>
          Horizontal gap: N/A (modal layout)
        </Text>
        <Button 
          type="primary" 
          onClick={() => showProductPopup(demoProducts[0])}
          style={{ marginBottom: '12px' }}
        >
          Click to Open Product Popup Modal
        </Button>
        <Modal
          {...STANDARD_MODAL_CONFIG}
          title={
            <div style={{ textAlign: 'center', fontSize: '26px', fontWeight: 'bold' }}>
              {selectedProductForPopup?.product_code} - {selectedProductForPopup?.name}
            </div>
          }
          open={isPopupVisible}
          onCancel={hideProductPopup}
          centered
          style={{ top: 20 }}
        >
          {selectedProductForPopup && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {/* Show remaining quota for TSO users */}
              {selectedProductForPopup.quota && (
                <div style={{ 
                  marginBottom: '20px'
                }}>
                  <Tag color={selectedProductForPopup.quota.remaining > 0 ? 'green' : 'red'} style={{ fontSize: '23px', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold' }}>
                    {selectedProductForPopup.quota.remaining > 0 
                      ? `Remaining: ${selectedProductForPopup.quota.remaining} units` 
                      : 'Out of stock'}
                  </Tag>
                </div>
              )}

              {/* Quantity Controls */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<span style={{ fontSize: '28px', fontWeight: 'bold' }}>-</span>}
                  onClick={() => updateProductQuantity(selectedProductForPopup.id, -1)}
                  disabled={productQuantities[selectedProductForPopup.id] === 0}
                  style={{ 
                    width: '50px', 
                    height: '50px',
                    minWidth: '50px',
                    padding: '0'
                  }}
                />
                
                <InputNumber
                  min={0}
                  max={9999}
                  value={productQuantities[selectedProductForPopup.id] > 0 ? productQuantities[selectedProductForPopup.id] : null}
                  onChange={(value) => {
                    const newQty = value || 0;
                    setProductQuantities(prev => ({
                      ...prev,
                      [selectedProductForPopup.id]: newQty
                    }));
                  }}
                  style={{
                    width: '120px',
                    fontSize: '23px',
                    height: '50px',
                    fontWeight: 'bold'
                  }}
                  controls={false}
                  placeholder=""
                />
                
                <Button
                  type="primary"
                  shape="circle"
                  icon={<span style={{ fontSize: '28px', fontWeight: 'bold' }}>+</span>}
                  onClick={() => {
                    updateProductQuantity(selectedProductForPopup.id, 1);
                  }}
                  style={{ 
                    width: '50px', 
                    height: '50px',
                    minWidth: '50px',
                    padding: '0'
                  }}
                />
              </div>
              
              {/* Quick Quantity Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '20px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(quickQty => (
                  <Button
                    key={quickQty}
                    type={productQuantities[selectedProductForPopup.id] === quickQty ? 'primary' : 'default'}
                    onClick={() => {
                      setProductQuantities(prev => ({
                        ...prev,
                        [selectedProductForPopup.id]: quickQty
                      }));
                    }}
                    style={{ fontSize: '23px', height: '50px', padding: '0 24px', fontWeight: 'bold' }}
                  >
                    {quickQty}
                  </Button>
                ))}
              </div>

              {/* Add Button */}
              <Button
                type="primary"
                onClick={() => {
                  hideProductPopup();
                }}
                disabled={productQuantities[selectedProductForPopup.id] === 0}
                style={{
                  width: '100%',
                  fontSize: '23px',
                  height: '50px',
                  fontWeight: 'bold',
                  backgroundColor: productQuantities[selectedProductForPopup.id] > 0 ? '#52c41a' : '#d9d9d9',
                  borderColor: productQuantities[selectedProductForPopup.id] > 0 ? '#52c41a' : '#d9d9d9'
                }}
              >
                {productQuantities[selectedProductForPopup.id] > 0 
                  ? `Add ${productQuantities[selectedProductForPopup.id]} to Order` 
                  : 'Select Quantity First'}
              </Button>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
}

export default TSOTemplateCards;

