import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProfileRedirect = () => {
    const [isChecking, setIsChecking] = useState(true);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const checkUserRole = () => {
            try {
                // Check authentication first
                const token = localStorage.getItem('token');
                const tokenSP = localStorage.getItem('token-sp');
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                
                if (!((token || tokenSP) && isLoggedIn)) {
                    // Not authenticated, redirect to home
                    setUserRole('unauthenticated');
                    setIsChecking(false);
                    return;
                }

                // Determine user role - prioritize userRole from localStorage
                const storedUserRole = localStorage.getItem('userRole');
                let role = 'user'; // default role
                
                // Use stored userRole if available, otherwise fallback to token-based detection
                if (storedUserRole) {
                    role = storedUserRole;
                } else if (tokenSP) {
                    // Fallback: if no userRole stored but tokenSP exists, assume SP
                    role = 'sp';
                }
                
                setUserRole(role);
                console.log('🔍 ProfileRedirect Debug:', {
                    storedUserRole,
                    token: !!token,
                    tokenSP: !!tokenSP,
                    finalRole: role,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error checking user role:', error);
                setUserRole('user'); // default fallback
            } finally {
                setIsChecking(false);
            }
        };

        checkUserRole();
    }, []);

    // Show loading while checking
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

    // Redirect based on role
    if (userRole === 'unauthenticated') {
        return <Navigate to="/" replace />;
    } else if (userRole === 'sp') {
        return <Navigate to="/profile-sp" replace />;
    } else {
        return <Navigate to="/profile" replace />;
    }
};

export default ProfileRedirect;
