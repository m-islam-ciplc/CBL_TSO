/**
 * DAILY DEMAND PRODUCT SEARCH CARD TEMPLATE
 * 
 * Specialized template for the "Product Search" card in Daily Demand page.
 * This template displays a search input field for searching products.
 * 
 * Features:
 * - No title (card without title)
 * - Search Input with prefix icon and optional clear button
 * - Uses STANDARD_CARD_CONFIG for styling
 */

import { Card, Input } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { 
  STANDARD_CARD_CONFIG, 
  STANDARD_INPUT_SIZE,
} from './UITemplates';

/**
 * Daily Demand Product Search Card Template
 * 
 * @param {Object} props
 * @param {Object} props.searchInput - Search input configuration
 * @param {string} props.searchInput.value - Search value
 * @param {Function} props.searchInput.onChange - onChange handler: (e) => void
 * @param {string} props.searchInput.placeholder - Placeholder text (default: "Search products by name or code...")
 * @param {Function} props.searchInput.onClear - onClear handler: () => void (optional, shows clear button if provided)
 * @returns {JSX.Element} Daily Demand Product Search card JSX
 */
export const DailyDemandProductSearchCardTemplate = ({
  searchInput,
}) => {
  return (
    <Card 
      {...STANDARD_CARD_CONFIG}
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
                color: '#999'
              }}
            />
          ) : null
        }
        value={searchInput?.value || ''}
        onChange={searchInput?.onChange}
        style={{ marginBottom: '12px' }}
      />
    </Card>
  );
};


