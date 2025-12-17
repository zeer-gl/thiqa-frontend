import { useTranslation, Trans } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useContext, useState ,useEffect} from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import PageHeader from '../components/PageHeader';
import RequestForm from '../components/RequestForm';
import TotalSection from '../components/TotalSection';
import '../css/pages/order-request.scss';
import '../css/components/page-header.scss';
import { BaseUrl } from '../assets/BaseUrl.jsx';
import { AlertContext } from '../context/AlertContext.jsx';

const OrderRequest = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { providerId } = useParams();
    const location = useLocation();
    const { showAlert } = useContext(AlertContext);
    const [projectTypes, setProjectTypes] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(true);
    const [professionalData, setProfessionalData] = useState(null);
    const [loadingProfessional, setLoadingProfessional] = useState(false);
    const [formValues, setFormValues] = useState({
        budget: ''
    });

    // Get service name from localStorage
    const getServiceName = () => {
        try {
            const selectedService = localStorage.getItem('selectedService');
            const professionalServices = localStorage.getItem('professionalServices');
            
            if (selectedService) {
                const service = JSON.parse(selectedService);
                return t('i18n.language') === 'ar' ? service.nameAr : service.nameEn;
            }
            
            if (professionalServices) {
                const services = JSON.parse(professionalServices);
                if (services.length > 0) {
                    const firstService = services[0];
                    return t('i18n.language') === 'ar' ? firstService.nameAr : firstService.nameEn;
                }
            }
            
            return '';
        } catch (error) {
            console.error('Error getting service name:', error);
            return '';
        }
    };

    // Get first specialization from localStorage
    const getFirstSpecialization = () => {
        try {
            const firstSpecialization = localStorage.getItem('firstSpecialization');
            if (firstSpecialization) {
                const specialization = JSON.parse(firstSpecialization);
                return specialization._id || '';
            }
            return '';
        } catch (error) {
            console.error('Error getting first specialization:', error);
            return '';
        }
    };

    // Calculate total amount from budget
    // Fetch professional data by ID from URL parameters
    const fetchProfessionalById = async (professionalId) => {
        if (!professionalId) return null;
        
        try {
            setLoadingProfessional(true);
            const response = await fetch(`${BaseUrl}/professional/get-professsional/${professionalId}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error fetching professional:', errorData);
                return null;
            }
            
            const data = await response.json();
            const professional = data?.professional || data;
            
            // Save professional data to localStorage for consistency
            // Only update if we have valid professional data
            if (professional && professional._id) {
                localStorage.setItem('professionalData', JSON.stringify(professional));
                if (professional.specializations && professional.specializations.length > 0) {
                    localStorage.setItem('firstSpecialization', JSON.stringify(professional.specializations[0]));
                }
            }
            
            return professional;
        } catch (error) {
            console.error('Error fetching professional data:', error);
            return null;
        } finally {
            setLoadingProfessional(false);
        }
    };

    // Calculate total amount from budget and price
    const calculateTotal = () => {
        const budget = parseFloat(formValues.budget) || 0;
        return budget;
    };

    // Handle form value changes to update total
    const handleFormValueChange = (field, value) => {
        setFormValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // File validation function with showAlert
    const validateFileSize = (file) => {
        if (!file) return true;
        
        const maxSizeMB = 1;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        
        if (file.size > maxSizeBytes) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            showAlert(
                t('requestForm.fileSizeError', 'File size is too large ({{fileSize}}MB). Maximum allowed size is 1MB.', { fileSize: fileSizeMB }), 
                'error'
            );
            return false;
        }
        return true;
    };

    useEffect(() => {
        const fetchProjectTypes = async () => {
            try {
                const response = await fetch(`${BaseUrl}/admin/getAll-professional-categories`);
                const data = await response.json();
                setProjectTypes(data.data || []);
            } catch (error) {
                console.error('Error fetching project types:', error);
                showAlert(t('common.failedToLoad', 'Failed to load project types'), 'error');
            } finally {
                setLoadingTypes(false);
            }
        };

        fetchProjectTypes();
    }, []);

    // Fetch professional data if providerId exists in URL or query params
    useEffect(() => {
        const fetchProfessionalData = async () => {
            // Check for providerId in URL params first, then query params as fallback
            const professionalId = providerId || new URLSearchParams(location.search).get('professionalId');
            
            if (professionalId) {
                const professional = await fetchProfessionalById(professionalId);
                setProfessionalData(professional);
            } else {
                // Only clear professional data state, don't clear localStorage
                // localStorage should be preserved for other components
                setProfessionalData(null);
                
                // Don't clear localStorage data when there's no provider ID
                // This allows the form to use localStorage data for auto-fill
                console.log('No provider ID - preserving localStorage data for auto-fill');
            }
        };

        fetchProfessionalData();
    }, [providerId, location.search]);

    // Form validation schema (aligned with backend keys)
    const validationSchema = Yup.object().shape({
        title: Yup.string()
            .required(t('order-request.title-required', 'Title is required')),

        budget: Yup.number()
            .typeError(t('order-request.budget-number', 'Budget must be a number'))
            .required(t('order-request.budget-required', 'Budget is required'))
            .min(0.01, t('order-request.budget-positive', 'Budget must be greater than 0')),
        dateOfRequest: Yup.date()
            .required(t('order-request.date-required'))
            .min(new Date(new Date().setHours(0,0,0,0)), t('order-request.date-future')),
            typeOfProject: Yup.string()
            .required(t('order-request.project-type-required')),
      
        description: Yup.string()
            .required(t('order-request.description-required'))
            .min(10, t('order-request.description-min-length')),
            projectDesign: Yup.mixed()
  .required(t('order-request.file-required'))
  .test('fileType', t('requestForm.fileTypeError', 'Please upload only image files (JPEG, PNG, GIF) or PDF files.'), (value) => {
      if (!value) return true;
      if (!value.type) return true;
      
      const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf'
      ];
      
      return allowedTypes.includes(value.type);
  })
  .test('fileSize', t('requestForm.fileSizeErrorGeneric', 'File size is too large. Maximum allowed size is 1MB.'), (value) => {
      if (!value) return true;
      return value.size <= 1 * 1024 * 1024;
  }),
        address: Yup.string().required(t('order-request.address-required')),
        projectName: Yup.string().required(t('order-request.project-name-required', 'Project name is required'))
    });

    // Get professional data from localStorage
    const getProfessionalData = () => {
        try {
            const professionalData = localStorage.getItem('professionalData');
            return professionalData ? JSON.parse(professionalData) : null;
        } catch (error) {
            console.error('Error getting professional data:', error);
            return null;
        }
    };

    // Get the current provider ID from URL or query params
    const getCurrentProviderId = () => {
        return providerId || new URLSearchParams(location.search).get('professionalId');
    };

    // Initial form values (aligned with backend keys)
    const initialValues = {
        title: getCurrentProviderId() && professionalData ? professionalData.name : (getCurrentProviderId() ? '' : ''),
        typeOfProject: getCurrentProviderId() && professionalData?.specializations?.[0]?._id ? professionalData.specializations[0]._id : (getCurrentProviderId() ? '' : ''),
        projectDesign: null,
        budget: '',
        dateOfRequest: '',
        deadline: '',
        description: '',
        address: '',
        projectName: getProfessionalData()?.name || '',
        projectName: getCurrentProviderId() && professionalData ? professionalData.name : (getCurrentProviderId() ? '' : ''),
        price: ''
    };

    // Debug logging
    console.log('OrderRequest Debug:', {
        providerId: getCurrentProviderId(),
        professionalData: professionalData,
        localStorageData: getProfessionalData(),
        serviceName: getServiceName(),
        firstSpecialization: getFirstSpecialization(),
        initialValues: initialValues
    });

    // Form fields configuration (order and names per backend)
    const formFields = [
        { name: 'title', type: 'text', placeholder: t('order-request.title', 'Title'), icon: 'fas fa-tag' },

        { 
            name: 'budget', 
            type: 'text', 
            placeholder: t('order-request.budget', 'Budget'), 
            icon: 'fas fa-dollar-sign',
            onChange: (value) => handleFormValueChange('budget', value)
        },
        { name: 'projectDesign', type: 'file', placeholder: t('order-request.upload-project-design'), icon: 'fas fa-cloud-upload-alt' },
        { name: 'address', type: 'text', placeholder: t('order-request.address'), icon: 'fas fa-map-marker-alt' },
        { name: 'dateOfRequest', type: 'date', placeholder: t('order-request.request-date'), icon: 'fas fa-calendar' },
        { 
            name: 'typeOfProject', 
            type: 'select', 
            placeholder: t('order-request.project-type'), 
            icon: 'fas fa-project-diagram',
            options: projectTypes.map(type => ({
                value: type._id,
                label: type.name
            }))
        },
        { name: 'projectName', type: 'text', placeholder: t('order-request.project-name', 'Project Name'), icon: 'fas fa-project-diagram' },
        { name: 'description', type: 'textarea', placeholder: t('order-request.request-description'), rows: 4 },
    ];

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            // Validate file size before submission
            if (values.projectDesign && !validateFileSize(values.projectDesign)) {
                setSubmitting(false);
                return;
            }

            // Get customerId from localStorage
            let customerId = null;
            try {
                const storedUser = localStorage.getItem('userData');
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    customerId = parsed?._id || parsed?.id || null;
                }
                if (!customerId) customerId = localStorage.getItem('userId');
            } catch {}

            if (!customerId) {
                throw new Error(t('common.userNotFound') || 'User not found');
            }

            // Get professional ID from URL if exists
            const professionalId = getCurrentProviderId();
            
            // Build payload (supports optional file)
            const hasFile = values?.projectDesign instanceof File;
            let res;
            if (hasFile) {
                const formData = new FormData();
                formData.append('customerId', customerId);
                if (values.title) formData.append('title', values.title);
                if (values.description) formData.append('description', values.description);
                if (values.budget) formData.append('budget', String(values.budget));
                if (values.budget) formData.append('price', String(values.budget));
                if (values.deadline) formData.append('deadline', values.deadline);
                if (values.address) formData.append('address', values.address);
                if (values.dateOfRequest) formData.append('dateOfRequest', values.dateOfRequest);
                if (values.typeOfProject) formData.append('typeOfProject', values.typeOfProject);
                if (values.projectName) formData.append('projectName', values.projectName);
                if (values.price) formData.append('price', String(values.price));
                // Add serviceId (selected service/category)
                if (values.typeOfProject) formData.append('serviceId', values.typeOfProject);
                // Add professional ID if exists (for specific professional targeting)
                if (professionalId) formData.append('professionalId', professionalId);
                formData.append('projectDesign', values.projectDesign);

                res = await fetch(`${BaseUrl}/customer/create-demand-quote`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                    },
                    body: formData
                });
            } else {
                const payload = {
                    customerId,
                    title: values.title,
                    description: values.description,
                    budget: Number(values.budget),
                    price: Number(values.budget),
                    deadline: values.deadline || undefined,
                    address: values.address,
                    dateOfRequest: values.dateOfRequest,
                    typeOfProject: values.typeOfProject,
                    projectName: values.projectName
                };
                
                // Add serviceId (selected service/category)
                if (values.typeOfProject) {
                    payload.serviceId = values.typeOfProject;
                }
                
                // Add professional ID if exists (for specific professional targeting)
                if (professionalId) {
                    payload.professionalId = professionalId;
                }
                res = await fetch(`${BaseUrl}/customer/create-demand-quote`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                    },
                    body: JSON.stringify(payload)
                });
            }

    
            const result = await res.json();
            
            if (!res.ok) {
                const errorData = result;
                let errorMessage = errorData.message || errorData.error || t('common.errorCreatingDemandQuote', 'Error creating demand quote');
                
                // Try to translate common backend errors
                if (errorData.message || errorData.error) {
                    const backendError = (errorData.message || errorData.error).toLowerCase();
                    if (backendError.includes('notification validation failed') || backendError.includes('message_ar')) {
                        errorMessage = t('common.notificationSystemError');
                    } else if (backendError.includes('cast to string failed')) {
                        errorMessage = t('common.dataFormatError');
                    }
                }
                
                showAlert(errorMessage, 'error');
                setSubmitting(false);
                return;
            }
            
            showAlert(t('common.requestSubmittedSuccessfully', 'Request submitted successfully'), 'success');
            resetForm();
            navigate('/request-quote/success');
        } catch (e) {
            const errorMessage = e?.message || t('common.errorCreatingDemandQuote', 'Error creating demand quote');
            showAlert(errorMessage, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="order-request-page">
            <PageHeader 
                title={t("order-request.price-quote-request")}
                subtitle={t("order-request.your-special-price-offers")}
                createButtonText={t("order-request.view-quote-request")}
                onCreateClick={() => navigate('/request-quote/list')}
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
                                    <h2 className="form-title mb-3 fw-bold">{t("order-request.createQuoteRequest", "Create Quote Request")}</h2>
                                    <p className="form-subtitle">{t("order-request.enter-the-necessary-information-for-the-price-request")}</p>
                                </div>
                             

                                {/* RequestForm Component */}
                                {loadingProfessional ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-2">{t('common.loading', 'Loading professional data...')}</p>
                                    </div>
                                ) : (
                                    <RequestForm
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        onSubmit={handleSubmit}
                                        formFields={formFields}
                                        submitButtonText={t("order-request.send-request")}
                                        showFileUpload={true}
                                    />
                                )}

                                {/* Total Section */}
                                <TotalSection amount={calculateTotal()} currency="kwd" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderRequest;