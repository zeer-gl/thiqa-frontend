// components/Alert.jsx
import React from 'react';
import { useAlert } from '../context/AlertContext';

const Alert = () => {
  const { alert } = useAlert();
  
  if (!alert) return null;

  return (
    <div
    className={`position-fixed m-4 p-4 rounded-lg shadow-lg text-white ${
      alert.type === 'success' ? 'bg-success' : 'bg-danger'
    }`}
    style={{
      right: '1rem',
      top: '3rem',
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