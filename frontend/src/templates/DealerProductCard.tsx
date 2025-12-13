import { FC } from 'react';
import { Card, Typography, Button, InputNumber, Space, Tag } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { 
  STANDARD_CARD_CONFIG,
  STANDARD_INPUT_NUMBER_SIZE, 
  STANDARD_BUTTON_SIZE, 
  STANDARD_SPACE_SIZE_SMALL, 
  STANDARD_TAG_STYLE 
} from './UITemplates';
import type { DealerProductCardProps } from './types';

const { Text } = Typography;

/**
 * DealerProductCard Template
 * 
 * Reusable product card component based on Monthly Forecast design.
 * Provides a consistent card layout for dealer products with quantity input,
 * preset buttons, and optional clear functionality.
 */
export const DealerProductCard: FC<DealerProductCardProps> = ({
  product,
  quantity = null,
  onQuantityChange,
  onClear,
  canEdit = true,
  labelText = 'Quantity:',
  presetValues = [5, 10, 15, 20],
  showClearButton = true,
  cardStyle = {},
  bodyStyle = {},
}) => {
  const handleQuantityChange = (value: number | null) => {
    if (onQuantityChange) {
      onQuantityChange(product.id, value);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear(product.id);
    }
  };

  return (
    <Card
      {...STANDARD_CARD_CONFIG}
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        ...STANDARD_CARD_CONFIG.style,
        ...cardStyle,
      }}
      bodyStyle={{
        padding: '16px',
        ...bodyStyle,
      }}
    >
      {/* Product Header */}
      <div style={{ marginBottom: '12px' }}>
        <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
          {product.name}
        </Text>
        <Space size={STANDARD_SPACE_SIZE_SMALL} style={{ fontSize: '12px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {product.product_code}
          </Text>
          {product.unit_tp && (
            <Tag color="blue" style={{ ...STANDARD_TAG_STYLE, fontSize: '11px', marginLeft: '4px' }}>
              TP: {product.unit_tp}
            </Tag>
          )}
        </Space>
      </div>
      
      {/* Quantity Input */}
      <div style={{ marginBottom: '12px' }}>
        <Text style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
          {labelText}
        </Text>
        <InputNumber
          size={STANDARD_INPUT_NUMBER_SIZE}
          min={0}
          value={quantity}
          onChange={handleQuantityChange}
          placeholder="Enter quantity"
          style={{ width: '100%' }}
          controls={true}
          disabled={!canEdit}
          readOnly={!canEdit}
        />
        {canEdit && presetValues && presetValues.length > 0 && (
          <div style={{ 
            display: 'flex', 
            gap: '6px', 
            marginTop: '8px',
            flexWrap: 'nowrap' as const
          }}>
            {presetValues.map(presetQty => (
              <Button
                key={presetQty}
                size={STANDARD_BUTTON_SIZE}
                type={quantity === presetQty ? 'primary' : 'default'}
                onClick={() => handleQuantityChange(presetQty)}
                style={{
                  flex: '1 1 0',
                  fontSize: '12px'
                }}
              >
                {presetQty}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Clear Button */}
      {showClearButton && onClear && (
        <Button
          danger
          icon={<ClearOutlined />}
          onClick={handleClear}
          style={{ width: '100%' }}
          size={STANDARD_BUTTON_SIZE}
          disabled={!canEdit}
        >
          Clear
        </Button>
      )}
    </Card>
  );
};

export default DealerProductCard;

