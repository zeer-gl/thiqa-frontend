import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../context/AlertContext';
import { BaseUrl } from '../assets/BaseUrl';
import '../css/components/project-completion-details-modal.scss';

const ProjectCompletionDetailsModal = ({ isOpen, onClose, completionData, project, hideRejectButton }) => {
    const { t } = useTranslation();
    const { showAlert } = useAlert();
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');


    if (!isOpen || !completionData) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };


    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    };

    const handleApproveProject = async () => {
        console.log('🔍 APPROVE BUTTON CLICKED!');
        console.log('🔍 Project data:', project);
        console.log('🔍 Completion data:', completionData);
        
        if (!project || !project.id) {
            console.log('❌ Project ID missing:', project);
            showAlert(t('projectCompletionDetails.errors.projectIdMissing', 'Project ID is missing'), 'error');
            return;
        }

        console.log('✅ Starting approval process...');
        setIsApproving(true);

        try {
            // Get customer authentication data
            const customerToken = localStorage.getItem('token');
            const customerData = localStorage.getItem('userData');

            console.log('🔍 Authentication check:');
            console.log('🔍 Customer token exists:', !!customerToken);
            console.log('🔍 Customer data exists:', !!customerData);

            if (!customerToken || !customerData) {
                console.log('❌ Authentication failed - missing token or data');
                showAlert(t('projectCompletionDetails.errors.authRequired', 'Authentication required'), 'error');
                return;
            }

            const customer = JSON.parse(customerData);
            console.log('🔍 Customer data parsed:', customer);

            console.log('=== APPROVING PROJECT COMPLETION ===');
            console.log('Demand ID:', project.id);
            console.log('Customer ID:', customer._id);
            console.log('Base URL:', BaseUrl);
            console.log('Full API URL:', `${BaseUrl}/customer/approve-project-completion`);

            const requestBody = {
                demandId: project.id,
                customerId: customer._id
            };
            console.log('🔍 Request body:', requestBody);

            const response = await fetch(`${BaseUrl}/customer/approve-project-completion`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${customerToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('🔍 API Response status:', response.status);
            console.log('🔍 API Response ok:', response.ok);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API Error Response:', errorData);
                showAlert(
                    errorData?.message || t('projectCompletionDetails.errors.approveFailed', 'Failed to approve project completion'), 
                    'error'
                );
                return;
            }

            const data = await response.json();
            console.log('✅ Project completion approved successfully:', data);

            // Check if payment link exists in response
            if (data.data.paymentUrl) {
                const paymentLink = data.data.paymentUrl;
                console.log('🔗 Payment link found:', paymentLink);
                
                showAlert(t('projectCompletionDetails.success.approved', 'Project completion approved successfully! Opening payment page...'), 'success');
                
                // Open payment link in new tab
                window.open(paymentLink, '_blank');
                
                // Close modal after opening payment link
                onClose();
            } else {
                console.log('⚠️ No payment link found in response');
                showAlert(t('projectCompletionDetails.success.approvedNoLink', 'Project completion approved successfully! Payment link will be generated.'), 'success');
                
                // Close modal after successful approval
                onClose();
            }

        } catch (error) {
            console.error('❌ Error approving project completion:', error);
            showAlert(
                error.message || t('projectCompletionDetails.errors.approveFailed', 'Failed to approve project completion'), 
                'error'
            );
        } finally {
            setIsApproving(false);
        }
    };

    const handleRejectProject = async () => {
        console.log('🔍 REJECT BUTTON CLICKED!');
        console.log('🔍 Project data:', project);
        console.log('🔍 Rejection reason:', rejectionReason);
        
        if (!project || !project.id) {
            console.log('❌ Project ID missing:', project);
            showAlert(t('projectCompletionDetails.errors.projectIdMissing', 'Project ID is missing'), 'error');
            return;
        }

        if (!rejectionReason.trim()) {
            console.log('❌ Rejection reason missing');
            showAlert(t('projectCompletionDetails.errors.rejectionReasonRequired', 'Please provide a reason for rejection'), 'error');
            return;
        }

        console.log('✅ Starting rejection process...');
        setIsRejecting(true);

        try {
            // Get customer authentication data
            const customerToken = localStorage.getItem('token');
            const customerData = localStorage.getItem('userData');

            console.log('🔍 Authentication check:');
            console.log('🔍 Customer token exists:', !!customerToken);
            console.log('🔍 Customer data exists:', !!customerData);

            if (!customerToken || !customerData) {
                console.log('❌ Authentication failed - missing token or data');
                showAlert(t('projectCompletionDetails.errors.authRequired', 'Authentication required'), 'error');
                return;
            }

            const customer = JSON.parse(customerData);
            console.log('🔍 Customer data parsed:', customer);

            console.log('=== REJECTING PROJECT COMPLETION ===');
            console.log('Demand ID:', project.id);
            console.log('Rejection Reason:', rejectionReason);
            console.log('Base URL:', BaseUrl);
            console.log('Full API URL:', `${BaseUrl}/customer/reject-project-completion`);

            const requestBody = {
                demandId: project.id,
                rejectionReason: rejectionReason.trim()
            };
            console.log('🔍 Request body:', requestBody);

            const response = await fetch(`${BaseUrl}/customer/reject-project-completion`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${customerToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('🔍 API Response status:', response.status);
            console.log('🔍 API Response ok:', response.ok);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API Error Response:', errorData);
                showAlert(
                    errorData?.message || t('projectCompletionDetails.errors.rejectFailed', 'Failed to reject project completion'), 
                    'error'
                );
                return;
            }

            const data = await response.json();
            console.log('✅ Project completion rejected successfully:', data);

            showAlert(t('projectCompletionDetails.success.rejected', 'Project completion rejected successfully!'), 'success');
            
            // Close modal after successful rejection
            onClose();

        } catch (error) {
            console.error('❌ Error rejecting project completion:', error);
            showAlert(
                error.message || t('projectCompletionDetails.errors.rejectFailed', 'Failed to reject project completion'), 
                'error'
            );
        } finally {
            setIsRejecting(false);
        }
    };

    const handleShowRejectModal = () => {
        setShowRejectModal(true);
        setRejectionReason('');
    };

    const handleCancelReject = () => {
        setShowRejectModal(false);
        setRejectionReason('');
    };

    return (
        <div className="modal-overlay project-completion-details-overlay" onClick={handleOverlayClick}>
            <div className="project-completion-details-modal">
                {/* Header */}
                <div className="modal-header">
                    <h3 className="modal-title">{t('projectCompletionDetails.title', 'Project Completion Details')}</h3>
                    <button 
                        className="modal-close-btn" 
                        onClick={onClose}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Completion Info */}
                <div className="completion-info">
                    <div className="completion-status">
                        <div className="status-badge completed">
                            <i className="fas fa-check-circle"></i>
                            <span>{t('projectCompletionDetails.status.completed', 'Project Completed')}</span>
                        </div>
                        <div className="completion-date">
                            <i className="fas fa-calendar-alt"></i>
                            <span>{t('projectCompletionDetails.completedOn', 'Completed on')}: {formatDate(completionData.updatedAt)}</span>
                        </div>
                    </div>

                    {completionData.note && (
                        <div className="completion-note">
                            <h5>{t('projectCompletionDetails.completionNote', 'Completion Note')}</h5>
                            <p>{completionData.note}</p>
                        </div>
                    )}
                </div>

                {/* Completion Images */}
                {completionData.files && completionData.files.length > 0 && (
                    <div className="completion-images">
                        <h5>{t('projectCompletionDetails.completionImages', 'Completion Images')}</h5>
                        <div className="images-grid">
                            {completionData.files.map((fileUrl, index) => (
                                <div key={index} className="image-item">
                                    <img 
                                        src={fileUrl} 
                                        alt={`Completion image ${index + 1}`}
                                        className="completion-image"
                                        onClick={() => window.open(fileUrl, '_blank')}
                                    />
                                    <div className="image-overlay">
                                        <i className="fas fa-expand"></i>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Images Message */}
                {(!completionData.files || completionData.files.length === 0) && (
                    <div className="no-images-message">
                        <i className="fas fa-image"></i>
                        <p>{t('projectCompletionDetails.noImages', 'No completion images available')}</p>
                    </div>
                )}

                {/* Rejection Reason Modal */}
                {showRejectModal && (
                    <div className="rejection-modal-overlay" onClick={(e) => e.stopPropagation()}>
                        <div className="rejection-modal">
                            <div className="rejection-modal-header">
                                <h5>{t('projectCompletionDetails.rejectTitle', 'Reject Project Completion')}</h5>
                                <button 
                                    className="rejection-modal-close" 
                                    onClick={handleCancelReject}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="rejection-modal-body">
                                <p>{t('projectCompletionDetails.rejectMessage', 'Please provide a reason for rejecting this project completion:')}</p>
                                <textarea
                                    className="form-control rejection-reason-textarea"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder={t('projectCompletionDetails.rejectPlaceholder', 'Enter your reason for rejection...')}
                                    rows="4"
                                    maxLength="500"
                                />
                                <div className="character-count">
                                    {rejectionReason.length}/500
                                </div>
                            </div>
                            <div className="rejection-modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCancelReject}
                                    disabled={isRejecting}
                                >
                                    {t('common.cancel', 'Cancel')}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleRejectProject}
                                    disabled={isRejecting || !rejectionReason.trim()}
                                >
                                    {isRejecting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            {t('projectCompletionDetails.rejecting', 'Rejecting...')}
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-times me-2"></i>
                                            {t('projectCompletionDetails.reject', 'Reject')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="modal-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onClose}
                        disabled={isApproving || isRejecting}
                    >
                        {t('common.close', 'Close')}
                    </button>
                  {!hideRejectButton&&  <button
                        type="button"
                        className="btn btn-danger me-2"
                        onClick={handleShowRejectModal}
                        disabled={isApproving || isRejecting}
                    >
                        <i className="fas fa-times me-2"></i>
                        {t('projectCompletionDetails.reject', 'Reject')}
                    </button>}
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => {
                            console.log('🔍 BUTTON CLICKED - Starting approval...ok ');
                            handleApproveProject();
                        }}
                        disabled={isApproving || isRejecting}
                    >
                        {isApproving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                {t('projectCompletionDetails.approving', 'Approving...')}
                            </>
                        ) : (
                            <>
                                <i className="fas fa-check me-2"></i>
                                {t('projectCompletionDetails.approve', 'Approve & Pay')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectCompletionDetailsModal;
