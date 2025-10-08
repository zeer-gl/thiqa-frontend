import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../context/AlertContext';
import { BaseUrl } from '../assets/BaseUrl';
import '../css/components/project-completion-details-modal.scss';

const ProjectCompletionDetailsModal = ({ isOpen, onClose, completionData, project }) => {
    const { t } = useTranslation();
    const { showAlert } = useAlert();
    const [isApproving, setIsApproving] = useState(false);

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

                {/* Action Buttons */}
                <div className="modal-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onClose}
                        disabled={isApproving}
                    >
                        {t('common.close', 'Close')}
                    </button>
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => {
                            console.log('🔍 BUTTON CLICKED - Starting approval...ok ');
                            handleApproveProject();
                        }}
                        disabled={isApproving}
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
