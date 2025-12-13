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

import { FC } from 'react';
import type { CSSProperties } from 'react';
import { Row, Col, Space, Typography, DatePicker, Input, Button, Card, AutoComplete, Tag } from 'antd';
import type { Gutter } from 'antd/es/grid/row';
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
import type { QuotaAllocationCardTemplateProps, FormAutoCompleteField, FormInputField } from './types';

const { Text } = Typography;

/**
 * Quota Allocation Card Template
 */
export const QuotaAllocationCardTemplate: FC<QuotaAllocationCardTemplateProps> = ({
  title = 'Allocate Daily Quotas',
  datePicker1,
  formFields = [],
  buttons = [],
  gutter = STANDARD_ROW_GUTTER,
}) => {
  const [productsField, territoriesField, quotaField] = formFields;

  return (
    <Card title={title} {...UNIVERSAL_CARD_CONFIG} headStyle={{ textAlign: 'left' }}>
      <Row gutter={gutter as Gutter} align="top" justify="space-between">
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
                size={STANDARD_DATE_PICKER_CONFIG.size as 'small' | 'middle' | 'large'}
                format={STANDARD_DATE_PICKER_CONFIG.format}
              />
            </Space>
          </Col>
        )}

        {/* Products - stretch to fill space */}
        {productsField && productsField.type === 'autocomplete' && (
          <Col xs={24} sm={12} flex="auto">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>
                {productsField.label || 'Products'}
              </Text>
              <Space direction="vertical" style={{ width: '100%' }}>
                <AutoComplete
                  size={STANDARD_INPUT_SIZE}
                  value={productsField.value as string | undefined}
                  onSearch={productsField.onSearch}
                  onSelect={productsField.onSelect}
                  onChange={productsField.onChange}
                  placeholder={productsField.placeholder || 'Type product name'}
                  style={{ width: '100%' }}
                  options={productsField.options}
                  allowClear={productsField.allowClear !== false}
                />
                {productsField.enableTagDisplay && productsField.selectedItems && productsField.selectedItems.length > 0 && (
                  <div style={STANDARD_TAG_CONTAINER_STYLE as CSSProperties}>
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
              </Space>
            </Space>
          </Col>
        )}

        {/* Territories - fixed width (md={6}) */}
        {territoriesField && territoriesField.type === 'autocomplete' && (
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>
                {territoriesField.label || 'Territories'}
              </Text>
              <Space direction="vertical" style={{ width: '100%' }}>
                <AutoComplete
                  size={STANDARD_INPUT_SIZE}
                  value={territoriesField.value as string | undefined}
                  onSearch={territoriesField.onSearch}
                  onSelect={territoriesField.onSelect}
                  onChange={territoriesField.onChange}
                  placeholder={territoriesField.placeholder || 'Type territory'}
                  style={{ width: '100%' }}
                  options={territoriesField.options}
                  allowClear={territoriesField.allowClear !== false}
                />
                {territoriesField.enableTagDisplay && territoriesField.selectedItems && territoriesField.selectedItems.length > 0 && (
                  <div style={STANDARD_TAG_CONTAINER_STYLE as CSSProperties}>
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
              </Space>
            </Space>
          </Col>
        )}

        {/* Quota - very narrow (just for 4 numbers) */}
        {quotaField && quotaField.type === 'input' && (
          <Col xs={24} sm={12} md={1}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={STANDARD_FORM_LABEL_STYLE}>
                {quotaField.label || 'Quota'}
              </Text>
              <Input
                size={STANDARD_INPUT_SIZE}
                value={quotaField.value as string | undefined}
                onChange={(e) => quotaField.onChange(e.target.value)}
                onPressEnter={quotaField.onPressEnter}
                placeholder={quotaField.placeholder || 'Qty'}
                style={{ width: '100%' }}
                allowClear={quotaField.allowClear !== false}
              />
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

