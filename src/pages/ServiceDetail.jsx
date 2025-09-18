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
                });
            } catch (e) {
                setError(e?.message || 'Unable to load professional');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProfessional();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);



    const handleFavoriteClick = async () => {
        try {
            await toggleProfessionalLike(id);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleRequestService = () => {
        if (!id) return;
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
                                                <i className="fas fa-map-marker-alt"></i>
                                                <span>{contractor.location}</span>

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
  className={`btn-favorite-contractor ${isCurrentProfessionalLiked ? 'liked' : ''}`} 
  onClick={handleFavoriteClick}
>
  <i className={isCurrentProfessionalLiked ? 'fas fa-heart' : 'far fa-heart'}></i>
  <span className={`${i18n.language === 'ar' ? 'me-2' : 'ms-2'}`}>
    {isCurrentProfessionalLiked ? t('Favourite') : t('Unfavourite')}
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

                            {/* Action Buttons */}
                            <div className="action-buttons">
                                <div className="row g-2">
                                    <div className="col-lg-5">
                                        <button className="btn btn-request-service w-100" onClick={handleRequestService}>
                                            {t('pages.service-detail.request-service')}
                                        </button>
                                    </div>
                                    {/* <div className="col-lg-7">
                                        <button className="btn btn-all-projects w-100">
                                            {t('pages.service-detail.all-projects')}
                                        </button>
                                    </div> */}
                                </div>
                            </div>
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
