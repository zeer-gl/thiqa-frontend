import React from 'react';
import { useTranslation } from 'react-i18next';

const ContactFormModal = ({ isOpen, onClose, formData }) => {
    const { t } = useTranslation();
    
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Handle contact button clicks
    const handleCallClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('📞 Call button clicked');
        try {
            window.open('tel:+96512345678', '_self');
        } catch (error) {
            console.error('Error opening phone dialer:', error);
        }
    };

    const handleWhatsAppClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('💬 WhatsApp button clicked');
        try {
            window.open('https://wa.me/96512345678?text=Hello, I would like to get in touch.', '_blank');
        } catch (error) {
            console.error('Error opening WhatsApp:', error);
        }
    };

    const handleEmailClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('📧 Email button clicked');
        try {
            window.open('mailto:info@thiqa.com?subject=Contact Form Inquiry&body=Hello, I would like to get in touch.', '_blank');
        } catch (error) {
            console.error('Error opening email client:', error);
        }
    };

    return (
        <div className="modal-overlay contact-form-modal-overlay" onClick={handleOverlayClick}>
            <div className="contact-form-modal">
                {/* Success Icon and Header */}
                <div className="success-header text-center mb-4">
                    <div className="success-icon">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <h2 className="success-title fw-bold">{t('contact.form-submitted-successfully')}</h2>
                    <p className="success-message">
                        {t('contact.thank-you-message')}
                    </p>
                </div>

                {/* Form Data Summary */}
                <div className="form-data-summary mb-4">
                    <h4 className="summary-title fw-bold">{t('contact.your-message-details')}</h4>
                    
                    <div className="summary-item">
                        <span className="summary-label">{t('contact.name')}:</span>
                        <span className="summary-value">{formData?.name || '-'}</span>
                    </div>
                    
                    <div className="summary-item">
                        <span className="summary-label">{t('contact.email')}:</span>
                        <span className="summary-value">{formData?.email || '-'}</span>
                    </div>
                    
                    <div className="summary-item">
                        <span className="summary-label">{t('contact.message')}:</span>
                        <span className="summary-value message-content">{formData?.message || '-'}</span>
                    </div>
                </div>

                {/* Contact Action Buttons */}
                <div className="contact-action-buttons mb-4">
                    <h4 className="action-title fw-bold">{t('contact.contact-options')}</h4>
                    <div className="contact-buttons-grid">
                        <button 
                            type="button"
                            className="contact-action-btn call-btn" 
                            onClick={handleCallClick}
                        >
                            <i className="fas fa-phone-alt"></i>
                            <span>{t('contact.call-us')}</span>
                        </button>
                        
                        <button 
                            type="button"
                            className="contact-action-btn whatsapp-btn" 
                            onClick={handleWhatsAppClick}
                        >
                            <i className="fab fa-whatsapp"></i>
                            <span>{t('contact.chat-whatsapp')}</span>
                        </button>
                        
                        <button 
                            type="button"
                            className="contact-action-btn email-btn" 
                            onClick={handleEmailClick}
                        >
                            <i className="fas fa-envelope"></i>
                            <span>{t('contact.email-us')}</span>
                        </button>
                    </div>
                </div>

                {/* Close Button */}
                <div className="action-buttons">
                    <button 
                        className="btn btn-primary close-btn" 
                        onClick={onClose}
                    >
                        <i className="fas fa-check"></i>
                        {t('contact.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContactFormModal;
