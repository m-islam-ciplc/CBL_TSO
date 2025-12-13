/**
 * ORDERS & DEMANDS FILTER ORDERS TEMPLATE
 * 
 * Specialized template for the "Filter Orders" card in Orders & Demands page.
 * This template has a specific layout:
 * - 2 date pickers (Start Date, End Date Optional)
 * - Order Type field (fixed width)
 * - Territory field (flex: auto to stretch and fill space)
 * - TSO User field (conditional, fixed width)
 * - Dealer field (fixed width)
 * - Product field (fixed width) - shown if TSO User is not shown
 * - 2 buttons (Refresh, Clear) - right aligned
 */

import { FC } from 'react';
import type { CSSProperties } from 'react';
import { Row, Col, Space, Typography, DatePicker, Input, Select, Button, Card, AutoComplete, Tag } from 'antd';
import type { Gutter } from 'antd/es/grid/row';
import {
  UNIVERSAL_CARD_CONFIG,
  STANDARD_FORM_LABEL_STYLE,
  STANDARD_INPUT_SIZE,
  STANDARD_BUTTON_SIZE,
  STANDARD_DATE_PICKER_CONFIG,
  STANDARD_TAG_CONTAINER_STYLE,
  STANDARD_TAG_ITEM_STYLE,
  COMPACT_ROW_GUTTER,
} from './UITemplates';
import type { OrdersAndDemandsFilterOrdersTemplateProps, FormField } from './types';

const { Text } = Typography;
const { Option } = Select;

/**
 * Orders & Demands Filter Orders Template
 */
export const OrdersAndDemandsFilterOrdersTemplate: FC<OrdersAndDemandsFilterOrdersTemplateProps> = ({
  title = 'Filter Orders & Demands',
  datePicker1,
  datePicker2,
  formFields = [],
  buttons = [],
  gutter = COMPACT_ROW_GUTTER,
}) => {
  // Ensure we have exactly 4 form fields (pad with empty if needed)
  const paddedFormFields = [...formFields];
  while (paddedFormFields.length < 4) {
    paddedFormFields.push(null);
  }
  const displayFormFields = paddedFormFields.slice(0, 4);

  // Ensure we have exactly 2 buttons (pad with null if needed)
  const paddedButtons = [...buttons];
  while (paddedButtons.length < 2) {
    paddedButtons.push(null);
  }
  const displayButtons = paddedButtons.slice(0, 2);

  const renderFormField = (field: FormField, index: number) => {
    const colFlex = field.flex === 'auto' ? 'auto' : (field.flex || 1);
    const colStyle = field.flex === 'auto' 
      ? { flex: '1 1 auto', minWidth: 0 } 
      : { maxWidth: field.maxWidth || '12.5rem' };
    
    return (
      <Col xs={24} sm={12} flex={colFlex} style={colStyle} key={`form-field-${index}`}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong style={STANDARD_FORM_LABEL_STYLE}>
            {field.label || `Field ${index + 1}`}
          </Text>
          <Space direction="vertical" style={{ width: '100%' }}>
            {field.type === 'input' ? (
              <Input
                size={STANDARD_INPUT_SIZE}
                value={field.value as string | undefined}
                onChange={(e) => field.onChange(e.target.value)}
                onPressEnter={field.onPressEnter}
                placeholder={field.placeholder || `Enter ${field.label || 'value'}`}
                style={{ width: '100%' }}
                prefix={field.prefix}
                allowClear={field.allowClear !== false}
              />
            ) : field.type === 'autocomplete' ? (
              <>
                <AutoComplete
                  size={STANDARD_INPUT_SIZE}
                  value={field.value as string | undefined}
                  onSearch={field.onSearch}
                  onSelect={field.onSelect}
                  onChange={field.onChange}
                  placeholder={field.placeholder || `Type ${field.label || 'value'}`}
                  style={{ width: '100%' }}
                  options={field.options}
                  allowClear={field.allowClear !== false}
                />
                {field.enableTagDisplay && field.selectedItems && field.selectedItems.length > 0 && (
                  <div style={STANDARD_TAG_CONTAINER_STYLE as CSSProperties}>
                    {field.selectedItems.map((item) => (
                      <Tag
                        key={item.key}
                        closable
                        onClose={() => field.onRemoveItem && field.onRemoveItem(item.key)}
                        style={STANDARD_TAG_ITEM_STYLE}
                      >
                        {item.label}
                      </Tag>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <Select
                  size={STANDARD_INPUT_SIZE}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={field.placeholder || `Select ${field.label || 'option'}`}
                  style={{ width: '100%' }}
                  allowClear={field.allowClear !== false}
                  showSearch={field.showSearch !== false}
                  loading={field.loading}
                  disabled={field.disabled}
                  filterOption={field.showSearch !== false ? (input, option) => {
                    const optionText = option?.children?.toString() || '';
                    return optionText.toLowerCase().includes(input.toLowerCase());
                  } : undefined}
                >
                  {field.options && field.options.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
                {field.enableTagDisplay && field.selectedItems && field.selectedItems.length > 0 && (
                  <div style={STANDARD_TAG_CONTAINER_STYLE as CSSProperties}>
                    {field.selectedItems.map((item) => (
                      <Tag
                        key={item.key}
                        closable
                        onClose={() => field.onRemoveItem && field.onRemoveItem(item.key)}
                        style={STANDARD_TAG_ITEM_STYLE}
                      >
                        {item.label}
                      </Tag>
                    ))}
                  </div>
                )}
              </>
            )}
          </Space>
        </Space>
      </Col>
    );
  };

  return (
    <Card 
      title={title} 
      {...UNIVERSAL_CARD_CONFIG}
      headStyle={{ textAlign: 'left' }}
    >
      <Row gutter={gutter as Gutter} align="top">
        {/* Order Type Field (First Form Field) */}
        {displayFormFields[0] && renderFormField(displayFormFields[0], 0)}

        {/* Date Pickers */}
        {datePicker1 && (
          <Col xs={24} sm={12} flex={1} style={{ maxWidth: '12.5rem' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>
                {datePicker1.label || 'Start Date'}
              </Text>
              <DatePicker
                {...STANDARD_DATE_PICKER_CONFIG}
                value={datePicker1.value}
                onChange={datePicker1.onChange}
                placeholder={datePicker1.placeholder || 'Select start date'}
                style={{ width: '100%' }}
                disabledDate={datePicker1.disabledDate}
                dateRender={datePicker1.dateRender}
                size={STANDARD_DATE_PICKER_CONFIG.size as 'small' | 'middle' | 'large'}
                format={STANDARD_DATE_PICKER_CONFIG.format}
              />
            </Space>
          </Col>
        )}
        {datePicker2 && (
          <Col xs={24} sm={12} flex={1} style={{ maxWidth: '12.5rem' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>
                {datePicker2.label || 'End Date (Optional)'}
              </Text>
              <DatePicker
                {...STANDARD_DATE_PICKER_CONFIG}
                value={datePicker2.value}
                onChange={datePicker2.onChange}
                placeholder={datePicker2.placeholder || 'Select end date (optional)'}
                style={{ width: '100%' }}
                disabledDate={datePicker2.disabledDate}
                dateRender={datePicker2.dateRender}
                size={STANDARD_DATE_PICKER_CONFIG.size as 'small' | 'middle' | 'large'}
                format={STANDARD_DATE_PICKER_CONFIG.format}
              />
            </Space>
          </Col>
        )}

        {/* Remaining Form Fields (skip first one, already rendered) */}
        {displayFormFields.slice(1).map((field, index) => {
          if (!field) return null;
          return renderFormField(field, index + 1);
        })}

        {/* Buttons */}
        {displayButtons.map((button, index) => {
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

