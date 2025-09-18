import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../css/pages/faq.scss';
import Logo from "/public/images/favicon.png";
import AccIcon from "/public/images/accordian-icon.svg";
import SidePattern from '/public/images/side-pattern.svg';
import InnerHeader from '../components/InnerHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

const FAQ = () => {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(null);
    const [liked, setLiked] = useState(false);

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqData = [
        {
            question: t('faq.q1.question'),
            answer: t('faq.q1.answer')
        },
        {
            question: t('faq.q2.question'),
            answer: t('faq.q2.answer')
        },
        {
            question: t('faq.q3.question'),
            answer: t('faq.q3.answer')
        },
        {
            question: t('faq.q4.question'),
            answer: t('faq.q4.answer')
        }
    ];

    return (
        <div className="faq-container">
             <div>
                <img className='side-pattern' src={SidePattern} alt=""/>
            </div>
            <div className="container">
                {/* Page Header (matches profile header design) */}
                <InnerHeader titleKey={'faq.headerTitle'} />
                {/* Like / Unlike heart icon */}
                <div className="faq-like-container">
                    <button
                        type="button"
                        className={`faq-like-btn ${liked ? 'liked' : ''}`}
                        onClick={() => setLiked(prev => !prev)}
                        aria-label={liked ? 'Unlike' : 'Like'}
                    >
                        <FontAwesomeIcon icon={liked ? solidHeart : regularHeart} />
                    </button>
                </div>
                <div className="row justify-content-center">
                    <div className="col-lg-8 col-md-10">
                        <div className="faq-header text-center mb-5">
                            <div className="faq-icon mb-4">
                                <img style={{ width: '80px' }} src={Logo} alt="" />
                            </div>
                        </div>

                        <div className="faq-list">
                            {faqData.map((item, index) => (
                                <div key={index} className="faq-item">
                                    <div
                                        className={`faq-question ${activeIndex === index ? 'active' : ''}`}
                                        onClick={() => toggleAccordion(index)}
                                    >
                                        <span>{item.question}</span>
                                        <span className="faq-toggle">
                                            <img src={AccIcon} alt="" />
                                        </span>
                                    </div>
                                    <div className={`faq-answer ${activeIndex === index ? 'active' : ''}`}>
                                        <p>{item.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;