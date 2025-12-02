/**
 * STANDARD TABLE CONFIGURATION
 * 
 * Standard pagination and table configuration for all tables in the application.
 * Use this configuration to ensure consistency across all tables.
 */

export const STANDARD_PAGINATION = {
  current: 1,
  pageSize: 20,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  pageSizeOptions: ['10', '20', '50', '100'],
  defaultPageSize: 20,
};

/**
 * Get standard pagination config with custom showTotal message
 * @param {string} itemName - Name of the items (e.g., 'orders', 'products', 'users')
 * @returns {Object} Standard pagination configuration
 */
export const getStandardPagination = (itemName = 'items') => ({
  current: 1,
  pageSize: 20,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ${itemName}`,
  pageSizeOptions: ['10', '20', '50', '100'],
  defaultPageSize: 20,
});

/**
 * STANDARD DATE PICKER CONFIGURATION
 * 
 * Standard disabled date function and date cell renderer for all calendars.
 */
export const createStandardDatePickerConfig = (availableDates = []) => {
  // Standard: Disable dates that don't have data
  const disabledDate = (current) => {
    if (!current) return false;
    const dateString = current.format('YYYY-MM-DD');
    return !availableDates.includes(dateString);
  };

  // Standard: Custom date cell renderer to gray out dates with no data
  const dateCellRender = (current) => {
    const dateString = current.format('YYYY-MM-DD');
    const hasData = availableDates.includes(dateString);
    
    return (
      <div style={{
        color: hasData ? '#000' : '#d9d9d9',
        backgroundColor: hasData ? 'transparent' : '#f5f5f5',
        cursor: hasData ? 'pointer' : 'not-allowed',
        borderRadius: '4px',
        padding: '2px'
      }}>
        {current.date()}
      </div>
    );
  };

  return {
    disabledDate,
    dateCellRender,
  };
};

