/**
 * TRANSPORT MANAGEMENT IMPORT CARD TEMPLATE
 * 
 * Specialized template for the "Import Transports" card in Transport Management page.
 * This template displays import/export buttons in the card's extra prop.
 * 
 * Features:
 * - Title: "Import Transports"
 * - Upload button and Download Template button in extra prop
 * - Uses IMPORT_CARD_CONFIG for styling
 */

import { Card, Space, Button, Upload } from 'antd';
import { IMPORT_CARD_CONFIG, STANDARD_UPLOAD_CONFIG } from './UITemplates';

/**
 * Transport Management Import Card Template
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (default: "Import Transports")
 * @param {Object} props.uploadButton - Upload button configuration
 * @param {string} props.uploadButton.label - Upload button label (default: "Import Transports (Excel)")
 * @param {ReactNode} props.uploadButton.icon - Upload button icon (optional)
 * @param {Function} props.uploadButton.onUpload - File upload handler: (file) => void | false
 * @param {boolean} props.uploadButton.loading - Whether upload is loading (optional)
 * @param {Object} props.downloadButton - Download template button configuration
 * @param {string} props.downloadButton.label - Download button label (default: "Download Template")
 * @param {ReactNode} props.downloadButton.icon - Download button icon (optional)
 * @param {Function} props.downloadButton.onClick - onClick handler: () => void
 * @returns {JSX.Element} Transport Management Import card JSX
 */
export const TransportManagementImportCardTemplate = ({
  title = 'Import Transports',
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
                {uploadButton.label || 'Import Transports (Excel)'}
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


