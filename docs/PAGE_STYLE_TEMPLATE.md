# Page Style Template

**Template Page**: `ProductQuotaManagement.js`

All pages MUST follow this exact structure and styling. This ensures consistency across the entire application.

## Page Structure

```jsx
<div>
  <Title level={3} style={{ marginBottom: '8px' }}>
    Page Title
  </Title>
  <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
    Page subtitle description
  </Text>

  {/* Content Cards */}
  <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
    {/* Card content */}
  </Card>
</div>
```

## Required Elements

### 1. Container
- **Wrapper**: Simple `<div>` wrapper
- **NO padding** on outer div
- **NO background color** on outer div
- **NO minHeight** or other layout styles on outer div

### 2. Page Title
- **Component**: `Title` from Ant Design Typography
- **Level**: `level={3}`
- **Style**: `style={{ marginBottom: '8px' }}`
- **Font**: Default Ant Design Title level 3 (no custom fontSize)
- **Alignment**: Left-aligned (default)
- **Color**: Default black (no custom color)

### 3. Page Subtitle
- **Component**: `Text` from Ant Design Typography
- **Type**: `type="secondary"`
- **Style**: `style={{ marginBottom: '24px', display: 'block' }}`
- **Font**: Default Ant Design Text secondary (no custom fontSize)
- **Alignment**: Left-aligned (default)

### 4. Cards

#### Cards WITH Titles
```jsx
<Card 
  title="Card Title" 
  style={{ marginBottom: '16px', borderRadius: '8px' }} 
  bodyStyle={{ padding: '12px' }}
>
  {/* Content */}
</Card>
```

#### Cards WITHOUT Titles
```jsx
<Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
  {/* Content */}
</Card>
```

**Card Styling Rules:**
- **Margin Bottom**: Always `'16px'` (string, not number)
- **Border Radius**: Always `'8px'` (string, not number)
- **Body Padding**: `'12px'` ONLY for cards with titles
- **No bodyStyle**: For cards without titles (uses Ant Design default)

## Spacing Standards

- **Title margin**: `marginBottom: '8px'`
- **Subtitle margin**: `marginBottom: '24px'`
- **Card margin**: `marginBottom: '16px'`
- **Card body padding** (titled cards only): `padding: '12px'`

## Font Standards

- **Title**: Ant Design Title level 3 (default size, ~20px)
- **Subtitle**: Ant Design Text secondary (default size, ~14px)
- **No custom fontSize** unless absolutely necessary for specific UI elements

## Border Standards

- **Card border radius**: `'8px'` (matches theme `borderRadiusLG: 8`)
- **Consistent across all cards**

## Examples

### ✅ CORRECT - Admin Page
```jsx
<div>
  <Title level={3} style={{ marginBottom: '8px' }}>
    Manage Products
  </Title>
  <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
    Import and manage product database
  </Text>

  <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
    {/* Content */}
  </Card>
</div>
```

### ✅ CORRECT - Page with Titled Card
```jsx
<div>
  <Title level={3} style={{ marginBottom: '8px' }}>
    Daily Quota Management
  </Title>
  <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
    Allocate daily sales quotas by territory and monitor consumption in real time.
  </Text>

  <Card 
    title="Allocate Daily Quotas" 
    style={{ marginBottom: '16px', borderRadius: '8px' }} 
    bodyStyle={{ padding: '12px' }}
  >
    {/* Content */}
  </Card>
</div>
```

### ❌ WRONG - Extra Container Padding
```jsx
<div style={{ padding: '16px', backgroundColor: '#f5f5f5' }}>
  {/* NO - Don't add padding or background to outer div */}
</div>
```

### ❌ WRONG - Inconsistent Margins
```jsx
<Title level={3} style={{ marginBottom: '16px' }}>
  {/* NO - Should be '8px' */}
</Title>

<Card style={{ marginBottom: '12px', borderRadius: '8px' }}>
  {/* NO - Should be '16px' */}
</Card>
```

### ❌ WRONG - Custom Font Sizes
```jsx
<Title level={3} style={{ marginBottom: '8px', fontSize: '18px' }}>
  {/* NO - Use default Title level 3 size */}
</Title>

<Text type="secondary" style={{ marginBottom: '24px', fontSize: '16px' }}>
  {/* NO - Use default Text secondary size */}
</Text>
```

## Special Cases

### Product Grid Cards (NewOrdersTablet)
- Product cards in grid layouts may use `bodyStyle={{ padding: '6px' }}` for compact display
- This is the ONLY exception to the `'12px'` padding rule
- Only applies to small product cards in responsive grids

### Dashboard Statistic Cards
- Gradient background cards may have different styling
- Still follow `borderRadius: '8px'` and `marginBottom: '16px'`

## Checklist for New Pages

- [ ] Outer div has NO padding or background
- [ ] Title is `level={3}` with `marginBottom: '8px'`
- [ ] Subtitle is `type="secondary"` with `marginBottom: '24px', display: 'block'`
- [ ] All cards have `marginBottom: '16px'` and `borderRadius: '8px'`
- [ ] Cards with titles have `bodyStyle={{ padding: '12px' }}`
- [ ] Cards without titles have NO bodyStyle
- [ ] No custom font sizes on title/subtitle
- [ ] All spacing values are strings (e.g., `'16px'` not `16`)

## Reference Implementation

See `frontend/src/pages/ProductQuotaManagement.js` for the complete reference implementation.

