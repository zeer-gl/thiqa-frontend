import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import '../css/pages/service-request-companies.scss';
import '../css/components/page-header.scss';

const ServiceRequestcompanies = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Static data for project offers
    const projectOffers = [
        {
            id: 1,
            sender: t("service-request.Ayman Aziz"),
            description: t("service-request.sent-a-new-offer-regarding-a"),
            date: "12.08.2024",
            project: t("service-request.villa-construction-project")
        },
        {
            id: 2,
            sender: t("service-request.Ayman Aziz"),
            description: t("service-request.sent-a-new-offer-regarding-a"),
            date: "12.08.2024",
            project: t("service-request.villa-construction-project")
        },
        {
            id: 3,
            sender: t("service-request.Ayman Aziz"),
            description: t("service-request.sent-a-new-offer-regarding-a"),
            date: "12.08.2024",
            project: t("service-request.villa-construction-project")
        },
        {
            id: 4,
            sender: t("service-request.Ayman Aziz"),
            description: t("service-request.sent-a-new-offer-regarding-a"),
            date: "12.08.2024",
            project: t("service-request.villa-construction-project")
        },
        {
            id: 5,
            sender: t("service-request.Ayman Aziz"),
            description: t("service-request.sent-a-new-offer-regarding-a"),
            date: "12.08.2024",
            project: t("service-request.villa-construction-project")
        }
    ];

    return (
        <div className="service-request-page">
            <PageHeader 
                title={t("service-request.project-offers")}
                subtitle={t("service-request.your-special-price-offers")}
                createButtonText={t("service-request.create-new-quote-request")}
                searchPlaceholder={t("service-request.search")}
                onCreateClick={() => navigate('/request-quote/create')}
                onSearchChange={(e) => console.log('Search:', e.target.value)}
                createType="quote"
            />
            {/* Main Content Area */}
            <div className="main-content">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-12">
                            <div className="content-wrapper">
                                {/* Form Header */}
                                <div className="form-header text-center pb-5">
                                    <h2 className="form-title ar-heading-bold">{t("service-request.create-price-quote-request")}</h2>
                                    <p className="form-subtitle">{t("service-request.enter-the-necessary-information-for-the-price-request")}</p>
                                </div>
                                
                                {/* Project Offers List */}
                                <div className="project-offers-list">
                                    {projectOffers.map((offer, index) => (
                                        <div key={offer.id} className={`offer-item ${index === 0 ? 'selected' : ''}`}>
                                            <div className="row">
                                                <div className="col-md-6 d-flex align-items-center">
                                                    <div className="offer-content">
                                                        <div className="offer-text">
                                                            <span className="sender-name">{offer.sender}</span>
                                                            <span className="offer-description"> {offer.description}</span>
                                                            <span className="sender-name"> {offer.project}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6 ">
                  
                                                    <div className="offer-actions">
                                                        <div className="action-buttons">
                                                            <button className="action-btn cancel-btn">{t("service-request.cancel")}</button>
                                                            <div className="vertical-separator"></div>
                                                            <button className="action-btn view-btn">{t("service-request.view")}</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceRequestcompanies;