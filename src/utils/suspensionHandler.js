/**
 * Utility function to handle suspended users
 * Clears authentication data and redirects to login page
 */
export const handleSuspendedUser = (message = 'Your account has been suspended. Please contact support.') => {
    console.warn('⚠️ User account suspended - logging out');
    
    // Get user role BEFORE clearing localStorage
    const userRole = localStorage.getItem('userRole') || 'user';
    const loginRoute = userRole === 'sp' ? '/login-sp' : '/login';
    
    // Preserve cart data before clearing auth
    const cartData = localStorage.getItem('cart');
    
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
    
    // Clear subscription data as well
    localStorage.removeItem("spPaymentStatus");
    localStorage.removeItem("spHasActiveSubscription");
    localStorage.removeItem("spSubscriptionStatus");
    
    // Restore cart data if it existed
    if (cartData) {
        localStorage.setItem('cart', cartData);
    }
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('userSuspended', { detail: { message } }));
    
    // Use window.location for a hard redirect to ensure clean state
    window.location.href = loginRoute;
    
    // Show alert message if possible (might not work with hard redirect)
    return { message, redirectTo: loginRoute };
};

/**
 * Check if user is suspended based on profile data
 */
export const checkUserSuspension = (profileData, userRole) => {
    if (!profileData) return false;
    
    if (userRole === 'sp') {
        // For service providers, check isSuspended field
        return profileData.isSuspended === true;
    } else {
        // For regular customers, check status field
        return profileData.status === 'suspended' || profileData.status === 'banned';
    }
};
