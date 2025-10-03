import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import ProjectCard from '../components/ProjectCard';
import '../css/pages/service-detail.scss';
import '../css/components/breadcrumb.scss';
import ServiceDetailIllustration from '../assets/payment/modern-buildings-service-detail.svg';
import { BaseUrl } from '../assets/BaseUrl.jsx';
import Avatar from "@mui/material/Avatar";
import { useLikes } from '../context/LikesContext.jsx';

const ServiceDetail = () => {
    const { t, i18n } = useTranslation();
    const { likedProfessionals, toggleProfessionalLike } = useLikes();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [services, setServices] = useState([]);
    const [showAllServices, setShowAllServices] = useState(false);

    // Breadcrumb items
    const breadcrumbItems = [
        { label: 'pages.service-detail.home', path: '/' },
        { label: 'pages.service-detail.modern-ceiling-lamps', path: null }
    ];

    // Contractor data populated from API but matching existing UI fields
    const [contractor, setContractor] = useState({
        name: t('pages.service-detail.contractor-name'),
        rating: 0,
        location: t('pages.service-detail.location'),
        about: t('pages.service-detail.about-text'),
        avatar: 'A'
    });

    // Portfolio data from API
    const [portfolio, setPortfolio] = useState([]);

    // Check if current professional is liked
    const isCurrentProfessionalLiked = likedProfessionals[id] || false;

    // Fetch services for the professional
    const fetchServices = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await fetch(`${BaseUrl}/professional/${id}/services`);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message || `Failed to load services (${res.status})`);
            }
            const data = await res.json();
            // Check if services exist in the response
            if (data.services && Array.isArray(data.services)) {
                setServices(data.services);
                // Save to localStorage for auto-fill functionality
                localStorage.setItem('professionalServices', JSON.stringify(data.services));
            } else {
                throw new Error(data.message || 'No services found');
            }
        } catch (err) {
            console.error('Error fetching services:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchProfessional = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await fetch(`${BaseUrl}/professional/get-professsional/${id}`);
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err?.message || `Failed to load professional (${res.status})`);
                }
                const data = await res.json();
                const p = data?.professional || {};
                
                // Set portfolio data
                const portfolioData = p.portfolio || [];
                setPortfolio(portfolioData);
                
                setContractor({
                    name: p.name || t('pages.service-detail.contractor-name'),
                    rating: typeof p.averageRating === 'number' ? p.averageRating : 0,
                    location: p.specialization || t('pages.service-detail.location'),
                    about: p.bio,
                    avatar: (p.name || 'A').charAt(0),
                    pic: p.pic ,
                    image:p.image,
                    specializations: p.specializations || []
                });

                // Save professional data and specializations to localStorage
                localStorage.setItem('professionalData', JSON.stringify(p));
                if (p.specializations && p.specializations.length > 0) {
                    localStorage.setItem('firstSpecialization', JSON.stringify(p.specializations[0]));
                }
            } catch (e) {
                setError(e?.message || 'Unable to load professional');
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchProfessional();
            fetchServices();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);



    const handleFavoriteClick = async () => {
        try {
            await toggleProfessionalLike(id);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleRequestService = (selectedService = null) => {
        if (!id) return;
        if (selectedService) {
            // Save selected service to localStorage for auto-fill
            localStorage.setItem('selectedService', JSON.stringify(selectedService));
        }
        
        navigate(`/request-quote/create?professionalId=${id}`);
    };

    return (
        <div className="service-detail-page">
            <div className="container">
                {/* Breadcrumb */}
                <div className="row mb-4">
                    <div className="col-12">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                </div>

                {/* Main Content */}
                <div className="row">
                    {/* Left Panel - Hero Image */}
                    <div className="col-lg-4">
                        <div className="hero-section-detail">
                            <div className="hero-image">
                            {contractor.pic || contractor.image ? (
  <img
    src={contractor.pic || contractor.image}
    alt={t('pages.service-detail.modern-ceiling-lamps')}
    className="provider-image"
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = ServiceDetailIllustration;
    }}
  />
) : (
  <Avatar
    alt={contractor.name || "Provider"}
    className="provider-image"
    sx={{
      width: "100%",
      height: "30vh !important",
      objectFit: "cover",
      borderRadius: "0 !important", // 🔹 removes circle shape
    }}
  >
    {contractor.name?.[0]?.toUpperCase() || "P"}
  </Avatar>
)}

                            </div>
                        </div>
                    </div>
                    {/* Right Panel - Contractor Information */}
                    <div className="col-lg-8">
                        <div className="contractor-profile-card">
                            {/* Profile Header */}
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="profile-header">
                                        <div className='profile-header-content'>
                                            <div className="avatar-container">
                                                <h2 className="contractor-name fw-bold">{contractor.name}</h2>
                                            </div>

                                            {/* Location */}
                                            <div className="location">
                                                <i className="fas fa-map-marker-alt pb-1"></i>
                                                <span className=''>{contractor.location}</span>

                                            </div>
                                        </div>

                                        {/* Rating Section */}
                                        <div className="rating-section">
                                            <span className="rating-value">{contractor.rating}</span>
                                            <div className="stars">
                                                {[...Array(5)].map((_, index) => (
                                                    <i
                                                        key={index}
                                                        className="fas fa-star"
                                                        style={{
                                                            color:
                                                                index < Math.round(Number(contractor.rating) || 0)
                                                                    ? '#F59E0B'
                                                                    : '#CBD5E1'
                                                        }}
                                                    ></i>
                                                ))}
                                            </div>
                                        </div>



                                    </div>
                                </div>
                                <div className={`col-lg-6 ${i18n.language === 'ar' ? 'text-start' : 'text-end'}`}>
                                    <div>
                                    <button 
  className={`btn-favorite-contractor d-flex align-items-center justify-content-center ${isCurrentProfessionalLiked ? 'liked' : ''}`} 
  onClick={handleFavoriteClick}
>
  <i className={isCurrentProfessionalLiked ? 'fas fa-heart' : 'far fa-heart'}></i>
  <span className={`${i18n.language === 'ar' ? 'me-2' : 'ms-2'}`}>
    {isCurrentProfessionalLiked ? t('Unfavourite') :  t('Favourite')}
  </span>
</button>

                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="about-section-detail">
                                        <p className="about-text">{contractor.about || t('common.notAvailable', 'N/A')}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>


                </div>

                {/* Services Section */}
                <div className="row mt-5 mb-5">
                    <div className="col-12">
                        <div className="services-section">
                            <h2 className="section-title mb-4 fw-bold">
                                {t('pages.service-detail.my-services', 'My Services')}
                            </h2>

                            {services.length > 0 ? (
                                <>
                                    <div className="services-grid">
                                        {(showAllServices ? services : services.slice(0, 6)).map((service, index) => (
                                            <div key={service._id || index} className="service-card">
                                                <div className="service-image">
                                                    <img 
                                                        src={service.image} 
                                                        alt={i18n.language === 'ar' ? service.nameAr : service.nameEn}
                                                        loading="eager"
                                                    />
                                                </div>
                                                <div className="service-content">
                                                    <h4 className="service-name">
                                                        {i18n.language === 'ar' ? service.nameAr : service.nameEn}
                                                    </h4>
                                                    <div className="service-price">
                                                        KWD {service.price} / {service.unit}
                                                    </div>
                                                    <div className="service-delivery">
                                                        {t('pages.service-detail.delivery-time', 'Delivery Time')}: {service.deliveryTime}
                                                    </div>
                                                    <button 
                                                        className="btn btn-request-service w-100 mt-2 d-flex align-items-center justify-content-center"
                                                        onClick={() => handleRequestService(service)}
                                                    >
                                                        <span>
                                                        {t('pages.service-detail.request-service')}
                                                        </span>
                                                      
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {services.length > 6 && (
                                        <div className="text-center mt-4 d-flex justify-content-center align-items-center" >
                                            <button 
                                                className="btn d-flex p-2 align-items-center justify-content-center rounded-pill"
                                                onClick={() => setShowAllServices(!showAllServices)}
                                                style={{backgroundColor: '#21395D', color: 'white'}}
                                            >
                                                <span>
                                                {showAllServices 
                                                    ? t('pages.service-detail.see-less', 'See Less')
                                                    : t('pages.service-detail.see-more', 'See More')
                                                }
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-5">
                                    <div className="mb-3">
                                        <i className="fas fa-tools" style={{ fontSize: '48px', color: '#ccc' }}></i>
                                    </div>
                                    <h5 className="text-muted">{t('pages.service-detail.no-services', 'No Services Found')}</h5>
                                    <p className="text-muted">{t('pages.service-detail.no-services-description', 'This professional has not added any services yet.')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Completed Projects */}
                <div className="row mt-5 mb-5">
                    <div className="col-12">
                        <div className="projects-section">
                            <h2 className="section-title mb-4 fw-bold">
                                {t('pages.service-detail.completed-projects')}
                            </h2>

                            {portfolio.length > 0 ? (
                                <div className="projects-grid">
                                    {portfolio.map((project, index) => (
                                        <ProjectCard key={project._id || index} project={project} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted">{t('pages.service-detail.no-completed-projects', 'No completed projects available')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetail;
