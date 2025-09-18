import React from 'react';
import { useTranslation } from 'react-i18next';

const InnerHeader = ({ titleKey }) => {
    const { t } = useTranslation();

    return (
        <div className="faq-header-bar">
            <div className="container-md">
                <div className="header-row">
                    <h1 className="header-title ar-heading-bold">
                        <i className="fas fa-home home-icon"></i>
                        {t(titleKey)}
                    </h1>
                </div>
            </div>
        </div>
    );
};

export default InnerHeader;


