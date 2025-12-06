import { useState } from 'react';
import { Card, Typography, Input, Space, Button, Alert, Divider } from 'antd';
import { SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { DealerProductCard } from '../../templates/DealerProductCard';
import '../NewOrdersTablet.css';

const { Title, Text, Paragraph } = Typography;

/**
 * DEMO PAGE: Dealer Product Card Template
 * 
 * This page demonstrates the standard Dealer Product Card design.
 * Use this as a reference when creating new dealer product interfaces.
 */

const DealerProductCardTemplateDemo = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});
  const [editMode, setEditMode] = useState(true);

  // Sample product data
  const sampleProducts = [
    {
      id: 1,
      name: '6DGA-225(H)',
      product_code: '6DGA-225(H)',
      unit_tp: 1250,
    },
    {
      id: 2,
      name: 'Kingshuk Power',
      product_code: '6DGA-180(H)',
      unit_tp: 1100,
    },
    {
      id: 3,
      name: '6DGA-200(H)',
      product_code: '6DGA-200(H)',
      unit_tp: 1200,
    },
    {
      id: 4,
      name: '6DGA-150(H)',
      product_code: '6DGA-150(H)',
      unit_tp: 1050,
    },
    {
      id: 5,
      name: 'Kingshuk Power Premium',
      product_code: '6DGA-250(H)',
      unit_tp: 1350,
    },
    {
      id: 6,
      name: '6DGA-175(H)',
      product_code: '6DGA-175(H)',
      unit_tp: 1080,
    },
  ];

  const filteredProducts = sampleProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuantityChange = (productId, value) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleClear = (productId) => {
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[productId];
      return newQuantities;
    });
  };

  const handleClearAll = () => {
    setQuantities({});
  };

  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + (qty || 0), 0);

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card style={{ marginBottom: '16px', borderRadius: '8px', background: '#f0f7ff' }}>
        <Title level={3} style={{ marginBottom: '8px' }}>
          <InfoCircleOutlined /> Dealer Product Card Template
        </Title>
        <Paragraph style={{ marginBottom: '16px' }}>
          This template provides a consistent card design for dealer products with quantity input,
          preset buttons, and clear functionality. Based on the Monthly Forecast card design.
        </Paragraph>
        <Alert
          message="Template Usage"
          description={
            <div>
              <Text strong>Import:</Text>
              <pre style={{ marginTop: '8px', background: '#fff', padding: '8px', borderRadius: '4px' }}>
{`import { DealerProductCard } from '../../templates/DealerProductCard';`}
              </pre>
              <Text strong style={{ display: 'block', marginTop: '12px' }}>Usage:</Text>
              <pre style={{ marginTop: '8px', background: '#fff', padding: '8px', borderRadius: '4px' }}>
{`<DealerProductCard
  product={product}
  quantity={quantity}
  onQuantityChange={handleQuantityChange}
  onClear={handleClear}
  canEdit={true}
  labelText="Quantity:"
  presetValues={[5, 10, 15, 20]}
  showClearButton={true}
/>`}
              </pre>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>

      {/* Controls */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px' }}
            allowClear
          />
          <Space>
            <Button onClick={() => setEditMode(!editMode)}>
              {editMode ? 'Disable Edit' : 'Enable Edit'}
            </Button>
            <Button danger onClick={handleClearAll} disabled={totalItems === 0}>
              Clear All
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Product Cards Grid */}
      <Card style={{ borderRadius: '8px', marginBottom: '16px' }}>
        {filteredProducts.length > 0 ? (
          <div className="responsive-product-grid">
            {filteredProducts.map(product => (
              <DealerProductCard
                key={product.id}
                product={product}
                quantity={quantities[product.id] || null}
                onQuantityChange={handleQuantityChange}
                onClear={handleClear}
                canEdit={editMode}
                labelText="Quantity:"
                presetValues={[5, 10, 15, 20]}
                showClearButton={true}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No products found matching your search
          </div>
        )}
      </Card>

      {/* Summary */}
      {totalItems > 0 && (
        <Card style={{ borderRadius: '8px', background: '#f6ffed', border: '1px solid #b7eb8f' }}>
          <Title level={4} style={{ marginBottom: '8px' }}>
            Summary
          </Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>
              <Text strong>Total Products with Quantity:</Text>{' '}
              {Object.keys(quantities).filter(id => quantities[id] > 0).length}
            </Text>
            <Text>
              <Text strong>Total Quantity:</Text> {totalItems}
            </Text>
            <Divider style={{ margin: '8px 0' }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Individual quantities: {Object.entries(quantities)
                .filter(([_, qty]) => qty > 0)
                .map(([id, qty]) => {
                  const product = sampleProducts.find(p => p.id === parseInt(id));
                  return `${product?.product_code}: ${qty}`;
                })
                .join(', ')}
            </Text>
          </Space>
        </Card>
      )}

      {/* Design Specifications */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px', background: '#fffbe6', border: '1px solid #ffe58f' }}>
        <Title level={4} style={{ marginBottom: '16px' }}>
          Design Specifications
        </Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Card Styling:</Text>
            <ul style={{ marginTop: '8px', marginBottom: 0 }}>
              <li>Border radius: 8px</li>
              <li>Box shadow: 0 2px 8px rgba(0,0,0,0.1)</li>
              <li>Body padding: 16px</li>
            </ul>
          </div>
          <div>
            <Text strong>Grid Layout:</Text>
            <ul style={{ marginTop: '8px', marginBottom: 0 }}>
              <li>Uses responsive-product-grid class</li>
              <li>Responsive breakpoints: 140px → 220px</li>
              <li>Gap: 8px → 14px (responsive)</li>
            </ul>
          </div>
          <div>
            <Text strong>Typography:</Text>
            <ul style={{ marginTop: '8px', marginBottom: 0 }}>
              <li>Product name: 14px, strong</li>
              <li>Product code: 12px, secondary</li>
              <li>Label text: 12px</li>
            </ul>
          </div>
          <div>
            <Text strong>Components:</Text>
            <ul style={{ marginTop: '8px', marginBottom: 0 }}>
              <li>InputNumber: size="large", full width</li>
              <li>Preset buttons: size="small", flex layout</li>
              <li>Clear button: danger type, full width</li>
            </ul>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default DealerProductCardTemplateDemo;

