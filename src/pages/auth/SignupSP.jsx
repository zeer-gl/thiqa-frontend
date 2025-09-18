import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../context/AlertContext';
import { BaseUrl } from '../../assets/BaseUrl';
import GoogleMapAddressPicker from '../../components/GoogleMapAddressPicker';
import { auth } from '../../firbase';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import "/src/css/pages/auth.scss";
import AuthUpper from "/public/images/auth/auth-upper.svg";
import AuthMockup from "/public/images/auth/auth-mockup.png";
import Logo from "/public/images/favicon.png";
import EyeIcon from '/public/images/eye.svg';
import GoogleIcon from '/public/images/auth/google-icon.svg';
import LanguageSwitcher from '../../components/LanguageSwitcher.jsx';
import SpUserIcon from '../../assets/payment/sp-user.svg';
import PhoneIcon from '/public/images/profile/phone-icon.svg';
import LockIcon from '/public/images/auth/lock.svg';
import EmailIcon from '/public/images/auth/sms.svg';
import UserIcon from '/public/images/auth/name-icon.svg';
import BriefcaseIcon from '/public/images/auth/name-icon.svg';
import FileIcon from '/public/images/document-download.svg';

function SignupSP() {
    const {t, i18n} = useTranslation();
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    
    // Form state
    const [name, setName] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [workTitle, setWorkTitle] = useState('');
    const [specializations, setSpecializations] = useState([]);
    const [selectedSpecializations, setSelectedSpecializations] = useState([]);
    const [loadingSpecializations, setLoadingSpecializations] = useState(false);
    const [showSpecializationDropdown, setShowSpecializationDropdown] = useState(false);
    const [experience, setExperience] = useState('');
    const [bio, setBio] = useState('');
    const [resume, setResume] = useState(null);
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [selectedAddress, setSelectedAddress] = useState('');
    
    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [socialSubmitting, setSocialSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);
    
    // OTP state
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpValues, setOtpValues] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(59);
    const [generatedOTP, setGeneratedOTP] = useState(null);
    const [timerInterval, setTimerInterval] = useState(null);
    
    const otpRefs = useRef([]);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    // OTP generation and verification
    const sendOTP = async (phoneNumber) => {
        try {
            console.log("Generating OTP...");
            
            // Generate 4-digit OTP
            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            setGeneratedOTP(otp);
            
            console.log('📨 Generated OTP:', otp, 'for phone:', phoneNumber);
            
            // SMS service disabled due to CORS issues - OTP generated locally for testing
            console.log('📨 OTP generated locally:', otp, 'for phone:', phoneNumber);
            showAlert(t('auth.signup.otpSent'), 'success');
            
            return true;
        } catch (error) {
            console.error('⚠️ Error while generating OTP:', error);
            showAlert(t('auth.signup.otpSendFailed'), 'error');
            return false;
        }
    };

    const verifyOTP = async (enteredOtp) => {
        if (!generatedOTP) {
            console.error('❌ No generated OTP found!');
            return false;
        }
        
        // Simulate verification delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const isValid = enteredOtp === generatedOTP;
        console.log(isValid ? '✅ OTP Verified!' : '❌ OTP Verification Failed');
        
        return isValid;
    };

    // Validation functions
    const validateForm = () => {
        let isValid = true;
        let errorMessage = '';
        
        if (!name.trim()) {
            isValid = false;
            errorMessage = t('auth.signupsp.validation.nameRequired', 'Name is required');
        } else if (!phoneNo.trim()) {
            isValid = false;
            errorMessage = t('auth.signupsp.validation.phoneRequired', 'Phone number is required');
        } else if (!email.trim() || !validateEmail(email)) {
            isValid = false;
            errorMessage = t('auth.signupsp.validation.emailRequired', 'Valid email is required');
        } else if (!password || password.length < 6) {
            isValid = false;
            errorMessage = t('auth.signupsp.validation.passwordLength', 'Password must be at least 6 characters');
        } else if (!workTitle.trim()) {
            isValid = false;
            errorMessage = t('auth.signupsp.validation.workTitleRequired', 'Work title is required');
        } else if (selectedSpecializations.length === 0) {
            isValid = false;
            errorMessage = t('auth.signupsp.validation.specializationRequired', 'Please select at least one specialization');
        } else if (!experience || isNaN(experience) || parseInt(experience) < 0) {
            isValid = false;
            errorMessage = t('auth.signupsp.validation.experienceRequired', 'Valid experience years is required');
        } else if (!bio.trim() || bio.trim().length < 10) {
            isValid = false;
            errorMessage = t('auth.signupsp.validation.bioLength', 'Bio must be at least 10 characters');
        } else if (!latitude || !longitude) {
            isValid = false;
            errorMessage = t('auth.signupsp.validation.locationRequired', 'Please select your location on the map');
        }
        
        if (!isValid) {
            showAlert(errorMessage, 'error');
        }
        
        return isValid;
    };

    const validateEmail = (val) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        
        // Validate form before submission
        if (!validateForm()) {
            return;
        }
        
        setSubmitting(true);
        console.log('Starting OTP verification flow...');

        try {
            // Step 1: Send OTP first (mobile-style flow)
            const otpSent = await sendOTP(phoneNo);
            
            if (otpSent) {
                // Step 2: Show OTP modal for verification
        setShowOtpModal(true);
        startTimer();
            } else {
                showAlert(t('auth.signup.otpSendFailed'), 'error');
            }
        } catch (error) {
            console.error('OTP sending error:', error);
            showAlert(t('auth.signup.otpSendFailed'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const startTimer = () => {
        // Clear any existing timer
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setTimerInterval(null);
                    return 59;
                }
                return prev - 1;
            });
        }, 1000);
        
        setTimerInterval(interval);
    };

    // Function to register professional after OTP verification
    const registerProfessional = async () => {
        try {
            console.log('Calling professional registration API after OTP verification...');
            console.log('Current coordinates:', { latitude, longitude });
            console.log('Selected specializations:', selectedSpecializations);
            
            const formData = new FormData();
            formData.append('name', name);
            formData.append('phoneNo', phoneNo);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('workTitle', workTitle);
            // Add multiple specializations
            selectedSpecializations.forEach((specId, index) => {
                formData.append(`specializations[${index}]`, specId);
            });
            formData.append('experience', experience);
            formData.append('bio', bio);
            formData.append('latitude', latitude);
            formData.append('longitude', longitude);
            formData.append('token', 'device_token_here');
            
            if (resume) {
                formData.append('resume', resume);
            }
            
            const res = await fetch(`${BaseUrl}/professional/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: formData
            });
            
            const result = await res.json();
            console.log('Professional registration result:', result);
            
            if (res.ok) {
                // Store registration data in session storage
                const registrationData = {
                    name,
                    phoneNo,
                    email,
                    workTitle,
                    specializations: selectedSpecializations,
                    experience,
                    bio,
                    latitude,
                    longitude,
                    role: 'service_provider'
                };
                localStorage.setItem('registrationData', JSON.stringify(registrationData));
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', 'sp');
                localStorage.setItem('token-sp', result.token);
                
                // Store service provider ID from API response
                if (result.professional && result.professional._id) {
                    localStorage.setItem('serviceProviderId', result.professional._id);
                    localStorage.setItem('spUserData', JSON.stringify(result.professional));
                } else if (result._id) {
                    // Fallback if the professional data is at root level
                    localStorage.setItem('serviceProviderId', result._id);
                    localStorage.setItem('spUserData', JSON.stringify(result));
                }
                
                showAlert(t('auth.signupsp.registrationSuccess', 'Professional registration successful!'), 'success');
                navigate('/profile-sp?tab=packages');
            } else {
                const backendMessage = result?.message || result?.error || t('auth.signupsp.registrationFailed', 'Registration failed. Please try again.');
                
                // Translate common backend error messages
                let translatedMessage = backendMessage;
                if (backendMessage.toLowerCase().includes('email') && backendMessage.toLowerCase().includes('exist')) {
                    translatedMessage = t('auth.signupsp.emailAlreadyExists', 'Email already exists. Please use a different email.');
                } else if (backendMessage.toLowerCase().includes('phone') && backendMessage.toLowerCase().includes('exist')) {
                    translatedMessage = t('auth.signupsp.phoneAlreadyExists', 'Phone number already exists. Please use a different phone number.');
                } else if (backendMessage.toLowerCase().includes('email') && backendMessage.toLowerCase().includes('phone') && backendMessage.toLowerCase().includes('exist')) {
                    translatedMessage = t('auth.signupsp.emailOrPhoneExists', 'Email or phone number already exists. Please use different credentials.');
                }
                
                showAlert(translatedMessage, 'error');
            }
        } catch (error) {
            console.error('Professional registration error:', error);
            showAlert(t('auth.signupsp.registrationFailed', 'Registration failed. Please try again.'), 'error');
        }
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

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        
        if (!otpValues.every((value) => value !== "")) {
            showAlert(t('auth.signupsp.otp.completeOtpRequired', 'Please enter the complete OTP code.'), 'error');
            return;
        }
        
        // Step 1: Verify OTP locally
        const otpCode = otpValues.join('');
        
        const verificationSuccess = await verifyOTP(otpCode);
        
        if (verificationSuccess) {
            // Step 2: Show verification success, then call registration API
            showAlert(t('auth.signup.verificationSuccess'), 'success');
            await registerProfessional();
        } else {
            showAlert(t('auth.signup.invalidOtp'), 'error');
        }
    };

    const handleResend = async (e) => {
        e.preventDefault();
        
        // Clear existing OTP input fields
        setOtpValues(["", "", "", ""]);
        
        // Send OTP again
        const otpSent = await sendOTP(phoneNo);
        
        if (otpSent) {
        setTimer(59);
        startTimer();
            showAlert(t('auth.signup.otpResent'), 'success');
        }
    };

    const closeModal = () => {
        setShowOtpModal(false);
        setOtpValues(['', '', '', '']);
        setTimer(59);
        setGeneratedOTP(null);
        
        // Clear timer interval
        if (timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null);
        }
    };

    // Cleanup timer on component unmount
    useEffect(() => {
        return () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        };
    }, [timerInterval]);

    // GOOGLE REGISTER FOR PROFESSIONAL
    const handleGoogleRegister = async () => {
        setErrorMsg("");
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
                role: 'professional', // Indicate this is for professional registration
                registrationType: 'professional',
                userType: 'service_provider',
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
                
                // Store service provider data from Google authentication
                if (data.professional && data.professional._id) {
                    localStorage.setItem('serviceProviderId', data.professional._id);
                    localStorage.setItem('spUserData', JSON.stringify(data.professional));
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
                ? t('auth.signupsp.googleConfigMissing', "Google configuration missing")
                : (err?.message || t('auth.signupsp.googleRegistrationFailed', "Google registration failed"));
            setErrorMsg(msg);
            showAlert(msg, 'error');
        } finally {
            setSocialSubmitting(false);
        }
    };


    // Debug: Monitor latitude and longitude changes
    useEffect(() => {
        console.log('Latitude changed to:', latitude);
    }, [latitude]);

    useEffect(() => {
        console.log('Longitude changed to:', longitude);
    }, [longitude]);

    // Fetch specializations from API
    const fetchSpecializations = async () => {
        try {
            setLoadingSpecializations(true);
            const response = await fetch(`${BaseUrl}/admin/getAll-professional-categories`);
            const data = await response.json();
            
            console.log('API Response:', data);
            
            // Handle different response structures
            if (data.data && Array.isArray(data.data)) {
                // API returns { data: [...], pagination: {...} }
                setSpecializations(data.data);
                console.log('Specializations loaded from API:', data.data);
                console.log('Number of specializations:', data.data.length);
            } else if (data.success && data.data) {
                setSpecializations(data.data);
                console.log('Specializations loaded:', data.data);
            } else if (Array.isArray(data)) {
                // Response is directly an array
                setSpecializations(data);
                console.log('Specializations loaded (array response):', data);
            } else {
                console.error('Unexpected API response structure:', data);
                // Fallback to default specializations
                const fallbackSpecializations = [
                    { _id: 'construction', name: t('auth.signupsp.specializations.construction', 'Construction') },
                    { _id: 'electrical', name: t('auth.signupsp.specializations.electrical', 'Electrical') },
                    { _id: 'plumbing', name: t('auth.signupsp.specializations.plumbing', 'Plumbing') },
                    { _id: 'hvac', name: t('auth.signupsp.specializations.hvac', 'HVAC') },
                    { _id: 'cleaning', name: t('auth.signupsp.specializations.cleaning', 'Cleaning') },
                    { _id: 'landscaping', name: t('auth.signupsp.specializations.landscaping', 'Landscaping') },
                    { _id: 'painting', name: t('auth.signupsp.specializations.painting', 'Painting') },
                    { _id: 'carpentry', name: t('auth.signupsp.specializations.carpentry', 'Carpentry') }
                ];
                setSpecializations(fallbackSpecializations);
                console.log('Using fallback specializations:', fallbackSpecializations);
                showAlert(t('auth.signupsp.usingDefaultSpecializations', 'Using default specializations - API response format issue'), 'warning');
            }
        } catch (error) {
            console.error('Error fetching specializations:', error);
            // Fallback to default specializations on error
            const fallbackSpecializations = [
                { _id: 'construction', name: t('auth.signupsp.specializations.construction', 'Construction') },
                { _id: 'electrical', name: t('auth.signupsp.specializations.electrical', 'Electrical') },
                { _id: 'plumbing', name: t('auth.signupsp.specializations.plumbing', 'Plumbing') },
                { _id: 'hvac', name: t('auth.signupsp.specializations.hvac', 'HVAC') },
                { _id: 'cleaning', name: t('auth.signupsp.specializations.cleaning', 'Cleaning') },
                { _id: 'landscaping', name: t('auth.signupsp.specializations.landscaping', 'Landscaping') },
                { _id: 'painting', name: t('auth.signupsp.specializations.painting', 'Painting') },
                { _id: 'carpentry', name: t('auth.signupsp.specializations.carpentry', 'Carpentry') }
            ];
            setSpecializations(fallbackSpecializations);
            console.log('Using fallback specializations due to error:', fallbackSpecializations);
            showAlert(t('auth.signupsp.usingDefaultSpecializationsConnection', 'Using default specializations - API connection issue'), 'warning');
        } finally {
            setLoadingSpecializations(false);
        }
    };

    // Load specializations on component mount
    useEffect(() => {
        fetchSpecializations();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showSpecializationDropdown && !event.target.closest('.form-group')) {
                setShowSpecializationDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSpecializationDropdown]);

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
                                    <h2 className='pb-3 ar-heading-bold'>{t('auth.signupsp.title')}</h2>
                                    <h5 className="ar-heading-bold">
                                        <Link to="/login-sp" className='text-decoration-none'>
                                            {t('auth.signupsp.subtitle')}
                                        </Link>
                                    </h5>
                                </div>
                                <form onSubmit={handleCreateAccount} className='signup-form' style={{ maxHeight: '90vh', overflowY: 'auto', paddingTop: '2rem' }}>
                                    <div className="d-flex flex-column justify-content-center">
                                        {/* Name */}
                                        <div className="form-group mb-3">
                                            <div className="position-relative">
                                                <div className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'}`} style={{ zIndex: 10 }}>
                                                    <img src={UserIcon} alt="Name" style={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
                                                </div>
                                                <input 
                                                    type="text" 
                                                    className={`form-control ${i18n.dir() === 'rtl' ? 'pe-5' : 'ps-5'}`}
                                                    id="name"
                                                    placeholder={t('auth.signupsp.name')} 
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    required
                                                    style={{ 
                                                        height: '50px',
                                                        paddingLeft: i18n.dir() === 'rtl' ? '12px' : '50px',
                                                        paddingRight: i18n.dir() === 'rtl' ? '50px' : '12px'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Phone Number */}
                                        <div className="form-group mb-3">
                                            <div className="position-relative">
                                                <div className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'}`} style={{ zIndex: 10 }}>
                                                    <img src={PhoneIcon} alt="Phone" style={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
                                                </div>
                                                <input 
                                                    type="tel" 
                                                    className={`form-control ${i18n.dir() === 'rtl' ? 'pe-5' : 'ps-5'}`}
                                                    id="phoneNo"
                                                    placeholder={t('auth.signupsp.phoneNo')} 
                                                    value={phoneNo}
                                                    onChange={(e) => setPhoneNo(e.target.value)}
                                                    required
                                                    style={{ 
                                                        height: '50px',
                                                        paddingLeft: i18n.dir() === 'rtl' ? '12px' : '50px',
                                                        paddingRight: i18n.dir() === 'rtl' ? '50px' : '12px'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="form-group mb-3">
                                            <div className="position-relative">
                                                <div className={` ${i18n.dir() === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'}`} style={{ zIndex: 10 }}>
                                                    {/* <img src={EmailIcon} alt="Email" style={{ width: '20px', height: '20px', pointerEvents: 'none' }} /> */}
                                                </div>
                                                <input 
                                                    type="email" 
                                                    className={`form-control ${i18n.dir() === 'rtl' ? 'pe-5' : 'ps-5'} ${formSubmitted && (!email || !validateEmail(email)) ? 'is-invalid' : ''}`}
                                                    id="email"
                                                    placeholder={t('auth.signupsp.email')} 
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    style={{ 
                                                        height: '50px',
                                                        paddingLeft: i18n.dir() === 'rtl' ? '12px' : '50px',
                                                        paddingRight: i18n.dir() === 'rtl' ? '50px' : '12px'
                                                    }}
                                                />
                                                {formSubmitted && (!email || !validateEmail(email)) && (
                                                    <div className="text-danger mt-1 small">
                                                        {!email ? t('auth.signupsp.validation.emailRequired', 'Email is required') : t('auth.signupsp.validation.emailInvalid', 'Please enter a valid email')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div className="form-group mb-3">
                                            <div className="position-relative">
                                              
                                                <input 
                                                    type={showPassword ? "text" : "password"}
                                                    className={`form-control ${i18n.dir() === 'rtl' ? 'pe-5' : 'ps-5'} ${formSubmitted && (!password || password.length < 6) ? 'is-invalid' : ''}`}
                                                    id="password"
                                                    placeholder={t('auth.signupsp.password')} 
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    style={{ 
                                                        height: '50px',
                                                        paddingLeft: i18n.dir() === 'rtl' ? '12px' : '50px',
                                                        paddingRight: i18n.dir() === 'rtl' ? '50px' : '12px'
                                                    }}
                                                />
                                                {formSubmitted && (!password || password.length < 6) && (
                                                    <div className="text-danger mt-1 small">
                                                        {!password ? t('auth.signupsp.validation.passwordRequired', 'Password is required') : t('auth.signupsp.validation.passwordLength', 'Password must be at least 6 characters')}
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'start-0 ps-3' : 'end-0 pe-3'}`}
                                                    onClick={togglePasswordVisibility}
                                                    style={{ background: 'none', border: 'none', zIndex: 10 }}
                                                >
                                                    <img src={EyeIcon} alt="Toggle password" style={{ width: '20px', height: '20px' }} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Work Title */}
                                        <div className="form-group mb-3">
                                            <div className="position-relative">
                                                <div className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'}`} style={{ zIndex: 10 }}>
                                                    <img src={BriefcaseIcon} alt="Work title" style={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
                                                </div>
                                                <input 
                                                    type="text" 
                                                    className={`form-control ${i18n.dir() === 'rtl' ? 'pe-5' : 'ps-5'}`}
                                                    id="workTitle"
                                                    placeholder={t('auth.signupsp.workTitle')} 
                                                    value={workTitle}
                                                    onChange={(e) => setWorkTitle(e.target.value)}
                                                    required
                                                    style={{ 
                                                        height: '50px',
                                                        paddingLeft: i18n.dir() === 'rtl' ? '12px' : '50px',
                                                        paddingRight: i18n.dir() === 'rtl' ? '50px' : '12px'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Specialization */}
                                        <div className="form-group mb-3">
                                            <div className="position-relative">
                                                <div className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'}`} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>

                                                </div>
                                                
                                                {/* Custom Multi-Select Component */}
                                                <div 
                                                    className={`form-control ${i18n.dir() === 'rtl' ? 'pe-5' : 'ps-5'} ${formSubmitted && selectedSpecializations.length === 0 ? 'is-invalid' : ''}`}
                                                    style={{ 
                                                        height: '80px', 
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                        padding: '8px 12px',
                                                        overflow: 'hidden'
                                                    }}
                                                    onClick={() => setShowSpecializationDropdown(!showSpecializationDropdown)}
                                                >
                                                    {/* Selected Items Display */}
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        flexWrap: 'wrap', 
                                                        gap: '4px', 
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-start',
                                                        height: '100%',
                                                        overflow: 'hidden',
                                                        padding: '4px 0'
                                                    }}>
                                                        {selectedSpecializations.length > 0 ? (
                                                            <>
                                                                {selectedSpecializations.slice(0, 3).map((specId) => {
                                                                    const spec = specializations.find(s => s._id === specId);
                                                                    return (
                                                                        <span 
                                                                            key={specId}
                                                                            className="badge bg-primary"
                                                                            style={{ 
                                                                                fontSize: '10px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '2px',
                                                                                padding: '2px 6px'
                                                                            }}
                                                                        >
                                                                            {spec?.name || 'Unknown'}
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setSelectedSpecializations(prev => prev.filter(id => id !== specId));
                                                                                }}
                                                                                style={{ 
                                                                                    background: 'none', 
                                                                                    border: 'none', 
                                                                                    color: 'white', 
                                                                                    cursor: 'pointer',
                                                                                    fontSize: '12px',
                                                                                    padding: '0',
                                                                                    marginLeft: '2px'
                                                                                }}
                                                                            >
                                                                                ×
                                                                            </button>
                                                                        </span>
                                                                    );
                                                                })}
                                                                {selectedSpecializations.length > 3 && (
                                                                    <span className="badge bg-secondary" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                                                        +{selectedSpecializations.length - 3} {t('common.more', 'more')}
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-muted" style={{ fontSize: '14px' }}>
                                                                {loadingSpecializations ? t('common.loading', 'Loading...') : t('auth.signupsp.selectSpecializations', 'Select specializations...')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Dropdown Arrow */}
                                                    <div style={{ 
                                                        position: 'absolute', 
                                                        right: '12px', 
                                                        top: '50%', 
                                                        transform: 'translateY(-50%)',
                                                        pointerEvents: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        height: '100%'
                                                    }}>
                                                        <i className={`fas fa-chevron-${showSpecializationDropdown ? 'up' : 'down'}`}></i>
                                                    </div>
                                                </div>
                                                
                                                {/* Dropdown Options */}
                                                {showSpecializationDropdown && (
                                                    <div 
                                                        className="border rounded"
                                                        style={{
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: 0,
                                                            right: 0,
                                                            backgroundColor: 'white',
                                                            zIndex: 1000,
                                                            maxHeight: '200px',
                                                            overflowY: 'auto',
                                                            border: '1px solid #ced4da',
                                                            borderTop: 'none'
                                                        }}
                                                    >
                                                        {specializations.length > 0 ? (
                                                            specializations.map((spec) => (
                                                                <div
                                                                    key={spec._id}
                                                                    className={`p-2 ${selectedSpecializations.includes(spec._id) ? 'bg-primary text-white' : 'hover:bg-light'}`}
                                                                    style={{ cursor: 'pointer', borderBottom: '1px solid #f8f9fa' }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (selectedSpecializations.includes(spec._id)) {
                                                                            setSelectedSpecializations(prev => prev.filter(id => id !== spec._id));
                                                                        } else {
                                                                            setSelectedSpecializations(prev => [...prev, spec._id]);
                                                                        }
                                                                    }}
                                                                >
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedSpecializations.includes(spec._id)}
                                                                            onChange={() => {}} // Handled by parent onClick
                                                                            style={{ pointerEvents: 'none' }}
                                                                        />
                                                                        <span>{spec.name}</span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="p-2 text-muted text-center">
                                                                {loadingSpecializations ? t('auth.signupsp.loadingSpecializations', 'Loading specializations...') : t('auth.signupsp.noSpecializationsAvailable', 'No specializations available')}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {formSubmitted && selectedSpecializations.length === 0 && (
                                                    <div className="text-danger mt-1 small">
                                                        Please select at least one specialization
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Years of Experience */}
                                        <div className="form-group mb-3">
                                            <input 
                                                type="number" 
                                                min="0"
                                                inputMode="numeric"
                                                dir="ltr"
                                                className="form-control"
                                                id="experience"
                                                placeholder={t('auth.signupsp.experience')} 
                                                value={experience}
                                                onChange={(e) => setExperience(e.target.value)}
                                                required
                                                style={{ 
                                                    height: '50px',
                                                    ...(i18n.dir() === 'rtl' ? { textAlign: 'left' } : {})
                                                }}
                                            />
                                        </div>

                                        {/* Bio */}
                                        <div className="form-group mb-3">
                                            <textarea
                                                className="form-control"
                                                id="bio"
                                                rows="3"
                                                placeholder={t('auth.signupsp.bio')} 
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                required
                                            />
                                        </div>

                                        {/* Resume Upload */}
                                        <div className="form-group mb-3">
                                            <div className="position-relative">
                                                <div className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'}`} style={{ zIndex: 10 }}>
                                                    <img src={FileIcon} alt="Resume" style={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
                                                </div>
                                                <input 
                                                    type="file" 
                                                    className="form-control"
                                                    id="resume"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={(e) => setResume(e.target.files[0])}
                                                    style={{ 
                                                        opacity: 0,
                                                        position: 'absolute',
                                                        zIndex: 2,
                                                        width: '100%',
                                                        height: '100%',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                <div 
                                                    className="form-control d-flex align-items-center"
                                                    style={{ 
                                                        minHeight: '50px',
                                                        backgroundColor: resume ? '#fff' : '#f8f9fa',
                                                        border: '1px solid #ced4da',
                                                        borderRadius: '0.375rem',
                                                        cursor: 'pointer',
                                                        color: resume ? '#000' : '#6c757d',
                                                        fontSize: '14px',
                                                        paddingLeft: i18n.dir() === 'rtl' ? '12px' : '50px',
                                                        paddingRight: i18n.dir() === 'rtl' ? '50px' : '12px'
                                                    }}
                                                >
                                                    <span>
                                                        {resume ? resume.name : t('auth.signupsp.resumePlaceholder')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="form-group mb-3">
                                            <GoogleMapAddressPicker
                                                onLocationSelect={(location) => {
                                                    console.log('Location selected:', location);
                                                    if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
                                                        const newLat = location.lat.toString();
                                                        const newLng = location.lng.toString();
                                                        console.log('Setting coordinates:', { lat: newLat, lng: newLng });
                                                        
                                                        // Update coordinates immediately
                                                        setLatitude(newLat);
                                                        setLongitude(newLng);
                                                        if (location.address) {
                                                            setSelectedAddress(location.address);
                                                        }
                                                    } else {
                                                        console.error('Invalid location data:', location);
                                                    }
                                                }}
                                                placeholder={t('auth.signupsp.location')}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className='mt-4'>
                                            <button type='submit' className='btn ev-submit-btn' disabled={submitting}>
                                                {submitting ? t('auth.signupsp.creating') : t('auth.signupsp.createAccount')}
                                            </button>
                                        </div>
                                    </div>
                                    <div className='text-center mt-4'>
                                        {errorMsg && (
                                            <div className="alert alert-danger mb-3" role="alert">
                                                {errorMsg}
                                            </div>
                                        )}
                                        <p>{t('auth.signupsp.orLoginVia')}</p>
                                        <div className='d-flex justify-content-center gap-3 align-items-center mt-4'>
                                            <button 
                                                type="button" 
                                                className='btn d-flex align-items-center gap-3 justify-content-between register-socials'
                                                onClick={handleGoogleRegister}
                                                disabled={socialSubmitting}
                                            >
                                                {t('auth.signupsp.google')}
                                                <img src={GoogleIcon} alt=""/>
                                            </button>
                                        </div>
                                    
                                        <div className='mt-3'>
                                            <Link to="/signup" className='btn seeker-auth-btn text-decoration-none'>
                                                {t('auth.signupsp.registerAsCustomer')}
                                            </Link>
                                        </div>
                                        <div className='d-flex align-items-center gap-2 justify-content-center mt-4'>
                                            <a href="#" className='text-decoration-none fw-semibold'>
                                                {t('auth.signupsp.terms')}
                                            </a>
                                            <p>{t('auth.signupsp.and')}</p>
                                            <a href="#" className='text-decoration-none fw-semibold'>
                                                {t('auth.signupsp.privacy')}
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
                            <h3 className="otp-title mb-2 ar-heading-bold">{t('auth.signupsp.otp.title', 'Enter OTP')}</h3>
                            <p className="otp-description navy">
                                {t('auth.signupsp.otp.description', 'Enter the code sent to your phone to verify your account.')}
                            </p>
                        </div>

                        <div className="otp-timer mb-4">
                            <span className="otp-timer-text">
                                {t('auth.signupsp.otp.timerPrefix', 'Time left:')} {formattedTime}
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
                                {t('auth.signupsp.otp.submit', 'Submit')}
                            </button>
                        </form>

                        <div className="text-center mt-3">
                            <a href="#" onClick={handleResend} className="otp-resend-link navy text-decoration-none">
                                {t('auth.signupsp.otp.resend', 'Resend Code')}
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SignupSP;

