import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App';
import { antTheme } from './ant-theme';

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
