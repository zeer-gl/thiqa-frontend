import { useTranslation } from 'react-i18next';
import '../css/pages/about.scss';

const About = () => {
    const { t } = useTranslation();

    return (
        <div className="page-container">
            <div className="container">
                <div className="row">
                    <div className="col-md-8 mx-auto">
                        <h1 className="fw-bold">{t('pages.about.title')}</h1>
                        <p className="lead">{t('pages.about.description')}</p>

                        <div className="mt-4">
                            <h3 className="fw-bold">Our Mission</h3>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

                            <h3 className="fw-bold">Our Vision</h3>
                            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;