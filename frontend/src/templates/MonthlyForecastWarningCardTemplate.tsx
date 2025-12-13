/**
 * MONTHLY FORECAST WARNING CARD TEMPLATE
 *
 * Specialized template for warning/info cards in Monthly Forecast page.
 * This template displays submitted warning or historical info messages.
 */

import { FC } from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import type { MonthlyForecastWarningCardTemplateProps } from './types';

const { Text } = Typography;

export const MonthlyForecastWarningCardTemplate: FC<MonthlyForecastWarningCardTemplateProps> = ({
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

export default MonthlyForecastWarningCardTemplate;

