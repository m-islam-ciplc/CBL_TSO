/**
 * STANDARD CARD TEMPLATES
 * 
 * Standard card configurations and patterns for consistent card styling across the application.
 * 
 * All cards MUST follow these standard patterns for consistency.
 */

import { Card } from 'antd';

/**
 * STANDARD CARD PATTERNS
 */

/**
 * STANDARD CARD CONFIGURATION
 * 
 * Standard card configuration used throughout the application.
 * NO VARIATIONS ALLOWED - all cards must use this exact configuration.
 * 
 * Standard Configuration:
 * - Style: { marginBottom: '16px', borderRadius: '8px', background: '#f9f0ff' } (light lavender background)
 * - Body style: { padding: '12px' } (compact padding for forms/filters)
 * 
 * Usage:
 * - ALWAYS use with title: <Card title="Card Title" {...STANDARD_CARD_CONFIG}>
 * - NO style or bodyStyle overrides allowed
 * - NO variations in padding, margin, or border radius
 * 
 * Examples:
 * - PlacedOrders.js: Filter Orders card
 * - DealerReports.js: View Orders card
 * - DealerManagement.js: Filter Dealers card
 * - ProductManagement.js: Filter Products card
 */
export const STANDARD_CARD_CONFIG = {
  style: {
    marginBottom: '16px',
    borderRadius: '8px',
  },
  bodyStyle: {
    padding: '12px',
  },
};

/**
 * FILTER CARD CONFIGURATION
 * 
 * Standard configuration for filter/search cards only.
 * Includes light lavender background (#f9f0ff) to distinguish filter cards from other cards.
 * NO VARIATIONS ALLOWED - all filter cards must use this exact configuration.
 * 
 * Standard Configuration:
 * - Style: { marginBottom: '16px', borderRadius: '8px', background: '#f9f0ff' } (light lavender background)
 * - Body style: { padding: '12px' } (compact padding for forms/filters)
 * 
 * Usage:
 * - ALWAYS use with title: <Card title="Filter Title" {...FILTER_CARD_CONFIG}>
 * - NO style or bodyStyle overrides allowed
 * - NO variations in padding, margin, border radius, or background color
 * - Use ONLY for filter/search cards
 * 
 * Examples:
 * - PlacedOrders.js: Filter Orders card
 * - DealerManagement.js: Filter Dealers card
 * - ProductManagement.js: Filter Products card
 */
export const FILTER_CARD_CONFIG = {
  style: {
    marginBottom: '16px',
    borderRadius: '8px',
    background: '#f9f0ff',
  },
  bodyStyle: {
    padding: '12px',
  },
};


/**
 * DATE SELECTION CARD CONFIGURATION
 * 
 * Standard configuration for date selection/viewing cards only.
 * Includes blue-grey background (#e6f0ff) to distinguish date selection cards from other cards.
 * NO VARIATIONS ALLOWED - all date selection cards must use this exact configuration.
 * 
 * Standard Configuration:
 * - Style: { marginBottom: '16px', borderRadius: '8px', background: '#e6f0ff' } (blue-grey background)
 * - Body style: { padding: '12px' } (compact padding for forms/filters)
 * 
 * Usage:
 * - ALWAYS use with title: <Card title="Card Title" {...DATE_SELECTION_CARD_CONFIG}>
 * - NO style or bodyStyle overrides allowed
 * - NO variations in padding, margin, border radius, or background color
 * - Use ONLY for date selection/viewing cards
 * 
 * Examples:
 * - ProductQuotaManagement.js: Previously Allocated Quotas card
 */
export const DATE_SELECTION_CARD_CONFIG = {
  style: {
    marginBottom: '16px',
    borderRadius: '8px',
    background: '#e6f0ff',
  },
  bodyStyle: {
    padding: '12px',
  },
};

/**
 * FORM CARD CONFIGURATION
 * 
 * Standard configuration for form/input cards only.
 * Includes honeydew background (#f0fff4) to distinguish form cards from other cards.
 * NO VARIATIONS ALLOWED - all form cards must use this exact configuration.
 * 
 * Standard Configuration:
 * - Style: { marginBottom: '16px', borderRadius: '8px', background: '#f0fff4' } (honeydew background)
 * - Body style: { padding: '12px' } (compact padding for forms/filters)
 * 
 * Usage:
 * - ALWAYS use with title: <Card title="Card Title" {...FORM_CARD_CONFIG}>
 * - NO style or bodyStyle overrides allowed
 * - NO variations in padding, margin, border radius, or background color
 * - Use ONLY for form/input cards
 * 
 * Examples:
 * - ProductQuotaManagement.js: Allocate Daily Quotas card
 */
export const FORM_CARD_CONFIG = {
  style: {
    marginBottom: '16px',
    borderRadius: '8px',
    background: '#f0fff4',
  },
  bodyStyle: {
    padding: '12px',
  },
};

/**
 * IMPORT CARD CONFIGURATION
 * 
 * Standard configuration for import/upload section cards only.
 * Includes light cream background (#fefce8) to distinguish import cards from other cards.
 * NO VARIATIONS ALLOWED - all import cards must use this exact configuration.
 * 
 * Standard Configuration:
 * - Style: { marginBottom: '16px', borderRadius: '8px', background: '#fefce8' } (light cream background)
 * - Body style: { padding: '12px' } (compact padding for forms/filters)
 * 
 * Usage:
 * - ALWAYS use with title: <Card title="Card Title" {...IMPORT_CARD_CONFIG}>
 * - NO style or bodyStyle overrides allowed
 * - NO variations in padding, margin, border radius, or background color
 * - Use ONLY for import/upload section cards
 * 
 * Examples:
 * - DealerManagement.js: Import Dealers card
 * - TransportManagement.js: Import Transports card
 */
export const IMPORT_CARD_CONFIG = {
  style: {
    marginBottom: '16px',
    borderRadius: '8px',
    background: '#fefce8',
  },
  bodyStyle: {
    padding: '12px',
  },
};

/**
 * ACTION CARD CONFIGURATION
 * 
 * Standard configuration for action button cards only.
 * Includes light sky blue background (#f0f9ff) to distinguish action cards from other cards.
 * NO VARIATIONS ALLOWED - all action cards must use this exact configuration.
 * 
 * Standard Configuration:
 * - Style: { marginBottom: '16px', borderRadius: '8px', background: '#f0f9ff' } (light sky blue background)
 * - Body style: { padding: '12px' } (compact padding for forms/filters)
 * 
 * Usage:
 * - ALWAYS use with title: <Card title="Card Title" {...ACTION_CARD_CONFIG}>
 * - NO style or bodyStyle overrides allowed
 * - NO variations in padding, margin, border radius, or background color
 * - Use ONLY for action button cards (Add, Edit, Delete buttons that open modals)
 * 
 * Examples:
 * - UserManagement.js: Actions card
 */
export const ACTION_CARD_CONFIG = {
  style: {
    marginBottom: '16px',
    borderRadius: '8px',
    background: '#f0f9ff',
  },
  bodyStyle: {
    padding: '12px',
  },
};

/**
 * @deprecated Use STANDARD_CARD_CONFIG instead. Kept for backward compatibility.
 */
export const CONTENT_CARD_CONFIG = STANDARD_CARD_CONFIG;

/**
 * TABLE CARD CONFIGURATION
 * 
 * Standard configuration for table cards only.
 * Includes light indigo background (#f0f0ff) to distinguish table cards from other cards.
 * NO VARIATIONS ALLOWED - all table cards must use this exact configuration.
 * 
 * Standard Configuration:
 * - Style: { borderRadius: '8px', background: '#f0f0ff' } (light indigo background)
 * - Body style: { padding: '12px' } (uniform padding with other cards)
 * - No marginBottom (tables usually don't need spacing below)
 * - Table headers should use light grey background
 * 
 * Usage:
 * - Can be used with or without title: <Card {...TABLE_CARD_CONFIG}>
 * - NO style or bodyStyle overrides allowed
 * - NO variations in padding, border radius, or background color
 * - Use ONLY for table cards
 * 
 * Examples:
 * - ProductManagement.js: Products Table card
 * - UserManagement.js: Users Table card
 * - TransportManagement.js: Transports Table card
 */
export const TABLE_CARD_CONFIG = {
  style: {
    borderRadius: '8px',
    background: '#f0f0ff',
  },
  bodyStyle: {
    padding: '12px',
  },
};

/**
 * EXPANDABLE TABLE CARD CONFIGURATION
 * 
 * Standard configuration for expandable table cards only.
 * Includes very light purple background (#faf5ff) to distinguish expandable table cards from other cards.
 * NO VARIATIONS ALLOWED - all expandable table cards must use this exact configuration.
 * 
 * Standard Configuration:
 * - Style: { borderRadius: '8px', background: '#faf5ff' } (very light purple background)
 * - Body style: { padding: '12px' } (uniform padding with other cards)
 * - No marginBottom (tables usually don't need spacing below)
 * - Table headers should use light grey background
 * 
 * Usage:
 * - Used internally by StandardExpandableTable component
 * - NO style or bodyStyle overrides allowed
 * - NO variations in padding, border radius, or background color
 * - Use ONLY for expandable table cards
 * 
 * Examples:
 * - DealerManagement.js: Dealers expandable table
 * - DealerReports.js: Orders expandable table
 * - DailyReport.js: Orders/forecasts expandable tables
 */
export const EXPANDABLE_TABLE_CARD_CONFIG = {
  style: {
    borderRadius: '8px',
    background: '#faf5ff',
  },
  bodyStyle: {
    padding: '12px',
  },
};

/**
 * STANDARD CARD STYLING CONSTANTS
 */
export const STANDARD_CARD_STYLES = {
  // Standard margin between cards
  marginBottom: '16px',
  
  // Standard border radius (ALWAYS use '8px')
  borderRadius: '8px',
  
  // Standard body padding for filter/input cards
  filterCardBodyPadding: '12px',
};

/**
 * USAGE EXAMPLES
 * 
 * Standard Usage (NO VARIATIONS):
 * ```jsx
 * <Card 
 *   title="Filter Orders" 
 *   {...STANDARD_CARD_CONFIG}
 * >
 *   Filter content goes here
 * </Card>
 * ```
 * 
 * Pattern 3 - Table Card:
 * ```jsx
 * <Card {...TABLE_CARD_CONFIG}>
 *   <Table {...tableProps} />
 * </Card>
 * ```
 */

export default {
  STANDARD_CARD_CONFIG,
  FILTER_CARD_CONFIG, // For filter/search cards only (with light lavender background)
  DATE_SELECTION_CARD_CONFIG, // For date selection/viewing cards (with blue-grey background)
  FORM_CARD_CONFIG, // For form/input cards only (with honeydew background)
  IMPORT_CARD_CONFIG, // For import/upload section cards only (with light cream background)
  ACTION_CARD_CONFIG, // For action button cards only (with light sky blue background)
  CONTENT_CARD_CONFIG, // @deprecated - use STANDARD_CARD_CONFIG
  TABLE_CARD_CONFIG, // For regular table cards (with light indigo background)
  EXPANDABLE_TABLE_CARD_CONFIG, // For expandable table cards (with very light purple background)
  STANDARD_CARD_STYLES,
};
