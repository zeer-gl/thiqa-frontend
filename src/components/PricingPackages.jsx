import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../context/AlertContext';
import { BaseUrl } from '../assets/BaseUrl';
import PaymentMethods from './PaymentMethods';
import '../css/components/pricing-packages.scss';

const PricingPackages = () => {
    const { t, i18n } = useTranslation();
    const { showAlert } = useAlert();
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

    const handlePackageClick = (packageId) => {
        console.log('=== PACKAGE CLICKED ===');
        console.log('Package ID:', packageId);
        console.log('Available packages:', packages);
        
        const selectedPkg = packages.find(pkg => pkg.id === packageId);
        console.log('Selected package found:', selectedPkg);
        
        if (selectedPkg) {
            console.log('Setting selected package and showing payment methods');
            setSelectedPackage(packageId);
            setShowPaymentMethods(true);
        } else {
            console.error('Package not found with ID:', packageId);
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
                                                {t('pricingPackages.selectPlan', 'Select Plan')}
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
