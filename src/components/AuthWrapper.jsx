import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';
import { useTranslation } from 'react-i18next';

const AuthWrapper = ({ children }) => {
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const { showAlert: showAlertFunction } = useAlert();
    const { t } = useTranslation();

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
                
                // If not authenticated, show alert and set flag to show alert
                if (!authenticated) {
                    setShowAlert(true);
                    showAlertFunction(t('auth.registerFirst', 'Please register first to access this feature'), 'warning');
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                setIsAuthenticated(false);
            } finally {
                setIsChecking(false);
            }
        };

        // Check immediately without delay to prevent flash
        checkAuth();
    }, []);

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

    // If not authenticated, redirect to home screen after showing alert
    if (showAlert) {
        // Small delay to ensure alert is shown before redirect
        setTimeout(() => {
            setShowAlert(false);
        }, 2000);
    }
    
    return <Navigate to="/" replace />;
};

export default AuthWrapper;
