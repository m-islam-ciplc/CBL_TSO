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
 * Pattern 1: Filter/Input Card with Title
 * 
 * Use for filter sections, input forms, and titled content sections.
 * 
 * Standard Configuration:
 * - Card title prop: title="Card Title"
 * - Style: { marginBottom: '16px', borderRadius: '8px' }
 * - Body style: { padding: '12px' }
 * 
 * Examples:
 * - PlacedOrders.js: Filter Orders card
 * - TSOReport.js: Report filter cards
 * - DailyReport.js: Report filter cards
 */
export const FILTER_CARD_CONFIG = {
  style: {
    marginBottom: '16px',
    borderRadius: '8px',
  },
  bodyStyle: {
    padding: '12px',
  },
};

/**
 * Pattern 2: Content Card without Title
 * 
 * Use for simple content cards without titles (buttons, actions, simple sections).
 * 
 * Standard Configuration:
 * - No title prop
 * - Style: { marginBottom: '16px', borderRadius: '8px' }
 * - No bodyStyle padding (uses default)
 * 
 * Examples:
 * - ProductManagement.js: Import Section card
 * - UserManagement.js: Add User Button card
 */
export const CONTENT_CARD_CONFIG = {
  style: {
    marginBottom: '16px',
    borderRadius: '8px',
  },
};

/**
 * Pattern 3: Table Card
 * 
 * Use for cards containing tables.
 * 
 * Standard Configuration:
 * - No title prop (or optional title)
 * - Style: { borderRadius: '8px' }
 * - No marginBottom (tables usually don't need spacing below)
 * 
 * Examples:
 * - ProductManagement.js: Products Table card
 */
export const TABLE_CARD_CONFIG = {
  style: {
    borderRadius: '8px',
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
 * Pattern 1 - Filter Card with Title:
 * ```jsx
 * <Card 
 *   title="Filter Orders" 
 *   style={FILTER_CARD_CONFIG.style} 
 *   bodyStyle={FILTER_CARD_CONFIG.bodyStyle}
 * >
 *   Filter content goes here
 * </Card>
 * ```
 * 
 * Pattern 2 - Content Card without Title:
 * ```jsx
 * <Card style={CONTENT_CARD_CONFIG.style}>
 *   Content goes here
 * </Card>
 * ```
 * 
 * Pattern 3 - Table Card:
 * ```jsx
 * <Card style={TABLE_CARD_CONFIG.style}>
 *   <Table {...tableProps} />
 * </Card>
 * ```
 */

export default {
  FILTER_CARD_CONFIG,
  CONTENT_CARD_CONFIG,
  TABLE_CARD_CONFIG,
  STANDARD_CARD_STYLES,
};
