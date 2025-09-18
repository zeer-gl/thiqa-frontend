import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../css/pages/fatorah-error.scss';

/**
 * PaymentResult Component
 * 
 * This component handles both payment success and failure results.
 * - On failure: redirects to home page after 5 seconds
 * - On success: redirects to product list after 5 seconds
 * 
 * URL Parameters:
 * - paymentId: The payment ID from payment gateway
 * - Id: Alternative payment ID parameter
 * - Error: Error message from payment gateway
 * - PaymentStatus: Payment status (e.g., "Paid")
 * - status: Payment status parameter
 */
const PaymentResult = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [countdown, setCountdown] = useState(5);
    const [isSuccess, setIsSuccess] = useState(false);

    // Function to determine redirect destination and start countdown
    const handleRedirect = () => {
        const paymentId = searchParams.get('paymentId') || searchParams.get('PaymentId');
        const id = searchParams.get('Id');
        const paymentStatus = searchParams.get('PaymentStatus') || searchParams.get('status');
        const error = searchParams.get('Error');
        
        // Determine if payment was successful
        const success = (paymentId && id) || 
                       paymentStatus === 'Paid' || 
                       paymentStatus === 'success' ||
                       (!error && paymentId && paymentStatus !== 'failed');
        
        setIsSuccess(success);

        // Start countdown timer for automatic redirect
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Redirect based on success/failure
                    if (success) {
                        navigate('/products'); // Redirect to product list on success
                    } else {
                        navigate('/'); // Redirect to home on failure
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    };

    useEffect(() => {
        const cleanup = handleRedirect();
        return cleanup;
    }, [navigate, searchParams]);

    // Get payment details from URL parameters
    const paymentId = searchParams.get('paymentId') || searchParams.get('PaymentId');
    const id = searchParams.get('Id');
    const error = searchParams.get('Error');
    const paymentStatus = searchParams.get('PaymentStatus') || searchParams.get('status');

    return (
        <div className="fatorah-error-page">
            <div className="error-container">
                <div className="error-content">
                    <div className="error-icon">
                        {isSuccess ? (
                            <i className="fas fa-check-circle" style={{ color: '#28a745' }}></i>
                        ) : (
                            <i className="fas fa-times-circle" style={{ color: '#dc3545' }}></i>
                        )}
                    </div>
                    <h1 className="error-title">
                        {isSuccess 
                            ? t('paymentResult.successTitle', 'Payment Successful') 
                            : t('paymentResult.errorTitle', 'Payment Failed')
                        }
                    </h1>
                    <p className="error-message">
                        {isSuccess 
                            ? t('paymentResult.successMessage', 'Your payment has been processed successfully')
                            : t('paymentResult.errorMessage', 'We couldn\'t process your payment')
                        }
                    </p>
                    
                    <div className="error-details">
                        <div className="error-details-box">
                            <p className="error-details-title">
                                {isSuccess 
                                    ? t('paymentResult.successDetailsTitle', 'Payment Confirmed')
                                    : t('paymentResult.errorDetailsTitle', 'Payment Processing Error')
                                }
                            </p>
                            <p className="error-details-text">
                                {isSuccess 
                                    ? t('paymentResult.successDetailsText', 'Your payment has been completed successfully. You can now access your purchased products.')
                                    : t('paymentResult.errorDetailsText', 'Your payment could not be completed. Please try again or contact support if the issue persists.')
                                }
                            </p>
                        </div>
                    </div>
                    
                    <div className="redirect-info">
                        <p className="redirect-message">
                            {isSuccess 
                                ? t('paymentResult.successRedirectMessage', 'Redirecting to products page in {{count}} seconds...', { count: countdown })
                                : t('paymentResult.errorRedirectMessage', 'Redirecting to home page in {{count}} seconds...', { count: countdown })
                            }
                        </p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => isSuccess ? navigate('/products') : navigate('/')}
                        >
                            {isSuccess 
                                ? t('paymentResult.goToProducts', 'Go to Products')
                                : t('paymentResult.goHome', 'Go to Home')
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentResult;

