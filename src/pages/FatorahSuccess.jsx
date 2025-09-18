import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../css/pages/fatorah-success.scss';

/**
 * FatorahSuccess Component
 * 
 * This component handles the Fatorah payment success page.
 * It automatically redirects to the home screen after 3 seconds.
 * 
 * URL Parameters:
 * - paymentId: The payment ID from Fatorah
 * - Id: Alternative payment ID parameter
 * - PaymentStatus: Payment status (e.g., "Paid")
 * - Error: Any error message (if present)
 */
const FatorahSuccess = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [countdown, setCountdown] = useState(3);
    const [isSuccess, setIsSuccess] = useState(true);

    useEffect(() => {
        // Parse URL parameters to determine success/failure
        const paymentId = searchParams.get('paymentId') || searchParams.get('PaymentId');
        const id = searchParams.get('Id');
        const paymentStatus = searchParams.get('PaymentStatus');
        const error = searchParams.get('Error');
        
        // Determine if payment was successful
        const success = (paymentId && id) || paymentStatus === 'Paid' || (!error && paymentId);
        setIsSuccess(success);

        // Start countdown timer
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [searchParams, navigate]);

    return (
        <div className="fatorah-success-page">
            <div className="success-container">
                <div className="success-content">
                    {isSuccess ? (
                        <>
                            <div className="success-icon">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <h1 className="success-title">
                                {t('fatorahSuccess.successTitle', 'Payment Successful!')}
                            </h1>
                            <p className="success-message">
                                {t('fatorahSuccess.successMessage', 'Your payment has been processed successfully.')}
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="error-icon">
                                <i className="fas fa-times-circle"></i>
                            </div>
                            <h1 className="error-title">
                                {t('fatorahSuccess.failureTitle', 'Payment Failed')}
                            </h1>
                            <p className="error-message">
                                {t('fatorahSuccess.failureMessage', 'There was an issue processing your payment.')}
                            </p>
                        </>
                    )}
                    
                    <div className="redirect-info">
                        <p className="redirect-message">
                            {t('fatorahSuccess.redirectMessage', 'Redirecting to home page in {{count}} seconds...', { count: countdown })}
                        </p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate('/')}
                        >
                            {t('fatorahSuccess.goHome', 'Go to Home')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FatorahSuccess;






