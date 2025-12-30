import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderSummary from '../components/OrderSummary';
import PaymentSuccessModal from '../components/PaymentSuccessModal';
import '../css/pages/checkout.scss';
import paypalLogo from '../assets/payment/paypal-logo.png';
import paypalImage from '../assets/payment/paypal.png';
import SidePattern from "../../public/images/side-pattern.svg";
import { BaseUrl } from '../assets/BaseUrl';
import { useAlert } from '../context/AlertContext';
import { useCart } from '../context/CartContext';
import PhoneIcon from '/public/images/profile/phone-icon.svg';

const Checkout = () => {
    const { t } = useTranslation();
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
    const hasFetchedPaymentMethods = useRef(false);

    // Cart data is now managed by CartContext, no need for manual loading

    // Fetch addresses from API
    const fetchAddresses = async () => {
        try {
            setLoadingAddresses(true);
            
            const response = await fetch(`${BaseUrl}/customer/address/list`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch addresses: ${response.status}`);
            }

            const data = await response.json();
            if (data.success && data.data && Array.isArray(data.data.addresses)) {
                setAddresses(data.data.addresses);
                // Set first address as default if none selected
                if (data.data.addresses.length > 0 && !selectedAddressId) {
                    const defaultAddress = data.data.addresses.find(addr => addr.is_default);
                    setSelectedAddressId(defaultAddress ? defaultAddress._id : data.data.addresses[0]._id);
                }
            } else {
                setAddresses([]);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
            showAlert('Failed to load addresses', 'error');
        } finally {
            setLoadingAddresses(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    // Fetch payment methods when cart items are available
    // This handles both initial mount and cart changes
    useEffect(() => {
        // Only fetch if we have cart items and haven't loaded payment methods yet
        if (cartItems && cartItems.length > 0) {
            // Check if we need to fetch (not already loading and no methods loaded)
            if (!loadingPaymentMethods && paymentMethods.length === 0) {
                fetchPaymentMethods();
            }
        } else {
            // Reset if cart is empty
            setPaymentMethods([]);
            setSelectedPaymentMethod(null);
            hasFetchedPaymentMethods.current = false;
        }
    }, [cartItems]);

    // Also ensure payment methods are fetched on mount if cart items are already available
    // This handles the case where cartItems are loaded before the component mounts
    useEffect(() => {
        if (cartItems && cartItems.length > 0 && paymentMethods.length === 0 && !loadingPaymentMethods) {
            // Small delay to ensure CartContext has fully initialized
            const timer = setTimeout(() => {
                fetchPaymentMethods();
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, []);

    // Calculate order total for payment methods (matching backend calculation)
    const calculateOrderTotal = () => {
        const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        // Backend calculates: tax (10%) and shipping (5 per vendor)
        // Since we don't know vendor count from frontend, we'll use a simplified calculation
        // The backend will recalculate anyway, but we need approximate amount for payment methods
        const taxAmount = subtotal * 0.1;
        const shippingCost = 5; // Flat shipping per vendor (minimum)
        return subtotal + taxAmount + shippingCost;
    };

    // Fetch payment methods from API
    const fetchPaymentMethods = async () => {
        try {
            setLoadingPaymentMethods(true);
            const totalAmount = calculateOrderTotal();
            
            const response = await fetch(`${BaseUrl}/customer/order/payment-methods?amount=${totalAmount}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch payment methods: ${response.status}`);
            }

            const data = await response.json();
            if (data.success && data.data && Array.isArray(data.data.paymentMethods)) {
                setPaymentMethods(data.data.paymentMethods);
                // Auto-select first payment method if none selected
                if (data.data.paymentMethods.length > 0 && !selectedPaymentMethod) {
                    setSelectedPaymentMethod(data.data.paymentMethods[0]);
                }
            } else {
                setPaymentMethods([]);
            }
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            // Don't show error alert - just log it, payment methods are optional
            setPaymentMethods([]);
        } finally {
            setLoadingPaymentMethods(false);
        }
    };

    const handlePaymentMethodSelect = (method) => {
        setSelectedPaymentMethod(method);
    };

    const handleAddressSelect = (addressId) => {
        setSelectedAddressId(addressId);
    };

    const handlePayNowClick = async () => {
        if (!selectedAddressId) {
            showAlert(t('checkout.messages.selectDeliveryAddress'), 'error');
            return;
        }

        if (cartItems.length === 0) {
            showAlert(t('checkout.messages.cartEmpty'), 'error');
            return;
        }

        // Validate payment method selection (optional - will default to 2 if not provided)
        // if (!selectedPaymentMethod) {
        //     showAlert(t('checkout.messages.selectPaymentMethod'), 'error');
        //     return;
        // }

        try {
            setIsProcessing(true);
            
            // Get user data from localStorage
            const userDataString = localStorage.getItem('userData');
            
            if (!userDataString) {
                showAlert(t('checkout.messages.userDataNotFound'), 'error');
                setIsProcessing(false);
                return;
            }

            let userData;
            try {
                userData = JSON.parse(userDataString);
            } catch (parseError) {
                console.error('Error parsing user data:', parseError);
                showAlert(t('checkout.messages.invalidUserData'), 'error');
                setIsProcessing(false);
                return;
            }

            const customerId = userData._id;
            
            if (!customerId) {
                showAlert(t('checkout.messages.userIdNotFound'), 'error');
                setIsProcessing(false);
                return;
            }

            // Create order payload
            const orderPayload = {
                customerId: customerId,
                products: cartItems.map(item => ({
                    productId: item._id,
                    quantity: item.quantity,
                    price: item.price
                })),
                customerAddressId: selectedAddressId,
                totalAmount: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
                paymentMethodId: selectedPaymentMethod?.PaymentMethodId || 2 // Use selected method or default to 2 (VISA/MASTER)
            };

            // Make API call to create order
            const response = await fetch(`${BaseUrl}/customer/place-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify(orderPayload)
            });

            if (response.ok) {
                const orderData = await response.json();
                
                // Debug: Log the full response to understand the structure
                console.log('📦 Order response:', orderData);
                console.log('💳 Payment Info:', orderData.paymentInfo);
                
                // showAlert(t('checkout.messages.orderPlacedSuccess'), 'success');
                
                // Check if there's an invoice URL to redirect to
                // Try multiple possible paths for the invoice URL
                const invoiceUrl = orderData.paymentInfo?.invoiceUrl || 
                                  orderData.paymentInfo?.paymentUrl || 
                                  orderData.invoiceUrl ||
                                  orderData.paymentUrl;
                
                console.log('🔗 Invoice URL found:', invoiceUrl);
                
                if (invoiceUrl) {
                    // Store order info for payment result handling (cart will be cleared on successful payment)
                    localStorage.setItem('pendingOrder', JSON.stringify({
                        orderId: orderData.orderId,
                        cartItems: cartItems, // Keep original cart items for restoration if needed
                        timestamp: Date.now()
                    }));
                    
                    console.log('🛒 Order placed, redirecting to payment URL:', invoiceUrl);
                    console.log('🛒 Cart will be cleared on successful payment');
                    
                    // Don't set isProcessing to false before redirect - let it stay true during redirect
                    // Use setTimeout to ensure alert is shown and state updates complete before redirect
                    setTimeout(() => {
                        // Redirect to Fatora payment page in the same tab
                        // Using window.location.replace to prevent back button issues
                        console.log('🚀 Executing redirect to:', invoiceUrl);
                        window.location.replace(invoiceUrl);
                    }, 300);
                    // Don't set isProcessing to false here - we're redirecting away
                    return; // Exit early since we're redirecting
                } else {
                    console.warn('⚠️ No invoice URL found in response. Payment info:', orderData.paymentInfo);
                    // Clear cart only if no payment gateway (direct success)
                    clearCart(); // Use CartContext clearCart function
                    setShowPaymentModal(true);
                    setIsProcessing(false);
                }
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Failed to place order';
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            showAlert(error.message || t('checkout.messages.failedToPlaceOrder'), 'error');
            setIsProcessing(false);
        }
        // Note: isProcessing is not reset in finally block when redirecting
        // because we return early and the redirect happens via setTimeout
    };

    const handleCloseModal = () => {
        setShowPaymentModal(false);
    };

    return (
        <div className="payment-page py-5">
            <div>
                <img className='side-pattern' src={SidePattern} alt="" />
            </div>
            <div className="container">
                {/* Breadcrumb Navigation */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="breadcrumb-container">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item">
                                        <span className="breadcrumb-text">{t('checkout.home')}</span>
                                    </li>
                                    <li className="breadcrumb-separator">
                                        <span className="arrow">‹</span>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <span className="breadcrumb-text">{t('checkout.cart')}</span>
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
                
                {cartItems.length === 0 ? (
                    <div className="text-center py-5">
                        <h3>{t('payment.emptyCart')}</h3>
                        <p className="text-muted">{t('payment.addItemsToCart')}</p>
                        <button 
                            className="btn btn-primary mt-3 d-flex align-items-center justify-content-center"
                            onClick={() => window.history.back()}
                        >
                            {t('payment.continueShopping')}
                        </button>
                    </div>
                ) : (
                    <div className="row g-5">
                        {/* Address Selection Section */}
                        <div className="col-lg-8">
                            <div className="address-selection mb-4">
                                <h4 className="form-title mb-3 fw-bold">{t('checkout.delivery-address')}</h4>
                                
                                {loadingAddresses ? (
                                    <div className="text-center py-3">
                                        <div className="spinner-border" role="status">
                                            <span className="visually-hidden">{t('common.loading')}</span>
                                        </div>
                                        <p className="mt-2">{t('common.loading')}</p>
                                    </div>
                                ) : addresses.length > 0 ? (
                                    <div className="addresses-list">
                                        {addresses.map((address) => (
                                            <div key={address._id} className="address-item">
                                                <div className="address-content">
                                                    <div className="address-header">
                                                        <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                                                      
                                                           <input
                                                               type="radio"
                                                               name="selectedAddress"
                                                               checked={selectedAddressId === address._id}
                                                               onChange={() => handleAddressSelect(address._id)}
                                                           />
                                                           <span className="checkmark"></span>
                                                           <h5 className="address-name pt-2">{address.name}</h5>
                                                     
                                                   
                                                            </div>
                                                 
                                                     
                                                      
                                                    </div>
                                                    <p className="address-full mt-2 mb-1">
                                                        {`${address.building}, ${address.floor_apartment}, ${address.street}, ${address.block}, ${address.area}, ${address.city}`}
                                                    </p>
                                                    <div className="address-phone" style={{display:"flex", alignItems:"center", gap:"13px"}}>
                                                    <img src={PhoneIcon} alt="" />
                                                        <span className='pt-2'>{localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).phoneNo : ''}</span>
                                                     
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-addresses text-center py-4">
                                        <p className="text-muted">{t('checkout.no-addresses')}</p>
                                        <button 
                                            className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                                            onClick={() => navigate('/profile?tab=addresses')}
                                        >
                                            {t('checkout.add-address')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Payment Method Selection Section */}
                            <div className="payment-method-selection mb-4">
                                <h4 className="form-title mb-3 fw-bold">{t('checkout.payment-method')}</h4>
                                
                                {loadingPaymentMethods ? (
                                    <div className="text-center py-3">
                                        <div className="spinner-border" role="status">
                                            <span className="visually-hidden">{t('common.loading')}</span>
                                        </div>
                                        <p className="mt-2">{t('common.loading')}</p>
                                    </div>
                                ) : paymentMethods.length > 0 ? (
                                    <div className="payment-methods-list">
                                        {paymentMethods.map((method) => (
                                            <div 
                                                key={method.PaymentMethodId} 
                                                className={`payment-method-item ${selectedPaymentMethod?.PaymentMethodId === method.PaymentMethodId ? 'selected' : ''}`}
                                                onClick={() => handlePaymentMethodSelect(method)}
                                            >
                                                <div className="payment-method-content">
                                                    <div className="payment-method-header">
                                                        <input
                                                            type="radio"
                                                            name="selectedPaymentMethod"
                                                            checked={selectedPaymentMethod?.PaymentMethodId === method.PaymentMethodId}
                                                            onChange={() => handlePaymentMethodSelect(method)}
                                                        />
                                                        <span className="checkmark"></span>
                                                        <div className="payment-method-info">
                                                            <h5 className="payment-method-name">{method.PaymentMethodEn}</h5>
                                                            {method.ServiceCharge > 0 && (
                                                                <p className="service-charge">
                                                                    {t('checkout.serviceCharge')}: {method.ServiceCharge} {method.CurrencyIso}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-payment-methods text-center py-4">
                                        <p className="text-muted">{t('checkout.no-payment-methods')}</p>
                                        <button 
                                            className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                                            onClick={fetchPaymentMethods}
                                        >
                                            {t('checkout.retry-payment-methods')}
                                        </button>
                                    </div>
                                )}
                            </div>

                          
                        </div>
                        
                        {/* Order Summary Section - Right Side */}
                        <div className="col-lg-4 px-md-0">
                            <OrderSummary 
                                cartItems={cartItems} 
                                onPayNowClick={handlePayNowClick}
                                isLoading={isProcessing}
                            />
                        </div>
                    </div>
                )}
            </div>
            
            {/* Payment Success Modal */}
            <PaymentSuccessModal 
                isOpen={showPaymentModal} 
                onClose={handleCloseModal} 
            />
        </div>
    );
};

export default Checkout;