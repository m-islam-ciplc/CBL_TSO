# Standard Expandable Table Template

## Overview
This template defines the **mandatory** design standards for all expandable tables in the application.

**Source**: Based on Daily Demand Orders table in `DealerReports.js`

---

## Design Specifications

### 1. Table Structure

```jsx
<Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
  <Table
    columns={columns}
    dataSource={data}
    rowKey="id"
    pagination={{
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `Total ${total} items`,
      pageSizeOptions: ['10', '20', '50', '100'],
      defaultPageSize: 10
    }}
    expandable={{
      expandedRowRender: (record) => {
        // Expanded content here
      }
    }}
  />
</Card>
```

### 2. Expanded Row Content Styling

**Container:**
- `padding: '16px'`
- `background: '#fafafa'`

**Title:**
- `fontSize: '14px'`
- `marginBottom: '8px'`
- `display: 'block'`
- Use `<Text strong>`

**Item Container:**
- `marginBottom: '8px'`
- `padding: '8px'`
- `background: 'white'`
- `borderRadius: '4px'`

**Item Content:**
- Product/Item name: `<Text strong>` (default font size)
- Details: `<Text type="secondary">` with `fontSize: '12px'`

### 3. Column Styling Standards

**ID Columns:**
```jsx
{
  title: 'ID',
  dataIndex: 'id',
  key: 'id',
  ellipsis: true,
  render: (id) => (
    <Tag color="blue" style={{ fontSize: '12px' }}>
      {id}
    </Tag>
  )
}
```

**Date Columns:**
```jsx
{
  title: 'Date',
  dataIndex: 'date',
  key: 'date',
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
}
```

**Number/Quantity Columns:**
```jsx
{
  title: 'Quantity',
  dataIndex: 'quantity',
  key: 'quantity',
  ellipsis: true,
  render: (qty) => <Text strong>{qty || 0}</Text>
}
```

**Status Columns:**
```jsx
{
  title: 'Status',
  dataIndex: 'status',
  key: 'status',
  ellipsis: true,
  render: (status) => <Tag color="green">{status || 'N/A'}</Tag>
}
```

### 4. Font Sizes

- **Title (in expanded row)**: `14px`
- **Body text**: `12px` (default)
- **Labels**: `12px`
- **Tags**: `12px`
- **Strong text**: `14px` (default, can be `12px` for smaller emphasis)

### 5. Colors

- **Expanded row background**: `#fafafa`
- **Item card background**: `white`
- **Info card background**: `#f0f7ff`
- **Secondary text**: `#666` (via `type="secondary"`)
- **Muted text**: `#999`

### 6. Spacing

- **Card margin bottom**: `16px`
- **Expanded row padding**: `16px`
- **Item margin bottom**: `8px`
- **Item padding**: `8px`
- **Title margin bottom**: `8px`

### 7. Border Radius

- **Card**: `8px`
- **Item container**: `4px`

---

## Standard Expanded Row Template

```jsx
expandable={{
  expandedRowRender: (record) => {
    const items = record.items || [];
    return (
      <div style={{ padding: '16px', background: '#fafafa' }}>
        <Text strong style={{ marginBottom: '8px', display: 'block' }}>
          Items:
        </Text>
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div 
              key={idx} 
              style={{ 
                marginBottom: '8px', 
                padding: '8px', 
                background: 'white', 
                borderRadius: '4px' 
              }}
            >
              <Text strong>{item.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Details: {item.details}
              </Text>
            </div>
          ))
        ) : (
          <div style={{ 
            marginBottom: '8px', 
            padding: '8px', 
            background: 'white', 
            borderRadius: '4px' 
          }}>
            <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
              No items found
            </Text>
          </div>
        )}
      </div>
    );
  }
}}
```

---

## Key Rules

1. ✅ **ALWAYS** use plus sign on left (default expandable behavior)
2. ✅ **ALWAYS** use `padding: '16px'` and `background: '#fafafa'` for expanded container
3. ✅ **ALWAYS** use `padding: '8px'`, `background: 'white'`, `borderRadius: '4px'` for items
4. ✅ **ALWAYS** use `fontSize: '12px'` for secondary text
5. ✅ **ALWAYS** use `ellipsis: true` for columns that might have long text
6. ✅ **ALWAYS** use Tags for IDs and statuses with `fontSize: '12px'`
7. ✅ **ALWAYS** use `borderRadius: '8px'` for Card wrapper
8. ✅ **ALWAYS** use standard pagination configuration

---

## Reference Implementation

See `frontend/src/pages/DealerReports.js` lines 736-764 for the exact implementation.





