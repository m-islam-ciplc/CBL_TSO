/**
 * DAILY DEMAND DEALER INFORMATION CARD TEMPLATE
 * 
 * Specialized template for the "Dealer Information" card in Daily Demand page.
 * This template displays dealer name and territory information.
 * 
 * Features:
 * - Title: "Dealer Information"
 * - Two columns: Dealer name and Territory
 * - Uses STANDARD_CARD_CONFIG for styling
 * - Uses SINGLE_ROW_GUTTER for spacing
 */

import { FC } from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { 
  STANDARD_CARD_CONFIG, 
  SINGLE_ROW_GUTTER,
} from './UITemplates';
import type { DailyDemandDealerInformationCardTemplateProps } from './types';

const { Text } = Typography;

/**
 * Daily Demand Dealer Information Card Template
 */
export const DailyDemandDealerInformationCardTemplate: FC<DailyDemandDealerInformationCardTemplateProps> = ({
  title = 'Dealer Information',
  dealerInfo,
  territory,
}) => {
  if (!dealerInfo) {
    return null;
  }

  return (
    <Card 
      title={title} 
      {...STANDARD_CARD_CONFIG}
    >
      <Row gutter={SINGLE_ROW_GUTTER}>
        <Col xs={24} md={12}>
          <Text strong>Dealer: </Text>
          <Text>{dealerInfo.name}</Text>
        </Col>
        <Col xs={24} md={12}>
          <Text strong>Territory: </Text>
          <Text>{territory}</Text>
        </Col>
      </Row>
    </Card>
  );
};

