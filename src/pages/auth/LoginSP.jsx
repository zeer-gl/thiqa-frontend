import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAlert } from '../../context/AlertContext';
import { BaseUrl } from '../../assets/BaseUrl';
import "/src/css/pages/auth.scss";
import AuthUpper from "/public/images/auth/auth-upper.svg";
import AuthMockup from "/public/images/auth/auth-mockup.png";
import Logo from "/public/images/favicon.png";
import EyeIcon from '/public/images/eye.svg';
import GoogleIcon from '/public/images/auth/google-icon.svg';
import LanguageSwitcher from '../../components/LanguageSwitcher.jsx';
import PersonIcon from '/public/images/person-icon.svg';
import PhoneIcon from '/public/images/profile/phone-icon.svg';
import EmailIcon from '/public/images/auth/sms.svg';
import { auth } from '../../firbase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

function LoginSP() {
    const {t, i18n} = useTranslation();
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    
    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [socialSubmitting, setSocialSubmitting] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    
    // OTP state (keeping for potential future use)
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpValues, setOtpValues] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(59);
    
    const otpRefs = useRef([]);

    const changeLanguage = useCallback((lng) => {
        i18n.changeLanguage(lng);
    }, [i18n]);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    // Validation functions - memoized to prevent unnecessary re-renders
    const validateEmail = useCallback((val) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }, []);

    const validateForm = useCallback(() => {
        let isValid = true;
        let errorMessage = '';
        
        if (!email.trim()) {
            isValid = false;
            errorMessage = 'Email is required';
        } else if (!validateEmail(email)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        } else if (!password.trim()) {
            isValid = false;
            errorMessage = 'Password is required';
        } else if (password.length < 6) {
            isValid = false;
            errorMessage = 'Password must be at least 6 characters';
        }
        
        if (!isValid) {
            showAlert(errorMessage, 'error');
        }
        
        return isValid;
    }, [email, password, validateEmail, showAlert]);

    const handleLogin = useCallback(async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        
        // Validate form before submission
        if (!validateForm()) {
            return;
        }
        
        setSubmitting(true);
        
        try {
            console.log('Attempting professional login...');
            
            const response = await axios.post(`${BaseUrl}/professional/login`, {
                email: email.trim(),
                password: password
            });
            
            console.log('Login response:', response.data);
            
            if (response.status === 200 && response.data) {
                // Store login data
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', 'sp');
                
                if (response.data.token) {
                    localStorage.setItem('token-sp', response.data.token);
                }
                
                if (response.data.professional) {
                    localStorage.setItem('userData', JSON.stringify(response.data.professional));
                    localStorage.setItem('spUserData', JSON.stringify(response.data.professional));
                    
                    // Store service provider ID
                    if (response.data.professional._id) {
                        localStorage.setItem('serviceProviderId', response.data.professional._id);
                    }
                }
                
                showAlert('Login successful!', 'success');
                navigate('/profile-sp?tab=packages');
            } else {
                showAlert('Login failed. Please try again.', 'error');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            
            if (error.response) {
                // Server responded with error status
                const errorMessage = error.response.data?.message || error.response.data?.error || 'Login failed. Please check your credentials.';
                showAlert(errorMessage, 'error');
            } else if (error.request) {
                // Network error
                showAlert('Network error. Please check your connection.', 'error');
            } else {
                // Other error
                showAlert('An unexpected error occurred. Please try again.', 'error');
            }
        } finally {
            setSubmitting(false);
        }
    }, [email, password, validateForm, showAlert, navigate]);

    // GOOGLE LOGIN FOR SERVICE PROVIDER
    const handleGoogleLogin = useCallback(async () => {
        setSocialSubmitting(true);
        
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const idToken = credential?.idToken;
            if (!idToken) throw new Error("Google authentication failed - no ID token");

            // Extract Google user ID from provider data
            const googleUserId = result.user.providerData?.[0]?.uid;
            const federatedId = googleUserId || result.user.uid;
            
            // Parse raw user info if available
            let rawUserInfo = {};
            try {
                if (result._tokenResponse?.rawUserInfo) {
                    rawUserInfo = JSON.parse(result._tokenResponse.rawUserInfo);
                }
            } catch (e) {
                console.warn('Could not parse rawUserInfo:', e);
            }
            
            const requestBody = { 
                idToken,
                providerId: 'google.com', // Add required providerId for Google authentication
                professionalId: googleUserId || result.user.uid, // Use Google user ID as professionalId
                email: result.user.email, // Add email from Google user
                name: result.user.displayName || result.user.email.split('@')[0], // Add name from Google user
                pic: result.user.photoURL || '', // Add profile picture from Google user
                federatedId: googleUserId, // Add Google federated ID
                firstName: result.user.displayName?.split(' ')[0] || '', // Add first name
                lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '', // Add last name
                fullName: result.user.displayName || '', // Add full name
                photoUrl: result.user.photoURL || '', // Add photo URL
                emailVerified: result.user.emailVerified || false, // Add email verification status
                oauthAccessToken: credential?.accessToken || '', // Add OAuth access token
                refreshToken: credential?.refreshToken || '', // Add refresh token
                expiresIn: credential?.expiresIn || 3600, // Add token expiration
                localId: result.user.uid, // Add Firebase local ID
                rawId: googleUserId, // Add raw Google ID
                googleUserId: googleUserId, // Add explicit Google user ID
                rawUserInfo: result._tokenResponse?.rawUserInfo || '', // Add raw user info
                // Add additional Google-specific data
                googleId: rawUserInfo.id || googleUserId,
                givenName: rawUserInfo.given_name || result.user.displayName?.split(' ')[0] || '',
                familyName: rawUserInfo.family_name || result.user.displayName?.split(' ').slice(1).join(' ') || '',
                picture: rawUserInfo.picture || result.user.photoURL || '',
                verifiedEmail: rawUserInfo.verified_email || result.user.emailVerified || false
            };
            
            console.log('Google authentication request:', requestBody);
            
            // First try to login with Google (in case user already exists)
            let res = await fetch(`${BaseUrl}/professional/google-professional-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });
            
            let data;
            let isLogin = true;
            
            // If login fails, try registration
            if (!res.ok) {
                console.log('Google login failed, trying registration...');
                isLogin = false;
                
                res = await fetch(`${BaseUrl}/professional/google-professional-registration`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestBody)
                });
                
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err?.message || `Google authentication failed (${res.status})`);
                }
            }
            
            if(res.ok){
                data = await res.json();
                console.log('Google authentication data:', data);
                
                // Store service provider data - handle both professional and customer data structures
                if (data.professional && data.professional._id) {
                    localStorage.setItem('serviceProviderId', data.professional._id);
                    localStorage.setItem('spUserData', JSON.stringify(data.professional));
                } else if (data.customer && data.customer._id) {
                    // Handle case where Google login returns customer data for service provider
                    localStorage.setItem('serviceProviderId', data.customer._id);
                    localStorage.setItem('spUserData', JSON.stringify(data.customer));
                } else if (data._id) {
                    localStorage.setItem('serviceProviderId', data._id);
                    localStorage.setItem('spUserData', JSON.stringify(data));
                }
                
                // Store user role and token
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', 'sp');
                if (data.token) {
                    localStorage.setItem('token-sp', data.token);
                }
                
                // Show appropriate success message
                const successMessage = isLogin 
                    ? t('auth.loginsp.googleLoginSuccess', 'Google login successful!')
                    : t('auth.signupsp.googleRegistrationSuccess', 'Google registration successful!');
                
                showAlert(successMessage, 'success');
                navigate("/profile-sp?tab=packages");
            }
            
        } catch (err) {
            const msg = (err?.code === "auth/configuration-not-found")
                ? "Google configuration missing"
                : (err?.message || "Google login failed");
            showAlert(msg, 'error');
        } finally {
            setSocialSubmitting(false);
        }
    }, [showAlert, navigate]);


    const startTimer = () => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 59;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleOtpChange = (index, value) => {
        if (value === '' || (value.length === 1 && /^\d$/.test(value))) {
            const newOtpValues = [...otpValues];
            newOtpValues[index] = value;
            setOtpValues(newOtpValues);

            if (value !== '' && index < 3) {
                otpRefs.current[index + 1].focus();
            }
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (otpValues[index] === '' && index > 0) {
                otpRefs.current[index - 1].focus();
            } else {
                const newOtpValues = [...otpValues];
                newOtpValues[index] = '';
                setOtpValues(newOtpValues);
            }
        }
    };

    const handleOtpSubmit = (e) => {
        e.preventDefault();
        if (otpValues.every(value => value !== '')) {
            navigate('/profile-sp?tab=packages');
        } else {
            alert(t('auth.loginsp.otp.alert'));
        }
    };

    const handleResend = (e) => {
        e.preventDefault();
        setTimer(59);
        startTimer();
    };

    const closeModal = () => {
        setShowOtpModal(false);
        setOtpValues(['', '', '', '']);
        setTimer(59);
    };

    const formattedTime = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

    return (
        <div>
            <div className="auth-container">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-6 auth-img-container">
                            <div>
                                <img className='auth-upper' src={AuthUpper} alt=""/>
                            </div>
                            <div>
                                <img className='auth-mockup' src={AuthMockup} alt=""/>
                            </div>
                            <div>
                                <img className='auth-lower' src={AuthUpper} alt=""/>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="auth-switcher-wrapper">
                                <LanguageSwitcher authStyle={true} />
                            </div>
                            <div className='login-form-container'>
                                <div>
                                    <img className='auth-logo' src={Logo} alt=""/>
                                </div>
                                <div className="my-4">
                                    <h2 className='pb-3 ar-heading-bold'>{t('auth.loginsp.title', 'Professional Login')}</h2>
                                    <h5 className="ar-heading-bold">
                                        <Link to="/signup-sp" className='text-decoration-none'>
                                            {t('auth.loginsp.subtitle', 'Don\'t have an account? Sign up')}
                                        </Link>
                                    </h5>
                                </div>
                                <form onSubmit={handleLogin} className='signup-form'>
                                    <div>
                                        {/* Email Field */}
                                        <div className="form-group mb-3">
                                            <div className="position-relative">
                                                {/* <div className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'}`}>
                                                    <img src={EmailIcon} alt="Email" style={{ width: '20px', height: '20px' }} />
                                                </div> */}
                                                <input 
                                                    type="email" 
                                                    className={`form-control ${i18n.dir() === 'rtl' ? 'pe-5' : 'ps-5'} ${formSubmitted && (!email || !validateEmail(email)) ? 'is-invalid' : ''}`}
                                                    id="email"
                                                    placeholder={t('auth.loginsp.email', 'Email Address')} 
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    style={{ height: '50px' }}
                                                />
                                                {formSubmitted && (!email || !validateEmail(email)) && (
                                                    <div className="text-danger mt-1 small">
                                                        {!email ? 'Email is required' : 'Please enter a valid email address'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Password Field */}
                                        <div className="form-group mb-3">
                                            <div className="position-relative">
                                                {/* <div className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'}`}>
                                                    <img src={PersonIcon} alt="Password" style={{ width: '20px', height: '20px' }} />
                                                </div> */}
                                                <input 
                                                    type={showPassword ? "text" : "password"} 
                                                    className={`form-control ${i18n.dir() === 'rtl' ? 'pe-5' : 'ps-5'} ${formSubmitted && (!password || password.length < 6) ? 'is-invalid' : ''}`}
                                                    id="password"
                                                    placeholder={t('auth.loginsp.password', 'Password')} 
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    style={{ height: '50px' }}
                                                />
                                                <button
                                                    type="button"
                                                    className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'start-0 ps-3' : 'end-0 pe-3'}`}
                                                    onClick={togglePasswordVisibility}
                                                    style={{ background: 'none', border: 'none' }}
                                                >
                                                    <img 
                                                        src={EyeIcon} 
                                                        alt="Toggle password visibility"
                                                        style={{ width: '20px', height: '20px' }}
                                                    />
                                                </button>
                                                {formSubmitted && (!password || password.length < 6) && (
                                                    <div className="text-danger mt-1 small">
                                                        {!password ? 'Password is required' : 'Password must be at least 6 characters'}
                                                </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className='mt-4'>
                                            <button type='submit' className='btn ev-submit-btn' disabled={submitting}>
                                                {submitting ? t('common.sending', 'Logging in...') : t('auth.loginsp.login', 'Login')}
                                            </button>
                                            <div className='mt-3'>
                                            <Link to="/login" className='btn ev-submit-btn text-decoration-none'>
                                                {t('auth.loginsp.loginAsCustomer', 'Login as Customer')}
                                            </Link>
                                        </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-center mt-4">
                                        <p>{t("auth.signup.orLoginVia")}</p>
                                        <div className="d-flex justify-content-center gap-3 align-items-center mt-4">
                                            <button
                                                type="button"
                                                className="btn d-flex align-items-center gap-3 justify-content-between register-socials"
                                                onClick={handleGoogleLogin}
                                                disabled={socialSubmitting}
                                            >
                                                {t("auth.signup.google")}
                                                <img src={GoogleIcon} alt="" />
                                            </button>
                                        
                                        </div>
                                    </div>
                                    
                                    <div className='text-center mt-4'>
                                        <div className='mt-3'>
                                            <Link to="/signup-sp" className='btn seeker-auth-btn text-decoration-none'>
                                                {t('auth.loginsp.registerAsSeeker', 'Register as Service Provider')}
                                            </Link>
                                        </div>
                                        
                                        {/* Cross-navigation to Customer Login */}
                                     
                                        <div className='d-flex align-items-center gap-2 justify-content-center mt-4'>
                                            <a href="#" className='text-decoration-none fw-semibold'>
                                                {t('auth.loginsp.terms', 'Terms of Service')}
                                            </a>
                                            <p>{t('auth.loginsp.and', 'and')}</p>
                                            <a href="#" className='text-decoration-none fw-semibold'>
                                                {t('auth.loginsp.privacy', 'Privacy Policy')}
                                            </a>
                                        </div>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showOtpModal && (
                <div className="otp-modal-overlay">
                    <div className="otp-modal-content">
                        <button onClick={closeModal} className="otp-close-btn">×</button>

                        <div className="otp-header mb-4">
                            <div className="mb-3">
                                <img style={{maxWidth:'100px'}} src={Logo} alt=""/>
                            </div>
                            <h3 className="otp-title mb-2 ar-heading-bold">{t('auth.loginsp.otp.title', 'Enter OTP')}</h3>
                            <p className="otp-description navy">
                                {t('auth.loginsp.otp.description', 'Enter the code sent to your phone to verify your account.')}
                            </p>
                        </div>

                        <div className="otp-timer mb-4">
                            <span className="otp-timer-text">
                                {t('auth.loginsp.otp.timerPrefix', 'Time left:')} {formattedTime}
                            </span>
                        </div>

                        <form onSubmit={handleOtpSubmit}>
                            <div className="otp-inputs-container d-flex justify-content-center mb-4">
                                {otpValues.map((value, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => otpRefs.current[index] = el}
                                        type="text"
                                        value={value}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        maxLength={1}
                                        required
                                        className="otp-input"
                                    />
                                ))}
                            </div>

                            <button type="submit" className="btn otp-submit-btn w-100">
                                {t('auth.loginsp.otp.submit', 'Submit')}
                            </button>
                        </form>

                        <div className="text-center mt-3">
                            <a href="#" onClick={handleResend} className="otp-resend-link navy text-decoration-none">
                                {t('auth.loginsp.otp.resend', 'Resend Code')}
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LoginSP;
