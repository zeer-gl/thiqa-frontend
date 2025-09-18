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

function ForgetPassword() {
    const {t, i18n} = useTranslation();
    const navigate = useNavigate();
    const { showAlert } = useContext(AlertContext);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [email, setEmail] = useState("");
    
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
                    error = t('Email is required');
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = t('Please enter a valid email');
                }
                break;
            default:
                break;
        }
        
        return error;
    };

    const validateForm = () => {
        const newErrors = {
            email: validateField('email', email)
        };
        
        setErrors(newErrors);
        return !newErrors.email;
    };

    const handleInputChange = (field, value) => {
        // Update the field value
        if (field === 'email') setEmail(value);
        
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
                showAlert(t('Password reset link sent to your email'), 'success');
                setSubmitting(false);
                // Optionally navigate back to login
                // navigate('/login');
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
                                    <h2 className='pb-3 ar-heading-bold'>{t('auth.forgotPassword.title')}</h2>
                                    <h5 className="ar-heading-bold">{t('auth.forgotPassword.subtitle')}</h5>
                                </div>
                      
                                <form onSubmit={handleSubmit}>
                                    <div>
                                        <div className="form-group mb-3">
                                            <label htmlFor="email" className='form-label'>{t('auth.forgotPassword.email')}</label>
                                            <input 
                                                type="email" 
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                id="email"
                                                placeholder={t('auth.forgotPassword.email')}
                                                value={email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                            />
                                            {errors.email && (
                                                <div className="text-danger mt-1">{errors.email}</div>
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
                                                {submitting ? (t('common.sending') || "Sending...") : (
                                                    <>
                                                        {t('auth.forgotPassword.submitButton')} <img src={ArrowRight} alt=""/>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className='text-center mt-4'>
                                        <Link className='fw-semibold text-decoration-none' to='/login'>
                                            {t('auth.forgotPassword.backToLogin')}
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

export default ForgetPassword;