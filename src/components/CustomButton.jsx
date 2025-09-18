import React from 'react';
import styles from './CustomButton.module.scss';

const CustomButton = ({ text, onClick, className = '', variant = 'primary', size = 'medium' }) => {
    const buttonClasses = [
        styles.customButton,
        styles[variant],
        styles[size],
        className
    ].filter(Boolean).join(' ');
   //test comment  

    return (
        <button 
            className={buttonClasses}
            onClick={onClick}
        >
            {text}
        </button>
    );
};

export default CustomButton; 