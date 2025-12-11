/**
 * API Type Definitions
 * 
 * Centralized type definitions for all API responses and request payloads.
 * This ensures type safety when working with API data throughout the application.
 */

// ============================================================================
// Common Types
// ============================================================================

export type OrderType = 'SO' | 'DD';
export type OrderSource = 'tso' | 'dealer';
export type OrderStatus = 'new' | 'pending' | 'completed' | 'cancelled';

// ============================================================================
// Product Types
// ============================================================================

export interface Product {
  id: number;
  product_code: string;
  name: string;
  unit_tp?: number;
  mrp?: number;
  unit_trade_price?: number;
  application_name?: string;
  category?: string;
}

export interface ProductSummary {
  product_code: string;
  product_name: string;
  quantity: number;
  total_quantity?: number;
}

// ============================================================================
// Dealer Types
// ============================================================================

export interface Dealer {
  id: number;
  dealer_code: string;
  name: string;
  territory_name: string;
  territory_id?: number;
}

export interface DealerOption {
  id: number;
  code: string;
  name: string;
  territory: string;
}

// ============================================================================
// Order Item Types
// ============================================================================

export interface OrderItem {
  id?: number;
  order_id: string;
  product_id: number;
  product_code: string;
  product_name: string;
  quantity: number;
  unit_tp?: number;
  mrp?: number;
  unit_trade_price?: number;
  application_name?: string;
}

// ============================================================================
// Order Types
// ============================================================================

export interface Order {
  id: number;
  order_id: string;
  dealer_id: number;
  dealer_name: string;
  dealer_territory: string;
  territory_id?: number;
  territory_name?: string;
  warehouse_id?: number;
  warehouse_name?: string;
  transport_id?: number;
  transport_name?: string;
  transport_names?: string[];
  user_id?: number;
  user_name?: string;
  order_date: string;
  order_type: OrderType;
  order_type_name: OrderType;
  order_source: OrderSource;
  total_quantity: number;
  item_count: number;
  quantity?: number;
  status?: OrderStatus;
  items?: OrderItem[];
  product_name?: string;
  distinct_products?: number;
  product_summaries?: ProductSummary[];
  order_count?: number;
}

// ============================================================================
// Forecast Types
// ============================================================================

export interface ForecastProduct {
  product_code: string;
  product_name: string;
  quantity: number;
}

export interface Forecast {
  dealer_id: number;
  dealer_code: string;
  dealer_name: string;
  territory_name: string;
  products: ForecastProduct[];
  total_products: number;
  total_quantity: number;
}

export interface ForecastResponse {
  period_start: string;
  period_end: string;
  forecasts: Forecast[];
}

// ============================================================================
// API Response Types
// ============================================================================

export interface OrdersResponse {
  orders: Order[];
  total_orders?: number;
  total_items?: number;
  date?: string;
  message?: string;
}

export interface OrdersByDateResponse {
  orders: Order[];
  date: string;
  total_orders: number;
  total_items: number;
}

export interface OrdersRangeResponse {
  orders: Order[];
  total_dealers: number;
  total_quantity: number;
  total_value: number;
  total_original_orders: number;
}

export interface AvailableDatesResponse {
  dates: string[];
}

// ============================================================================
// Period Types
// ============================================================================

export interface Period {
  period_start: string;
  period_end: string;
  is_current?: boolean;
  has_forecast?: boolean;
  label?: string;
  value?: string; // Format: "period_start_period_end"
}

// ============================================================================
// Territory Types
// ============================================================================

export interface Territory {
  id: number;
  name: string;
  territory_name: string;
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  territory_name?: string;
}

// ============================================================================
// Transport Types
// ============================================================================

export interface Transport {
  id: number;
  name: string;
  transport_name: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

