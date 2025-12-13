/**
 * DAILY DEMAND MULTI-DAY SELECT PRODUCTS CARD TEMPLATE
 * 
 * Specialized template for the "Select Products" card in Daily Demand Multi-Day page.
 * This template displays tabs for each selected date with product search and product grid.
 * 
 * Features:
 * - Tabs for each selected date
 * - Product search input
 * - Product grid with DealerProductCard components
 * - Submit button (conditional)
 */

import { FC } from 'react';
import { Card, Typography, Tabs, Input, Button, Row, Col } from 'antd';
import { SearchOutlined, CheckOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { 
  STANDARD_CARD_CONFIG, 
  STANDARD_TABS_CONFIG, 
  STANDARD_BUTTON_SIZE 
} from './UITemplates';
import { DealerProductCard } from './DealerProductCard';
import type { DailyDemandMultiDaySelectProductsCardTemplateProps } from './types';
import '../pages/NewOrdersTablet.css';

const { Title } = Typography;
const { TabPane } = Tabs;

/**
 * Daily Demand Multi-Day Select Products Card Template
 */
export const DailyDemandMultiDaySelectProductsCardTemplate: FC<DailyDemandMultiDaySelectProductsCardTemplateProps> = ({
  selectedDates = [],
  activeDateTab,
  setActiveDateTab,
  removeDate,
  searchTerm,
  onSearchChange,
  filteredProducts = [],
  quantities = {},
  onQuantityChange,
  onClearProduct,
  presetValues = [5, 10, 15, 20],
  getTotalItems,
  onSubmit,
  loading = false,
}) => {
  if (selectedDates.length === 0) {
    return null;
  }

  return (
    <Card 
      {...STANDARD_CARD_CONFIG}
      bodyStyle={{ ...STANDARD_CARD_CONFIG.bodyStyle, paddingBottom: '4px', paddingTop: '12px' }}
    >
      <div className="daily-demand-tabs-wrapper" style={{ marginBottom: '-12px' }}>
        <Tabs 
          {...STANDARD_TABS_CONFIG}
          activeKey={activeDateTab || selectedDates[0]?.format('YYYY-MM-DD')}
          onChange={setActiveDateTab}
          type="editable-card"
          onEdit={(targetKey, action) => {
            if (action === 'remove' && selectedDates.length > 1) {
              removeDate && removeDate(targetKey as string);
            }
          }}
          hideAdd
        >
        {selectedDates.map((date) => {
          const dateStr = date.format('YYYY-MM-DD');
          const isToday = date.isSame(dayjs(), 'day');
          const isTomorrow = date.isSame(dayjs().add(1, 'day'), 'day');
          
          let tabLabel = date.format('MMM D');
          if (isToday) tabLabel += ' (Today)';
          else if (isTomorrow) tabLabel += ' (Tomorrow)';

          return (
            <TabPane
              tab={
                <span>
                  <CalendarOutlined /> {tabLabel}
                </span>
              }
              key={dateStr}
            >
              <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
                <Col>
                  <Title level={5} style={{ marginBottom: 0 }}>
                    Select Products for {date.format('MMMM D, YYYY')}
                  </Title>
                </Col>
                <Col>
                  <Input
                    placeholder="Search products..."
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={onSearchChange}
                    style={{ maxWidth: '300px' }}
                    allowClear
                  />
                </Col>
              </Row>

              {/* Product Cards Grid */}
              {filteredProducts.length > 0 ? (
                <div className="responsive-product-grid">
                  {filteredProducts.map((product) => {
                    const quantityKey = `${dateStr}_${product.id}`;
                    const quantity = quantities[quantityKey] || 0;

                    const handleProductQuantityChange = (productId: number | string, value: number | null) => {
                      if (onQuantityChange) {
                        onQuantityChange(dateStr, productId, value);
                      }
                    };

                    const handleProductClear = (productId: number | string) => {
                      if (onClearProduct) {
                        onClearProduct(dateStr, productId);
                      }
                    };

                    return (
                      <DealerProductCard
                        key={product.id}
                        product={product}
                        quantity={quantity || null}
                        onQuantityChange={handleProductQuantityChange}
                        onClear={handleProductClear}
                        canEdit={true}
                        labelText="Quantity:"
                        presetValues={presetValues}
                        showClearButton={true}
                      />
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  {searchTerm ? 'No products found matching your search' : 'No products assigned to your dealer account'}
                </div>
              )}
            </TabPane>
          );
        })}
        </Tabs>
      </div>

      {/* Submit Button */}
      {getTotalItems && getTotalItems() > 0 && (
        <div style={{ marginTop: '24px', textAlign: 'right', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={onSubmit}
            loading={loading}
            size={STANDARD_BUTTON_SIZE}
          >
            Submit All Daily Demands ({getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''})
          </Button>
        </div>
      )}
    </Card>
  );
};

