import {useTranslation} from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import Logo from '/public/images/logo-white.svg';
import Youtube from '/public/images/youtibe.svg';
import LinkedIn from '/public/images/linkedin.png';
import Facebook from '/public/images/facebook.png';
import Tiktok from '/public/images/ticktok.png';
import Instagram from '/public/images/insta.png';
import { useUser } from '../context/Profile.jsx';

const Footer = () => {
    const {t} = useTranslation();
    const location = useLocation();
    const { isServiceProvider } = useUser();

    return (
        <footer className="thiqa-footer">
            <div className="container">
                <div className='text-center'>
                    <img src={Logo} alt=""/>
                </div>
                <div className="navbar-wrapper">
                    <div className="container">
                        <nav className="navbar custom-navbar">
                            <div
                                className="navbar-nav d-flex justify-content-between flex-row flex-grow-1 gap-4 nav-container flex-wrap">
                                <Link 
                                    className={`nav-link px-4 py-2 nav-item ${location.pathname === '/' ? 'active' : ''}`} 
                                    to="/"
                                >
                                    {t('footer.home')}
                                </Link>
                                {!isServiceProvider && (
                                    <>
                                        <Link 
                                            className={`nav-link px-4 py-2 nav-item ${location.pathname === '/offers' ? 'active' : ''}`} 
                                            to="/offers"
                                        >
                                            {t('nav.offers')}
                                        </Link>
                                        <Link 
                                            className={`nav-link px-4 py-2 nav-item ${location.pathname === '/products' ? 'active' : ''}`} 
                                            to="/products"
                                        >
                                            {t('footer.products')}
                                        </Link>
                                        <Link 
                                            className={`nav-link px-4 py-2 nav-item ${location.pathname === '/service-providers' ? 'active' : ''}`} 
                                            to="/service-list"
                                        >
                                            {t('nav.serviceProviders', 'Service Providers')}
                                        </Link>
                                        <Link 
                                            className={`nav-link px-4 py-2 nav-item ${location.pathname === '/privacy' ? 'active' : ''}`} 
                                            to="/privacy"
                                        >
                                            {t('footer.privacy')}
                                        </Link>
                                    </>
                                )}
                                {!isServiceProvider && (
                                    <Link 
                                        className={`nav-link px-4 py-2 nav-item ${location.pathname === '/product-showcase' ? 'active' : ''}`} 
                                        to="/product-showcase"
                                    >
                                        {t('footer.about')}
                                    </Link>
                                )}
                            </div>
                        </nav>
                    </div>
                </div>
                <div className="splitter"></div>
                <div className='d-flex align-items-center justify-content-between mt-3'>
                    <div className='d-flex align-items-center gap-3 footer-socials'>
                        <div className='nav-icons-container'>
                            <img src={Youtube} alt=""/>
                        </div>
                        <div className='nav-icons-container'>
                            <img src={Tiktok} alt=""/>
                        </div>
                        <div className='nav-icons-container'>
                            <img src={LinkedIn} alt=""/>
                        </div>
                        <div className='nav-icons-container'>
                            <img src={Instagram} alt=""/>
                        </div>
                        <div className='nav-icons-container'>
                            <img src={Facebook} alt=""/>
                        </div>
                    </div>
                    <div>
                        <p className='text-white'>
                            {t('footer.allRightsReserved')}
                        </p>
                    </div>
                    <div className='d-flex gap-4 align-items-center'>
                        <a href='#' className='text-decoration-none text-white'>
                            {t('footer.laws')}
                        </a>
                        <a href="" className='text-decoration-none text-white'>
                            {t('footer.politicsAndPrivacy')}
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;