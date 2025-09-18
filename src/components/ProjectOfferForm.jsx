import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../context/AlertContext';
import { BaseUrl } from '../assets/BaseUrl';
import axios from 'axios';

// Debug function to test professional ID (can be called from browser console)
window.testProfessionalId = async () => {
    const professionalId = localStorage.getItem('spUserData');
    if (professionalId) {
        try {
            const userData = JSON.parse(professionalId);
            console.log('Professional ID from localStorage:', userData._id);
            console.log('Is valid ObjectId:', /^[0-9a-fA-F]{24}$/.test(userData._id));
            
            // Test API call
            const token = localStorage.getItem('token-sp');
            const response = await fetch(`${BaseUrl}/professional/get-professsional/${userData._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Professional ID verified in backend:', data);
            } else {
                console.error('❌ Professional ID not found in backend:', response.status);
            }
        } catch (error) {
            console.error('Error testing professional ID:', error);
        }
    } else {
        console.error('No spUserData found in localStorage');
    }
};

// Debug function to test proposal submission with current data
window.testProposalSubmission = async () => {
    const spUserData = localStorage.getItem('spUserData');
    const token = localStorage.getItem('token-sp');
    
    if (!spUserData || !token) {
        console.error('Missing required data in localStorage');
        return;
    }
    
    try {
        const userData = JSON.parse(spUserData);
        const professionalId = userData._id;
        
        console.log('=== TESTING PROPOSAL SUBMISSION ===');
        console.log('Professional ID:', professionalId);
        console.log('Token exists:', !!token);
        
        // Test with the exact IDs from your error
        const testPayload = {
            demandQuoteId: '68c29c82ba7a5a17cf3f0f96',
            professionalId: '68c2e3234163f2e8821e1a9e',
            proposal: 'Test proposal',
            price: '100',
            duration: '2025-09-16'
        };
        
        console.log('Test payload:', testPayload);
        
        const response = await fetch(`${BaseUrl}/professional/create-proposal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(testPayload)
        });
        
        const data = await response.json();
        console.log('Response:', data);
        
    } catch (error) {
        console.error('Error testing proposal submission:', error);
    }
};

// Debug function to test FormData payload structure
window.testFormDataPayload = async () => {
    const spUserData = localStorage.getItem('spUserData');
    const token = localStorage.getItem('token-sp');
    
    if (!spUserData || !token) {
        console.error('Missing required data in localStorage');
        return;
    }
    
    const userData = JSON.parse(spUserData);
    const professionalId = userData._id;
    
    console.log('=== TESTING FORMDATA PAYLOAD ===');
    
    // Create FormData payload (matching your Postman image)
    const formData = new FormData();
    formData.append('demandId', '68c29c82ba7a5a17cf3f0f96'); // Use a test demand ID
    formData.append('professionalId', professionalId);
    formData.append('proposal', 'Test proposal');
    formData.append('price', '100');
    formData.append('duration', '2025-09-16');
    
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }
    
    try {
        const response = await fetch(`${BaseUrl}/professional/create-proposal`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Note: Don't set Content-Type for FormData, let browser set it with boundary
            },
            body: formData
        });
        
        const data = await response.json();
        console.log('✅ FormData payload - SUCCESS:', data);
        
    } catch (error) {
        console.log('❌ FormData payload - FAILED:', error);
    }
};

// Debug function to check current IDs
window.checkCurrentIds = () => {
    console.log('=== CHECKING CURRENT IDs ===');
    
    const spUserData = localStorage.getItem('spUserData');
    const serviceProviderId = localStorage.getItem('serviceProviderId');
    
    console.log('spUserData:', spUserData);
    console.log('serviceProviderId:', serviceProviderId);
    
    if (spUserData) {
        try {
            const userData = JSON.parse(spUserData);
            console.log('Parsed spUserData:', userData);
            console.log('Professional ID from spUserData._id:', userData._id);
            console.log('Is valid ObjectId:', /^[0-9a-fA-F]{24}$/.test(userData._id));
        } catch (error) {
            console.error('Error parsing spUserData:', error);
        }
    }
    
    console.log('serviceProviderId is valid ObjectId:', /^[0-9a-fA-F]{24}$/.test(serviceProviderId));
};
import '../css/components/project-offer-form.scss';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import BackupIcon from '@mui/icons-material/Backup';

const ProjectOfferForm = ({ 
    project, 
    onBack, 
    formType = 'projectOffer',
    demandQuoteId, // Optional explicit demandQuoteId prop
    // Form configuration props
    title = 'إيداع عرض للمشروع',
    subtitle = 'إيداع عرض للمشروع : بناء فيلا',
    projectDurationPlaceholder = 'مدة إنجاز المشروع',
    pricePlaceholder = 'د.ك السعر',
    uploadFilePlaceholder = 'تحميل ملف إنجاز المشروع',
    notesPlaceholder = 'أضف ملاحظة',
    submitButtonText = 'إيداع العرض',
    termsText = 'شروط الاستخدام و سياسة الخصوصية'
}) => {
    const { t, i18n } = useTranslation();
    const { showAlert } = useAlert();
    const [formData, setFormData] = useState({
        projectDuration: '',
        price: '',
        projectFile: null,
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [hoveredDate, setHoveredDate] = useState(null);

    const handleInputChange = (field, value) => {
        // For price field, allow both numbers and alphabetic characters
        if (field === 'price') {
            // Allow all characters (numbers, letters, spaces, etc.)
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        } else if (field === 'projectDuration') {
            // For project duration, allow typing dates in YYYY-MM-DD format
            // Allow typing but also validate format
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
            
            // If user types a valid date format, update selectedDate for calendar
            if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                setSelectedDate(value);
            }
        } else {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        }
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            projectFile: e.target.files[0]
        }));
    };

    const handleDateSelect = (date) => {
        // Create date string in YYYY-MM-DD format (same as generateCalendarDays)
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        console.log('Selected date object:', date);
        console.log('Date string (YYYY-MM-DD):', dateString);
        
        setSelectedDate(dateString);
        setFormData(prev => ({
            ...prev,
            projectDuration: dateString
        }));
        setShowDatePicker(false);
    };

    const toggleDatePicker = () => {
        setShowDatePicker(!showDatePicker);
    };

    const closeDatePicker = () => {
        setShowDatePicker(false);
    };

    const navigateMonth = (direction) => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev);
            newMonth.setMonth(prev.getMonth() + direction);
            return newMonth;
        });
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(today);
        handleDateSelect(today);
    };

    const clearDate = () => {
        setSelectedDate('');
        setFormData(prev => ({
            ...prev,
            projectDuration: ''
        }));
        setShowDatePicker(false);
    };

    const validateAndFormatDate = (dateString) => {
        // Try to parse the date string and format it as YYYY-MM-DD
        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
        } catch (error) {
            console.log('Date parsing error:', error);
        }
        return dateString; // Return original if parsing fails
    };

    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        
        // Get first day of the month and calculate starting date for calendar grid
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        
        // Calculate the starting date for the calendar grid (including previous month's days)
        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
        
        const days = [];
        const today = new Date();
        
        // Generate 42 days (6 weeks) for the calendar grid
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const isCurrentMonth = date.getMonth() === month;
            const isToday = date.toDateString() === today.toDateString();
            
            // Create date string in YYYY-MM-DD format for comparison
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const isSelected = selectedDate && dateString === selectedDate;
            const isHovered = hoveredDate && date.toDateString() === hoveredDate.toDateString();
            
            days.push({
                date,
                day: date.getDate(),
                isCurrentMonth,
                isToday,
                isSelected,
                isHovered,
                dateString
            });
        }
        
        return days;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Declare variables at the top to avoid temporal dead zone errors
        let professionalId = null;
        let finalDemandQuoteId = null;
        
        // Debug localStorage data first
        console.log('=== LOCALSTORAGE DEBUG ===');
        console.log('All localStorage keys:', Object.keys(localStorage));
        console.log('token-sp:', localStorage.getItem('token-sp'));
        console.log('serviceProviderId:', localStorage.getItem('serviceProviderId'));
        console.log('spUserData:', localStorage.getItem('spUserData'));
        console.log('userRole:', localStorage.getItem('userRole'));
        
        // Debug: Check if serviceProviderId and spUserData._id are the same
        const serviceProviderId = localStorage.getItem('serviceProviderId');
        const spUserData = localStorage.getItem('spUserData');
        if (spUserData) {
            try {
                const userData = JSON.parse(spUserData);
                console.log('serviceProviderId from localStorage:', serviceProviderId);
                console.log('professional._id from spUserData:', userData._id);
                console.log('Are they the same?', serviceProviderId === userData._id);
            } catch (error) {
                console.error('Error parsing spUserData for debug:', error);
            }
        }
        
        // Validate required fields
        if (!formData.projectDuration || !formData.price || !formData.notes) {
            showAlert(t('common.fillRequiredFields', 'Please fill in all required fields'), 'error');
            return;
        }
        
        // Additional validation for duration and price
        if (!formData.projectDuration.trim()) {
            showAlert('Duration is required', 'error');
            return;
        }
        
        if (!formData.price.trim()) {
            showAlert('Price is required', 'error');
            return;
        }

        // Validate demand quote ID - prioritize explicit prop, then project object
        finalDemandQuoteId = demandQuoteId || project?._id || project?.id;
        if (!finalDemandQuoteId) {
            showAlert('Project information is missing or invalid', 'error');
            return;
        }
        
        console.log('=== DEMAND QUOTE ID DEBUG ===');
        console.log('Original demandQuoteId prop:', demandQuoteId);
        console.log('Project object:', project);
        console.log('Project._id:', project?._id);
        console.log('Project.id:', project?.id);
        console.log('Final demandQuoteId:', finalDemandQuoteId);

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token-sp');
            
            // Get professional ID from spUserData in localStorage
            const spUserData = localStorage.getItem('spUserData');
            
            if (spUserData) {
                try {
                    const userData = JSON.parse(spUserData);
                    professionalId = userData._id;
                    console.log('Professional ID from localStorage spUserData:', professionalId);
                } catch (error) {
                    console.error('Error parsing spUserData:', error);
                }
            }
            
            // Fallback to serviceProviderId if spUserData doesn't have _id
            if (!professionalId) {
                professionalId = localStorage.getItem('serviceProviderId');
                console.log('Using fallback serviceProviderId:', professionalId);
            }
            
            // Verify professional ID exists in backend before submitting proposal
            if (professionalId) {
                try {
                    console.log('=== VERIFYING PROFESSIONAL ID IN BACKEND ===');
                    const verifyResponse = await fetch(`${BaseUrl}/professional/get-professsional/${professionalId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (verifyResponse.ok) {
                        const verifyData = await verifyResponse.json();
                        console.log('✅ Professional ID verified in backend:', verifyData);
                    } else {
                        console.error('❌ Professional ID not found in backend:', verifyResponse.status);
                        const errorData = await verifyResponse.json().catch(() => ({}));
                        console.error('Backend error:', errorData);
                        showAlert('Professional account not found. Please login again.', 'error');
                        return;
                    }
                } catch (verifyError) {
                    console.error('Error verifying professional ID:', verifyError);
                    // Continue with submission even if verification fails
                }
            }
            
            // Clean and validate the professional ID
            if (professionalId) {
                professionalId = String(professionalId).trim();
                
                // Ensure it's a valid ObjectId format
                if (!/^[0-9a-fA-F]{24}$/.test(professionalId)) {
                    console.error('❌ Professional ID is not a valid ObjectId format:', professionalId);
                    showAlert('Invalid professional ID format. Please login again.', 'error');
                    return;
                }
            }
            
            if (!token || !professionalId) {
                showAlert('Please login to submit proposal', 'error');
                return;
            }

            // Get demandQuoteId - prioritize explicit prop, then project object
            finalDemandQuoteId = demandQuoteId || project?._id || project?.id;
            
            // Clean and validate the demand quote ID
            if (finalDemandQuoteId) {
                finalDemandQuoteId = String(finalDemandQuoteId).trim();
            }
            
            if (!finalDemandQuoteId) {
                showAlert('Project information is missing or invalid', 'error');
                return;
            }

            // Debug demand quote ID
            console.log('=== DEMAND QUOTE ID DEBUG ===');
            console.log('Original demandQuoteId prop:', demandQuoteId);
            console.log('Project object:', project);
            console.log('Project._id:', project?._id);
            console.log('Project.id:', project?.id);
            console.log('Final demandQuoteId:', finalDemandQuoteId);
            console.log('Final demandQuoteId type:', typeof finalDemandQuoteId);
            console.log('Final demandQuoteId length:', finalDemandQuoteId?.length);
            console.log('Is valid ObjectId:', /^[0-9a-fA-F]{24}$/.test(finalDemandQuoteId));
            
            // Validate demand quote ID format
            if (!/^[0-9a-fA-F]{24}$/.test(finalDemandQuoteId)) {
                console.error('❌ Demand Quote ID is not a valid ObjectId format:', finalDemandQuoteId);
                showAlert('Invalid project ID format. Please refresh the page and try again.', 'error');
                return;
            }

            // Prepare FormData payload for API - backend expects form-data, not JSON
            const proposalFormData = new FormData();
            proposalFormData.append('demandId', finalDemandQuoteId); // Add demandId field (as shown in Postman image)
            proposalFormData.append('professionalId', professionalId);
            proposalFormData.append('proposal', formData.notes);
            proposalFormData.append('price', formData.price);
            proposalFormData.append('duration', formData.projectDuration); // Changed from 'timeline' to 'duration' to match Postman
            
            // Debug the date being sent
            console.log('=== DATE SUBMISSION DEBUG ===');
            console.log('Selected date from form:', formData.projectDuration);
            console.log('Date type:', typeof formData.projectDuration);
            console.log('Date format validation:', /^\d{4}-\d{2}-\d{2}$/.test(formData.projectDuration));
            
            // Add file if selected
            if (formData.projectFile) {
                proposalFormData.append('completionFile', formData.projectFile);
            }
            
            // Validate ObjectId formats and log detailed information
            console.log('=== OBJECTID VALIDATION ===');
            console.log('Professional ID:', professionalId);
            console.log('Professional ID length:', professionalId.length);
            console.log('Professional ID is valid ObjectId:', /^[0-9a-fA-F]{24}$/.test(professionalId));
            
            if (!/^[0-9a-fA-F]{24}$/.test(professionalId)) {
                console.error('❌ Professional ID is not a valid ObjectId format:', professionalId);
                showAlert('Invalid professional ID format', 'error');
                    return;
            }
            
            // Log FormData contents
            console.log('=== FORMDATA CONTENTS ===');
            for (let [key, value] of proposalFormData.entries()) {
                if (key === 'completionFile') {
                    console.log(`${key}: File (${value.name}, ${value.size} bytes)`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }
            
            // Final validation before submission
            console.log('=== FINAL ID VALIDATION ===');
            console.log('Professional ID:', professionalId);
            console.log('Professional ID length:', professionalId?.length);
            console.log('Professional ID is valid ObjectId:', /^[0-9a-fA-F]{24}$/.test(professionalId));
            console.log('Demand ID:', finalDemandQuoteId);
            console.log('Demand ID length:', finalDemandQuoteId?.length);
            console.log('Demand ID is valid ObjectId:', /^[0-9a-fA-F]{24}$/.test(finalDemandQuoteId));
            
            // File is already added to FormData above, no need for base64 conversion

            
            // Submit proposal using axios with FormData payload
            console.log('=== API REQUEST ===');
            console.log('URL:', `${BaseUrl}/professional/create-proposal`);
            console.log('Using FormData payload (as shown in your Postman image)');
            
            const response = await axios.post(`${BaseUrl}/professional/create-proposal`, proposalFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('=== API RESPONSE ===');
            console.log('Status:', response.status);
            console.log('Response data:', response.data);
            console.log('Proposal submitted successfully:', response.data);
            
            if (response.data.success) {
                showAlert('Proposal submitted successfully!', 'success');
                // Reset form
                setFormData({
                    projectDuration: '',
                    price: '',
                    projectFile: null,
                    notes: ''
                });
                // Call onBack if provided
                if (onBack) {
                    onBack();
                }
            } else {
                console.error('API Error Response:', response.data);
                showAlert(response.data.message || 'Failed to submit proposal', 'error');
            }

        } catch (error) {
            console.error('=== API ERROR ===');
            console.error('Error object:', error);
            console.error('Error message:', error.message);
            console.error('Error response:', error.response);
            console.error('Error request:', error.request);
            
            let errorMessage = 'Failed to submit proposal. Please try again.';
            
            if (error.response) {
                // Server responded with error status
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
                console.error('Response headers:', error.response.headers);
                
                errorMessage = error.response.data?.message || errorMessage;
                
                // Add specific error handling for different status codes
                if (error.response.status === 400) {
                    if (error.response.data?.message?.includes('Invalid Professional ID or Demand ID format')) {
                        console.error('❌ ObjectId validation failed on backend');
                        console.error('Professional ID being sent:', professionalId);
                        console.error('Demand Quote ID being sent:', finalDemandQuoteId);
                        errorMessage = 'Invalid ID format. Please refresh the page and try again.';
                    } else {
                    errorMessage = `Bad Request: ${error.response.data?.message || 'Invalid data format'}`;
                    }
                } else if (error.response.status === 401) {
                    errorMessage = 'Unauthorized: Please login again';
                } else if (error.response.status === 403) {
                    errorMessage = 'Forbidden: You do not have permission to perform this action';
                } else if (error.response.status === 404) {
                    errorMessage = 'Not Found: The requested resource was not found';
                } else if (error.response.status === 500) {
                    errorMessage = 'Server Error: Please try again later';
                }
            } else if (error.request) {
                // Network error
                console.error('Network error - no response received');
                errorMessage = 'Network error. Please check your connection.';
            } else {
                // Something else happened
                console.error('Request setup error:', error.message);
                errorMessage = `Request error: ${error.message}`;
            }
            
            showAlert(errorMessage, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="project-offer-form" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="form-container">
                {/* Header Section */}
                <div className="service-card-header">
                    <div className="service-card-header-left">
                        {onBack && (
                            <button 
                                className="btn btn-outline-secondary btn-sm mb-2"
                                onClick={onBack}
                                style={{ fontSize: '1rem', padding: '0.25rem 0.7rem' }}
                            >
                                <i className="fas fa-arrow-left me-1"></i>
                                {t('common.back', 'Back')}
                            </button>
                        )}
                        <p className="service-card-header-left-title">{title}</p>
                        <p className="service-card-header-left-subtitle">{subtitle}</p>
                    </div>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="project-offer-form">
                    {/* Project Duration Field */}
                    <div className="form-group">
                        <div className="input-with-icon">
                            <input
                                type="text"
                                className="form-input"
                                placeholder={projectDurationPlaceholder}
                                value={formData.projectDuration}
                                onChange={(e) => {
                                    console.log('Input change detected:', e.target.value);
                                    handleInputChange('projectDuration', e.target.value);
                                }}
                                onKeyDown={(e) => {
                                    console.log('Key pressed:', e.key);
                                    e.stopPropagation();
                                }}
                                onKeyUp={(e) => {
                                    console.log('Key released:', e.key);
                                    e.stopPropagation();
                                }}
                                onInput={(e) => {
                                    console.log('Input event:', e.target.value);
                                    e.stopPropagation();
                                }}
                                onBlur={(e) => {
                                    // Format date when user finishes typing
                                    const formattedDate = validateAndFormatDate(e.target.value);
                                    if (formattedDate !== e.target.value) {
                                        setFormData(prev => ({
                                            ...prev,
                                            projectDuration: formattedDate
                                        }));
                                        setSelectedDate(formattedDate);
                                    }
                                }}
                                oninput="this.value=this.value.replace(/[a-zA-Z0-9]/g,'');"
                                onClick={(e) => {
                                    console.log('Calendar icon clicked');
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleDatePicker();
                                }}
                                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                                style={{
                                    textAlign: i18n.language === 'ar' ? 'right' : 'left',
                                    direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
                                    backgroundColor: 'transparent',
                                    paddingRight: i18n.language === 'ar' ? '40px' : '40px',
                                    paddingLeft: i18n.language === 'ar' ? '12px' : '12px',
                                    cursor: 'text',
                                    pointerEvents: 'auto',
                                    position: 'relative',
                                    zIndex: 5,
                                    cursor: 'pointer'
                                }}
                                autoComplete="off"
                                spellCheck="false"
                            />
                            <span 
                                className="calendar-icon"
                                onClick={(e) => {
                                    console.log('Calendar icon clicked');
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleDatePicker();
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                style={{
                                    left: i18n.language === 'ar' ? '12px' : 'auto',
                                    right: i18n.language === 'ar' ? 'auto' : '12px',
                                    cursor: 'pointer',
                                    pointerEvents: 'auto',
                                    zIndex: 10,
                                    position: 'absolute',
                                    top: '77%',
                                    transform: 'translateY(-50%)'
                                }}
                            >
                                <CalendarTodayRoundedIcon fontSize='small' className='icon-apply' style={{color:"black",fontSize:"16px",opacity:"50%"}}/>
                            </span>
                        </div>
                    </div>

                    {/* Price Field */}
                    <div className="form-group">
                        <input
                            type="text"
                            className="form-input"
                            placeholder={pricePlaceholder}
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                            style={{
                                textAlign: i18n.language === 'ar' ? 'right' : 'left',
                                direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
                                backgroundColor: 'transparent'
                            }}
                        />
                    </div>

                    {/* File Upload Field */}
                    <div className="form-group">
                        <div className="file-upload-container">
                            <input
                                type="file"
                                id="projectFile"
                                className="file-input"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="projectFile" className="file-upload-label">
                                <span className="file-placeholder">
                                    {formData.projectFile ? formData.projectFile.name : uploadFilePlaceholder}
                                </span>
                                <span className="upload-icon">
                                    <BackupIcon style={{fontSize:"15px",color:"black",opacity:"50%"}}/>
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Notes Text Area */}
                    <div className="form-group">
                        <textarea
                            className="form-textarea"
                            placeholder={notesPlaceholder}
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            rows="4"
                            dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                            style={{
                                textAlign: i18n.language === 'ar' ? 'right' : 'left',
                                direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
                                backgroundColor: 'transparent'
                            }}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="submit-section">
                        <button 
                            type="submit" 
                            className="btn-submit"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    {t('common.submitting', 'Submitting...')}
                                </>
                            ) : (
                                submitButtonText
                            )}
                        </button>
                    </div>

                    {/* Footer Links */}
                    <div className="footer-links">
                        <a href="#" className="footer-link">{termsText}</a>
                    </div>
                </form>
            </div>

            {/* Calendar Popup Modal */}
            {showDatePicker && (
                <div className="calendar-modal-overlay" onClick={closeDatePicker}>
                    <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="calendar-modal-header">
                            <div className="calendar-month-year">
                                <span className="month-year-text">
                                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </span>
                                <span className="dropdown-arrow">▼</span>
                            </div>
                            <div className="calendar-navigation">
                                <button 
                                    className="nav-arrow"
                                    onClick={() => navigateMonth(-1)}
                                >
                                    ▲
                                </button>
                                <button 
                                    className="nav-arrow"
                                    onClick={() => navigateMonth(1)}
                                >
                                    ▼
                                </button>
                            </div>
                        </div>
                        
                        <div className="calendar-body">
                            <div className="calendar-weekdays">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                    <div key={index} className="weekday">{day}</div>
                                ))}
                            </div>
                            
                            <div className="calendar-grid">
                                {generateCalendarDays().map((dayObj, index) => (
                                    <div
                                        key={index}
                                        className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${dayObj.isSelected ? 'selected' : ''} ${dayObj.isHovered ? 'hovered' : ''}`}
                                        onClick={() => {
                                            // Allow selecting any date (including previous dates and future dates)
                                            handleDateSelect(dayObj.date);
                                        }}
                                        onMouseEnter={() => setHoveredDate(dayObj.date)}
                                        onMouseLeave={() => setHoveredDate(null)}
                                        style={{
                                            cursor: 'pointer',
                                            opacity: !dayObj.isCurrentMonth ? 0.6 : 1
                                        }}
                                    >
                                        {dayObj.day}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="calendar-footer">
                            <div className="calendar-note">
                                <small style={{color: '#666', fontSize: '12px'}}>
                                    You can select any date (past or future)
                                </small>
                            </div>
                            <div className="calendar-buttons">
                            <button className="calendar-btn clear-btn" onClick={clearDate}>
                                Clear
                            </button>
                            <button className="calendar-btn today-btn" onClick={goToToday}>
                                Today
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectOfferForm;
