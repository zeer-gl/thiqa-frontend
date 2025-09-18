import { useTranslation, Trans } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
    const { showAlert } = useContext(AlertContext);
    const [projectTypes, setProjectTypes] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(true);
    const [formValues, setFormValues] = useState({
        budget: '',
        price: ''
    });

    // Calculate total amount from budget and price
    const calculateTotal = () => {
        const budget = parseFloat(formValues.budget) || 0;
        const price = parseFloat(formValues.price) || 0;
        return budget + price;
    };

    // Handle form value changes to update total
    const handleFormValueChange = (field, value) => {
        setFormValues(prev => ({
            ...prev,
            [field]: value
        }));
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

    // Form validation schema (aligned with backend keys)
    const validationSchema = Yup.object().shape({
        title: Yup.string()
            .required(t('order-request.title-required', 'Title is required'))
            .min(5, t('order-request.title-min-length', 'Title must be at least 5 characters')),

        budget: Yup.number()
            .typeError(t('order-request.budget-number', 'Budget must be a number'))
            .required(t('order-request.budget-required', 'Budget is required')),
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
  .test('fileType', t('order-request.file-type-error', 'Only images or PDF files are allowed'), (value) => {
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
  .test('fileSize', t('order-request.file-size-error', 'File size must be 3MB or less'), (value) => {
      if (!value) return true;
      return value.size <= 3 * 1024 * 1024;
  }),
        address: Yup.string().required(t('order-request.address-required')),
        projectName: Yup.string().required(t('order-request.project-name-required', 'Project name is required')),
        price: Yup.number().typeError(t('order-request.price-number', 'Price must be a number')).required(t('order-request.price-required', 'Price is required'))
    });

    // Initial form values (aligned with backend keys)
    const initialValues = {
        title: '',
        typeOfProject: '',
        projectDesign: null,
        budget: '',
        dateOfRequest: '',
        deadline: '',
        description: '',
        address: '',
        projectName: '',
        price: ''
    };

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
        { 
            name: 'price', 
            type: 'text', 
            placeholder: t('order-request.price', 'Price'), 
            icon: 'fas fa-money-bill',
            onChange: (value) => handleFormValueChange('price', value)
        },
        { name: 'description', type: 'textarea', placeholder: t('order-request.request-description'), rows: 4 },
    ];

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
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

            // Build payload (supports optional file)
            const hasFile = values?.projectDesign instanceof File;
            let res;
            if (hasFile) {
                const formData = new FormData();
                formData.append('customerId', customerId);
                if (values.title) formData.append('title', values.title);
                if (values.description) formData.append('description', values.description);
                if (values.budget) formData.append('budget', String(values.budget));
                if (values.deadline) formData.append('deadline', values.deadline);
                if (values.address) formData.append('address', values.address);
                if (values.dateOfRequest) formData.append('dateOfRequest', values.dateOfRequest);
                if (values.typeOfProject) formData.append('typeOfProject', values.typeOfProject);
                if (values.projectName) formData.append('projectName', values.projectName);
                if (values.price) formData.append('price', String(values.price));
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
                    deadline: values.deadline || undefined,
                    address: values.address,
                    dateOfRequest: values.dateOfRequest,
                    typeOfProject: values.typeOfProject,
                    projectName: values.projectName,
                    price: Number(values.price)
                };
                res = await fetch(`${BaseUrl}/customer/create-demand-quote`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                    },
                    body: JSON.stringify(payload)
                });
            }

    
            showAlert(t('common.requestSubmittedSuccessfully', 'Request submitted successfully'), 'success');
            resetForm();
            navigate('/request-quote/success');
        } catch (e) {
            showAlert(e?.message || t('common.somethingWentWrong', 'Something went wrong'), 'error');
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
                                <RequestForm
                                    initialValues={initialValues}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSubmit}
                                    formFields={formFields}
                                    submitButtonText={t("order-request.send-request")}
                                    showFileUpload={true}
                                            />

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