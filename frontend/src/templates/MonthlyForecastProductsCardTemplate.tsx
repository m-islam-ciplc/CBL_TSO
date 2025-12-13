/**
 * MONTHLY FORECAST PRODUCTS CARD TEMPLATE
 *
 * Specialized template for the "Products Card Grid" card in Monthly Forecast page.
 * Displays a grid of product cards with quantity inputs.
 */

import { FC } from 'react';
import { Card, Button, Space } from 'antd';
import {
  STANDARD_CARD_CONFIG,
  STANDARD_BUTTON_SIZE,
} from './UITemplates';
import { DealerProductCard } from './DealerProductCard';
import type { MonthlyForecastProductsCardTemplateProps } from './types';
import '../pages/NewOrdersTablet.css';

export const MonthlyForecastProductsCardTemplate: FC<MonthlyForecastProductsCardTemplateProps> = ({
  products = [],
  forecastData = {},
  onQuantityChange,
  onClearProduct,
  canEdit = true,
  labelText = 'Monthly Forecast Quantity:',
  presetValues = [5, 10, 15, 20],
  loading = false,
  resetButton,
  saveButton,
  getTotalItems,
}) => {
  return (
    <Card {...STANDARD_CARD_CONFIG}>
      {products.length > 0 ? (
        <div className="responsive-product-grid">
          {products.map((product) => (
            <DealerProductCard
              key={product.id}
              product={product}
              quantity={forecastData[product.id] ?? null}
              onQuantityChange={onQuantityChange}
              onClear={onClearProduct}
              canEdit={canEdit}
              labelText={labelText}
              presetValues={presetValues}
              showClearButton={true}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          {loading ? 'Loading products...' : 'No products assigned to this dealer'}
        </div>
      )}

      {(resetButton || saveButton) && (
        <Space style={{ marginTop: '16px' }}>
          {resetButton && (
            <Button 
              onClick={resetButton.onClick}
              size={STANDARD_BUTTON_SIZE}
              type={resetButton.type || 'default'}
              icon={resetButton.icon}
              disabled={resetButton.disabled}
              loading={resetButton.loading}
            >
              {resetButton.label || 'Reset All'}
            </Button>
          )}
          {saveButton && (
            <Button 
              type="primary"
              icon={saveButton.icon}
              onClick={saveButton.onClick}
              loading={saveButton.loading}
              size={STANDARD_BUTTON_SIZE}
            >
              {saveButton.label || 'Save All'}
            </Button>
          )}
          {getTotalItems && (
            <span style={{ color: '#555', marginLeft: '8px' }}>
              {getTotalItems()} items
            </span>
          )}
        </Space>
      )}
    </Card>
  );
};

export default MonthlyForecastProductsCardTemplate;

