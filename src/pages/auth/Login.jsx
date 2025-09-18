import "/src/css/pages/auth.scss";
import React, { useState, useContext, useCallback, useMemo } from "react";
import Logo from "/public/images/favicon.png";
import CustomCheckbox from '/src/components/CustomCheckbox.jsx';
import ArrowRight from '/public/images/arrow-right.svg';
import EyeIcon from '/public/images/eye.svg';
import AuthBg from '/public/images/auth/auth-bg.svg';
import AuthUpper from '/public/images/auth/auth-upper.svg';
import AuthLower from '/public/images/auth/auth-lower.svg';
import AuthMockup from '/public/images/auth/auth-mockup.png';
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher.jsx';
import { BaseUrl } from '../../assets/BaseUrl.jsx';
import { AlertContext } from '../../context/AlertContext.jsx';
import { auth } from '../../firbase';
import { GoogleAuthProvider, OAuthProvider, signInWithPopup } from 'firebase/auth';
import GoogleIcon from '/public/images/auth/google-icon.svg';
import AppleIcon from '/public/images/auth/apple-icon.svg';

function Login() {
    const {t, i18n} = useTranslation();
    const navigate = useNavigate();
    const { showAlert } = useContext(AlertContext);
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [socialSubmitting, setSocialSubmitting] = useState(false);
    
    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    
    // Error state
    const [errors, setErrors] = useState({});
    const[backendErrror,setBackendError]=useState(null);
 
    
    const changeLanguage = useCallback((lng) => {
        i18n.changeLanguage(lng);
    }, [i18n]);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    // Validation functions - memoized to prevent unnecessary re-renders
    const validateField = useCallback((name, value) => {
        let error = '';
        
        switch(name) {
            case 'email':
                if (!value.trim()) {
                    error = t('Email is required');
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = t('Please enter a valid email');
                }
                break;
            case 'password':
                if (!value) {
                    error = t('Password is required');
                }
                break;
                case 'rememberMe':
                    // For checkbox, you might want to validate if it's required to be checked
                    // For example: if (!value) error = t('You must agree to remember me');
                    // For most cases, remember me is optional, so no validation needed
                    break;
            default:
                break;
        }
        
        return error;
    }, [t]);

    const validateForm = useCallback(() => {
        const newErrors = {
            email: validateField('email', email),
            password: validateField('password', password)
        };
        
        setErrors(newErrors);
        return !newErrors.email && !newErrors.password;
    }, [email, password, validateField]);

    const handleInputChange = useCallback((field, value) => {
        // Update the field value
        if (field === 'email') setEmail(value);
        if (field === 'password') setPassword(value);
        if (field === 'rememberMe') setRememberMe(value);
        
        // Clear the error for this field as user types
        if (errors[field]) {
            const error = validateField(field, value);
            setErrors(prev => ({ ...prev, [field]: error }));
        }
    }, [errors, validateField]);

    const handleLogin = useCallback(async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setSubmitting(true);
        
        try {
            const res = await fetch(`${BaseUrl}/customer/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            
            if (res.ok) {
                const data = await res.json();
                
                // Store customer data (API returns 'customer' not 'user')
                if (data.customer) {
                    localStorage.setItem('userData', JSON.stringify(data.customer));
                }
                
                // Set login status
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', 'user');
                localStorage.setItem('token',data.token);
                
                showAlert(t('Login successful'), 'success');
                navigate('/');
            } else {
                const err = await res.json().catch(() => ({}));

               
                const backendMessage = err?.message || err?.error || t('Login failed');
                showAlert(backendMessage, 'error');
                setBackendError(backendMessage)
               
                // Set specific field errors if provided by backend
                if (err.field) {
                    setErrors(prev => ({ ...prev, [err.field]: backendMessage }));
                }
            }
        } catch (err) {
            showAlert(err.message || t('Network error occurred'), 'error');
        } finally {
            setSubmitting(false);
        }
    }, [email, password, validateForm, showAlert, t, navigate]);

    // GOOGLE LOGIN FOR CUSTOMER
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
                token: 'device_token_here',
                role: 'customer', // Indicate this is for customer login
                registrationType: 'customer',
                userType: 'customer',
                providerId: 'google.com', // Add required providerId for Google authentication
                customerId: googleUserId || result.user.uid, // Use Google user ID as customerId
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

            console.log('Google login request:', requestBody);
            console.log('API URL:', `${BaseUrl}/customer/customer-google-registration`);

            const res = await fetch(`${BaseUrl}/customer/customer-google-registration`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });
            
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message || `Google login failed (${res.status})`);
            }
            
            if(res.ok){
                const data = await res.json();
                console.log('Google login data:', data);
                
                // Store user data and token
                if (data.customer) {
                    localStorage.setItem('userData', JSON.stringify(data.customer));
                }
                
                // Set login status
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', 'user');
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                
                showAlert(t('Google login successful'), 'success');
                navigate("/");
            }
            
        } catch (err) {
            const msg = (err?.code === "auth/configuration-not-found")
                ? "Google configuration missing"
                : (err?.message || "Google login failed");
            showAlert(msg, 'error');
        } finally {
            setSocialSubmitting(false);
        }
    }, [showAlert, t, navigate]);

    // APPLE LOGIN FOR CUSTOMER
    const handleAppleLogin = useCallback(async () => {
        setSocialSubmitting(true);
        
        try {
            const provider = new OAuthProvider("apple.com");
            provider.addScope('email');
            provider.addScope('name');
            
            const result = await signInWithPopup(auth, provider);
            const credential = OAuthProvider.credentialFromResult(result);
            const idToken = credential.idToken;
            const accessToken = credential.accessToken;
            
            if (!idToken) throw new Error("Apple authentication failed - no ID token");
        
            const res = await fetch(`${BaseUrl}/customer/customer-apple-registration`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    idToken, 
                    accessToken,
                    token: 'device_token_here',
                    role: 'customer', // Indicate this is for customer login
                    registrationType: 'customer',
                    userType: 'customer',
                    providerId: 'apple.com', // Add required providerId for Apple authentication
                    customerId: result.user.uid, // Use Apple user ID as customerId
                    email: result.user.email, // Add email from Apple user
                    name: result.user.displayName || result.user.email?.split('@')[0] || '', // Add name from Apple user
                    pic: result.user.photoURL || '', // Add profile picture from Apple user
                    federatedId: result.user.providerData?.[0]?.uid || result.user.uid, // Add Apple federated ID
                    firstName: result.user.displayName?.split(' ')[0] || '', // Add first name
                    lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '', // Add last name
                    fullName: result.user.displayName || '', // Add full name
                    photoUrl: result.user.photoURL || '', // Add photo URL
                    emailVerified: result.user.emailVerified || false, // Add email verification status
                    localId: result.user.uid, // Add Firebase local ID
                    rawId: result.user.providerData?.[0]?.uid || result.user.uid, // Add raw Apple ID
                    appleUserId: result.user.providerData?.[0]?.uid || result.user.uid // Add explicit Apple user ID
                })
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData?.message || `Apple login failed (${res.status})`);
            }
            
            const data = await res.json();
            
            // Store user data and token
            if (data.customer) {
                localStorage.setItem('userData', JSON.stringify(data.customer));
            }
            
            // Set login status
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userRole', 'user');
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            
            showAlert(t('Apple login successful'), 'success');
            navigate("/");
            
        } catch (err) {
            const msg = (err?.code === "auth/configuration-not-found")
                ? "Apple configuration missing"
                : (err?.message || "Apple login failed");
            showAlert(msg, 'error');
        } finally {
            setSocialSubmitting(false);
        }
    }, [showAlert, t, navigate]);

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
                                    <h2 className='pb-3 ar-heading-bold'>{t('auth.login.title')}</h2>
                                    <h5 className="ar-heading-bold">{t('auth.login.subtitle')}</h5>
                                </div>
                      
                                <form onSubmit={handleLogin}>
                                    <div>
                                        <div className="form-group mb-3">
                                            <label htmlFor="email" className='form-label'>{t('auth.login.email')}</label>
                                            <input 
                                                type="email" 
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                id="email"
                                                placeholder={t('auth.login.email')}
                                                value={email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                            />
                                            {errors.email && (
                                                <div className="text-danger mt-1">{errors.email}</div>
                                            )}
                                        </div>
                                        <div className="form-group mb-3">
                                            <label htmlFor="password" className='form-label'>{t('auth.login.password')}</label>
                                            <div className="position-relative">
                                                <input 
                                                    type={showPassword ? "text" : "password"}
                                                    className={`form-control ${showPassword ? 'password-field' : ''} ${errors.password ? 'is-invalid' : ''}`}
                                                    id="password"
                                                    placeholder={t('auth.login.password')}
                                                    value={password}
                                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                                />
                                                <div 
                                                    className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'start-0 ps-3' : 'end-0 pe-3'}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={togglePasswordVisibility}
                                                >
                                                    <img 
                                                        src={EyeIcon} 
                                                        alt="Toggle password visibility"
                                                        style={{ width: '20px', height: '20px' }}
                                                    />
                                                </div>
                                            </div>
                                            {errors.password && (
                                                <div className="text-danger mt-1">{errors.password}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className='d-flex justify-content-between align-items-center mt-4'>
                                        <div>
                                                <CustomCheckbox 
                                                    label={t('auth.login.rememberMe')} 
                                                    checked={rememberMe}
                                                    onChange={(checked) => handleInputChange('rememberMe', checked)}
                                                />
                                                {errors.rememberMe && (
                                                    <div className="text-danger mt-1">{errors.rememberMe}</div>
                                                )}
                                            </div>
                                            <div>
                                                <Link to="/forget-password" className='text-decoration-none'>
                                                    {t('auth.login.forgotPassword')}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className='mt-4'>
                                            <button 
                                                type="submit" 
                                                className='btn ev-submit-btn' 
                                                disabled={submitting}
                                            >
                                                {submitting ? (t('common.sending') || "Logging in...") : (
                                                    <>
                                                        {t('auth.login.loginButton')} <img src={ArrowRight} alt=""/>
                                                    </>
                                                )}
                                            </button>
                                            <div className='text-center mt-3'>
                                        <Link className='btn ev-submit-btn text-decoration-none' to='/login-sp'>
                                            {t('auth.login.loginAsServiceProvider', 'Login as Service Provider')}
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
                                            <button
                                                type="button"
                                                className="btn d-flex align-items-center gap-3 justify-content-between register-socials"
                                                onClick={handleAppleLogin}
                                                disabled={socialSubmitting}
                                            >
                                                {t("auth.signup.apple")}
                                                <img src={AppleIcon} alt="" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className='text-center mt-4'>
                                        <Link className='fw-semibold text-decoration-none' to='/signup'>
                                            {t('auth.login.noAccount')} {t('auth.login.signupLink')}
                                        </Link>
                                    </div>
                                    
                                    {/* Cross-navigation to Service Provider Login */}
                                 
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;