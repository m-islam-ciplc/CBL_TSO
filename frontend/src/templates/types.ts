/**
 * TypeScript type definitions for template props
 * This file contains all the type definitions for template components
 */

import type { ReactNode } from 'react';
import dayjs from 'dayjs';

type Dayjs = ReturnType<typeof dayjs>;

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

