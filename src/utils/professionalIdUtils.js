/**
 * Utility functions for retrieving and validating professional IDs from localStorage
 */

/**
 * Retrieves the professional ID from localStorage with proper fallback logic
 * @returns {string|null} The professional ID or null if not found
 */
export const getProfessionalId = () => {
    try {
        // Primary source: spUserData._id
        const spUserData = localStorage.getItem('spUserData');
        if (spUserData) {
            const userData = JSON.parse(spUserData);
            if (userData && userData._id) {
                console.log('✅ Professional ID from localStorage spUserData:', userData._id);
                return userData._id;
            }
        }
        
        // Fallback: serviceProviderId
        const serviceProviderId = localStorage.getItem('serviceProviderId');
        if (serviceProviderId) {
            console.log('✅ Using fallback serviceProviderId:', serviceProviderId);
            return serviceProviderId;
        }
        
        console.warn('⚠️ No professional ID found in localStorage');
        return null;
    } catch (error) {
        console.error('❌ Error retrieving professional ID:', error);
        return null;
    }
};

/**
 * Validates if a string is a valid MongoDB ObjectId format
 * @param {string} id - The ID to validate
 * @returns {boolean} True if valid ObjectId format
 */
export const isValidObjectId = (id) => {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-fA-F]{24}$/.test(id.trim());
};

/**
 * Cleans and validates a professional ID
 * @param {string} id - The ID to clean and validate
 * @returns {string|null} Cleaned ID or null if invalid
 */
export const cleanAndValidateProfessionalId = (id) => {
    if (!id) return null;
    
    // Convert to string and trim
    let cleanId = String(id).trim();
    
    // Remove any potential quotes or extra characters
    cleanId = cleanId.replace(/['"]/g, '');
    
    // Validate ObjectId format
    if (!isValidObjectId(cleanId)) {
        console.error('❌ Invalid ObjectId format:', cleanId);
        return null;
    }
    
    return cleanId;
};

/**
 * Gets the complete professional data from localStorage
 * @returns {object|null} The professional data object or null if not found
 */
export const getProfessionalData = () => {
    try {
        const spUserData = localStorage.getItem('spUserData');
        if (spUserData) {
            const userData = JSON.parse(spUserData);
            console.log('✅ Professional data from localStorage:', userData);
            return userData;
        }
        return null;
    } catch (error) {
        console.error('❌ Error retrieving professional data:', error);
        return null;
    }
};

/**
 * Debug function to log all professional-related localStorage data
 */
export const debugProfessionalData = () => {
    console.log('=== PROFESSIONAL DATA DEBUG ===');
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('token-sp:', localStorage.getItem('token-sp'));
    console.log('serviceProviderId:', localStorage.getItem('serviceProviderId'));
    console.log('spUserData:', localStorage.getItem('spUserData'));
    console.log('userRole:', localStorage.getItem('userRole'));
    
    const professionalId = getProfessionalId();
    const professionalData = getProfessionalData();
    
    console.log('Extracted professional ID:', professionalId);
    console.log('Is valid ObjectId:', isValidObjectId(professionalId));
    console.log('Complete professional data:', professionalData);
    
    // Check if serviceProviderId and spUserData._id are the same
    const serviceProviderId = localStorage.getItem('serviceProviderId');
    if (professionalData && professionalData._id) {
        console.log('serviceProviderId from localStorage:', serviceProviderId);
        console.log('professional._id from spUserData:', professionalData._id);
        console.log('Are they the same?', serviceProviderId === professionalData._id);
    }
    
    console.log('=== END DEBUG ===');
};

/**
 * Ensures professional data is properly stored in localStorage
 * @param {object} professionalData - The professional data to store
 */
export const storeProfessionalData = (professionalData) => {
    try {
        if (professionalData && professionalData._id) {
            localStorage.setItem('serviceProviderId', professionalData._id);
            localStorage.setItem('spUserData', JSON.stringify(professionalData));
            console.log('✅ Professional data stored successfully:', professionalData._id);
        } else {
            console.warn('⚠️ Invalid professional data provided for storage');
        }
    } catch (error) {
        console.error('❌ Error storing professional data:', error);
    }
};


