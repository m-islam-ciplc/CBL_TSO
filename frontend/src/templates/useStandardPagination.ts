/**
 * STANDARD PAGINATION HOOK
 * 
 * Universal pagination hook for all tables in the application.
 * Provides consistent pagination behavior across all pages.
 */

import { useState } from 'react';
import { getStandardPagination } from './UITemplates';
import type { PaginationConfig, UseStandardPaginationReturn } from './types';

export const useStandardPagination = (
  itemName: string = 'items',
  defaultPageSize: number = 20
): UseStandardPaginationReturn => {
  const [pagination, setPagination] = useState<PaginationConfig>({
    ...getStandardPagination(itemName),
    pageSize: defaultPageSize,
    defaultPageSize: defaultPageSize,
  });

  const handleTableChange = (newPagination: PaginationConfig): void => {
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
 */
export const getStandardPaginationConfig = (
  itemName: string = 'items',
  pageSize: number = 20
): PaginationConfig => {
  return {
    ...getStandardPagination(itemName),
    pageSize,
    defaultPageSize: pageSize,
  };
};

