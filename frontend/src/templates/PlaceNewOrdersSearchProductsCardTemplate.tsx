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

import { FC } from 'react';
import { Card, Input } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { 
  FORM_CARD_CONFIG, 
  STANDARD_INPUT_SIZE,
} from './UITemplates';
import type { PlaceNewOrdersSearchProductsCardTemplateProps } from './types';

/**
 * Place New Orders Search Products Card Template
 */
export const PlaceNewOrdersSearchProductsCardTemplate: FC<PlaceNewOrdersSearchProductsCardTemplateProps> = ({
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

