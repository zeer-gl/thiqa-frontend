import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const DEFAULT_TITLE = 'Thiqa'; // Fallback title

const PageTitle = () => {
    const location = useLocation();
    const { t } = useTranslation();

    useEffect(() => {
        // Define titles for each route (can be moved to a separate config file)
        const routeTitles = {
            '/': t('pageTitles.home', 'Home'),
            '/offers': t('pageTitles.offers', 'Project Offers'),
            '/products': t('pageTitles.products', 'Products'),
            '/about': t('pageTitles.about', 'About Us'),
        };

        const pageTitle = routeTitles[location.pathname] || DEFAULT_TITLE;
        document.title = `${pageTitle} - ${DEFAULT_TITLE}`;
    }, [location.pathname, t]);

    return null;
};

export default PageTitle;