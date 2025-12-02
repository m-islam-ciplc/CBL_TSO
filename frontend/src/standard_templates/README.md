# Standard Templates

This folder contains standardized design templates for reusable UI components across the application.

## Purpose

These templates ensure **design consistency** across all pages and components. When creating new features or modifying existing ones, always refer to these templates to maintain a uniform look and feel.

## Available Templates

### 1. ExpandableTableTemplate
- **File**: `ExpandableTableTemplate.js` and `ExpandableTableTemplate.md`
- **Purpose**: Standard design for all expandable tables
- **Source**: Based on Daily Demand Orders table in `DealerReports.js`
- **Usage**: Import `STANDARD_EXPANDABLE_TABLE_CONFIG` or use `StandardExpandableTable` component

## How to Use

1. **Before creating a new component**: Check if a template exists in this folder
2. **Import the template**: Use the provided configuration objects or components
3. **Follow the design specs**: Match fonts, colors, spacing, and layout exactly
4. **Reference the documentation**: Read the `.md` files for detailed specifications

## Adding New Templates

When creating a new template:
1. Create both `.js` (implementation) and `.md` (documentation) files
2. Base the template on an existing, approved component
3. Document all design specifications (fonts, colors, spacing, etc.)
4. Include usage examples
5. Update this README

## Enforcement

**IMPORTANT**: All new components MUST follow the templates in this folder. This is a mandatory requirement for design consistency.





