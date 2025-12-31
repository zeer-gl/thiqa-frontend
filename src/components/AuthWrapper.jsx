import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/Profile';
import { useSPProfile } from '../context/SPProfileContext';
import { checkUserSuspension, handleSuspendedUser } from '../utils/suspensionHandler';

const AuthWrapper = ({ children }) => {
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { showAlert: showAlertFunction } = useAlert();
    const { t } = useTranslation();
    const { userProfile, fetchUserProfile } = useUser();
    const { spProfile, fetchSPProfile } = useSPProfile();
    const navigate = useNavigate();

    // Check for suspended status
    useEffect(() => {
        const checkSuspension = async () => {
            try {
                const userRole = localStorage.getItem('userRole');
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                
                if (!isLoggedIn) return;
                
                let profileData = null;
                if (userRole === 'sp') {
                    // Check SP profile if available, otherwise fetch it
                    if (spProfile) {
                        profileData = spProfile;
                    } else {
                        try {
                            profileData = await fetchSPProfile();
                        } catch (error) {
                            console.error('Error fetching SP profile for suspension check:', error);
                        }
                    }
                } else {
                    // Check regular user profile if available, otherwise fetch it
                    if (userProfile) {
                        profileData = userProfile;
                    } else {
                        try {
                            profileData = await fetchUserProfile();
                        } catch (error) {
                            console.error('Error fetching user profile for suspension check:', error);
                        }
                    }
                }
                
                if (profileData && checkUserSuspension(profileData, userRole || 'user')) {
                    handleSuspendedUser(t('common.accountSuspended', 'Your account has been suspended. Please contact support.'));
                }
            } catch (error) {
                console.error('Error checking suspension status:', error);
            }
        };
        
        // Check suspension status periodically (every 30 seconds)
        const intervalId = setInterval(checkSuspension, 30000);
        
        // Initial check
        checkSuspension();
        
        return () => clearInterval(intervalId);
    }, [userProfile, spProfile, fetchUserProfile, fetchSPProfile, t]);

    // Listen for suspension event
    useEffect(() => {
        const handleSuspensionEvent = () => {
            handleSuspendedUser(t('common.accountSuspended', 'Your account has been suspended. Please contact support.'));
        };
        
        window.addEventListener('userSuspended', handleSuspensionEvent);
        return () => window.removeEventListener('userSuspended', handleSuspensionEvent);
    }, [t]);

    useEffect(() => {
        const checkAuth = () => {
            try {
                // Check if token exists in localStorage (check both regular and service provider tokens)
                const token = localStorage.getItem('token');
                const tokenSP = localStorage.getItem('token-sp');
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                
                // User is authenticated if any token exists and isLoggedIn flag is true
                const authenticated = !!((token || tokenSP) && isLoggedIn);
                setIsAuthenticated(authenticated);
                
                // If not authenticated, show alert but don't redirect
                // if (!authenticated) {
                //     showAlertFunction(t('auth.registerFirst', 'Please register first to access this feature'), 'warning');
                // }
            } catch (error) {
                console.error('Error checking authentication:', error);
                setIsAuthenticated(false);
                showAlertFunction(t('auth.registerFirst', 'Please register first to access this feature'), 'warning');
            } finally {
                setIsChecking(false);
            }
        };

        // Check immediately without delay to prevent flash
        checkAuth();
    }, [showAlertFunction, t]);

    // Always show loading while checking authentication to prevent flash
    if (isChecking) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // If authenticated, show the app content
    if (isAuthenticated) {
        return children;
    }

    // If not authenticated, show a message instead of redirecting
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <div className="text-center">
                <div className="" role="alert">
                    <h4 className="alert-heading">Access Restricted</h4>
                    <p className='mt-2'>Please Sign Up / Sign In first to access this feature.</p>
                    {/* <hr /> */}
                    {/* <p className="mb-0">You need to be logged in to view this content.</p> */}
                </div>
            </div>
        </div>
    );
};

export default AuthWrapper;
