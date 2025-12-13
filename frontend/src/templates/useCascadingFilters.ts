/**
 * CASCADING FILTERS HOOK
 * 
 * Reusable hook for implementing cascading (dependent) filter behavior.
 * When a parent filter changes, child filters are automatically updated and cleared if invalid.
 * 
 * This hook handles:
 * - Filtering options based on parent selections
 * - Clearing dependent filters when parent changes
 * - Providing filtered options for each filter level
 */

import { useMemo, useEffect } from 'react';
import type { UseCascadingFiltersConfig, UseCascadingFiltersReturn, FilterConfig } from './types';

/**
 * Cascading Filters Hook
 * 
 * @param config - Configuration object
 * @returns Object with filteredOptions and clearFilters function
 * 
 * @example
 * // Territory -> Dealer -> Product cascading filters
 * const { filteredOptions, clearFilters } = useCascadingFilters({
 *   filterConfigs: [
 *     {
 *       name: 'dealer',
 *       allOptions: dealersList,
 *       dependsOn: ['territory'],
 *       filterFn: (dealer, parentValues) => {
 *         if (!parentValues.territory) return true;
 *         return dealer.territory_name === parentValues.territory;
 *       },
 *       getValueKey: (dealer) => dealer.id,
 *     },
 *     {
 *       name: 'product',
 *       allOptions: productsList,
 *       dependsOn: ['territory', 'dealer'],
 *       filterFn: (product, parentValues, context) => {
 *         const { orders, orderProducts } = context;
 *         const allowedProductIds = new Set();
 *         orders.forEach(order => {
 *           if (parentValues.territory && order.dealer_territory !== parentValues.territory) return;
 *           if (parentValues.dealer && order.dealer_id !== parentValues.dealer) return;
 *           const products = orderProducts[order.order_id] || [];
 *           products.forEach(p => allowedProductIds.add(p.product_id || p.id || p.product_code));
 *         });
 *         if (!parentValues.territory && !parentValues.dealer) return true;
 *         return allowedProductIds.has(product.id) || allowedProductIds.has(product.product_code);
 *       },
 *       getValueKey: (product) => product.id || product.product_code,
 *     },
 *   ],
 *   filterValues: {
 *     territory: territoryFilter,
 *     dealer: dealerFilter,
 *     product: productFilter,
 *   },
 *   setFilterValues: {
 *     dealer: setDealerFilter,
 *     product: setProductFilter,
 *   },
 *   context: { orders, orderProducts },
 * });
 */
export const useCascadingFilters = ({
  filterConfigs = [],
  filterValues = {},
  setFilterValues = {},
  context = {},
}: UseCascadingFiltersConfig): UseCascadingFiltersReturn => {
  // Compute filtered options for each filter level
  const filteredOptions = useMemo(() => {
    const result: Record<string, any[]> = {};
    
    filterConfigs.forEach((config: FilterConfig) => {
      const { name, allOptions = [], dependsOn = [], filterFn } = config;
      
      // Get parent filter values
      const parentValues: Record<string, any> = {};
      dependsOn.forEach((parentName) => {
        parentValues[parentName] = filterValues[parentName];
      });
      
      // If no parent filters, return all items
      if (dependsOn.length === 0) {
        result[name] = allOptions;
        return;
      }
      
      // If any parent filter is not set, return all items
      const allParentsSet = dependsOn.every((parentName) => filterValues[parentName] != null);
      if (!allParentsSet) {
        result[name] = allOptions;
        return;
      }
      
      // Apply custom filter function if provided
      if (filterFn) {
        result[name] = allOptions.filter((item) =>
          filterFn(item, parentValues, context)
        );
      } else {
        // Default: return all items (no filtering)
        result[name] = allOptions;
      }
    });
    
    return result;
  }, [filterConfigs, filterValues, context]);

  // Clear dependent filters when parent filters change
  useEffect(() => {
    filterConfigs.forEach((config: FilterConfig) => {
      const { name, dependsOn = [], getValueKey } = config;
      
      if (dependsOn.length === 0) return;
      
      const currentValue = filterValues[name];
      if (currentValue == null) return;
      
      const filteredItems = filteredOptions[name] || [];
      const getKey = getValueKey || ((item: any) => item.id || item.value || item);
      
      // Check if current value is still valid in filtered options
      const isValid = filteredItems.some((item) => {
        const itemKey = getKey(item);
        const currentKey = typeof currentValue === 'object' ? getKey(currentValue) : currentValue;
        return itemKey === currentKey || item.id === currentValue || item.value === currentValue;
      });
      
      if (!isValid && setFilterValues[name]) {
        setFilterValues[name](null);
      }
    });
  }, [filterConfigs, filterValues, filteredOptions, setFilterValues]);

  // Clear all filters function
  const clearFilters = (defaultValues: Record<string, any> = {}) => {
    filterConfigs.forEach((config: FilterConfig) => {
      const { name } = config;
      if (setFilterValues[name]) {
        setFilterValues[name](defaultValues[name] ?? null);
      }
    });
  };

  return {
    filteredOptions,
    clearFilters,
  };
};

