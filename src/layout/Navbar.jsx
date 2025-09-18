import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '/public/images/logo-white.svg';
import PersonLogo from '/public/images/person-icon.svg';
import Cart from '/public/images/cart-icon.svg';
import Search from '/public/images/search.svg';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import ProfileBanner from '../components/ProfileBanner.jsx';
import { useUser } from '../context/Profile.jsx';
import { useSPProfile } from '../context/SPProfileContext.jsx';

const Navbar = () => {
    const { t, i18n } = useTranslation();
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

        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
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

    return (
        <nav className="navbar navbar-expand-lg navbar-light">
            <div className="container-fluid px-3 px-md-5">
                {isLoggedIn ? (
                    <div 
                        ref={dropdownRef}
                        onMouseEnter={() => setShowProfileMenu(true)}
                        onMouseLeave={() => setShowProfileMenu(false)}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
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
                                className="dropdown-menu show" 
                                style={{ 
                                    position: 'absolute', 
                                    top: '100%', 
                                    right: 0, 
                                    zIndex: 1000,
                                    display: 'block',
                                    opacity: 1,
                                    visibility: 'visible'
                                }}
                            >
                                <Link 
                                    className="dropdown-item" 
                                    to={isServiceProvider ? "/profile-sp" : "/profile"} 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('🔍 Profile Link Click Debug:', {
                                            isServiceProvider,
                                            userRole: localStorage.getItem('userRole'),
                                            targetUrl: isServiceProvider ? "/profile-sp" : "/profile"
                                        });
                                        setShowProfileMenu(false);
                                        // Navigate programmatically
                                        window.location.href = isServiceProvider ? "/profile-sp" : "/profile";
                                    }}
                                >
                                    {t('nav.profile', 'Profile')}
                                </Link>
                                <button 
                                    className="dropdown-item" 
                                    onClick={(e) => { 
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowProfileMenu(false);
                                        localStorage.clear(); 
                                        window.location.href = isServiceProvider ? '/login-sp' : '/login'; 
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
                    
                    <div className='navbar-actions-container d-flex align-items-start gap-3 flex-column flex-lg-row mb-3 mb-lg-0'>
                        {!isLoggedIn && !isServiceProvider && (
                            <div className='register-btn-wrapper w-100 w-lg-auto'>
                                <Link className='btn register-btn-nav w-100 w-lg-auto' to='login-sp'>
                                    <img src={PersonLogo} alt=""/>
                                    {t('nav.registerAsServiceProvider')}
                                </Link>
                            </div>
                        )}
                        
                        <div className='nav-icons-wrapper d-flex align-items-center gap-2 justify-content-center'>
                         
                           
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