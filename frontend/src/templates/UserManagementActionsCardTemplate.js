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

import { Card, Space, Button, Popconfirm } from 'antd';
import { ACTION_CARD_CONFIG, STANDARD_POPCONFIRM_CONFIG } from './UITemplates';

/**
 * User Management Actions Card Template
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (default: "Actions")
 * @param {Array<Object>} props.buttons - Array of button configurations
 * @param {string} props.buttons[].label - Button label
 * @param {string} props.buttons[].type - Button type: 'primary', 'default', 'dashed', 'link', 'text', 'danger' (default: 'default')
 * @param {ReactNode} props.buttons[].icon - Button icon (optional)
 * @param {Function} props.buttons[].onClick - onClick handler: () => void
 * @param {boolean} props.buttons[].disabled - Whether button is disabled (optional)
 * @param {boolean} props.buttons[].loading - Whether button is loading (optional)
 * @param {boolean} props.buttons[].danger - Whether button is danger type (optional)
 * @param {Object} props.buttons[].popconfirm - Popconfirm configuration (optional)
 * @param {string} props.buttons[].popconfirm.title - Popconfirm title
 * @param {Function} props.buttons[].popconfirm.onConfirm - Popconfirm onConfirm handler
 * @returns {JSX.Element} User Management Actions card JSX
 */
export const UserManagementActionsCardTemplate = ({
  title = 'Actions',
  buttons = [],
}) => {
  const renderButton = (button, index) => {
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

