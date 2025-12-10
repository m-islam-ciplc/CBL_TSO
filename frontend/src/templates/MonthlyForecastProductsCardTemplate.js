/**
 * MONTHLY FORECAST PRODUCTS CARD TEMPLATE
 * 
 * Specialized template for the "Products Card Grid" card in Monthly Forecast page.
 * This template displays a grid of product cards with quantity inputs.
 * 
 * Features:
 * - No title (card without title)
 * - Product grid with DealerProductCard components
 * - Empty state message when no products
 * - Uses STANDARD_CARD_CONFIG for styling
 */

import { Card, Button, Space } from 'antd';
import { 
  STANDARD_CARD_CONFIG,
  STANDARD_BUTTON_SIZE,
} from './UITemplates';
import { DealerProductCard } from './DealerProductCard';
import '../pages/NewOrdersTablet.css';

/**
 * Monthly Forecast Products Card Template
 * 
 * @param {Object} props
 * @param {Array} props.products - Array of product objects
 * @param {Object} props.forecastData - Forecast data object: { productId: quantity }
 * @param {Function} props.onQuantityChange - Quantity change handler: (productId, value) => void
 * @param {Function} props.onClearProduct - Clear product handler: (productId) => void
 * @param {boolean} props.canEdit - Whether products are editable
 * @param {string} props.labelText - Label text for quantity input (default: "Monthly Forecast Quantity:")
 * @param {Array} props.presetValues - Preset quantity values (default: [5, 10, 15, 20])
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.resetButton - Reset All button configuration (optional)
 * @param {string} props.resetButton.label - Button label (default: "Reset All")
 * @param {Function} props.resetButton.onClick - onClick handler: () => void
 * @param {Object} props.saveButton - Save All button configuration (optional)
 * @param {string} props.saveButton.label - Button label (default: "Save All")
 * @param {ReactNode} props.saveButton.icon - Button icon (optional)
 * @param {Function} props.saveButton.onClick - onClick handler: () => void
 * @param {boolean} props.saveButton.loading - Whether button is loading (optional)
 * @param {Function} props.getTotalItems - Function to get total items count (optional, for conditional display)
 * @returns {JSX.Element} Monthly Forecast Products card JSX
 */
export const MonthlyForecastProductsCardTemplate = ({
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
          {products.map(product => (
            <DealerProductCard
              key={product.id}
              product={product}
              quantity={forecastData[product.id] || null}
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

      {/* Footer Actions - Inline Buttons */}
      {(resetButton || saveButton) && (!getTotalItems || getTotalItems() > 0) && (
        <div style={{ marginTop: '24px', textAlign: 'right', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
          <Space>
            {resetButton && (
              <Button 
                onClick={resetButton.onClick}
                size={STANDARD_BUTTON_SIZE}
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
          </Space>
        </div>
      )}
    </Card>
  );
};

