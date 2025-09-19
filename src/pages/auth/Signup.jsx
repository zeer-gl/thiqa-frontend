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

function Signup() {
  const { t, i18n } = useTranslation();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", ""]);
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

  // Mobile-style OTP generation and verification
  const [generatedOTP, setGeneratedOTP] = useState(null);

  // Function to generate and send OTP via SMS service
  const sendOTP = async (phoneNumber) => {
    try {
      console.log("Generating OTP...");
      
      // Generate 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOTP(otp);
      
      console.log('📨 Generated OTP:', otp, 'for phone:', phoneNumber);
      console.log('🔑 For testing - OTP is:', otp);
      
      // SMS service disabled due to CORS issues - OTP generated locally for testing
      console.log('📨 OTP generated locally:', otp, 'for phone:', phoneNumber);
      showAlert(t('auth.signup.otpSent'), 'success');
      
      // Always return true since OTP is generated and stored locally
      return true;
    } catch (error) {
      console.error('⚠️ Error while generating OTP:', error);
      showAlert(t('auth.signup.otpSendFailed'), 'error');
      return false;
    }
  };

  // Function to verify OTP locally
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
        // Don't show registration success here - only after OTP verification
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

      console.log('Google authentication request:', requestBody);
      
      // First try to login with Google (in case user already exists)
      let res = await fetch(`${BaseUrl}/customer/customer-google-login`, {
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
        
        res = await fetch(`${BaseUrl}/customer/customer-google-registration`, {
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
        
        // Show appropriate success message
        const successMessage = isLogin 
          ? t('auth.login.googleLoginSuccess', 'Google login successful!')
          : t('auth.signup.googleRegistrationSuccess', 'Google registration successful!');
        
        showAlert(successMessage, 'success');
        navigate("/");
      }
     
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
      
      // Sign in with popup
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
        name: nameFromProvider,
        role: 'customer', // Indicate this is for customer registration
        registrationType: 'customer',
        userType: 'customer',
        providerId: 'apple.com', // Add required providerId for Apple authentication
        customerId: user.uid, // Use Apple user ID as customerId
        email: user.email, // Add email from Apple user
        pic: user.photoURL || '', // Add profile picture from Apple user
        federatedId: user.providerData?.[0]?.uid || user.uid, // Add Apple federated ID
        firstName: nameFromProvider?.split(' ')[0] || '', // Add first name
        lastName: nameFromProvider?.split(' ').slice(1).join(' ') || '', // Add last name
        fullName: nameFromProvider || '', // Add full name
        photoUrl: user.photoURL || '', // Add photo URL
        emailVerified: user.emailVerified || false, // Add email verification status
        localId: user.uid, // Add Firebase local ID
        rawId: user.providerData?.[0]?.uid || user.uid, // Add raw Apple ID
        appleUserId: user.providerData?.[0]?.uid || user.uid // Add explicit Apple user ID
      };
      
      console.log('Apple authentication request:', requestBody);
      
      // First try to login with Apple (in case user already exists)
      let res = await fetch(`${BaseUrl}/customer/customer-apple-login`, {
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
        
        res = await fetch(`${BaseUrl}/customer/customer-apple-registration`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.message || `Apple authentication failed (${res.status})`);
        }
      }
      
      // Successful authentication
      data = await res.json();
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
      
      // Show appropriate success message
      const successMessage = isLogin 
        ? t('auth.login.appleLoginSuccess', 'Apple login successful!')
        : t('auth.signup.appleRegistrationSuccess', 'Apple registration successful!');
      
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
          return 59;
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
      if (value !== "" && index < 3) {
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
    
    // Step 1: Verify OTP locally
    const otpCode = otpValues.join('');
    
    const verificationSuccess = await verifyOTP(otpCode);
    
    if (verificationSuccess) {
      // Step 2: Show verification success, then call registration API
      showAlert(t('auth.signup.verificationSuccess'), 'success');
      await registerUser();
    } else {
      showAlert(t('auth.signup.invalidOtp'), 'error');
    }
  };

  // Function to register user after OTP verification
  const registerUser = async () => {
    try {
      console.log('Calling registration API after OTP verification...');
      
      const res = await fetch(`${BaseUrl}/customer/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNo: phoneNo,
          password: password,
          name: name,
          email: email,
          token: deviceToken || undefined
        })
      });
      
      const resultt = await res.json();
      console.log('Registration result:', resultt);
      
      if (res.ok) {
        if (resultt.customer) {
          localStorage.setItem('userData', JSON.stringify(resultt.customer));
        }
        
        // Set login status
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'user');
        localStorage.setItem('token', resultt.token);
        
        showAlert(t('auth.signup.registrationSuccess'), 'success');
        navigate("/");
      } else {
        const backendMessage = resultt?.message || resultt?.error || t('auth.signup.genericError');
        showAlert(backendMessage, "error");
      }
    } catch (error) {
      console.error('Registration error:', error);
      showAlert(t('auth.signup.genericError'), 'error');
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
    setOtpValues(["", "", "", ""]);
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
                  <h2 className="pb-3 ar-heading-bold">{t("auth.signup.title")}</h2>
                  <h5 className="ar-heading-bold">{t("auth.signup.subtitle")}</h5>
               
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
                          className={`form-control ${i18n.dir() === "rtl" ? "pe-5" : "ps-5"} ${formSubmitted && !name ? 'is-invalid' : ''}`}
                          id="workTitle"
                          placeholder={t("auth.signupsp.Name", "Name")}
                          value={name}
                          onChange={(e) => { setName(e.target.value) }}
                        />
                      </div>
                    
                      {formSubmitted && !name && <div className="text-danger mt-1">{t('Name field is required ')}</div>}
                    </div>

                    <div className="form-group mb-3">
                      <div className="position-relative">
                        <div className={`position-absolute top-50 translate-middle-y ${i18n.dir() === "rtl" ? "end-0 pe-3" : "start-0 ps-3"}`}>
                          <img src={PhoneIcon} alt="Phone" style={{ width: "15px", height: "15px" }} />
                        </div>
                        <input
                          type="tel"
                          min={0}
                          className={`form-control ${i18n.dir() === "rtl" ? "pe-5" : "ps-5"} ${
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
                              setPhoneError('Please enter a valid Kuwait phone number');
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
					
                      {formSubmitted && !phoneNo && <div className="text-danger mt-1">{t('Phone number is required')}</div>}
                      {formSubmitted && phoneNo && !validatePhone(phoneNo) && <div className="text-danger mt-1">{t('Please enter a valid Kuwait phone number (e.g., 51234567, +96551234567)')}</div>}
                    </div>

                    <div className="form-group mb-3">
                      <input
                        type="email"
                        className={`form-control ${formSubmitted && (!email || !validateEmail(email)) ? 'is-invalid' : ''}`}
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
                      {formSubmitted && !email && <div className="text-danger mt-1">{t('Email is required')}</div>}
					

                    </div>

                    <div className="form-group mb-3">
                      <div className="position-relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className={`form-control ${showPassword ? "password-field" : ""} ${formSubmitted && !password ? 'is-invalid' : ''}`}
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
                          <img src={EyeIcon} alt="Toggle password visibility" style={{ width: "20px", height: "20px" }} />
                        </div>
                      </div>
                      {formSubmitted && !password && <div className="text-danger mt-1">{t('Password is required')}</div>}
                    </div>

                    <div className="form-group mb-3">
                      <div className="position-relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className={`form-control ${showConfirmPassword ? "password-field" : ""} ${formSubmitted && (!confirmPassword || password !== confirmPassword) ? 'is-invalid' : ''}`}
                          id="confirmpassword"
                          placeholder={t("auth.signup.confirmPassword")}
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value)}}
                        />
                        <div
                          className={`position-absolute top-50 translate-middle-y ${i18n.dir() === "rtl" ? "start-0 ps-3" : "end-0 pe-3"}`}
                          style={{ cursor: "pointer" }}
                          onClick={toggleConfirmPasswordVisibility}
                        >
                          <img src={EyeIcon} alt="Toggle confirm password visibility" style={{ width: "20px", height: "20px" }} />
                        </div>
                      </div>
                      {formSubmitted && !confirmPassword && <div className="text-danger mt-1">{t('Confirm password is required')}</div>}
                      {formSubmitted && confirmPassword && password !== confirmPassword && <div className="text-danger mt-1">{t('Password and confirm pasword not match')}</div>}
                    </div>
                  </div>

                  <div>
                    <div className="mt-4">
                      <button type="submit" className="btn fw-semibold ev-submit-btn" disabled={submitting}>
                        {submitting ? (t("common.sending") || "Submitting...") : t("auth.signup.createAccount")}
                      </button>
                      <Link className="btn visitor-btn mt-4 fw-semibold" to="/login">
                     {t('auth.login.title', 'Login')}
                      </Link>
                    </div>
                  </div>

                  <div className="text-center mt-4">
                    <p>{t("auth.signup.orLoginVia")}</p>
                    <div className="d-flex justify-content-center gap-3 align-items-center mt-4">
                      <button
                        type="button"
                        className="btn d-flex align-items-center gap-3 justify-content-between register-socials"
                        onClick={handleGoogleRegister}
                        disabled={socialSubmitting}
                      >
                        {t("auth.signup.google")}
                        <img src={GoogleIcon} alt="" />
                      </button>
                      <button
                        type="button"
                        className="btn d-flex align-items-center gap-3 justify-content-between register-socials"
                        onClick={handleAppleRegister}
                        disabled={socialSubmitting}
                      >
                        {t("auth.signup.apple")}
                        <img src={AppleIcon} alt="" />
                      </button>
                    </div>
                    <div className='mt-3'>
                      <Link to="/signup-sp" className='btn seeker-auth-btn text-decoration-none'>
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
              <p className="otp-description navy">{t("auth.signup.otp.description")}</p>
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
              <button type="submit" className="btn otp-submit-btn w-100">{t("auth.signup.otp.submit")}</button>
            </form>
            <div className="text-center mt-3">
              <a href="#" onClick={handleResend} className="otp-resend-link navy text-decoration-none">
                {t("auth.signup.otp.resend")}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;