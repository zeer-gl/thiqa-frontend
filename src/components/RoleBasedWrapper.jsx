import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const RoleBasedWrapper = ({ children, allowedRoles = ['user', 'sp'] }) => {
    const [isChecking, setIsChecking] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthAndRole = () => {
            try {
                // Check if token exists in localStorage (check both regular and service provider tokens)
                const token = localStorage.getItem('token');
                const tokenSP = localStorage.getItem('token-sp');
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                const storedUserRole = localStorage.getItem('userRole');
                
                console.log('🔍 RoleBasedWrapper Debug:', {
                    token: !!token,
                    tokenSP: !!tokenSP,
                    isLoggedIn,
                    storedUserRole,
                    allowedRoles
                });
                
                // User is authenticated if any token exists and isLoggedIn flag is true
                const authenticated = !!((token || tokenSP) && isLoggedIn);
                setIsAuthenticated(authenticated);

                if (authenticated) {
                    // Determine user role - prioritize userRole from localStorage
                    let role = 'user'; // default role
                    
                    // Use stored userRole if available, otherwise fallback to token-based detection
                    if (storedUserRole) {
                        role = storedUserRole;
                    } else if (tokenSP) {
                        // Fallback: if no userRole stored but tokenSP exists, assume SP
                        role = 'sp';
                    }
                    
                    console.log('✅ RoleBasedWrapper - User authenticated:', {
                        role,
                        allowedRoles,
                        isAllowed: allowedRoles.includes(role)
                    });
                    
                    setUserRole(role);
                } else {
                    console.log('❌ RoleBasedWrapper - User not authenticated');
                }
            } catch (error) {
                console.error('Error checking authentication and role:', error);
                setIsAuthenticated(false);
                setUserRole(null);
            } finally {
                setIsChecking(false);
            }
        };

        checkAuthAndRole();
    }, [allowedRoles]);
    
    // Expose test function to window for debugging
    useEffect(() => {
        window.testRoleBasedRouting = () => {
            console.log('🧪 Testing Role-Based Routing:');
            console.log('Current localStorage:', {
                userRole: localStorage.getItem('userRole'),
                isLoggedIn: localStorage.getItem('isLoggedIn'),
                token: !!localStorage.getItem('token'),
                tokenSP: !!localStorage.getItem('token-sp')
            });
            
            const currentRole = localStorage.getItem('userRole');
            if (currentRole === 'user') {
                console.log('✅ User role detected - should access /profile');
                console.log('Navigate to: /profile');
            } else if (currentRole === 'sp') {
                console.log('✅ Service Provider role detected - should access /profile-sp');
                console.log('Navigate to: /profile-sp');
            } else {
                console.log('❌ No valid role detected');
            }
        };
        
        // Function to switch user role for testing
        window.switchToUserRole = () => {
            console.log('🔄 Switching to User Role for testing...');
            localStorage.setItem('userRole', 'user');
            localStorage.setItem('isLoggedIn', 'true');
            // Keep existing token
            console.log('✅ Switched to user role. Now navigate to /profile');
            window.location.href = '/profile';
        };
        
        window.switchToSPRole = () => {
            console.log('🔄 Switching to Service Provider Role for testing...');
            localStorage.setItem('userRole', 'sp');
            localStorage.setItem('isLoggedIn', 'true');
            // Keep existing token
            console.log('✅ Switched to SP role. Now navigate to /profile-sp');
            window.location.href = '/profile-sp';
        };
        
        // Function to clean up localStorage tokens
        window.cleanupTokens = () => {
            console.log('🧹 Cleaning up localStorage tokens...');
            const userRole = localStorage.getItem('userRole');
            console.log('Current userRole:', userRole);
            
            if (userRole === 'user') {
                // Remove SP token if user is a regular user
                localStorage.removeItem('token-sp');
                localStorage.removeItem('spUserData');
                localStorage.removeItem('serviceProviderId');
                console.log('✅ Removed SP tokens for user role');
            } else if (userRole === 'sp') {
                // Remove regular token if user is a service provider
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
                console.log('✅ Removed user tokens for SP role');
            }
            
            console.log('Current localStorage after cleanup:', {
                userRole: localStorage.getItem('userRole'),
                token: !!localStorage.getItem('token'),
                tokenSP: !!localStorage.getItem('token-sp'),
                userData: !!localStorage.getItem('userData'),
                spUserData: !!localStorage.getItem('spUserData')
            });
        };
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

    // If not authenticated, redirect to home
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // If authenticated but role not allowed, redirect to appropriate profile
    if (userRole && !allowedRoles.includes(userRole)) {
        if (userRole === 'sp') {
            return <Navigate to="/profile-sp" replace />;
        } else {
            return <Navigate to="/profile" replace />;
        }
    }

    // If authenticated and role is allowed, show the content
    return children;
};

export default RoleBasedWrapper;
