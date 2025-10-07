import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as Yup from 'yup';
import { useAlert } from '../context/AlertContext';
import PageHeader from '../components/PageHeader';
import RequestForm from '../components/RequestForm';
import '../css/pages/service-request.scss';
import { BaseUrl } from '../assets/BaseUrl.jsx';

const ServiceRequest = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { showAlert } = useAlert();
    const [selectedService, setSelectedService] = useState('');
    const [serviceCategories, setServiceCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Image compression function
    const compressImage = (file, quality = 0.8, maxWidth = 1920, maxHeight = 1080) => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas to blob conversion failed'));
                        }
                    },
                    file.type,
                    quality
                );
            };
            
            img.onerror = () => reject(new Error('Image loading failed'));
            img.src = URL.createObjectURL(file);
        });
    };

    // Fetch professional categories from API
    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch(`${BaseUrl}/admin/getAll-professional-categories`);
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            // add token to the request
            const data = await response.json();
            console.log('Categories fetched:', data.data);
            
            // Test specific category image
            const kingJh5Category = data.data?.find(cat => cat.name === 'king jh5');
            if (kingJh5Category) {
                console.log('King jh5 category found:', kingJh5Category);
                console.log('King jh5 image URL:', kingJh5Category.image?.url);
            }
            
            setServiceCategories(data.data || []);
            // Set first category as default if available
            if (data.data && data.data.length > 0) {
                setSelectedService(data.data[0]._id);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        
        // Test the specific image URL you mentioned
        const testImage = new Image();
        testImage.onload = () => {
            console.log('✅ Test image loaded successfully:', 'https://res.cloudinary.com/dv3kx5ytd/image/upload/v1737462538/products/xpouflnyd2odx7cmpqhu.jpg');
        };
        testImage.onerror = () => {
            console.error('❌ Test image failed to load:', 'https://res.cloudinary.com/dv3kx5ytd/image/upload/v1737462538/products/xpouflnyd2odx7cmpqhu.jpg');
        };
        testImage.src = 'https://res.cloudinary.com/dv3kx5ytd/image/upload/v1737462538/products/xpouflnyd2odx7cmpqhu.jpg';
    }, []);

    // Get selected category
    const selectedCategory = serviceCategories.find(cat => cat._id === selectedService);

    // Get professionalId from URL params or localStorage
    const getProfessionalId = () => {
        // Check URL query params
        const professionalId = new URLSearchParams(location.search).get('professionalId');
        if (professionalId) return professionalId;
        
        // Fallback to localStorage if available
        try {
            const professionalData = localStorage.getItem('professionalData');
            if (professionalData) {
                const parsed = JSON.parse(professionalData);
                return parsed?._id || null;
            }
        } catch (error) {
            console.error('Error getting professional ID:', error);
        }
        return null;
    };

    // Update form when category is selected
    useEffect(() => {
        if (selectedCategory && selectedCategory._id) {
            console.log('Category selected, updating typeOfProject:', selectedCategory._id);
            console.log('Selected service state:', selectedService);
            console.log('Selected category object:', selectedCategory);
        }
    }, [selectedCategory, selectedService]);

    // Form validation schema
    const validationSchema = Yup.object().shape({
        title: Yup.string().required(t('basic-services-request.title-required')),
        description: Yup.string()
            .required(t('basic-services-request.description-required'))
            .min(10, t('basic-services-request.description-min-length')),
        budget: Yup.string().required(t('basic-services-request.budget-required')),
        deadline: Yup.string().required(t('basic-services-request.deadline-required')),
        projectDesign: Yup.mixed().nullable(),
        address: Yup.string().required(t('basic-services-request.address-required')),
        typeOfProject: Yup.string().required(t('basic-services-request.type-required')),
        projectName: Yup.string().required(t('basic-services-request.project-name-required')),
        price: Yup.string().required(t('basic-services-request.price-required')),
    });

    // Initial form values
    const initialValues = {
        title: '',
        description: '',
        budget: '',
        deadline: '',
        projectDesign: null,
        address: '',
        typeOfProject: selectedCategory?._id || '',
        projectName: '',
        price: ''
    };

    // Form fields configuration based on API requirements
    const formFields = [
        {
            name: 'title',
            type: 'text',
            placeholder: t('common.title', 'Project Title'),
            icon: 'fas fa-heading'
        },
        {
            name: 'description',
            type: 'textarea',
            placeholder: t('common.description', 'Project Description'),
            rows: 4
        },
        {
            name: 'budget',
            type: 'text',
            placeholder: t('common.budget', 'Budget Amount'),
            icon: 'fas fa-dollar-sign'
        },
        {
            name: 'deadline',
            type: 'date',
            placeholder: t('common.deadline', 'Project Deadline'),
            icon: 'fas fa-calendar'
        },
        {
            name: 'projectDesign',
            type: 'file',
            placeholder: t('common.projectDesign', 'Upload Project Design')
        },
        {
            name: 'address',
            type: 'text',
            placeholder: t('common.address', 'Project Address'),
            icon: 'fas fa-map-marker-alt'
        },
        {
            name: 'projectName',
            type: 'text',
            placeholder: t('common.projectName', 'Project Name'),
            icon: 'fas fa-project-diagram'
        },
        {
            name: 'price',
            type: 'text',
            placeholder: t('common.price', 'Expected Price'),
            icon: 'fas fa-tag'
        }
    ];



    // Handle form submission
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        console.log('🚀 Form submission started');
        console.log('Form values:', values);
        console.log('Selected category:', selectedCategory);
        console.log('typeOfProject value in form:', values.typeOfProject);
        console.log('selectedService state:', selectedService);
        
        // Validate required fields
        if (!values.title || !values.description || !values.budget || !values.deadline || !values.address || !values.projectName || !values.price) {
            showAlert(t('common.fillRequiredFields', 'Please fill in all required fields'), 'error');
            return;
        }
        
        if (!selectedCategory) {
            showAlert(t('common.selectCategory', 'Please select a category'), 'error');
            return;
        }

        // Validate file size if projectDesign is provided
        if (values.projectDesign) {
            const maxSize = 5 * 1024 * 1024; // 5MB limit
            if (values.projectDesign.size > maxSize) {
                showAlert(t('common.fileSizeTooLarge'), 'error');
                return;
            }
            
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
            if (!allowedTypes.includes(values.projectDesign.type)) {
                showAlert(t('common.invalidFileType'), 'error');
                return;
            }
        }
        
        try {
            setSubmitting(true);
            setSubmitting(true); // Set our local submitting state too
            
            // Get customer ID from localStorage
            let customerId = null;
            try {
                const stored = localStorage.getItem('userData');
                console.log('Raw userData from localStorage:', stored);
                
                if (stored) {
                    const parsed = JSON.parse(stored);
                    console.log('Parsed userData:', parsed);
                    customerId = parsed?._id || null;
                    console.log('Extracted customerId:', customerId);
                }
                
                // Fallback to userId if userData doesn't have _id
                if (!customerId) {
                    customerId = localStorage.getItem('userId');
                    console.log('Fallback customerId from userId:', customerId);
                }
            } catch (err) {
                console.error('Error getting customer ID:', err);
                showAlert(t('common.errorReadingUserData'), 'error');
                return;
            }

            if (!customerId) {
                showAlert(t('common.userNotFound'), 'error');
                return;
            }
            
            console.log('Final customerId being used:', customerId);
            console.log('Selected category for API:', selectedCategory);
            console.log('Category _id being sent:', selectedCategory._id);
            console.log('Date of request being sent:', new Date().toISOString());

            // Validate selectedCategory is not an object that could cause issues
            if (selectedCategory && typeof selectedCategory === 'object') {
                console.log('Selected category object:', selectedCategory);
                if (!selectedCategory._id) {
                    showAlert(t('common.invalidCategorySelected'), 'error');
                    return;
                }
            }

            // Prepare form data for API - ensure all values are strings and clean
            const formData = new FormData();
            
            // Clean and validate all string values
            const cleanString = (value) => {
                if (value === null || value === undefined) return '';
                if (typeof value === 'object') {
                    console.error('Object detected, converting to string:', value);
                    return JSON.stringify(value);
                }
                return String(value).trim();
            };
            
            formData.append('customerId', cleanString(customerId));
            formData.append('title', cleanString(values.title));
            formData.append('description', cleanString(values.description));
            formData.append('budget', cleanString(values.budget));
            formData.append('price', cleanString(values.budget));
            formData.append('deadline', cleanString(values.deadline));
            formData.append('dateOfRequest', new Date().toISOString());
            formData.append('address', cleanString(values.address));
            formData.append('typeOfProject', cleanString(selectedCategory._id));
            formData.append('projectName', cleanString(values.projectName));
            formData.append('price', cleanString(values.price));
            
            // Add serviceId (selected category/service ID)
            if (selectedCategory && selectedCategory._id) {
                formData.append('serviceId', cleanString(selectedCategory._id));
            }
            
            // Add professionalId if available from URL params or localStorage
            const professionalId = getProfessionalId();
            if (professionalId) {
                formData.append('professionalId', cleanString(professionalId));
            }
            
            // Debug: Log all form values to ensure they're strings
            console.log('Form values being sent (all converted to strings):');
            console.log('customerId:', String(customerId));
            console.log('title:', String(values.title));
            console.log('description:', String(values.description));
            console.log('budget:', String(values.budget));
            console.log('deadline:', String(values.deadline));
            console.log('address:', String(values.address));
            console.log('typeOfProject:', String(selectedCategory._id));
            console.log('projectName:', String(values.projectName));
            console.log('price:', String(values.price));
            console.log('serviceId:', selectedCategory?._id ? String(selectedCategory._id) : 'Not provided');
            console.log('professionalId:', getProfessionalId() || 'Not provided');
            
            // Add file if selected (with size validation)
            if (values.projectDesign) {
                // Compress image if it's an image file and too large
                if (values.projectDesign.type.startsWith('image/') && values.projectDesign.size > 2 * 1024 * 1024) {
                    try {
                        const compressedFile = await compressImage(values.projectDesign, 0.8, 1920, 1080);
                        formData.append('projectDesign', compressedFile, values.projectDesign.name);
                        console.log('Image compressed from', values.projectDesign.size, 'to', compressedFile.size);
                    } catch (compressionError) {
                        console.warn('Image compression failed, using original:', compressionError);
                        formData.append('projectDesign', values.projectDesign);
                    }
                } else {
                formData.append('projectDesign', values.projectDesign);
                }
            }

            // Debug: Log form data and validate no objects are being sent
            console.log('Form data being sent:');
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
                // Check if any value is an object
                if (typeof value === 'object' && value !== null && !(value instanceof File)) {
                    console.error('WARNING: Object detected in form data:', key, value);
                }
            }
            console.log('All form values:', values);

            // Additional validation: ensure no objects in form values
            Object.keys(values).forEach(key => {
                if (typeof values[key] === 'object' && values[key] !== null && !(values[key] instanceof File)) {
                    console.error('WARNING: Object detected in form values:', key, values[key]);
                }
            });

            // Call create API with proper headers and timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
            
            const response = await fetch(`${BaseUrl}/customer/create-demand-quote`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                    // Don't set Content-Type for FormData, let browser set it with boundary
                },
                body: formData,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            console.log('API Response status:', response.status);
            console.log('API Response headers:', response.headers);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error:', errorData);
                
                // Handle specific error cases
                let errorMessage = errorData.message || errorData.error || `Failed to create quote request (${response.status})`;
                
                if (response.status === 413) {
                    errorMessage = t('common.fileSizeTooLargeError');
                } else if (errorData.error && errorData.error.includes('Notification validation failed')) {
                    errorMessage = t('common.notificationSystemError');
                } else if (errorData.error && errorData.error.includes('message_ar')) {
                    errorMessage = t('common.notificationSystemError');
                } else if (errorData.error && errorData.error.includes('Cast to string failed')) {
                    errorMessage = t('common.dataFormatError');
                }
                
                showAlert(errorMessage, 'error');
                return;
            }

            const result = await response.json();
            console.log('✅ Quote request created successfully:', result);
            
            showAlert(t('common.requestSentSuccessfully'), 'success');
            resetForm();
            
            // Redirect to success page
            navigate('/request-quote/success');
            
        } catch (error) {
            console.error('Error creating quote request:', error);
            
            // Handle specific error cases
            let errorMessage = t('common.requestFailed');
            
            if (error.name === 'AbortError') {
                errorMessage = t('common.requestTimeout');
            } else if (error.message.includes('User not found')) {
                errorMessage = t('common.userNotFound');
            } else if (error.message.includes('Error reading user data')) {
                errorMessage = t('common.errorReadingUserData');
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = t('common.networkError');
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            showAlert(errorMessage, 'error');
        } finally {
            setSubmitting(false);
            setSubmitting(false); // Reset our local submitting state too
        }
    };

    return (
        <div className="service-request-page">
            <PageHeader
                title={t('basic-services-request.title')}
                subtitle={t('basic-services-request.your-special-offers')}
                createButtonText={t('basic-services-request.create-new-price-offer-request')}
                onCreateClick={() => navigate('/request-quote/create')}
                createType="quote"
                showSearch={false}
            />

            {/* Main Content Area */}
            <div className="main-content">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="content-wrapper">
                                {/* Form Header */}
                                <div className="form-header text-center">
                                    <h2 className="form-title mb-3 ar-heading-bold">{t('basic-services-request.title')}</h2>
                                    <p className="form-subtitle">{t('basic-services-request.request-service-description')}</p>
                                </div>

                                {/* Service Category Selection */}
                                <div className="service-categories mb-4">
                                    {loading && (
                                        <div className="text-center py-4">{t('common.loading')}</div>
                                    )}
                                    {error && (
                                        <div className="text-center py-4 text-danger">{error}</div>
                                    )}
                                    {!loading && !error && (
                                        <div className="categories-horizontal">
                                        {serviceCategories.map((category) => (
                                            <button
                                                    key={category._id}
                                                    className={`category-btn-horizontal ${selectedService === category._id ? 'active' : ''}`}
                                                    onClick={() => setSelectedService(category._id)}
                                            >
                                                <div className="category-icon">
                                                        {category.image ? (
                                                            <img 
                                                                src={category.image.url} 
                                                                alt={category.name}
                                                                onLoad={(e) => {
                                                                    console.log(`Image loaded successfully for ${category.name}:`, category.image.url);
                                                                    e.target.style.display = 'block';
                                                                    e.target.nextSibling.style.display = 'none';
                                                                }}
                                                                onError={(e) => {
                                                                    console.error(`Image failed to load for ${category.name}:`, category.image.url);
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                                style={{ display: 'none' }}
                                                            />
                                                        ) : null}
                                                        <div 
                                                            className="default-icon"
                                                            style={{ display: category.image?.url ? 'none' : 'flex' }}
                                                        >
                                                            <i className="fas fa-folder"></i>
                                                        </div>
                                                </div>
                                                <span className="category-name">{category.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                    )}
                                </div>

                            
                            
                                <RequestForm
                                    key={selectedService} // Force re-render when category changes
                                    initialValues={{
                                        ...initialValues,
                                        typeOfProject: selectedCategory?._id || ''
                                    }}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSubmit}
                                    formFields={formFields}
                                    submitButtonText={submitting ? t('common.loading') : t('basic-services-request.send-request')}
                                    showTotal={true}
                                    isSubmitting={submitting}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceRequest; 