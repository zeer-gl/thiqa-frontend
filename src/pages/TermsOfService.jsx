import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="terms-of-service">
            <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    {/* Back Button */}
                    <div className="mb-4">
                        <button 
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                // Try to go back in history, fallback to home if no history
                                if (window.history.length > 1) {
                                    navigate(-1);
                                } else {
                                    navigate('/');
                                }
                            }}
                        >
                            <i className="fas fa-arrow-left me-2"></i>
                            {t('common.back', 'Back')}
                        </button>
                    </div>
                    
                    <h1 className="mb-4">{t('terms.title', 'Terms of Service')}</h1>
                    
                    <div className="card">
                        <div className="card-body">
                            <h2 className="h4 mb-3">{t('terms.acceptance', 'Acceptance of Terms')}</h2>
                            <p className="mb-4">
                                {t('terms.acceptanceText', 'By accessing and using Thiqah services, you accept and agree to be bound by the terms and provision of this agreement.')}
                            </p>

                            <h2 className="h4 mb-3">{t('terms.useLicense', 'Use License')}</h2>
                            <p className="mb-4">
                                {t('terms.licenseText', 'Permission is granted to temporarily download one copy of the materials on Thiqah for personal, non-commercial transitory viewing only.')}
                            </p>

                            <h2 className="h4 mb-3">{t('terms.disclaimer', 'Disclaimer')}</h2>
                            <p className="mb-4">
                                {t('terms.disclaimerText', 'The materials on Thiqah are provided on an "as is" basis. Thiqah makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.')}
                            </p>

                            <h2 className="h4 mb-3">{t('terms.limitations', 'Limitations')}</h2>
                            <p className="mb-4">
                                {t('terms.limitationsText', 'In no event shall Thiqah or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Thiqah, even if Thiqah or a Thiqah authorized representative has been notified orally or in writing of the possibility of such damage.')}
                            </p>

                            <h2 className="h4 mb-3">{t('terms.accuracy', 'Accuracy of Materials')}</h2>
                            <p className="mb-4">
                                {t('terms.accuracyText', 'The materials appearing on Thiqah could include technical, typographical, or photographic errors. Thiqah does not warrant that any of the materials on its website are accurate, complete, or current.')}
                            </p>

                            <h2 className="h4 mb-3">{t('terms.links', 'Links')}</h2>
                            <p className="mb-4">
                                {t('terms.linksText', 'Thiqah has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Thiqah of the site.')}
                            </p>

                            <h2 className="h4 mb-3">{t('terms.modifications', 'Modifications')}</h2>
                            <p className="mb-4">
                                {t('terms.modificationsText', 'Thiqah may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.')}
                            </p>

                            <h2 className="h4 mb-3">{t('terms.governingLaw', 'Governing Law')}</h2>
                            <p className="mb-4">
                                {t('terms.governingLawText', 'These terms and conditions are governed by and construed in accordance with the laws of the United Arab Emirates and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.')}
                            </p>

                            <h2 className="h4 mb-3">{t('terms.contactUs', 'Contact Us')}</h2>
                            <p className="mb-4">
                                {t('terms.contactText', 'If you have any questions about these Terms of Service, please contact us at legal@thiqah.com')}
                            </p>

                            <p className="text-muted small">
                                {t('terms.lastUpdated', 'Last updated: December 2024')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default TermsOfService;
