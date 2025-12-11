import { useState } from 'react';
import { Form } from 'antd';
import { 
  Card, 
  Typography,
} from 'antd';
import {
  ReloadOutlined,
  ClearOutlined,
  LayoutOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileExcelOutlined,
  SearchOutlined,
  UploadOutlined,
  DeleteOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { 
  STANDARD_CARD_CONFIG, 
  STANDARD_PAGE_TITLE_CONFIG, 
  STANDARD_PAGE_SUBTITLE_CONFIG,
  createStandardDatePickerConfig,
  COMPACT_ROW_GUTTER,
} from '../../templates/UITemplates';
import { OrdersAndDemandsFilterOrdersTemplate } from '../../templates/OrdersAndDemandsFilterOrdersTemplate';
import { QuotaAllocationCardTemplate } from '../../templates/QuotaAllocationCardTemplate';
import { PreviouslyAllocatedQuotasCardTemplate } from '../../templates/PreviouslyAllocatedQuotasCardTemplate';
import { DailyOrderReportCardTemplate } from '../../templates/DailyOrderReportCardTemplate';
import { OrderSummaryReportCardTemplate } from '../../templates/OrderSummaryReportCardTemplate';
import { MonthlyForecastsFilterCardTemplate } from '../../templates/MonthlyForecastsFilterCardTemplate';
import { ForecastsByProductTerritoryFilterCardTemplate } from '../../templates/ForecastsByProductTerritoryFilterCardTemplate';
import { UserManagementActionsCardTemplate } from '../../templates/UserManagementActionsCardTemplate';
import { DealerManagementImportCardTemplate } from '../../templates/DealerManagementImportCardTemplate';
import { ProductManagementImportCardTemplate } from '../../templates/ProductManagementImportCardTemplate';
import { TransportManagementImportCardTemplate } from '../../templates/TransportManagementImportCardTemplate';
import { AdminSettingsCardTemplate } from '../../templates/AdminSettingsCardTemplate';
import '../../App.css';

const { Title, Text } = Typography;

function TemplateCards() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates] = useState([]);
  const { disabledDate, dateCellRender } = createStandardDatePickerConfig(availableDates);
  
  // Demo state for Quota Allocation template
  const [quotaDate, setQuotaDate] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [territoryInput, setTerritoryInput] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedTerritories, setSelectedTerritories] = useState([]);
  const [quotaValue, setQuotaValue] = useState('');
  
  // Demo products and territories
  const demoProducts = [
    { id: 1, name: 'Dimitris', product_code: 'DIM001' },
    { id: 2, name: 'Alpha', product_code: 'ALP001' },
    { id: 3, name: 'Beta', product_code: 'BET001' },
  ];
  const demoTerritories = ['Bari', 'Bagura', 'Dhaka', 'Chittagong'];
  
  const filteredProducts = demoProducts.filter(p => 
    `${p.name} (${p.product_code})`.toLowerCase().includes(productSearch.toLowerCase())
  );
  const filteredTerritories = demoTerritories.filter(t => 
    t.toLowerCase().includes(territoryInput.toLowerCase())
  );

  // Demo state for Admin Settings template
  const [adminForm] = Form.useForm();
  const [adminStartDay] = useState(18);

  return (
    <div>
      <Title {...STANDARD_PAGE_TITLE_CONFIG}>
        <LayoutOutlined /> Template Cards
      </Title>
      <Text {...STANDARD_PAGE_SUBTITLE_CONFIG}>
        Individual template files for specific card layouts. Each card has its own dedicated template file.
      </Text>

      {/* ORDERS & DEMANDS FILTER ORDERS TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="Admin > /placed-orders > Filter Orders">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>OrdersAndDemandsFilterOrdersTemplate.js</code><br/>
          Used in: Orders & Demands page - Filter Orders card<br/>
          Features: 2 date pickers, 4 form fields (Territory field stretches with flex: auto), 2 buttons<br/>
          Horizontal gap: 12px (COMPACT_ROW_GUTTER)
        </Text>
        <OrdersAndDemandsFilterOrdersTemplate
          title="Filter Orders"
          datePicker1={{
            label: 'Start Date',
            value: selectedDate,
            onChange: setSelectedDate,
            placeholder: 'Select start date',
            disabledDate,
            dateCellRender,
          }}
          datePicker2={{
            label: 'End Date (Optional)',
            value: null,
            onChange: () => {},
            placeholder: 'Select end date (optional)',
            disabledDate,
            dateCellRender,
          }}
          formFields={[
            {
              label: 'Order Type',
              type: 'select',
              value: null,
              onChange: () => {},
              placeholder: 'Select Type',
              options: [
                { value: 'tso', label: 'Sales Orders' },
                { value: 'dd', label: 'Daily Demands' },
                { value: 'all', label: 'All Orders' },
              ],
            },
            {
              label: 'Territory',
              type: 'select',
              value: null,
              onChange: () => {},
              placeholder: 'All Territories',
              options: [
                { value: 'territory1', label: 'Territory 1' },
                { value: 'territory2', label: 'Territory 2' },
              ],
              flex: 'auto',
            },
            {
              label: 'Dealer',
              type: 'select',
              value: null,
              onChange: () => {},
              placeholder: 'All Dealers',
              options: [
                { value: 'dealer1', label: 'Dealer 1' },
                { value: 'dealer2', label: 'Dealer 2' },
              ],
            },
            {
              label: 'Product',
              type: 'select',
              value: null,
              onChange: () => {},
              placeholder: 'All Products',
              options: [
                { value: 'product1', label: 'Product 1' },
                { value: 'product2', label: 'Product 2' },
              ],
            },
          ]}
          buttons={[
            {
              label: 'Refresh',
              type: 'default',
              icon: <ReloadOutlined />,
              onClick: () => {},
            },
            {
              label: 'Clear',
              type: 'default',
              icon: <ClearOutlined />,
              onClick: () => {},
            },
          ]}
        />
      </Card>

      {/* QUOTA ALLOCATION TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="Admin > /manage-quotas > Allocate Daily Quotas">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>QuotaAllocationCardTemplate.js</code><br/>
          Used in: Quotas page - Allocate Daily Quotas tab<br/>
          Features: 1 date picker, Products (autocomplete with tags, flex: auto), Territories (autocomplete with tags, md={6}), Quota (input, md={1}), 2 buttons<br/>
          Horizontal gap: 12px (COMPACT_ROW_GUTTER)
        </Text>
        <QuotaAllocationCardTemplate
          title="Allocate Daily Quotas"
          datePicker1={{
            label: 'Date',
            value: quotaDate,
            onChange: setQuotaDate,
            placeholder: 'Select date',
          }}
          formFields={[
            {
              label: 'Products',
              type: 'autocomplete',
              value: productSearch,
              onSearch: setProductSearch,
              onSelect: (value) => {
                const selected = filteredProducts.find(p =>
                  `${p.name} (${p.product_code})` === value
                );
                if (selected && !selectedProducts.find(p => p.id === selected.id)) {
                  setSelectedProducts([...selectedProducts, selected]);
                  setProductSearch('');
                }
              },
              onChange: setProductSearch,
              placeholder: 'Type product name (e.g., dimitris, alpha)',
              options: filteredProducts.map(p => ({
                value: `${p.name} (${p.product_code})`,
                label: `${p.name} (${p.product_code})`
              })),
              allowClear: true,
              enableTagDisplay: true,
              selectedItems: selectedProducts.map(p => ({
                key: p.id,
                label: `${p.name} (${p.product_code})`
              })),
              onRemoveItem: (key) => {
                setSelectedProducts(selectedProducts.filter(p => p.id !== key));
              },
            },
            {
              label: 'Territories',
              type: 'autocomplete',
              value: territoryInput,
              onSearch: setTerritoryInput,
              onSelect: (value) => {
                if (!selectedTerritories.includes(value)) {
                  setSelectedTerritories([...selectedTerritories, value]);
                  setTerritoryInput('');
                }
              },
              onChange: setTerritoryInput,
              placeholder: 'Type territory (e.g., bari, bagura)',
              options: filteredTerritories.map(t => ({
                value: t,
                label: t
              })),
              allowClear: true,
              enableTagDisplay: true,
              selectedItems: selectedTerritories.map(t => ({
                key: t,
                label: t
              })),
              onRemoveItem: (key) => {
                setSelectedTerritories(selectedTerritories.filter(t => t !== key));
              },
            },
            {
              label: 'Quota',
              type: 'input',
              value: quotaValue,
              onChange: (e) => setQuotaValue(e.target.value),
              placeholder: 'Qty',
            },
          ]}
          buttons={[
            {
              label: 'Add',
              type: 'primary',
              icon: <PlusOutlined />,
              onClick: () => {},
              disabled: selectedProducts.length === 0 || selectedTerritories.length === 0 || !quotaValue,
            },
            {
              label: 'Refresh',
              type: 'default',
              icon: <ReloadOutlined />,
              onClick: () => {},
            },
          ]}
          gutter={COMPACT_ROW_GUTTER}
        />
      </Card>

      {/* PREVIOUSLY ALLOCATED QUOTAS TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="Admin > /manage-quotas > Previously Allocated Quotas">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>PreviouslyAllocatedQuotasCardTemplate.js</code><br/>
          Used in: Quotas page - Previously Allocated Quotas tab<br/>
          Features: 1 date picker, 1 button (Refresh)<br/>
          Horizontal gap: 12px (COMPACT_ROW_GUTTER)
        </Text>
        <PreviouslyAllocatedQuotasCardTemplate
          title="Previously Allocated Quotas"
          datePicker1={{
            label: 'Select Date',
            value: selectedDate,
            onChange: setSelectedDate,
            placeholder: 'Select date',
            disabledDate,
            dateCellRender,
          }}
          buttons={[
            {
              label: 'Refresh',
              type: 'default',
              icon: <ReloadOutlined />,
              onClick: () => {},
            },
          ]}
        />
      </Card>

      {/* REPORTS PAGE TEMPLATES */}
      <Card {...STANDARD_CARD_CONFIG} title="Admin > /reports > Daily Order Report">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>DailyOrderReportCardTemplate.js</code><br/>
          Used in: Reports page - Daily Order Report tab<br/>
          Features: 1 date picker, 3 buttons (Preview Orders, Download Daily Order Report, Download MR CSV)<br/>
          Horizontal gap: 12px (COMPACT_ROW_GUTTER)
        </Text>
        <DailyOrderReportCardTemplate
          title="Daily Order Report"
          datePicker1={{
            label: 'Select Date',
            value: selectedDate,
            onChange: setSelectedDate,
            placeholder: 'Select date for report',
            disabledDate,
            dateCellRender,
          }}
          buttons={[
            {
              label: 'Preview Orders',
              type: 'default',
              icon: <EyeOutlined />,
              onClick: () => {},
            },
            {
              label: 'Download Daily Order Report',
              type: 'primary',
              icon: <DownloadOutlined />,
              onClick: () => {},
            },
            {
              label: 'Download MR CSV',
              type: 'default',
              icon: <DownloadOutlined />,
              onClick: () => {},
            },
          ]}
        />
      </Card>

      <Card {...STANDARD_CARD_CONFIG} title="Admin > /reports > Order Summary Report">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>OrderSummaryReportCardTemplate.js</code><br/>
          Used in: Reports page - Order Summary Report tab<br/>
          Features: 2 date pickers (Start Date, End Date), 2 buttons (Preview Range Orders, Download Order Summary)<br/>
          Horizontal gap: 12px (COMPACT_ROW_GUTTER)
        </Text>
        <OrderSummaryReportCardTemplate
          title="Order Summary Report"
          datePicker1={{
            label: 'Start Date',
            value: selectedDate,
            onChange: setSelectedDate,
            placeholder: 'Select start date',
            disabledDate,
            dateCellRender,
          }}
          datePicker2={{
            label: 'End Date',
            value: null,
            onChange: () => {},
            placeholder: 'Select end date',
            disabledDate,
            dateCellRender,
          }}
          buttons={[
            {
              label: 'Preview Range Orders',
              type: 'default',
              icon: <EyeOutlined />,
              onClick: () => {},
            },
            {
              label: 'Download Order Summary',
              type: 'primary',
              icon: <FileExcelOutlined />,
              onClick: () => {},
            },
          ]}
        />
      </Card>

      <Card {...STANDARD_CARD_CONFIG} title="Admin > /reports > Filter Orders (Monthly Forecasts)">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>MonthlyForecastsFilterCardTemplate.js</code><br/>
          Used in: Reports page - Monthly Forecasts tab<br/>
          Features: Period (select, maxWidth: '18rem'), Territory (select, conditional, flex: auto), Dealer (select), Search (input with prefix), 1 button (Export Excel)<br/>
          Horizontal gap: 12px (COMPACT_ROW_GUTTER)
        </Text>
        <MonthlyForecastsFilterCardTemplate
          title="Filter Orders"
          formFields={[
            {
              label: 'Period',
              type: 'select',
              value: null,
              onChange: () => {},
              placeholder: 'Select Period',
              options: [
                { value: 'period1', label: 'Jan 2024 - Feb 2024 (Current)' },
                { value: 'period2', label: 'Dec 2023 - Jan 2024' },
              ],
              allowClear: true,
              showSearch: true,
              maxWidth: '18rem',
            },
            {
              label: 'Territory',
              type: 'select',
              value: null,
              onChange: () => {},
              placeholder: 'All Territories',
              options: [
                { value: 'territory1', label: 'Territory 1' },
                { value: 'territory2', label: 'Territory 2' },
              ],
              allowClear: true,
              showSearch: true,
              flex: 'auto',
            },
            {
              label: 'Dealer',
              type: 'select',
              value: null,
              onChange: () => {},
              placeholder: 'All Dealers',
              options: [
                { value: 'dealer1', label: 'D001 - Dealer 1' },
                { value: 'dealer2', label: 'D002 - Dealer 2' },
              ],
              allowClear: true,
              showSearch: true,
            },
            {
              label: 'Search',
              type: 'input',
              value: '',
              onChange: () => {},
              placeholder: 'Dealer name or code',
              prefix: <SearchOutlined />,
              allowClear: true,
            },
          ]}
          buttons={[
            {
              label: 'Export Excel',
              type: 'primary',
              icon: <DownloadOutlined />,
              onClick: () => {},
            },
          ]}
        />
      </Card>

      <Card {...STANDARD_CARD_CONFIG} title="Admin > /reports > Filter Forecasts (By Product/Territory)">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>ForecastsByProductTerritoryFilterCardTemplate.js</code><br/>
          Used in: Reports page - Forecasts by Product tab and Forecasts by Territory tab<br/>
          Features: Period (select, maxWidth: '18rem'), Territory (select, conditional), Search (input with prefix), 1 button (Export Excel)<br/>
          Horizontal gap: 12px (COMPACT_ROW_GUTTER)
        </Text>
        <ForecastsByProductTerritoryFilterCardTemplate
          title="Filter Forecasts"
          formFields={[
            {
              label: 'Period',
              type: 'select',
              value: null,
              onChange: () => {},
              placeholder: 'Select Period',
              options: [
                { value: 'period1', label: 'Jan 2024 - Feb 2024 (Current)' },
                { value: 'period2', label: 'Dec 2023 - Jan 2024' },
              ],
              allowClear: true,
              showSearch: true,
              maxWidth: '18rem',
            },
            {
              label: 'Territory',
              type: 'select',
              value: null,
              onChange: () => {},
              placeholder: 'All Territories',
              options: [
                { value: 'territory1', label: 'Territory 1' },
                { value: 'territory2', label: 'Territory 2' },
              ],
              allowClear: true,
              showSearch: true,
            },
            {
              label: 'Search',
              type: 'input',
              value: '',
              onChange: () => {},
              placeholder: 'Dealer name or code',
              prefix: <SearchOutlined />,
              allowClear: true,
            },
          ]}
          buttons={[
            {
              label: 'Export Excel',
              type: 'primary',
              icon: <DownloadOutlined />,
              onClick: () => {},
            },
          ]}
        />
      </Card>

      {/* USER MANAGEMENT ACTIONS CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="Admin > /settings > Manage Users > Actions">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>UserManagementActionsCardTemplate.js</code><br/>
          Used in: Settings > Manage Users page - Actions card<br/>
          Features: Action buttons in card extra prop, supports Popconfirm<br/>
          Horizontal gap: N/A (buttons in header)
        </Text>
        <UserManagementActionsCardTemplate
          title="Actions"
          buttons={[
            {
              label: 'Add User',
              type: 'primary',
              icon: <PlusOutlined />,
              onClick: () => {},
            },
            {
              label: 'Delete Selected',
              type: 'default',
              icon: <DeleteOutlined />,
              danger: true,
              disabled: false,
              popconfirm: {
                title: 'Are you sure you want to delete the selected users?',
                onConfirm: () => {},
              },
            },
          ]}
        />
      </Card>

      {/* DEALER MANAGEMENT IMPORT CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="Admin > /settings > Manage Dealers > Import Dealers">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>DealerManagementImportCardTemplate.js</code><br/>
          Used in: Settings > Manage Dealers page - Import Dealers card<br/>
          Features: Upload button and Download Template button in card extra prop<br/>
          Horizontal gap: N/A (buttons in header)
        </Text>
        <DealerManagementImportCardTemplate
          title="Import Dealers"
          uploadButton={{
            label: 'Import Dealers (Excel)',
            icon: <UploadOutlined />,
            onUpload: () => false,
            loading: false,
          }}
          downloadButton={{
            label: 'Download Template',
            icon: <DownloadOutlined />,
            onClick: () => {},
          }}
        />
      </Card>

      {/* PRODUCT MANAGEMENT IMPORT CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="Admin > /settings > Manage Products > Import Products">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>ProductManagementImportCardTemplate.js</code><br/>
          Used in: Settings > Manage Products page - Import Products card<br/>
          Features: Upload button and Download Template button in card extra prop<br/>
          Horizontal gap: N/A (buttons in header)
        </Text>
        <ProductManagementImportCardTemplate
          title="Import Products"
          uploadButton={{
            label: 'Import Products (Excel)',
            icon: <UploadOutlined />,
            onUpload: () => false,
            loading: false,
          }}
          downloadButton={{
            label: 'Download Template',
            icon: <DownloadOutlined />,
            onClick: () => {},
          }}
        />
      </Card>

      {/* TRANSPORT MANAGEMENT IMPORT CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="Admin > /settings > Manage Transports > Import Transports">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>TransportManagementImportCardTemplate.js</code><br/>
          Used in: Settings > Manage Transports page - Import Transports card<br/>
          Features: Upload button and Download Template button in card extra prop<br/>
          Horizontal gap: N/A (buttons in header)
        </Text>
        <TransportManagementImportCardTemplate
          title="Import Transports"
          uploadButton={{
            label: 'Import Transports (Excel)',
            icon: <UploadOutlined />,
            onUpload: () => false,
            loading: false,
          }}
          downloadButton={{
            label: 'Download Template',
            icon: <DownloadOutlined />,
            onClick: () => {},
          }}
        />
      </Card>

      {/* ADMIN SETTINGS CARD TEMPLATE */}
      <Card {...STANDARD_CARD_CONFIG} title="Admin > /settings > Admin Settings > Monthly Forecast Period Settings">
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>
          File: <code>AdminSettingsCardTemplate.js</code><br/>
          Used in: Settings > Admin Settings page - Monthly Forecast Period Settings card<br/>
          Features: InputNumber field, Tag preview, Text description, Save button<br/>
          Horizontal gap: 16px (STANDARD_ROW_GUTTER)
        </Text>
        <AdminSettingsCardTemplate
          title="Monthly Forecast Period Settings"
          startDayField={{
            value: adminStartDay,
            onChange: () => {},
            disabled: false,
          }}
          currentPeriod={{
            start: '2025-01-18',
            end: '2025-02-17',
          }}
          startDay={adminStartDay}
          saveButton={{
            label: 'Save Settings',
            icon: <SaveOutlined />,
            loading: false,
          }}
          onFormFinish={() => {}}
          form={adminForm}
        />
      </Card>

    </div>
  );
}

export default TemplateCards;

