/**
 * TABLE TEMPLATE
 * 
 * Standard design template for expandable tables in the application.
 * Use this template when creating any new expandable table.
 * 
 * Design Source: Manage Dealers table in DealerManagement.js
 * 
 * IMPORTANT: All expandable tables MUST follow this design exactly.
 * - Uses action column with buttons (no default plus icon)
 * - Action column is fixed on the right
 * - Row click expansion is disabled
 */

import { Table, Card, Typography, Tag, Spin } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { ReactNode } from 'react';
import { EXPANDABLE_TABLE_CARD_CONFIG } from './UITemplates';
import type { ProductDetail, RenderProductDetailsStackProps } from './types';
import type { OrderItem, ProductSummary } from '../types/api';

const { Text } = Typography;

/**
 * RENDER PRODUCT DETAILS (STACKED)
 * 
 * Standard renderer for product details inside table cells.
 * Design source: Orders & Demands (Products column)
 * - Product name: bold
 * - Product code: regular (muted)
 * - Quantity: green
 * - Optional price (hidden for TSO when showPrice=true and isTSO=true)
 */
export const renderProductDetailsStack = ({
  products = [],
  showPrice = false,
  isTSO = false,
  showIndex = true,
  showCode = true,
}: RenderProductDetailsStackProps): ReactNode => {
  if (!products || products.length === 0) {
    return (
      <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
        No products found
      </div>
    );
  }

  return (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      {products.map((product, index) => (
        <div
          key={`${product.id || product.product_code || index}-${index}`}
          style={{ marginBottom: '2px' }}
        >
          {showIndex && (
            <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
              #{index + 1}
            </span>
          )}{' '}
          {showCode && (
            <>
              <span style={{ color: '#666' }}>
                {product.product_code || 'N/A'}
              </span>{' '}
            </>
          )}
          <span style={{ fontWeight: 'bold' }}>
            {product.product_name || product.name || 'Unnamed Product'}
          </span>
          <span style={{ color: '#52c41a', marginLeft: '8px' }}>
            (Qty: {Number(product.quantity || 0)})
          </span>
          {showPrice && !isTSO && product.unit_tp && (
            <span style={{ color: '#1890ff', marginLeft: '8px' }}>
              @৳{Number(product.unit_tp || 0).toLocaleString()}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * TABLE CONFIGURATION
 * 
 * Standard configuration for expandable tables
 */
export const STANDARD_EXPANDABLE_TABLE_CONFIG = {
  // Table wrapper styling - uses EXPANDABLE_TABLE_CARD_CONFIG
  cardStyle: {
    ...EXPANDABLE_TABLE_CARD_CONFIG.style,
    marginBottom: '16px',
  },
  cardBodyStyle: {
    ...EXPANDABLE_TABLE_CARD_CONFIG.bodyStyle,
  },

  // Standard pagination configuration
  pagination: {
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total: number) => `Total ${total} items`,
    pageSizeOptions: ['10', '20', '50', '100'] as (string | number)[],
    defaultPageSize: 10
  },

  // Standard expandable row content styling
  expandedRowContent: {
    container: {
      padding: '16px',
      background: '#fafafa'
    } as React.CSSProperties,
    title: {
      marginBottom: '8px',
      display: 'block',
      fontSize: '14px' // Standard font size
    } as React.CSSProperties,
    itemContainer: {
      marginBottom: '8px',
      padding: '8px',
      background: 'white',
      borderRadius: '4px'
    } as React.CSSProperties
  },

  // Standard column configurations
  columnStyles: {
    // For ID columns (use Tag)
    idColumn: {
      ellipsis: true,
      render: (id: string | number) => (
        <Tag color="blue" style={{ fontSize: '12px' }}>
          {id}
        </Tag>
      )
    },
    // For date columns
    dateColumn: {
      ellipsis: true,
      render: (date: string | null | undefined) => {
        if (!date) return '-';
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        });
      }
    },
    // For quantity/number columns
    numberColumn: {
      ellipsis: true,
      render: (value: number | null | undefined) => <Text strong>{value || 0}</Text>
    },
    // For status columns (use Tag)
    statusColumn: {
      ellipsis: true,
      render: (status: string | null | undefined) => <Tag color="green">{status || 'N/A'}</Tag>
    }
  },

  // Standard font sizes
  fontSizes: {
    title: '14px',        // Section titles in expanded rows
    body: '12px',         // Body text (default)
    label: '12px',        // Labels
    tag: '12px',          // Tags
    strong: '14px'        // Strong/bold text
  },

  // Standard colors
  colors: {
    background: {
      expandedRow: '#fafafa',
      itemCard: 'white',
      infoCard: '#f0f7ff'
    },
    text: {
      primary: '#000',
      secondary: '#666',
      muted: '#999'
    },
    borders: {
      default: '#d9d9d9',
      light: '#f0f0f0'
    }
  },

  // Standard spacing
  spacing: {
    cardMargin: '16px',
    rowPadding: '16px',
    itemMargin: '8px',
    itemPadding: '8px',
    titleMargin: '8px'
  },

  // Standard border radius
  borderRadius: {
    card: '8px',
    item: '4px',
    button: '4px'
  }
} as const;

/**
 * STANDARD EXPANDABLE ROW RENDERER TEMPLATE
 * 
 * Use this as a template for creating expandedRowRender functions
 */
export const renderStandardExpandedRow = <T extends Record<string, any>>(
  record: T,
  items: any[],
  renderItem: (item: any, idx: number) => ReactNode,
  title: string = 'Details:'
): ReactNode => {
  const { container, title: titleStyle, itemContainer } = STANDARD_EXPANDABLE_TABLE_CONFIG.expandedRowContent;

  return (
    <div style={container}>
      <Text strong style={titleStyle}>{title}</Text>
      {items && items.length > 0 ? (
        items.map((item, idx) => (
          <div key={idx} style={itemContainer}>
            {renderItem(item, idx)}
          </div>
        ))
      ) : (
        <div style={itemContainer}>
          <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
            No items found
          </Text>
        </div>
      )}
    </div>
  );
};

/**
 * STANDARD EXPANDABLE TABLE COMPONENT
 * 
 * Complete template component that can be used directly or as reference
 */
interface StandardExpandableTableProps<T extends Record<string, any>> extends Omit<TableProps<T>, 'expandable'> {
  columns: ColumnsType<T>;
  dataSource: T[];
  loading?: boolean;
  rowKey: string | ((record: T) => string);
  expandedRowRender?: (record: T) => ReactNode;
  expandedRowKeys?: React.Key[];
  onExpand?: (expanded: boolean, record: T) => void;
  pagination?: TableProps<T>['pagination'];
  header?: ReactNode;
  expandable?: TableProps<T>['expandable'];
}

export const StandardExpandableTable = <T extends Record<string, any>>({
  columns,
  dataSource,
  loading,
  rowKey,
  expandedRowRender,
  expandedRowKeys,
  onExpand,
  pagination = STANDARD_EXPANDABLE_TABLE_CONFIG.pagination,
  header,
  expandable,
  ...otherProps
}: StandardExpandableTableProps<T>): ReactNode => {
  // Default expandable configuration - uses action column instead of plus icon
  const defaultExpandableConfig: TableProps<T>['expandable'] = {
    expandedRowKeys,
    onExpand,
    expandedRowRender: expandedRowRender as any,
    expandRowByClick: false, // Disable row click expansion - use action buttons only
    showExpandColumn: false, // Hide the default plus icon column
    ...expandable // Allow override
  };

  return (
    <Card 
      style={STANDARD_EXPANDABLE_TABLE_CONFIG.cardStyle}
      bodyStyle={STANDARD_EXPANDABLE_TABLE_CONFIG.cardBodyStyle}
    >
      {header}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      )}

      {!loading && (
        <Table<T>
          columns={columns}
          dataSource={dataSource}
          rowKey={rowKey}
          pagination={pagination}
          expandable={defaultExpandableConfig}
          {...otherProps}
        />
      )}
    </Card>
  );
};

export default StandardExpandableTable;

