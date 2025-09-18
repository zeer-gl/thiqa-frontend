import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import '../css/components/payment-form.scss';

const PaymentForm = ({ onSubmit }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    // Helpers for formatting/validation
    const formatCardNumber = (rawValue) => {
        const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 19);
        const grouped = digitsOnly.replace(/(.{4})/g, '$1 ').trim();
        return grouped;
    };

    const luhnCheck = (digitsOnly) => {
        let sum = 0;
        let shouldDouble = false;
        for (let i = digitsOnly.length - 1; i >= 0; i -= 1) {
            let digit = parseInt(digitsOnly.charAt(i), 10);
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
    };

    const formatExpiry = (rawValue) => {
        const digits = rawValue.replace(/\D/g, '').slice(0, 4);
        if (digits.length <= 2) return digits;
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    };

    const formatCvv = (rawValue) => rawValue.replace(/\D/g, '').slice(0, 4);

    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedHeaderOption, setSelectedHeaderOption] = useState('brand'); // 'brand' or 'payment'

    const handleHeaderOptionChange = (option) => {
        setSelectedHeaderOption(option);
    };

    // Formik + Yup
    const validationSchema = Yup.object({
        cardNumber: Yup.string()
            .required(t('profileSP.paymentMethods.errors.invalidCardNumber'))
            .test('is-valid-card', t('profileSP.paymentMethods.errors.invalidCardNumber'), (value) => {
                if (!value) return false;
                const digits = value.replace(/\D/g, '');
                if (digits.length < 12 || digits.length > 19) return false;
                return luhnCheck(digits);
            }),
        cardholderName: Yup.string()
            .required(t('profileSP.paymentMethods.errors.requiredCardholderName')),
        expirationDate: Yup.string()
            .required(t('profileSP.paymentMethods.errors.invalidExpiry'))
            .test('is-valid-expiry', t('profileSP.paymentMethods.errors.invalidExpiry'), (value) => {
                if (!value) return false;
                const match = /^(\d{2})\/(\d{2})$/.exec(value);
                if (!match) return false;
                const month = parseInt(match[1], 10);
                const yy = parseInt(match[2], 10);
                if (month < 1 || month > 12) return false;
                return true;
            })
            .test('not-expired', t('profileSP.paymentMethods.errors.expiredCard'), (value) => {
                if (!value) return false;
                const match = /^(\d{2})\/(\d{2})$/.exec(value);
                if (!match) return false;
                const month = parseInt(match[1], 10);
                const yy = parseInt(match[2], 10);
                const now = new Date();
                const currentYearTwo = now.getFullYear() % 100;
                const currentMonth = now.getMonth() + 1;
                if (yy < currentYearTwo) return false;
                if (yy === currentYearTwo && month < currentMonth) return false;
                return true;
            }),
        cvv: Yup.string()
            .required(t('profileSP.paymentMethods.errors.invalidCVV'))
            .test('cvv-length', t('profileSP.paymentMethods.errors.invalidCVV'), (value) => {
                if (!value) return false;
                const digits = value.replace(/\D/g, '');
                return digits.length >= 3 && digits.length <= 4;
            })
    });

    const formik = useFormik({
        initialValues: {
            cardNumber: '',
            cardholderName: '',
            cvv: '',
            expirationDate: '',
            saveForRenewals: false
        },
        validationSchema,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: (values, { resetForm }) => {
            onSubmit(values);
            setShowSuccess(true);
            resetForm();
            setTimeout(() => setShowSuccess(false), 3000);
        }
    });

    return (
        <div className={`payment-form ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="payment-form-container">
                {/* Header with logo and title */}
                <div className="payment-header" role="radiogroup" aria-label="Payment Options">
                    <div 
                        className={`logo-section ${selectedHeaderOption === 'brand' ? 'selected' : ''}`}
                        onClick={() => handleHeaderOptionChange('brand')}
                        role="radio"
                        aria-checked={selectedHeaderOption === 'brand'}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleHeaderOptionChange('brand');
                            }
                        }}
                    >
                        <span className="brand-name">myfatoorah</span>
                        <div className="brand-dot"></div>
                    </div>
                    <div 
                        className={`payment-indicator ${selectedHeaderOption === 'payment' ? 'selected' : ''}`}
                        onClick={() => handleHeaderOptionChange('payment')}
                        role="radio"
                        aria-checked={selectedHeaderOption === 'payment'}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleHeaderOptionChange('payment');
                            }
                        }}
                    >
                        <div className="card-icon">
                            <i className="fas fa-credit-card"></i>
                        </div>
                        <div className="indicator-dot"></div>
                    </div>
                </div>

                <h1 className="payment-title fw-bold">
                    {t('profileSP.paymentMethods.title')}
                </h1>

                {showSuccess && (
                    <div className="success-message">
                        <i className="fas fa-check-circle"></i>
                        <span>{t('profileSP.paymentMethods.paymentSuccess')}</span>
                    </div>
                )}

                <form onSubmit={formik.handleSubmit} className="payment-form-fields">
                    {/* Scan Card Row */}
                    <div className="row mb-3">
                        <div className="col-12">
                            <label className="scan-label">
                                <i className="fas fa-qrcode scan-icon"></i>
                                {t('profileSP.paymentMethods.scanCard')}
                            </label>
                        </div>
                    </div>

                    {/* Card Number and Cardholder Name Row */}
                    <div className="row mb-3">
                        <div className="col-sm-12 col-md-6">
                            <label className="form-label">
                                {t('profileSP.paymentMethods.cardNumber')}
                            </label>
                            <div className="input-with-icon">
                                <i className="fas fa-credit-card input-icon"></i>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    name="cardNumber"
                                    className={`form-input ${formik.touched.cardNumber && formik.errors.cardNumber ? 'is-invalid' : ''}`}
                                    value={formik.values.cardNumber}
                                    onChange={(e) => formik.setFieldValue('cardNumber', formatCardNumber(e.target.value))}
                                    onBlur={formik.handleBlur}
                                    placeholder={t('profileSP.paymentMethods.enterCardNumber')}
                                    aria-invalid={formik.touched.cardNumber && !!formik.errors.cardNumber}
                                    aria-describedby="cardNumberError"
                                />
                            </div>
                            {formik.touched.cardNumber && formik.errors.cardNumber && (
                                <p id="cardNumberError" className="error-message">{formik.errors.cardNumber}</p>
                            )}
                        </div>
                        <div className="col-sm-12 col-md-6">
                            <label className="form-label">
                                {t('profileSP.paymentMethods.cardholderName')}
                            </label>
                            <div className="input-with-icon">
                                <i className="fas fa-user input-icon"></i>
                                <input
                                    type="text"
                                    name="cardholderName"
                                    className={`form-input ${formik.touched.cardholderName && formik.errors.cardholderName ? 'is-invalid' : ''}`}
                                    value={formik.values.cardholderName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder={t('profileSP.paymentMethods.enterCardholderName')}
                                    aria-invalid={formik.touched.cardholderName && !!formik.errors.cardholderName}
                                    aria-describedby="cardholderNameError"
                                />
                            </div>
                            {formik.touched.cardholderName && formik.errors.cardholderName && (
                                <p id="cardholderNameError" className="error-message">{formik.errors.cardholderName}</p>
                            )}
                        </div>
                    </div>

                    {/* Expiration Date and CVV Row */}
                    <div className="row mb-3">
                        <div className="col-sm-12 col-md-6">
                            <label className="form-label">
                                {t('profileSP.paymentMethods.expirationDate')}
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                name="expirationDate"
                                className={`form-input ${formik.touched.expirationDate && formik.errors.expirationDate ? 'is-invalid' : ''}`}
                                value={formik.values.expirationDate}
                                onChange={(e) => formik.setFieldValue('expirationDate', formatExpiry(e.target.value))}
                                onBlur={formik.handleBlur}
                                placeholder={t('profileSP.paymentMethods.monthYear')}
                                aria-invalid={formik.touched.expirationDate && !!formik.errors.expirationDate}
                                aria-describedby="expirationDateError"
                                maxLength={5}
                            />
                            {formik.touched.expirationDate && formik.errors.expirationDate && (
                                <p id="expirationDateError" className="error-message">{formik.errors.expirationDate}</p>
                            )}
                        </div>
                        <div className="col-sm-12 col-md-3">
                            <label className="form-label">
                                {t('profileSP.paymentMethods.cardCode')}
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                name="cvv"
                                className={`form-input ${formik.touched.cvv && formik.errors.cvv ? 'is-invalid' : ''}`}
                                value={formik.values.cvv}
                                onChange={(e) => formik.setFieldValue('cvv', formatCvv(e.target.value))}
                                onBlur={formik.handleBlur}
                                placeholder={t('profileSP.paymentMethods.enterCVV')}
                                aria-invalid={formik.touched.cvv && !!formik.errors.cvv}
                                aria-describedby="cvvError"
                                maxLength={4}
                            />
                            {formik.touched.cvv && formik.errors.cvv && (
                                <p id="cvvError" className="error-message">{formik.errors.cvv}</p>
                            )}
                        </div>
                    </div>

                    {/* Save Information Checkbox */}
                    <div className="row mb-3">
                        <div className="col-12">
                            <label className="custom-checkbox" htmlFor="saveForRenewals">
                                <input
                                    id="saveForRenewals"
                                    type="checkbox"
                                    name="saveForRenewals"
                                    checked={formik.values.saveForRenewals}
                                    onChange={(e) => formik.setFieldValue('saveForRenewals', e.target.checked)}
                                />
                                <span className="checkbox-box" aria-hidden="true"></span>
                                <span className="checkbox-text">
                                    {t('profileSP.paymentMethods.saveForRenewals')}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Confirm Payment Button */}
                    <div className="row mb-3">
                        <div className="col-12 col-lg-6">
                            <button type="submit" className="confirm-payment-btn">
                                {t('profileSP.paymentMethods.confirmPayment')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentForm;
