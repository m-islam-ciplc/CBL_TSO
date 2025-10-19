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
  // Default to TSO role for tablet users
  const [userRole, setUserRole] = useState('tso'); // 'admin' or 'tso'
  const [userName, setUserName] = useState('TSO User');
  const [isTabletMode, setIsTabletMode] = useState(true);

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
    isTSO: userRole === 'tso'
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
