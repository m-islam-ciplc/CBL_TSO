import axios from 'axios';

// Global axios interceptor to automatically log all API requests and responses
axios.interceptors.request.use(
  (config) => {
    // Log request
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      params: config.params,
      timestamp: new Date().toISOString()
    });
    
    // Store in window for debug panel access
    if (!window.apiLogs) {
      window.apiLogs = [];
    }
    window.apiLogs.push({
      type: 'request',
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      params: config.params,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 logs
    if (window.apiLogs.length > 50) {
      window.apiLogs.shift();
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('✅ API Response:', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
    // Store in window for debug panel access
    if (!window.apiLogs) {
      window.apiLogs = [];
    }
    window.apiLogs.push({
      type: 'response',
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 logs
    if (window.apiLogs.length > 50) {
      window.apiLogs.shift();
    }
    
    return response;
  },
  (error) => {
    // Log error response
    console.error('❌ API Error:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      timestamp: new Date().toISOString()
    });
    
    // Store in window for debug panel access
    if (!window.apiLogs) {
      window.apiLogs = [];
    }
    window.apiLogs.push({
      type: 'error',
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 logs
    if (window.apiLogs.length > 50) {
      window.apiLogs.shift();
    }
    
    return Promise.reject(error);
  }
);

export default axios;







