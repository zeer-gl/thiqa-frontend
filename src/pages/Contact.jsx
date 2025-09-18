import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import RequestForm from '../components/RequestForm';
import * as Yup from 'yup';
import '../css/pages/contact.scss';
import BannerPattern from '../assets/payment/layer-image.svg';
import Cityscape from '../assets/payment/dubai-skyline-sunset-time-united.svg';

const Contact = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

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
        // Handle form submission here
        formikBag.resetForm();
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
                                        showSubmitButton={false}
                                    />

                                    {/* Contact Buttons */}
                                    <div className="contact-buttons">
                                        <button className="contact-btn call-btn">
                                            <i className="fas fa-phone-alt"></i>
                                            <span>{t('contact.call-us')}</span>
                                        </button>
                                        
                                        <button className="contact-btn whatsapp-btn">
                                            <i className="fab fa-whatsapp"></i>
                                            <span>{t('contact.chat-whatsapp')}</span>
                                        </button>
                                        
                                        <button className="contact-btn email-btn">
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
        </div>
    );
};

export default Contact; 