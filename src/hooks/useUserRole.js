import { useState, useEffect } from 'react';

export const useUserRole = () => {
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUserRole = () => {
            try {
                // Check authentication first
                const token = localStorage.getItem('token');
                const tokenSP = localStorage.getItem('token-sp');
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                
                if (!((token || tokenSP) && isLoggedIn)) {
                    setUserRole('unauthenticated');
                    setIsLoading(false);
                    return;
                }

                // Determine user role
                let role = 'user'; // default role
                
                // Check if user is a service provider
                if (tokenSP || localStorage.getItem('userRole') === 'sp') {
                    role = 'sp';
                }
                
                setUserRole(role);
            } catch (error) {
                console.error('Error checking user role:', error);
                setUserRole('user'); // default fallback
            } finally {
                setIsLoading(false);
            }
        };

        checkUserRole();
    }, []);

    return { userRole, isLoading };
};
