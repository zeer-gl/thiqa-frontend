import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../css/components/order-card.scss';

const OrderCard = ({ order }) => {
  console.log('order',order)
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  const handleOrderDetailsClick = () => {
  
    if (order.paymentStatus === 'pending') {
      // Redirect to invoice URL for pending payments
      window.location.href = order.invoiceUrl;
    } else {
      // Navigate to product detail page using the product ID from the order
      const productId = firstProduct?.id || firstProduct?._id;
      navigate(`/order-details/${order.parentOrderId}`);
    }
  };

  const handleOrderAgainClick = () => {
    // Handle order again functionality
    console.log('Order again clicked for order:', order.id);
  };

  const firstProduct = order?.vendorOrders?.[0]?.products?.[0]?.product;
  const productQuantity = order?.vendorOrders?.[0]?.products?.[0]?.quantity || 1;
  const orderDate = new Date(order?.orderDate)?.toLocaleDateString();
  const paymentStatus = order?.paymentStatus;
  
  // Get product image from the first product - API doesn't include image in product object
  const productImage = null; // No image available in API response
  
  // Get product name with fallback
  const productName = firstProduct?.name || t('profile.orders.productName') || 'Product';

  return (
    <div className="order-card">
      <div className="order-content">
        {/* Product Image */}
     

        {/* Product Information */}
        <div className="product-info">
          <h3 className="product-name fw-bold">
            {firstProduct?.name || t('profile.orders.productName') || 'Product'}
            {productQuantity > 1 && ` (${productQuantity}x)`}
          </h3>
          <div className="order-meta">
            <div className="status-tag">
              <span className="status-text">
                {order?.status === 'Processing' ? t('orderDetails.status.processing') :
                 order?.status === 'Cancelled' ? t('orderDetails.status.cancelled') :
                 order?.status === 'Delivered' ? t('orderDetails.status.delivered') :
                 order?.status === 'Shipped' ? t('orderDetails.status.shipped') :
                 order?.status === 'processing' ? t('orderDetails.status.processing') :
                 order?.status === 'cancelled' ? t('orderDetails.status.cancelled') :
                 order?.status === 'delivered' ? t('orderDetails.status.delivered') :
                 order?.status === 'shipped' ? t('orderDetails.status.shipped') :
                 order?.status}
              </span>
            </div>
            <div className="payment-status">
              <span className={`payment-status-text ${paymentStatus}`}>
                {paymentStatus === 'pending' ? t('orderDetails.status.pending') :
                 paymentStatus === 'paid' ? t('orderDetails.status.paid') :
                 paymentStatus === 'unpaid' ? t('orderDetails.status.unpaid') :
                 paymentStatus === 'failed' ? t('orderDetails.status.failed') :
                 paymentStatus === 'cancelled' ? t('orderDetails.status.cancelled') :
                 paymentStatus === 'refunded' ? t('orderDetails.status.refunded') :
                 paymentStatus === 'processing' ? t('orderDetails.status.processing') :
                 paymentStatus}
              </span>
            </div>
            <div className="order-date">
              <span className="date-text">{t('orderDetails.orderDate')}: {orderDate}</span>
            </div>
          </div>
        </div>

        {/* Order Details and Actions */}
        <div className="order-details">
          {/* Pricing Information */}
          <div className="pricing-info">
            <div className="current-price">KWD {order?.totalAmount.toFixed(2)}</div>
            {order?.shippingCost > 0 && (
              <div className="shipping-cost">
                <small>+ KWD {order?.shippingCost.toFixed(2)} {t('orderDetails.shipping')}</small>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="btn btn-primary order-details-btn" style={{background:"#21395D"}}
              onClick={handleOrderDetailsClick}
            >
              {paymentStatus === 'pending' ? 
                t('orderDetails.payNow') : 
                t('orderDetails.orderDetails')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;