import "/src/css/pages/auth.scss";
import React, { useState, useContext } from "react";
import Logo from "/public/images/favicon.png";
import ArrowRight from '/public/images/arrow-right.svg';
import AuthBg from '/public/images/auth/auth-bg.svg';
import AuthUpper from '/public/images/auth/auth-upper.svg';
import AuthLower from '/public/images/auth/auth-lower.svg';
import AuthMockup from '/public/images/auth/auth-mockup.png';
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher.jsx';
import { BaseUrl } from '../../assets/BaseUrl.jsx';
import { AlertContext } from '../../context/AlertContext.jsx';
import EmailIcon from '/public/images/auth/sms.svg';

function ForgetPasswordSP() {
    const {t, i18n} = useTranslation();
    const navigate = useNavigate();
    const { showAlert } = useContext(AlertContext);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [email, setEmail] = useState("");
    const [phoneNo, setPhoneNo] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // Flow state
    const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
    const [resetToken, setResetToken] = useState("");
    const [usePhone, setUsePhone] = useState(true); // Default to phone per backend SMS flow
    
    // Error state
    const [errors, setErrors] = useState({});
    const [backendError, setBackendError] = useState(null);
    
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    // Validation functions
    const validateField = (name, value) => {
        let error = '';
        
        switch(name) {
            case 'email':
                if (!value.trim()) {
                    error = t('auth.validation.emailRequired', 'Email is required');
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = t('auth.validation.emailInvalid', 'Please enter a valid email');
                }
                break;
            case 'phoneNo':
                if (!value.trim()) {
                    error = t('auth.validation.phoneRequired', 'Phone number is required');
                } else if (!/^\+?[1-9]\d{1,14}$/.test(value.replace(/\s/g, ''))) {
                    error = t('auth.validation.phoneInvalid', 'Please enter a valid phone number');
                }
                break;
            case 'otp':
                if (!value.trim()) {
                    error = t('auth.validation.otpRequired', 'OTP is required');
                } else if (!/^\d{6}$/.test(value)) {
                    error = t('auth.validation.otpInvalid', 'Please enter a valid 6-digit OTP');
                }
                break;
            case 'newPassword':
                if (!value.trim()) {
                    error = t('auth.validation.passwordRequired', 'Password is required');
                } else if (value.length < 6) {
                    error = t('auth.validation.passwordMinLength', 'Password must be at least 6 characters');
                }
                break;
            case 'confirmPassword':
                if (!value.trim()) {
                    error = t('auth.validation.confirmPasswordRequired', 'Please confirm your password');
                } else if (value !== newPassword) {
                    error = t('auth.validation.passwordMismatch', 'Passwords do not match');
                }
                break;
            default:
                break;
        }
        
        return error;
    };

    const validateForm = () => {
        let newErrors = {};
        
        if (currentStep === 1) {
            if (usePhone) {
                newErrors.phoneNo = validateField('phoneNo', phoneNo);
            } else {
                newErrors.email = validateField('email', email);
            }
        } else if (currentStep === 2) {
            newErrors.otp = validateField('otp', otp);
        } else if (currentStep === 3) {
            newErrors.newPassword = validateField('newPassword', newPassword);
            newErrors.confirmPassword = validateField('confirmPassword', confirmPassword);
        }
        
        setErrors(newErrors);
        return Object.values(newErrors).every(error => !error);
    };

    const handleInputChange = (field, value) => {
        // Update the field value
        switch(field) {
            case 'email':
                setEmail(value);
                break;
            case 'phoneNo':
                setPhoneNo(value);
                break;
            case 'otp':
                setOtp(value);
                break;
            case 'newPassword':
                setNewPassword(value);
                break;
            case 'confirmPassword':
                setConfirmPassword(value);
                break;
        }
        
        // Clear the error for this field as user types
        if (errors[field]) {
            const error = validateField(field, value);
            setErrors(prev => ({ ...prev, [field]: error }));
        }
    };

    // API Functions
    const sendOTP = async () => {
        try {
            const body = usePhone ? { phoneNo } : { email };
            
            const response = await fetch(`${BaseUrl}/professional/forget-password/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showAlert(t('auth.forgotPassword.otpSent', 'OTP sent to your ' + (usePhone ? 'phone number' : 'email')), 'success');
                setCurrentStep(2);
            } else {
                // Translate common backend error messages
                let errorMessage = data.message || t('auth.forgotPassword.sendOtpError', 'Failed to send OTP');
                if (errorMessage.toLowerCase().includes('professional not found with the provided email or phone number')) {
                    errorMessage = t('auth.forgotPassword.professionalNotFound', {
                        defaultValue: 'Professional not found with the provided email or phone number'
                    });
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Send OTP Error:', error);
            // Translate error message if it contains the professional not found message
            let errorMessage = error.message || t('auth.forgotPassword.networkError', 'Network error occurred');
            if (errorMessage.toLowerCase().includes('professional not found with the provided email or phone number')) {
                errorMessage = t('auth.forgotPassword.professionalNotFound', {
                    defaultValue: 'Professional not found with the provided email or phone number'
                });
            }
            showAlert(errorMessage, 'error');
        }
    };

    const verifyOTP = async () => {
        try {
            const body = usePhone ? { phoneNo, otp } : { email, otp };
            
            const response = await fetch(`${BaseUrl}/professional/forget-password/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setResetToken(data.resetToken);
                showAlert(t('auth.forgotPassword.otpVerified', 'OTP verified successfully'), 'success');
                setCurrentStep(3);
            } else {
                // Translate common backend error messages
                let errorMessage = data.message || t('auth.forgotPassword.otpInvalid', 'Invalid OTP');
                if (errorMessage.toLowerCase().includes('professional not found with the provided email or phone number')) {
                    errorMessage = t('auth.forgotPassword.professionalNotFound', {
                        defaultValue: 'Professional not found with the provided email or phone number'
                    });
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Verify OTP Error:', error);
            // Translate error message if it contains the professional not found message
            let errorMessage = error.message || t('auth.forgotPassword.networkError', 'Network error occurred');
            if (errorMessage.toLowerCase().includes('professional not found with the provided email or phone number')) {
                errorMessage = t('auth.forgotPassword.professionalNotFound', {
                    defaultValue: 'Professional not found with the provided email or phone number'
                });
            }
            showAlert(errorMessage, 'error');
        }
    };

    const resetPassword = async () => {
        try {
            const response = await fetch(`${BaseUrl}/professional/forget-password/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resetToken: resetToken,
                    newPassword: newPassword
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showAlert(t('auth.forgotPassword.passwordResetSuccess', 'Password reset successfully'), 'success');
                navigate('/login-sp');
            } else {
                throw new Error(data.message || t('auth.forgotPassword.resetError', 'Failed to reset password'));
            }
        } catch (error) {
            console.error('Reset Password Error:', error);
            showAlert(error.message || t('auth.forgotPassword.networkError', 'Network error occurred'), 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setSubmitting(true);
        
        try {
            if (currentStep === 1) {
                await sendOTP();
            } else if (currentStep === 2) {
                await verifyOTP();
            } else if (currentStep === 3) {
                await resetPassword();
            }
        } catch (error) {
            console.error('Submit Error:', error);
        } finally {
            setSubmitting(false);
        }
    };

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
                                    <h2 className={`pb-3 ${i18n.language === 'ar' ? 'ar-heading-bold' : ''}`}>
                                        {currentStep === 1 && t('auth.forgotPassword.title', 'Forgot Password')}
                                        {currentStep === 2 && t('auth.forgotPassword.verifyOtp', 'Verify OTP')}
                                        {currentStep === 3 && t('auth.forgotPassword.resetPassword', 'Reset Password')}
                                    </h2>
                                    <h5 className={i18n.language === 'ar' ? 'ar-heading-bold' : ''}>
                                        {currentStep === 1 && t('auth.forgotPassword.subtitle', 'Enter your email or phone number to receive OTP')}
                                        {currentStep === 2 && t('auth.forgotPassword.otpSubtitle', 'Enter the 6-digit OTP sent to you')}
                                        {currentStep === 3 && t('auth.forgotPassword.resetSubtitle', 'Enter your new password')}
                                    </h5>
                                </div>
                      
                                <form onSubmit={handleSubmit}>
                                    {/* Step 1: Email or Phone */}
                                    {currentStep === 1 && (
                                        <div>
                                            {/* Toggle between email and phone */}
                                            {/* <div className="mb-3">
                                                <div className="btn-group w-100" role="group">
                                                    <button
                                                        type="button"
                                                        className={`btn  pt-2 ${!usePhone ? 'btn-primary' : 'btn-outline-primary'}`}
                                                        onClick={() => setUsePhone(false)}
                                                    >
                                                        {t('auth.forgotPassword.email', 'Email')}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`btn ${usePhone ? 'btn-primary' : 'btn-outline-primary'}`}
                                                        onClick={() => setUsePhone(true)}
                                                    >
                                                        {t('auth.forgotPassword.phone', 'Phone')}
                                                    </button>
                                                </div>
                                            </div> */}

                                            {!usePhone ? (
                                                <div className="form-group mb-3">
                                                    <label htmlFor="email" className='form-label'>{t('auth.forgotPassword.email', 'Email')}</label>
                                                    <div className="position-relative">
                                                        <div className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'}`}>
                                                            <img src={EmailIcon} alt="Email" style={{ width: '20px', height: '20px' }} />
                                                        </div>
                                                        <input 
                                                            type="email" 
                                                            className={`form-control no-bg-icon ${i18n.dir() === 'rtl' ? 'pe-5' : 'ps-5'} ${errors.email ? 'is-invalid' : ''}`}
                                                            id="email"
                                                            placeholder={t('auth.forgotPassword.emailPlaceholder', 'professional@example.com')}
                                                            value={email}
                                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                                        />
                                                    </div>
                                                    {errors.email && (
                                                        <div className="text-danger mt-1">{errors.email}</div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="form-group mb-3">
                                                    <label htmlFor="phoneNo" className='form-label'>{t('auth.forgotPassword.phoneNumber', 'Phone Number')}</label>
                                                    <input 
                                                        type="tel" 
                                                        className={`form-control pt-2 ${errors.phoneNo ? 'is-invalid' : ''}`}
                                                        id="phoneNo"
                                                        placeholder={t('auth.forgotPassword.phonePlaceholder', '+965 12345678')}
                                                        value={phoneNo}
                                                        onChange={(e) => handleInputChange('phoneNo', e.target.value)}
                                                    />
                                                    {errors.phoneNo && (
                                                        <div className="text-danger mt-1">{errors.phoneNo}</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Step 2: OTP Verification */}
                                    {currentStep === 2 && (
                                        <div>
                                            <div className="form-group mb-3">
                                                <label htmlFor="otp" className='form-label'>{t('auth.forgotPassword.otp', 'OTP Code')}</label>
                                                <input 
                                                    type="text" 
                                                    className={`form-control ${errors.otp ? 'is-invalid' : ''}`}
                                                    id="otp"
                                                    placeholder={t('auth.forgotPassword.otpPlaceholder', '123456')}
                                                    value={otp}
                                                    onChange={(e) => handleInputChange('otp', e.target.value)}
                                                    maxLength="6"
                                                />
                                                {errors.otp && (
                                                    <div className="text-danger mt-1">{errors.otp}</div>
                                                )}
                                            </div>
                                         
                                        </div>
                                    )}

                                    {/* Step 3: Reset Password */}
                                    {currentStep === 3 && (
                                        <div>
                                            <div className="form-group mb-3">
                                                <label htmlFor="newPassword" className='form-label'>{t('auth.forgotPassword.newPassword', 'New Password')}</label>
                                                <input 
                                                    type="password" 
                                                    className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                                                    id="newPassword"
                                                    placeholder={t('auth.forgotPassword.newPasswordPlaceholder', 'Enter new password')}
                                                    value={newPassword}
                                                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                                />
                                                {errors.newPassword && (
                                                    <div className="text-danger mt-1">{errors.newPassword}</div>
                                                )}
                                            </div>
                                            <div className="form-group mb-3">
                                                <label htmlFor="confirmPassword" className='form-label'>{t('auth.forgotPassword.confirmPassword', 'Confirm Password')}</label>
                                                <input 
                                                    type="password" 
                                                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                                    id="confirmPassword"
                                                    placeholder={t('auth.forgotPassword.confirmPasswordPlaceholder', 'Confirm new password')}
                                                    value={confirmPassword}
                                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                />
                                                {errors.confirmPassword && (
                                                    <div className="text-danger mt-1">{errors.confirmPassword}</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <div className='mt-4'>
                                            <button 
                                                type="submit" 
                                                className='btn ev-submit-btn pt-2' 
                                                disabled={submitting}
                                            >
                                                {submitting ? (t('common.sending') || "Sending...") : (
                                                    <>
                                                        {currentStep === 1 && t('auth.forgotPassword.sendOtp', 'Send OTP')}
                                                        {currentStep === 2 && t('auth.forgotPassword.verifyOtp', 'Verify OTP')}
                                                        {currentStep === 3 && t('auth.forgotPassword.resetPassword', 'Reset Password')}
                                                        {/* <img src={ArrowRight} alt="" className="pt-2"/> */}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className='text-center mt-4'>
                                        <Link className='fw-semibold text-decoration-none' to='/login-sp'>
                                            {t('auth.forgotPassword.backToLogin', 'Back to Login')}
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgetPasswordSP;
