/**
 * QUOTA ALLOCATION CARD TEMPLATE
 * 
 * Specialized template for Daily Quota Allocation card with custom column widths.
 * This card has unique layout requirements:
 * - Date: narrow (md={2})
 * - Products: wide (flex="auto") - needs more space for multi-select with tags
 * - Territories: medium (md={6})
 * - Quota: narrow (md={1}) - just enough for 4 numbers
 * - Buttons: fixed width
 * 
 * Used in: Quotas page - Allocate Daily Quotas tab
 * Route: /manage-quotas
 */

import { Row, Col, Space, Typography, DatePicker, Input, Button, Card, AutoComplete, Tag } from 'antd';
import {
  UNIVERSAL_CARD_CONFIG,
  STANDARD_FORM_LABEL_STYLE,
  STANDARD_INPUT_SIZE,
  STANDARD_BUTTON_SIZE,
  STANDARD_DATE_PICKER_CONFIG,
  STANDARD_TAG_CONTAINER_STYLE,
  STANDARD_TAG_ITEM_STYLE,
  STANDARD_ROW_GUTTER,
} from './UITemplates';

const { Text } = Typography;

/**
 * Quota Allocation Card Template
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (default: "Allocate Daily Quotas")
 * @param {Object} props.datePicker1 - Date picker configuration
 * @param {Array<Object>} props.formFields - Array of form field configurations
 *   - formFields[0]: Products (autocomplete with multi-select)
 *   - formFields[1]: Territories (autocomplete with multi-select)
 *   - formFields[2]: Quota (input)
 * @param {Array<Object>} props.buttons - Array of button configurations
 * @param {Array} props.gutter - Row gutter configuration (default: STANDARD_ROW_GUTTER)
 * @returns {JSX.Element} Quota allocation card JSX
 */
export const QuotaAllocationCardTemplate = ({
  title = 'Allocate Daily Quotas',
  datePicker1,
  formFields = [],
  buttons = [],
  gutter = STANDARD_ROW_GUTTER,
}) => {
  const [productsField, territoriesField, quotaField] = formFields;

  return (
    <Card title={title} {...UNIVERSAL_CARD_CONFIG} headStyle={{ textAlign: 'left' }}>
      <Row gutter={gutter} align="top" justify="space-between">
        {/* Date Picker - narrow */}
        {datePicker1 && (
          <Col xs={24} sm={12} md={2}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>
                {datePicker1.label || 'Date'}
              </Text>
              <DatePicker
                {...STANDARD_DATE_PICKER_CONFIG}
                value={datePicker1.value}
                onChange={datePicker1.onChange}
                placeholder={datePicker1.placeholder || 'Select date'}
                style={{ width: '100%' }}
                disabledDate={datePicker1.disabledDate}
                dateRender={datePicker1.dateRender}
              />
            </Space>
          </Col>
        )}

        {/* Products - stretch to fill space */}
        {productsField && (
          <Col xs={24} sm={12} flex="auto">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>
                {productsField.label || 'Products'}
              </Text>
              <Space direction="vertical" style={{ width: '100%' }}>
                {productsField.type === 'autocomplete' ? (
                  <>
                    <AutoComplete
                      size={STANDARD_INPUT_SIZE}
                      value={productsField.value}
                      onSearch={productsField.onSearch}
                      onSelect={productsField.onSelect}
                      onChange={productsField.onChange}
                      placeholder={productsField.placeholder || 'Type product name'}
                      style={{ width: '100%' }}
                      options={productsField.options}
                      allowClear={productsField.allowClear !== false}
                    />
                    {productsField.enableTagDisplay && productsField.selectedItems && productsField.selectedItems.length > 0 && (
                      <div style={STANDARD_TAG_CONTAINER_STYLE}>
                        {productsField.selectedItems.map((item) => (
                          <Tag
                            key={item.key}
                            closable
                            onClose={() => productsField.onRemoveItem && productsField.onRemoveItem(item.key)}
                            style={STANDARD_TAG_ITEM_STYLE}
                          >
                            {item.label}
                          </Tag>
                        ))}
                      </div>
                    )}
                  </>
                ) : null}
              </Space>
            </Space>
          </Col>
        )}

        {/* Territories - fixed width (md={6}) */}
        {territoriesField && (
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>
                {territoriesField.label || 'Territories'}
              </Text>
              <Space direction="vertical" style={{ width: '100%' }}>
                {territoriesField.type === 'autocomplete' ? (
                  <>
                    <AutoComplete
                      size={STANDARD_INPUT_SIZE}
                      value={territoriesField.value}
                      onSearch={territoriesField.onSearch}
                      onSelect={territoriesField.onSelect}
                      onChange={territoriesField.onChange}
                      placeholder={territoriesField.placeholder || 'Type territory'}
                      style={{ width: '100%' }}
                      options={territoriesField.options}
                      allowClear={territoriesField.allowClear !== false}
                    />
                    {territoriesField.enableTagDisplay && territoriesField.selectedItems && territoriesField.selectedItems.length > 0 && (
                      <div style={STANDARD_TAG_CONTAINER_STYLE}>
                        {territoriesField.selectedItems.map((item) => (
                          <Tag
                            key={item.key}
                            closable
                            onClose={() => territoriesField.onRemoveItem && territoriesField.onRemoveItem(item.key)}
                            style={STANDARD_TAG_ITEM_STYLE}
                          >
                            {item.label}
                          </Tag>
                        ))}
                      </div>
                    )}
                  </>
                ) : null}
              </Space>
            </Space>
          </Col>
        )}

        {/* Quota - very narrow (just for 4 numbers) */}
        {quotaField && (
          <Col xs={24} sm={12} md={1}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>
                {quotaField.label || 'Quota'}
              </Text>
              {quotaField.type === 'input' ? (
                <Input
                  size={STANDARD_INPUT_SIZE}
                  value={quotaField.value}
                  onChange={quotaField.onChange}
                  onPressEnter={quotaField.onPressEnter}
                  placeholder={quotaField.placeholder || 'Qty'}
                  style={{ width: '100%' }}
                  allowClear={quotaField.allowClear !== false}
                />
              ) : null}
            </Space>
          </Col>
        )}

        {/* Buttons */}
        {buttons.map((button, index) => {
          if (!button) return null;
          return (
            <Col xs={24} sm={12} flex="none" key={`button-${index}`}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong style={{ ...STANDARD_FORM_LABEL_STYLE, opacity: 0, lineHeight: '1.5', display: 'block', minHeight: '20px' }}>
                  &nbsp;
                </Text>
                <Button
                  type={button.type || 'default'}
                  onClick={button.onClick}
                  icon={button.icon}
                  disabled={button.disabled}
                  loading={button.loading}
                  size={STANDARD_BUTTON_SIZE}
                >
                  {button.label || `Button ${index + 1}`}
                </Button>
              </Space>
            </Col>
          );
        })}
      </Row>
    </Card>
  );
};

