/**
 * PLACE NEW ORDERS SEARCH PRODUCTS CARD TEMPLATE
 * 
 * Specialized template for the "Search Products" card in Place New Orders page.
 * This template displays a search input field for searching products.
 * 
 * Features:
 * - Title: "Search Products"
 * - Search Input with prefix icon and optional clear button
 * - Uses FORM_CARD_CONFIG for styling
 */

import { Card, Input } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { 
  FORM_CARD_CONFIG, 
  STANDARD_INPUT_SIZE,
} from './UITemplates';

/**
 * Place New Orders Search Products Card Template
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (default: "Search Products")
 * @param {Object} props.searchInput - Search input configuration
 * @param {string} props.searchInput.value - Search value
 * @param {Function} props.searchInput.onChange - onChange handler: (e) => void
 * @param {string} props.searchInput.placeholder - Placeholder text (default: "Search products by name or code...")
 * @param {Function} props.searchInput.onClear - onClear handler: () => void (optional, shows clear button if provided)
 * @returns {JSX.Element} Place New Orders Search Products card JSX
 */
export const PlaceNewOrdersSearchProductsCardTemplate = ({
  title = 'Search Products',
  searchInput,
}) => {
  return (
    <Card 
      title={title} 
      {...FORM_CARD_CONFIG}
    >
      <Input
        size={STANDARD_INPUT_SIZE}
        placeholder={searchInput?.placeholder || 'Search products by name or code...'}
        prefix={<SearchOutlined />}
        suffix={
          searchInput?.value && searchInput?.onClear ? (
            <CloseOutlined 
              onClick={searchInput.onClear}
              style={{ 
                cursor: 'pointer', 
                color: '#666',
                fontSize: '14px',
                padding: '4px',
                borderRadius: '4px',
                backgroundColor: '#f0f0f0',
                minWidth: '20px',
                minHeight: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          ) : null
        }
        value={searchInput?.value || ''}
        onChange={searchInput?.onChange}
        style={{ 
          fontSize: '14px',
          borderRadius: '6px'
        }}
      />
    </Card>
  );
};


