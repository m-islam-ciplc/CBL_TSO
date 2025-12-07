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
import { EXPANDABLE_TABLE_CARD_CONFIG } from './CardTemplates';

const { Text } = Typography;

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
    showTotal: (total) => `Total ${total} items`,
    pageSizeOptions: ['10', '20', '50', '100'],
    defaultPageSize: 10
  },

  // Standard expandable row content styling
  expandedRowContent: {
    container: {
      padding: '16px',
      background: '#fafafa'
    },
    title: {
      marginBottom: '8px',
      display: 'block',
      fontSize: '14px' // Standard font size
    },
    itemContainer: {
      marginBottom: '8px',
      padding: '8px',
      background: 'white',
      borderRadius: '4px'
    }
  },

  // Standard column configurations
  columnStyles: {
    // For ID columns (use Tag)
    idColumn: {
      ellipsis: true,
      render: (id) => (
        <Tag color="blue" style={{ fontSize: '12px' }}>
          {id}
        </Tag>
      )
    },
    // For date columns
    dateColumn: {
      ellipsis: true,
      render: (date) => {
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
      render: (value) => <Text strong>{value || 0}</Text>
    },
    // For status columns (use Tag)
    statusColumn: {
      ellipsis: true,
      render: (status) => <Tag color="green">{status || 'N/A'}</Tag>
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
};

/**
 * STANDARD EXPANDABLE ROW RENDERER TEMPLATE
 * 
 * Use this as a template for creating expandedRowRender functions
 * 
 * @param {Object} record - The table row record
 * @param {Array} items - Array of items to display in expanded row
 * @param {Function} renderItem - Function to render each item
 * @param {String} title - Title for the expanded section
 * 
 * @example
 * expandedRowRender: (record) => renderStandardExpandedRow(
 *   record,
 *   record.items || [],
 *   (item, idx) => (
 *     <div key={idx} style={STANDARD_EXPANDABLE_TABLE_CONFIG.expandedRowContent.itemContainer}>
 *       <Text strong>{item.name}</Text>
 *       <br />
 *       <Text type="secondary">Details: {item.details}</Text>
 *     </div>
 *   ),
 *   'Items:'
 * )
 */
export const renderStandardExpandedRow = (record, items, renderItem, title = 'Details:') => {
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
 * 
 * @example
 * <StandardExpandableTable
 *   columns={columns}
 *   dataSource={data}
 *   loading={loading}
 *   rowKey="id"
 *   expandedRowRender={(record) => renderStandardExpandedRow(
 *     record,
 *     record.items,
 *     (item) => <div>Item: {item.name}</div>,
 *     'Items:'
 *   )}
 * />
 */
export const StandardExpandableTable = ({
  columns,
  dataSource,
  loading,
  rowKey,
  expandedRowRender,
  expandedRowKeys,
  onExpand,
  pagination = STANDARD_EXPANDABLE_TABLE_CONFIG.pagination,
  header,
  ...otherProps
}) => {
  // Default expandable configuration - uses action column instead of plus icon
  const defaultExpandableConfig = {
    expandedRowKeys,
    onExpand,
    expandedRowRender: expandedRowRender,
    expandRowByClick: false, // Disable row click expansion - use action buttons only
    showExpandColumn: false, // Hide the default plus icon column
    ...otherProps.expandable // Allow override
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
        <Table
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

/**
 * USAGE EXAMPLES:
 * 
 * 1. Basic expandable table with action column:
 * 
 *    const [expandedRowKeys, setExpandedRowKeys] = useState([]);
 * 
 *    const columns = [
 *      {
 *        title: 'ID',
 *        dataIndex: 'id',
 *        key: 'id',
 *        ellipsis: true,
 *        ...STANDARD_EXPANDABLE_TABLE_CONFIG.columnStyles.idColumn
 *      },
 *      // ... more columns
 *      {
 *        title: 'Actions',
 *        key: 'actions',
 *        width: 180,
 *        align: 'center',
 *        fixed: 'right',
 *        render: (_, record) => {
 *          const isExpanded = expandedRowKeys.includes(record.id);
 *          return (
 *            <Badge count={record.item_count || 0} showZero={true} overflowCount={999}>
 *              <Button
 *                type="primary"
 *                icon={<EyeOutlined />}
 *                size="small"
 *                onClick={(e) => {
 *                  e.stopPropagation();
 *                  if (isExpanded) {
 *                    setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.id));
 *                  } else {
 *                    setExpandedRowKeys([...expandedRowKeys, record.id]);
 *                  }
 *                }}
 *              >
 *                {isExpanded ? 'Hide Details' : 'View Details'}
 *              </Button>
 *            </Badge>
 *          );
 *        },
 *      },
 *    ];
 * 
 *    <StandardExpandableTable
 *       columns={columns}
 *       dataSource={data}
 *       loading={loading}
 *       rowKey="id"
 *       expandedRowKeys={expandedRowKeys}
 *       onExpand={(expanded, record) => {
 *         if (expanded) {
 *           setExpandedRowKeys([...expandedRowKeys, record.id]);
 *         } else {
 *           setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.id));
 *         }
 *       }}
 *       expandedRowRender={(record) => renderStandardExpandedRow(
 *         record,
 *         record.items || [],
 *         (item, idx) => (
 *           <>
 *             <Text strong>{item.name}</Text>
 *             <br />
 *             <Text type="secondary">Quantity: {item.quantity}</Text>
 *           </>
 *         ),
 *         'Items:'
 *       )}
 *     />
 * 
 * KEY FEATURES:
 * - Action column is fixed on the right (width: 180px, align: 'center')
 * - Button text changes based on expanded state (e.g., "View Details" / "Hide Details")
 * - Badge shows count of items (optional)
 * - No default plus icon column (showExpandColumn: false)
 * - Row click expansion disabled (expandRowByClick: false)
 * 
 * 2. Custom expanded content (still following standard styling):
 * 
 *    expandable={{
 *       expandedRowRender: (record) => (
 *         <div style={STANDARD_EXPANDABLE_TABLE_CONFIG.expandedRowContent.container}>
 *           <Text strong style={STANDARD_EXPANDABLE_TABLE_CONFIG.expandedRowContent.title}>
 *             Custom Title:
 *           </Text>
 *           {record.items.map((item, idx) => (
 *             <div key={idx} style={STANDARD_EXPANDABLE_TABLE_CONFIG.expandedRowContent.itemContainer}>
 *               <Text strong>{item.name}</Text>
 *               <br />
 *               <Text type="secondary" style={{ fontSize: '12px' }}>
 *                 Details: {item.details}
 *               </Text>
 *             </div>
 *           ))}
 *         </div>
 *       )
 *     }}
 */

export default StandardExpandableTable;





