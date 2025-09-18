import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../context/AlertContext';
import { BaseUrl } from '../assets/BaseUrl';
import axios from 'axios';
import '../css/components/project-price-requests.scss';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import WebAssetIcon from '@mui/icons-material/WebAsset';

const ProjectPriceRequests = ({ onBack, selectedProject }) => {
    const { t, i18n } = useTranslation();
    const { showAlert } = useAlert();
    const [selectedFilter, setSelectedFilter] = useState('open');
    const [expandedCards, setExpandedCards] = useState({});
    const [projectDetails, setProjectDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch project details by ID
    const fetchProjectDetails = async (projectId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token-sp');
            
            if (!token) {
                showAlert('Please login to view project details', 'error');
                return;
            }

            const response = await axios.get(`${BaseUrl}/professional/getProjectById/${projectId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data && response.data.success) {
                setProjectDetails(response.data.data);
            } else {
                showAlert('Failed to load project details', 'error');
            }
        } catch (error) {
            console.error('Error fetching project details:', error);
            showAlert('Failed to load project details', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Load project details when component mounts or selectedProject changes
    useEffect(() => {
        if (selectedProject && selectedProject.id) {
            fetchProjectDetails(selectedProject.id);
        }
    }, [selectedProject]);

    // Sample project data (fallback)
    const projects = [
        {
            id: 1,
            clientName: t('projectPriceRequest.projects.project1.clientName', 'Saad Al-Obaidi'),
            projectName: t('projectPriceRequest.projects.project1.projectName', 'Villa Construction Project'),
            status: "open",
            date: "12.08.2024",
            description: t('projectPriceRequest.projects.project1.description', 'Villa construction project'),
            clientImage: "/public/images/home/customer-profile.png"
        },
        {
            id: 2,
            clientName: t('projectPriceRequest.projects.project2.clientName', 'Ahmed Hassan'),
            projectName: t('projectPriceRequest.projects.project2.projectName', 'Office Building Project'),
            status: "inProgress",
            date: "15.08.2024",
            description: t('projectPriceRequest.projects.project2.description', 'Commercial office building construction'),
            clientImage: "/public/images/home/customer-profile.png"
        },
        {
            id: 3,
            clientName: t('projectPriceRequest.projects.project3.clientName', 'Fatima Al-Rashid'),
            projectName: t('projectPriceRequest.projects.project3.projectName', 'Residential Complex'),
            status: "open",
            date: "18.08.2024",
            description: t('projectPriceRequest.projects.project3.description', 'Multi-story residential complex'),
            clientImage: "/public/images/home/customer-profile.png"
        }
    ];
    const toggleExpansion = (cardId) => {
        setExpandedCards(prev => ({
            ...prev,
            [cardId]: !prev[cardId]
        }));
    };


    const handleFilterClick = (filter) => {
        setSelectedFilter(filter);
    };

    const handleViewPrice = (project) => {
        console.log('View price for project:', project);
        // Handle view price action
    };

    const handleDownloadDesign = (project) => {
        console.log('Download design for project:', project);
        // Handle download design action
    };

    // Use API data if available, otherwise fallback to sample data
    const currentProject = projectDetails || selectedProject || projects[0];

    return (
        <div className="project-price-requests" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="container">
                {/* Header Section */}
                <div className="header-section">
                    <div className="header-left">
                        <h1 className="main-title">{t('projectPriceRequest.title', 'طلبات أسعار المشاريع')}</h1>
                        <p className="subtitle">{t('projectPriceRequest.subtitle', 'طلبات أسعار المشاريع الخاصة بعملاء التطبيق')}</p>
                    </div>
                    <div className="header-right">
                        <div className="search-container">
                            <input 
                                type="text" 
                                placeholder={t('projectPriceRequest.searchPlaceholder', 'البحث...')}
                                className="search-input"
                                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                                style={{
                                    textAlign: i18n.language === 'ar' ? 'right' : 'left',
                                    direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
                                    backgroundColor: 'transparent',
                                    color: "#21395D",
                                    opacity: "50%"
                                }}
                            />
                            <SearchIcon 
                                className="search-icon"
                                style={{
                                    left: i18n.language === 'ar' ? '12px' : 'auto',
                                    right: i18n.language === 'ar' ? 'auto' : '12px'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="filter-section">
                    <button 
                        className={`filter-btn ${selectedFilter === 'open' ? 'active' : ''}`}
                      
                    >
                        <div className="status-dot open"></div>
                        {t('projectPriceRequest.status.open', 'مفتوح')}
                    </button>
                    <button 
                        className={`filter-btn ${selectedFilter === '' ? 'active' : ''}`}
                       
                    >
                        <div className="status-dot in-progress"></div>
                        {t('projectPriceRequest.status.inProgress', 'في طور الإنجاز')}
                    </button>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Loading project details...</p>
                    </div>
                ) : (
                    /* Project Details */
                    <div className="projects-list">
                    {currentProject && (
        <div key={currentProject.id || currentProject._id}>
          <div className="main-profile" onClick={() => toggleExpansion(currentProject.id || currentProject._id)} style={{cursor: 'pointer'}}>
                        <div className="image-container">
                          <div style={{width: '50px', height: '50px'}}>
                            {currentProject.clientImage || currentProject.customerId?.pic ? (
                              <img 
                                src={currentProject.clientImage || currentProject.customerId?.pic} 
                                alt="Customer Profile"
                                style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius:"50%"}}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className="default-avatar"
                              style={{
                                width: '100%', 
                                height: '100%', 
                                borderRadius: '50%',
                                backgroundColor: '#21395D',
                                display: (currentProject.clientImage || currentProject.customerId?.pic) ? 'none' : 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '18px',
                                fontWeight: 'bold'
                              }}
                            >
                              {(currentProject.clientName || currentProject.customerId?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                          </div>
                            <div className="content-image">
                                <p className="ar-heading-bold">{currentProject.clientName || currentProject.customerId?.name || 'Unknown Client'}</p>
                                <p className="ar-subheading-bold">{currentProject.projectName || 'Untitled Project'}</p>
                            </div>

                        </div>
                        <div className="content-container">
                         <button 
                             className={`filter-tag ${(currentProject.status || 'open') === 'open' ? '' : ''}`}
                      
                         >
                             <div className={`status-dot ${currentProject.status || 'open'}`}></div>
                             {(currentProject.status || 'open') === 'open' ? t('projectPriceRequest.status.open', 'مفتوح') : t('projectPriceRequest.status.completeConstruction', 'Complete Construction')}
                         </button>
                         <button 
                             className={`filter-tag ${selectedFilter === 'inProgress' ? 'active' : ''}`}
                         
                         >
                             <div className=" "></div>
                             {t('projectPriceRequest.status.completeConstruction', 'Complete Construction')}
                         </button>
                         {/* Accordion Arrow */}
                     
                        </div>
                    </div>
          {/* Accordion Content */}
          {expandedCards[currentProject.id || currentProject._id] && (
            <div className="expanded-content">
              {/* Location Section - One Line */}
              <div className="location-section">
                <div className="address-section">
                  <div className="address-label">
                    <LocationOnIcon className="address-icon" />
                    <span className="label-text">{t('projectPriceRequest.address', 'العنوان')}</span>
                  </div>
                  <p className="address-text">
                    {currentProject.address || t('projectPriceRequest.addressText', 'Da\'bal Al-Khuza\'i Street, Al-Jahra, Kuwait')}
                  </p>
                </div>
                
                <div className="area-section">
                  <div className="area-label">
                    <div className="area-icon">⧉</div>
                    <span className="label-text">{t('projectPriceRequest.area', 'المساحة')}</span>
                  </div>
                  <p className="area-text">
                    {currentProject.area ? `${currentProject.area} sq ft` : t('projectPriceRequest.areaText', 'Not specified')}
                  </p>
                </div>
              </div>

              {/* Bottom Section - Flex with justify-between */}
              <div className="bottom-section">
                <div className="action-buttons">
                  <button className="btn-view-price">
                    {t('projectPriceRequest.priceOffer', 'Price Offer')}
                  </button>
                  <button className="btn-download-design" onClick={() => handleDownloadDesign(currentProject)}>
                    {t('projectPriceRequest.downloadDesign', 'تحميل تصميم المشروع')}
                    <WebAssetIcon style={{color:'#21395D'}}/>
                  </button>
                </div>
                
                <div className="description-section">
                  <h4 className="description-title">{t('projectPriceRequest.description', 'وصف الطلب')}</h4>
                  <p className="description-text">
                    {currentProject.description || t('projectPriceRequest.descriptionText', 'Three-story villa construction project, construction phase. Three-story villa construction project, construction phase. Three-story villa construction project, construction phase. Three-story villa construction project, construction phase.')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
                </div>
                )}
            </div>
        </div>
    );
};

export default ProjectPriceRequests;
