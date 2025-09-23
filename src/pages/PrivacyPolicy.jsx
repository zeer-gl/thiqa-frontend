import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
    const { t } = useTranslation();

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <h1 className="mb-4">{t('privacy.title', 'Privacy Policy')}</h1>
                    
                    <div className="card">
                        <div className="card-body">
                            <h2 className="h4 mb-3">{t('privacy.introduction', 'Introduction')}</h2>
                            <p className="mb-4">
                                {t('privacy.introText', 'This Privacy Policy describes how Thiqah collects, uses, and protects your personal information when you use our services.')}
                            </p>

                            <h2 className="h4 mb-3">{t('privacy.informationCollection', 'Information We Collect')}</h2>
                            <p className="mb-4">
                                {t('privacy.collectionText', 'We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.')}
                            </p>

                            <h2 className="h4 mb-3">{t('privacy.howWeUse', 'How We Use Your Information')}</h2>
                            <p className="mb-4">
                                {t('privacy.useText', 'We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.')}
                            </p>

                            <h2 className="h4 mb-3">{t('privacy.informationSharing', 'Information Sharing')}</h2>
                            <p className="mb-4">
                                {t('privacy.sharingText', 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.')}
                            </p>

                            <h2 className="h4 mb-3">{t('privacy.dataSecurity', 'Data Security')}</h2>
                            <p className="mb-4">
                                {t('privacy.securityText', 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.')}
                            </p>

                            <h2 className="h4 mb-3">{t('privacy.contactUs', 'Contact Us')}</h2>
                            <p className="mb-4">
                                {t('privacy.contactText', 'If you have any questions about this Privacy Policy, please contact us at privacy@thiqah.com')}
                            </p>

                            <p className="text-muted small">
                                {t('privacy.lastUpdated', 'Last updated: December 2024')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
