import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, message } from 'antd';
import App from './App';
import { antTheme } from './ant-theme';
import './tablet.css';

// Configure message (toast) notifications to appear below navbar (40px + 8px spacing)
message.config({
  top: 48,
  duration: 3,
  maxCount: 3,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConfigProvider
      theme={antTheme}
      componentSize="small"
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
