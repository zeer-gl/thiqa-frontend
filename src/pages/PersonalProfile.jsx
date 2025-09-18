import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../css/pages/personal-profile.scss';
import SidePattern from '/public/images/side-pattern.svg';
import { FaRegHeart } from "react-icons/fa";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import '../css/pages/profile.scss';
import '../css/pages/home.scss';
import personaprofile from  '/public/images/profile/personalprofile.png'


const PersonalProfile = () => {
    const { t, i18n } = useTranslation();
    const [expandedItems, setExpandedItems] = useState({});

    // Menu items data
    const menuItems = [
        {
            id: 'login',
            title: t('personalProfile.menuItems.howToLogin', 'كيفية تسجيل الدخول'),
            icon: <FaRegHeart />,
            content: t('personalProfile.menuItems.loginContent', 'محتوى كيفية تسجيل الدخول...')
        },
        {
            id: 'accountSettings',
            title: t('personalProfile.menuItems.accountSettings', 'إعدادات الحساب'),
            icon: null,
            content: t('personalProfile.menuItems.accountSettingsContent', 'محتوى إعدادات الحساب...')
        },
        {
            id: 'addContent',
            title: t('personalProfile.menuItems.addNewContent', 'إضافة محتوى جديد'),
            icon: <CompareArrowsIcon />,
            content: t('personalProfile.menuItems.addContentContent', 'محتوى إضافة محتوى جديد...')
        },
        {
            id: 'contactSupport',
            title: t('personalProfile.menuItems.howToContactSupport', 'كيفية التواصل مع الدعم'),
            icon: null,
            content: t('personalProfile.menuItems.contactSupportContent', 'محتوى كيفية التواصل مع الدعم...')
        }
    ];

    const toggleExpansion = (itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    return (
        <div className="personal-profile-page" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Background Pattern */}
            <div>
                <img className="side-pattern" src={SidePattern} alt="" />
            </div>
            
            <div className="profile-container container-md">
                {/* Header Section */}
                <div className="profile-header">
                    <div className="container-md">
                        <div className="header-row">
                            <h1 className="header-title ar-heading-bold">
                                <i className="fas fa-home home-icon"></i>
                                {t('personalProfile.header.title', 'الملف الشخصي')}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="main-content">
                    <div className="content-container">
                        {/* Central Logo */}
                        <div className="central-logo">
                     
                             <img src={personaprofile} alt='profile'/>
                         
                        </div>

                        {/* Interactive Menu Items */}
                        <div className="menu-items">
                            {menuItems.map((item) => (
                                <div key={item.id} className="menu-item">
                                    <div 
                                        className="menu-item-header"
                                        onClick={() => toggleExpansion(item.id)}
                                    >
                                      
                                        <span className="menu-item-title">{item.title}</span>
                                        <div className="menu-item-expand-icon">
                                            {expandedItems[item.id] ? <FaCaretUp /> : <FaCaretDown />}
                                        </div>
                                    </div>
                                    
                                    {expandedItems[item.id] && (
                                        <div className="menu-item-content">
                                            <p>{item.content}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalProfile;
