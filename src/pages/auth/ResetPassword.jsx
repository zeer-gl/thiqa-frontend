import "/src/css/pages/auth.scss";
import React, { useState, useContext } from "react";
import Logo from "/public/images/favicon.png";
import ArrowRight from '/public/images/arrow-right.svg';
import EyeIcon from '/public/images/eye.svg';
import AuthBg from '/public/images/auth/auth-bg.svg';
import AuthUpper from '/public/images/auth/auth-upper.svg';
import AuthLower from '/public/images/auth/auth-lower.svg';
import AuthMockup from '/public/images/auth/auth-mockup.png';
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher.jsx';
import { BaseUrl } from '../../assets/BaseUrl.jsx';
import { AlertContext } from '../../context/AlertContext.jsx';

function ResetPassword() {
    const {t, i18n} = useTranslation();
    const navigate = useNavigate();
    const { showAlert } = useContext(AlertContext);
    const { token } = useParams(); // Get token from URL params
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // Error state
    const [errors, setErrors] = useState({});
    const [backendError, setBackendError] = useState(null);
    
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else if (field === 'confirmPassword') {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    // Validation functions
    const validateField = (name, value) => {
        let error = '';
        
        switch(name) {
            case 'password':
                if (!value) {
                    error = t('Password is required');
                } else if (value.length < 6) {
                    error = t('Password must be at least 6 characters');
                }
                break;
            case 'confirmPassword':
                if (!value) {
                    error = t('Please confirm your password');
                } else if (value !== password) {
                    error = t('Passwords do not match');
                }
                break;
            default:
                break;
        }
        
        return error;
    };

    const validateForm = () => {
        const newErrors = {
            password: validateField('password', password),
            confirmPassword: validateField('confirmPassword', confirmPassword)
        };
        
        setErrors(newErrors);
        return !newErrors.password && !newErrors.confirmPassword;
    };

    const handleInputChange = (field, value) => {
        // Update the field value
        if (field === 'password') setPassword(value);
        if (field === 'confirmPassword') setConfirmPassword(value);
        
        // Clear the error for this field as user types
        if (errors[field]) {
            const error = validateField(field, value);
            setErrors(prev => ({ ...prev, [field]: error }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setSubmitting(true);
        
        try {
            // Static implementation - just show success message
            setTimeout(() => {
                showAlert(t('Password reset successfully'), 'success');
                setSubmitting(false);
                // Navigate to login page after successful reset
                navigate('/login');
            }, 2000);
            
        } catch (err) {
            showAlert(err.message || t('Network error occurred'), 'error');
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
                                    <h2 className='pb-3 ar-heading-bold'>{t('auth.resetPassword.title')}</h2>
                                    <h5 className="ar-heading-bold">{t('auth.resetPassword.subtitle')}</h5>
                                </div>
                      
                                <form onSubmit={handleSubmit}>
                                    <div>
                                        <div className="form-group mb-3">
                                            <label htmlFor="password" className='form-label'>{t('auth.resetPassword.newPassword')}</label>
                                            <div className="position-relative">
                                                <input 
                                                    type={showPassword ? "text" : "password"}
                                                    className={`form-control ${showPassword ? 'password-field' : ''} ${errors.password ? 'is-invalid' : ''}`}
                                                    id="password"
                                                    placeholder={t('auth.resetPassword.newPassword')}
                                                    value={password}
                                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                                />
                                                <div 
                                                    className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'start-0 ps-3' : 'end-0 pe-3'}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => togglePasswordVisibility('password')}
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
                                        
                                        <div className="form-group mb-3">
                                            <label htmlFor="confirmPassword" className='form-label'>{t('auth.resetPassword.confirmPassword')}</label>
                                            <div className="position-relative">
                                                <input 
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    className={`form-control ${showConfirmPassword ? 'password-field' : ''} ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                                    id="confirmPassword"
                                                    placeholder={t('auth.resetPassword.confirmPassword')}
                                                    value={confirmPassword}
                                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                />
                                                <div 
                                                    className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'start-0 ps-3' : 'end-0 pe-3'}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => togglePasswordVisibility('confirmPassword')}
                                                >
                                                    <img 
                                                        src={EyeIcon} 
                                                        alt="Toggle password visibility"
                                                        style={{ width: '20px', height: '20px' }}
                                                    />
                                                </div>
                                            </div>
                                            {errors.confirmPassword && (
                                                <div className="text-danger mt-1">{errors.confirmPassword}</div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className='mt-4'>
                                            <button 
                                                type="submit" 
                                                className='btn ev-submit-btn' 
                                                disabled={submitting}
                                            >
                                                {submitting ? (t('common.sending') || "Resetting...") : (
                                                    <>
                                                        {t('auth.resetPassword.submitButton')} <img src={ArrowRight} alt=""/>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className='text-center mt-4'>
                                        <Link className='fw-semibold text-decoration-none' to='/login'>
                                            {t('auth.resetPassword.backToLogin')}
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

export default ResetPassword;
