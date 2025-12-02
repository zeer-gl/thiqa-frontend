import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "/src/css/pages/auth.scss";
import AuthUpper from "/public/images/auth/auth-upper.svg";
import AuthMockup from "/public/images/auth/auth-mockup.png";
import Logo from "/public/images/favicon.png";
import EyeIcon from "/public/images/eye.svg";
import GoogleIcon from "/public/images/auth/google-icon.svg";
import AppleIcon from "/public/images/auth/apple-icon.svg";
import LanguageSwitcher from "../../components/LanguageSwitcher.jsx";
import SpUserIcon from "../../assets/payment/sp-user.svg";
import PhoneIcon from "/public/images/profile/phone-icon.svg";
import { messaging, getToken, auth } from "../../firbase";
import { BaseUrl } from "../../assets/BaseUrl.jsx";
import {AlertContext} from '../../context/AlertContext.jsx'
import { GoogleAuthProvider, signInWithPopup, OAuthProvider } from "firebase/auth";
import {useAlert} from '../../context/AlertContext.jsx';
import { FaEyeSlash } from "react-icons/fa";
import LockIcon from '/public/images/auth/lock.svg';

function Signup() {
  const { t, i18n } = useTranslation();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(59);
  const [timerInterval, setTimerInterval] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [socialSubmitting, setSocialSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formSubmitted, setFormSubmitted] = useState(false);
  const { showAlert } = useAlert(); 

  // form state
  const [name, setName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deviceToken, setDeviceToken] = useState(null);
  const[eror,setError]=useState('');
  const[emailError,setEmailError]=useState('');
  const[phoneError,setPhoneError]=useState('')
  const[phoneValid,setPhoneValid]=useState(false)
  const [registrationData, setRegistrationData] = useState(null);

  const navigate = useNavigate();
  const otpRefs = useRef([]);


  useEffect(() => {
    const initMessaging = async () => {
      try {
        if (typeof Notification !== "undefined") {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            try {
              const token = await getToken(messaging);
              if (token) setDeviceToken(token);
            } catch {}
          }
        }
      } catch {}
    };
    initMessaging();
  }, []);

  // Validation functions
  const validateForm = () => {
    let isValid = true;
    
    if (!name.trim()) {
      isValid = false;
    }
    
    if (!phoneNo.trim() || !validatePhone(phoneNo)) {
      isValid = false;
    }
    
    if (!email.trim() || !validateEmail(email)) {
      isValid = false;
    }
    
    if (!password) {
      isValid = false;
    }
    
    if (!confirmPassword || password !== confirmPassword) {
      isValid = false;
    }
    
    return isValid;
  };

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

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
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };


  // Function to verify OTP via API (phone-based)
  const verifyOTP = async (phone, otpCode) => {
    try {
      console.log('Verifying OTP via API for phone:', phone);
      
      const response = await fetch(`${BaseUrl}/customer/verifyOtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNo: phone,
          otp: otpCode
        })
      });
      
      const data = await response.json();
      console.log('OTP verification API response:', data);
      
      if (response.ok) {
        // OTP verification successful
        console.log('✅ OTP Verified successfully!');
        return { success: true, data: data };
      } else {
        // OTP verification failed
        const errorMessage = data.message || data.error || 'Invalid OTP code';
        console.log('❌ OTP Verification Failed:', errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Function to register user and get OTP via email
  const registerUserAndGetOTP = async (userData) => {
    try {
      console.log('Registering user and requesting OTP via email:', userData);
      
      const response = await fetch(`${BaseUrl}/customer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          phoneNo: userData.phoneNo,
          password: userData.password
        })
      });
      
      const data = await response.json();
      console.log('Registration API response:', data);
      
      if (response.ok) {
        // Registration successful, OTP sent to email
        // Store the registration data for use after OTP verification
        // (Backend returns token and customer data during registration)
        return { 
          success: true, 
          message: data.message || 'OTP sent to your email',
          registrationData: {
            token: data.token,
            customer: data.customer || data,
            customerId: data.customerId || data._id || data.customer?._id
          }
        };
      } else {
        // Registration failed
        const errorMessage = data.message || data.error || 'Registration failed';
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Error during registration:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    console.log('Starting registration process...');

    try {
      // Step 1: Register user and get OTP via email
      const userData = {
        name: name,
        email: email,
        phoneNo: phoneNo,
        password: password
      };
      
      const registrationResult = await registerUserAndGetOTP(userData);
      
      if (registrationResult.success) {
        // Step 2: Registration successful, OTP sent to email - show OTP modal
        // Store registration data (token and customer info) for use after OTP
        if (registrationResult.registrationData) {
          setRegistrationData(registrationResult.registrationData);
          console.log('✅ Registration data stored for later use:', registrationResult.registrationData);
        }
        showAlert(registrationResult.message, 'success');
        setShowOtpModal(true);
        startTimer();
      } else {
        // Registration failed, translate and show error
        let errorMessage = registrationResult.message || 'Registration failed';
        
        // Translate common backend error messages
        if (errorMessage.toLowerCase().includes('user with this phone number already exists')) {
          errorMessage = t('auth.signup.phoneNumberAlreadyExists', {
            defaultValue: 'User with this phone number already exists'
          });
        } else if (errorMessage.toLowerCase().includes('phone number already exists')) {
          errorMessage = t('auth.signup.phoneAlreadyExists', {
            defaultValue: 'Phone number already exists. Please use a different phone number or try logging in.'
          });
        } else if (errorMessage.toLowerCase().includes('user with this email already exists')) {
          errorMessage = t('auth.signup.emailAlreadyExists', {
            defaultValue: 'Email already exists. Please use a different email or try logging in.'
          });
        } else if (errorMessage.toLowerCase().includes('user with this email or phone number already exists')) {
          errorMessage = t('auth.signup.userAlreadyExists', {
            defaultValue: 'User with this email or phone number already exists. Please use different credentials or try logging in.'
          });
        }
        
        showAlert(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Registration flow error:', error);
      showAlert(t('auth.signup.registrationFailed', 'Registration failed. Please try again.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // GOOGLE REGISTER
  const handleGoogleRegister = async () => {
    setErrorMsg("");
    setSocialSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const idToken = credential?.idToken;
      if (!idToken) throw new Error("auth.signup.googleNoToken");

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
        token: deviceToken || 'device_token_here',
        role: 'customer', // Indicate this is for customer registration
        registrationType: 'customer',
        userType: 'customer',
        providerId: googleUserId || result.user.uid, // Send actual Google User ID (required by backend)
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

      console.log('Google authentication request:', requestBody);
      
      // Use the unified oauth-register-login API that handles both registration and login
      const res = await fetch(`${BaseUrl}/customer/oauth-register-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `Google authentication failed (${res.status})`);
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
      const successMessage = data.message || t('auth.signup.googleAuthenticationSuccess', 'Google authentication successful!');
      showAlert(successMessage, 'success');
      navigate("/");
     
    } catch (err) {
      const msg = (err?.code === "auth/configuration-not-found")
        ? "auth.signup.googleConfigMissing"
        : (err?.message || "auth.signup.genericError");
      setErrorMsg(msg);
    } finally {
      setSocialSubmitting(false);
    }
  };

  // APPLE REGISTER
  const handleAppleRegister = async () => {
    setErrorMsg("");
    setSocialSubmitting(true);
    
    try {
      const provider = new OAuthProvider("apple.com");
      provider.addScope('email');
      provider.addScope('name');
      
      // Don't set custom parameters - let Firebase handle redirect URL automatically
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
        token: deviceToken || 'device_token_here', 
        name: nameFromProvider || user.email?.split('@')[0] || 'Apple User',
        password: 'apple_signin_' + user.uid, // Generate a password for Apple users
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
        // Try customer object structure
        customer: {
          password: 'apple_signin_' + user.uid,
          name: nameFromProvider || user.email?.split('@')[0] || 'Apple User',
          email: user.email,
          phone: '',
          address: '',
          city: '',
          country: '',
          dateOfBirth: '',
          gender: ''
        },
        // Try different root-level field names
        customerPassword: 'apple_signin_' + user.uid,
        customer_password: 'apple_signin_' + user.uid,
        customerPwd: 'apple_signin_' + user.uid,
        customerPass: 'apple_signin_' + user.uid,
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
        role: 'customer',
        registrationType: 'customer',
        userType: 'customer',
        providerId: 'apple.com',
        customerId: user.uid,
        email: user.email,
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
        throw new Error(errorData?.message || `Apple authentication failed (${res.status})`);
      }
      
      const data = await res.json();
      console.log('Apple authentication data:', data);
      
      if (data.customer) {
        localStorage.setItem('userData', JSON.stringify(data.customer));
      }
      
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'user');
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      const successMessage = data.message || t('auth.signup.appleAuthenticationSuccess', 'Apple authentication successful!');
      showAlert(successMessage, 'success');
      navigate("/");
      
    } catch (err) {
      console.error("Apple sign-in error:", err);
      
      let errorMessage = "auth.signup.genericError";
      
      if (err.code === "auth/configuration-not-found") {
        errorMessage = "auth.signup.appleConfigMissing";
      } else if (err.code === "auth/invalid-credential") {
        errorMessage = "auth.signup.appleInvalidCredential";
      } else if (err.message.includes("redirect_uri")) {
        errorMessage = "auth.signup.redirectUriMismatch";
      }
      
      setErrorMsg(errorMessage);
      showAlert(t(errorMessage), 'error');
    } finally {
      setSocialSubmitting(false);
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
          return 0; // Stop at 0 instead of resetting to 59
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimerInterval(interval);
  };

  const handleOtpChange = (index, value) => {
    if (value === "" || (value.length === 1 && /^\d$/.test(value))) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
      if (value !== "" && index < 5) {
        otpRefs.current[index + 1].focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otpValues[index] === "" && index > 0) {
        otpRefs.current[index - 1].focus();
      } else {
        const newOtpValues = [...otpValues];
        newOtpValues[index] = "";
        setOtpValues(newOtpValues);
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (!otpValues.every((value) => value !== "")) {
      showAlert(t('Please enter the complete OTP code.'), 'error');
      return;
    }
    
    // Step 1: Verify OTP via API
    const otpCode = otpValues.join('');
    
    const verificationResult = await verifyOTP(phoneNo, otpCode);
    
    if (verificationResult.success) {
      // Step 2: OTP verification successful - use stored registration data
      console.log('✅ OTP Verification successful, using stored registration data...');
      console.log('Stored registration data:', registrationData);
      
      // Set login status FIRST
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'user');
      
      // Use stored registration data (from registration API response)
      if (registrationData) {
        // Store token from registration
        if (registrationData.token) {
          localStorage.setItem('token', registrationData.token);
          console.log('✅ Token stored from registration:', registrationData.token);
        } else {
          console.warn('⚠️ No token in stored registration data');
        }
        
        // Store customer data from registration
        if (registrationData.customer) {
          localStorage.setItem('userData', JSON.stringify(registrationData.customer));
          console.log('✅ Customer data stored');
        } else {
          console.warn('⚠️ No customer data in stored registration data');
        }
      } else {
        console.error('❌ No registration data available! This should not happen.');
      }
      
      // Debug: Log all stored values
      console.log('📦 Final localStorage state:', {
        isLoggedIn: localStorage.getItem('isLoggedIn'),
        userRole: localStorage.getItem('userRole'),
        'token': !!localStorage.getItem('token'),
        'token-value': localStorage.getItem('token'),
        userData: !!localStorage.getItem('userData')
      });
      
      showAlert(t('auth.signup.verificationSuccess'), 'success');
      
      // Small delay to ensure localStorage is updated before navigation
      setTimeout(() => {
        console.log('🔄 Navigating to home...');
        navigate("/");
      }, 100);
    } else {
      showAlert(verificationResult.message || t('auth.signup.invalidOtp'), 'error');
    }
  };


  const handleResend = async (e) => {
    e.preventDefault();
    
    // Clear existing OTP input fields
    setOtpValues(["", "", "", "", "", ""]);
    
    try {
      // Use the dedicated resend OTP API endpoint
      const response = await fetch(`${BaseUrl}/customer/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNo: phoneNo
        })
      });
      
      const data = await response.json();
      console.log('Resend OTP API response:', data);
      
      if (response.ok) {
        // Reset timer and start countdown
        setTimer(59);
        startTimer();
        showAlert(data.message || t('auth.signup.otpResent', 'OTP resent successfully'), 'success');
      } else {
        // Resend failed, show error
        const errorMessage = data.message || data.error || 'Failed to resend OTP';
        showAlert(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error during OTP resend:', error);
      showAlert(t('auth.signup.otpSendFailed', 'Failed to resend OTP. Please try again.'), 'error');
    }
  };

  const closeModal = () => {
    setShowOtpModal(false);
    setOtpValues(["", "", "", "", "", ""]);
    setTimer(59);
    setRegistrationData(null);
    
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

  const formattedTime = `${String(Math.floor(timer / 60)).padStart(2, "0")}:${String(timer % 60).padStart(2, "0")}`;

  return (
    <div>
      <div className="auth-container">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-6 auth-img-container">
              <div>
                <img className="auth-upper" src={AuthUpper} alt="" />
              </div>
              <div>
                <img className="auth-mockup" src={AuthMockup} alt="" />
              </div>
              <div>
                <img className="auth-lower" src={AuthUpper} alt="" />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="auth-switcher-wrapper">
                <LanguageSwitcher authStyle={true} />
              </div>
              <div className="login-form-container">
                <div>
                  <img className="auth-logo" src={Logo} alt="" />
                </div>
                <div className="my-4">
                  <h2 className={`pb-3 ${i18n.language === 'ar' ? 'ar-heading-bold' : ''}`}>{t("auth.signup.title")}</h2>
                  <h5 className={i18n.language === 'ar' ? 'ar-heading-bold' : ''}>{t("auth.signup.subtitle")}</h5>
               
                </div>
				<div className={errorMsg ? "mb-10" : ""}>
  {errorMsg && (
    <div className="mt-3 text-danger text-center" role="alert">
      {t(errorMsg)}
    </div>
  )}
</div>

                <style>{`
                  input[type=number]::-webkit-outer-spin-button,
                  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: auto; margin: 0; }
                  input[type=number] { -moz-appearance: number-input; }
                `}</style>
   {
                            eror&&(
                                <div className="alert alert-danger text-danger">
                                    {eror}
                                    </div>
                            )
                         }
                        
                <form onSubmit={handleCreateAccount} className="signup-form" style={{ maxHeight: '90vh', overflowY: 'auto', paddingTop: '2rem' }}>
                  <div>
                    <div className="form-group mb-3">
                      <div className="position-relative">
                        <div className={`position-absolute top-50 translate-middle-y ${i18n.dir() === "rtl" ? "end-0 pe-3" : "start-0 ps-3"}`}>
                          <img src={SpUserIcon} alt="Work title" style={{ width: "20px", height: "20px" }} />
                        </div>
                        <input
                          type="text"
                          className={`form-control  pt-2 ${i18n.dir() === "rtl" ? "pe-5" : "ps-5"} ${formSubmitted && !name ? 'is-invalid' : ''}`}
                          id="workTitle"
                          placeholder={t("auth.signupsp.Name", "Name")}
                          value={name}
                          onChange={(e) => { setName(e.target.value) }}
                        />
                      </div>
                    
                      {formSubmitted && !name && <div className="text-danger mt-1">{t('auth.signup.validation.nameRequired', 'Name is required')}</div>}
                    </div>

                    <div className="form-group mb-3">
                      <div className="position-relative">
                        <div className={`position-absolute top-50 translate-middle-y ${i18n.dir() === "rtl" ? "end-0 pe-3" : "start-0 ps-3"}`}>
                          <img src={PhoneIcon} alt="Phone" style={{ width: "15px", height: "15px" }} />
                        </div>
                        <input
                          type="tel"
                          min={0}
                          className={`form-control pt-2  ${i18n.dir() === "rtl" ? "pe-5" : "ps-5"} ${
                            formSubmitted && !phoneNo ? 'is-invalid' : 
                            phoneNo && phoneValid ? 'is-valid' : 
                            phoneNo && !phoneValid ? 'is-invalid' : ''
                          }`}
                          id="Phone"
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
                              setPhoneError(t('auth.signup.validation.phoneFormat', 'Please enter a valid Kuwait phone number'));
                              setPhoneValid(false);
                            }
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
					
                      {formSubmitted && !phoneNo && <div className="text-danger mt-1">{t('auth.signup.validation.phoneRequired', 'Phone number is required')}</div>}
                      {formSubmitted && phoneNo && !validatePhone(phoneNo) && <div className="text-danger mt-1">{t('auth.signup.validation.phoneFormat', 'Please enter a valid Kuwait phone number (e.g., 51234567, +96551234567)')}</div>}
                    </div>

                    <div className="form-group mb-3">
                      <input
                        type="email"
                        className={`form-control   ${formSubmitted && (!email || !validateEmail(email)) ? 'is-invalid' : ''}`}
                        id="fname"
                        placeholder={t("auth.signupsp.Email", "Email")}
                        value={email}
                        onChange={(e) => { setEmail(e.target.value) }}
                      />
                        {
                          emailError &&(
                            <div className=" alert-danger text-danger">
                            {emailError}
                            </div>
                          )
                         }
                      {formSubmitted && !email && <div className="text-danger mt-1">{t('auth.signup.validation.emailRequired', 'Email is required')}</div>}
					

                    </div>

                    <div className="form-group mb-3">
                      <div className="position-relative">
                        <div className={`position-absolute top-50 translate-middle-y ${i18n.language === 'ar' ? 'end-0 pe-3' : 'start-0 ps-3'}`}>
                          <img src={LockIcon} alt="Password" style={{ width: "20px", height: "20px" }} />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          className={`form-control no-bg-icon ${i18n.dir() === 'rtl' ? 'pe-5' : 'ps-5'}  ${showPassword ? "password-field" : ""} ${formSubmitted && !password ? 'is-invalid' : ''}`}
                          id="password"
                          placeholder={t("auth.signup.password")}
                          value={password}
                          onChange={(e) => { setPassword(e.target.value) }}
                        />
                        <div
                          className={`position-absolute top-50 translate-middle-y ${i18n.dir() === "rtl" ? "start-0 ps-3" : "end-0 pe-3"}`}
                          style={{ cursor: "pointer" }}
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                                                     <img src={EyeIcon} alt="Toggle password visibility" style={{ width: "20px", height: "20px" }} />
                          ) : (
                            <FaEyeSlash  style={{ width: "20px", height: "20px" }}/>

                          )}
                        </div>
                      </div>
                      {formSubmitted && !password && <div className="text-danger mt-1">{t('auth.signup.validation.passwordRequired', 'Password is required')}</div>}
                    </div>

                    <div className="form-group mb-3">
                      <div className="position-relative">
                        <div className={`position-absolute top-50 translate-middle-y ${i18n.language === 'ar' ? 'end-0 pe-3' : 'start-0 ps-3'}`}>
                          <img src={LockIcon} alt="Confirm Password" style={{ width: "20px", height: "20px" }} />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className={`form-control no-bg-icon ${i18n.dir() === 'rtl' ? 'pe-5' : 'ps-5'} ${showConfirmPassword ? "password-field" : ""} ${formSubmitted && (!confirmPassword || password !== confirmPassword) ? 'is-invalid' : ''}`}
                          id="confirmpassword"
                          placeholder={t("auth.signup.confirmPassword")}
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value)}}
                        />
                        <div
                          className={`position-absolute pt-1 top-50 translate-middle-y ${i18n.dir() === "rtl" ? "start-0 ps-3" : "end-0 pe-3"}`}
                          style={{ cursor: "pointer" }}
                          onClick={toggleConfirmPasswordVisibility}
                        >
                          {showConfirmPassword ? (
                          <img src={EyeIcon} alt="Toggle confirm password visibility" style={{ width: "20px", height: "20px" }} />
                          ) : (
                            <FaEyeSlash  style={{ width: "20px", height: "20px" }}/>
                           
                          )}
                        </div>
                      </div>
                      {formSubmitted && !confirmPassword && <div className="text-danger mt-1">{t('auth.signup.validation.confirmPasswordRequired', 'Confirm password is required')}</div>}
                      {formSubmitted && confirmPassword && password !== confirmPassword && <div className="text-danger mt-1">{t('auth.signup.validation.passwordMismatch', 'Password and confirm password do not match')}</div>}
                    </div>
                  </div>

                  <div>
                    <div className="mt-4">
                      <button type="submit" className="btn   pt-2 fw-semibold ev-submit-btn d-flex align-items-center justify-content-center" disabled={submitting}>
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {t("common.sending") || "Submitting..."}
                          </>
                        ) : t("auth.signup.createAccount")}
                      </button>
                      <Link className="btn visitor-btn  pt-2 mt-4 pt-2 fw-semibold d-flex align-items-center justify-content-center" to="/login">
                     {t('auth.login.title', 'Login')}
                      </Link>
                    </div>
                  </div>

                  <div className="text-center mt-4">
                    <p>{t("auth.signup.orLoginVia")}</p>
                    <div className="d-flex justify-content-center gap-3 align-items-center mt-4">
                      <button
                        type="button"
                        className="btn d-flex align-items-center gap-2 md-gap-3 justify-content-center md:justify-content-between register-socials"
                        onClick={handleGoogleRegister}
                        disabled={socialSubmitting}
                      >
                      <span >
                      {t("auth.signup.google")}
                      </span>
                    
                      
                        <img src={GoogleIcon} alt="" />
                      </button>
                      <button
                        type="button"
                        className="btn d-flex align-items-center gap-2 md-gap-3 justify-content-center md:justify-content-between register-socials"
                        onClick={handleAppleRegister}
                        disabled={socialSubmitting}
                      >
                        <span> 
                        {t("auth.signup.apple")}
                        </span>
                      
                        <img src={AppleIcon} alt="" />
                      </button>
                    </div>
                    <div className='mt-3'>
                      <Link to="/signup-sp" className='btn seeker-auth-btn pt-2 text-decoration-none d-flex align-items-center justify-content-center'>
                        {t('auth.signup.registerAsServiceProvider')}
                      </Link>
                    </div>
                    <div className="d-flex align-items-center gap-2 justify-content-center mt-4">
                      <a href="#" className="text-decoration-none fw-semibold d-flex align-items-center justify-content-center">
                        {t("auth.signup.terms")}
                      </a>
                      <p className="mb-0 d-flex align-items-center justify-content-center">{t("auth.signup.and")}</p>
                      <a href="#" className="text-decoration-none fw-semibold d-flex align-items-center justify-content-center">
                        {t("auth.signup.privacy")}
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
                <img style={{ maxWidth: "100px" }} src={Logo} alt="" />
              </div>
              <h3 className="otp-title mb-2 ar-heading-bold">{t("auth.signup.otp.title")}</h3>
              <p className="otp-description navy">{t("auth.signup.otp.phoneDescription", "Enter the code sent to your phone to verify your account.")}</p>
            </div>
            <div className="otp-timer mb-4">
              <span className="otp-timer-text">{t("auth.signup.otp.timerPrefix")} {formattedTime}</span>
            </div>
            <form onSubmit={handleOtpSubmit}>
              <div className="otp-inputs-container d-flex justify-content-center mb-4">
                {otpValues.map((value, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
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
              <button type="submit" className="btn otp-submit-btn w-100 d-flex align-items-center justify-content-center">{t("auth.signup.otp.submit")}</button>
            </form>
            <div className="text-center mt-3">
              <a 
                href="#" 
                onClick={timer > 0 ? undefined : handleResend} 
                className={`otp-resend-link navy text-decoration-none ${timer > 0 ? 'disabled' : ''}`}
                style={{ 
                  cursor: timer > 0 ? 'not-allowed' : 'pointer',
                  opacity: timer > 0 ? 0.5 : 1
                }}
              >
                {timer > 0 ? `${t("auth.signup.otp.resend")} (${formattedTime})` : t("auth.signup.otp.resend")}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;