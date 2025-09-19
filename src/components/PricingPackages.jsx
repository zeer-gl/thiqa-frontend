import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../context/AlertContext';
import { useUser } from '../context/Profile';
import { useSPProfile } from '../context/SPProfileContext';
import { BaseUrl } from '../assets/BaseUrl';
import PaymentMethods from './PaymentMethods';
import '../css/components/pricing-packages.scss';

const PricingPackages = () => {
    const { t, i18n } = useTranslation();
    const { showAlert } = useAlert();
    const { fetchUserProfile, updateSubscriptionStatus } = useUser();
    const { refreshSPProfile } = useSPProfile();
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [showPaymentMethods, setShowPaymentMethods] = useState(false);

    // Fetch subscription plans from API
    const fetchSubscriptionPlans = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token-sp');
            
            if (!token) {
                showAlert(t('pricingPackages.loginRequired', 'Please login to view subscription plans'), 'error');
                return;
            }

            const response = await fetch(`${BaseUrl}/professional/subscription/plans`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(t('pricingPackages.fetchFailed', 'Failed to fetch subscription plans'));
            }

            const data = await response.json();
            console.log('Subscription plans API response:', data);
            
            if (data.success && data.plans) {
                // Map API response to component structure
                const mappedPackages = data.plans.map(plan => {
                    console.log(`Processing plan ${plan.name}:`, {
                        features: plan.features,
                        featuresType: typeof plan.features,
                        isArray: Array.isArray(plan.features)
                    });
                    
                    // Handle features field - it can be string, array, or other types
                    let features = [];
                    if (plan.features) {
                        if (typeof plan.features === 'string') {
                            // If it's a string, split by comma
                            features = plan.features.split(',').map(f => f.trim()).filter(f => f);
                        } else if (Array.isArray(plan.features)) {
                            // If it's already an array, use it directly
                            features = plan.features.filter(f => f && f.trim());
                        } else {
                            // If it's other type, convert to string first
                            features = [String(plan.features)];
                        }
                    }

                    return {
                        id: plan.id,
                        title: plan.name,
                        price: plan.price.toString(),
                        currency: 'KWD',
                        period: plan.duration,
                        features: features,
                        isCurrentPlan: plan.isCurrentPlan,
                        status: plan.status,
                        description: plan.description
                    };
                });

                console.log('Mapped packages:', mappedPackages);
                setPackages(mappedPackages);
                setCurrentPlan(data.currentPlan);
                
                // Set first package as selected if no current plan
                if (!data.currentPlan && mappedPackages.length > 0) {
                    setSelectedPackage(mappedPackages[0].id);
                } else if (data.currentPlan) {
                    setSelectedPackage(data.currentPlan.id);
                }
            }
        } catch (error) {
            console.error('Error fetching subscription plans:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            showAlert(t('pricingPackages.loadFailed', 'Failed to load subscription plans'), 'error');
            
            // Fallback to default packages if API fails
            setPackages(getDefaultPackages());
        } finally {
            setLoading(false);
        }
    };

    // Fallback default packages
    const getDefaultPackages = () => [
        {
            id: 'safety',
            title: t('profileSP.pricingPackages.safetyPackage'),
            price: '25',
            currency: 'KWD',
            period: t('profileSP.pricingPackages.monthly'),
            features: [
                t('profileSP.pricingPackages.priceOffer'),
                t('profileSP.pricingPackages.contactClient')
            ]
        },
        {
            id: 'confidence',
            title: t('profileSP.pricingPackages.confidencePackage'),
            price: '15',
            currency: 'KWD',
            period: t('profileSP.pricingPackages.monthly'),
            features: [
                t('profileSP.pricingPackages.priceOffer'),
                t('profileSP.pricingPackages.contactClient')
            ]
        },
        {
            id: 'premium',
            title: t('profileSP.pricingPackages.premiumPackage'),
            price: '50',
            currency: 'KWD',
            period: t('profileSP.pricingPackages.monthly'),
            features: [
                t('profileSP.pricingPackages.priceOffer'),
                t('profileSP.pricingPackages.contactClient'),
                t('profileSP.pricingPackages.prioritySupport'),
                t('profileSP.pricingPackages.advancedAnalytics')
            ]
        },
        {
            id: 'enterprise',
            title: t('profileSP.pricingPackages.enterprisePackage'),
            price: '100',
            currency: 'KWD',
            period: t('profileSP.pricingPackages.monthly'),
            features: [
                t('profileSP.pricingPackages.priceOffer'),
                t('profileSP.pricingPackages.contactClient'),
                t('profileSP.pricingPackages.prioritySupport'),
                t('profileSP.pricingPackages.advancedAnalytics'),
                t('profileSP.pricingPackages.customBranding'),
                t('profileSP.pricingPackages.dedicatedManager')
            ]
        }
    ];

    // Load subscription plans on component mount
    useEffect(() => {
        fetchSubscriptionPlans();
    }, []);

    const handlePackageSelect = (packageId) => {
        setSelectedPackage(packageId);
    };

    const handlePackageClick = async (packageId) => {
        console.log('=== PACKAGE CLICKED ===');
        console.log('Package ID:', packageId);
        console.log('Available packages:', packages);
        
        const selectedPkg = packages.find(pkg => pkg.id === packageId);
        console.log('Selected package found:', selectedPkg);
        
        if (selectedPkg) {
            console.log('Processing COD payment directly for package:', selectedPkg);
            await processCODPayment(selectedPkg);
        } else {
            console.error('Package not found with ID:', packageId);
        }
    };

    const processCODPayment = async (selectedPlan) => {
        try {
            const token = localStorage.getItem('token-sp');
            
            if (!token) {
                showAlert(t('pricingPackages.loginRequired', 'Please login to proceed with subscription'), 'error');
                return;
            }

            // Get user data for mobile number
            const userData = JSON.parse(localStorage.getItem('spUserData') || '{}');
            let customerMobile = userData.phoneNo || userData.mobile || userData.phone || userData.phoneNumber || userData.contact || userData.contactNumber || '';
            
            // Clean the mobile number (remove spaces, dashes, etc.)
            if (customerMobile) {
                customerMobile = customerMobile.toString().replace(/[\s\-\(\)\+]/g, '');
            }
            
            console.log('=== COD PAYMENT PROCESSING ===');
            console.log('Selected Plan:', selectedPlan);
            console.log('Customer Mobile:', customerMobile);
            
            // Validate mobile number
            if (!customerMobile) {
                showAlert(t('pricingPackages.mobileRequired', 'Mobile number is required for subscription. Please update your profile with a valid mobile number.'), 'error');
                return;
            }
            
            if (customerMobile.length > 11) {
                showAlert(t('pricingPackages.mobileTooLong', `Mobile number is too long (${customerMobile.length} digits). Maximum allowed is 11 digits.`), 'error');
                return;
            }
            
            if (customerMobile.length < 7) {
                showAlert(t('pricingPackages.mobileTooShort', `Mobile number is too short (${customerMobile.length} digits). Please provide a valid mobile number.`), 'error');
                return;
            }

            // Show loading message
            showAlert(t('pricingPackages.processingCOD', 'Processing COD subscription...'), 'info');

            // Prepare request body for COD using existing endpoint
            const requestBody = {
                planId: selectedPlan.id,
                paymentMethodId: 'cod', // Use 'cod' as payment method ID
                CustomerMobile: customerMobile
            };

            console.log('=== COD SUBSCRIPTION REQUEST ===');
            console.log('Request URL:', `${BaseUrl}/professional/subscription/purchase`);
            console.log('Request Body:', requestBody);

            // Call existing subscription purchase API with COD payment method
            const response = await fetch(`${BaseUrl}/professional/subscription/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('COD Response Status:', response.status);
            const responseText = await response.text();
            console.log('COD Raw Response:', responseText);

            if (!response.ok) {
                // Check if it's an HTML error page (like the one you encountered)
                if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html')) {
                    throw new Error('Server endpoint not found. Please contact support to enable COD payments.');
                }
                throw new Error(`COD subscription failed: ${responseText}`);
            }

            const data = JSON.parse(responseText);
            console.log('COD Subscription Response:', data);

            // Handle different possible response structures
            if (data.success) {
                // Check if this is a COD subscription with pending status
                if (data.data && data.data.paymentMethodId === 'cod' && data.data.status === 'pending') {
                    showAlert(t('pricingPackages.codSuccess', 'COD subscription created successfully! Payment will be collected on delivery.'), 'success');
                    
                    // For COD with pending status, we need to manually update the profile
                    // since the backend might not immediately update the subscription status
                    setTimeout(async () => {
                        try {
                            console.log('🔄 Updating profile for COD subscription with pending status...');
                            
                            // Update localStorage data to reflect active subscription
                            const currentSpData = localStorage.getItem('spUserData');
                            if (currentSpData) {
                                try {
                                    const spData = JSON.parse(currentSpData);
                                    spData.hasActiveSubscription = true;
                                    spData.subscriptionStatus = 'active';
                                    spData.subscriptionPlan = data.data.planName;
                                    spData.subscriptionExpiry = data.data.nextBillingDate;
                                    localStorage.setItem('spUserData', JSON.stringify(spData));
                                    console.log('✅ Updated localStorage spUserData with COD subscription');
                                } catch (error) {
                                    console.error('Error updating localStorage:', error);
                                }
                            }
                            
                            // Update subscription status in profile context
                            updateSubscriptionStatus({
                                hasActiveSubscription: true,
                                subscriptionStatus: 'active',
                                subscriptionPlan: data.data.planName,
                                subscriptionExpiry: data.data.nextBillingDate
                            });
                            
                            // Force refresh both profile contexts
                            await fetchUserProfile();
                            await refreshSPProfile();
                            
                            console.log('✅ Profile updated for COD subscription');
                        } catch (error) {
                            console.error('❌ Error updating profile for COD subscription:', error);
                        }
                    }, 1000);
                } else {
                    // Regular success response
                    showAlert(t('pricingPackages.codSuccess', 'Subscription activated successfully! Payment will be collected on delivery.'), 'success');
                    
                    // Refresh the plans to show updated status
                    setTimeout(() => {
                        fetchSubscriptionPlans();
                    }, 1000);
                    
                    // Refresh user profile to update hasActiveSubscription status
                    setTimeout(async () => {
                        try {
                            console.log('🔄 Refreshing user profile after successful subscription...');
                            
                            // Force refresh both profile contexts
                            await fetchUserProfile();
                            await refreshSPProfile();
                            
                            console.log('✅ User profile refreshed successfully after subscription');
                        } catch (error) {
                            console.error('❌ Error refreshing user profile:', error);
                        }
                    }, 1500);
                }
            } else if (data.paymentUrl) {
                // If the API returns a payment URL (for online payment), show error for COD
                throw new Error('COD payment method not supported by backend. Please contact support.');
            } else {
                throw new Error(data.message || 'COD subscription failed');
            }

        } catch (error) {
            console.error('=== COD SUBSCRIPTION ERROR ===');
            console.error('Error:', error);
            
            let errorMessage = t('pricingPackages.codFailed', 'Failed to process COD subscription. Please try again.');
            
            if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
                errorMessage = t('pricingPackages.networkError', 'Network error. Please check your internet connection and try again.');
            } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                errorMessage = t('pricingPackages.sessionExpired', 'Session expired. Please login again and try.');
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            showAlert(errorMessage, 'error');
        }
    };

    const handleBackToPlans = () => {
        setShowPaymentMethods(false);
    };

    const handlePaymentSuccess = (plan, paymentMethod) => {
        console.log('=== PAYMENT SUCCESS HANDLER ===');
        console.log('Plan:', plan);
        console.log('Payment Method:', paymentMethod);
        
        showAlert(t('pricingPackages.subscriptionActivated', 'Subscription activated successfully!'), 'success');
        setShowPaymentMethods(false);
        // You can add additional logic here like refreshing the plans or updating user status
    };

    // Show payment methods if a plan is selected
    if (showPaymentMethods && selectedPackage) {
        const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
        return (
            <PaymentMethods 
                selectedPlan={selectedPkg}
                onBack={handleBackToPlans}
                onPaymentSuccess={handlePaymentSuccess}
            />
        );
    }

    if (loading) {
        return (
            <div className="pricing-packages-container" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="container-fluid">
                    <div className="text-center py-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">{t('common.loading', 'Loading...')}</span>
                        </div>
                        <p className="mt-3">{t('pricingPackages.loading', 'Loading subscription plans...')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pricing-packages-container" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="container-fluid">
                {packages.length > 0 ? (
                    <div className="row justify-content-center g-3">
                        {packages.map((pkg) => (
                            <div key={pkg.id} className="col-lg-6 col-md-6 col-sm-12 mb-3 mt-0">
                                <div 
                                    className={`package-card ${selectedPackage === pkg.id ? 'selected' : ''} ${pkg.isCurrentPlan ? 'current-plan' : ''} h-100`}
                                    onClick={() => handlePackageClick(pkg.id)}
                                >
                                    <div className="package-header">
                                        <div className={`radio-button ${selectedPackage === pkg.id ? 'selected' : ''}`}>
                                            <div className="radio-inner"></div>
                                        </div>
                                        <div className="package-title">
                                            {pkg.title}
                                            {pkg.isCurrentPlan && (
                                                <span className="current-plan-badge">{t('pricingPackages.currentPlan', 'Current Plan')}</span>
                                            )}
                                        </div>
                                        <div className='divider'></div>
                                        <div className="package-price ">
                                            <span className="price-amount">{pkg.price}</span>
                                            <span className="price-currency"> {pkg.currency}</span>
                                            <span className="price-period"> / {pkg.period}</span>
                                        </div>
                                    </div>
                                    <div className="package-features">
                                        {pkg.features.length > 0 ? (
                                            pkg.features.map((feature, index) => (
                                                <div key={index} className="feature-item">
                                                    {feature}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="feature-item text-muted">
                                                {t('pricingPackages.noFeaturesListed', 'No features listed')}
                                            </div>
                                        )}
                                    </div>
                                    {!pkg.isCurrentPlan && (
                                        <div className="package-action mt-3">
                                            <button className="btn btn-primary w-100">
                                                {t('pricingPackages.selectPlanCOD', 'Select Plan (COD)')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-5">
                        <div className="empty-plans">
                            <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">{t('pricingPackages.noPlansAvailable', 'No subscription plans available')}</h5>
                            <p className="text-muted">{t('pricingPackages.contactSupport', 'Please contact support for more information')}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PricingPackages;
