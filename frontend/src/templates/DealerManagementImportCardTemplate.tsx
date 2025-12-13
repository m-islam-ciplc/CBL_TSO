/**
 * DEALER MANAGEMENT IMPORT CARD TEMPLATE
 *
 * Specialized template for the "Import Dealers" card in Dealer Management page.
 * This template displays import/export buttons in the card's extra prop.
 */

import { FC } from 'react';
import { Card, Space, Button, Upload } from 'antd';
import { IMPORT_CARD_CONFIG, STANDARD_UPLOAD_CONFIG } from './UITemplates';
import type { ImportCardTemplateProps } from './types';

/**
 * Dealer Management Import Card Template
 */
export const DealerManagementImportCardTemplate: FC<ImportCardTemplateProps> = ({
  title = 'Import Dealers',
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
                {uploadButton.label || 'Import Dealers (Excel)'}
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

export default DealerManagementImportCardTemplate;

