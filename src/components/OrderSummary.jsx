// import React from 'react';
// import CustomButton from './CustomButton';
// import { useTranslation } from 'react-i18next';

// const OrderSummary = ({ onPayNowClick }) => {
//     const { t } = useTranslation();
//     return (
//         <div className="order-summary-card">
//             <h4 className="order-details-title fw-bold">{t('order-summary.order-details')}</h4>

//             {/* Order Summary Items */}
//             <div className="order-summary-items">
//                 <div className="d-flex justify-content-between mb-3">
//                     <span className="subtotal-title">{t('order-summary.subtotal')} (3 {t('order-summary.items')})</span>
//                     <span className="subtotal-price">50 {t('order-summary.kwd')}</span>
//                 </div>

//                 <div className="d-flex justify-content-between mb-3">
//                     <span className="subtotal-title">{t('order-summary.shipping-fees')}</span>
//                     <span className="subtotal-price">5 {t('order-summary.kwd')}</span>
//                 </div>

//                 {/* Promo Code Section */}
//                 <div className="promo-code-section mb-3">
//                     <label className="subtotal-title d-block mb-1" htmlFor="promoCode">
//                         {t('order-summary.promo-code')}
//                     </label>
//                     <input
//                         id="promoCode"
//                         type="text"
//                         className="form-control"
//                         placeholder={t('order-summary.code')}
//                     />
//                 </div>

//                 <div className="d-flex justify-content-between mb-3">
//                     <span className="subtotal-title">{t('order-summary.discount')}</span>
//                     <span className="subtotal-price">0 {t('order-summary.kwd')}</span>
//                 </div>

//                 <div className="d-flex justify-content-between mb-4">
//                     <span className="total-title">{t('order-summary.total')}</span>
//                     <span className="total-price">55 {t('order-summary.kwd')}</span>
//                 </div>
//             </div>

//             {/* Pay Now Button */}
//             <CustomButton text={t('order-summary.pay-now')} onClick={onPayNowClick} />
//         </div>
//     );
// };

// export default OrderSummary; 












// OrderSummary.jsx
import React from 'react';
import CustomButton from './CustomButton';
import { useTranslation } from 'react-i18next';

const OrderSummary = ({ cartItems, onPayNowClick, isLoading }) => {
    const { t } = useTranslation();
    
    // Calculate values based on cart items
    const subtotal = cartItems?.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const itemCount = cartItems?.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    // Static values as per your design
    const shippingFees = 0; // Changed to 0 as per your API requirements
    const discount = 0; // No discount applied
    const total = subtotal + shippingFees - discount;

    return (
        <div className="order-summary-card">
            <h4 className="order-details-title fw-bold">{t('order-summary.order-details')}</h4>

            {/* Order Summary Items */}
            <div className="order-summary-items">
                <div className="d-flex justify-content-between mb-3">
                    <span className="subtotal-title">{t('order-summary.subtotal')} ({itemCount} {t('order-summary.items')})</span>
                    <span className="subtotal-price">{subtotal?.toFixed(2)} {t('order-summary.kwd')}</span>
                </div>

                <div className="d-flex justify-content-between mb-3">
                    <span className="subtotal-title">{t('order-summary.shipping-fees')}</span>
                    <span className="subtotal-price">{shippingFees} {t('order-summary.kwd')}</span>
                </div>

                {/* Promo Code Section */}
                <div className="promo-code-section mb-3">
                    <label className="subtotal-title d-block mb-1" htmlFor="promoCode">
                        {t('order-summary.promo-code')}
                    </label>
                    <input
                        id="promoCode"
                        type="text"
                        className="form-control"
                        placeholder={t('order-summary.code')}
                    />
                </div>

                <div className="d-flex justify-content-between mb-3">
                    <span className="subtotal-title">{t('order-summary.discount')}</span>
                    <span className="subtotal-price">{discount} {t('order-summary.kwd')}</span>
                </div>

                <div className="d-flex justify-content-between mb-4">
                    <span className="total-title">{t('order-summary.total')}</span>
                    <span className="total-price">{total?.toFixed(2)} {t('order-summary.kwd')}</span>
                </div>
            </div>

            {/* Checkout Button */}
            <CustomButton 
                text={isLoading ? t('order-summary.processing') : t('order-summary.pay-now')} 
                onClick={onPayNowClick}
                disabled={isLoading}
            />
        </div>
    );
};

export default OrderSummary;