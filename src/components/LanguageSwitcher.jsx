import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = ({ authStyle = false }) => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const handleRadioChange = (e) => {
        if (e.target.id === 'on') {
            changeLanguage('en');
        } else if (e.target.id === 'off') {
            changeLanguage('ar');
        }
    };

    return (
        <fieldset id="switch" className={`radio${authStyle ? ' auth-switcher' : ''}`}>
            <input
                name="switch"
                id="on"
                type="radio"
                checked={(i18n.resolvedLanguage || i18n.language).startsWith('en')}
                onChange={handleRadioChange}
            />
            <label htmlFor="on"><p className='m-0 pt-1'>{t('nav.langEn', 'EN')}</p></label>
            <input
                name="switch"
                id="off"
                type="radio"
                checked={(i18n.resolvedLanguage || i18n.language).startsWith('ar')}
                onChange={handleRadioChange}
            />
            <label htmlFor="off"> <p className='m-0 pt-1'>{t('nav.langAr', 'AR')}</p></label>
        </fieldset>
    );
};

export default LanguageSwitcher;
