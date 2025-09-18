import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../context/AlertContext';
import { BaseUrl } from '../assets/BaseUrl';
import '../css/components/payment-methods.scss';

const PaymentMethods = ({ selectedPlan, onBack, onPaymentSuccess }) => {
    const { t, i18n } = useTranslation();
    const { showAlert } = useAlert();
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [lastError, setLastError] = useState(null);

    // Fetch payment methods for selected plan
    const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            setPaymentMethods([]); // Clear previous methods
            const token = localStorage.getItem('token-sp');
            
            console.log('=== FETCHING PAYMENT METHODS ===');
            console.log('Selected Plan:', selectedPlan);
            console.log('Token exists:', !!token);
            
            if (!token) {
                showAlert(t('paymentMethods.loginRequired', 'Please login to view payment methods'), 'error');
                return;
            }

            if (!selectedPlan || !selectedPlan.id) {
                showAlert(t('paymentMethods.noPlanSelected', 'No plan selected'), 'error');
                return;
            }

            // Try multiple possible API endpoints
            const possibleEndpoints = [
                `${BaseUrl}/professional/subscription/payment-methods/${selectedPlan.id}`,
                `${BaseUrl}/professional/subscription/payment-methods`,
                `${BaseUrl}/professional/payment-methods`,
                `${BaseUrl}/payment-methods`
            ];

            let response = null;
            let data = null;
            let lastError = null;

            for (const endpoint of possibleEndpoints) {
                try {
                    console.log('Trying endpoint:', endpoint);
                    response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

                    console.log('Response status:', response.status);
                    
                    if (response.ok) {
                        data = await response.json();
                        console.log('Payment methods API response:', data);
                        break;
                    } else {
                        const errorText = await response.text();
                        console.log('Error response:', errorText);
                        lastError = new Error(`HTTP ${response.status}: ${errorText}`);
                    }
                } catch (error) {
                    console.log('Endpoint failed:', endpoint, error);
                    lastError = error;
                }
            }

            if (!response || !response.ok) {
                throw lastError || new Error(t('paymentMethods.fetchFailed', 'Failed to fetch payment methods'));
            }
            
            // Handle different response structures
            if (data) {
                let paymentMethodsData = [];
            
            if (data.success && data.data) {
                    paymentMethodsData = data.data;
                } else if (data.success && data.paymentMethods) {
                    paymentMethodsData = data.paymentMethods;
                } else if (Array.isArray(data)) {
                    paymentMethodsData = data;
                } else if (data.paymentMethods && Array.isArray(data.paymentMethods)) {
                    paymentMethodsData = data.paymentMethods;
                }

                console.log('Processed payment methods:', paymentMethodsData);
                setPaymentMethods(paymentMethodsData);
                
                if (paymentMethodsData.length === 0) {
                    console.log('No payment methods found in response');
                    showAlert(t('paymentMethods.noMethodsFound', 'No payment methods available for this plan'), 'warning');
                }
            } else {
                throw new Error('No data received from API');
            }
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            showAlert(t('paymentMethods.loadFailed', 'Failed to load payment methods: ' + error.message), 'error');
            
            // Set fallback payment methods for testing
            setPaymentMethods([
                {
                    paymentMethodId: 'knet',
                    paymentMethodEn: 'KNET',
                    paymentMethodAr: 'كي نت',
                    imageUrl: '/public/images/payment/knet.png',
                    serviceCharge: 0,
                    currencyIso: 'KWD',
                    isEmbeddedSupported: true
                },
                {
                    paymentMethodId: 'visa',
                    paymentMethodEn: 'Visa',
                    paymentMethodAr: 'فيزا',
                    imageUrl: '/public/images/payment/visa.png',
                    serviceCharge: 0.5,
                    currencyIso: 'KWD',
                    isEmbeddedSupported: false
                }
            ]);
        } finally {
            setLoading(false);
        }
    };



    // Fetch payment methods when component mounts or selectedPlan changes
    useEffect(() => {
        if (selectedPlan && selectedPlan.id) {
            console.log('=== COMPONENT MOUNTED - FETCHING PAYMENT METHODS ===');
            fetchPaymentMethods();
        }
    }, [selectedPlan]);

    // Add global error handler for debugging
    useEffect(() => {
        const handleGlobalError = (event) => {
            console.error('=== GLOBAL ERROR CAUGHT ===');
            console.error('Error:', event.error);
            console.error('Message:', event.message);
            console.error('Filename:', event.filename);
            console.error('Line:', event.lineno);
            console.error('Column:', event.colno);
        };

        const handleUnhandledRejection = (event) => {
            console.error('=== UNHANDLED PROMISE REJECTION ===');
            console.error('Reason:', event.reason);
            console.error('Promise:', event.promise);
        };

        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleGlobalError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    const handlePaymentMethodSelect = (paymentMethod) => {
        setSelectedPaymentMethod(paymentMethod);
    };

    const handleProceedToPayment = async () => {
        console.log('=== PROCEED TO PAYMENT CLICKED ===');
        console.log('Selected Payment Method:', selectedPaymentMethod);
        console.log('Selected Plan:', selectedPlan);
        console.log('Processing State:', processing);
        
        if (!selectedPaymentMethod) {
            console.log('No payment method selected');
            showAlert(t('paymentMethods.selectPaymentMethod', 'Please select a payment method'), 'error');
            return;
        }

        if (!selectedPlan || !selectedPlan.id) {
            console.log('No plan selected');
            showAlert(t('paymentMethods.noPlanSelected', 'No plan selected'), 'error');
            return;
        }

        try {
            setProcessing(true);
            const token = localStorage.getItem('token-sp');
            
            if (!token) {
                showAlert(t('paymentMethods.loginRequiredForPayment', 'Please login to proceed with payment'), 'error');
                return;
            }

            // Get user data for mobile number
            const userData = JSON.parse(localStorage.getItem('spUserData') || '{}');
            let customerMobile = userData.phoneNo || userData.mobile || userData.phone || userData.phoneNumber || userData.contact || userData.contactNumber || '';
            
            // Clean the mobile number (remove spaces, dashes, etc.)
            if (customerMobile) {
                customerMobile = customerMobile.toString().replace(/[\s\-\(\)\+]/g, '');
            }
            
            console.log('=== USER DATA FOR PAYMENT ===');
            console.log('User Data:', userData);
            console.log('Customer Mobile:', customerMobile);
            
            // Validate mobile number
            console.log('=== MOBILE VALIDATION DEBUG ===');
            console.log('Customer Mobile:', customerMobile);
            console.log('Mobile Type:', typeof customerMobile);
            console.log('Mobile Length:', customerMobile ? customerMobile.length : 'N/A');
            console.log('Is Empty:', !customerMobile);
            console.log('Is Too Long:', customerMobile && customerMobile.length > 11);
            
            if (!customerMobile) {
                showAlert(t('paymentMethods.mobileRequired', 'Mobile number is required for payment. Please update your profile with a valid mobile number.'), 'error');
                return;
            }
            
            if (customerMobile.length > 11) {
                showAlert(t('paymentMethods.mobileTooLong', `Mobile number is too long (${customerMobile.length} digits). Maximum allowed is 11 digits.`), 'error');
                return;
            }
            
            if (customerMobile.length < 7) {
                showAlert(t('paymentMethods.mobileTooShort', `Mobile number is too short (${customerMobile.length} digits). Please provide a valid mobile number.`), 'error');
                return;
            }

            // Prepare request body
            const requestBody = {
                planId: selectedPlan.id,
                paymentMethodId: selectedPaymentMethod.paymentMethodId,
                CustomerMobile: customerMobile
            };

            console.log('=== PAYMENT INITIATION DEBUG ===');
            console.log('Request URL:', `${BaseUrl}/professional/subscription/purchase`);
            console.log('Request Body:', requestBody);
            console.log('Selected Plan:', selectedPlan);
            console.log('Selected Payment Method:', selectedPaymentMethod);
            console.log('Token exists:', !!token);

            // Call subscription purchase API
            const response = await fetch(`${BaseUrl}/professional/subscription/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response Status:', response.status);
            console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

            // Get response text first to see raw response
            const responseText = await response.text();
            console.log('Raw Response Text:', responseText);

            if (!response.ok) {
                console.error('API Error Response (Raw):', responseText);
                
                let errorMessage = t('paymentMethods.initiateFailed', 'Failed to initiate payment');
                try {
                    const errorData = JSON.parse(responseText);
                    console.error('Parsed Error Data:', errorData);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                    console.error('Failed to parse error response as JSON:', e);
                    errorMessage = `Server error (${response.status}): ${responseText}`;
                }
                
                throw new Error(errorMessage);
            }

            // Parse the successful response
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('Payment initiation response (Parsed):', data);
            } catch (e) {
                console.error('Failed to parse success response as JSON:', e);
                throw new Error('Invalid JSON response from server');
            }

            // Handle different possible response structures
            let paymentUrl = null;

            if (data.success && data.data && data.data.paymentUrl) {
                paymentUrl = data.data.paymentUrl;
            } else if (data.success && data.paymentUrl) {
                paymentUrl = data.paymentUrl;
            } else if (data.paymentUrl) {
                paymentUrl = data.paymentUrl;
            } else if (data.data && data.data.url) {
                paymentUrl = data.data.url;
            } else if (data.url) {
                paymentUrl = data.url;
            } else if (data.success && data.data && data.data.redirectUrl) {
                paymentUrl = data.data.redirectUrl;
            } else if (data.redirectUrl) {
                paymentUrl = data.redirectUrl;
            }

            console.log('=== PAYMENT URL EXTRACTION ===');
            console.log('Full response data:', data);
            console.log('Extracted payment URL:', paymentUrl);

            if (paymentUrl) {
                console.log('Payment URL received:', paymentUrl);
                
                // Show success message before redirecting
                showAlert(t('paymentMethods.redirectingToPayment', 'Redirecting to payment gateway...'), 'success');
                
                // Small delay to show the success message, then redirect
                setTimeout(() => {
                    console.log('Redirecting to payment URL:', paymentUrl);
                    window.location.href = paymentUrl;
                }, 1000);
            } else {
                console.error('No payment URL found in response:', data);
                console.error('Response structure analysis:', {
                    hasSuccess: 'success' in data,
                    hasData: 'data' in data,
                    hasPaymentUrl: 'paymentUrl' in data,
                    hasUrl: 'url' in data,
                    hasRedirectUrl: 'redirectUrl' in data,
                    dataKeys: Object.keys(data),
                    dataDataKeys: data.data ? Object.keys(data.data) : 'no data object'
                });
                throw new Error(data.message || t('paymentMethods.initiateFailedInvalid', 'Payment initiation failed - no payment URL received'));
            }

        } catch (error) {
            console.error('=== PAYMENT ERROR DEBUG ===');
            console.error('Error type:', error.constructor.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            
            // More specific error messages
            let userMessage = t('paymentMethods.initiateFailedRetry', 'Payment initiation failed. Please try again.');
            
            if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
                userMessage = t('paymentMethods.networkError', 'Network error. Please check your internet connection and try again.');
            } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                userMessage = t('paymentMethods.sessionExpired', 'Session expired. Please login again and try.');
            } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
                userMessage = t('paymentMethods.accessDenied', 'Access denied. Please contact support.');
            } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
                userMessage = t('paymentMethods.serverError', 'Server error. Please try again later or contact support.');
            } else if (error.message) {
                userMessage = error.message;
            }
            
            setLastError(error.message);
            showAlert(userMessage, 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleRetryPayment = () => {
        setRetryCount(prev => prev + 1);
        setLastError(null);
        handleProceedToPayment();
    };

    const handleResetPayment = () => {
        setRetryCount(0);
        setLastError(null);
        setSelectedPaymentMethod(null);
    };

    // Debug function to test API call manually
    window.testSubscriptionPurchase = async () => {
        const token = localStorage.getItem('token-sp');
        const userData = JSON.parse(localStorage.getItem('spUserData') || '{}');
        let customerMobile = userData.phoneNo || userData.mobile || userData.phone || userData.phoneNumber || userData.contact || userData.contactNumber || '';
        
        // Clean the mobile number (remove spaces, dashes, etc.)
        if (customerMobile) {
            customerMobile = customerMobile.toString().replace(/[\s\-\(\)\+]/g, '');
        }
        
        const testPayload = {
            planId: "68b8204fb4b552c5333b2168",
            paymentMethodId: 2,
            CustomerMobile: customerMobile
        };
        
        console.log('=== MANUAL API TEST ===');
        console.log('Token:', token);
        console.log('User Data:', userData);
        console.log('Customer Mobile:', customerMobile);
        console.log('Payload:', testPayload);
        
        try {
            const response = await fetch(`${BaseUrl}/professional/subscription/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(testPayload)
            });
            
            console.log('Response Status:', response.status);
            const responseText = await response.text();
            console.log('Raw Response:', responseText);
            
            if (response.ok) {
                const data = JSON.parse(responseText);
                console.log('Parsed Response:', data);
            } else {
                console.error('Error Response:', responseText);
            }
        } catch (error) {
            console.error('Test Error:', error);
        }
    };

    // Debug function to check user data
    window.checkUserData = () => {
        const userData = JSON.parse(localStorage.getItem('spUserData') || '{}');
        const token = localStorage.getItem('token-sp');
        
        console.log('=== USER DATA DEBUG ===');
        console.log('Token exists:', !!token);
        console.log('User Data:', userData);
        console.log('Available fields:', Object.keys(userData));
        console.log('Mobile fields:', {
            mobile: userData.mobile,
            phone: userData.phone,
            phoneNumber: userData.phoneNumber,
            contact: userData.contact,
            contactNumber: userData.contactNumber
        });
        
        return {
            hasToken: !!token,
            userData: userData,
            mobileFields: {
                mobile: userData.mobile,
                phone: userData.phone,
                phoneNumber: userData.phoneNumber,
                contact: userData.contact,
                contactNumber: userData.contactNumber
            }
        };
    };

    // Debug function to manually set mobile number for testing
    window.setTestMobileNumber = (mobileNumber) => {
        const userData = JSON.parse(localStorage.getItem('spUserData') || '{}');
        userData.phoneNo = mobileNumber; // Set phoneNo field (primary field for SP)
        userData.mobile = mobileNumber;  // Also set mobile as backup
        localStorage.setItem('spUserData', JSON.stringify(userData));
        console.log('Mobile number set to:', mobileNumber);
        console.log('Updated user data:', userData);
        return userData;
    };

    // Debug function to check all SP data in localStorage
    window.checkSPLocalStorageData = () => {
        console.log('=== SP LOCALSTORAGE DATA DEBUG ===');
        
        // Check all localStorage keys
        const allKeys = Object.keys(localStorage);
        console.log('All localStorage keys:', allKeys);
        
        // SP-specific keys
        const spKeys = allKeys.filter(key => 
            key.includes('sp') || 
            key.includes('SP') || 
            key.includes('service') || 
            key.includes('professional') ||
            key.includes('token') ||
            key.includes('user') ||
            key.includes('profile')
        );
        
        console.log('SP-related keys:', spKeys);
        
        // Get SP data
        const spData = {
            tokenSP: localStorage.getItem('token-sp'),
            serviceProviderId: localStorage.getItem('serviceProviderId'),
            spUserData: localStorage.getItem('spUserData'),
            isLoggedIn: localStorage.getItem('isLoggedIn'),
            userRole: localStorage.getItem('userRole'),
            token: localStorage.getItem('token'),
            userData: localStorage.getItem('userData'),
            profileData: localStorage.getItem('profileData'),
            registrationData: localStorage.getItem('registrationData')
        };
        
        console.log('=== SP DATA OBJECTS ===');
        Object.entries(spData).forEach(([key, value]) => {
            console.log(`${key}:`, value);
            if (value && typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                try {
                    const parsed = JSON.parse(value);
                    console.log(`${key} (parsed):`, parsed);
                } catch (e) {
                    console.log(`${key} (not JSON):`, value);
                }
            }
        });
        
        // Parse spUserData specifically
        if (spData.spUserData) {
            try {
                const parsedSPData = JSON.parse(spData.spUserData);
                console.log('=== PARSED SP USER DATA ===');
                console.log('Full SP User Data:', parsedSPData);
                console.log('SP User Data Keys:', Object.keys(parsedSPData));
                console.log('Mobile/Phone Fields:', {
                    phoneNo: parsedSPData.phoneNo,
                    mobile: parsedSPData.mobile,
                    phone: parsedSPData.phone,
                    phoneNumber: parsedSPData.phoneNumber,
                    contact: parsedSPData.contact,
                    contactNumber: parsedSPData.contactNumber,
                    telephone: parsedSPData.telephone,
                    cell: parsedSPData.cell,
                    cellphone: parsedSPData.cellphone
                });
            } catch (e) {
                console.error('Failed to parse spUserData:', e);
            }
        }
        
        return spData;
    };

    if (loading) {
        return (
            <div className="payment-methods-container" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="container-fluid">
                    <div className="text-center py-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">{t('common.loading', 'Loading...')}</span>
                        </div>
                        <p className="mt-3">{t('paymentMethods.loading', 'Loading payment methods...')}</p>
                    </div>
                </div>
            </div>
        );
    }

    console.log('=== PAYMENT METHODS RENDER ===');
    console.log('Payment Methods:', paymentMethods);
    console.log('Selected Payment Method:', selectedPaymentMethod);
    console.log('Processing:', processing);
    console.log('Last Error:', lastError);

    return (
        <div className="payment-methods-container" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="container-fluid">
                {/* Header */}
                <div className="payment-header mb-4">
                    <button 
                        className="btn btn-outline-secondary mb-3"
                        onClick={onBack}
                    >
                        <i className="fas fa-arrow-left me-2"></i>
                        {t('common.back', 'Back to Plans')}
                    </button>
                    
                    <h2 className="payment-title ar-heading-bold">
                        {t('paymentMethods.title', 'Choose Payment Method')}
                    </h2>
                    
                    {selectedPlan && (
                        <div className="selected-plan-info">
                            <h4 className="plan-name">{selectedPlan.title}</h4>
                            <div className="plan-price">
                                <span className="price-amount">{selectedPlan.price}</span>
                                <span className="price-currency"> {selectedPlan.currency}</span>
                                <span className="price-period"> / {selectedPlan.period}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Methods */}
                {paymentMethods.length > 0 ? (
                    <div className="payment-methods-grid">
                        {paymentMethods.map((method) => (
                            <div 
                                key={method.paymentMethodId} 
                                className={`payment-method-card ${selectedPaymentMethod?.paymentMethodId === method.paymentMethodId ? 'selected' : ''}`}
                                onClick={() => handlePaymentMethodSelect(method)}
                            >
                                <div className="payment-method-content">
                                    <div className="payment-method-header">
                                        <div className={`radio-button ${selectedPaymentMethod?.paymentMethodId === method.paymentMethodId ? 'selected' : ''}`}>
                                            <div className="radio-inner"></div>
                                        </div>
                                        
                                        <div className="payment-method-image">
                                            <img 
                                                src={method.imageUrl} 
                                                alt={i18n.language === 'ar' ? method.paymentMethodAr : method.paymentMethodEn}
                                                onError={(e) => {
                                                    e.target.src = '/public/images/payment/default-payment.png';
                                                }}
                                            />
                                        </div>
                                        
                                        <div className="payment-method-info">
                                            <h5 className="payment-method-name">
                                                {i18n.language === 'ar' ? method.paymentMethodAr : method.paymentMethodEn}
                                            </h5>
                                            {method.serviceCharge > 0 && (
                                                <p className="service-charge">
                                                    {t('paymentMethods.serviceCharge', 'Service Charge')}: {method.serviceCharge} {method.currencyIso}
                                                </p>
                                            )}
                                            {method.isEmbeddedSupported && (
                                                <div className="embedded-badge">
                                                    <span className="badge-text">{t('paymentMethods.embeddedSupported', 'Embedded Supported')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-5">
                        <div className="empty-payment-methods">
                            <i className="fas fa-credit-card fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">{t('paymentMethods.noMethodsAvailable', 'No payment methods available')}</h5>
                            <p className="text-muted">{t('paymentMethods.contactSupport', 'Please contact support for more information')}</p>
                            <button 
                                className="btn btn-outline-primary mt-3"
                                onClick={fetchPaymentMethods}
                            >
                                <i className="fas fa-refresh me-2"></i>
                                {t('paymentMethods.retry', 'Retry')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Proceed Button */}
                {paymentMethods.length > 0 && (
                    <div className="payment-actions mt-4">
                        <div className="row justify-content-center">
                            <div className="col-lg-6 col-md-8 col-sm-12">
                                <button 
                                    className="btn btn-primary w-100 btn-lg"
                                    onClick={handleProceedToPayment}
                                    disabled={!selectedPaymentMethod || processing}
                                >
                                    {processing ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            {t('paymentMethods.redirectingToPayment', 'Redirecting to Payment...')}
                                        </>
                                    ) : (
                                        <>
                                            {t('paymentMethods.proceedToPayment', 'Proceed to Payment')}
                                            <i className="fas fa-arrow-right ms-2"></i>
                                        </>
                                    )}
                                </button>
                                
                                {/* Error Recovery Section */}
                                {lastError && !processing && (
                                    <div className="error-recovery mt-3">
                                        <div className="alert alert-danger" role="alert">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="fas fa-exclamation-triangle me-2"></i>
                                                <strong>{t('paymentMethods.paymentFailed', 'Payment Failed')}</strong>
                                            </div>
                                            <p className="mb-2 small">
                                                {lastError.includes('NetworkError') ? 
                                                    t('paymentMethods.networkIssue', 'Network connection issue detected.') :
                                                    t('paymentMethods.paymentNotProcessed', 'Payment could not be processed.')
                                                }
                                            </p>
                                            
                                            <div className="d-flex gap-2 flex-wrap">
                                                {retryCount < 3 && (
                                                    <button 
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={handleRetryPayment}
                                                    >
                                                        <i className="fas fa-redo me-1"></i>
                                                        {t('paymentMethods.retry', 'Retry')} ({3 - retryCount} {t('paymentMethods.attemptsLeft', 'attempts left')})
                                                    </button>
                                                )}
                                                
                                                <button 
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={handleResetPayment}
                                                >
                                                    <i className="fas fa-refresh me-1"></i>
                                                    {t('paymentMethods.tryDifferentMethod', 'Try Different Method')}
                                                </button>
                                                
                                                <button 
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => window.open('mailto:support@thiqa.com?subject=Payment Issue&body=Payment failed for plan: ' + selectedPlan?.title, '_blank')}
                                                >
                                                    <i className="fas fa-envelope me-1"></i>
                                                    {t('paymentMethods.contactSupport', 'Contact Support')}
                                                </button>
                                            </div>
                                            
                                            {retryCount >= 3 && (
                                                <div className="mt-2">
                                                    <small className="text-muted">
                                                        {t('paymentMethods.maxRetryReached', 'Maximum retry attempts reached. Please contact support or try a different payment method.')}
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentMethods;
