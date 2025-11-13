# Ant Design Icons Reference for Page Titles

This document lists recommended Ant Design icons for each page title. All icons are from `@ant-design/icons` package.

## Icon Categories

### 📊 Dashboard & Analytics
- `DashboardOutlined` - Dashboard overview
- `BarChartOutlined` - Charts and reports
- `FileTextOutlined` - Documents and reports
- `FileExcelOutlined` - Excel files
- `LineChartOutlined` - Line charts
- `PieChartOutlined` - Pie charts

### 📦 Orders & Products
- `ShoppingCartOutlined` - Shopping cart, orders
- `ShoppingOutlined` - Shopping
- `InboxOutlined` - Inbox, orders
- `AppstoreOutlined` - Products/apps grid
- `DatabaseOutlined` - Database, products
- `BoxPlotOutlined` - Products/boxes
- `ContainerOutlined` - Containers/products

### 👥 Users & Management
- `UserOutlined` - Single user
- `TeamOutlined` - Team/users
- `UsergroupAddOutlined` - Add users
- `SolutionOutlined` - Solutions/users

### 🏢 Dealers & Business
- `ShopOutlined` - Shop/dealer
- `BankOutlined` - Business/bank
- `HomeOutlined` - Home/business
- `BuildOutlined` - Building/business

### 🚚 Transport & Logistics
- `TruckOutlined` - Truck/transport
- `CarOutlined` - Vehicle
- `ThunderboltOutlined` - Fast delivery
- `RocketOutlined` - Fast transport

### ✅ Actions & Status
- `CheckOutlined` - Check/confirm
- `CheckCircleOutlined` - Success
- `EditOutlined` - Edit
- `EyeOutlined` - View/preview
- `PlusOutlined` - Add
- `DeleteOutlined` - Delete
- `DownloadOutlined` - Download

### 📋 Lists & Reviews
- `OrderedListOutlined` - Ordered list
- `UnorderedListOutlined` - Unordered list
- `FileTextOutlined` - Text file/list
- `FormOutlined` - Form
- `FileSearchOutlined` - Search file

### 🔍 Search & Filter
- `SearchOutlined` - Search
- `FilterOutlined` - Filter
- `ReloadOutlined` - Refresh/reload

## Recommended Icons for Each Page

### 1. Dashboard
**Current:** No icon  
**Suggested:** `DashboardOutlined` 📊  
**Usage:** `<DashboardOutlined /> Dashboard`

### 2. Place New Orders (NewOrdersTablet)
**Current:** No icon  
**Suggested:** `PlusOutlined` or `ShoppingCartOutlined` 🛒  
**Usage:** `<PlusOutlined /> Place New Orders` or `<ShoppingCartOutlined /> Place New Orders`

### 3. Review Orders (ReviewOrdersTablet)
**Current:** No icon  
**Suggested:** `EyeOutlined` or `FileTextOutlined` 👁️  
**Usage:** `<EyeOutlined /> Review Orders` or `<FileTextOutlined /> Review Orders`

### 4. Review & Edit Order (ReviewOrdersTablet - Edit Mode)
**Current:** No icon  
**Suggested:** `EditOutlined` ✏️  
**Usage:** `<EditOutlined /> Review & Edit Order`

### 5. Placed Orders
**Current:** No icon  
**Suggested:** `ShoppingCartOutlined` or `OrderedListOutlined` 🛒  
**Usage:** `<ShoppingCartOutlined /> Placed Orders` or `<OrderedListOutlined /> Placed Orders`

### 6. Daily Quota Management
**Current:** No icon  
**Suggested:** `BarChartOutlined` or `AppstoreOutlined` 📊  
**Usage:** `<BarChartOutlined /> Daily Quota Management` or `<AppstoreOutlined /> Daily Quota Management`

### 7. Manage Products
**Current:** No icon  
**Suggested:** `AppstoreOutlined` or `DatabaseOutlined` 📦  
**Usage:** `<AppstoreOutlined /> Manage Products` or `<DatabaseOutlined /> Manage Products`

### 8. Manage Dealers
**Current:** No icon  
**Suggested:** `ShopOutlined` or `TeamOutlined` 🏢  
**Usage:** `<ShopOutlined /> Manage Dealers` or `<TeamOutlined /> Manage Dealers`

### 9. Manage Transports
**Current:** No icon  
**Suggested:** `TruckOutlined` 🚚  
**Usage:** `<TruckOutlined /> Manage Transports`

### 10. Manage Users
**Current:** No icon  
**Suggested:** `UserOutlined` or `TeamOutlined` 👥  
**Usage:** `<UserOutlined /> Manage Users` or `<TeamOutlined /> Manage Users`

### 11. Daily Order Report Generator
**Current:** No icon  
**Suggested:** `FileExcelOutlined` or `BarChartOutlined` 📊  
**Usage:** `<FileExcelOutlined /> Daily Order Report Generator` or `<BarChartOutlined /> Daily Order Report Generator`

### 12. My Order Reports (TSOReport)
**Current:** No icon  
**Suggested:** `FileTextOutlined` or `FileExcelOutlined` 📄  
**Usage:** `<FileTextOutlined /> My Order Reports` or `<FileExcelOutlined /> My Order Reports`

### 13. TSO Dashboard (Welcome)
**Current:** No icon  
**Suggested:** `DashboardOutlined` or `HomeOutlined` 🏠  
**Usage:** `<DashboardOutlined /> Welcome, {userName}!` or `<HomeOutlined /> Welcome, {userName}!`

## Icon Style Guidelines

1. **Size:** Icons should match the text size (default Ant Design icon size works well)
2. **Spacing:** Add a space between icon and text: `<Icon /> Page Title`
3. **Color:** Use default icon color (inherit from text color)
4. **Alignment:** Icons align naturally with text

## Example Implementation

```jsx
import { DashboardOutlined } from '@ant-design/icons';

<Title level={3} style={{ marginBottom: '8px' }}>
  <DashboardOutlined /> Dashboard
</Title>
```

## Complete Icon List

For a complete list of all available icons, visit:
- **Official Ant Design Icons:** https://ant.design/components/icon/
- **Icon Search:** https://2x.ant.design/components/icon/

## Most Common Icons Used in This Project

Based on current usage:
- `DashboardOutlined` - Dashboard
- `ShoppingCartOutlined` - Orders
- `UserOutlined` - Users
- `TeamOutlined` - Teams/Groups
- `TruckOutlined` - Transport
- `AppstoreOutlined` - Products
- `BarChartOutlined` - Reports/Analytics
- `FileExcelOutlined` - Excel reports
- `EyeOutlined` - Preview/View
- `DownloadOutlined` - Download
- `PlusOutlined` - Add/Create
- `EditOutlined` - Edit
- `CheckOutlined` - Confirm/Check
- `SearchOutlined` - Search
- `LogoutOutlined` - Logout
- `MoreOutlined` - More menu

