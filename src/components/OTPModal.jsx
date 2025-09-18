import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const OTPModal = ({ show, onClose }) => {
    const { t } = useTranslation();
    const [otp, setOtp] = useState(["", "", "", ""]);
    const inputRefs = useRef([]);
    const navigate = useNavigate();

    const handleChange = (index, value) => {
        if (/^\d?$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            // Focus next input
            if (value && index < 3) inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (otp.every(d => d !== "")) {
            navigate('/');
        } else {
            alert(t('otpModal.enterAllDigits', 'Please enter all 4 digits.'));
        }
    };

    if (!show) return null;

    return (
        <div className="otp-modal-overlay">
            <div className="otp-modal">
                <h3 className="text-center mb-2 fw-bold">{t('otpModal.title', 'أدخل الرمز')}</h3>
                <p className="text-center text-muted mb-3">{t('otpModal.subtitle', 'أدخل الرمز الذي وصلك على هاتفك المحمول لإعادة تعيين كلمة المرور')}</p>
                <div className="text-center mb-3">01:59</div>

                <form onSubmit={handleSubmit} className="otp-form text-center">
                    <div className="d-flex justify-content-center gap-3 mb-3">
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, i)}
                                ref={el => inputRefs.current[i] = el}
                                className="otp-input"
                            />
                        ))}
                    </div>
                    <button type="submit" className="btn btn-primary w-100">{t('otpModal.submitButton', 'أدخل الرمز')}</button>
                </form>
            </div>
        </div>
    );
};

export default OTPModal;
