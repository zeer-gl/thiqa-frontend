// components/Alert.jsx
import React from 'react';
import { useAlert } from '../context/AlertContext';
import { useTranslation } from 'react-i18next';

const Alert = () => {
  const { alert } = useAlert();
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  
  if (!alert) return null;

  return (
    <div
    className={`position-fixed m-4 p-4 rounded-lg shadow-lg text-white ${
      alert.type === 'success' ? 'bg-success' : 'bg-danger'
    }`}
    style={{
      right: isRTL ? 'auto' : '1rem',
      left: isRTL ? '1rem' : 'auto',
      top: '4rem',
      zIndex: 9999,
      maxWidth: '400px',
      animation: 'fadeIn 0.3s ease-in'
    }}
  >
    <div className="d-flex justify-content-between align-items-center">
      <span>{alert.message}</span>
   
    </div>
  </div>
  
  );
};

export default Alert;