import React, {useState, useEffect, useRef} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faStar,
    faArrowLeft,
    faHeart as solidHeart,
    faShoppingCart,
    faChevronDown,
    faChevronUp,
    faChevronLeft,
    faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import {faHeart as regularHeart} from '@fortawesome/free-regular-svg-icons';
import '../css/pages/product-detail.scss';
import CartIcon from '/public/images/detail/cart-icon.svg'
import CustomerImg2 from '/public/images/home/customer-profile.png';
import SidePattern from '/public/images/side-pattern.svg';
import ArrowRight from '/public/images/arrow-right.svg';
import {BaseUrl} from '../assets/BaseUrl';
import {useLikes} from '../context/LikesContext';
import {useCart} from '../context/CartContext';
// Import the product image
import ProductImage from '../assets/payment/modern-ceiling-lights.svg';
import {useAlert} from '../context/AlertContext';

const ProductDetail = () => {
    const {t, i18n} = useTranslation();
    const {id} = useParams();
    const navigate = useNavigate();
    const {likedProducts, toggleProductLike} = useLikes();
    const {addToCart} = useCart();
    const {showAlert} = useAlert();
    
    // Check if current product is liked
    const isProductLiked = likedProducts[id] || false;
    
    // Handle product like toggle
    const handleToggleLike = async () => {
        try {
            // Check if user is logged in
            const token = localStorage.getItem('token');
            if (!token) {
                // Redirect to login or show login modal
                navigate('/login');
                return;
            }
            
            const newLikedStatus = await toggleProductLike(id);
            
            // No need to update localStorage - context handles everything
        } catch (error) {
            console.error('Error toggling product like:', error);
            // You could show an alert here if needed
        }
    };
    
    const [quantity, setQuantity] = useState(() => {
        const saved = localStorage.getItem(`product_${id}_quantity`);
        return saved ? JSON.parse(saved) : 1; // Start with 1 instead of 0
    });
    
    const [activeTab, setActiveTab] = useState(() => {
        const saved = localStorage.getItem(`product_${id}_activeTab`);
        return saved ? JSON.parse(saved) : 'description';
    });
    
    const [selectedImageIndex, setSelectedImageIndex] = useState(() => {
        const saved = localStorage.getItem(`product_${id}_selectedImageIndex`);
        return saved ? JSON.parse(saved) : 0;
    });
    
    const [showScrollArrow, setShowScrollArrow] = useState(false);
    const thumbnailContainerRef = useRef(null);
   

    // Determine direction based on current language
    const isRTL = i18n.language === 'ar';
    const direction = isRTL ? 'rtl' : 'ltr';

    // Mock product data with multiple images - in a real app, this would come from an API
    const [product, setProduct] = useState({
        id: id,
        title: t('pages.detail-page.section1.productTitle'),
        company: t('pages.detail-page.section1.companyName'),
        price: 50,
        rating: 5.0,
        reviews: 150,
        sales: 160,
        description: t('pages.detail-page.section2.description'),
        features: [
            t('pages.detail-page.section2.features.ledTechnology'),
            t('pages.detail-page.section2.features.dimmableFunction'),
            t('pages.detail-page.section2.features.modernDesign'),
            t('pages.detail-page.section2.features.easyInstallation'),
            t('pages.detail-page.section2.features.warranty'),
            t('pages.detail-page.section2.features.multipleFinishes')
        ],
        specifications: {
            [t('pages.detail-page.section2.specifications.power')]: "15W LED",
            [t('pages.detail-page.section2.specifications.colorTemperature')]: t('pages.detail-page.section2.specifications.colorTempValue'),
            [t('pages.detail-page.section2.specifications.material')]: t('pages.detail-page.section2.specifications.materialValue'),
            [t('pages.detail-page.section2.specifications.dimensions')]: "60cm x 60cm x 15cm",
            [t('pages.detail-page.section2.specifications.voltage')]: "220-240V",
            [t('pages.detail-page.section2.specifications.certification')]: "CE, RoHS compliant"
        },
        // Multiple images for the gallery - using different images to simulate product views
        images: [
            ProductImage, // Main product image
            "/images/home/product-card-bg.png", // Product in different setting
            "/images/home/hero-img.png", // Product in room context
            "/images/home/customer-img.png", // Product detail view
            "/images/home/sp-card-img.jpg", // Product close-up
            "/images/home/mobile-mockup.png" // Product installation view
        ]
    });


    const[products,setProducts]=useState(null);
    const[loading,setLoading]=useState(false)
    const[Error,setError]=useState(null);
    
    // Review states
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [reviewsError, setReviewsError] = useState(null);
    const [submittingReview, setSubmittingReview] = useState(false);
    
    // Review form states
    const [reviewForm, setReviewForm] = useState({
        rating: 0,
        efficiencyRating: 0,
        priceRating: 0,
        deliveryRating: 0,
        additionalNotes: ''
    });

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BaseUrl}/customer/getSingleProduct/${id}`,{
                method:"GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
            });
            
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message || `Failed to load product (${res.status})`);
            }
            
            const data = await res.json();
            setProducts(data?.product);
        } catch (e) {
            setError(e?.message || t('pages.detail-page.section3.evaluationForm.unableToLoadProduct'));
        } finally {
            setLoading(false);
        }
    };

    // Fetch product reviews
    const fetchProductReviews = async () => {
        try {
            setLoadingReviews(true);
            setReviewsError(null);
            const response = await fetch(`${BaseUrl}/customer/get-product-reviews/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData?.message || `Failed to load reviews (${response.status})`);
            }
            
            const data = await response.json();
            console.log('Reviews API response:', data);
            
            // Handle the new API response structure
            if (data.success && Array.isArray(data.data)) {
                // Show all reviews (both pending and approved)
                setReviews(data.data);
            } else {
                setReviews([]);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviewsError(error?.message || t('pages.detail-page.section3.evaluationForm.failedToLoadReviews'));
        } finally {
            setLoadingReviews(false);
        }
    };

    // Submit product review
    const submitProductReview = async (e) => {
        e.preventDefault();
        
        try {
            setSubmittingReview(true);
            
            // Get customer data
            const userDataString = localStorage.getItem('userData');
            if (!userDataString) {
                showAlert(t('pages.detail-page.section3.evaluationForm.loginRequired'),'danger');
                return;
            }
            
            const userData = JSON.parse(userDataString);
            const customerId = userData._id;
            
            // Validate form - only require individual ratings
            if (reviewForm.efficiencyRating === 0 || 
                reviewForm.priceRating === 0 || reviewForm.deliveryRating === 0) {
                    showAlert(t('pages.detail-page.section3.evaluationForm.fillRequiredFields'),'danger');
                return;
            }
            
            const reviewPayload = {
                productId: id,
                customerId: customerId,
                efficiencyRating: reviewForm.efficiencyRating,
                priceRating: reviewForm.priceRating,
                deliveryRating: reviewForm.deliveryRating,
                additionalNotes: reviewForm.additionalNotes
            };
            
            const response = await fetch(`${BaseUrl}/customer/submit-product-review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify(reviewPayload)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Handle error response
                const errorMessage = data.message || data.error || t('pages.detail-page.section3.evaluationForm.submitFailed');
                showAlert(errorMessage, 'danger');
                return;
            }
            
            // Check if the response indicates success
            if (data.success === false || data.message?.includes('already reviewed')) {
                showAlert(data.message || t('pages.detail-page.section3.evaluationForm.alreadyReviewed'), 'warning');
                return;
            }
            
            showAlert(t('pages.detail-page.section3.evaluationForm.reviewSubmitted'), 'success');
            
            // Reset form only on successful submission
            setReviewForm({
                rating: 0,
                efficiencyRating: 0,
                priceRating: 0,
                deliveryRating: 0,
                additionalNotes: ''
            });
            
            // Refresh reviews
            fetchProductReviews();
            
        } catch (error) {
            console.error('Error submitting review:', error);
            showAlert(error?.message || t('pages.detail-page.section3.evaluationForm.submitFailed'),'danger');
        } finally {
            setSubmittingReview(false);
        }
    };

    useEffect(() => {
        fetchProduct();
        fetchProductReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

    // Check if scroll arrow should be shown
    useEffect(() => {
        const checkScrollArrow = () => {
            if (thumbnailContainerRef.current) {
                const container = thumbnailContainerRef.current;
                setShowScrollArrow(container.scrollHeight > container.clientHeight);
            }
        };

        checkScrollArrow();
        window.addEventListener('resize', checkScrollArrow);
        return () => window.removeEventListener('resize', checkScrollArrow);
    }, [product.images]);

    // Update product data when language changes
    useEffect(() => {
        setProduct(prevProduct => ({
            ...prevProduct,
            title: t('pages.detail-page.section1.productTitle'),
            company: t('pages.detail-page.section1.companyName'),
            description: t('pages.detail-page.section2.description'),
            features: [
                t('pages.detail-page.section2.features.ledTechnology'),
                t('pages.detail-page.section2.features.dimmableFunction'),
                t('pages.detail-page.section2.features.modernDesign'),
                t('pages.detail-page.section2.features.easyInstallation'),
                t('pages.detail-page.section2.features.warranty'),
                t('pages.detail-page.section2.features.multipleFinishes')
            ],
            specifications: {
                [t('pages.detail-page.section2.specifications.power')]: "15W LED",
                [t('pages.detail-page.section2.specifications.colorTemperature')]: t('pages.detail-page.section2.specifications.colorTempValue'),
                [t('pages.detail-page.section2.specifications.material')]: t('pages.detail-page.section2.specifications.materialValue'),
                [t('pages.detail-page.section2.specifications.dimensions')]: "60cm x 60cm x 15cm",
                [t('pages.detail-page.section2.specifications.voltage')]: "220-240V",
                [t('pages.detail-page.section2.specifications.certification')]: "CE, RoHS compliant"
            }
        }));
    }, [i18n.language, t]);

 
    const handleQuantityChange = (newQuantity) => {
        // Prevent going below 1
        if (newQuantity < 1) {
            setQuantity(1);
            return;
        }
        
        // Check if trying to exceed stock quantity
        if (newQuantity > products?.stockQuantity) {
            showAlert(t('pages.detail-page.section3.evaluationForm.onlyItemsAvailable', { quantity: products?.stockQuantity }), 'warning');
            return;
        }
        
        // Check if stock is 0
        if (products?.stockQuantity === 0) {
            showAlert(t('pages.detail-page.section3.evaluationForm.thisProductOutOfStock'), 'warning');
            return;
        }
        
        setQuantity(newQuantity);
    };
      

    const handleAddToCart = () => {
        try {
            if (!products) return;
            
            // Create cart item with all necessary data
            const cartItem = { 
                ...products, 
                quantity,
                selectedImageIndex,
                liked: isProductLiked,
                addedAt: new Date().toISOString(), // Add timestamp for cart persistence
                // Add any other state you want to preserve
            };
            
            // Use CartContext to add item (this automatically saves to localStorage)
            addToCart(cartItem, quantity);
            
            // Show success message
            showAlert(t('pages.detail-page.section1.addedToCart'), 'success');
            
            // Navigate to payment after a short delay to show the success message
            setTimeout(() => {
                navigate('/payment');
            }, 1000);
        } catch (e) {
            console.error('Error adding to cart:', e);
            showAlert(t('pages.detail-page.section1.addToCartError'), 'error');
        }
    };

    const handleBuyNow = () => {
        // Navigate to checkout
        navigate('/checkout');
    };

    // Handle review form input changes
    const handleReviewFormChange = (field, value) => {
        setReviewForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle rating selection
    const handleRatingSelect = (rating) => {
        setReviewForm(prev => ({
            ...prev,
            rating: rating
        }));
    };

    const handleThumbnailClick = (index) => {
        setSelectedImageIndex(index);
    };

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    const handleScrollDown = () => {
        if (thumbnailContainerRef.current) {
            if (isMobile) {
                thumbnailContainerRef.current.scrollBy({
                    left: isRTL ? -100 : 100,
                    behavior: 'smooth'
                });
            } else {
                thumbnailContainerRef.current.scrollBy({
                    top: 100,
                    behavior: 'smooth'
                });
            }
        }
    };

    const handleScrollUp = () => {
        if (thumbnailContainerRef.current) {
            if (isMobile) {
                thumbnailContainerRef.current.scrollBy({
                    left: isRTL ? 100 : -100,
                    behavior: 'smooth'
                });
            } else {
                thumbnailContainerRef.current.scrollBy({
                    top: -100,
                    behavior: 'smooth'
                });
            }
        }
    };

    return (
        <div className="product-detail-page" dir={direction}>
            <div>
                <img className='side-pattern' src={SidePattern} alt=""/>
            </div>
            <div className="container">
                {/* Breadcrumb */}
                <div className="breadcrumb-section mb-4">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <a href="/" onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/');
                                }}>
                                    {t('pages.detail-page.breadcrumb.home')}
                                </a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
  {i18n.language === "ar" ? products?.name_ar : products?.name_en}
</li>
                        </ol>
                    </nav>
                </div>

                <div className="row">
                    {/* Product Images */}
                    <div className="col-lg-6 mb-4">
                        <div className="product-images">
                            <div className="main-image">
                                <img
                                    src={products?.images[selectedImageIndex]}
                                    alt={product.title}
                                    className="img-fluid"
                                />
                            </div>
                            <div className="thumbnail-container">
                                <div className="thumbnail-images" ref={thumbnailContainerRef}>
                                    {products?.images.map((image, index) => (
                                        <div
                                            key={index}
                                            className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                                            onClick={() => handleThumbnailClick(index)}
                                        >
                                            <img src={image} alt={`${products.title} ${index + 1}`}/>
                                        </div>
                                    ))}
                                </div>
                                {(showScrollArrow || isMobile) && (
                                    <div className="scroll-arrows">
                                        <button
                                            className="scroll-arrow scroll-up"
                                            onClick={handleScrollUp}
                                            aria-label={t('pages.detail-page.section1.scrollUp')}
                                        >
                                            <FontAwesomeIcon icon={isMobile ? (isRTL ? faChevronRight : faChevronLeft) : faChevronUp}/>
                                        </button>
                                        <button
                                            className="scroll-arrow scroll-down"
                                            onClick={handleScrollDown}
                                            aria-label={t('pages.detail-page.section1.scrollDown')}
                                        >
                                            <FontAwesomeIcon icon={isMobile ? (isRTL ? faChevronLeft : faChevronRight) : faChevronDown}/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="col-lg-6">
                        <div className="product-info">
                            <div className='d-flex justify-content-between align-items-center mb-4'>
                                <h1 className="product-title fw-bold">
                                    
                                {i18n.language === "ar" ? products?.name_ar : products?.name_en}


                                </h1>
                                <div className="favorite-section">
                                <button
  className={`btn favorite-btn d-flex align-items-center justify-content-center`}
  onClick={handleToggleLike}
  disabled={false}
  title={
    isProductLiked
      ? t('pages.detail-page.section1.removeFromFavorites')
      : t('pages.detail-page.section1.addToFavorites')
  }
>
  <FontAwesomeIcon
    icon={isProductLiked ? solidHeart : regularHeart}
    className={`heart-icon ${isProductLiked ? 'liked' : ''}`}
    style={{ color: isProductLiked ? 'red' : 'inherit' }} // ✅ only heart turns red
  />
  <span className="">
  {isProductLiked
            ? t('Favourite')
            : t('Unfavourite')}
            </span>
</button>
                                    {!localStorage.getItem('token') && (
                                        <small className="text-muted d-block mt-1">
                                            {t('pages.detail-page.section1.loginToLike')}
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className='d-flex align-items-center justify-content-between flex-wrap-reverse'>
                                <div>
                                {products?.ratings?.average && products?.ratings?.average > 0 ? (
                                    <div className="rating-section mb-3">
                                        <div className="stars">
                                            {[...Array(5)].map((_, index) => (
                                                <FontAwesomeIcon
                                                    key={index}
                                                    icon={faStar}
                                                    className={
                                                        index < Math.floor(products?.ratings?.average || 0)
                                                            ? "star-filled"
                                                            : "star-empty"
                                                    }
                                                />
                                            ))}
                                        </div>
                                        <span className="rating-text">
                                            {products?.ratings?.average}
                                        </span>
                                    </div>
                                ) : products?.averageRating && products?.averageRating > 0 ? (
                                    <div className="rating-section mb-3">
                                        <div className="stars">
                                            {[...Array(5)].map((_, index) => (
                                                <FontAwesomeIcon
                                                    key={index}
                                                    icon={faStar}
                                                    className={
                                                        index < Math.floor(products?.averageRating || 0)
                                                            ? "star-filled"
                                                            : "star-empty"
                                                    }
                                                />
                                            ))}
                                        </div>
                                        <span className="rating-text">
                                            {products?.averageRating}
                                        </span>
                                    </div>
                                ) : null}
                                    <div className='d-flex align-items-center gap-2 mb-3'>
                                        <span className="reviews-text">{products?.ratings?.totalReviews || products?.totalReviews || 0} {t('pages.detail-page.section1.reviews')}</span>
                                        <span style={{color: '#CBD5E1'}}> |</span>
                                        <span className="sales-text">{products?.totalUnitsSold} {t('pages.detail-page.section1.sold')}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="price-section mb-4">
                                        <h6 className="price">{products?.price} {t('pages.detail-page.section1.currency')}</h6>
                                    </div>
                                </div>
                            </div>

                            <div className="description-summary mb-4">
                                <p>{products?.description}</p>
                            </div>
                            
                            {/* Stock Status */}
                            <div className="stock-status mb-3">
                                {products?.stockQuantity === 0 ? (
                                    <span className="text-danger fw-bold">
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        {t('pages.detail-page.section3.evaluationForm.outOfStock')}
                                    </span>
                                ) : products?.stockQuantity <= products?.lowStockAlert ? (
                                    <span className="text-warning fw-bold">
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        {t('pages.detail-page.section3.evaluationForm.onlyLeftInStock', { quantity: products?.stockQuantity })}
                                    </span>
                                ) : (
                                    <span className="text-success fw-bold">
                                        <i className="fas fa-check-circle me-2"></i>
                                        {t('pages.detail-page.section3.evaluationForm.inStock', { quantity: products?.stockQuantity })}
                                    </span>
                                )}
                            </div>
                            <div className='d-flex align-items-center gap-2'>
                                <div className="quantity-section mb-4">
                                    <div className="quantity-controls">
                                        <button
                                            className="quantity-btn pt-2 d-flex align-items-center justify-content-center"
                                            onClick={() => handleQuantityChange(quantity - 1)}
                                            disabled={quantity <= 1} // prevent going below 1
                                        >
                                            -
                                        </button>
                                        <span className="quantity-display pt-2">{quantity.toString().padStart(2, '0')}</span>
                                        <button
                                            className="quantity-btn pt-2 d-flex align-items-center justify-content-center"
                                            onClick={() => handleQuantityChange(quantity + 1)}
                                            disabled={products?.stockQuantity === 0 || quantity >= products?.stockQuantity}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="action-buttons flex-grow-1 mb-4">
                                    <button 
                                        className="btn add-to-cart-btn d-flex align-items-center justify-content-center" 
                                        onClick={handleAddToCart}
                                        disabled={products?.stockQuantity === 0}
                                    >
                                        <img src={CartIcon} alt=""/>
                                        <span className="">
                                        {products?.stockQuantity === 0 ? t('pages.detail-page.section3.evaluationForm.outOfStock') : t('pages.detail-page.section1.addToCart')}
                                        </span>
                                      
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="tabs-section mt-5">
                    <div className="tabs-header">
                        <button
                            className={`tab-btn d-flex align-items-center justify-content-center ${activeTab === 'description' ? 'active' : ''}`}
                            onClick={() => setActiveTab('description')}
                        >
                            {t('pages.detail-page.section3.tabs.description')}
                        </button>
                        <button
                            className={`tab-btn d-flex align-items-center justify-content-center ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            {t('pages.detail-page.section3.tabs.reviews')}
                        </button>
                        <button
                            className={`tab-btn d-flex align-items-center justify-content-center ${activeTab === 'evaluation' ? 'active' : ''}`}
                            onClick={() => setActiveTab('evaluation')}
                        >
                            {t('pages.detail-page.section3.tabs.evaluation')}
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'description' && (
                            <div className="description-content">
                                <p>{products?.description}</p>
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="reviews-content">
                                {loadingReviews ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border" role="status">
                                            <span className="visually-hidden">Loading reviews...</span>
                                        </div>
                                    </div>
                                ) : reviewsError ? (
                                    <div className="alert alert-danger" role="alert">
                                        {reviewsError}
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-muted">{t('pages.detail-page.section3.evaluationForm.noReviewsYet', 'No reviews yet. Be the first to review this product!')}</p>
                                    </div>
                                ) : (
                                    <div>
                                        {reviews.map((review, index) => (
                                            <div key={review._id || index} className='mb-5'>
                                                <div className='d-flex align-items-center gap-3 mb-3'>
                                                    {review.customerId?.pic ? (
                                                        <img 
                                                            src={review.customerId.pic} 
                                                            alt={review.customerId?.name || 'Customer'}
                                                            style={{width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover'}}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div 
                                                        className="customer-avatar"
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '50%',
                                                            backgroundColor: '#21395D',
                                                            color: 'white',
                                                            display: review.customerId?.pic ? 'none' : 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '14px',
                                                            fontWeight: 'bold',
                                                            textTransform: 'uppercase'
                                                        }}
                                                    >
                                                        {review.customerId?.name ? 
                                                            review.customerId.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 
                                                            'U'
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className='pb-1'>
                                                            {review.customerId?.name || t('pages.detail-page.section3.evaluationForm.anonymous')}
                                                        </p>
                                                        <p>
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {/* Overall Rating */}
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">{t('pages.detail-page.section3.evaluationForm.overallRating')}:</label>
                                                    <div className="stars">
                                                        {[...Array(5)].map((_, starIndex) => {
                                                            // Calculate average rating from the three individual ratings
                                                            const averageRating = Math.round((review.efficiencyRating + review.priceRating + review.deliveryRating) / 3);
                                                            return (
                                                                <FontAwesomeIcon
                                                                    key={starIndex}
                                                                    icon={faStar}
                                                                    className={starIndex < averageRating ? "star-filled" : "star-empty"}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Individual Ratings */}
                                                <div className="row mb-3">
                                                    <div className="col-md-4">
                                                        <label className="form-label">{t('pages.detail-page.section3.evaluationForm.efficiencyRating')}:</label>
                                                        <div className="stars">
                                                            {[...Array(5)].map((_, starIndex) => (
                                                                <FontAwesomeIcon
                                                                    key={starIndex}
                                                                    icon={faStar}
                                                                    className={starIndex < (review.efficiencyRating || 0) ? "star-filled" : "star-empty"}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label">{t('pages.detail-page.section3.evaluationForm.priceRating')}:</label>
                                                        <div className="stars">
                                                            {[...Array(5)].map((_, starIndex) => (
                                                                <FontAwesomeIcon
                                                                    key={starIndex}
                                                                    icon={faStar}
                                                                    className={starIndex < (review.priceRating || 0) ? "star-filled" : "star-empty"}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label">{t('pages.detail-page.section3.evaluationForm.deliveryRating')}:</label>
                                                        <div className="stars">
                                                            {[...Array(5)].map((_, starIndex) => (
                                                                <FontAwesomeIcon
                                                                    key={starIndex}
                                                                    icon={faStar}
                                                                    className={starIndex < (review.deliveryRating || 0) ? "star-filled" : "star-empty"}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Additional Notes/Comment */}
                                                {review.additionalNotes && (
                                                    <div>
                                                        <h5 className='pb-2 fw-bold'>
                                                            {t('pages.detail-page.section3.evaluationForm.message')}:
                                                        </h5>
                                                        <p>
                                                            {review.additionalNotes}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Approval Status */}
                                                {/* <div className="mt-2">
                                                    <span className={`badge ${review.approvalStatus === 'approved' ? 'bg-success' : review.approvalStatus === 'pending' ? 'bg-warning' : 'bg-danger'}`}>
                                                        {review.approvalStatus === 'approved' ? t('pages.detail-page.section3.evaluationForm.approved') : 
                                                         review.approvalStatus === 'pending' ? t('pages.detail-page.section3.evaluationForm.pending') : 
                                                         t('pages.detail-page.section3.evaluationForm.rejected')}
                                                    </span>
                                                </div> */}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'evaluation' && (
                            <div className="evaluation-content">
                                <div className='evaluation-form'>
                                    <form onSubmit={submitProductReview}>
                                        <div className='my-4'>
                                            <div className="row">
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">{t('pages.detail-page.section3.evaluationForm.overallRating')} <small className="text-muted">({t('common.optional', 'Optional')})</small></label>
                                                    <div className="stars">
                                                        {[...Array(5)].map((_, index) => (
                                                            <FontAwesomeIcon
                                                                key={index}
                                                                icon={faStar}
                                                                className={index < reviewForm.rating ? "star-filled" : "star-empty"}
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => handleRatingSelect(index + 1)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">{t('pages.detail-page.section3.evaluationForm.efficiencyRating')}</label>
                                                    <div className="stars">
                                                        {[...Array(5)].map((_, index) => (
                                                            <FontAwesomeIcon
                                                                key={index}
                                                                icon={faStar}
                                                                className={index < reviewForm.efficiencyRating ? "star-filled" : "star-empty"}
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => handleReviewFormChange('efficiencyRating', index + 1)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">{t('pages.detail-page.section3.evaluationForm.priceRating')}</label>
                                                    <div className="stars">
                                                        {[...Array(5)].map((_, index) => (
                                                            <FontAwesomeIcon
                                                                key={index}
                                                                icon={faStar}
                                                                className={index < reviewForm.priceRating ? "star-filled" : "star-empty"}
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => handleReviewFormChange('priceRating', index + 1)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">{t('pages.detail-page.section3.evaluationForm.deliveryRating')}</label>
                                                    <div className="stars">
                                                        {[...Array(5)].map((_, index) => (
                                                            <FontAwesomeIcon
                                                                key={index}
                                                                icon={faStar}
                                                                className={index < reviewForm.deliveryRating ? "star-filled" : "star-empty"}
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => handleReviewFormChange('deliveryRating', index + 1)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="additionalNotes" className='form-label'>{t('pages.detail-page.section3.evaluationForm.message')}</label>
                                            <textarea 
                                                name="additionalNotes" 
                                                id="additionalNotes" 
                                                rows="5"
                                                className="form-control" 
                                                placeholder={t('pages.detail-page.section3.evaluationForm.messagePlaceholder')}
                                                value={reviewForm.additionalNotes}
                                                onChange={(e) => handleReviewFormChange('additionalNotes', e.target.value)}
                                                title={t('pages.detail-page.section3.evaluationForm.messagePlaceholder')}
                                            />
                                        </div>
                                        <div className='mt-4'>
                                            <button 
                                                type='submit' 
                                                className='btn ev-submit-btn pt-3 d-flex align-items-center justify-content-center'
                                                disabled={submittingReview}
                                            >
                                                {submittingReview ? t('pages.detail-page.section3.evaluationForm.submitting') : t('pages.detail-page.section3.evaluationForm.send')} 
                                                <img 
                                                    src={ArrowRight} 
                                                    className='pb-2'
                                                    alt=""
                                                    style={{ 
                                                        transform: i18n.dir() === 'rtl' ? 'none' : 'scaleX(-1)'
                                                    }}
                                                />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;