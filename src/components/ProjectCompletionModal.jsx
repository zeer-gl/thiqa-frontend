import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../context/AlertContext';
import { BaseUrl } from '../assets/BaseUrl';
import '../css/components/project-completion-modal.scss';

const ProjectCompletionModal = ({ isOpen, onClose, project, onRefresh }) => {
    const { t } = useTranslation();
    const { showAlert } = useAlert();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Validate file types
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const validFiles = [];
        const invalidFiles = [];

        files.forEach(file => {
            if (allowedTypes.includes(file.type)) {
                // Check file size (5MB limit)
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size <= maxSize) {
                    validFiles.push(file);
                } else {
                    invalidFiles.push(`${file.name} (too large)`);
                }
            } else {
                invalidFiles.push(`${file.name} (invalid type)`);
            }
        });

        if (invalidFiles.length > 0) {
            showAlert(
                t('projectCompletion.invalidFiles', 'Invalid files: {{files}}', { 
                    files: invalidFiles.join(', ') 
                }), 
                'warning'
            );
        }

        if (validFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...validFiles]);
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (selectedFiles.length === 0) {
            showAlert(t('projectCompletion.noFilesSelected', 'Please select at least one image'), 'warning');
            return;
        }

        if (!note.trim()) {
            showAlert(t('projectCompletion.noteRequired', 'Please add a completion note'), 'warning');
            return;
        }

        setIsSubmitting(true);

        try {
            // Get professional authentication data
            const professionalToken = localStorage.getItem('token-sp');
            const professionalData = localStorage.getItem('spUserData');

            if (!professionalToken || !professionalData) {
                showAlert(t('projectCompletion.authRequired', 'Authentication required'), 'error');
                return;
            }

            const professional = JSON.parse(professionalData);

            // Create FormData for multipart/form-data request
            const formData = new FormData();
            formData.append('demandId', project.id);
            formData.append('professionalId', professional._id);
            formData.append('note', note.trim());

            // Append all selected files
            selectedFiles.forEach((file, index) => {
                formData.append('completionFiles', file);
            });

            console.log('=== PROJECT COMPLETION API REQUEST ===');
            console.log('Demand ID:', project.id);
            console.log('Professional ID:', professional._id);
            console.log('Note:', note.trim());
            console.log('Files count:', selectedFiles.length);

            const response = await fetch(`${BaseUrl}/professional/complete-project`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${professionalToken}`,
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API Error Response:', errorData);
                showAlert(
                    errorData?.message || t('projectCompletion.submitFailed', 'Failed to submit completion files'), 
                    'error'
                );
                return;
            }

            const data = await response.json();
            console.log('✅ Project completion submitted successfully:', data);

            showAlert(t('projectCompletion.success', 'Project completion files submitted successfully'), 'success');
            
            // Reset form and close modal
            setSelectedFiles([]);
            setNote('');
            onClose();
            
            // Trigger refresh of project list if onRefresh callback is provided
            if (onRefresh) {
                onRefresh();
            }

        } catch (error) {
            console.error('❌ Error submitting project completion:', error);
            showAlert(
                error.message || t('projectCompletion.submitFailed', 'Failed to submit completion files'), 
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setSelectedFiles([]);
            setNote('');
            onClose();
        }
    };

    return (
        <div className="modal-overlay project-completion-modal-overlay" onClick={handleOverlayClick}>
            <div className="project-completion-modal">
                {/* Header */}
                <div className="modal-header">
                    <h3 className="modal-title">{t('projectCompletion.title', 'Project Completion')}</h3>
                    <button 
                        className="modal-close-btn" 
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Project Info */}
                <div className="project-info mb-3">
                    <h5 className="project-name">{project?.projectName || 'Project'}</h5>
                    <p className="project-client">Client: {project?.clientName || 'Unknown'}</p>
                </div>

                {/* File Upload Section */}
                <div className="file-upload-section mb-3">
                    <label className="form-label">{t('projectCompletion.selectImages', 'Select Completion Images')}</label>
                    <div className="file-upload-container">
                        <input
                            type="file"
                            id="completionFiles"
                            className="file-input"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            multiple
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                        />
                        <label htmlFor="completionFiles" className="file-upload-label">
                            <i className="fas fa-cloud-upload-alt"></i>
                            <span>{t('projectCompletion.chooseFiles', 'Choose Images')}</span>
                        </label>
                    </div>
                    <small className="form-text text-muted">
                        {t('projectCompletion.fileRequirements', 'Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB per file')}
                    </small>
                </div>

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                    <div className="selected-files mb-3">
                        <h6>{t('projectCompletion.selectedFiles', 'Selected Files')} ({selectedFiles.length})</h6>
                        <div className="files-grid">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="file-preview">
                                    <div className="file-info">
                                        <i className="fas fa-image"></i>
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">({(file.size / (1024 * 1024)).toFixed(2)}MB)</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="remove-file-btn"
                                        onClick={() => removeFile(index)}
                                        disabled={isSubmitting}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Note Section */}
                <div className="note-section mb-3">
                    <label htmlFor="completionNote" className="form-label">
                        {t('projectCompletion.completionNote', 'Completion Note')} *
                    </label>
                    <textarea
                        id="completionNote"
                        className="form-control"
                        rows="3"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={t('projectCompletion.notePlaceholder', 'Describe the completed work...')}
                        disabled={isSubmitting}
                    />
                </div>

                {/* Action Buttons */}
                <div className="modal-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        {t('common.cancel', 'Cancel')}
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting || selectedFiles.length === 0 || !note.trim()}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                {t('common.submitting', 'Submitting...')}
                            </>
                        ) : (
                            t('projectCompletion.submit', 'Submit Completion')
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectCompletionModal;
