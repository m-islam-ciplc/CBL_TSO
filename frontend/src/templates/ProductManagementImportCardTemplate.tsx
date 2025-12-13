/**
 * PRODUCT MANAGEMENT IMPORT CARD TEMPLATE
 *
 * Specialized template for the "Import Products" card in Product Management page.
 * This template displays import/export buttons in the card's extra prop.
 */

import { FC } from 'react';
import { Card, Space, Button, Upload } from 'antd';
import { IMPORT_CARD_CONFIG, STANDARD_UPLOAD_CONFIG } from './UITemplates';
import type { ImportCardTemplateProps } from './types';

/**
 * Product Management Import Card Template
 */
export const ProductManagementImportCardTemplate: FC<ImportCardTemplateProps> = ({
  title = 'Import Products',
  uploadButton,
  downloadButton,
}) => {
  return (
    <Card
      title={title}
      {...IMPORT_CARD_CONFIG}
      extra={
        <Space>
          {uploadButton && (
            <Upload
              {...STANDARD_UPLOAD_CONFIG}
              beforeUpload={uploadButton.onUpload}
            >
              <Button
                type="primary"
                icon={uploadButton.icon}
                loading={uploadButton.loading}
              >
                {uploadButton.label || 'Import Products (Excel)'}
              </Button>
            </Upload>
          )}
          {downloadButton && (
            <Button
              icon={downloadButton.icon}
              onClick={downloadButton.onClick}
            >
              {downloadButton.label || 'Download Template'}
            </Button>
          )}
        </Space>
      }
    />
  );
};

export default ProductManagementImportCardTemplate;

