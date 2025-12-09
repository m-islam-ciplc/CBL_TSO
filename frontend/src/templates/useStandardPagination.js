/**
 * STANDARD PAGINATION HOOK
 * 
 * Universal pagination hook for all tables in the application.
 * Provides consistent pagination behavior across all pages.
 * 
 * @param {string} itemName - Name of the items (e.g., 'orders', 'products', 'users')
 * @param {number} defaultPageSize - Default page size (default: 20)
 * @returns {Object} { pagination, setPagination, handleTableChange }
 */

import { useState } from 'react';
import { getStandardPagination } from './UITemplates';

export const useStandardPagination = (itemName = 'items', defaultPageSize = 20) => {
  const [pagination, setPagination] = useState({
    ...getStandardPagination(itemName),
    pageSize: defaultPageSize,
    defaultPageSize: defaultPageSize,
  });

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  return {
    pagination,
    setPagination,
    handleTableChange,
  };
};

/**
 * Get standard pagination config (for inline use, no state management)
 * Use this when you don't need state management (e.g., simple tables)
 * 
 * @param {string} itemName - Name of the items
 * @param {number} pageSize - Page size (default: 20)
 * @returns {Object} Standard pagination configuration
 */
export const getStandardPaginationConfig = (itemName = 'items', pageSize = 20) => {
  return {
    ...getStandardPagination(itemName),
    pageSize,
    defaultPageSize: pageSize,
  };
};

