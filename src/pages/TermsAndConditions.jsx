import React from 'react';
import { useTranslation } from 'react-i18next';

const TermsAndConditions = () => {
    const { t } = useTranslation();

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <h1 className="mb-4">{t('terms.title', 'Terms and Conditions')}</h1>
                    
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

                            <h2 className="h4 mb-3">{t('terms.userAccounts', 'User Accounts')}</h2>
                            <p className="mb-4">
                                {t('terms.accountsText', 'When you create an account with us, you must provide information that is accurate, complete, and current at all times.')}
                            </p>

                            <h2 className="h4 mb-3">{t('terms.prohibitedUses', 'Prohibited Uses')}</h2>
                            <p className="mb-4">
                                {t('terms.prohibitedText', 'You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts.')}
                            </p>

                            <h2 className="h4 mb-3">{t('terms.serviceAvailability', 'Service Availability')}</h2>
                            <p className="mb-4">
                                {t('terms.availabilityText', 'We reserve the right to withdraw or amend our service, and any service or material we provide, in our sole discretion without notice.')}
                            </p>

                            <h2 className="h4 mb-3">{t('terms.limitationOfLiability', 'Limitation of Liability')}</h2>
                            <p className="mb-4">
                                {t('terms.liabilityText', 'In no event shall Thiqah, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.')}
                            </p>

                            <h2 className="h4 mb-3">{t('terms.contactInformation', 'Contact Information')}</h2>
                            <p className="mb-4">
                                {t('terms.contactText', 'If you have any questions about these Terms and Conditions, please contact us at legal@thiqah.com')}
                            </p>

                            <p className="text-muted small">
                                {t('terms.lastUpdated', 'Last updated: December 2024')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
