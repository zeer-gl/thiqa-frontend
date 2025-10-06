import "/src/css/pages/auth.scss";
import React, { useState, useContext, useCallback, useMemo, useEffect } from "react";
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
import EmailIcon from '/public/images/auth/sms.svg';
import PersonIcon from '/public/images/person-icon.svg';

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
                    error = t('auth.signup.validation.emailRequired', 'Email is required');
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = t('auth.signup.validation.emailInvalid', 'Please enter a valid email');
                }
                break;
            case 'password':
                if (!value) {
                    error = t('auth.signup.validation.passwordRequired', 'Password is required');
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
                
                showAlert(t('auth.login.loginSuccess', 'Login successful'), 'success');
                navigate('/');
            } else {
                const err = await res.json().catch(() => ({}));

                // Handle and translate error messages
                let errorMessage = err?.message || err?.error || t('auth.login.loginFailed', 'Login failed');
                
                // Translate common English error messages to Arabic
                if (errorMessage.toLowerCase().includes('invalid credentials') ||
                    errorMessage.toLowerCase().includes('invalid email or password') ||
                    errorMessage.toLowerCase().includes('wrong password') ||
                    errorMessage.toLowerCase().includes('incorrect password')) {
                    errorMessage = t('auth.login.invalidCredentials', 'Invalid credentials');
                } else if (errorMessage.toLowerCase().includes('user not found') ||
                           errorMessage.toLowerCase().includes('email not found')) {
                    errorMessage = t('auth.login.userNotFound', 'User not found');
                } else if (errorMessage.toLowerCase().includes('account not verified') ||
                           errorMessage.toLowerCase().includes('email not verified')) {
                    errorMessage = t('auth.login.accountNotVerified', 'Account not verified');
                } else if (errorMessage.toLowerCase().includes('account blocked') ||
                           errorMessage.toLowerCase().includes('account suspended')) {
                    errorMessage = t('auth.login.accountBlocked', 'Account blocked');
                } else if (errorMessage.toLowerCase().includes('too many attempts') ||
                           errorMessage.toLowerCase().includes('too many tries') ||
                           errorMessage.toLowerCase().includes('15 min') ||
                           errorMessage.toLowerCase().includes('15 minutes')) {
                    errorMessage = t('auth.login.tooManyAttempts', 'Too many attempts. Please try again after 15 minutes');
                }
                
                showAlert(errorMessage, 'error');
                setBackendError(errorMessage);
               
                // Set specific field errors if provided by backend
                if (err.field) {
                    setErrors(prev => ({ ...prev, [err.field]: errorMessage }));
                }
            }
        } catch (err) {
            // Handle and translate network errors
            let errorMessage = err.message || t('auth.login.networkError', 'Network error');
            
            if (errorMessage.toLowerCase().includes('network') ||
                errorMessage.toLowerCase().includes('connection') ||
                errorMessage.toLowerCase().includes('fetch')) {
                errorMessage = t('auth.login.networkError', 'Network error');
            }
            
            showAlert(errorMessage, 'error');
        } finally {
            setSubmitting(false);
        }
    }, [email, password, validateForm, showAlert, t, navigate]);

    // GOOGLE LOGIN FOR CUSTOMER
    const handleGoogleLogin = useCallback(async () => {
        setSocialSubmitting(true);
        
        try {
            console.log('🔍 Google Login Debug:', {
                currentUrl: window.location.href,
                hostname: window.location.hostname,
                authDomain: auth.app.options.authDomain,
                projectId: auth.app.options.projectId
            });
            
            const provider = new GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');
            console.log('🔍 Google Provider Created:', provider);
            
            const result = await signInWithPopup(auth, provider);
            console.log('🔍 Google Auth Result:', result);
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
                federatedId,
                email: result.user.email || '',
                displayName: result.user.displayName || '',
                givenName: rawUserInfo.given_name || result.user.displayName?.split(' ')[0] || '',
                familyName: rawUserInfo.family_name || result.user.displayName?.split(' ').slice(1).join(' ') || '',
                picture: rawUserInfo.picture || result.user.photoURL || '',
                verifiedEmail: rawUserInfo.verified_email || result.user.emailVerified || false
            };

            console.log('Google login request:', requestBody);
            console.log('API URL:', `${BaseUrl}/customer/oauth-register-login`);

            const res = await fetch(`${BaseUrl}/customer/oauth-register-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });
            
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message || `Google login failed (${res.status})`);
            }
            
            const data = await res.json();
            console.log('Google authentication data:', data);
            
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
            
            // Show success message based on API response
            const successMessage = data.message || t('auth.signup.googleAuthenticationSuccess', 'Google authentication successful');
            showAlert(successMessage, 'success');
            navigate("/");
            
        } catch (err) {
            console.error('🔍 Google Login Error:', {
                error: err,
                message: err?.message,
                code: err?.code,
                stack: err?.stack,
                currentUrl: window.location.href,
                authDomain: auth.app.options.authDomain,
                projectId: auth.app.options.projectId
            });
            
            let msg = '';
            if (err?.code === 'auth/unauthorized-domain') {
                msg = `Domain ${window.location.hostname} is not authorized. Please contact support.`;
            } else if (err?.code === 'auth/popup-closed-by-user') {
                msg = t('auth.signup.googleRegistrationFailed', 'Google login cancelled by user');
            } else if (err?.message?.includes('unauthorized')) {
                msg = `Domain ${window.location.hostname} is not authorized. Please contact support.`;
            } else if (err?.message?.includes('redirect_uri_mismatch')) {
                msg = 'Google OAuth redirect URI mismatch. Please contact support.';
            } else if (err?.message?.includes('Error 400')) {
                msg = 'Google OAuth configuration error. Please contact support.';
            } else if (err?.code === "auth/configuration-not-found") {
                msg = t('auth.signup.googleConfigMissing', 'Google configuration missing');
            } else {
                msg = err?.message || t('auth.signup.googleRegistrationFailed', 'Google login failed');
            }
            
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
            
            // Don't set custom parameters - let Firebase handle redirect URL automatically
            const result = await signInWithPopup(auth, provider);
            console.log('🔍 Apple Auth Result:', result);
            const credential = OAuthProvider.credentialFromResult(result);
            const idToken = credential?.idToken;
            const accessToken = credential?.accessToken;
            
            if (!idToken) throw new Error("Apple authentication failed - no ID token");
        
            const requestBody = { 
                idToken, 
                accessToken,
                token: 'device_token_here',
                role: 'customer',
                registrationType: 'customer',
                userType: 'customer',
                providerId: 'apple.com',
                customerId: result.user.uid,
                email: result.user.email,
                name: result.user.displayName || result.user.email?.split('@')[0] || 'Apple User',
                password: 'apple_signin_' + result.user.uid, // Generate a password for Apple users
                // Try multiple password field variations that backend might expect
                userPassword: 'apple_signin_' + result.user.uid,
                user_password: 'apple_signin_' + result.user.uid,
                pwd: 'apple_signin_' + result.user.uid,
                pass: 'apple_signin_' + result.user.uid,
                // Try nested password structure
                user: {
                    password: 'apple_signin_' + result.user.uid,
                    name: result.user.displayName || result.user.email?.split('@')[0] || 'Apple User',
                    email: result.user.email
                },
                // Try customer object structure
                customer: {
                    password: 'apple_signin_' + result.user.uid,
                    name: result.user.displayName || result.user.email?.split('@')[0] || 'Apple User',
                    email: result.user.email,
                    phone: '',
                    address: '',
                    city: '',
                    country: '',
                    dateOfBirth: '',
                    gender: ''
                },
                // Try different root-level field names
                customerPassword: 'apple_signin_' + result.user.uid,
                customer_password: 'apple_signin_' + result.user.uid,
                customerPwd: 'apple_signin_' + result.user.uid,
                customerPass: 'apple_signin_' + result.user.uid,
                // Try different field structures
                credentials: {
                    password: 'apple_signin_' + result.user.uid
                },
                auth: {
                    password: 'apple_signin_' + result.user.uid
                },
                profile: {
                    password: 'apple_signin_' + result.user.uid
                },
                pic: result.user.photoURL || '',
                federatedId: result.user.providerData?.[0]?.uid || result.user.uid,
                firstName: result.user.displayName?.split(' ')[0] || result.user.email?.split('@')[0] || 'Apple',
                lastName: result.user.displayName?.split(' ').slice(1).join(' ') || 'User',
                fullName: result.user.displayName || result.user.email?.split('@')[0] || 'Apple User',
                photoUrl: result.user.photoURL || '',
                emailVerified: result.user.emailVerified || false,
                localId: result.user.uid,
                rawId: result.user.providerData?.[0]?.uid || result.user.uid,
                appleUserId: result.user.providerData?.[0]?.uid || result.user.uid,
                // Additional fields that might be required by backend
                username: result.user.email?.split('@')[0] || 'apple_user',
                phone: '', // Apple doesn't provide phone number
                address: '', // Apple doesn't provide address
                city: '', // Apple doesn't provide city
                country: '', // Apple doesn't provide country
                dateOfBirth: '', // Apple doesn't provide date of birth
                gender: '', // Apple doesn't provide gender
                isActive: true,
                isVerified: true,
                loginMethod: 'apple',
                socialProvider: 'apple.com'
            };

            console.log('🔍 Apple Sign-In Request Body:', requestBody);
            console.log('🔍 Required fields check:', {
                hasPassword: !!requestBody.password,
                hasName: !!requestBody.name,
                passwordValue: requestBody.password,
                nameValue: requestBody.name,
                allPasswordFields: {
                    password: requestBody.password,
                    userPassword: requestBody.userPassword,
                    user_password: requestBody.user_password,
                    pwd: requestBody.pwd,
                    pass: requestBody.pass
                },
                nestedStructures: {
                    userPassword: requestBody.user?.password,
                    customerPassword: requestBody.customer?.password,
                    userObject: requestBody.user,
                    customerObject: requestBody.customer
                }
            });

            const res = await fetch(`${BaseUrl}/customer/oauth-register-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData?.message || `Apple login failed (${res.status})`);
            }
            
            const data = await res.json();
            console.log('Apple authentication data:', data);
            
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
            
            // Show success message based on API response
            const successMessage = data.message || t('auth.signup.appleAuthenticationSuccess', 'Apple authentication successful');
            showAlert(successMessage, 'success');
            navigate("/");
            
        } catch (err) {
            const msg = (err?.code === "auth/configuration-not-found")
                ? t('auth.signup.appleConfigMissing', 'Apple configuration missing')
                : (err?.message || t('auth.signup.appleRegistrationFailed', 'Apple login failed'));
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
                                    <h2 className={`pb-3 ${i18n.language === 'ar' ? 'ar-heading-bold' : ''}`}>{t('auth.login.title')}</h2>
                                    <h5 className={i18n.language === 'ar' ? 'ar-heading-bold' : ''}>{t('auth.login.subtitle')}</h5>
                                </div>
                      
                                <form onSubmit={handleLogin}>
                                    <div>
                                        <div className="form-group mb-3">
                                            <label htmlFor="email" className='form-label'>{t('auth.login.email')}</label>
                                            <div className="position-relative">
                                                <div className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'}`}>
                                                    <img src={EmailIcon} alt="Email" style={{ width: '20px', height: '20px' }} />
                                                </div>
                                                <input 
                                                    type="email" 
                                                    className={`form-control no-bg-icon ${i18n.dir() === 'rtl' ? 'pe-5' : 'ps-5'} ${errors.email ? 'is-invalid' : ''}`}
                                                    id="email"
                                                    placeholder={t('auth.login.email')}
                                                    value={email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                />
                                            </div>
                                            {errors.email && (
                                                <div className="text-danger mt-1">{errors.email}</div>
                                            )}
                                        </div>
                                        <div className="form-group mb-3">
                                            <label htmlFor="password" className='form-label'>{t('auth.login.password')}</label>
                                            <div className="position-relative">
                                                <div className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'}`}>
                                                    <img src={PersonIcon} alt="Password" style={{ width: '20px', height: '20px' }} />
                                                </div>
                                                <input 
                                                    type={showPassword ? "text" : "password"}
                                                    className={`form-control no-bg-icon ${i18n.dir() === 'rtl' ? 'pe-5' : 'ps-5'} ${showPassword ? 'password-field' : ''} ${errors.password ? 'is-invalid' : ''}`}
                                                    id="password"
                                                    placeholder={t('auth.login.password')}
                                                    value={password}
                                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                                />
                                                <div 
                                                    className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'start-0 ps-5' : 'end-0 pe-3'}`}
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
                                                    // className="pt-2"
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
                                                className='btn ev-submit-btn d-flex align-items-center justify-content-center' 
                                                disabled={submitting}
                                            >
                                                {submitting ? (t('common.sending') || "Logging in...") : (
                                                    <>
                                                        {t('auth.login.loginButton')} <img src={ArrowRight}
                                                        className="pt-1"
                                                        alt=""/>
                                                    </>
                                                )}
                                            </button>
                                            <div className='text-center mt-3'>
                                        <Link className='btn pt-2  ev-submit-btn text-decoration-none d-flex align-items-center justify-content-center' to='/login-sp'>
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
                                                <span className="">
                                                {t("auth.signup.google")}
                                                </span>
                                              
                                                <img src={GoogleIcon} alt="" />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn d-flex align-items-center gap-3 justify-content-between register-socials"
                                                onClick={handleAppleLogin}
                                                disabled={socialSubmitting}
                                            >
                                                <span className="">

                                                {t("auth.signup.apple")}
                                                </span>
                                             
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