import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import '../css/pages/product-showcase.scss';
import layerImage from '../assets/payment/layer-image.svg';
import emblemeLogo from '../assets/payment/Embleme.svg';
import mobileMockup from '../assets/payment/mobile.svg';
import modernCeilingLights from '../assets/payment/modern-ceiling-lights.svg';

const ProductShowcase = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Product categories
    const categories = [
        { id: 'commercial', name: t('product-showcase.commercial'), icon: '🏢' },
        { id: 'modifications', name: t('product-showcase.modifications'), icon: '🔧' },
        { id: 'electricity', name: t('product-showcase.electricity'), icon: '⚡' },
        { id: 'construction', name: t('product-showcase.construction'), icon: '🏗️' }
    ];

    // Product data
    const products = [
        {
            id: 1,
            name: t('product-showcase.rechargeable-desk-lamp'),
            price: '79',
            image: modernCeilingLights
        },
        {
            id: 2,
            name: t('product-showcase.modern-ceiling-lamps'),
            price: '125',
            image: modernCeilingLights
        },
        {
            id: 3,
            name: t('product-showcase.wooden-flooring'),
            price: '68',
            image: modernCeilingLights
        },
        {
            id: 4,
            name: t('product-showcase.kitchen-water-faucet'),
            price: '125',
            image: modernCeilingLights
        },
        {
            id: 5,
            name: t('product-showcase.bathroom-mirror'),
            price: '248',
            image: modernCeilingLights
        },
        {
            id: 6,
            name: t('product-showcase.wallpaper'),
            price: '45',
            image: modernCeilingLights
        }
    ];

    return (
        <div className="product-showcase-page">
            {/* <PageHeader
                title={t('product-showcase.project-offers')}
                subtitle={t('product-showcase.your-special-offers')}
                createButtonText={t('product-showcase.create-new-price-offer-request')}
                onCreateClick={() => navigate('/request-quote/create')}
                createType="quote"
                showSearch={false}
            /> */}

            {/* Decorative Banner Section */}
            <div className="container" style={{marginTop: '60px'}}>
                <div className="row">
                    <div className="col-12">

                            <img style={{width: '100%'}} src={layerImage} alt="Banner Pattern" />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="main-content">
                <div className="container">
                    <div className="row">
                       

                        {/* Right Column - About Section */}
                        <div className="col-lg-6">
                            <div className="about-section-showcase">
                                <div className="about-content-showcase">
                                    <div className="about-logo">
                                        <img src={emblemeLogo} alt="Logo" />
                                    </div>
                                    <h2 className="about-title ar-heading-bold">{t('product-showcase.about-platform')}</h2>
                                    <div className="about-text">
                                        <p>{t('product-showcase.about-description')}</p>
                                        <p>{t('product-showcase.about-description-2')}</p>
                                        <p>{t('product-showcase.about-description-3')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                         {/* Lef Column - Mobile Mockup */}
                         <div className="col-lg-6">
                            <div className="mobile-mockup-section">
                                <div className="mobile-mockup">
                                    <img style={{width: '100%', height: '100%', maxWidth: '400px', maxHeight: '500px'}} src={mobileMockup} alt="Mobile Mockup" className="mobile-frame" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductShowcase; 