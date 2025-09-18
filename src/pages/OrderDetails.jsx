import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../css/pages/order-details.scss';
import OrderCard from '../components/OrderCard';
import DownloadIcon from '/images/document-download.svg';
import { BaseUrl } from '../assets/BaseUrl';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    // State for order data
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch order details from API
    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`${BaseUrl}/customer/getOrderDetails/${orderId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch order details: ${response.status}`);
            }

            const data = await response.json();
            setOrderData(data.order);
        } catch (error) {
            setError(error.message);
            console.error('Error fetching order details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    // Generate order steps from status history
    const orderSteps = useMemo(() => {
        if (!orderData?.statusHistory) {
            return [
        {
            id: 'details',
            title: t('orderDetails.orderDetails', 'Order Details'),
                    date: '',
                    completed: false
                }
            ];
        }

        return orderData.statusHistory.map((statusItem, index) => ({
            id: statusItem.status,
            title: t(`orderDetails.status.${statusItem.status}`, statusItem.status),
            date: new Date(statusItem.changedAt).toLocaleString(),
            completed: true
        }));
    }, [orderData, t]);

    const handleBackClick = () => {
        // Navigate to correct profile based on user role
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'sp') {
            navigate('/profile-sp');
        } else {
            navigate('/profile');
        }
    };

    const handleDownloadInvoice = () => {
        if (orderData?.invoiceUrl) {
            // Open invoice URL in new tab
            window.open(orderData.invoiceUrl, '_blank');
        } else {
            console.log('No invoice URL available');
            // You could show an alert or toast message here
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className='order-details-page'>
                <div className="order-details-header">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <div className="d-flex align-items-center">
                                    <button className="back-button me-3" onClick={handleBackClick}>
                                        <i className='fas fa-arrow-left'></i>
                                    </button>
                                    <h1 className="header-title mb-0 fw-bold">
                                        {t('orderDetails.pageTitle', 'Order Details')}
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center py-5">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">{t('common.loading', 'Loading...')}</span>
                            </div>
                            <p className="mt-2">{t('common.loading', 'Loading...')}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className='order-details-page'>
                <div className="order-details-header">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <div className="d-flex align-items-center">
                                    <button className="back-button me-3" onClick={handleBackClick}>
                                        <i className='fas fa-arrow-left'></i>
                                    </button>
                                    <h1 className="header-title mb-0 fw-bold">
                                        {t('orderDetails.pageTitle', 'Order Details')}
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center py-5">
                            <div className="alert alert-danger">
                                <h5>{t('orderDetails.error', 'Error Loading Order')}</h5>
                                <p>{error}</p>
                                <button className="btn btn-primary" onClick={fetchOrderDetails}>
                                    {t('common.retry', 'Retry')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // No order data
    if (!orderData) {
        return (
            <div className='order-details-page'>
                <div className="order-details-header">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <div className="d-flex align-items-center">
                                    <button className="back-button me-3" onClick={handleBackClick}>
                                        <i className='fas fa-arrow-left'></i>
                                    </button>
                                    <h1 className="header-title mb-0 fw-bold">
                                        {t('orderDetails.pageTitle', 'Order Details')}
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center py-5">
                            <div className="alert alert-info">
                                <h5>{t('orderDetails.notFound', 'Order Not Found')}</h5>
                                <p>{t('orderDetails.notFoundMessage', 'The order you are looking for could not be found.')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='order-details-page'>
            {/* Header */}
            <div className="order-details-header">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="d-flex align-items-center">
                                <button className="back-button me-3" onClick={handleBackClick}>
                                    <i className='fas fa-arrow-left'></i>
                                </button>
                                <h1 className="header-title mb-0 fw-bold">
                                    {t('orderDetails.pageTitle', 'Order Details')}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="row g-4 py-4 order-wrapper">
                    {/* Right Side - Order Summary */}
                    <div className="col-lg-8 col-md-12">
                        <div className="order-summary-section">
                            {/* Product Card */}
                            {orderData && <OrderCard order={orderData} />}
                        </div>
                    </div>
                    {/* Left Side - Order Progress */}
                    <div className="col-lg-4 col-md-12">
                        <div className="order-progress-section">
                            <div className='order-progress-header mb-3 pb-3'>
                                <h5 className='navy fw-bold'> {t('orderDetails.orderDetails', 'Order Details')}</h5>
                            </div>
                        
                            <div className="progress-timeline">
                                {orderSteps.map((step, index) => (
                                    <div key={step.id} className={`timeline-item ${step.completed ? 'completed' : ''}`}>
                                        <div className="timeline-marker">
                                            <div className="timeline-circle">
                                                <div className='circle-inner'></div>
                                            </div>
                                            {index < orderSteps.length - 1 && <div className="timeline-line"></div>}
                                        </div>
                                        <div className="timeline-content">
                                            <h3 className="timeline-title fw-bold">{step.title}</h3>
                                            {step.date && <p className="timeline-date mb-0">{step.date}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="order-summary-card mt-3">
                            <div className='order-progress-header mb-3 pb-3'>
                                <h5 className='navy fw-bold'> {t('orderDetails.orderSummary', 'Order Summary')}</h5>
                            </div>
                            <div className="summary-details">
                                <div className="summary-row d-flex justify-content-between align-items-center">
                                    <span className="summary-label">{t('orderDetails.subtotal', 'Subtotal')}</span>
                                    <span className="summary-value">KWD {(orderData?.totalAmount - orderData?.taxAmount - orderData?.shippingCost + orderData?.discountAmount).toFixed(2)}</span>
                                </div>
                                <div className="summary-row d-flex justify-content-between align-items-center">
                                    <span className="summary-label">{t('orderDetails.shipping', 'Shipping')}</span>
                                    <span className="summary-value">
                                        {orderData?.shippingCost > 0 ? `KWD ${orderData.shippingCost.toFixed(2)}` : t('orderDetails.free', 'Free')}
                                    </span>
                                </div>
                                <div className="summary-row d-flex justify-content-between align-items-center">
                                    <span className="summary-label">{t('orderDetails.tax', 'Tax')}</span>
                                    <span className="summary-value">KWD {orderData?.taxAmount?.toFixed(2) || '0.00'}</span>
                                </div>
                                {orderData?.discountAmount > 0 && (
                                    <div className="summary-row d-flex justify-content-between align-items-center">
                                        <span className="summary-label">{t('orderDetails.discount', 'Discount')}</span>
                                        <span className="summary-value">-KWD {orderData.discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="summary-row total-row d-flex justify-content-between align-items-center">
                                    <span className="summary-label">{t('orderDetails.total', 'Total')}</span>
                                    <span className="summary-value total-value">KWD {orderData?.totalAmount?.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="d-grid">
                                <button className="btn download-invoice-btn d-flex gap-2 align-items-center justify-content-center" onClick={handleDownloadInvoice}>
                                    <img src={DownloadIcon} alt="" />
                                    {t('orderDetails.downloadInvoice', 'Download Invoice')}
                                </button>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default OrderDetails;