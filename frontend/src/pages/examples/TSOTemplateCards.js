import { useState } from 'react';
import { 
  Card, 
  Typography,
  Form,
  Select,
  Button,
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
} from '../../templates/UITemplates';
import { PlaceNewOrdersOrderDetailsCardTemplate } from '../../templates/PlaceNewOrdersOrderDetailsCardTemplate';
import { PlaceNewOrdersSearchProductsCardTemplate } from '../../templates/PlaceNewOrdersSearchProductsCardTemplate';
import { ReviewOrdersEmptyOrderCardTemplate } from '../../templates/ReviewOrdersEmptyOrderCardTemplate';
import { ReviewOrdersOrderFormCardTemplate } from '../../templates/ReviewOrdersOrderFormCardTemplate';
import { ReviewOrdersOrderItemsCardTemplate } from '../../templates/ReviewOrdersOrderItemsCardTemplate';
import { ReviewOrdersOrderSummaryCardTemplate } from '../../templates/ReviewOrdersOrderSummaryCardTemplate';
import { TSOReportDailyReportCardTemplate } from '../../templates/TSOReportDailyReportCardTemplate';
import { TSOReportOrderSummaryCardTemplate } from '../../templates/TSOReportOrderSummaryCardTemplate';
import '../../App.css';

const { Title, Text } = Typography;
const { Option } = Select;

function TSOTemplateCards() {
  const [orderDetailsForm] = Form.useForm();
  const [reviewOrderForm] = Form.useForm();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [rangeStart, setRangeStart] = useState(dayjs());
  const [rangeEnd, setRangeEnd] = useState(dayjs().add(7, 'day'));
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

      {/* TSO REPORT DAILY REPORT CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="TSO > /my-reports > My Order Reports > Daily Report (Single Date)">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>TSOReportDailyReportCardTemplate.js</code><br/>
          Used in: TSO Report page - Daily Report (Single Date) card<br/>
          Features: Date picker and 2 buttons (Preview Orders, Download Daily Order Report)<br/>
          Horizontal gap: 16px (STANDARD_ROW_GUTTER)
        </Text>
        <TSOReportDailyReportCardTemplate
          datePicker={{
            value: selectedDate,
            onChange: setSelectedDate,
            placeholder: 'Select date for report',
            disabledDate: () => false,
            dateRender: () => null,
          }}
          buttons={[
            {
              type: 'default',
              icon: <EyeOutlined />,
              label: 'Preview Orders',
              onClick: () => {},
              loading: false,
            },
            {
              type: 'primary',
              icon: <DownloadOutlined />,
              label: 'Download Daily Order Report',
              onClick: () => {},
              loading: false,
            },
          ]}
        />
      </Card>

      {/* TSO REPORT ORDER SUMMARY CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="TSO > /my-reports > My Order Reports > Order Summary (Date Range)">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>TSOReportOrderSummaryCardTemplate.js</code><br/>
          Used in: TSO Report page - Order Summary (Date Range) card<br/>
          Features: Date range picker and 2 buttons (Preview Range Orders, Download Order Summary)<br/>
          Horizontal gap: 16px (STANDARD_ROW_GUTTER)
        </Text>
        <TSOReportOrderSummaryCardTemplate
          dateRangePicker={{
            startDate: rangeStart,
            setStartDate: setRangeStart,
            endDate: rangeEnd,
            setEndDate: setRangeEnd,
            disabledDate: () => false,
            dateRender: () => null,
            availableDates: [],
            colSpan: { xs: 24, sm: 12, md: 2 },
          }}
          buttons={[
            {
              type: 'default',
              icon: <EyeOutlined />,
              label: 'Preview Range Orders',
              onClick: () => {},
              loading: false,
            },
            {
              type: 'primary',
              icon: <FileExcelOutlined />,
              label: 'Download Order Summary',
              onClick: () => {},
              loading: false,
            },
          ]}
        />
      </Card>
    </div>
  );
}

export default TSOTemplateCards;

