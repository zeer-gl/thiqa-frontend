import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAlert } from '../context/AlertContext';
import PageHeader from '../components/PageHeader';
import RequestForm from '../components/RequestForm';
import ContactFormModal from '../components/ContactFormModal';
import * as Yup from 'yup';
import '../css/pages/contact.scss';
import '../css/components/contact-form-modal.scss';
import BannerPattern from '../assets/payment/layer-image.svg';
import Cityscape from '../assets/payment/dubai-skyline-sunset-time-united.svg';

const Contact = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    
    // Modal state management
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(null);

    // Form configuration
    const formFields = [
        {
            name: 'name',
            type: 'text',
            placeholder: t('contact.name')
        },
        {
            name: 'email',
            type: 'email',
            placeholder: t('contact.email')
        },
        {
            name: 'message',
            type: 'textarea',
            placeholder: t('contact.message'),
            rows: 4
        }
    ];

    const initialValues = {
        name: '',
        email: '',
        message: ''
    };

    const validationSchema = Yup.object({
        name: Yup.string().required(t('contact.name-required')),
        email: Yup.string().email(t('contact.email-invalid')).required(t('contact.email-required')),
        message: Yup.string().required(t('contact.message-required'))
    });

    const handleSubmit = (values, formikBag) => {
        console.log('Contact form submitted:', values);
        // Show only toaster notification and do not open modal
        showAlert(t('contact.form-submitted-successfully', 'Form Submitted Successfully'), 'success');
        formikBag.resetForm();
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData(null);
    };

    // Handle contact button clicks
    const handleCallClick = () => {
        console.log('📞 Call button clicked');
        window.open('tel:+96512345678', '_self');
    };

    const handleWhatsAppClick = () => {
        console.log('💬 WhatsApp button clicked');
        window.open('https://wa.me/96512345678?text=Hello, I would like to get in touch.', '_blank');
    };

    const handleEmailClick = () => {
        console.log('📧 Email button clicked');
        window.open('mailto:info@thiqa.com?subject=Contact Form Inquiry&body=Hello, I would like to get in touch.', '_blank');
    };

    return (
        <div className="contact-page">
       
     

            {/* Decorative Banner Section */}
            <div className="container" style={{marginTop: '60px'}}>
                <div className="row">
                    <div className="col-12">
                        <div className="decorative-banner">
                            <img src={BannerPattern} alt="Banner Pattern" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="main-content">
                <div className="container">
                    <div className="row">
                     
                        {/* Left Column - Contact Form */}
                        <div className="col-lg-6">
                            <div className="contact-form-section">
                                <div className="contact-content">
                                    <h2 className="contact-title mb-2">{t('contact.contact-us')}</h2>
                                    <p className="contact-subtitle mb-3">{t('contact.contact-subtitle')}</p>
                                    
                                    <RequestForm
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        onSubmit={handleSubmit}
                                        formFields={formFields}
                                        showSubmitButton={true}
                                        submitButtonText={t('contact.send-message')}
                                    />

                                    {/* Contact Buttons */}
                                    <div className="contact-buttons">
                                        <button 
                                            type="button"
                                            className="contact-btn call-btn"
                                            onClick={handleCallClick}
                                        >
                                            <i className="fas fa-phone-alt"></i>
                                            <span>{t('contact.call-us')}</span>
                                        </button>
                                        
                                        <button 
                                            type="button"
                                            className="contact-btn whatsapp-btn"
                                            onClick={handleWhatsAppClick}
                                        >
                                            <i className="fab fa-whatsapp"></i>
                                            <span>{t('contact.chat-whatsapp')}</span>
                                        </button>
                                        
                                        <button 
                                            type="button"
                                            className="contact-btn email-btn"
                                            onClick={handleEmailClick}
                                        >
                                            <i className="fas fa-envelope"></i>
                                            <span>{t('contact.email-us')}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                           {/* right Column - Cityscape Image */}
                           <div className="col-lg-6">
                            <div className="cityscape-section">
                                <div className="cityscape-image">
                                   <img src={Cityscape} alt={t('contact.cityscape-placeholder')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Form Modal disabled per requirement to only show toaster */}
        </div>
    );
};

export default Contact; 