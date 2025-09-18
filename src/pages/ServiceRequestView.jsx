import React, {useState, useEffect} from "react";
import {useTranslation} from 'react-i18next';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronDown, faChevronUp} from '@fortawesome/free-solid-svg-icons';
import {faHeart} from '@fortawesome/free-regular-svg-icons';
import SidePattern from '/public/images/side-pattern.svg';

// Import icons for services
import waterIcon from '../assets/payment/icon_water.svg';
import sandIcon from '../assets/payment/sandbox.svg';
import bricksIcon from '../assets/payment/bricks.svg';
import cementIcon from '../assets/payment/concrete-bag.svg';
import ironIcon from '../assets/payment/paint-roll.svg';

// Import components
import ServiceProjectCard from '../components/ServiceProjectCard';

function ServiceRequestView() {
    const {t, i18n} = useTranslation();
    const [selectedService, setSelectedService] = useState('water');
    const [expandedItems, setExpandedItems] = useState({});

    // Ensure page is in LTR (English) by default
    useEffect(() => {
        if (i18n.language !== 'en') {
            i18n.changeLanguage('en');
        }
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = 'en';
    }, [i18n]);

    // Service data
    const services = [
        {id: 'water', name: t('pages.serviceRequestView.basicServices.services.water'), icon: waterIcon, color: '#21395D'},
        {id: 'sand', name: t('pages.serviceRequestView.basicServices.services.sand'), icon: sandIcon, color: '#EEE7DB'},
        {id: 'bricks', name: t('pages.serviceRequestView.basicServices.services.bricks'), icon: bricksIcon, color: '#EEE7DB'},
        {id: 'cement', name: t('pages.serviceRequestView.basicServices.services.cement'), icon: cementIcon, color: '#EEE7DB'},
        {id: 'iron', name: t('pages.serviceRequestView.basicServices.services.iron'), icon: ironIcon, color: '#EEE7DB'}
    ];

    // Project data - this would change based on selected service
    const getProjectsByService = (serviceId) => {
        const projectData = {
            water: [
                {id: 1, title: t('pages.serviceRequestView.projects.villaConstruction'), subtitle: t('pages.serviceRequestView.projects.fullConstruction'), offers: 5},
                {id: 2, title: t('pages.serviceRequestView.projects.villaConstruction'), subtitle: t('pages.serviceRequestView.projects.fullConstruction'), offers: 3},
                {id: 3, title: t('pages.serviceRequestView.projects.villaConstruction'), subtitle: t('pages.serviceRequestView.projects.fullConstruction'), offers: 7}
            ],
            sand: [
                {id: 1, title: t('pages.serviceRequestView.projects.sandSupply'), subtitle: t('pages.serviceRequestView.projects.bulkDelivery'), offers: 4},
                {id: 2, title: t('pages.serviceRequestView.projects.sandSupply'), subtitle: t('pages.serviceRequestView.projects.bulkDelivery'), offers: 6}
            ],
            bricks: [
                {id: 1, title: t('pages.serviceRequestView.projects.brickSupply'), subtitle: t('pages.serviceRequestView.projects.constructionMaterials'), offers: 8},
                {id: 2, title: t('pages.serviceRequestView.projects.brickSupply'), subtitle: t('pages.serviceRequestView.projects.constructionMaterials'), offers: 2}
            ],
            cement: [
                {id: 1, title: t('pages.serviceRequestView.projects.cementSupply'), subtitle: t('pages.serviceRequestView.projects.bulkCement'), offers: 5},
                {id: 2, title: t('pages.serviceRequestView.projects.cementSupply'), subtitle: t('pages.serviceRequestView.projects.bulkCement'), offers: 4}
            ],
            iron: [
                {id: 1, title: t('pages.serviceRequestView.projects.ironSupply'), subtitle: t('pages.serviceRequestView.projects.constructionSteel'), offers: 6},
                {id: 2, title: t('pages.serviceRequestView.projects.ironSupply'), subtitle: t('pages.serviceRequestView.projects.constructionSteel'), offers: 3}
            ]
        };
        return projectData[serviceId] || [];
    };

    const toggleAccordion = (itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    return (
        <div className="service-request-view">
            <div>
                <img className='side-pattern' src={SidePattern} alt=""/>
            </div>
            <div className="container">
                {/* Basic Services Section */}
                <div className="basic-services-section">
                    <div className="service-header">
                        <div className="heart-icon">
                            <FontAwesomeIcon icon={faHeart}/>
                        </div>
                        <div className="service-title">
                            <h2 className="ar-heading-bold">{t('pages.serviceRequestView.basicServices.title')}</h2>
                            <p>{t('pages.serviceRequestView.basicServices.subtitle')}</p>
                        </div>
                    </div>

                    <div className="service-tabs">
                        {services.map((service) => (
                            <button
                                key={service.id}
                                className={`service-tab ${selectedService === service.id ? 'active' : ''}`}
                                onClick={() => setSelectedService(service.id)}
                                style={{
                                    backgroundColor: selectedService === service.id ? service.color : '#EEE7DB'
                                }}
                            >
                                <img src={service.icon} alt={service.name}/>
                                <span>{service.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Projects Accordion Section */}
                <div className="projects-section">
                    {getProjectsByService(selectedService).map((project) => (
                        <ServiceProjectCard
                            key={project.id}
                            project={project}
                            isExpanded={expandedItems[project.id]}
                            onToggle={toggleAccordion}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ServiceRequestView;
