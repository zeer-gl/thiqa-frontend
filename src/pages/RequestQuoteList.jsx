import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import '../css/pages/offers.scss';
import '../css/pages/request-quote-list.scss';
import '../css/components/pagination.scss';
import '../css/components/request-quote-accordion.scss';
import '../css/components/phone-modal.scss';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import BallPattern from '/public/images/home/ball-pattern.svg';
import ListIcon from '../assets/payment/list-icon.svg';
import AccIcon from "/public/images/accordian-icon.svg";
import { useEffect, useState } from 'react';
import { BaseUrl } from '../assets/BaseUrl.jsx';

const RequestQuoteList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState('all');
    const itemsPerPage = 8; // keep UI size; we'll request this from API

    const [quotes, setQuotes] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [expandedProject, setExpandedProject] = useState(null);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [selectedProfessional, setSelectedProfessional] = useState(null);
    const [acceptingProposal, setAcceptingProposal] = useState(null);
    const [acceptedProposals, setAcceptedProposals] = useState(new Set());

    const fetchQuotes = async (page, search = '') => {
        try {
            setLoading(true);
            setError('');
            // get customerId
            let customerId = null;
            try {
                const stored = localStorage.getItem('userData');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    customerId = parsed?._id || parsed?.id || null;
                }
                if (!customerId) customerId = localStorage.getItem('userId');
            } catch {}
            if (!customerId) throw new Error('User not found');

            // Build URL with search parameter
            let apiUrl = `${BaseUrl}/customer/get-demand-quote/${customerId}?page=${page}&limit=${itemsPerPage}`;
            if (search.trim()) {
                apiUrl += `&search=${encodeURIComponent(search.trim())}`;
            }

            const res = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message || `Failed to load quotes (${res.status})`);
            }
            const data = await res.json();
            console.log('API Response:', data); // Debug log
            let list = Array.isArray(data?.data) ? data.data : [];
            console.log('Quotes list before filtering:', list); // Debug log
            
            // Frontend filtering fallback if backend search doesn't work
            if (search.trim()) {
                const searchLower = search.toLowerCase().trim();
                list = list.filter(quote => {
                    const projectName = (quote.projectName || '').toLowerCase();
                    const description = (quote.description || '').toLowerCase();
                    const address = (quote.address || '').toLowerCase();
                    const typeOfProject = (quote.typeOfProject || '').toLowerCase();
                    
                    // Search in multiple fields
                    return projectName.includes(searchLower) || 
                           description.includes(searchLower) || 
                           address.includes(searchLower) ||
                           typeOfProject.includes(searchLower);
                });
                console.log('Quotes list after frontend filtering:', list); // Debug log
            }
            
            setQuotes(list);
            const tp = data?.pagination?.totalPages || 1;
            setTotalPages(tp);
        } catch (e) {
            setError(e?.message || 'Unable to load quotes');
            setQuotes([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    // Handle search with debouncing
    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setCurrentPage(1); // Reset to first page when searching
        
        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Set new timeout for debounced search
        const timeout = setTimeout(() => {
            fetchQuotes(1, query);
        }, 500); // 500ms delay
        
        setSearchTimeout(timeout);
    };

    useEffect(() => {
        fetchQuotes(currentPage, searchQuery);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchQuotes(page, searchQuery);
    };

    // Handle accordion toggle
    const handleToggleAccordion = (projectId) => {
        setExpandedProject(expandedProject === projectId ? null : projectId);
    };

    // Handle phone modal
    const handlePhoneClick = (professional) => {
        setSelectedProfessional(professional);
        setShowPhoneModal(true);
    };

    const closePhoneModal = () => {
        setShowPhoneModal(false);
        setSelectedProfessional(null);
    };

    const handleCall = (phoneNumber) => {
        window.open(`tel:${phoneNumber}`, '_self');
        closePhoneModal();
    };

    // Handle accepting a proposal
    const handleAcceptProposal = async (proposalId, project) => {
        try {
            setAcceptingProposal(proposalId);
            
            console.log('=== ACCEPT PROPOSAL DEBUG (RequestQuoteList) ===');
            console.log('Proposal ID:', proposalId);
            console.log('Project:', project);
            
            // Get customer authentication data
            const customerToken = localStorage.getItem('token');
            const customerData = localStorage.getItem('userData');
            const userRole = localStorage.getItem('userRole');
            
            console.log('=== CUSTOMER AUTHENTICATION CHECK ===');
            console.log('User Role:', userRole);
            console.log('Customer Token:', !!customerToken);
            console.log('Customer Data:', !!customerData);
            
            // Validate customer authentication
            if (!customerToken || !customerData) {
                alert('Customer authentication required. Please login as a customer.');
                return;
            }
            
            if (userRole !== 'user') {
                alert(`Access denied. Only customers can accept proposals. Current role: ${userRole}`);
                return;
            }
            
            const customer = JSON.parse(customerData);
            console.log('Customer ID:', customer._id);
            
            // Get demandId from project data
            const demandId = project._id || project.id;
            
            // Get professionalId from the proposal
            let professionalId = null;
            if (project.proposals && project.proposals.length > 0) {
                // Find the proposal with matching ID
                const targetProposal = project.proposals.find(p => (p._id || p.id) === proposalId);
                if (targetProposal) {
                    professionalId = targetProposal.professionalId?._id || targetProposal.professionalId;
                    
                    // If professionalId is an object, extract the _id
                    if (typeof professionalId === 'object' && professionalId._id) {
                        professionalId = professionalId._id;
                    }
                }
            }
            
            console.log('=== EXTRACTED PARAMETERS ===');
            console.log('Demand ID:', demandId);
            console.log('Professional ID:', professionalId);
            
            // Validate required parameters
            if (!demandId) {
                alert('Demand ID is missing');
                return;
            }
            
            if (!professionalId) {
                alert('Professional ID is missing. No valid proposal found.');
                return;
            }
            
            console.log('=== SENDING API REQUEST ===');
            console.log('Timestamp:', new Date().toISOString());
            console.log('Demand ID:', demandId);
            console.log('Professional ID:', professionalId);
            console.log('Action: accept');
            
            const response = await fetch(`${BaseUrl}/customer/acceptReject-proposal`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${customerToken}`,
                },
                body: JSON.stringify({
                    demandId: demandId,
                    professionalId: professionalId,
                    action: "accept"
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API Error Response:', errorData);
                
                // Handle specific errors
                if (errorData.message?.includes('not authorized')) {
                    alert('You are not authorized to accept this proposal.');
                } else if (errorData.message?.includes('not found')) {
                    alert('Proposal or project not found. Please refresh the page and try again.');
                } else if (errorData.message?.includes('already accepted')) {
                    alert('This proposal has already been accepted.');
                } else if (errorData.message?.includes('Demand ID, action, and either Professional ID or Vendor ID are required')) {
                    alert('Missing required parameters. Please ensure the project has valid proposals and try again.');
                } else if (errorData.message?.includes('but not both')) {
                    alert('Invalid proposal data. Please contact support.');
                } else {
                    alert(errorData?.message || `Failed to accept proposal (${response.status})`);
                }
                return;
            }

            const data = await response.json();
            console.log('✅ Proposal accepted successfully:', data);
            
            // Mark this proposal as accepted
            setAcceptedProposals(prev => new Set([...prev, proposalId]));
            
            // Show success message
            alert(t('project-offers.proposal-accepted') || 'Proposal accepted successfully!');
            
            // Refresh the quotes list to update the UI
            fetchQuotes(currentPage, searchQuery);
            
        } catch (error) {
            console.error('❌ Error accepting proposal:', error);
            alert(error.message || t('project-offers.accept-error') || 'Failed to accept proposal. Please try again.');
        } finally {
            setAcceptingProposal(null);
        }
    };

    // Helper function to render star rating
    const renderStarRating = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating || 0);
        const hasHalfStar = (rating || 0) % 1 !== 0;
        
        // Render full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <i key={i} className="fas fa-star" style={{ color: '#fbbf24' }}></i>
            );
        }
        
        // Render half star if needed
        if (hasHalfStar) {
            stars.push(
                <i key="half" className="fas fa-star-half-alt" style={{ color: '#fbbf24' }}></i>
            );
        }
        
        // Render empty stars
        const emptyStars = 5 - Math.ceil(rating || 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <i key={`empty-${i}`} className="far fa-star" style={{ color: '#d1d5db' }}></i>
            );
        }
        
        return stars;
    };

    // Handle escape key and body scroll lock
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closePhoneModal();
            }
        };

        if (showPhoneModal) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [showPhoneModal]);


    return (
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <PageHeader 
                        title={t('request-quote.page-title')}
                        subtitle={t('request-quote.your-special-price-offers')}
                        createButtonText={t('request-quote.create-new-quote-request')}
                        searchPlaceholder={t('request-quote.search')}
                        onCreateClick={() => navigate('/request-quote/create')}
                        onSearchChange={handleSearch}
                        createType="quote"
                        searchValue={searchQuery}
                    />
                </div>
            </div>

            <div className="rq-list">
                {loading && (
                    <div className="text-center py-4">{t('common.loading') || 'Loading...'}</div>
                )}
                {!loading && error && (
                    <div className="text-center py-4 text-danger">{error}</div>
                )}
                {!loading && !error && quotes.length === 0 && (
                    <div className="text-center py-4">
                    No Data Found
                    </div>
                 
                )}
                {!loading && !error && quotes.map((project) => (
                    <div key={project._id || project.id} className="rq-card">
                        <div className="rq-card-header">
                        <div className="rq-left">
                        <div className="rq-status">
                                <span className="rq-dot"></span>
                                <span className="rq-status-text">{t('request-quote.open')}</span>
                            </div>
                            <div className="rq-mini-icon">
                                <img src={ListIcon} alt="icon"
                                
                                className={`offers-button ${(project.proposals?.length || 0) === 0 ? 'disabled' : ''}`}
                                onClick={() => (project.proposals?.length || 0) > 0 && handleToggleAccordion(project._id || project.id)}
                                disabled={(project.proposals?.length || 0) === 0}/>
                            </div>
                           
                        </div>
                        <div className="rq-right">
                            <div className="rq-texts">
                                <h3 className="ar-heading-bold">{project.projectName || project.title}</h3>
                                <p>{project.description || project.subtitle}</p>
                            </div>
                            <div className="rq-actions">
                         
                                <div className="rq-side-icon">
                                    <img src={project?.projectDesign || BallPattern} alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Accordion Content - Updated to match the dark blue card design */}
                        {expandedProject === (project._id || project.id) && (
                            <div className="accordion-content">
                                <div className="offers-list">
                                    {project.proposals && project.proposals.length > 0 ? (
                                        project.proposals.map((offer, index) => (
                                            <div key={index} className="offer-item-dark">
                                                <div className="offer-content">
                                                    <div className="offer-info">
                                                        <h4 className="offer-title">{offer.professionalId?.name || t('project-offers.professional')}</h4>
                                                        <p className="offer-price">{t('project-offers.price')}: {offer.price} KWD</p>
                                                        <p className="offer-duration">{t('project-offers.duration')}: {new Date(offer.duration).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="offer-buttons">
                                                 
                                                    {!acceptedProposals.has(offer._id || offer.id) && (
                                                        <>
                                                        
                                                        {/* <button 
                                            className="btn-quote"
                                            onClick={() => navigate('/request-quote/create', { 
                                                state: { 
                                                    project: project, 
                                                    offer: offer 
                                                } 
                                            })}
                                        >
                                            <span>{t('project-offers.view-quote')}</span>
                                        </button> */}
                                        <button 
                                                            className="btn-accept"
                                                            onClick={() => handleAcceptProposal(offer._id || offer.id, project)}
                                                        disabled={acceptingProposal === (offer._id || offer.id)}
                                                    >
                                                        {acceptingProposal === (offer._id || offer.id) ? (
                                                            <>
                                                                <i className="fas fa-spinner fa-spin"></i>
                                                                {t('project-offers.accepting') || 'Accepting...'}
                                                            </>
                                                        ) : (
                                                            t('project-offers.accept') || 'Accept'
                                                        )}
                                                    </button>
                                                    
                                                        
                                                        </>
                                                
                                                    )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        // Default offers when no offers data is provided
                                        <>
                                            <div className="offer-item-dark">
                                                <div className="offer-content">
                                                    <div className="offer-info">
                                                        <h4 className="offer-title">{t('pages.serviceRequestView.company')}</h4>
                                                        <p className="offer-price">{t('project-offers.price')}: 0 KWD</p>
                                                        <p className="offer-duration">{t('project-offers.duration')}: N/A</p>
                                                    </div>
                                                    <div className="offer-buttons">
                                                    <button 
                                                            className="btn-view-quote"
                                                        onClick={() => navigate('/request-quote/list', { 
                                                            state: { 
                                                                project: project, 
                                                                offer: null 
                                                            } 
                                                        })}
                                                    >
                                                            {t('project-offers.view-quote')}
                                                    </button>
                                                    <button 
                                                            className="btn-accept"
                                                        onClick={() => {
                                                            alert(t('project-offers.noPhoneNumber', 'No phone number available'));
                                                        }}
                                                    >
                                                        {t('project-offers.call')}
                                                    </button>
                                                </div>
                                            </div>
                                            </div>
                                            <div className="offer-item-dark">
                                                <div className="offer-content">
                                                    <div className="offer-info">
                                                        <h4 className="offer-title">{t('pages.serviceRequestView.company')}</h4>
                                                        <p className="offer-price">{t('project-offers.price')}: 0 KWD</p>
                                                        <p className="offer-duration">{t('project-offers.duration')}: N/A</p>
                                                    </div>
                                                    <div className="offer-buttons">
                                                    <button 
                                                            className="btn-view-quote"
                                                        onClick={() => navigate('/request-quote/list', { 
                                                            state: { 
                                                                project: project, 
                                                                offer: null 
                                                            } 
                                                        })}
                                                    >
                                                            {t('project-offers.view-quote')}
                                                    </button>
                                                    <button 
                                                            className="btn-accept"
                                                        onClick={() => {
                                                            alert(t('project-offers.noPhoneNumber', 'No phone number available'));
                                                        }}
                                                    >
                                                        {t('project-offers.call')}
                                                    </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

            {/* Beautiful Phone Number Modal */}
            {showPhoneModal && selectedProfessional && (
                <div className="phone-modal-overlay" onClick={closePhoneModal}>
                    <div className="phone-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="phone-modal-content">
                            <div className="phone-modal-header">
                                <div className="professional-avatar">
                                    <div className="avatar-circle">
                                        {selectedProfessional.name ? selectedProfessional.name.charAt(0).toUpperCase() : 'P'}
                                    </div>
                                </div>
                                <h3 className="professional-name">{selectedProfessional.name || t('project-offers.professional')}</h3>
                                <p className="professional-title">{t('project-offers.contact-professional')}</p>
                            </div>
                            
                            <div className="phone-modal-body">
                                <div className="phone-display">
                                    <div className="phone-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.271 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59531 1.99522 8.06679 2.16708 8.43376 2.48353C8.80073 2.79999 9.03996 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <div className="phone-number">
                                        <span className="phone-label">{t('project-offers.phone-number')}</span>
                                        <span className="phone-value">{selectedProfessional.phoneNo || t('project-offers.no-phone')}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="phone-modal-footer">
                                <button 
                                    className="btn btn-cancel" 
                                    onClick={closePhoneModal}
                                >
                                    {t('common.cancel')}
                                </button>
                                {selectedProfessional.phoneNo && (
                                    <button 
                                        className="btn btn-call" 
                                        onClick={() => handleCall(selectedProfessional.phoneNo)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.271 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59531 1.99522 8.06679 2.16708 8.43376 2.48353C8.80073 2.79999 9.03996 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        {t('project-offers.call-now')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>

            <div className="row my-4">
                <div className="col-12">
                    <div className="pagination-section">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestQuoteList;


