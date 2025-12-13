/**
 * TypeScript type definitions for template props
 * This file contains all the type definitions for template components
 */

import type { ReactNode } from 'react';
import type { Dayjs } from 'dayjs';

// ============================================================================
// Common Types
// ============================================================================

export type ButtonType = 'default' | 'primary' | 'dashed' | 'link' | 'text';
export type TagColor = 'green' | 'blue' | 'default' | 'red' | 'orange' | 'purple';

// ============================================================================
// Date Range Picker Types
// ============================================================================

export interface DateRangePickerConfig {
  startDate: Dayjs | null;
  setStartDate: (date: Dayjs | null) => void;
  endDate: Dayjs | null;
  setEndDate: (date: Dayjs | null) => void;
  disabledDate?: (current: Dayjs) => boolean;
  dateRender?: (current: Dayjs) => ReactNode;
  availableDates?: string[];
  colSpan?: {
    xs?: number;
    sm?: number;
    md?: number;
    flex?: number | string;
    style?: React.CSSProperties;
  };
}

// ============================================================================
// Button Configuration Types
// ============================================================================

export interface ButtonConfig {
  type?: ButtonType;
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

// ============================================================================
// Period Types
// ============================================================================

export interface PeriodOption {
  period_start: string;
  period_end: string;
  is_current: boolean;
  has_forecast: boolean;
  label?: string;
}

export interface PeriodSelectConfig {
  value?: string; // Format: "period_start_period_end"
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  options?: PeriodOption[];
  formatLabel?: (period: PeriodOption) => string;
}

export interface PeriodInfo {
  isCurrent: boolean;
  start: string;
  end: string;
}

// ============================================================================
// Template Props Types
// ============================================================================

export interface DealerReportsViewOrdersCardTemplateProps {
  title?: string;
  dateRangePicker?: DateRangePickerConfig;
  buttons?: (ButtonConfig | null)[];
}

export interface MonthlyForecastSelectPeriodCardTemplateProps {
  title?: string;
  periodSelect?: PeriodSelectConfig;
  periodInfo?: PeriodInfo;
}

// ============================================================================
// Form Field Types
// ============================================================================

export interface FormFieldOption {
  value: string | number;
  label: string;
}

export interface FormFieldConfig {
  label: string;
  type: 'input' | 'select';
  value?: string | number | null;
  onChange: (value: any) => void;
  placeholder?: string;
  options?: FormFieldOption[];
  prefix?: ReactNode;
  allowClear?: boolean;
  showSearch?: boolean;
  loading?: boolean;
  disabled?: boolean;
  maxWidth?: string;
  flex?: string | number | 'auto';
  onPressEnter?: () => void;
}

// ============================================================================
// Table Template Types
// ============================================================================

export interface ProductDetail {
  id?: number;
  product_code?: string;
  product_name?: string;
  name?: string;
  quantity: number;
  unit_tp?: number;
}

export interface RenderProductDetailsStackProps {
  products?: ProductDetail[];
  showPrice?: boolean;
  isTSO?: boolean;
  showIndex?: boolean;
  showCode?: boolean;
}

// ============================================================================
// Monthly Forecasts Filter Template Types
// ============================================================================

export interface MonthlyForecastsFilterCardTemplateProps {
  title?: string;
  formFields?: (FormFieldConfig | null)[];
  buttons?: (ButtonConfig | null)[];
  gutter?: [number, number] | number;
}

// ============================================================================
// Date Picker Types
// ============================================================================

export interface DatePickerConfig {
  label?: string;
  value: Dayjs | null;
  onChange: (date: Dayjs | null) => void;
  placeholder?: string;
  disabledDate?: (current: Dayjs) => boolean;
  dateRender?: (current: Dayjs) => ReactNode;
}

// ============================================================================
// Daily Order Report Template Types
// ============================================================================

export interface DailyOrderReportCardTemplateProps {
  title?: string;
  datePicker1?: DatePickerConfig;
  orderTypeFilter?: {
    value: 'tso' | 'dd' | 'all';
    onChange: (value: 'tso' | 'dd' | 'all') => void;
  };
  buttons?: (ButtonConfig | null)[];
  gutter?: [number, number] | number;
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationConfig {
  current?: number;
  pageSize: number;
  total?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
  pageSizeOptions?: string[];
  defaultPageSize?: number;
}

export interface UseStandardPaginationReturn {
  pagination: PaginationConfig;
  setPagination: (pagination: PaginationConfig) => void;
  handleTableChange: (newPagination: PaginationConfig) => void;
}

// ============================================================================
// Order Summary Report Template Types
// ============================================================================

export interface OrderSummaryReportCardTemplateProps {
  title?: string;
  datePicker1?: DatePickerConfig;
  datePicker2?: DatePickerConfig;
  buttons?: (ButtonConfig | null)[];
  gutter?: [number, number] | number;
}

// ============================================================================
// Orders and Demands Filter Template Types
// ============================================================================

export interface AutoCompleteOption {
  value: string | number;
  label: string;
}

export interface TagItem {
  key: string | number;
  label: string;
}

export interface FormSelectField extends FormFieldConfig {
  type: 'select';
  options?: FormFieldOption[];
  enableTagDisplay?: boolean;
  selectedItems?: TagItem[];
  onRemoveItem?: (key: string | number) => void;
}

export interface FormInputField extends FormFieldConfig {
  type: 'input';
  prefix?: ReactNode;
  onPressEnter?: () => void;
}

export interface FormAutoCompleteField extends Omit<FormFieldConfig, 'type'> {
  type: 'autocomplete';
  onSearch?: (value: string) => void;
  onSelect?: (value: string | number, option: AutoCompleteOption) => void;
  options?: AutoCompleteOption[];
  enableTagDisplay?: boolean;
  selectedItems?: TagItem[];
  onRemoveItem?: (key: string | number) => void;
}

export type FormField = FormSelectField | FormInputField | FormAutoCompleteField;

export interface OrdersAndDemandsFilterOrdersTemplateProps {
  title?: string;
  datePicker1?: DatePickerConfig;
  datePicker2?: DatePickerConfig;
  formFields?: (FormField | null)[];
  buttons?: (ButtonConfig | null)[];
  gutter?: [number, number] | number;
}

// ============================================================================
// Cascading Filters Hook Types
// ============================================================================

export interface FilterConfig<T = any> {
  name: string;
  allOptions: T[];
  dependsOn?: string[];
  filterFn?: (item: T, parentValues: Record<string, any>, context?: any) => boolean;
  getValueKey?: (item: T) => any;
}

export interface UseCascadingFiltersConfig {
  filterConfigs: FilterConfig[];
  filterValues: Record<string, any>;
  setFilterValues: Record<string, (value: any) => void>;
  context?: Record<string, any>;
}

export interface UseCascadingFiltersReturn {
  filteredOptions: Record<string, any[]>;
  clearFilters: (defaultValues?: Record<string, any>) => void;
}

// ============================================================================
// Dealer Product Card Types
// ============================================================================

export interface Product {
  id: number | string;
  name: string;
  product_code: string;
  unit_tp?: number;
}

export interface DealerProductCardProps {
  product: Product;
  quantity?: number | null;
  onQuantityChange: (productId: number | string, value: number | null) => void;
  onClear?: (productId: number | string) => void;
  canEdit?: boolean;
  labelText?: string;
  presetValues?: number[];
  showClearButton?: boolean;
  cardStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}

// ============================================================================
// Quota Allocation Template Types
// ============================================================================

export interface QuotaAllocationCardTemplateProps {
  title?: string;
  datePicker1?: DatePickerConfig;
  formFields?: (FormAutoCompleteField | FormInputField | null)[];
  buttons?: (ButtonConfig | null)[];
  gutter?: [number, number] | number;
}

// ============================================================================
// Previously Allocated Quotas Template Types
// ============================================================================

export interface PreviouslyAllocatedQuotasCardTemplateProps {
  title?: string;
  datePicker1?: DatePickerConfig;
  buttons?: (ButtonConfig | null)[];
  gutter?: [number, number] | number;
}

// ============================================================================
// Forecasts By Product/Territory Filter Template Types
// ============================================================================

export interface ForecastsByProductTerritoryFilterCardTemplateProps {
  title?: string;
  formFields?: (FormSelectField | FormInputField | null)[];
  buttons?: (ButtonConfig | null)[];
  gutter?: [number, number] | number;
}

// ============================================================================
// User Management Actions Template Types
// ============================================================================

export interface PopconfirmConfig {
  title: string;
  onConfirm: () => void;
}

export interface UserManagementButtonConfig extends ButtonConfig {
  popconfirm?: PopconfirmConfig;
  danger?: boolean;
}

export interface UserManagementActionsCardTemplateProps {
  title?: string;
  buttons?: (UserManagementButtonConfig | null)[];
}

// ============================================================================
// Admin Settings Template Types
// ============================================================================

export interface StartDayFieldConfig {
  value?: number;
  onChange?: (value: number | null) => void;
  disabled?: boolean;
}

export interface CurrentPeriodConfig {
  start: string;
  end: string;
}

export interface AdminSettingsSaveButtonConfig {
  label?: string;
  icon?: ReactNode;
  onClick?: () => void;
  loading?: boolean;
}

export interface AdminSettingsCardTemplateProps {
  title?: string;
  startDayField?: StartDayFieldConfig;
  currentPeriod?: CurrentPeriodConfig;
  startDay?: number;
  saveButton?: AdminSettingsSaveButtonConfig;
  onFormFinish?: (values: { start_day: number }) => void;
  form: any; // Ant Design Form instance
}

// ============================================================================
// Import Card Template Types (Dealers/Products/Transports)
// ============================================================================

export interface UploadButtonConfig {
  label?: string;
  icon?: ReactNode;
  onUpload: (file: File) => boolean | void | Promise<boolean | void>;
  loading?: boolean;
}

export interface DownloadButtonConfig {
  label?: string;
  icon?: ReactNode;
  onClick: () => void;
}

export interface ImportCardTemplateProps {
  title?: string;
  uploadButton?: UploadButtonConfig;
  downloadButton?: DownloadButtonConfig;
}

// ============================================================================
// Monthly Forecast Templates
// ============================================================================

export type ForecastWarningType = 'warning' | 'info';

export interface MonthlyForecastWarningCardTemplateProps {
  type?: ForecastWarningType;
  message?: ReactNode | string;
  icon?: ReactNode;
}

export interface MonthlyForecastFooterActionsCardTemplateProps {
  resetButton?: ButtonConfig | null;
  saveButton?: (ButtonConfig & { loading?: boolean }) | null;
}

export interface MonthlyForecastProductsCardTemplateProps {
  products?: Product[];
  forecastData?: Record<string | number, number>;
  onQuantityChange: (productId: string | number, value: number | null) => void;
  onClearProduct?: (productId: string | number) => void;
  canEdit?: boolean;
  labelText?: string;
  presetValues?: number[];
  loading?: boolean;
  resetButton?: ButtonConfig | null;
  saveButton?: (ButtonConfig & { icon?: ReactNode; loading?: boolean }) | null;
  getTotalItems?: () => number;
}

// ============================================================================
// Place New Orders Template Types
// ============================================================================

export interface DealerOption {
  id: number | string;
  name: string;
}

export interface TransportOption {
  id: number | string;
  truck_details: string;
}

export interface OrderDetailsSummary {
  orderType?: string;
  warehouse?: string;
  territory?: string;
  dealer?: string;
  transport?: string;
}

export interface DealerFieldConfig {
  value?: number | string | null;
  onChange: (value: number | string | null) => void;
  placeholder?: string;
  options?: DealerOption[];
  disabled?: boolean;
  removeMSPrefix?: (name: string) => string;
}

export interface TransportFieldConfig {
  value?: number | string | null;
  onChange: (value: number | string | null) => void;
  placeholder?: string;
  options?: TransportOption[];
  disabled?: boolean;
}

export interface PlaceNewOrdersOrderDetailsCardTemplateProps {
  title?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  summary?: OrderDetailsSummary;
  dealerField?: DealerFieldConfig;
  transportField?: TransportFieldConfig;
  form: any; // Ant Design Form instance
  onFormValuesChange?: (changedValues: any, allValues: any) => void;
}

export interface SearchInputConfig {
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onClear?: () => void;
}

export interface PlaceNewOrdersSearchProductsCardTemplateProps {
  title?: string;
  searchInput?: SearchInputConfig;
}

// ============================================================================
// Review Orders Template Types
// ============================================================================

export interface ReviewOrdersEmptyOrderCardTemplateProps {
  title?: string;
  description?: string;
  button?: ButtonConfig;
}

export interface ReviewOrdersOrderFormCardTemplateProps {
  loading?: boolean;
  loadingText?: string;
  dealerField?: {
    value?: number | string | null;
    options?: DealerOption[];
    removeMSPrefix?: (name: string) => string;
  };
  transportField?: {
    value?: number | string | null;
    options?: TransportOption[];
  };
  form: any; // Ant Design Form instance
}

export interface ReviewOrdersOrderSummaryCardTemplateProps {
  itemCount?: number;
  totalQuantity?: number;
  cancelButton?: ButtonConfig;
  addMoreButton?: ButtonConfig;
  submitButton?: ButtonConfig & { loading?: boolean; disabled?: boolean };
}

export interface OrderItem {
  id: number | string;
  product_name: string;
  quantity: number;
}

export interface ReviewOrdersOrderItemsCardTemplateProps {
  orderItems?: OrderItem[];
  onQuantityChange?: (itemId: number | string, newQuantity: number) => void;
  onDeleteItem?: (itemId: number | string) => void;
  onClearAll?: () => void;
}

// ============================================================================
// Daily Demand Template Types
// ============================================================================

export interface DailyDemandDealerInformationCardTemplateProps {
  title?: string;
  dealerInfo?: {
    name: string;
  };
  territory?: string;
}

export interface DailyDemandOrderDetailsCardTemplateProps {
  orderType?: string;
  territory?: string;
  form?: any; // Ant Design Form instance (optional)
}

export interface DailyDemandProductSearchCardTemplateProps {
  searchInput?: SearchInputConfig;
}

export interface QuickDateButtonConfig {
  label: string;
  onClick: () => void;
}

export interface DailyDemandMultiDayAddDatesCardTemplateProps {
  title?: string;
  quickDateButtons?: QuickDateButtonConfig[];
  datePicker?: {
    value?: Dayjs | null;
    onChange: (date: Dayjs | null) => void;
    placeholder?: string;
    disabledDate?: (current: Dayjs) => boolean;
  };
}

export interface DailyDemandMultiDaySelectProductsCardTemplateProps {
  selectedDates?: Dayjs[];
  activeDateTab?: string;
  setActiveDateTab?: (key: string) => void;
  removeDate?: (dateKey: string) => void;
  searchTerm?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredProducts?: Product[];
  quantities?: Record<string, number>;
  onQuantityChange?: (dateStr: string, productId: number | string, value: number | null) => void;
  onClearProduct?: (dateStr: string, productId: number | string) => void;
  presetValues?: number[];
  getTotalItems?: () => number;
  onSubmit?: () => void;
  loading?: boolean;
}

// ============================================================================
// TSO Report Template Types
// ============================================================================

export interface TSOReportMyOrderReportsCardTemplateProps {
  title?: string;
  dateRangePicker?: DateRangePickerConfig;
  buttons?: (ButtonConfig | null)[];
}

// ============================================================================
// Dealer Reports Period Selector Template Types
// ============================================================================

export interface DealerReportsPeriodOption {
  value?: string;
  period_start: string;
  period_end: string;
  label: string;
  is_current?: boolean;
}

export interface DealerReportsPeriodSelectorCardTemplateProps {
  periodSelect?: {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    options?: DealerReportsPeriodOption[];
  };
}

