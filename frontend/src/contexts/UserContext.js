import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  // Initialize from sessionStorage if available
  const savedUser = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : null;
  
  const [userRole, setUserRole] = useState(savedUser?.role || 'tso'); // 'tso', 'sales_manager', or 'admin'
  const [userName, setUserName] = useState(savedUser?.full_name || 'TSO User');
  const [isTabletMode, setIsTabletMode] = useState(savedUser?.role === 'tso');
  const [territoryName, setTerritoryName] = useState(savedUser?.territory_name || null);
  const [userId, setUserId] = useState(savedUser?.id || null);

  const switchToAdmin = () => {
    setUserRole('admin');
    setUserName('Admin User');
    setIsTabletMode(false);
  };

  const switchToTSO = () => {
    setUserRole('tso');
    setUserName('TSO User');
    setIsTabletMode(true);
  };

  const value = {
    userRole,
    userName,
    isTabletMode,
    setIsTabletMode,
    switchToAdmin,
    switchToTSO,
    isAdmin: userRole === 'admin',
    isTSO: userRole === 'tso',
    isSalesManager: userRole === 'sales_manager',
    setUserRole,
    setUserName,
    setTerritoryName,
    setUserId,
    territoryName,
    userId
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
