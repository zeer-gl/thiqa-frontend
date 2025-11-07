// CACHE BUST: Updated to fix professional ID extraction - v2.0
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AccIcon from "/public/images/accordian-icon.svg";
import { BaseUrl } from '../assets/BaseUrl.jsx';
import { useAlert } from '../context/AlertContext';
import { notifyServiceProviderOfferAccepted } from '../utils/notificationService';
import ProjectCompletionDetailsModal from './ProjectCompletionDetailsModal';
import '../css/components/phone-modal.scss';

const ServiceProjectCard = ({ project, isExpanded, onToggle, offers, onProposalAccepted, acceptedProposals = new Set() }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [selectedProfessional, setSelectedProfessional] = useState(null);
    const [acceptingProposal, setAcceptingProposal] = useState(null);
    const [decliningProposal, setDecliningProposal] = useState(null);
    const [showCompletionDetails, setShowCompletionDetails] = useState(false);
    const [selectedCompletionData, setSelectedCompletionData] = useState(null);
    const isAwaitingPayment = project.status === 'awaiting_payment';

    console.log('🔍 Project:____', project);
    // Handle phone button click
    const handlePhoneClick = (professional) => {
        setSelectedProfessional(professional);
        setShowPhoneModal(true);
    };

    // Close phone modal
    const closePhoneModal = () => {
        setShowPhoneModal(false);
        setSelectedProfessional(null);
    };

    // Check if project has completion status
    const getCompletionData = (project) => {
        console.log('🔍 getCompletionData called with project:', project);
        console.log('🔍 Project status:', project.status);
        console.log('🔍 Project statusHistory:', project.statusHistory);
        
        // First check if project status is completed
        if (project.status === 'completed'|| project.status === 'awaiting_payment') {
            console.log('✅ Project status is completed');
            // If project status is completed, look for completion data in statusHistory
            if (project.statusHistory && Array.isArray(project.statusHistory)) {
                const completionEntry = project.statusHistory
                .filter(entry => entry.status === 'completed') // get all completed entries
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
                console.log('🔍 Found completion entry:', completionEntry);
                return completionEntry || null;
            } else {
                console.log('❌ No statusHistory found or not an array');
            }
        } else {
            console.log('❌ Project status is not completed:', project.status);
        }
        return null;
    };

    // Handle viewing completion details
    const handleViewCompletionDetails = (project) => {
        console.log('🔍 handleViewCompletionDetails called with project:', project);
        const completionData = getCompletionData(project);
        console.log('🔍 Retrieved completion data:', completionData);
        
        if (completionData) {
            console.log('✅ Setting completion data and showing modal');
            setSelectedCompletionData(completionData);
            setShowCompletionDetails(true);
        } else {
            console.log('❌ No completion data found - cannot show modal');
            showAlert('No completion details available for this project', 'warning');
        }
    };

    // Close completion details modal
    const closeCompletionDetails = () => {
        setShowCompletionDetails(false);
        setSelectedCompletionData(null);
    };

    // Handle phone call
    const handleCall = (phoneNumber) => {
        window.open(`tel:${phoneNumber}`, '_self');
        closePhoneModal();
    };

    // Handle accepting a proposal (supports professionalId or vendorId)
    const handleAcceptProposal = async (proposalId, participantIds) => {
        try {
            setAcceptingProposal(proposalId);
            
            console.log('=== ACCEPTING PROPOSAL ===');
            console.log('Proposal ID:', proposalId);
            console.log('Participant IDs (raw):', participantIds);
            console.log('Project ID:', project.id);
            
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
                throw new Error('Customer authentication required. Please login as a customer.');
            }
            
            if (userRole !== 'user' && userRole !== 'customer') {
                throw new Error(`Access denied. Only customers can accept proposals. Current role: ${userRole}`);
            }
            
            const customer = JSON.parse(customerData);
            console.log('Customer ID:', customer._id);
            
            // Validate required parameters
            if (!project.id) {
                throw new Error('Project ID (demandId) is missing');
            }
            
            // Extract professionalId/vendorId from participantIds
            let finalProfessionalId = null;
            let finalVendorId = null;
            
            if (participantIds && typeof participantIds === 'object') {
                const rawProfessional = participantIds.professionalId;
                const rawVendor = participantIds.vendorId;
                
                if (rawProfessional) {
                    finalProfessionalId = typeof rawProfessional === 'object' && rawProfessional._id ? rawProfessional._id : rawProfessional;
                }
                if (rawVendor) {
                    finalVendorId = typeof rawVendor === 'object' && rawVendor._id ? rawVendor._id : rawVendor;
                }
            } else if (typeof participantIds === 'string') {
                // Fallback: if a single string was provided, assume it's a professionalId
                finalProfessionalId = participantIds;
            }
            
            console.log('Professional ID (final):', finalProfessionalId);
            console.log('Vendor ID (final):', finalVendorId);
            
            // Validate we have at least one id
            if (!finalProfessionalId && !finalVendorId) {
                throw new Error('Missing participant ID. Either Professional ID or Vendor ID is required.');
            }
            
            console.log('=== SENDING API REQUEST (UPDATED VERSION) ===');
            console.log('Timestamp:', new Date().toISOString());
            console.log('Demand ID (Project ID):', project.id);
            console.log('Professional ID (final):', finalProfessionalId);
            console.log('Vendor ID (final):', finalVendorId);
            console.log('Action: accept');
            console.log('Customer ID:', customer._id);
            
            const payload = {
                demandId: project.id,
                action: "accept"
            };
            if (finalProfessionalId) payload.professionalId = finalProfessionalId;
            if (finalVendorId) payload.vendorId = finalVendorId;

            const response = await fetch(`${BaseUrl}/customer/acceptReject-proposal`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${customerToken}`,
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API Error Response:', errorData);
                
                // Handle specific authorization errors
                if (errorData.message?.includes('not authorized')) {
                    throw new Error('You are not authorized to accept this proposal. Please ensure you are the customer who created this project and the proposal is valid.');
                } else if (errorData.message?.includes('Demand ID, action, and either Professional ID or Vendor ID are required')) {
                    throw new Error('Missing required information. Please refresh the page and try again.');
                } else if (errorData.message?.includes('not found')) {
                    throw new Error('Proposal or project not found. Please refresh the page and try again.');
                } else if (errorData.message?.includes('already accepted') || errorData.message?.includes('already rejected')) {
                    throw new Error('This proposal has already been processed.');
                } else if (errorData.message?.includes('Professional ID or Vendor ID are required')) {
                    throw new Error('Professional information is missing. Please refresh the page and try again.');
                } else {
                    throw new Error(errorData?.message || `Failed to accept proposal (${response.status})`);
                }
            }

            const data = await response.json();
            console.log('✅ Proposal accepted successfully:', data);
            
            // Show success message using showAlert
            showAlert(t('project-offers.proposal-accepted') || 'Proposal accepted successfully!', 'success');
            
            // Send notification to service provider (only for professional submissions)
            try {
                if (finalProfessionalId) {
                    const customer = JSON.parse(localStorage.getItem('userData'));
                    const projectTitle = project.title || project.projectName || 'Project';
                    
                    console.log('📧 Sending notification to service provider...');
                    await notifyServiceProviderOfferAccepted(
                        finalProfessionalId,
                        customer._id,
                        project.id,
                        projectTitle,
                        'en' // Default to English for now
                    );
                    console.log('✅ Notification sent to service provider');
                }
            } catch (notificationError) {
                console.error('⚠️ Failed to send notification to service provider:', notificationError);
                // Don't show error to user - notification failure shouldn't break the main flow
            }
            
            // Call the callback to update parent state with the proposal ID and project ID
            if (onProposalAccepted) {
                onProposalAccepted(proposalId, project.id);
            }
            
            // Stay on current page - no navigation needed
            
        } catch (error) {
            console.error('❌ Error accepting proposal:', error);
            showAlert(error.message || t('project-offers.accept-error') || 'Failed to accept proposal. Please try again.', 'error');
        } finally {
            setAcceptingProposal(null);
        }
    };

    // Handle declining a proposal (supports professionalId or vendorId)
    const handleDeclineProposal = async (proposalId, participantIds) => {
        try {
            setDecliningProposal(proposalId);
            
            console.log('=== DECLINING PROPOSAL ===');
            console.log('Proposal ID:', proposalId);
            console.log('Participant IDs (raw):', participantIds);
            console.log('Project ID:', project.id);
            
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
                throw new Error('Customer authentication required. Please login as a customer.');
            }
            
            if (userRole !== 'user' && userRole !== 'customer') {
                throw new Error(`Access denied. Only customers can decline proposals. Current role: ${userRole}`);
            }
            
            const customer = JSON.parse(customerData);
            console.log('Customer ID:', customer._id);
            
            // Validate required parameters
            if (!project.id) {
                throw new Error('Project ID (demandId) is missing');
            }
            
            // Extract professionalId/vendorId from participantIds
            let finalProfessionalId = null;
            let finalVendorId = null;
            
            if (participantIds && typeof participantIds === 'object') {
                const rawProfessional = participantIds.professionalId;
                const rawVendor = participantIds.vendorId;
                
                if (rawProfessional) {
                    finalProfessionalId = typeof rawProfessional === 'object' && rawProfessional._id ? rawProfessional._id : rawProfessional;
                }
                if (rawVendor) {
                    finalVendorId = typeof rawVendor === 'object' && rawVendor._id ? rawVendor._id : rawVendor;
                }
            } else if (typeof participantIds === 'string') {
                // Fallback: if a single string was provided, assume it's a professionalId
                finalProfessionalId = participantIds;
            }
            
            console.log('Professional ID (final):', finalProfessionalId);
            console.log('Vendor ID (final):', finalVendorId);
            
            // Validate we have at least one id
            if (!finalProfessionalId && !finalVendorId) {
                throw new Error('Missing participant ID. Either Professional ID or Vendor ID is required.');
            }
            
            console.log('=== SENDING DECLINE API REQUEST ===');
            console.log('Timestamp:', new Date().toISOString());
            console.log('Demand ID (Project ID):', project.id);
            console.log('Professional ID (final):', finalProfessionalId);
            console.log('Vendor ID (final):', finalVendorId);
            console.log('Action: reject');
            console.log('Customer ID:', customer._id);
            
            const payload = {
                demandId: project.id,
                action: "reject"
            };
            if (finalProfessionalId) payload.professionalId = finalProfessionalId;
            if (finalVendorId) payload.vendorId = finalVendorId;

            const response = await fetch(`${BaseUrl}/customer/acceptReject-proposal`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${customerToken}`,
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API Error Response:', errorData);
                
                // Handle specific authorization errors
                if (errorData.message?.includes('not authorized')) {
                    throw new Error('You are not authorized to decline this proposal. Please ensure you are the customer who created this project and the proposal is valid.');
                } else if (errorData.message?.includes('Demand ID, action, and either Professional ID or Vendor ID are required')) {
                    throw new Error('Missing required information. Please refresh the page and try again.');
                } else if (errorData.message?.includes('not found')) {
                    throw new Error('Proposal or project not found. Please refresh the page and try again.');
                } else if (errorData.message?.includes('already accepted') || errorData.message?.includes('already rejected')) {
                    throw new Error('This proposal has already been processed.');
                } else {
                    throw new Error(errorData?.message || `Failed to decline proposal (${response.status})`);
                }
            }

            const data = await response.json();
            console.log('✅ Proposal declined successfully:', data);
            
            // Show success message using showAlert
            showAlert(t('project-offers.proposal-declined') || 'Proposal declined successfully!', 'success');
            
            // Call the callback to update parent state with the proposal ID and project ID
            if (onProposalAccepted) {
                onProposalAccepted(proposalId, project.id);
            }
            
            // Stay on current page - no navigation needed
            
        } catch (error) {
            console.error('❌ Error declining proposal:', error);
            showAlert(error.message || t('project-offers.decline-error') || 'Failed to decline proposal. Please try again.', 'error');
        } finally {
            setDecliningProposal(null);
        }
    };

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && showPhoneModal) {
                closePhoneModal();
            }
        };

        if (showPhoneModal) {
            document.addEventListener('keydown', handleEscapeKey);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'unset';
        };
    }, [showPhoneModal]);

    return (
        <div className="service-project-card">
            <div className="project-info">
                <div className="project-details">
                    <div>
                        <h3 className="ar-heading-bold">{project.title}</h3>
                        <p>{project.description}</p>
                    </div>
                </div>
                <div className="project-actions">
                    <button
                        className={`offers-button pt-1 ${project.offers === 0 ? 'disabled' : ''}`}
                        onClick={() => project.offers > 0 && onToggle(project.id)}
                        disabled={project.offers === 0}
                    >
                        <span>{t('pages.serviceRequestView.offers', { count: project.offers })}</span>
                        <img src={AccIcon} alt=""/>
                    </button>
                </div>
            </div>

            {/* Accordion Content */}
            {isExpanded && (
                <div className="accordion-content">
                    <div className="offers-list">
                        {offers && offers.length > 0 ? (
                            offers.map((offer, index) => (
                                <div key={index} className="offer-item">
                                    <div className="offer-company">
                                        <div>
                                            <h4 className="ar-heading-bold">{offer.professionalData?.name || 'Vendor'}</h4>
                                            <p className="offer-price">{t('project-offers.price')}: {offer.price} KWD</p>
                                            <p className="offer-duration">{t('project-offers.duration')}: {new Date(offer.duration).toLocaleDateString()}</p>
                                            {offer.note && <p className="offer-note">{offer.note}</p>}
                                        </div>
                                    </div>
                                    <div className="offer-actions">
                                        {(() => {
                                            const isLocallyAccepted = acceptedProposals.has(offer._id || offer.id);
                                            const isApiAccepted = offer.isAccepted;
                                            const isApiRejected = offer.status === 'rejected';
                                            const isCompleted = project.status === 'completed';
                                            const isAwaitingPayment = project.status === 'awaiting_payment';
                                            const isPaid = project.status === 'paid';
                                            const completionData = getCompletionData(project);
                                            const shouldShowButtons = !isLocallyAccepted && !isApiAccepted && !isApiRejected && !isCompleted;
                                            
                                            console.log('🔍 Button Rendering Debug:', {
                                                proposalId: offer._id || offer.id,
                                                isLocallyAccepted,
                                                isApiAccepted,
                                                isApiRejected,
                                                isCompleted,
                                                shouldShowButtons,
                                                projectStatus: project.status,
                                                offerStatus: offer.status,
                                                offer: offer,
                                                completionData: completionData
                                            });
                                            
                                            // Show completion status if project is completed
                                            if (isPaid) {
                                
                                                
                                                return (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        <div className="offer-status approved" style={{
                                                            padding: '10px 20px',
                                                            backgroundColor: '#28a745',
                                                            color: 'white',
                                                            borderRadius: '5px',
                                                            fontWeight: 'bold',
                                                            textAlign: 'center'
                                                        }}>
                                                            <i className="fas fa-check-circle me-2"></i>
                                                            {t('project-offers.status-completed', 'Project Completed')}
                                                        </div>
                                                    
                                                    </div>
                                                );
                                            }
                                            // Show completion status if project is completed
                                            if (isAwaitingPayment) {
                                
                                                
                                                return (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        <div className="offer-status approved" style={{
                                                            padding: '10px 20px',
                                                            backgroundColor: '#28a745',
                                                            color: 'white',
                                                            borderRadius: '5px',
                                                            fontWeight: 'bold',
                                                            textAlign: 'center'
                                                        }}>
                                                            <i className="fas fa-check-circle me-2"></i>
                                                            {t('project-offers.status-approved', 'Project Approved')}
                                                        </div>
                                                        <button 
                                                            className="btn-call pt-2"
                                                            onClick={() => {
                                                                console.log('🔍 VIEW DETAILS AND PAYMENT CLICKED - Project:', project);
                                                                console.log('🔍 Completion Data:', completionData);
                                                                handleViewCompletionDetails(project);
                                                            }}
                                                            style={{ 
                                                                backgroundColor: '#21395D',
                                                                border: 'none',
                                                                minWidth: '150px',
                                                                color: 'white',
                                                                padding: '10px 15px',
                                                                borderRadius: '5px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <i className="fas fa-credit-card me-2"></i>
                                                            {t('project-offers.view-details-and-payment', 'View Details and Make Payment')}
                                                        </button>
                                                    </div>
                                                );
                                            }
                                            if (isCompleted) {
                                                console.log('🎯 SHOWING COMPLETION STATUS - Project:', project);
                                                console.log('🎯 Completion Data:', completionData);
                                                
                                                return (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        <div className="offer-status completed" style={{
                                                            padding: '10px 20px',
                                                            backgroundColor: '#17a2b8',
                                                            color: 'white',
                                                            borderRadius: '5px',
                                                            fontWeight: 'bold',
                                                            textAlign: 'center'
                                                        }}>
                                                            <i className="fas fa-check-circle me-2"></i>
                                                            {t('project-offers.status-completed', 'Project Completed')}
                                                        </div>
                                                        <button 
                                                            className="btn-call pt-2"
                                                            onClick={() => {
                                                                console.log('🔍 VIEW DETAILS CLICKED - Project:', project);
                                                                console.log('🔍 Completion Data:', completionData);
                                                                handleViewCompletionDetails(project);
                                                            }}
                                                            style={{ 
                                                                backgroundColor: '#21395D',
                                                                border: 'none',
                                                                minWidth: '150px',
                                                                color: 'white',
                                                                padding: '10px 15px',
                                                                borderRadius: '5px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <i className="fas fa-eye me-2"></i>
                                                            {t('project-offers.view-completion-details', 'View Completion Details')}
                                                        </button>
                                                    </div>
                                                );
                                            }
                                            
                                            // Show status text if accepted or rejected
                                            if (isApiAccepted || isLocallyAccepted) {
                                                return (
                                                    <div className="offer-status accepted" style={{
                                                        padding: '8px 14px',
                                                        backgroundColor: '#E8F5E9',
                                                        color: '#1E7E34',
                                                        border: '1px solid #1E7E34',
                                                        borderRadius: '9999px',
                                                        fontWeight: 600,
                                                        textAlign: 'center',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        boxShadow: '0 2px 6px rgba(30, 126, 52, 0.15)'
                                                    }}>
                                                        <i className="fas fa-check-circle"></i>
                                                        {t('project-offers.status-accepted')}
                                                    </div>
                                                );
                                            }
                                            
                                            if (isApiRejected) {
                                                return (
                                                    <div className="offer-status declined" style={{
                                                        padding: '8px 14px',
                                                        backgroundColor: '#FDECEA',
                                                        color: '#C2302A',
                                                        border: '1px solid #C2302A',
                                                        borderRadius: '9999px',
                                                        fontWeight: 600,
                                                        textAlign: 'center',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        boxShadow: '0 2px 6px rgba(194, 48, 42, 0.15)'
                                                    }}>
                                                        <i className="fas fa-times-circle"></i>
                                                        {t('project-offers.status-declined')}
                                                    </div>
                                                );
                                            }
                                            
                                            // Show both Accept and Decline buttons
                                            if (shouldShowButtons) {
                                                return (
                                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                        <button 
                                                            className="btn-call pt-2"
                                                            onClick={() => {
                                                                console.log('=== ACCEPT BUTTON CLICK DEBUG ===');
                                                                console.log('Timestamp:', new Date().toISOString());
                                                                console.log('Offer object:', offer);
                                                                console.log('Offer ID:', offer._id || offer.id);
                                                                console.log('Professional ID (raw):', offer.professionalId);
                                                                console.log('Vendor ID (raw):', offer.vendorId);
                                                                
                                                                // Prepare participant IDs to pass (support both professional and vendor)
                                                                const participantIds = {
                                                                    professionalId: (typeof offer.professionalId === 'object' && offer.professionalId?._id) ? offer.professionalId._id : offer.professionalId,
                                                                    vendorId: (typeof offer.vendorId === 'object' && offer.vendorId?._id) ? offer.vendorId._id : offer.vendorId,
                                                                };
                                                                console.log('✅ Participant IDs prepared for accept:', participantIds);
                                                                
                                                                handleAcceptProposal(offer._id || offer.id, participantIds);
                                                            }}
                                                            disabled={acceptingProposal === (offer._id || offer.id) || decliningProposal === (offer._id || offer.id)}
                                                            style={{ 
                                                                backgroundColor: acceptingProposal === (offer._id || offer.id) ? '#6c757d' : '#2E7D32',
                                                                color: '#FFFFFF',
                                                                border: 'none',
                                                                borderRadius: '9999px',
                                                                padding: '8px 18px',
                                                                minWidth: '120px',
                                                                boxShadow: '0 2px 6px rgba(46, 125, 50, 0.25)',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                fontWeight: 600,
                                                                cursor: 'pointer',
                                                                padding: '8px 14px',
                                                                backgroundColor: '#E8F5E9',
                                                                color: '#1E7E34',
                                                                border: '1px solid #1E7E34',
                                                                borderRadius: '9999px',
                                                                fontWeight: 600,
                                                                textAlign: 'center',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                boxShadow: '0 2px 6px rgba(30, 126, 52, 0.15)'
                                                            }}
                                                        >
                                                            {acceptingProposal === (offer._id || offer.id) ? (
                                                                <>
                                                                    <i className="fas fa-spinner fa-spin"></i>
                                                                    {t('project-offers.accepting') || 'Accepting...'}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="fas fa-check"></i>
                                                                    {t('project-offers.accept') || 'Accept'}
                                                                </>
                                                            )}
                                                        </button>
                                                        
                                                        <button 
                                                            className="btn-call pt-2"
                                                            onClick={() => {
                                                                console.log('=== DECLINE BUTTON CLICK DEBUG ===');
                                                                console.log('Timestamp:', new Date().toISOString());
                                                                console.log('Offer object:', offer);
                                                                console.log('Offer ID:', offer._id || offer.id);
                                                                console.log('Professional ID (raw):', offer.professionalId);
                                                                console.log('Vendor ID (raw):', offer.vendorId);
                                                                
                                                                // Prepare participant IDs to pass (support both professional and vendor)
                                                                const participantIds = {
                                                                    professionalId: (typeof offer.professionalId === 'object' && offer.professionalId?._id) ? offer.professionalId._id : offer.professionalId,
                                                                    vendorId: (typeof offer.vendorId === 'object' && offer.vendorId?._id) ? offer.vendorId._id : offer.vendorId,
                                                                };
                                                                console.log('✅ Participant IDs prepared for reject:', participantIds);
                                                                
                                                                handleDeclineProposal(offer._id || offer.id, participantIds);
                                                            }}
                                                            disabled={acceptingProposal === (offer._id || offer.id) || decliningProposal === (offer._id || offer.id)}
                                                            style={{ 
                                                                backgroundColor: decliningProposal === (offer._id || offer.id) ? '#6c757d' : '#D32F2F',
                                                                color: '#FFFFFF',
                                                                border: 'none',
                                                                borderRadius: '9999px',
                                                                padding: '8px 18px',
                                                                minWidth: '120px',
                                                                boxShadow: '0 2px 6px rgba(211, 47, 47, 0.25)',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                fontWeight: 600,
                                                                cursor: 'pointer',
                                                                padding: '8px 14px',
                                                                backgroundColor: '#FDECEA',
                                                                color: '#C2302A',
                                                                border: '1px solid #C2302A',
                                                                borderRadius: '9999px',
                                                                fontWeight: 600,
                                                                textAlign: 'center',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                boxShadow: '0 2px 6px rgba(194, 48, 42, 0.15)'
                                                            }}
                                                        >
                                                            {decliningProposal === (offer._id || offer.id) ? (
                                                                <>
                                                                    <i className="fas fa-spinner fa-spin"></i>
                                                                    {t('project-offers.declining') || 'Declining...'}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="fas fa-times"></i>
                                                                    {t('project-offers.decline') || 'Decline'}
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                );
                                            }
                                            
                                            return null;
                                        })()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Default offers when no offers data is provided
                            <>
                                <div className="offer-item">
                                    <div className="offer-company">
                                        <div>
                                            <h4 className="ar-heading-bold">{t('pages.serviceRequestView.company')}</h4>
                                        </div>
                                    </div>
                                    <div className="offer-actions">
                                        <button 
                                            className="btn-quote"
                                            onClick={() => navigate('/request-quote/list', { 
                                                state: { 
                                                    project: project, 
                                                    offer: null 
                                                } 
                                            })}
                                        >
                                            <span>{t('project-offers.view-quote')}</span>
                                        </button>
                                        <button 
                                            className="btn-call"
                                            onClick={() => {
                                                alert(t('project-offers.noPhoneNumber', 'No phone number available'));
                                            }}
                                        >
                                            {t('project-offers.call')}
                                        </button>
                                    </div>
                                </div>
                                <div className="offer-item">
                                    <div className="offer-company">
                                        <div>
                                            <h4 className="ar-heading-bold">{t('pages.serviceRequestView.company')}</h4>
                                        </div>
                                    </div>
                                    <div className="offer-actions">
                                        <button 
                                            className="btn-quote"
                                            onClick={() => navigate('/request-quote/list', { 
                                                state: { 
                                                    project: project, 
                                                    offer: null 
                                                } 
                                            })}
                                        >
                                            <span>{t('project-offers.view-quote')}</span>
                                        </button>
                                        <button 
                                            className="btn-call"
                                            onClick={() => {
                                                alert(t('project-offers.noPhoneNumber', 'No phone number available'));
                                            }}
                                        >
                                            {t('project-offers.call')}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

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

            {/* Project Completion Details Modal */}
            <ProjectCompletionDetailsModal
                isOpen={showCompletionDetails}
                onClose={closeCompletionDetails}
                completionData={selectedCompletionData}
                project={project}
                hideRejectButton={isAwaitingPayment}
            />
        </div>
    );
};

export default ServiceProjectCard; 