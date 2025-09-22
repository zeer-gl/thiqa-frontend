import { BaseUrl } from '../assets/BaseUrl';

/**
 * Send notification to service provider when customer accepts their offer
 * @param {string} professionalId - The ID of the service provider
 * @param {string} customerId - The ID of the customer who accepted the offer
 * @param {string} projectId - The ID of the project/demand
 * @param {string} projectTitle - The title of the project
 * @param {string} language - The language for the notification (en/ar)
 * @returns {Promise<boolean>} - Returns true if notification was sent successfully
 */
export const sendOfferAcceptanceNotification = async (professionalId, customerId, projectId, projectTitle, language = 'en') => {
    try {
        console.log('=== SENDING OFFER ACCEPTANCE NOTIFICATION ===');
        console.log('Professional ID:', professionalId);
        console.log('Customer ID:', customerId);
        console.log('Project ID:', projectId);
        console.log('Project Title:', projectTitle);
        console.log('Language:', language);

        // Prepare notification payload
        const notificationPayload = {
            professionalId: professionalId,
            customerId: customerId,
            projectId: projectId,
            projectTitle: projectTitle,
            type: 'offer_accepted',
            language: language,
            message: {
                en: `Your offer for project "${projectTitle}" has been accepted by the customer!`,
                ar: `تم قبول عرضك لمشروع "${projectTitle}" من قبل العميل!`
            }
        };

        console.log('Notification payload:', notificationPayload);

        // Send notification to service provider
        const response = await fetch(`${BaseUrl}/professional/notification/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Note: This might need admin token or special permissions
                // For now, we'll try without authentication
            },
            body: JSON.stringify(notificationPayload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Failed to send notification:', errorData);
            
            // Don't throw error - notification failure shouldn't break the main flow
            console.warn('⚠️ Notification sending failed, but continuing with offer acceptance');
            return false;
        }

        const data = await response.json();
        console.log('✅ Notification sent successfully:', data);
        return true;

    } catch (error) {
        console.error('❌ Error sending notification:', error);
        // Don't throw error - notification failure shouldn't break the main flow
        console.warn('⚠️ Notification sending failed, but continuing with offer acceptance');
        return false;
    }
};

/**
 * Alternative method: Send notification via customer API (if professional API is not available)
 * @param {string} professionalId - The ID of the service provider
 * @param {string} customerId - The ID of the customer who accepted the offer
 * @param {string} projectId - The ID of the project/demand
 * @param {string} projectTitle - The title of the project
 * @param {string} language - The language for the notification (en/ar)
 * @returns {Promise<boolean>} - Returns true if notification was sent successfully
 */
export const sendOfferAcceptanceNotificationViaCustomer = async (professionalId, customerId, projectId, projectTitle, language = 'en') => {
    try {
        console.log('=== SENDING OFFER ACCEPTANCE NOTIFICATION VIA CUSTOMER API ===');
        console.log('Professional ID:', professionalId);
        console.log('Customer ID:', customerId);
        console.log('Project ID:', projectId);
        console.log('Project Title:', projectTitle);
        console.log('Language:', language);

        // Get customer token for authentication
        const customerToken = localStorage.getItem('token');
        if (!customerToken) {
            console.warn('⚠️ No customer token available for notification');
            return false;
        }

        // Prepare notification payload
        const notificationPayload = {
            professionalId: professionalId,
            customerId: customerId,
            projectId: projectId,
            projectTitle: projectTitle,
            type: 'offer_accepted',
            language: language,
            message: {
                en: `Your offer for project "${projectTitle}" has been accepted by the customer!`,
                ar: `تم قبول عرضك لمشروع "${projectTitle}" من قبل العميل!`
            }
        };

        console.log('Notification payload:', notificationPayload);

        // Send notification via customer API
        const response = await fetch(`${BaseUrl}/customer/notification/send-to-professional`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${customerToken}`,
            },
            body: JSON.stringify(notificationPayload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Failed to send notification via customer API:', errorData);
            
            // Don't throw error - notification failure shouldn't break the main flow
            console.warn('⚠️ Notification sending failed, but continuing with offer acceptance');
            return false;
        }

        const data = await response.json();
        console.log('✅ Notification sent successfully via customer API:', data);
        return true;

    } catch (error) {
        console.error('❌ Error sending notification via customer API:', error);
        // Don't throw error - notification failure shouldn't break the main flow
        console.warn('⚠️ Notification sending failed, but continuing with offer acceptance');
        return false;
    }
};

/**
 * Main function to send offer acceptance notification
 * Tries multiple methods to ensure notification is sent
 * @param {string} professionalId - The ID of the service provider
 * @param {string} customerId - The ID of the customer who accepted the offer
 * @param {string} projectId - The ID of the project/demand
 * @param {string} projectTitle - The title of the project
 * @param {string} language - The language for the notification (en/ar)
 * @returns {Promise<boolean>} - Returns true if notification was sent successfully
 */
export const notifyServiceProviderOfferAccepted = async (professionalId, customerId, projectId, projectTitle, language = 'en') => {
    try {
        console.log('=== NOTIFYING SERVICE PROVIDER OF OFFER ACCEPTANCE ===');
        
        // Try the professional API first
        let success = await sendOfferAcceptanceNotification(professionalId, customerId, projectId, projectTitle, language);
        
        // If that fails, try the customer API
        if (!success) {
            console.log('🔄 Trying alternative notification method...');
            success = await sendOfferAcceptanceNotificationViaCustomer(professionalId, customerId, projectId, projectTitle, language);
        }
        
        if (success) {
            console.log('✅ Service provider notification sent successfully');
        } else {
            console.warn('⚠️ All notification methods failed, but offer acceptance will continue');
        }
        
        return success;
        
    } catch (error) {
        console.error('❌ Error in notification service:', error);
        return false;
    }
};
