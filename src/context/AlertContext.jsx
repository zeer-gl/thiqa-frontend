// AlertContext.js (updated)
import React, { createContext, useContext, useState } from 'react';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'error') => {
    setAlert({ message, type });
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setAlert(null);
    }, 10000);
  };

  return (
    <AlertContext.Provider value={{ showAlert, alert }}>
      {children}
    </AlertContext.Provider>
  );
};

// Use this hook in your components
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

