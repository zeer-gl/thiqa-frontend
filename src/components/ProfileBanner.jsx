import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import CustomerProfile from '/public/images/home/customer-profile.png';
import '../css/components/profile-banner.scss';
import Avatar from "@mui/material/Avatar";
import { useLocation } from '../context/LocationContext.jsx';

const ProfileBanner = ({ isServiceProvider = false ,userProfile}) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ar';
    const [imageKey, setImageKey] = useState(Date.now());
    const { currentLocation, loadingLocation } = useLocation();

    // Update image key when userProfile changes to force image refresh
    useEffect(() => {
        const imageUrl = userProfile?.pic || userProfile?.image;
        if (imageUrl) {
            setImageKey(Date.now());
            console.log('🔄 ProfileBanner: Profile image updated, refreshing image key:', imageKey, 'Image URL:', imageUrl);
        }
    }, [userProfile?.pic, userProfile?.image]);

    // Listen for profile image update events
    useEffect(() => {
        const handleProfileImageUpdate = () => {
            console.log('🔄 ProfileBanner: Received profile image update event');
            setImageKey(Date.now());
        };

        window.addEventListener('profileImageUpdated', handleProfileImageUpdate);
        return () => window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
    }, []);

    const handleProfileClick = () => {
        // Navigate to correct profile based on user role
        console.log('🔍 ProfileBanner Click Debug:', {
            isServiceProvider,
            userRole: localStorage.getItem('userRole'),
            timestamp: new Date().toISOString()
        });
        
        if (isServiceProvider) {
            console.log('✅ Navigating to Service Provider profile: /profile-sp');
            navigate('/profile-sp');
        } else {
            console.log('✅ Navigating to User profile: /profile');
            navigate('/profile');
        }
    };

    return (
        <div className="profile-banner" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
            <div className="profile-banner-content">
                {/* Profile Section */}
                <div className="profile-section">
                    <div className="profile-info">
                        <div className="greeting-text">
                        
                        <div
    className="name"
    style={{ 
        fontSize: "20px", 
        fontWeight: 700,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "120px"
    }}
  >
    {userProfile?.name?.length > 8
      ? userProfile.name.slice(0, 8) + "."
      : userProfile?.name}
  </div>
                       
                        </div>
                    </div>
                    <div className="profile-image">
  {(userProfile?.pic || userProfile?.image) ? (
    <img 
      src={`${userProfile.pic || userProfile.image}?t=${imageKey}`} 
      alt="Profile" 
      key={`profile-img-${userProfile.pic || userProfile.image}-${imageKey}`}
      onError={(e) => {
        console.log('❌ ProfileBanner: Image failed to load, falling back to avatar');
        e.target.style.display = 'none';
      }}
    />
  ) : (
    <Avatar style={{width:"100%",height:"100%"}}>
      {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : "U"}
    </Avatar>
  )}
</div>
                </div>

                {!isServiceProvider && (
                    <>
                        {/* Divider */}
                        <div className="divider"></div>

                        {/* Location Section */}
                        <div className="location-section">
                            <div className="location-info">
                                <div className="location-text">
                                    <div className={`d-flex align-items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <div className="location-icon">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8 0C4.686 0 2 2.686 2 6c0 4.5 6 10 6 10s6-5.5 6-10c0-3.314-2.686-6-6-6zm0 8.5c-1.378 0-2.5-1.122-2.5-2.5S6.622 3.5 8 3.5s2.5 1.122 2.5 2.5S9.378 8.5 8 8.5z" fill="#ffffff" />
                                            </svg>
                                        </div>
                                        <div className="location-full pt-2" style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>
                                            {loadingLocation ? (
                                                <span style={{ opacity: 0.7 }}>Loading...</span>
                                            ) : currentLocation ? (
                                                isRTL ? 
                                                    `${currentLocation.area}، ${currentLocation.city}` : 
                                                    currentLocation.text
                                            ) : (
                                                isRTL ? 'الكويت، الكويت' : 'Kuwait City, Kuwait'
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfileBanner;
