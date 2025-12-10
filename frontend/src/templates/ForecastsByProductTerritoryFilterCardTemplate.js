/**
 * FORECASTS BY PRODUCT/TERRITORY FILTER CARD TEMPLATE
 * 
 * Specialized template for the "Filter Forecasts" card in Forecasts by Product/Territory tabs.
 * This template has a specific layout:
 * - Period field (select, maxWidth: '18rem')
 * - Territory field (select, conditional) - only for admin
 * - Search field (input with prefix)
 * - 1 button (Export Excel) - right aligned
 * 
 * Used in: Reports page - Forecasts by Product tab and Forecasts by Territory tab
 * Route: /reports
 */

import { Row, Col, Space, Typography, Select, Input, Button, Card } from 'antd';
import {
  UNIVERSAL_CARD_CONFIG,
  STANDARD_FORM_LABEL_STYLE,
  STANDARD_INPUT_SIZE,
  STANDARD_BUTTON_SIZE,
  COMPACT_ROW_GUTTER,
} from './UITemplates';

const { Text } = Typography;
const { Option } = Select;

/**
 * Forecasts By Product/Territory Filter Card Template
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (default: "Filter Forecasts")
 * @param {Array<Object>} props.formFields - Array of form field configurations
 *   - formFields[0]: Period (select, maxWidth: '18rem')
 *   - formFields[1]: Territory (select, conditional) - optional
 *   - formFields[2]: Search (input with prefix)
 * @param {Array<Object>} props.buttons - Array of button configurations (1 button: Export Excel)
 * @param {Array} props.gutter - Row gutter configuration (default: COMPACT_ROW_GUTTER)
 * @returns {JSX.Element} Forecasts By Product/Territory Filter card JSX
 */
export const ForecastsByProductTerritoryFilterCardTemplate = ({
  title = 'Filter Forecasts',
  formFields = [],
  buttons = [],
  gutter = COMPACT_ROW_GUTTER,
}) => {
  // Ensure we have exactly 3 form fields (pad with empty if needed)
  const paddedFormFields = [...formFields];
  while (paddedFormFields.length < 3) {
    paddedFormFields.push(null);
  }
  const displayFormFields = paddedFormFields.slice(0, 3);

  // Ensure we have exactly 1 button (pad with null if needed)
  const paddedButtons = [...buttons];
  while (paddedButtons.length < 1) {
    paddedButtons.push(null);
  }
  const displayButtons = paddedButtons.slice(0, 1);

  return (
    <Card title={title} {...UNIVERSAL_CARD_CONFIG} headStyle={{ textAlign: 'left' }}>
      <Row gutter={gutter} align="top">
        {/* 3 Form Fields */}
        {displayFormFields.map((field, index) => {
          if (!field) return null;
          const colFlex = field.flex === 'auto' ? '1 1 auto' : (field.flex || 1);
          const colStyle = field.flex === 'auto' 
            ? { minWidth: 0 } 
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
                      value={field.value}
                      onChange={field.onChange}
                      onPressEnter={field.onPressEnter}
                      placeholder={field.placeholder || `Enter ${field.label || 'value'}`}
                      style={{ width: '100%' }}
                      prefix={field.prefix}
                      allowClear={field.allowClear !== false}
                    />
                  ) : (
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
                  )}
                </Space>
              </Space>
            </Col>
          );
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


