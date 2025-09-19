

// Payment.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import '../css/pages/payment.scss';
import '../css/components/breadcrumb.scss';
import '../css/components/delete-confirmation-modal.scss';
import OrderSummary from '../components/OrderSummary';
import removeIcon from '../assets/payment/remove.svg';
import SidePattern from "../../public/images/side-pattern.svg";
import {useAlert} from '../context/AlertContext';
import {useLikes} from '../context/LikesContext';
import {useCart} from '../context/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { BaseUrl } from '../assets/BaseUrl';


const Payment = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { likedProducts, toggleProductLike ,fetchLikedProducts,setLikedProducts} = useLikes();
    const { cartItems, updateQuantity, removeFromCart } = useCart();
    const { showAlert } = useAlert(); // Use the hook
    
    // State for confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    
    // Cart data is now managed by CartContext, no need to load manually

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && showDeleteModal) {
                handleCancelDelete();
            }
        };

        if (showDeleteModal) {
            document.addEventListener('keydown', handleEscapeKey);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'unset';
        };
    }, [showDeleteModal]);

    // Function to handle quantity changes
    const handleQuantityChange = (productId, change) => {
        const item = cartItems.find(item => item._id === productId);
        if (item) {
            const newQuantity = Math.max(1, (item.quantity || 1) + change);
            updateQuantity(productId, newQuantity);
        }
    };

    // Function to show delete confirmation modal
    const handleRemoveItemClick = (productId) => {
        const item = cartItems.find(item => item._id === productId);
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    // Function to confirm and remove item from cart
    const handleConfirmDelete = () => {
        if (itemToDelete) {
            removeFromCart(itemToDelete._id);
            
            // Show success message
            showAlert(t('payment.messages.itemRemovedSuccess', { productName: itemToDelete.name_en || t('payment.messages.thisProduct') }), 'success');
            
            // Close modal and reset state
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    // Function to cancel delete
    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setItemToDelete(null);
    };

    // Function to handle product like toggle
    const handleToggleLike = async (productId) => {
        try {
            // Check if user is logged in
            const userData = localStorage.getItem('userData');
            if (!userData) {
                showAlert(t('payment.messages.loginRequiredFavorites'), 'warning');
                navigate('/login');
                return;
            }

            const newLikedStatus = await toggleProductLike(productId);
            
            // Show success message
            const message = newLikedStatus ? t('payment.messages.addedToFavorites') : t('payment.messages.removedFromFavorites');
            showAlert(message, 'success');

        } catch (error) {
            console.error('Error toggling product like:', error);
            showAlert(t('payment.messages.failedToUpdateFavorites'), 'error');
        }
    };

    // Function to handle Checkout button click
    const handleCheckoutClick = () => {
        // Check if user is logged in
        const userDataString = localStorage.getItem('userData');
        
        if (!userDataString) {
            showAlert(t('payment.messages.loginRequiredCheckout'), 'warning');
            navigate('/login');
            return;
        }

        // Navigate to checkout page
        navigate('/checkout');
    };


    // Breadcrumb items
    const breadcrumbItems = [
        { label: 'payment.home', path: '/' },
        { label: 'payment.cart', path: null }
    ];

    return (
        <div className="payment-page py-5">
            <div>
                <img className='side-pattern' src={SidePattern} alt="" />
            </div>
            <div className="container">
                {/* Breadcrumb Navigation */}
                <div className="row mb-4">
                    <div className="col-12">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                </div>
                
                {cartItems.length === 0 ? (
                    <div className="text-center py-5">
                        <h3>{t('payment.emptyCart')}</h3>
                        <p className="text-muted">{t('payment.addItemsToCart')}</p>
                        <button 
                            className="btn btn-primary mt-3"
                            onClick={() => navigate('/')}
                        >
                            {t('payment.continueShopping')}
                        </button>
                    </div>
                ) : (
                    <div className="row g-5">
                        {/* Product Listings Section - Right Side */}
                        <div className="col-lg-8">
                            <div className="product-listings">
                                {cartItems.map((item, index) => (
                                    <React.Fragment key={item._id || index}>
                                        <div className="product-item mb-4">
                                            <div className="border-0">
                                                <div>
                                                    <div className="row">
                                                        {/* Product Image */}
                                                        <div className="col-md-3">
                                                            <div className="product-image-container text-center">
                                                                <img
                                                                    src={item.images && item.images.length > 0 
                                                                        ? item.images[item.selectedImageIndex || 0] 
                                                                        : '/images/placeholder-product.jpg'}
                                                                    alt={item.name_en || 'Product'}
                                                                    className="product-img"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Product Details */}
                                                        <div className="col-md-6">
                                                            <h5 className="product-title fw-bold">
                                                                {item.name_en || 'Product Name'}
                                                            </h5>
                                                            
                                                            <div className="action-icons">
                                                                <div className="me-3">

                                                                    <span 
                                                                        className={`me-4 ${likedProducts[item._id] ? 'text-danger' : 'text-muted'}`}
                                                                        onClick={() => handleToggleLike(item._id)}
                                                                    >
                                                                        {likedProducts[item._id] ? t('payment.remove-favorites') : t('payment.add-favorites')}
                                                                    </span>
                                                                </div>
                                                                
                                                                <img 
                                                                    style={{width: '24px', height: '24px', cursor: 'pointer'}} 
                                                                    src={removeIcon} 
                                                                    alt="Delete"
                                                                    onClick={() => handleRemoveItemClick(item._id)} 
                                                                />    
                                                            </div>
                                                        </div>

                                                        {/* Product Pricing */}
                                                        <div className="col-md-3">
                                                            <div className="pricing-info">
                                                                <h5 className='mb-3 d-flex justify-content-center'>
                                                                    {t('payment.quantity')}
                                                                </h5>
                                                                <div className="quantity-selector mb-3">
                                                                    <button 
                                                                        className="quantity-btn minus-btn me-2"
                                                                        onClick={() => handleQuantityChange(item._id, -1)}
                                                                    >
                                                                        <span className="minus-icon">−</span>
                                                                    </button>
                                                                    <div className="quantity-display">
                                                                        {(item.quantity || 1).toString().padStart(2, '0')}
                                                                    </div>
                                                                    <button 
                                                                        className="quantity-btn plus-btn ms-2"
                                                                        onClick={() => handleQuantityChange(item._id, 1)}
                                                                        disabled={item.quantity >= (item.stockQuantity || 99)}
                                                                    >
                                                                        <span className="plus-icon">+</span>
                                                                    </button>
                                                                </div>
                                                                <div className="original-price gap-2">
                                                                    <p className='small-price fw-bold text-black'>
                                                                        {item.price} {t('payment.kwd')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {index < cartItems.length - 1 && (
                                            <hr className='product-separator d-md-block d-none' />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                        
                        {/* Order Summary Section - Left Side */}
                        <div className="col-lg-4 px-md-0">
                            <OrderSummary 
                                cartItems={cartItems} 
                                onPayNowClick={handleCheckoutClick}
                            />
                        </div>
                    </div>
                )}
            </div>
            
            {/* Simple Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="delete-confirmation-overlay" onClick={handleCancelDelete}>
                    <div className="delete-confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-body text-center">
                                <h5 className="mb-3">{t('payment.modal.simpleDeleteTitle', 'Are you sure you want to delete this item?')}</h5>
                            </div>
                            
                            <div className="modal-footer justify-content-center">
                                <button 
                                    className="btn btn-secondary me-3" 
                                    onClick={handleCancelDelete}
                                >
                                    {t('common.cancel', 'Cancel')}
                                </button>
                                <button 
                                    className="btn btn-danger" 
                                    onClick={handleConfirmDelete}
                                >
                                    {t('payment.modal.removeButton', 'Remove')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payment;