import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import OrderSummary from '../components/OrderSummary';
import PaymentSuccessModal from '../components/PaymentSuccessModal';
import '../css/pages/checkout.scss';
import paypalLogo from '../assets/payment/paypal-logo.png';
import paypalImage from '../assets/payment/paypal.png';
import SidePattern from "../../public/images/side-pattern.svg";
import { BaseUrl } from '../assets/BaseUrl';
import { useAlert } from '../context/AlertContext';
import PhoneIcon from '/public/images/profile/phone-icon.svg';

const Checkout = () => {
    const { t } = useTranslation();
    const { showAlert } = useAlert();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Load cart data from localStorage
    useEffect(() => {
        const loadCartData = () => {
            try {
                const cartData = localStorage.getItem('cart');
                if (cartData) {
                    const parsedCart = JSON.parse(cartData);
                    setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
                }
            } catch (error) {
                console.error('Error loading cart data:', error);
                setCartItems([]);
            }
        };
        
        loadCartData();
    }, []);

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

        try {
            setIsProcessing(true);
            
            // Get user data from localStorage
            const userDataString = localStorage.getItem('userData');
            
            if (!userDataString) {
                showAlert(t('checkout.messages.userDataNotFound'), 'error');
                return;
            }

            let userData;
            try {
                userData = JSON.parse(userDataString);
            } catch (parseError) {
                console.error('Error parsing user data:', parseError);
                showAlert(t('checkout.messages.invalidUserData'), 'error');
                return;
            }

            const customerId = userData._id;
            
            if (!customerId) {
                showAlert(t('checkout.messages.userIdNotFound'), 'error');
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
                totalAmount: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
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
                showAlert(t('checkout.messages.orderPlacedSuccess'), 'success');
                
                // Clear cart after successful order
                localStorage.removeItem('cart');
                setCartItems([]);
                
                // Check if there's an invoice URL to redirect to
                if (orderData.paymentInfo && orderData.paymentInfo.invoiceUrl) {
                    // Open invoice URL in new secured window and monitor when it's closed
                    const paymentWindow = window.open(
                        orderData.paymentInfo.invoiceUrl,
                        'paymentWindow',
                        'width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
                    );
                    
                    // Monitor the payment window
                    const checkClosed = setInterval(() => {
                        if (paymentWindow.closed) {
                            clearInterval(checkClosed);
                            // Redirect to payment result page to handle success/failure
                            window.location.href = '/payment/result';
                        }
                    }, 1000);
                    
                    // Fallback: redirect after 30 minutes if window is still open
                    setTimeout(() => {
                        if (!paymentWindow.closed) {
                            clearInterval(checkClosed);
                            paymentWindow.close();
                            window.location.href = '/payment/result';
                        }
                    }, 30 * 60 * 1000); // 30 minutes
                } else {
                    // Fallback to success modal if no invoice URL
                    setShowPaymentModal(true);
                }
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Failed to place order';
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            showAlert(error.message || t('checkout.messages.failedToPlaceOrder'), 'error');
        } finally {
            setIsProcessing(false);
        }
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
                            className="btn btn-primary mt-3"
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
                                                           <h5 className="address-name">{address.name}</h5>
                                                     
                                                   
                                                            </div>
                                                 
                                                     
                                                      
                                                    </div>
                                                    <p className="address-full mt-2 mb-1">
                                                        {`${address.building}, ${address.floor_apartment}, ${address.street}, ${address.block}, ${address.area}, ${address.city}`}
                                                    </p>
                                                    <div className="address-phone">
                                                    <img src={PhoneIcon} alt="" />
                                                        <span>{localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).phoneNo : ''}</span>
                                                     
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-addresses text-center py-4">
                                        <p className="text-muted">{t('checkout.no-addresses')}</p>
                                        <button 
                                            className="btn btn-outline-primary"
                                            onClick={() => window.location.href = '/profile?tab=addresses'}
                                        >
                                            {t('checkout.add-address')}
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