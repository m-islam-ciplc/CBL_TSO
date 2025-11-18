import { createContext, useContext, useState, useMemo, useCallback } from 'react';

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
  
  const [userRole, setUserRole] = useState(savedUser?.role || null); // 'tso', 'sales_manager', 'admin', or 'dealer'
  const [userName, setUserName] = useState(savedUser?.full_name || null);
  const [territoryName, setTerritoryName] = useState(savedUser?.territory_name || null);
  const [userId, setUserId] = useState(savedUser?.id || null);
  const [dealerId, setDealerId] = useState(savedUser?.dealer_id || null);
  const [quotaRefreshTrigger, setQuotaRefreshTrigger] = useState(0); // Trigger for quota refresh

  const triggerQuotaRefresh = useCallback(() => {
    setQuotaRefreshTrigger(prev => prev + 1);
  }, []);

  const value = useMemo(() => ({
    userRole,
    userName,
    isAdmin: userRole === 'admin',
    isTSO: userRole === 'tso',
    isSalesManager: userRole === 'sales_manager',
    isDealer: userRole === 'dealer',
    setUserRole,
    setUserName,
    setTerritoryName,
    setUserId,
    setDealerId,
    territoryName,
    userId,
    dealerId,
    quotaRefreshTrigger,
    triggerQuotaRefresh
  }), [userRole, userName, territoryName, userId, dealerId, quotaRefreshTrigger, triggerQuotaRefresh]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
