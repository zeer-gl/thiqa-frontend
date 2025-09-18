import React from 'react';
import { useTranslation } from 'react-i18next';
import ProjectCard from '../components/ProjectCard';
import SidePattern from "/public/images/side-pattern.svg";

const ContractorView = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  return (
    <div className="container contractor-view-page pt-4">
        <div>
            <img className='side-pattern' src={SidePattern} alt=""/>
        </div>
      <div className="row">
        <div className="col-12">
          <div className=" rounded mb-4" style={{height: '300px', background:'#D9D9D9'}}></div>
        </div>
      </div>
      <div className="row">
       
        <div className="col-12">
          <div className='d-flex justify-content-between mb-3'>
            <h4 className='fw-bold m-0'>{t('pages.contractorView.aboutSection.title')}</h4>
            <div className="d-flex align-items-center mb-2">
          <span className="fw-bold ms-2">{t('pages.contractorView.locationSection.title')}</span>
          <span className="bi bi-geo-alt ms-1" style={{fontSize: '1.2rem'}}></span>
        </div>
          </div>
          <p className="text-muted mb-4">
            {t('pages.contractorView.aboutSection.description')}
          </p>
          <h4 className="fw-bold text-end mt-5 mb-4">{t('pages.contractorView.projectsSection.title')}</h4>
          <div className="row">
            <div className="col-md-4 mb-3"><ProjectCard /></div>
            <div className="col-md-4 mb-3"><ProjectCard /></div>
            <div className="col-md-4 mb-3"><ProjectCard /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorView;