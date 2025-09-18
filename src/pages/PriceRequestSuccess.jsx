import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../css/pages/payment-success.scss';
import RoundPattern from '../assets/payment/round-thiqa-pattern.svg';
import SidePattern from "../../public/images/side-pattern.svg";

const PriceRequestSuccess = () => {
    const { t } = useTranslation();

    return (
        <div className="payment-success-page d-flex align-items-center justify-content-center">
             <div>
                <img className='side-pattern' src={SidePattern} alt="" />
            </div>
            <div className="success-card text-center">
                <h2 className="title fw-bold mb-3">{t('price-request-success.title')}</h2>
                <p className="subtitle mb-4">{t('price-request-success.subtitle')}</p>

                <div className="pattern-wrap mb-4">
                    <img src={RoundPattern} alt="pattern" />
                </div>

    

                <Link to="/request-quote/list" className="btn home-btn">{t('price-request-success.go-to-list')}</Link>
            </div>
        </div>
    );
};

export default PriceRequestSuccess;


