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

