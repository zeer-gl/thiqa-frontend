import React from 'react';
import { Link } from 'react-router-dom';
import CustomButton from './CustomButton';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import modalLogo from '../assets/payment/modal-logo.svg';
import modernCeilingLights from '../assets/payment/modern-ceiling-lights.svg';

const PaymentSuccessModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="payment-success-modal">
                {/* Success Icon and Header */}
                <div className="success-header text-center mb-4">
                    <div className="success-icon">
                        <img src={modalLogo} alt="Success Icon" />
                    </div>
                    <h2 className="success-title fw-bold">{t('payment-success-modal.payment-successful')}</h2>
                    <p className="success-message">
                        {t('payment-success-modal.payment-successful-message')}
                        <span className="email-highlight">{t('payment-success-modal.email-highlight')}</span>
                    </p>
                </div>

                {/* Payment Summary */}
                <div className="payment-summary mb-4">
                   <div className="summary-total">
                            <span className="summary-label">{t('payment-success-modal.total-payment')}</span>
                            <span className="summary-value">100 {t('payment-success-modal.kwd')}</span>
                    </div>
                    <div className="summary-row">
                    <div className="summary-item">
                            <span className="summary-label">{t('payment-success-modal.transaction-date')}</span>
                            <span className="summary-value">Friday 23/10/2024</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">{t('payment-success-modal.reference-number')}</span>
                            <span className="summary-value">0981727198201</span>
                        </div>
                    </div>
                </div>

                {/* Order Details */}
                <div className="order-details mb-4">
                    <h4 className="order-title fw-bold">{t('payment-success-modal.your-order')}</h4>
                    <div className="order-item">
                        <div className="product-info">
                            <img 
                                src={modernCeilingLights} 
                                alt="Modern Ceiling Lights" 
                                className="product-image"
                            />
                            <div className="product-details">
                                <h5 className="product-name fw-bold">{t('payment-success-modal.modern-ceiling-lights')}</h5>
                                <p className="product-price">50 {t('payment-success-modal.kwd')} <span style={{color:'#A3A3A3'}}>x1</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Breakdown */}
                <div className="financial-breakdown mb-4">
                    <div className="breakdown-row">
                        <span className="breakdown-label">{t('payment-success-modal.subtotal')} (3 {t('payment-success-modal.items')})</span>
                        <span className="breakdown-value">50 {t('payment-success-modal.kwd')}</span>
                    </div>
                    <div className="breakdown-row">
                        <span className="breakdown-label">{t('payment-success-modal.discount')}</span>
                        <span className="breakdown-value">12 {t('payment-success-modal.kwd')}</span>
                    </div>
                    <div className="breakdown-row">
                        <span className="breakdown-label">{t('payment-success-modal.shipping-cost')}</span>
                        <span className="breakdown-value">{t('payment-success-modal.free')}</span>
                    </div>
                    <div className="breakdown-row total">
                        <span className="breakdown-label">{t('payment-success-modal.total')}</span>
                        <span className="breakdown-value">50 {t('payment-success-modal.kwd')}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                    <CustomButton text={t('payment-success-modal.download-invoice')} className="download-btn" />
                    <Link to="/payment-success" className="home-btn text-black" onClick={() => { onClose(); navigate('/payment-success'); }}>
                        {t('payment-success-modal.home')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessModal; 