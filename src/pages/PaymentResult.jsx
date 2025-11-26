import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
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
    const { clearCart } = useCart();
    const [searchParams] = useSearchParams();
    const [countdown, setCountdown] = useState(5);
    const [isSuccess, setIsSuccess] = useState(false);

    // Function to determine redirect destination and start countdown
    const handleRedirect = () => {
        const paymentId = searchParams.get('paymentId') || searchParams.get('PaymentId');
        const id = searchParams.get('Id');
        const paymentStatus = searchParams.get('PaymentStatus') || searchParams.get('status');
        const error = searchParams.get('Error');
        
        // Check if user came from payment gateway (has payment parameters)
        const hasPaymentParams = paymentId || id || paymentStatus || error;
        
        // If no payment parameters, user likely navigated back without paying
        if (!hasPaymentParams) {
            // Restore cart from pending order
            const pendingOrder = localStorage.getItem('pendingOrder');
            if (pendingOrder) {
                try {
                    const orderData = JSON.parse(pendingOrder);
                    // Restore cart items
                    localStorage.setItem('cart', JSON.stringify(orderData.cartItems));
                    // Clear pending order
                    localStorage.removeItem('pendingOrder');
                    // Dispatch event to notify CartContext of the change
                    window.dispatchEvent(new CustomEvent('cartUpdated'));
                } catch (e) {
                    console.error('Error restoring cart:', e);
                }
            }
            // Redirect to payment/cart page to continue shopping
            navigate('/payment');
            return;
        }
        
        // Determine if payment was successful
        const success = (paymentId && id) || 
                       paymentStatus === 'Paid' || 
                       paymentStatus === 'paid' ||
                       paymentStatus === 'success' ||
                       (!error && paymentId && paymentStatus !== 'failed' && paymentStatus !== 'Failed');
        
        setIsSuccess(success);

        // Handle cart based on payment result
        if (success) {
            // Clear cart on successful payment immediately
            console.log('✅ Payment successful - clearing cart and cleaning up pending order');
            console.log('💰 Payment Status:', paymentStatus);
            console.log('🛒 Cart items before clearing:', localStorage.getItem('cart'));
            
            // Clear cart from localStorage first
            localStorage.removeItem('cart');
            
            // Clear cart using context
            clearCart();
            
            // Remove pending order
            localStorage.removeItem('pendingOrder');
            
            // Dispatch event to ensure cart is cleared across all components
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            
            // Verify cart is cleared
            setTimeout(() => {
                const cartAfter = localStorage.getItem('cart');
                console.log('🛒 Cart items after clearing:', cartAfter);
                if (cartAfter) {
                    console.warn('⚠️ Cart still has items after clearing!');
                    // Force clear again
                    localStorage.removeItem('cart');
                    window.dispatchEvent(new CustomEvent('cartUpdated'));
                } else {
                    console.log('✅ Cart successfully cleared');
                }
            }, 100);
        } else {
            // Restore cart on failed payment
            console.log('❌ Payment failed - restoring cart items');
            const pendingOrder = localStorage.getItem('pendingOrder');
            if (pendingOrder) {
                try {
                    const orderData = JSON.parse(pendingOrder);
                    // Restore cart items to localStorage (CartContext will pick this up)
                    localStorage.setItem('cart', JSON.stringify(orderData.cartItems));
                    localStorage.removeItem('pendingOrder');
                    // Dispatch event to notify CartContext of the change
                    window.dispatchEvent(new CustomEvent('cartUpdated'));
                    console.log('🛒 Cart restored with', orderData.cartItems.length, 'items');
                } catch (e) {
                    console.error('Error restoring cart:', e);
                }
            }
        }

        // Start countdown timer for automatic redirect
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Redirect based on success/failure
                    if (success) {
                        navigate('/products'); // Redirect to product list on success
                    } else {
                        navigate('/payment'); // Redirect to payment/cart page on failure (cart restored)
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    };

    // Clear cart immediately when component mounts with successful payment
    useEffect(() => {
        const paymentStatus = searchParams.get('PaymentStatus') || searchParams.get('status');
        const paymentId = searchParams.get('paymentId') || searchParams.get('PaymentId');
        const id = searchParams.get('Id');
        const error = searchParams.get('Error');
        
        const success = (paymentId && id) || 
                       paymentStatus === 'Paid' || 
                       paymentStatus === 'paid' ||
                       paymentStatus === 'success' ||
                       (!error && paymentId && paymentStatus !== 'failed' && paymentStatus !== 'Failed');
        
        if (success) {
            console.log('🔄 Component mounted with successful payment - clearing cart immediately');
            // Force clear cart immediately on mount
            localStorage.removeItem('cart');
            clearCart();
            localStorage.removeItem('pendingOrder');
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        }
    }, []); // Run once on mount

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
                            {isSuccess && paymentStatus && (
                                <div style={{ 
                                    marginBottom: '15px', 
                                    padding: '12px 16px', 
                                    backgroundColor: '#ecfdf5', 
                                    border: '1px solid #10b981', 
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <strong style={{ color: '#065f46', fontSize: '16px', fontWeight: '600' }}>
                                        Payment Status: <span style={{ textTransform: 'uppercase', color: '#10b981' }}>PAID</span>
                                    </strong>
                                </div>
                            )}
                            <p className="error-details-text">
                                {isSuccess 
                                    ? t('paymentResult.successDetailsText', 'Your payment has been completed successfully. Your cart has been cleared and you can now access your purchased products.')
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
                            onClick={() => {
                                if (isSuccess) {
                                    navigate('/products');
                                } else {
                                    // Restore cart before redirecting to checkout
                                    const pendingOrder = localStorage.getItem('pendingOrder');
                                    if (pendingOrder) {
                                        try {
                                            const orderData = JSON.parse(pendingOrder);
                                            localStorage.setItem('cart', JSON.stringify(orderData.cartItems));
                                            localStorage.removeItem('pendingOrder');
                                            // Dispatch event to notify CartContext of the change
                                            window.dispatchEvent(new CustomEvent('cartUpdated'));
                                        } catch (e) {
                                            console.error('Error restoring cart:', e);
                                        }
                                    }
                                    navigate('/payment');
                                }
                            }}
                        >
                            {isSuccess 
                                ? t('paymentResult.goToProducts', 'Go to Products')
                                : t('paymentResult.goToCheckout', 'Go to Checkout')
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentResult;

