/**
 * Global API response interceptor to handle suspended users
 * This intercepts fetch API calls and checks for suspension-related errors
 */

// Only set up interceptor once
if (!window._fetchInterceptorSet) {
    const originalFetch = window.fetch;
    window._fetchInterceptorSet = true;

    window.fetch = async function(...args) {
        try {
            const response = await originalFetch.apply(this, args);
            
            // Check for 403 Forbidden or suspension-related errors
            if (!response.ok && (response.status === 403 || response.status === 401)) {
                try {
                    const errorData = await response.clone().json().catch(() => ({}));
                    const errorMessage = errorData?.message || errorData?.error || '';
                    const errorLower = errorMessage.toLowerCase();
                    
                    // Check if error indicates account suspension
                    if (errorLower.includes('suspended') || 
                        errorLower.includes('account is suspended') ||
                        errorLower.includes('account suspended')) {
                        
                        // Import and use suspension handler
                        const { handleSuspendedUser } = await import('./suspensionHandler');
                        handleSuspendedUser(errorMessage || 'Your account has been suspended. Please contact support.');
                        return response; // Return original response to prevent further processing
                    }
                } catch (parseError) {
                    // If we can't parse the error, continue with normal flow
                    console.error('Error parsing API error response:', parseError);
                }
            }
            
            return response;
        } catch (error) {
            // Re-throw network errors
            throw error;
        }
    };
}

export default {};
