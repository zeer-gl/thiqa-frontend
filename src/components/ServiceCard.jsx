import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useAlert } from '../context/AlertContext';
import { BaseUrl } from '../assets/BaseUrl';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../css/components/service-card.scss";
import { FaHeart, FaRegHeart, FaChevronDown, FaChevronUp } from "react-icons/fa"; // Solid and Regular heart
import ContactCustomerForm from './ContactCustomerForm';
import ProjectPriceRequests from './ProjectPriceRequests';

const ServiceCard = ({ 
    title, 
    subtitle,
    searchPlaceholder
}) => {
    const { t } = useTranslation();
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const [liked, setLiked] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [expandedCards, setExpandedCards] = useState({});
    const [showContactForm, setShowContactForm] = useState(false);
    const [showProjectRequests, setShowProjectRequests] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submittingProposal, setSubmittingProposal] = useState(null);
    const [acceptingProposal, setAcceptingProposal] = useState(null);

    // Fetch demand quotes from API
    const fetchDemandQuotes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token-sp');
            
            if (!token) {
                showAlert(t('serviceCard.errors.loginRequired'), 'error');
                return;
            }

            const response = await fetch(`${BaseUrl}/professional/demand-quotes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch demand quotes');
            }

            const data = await response.json();
            console.log('Demand quotes API response:', data);
            
            if (data.data && Array.isArray(data.data)) {
                // Map API data to component structure
                const mappedProjects = data.data.map((quote) => ({
                    id: quote._id,
                    clientName: quote.customerId?.name || 'Unknown Client',
                    projectName: quote.projectName || 'Untitled Project',
                    status: quote.status === 'in progress' ? 'inProgress' : quote.status || 'open',
                    date: new Date(quote.dateOfRequest).toLocaleDateString('en-GB'),
                    description: quote.description || 'No description available',
                    clientImage: quote.customerId?.pic || null,
                    address: quote.address,
                    area: quote.area,
                    price: quote.price,
                    typeOfProject: quote.typeOfProject?.name,
                    projectDesign: quote.projectDesign,
                    isAccepted: quote.isAccepted,
                    acceptedByType: quote.acceptedByType,
                    proposals: quote.proposals || [],
                    originalData: quote // Keep original data for reference
                }));
                
                setProjects(mappedProjects);
            }
        } catch (error) {
            console.error('Error fetching demand quotes:', error);
            showAlert(t('serviceCard.errors.loadFailed'), 'error');
        } finally {
            setLoading(false);
        }
    };

    // Load demand quotes on component mount
    useEffect(() => {
        fetchDemandQuotes();
    }, []);

    const toggleLike = () => {
        setLiked(!liked);
    };

    const handleFilterClick = (filter) => {
        setSelectedFilter(filter);
    };

    // Filter projects based on selected filter
    const filteredProjects = projects.filter(project => {
        const matchesFilter = selectedFilter === 'all' || project.status === selectedFilter;
        return matchesFilter;
    });

    const toggleExpansion = (cardId) => {
        setExpandedCards(prev => ({
            ...prev,
            [cardId]: !prev[cardId]
        }));
    };

    const handleContactCustomer = (project) => {
        setSelectedProject(project);
        setShowContactForm(true);
    };

    const handleStartProject = async (project) => {
        try {
            setSubmittingProposal(project.id);
            
            console.log('=== SUBMIT PROPOSAL DEBUG ===');
            console.log('Project:', project);
            console.log('Project ID (demandId):', project.id);
            
            // Get professional authentication data
            const professionalToken = localStorage.getItem('token-sp');
            const professionalData = localStorage.getItem('spUserData');
            const userRole = localStorage.getItem('userRole');
            
            console.log('=== PROFESSIONAL AUTHENTICATION CHECK ===');
            console.log('User Role:', userRole);
            console.log('Professional Token:', !!professionalToken);
            console.log('Professional Data:', !!professionalData);
            
            // Validate professional authentication
            if (!professionalToken || !professionalData) {
                showAlert(t('serviceCard.errors.professionalAuthRequired'), 'error');
                return;
            }
            
            if (userRole !== 'sp') {
                showAlert(t('serviceCard.errors.accessDeniedSP', { role: userRole }), 'error');
                return;
            }
            
            const professional = JSON.parse(professionalData);
            console.log('Professional ID:', professional._id);
            
            // Validate required parameters
            if (!project.id) {
                showAlert(t('serviceCard.errors.projectIdMissing'), 'error');
                return;
            }
            
            if (!professional._id) {
                showAlert(t('serviceCard.errors.professionalIdMissing'), 'error');
                return;
            }
            
            console.log('=== SENDING API REQUEST ===');
            console.log('Timestamp:', new Date().toISOString());
            console.log('Demand ID:', project.id);
            console.log('Professional ID:', professional._id);
            
            const response = await fetch(`${BaseUrl}/professional/start-project`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${professionalToken}`,
                },
                body: JSON.stringify({
                    demandId: project.id,
                    professionalId: professional._id
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API Error Response:', errorData);
                
                // Handle specific errors
                if (errorData.message?.includes('not authorized')) {
                    showAlert(t('serviceCard.errors.unauthorizedSubmit'), 'error');
                } else if (errorData.message?.includes('not found')) {
                    showAlert(t('serviceCard.errors.projectNotFound'), 'error');
                } else if (errorData.message?.includes('already submitted')) {
                    showAlert(t('serviceCard.errors.alreadySubmitted'), 'warning');
                } else {
                    showAlert(errorData?.message || t('serviceCard.errors.submitFailed'), 'error');
                }
                return;
            }

            const data = await response.json();
            console.log('✅ Proposal submitted successfully:', data);
            
            // Show success message
            showAlert(t('serviceCard.success.proposalSubmitted'), 'success');
            
            // Refresh the project list to show updated status
            fetchDemandQuotes();
            
        } catch (error) {
            console.error('❌ Error submitting proposal:', error);
            showAlert(error.message || t('serviceCard.errors.submitFailed'), 'error');
        } finally {
            setSubmittingProposal(null);
        }
    };


    const handleDownloadProjectFile = (project) => {
        try {
            // Check if project has a design file
            if (project.projectDesign && project.projectDesign.trim() !== '') {
                // Create a temporary link element to trigger download
                const link = document.createElement('a');
                link.href = project.projectDesign;
                link.download = `project-${project.projectName || 'design'}-${project.id}.pdf`;
                link.target = '_blank';
                
                // Append to body, click, and remove
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showAlert(t('common.success'), 'success');
            } else {
                showAlert(t('common.notAvailable'), 'warning');
            }
        } catch (error) {
            console.error('Error downloading project file:', error);
            showAlert(t('serviceCard.errors.downloadFailed'), 'error');
        }
    };

    const handleBackToServiceCard = () => {
        setShowContactForm(false);
        setShowProjectRequests(false);
        setSelectedProject(null);
    };

    const handleRefresh = () => {
        fetchDemandQuotes();
    };

    const handleAcceptProposal = async (project) => {
        try {
            setAcceptingProposal(project.id);
            
            console.log('=== ACCEPT PROPOSAL DEBUG ===');
            console.log('Project:', project);
            console.log('Project ID:', project.id);
            console.log('Original Data:', project.originalData);
            console.log('Proposals:', project.proposals);
            
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
                showAlert(t('serviceCard.errors.customerAuthRequired'), 'error');
                return;
            }
            
            if (userRole !== 'user') {
                showAlert(t('serviceCard.errors.accessDeniedCustomer', { role: userRole }), 'error');
                return;
            }
            
            const customer = JSON.parse(customerData);
            console.log('Customer ID:', customer._id);
            
            // Get demandId from original data (this is the demand quote ID)
            const demandId = project.originalData?._id || project.id;
            
            // Determine if this is a professional or vendor project
            let professionalId = null;
            let vendorId = null;
            
            if (project.proposals && project.proposals.length > 0) {
                const firstProposal = project.proposals[0];
                
                // Check if it's a professional proposal
                if (firstProposal.professionalId) {
                    professionalId = firstProposal.professionalId._id || firstProposal.professionalId;
                    if (typeof professionalId === 'object' && professionalId._id) {
                        professionalId = professionalId._id;
                    }
                }
                
                // Check if it's a vendor proposal
                if (firstProposal.vendorId) {
                    vendorId = firstProposal.vendorId._id || firstProposal.vendorId;
                    if (typeof vendorId === 'object' && vendorId._id) {
                        vendorId = vendorId._id;
                    }
                }
            }
            
            console.log('=== EXTRACTED PARAMETERS ===');
            console.log('Demand ID:', demandId);
            console.log('Professional ID:', professionalId);
            console.log('Vendor ID:', vendorId);
            console.log('Project Type:', professionalId ? 'Professional' : vendorId ? 'Vendor' : 'Unknown');
            
            // Validate required parameters
            if (!demandId) {
                showAlert(t('serviceCard.errors.demandIdMissing'), 'error');
                return;
            }
            
            if (!professionalId && !vendorId) {
                showAlert(t('serviceCard.errors.noProposalsFound'), 'error');
                return;
            }
            
            // Ensure we don't send both (API requirement)
            if (professionalId && vendorId) {
                showAlert(t('serviceCard.errors.multipleProposalTypes'), 'error');
                return;
            }
            
            // Prepare request body based on proposal type
            const requestBody = {
                demandId: demandId,
                action: "accept"
            };
            
            // Add either professionalId OR vendorId (not both)
            if (professionalId) {
                requestBody.professionalId = professionalId;
            } else if (vendorId) {
                requestBody.vendorId = vendorId;
            }
            
            console.log('=== SENDING API REQUEST ===');
            console.log('Timestamp:', new Date().toISOString());
            console.log('Request Body:', requestBody);
            console.log('Demand ID:', demandId);
            console.log('Professional ID:', professionalId);
            console.log('Vendor ID:', vendorId);
            console.log('Action: accept');
            
            const response = await fetch(`${BaseUrl}/customer/acceptReject-proposal`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${customerToken}`,
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API Error Response:', errorData);
                
                // Handle specific errors
                if (errorData.message?.includes('not authorized')) {
                    showAlert(t('serviceCard.errors.unauthorizedAccept'), 'error');
                } else if (errorData.message?.includes('not found')) {
                    showAlert(t('serviceCard.errors.proposalNotFound'), 'error');
                } else if (errorData.message?.includes('already accepted')) {
                    showAlert(t('serviceCard.errors.alreadyAccepted'), 'warning');
                } else if (errorData.message?.includes('Demand ID, action, and either Professional ID or Vendor ID are required')) {
                    showAlert(t('serviceCard.errors.missingParameters'), 'error');
                } else if (errorData.message?.includes('but not both')) {
                    showAlert(t('serviceCard.errors.invalidProposalData'), 'error');
                } else {
                    showAlert(errorData?.message || t('serviceCard.errors.acceptFailed'), 'error');
                }
                return;
            }

            const data = await response.json();
            console.log('✅ Proposal accepted successfully:', data);
            
            // Show success message
            showAlert(t('serviceCard.success.proposalAccepted'), 'success');
            
            // Refresh the project list to show updated status
            fetchDemandQuotes();
            
        } catch (error) {
            console.error('❌ Error accepting proposal:', error);
            showAlert(error.message || t('serviceCard.errors.acceptFailed'), 'error');
        } finally {
            setAcceptingProposal(null);
        }
    };

    const handleViewQuote = () => {
        console.log('=== VIEW QUOTE REDIRECT ===');
        console.log('Redirecting to:', '/request-quote/list');
        navigate('/request-quote/list');
    };

    return (
        <>
            {!showContactForm && !showProjectRequests ? (
                <div className="service-card">
      <div className="main-container">
        <div className="service-card-content">
            <div className="service-card-header">
                <div className="service-card-header-left">
                    <p className="service-card-header-left-title">{t('serviceCard.title', 'Project Price requests')}</p>
                    <p className="service-card-header-left-subtitle">{t('serviceCard.subtitle', 'Application customer project price requests')}</p>
                </div>
                <div className="service-card-header-right">
                    <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={handleRefresh}
                        disabled={loading}
                        title="Refresh project requests"
                    >
                        <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                    </button>
                </div>
            </div>
        </div>
      <div className="service-card-content-bottom">
      <button 
                         className={`filter-tag ${selectedFilter === 'all' ? 'active' : ''}`}
                         onClick={() => handleFilterClick('all')}
                     >
                         <div className="status-dot all"></div>
                         {t('serviceCard.buttons.allProjects')}
                     </button>
      <button 
                         className={`filter-tag ${selectedFilter === 'open' ? 'active' : ''}`}
                         onClick={() => handleFilterClick('open')}
                     >
                         <div className="status-dot open"></div>
                         {t('projectPriceRequest.status.open', 'مفتوح')}
                     </button>
                     <button 
                         className={`filter-tag ${selectedFilter === 'inProgress' ? 'active' : ''}`}
                         onClick={() => handleFilterClick('inProgress')}
                     >
                         <div className="status-dot in-progress"></div>
                         {t('projectPriceRequest.status.inProgress', 'في طور الإنجاز')}
                     </button>
      </div>
      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">{t('common.loading', 'Loading...')}</span>
          </div>
          <p className="mt-3">{t('serviceCard.loadingProjectRequests', 'Loading project requests...')}</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        /* Map through filtered projects - keeping your exact design */
        filteredProjects.map((project) => (
        <div key={project.id}>
          <div className="main-profile" onClick={() => toggleExpansion(project.id)} style={{cursor: 'pointer'}}>
                        <div className="image-container">
                          <div style={{width: '50px', height: '50px'}}>
                            {project.clientImage && project.clientImage.trim() !== '' ? (
                              <img 
                                src={project.clientImage} 
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
                                display: project.clientImage && project.clientImage.trim() !== '' ? 'none' : 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '18px',
                                fontWeight: 'bold'
                              }}
                            >
                              {project.clientName ? project.clientName.charAt(0).toUpperCase() : 'U'}
                            </div>
                          </div>
                            <div className="content-image">
                                <p className="ar-heading-bold">{project.clientName}</p>
                                <p className="ar-subheading-bold">{project.projectName}</p>
                            </div>

                        </div>
                        <div className="content-container">
                        <button 
                             className={`filter-tag ${project.status === 'open' ? 'active' : ''}`}
                         >
                             <div className={`status-dot ${project.status}`}></div>
                             {project.status === 'open' ? t('projectPriceRequest.status.open', 'مفتوح') : 
                              project.status === 'inProgress' ? t('projectPriceRequest.status.inProgress', 'في طور الإنجاز') : 
                              project.status}
                         </button>
                         
                      
                         
                         {/* Accordion Arrow */}
                         <div className="accordion-arrow">
                             {expandedCards[project.id] ? <FaChevronUp /> : <FaChevronDown />}
                         </div>
                        </div>
                    </div>
          {/* Accordion Content */}
          {expandedCards[project.id] && (
            <>
              <div className="card-detail">
                <p className="card-detail-heading">{t('projectDetails.title', 'Project Details')}</p>
                <p className="card-detail-subheading">
                  <b>{t('projectDetails.description', 'Description')}:</b> {project.description}
                </p>
                <p className="card-detail-subheading">
                  <b>{t('projectDetails.address', 'Address')}:</b> {project.address}
                </p>
                <p className="card-detail-subheading">
                  <b>{t('projectDetails.projectType', 'Project Type')}:</b> {project.typeOfProject}
                </p>
                <p className="card-detail-subheading">
                  <b>{t('projectDetails.budget', 'Budget')}:</b> {project.price} KWD
                </p>
                {project.isAccepted && (
                  <p className="card-detail-subheading text-success">
                    <b>{t('projectDetails.status', 'Status')}:</b> {t('projectDetails.acceptedBy', 'Accepted by')} {project.acceptedByType}
                  </p>
                )}
              </div>
              <div className="button-container">
                {project.status === 'open' ? (
                  <>
                    {/* Submit Proposal button is hidden when status is open */}
                    <button className="btn-secondary" onClick={() => handleContactCustomer(project)}>
                      {t('serviceCard.buttons.priceQuote')}
                    </button>
                  
                 
                  </>
                ) : project.status === 'inProgress' ? (
                  <>
                    <button className="btn-primary" onClick={() => handleDownloadProjectFile(project)}>
                      {t('serviceCard.buttons.projectCompletionFile')}
                    </button>
                    {/* Price Quote button is hidden when status is inProgress */}
                  </>
                ) : (
                  <>
                    <button className="btn-primary" onClick={() => handleDownloadProjectFile(project)}>
                      {t('serviceCard.buttons.projectCompletionFile')}
                    </button>
                    <button className="btn-secondary" onClick={() => handleContactCustomer(project)}>
                      {t('serviceCard.buttons.priceQuote')}
                    </button>
                 
                  </>
                )}
              </div>
            </>
          )}
        </div>
      ))
      ) : (
        <div className="text-center py-5">
          <div className="empty-projects">
            <i className="fas fa-folder-open fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">No project requests found</h5>
            <p className="text-muted">
              No project requests available at the moment
            </p>
          </div>
        </div>
      )}
      </div>
      </div>
            ) : showContactForm ? (
                <ContactCustomerForm 
                    project={selectedProject} 
                    onBack={handleBackToServiceCard}
                    formType="contactCustomer"
                />
            ) : (
                <ProjectPriceRequests 
                    onBack={handleBackToServiceCard}
                    selectedProject={selectedProject}
                />
            )}
        </>
    );
};

export default ServiceCard;
