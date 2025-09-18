import React, {useState, useRef, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import { useAlert } from '../context/AlertContext';
import { BaseUrl } from '../assets/BaseUrl';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useUserRole } from '../hooks/useUserRole';
import { useSPProfile } from '../context/SPProfileContext.jsx';

import '../css/pages/profile.scss';
import PersonIcon from "/public/images/profile/profile-circle.svg";
import NotificationIcon from "/public/images/profile/Bell.svg";
import BoxIcon from "/public/images/profile/box.svg";
import CreditIcon from "/public/images/profile/credit.svg";
import ServiceIcon from "/public/images/profile/service.svg";
import HeartIcon from "/public/images/profile/Heart.svg";
import SidePattern from '/public/images/side-pattern.svg';
import Bin from '/public/images/profile/bin-icon.svg';
import OrderCard from '../components/OrderCard';
import ServiceCard from '../components/ServiceCard';
import ProjectCard from "../components/ProjectCard.jsx";
import PricingPackages from '../components/PricingPackages';
import PaymentForm from '../components/PaymentForm';

const ProfileSP = () => {
    const {t} = useTranslation();
    const { showAlert } = useAlert();
    const [searchParams] = useSearchParams();
    const { userRole, isLoading } = useUserRole();
    const { refreshSPProfile } = useSPProfile();
    const [activeTab, setActiveTab] = useState('profile');
    const [profileImage, setProfileImage] = useState(null);
    const [showSidebar, setShowSidebar] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isFetchingProfile, setIsFetchingProfile] = useState(false);

    const fileInputRef = useRef(null);

    // Real profile data from API
    const [profileData, setProfileData] = useState({
        name: '',
        workTitle: '',
        email: '',
        phoneNo: '',
        bio: '',
        experience: '',
        specializations: [],
        latitude: '',
        longitude: '',
        pic: '',
        image: ''
    });

    // Track if user has selected a new image
    const [hasNewImage, setHasNewImage] = useState(false);
    
    // Portfolio data from API
    const [portfolioData, setPortfolioData] = useState([]);

    // Notification state management
    const [notifications, setNotifications] = useState([]);
    const [notificationsCount, setNotificationsCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [loadingCount, setLoadingCount] = useState(false);
    const [notificationsError, setNotificationsError] = useState(null);
    const [markingAsRead, setMarkingAsRead] = useState(null);
    const [currentNotificationsPage, setCurrentNotificationsPage] = useState(1);
    const [notificationsPagination, setNotificationsPagination] = useState({
        totalPages: 1,
        currentPage: 1,
        totalCount: 0,
        limit: 20,
        hasNextPage: false,
        hasPrevPage: false
    });
    const [isFirstVisit, setIsFirstVisit] = useState(true);


    // Sample payment methods data
    const [paymentMethods, setPaymentMethods] = useState([
        {
            id: 1,
            type: 'mastercard',
            name: t('profileSP.paymentMethods.masterCard'),
            cardNumber: '3456 XX78 9800 55X3',
            cardholderName: 'John Doe',
            cvv: '123',
            expirationDate: '12/25'
        },
        {
            id: 2,
            type: 'visa',
            name: t('profileSP.paymentMethods.visaCard'),
            cardNumber: '5677 3490 XX90 XX23',
            cardholderName: 'Jane Smith',
            cvv: '456',
            expirationDate: '08/26'
        }
    ]);

    // Sample projects data for service provider
    const [projects, setProjects] = useState([
        {
            id: 1,
            projectName: t('profileSP.projects.projectName'),
            status: t('profileSP.projects.completed'),
            client: t('profileSP.projects.clientName'),
            amount: t('profileSP.projects.amount'),
            rating: 5,
            image: '/public/images/home/product-card-bg.png'
        },
        {
            id: 2,
            projectName: t('profileSP.projects.projectName'),
            status: t('profileSP.projects.inProgress'),
            client: t('profileSP.projects.clientName'),
            amount: t('profileSP.projects.amount'),
            rating: 4,
            image: '/public/images/home/product-card-bg.png'
        }
    ]);


    // Fetch service provider profile data
    const fetchProfileData = async () => {
        // Prevent multiple simultaneous calls
        if (isFetchingProfile) {
            console.log('ProfileSP fetch already in progress, skipping...');
            return;
        }
        
        try {
            setIsFetchingProfile(true);
            setLoading(true);
            
            // Get professional ID from spUserData first, then fallback to serviceProviderId
            let serviceProviderId = null;
            try {
                const spUserData = localStorage.getItem('spUserData');
                if (spUserData) {
                    const userData = JSON.parse(spUserData);
                    serviceProviderId = userData._id;
                    console.log('Professional ID from localStorage spUserData:', serviceProviderId);
                }
            } catch (error) {
                console.error('Error parsing spUserData:', error);
            }
            
            // Fallback to serviceProviderId if spUserData doesn't have _id
            if (!serviceProviderId) {
                serviceProviderId = localStorage.getItem('serviceProviderId');
                console.log('Using fallback serviceProviderId:', serviceProviderId);
            }
            
            const token = localStorage.getItem('token-sp');
            
            if (!serviceProviderId || !token) {
                showAlert('Please login again', 'error');
                return;
            }

            const response = await fetch(`${BaseUrl}/professional/get-professsional/${serviceProviderId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // Handle 404 specifically - use localStorage data as fallback
                if (response.status === 404) {
                    console.warn('Service provider not found in API, using localStorage data as fallback');
                    const spUserData = localStorage.getItem('spUserData');
                    if (spUserData) {
                        try {
                            const fallbackData = JSON.parse(spUserData);
                            console.log('Using localStorage fallback data in ProfileSP:', fallbackData);
                            
                            setProfileData({
                                name: fallbackData.name || '',
                                workTitle: fallbackData.workTitle || '',
                                email: fallbackData.email || '',
                                phoneNo: fallbackData.phoneNo || '',
                                bio: fallbackData.bio || '',
                                experience: fallbackData.experience || '',
                                specializations: fallbackData.specializations || [],
                                latitude: fallbackData.latitude || '',
                                longitude: fallbackData.longitude || '',
                                address: fallbackData.address || '',
                                pic: fallbackData.pic || '',
                                image: fallbackData.image || ''
                            });
                            
                            if (fallbackData.portfolio && Array.isArray(fallbackData.portfolio)) {
                                setPortfolioData(fallbackData.portfolio);
                            } else {
                                setPortfolioData([]);
                            }
                            
                            return; // Exit successfully with fallback data
                        } catch (parseError) {
                            console.error('Failed to parse localStorage spUserData:', parseError);
                        }
                    }
                }
                throw new Error('Failed to fetch profile data');
            }

            const data = await response.json();
            if (data.professional) {
                setProfileData({
                    name: data.professional.name || '',
                    workTitle: data.professional.workTitle || '',
                    email: data.professional.email || '',
                    phoneNo: data.professional.phoneNo || '',
                    bio: data.professional.bio || '',
                    experience: data.professional.experience || '',
                    specializations: data.professional.specializations || [],
                    latitude: data.professional.latitude || '',
                    longitude: data.professional.longitude || '',
                    pic: data.professional.pic || '',
                    image: data.professional.image || ''
                });
                
                // Set profile image if available, otherwise keep as null to show avatar
                const imageUrl = data.professional.pic || data.professional.image;
                if (imageUrl && imageUrl.trim() !== '') {
                    setProfileImage(imageUrl);
                } else {
                    setProfileImage(null); // This will show the default avatar
                }
                setHasNewImage(false); // Reset new image flag
                
                // Set portfolio data
                if (data.professional.portfolio && Array.isArray(data.professional.portfolio)) {
                    setPortfolioData(data.professional.portfolio);
                } else {
                    setPortfolioData([]);
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            showAlert('Failed to load profile data', 'error');
        } finally {
            setLoading(false);
            setIsFetchingProfile(false);
        }
    };

    // Update service provider profile data
    const updateProfileData = async () => {
        try {
            setSaving(true);
            
            // Get professional ID from spUserData first, then fallback to serviceProviderId
            let serviceProviderId = null;
            try {
                const spUserData = localStorage.getItem('spUserData');
                if (spUserData) {
                    const userData = JSON.parse(spUserData);
                    serviceProviderId = userData._id;
                    console.log('Professional ID from localStorage spUserData (update):', serviceProviderId);
                }
            } catch (error) {
                console.error('Error parsing spUserData (update):', error);
            }
            
            // Fallback to serviceProviderId if spUserData doesn't have _id
            if (!serviceProviderId) {
                serviceProviderId = localStorage.getItem('serviceProviderId');
                console.log('Using fallback serviceProviderId (update):', serviceProviderId);
            }
            
            const token = localStorage.getItem('token-sp');
            
            if (!serviceProviderId || !token) {
                showAlert('Please login again', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('name', profileData.name);
            formData.append('workTitle', profileData.workTitle);
            formData.append('email', profileData.email);
            formData.append('phoneNo', profileData.phoneNo);
            formData.append('bio', profileData.bio);
            formData.append('experience', profileData.experience);
            
            if (profileData.latitude) {
                formData.append('latitude', profileData.latitude);
            }
            if (profileData.longitude) {
                formData.append('longitude', profileData.longitude);
            }

            // Add profile image if a new one was selected
            const fileInput = fileInputRef.current;
            if (fileInput && fileInput.files && fileInput.files[0]) {
                console.log('Uploading file:', fileInput.files[0].name, 'Size:', fileInput.files[0].size);
                // Use the same field name as Postman: 'image'
                formData.append('image', fileInput.files[0]);
            }

            // Debug: Log all form data keys
            console.log('FormData keys being sent:');
            for (let [key, value] of formData.entries()) {
                console.log(key, ':', value instanceof File ? `File: ${value.name}` : value);
            }

            const response = await fetch(`${BaseUrl}/professional/update-professsional/${serviceProviderId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Update profile error:', errorData);
                throw new Error(errorData.message || `Failed to update profile (${response.status})`);
            }

            const data = await response.json();
            if (data.professional) {
                showAlert(t('profileSP.profileUpdatedSuccessfully', 'Profile updated successfully!'), 'success');
                setIsEditing(false);
                // Update localStorage with new data
                localStorage.setItem('spUserData', JSON.stringify(data.professional));
                
                // Refresh SP profile data in context to update navbar
                try {
                    const updatedProfile = await refreshSPProfile();
                    console.log('✅ Navbar SP profile data refreshed after update:', {
                        name: updatedProfile?.name,
                        pic: updatedProfile?.pic,
                        timestamp: new Date().toISOString()
                    });
                    
                    // Force a small delay to ensure image cache is cleared
                    setTimeout(() => {
                        console.log('🔄 Forcing image cache refresh...');
                        window.dispatchEvent(new Event('profileImageUpdated'));
                    }, 100);
                } catch (error) {
                    console.error('❌ Failed to refresh navbar SP profile data:', error);
                }
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showAlert('Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Define all functions before useEffect hooks that use them
    // Fetch notifications from API
    const fetchNotifications = async (page = 1) => {
        try {
            setLoadingNotifications(true);
            setNotificationsError(null);
            
            const token = localStorage.getItem('token-sp');
            if (!token) {
                showAlert('Please login again', 'error');
                return;
            }
            
            const response = await fetch(`${BaseUrl}/professional/notification/all?page=${page}&limit=20&language=${t('common.language')}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch notifications: ${response.status}`);
            }

            const data = await response.json();
            console.log('Professional Notifications API Response:', data);
            
            if (data.success && Array.isArray(data.data)) {
                setNotifications(data.data);
                
                // Handle pagination from API response
                const paginationData = data.pagination || {};
                setNotificationsPagination({
                    totalPages: paginationData.totalPages || 1,
                    currentPage: paginationData.currentPage || 1,
                    totalCount: paginationData.totalCount || data.data.length,
                    limit: paginationData.limit || 20,
                    hasNextPage: paginationData.hasNextPage || false,
                    hasPrevPage: paginationData.hasPrevPage || false
                });
                
                // Auto-mark notifications as read if this is not the first visit
                if (!isFirstVisit) {
                    await autoMarkNotificationsAsRead(data.data);
                } else {
                    setIsFirstVisit(false);
                }
                
                console.log('Set professional notifications:', data.data.length, 'Total count:', paginationData.totalCount);
            } else {
                setNotifications([]);
                setNotificationsPagination({
                    totalPages: 1,
                    currentPage: 1,
                    totalCount: 0,
                    limit: 20,
                    hasNextPage: false,
                    hasPrevPage: false
                });
            }
        } catch (error) {
            setNotificationsError(error.message);
            console.error('Error fetching professional notifications:', error);
        } finally {
            setLoadingNotifications(false);
        }
    };

    // Fetch notification count
    const fetchNotificationCount = async () => {
        try {
            setLoadingCount(true);
            
            const token = localStorage.getItem('token-sp');
            if (!token) {
                showAlert('Please login again', 'error');
                return;
            }
            
            const response = await fetch(`${BaseUrl}/professional/notification/count`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch notification count: ${response.status}`);
            }

            const data = await response.json();
            console.log('Professional Notification Count API Response:', data);
            
            if (data.success && typeof data.count === 'number') {
                setNotificationsCount(data.count);
                console.log('Set professional notification count:', data.count);
            } else {
                setNotificationsCount(0);
            }
        } catch (error) {
            console.error('Error fetching professional notification count:', error);
            setNotificationsCount(0);
        } finally {
            setLoadingCount(false);
        }
    };

    // All useEffect hooks must be called before any conditional returns
    // Load profile data on component mount
    useEffect(() => {
        fetchProfileData();
    }, []);

    // Fetch notifications when notifications tab is active
    useEffect(() => {
        if (activeTab === 'notifications') {
            fetchNotifications();
            fetchNotificationCount();
        } else {
            // Reset first visit state when leaving notifications tab
            setIsFirstVisit(true);
        }
    }, [activeTab]);

    // Fetch notification count on component mount
    useEffect(() => {
        fetchNotificationCount();
    }, []);

    // Handle tab query parameter
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam && ['profile', 'notifications', 'packages', 'projectPriceRequest'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    // Update payment methods when language changes
    useEffect(() => {
        setPaymentMethods([
            {
                id: 1,
                type: 'mastercard',
                name: t('profileSP.paymentMethods.masterCard'),
                cardNumber: '3456 XX78 9800 55X3',
                cardholderName: 'John Doe',
                cvv: '123',
                expirationDate: '12/25'
            },
            {
                id: 2,
                type: 'visa',
                name: t('profileSP.paymentMethods.visaCard'),
                cardNumber: '5677 3490 XX90 XX23',
                cardholderName: 'Jane Smith',
                cvv: '456',
                expirationDate: '08/26'
            }
        ]);
    }, [t]);

    // Update projects when language changes
    useEffect(() => {
        setProjects([
            {
                id: 1,
                projectName: t('profileSP.projects.projectName'),
                status: t('profileSP.projects.completed'),
                client: t('profileSP.projects.clientName'),
                amount: t('profileSP.projects.amount'),
                rating: 5,
                image: '/public/images/home/product-card-bg.png'
            },
            {
                id: 2,
                projectName: t('profileSP.projects.projectName'),
                status: t('profileSP.projects.inProgress'),
                client: t('profileSP.projects.clientName'),
                amount: t('profileSP.projects.amount'),
                rating: 4,
                image: '/public/images/home/product-card-bg.png'
            }
        ]);
    }, [t]);

    // Function to refresh portfolio data
    const refreshPortfolio = () => {
        fetchProfileData();
    };

    // Role-based access control - must be after all hooks
    if (isLoading) {
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

    // Redirect regular users to their profile page
    if (userRole === 'user') {
        return <Navigate to="/profile" replace />;
    }

    // Redirect unauthenticated users to home
    if (userRole === 'unauthenticated') {
        return <Navigate to="/" replace />;
    }

    const serviceData = [
        {
            id: 1,
            title: t('profileSP.services.modernCeilingLights.title'),
            company: t('profileSP.services.modernCeilingLights.company'),
            code: t('profileSP.services.modernCeilingLights.code'),
            image: "lamp1.jpg",
        },
        {
            id: 2,
            title: t('profileSP.services.luxuryLamps.title'),
            company: t('profileSP.services.luxuryLamps.company'),
            code: t('profileSP.services.luxuryLamps.code'),
            image: "lamp2.jpg",
        },
        {
            id: 3,
            title: t('profileSP.services.pendantLighting.title'),
            company: t('profileSP.services.pendantLighting.company'),
            code: t('profileSP.services.pendantLighting.code'),
            image: "lamp3.jpg",
        },
    ];


    const sidebarItems = [
        {
            id: 'profile',
            icon: PersonIcon,
            text: t('profileSP.sidebar.myProfile'),
            active: true
        },
        {
            id: 'notifications',
            icon: NotificationIcon,
            text: t('profileSP.sidebar.notifications'),
            active: false,
            badge: notificationsCount > 0 ? notificationsCount : null
        },
        {
            id: 'packages',
            icon: BoxIcon,
            text: t('profileSP.sidebar.packages'),
            active: false
        },
        // {
        //     id: 'payments',
        //     icon: CreditIcon,
        //     text: t('profileSP.sidebar.payments'),
        //     active: false
        // },
        {
            id: 'projectPriceRequest',
            icon: ServiceIcon,
            text: t('profileSP.sidebar.projectPriceRequest'),
            active: false
        }
    ];

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        // Hide sidebar on mobile when tab is selected
        if (window.innerWidth <= 992) {
            setShowSidebar(false);
        }
    };

    // Auto-mark notifications as read function
    const autoMarkNotificationsAsRead = async (notifications) => {
        try {
            const unreadNotificationIds = notifications
                .filter(notification => !notification.isRead)
                .map(notification => notification._id);
            
            if (unreadNotificationIds.length === 0) {
                console.log('No unread professional notifications to auto-mark as read');
                return;
            }
            
            const token = localStorage.getItem('token-sp');
            if (!token) return;
            
            const markAsReadPromises = unreadNotificationIds.map(notificationId => 
                fetch(`${BaseUrl}/professional/notification/read/${notificationId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                })
            );
            
            await Promise.all(markAsReadPromises);
            
            setNotificationsCount(prevCount => Math.max(0, prevCount - unreadNotificationIds.length));
            
            setNotifications(prevNotifications => 
                prevNotifications.map(notification => 
                    unreadNotificationIds.includes(notification._id)
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
            
            console.log(`Auto-marked ${unreadNotificationIds.length} professional notifications as read`);
        } catch (error) {
            console.error('Error auto-marking professional notifications as read:', error);
        }
    };

    // Mark notification as read
    const markNotificationAsRead = async (notificationId) => {
        try {
            setMarkingAsRead(notificationId);
            
            const token = localStorage.getItem('token-sp');
            if (!token) {
                showAlert('Please login again', 'error');
                return;
            }
            
            const response = await fetch(`${BaseUrl}/professional/notification/read/${notificationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to mark notification as read: ${response.status}`);
            }

            const data = await response.json();
            console.log('Professional Mark as Read API Response:', data);
            
            if (data.success) {
                setNotifications(prevNotifications => 
                    prevNotifications.map(notification => 
                        notification._id === notificationId 
                            ? { ...notification, isRead: true }
                            : notification
                    )
                );
                
                setNotificationsCount(prevCount => Math.max(0, prevCount - 1));
                
                console.log('Professional notification marked as read:', notificationId);
            } else {
                throw new Error(data.message || 'Failed to mark notification as read');
            }
        } catch (error) {
            console.error('Error marking professional notification as read:', error);
            showAlert(error.message || t('common.operationFailed'), 'error');
        } finally {
            setMarkingAsRead(null);
        }
    };

    // Mark all notifications as read
    const markAllNotificationsAsRead = async () => {
        try {
            const token = localStorage.getItem('token-sp');
            if (!token) {
                showAlert('Please login again', 'error');
                return;
            }
            
            const response = await fetch(`${BaseUrl}/professional/notification/read-all`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to mark all notifications as read: ${response.status}`);
            }

            const data = await response.json();
            console.log('Professional Mark All as Read API Response:', data);
            
            if (data.success) {
                setNotifications(prevNotifications => 
                    prevNotifications.map(notification => ({ ...notification, isRead: true }))
                );
                
                setNotificationsCount(0);
                
                console.log('All professional notifications marked as read');
                showAlert(t('profile.notifications.allMarkedAsRead'), 'success');
            } else {
                throw new Error(data.message || 'Failed to mark all notifications as read');
            }
        } catch (error) {
            console.error('Error marking all professional notifications as read:', error);
            showAlert(error.message || t('common.operationFailed'), 'error');
        }
    };

    // Delete notification
    const deleteNotification = async (notificationId) => {
        try {
            const token = localStorage.getItem('token-sp');
            if (!token) {
                showAlert('Please login again', 'error');
                return;
            }
            
            const response = await fetch(`${BaseUrl}/professional/notification/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to delete notification: ${response.status}`);
            }

            const data = await response.json();
            console.log('Professional Delete Notification API Response:', data);
            
            if (data.success) {
                setNotifications(prevNotifications => 
                    prevNotifications.filter(notification => notification._id !== notificationId)
                );
                
                // Update count if the deleted notification was unread
                const deletedNotification = notifications.find(n => n._id === notificationId);
                if (deletedNotification && !deletedNotification.isRead) {
                    setNotificationsCount(prevCount => Math.max(0, prevCount - 1));
                }
                
                console.log('Professional notification deleted:', notificationId);
                showAlert(t('profile.notifications.deleted'), 'success');
            } else {
                throw new Error(data.message || 'Failed to delete notification');
            }
        } catch (error) {
            console.error('Error deleting professional notification:', error);
            showAlert(error.message || t('common.operationFailed'), 'error');
        }
    };

    const handleNotificationsPageChange = (page) => {
        setCurrentNotificationsPage(page);
        fetchNotifications(page);
    };

    const handleBackToSidebar = () => {
        setShowSidebar(true);
    };

    const handleEditProfile = () => {
        setIsEditing(true);
    };

    const handleSaveProfile = () => {
        updateProfileData();
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setHasNewImage(false); // Reset new image flag
        // Reload original data
        fetchProfileData();
    };

    const handleChangePassword = () => {
        console.log('Change password clicked');
    };

    const handleProfilePictureChange = () => {
        if (isEditing) {
        fileInputRef.current.click();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target.result);
                setHasNewImage(true); // Mark that user has selected a new image
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };


    const handleSavePayment = (formData) => {
        const newPayment = {
            id: Date.now(),
            type: 'visa',
            name: t('profileSP.paymentMethods.visaCard'),
            cardNumber: formData.cardNumber,
            cardholderName: formData.cardholderName,
            cvv: formData.cvv,
            expirationDate: formData.expirationDate
        };
        setPaymentMethods(prev => [...prev, newPayment]);

        // Show success message or handle as needed
        console.log('Payment method added successfully:', newPayment);
    };

    const handleDeletePayment = (paymentId) => {
        setPaymentMethods(prev => prev.filter(payment => payment.id !== paymentId));
    };

    return (
        <div className="profile-page sp-profile">
            <div className="d-none d-lg-block">
                <img className='side-pattern' src={SidePattern} alt=""/>
            </div>
            <div className="profile-container container-md">
                {/* Header */}
                <div className="profile-header">
                    <div className="container-md">
                        <div className="header-row">
                            <h1 className="header-title ar-heading-bold">
                                <i className="fas fa-home home-icon"></i>
                                {t('profileSP.headerTitle')}
                            </h1>
                        
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="profile-content">
                    {/* Sidebar - Show on desktop or when showSidebar is true */}
                    {showSidebar && (
                        <div className="sidebar">
                            {sidebarItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                                    onClick={() => handleTabClick(item.id)}
                                >
                                    <div className="sidebar-icon">
                                        <img src={item.icon} alt=""
                                             className={item.id === 'favorites' ? 'heart-black' : ''}/>
                                        {item.badge && (
                                            <span className="notification-badge">{item.badge}</span>
                                        )}
                                    </div>
                                    <span className="sidebar-text">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Main Content Area */}
                    <div className="main-content">
                        {/* Back button for mobile when sidebar is hidden */}
                        {!showSidebar && window.innerWidth <= 992 && (
                            <div className="mobile-back-button">
                                <button 
                                    className="btn btn-secondary mb-3"
                                    onClick={handleBackToSidebar}
                                >
                                    <i className="fas fa-arrow-right me-2"></i>
                                    {t('common.back', 'Back')}
                                </button>
                            </div>
                        )}
                        {activeTab === 'profile' && (
                            <>
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3">Loading profile data...</p>
                                    </div>
                                ) : (
                            <>
                                {/* Profile Picture and Name Section */}
                                <div className="profile-header-section">
                                    <div className="profile-picture-container">
                                        {profileImage && profileImage.trim() !== '' ? (
                                            <img
                                                src={profileImage}
                                                alt="Profile"
                                                className="profile-picture"
                                            />
                                        ) : (
                                            <div className="profile-picture default-avatar">
                                                <i className="fas fa-user"></i>
                                            </div>
                                        )}
                                        {isEditing && (
                                            <div
                                                className="camera-icon"
                                                onClick={handleProfilePictureChange}
                                                title={profileImage ? "Click to change profile picture" : "Click to add profile picture"}
                                                style={{ 
                                                    cursor: 'pointer',
                                                    opacity: 1,
                                                    transition: 'opacity 0.3s ease',
                                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                                    borderRadius: '50%',
                                                    padding: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                            
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            style={{display: 'none'}}
                                        />
                                    </div>

                                    <div className="profile-info">
                                        <div className="name-section">
                                            <h2 className="user-name ar-heading-bold">{profileData.name}</h2>
                                            {/* <div className="edit-name-icon">
                                                <i className="fas fa-pencil"></i>
                                            </div> */}
                                        </div>

                                        {/* <div className="membership-section">
                                            <span
                                                className="membership-tag">{t('profileSP.content.currentMembership')}</span>
                                            <div className='divider'></div>
                                            <span
                                                className="membership-tag">{t('profileSP.content.freeMembership')}</span>
                                            <span
                                                className="membership-tag upgrade-tag">{t('profileSP.content.upgradeButton')}</span>
                                        </div> */}
                                    </div>
                                </div>
                                <div className='horizontal-splitter'></div>
                                {/* Contact Information Section */}
                                <div className="contact-section">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label
                                                className="form-label">{t('profileSP.content.professionLabel')}</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={profileData.workTitle}
                                                onChange={(e) => handleInputChange('workTitle', e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label
                                                className="form-label">{t('profileSP.content.phoneNumberLabel')}</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={profileData.phoneNo}
                                                onChange={(e) => handleInputChange('phoneNo', e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label">{t('profileSP.content.emailLabel')}</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={profileData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Experience (Years)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={profileData.experience}
                                                onChange={(e) => handleInputChange('experience', e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Bio</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={profileData.bio}
                                                onChange={(e) => handleInputChange('bio', e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Suggested Services Section */}
                                {/* <div className="suggested-services-section">
                                    <h3 className="section-title mb-3 ar-heading-bold">{t('profileSP.content.suggestedServices')}</h3>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <div className="service-card">
                                                <div className="service-content">
                                                    <div className="edit-service-icon">
                                                        <i className="fas fa-pencil"></i>
                                                    </div>
                                                    <span
                                                        className="service-description">{t('profileSP.suggestedServices.lampRepair')}</span>
                                                    <div className='divider'></div>
                                                    <div className="service-price">125 د.ك.</div>
                                                </div>

                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="service-card">
                                                <div className="service-content">
                                                    <div className="edit-service-icon">
                                                        <i className="fas fa-pencil"></i>
                                                    </div>
                                                    <span
                                                        className="service-description">{t('profileSP.suggestedServices.electricalRepair')}</span>
                                                    <div className='divider'></div>
                                                    <div className="service-price">245 د.ك.</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div> */}

                                {/* Action Buttons Section */}
                                <div className="action-buttons-section">
                                    <div className="row">
                                        {!isEditing ? (
                                            <>
                                        <div className="col-12 mb-3">
                                            {/* <button
                                                className="btn btn-secondary w-100"
                                                onClick={handleChangePassword}
                                            >
                                                {t('profileSP.content.changePasswordButton')}
                                            </button> */}
                                        </div>
                                        <div className="col-12 mb-3">
                                            <button
                                                className="btn btn-primary w-100"
                                                onClick={handleEditProfile}
                                                        disabled={loading}
                                                    >
                                                        {loading ? 'Loading...' : t('profileSP.content.editProfileButton')}
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="col-md-6 mb-3">
                                                    <button
                                                        className="btn btn-secondary w-100"
                                                        onClick={handleCancelEdit}
                                                    >
                                                        {t('common.cancel', 'Cancel')}
                                                    </button>
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <button
                                                        className="btn btn-primary w-100"
                                                        onClick={handleSaveProfile}
                                                        disabled={saving}
                                                    >
                                                        {saving ? t('common.saving', 'Saving...') : t('common.saveChanges', 'Save Changes')}
                                            </button>
                                        </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className='mt-5'>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h3 className='ar-heading-bold mb-0'>
                                            {t('profileSP.projects.participatedProjects', 'Projects you participated in completing')}
                                        </h3>
                                        <button 
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={refreshPortfolio}
                                            disabled={loading}
                                        >
                                            <i className="fas fa-sync-alt me-1"></i>
                                            {loading ? 'Loading...' : 'Refresh'}
                                        </button>
                                    </div>
                                    <div className="projects-full-width">
                                        <div className="container-fluid p-0">
                                            {portfolioData.length > 0 ? (
                                                <div className="row">
                                                    {portfolioData.map((project, index) => (
                                                        <div key={project._id || index} className="col-lg-6 col-md-6 mb-4">
                                                            <ProjectCard
                                                                project={{
                                                                    id: project._id,
                                                                    title: project.description || "Project",
                                                                    image: project.images && project.images.length > 0 
                                                                        ? project.images[0] 
                                                                        : "/src/assets/payment/project-image.svg",
                                                                    categories: [project.projecttype || "Construction"],
                                                                    rating: 4.5, // Default rating since not in API
                                                                    date: project.date || project.createdAt?.split('T')[0] || "N/A",
                                                                    area: project.area,
                                                                    location: project.location
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-5">
                                                    <div className="empty-portfolio">
                                                        <i className="fas fa-folder-open fa-3x text-muted mb-3"></i>
                                                        <h5 className="text-muted">{t('profileSP.projects.noProjects', 'No projects completed yet')}</h5>
                                                        <p className="text-muted">{t('profileSP.projects.noProjectsDesc', 'Your completed projects will appear here')}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                    </>
                                )}
                            </>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="notifications-section">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h3 className="section-title ar-heading-bold">{t('profile.notifications.title')}</h3>
                                    {notifications.length > 0 && (
                                        <button 
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={markAllNotificationsAsRead}
                                            disabled={loadingNotifications}
                                        >
                                            {t('profile.notifications.markAllAsRead')}
                                        </button>
                                    )}
                                </div>
                                
                                {loadingNotifications ? (
                                    <div className="loading-spinner text-center py-5">
                                        <div className="spinner-border" role="status">
                                            <span className="visually-hidden">{t('common.loading')}</span>
                                        </div>
                                        <p className="mt-2">{t('common.loading')}</p>
                                    </div>
                                ) : notificationsError ? (
                                    <div className="error-message alert alert-danger">{notificationsError}</div>
                                ) : notifications.length > 0 ? (
                                    <>
                                        <div className="notifications-list">
                                            {notifications.map((notification) => (
                                                <div 
                                                    key={notification._id} 
                                                    className={`notification-item ${!notification.isRead ? 'unread' : 'read'}`}
                                                    onClick={() => {
                                                        if (!notification.isRead) {
                                                            markNotificationAsRead(notification._id);
                                                        }
                                                    }}
                                                    style={{ cursor: !notification.isRead ? 'pointer' : 'default' }}
                                                >
                                                    <div className="notification-content">
                                                        <div className="notification-header">
                                                            <h6 className={`notification-title ${!notification.isRead ? 'fw-bold' : ''}`}>
                                                                {notification.title || t('profile.notifications.defaultTitle')}
                                                            </h6>
                                                            <div className="notification-actions">
                                                                {markingAsRead === notification._id ? (
                                                                    <div className="spinner-border spinner-border-sm" role="status">
                                                                        <span className="visually-hidden">{t('common.loading')}</span>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            deleteNotification(notification._id);
                                                                        }}
                                                                        title={t('profile.notifications.delete')}
                                                                    >
                                                                        <i className="fas fa-trash"></i>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="notification-message">
                                                            {notification.message || notification.description || t('profile.notifications.noMessage')}
                                                        </p>
                                                        <div className="notification-meta">
                                                            <small className="text-muted">
                                                                {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : t('profile.notifications.noDate')}
                                                            </small>
                                                            {!notification.isRead && (
                                                                <span className="unread-indicator"></span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Pagination */}
                                        {notificationsPagination.totalPages > 1 && (
                                            <div className="pagination-wrapper mt-4">
                                                <nav aria-label="Notifications pagination">
                                                    <ul className="pagination justify-content-center">
                                                        <li className={`page-item ${!notificationsPagination.hasPrevPage ? 'disabled' : ''}`}>
                                                            <button 
                                                                className="page-link"
                                                                onClick={() => handleNotificationsPageChange(currentNotificationsPage - 1)}
                                                                disabled={!notificationsPagination.hasPrevPage}
                                                            >
                                                                {t('common.previous')}
                                                            </button>
                                                        </li>
                                                        
                                                        {Array.from({ length: notificationsPagination.totalPages }, (_, i) => i + 1).map(page => (
                                                            <li key={page} className={`page-item ${currentNotificationsPage === page ? 'active' : ''}`}>
                                                                <button 
                                                                    className="page-link"
                                                                    onClick={() => handleNotificationsPageChange(page)}
                                                                >
                                                                    {page}
                                                                </button>
                                                            </li>
                                                        ))}
                                                        
                                                        <li className={`page-item ${!notificationsPagination.hasNextPage ? 'disabled' : ''}`}>
                                                            <button 
                                                                className="page-link"
                                                                onClick={() => handleNotificationsPageChange(currentNotificationsPage + 1)}
                                                                disabled={!notificationsPagination.hasNextPage}
                                                            >
                                                                {t('common.next')}
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="no-notifications text-center py-5">
                                        <div className="no-notifications-icon mb-3">
                                            <i className="fas fa-bell-slash fa-3x text-muted"></i>
                                        </div>
                                        <h5 className="text-muted">{t('profile.notifications.noNotifications')}</h5>
                                      
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'packages' && (
                            <div className="pricing-packages-section">
                                <h3 className="section-title mb-4 ar-heading-bold">{t('profileSP.pricingPackages.title')}</h3>
                                <PricingPackages/>
                            </div>
                        )}

                        {/* {activeTab === 'payments' && (
                            <div className="payment-methods-section">
                                <PaymentForm
                                    onSubmit={handleSavePayment}
                                />
                            </div>
                        )} */}






                                          {activeTab === 'projectPriceRequest' && (
                                                               <ServiceCard
                         
                        />
             
       
     
)}
   

                                               
  


                    </div>

                </div>
            </div>


        </div>
    );
};

export default ProfileSP;
