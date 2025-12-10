/**
 * MONTHLY FORECAST WARNING CARD TEMPLATE
 * 
 * Specialized template for warning/info cards in Monthly Forecast page.
 * This template displays submitted warning or historical info messages.
 * 
 * Features:
 * - No title (card without title)
 * - Warning card (submitted forecast warning) - yellow background
 * - Info card (historical forecast info) - gray background
 * - Uses custom styling for each type
 */

import { Card, Row, Col, Typography } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Monthly Forecast Warning Card Template
 * 
 * @param {Object} props
 * @param {string} props.type - Card type: 'warning' (submitted) or 'info' (historical) (default: 'warning')
 * @param {string|ReactNode} props.message - Message to display
 * @param {ReactNode} props.icon - Icon to display (optional, defaults based on type)
 * @returns {JSX.Element} Monthly Forecast Warning card JSX
 */
export const MonthlyForecastWarningCardTemplate = ({
  type = 'warning',
  message,
  icon,
}) => {
  const isWarning = type === 'warning';
  const defaultIcon = isWarning ? null : <HistoryOutlined />;
  const displayIcon = icon !== undefined ? icon : defaultIcon;

  const cardStyle = isWarning
    ? { borderRadius: '8px', background: '#fff7e6', border: '1px solid #ffd591' }
    : { borderRadius: '8px', background: '#fafafa' };

  const textType = isWarning ? 'warning' : 'secondary';
  const textStyle = isWarning ? { strong: true } : { italic: true };

  return (
    <Card style={cardStyle}>
      <Row justify="center">
        <Col>
          <Text type={textType} {...textStyle}>
            {displayIcon && <>{displayIcon} </>}
            {message}
          </Text>
        </Col>
      </Row>
    </Card>
  );
};


