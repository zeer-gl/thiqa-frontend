import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '/public/images/logo-white.svg';
import PersonLogo from '/public/images/person-icon.svg';
import Cart from '/public/images/cart-icon.svg';
import Search from '/public/images/search.svg';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import ProfileBanner from '../components/ProfileBanner.jsx';
import { useUser } from '../context/Profile.jsx';
import { useSPProfile } from '../context/SPProfileContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import '../css/components/profile-dropdown.scss';
import { BaseUrl } from '../assets/BaseUrl.jsx';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { 
        userProfile, 
        loadingProfile, 
        isLoggedIn, 
        isServiceProvider,
        fetchUserProfile,
        checkLoginStatus
    } = useUser();
    
    const { 
        spProfile, 
        loadingSpProfile, 
        refreshSPProfile 
    } = useSPProfile();
    
    const { cartCount } = useCart();
    const [notificationCount, setNotificationCount] = useState(0);
    const [loadingNotifCount, setLoadingNotifCount] = useState(false);
    
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const toggleRef = useRef();
    const dropdownRef = useRef();

    // Check login status when component mounts
    useEffect(() => {
        checkLoginStatus();
        
        // If logged in but no profile data, fetch it based on user type
        if (isLoggedIn && !loadingProfile) {
            if (isServiceProvider) {
                // For service providers, use SP profile context
                if (!spProfile && !loadingSpProfile) {
                    try {
                        refreshSPProfile();
                    } catch (error) {
                        console.warn('Failed to fetch SP profile in Navbar:', error);
                    }
                }
            } else {
                // For regular users, use regular profile context
                if (!userProfile && !loadingProfile) {
            try {
                fetchUserProfile();
            } catch (error) {
                console.warn('Failed to fetch user profile in Navbar:', error);
            }
        }
            }
        }
    }, [isLoggedIn, userProfile, loadingProfile, spProfile, loadingSpProfile, isServiceProvider, checkLoginStatus, fetchUserProfile, refreshSPProfile]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && showProfileMenu) {
                setShowProfileMenu(false);
            }
        };

        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [showProfileMenu]);

    const handleToggle = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        changeLanguage(newLang);
    };

    const handleRadioChange = (e) => {
        if (e.target.id === 'on') {
            changeLanguage('en');
        } else if (e.target.id === 'off') {
            changeLanguage('ar');
        }
    };

    // isServiceProvider is now provided by useUser() context
    
    // Debug logging
    console.log('🔍 Navbar Debug:', {
        isServiceProvider,
        userRole: localStorage.getItem('userRole'),
        isLoggedIn,
        timestamp: new Date().toISOString()
    });

    // Fetch notification count (same logic as profile pages)
    useEffect(() => {
        const fetchNotificationCount = async () => {
            if (!isLoggedIn) {
                setNotificationCount(0);
                return;
            }
            try {
                setLoadingNotifCount(true);
                const role = (localStorage.getItem('userRole') || '').toLowerCase();
                const isSP = role === 'sp' || isServiceProvider;
                const url = isSP 
                    ? `${BaseUrl}/professional/notification/count` 
                    : `${BaseUrl}/customer/notification/count`;
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(isSP ? 'token-sp' : 'token') || ''}`
                };
                const res = await fetch(url, { method: 'GET', headers });
                if (!res.ok) throw new Error(`Failed to fetch notification count: ${res.status}`);
                const data = await res.json();
                if (data && typeof data.count === 'number') {
                    setNotificationCount(data.count);
                } else {
                    setNotificationCount(0);
                }
            } catch (e) {
                console.warn('Navbar notification count error:', e);
                setNotificationCount(0);
            } finally {
                setLoadingNotifCount(false);
            }
        };
        fetchNotificationCount();
    }, [isLoggedIn, isServiceProvider]);

    return (
        <nav className="navbar navbar-expand-lg navbar-light">
            <div className="container-fluid px-3 px-md-5">
                {isLoggedIn ? (
                    <div 
                        ref={dropdownRef}
                        className="profile-dropdown-container"
                        onMouseEnter={() => {
                            if (window.innerWidth > 768) {
                                setShowProfileMenu(true);
                            }
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Toggle dropdown on click (works for both desktop and mobile)
                            setShowProfileMenu(!showProfileMenu);
                        }}
                        style={{ position: 'relative', cursor: 'pointer' }}
                    >
                        <ProfileBanner 
                            isServiceProvider={isServiceProvider} 
                            userProfile={isServiceProvider ? spProfile : userProfile}
                            loading={isServiceProvider ? loadingSpProfile : loadingProfile}
                        />
                        {showProfileMenu && (
                            <div 
                                className="dropdown-menu show profile-dropdown-menu" 
                                onMouseEnter={() => {
                                    if (window.innerWidth > 768) {
                                        setShowProfileMenu(true);
                                    }
                                }}
                                style={{ zIndex: 1050 }}
                            >
                                <Link 
                                    className="dropdown-item profile-dropdown-item" 
                                    to={isServiceProvider ? "/profile-sp" : "/profile"} 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('🔍 Profile Link Click Debug:', {
                                            isServiceProvider,
                                            userRole: localStorage.getItem('userRole'),
                                            targetUrl: isServiceProvider ? "/profile-sp" : "/profile",
                                            currentLanguage: i18n.language,
                                            savedLanguage: localStorage.getItem('i18nextLng')
                                        });
                                        setShowProfileMenu(false);
                                        // Navigate using React Router to preserve language state
                                        navigate(isServiceProvider ? "/profile-sp" : "/profile");
                                    }}
                                    style={{
                                        color: 'white',
                                        padding: '0.75rem 1rem',
                                        display: 'block',
                                        textDecoration: 'none',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    {t('nav.profile', 'Profile')}
                                </Link>
                                <button 
                                    className="dropdown-item profile-dropdown-item" 
                                    onClick={(e) => { 
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowProfileMenu(false);
                                        
                                        // Preserve cart data and subscription status before logout
                                        const cartData = localStorage.getItem('cart');
                                        const spPaymentStatus = localStorage.getItem('spPaymentStatus');
                                        const spHasActiveSubscription = localStorage.getItem('spHasActiveSubscription');
                                        const spSubscriptionStatus = localStorage.getItem('spSubscriptionStatus');
                                        
                                        // Clear all localStorage except cart and subscription status
                                        localStorage.removeItem("isLoggedIn");
                                        localStorage.removeItem("userRole");
                                        localStorage.removeItem("userData");
                                        localStorage.removeItem("userId");
                                        localStorage.removeItem("token");
                                        localStorage.removeItem("token-sp");
                                        localStorage.removeItem("serviceProviderId");
                                        localStorage.removeItem("spUserData");
                                        localStorage.removeItem("registrationData");
                                        
                                        // Restore cart data if it existed
                                        if (cartData) {
                                            localStorage.setItem('cart', cartData);
                                        }
                                        
                                        // Restore subscription status if it existed
                                        if (spPaymentStatus) {
                                            localStorage.setItem('spPaymentStatus', spPaymentStatus);
                                        }
                                        if (spHasActiveSubscription) {
                                            localStorage.setItem('spHasActiveSubscription', spHasActiveSubscription);
                                        }
                                        if (spSubscriptionStatus) {
                                            localStorage.setItem('spSubscriptionStatus', spSubscriptionStatus);
                                        }
                                        
                                        window.location.href = isServiceProvider ? '/login-sp' : '/login'; 
                                    }}
                                    style={{
                                        color: 'white',
                                        padding: '0.75rem 1rem',
                                        display: 'block',
                                        width: '100%',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    {t('nav.logout', 'Logout')}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link className="navbar-brand m-0" to="/">
                        <img src={Logo} alt="" />
                    </Link>
                )}

                <button
                    className="navbar-toggler p-0"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul className="navbar-nav gap-4 mx-3 mb-3 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">{t('nav.home')}</Link>
                        </li>
                        {!isServiceProvider && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/offers">{t('nav.offers')}</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/products">{t('nav.products')}</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/contact">{t('nav.contact', 'Contact Us')}</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/service-list">{t('nav.serviceProviders', 'Service Providers')}</Link>
                                </li>
                            </>
                        )}
                        {!isServiceProvider && (
                        <li className="nav-item">
                            <Link className="nav-link" to="/product-showcase">{t('nav.about')}</Link>
                        </li>
                        )}
                    </ul>
                    
                    <div className='navbar-actions-container mb-3 mb-lg-0'>
                        {!isLoggedIn && !isServiceProvider && (
                            <div className='register-btn-wrapper'>
                                <Link className='btn register-btn-nav' to='login-sp'>
                                    <img src={PersonLogo} alt=""/>
                                   <span>

                                   {t('nav.registerAsServiceProvider')}
                                   </span>
                                 
                                </Link>
                            </div>
                        )}
                        
                        <div className='nav-icons-wrapper d-flex align-items-center gap-2 justify-content-center w-100'>
                            {/* Notifications bell - navigates to role-specific notifications tab */}
                            {isLoggedIn && (
                                <button
                                    type="button"
                                    aria-label={t('nav.notifications', 'Notifications')}
                                    className="cart-icon-wrapper position-relative"
                                    onClick={() => {
                                        const role = (localStorage.getItem('userRole') || '').toLowerCase();
                                        const target = role === 'sp' || isServiceProvider ? '/profile-sp?tab=notifications' : '/profile?tab=notifications';
                                        navigate(target);
                                    }}
                                    style={{ 
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '32px',
                                        height: '32px',
                                        background: 'transparent',
                                        border: 'none',
                                        padding: 0,
                                        marginRight: '6px',
                                        verticalAlign: 'middle'
                                    }}
                                >
                                    <i className="fas fa-bell" style={{ color: '#ffffff', fontSize: '18px' }}></i>
                                    {notificationCount > 0 && (
                                        <span 
                                            className="cart-badge p-1 position-absolute badge rounded-pill bg-danger"
                                            style={{
                                                fontSize: '10px',
                                                minWidth: '18px',
                                                height: '18px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '2px 6px',
                                                top: '-6px',
                                                right: '-6px',
                                                lineHeight: '1',
                                                zIndex: '10'
                                            }}
                                        >
                                            {notificationCount}
                                        </span>
                                    )}
                                </button>
                            )}
                            {!isServiceProvider && isLoggedIn && (
                                <Link 
                                    to="/payment" 
                                    className="cart-icon-wrapper position-relative"
                                    style={{ 
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '32px',
                                        height: '32px'
                                    }}
                                >
                                    <img 
                                        src={Cart} 
                                        alt={t('nav.cart', 'Cart')} 
                                        style={{ 
                                            width: '24px', 
                                            height: '24px',
                                            filter: 'brightness(0) saturate(100%) invert(100%)'
                                        }} 
                                    />
                                    {cartCount > 0 && (
                                        <span 
                                            className="cart-badge p-1 position-absolute  badge rounded-pill bg-danger"
                                            style={{
                                                fontSize: '10px',
                                                minWidth: '18px',
                                                height: '18px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '2px 6px',
                                                top: '-6px',
                                                right: '-6px',
                                                lineHeight: '1',
                                                zIndex: '10'
                                            }}
                                        >
                                            <span className=''>
                                            {cartCount}
                                            </span>
                                          
                                        </span>
                                    )}
                                </Link>
                            )}
                        </div>
                    </div>
                    
                    <div className='language-switcher-wrapper d-flex justify-content-center justify-content-lg-start'>
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;