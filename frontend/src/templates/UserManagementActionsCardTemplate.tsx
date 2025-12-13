/**
 * USER MANAGEMENT ACTIONS CARD TEMPLATE
 * 
 * Specialized template for the "Actions" card in User Management page.
 * This template displays action buttons in the card's extra prop.
 * 
 * Features:
 * - Title: "Actions"
 * - Buttons displayed in the extra prop (right side of card header)
 * - Uses ACTION_CARD_CONFIG for styling
 */

import { FC } from 'react';
import { Card, Space, Button, Popconfirm } from 'antd';
import { ACTION_CARD_CONFIG, STANDARD_POPCONFIRM_CONFIG } from './UITemplates';
import type { UserManagementActionsCardTemplateProps, UserManagementButtonConfig } from './types';

/**
 * User Management Actions Card Template
 */
export const UserManagementActionsCardTemplate: FC<UserManagementActionsCardTemplateProps> = ({
  title = 'Actions',
  buttons = [],
}) => {
  const renderButton = (button: UserManagementButtonConfig | null, index: number) => {
    if (!button) return null;
    
    const buttonElement = (
      <Button
        key={`button-${index}`}
        type={button.type || 'default'}
        icon={button.icon}
        onClick={button.popconfirm ? undefined : button.onClick}
        disabled={button.disabled}
        loading={button.loading}
        danger={button.danger}
      >
        {button.label || `Button ${index + 1}`}
      </Button>
    );

    if (button.popconfirm) {
      return (
        <Popconfirm
          key={`popconfirm-${index}`}
          {...STANDARD_POPCONFIRM_CONFIG}
          title={button.popconfirm.title}
          onConfirm={button.popconfirm.onConfirm}
          disabled={button.disabled}
        >
          {buttonElement}
        </Popconfirm>
      );
    }

    return buttonElement;
  };

  return (
    <Card
      title={title}
      {...ACTION_CARD_CONFIG}
      extra={
        <Space>
          {buttons.map((button, index) => renderButton(button, index))}
        </Space>
      }
    />
  );
};

