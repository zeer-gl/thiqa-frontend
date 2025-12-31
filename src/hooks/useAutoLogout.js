import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Custom hook to automatically logout users after a period of inactivity
 * @param {number} inactivityTime - Time in milliseconds before auto-logout (default: 25 minutes)
 */
const useAutoLogout = (inactivityTime = 25 * 60 * 1000) => {
    const navigate = useNavigate();
    const location = useLocation();
    const timeoutRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    const performLogout = () => {
        // Check if user is actually logged in
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            return; // Already logged out, no need to do anything
        }

        // Don't logout if user is on auth pages
        const authRoutes = ['/login', '/login-sp', '/signup', '/signup-sp', '/forget-password', '/forget-password-sp', '/reset-password'];
        if (authRoutes.some(route => location.pathname.startsWith(route))) {
            return; // User is on auth page, don't logout
        }

        // Preserve cart data and subscription status before logout
        const cartData = localStorage.getItem('cart');
        const spPaymentStatus = localStorage.getItem('spPaymentStatus');
        const spHasActiveSubscription = localStorage.getItem('spHasActiveSubscription');
        const spSubscriptionStatus = localStorage.getItem('spSubscriptionStatus');

        // Clear authentication data
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userData");
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
        localStorage.removeItem("token-sp");
        localStorage.removeItem("serviceProviderId");
        localStorage.removeItem("spUserData");
        localStorage.removeItem("registrationData");

        // Restore cart data if it existed
        if (cartData) {
            localStorage.setItem('cart', cartData);
        }

        // Restore subscription status if it existed
        if (spPaymentStatus) {
            localStorage.setItem('spPaymentStatus', spPaymentStatus);
        }
        if (spHasActiveSubscription) {
            localStorage.setItem('spHasActiveSubscription', spHasActiveSubscription);
        }
        if (spSubscriptionStatus) {
            localStorage.setItem('spSubscriptionStatus', spSubscriptionStatus);
        }

        // Redirect to home page
        navigate('/');
        
        // Reload the page to ensure all state is reset
        window.location.reload();
    };

    const resetTimer = () => {
        // Clear existing timer
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Check if user is logged in before setting timer
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            return; // User is not logged in, don't set timer
        }

        // Don't set timer if user is on auth pages
        const authRoutes = ['/login', '/login-sp', '/signup', '/signup-sp', '/forget-password', '/forget-password-sp', '/reset-password'];
        if (authRoutes.some(route => location.pathname.startsWith(route))) {
            return; // User is on auth page, don't set timer
        }

        // Update last activity time
        lastActivityRef.current = Date.now();

        // Set new timer
        timeoutRef.current = setTimeout(() => {
            performLogout();
        }, inactivityTime);
    };

    useEffect(() => {
        // List of events that indicate user activity
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click',
            'keydown'
        ];

        // Add event listeners for user activity
        events.forEach(event => {
            window.addEventListener(event, resetTimer, { passive: true });
        });

        // Initialize timer on mount and when location changes
        resetTimer();

        // Cleanup function
        return () => {
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [inactivityTime, location.pathname]);

    // Reset timer when user becomes active (handled by event listeners)
    return { resetTimer };
};

export default useAutoLogout;

