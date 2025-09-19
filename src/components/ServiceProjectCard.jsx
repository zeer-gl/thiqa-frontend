// CACHE BUST: Updated to fix professional ID extraction - v2.0
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AccIcon from "/public/images/accordian-icon.svg";
import { BaseUrl } from '../assets/BaseUrl.jsx';
import { useAlert } from '../context/AlertContext';
import '../css/components/phone-modal.scss';

const ServiceProjectCard = ({ project, isExpanded, onToggle, offers, onProposalAccepted }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [selectedProfessional, setSelectedProfessional] = useState(null);
    const [acceptingProposal, setAcceptingProposal] = useState(null);
    const [acceptedProposals, setAcceptedProposals] = useState(new Set());

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

    // Handle phone call
    const handleCall = (phoneNumber) => {
        window.open(`tel:${phoneNumber}`, '_self');
        closePhoneModal();
    };

    // Handle accepting a proposal
    const handleAcceptProposal = async (proposalId, professionalId) => {
        try {
            setAcceptingProposal(proposalId);
            
            console.log('=== ACCEPTING PROPOSAL ===');
            console.log('Proposal ID:', proposalId);
            console.log('Professional ID:', professionalId);
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
            
            if (!professionalId) {
                throw new Error('Professional ID is missing');
            }
            
            // Extract professional ID from object if it's an object
            let finalProfessionalId = professionalId;
            console.log('🔍 DEBUGGING PROFESSIONAL ID EXTRACTION:');
            console.log('Professional ID type:', typeof professionalId);
            console.log('Professional ID value:', professionalId);
            console.log('Is object?', typeof professionalId === 'object');
            console.log('Has _id?', professionalId && professionalId._id);
            
            if (typeof professionalId === 'object' && professionalId._id) {
                finalProfessionalId = professionalId._id;
                console.log('✅ Extracted Professional ID from object:', finalProfessionalId);
            } else {
                console.log('ℹ️ Professional ID is already a string or no _id found');
            }
            
            // Validate that we have the final professional ID after extraction
            if (!finalProfessionalId) {
                throw new Error('Professional ID could not be extracted from the proposal data');
            }
            
            console.log('=== SENDING API REQUEST (UPDATED VERSION) ===');
            console.log('Timestamp:', new Date().toISOString());
            console.log('Demand ID (Project ID):', project.id);
            console.log('Professional ID (final):', finalProfessionalId);
            console.log('Action: accept');
            console.log('Customer ID:', customer._id);
            
            const response = await fetch(`${BaseUrl}/customer/acceptReject-proposal`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${customerToken}`,
                },
                body: JSON.stringify({
                    demandId: project.id,
                    professionalId: finalProfessionalId,
                    action: "accept"
                })
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
            
            // Mark this proposal as accepted
            setAcceptedProposals(prev => new Set([...prev, proposalId]));
            
            // Show success message using showAlert
            showAlert(t('project-offers.proposal-accepted') || 'Proposal accepted successfully!', 'success');
            
            // Call the callback to refresh the parent component
            if (onProposalAccepted) {
                onProposalAccepted();
            }
            
            // Redirect to home page after accepting proposal
            navigate('/');
            
        } catch (error) {
            console.error('❌ Error accepting proposal:', error);
            showAlert(error.message || t('project-offers.accept-error') || 'Failed to accept proposal. Please try again.', 'error');
        } finally {
            setAcceptingProposal(null);
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
                        <p>{project.subtitle}</p>
                    </div>
                </div>
                <div className="project-actions">
                    <button
                        className={`offers-button ${project.offers === 0 ? 'disabled' : ''}`}
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
                                            <h4 className="ar-heading-bold">{offer.professionalId?.name || t('project-offers.professional')}</h4>
                                            <p className="offer-price">{t('project-offers.price')}: {offer.price} KWD</p>
                                            <p className="offer-duration">{t('project-offers.duration')}: {new Date(offer.duration).toLocaleDateString()}</p>
                                            {offer.note && <p className="offer-note">{offer.note}</p>}
                                        </div>
                                    </div>
                                    <div className="offer-actions">
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
                                        {!acceptedProposals.has(offer._id || offer.id) && (
                                        <button 
                                            className="btn-call"
                                                onClick={() => {
                                                    console.log('=== BUTTON CLICK DEBUG (UPDATED VERSION) ===');
                                                    console.log('Timestamp:', new Date().toISOString());
                                                    console.log('Offer object:', offer);
                                                    console.log('Offer ID:', offer._id || offer.id);
                                                    console.log('Professional ID (raw):', offer.professionalId);
                                                    console.log('Professional ID type:', typeof offer.professionalId);
                                                    
                                                    // Extract professional ID before passing to function
                                                    let professionalIdToPass = offer.professionalId;
                                                    if (typeof offer.professionalId === 'object' && offer.professionalId._id) {
                                                        professionalIdToPass = offer.professionalId._id;
                                                        console.log('✅ Extracted professional ID for button click:', professionalIdToPass);
                                                    }
                                                    
                                                    handleAcceptProposal(offer._id || offer.id, professionalIdToPass);
                                                }}
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
                                        )}
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
        </div>
    );
};

export default ServiceProjectCard; 