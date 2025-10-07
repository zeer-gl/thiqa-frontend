import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../context/AlertContext';
import { BaseUrl } from '../../assets/BaseUrl';
import GoogleMapAddressPicker from '../../components/GoogleMapAddressPicker';
import { auth } from '../../firbase';
import { GoogleAuthProvider, signInWithPopup, OAuthProvider } from "firebase/auth";
import "/src/css/pages/auth.scss";
import AuthUpper from "/public/images/auth/auth-upper.svg";
import AuthMockup from "/public/images/auth/auth-mockup.png";
import Logo from "/public/images/favicon.png";
import EyeIcon from '/public/images/eye.svg';
import GoogleIcon from '/public/images/auth/google-icon.svg';
import AppleIcon from '/public/images/auth/apple-icon.svg';
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
    const [resumeError, setResumeError] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [selectedAddress, setSelectedAddress] = useState('');
    
    // Address form fields (similar to Profile page)
    const [addressForm, setAddressForm] = useState({
        name: '',
        city: '',
        area: '',
        block: '',
        street: '',
        building: '',
        floor_apartment: '',
        lat: '',
        long: '',
        is_default: false
    });
    const [selectedLocation, setSelectedLocation] = useState(null);
    
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
    const [timerInterval, setTimerInterval] = useState(null);
    const [phoneError, setPhoneError] = useState('');
    const [phoneValid, setPhoneValid] = useState(false);
    const [professionalId, setProfessionalId] = useState(null);
    const [registrationData, setRegistrationData] = useState(null);
    
    
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

    // Function to register professional and get OTP via email
    const registerProfessionalAndGetOTP = async (professionalData) => {
        try {
            console.log('Registering professional and requesting OTP via email:', professionalData);
            
            const formData = new FormData();
            formData.append('name', professionalData.name);
            formData.append('phoneNo', professionalData.phoneNo);
            formData.append('email', professionalData.email);
            formData.append('password', professionalData.password);
            formData.append('workTitle', professionalData.workTitle);
            // Add multiple specializations
            professionalData.selectedSpecializations.forEach((specId, index) => {
                formData.append(`specializations[${index}]`, specId);
            });
            formData.append('experience', professionalData.experience);
            formData.append('bio', professionalData.bio);
            formData.append('latitude', professionalData.latitude);
            formData.append('longitude', professionalData.longitude);
            formData.append('token', 'device_token_here');
            
            if (professionalData.resume) {
                formData.append('resume', professionalData.resume);
            }
            
            const response = await fetch(`${BaseUrl}/professional/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: formData
            });
            
            const data = await response.json();
            console.log('Professional registration API response:', data);
            
            if (response.ok) {
                // Registration successful, OTP sent to email
                // Store professionalId from response for OTP verification
                if (data.professionalId || data._id || data.professional?._id) {
                    const id = data.professionalId || data._id || data.professional._id;
                    setProfessionalId(id);
                    console.log('Professional ID stored for OTP verification:', id);
                }
                
                // Store the registration data for use after OTP verification
                // (Backend returns token and professional data during registration)
                return { 
                    success: true, 
                    message: data.message || 'OTP sent to your email', 
                    professionalId: data.professionalId || data._id || data.professional?._id,
                    registrationData: {
                        token: data.token,
                        professional: data.professional || data,
                        professionalId: data.professionalId || data._id || data.professional?._id
                    }
                };
            } else {
                // Registration failed
                const errorMessage = data.message || data.error || 'Registration failed';
                return { success: false, message: errorMessage };
            }
        } catch (error) {
            console.error('Error during professional registration:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    // Function to verify OTP via API for professionals
    const verifyOTP = async (professionalId, otpCode) => {
        try {
            console.log('Verifying OTP via API for professional ID:', professionalId);
            
            const response = await fetch(`${BaseUrl}/professional/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    professionalId: professionalId,
                    otp: otpCode
                })
            });
            
            const data = await response.json();
            console.log('Professional OTP verification API response:', data);
            
            if (response.ok) {
                // OTP verification successful
                console.log('✅ Professional OTP Verified successfully!');
                return { success: true, data: data };
            } else {
                // OTP verification failed
                const errorMessage = data.message || data.error || 'Invalid OTP code';
                console.log('❌ Professional OTP Verification Failed:', errorMessage);
                return { success: false, message: errorMessage };
            }
        } catch (error) {
            console.error('Error during professional OTP verification:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

 // ... existing code ...


// ... existing code until validation functions ...

// Add phone validation functions after validateEmail function (around line 156)
const validatePhone = (val) => {
  // Kuwait phone number validation
  // Kuwait phone numbers can be:
  // - 8 digits starting with 5, 6, or 9 (mobile numbers)
  // - 7 digits starting with 2 (landline numbers)
  // - With or without country code +965
  
  // Remove any spaces, dashes, or parentheses
  const cleanNumber = val.replace(/[\s\-\(\)]/g, '');
  
  // Check if it starts with +965 (Kuwait country code)
  if (cleanNumber.startsWith('+965')) {
    const numberWithoutCountryCode = cleanNumber.substring(4);
    return validateKuwaitNumber(numberWithoutCountryCode);
  }
  
  // Check if it starts with 965 (without +)
  if (cleanNumber.startsWith('965')) {
    const numberWithoutCountryCode = cleanNumber.substring(3);
    return validateKuwaitNumber(numberWithoutCountryCode);
  }
  
  // Check if it's just the local number
  return validateKuwaitNumber(cleanNumber);
};

    const validateKuwaitNumber = (number) => {
  // Kuwait mobile numbers: 8 digits starting with 5, 6, or 9
  const mobilePattern = /^[569]\d{7}$/;
  
  // Kuwait landline numbers: 7 digits starting with 2
  const landlinePattern = /^2\d{6}$/;
  
  return mobilePattern.test(number) || landlinePattern.test(number);
};

// Function to validate PDF files
const validatePdfFile = (file) => {
  if (!file) return false;
  
  // Check file type
  const allowedTypes = ['application/pdf'];
  const fileType = file.type;
  
  // Check file extension as fallback
  const fileName = file.name.toLowerCase();
  const hasPdfExtension = fileName.endsWith('.pdf');
  
  return allowedTypes.includes(fileType) || hasPdfExtension;
};

// Update validateForm function to include phone validation (around line 114)
const validateForm = () => {
  let isValid = true;
  let errorMessage = '';
  
  if (!name.trim()) {
    isValid = false;
    errorMessage = t('auth.signupsp.validation.nameRequired', 'Name is required');
  } else if (!phoneNo.trim()) {
    isValid = false;
    errorMessage = t('auth.signupsp.validation.phoneRequired', 'Phone number is required');
  } else if (!validatePhone(phoneNo)) {
    isValid = false;
    errorMessage = t('auth.signupsp.validation.phoneFormat', 'Please enter a valid Kuwait phone number');
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
  } else if (!resume) {
    isValid = false;
    errorMessage = t('auth.signupsp.validation.resumeRequired', 'Resume is required');
  } else if (resume && !validatePdfFile(resume)) {
    isValid = false;
    errorMessage = t('auth.signupsp.validation.resumePdfOnly', 'Only PDF files are allowed for resume upload');
  } else if (!latitude || !longitude) {
    isValid = false;
    errorMessage = t('auth.signupsp.validation.locationRequired', 'Please select your location on the map');
  }
  
  if (!isValid) {
    showAlert(errorMessage, 'error');
  }
  
  return isValid;
};

// ... existing code until phone input section (around line 657) ...

{/* Phone Number */}


// ... rest of the form ...

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
        console.log('Starting professional registration process...');

        try {
            // Step 1: Register professional and get OTP via email
            const professionalData = {
                name: name,
                email: email,
                phoneNo: phoneNo,
                password: password,
                workTitle: workTitle,
                selectedSpecializations: selectedSpecializations,
                experience: experience,
                bio: bio,
                latitude: latitude,
                longitude: longitude,
                resume: resume
            };
            
            const registrationResult = await registerProfessionalAndGetOTP(professionalData);
            
            if (registrationResult.success) {
                // Step 2: Registration successful, OTP sent to email - show OTP modal
                // Store registration data (token and professional info) for use after OTP
                if (registrationResult.registrationData) {
                    setRegistrationData(registrationResult.registrationData);
                    console.log('✅ Registration data stored for later use:', registrationResult.registrationData);
                }
                showAlert(registrationResult.message, 'success');
                setShowOtpModal(true);
                startTimer();
            } else{
                // Registration failed, show error
                showAlert(registrationResult.message, 'error');
            }
        } catch (error) {
            console.error('Professional registration flow error:', error);
            showAlert(t('auth.signupsp.registrationFailed', 'Registration failed. Please try again.'), 'error');
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
        
        if (!professionalId) {
            showAlert('Professional ID not found. Please try registering again.', 'error');
            return;
        }
        
        // Step 1: Verify OTP via API
        const otpCode = otpValues.join('');
        
        const verificationResult = await verifyOTP(professionalId, otpCode);
        
        if (verificationResult.success) {
            // Step 2: OTP verification successful - use stored registration data
            console.log('✅ OTP Verification successful, using stored registration data...');
            console.log('Stored registration data:', registrationData);
            
            // Set login status FIRST
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userRole', 'sp');
            
            // Use stored registration data (from registration API response)
            if (registrationData) {
                // Store token from registration
                if (registrationData.token) {
                    localStorage.setItem('token-sp', registrationData.token);
                    console.log('✅ Token stored from registration:', registrationData.token);
                } else {
                    console.warn('⚠️ No token in stored registration data');
                }
                
                // Store professional data from registration
                if (registrationData.professional) {
                    localStorage.setItem('spUserData', JSON.stringify(registrationData.professional));
                    const profId = registrationData.professional._id || registrationData.professionalId;
                    if (profId) {
                        localStorage.setItem('serviceProviderId', profId);
                        console.log('✅ Professional data stored:', profId);
                    }
                } else if (registrationData.professionalId) {
                    // Minimal data if professional object not available
                    localStorage.setItem('serviceProviderId', registrationData.professionalId);
                    console.log('✅ Professional ID stored:', registrationData.professionalId);
                }
            } else {
                console.error('❌ No registration data available! This should not happen.');
            }
            
            // Set default payment status to true for new service providers
            localStorage.setItem('spPaymentStatus', 'true');
            localStorage.setItem('spHasActiveSubscription', 'true');
            localStorage.setItem('spSubscriptionStatus', 'active');
            
            // Debug: Log all stored values
            console.log('📦 Final localStorage state:', {
                isLoggedIn: localStorage.getItem('isLoggedIn'),
                userRole: localStorage.getItem('userRole'),
                'token-sp': !!localStorage.getItem('token-sp'),
                'token-sp-value': localStorage.getItem('token-sp'),
                serviceProviderId: localStorage.getItem('serviceProviderId'),
                spUserData: !!localStorage.getItem('spUserData')
            });
            
            showAlert(t('auth.signup.verificationSuccess'), 'success');
            
            // Small delay to ensure localStorage is updated before navigation
            setTimeout(() => {
                console.log('🔄 Navigating to profile-sp...');
                navigate("/profile-sp?tab=packages");
            }, 100);
        } else {
            showAlert(verificationResult.message || t('auth.signup.invalidOtp'), 'error');
        }
    };

    const handleResend = async (e) => {
        e.preventDefault();
        
        // Clear existing OTP input fields
        setOtpValues(["", "", "", ""]);
        
        // Resend OTP by calling registration API again
        const professionalData = {
            name: name,
            email: email,
            phoneNo: phoneNo,
            password: password,
            workTitle: workTitle,
            selectedSpecializations: selectedSpecializations,
            experience: experience,
            bio: bio,
            latitude: latitude,
            longitude: longitude,
            resume: resume
        };
        
        const registrationResult = await registerProfessionalAndGetOTP(professionalData);
        
        if (registrationResult.success) {
            // Store professionalId and registration data from resend response
            if (registrationResult.professionalId) {
                setProfessionalId(registrationResult.professionalId);
            }
            if (registrationResult.registrationData) {
                setRegistrationData(registrationResult.registrationData);
                console.log('✅ Updated registration data after resend:', registrationResult.registrationData);
            }
            setTimer(59);
            startTimer();
            showAlert(registrationResult.message || t('auth.signup.otpResent'), 'success');
        } else {
            showAlert(registrationResult.message || t('auth.signup.otpSendFailed'), 'error');
        }
    };

    const closeModal = () => {
        setShowOtpModal(false);
        setOtpValues(['', '', '', '']);
        setTimer(59);
        setProfessionalId(null);
        
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
                providerId: googleUserId || result.user.uid, // Send actual Google User ID (required by backend)
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
            let res = await fetch(`${BaseUrl}/professional/google-professional-registration`, {
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
                
                // Set default payment status to true for new service providers
                localStorage.setItem('spPaymentStatus', 'true');
                localStorage.setItem('spHasActiveSubscription', 'true');
                localStorage.setItem('spSubscriptionStatus', 'active');
                
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

    // APPLE REGISTER FOR PROFESSIONAL
    const handleAppleRegister = async () => {
        setErrorMsg("");
        setSocialSubmitting(true);
        
        try {
            const provider = new OAuthProvider("apple.com");
            provider.addScope('email');
            provider.addScope('name');
            
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            console.log("Apple login success:", user);

            const credential = OAuthProvider.credentialFromResult(result);
            if (!credential) {
                throw new Error("No credential returned from Apple sign-in");
            }
            
            const idToken = credential.idToken;
            const accessToken = credential.accessToken;
            const nameFromProvider = result.user.displayName || undefined;
            
            if (!idToken) throw new Error("Apple authentication failed - no ID token");
        
            const requestBody = { 
                idToken, 
                accessToken,
                token: 'device_token_here', 
                role: 'professional',
                registrationType: 'professional',
                userType: 'service_provider',
                providerId: 'apple.com',
                professionalId: user.uid,
                email: user.email,
                name: nameFromProvider || user.email?.split('@')[0] || 'Apple User',
                password: 'apple_signin_' + user.uid,
                // Try multiple password field variations that backend might expect
                userPassword: 'apple_signin_' + user.uid,
                user_password: 'apple_signin_' + user.uid,
                pwd: 'apple_signin_' + user.uid,
                pass: 'apple_signin_' + user.uid,
                // Try nested password structure
                user: {
                    password: 'apple_signin_' + user.uid,
                    name: nameFromProvider || user.email?.split('@')[0] || 'Apple User',
                    email: user.email
                },
                // Try professional object structure
                professional: {
                    password: 'apple_signin_' + user.uid,
                    name: nameFromProvider || user.email?.split('@')[0] || 'Apple User',
                    email: user.email,
                    phone: '',
                    workTitle: '',
                    specializations: [],
                    experience: '0',
                    bio: '',
                    latitude: '',
                    longitude: ''
                },
                // Try different root-level field names
                professionalPassword: 'apple_signin_' + user.uid,
                professional_password: 'apple_signin_' + user.uid,
                professionalPwd: 'apple_signin_' + user.uid,
                professionalPass: 'apple_signin_' + user.uid,
                // Try different field structures
                credentials: {
                    password: 'apple_signin_' + user.uid
                },
                auth: {
                    password: 'apple_signin_' + user.uid
                },
                profile: {
                    password: 'apple_signin_' + user.uid
                },
                pic: user.photoURL || '',
                federatedId: user.providerData?.[0]?.uid || user.uid,
                firstName: nameFromProvider?.split(' ')[0] || user.email?.split('@')[0] || 'Apple',
                lastName: nameFromProvider?.split(' ').slice(1).join(' ') || 'User',
                fullName: nameFromProvider || user.email?.split('@')[0] || 'Apple User',
                photoUrl: user.photoURL || '',
                emailVerified: user.emailVerified || false,
                localId: user.uid,
                rawId: user.providerData?.[0]?.uid || user.uid,
                appleUserId: user.providerData?.[0]?.uid || user.uid,
                // Additional fields that might be required by backend
                username: user.email?.split('@')[0] || 'apple_user',
                phone: '', // Apple doesn't provide phone number
                workTitle: '', // Apple doesn't provide work title
                specializations: [], // Apple doesn't provide specializations
                experience: '0', // Default experience
                bio: '', // Apple doesn't provide bio
                latitude: '', // Apple doesn't provide location
                longitude: '', // Apple doesn't provide location
                isActive: true,
                isVerified: true,
                loginMethod: 'apple',
                socialProvider: 'apple.com'
            };
            
            console.log('🔍 Apple Sign-In Request Body:', requestBody);
            
            // First try to login with Apple (in case user already exists)
            let res = await fetch(`${BaseUrl}/professional/apple-professional-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });
            
            let data;
            let isLogin = true;
            
            // If login fails, try registration
            if (!res.ok) {
                console.log('Apple login failed, trying registration...');
                isLogin = false;
                
                res = await fetch(`${BaseUrl}/professional/apple-professional-registration`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestBody)
                });
                
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err?.message || `Apple authentication failed (${res.status})`);
                }
            }
            
            if(res.ok){
                data = await res.json();
                console.log('Apple authentication data:', data);
                
                // Store service provider data from Apple authentication
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
                
                // Set default payment status to true for new service providers
                localStorage.setItem('spPaymentStatus', 'true');
                localStorage.setItem('spHasActiveSubscription', 'true');
                localStorage.setItem('spSubscriptionStatus', 'active');
                
                // Show appropriate success message
                const successMessage = isLogin 
                    ? t('auth.loginsp.appleLoginSuccess', 'Apple login successful!')
                    : t('auth.signupsp.appleRegistrationSuccess', 'Apple registration successful!');
                
                showAlert(successMessage, 'success');
                navigate("/profile-sp?tab=packages");
            }
            
        } catch (err) {
            console.error("Apple sign-in error:", err);
            
            let errorMessage = "auth.signupsp.genericError";
            
            if (err.code === "auth/configuration-not-found") {
                errorMessage = "auth.signupsp.appleConfigMissing";
            } else if (err.code === "auth/invalid-credential") {
                errorMessage = "auth.signupsp.appleInvalidCredential";
            } else if (err.message.includes("redirect_uri")) {
                errorMessage = "auth.signupsp.redirectUriMismatch";
            }
            
            setErrorMsg(errorMessage);
            showAlert(t(errorMessage), 'error');
        } finally {
            setSocialSubmitting(false);
        }
    };

    // Location handling function (similar to Profile page)
    const handleLocationSelect = async (location) => {
        console.log('Location selected:', location);
        setSelectedLocation(location);
        
        // Update the form with the coordinates from the map
        setAddressForm((prev) => ({
            ...prev,
            lat: location.lat.toString(),
            long: location.lng.toString(),
        }));

        // Update the main coordinates for the form
        setLatitude(location.lat.toString());
        setLongitude(location.lng.toString());

        // Perform reverse geocoding to auto-fill address fields
        try {
            if (window.google && window.google.maps) {
                const geocoder = new window.google.maps.Geocoder();
                
                const result = await new Promise((resolve, reject) => {
                    geocoder.geocode(
                        { location: { lat: location.lat, lng: location.lng } },
                        (results, status) => {
                            if (status === 'OK' && results && results.length > 0) {
                                resolve(results[0]);
                            } else {
                                reject(new Error('Geocoding failed'));
                            }
                        }
                    );
                });

                // Extract address components from the geocoding result
                const addressComponents = result.address_components || [];
                let city = '';
                let area = '';
                let street = '';
                let building = '';

                // Parse address components
                addressComponents.forEach(component => {
                    const types = component.types;
                    
                    if (types.includes('locality')) {
                        city = component.long_name;
                    } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
                        area = component.long_name;
                    } else if (types.includes('administrative_area_level_1') && !area) {
                        area = component.long_name;
                    } else if (types.includes('route')) {
                        street = component.long_name;
                    } else if (types.includes('street_number')) {
                        building = component.long_name;
                    }
                });

                // Auto-fill the address form fields
                setAddressForm((prev) => ({
                    ...prev,
                    city: city || prev.city,
                    area: area || prev.area,
                    street: street || prev.street,
                    building: building || prev.building,
                    name: prev.name || `${city || 'Location'}, ${area || 'Area'}`,
                }));

                // Update selected address for display
                if (location.address) {
                    setSelectedAddress(location.address);
                }

                console.log('Address fields auto-filled:', { city, area, street, building });
            }
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
            // Don't show error to user, just log it
        }
    };

    // Address form change handler
    const handleAddressFormChange = (field, value) => {
        setAddressForm((prev) => ({
            ...prev,
            [field]: value,
        }));
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
                                    <h2 className={`pb-3 ${i18n.language === 'ar' ? 'ar-heading-bold' : ''}`}>{t('auth.signupsp.title')}</h2>
                                    {/* <h5 className={i18n.language === 'ar' ? 'ar-heading-bold' : ''}>
                                        <Link to="/login-sp" className='text-decoration-none'>
                                            {t('auth.signupsp.subtitle')}
                                        </Link>
                                    </h5> */}
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
                                                    className={`form-control pt-2 ${i18n.dir() === 'rtl' ? 'pe-5' : 'ps-5'} ${formSubmitted && !name.trim() ? 'is-invalid' : ''}`}
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
                                                {formSubmitted && !name.trim() && (
                                                    <div className="text-danger mt-1 small">
                                                        {t('auth.signupsp.validation.nameRequired', 'Name is required')}
                                                    </div>
                                                )}
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
      className={`form-control  pt-2 ${i18n.dir() === 'rtl' ? 'pe-5' : 'ps-5'} ${
        formSubmitted && !phoneNo ? 'is-invalid' : 
        phoneNo && phoneValid ? 'is-valid' : 
        phoneNo && !phoneValid ? 'is-invalid' : ''
      }`}
      id="phoneNo"
      placeholder={t("auth.signupsp.Phone", "Kuwait Phone (e.g., 51234567)")}
      value={phoneNo}
      onChange={(e) => { 
        const value = e.target.value;
        setPhoneNo(value);
        
        // Real-time validation
        if (value.trim() === '') {
          setPhoneError('');
          setPhoneValid(false);
        } else if (validatePhone(value)) {
          setPhoneError('');
          setPhoneValid(true);
        } else {
          setPhoneError(t('auth.signupsp.validation.phoneFormat', 'Please enter a valid Kuwait phone number'));
          setPhoneValid(false);
        }
      }}
      required
      style={{ 
        height: '50px',
        paddingLeft: i18n.dir() === 'rtl' ? '12px' : '50px',
        paddingRight: i18n.dir() === 'rtl' ? '50px' : '12px',
        textAlign: i18n.dir() === 'rtl' ? 'right' : 'left',
        direction: i18n.dir() === 'rtl' ? 'rtl' : 'ltr'
      }}
    />
  </div>
  {
    phoneError &&(
      <div className=" alert-danger text-danger">
      {phoneError}
      </div>
    )
  }
  
  {formSubmitted && !phoneNo && <div className="text-danger mt-1">{t('auth.signupsp.validation.phoneRequired', 'Phone number is required')}</div>}
  {formSubmitted && phoneNo && !validatePhone(phoneNo) && <div className="text-danger mt-1">{t('auth.signupsp.validation.phoneFormat', 'Please enter a valid Kuwait phone number (e.g., 51234567, +96551234567)')}</div>}
</div>

                                        {/* Email */}
                                        <div className="form-group mb-3">
                                            <div className="position-relative">
                                                <div className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'}`} style={{ zIndex: 10 }}>
                                                    <img src={EmailIcon} alt="Email" style={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
                                                </div>
                                                <input 
                                                    type="email" 
                                                    className={`form-control no-bg-icon ${i18n.dir() === 'rtl' ? 'pe-5' : 'ps-5'} ${formSubmitted && (!email || !validateEmail(email)) ? 'is-invalid' : ''}`}
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
                                                <div className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'}`} style={{ zIndex: 10 }}>
                                                    <img src={LockIcon} alt="Password" style={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
                                                </div>
                                                <input 
                                                    type={showPassword ? "text" : "password"}
                                                    className={`form-control no-bg-icon ${i18n.dir() === 'rtl' ? 'pe-5' : 'ps-5'} ${formSubmitted && (!password || password.length < 6) ? 'is-invalid' : ''}`}
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
                                                    <img src={EyeIcon} 
                                                    className="pt-1"
                                                    alt="Toggle password" 
                                                    style={{ width: '20px', height: '20px' }} />
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
                                                    className={`form-control pt-2 ${i18n.dir() === 'rtl' ? 'pe-5' : 'ps-5'} ${formSubmitted && !workTitle.trim() ? 'is-invalid' : ''}`}
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
                                                {formSubmitted && !workTitle.trim() && (
                                                    <div className="text-danger mt-1 small">
                                                        {t('auth.signupsp.validation.workTitleRequired', 'Work title is required')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Specialization */}
                                        <div className="form-group mb-3">
                                            <div className="position-relative">
                                                <div className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'}`} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>

                                                </div>
                                                
                                                {/* Custom Multi-Select Component */}
                                                <div 
                                                    className={`form-control pt-2 ${i18n.dir() === 'rtl' ? 'pe-3' : 'ps-3'} ${formSubmitted && selectedSpecializations.length === 0 ? 'is-invalid' : ''}`}
                                                    style={{ 
                                                        height: '50px', 
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        padding: '8px 12px',
                                                        overflow: 'hidden',
                                                        // add extra padding on the arrow side so placeholder doesn't overlap it
                                                        paddingRight: i18n.dir() === 'rtl' ? '12px' : '36px',
                                                        paddingLeft: i18n.dir() === 'rtl' ? '36px' : '12px'
                                                    }}
                                                    onClick={() => setShowSpecializationDropdown(!showSpecializationDropdown)}
                                                >
                                                    {/* Selected Items Display */}
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        flexWrap: 'wrap', 
                                                        gap: '4px', 
                                                        alignItems: 'center',
                                                        justifyContent: i18n.dir() === 'rtl' ? 'flex-end' : 'flex-start',
                                                        height: '100%',
                                                        overflow: 'hidden',
                                                        padding: '2px 0',
                                                        width: '100%'
                                                    }}>
                                                        {selectedSpecializations.length > 0 ? (
                                                            <>
                                                                {selectedSpecializations.slice(0, 3).map((specId) => {
                                                                    const spec = specializations.find(s => s._id === specId);
                                                                    return (
                                                                        <span 
                                                                            key={specId}
                                                                            className="badge bg-secondary"
                                                                            style={{ 
                                                                                fontSize: '11px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '2px',
                                                                                padding: '6px 10px'
                                                                            }}
                                                                        >
                                                                            <p className='m-0 pt-1'>{spec?.name || 'Unknown'}</p>
                                                                            <button
                                                                                className='pt-1'
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
                                                                    <span className="badge bg-secondary" style={{ fontSize: '11px', padding: '7px 10px'  }}>
                                                                        <p className='m-0 pt-1'>+{selectedSpecializations.length - 3} {t('common.more', 'more')}</p>
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className=" " style={{ fontSize: '16px' ,color:'lightslategray', display:'block', width:'100%', textAlign: i18n.dir() === 'rtl' ? 'right' : 'left', pointerEvents:'none' }}>
                                                                {loadingSpecializations ? t('common.loading', 'Loading') : t('auth.signupsp.selectSpecializations', 'Select specializations')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Dropdown Arrow */}
                                                    <div style={{ 
                                                        position: 'absolute', 
                                                        right: i18n.dir() === 'rtl' ? 'auto' : '12px', 
                                                        left: i18n.dir() === 'rtl' ? '12px' : 'auto', 
                                                        top: '50%', 
                                                        transform: 'translateY(-50%)',
                                                        pointerEvents: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        height: '100%',
                                                        color:'gray'
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
                                                                    className={`p-2 ${selectedSpecializations.includes(spec._id) ? '' : ''}`}
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
                                                        {t('auth.signupsp.validation.specializationRequired', 'Please select at least one specialization')}
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
                                                className={`form-control ps-3 pe-3 ${formSubmitted && (!experience || isNaN(experience) || parseInt(experience) < 0) ? 'is-invalid' : ''}`}
                                                id="experience"
                                                placeholder={t('auth.signupsp.experience')} 
                                                value={experience}
                                                onChange={(e) => setExperience(e.target.value)}
                                                required
                                                style={{ 
                                                    height: '50px',
                                                    textAlign: i18n.dir() === 'rtl' ? 'right' : 'left',
                                                    direction: i18n.dir() === 'rtl' ? 'rtl' : 'ltr'
                                                }}
                                            />
                                            {formSubmitted && (!experience || isNaN(experience) || parseInt(experience) < 0) && (
                                                <div className="text-danger mt-1 small">
                                                    {t('auth.signupsp.validation.experienceRequired', 'Valid experience years is required')}
                                                </div>
                                            )}
                                        </div>

                                        {/* Bio */}
                                        <div className="form-group mb-3">
                                            <textarea
                                                className={`form-control ps-3 pe-3 ${formSubmitted && (!bio.trim() || bio.trim().length < 10) ? 'is-invalid' : ''}`}
                                                id="bio"
                                                rows="3"
                                                placeholder={t('auth.signupsp.bio')} 
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                required
                                            />
                                            {formSubmitted && (!bio.trim() || bio.trim().length < 10) && (
                                                <div className="text-danger mt-1 small">
                                                    {!bio.trim() ? t('auth.signupsp.validation.bioRequired', 'Bio is required') : t('auth.signupsp.validation.bioLength', 'Bio must be at least 10 characters')}
                                                </div>
                                            )}
                                        </div>

                                        {/* Resume Upload */}
                                        <div className="form-group mb-3">
                                            <div className="position-relative">
                                                <div className={`position-absolute top-50 translate-middle-y ${i18n.dir() === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'}`} style={{ zIndex: 10 }}>
                                                    {/* <img src={FileIcon} alt="Resume" style={{ width: '20px', height: '20px', pointerEvents: 'none' }} /> */}
                                                </div>
                                                <input 
                                                    type="file" 
                                                    className="form-control ps-3 pe-3"
                                                    id="resume"
                                                    accept=".pdf"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            if (validatePdfFile(file)) {
                                                                setResume(file);
                                                                setResumeError('');
                                                            } else {
                                                                setResume(null);
                                                                setResumeError(t('auth.signupsp.validation.resumePdfOnly', 'Only PDF files are allowed for resume upload'));
                                                            }
                                                        } else {
                                                            setResume(null);
                                                            setResumeError('');
                                                        }
                                                    }}
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
                                                    className={`form-control d-flex align-items-center ${formSubmitted && !resume ? 'is-invalid' : ''}`}
                                                    style={{ 
                                                        minHeight: '50px',
                                                        // backgroundColor: resume ? '#fff' : '#f8f9fa',
                                                        border: '1px solid #ced4da',
                                                        borderRadius: '0.375rem',
                                                        cursor: 'pointer',
                                                        color:'lightslategray',
                                                        fontSize: '16px',
                                                        paddingLeft: i18n.dir() === 'rtl' ? '12px' : '10px',
                                                        paddingRight: i18n.dir() === 'rtl' ? '10px' : '12px'
                                                    }}
                                                >
                                                    <span>
                                                        {resume ? resume.name : t('auth.signupsp.resumePlaceholder', 'Upload PDF resume...')}
                                                    </span>
                                                </div>
                                                {resumeError && (
                                                    <div className="text-danger mt-1 small">
                                                        {resumeError}
                                                    </div>
                                                )}
                                                {formSubmitted && !resume && !resumeError && (
                                                    <div className="text-danger mt-1 small">
                                                        {t('auth.signupsp.validation.resumeRequired', 'Resume is required')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="form-group mb-3">
                                            <label className="form-label">{t('auth.signupsp.location')} *</label>
                                            <GoogleMapAddressPicker
                                                onLocationSelect={handleLocationSelect}
                                                initialLocation={selectedLocation}
                                                height="300px"
                                                key={selectedLocation ? `${selectedLocation.lat}-${selectedLocation.lng}` : 'new-location'}
                                            />
                                            {formSubmitted && (!latitude || !longitude) && (
                                                <div className="text-danger mt-1 small">
                                                    {t('auth.signupsp.validation.locationRequired', 'Please select your location on the map')}
                                                </div>
                                            )}
                                        </div>

                                        {/* Address Form Fields (Auto-filled from map) */}
                                     
                                    </div>
                                    <div>
                                        <div className='mt-4'>
                                            <button type='submit' className='btn pt-2  ev-submit-btn d-flex align-items-center justify-content-center' disabled={submitting}>
                                                {submitting ? (
                                                    <>
                                                        <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                                                        {t('auth.signupsp.creating')}
                                                    </>
                                                ) : t('auth.signupsp.createAccount')}
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
                                                className='btn d-flex align-items-center gap-2 md-gap-3 justify-content-center md:justify-content-between register-socials'
                                                onClick={handleGoogleRegister}
                                                disabled={socialSubmitting}
                                            >
                                                <span className="">
                                                {t('auth.signupsp.google')}
                                                </span>
                                              
                                                <img src={GoogleIcon} alt=""/>
                                            </button>
                                            <button 
                                                type="button" 
                                                className='btn d-flex align-items-center gap-2 md-gap-3 justify-content-center md:justify-content-between register-socials'
                                                onClick={handleAppleRegister}
                                                disabled={socialSubmitting}
                                            >
                                                <span className="">
                                                {t('auth.signupsp.apple')}
                                                </span>
                                              
                                                <img src={AppleIcon} alt=""/>
                                            </button>
                                        </div>
                                    
                                        <div className='mt-3'>
                                            <Link to="/signup" className='btn pt-2 seeker-auth-btn text-decoration-none d-flex align-items-center justify-content-center'>
                                                {t('auth.signupsp.registerAsCustomer')}
                                            </Link>
                                        </div>
                                        <div className='d-flex align-items-center gap-2 justify-content-center mt-4'>
                                            <a href="#" className='text-decoration-none fw-semibold'>
                                                {t('auth.signupsp.terms')}
                                            </a>
                                            <p className='m-0'>{t('auth.signupsp.and')}</p>
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
                                {t('auth.signupsp.otp.emailDescription', 'Enter the code sent to your email to verify your account.')}
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

                            <button type="submit" className="btn otp-submit-btn w-100 d-flex align-items-center justify-content-center">
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

