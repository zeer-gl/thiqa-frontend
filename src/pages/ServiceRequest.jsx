import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useAlert } from '../context/AlertContext';
import PageHeader from '../components/PageHeader';
import RequestForm from '../components/RequestForm';
import '../css/pages/service-request.scss';
import { BaseUrl } from '../assets/BaseUrl.jsx';

const ServiceRequest = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [selectedService, setSelectedService] = useState('');
    const [serviceCategories, setServiceCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Fetch professional categories from API
    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch(`${BaseUrl}/admin/getAll-professional-categories`);
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
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
                showAlert('Error reading user data from localStorage. Please login again.', 'error');
                return;
            }

            if (!customerId) {
                showAlert('User not found. Please login again.', 'error');
                return;
            }
            
            console.log('Final customerId being used:', customerId);
            console.log('Selected category for API:', selectedCategory);
            console.log('Category _id being sent:', selectedCategory._id);
            console.log('Date of request being sent:', new Date().toISOString());

            // Prepare form data for API
            const formData = new FormData();
            formData.append('customerId', customerId);
            formData.append('title', values.title);
            formData.append('description', values.description);
            formData.append('budget', values.budget);
            formData.append('deadline', values.deadline);
            formData.append('dateOfRequest', new Date().toISOString()); // Add current date as dateOfRequest
            formData.append('address', values.address);
            formData.append('typeOfProject', selectedCategory._id); // Send category _id instead of name
            formData.append('projectName', values.projectName);
            formData.append('price', values.price);
            
            // Add file if selected
            if (values.projectDesign) {
                formData.append('projectDesign', values.projectDesign);
            }

            // Debug: Log form data
            console.log('Form data being sent:');
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            console.log('All form values:', values);

            // Call create API
            const response = await fetch(`${BaseUrl}/customer/create-demand-quote`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: formData
            });

            console.log('API Response status:', response.status);
            console.log('API Response headers:', response.headers);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error:', errorData);
                
                // Show specific error message
                const errorMessage = errorData.message || errorData.error || `Failed to create quote request (${response.status})`;
                showAlert(`API Error: ${errorMessage}`, 'error');
                return;
            }

            const result = await response.json();
            console.log('✅ Quote request created successfully:', result);
            
            showAlert('Request sent successfully!', 'success');
            resetForm();
            
            // Redirect to success page
            navigate('/request-quote/success');
            
        } catch (error) {
            console.error('Error creating quote request:', error);
            
            // Show specific error message
            if (error.message.includes('User not found')) {
                showAlert('User not found. Please login again.', 'error');
            } else if (error.message.includes('Error reading user data')) {
                showAlert('Error reading user data. Please login again.', 'error');
            } else {
                showAlert(`Error: ${error.message || 'Request failed'}`, 'error');
            }
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