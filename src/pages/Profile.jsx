import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/pages/profile.scss';
import '../css/pages/home.scss';
import PersonIcon from "/public/images/profile/profile-circle.svg";

import NotificationIcon from "/public/images/profile/Bell.svg";
import BoxIcon from "/public/images/profile/box.svg";
import CreditIcon from "/public/images/profile/credit.svg";
import ServiceIcon from "/public/images/profile/service.svg";
import HeartIcon from "/public/images/profile/Heart.svg";
import SidePattern from '/public/images/side-pattern.svg';
import PhoneIcon from '/public/images/profile/phone-icon.svg';
import Bin from '/public/images/profile/bin-icon.svg';
import LockIcon from '/public/images/auth/reg-lock.svg';
import EyeIcon from '/public/images/eye.svg';

import OrderCard from '../components/OrderCard';
import ServiceCard from '../components/ServiceCard';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { BaseUrl } from '../assets/BaseUrl.jsx';
import { useAlert } from '../context/AlertContext';
import { useUser } from '../context/Profile.jsx';
import { useLocation as useLocationContext } from '../context/LocationContext.jsx';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Avatar from "@mui/material/Avatar";
import { useLikes } from '../context/LikesContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";
import StarHalf from "@mui/icons-material/StarHalf";
import BallPattern from '/public/images/home/ball-pattern.svg';
import GoogleMapAddressPicker from '../components/GoogleMapAddressPicker';
import { useLikedServicesTranslations } from '../hooks/useLikedServicesTranslations';
import { useUserRole } from '../hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import Logo from '/public/images/favicon.png';

const Profile = () => {
  // All hooks must be called at the top before any conditional returns
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const likedServicesTranslations = useLikedServicesTranslations();
  const { userRole, isLoading } = useUserRole();
  
  // Debug logging
  console.log('🔍 Profile Component Debug:', {
    userRole,
    isLoading,
    location: location.pathname,
    timestamp: new Date().toISOString()
  });
  
  // Ensure language is properly set when component mounts
  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng');
    console.log('🔍 Profile Language Debug:', {
      savedLanguage,
      currentLanguage: i18n.language,
      resolvedLanguage: i18n.resolvedLanguage
    });
    
    if (savedLanguage && savedLanguage !== i18n.language) {
      console.log('🔄 Changing language from', i18n.language, 'to', savedLanguage);
      i18n.changeLanguage(savedLanguage);
    }
    
    // Set document direction and language
    const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = i18n.language;
    
    console.log('📝 Document settings:', {
      dir: document.documentElement.dir,
      lang: document.documentElement.lang
    });
  }, [i18n]);

  // All state hooks
  const [activeTab, setActiveTab] = useState('profile');
  const [profileImage, setProfileImage] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPaymentEditMode, setIsPaymentEditMode] = useState(false);
  const fileInputRef = useRef(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const [ordersPagination, setOrdersPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [likedProducts, setLikedProducts] = useState([]);
  const [loadingLikedProducts, setLoadingLikedProducts] = useState(false);
  const [likedProductsError, setLikedProductsError] = useState(null);
  
  // Liked services state
  const [likedServices, setLikedServices] = useState([]);
  const [loadingLikedServices, setLoadingLikedServices] = useState(false);
  const [likedServicesError, setLikedServicesError] = useState(null);
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);
  const [currentNotificationsPage, setCurrentNotificationsPage] = useState(1);
  const [notificationsPagination, setNotificationsPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    totalCount: 0,
    limit: 5,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(null);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressesError, setAddressesError] = useState(null);
  
  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'mastercard',
      name: t('profile.paymentMethods.masterCard'),
      cardNumber: '3456 XX78 9800 55X3',
      cardholderName: 'John Doe',
      cvv: '123',
      expirationDate: '12/25',
    },
    {
      id: 2,
      type: 'visa',
      name: t('profile.paymentMethods.visaCard'),
      cardNumber: '5677 3490 XX90 XX23',
      cardholderName: 'Jane Smith',
      cvv: '456',
      expirationDate: '08/26',
    },
  ]);
  
  // Form states
  const [addressForm, setAddressForm] = useState({
    name: '',
    city: '',
    area: '',
    block: '',
    street: '',
    building: '',
    floor_apartment: '',
    lat: '',
    long: '',
    is_default: false
  });
  
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardholderName: '',
    expirationDate: '',
    cvv: '',
    type: 'visa'
  });
  
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  });
  
  const [changingPassword, setChangingPassword] = useState(false);
  const [changePasswordErrors, setChangePasswordErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  
  // Sample profile data - in a real app, this would come from an API or context
  const [profileData, setProfileData] = useState({
    name: t('profile.content.nameValue'),
    email: t('profile.content.emailValue'),
    phone: t('profile.content.phoneNumberValue'),
  });
  
  // OTP verification state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [otpRefs, setOtpRefs] = useState([]);
  const [phoneValid, setPhoneValid] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [pendingPhoneUpdate, setPendingPhoneUpdate] = useState('');
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  
  // Context hooks
  const { showAlert } = useAlert();
  const { userProfile, fetchUserProfile, updateUserProfile, logout } = useUser();
  const { likedProfessionals, toggleProfessionalLike } = useLikes();
  const { updateLocation } = useLocationContext();

  // All useEffect hooks must be at the top before any conditional returns
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phoneNo || '',
      });
      if (userProfile.pic) {
        setProfileImage(userProfile.pic);
      }
    }
  }, [userProfile]);

  // Fetch profile from API using context - only run once on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        setProfileError('');
        
        // Use the context's fetchUserProfile function
        await fetchUserProfile();
      } catch (e) {
        setProfileError(e?.message || 'Unable to load profile');
      } finally {
        setLoadingProfile(false);
      }
    };
    
    // Only fetch if we don't already have profile data
    if (!userProfile) {
      fetchProfile();
    }
  }, []); // Empty dependency array - only run once on mount


  // Initialize tab from URL query param if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

  // Fetch data when activeTab changes
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders(currentOrdersPage);
    } else if (activeTab === 'notifications') {
      fetchNotifications(currentNotificationsPage);
      fetchNotificationCount();
    } else if (activeTab === 'addresses') {
      fetchAddresses();
    } else if (activeTab === 'favorites') {
      fetchLikedProducts();
    } else if (activeTab === 'liked-services') {
      fetchLikedServices();
    }
  }, [activeTab, currentOrdersPage, currentNotificationsPage]);

  // Cleanup effect to restore scroll when component unmounts
  useEffect(() => {
    return () => {
      // Restore background scrolling when component unmounts
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Define all functions before useEffect hooks that use them
  const fetchOrders = async (page = 1) => {
    try {
      setLoadingOrders(true);
      setOrdersError(null);
      let userId = null;
      try {
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          userId = parsed?._id || parsed?.id || null;
        }
        if (!userId) {
          userId = localStorage.getItem('userId');
        }
      } catch {}

      if (!userId) {
        throw new Error('User not found in local storage');
      }

      const response = await fetch(`${BaseUrl}/customer/${userId}/order-history?page=${page}&limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data.data || []);
      setOrdersPagination(data.pagination || {
        totalPages: 1,
        currentPage: 1,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
      });
    } catch (error) {
      setOrdersError(error.message);
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleOrdersPageChange = (page) => {
    setCurrentOrdersPage(page);
    fetchOrders(page);
  };

  const fetchLikedProducts = async () => {
    try {
      setLoadingLikedProducts(true);
      setLikedProductsError(null);
      
      const response = await fetch(`${BaseUrl}/customer/customer-liked-products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch liked products: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setLikedProducts(data.data);
      } else {
        setLikedProducts([]);
      }
    } catch (error) {
      setLikedProductsError(error.message);
      console.error('Error fetching liked products:', error);
    } finally {
      setLoadingLikedProducts(false);
    }
  };

  const fetchLikedServices = async () => {
    try {
      setLoadingLikedServices(true);
      setLikedServicesError(null);
      
      const response = await fetch(`${BaseUrl}/customer/customer-liked-professionals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch liked services: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setLikedServices(data.data);
      } else {
        setLikedServices([]);
      }
    } catch (error) {
      setLikedServicesError(error.message);
      console.error('Error fetching liked services:', error);
    } finally {
      setLoadingLikedServices(false);
    }
  };

  // Fetch notifications from API
  const fetchNotifications = async (page = 1) => {
    try {
      setLoadingNotifications(true);
      setNotificationsError(null);
      
      const response = await fetch(`${BaseUrl}/customer/notification/all?page=${page}&limit=5&language=${i18n.language}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const data = await response.json();
      console.log('Notifications API Response:', data); // Debug log
      
      if (data.success && Array.isArray(data.data)) {
        // Show notifications with their actual read/unread status from API
        setNotifications(data.data);
        
        // Properly handle pagination from API response
        const paginationData = data.pagination || {};
        setNotificationsPagination({
          totalPages: paginationData.totalPages || 1,
          currentPage: paginationData.currentPage || 1,
          totalCount: paginationData.totalCount || data.data.length,
          limit: paginationData.limit || 5,
          hasNextPage: paginationData.hasNextPage || false,
          hasPrevPage: paginationData.hasPrevPage || false
        });
        
        // Auto-mark notifications as read if this is not the first visit
        if (!isFirstVisit) {
          await autoMarkNotificationsAsRead(data.data);
        } else {
          // Mark this as no longer the first visit
          setIsFirstVisit(false);
        }
        
        console.log('Set notifications:', data.data.length, 'Total count:', paginationData.totalCount); // Debug log
      } else {
        setNotifications([]);
        setNotificationsPagination({
          totalPages: 1,
          currentPage: 1,
          totalCount: 0,
          limit: 5,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      setNotificationsError(error.message);
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };


  // Auto-mark notifications as read function
  const autoMarkNotificationsAsRead = async (notifications) => {
    try {
      // Get unread notification IDs
      const unreadNotificationIds = notifications
        .filter(notification => !notification.isRead)
        .map(notification => notification._id);
      
      if (unreadNotificationIds.length === 0) {
        console.log('No unread notifications to auto-mark as read');
        return;
      }
      
      // Mark each unread notification as read
      const markAsReadPromises = unreadNotificationIds.map(notificationId => 
        fetch(`${BaseUrl}/customer/notification/read/${notificationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          }
        })
      );
      
      await Promise.all(markAsReadPromises);
      
      // Update the notification count (decrease by the number of unread notifications)
      setNotificationsCount(prevCount => Math.max(0, prevCount - unreadNotificationIds.length));
      
      // Update the local notifications state to show as read
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          unreadNotificationIds.includes(notification._id)
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      console.log(`Auto-marked ${unreadNotificationIds.length} notifications as read`);
    } catch (error) {
      console.error('Error auto-marking notifications as read:', error);
      // Don't show error to user as this is a background operation
    }
  };

  const handleNotificationsPageChange = (page) => {
    setCurrentNotificationsPage(page);
    fetchNotifications(page);
  };

  // Fetch notification count
  const fetchNotificationCount = async () => {
    try {
      setLoadingCount(true);
      
      const response = await fetch(`${BaseUrl}/customer/notification/count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notification count: ${response.status}`);
      }

      const data = await response.json();
      console.log('Notification Count API Response:', data); // Debug log
      
      if (data.success && typeof data.count === 'number') {
        setNotificationsCount(data.count);
        console.log('Set notification count:', data.count); // Debug log
      } else {
        setNotificationsCount(0);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
      setNotificationsCount(0);
    } finally {
      setLoadingCount(false);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      setMarkingAsRead(notificationId);
      
      const response = await fetch(`${BaseUrl}/customer/notification/read/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }

      const data = await response.json();
      console.log('Mark as Read API Response:', data); // Debug log
      
      if (data.success) {
        // Update the notification in the local state
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
        
        // Update the count (decrease by 1 if it was unread)
        setNotificationsCount(prevCount => Math.max(0, prevCount - 1));
        
        console.log('Notification marked as read:', notificationId);
      } else {
        throw new Error(data.message || 'Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showAlert(error.message || t('common.operationFailed'), 'error');
    } finally {
      setMarkingAsRead(null);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      setMarkingAllAsRead(true);
      
      const response = await fetch(`${BaseUrl}/customer/notification/read-all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to mark all notifications as read: ${response.status}`);
      }

      const data = await response.json();
      console.log('Mark All as Read API Response:', data); // Debug log
      
      if (data.success) {
        // Update all notifications in the local state to read
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({
            ...notification,
            isRead: true
          }))
        );
        
        // Reset the count to 0
        setNotificationsCount(0);
        
        showAlert(t('profile.notifications.allMarkedAsRead'), 'success');
        console.log('All notifications marked as read');
      } else {
        throw new Error(data.message || 'Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showAlert(error.message || t('common.operationFailed'), 'error');
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  // Fetch addresses from API
  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      setAddressesError(null);
      
      const response = await fetch(`${BaseUrl}/customer/address/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch addresses: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data && Array.isArray(data.data.addresses)) {
        setAddresses(data.data.addresses);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      setAddressesError(error.message);
      console.error('Error fetching addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Function to get default address
  const fetchDefaultAddress = async () => {
    try {
      const response = await fetch(`${BaseUrl}/customer/address/default`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch default address: ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching default address:', error);
      return null;
    }
  };

  // Function to set default address
  const handleSetDefaultAddress = async (addressId) => {
    try {
      // First, update the local state to show immediate feedback
      setAddresses(prevAddresses => 
        prevAddresses.map(addr => ({
          ...addr,
          is_default: addr._id === addressId
        }))
      );

      const response = await fetch(`${BaseUrl}/customer/address/set-default/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        }
      });

      if (!response.ok) {
        // Revert the local state if API call fails
        fetchAddresses();
        throw new Error(`Failed to set default address: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        showAlert(t('profile.addresses.defaultUpdatedSuccess'), 'success');
        // Refresh addresses to ensure consistency with server
        fetchAddresses();
        updateLocation(); // Update location in navbar
      } else {
        // Revert the local state if API call fails
        fetchAddresses();
        throw new Error(data.message || 'Failed to set default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      showAlert(error.message || t('profile.addresses.defaultUpdateError'), 'error');
    }
  };

  // Function to create new address
  const handleCreateAddress = async (formData) => {
    try {
      const response = await fetch(`${BaseUrl}/customer/address/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from the API
        if (data.error && data.error.includes('validation failed')) {
          // Extract specific validation error messages
          const errorMessage = data.error.replace('customer.CustomerAddresses validation failed: ', '');
          showAlert(errorMessage, 'error');
        } else {
          showAlert(data.message || `Failed to create address: ${response.status}`, 'error');
        }
        return false;
      }

      if (data.success) {
        showAlert(t('profile.addresses.createSuccess'), 'success');
        fetchAddresses(); // Refresh the list
        updateLocation(); // Update location in navbar
        return true;
      } else {
        showAlert(data.message || t('profile.addresses.createError'), 'error');
        return false;
      }
    } catch (error) {
      console.error('Error creating address:', error);
      showAlert(error.message || t('profile.addresses.createError'), 'error');
      return false;
    }
  };

  // Function to update address
  const handleUpdateAddress = async (addressId, formData) => {
    try {
      const response = await fetch(`${BaseUrl}/customer/address/update/${addressId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from the API
        if (data.error && data.error.includes('validation failed')) {
          // Extract specific validation error messages
          const errorMessage = data.error.replace('customer.CustomerAddresses validation failed: ', '');
          showAlert(errorMessage, 'error');
        } else {
          showAlert(data.message || `Failed to update address: ${response.status}`, 'error');
        }
        return false;
      }

      if (data.success) {
        showAlert(t('profile.addresses.updateSuccess'), 'success');
        fetchAddresses(); // Refresh the list
        updateLocation(); // Update location in navbar
        return true;
      } else {
        showAlert(data.message || t('profile.addresses.updateError'), 'error');
        return false;
      }
    } catch (error) {
      console.error('Error updating address:', error);
      showAlert(error.message || t('profile.addresses.updateError'), 'error');
      return false;
    }
  };

  // Function to delete address
  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await fetch(`${BaseUrl}/customer/address/delete/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete address: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        showAlert(t('profile.addresses.deleteSuccess'), 'success');
        fetchAddresses(); // Refresh the list
        updateLocation(); // Update location in navbar
      } else {
        throw new Error(data.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      showAlert(error.message || 'Failed to delete address', 'error');
    }
  };

  // Update payment methods when language changes
  useEffect(() => {
    setPaymentMethods([
      {
        id: 1,
        type: 'mastercard',
        name: t('profile.paymentMethods.masterCard'),
        cardNumber: '3456 XX78 9800 55X3',
        cardholderName: 'John Doe',
        cvv: '123',
        expirationDate: '12/25',
      },
      {
        id: 2,
        type: 'visa',
        name: t('profile.paymentMethods.visaCard'),
        cardNumber: '5677 3490 XX90 XX23',
        cardholderName: 'Jane Smith',
        cvv: '456',
        expirationDate: '08/26',
      },
    ]);
  }, [t]);

  // Note: Removed mock orders data - now using API data from fetchOrders()

  const cardData = [
    {
      id: 1,
      title: t('profile.cards.modernCeilingLights.title'),
      company: t('profile.cards.modernCeilingLights.company'),
      code: t('profile.cards.modernCeilingLights.code'),
      image: 'lamp1.jpg',
    },
    {
      id: 2,
      title: t('profile.cards.luxuryLamps.title'),
      company: t('profile.cards.luxuryLamps.company'),
      code: t('profile.cards.luxuryLamps.code'),
      image: 'lamp2.jpg',
    },
    {
      id: 3,
      title: t('profile.cards.pendantLighting.title'),
      company: t('profile.cards.pendantLighting.company'),
      code: t('profile.cards.pendantLighting.code'),
      image: 'lamp3.jpg',
    },
  ];


  const sidebarItems = [
    {
      id: 'profile',
      icon: PersonIcon,
      text: t('profile.sidebar.personalProfile'),
      active: true,
    },
    {
      id: 'notifications',
      icon: NotificationIcon,
      text: t('profile.sidebar.notifications'),
      active: false,
    },
    {
      id: 'addresses',
      icon: BoxIcon,
      text: t('profile.sidebar.myAddresses'),
      active: false,
    },
    {
      id: 'orders',
      icon: BoxIcon,
      text: t('profile.sidebar.myOrders'),
      active: false,
    },
    // {
    //   id: 'payment',
    //   icon: CreditIcon,
    //   text: t('profile.sidebar.paymentMethod'),
    //   active: false,
    // },
 
    {
      id: 'favorites',
      icon: HeartIcon,
      text: t('profile.sidebar.favorites'),
      active: false,
    },
    {
      id: 'liked-services',
      icon: ServiceIcon,
      text: t('profile.sidebar.likedServices'),
      active: false,
    },
    {
      id: 'change-password',
      icon: LockIcon,
      text: t('profile.sidebar.changePassword'),
      active: false,
    },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  // Image compression utility
  const compressImage = (file, maxSizeKB = 500) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        let { width, height } = img;
        const maxDimension = 800;
        
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Determine output format based on original file type
        let outputType = 'image/jpeg'; // default
        let quality = 0.8;
        
        if (file.type === 'image/png') {
          outputType = 'image/png';
          quality = 0.9; // PNG compression is different
        } else if (file.type === 'image/gif') {
          outputType = 'image/jpeg'; // Convert GIF to JPEG for better compression
        } else if (file.type === 'image/webp') {
          outputType = 'image/webp';
          quality = 0.8;
        }
        
        canvas.toBlob((blob) => {
          if (blob.size <= maxSizeKB * 1024) {
            // Create a proper File object with correct name and type
            const compressedFile = new File([blob], file.name, {
              type: outputType,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            // Further compress if still too large
            const lowerQuality = outputType === 'image/png' ? 0.7 : 0.6;
            canvas.toBlob((compressedBlob) => {
              // Create a proper File object with correct name and type
              const finalFile = new File([compressedBlob], file.name, {
                type: outputType,
                lastModified: Date.now()
              });
              resolve(finalFile);
            }, outputType, lowerQuality);
          }
        }, outputType, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Phone validation functions
  const validatePhone = (phone) => {
    if (!phone || phone.trim() === '') {
      return { isValid: false, error: t('profile.phoneVerification.phoneFormat', 'Please enter a valid Kuwait phone number') };
    }
    
    // Remove any spaces or special characters
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Check if it's a valid Kuwait number
    return validateKuwaitNumber(cleanPhone);
  };

  const validateKuwaitNumber = (phone) => {
    // Kuwait phone number patterns
    const patterns = [
      /^(\+965|965)?(5[0-9]{7})$/, // Mobile: +965 5xxxxxxxx or 5xxxxxxxx
      /^(\+965|965)?(6[0-9]{7})$/, // Mobile: +965 6xxxxxxxx or 6xxxxxxxx  
      /^(\+965|965)?(9[0-9]{7})$/, // Mobile: +965 9xxxxxxxx or 9xxxxxxxx
      /^(\+965|965)?([2-4][0-9]{6})$/, // Landline: +965 2xxxxxx, 3xxxxxx, 4xxxxxx
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(phone)) {
        return { isValid: true, error: '' };
      }
    }
    
    return { isValid: false, error: t('profile.phoneVerification.phoneFormat', 'Please enter a valid Kuwait phone number') };
  };

  // OTP generation and verification functions
  const sendOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(otp);
    setTimer(60);
    setShowOtpModal(true);
    showAlert(t('profile.phoneVerification.otpSent', 'OTP sent to your phone'), 'success');
  };

  const verifyOTP = (enteredOTP) => {
    return enteredOTP === generatedOTP;
  };

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formattedTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const enteredOTP = otpValues.join('');
    
    if (enteredOTP.length !== 6) {
      showAlert(t('profile.phoneVerification.completeOtpRequired', 'Please enter the complete OTP code.'), 'error');
      return;
    }
    
    setIsVerifyingPhone(true);
    
    try {
      if (verifyOTP(enteredOTP)) {
        showAlert(t('profile.phoneVerification.verificationSuccess', 'Phone number verified successfully! Updating profile...'), 'success');
        
        // Automatically update profile with new phone
        await updateProfileData(true);
        
        // Close OTP modal and reset states
        setShowOtpModal(false);
        setIsEditingProfile(false);
        setPhoneError('');
        setPhoneValid(true);
        setOtpValues(['', '', '', '', '', '']);
        setPendingPhoneUpdate('');
      } else {
        showAlert(t('profile.phoneVerification.invalidOtp', 'Invalid OTP code'), 'error');
      }
    } catch (error) {
      showAlert(t('profile.phoneVerification.verificationFailed', 'Verification failed'), 'error');
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const handleResend = () => {
    if (timer > 0) return;
    sendOTP();
    startTimer();
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtpValues(['', '', '', '', '', '']);
    setPendingPhoneUpdate('');
    setPhoneError('');
    setPhoneValid(false);
  };

  // Update profile data function
  const updateProfileData = async (isAfterOtpVerification = false) => {
    if (updatingProfile) return;
    
    setProfileLoading(true);
    setUpdatingProfile(true);
    
    try {
      // Get userId from localStorage
      let userId = null;
      try {
        const storedUser = localStorage.getItem("userData");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          userId = parsed?._id || parsed?.id || null;
        }
        if (!userId) {
          userId = localStorage.getItem("userId");
        }
      } catch {
        throw new Error("Failed to parse user data from local storage");
      }
      
      if (!userId) {
        throw new Error("User not found in local storage");
      }
      
      // Use pending phone update if available, otherwise use current phone
      const phoneToUpdate = pendingPhoneUpdate || profileData.phone;
      
      let res;
      
      if (profilePicFile) {
        // Handle image upload
        const formData = new FormData();
        formData.append("name", profileData.name || "");
        formData.append("email", profileData.email || "");
        formData.append("phoneNo", phoneToUpdate || "");
        formData.append("pic", profilePicFile);
        
        res = await fetch(`${BaseUrl}/customer/update-profile/${userId}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
      } else {
        // Handle text-only update
        res = await fetch(`${BaseUrl}/customer/update-profile/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            name: profileData.name || "",
            email: profileData.email || "",
            phoneNo: phoneToUpdate || ""
          })
        });
      }
      
      if (res.ok) {
        const data = await res.json();
        console.log('Profile updated successfully:', data);
        
        // Update local profile data
        setProfileData(prev => ({
          ...prev,
          phone: phoneToUpdate || prev.phone
        }));
        
        // Clear pending phone update
        setPendingPhoneUpdate('');
        
        // Only close edit mode if not after OTP verification
        if (!isAfterOtpVerification) {
          setIsEditingProfile(false);
        }
        
        showAlert(t('profile.content.profileUpdated', 'Profile updated successfully!'), 'success');
        
        // Refresh user profile
        await fetchUserProfile();
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update profile (${res.status})`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert(error.message || t('profile.content.updateError', 'Failed to update profile'), 'error');
      
      if (isAfterOtpVerification) {
        showAlert(t('profile.phoneVerification.updateFailed', 'Phone verified but profile update failed'), 'error');
      }
    } finally {
      setProfileLoading(false);
      setUpdatingProfile(false);
    }
  };

  const handleEditProfile = async () => {
    if (!isEditingProfile) {
      setIsEditingProfile(true);
      setPhoneError('');
      setPhoneValid(false);
      return;
    }
  
    if (updatingProfile) return;
  
    setProfileLoading(true);
    setUpdatingProfile(true);
  
    try {
      // Get userId from localStorage
      let userId = null;
      try {
        const storedUser = localStorage.getItem("userData");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          userId = parsed?._id || parsed?.id || null;
        }
        if (!userId) {
          userId = localStorage.getItem("userId");
        }
      } catch {
        throw new Error("Failed to parse user data from local storage");
      }
  
      if (!userId) {
        throw new Error("User not found in local storage");
      }

      // Check if phone number has changed and validate it
      const originalPhone = userProfile?.phoneNo || '';
      const newPhone = profileData.phone || '';
      
      if (newPhone !== originalPhone && newPhone.trim() !== '') {
        const phoneValidation = validatePhone(newPhone);
        if (!phoneValidation.isValid) {
          setPhoneError(phoneValidation.error);
          setPhoneValid(false);
          throw new Error(phoneValidation.error);
        }
        
        // Phone is valid, store it for OTP verification
        setPendingPhoneUpdate(newPhone);
        setPhoneValid(true);
        setPhoneError('');
        
        // Send OTP and show modal
        sendOTP();
        startTimer();
        return; // Don't proceed with profile update yet
      }

      let res;
  
      if (profilePicFile) {
        // Validate file size before processing
        const maxSizeMB = 1;
        if (profilePicFile.size > maxSizeMB * 1024 * 1024) {
          throw new Error(`File size must be less than ${maxSizeMB}MB. Current size: ${(profilePicFile.size / (1024 * 1024)).toFixed(2)}MB`);
        }

        // Compress image if it's larger than 200KB
        let processedFile = profilePicFile;
        if (profilePicFile.size > 200 * 1024) {
          console.log('Compressing image...');
          processedFile = await compressImage(profilePicFile);
          console.log('Image compressed from', profilePicFile.size, 'to', processedFile.size, 'bytes');
        }

        // Case 1: New image file selected
        const formData = new FormData();
        formData.append("name", profileData.name || "");
        formData.append("email", profileData.email || "");
        formData.append("phoneNo", profileData.phone || "");
        formData.append("pic", processedFile);
        
        // Debug logging
        console.log('Uploading file details:', {
          name: processedFile.name,
          type: processedFile.type,
          size: processedFile.size,
          lastModified: processedFile.lastModified
        });
  
        res = await fetch(`${BaseUrl}/customer/${userId}/updateProfile`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: formData,
        });
      } else if (profileImage === null) {
        // Case 2: Profile image removed
        const formData = new FormData();
        formData.append("name", profileData.name || "");
        formData.append("email", profileData.email || "");
        formData.append("phoneNo", profileData.phone || "");
        formData.append("pic", profilePicFile); // empty string removes image
  
        res = await fetch(`${BaseUrl}/customer/${userId}/updateProfile`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: formData,
        });
      } else {
        // Case 3: Update without changing image
        const payload = {
          name: profileData.name,
          email: profileData.email,
          phoneNo: profileData.phone,
        };
  
        res = await fetch(`${BaseUrl}/customer/${userId}/updateProfile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify(payload),
        });
      }
  
      // ✅ Handle response
      if (res.ok) {
        showAlert(t("Profile updated successfully"), "success");
        try {
          fetchUserProfile();
        } catch (error) {
          console.warn('Could not refresh profile data:', error);
        }
        setIsEditingProfile(false);
      } else {
        const err = await res.json().catch(() => ({}));
        
        // Handle specific error cases
        if (res.status === 413) {
          throw new Error("File size too large. Please choose a smaller image (max 1MB).");
        } else if (res.status === 0) {
          throw new Error("Network error. Please check your connection and try again.");
        } else {
          throw new Error(err?.message || `Failed to update profile (${res.status})`);
        }
      }
    } catch (e) {
      console.error('Profile update error:', e);
      
      // Provide specific error messages
      let errorMessage = "Unable to update profile";
      
      if (e?.message?.includes('File size must be less than')) {
        errorMessage = e.message;
      } else if (e?.message?.includes('File size too large')) {
        errorMessage = e.message;
      } else if (e?.message?.includes('Network error')) {
        errorMessage = e.message;
      } else if (e?.message?.includes('Failed to fetch')) {
        errorMessage = "Network connection failed. Please check your internet connection and try again.";
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      showAlert(errorMessage, "error");
    } finally {
      setUpdatingProfile(false);
      setProfileLoading(false);
    }
  };
  

  const handleChangePasswordFormChange = (field, value) => {
    setChangePasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (changePasswordErrors[field]) {
      setChangePasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(prev => !prev);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(prev => !prev);
  };

  const validateChangePasswordForm = () => {
    const newErrors = {};
    
    if (!changePasswordForm.currentPassword.trim()) {
      const currentPasswordError = t('profile.changePassword.currentPasswordRequired') || 'كلمة المرور الحالية مطلوبة';
      console.log('Current password error translation:', currentPasswordError); // Debug log
      newErrors.currentPassword = currentPasswordError;
    }
    
    if (!changePasswordForm.newPassword.trim()) {
      const newPasswordError = t('profile.changePassword.newPasswordRequired') || 'كلمة المرور الجديدة مطلوبة';
      console.log('New password error translation:', newPasswordError); // Debug log
      newErrors.newPassword = newPasswordError;
    } else if (changePasswordForm.newPassword.length < 6) {
      const passwordTooShortError = t('profile.changePassword.passwordTooShort') || 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل';
      console.log('Password too short error translation:', passwordTooShortError); // Debug log
      newErrors.newPassword = passwordTooShortError;
    }
    
    setChangePasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChangePassword = async () => {
    if (!validateChangePasswordForm()) {
      return;
    }
    
    setChangingPassword(true);
    
    try {
      // Get customer ID
      let customerId = null;
      try {
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          customerId = parsed?._id || parsed?.id || null;
        }
        if (!customerId) {
          customerId = localStorage.getItem('userId');
        }
      } catch {
        throw new Error('Failed to parse user data from local storage');
      }
      
      if (!customerId) {
        throw new Error('User not found in local storage');
      }
      
      // Prepare API payload
      const payload = {
        currentPassword: changePasswordForm.currentPassword,
        newPassword: changePasswordForm.newPassword
      };
      
      const response = await fetch(`${BaseUrl}/customer/${customerId}/changePassword`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific error messages and translate them
        let errorMessage = data.message || `Failed to change password: ${response.status}`;
        
        // Translate common error messages
        if (errorMessage.toLowerCase().includes('current password') || 
            errorMessage.toLowerCase().includes('incorrect password') ||
            errorMessage.toLowerCase().includes('wrong password')) {
          errorMessage = t('profile.changePassword.currentPasswordIncorrect') || 'كلمة المرور الحالية غير صحيحة';
        } else if (errorMessage.toLowerCase().includes('password too weak') ||
                   errorMessage.toLowerCase().includes('weak password')) {
          errorMessage = t('profile.changePassword.passwordTooWeak') || 'كلمة المرور ضعيفة جداً';
        } else if (errorMessage.toLowerCase().includes('password too short')) {
          errorMessage = t('profile.changePassword.passwordTooShort') || 'كلمة المرور قصيرة جداً';
        }
        
        throw new Error(errorMessage);
      }
      
      if (data.success) {
        const successMessage = t('profile.changePassword.successMessage');
        console.log('Success message:', successMessage); // Debug log
        showAlert(successMessage, 'success');
        // Clear form
        setChangePasswordForm({
          currentPassword: '',
          newPassword: ''
        });
      } else {
        throw new Error(data.message || t('profile.changePassword.errorMessage'));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Handle and translate error messages
      let errorMessage = error.message || t('profile.changePassword.errorMessage');
      
      // Check if it's already a translated message (contains Arabic characters)
      const hasArabicChars = /[\u0600-\u06FF]/.test(errorMessage);
      
      if (!hasArabicChars) {
        // Translate common English error messages
        if (errorMessage.toLowerCase().includes('current password') || 
            errorMessage.toLowerCase().includes('incorrect password') ||
            errorMessage.toLowerCase().includes('wrong password')) {
          errorMessage = t('profile.changePassword.currentPasswordIncorrect') || 'كلمة المرور الحالية غير صحيحة';
        } else if (errorMessage.toLowerCase().includes('password too weak') ||
                   errorMessage.toLowerCase().includes('weak password')) {
          errorMessage = t('profile.changePassword.passwordTooWeak') || 'كلمة المرور ضعيفة جداً';
        } else if (errorMessage.toLowerCase().includes('password too short')) {
          errorMessage = t('profile.changePassword.passwordTooShort') || 'كلمة المرور قصيرة جداً';
        } else if (errorMessage.toLowerCase().includes('network') ||
                   errorMessage.toLowerCase().includes('connection')) {
          errorMessage = t('profile.changePassword.networkError') || 'خطأ في الشبكة';
        }
      }
      
      console.log('Final error message:', errorMessage); // Debug log
      showAlert(errorMessage, 'error');
    } finally {
      setChangingPassword(false);
    }
  };
  

  const handleProfilePictureChange = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (1MB limit for better server compatibility)
      const maxSizeMB = 1;
      if (file.size > maxSizeMB * 1024 * 1024) {
        showAlert(`File size must be less than ${maxSizeMB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`, "error");
        // Reset the file input
        event.target.value = '';
        return;
      }

      // Validate file type (matching server requirements)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showAlert('Please select a valid image file (JPEG, PNG, GIF, or WebP)', "error");
        // Reset the file input
        event.target.value = '';
        return;
      }

      // Compress image if it's larger than 200KB
      let processedFile = file;
      if (file.size > 200 * 1024) {
        try {
          console.log('Compressing image on selection...');
          processedFile = await compressImage(file);
          console.log('Image compressed from', file.size, 'to', processedFile.size, 'bytes');
        } catch (error) {
          console.error('Error compressing image:', error);
          showAlert('Error processing image. Please try a different file.', "error");
          event.target.value = '';
          return;
        }
      }
      
      // Ensure we have a proper File object
      if (!(processedFile instanceof File)) {
        console.warn('Processed file is not a File object, creating one...');
        processedFile = new File([processedFile], file.name, {
          type: file.type,
          lastModified: Date.now()
        });
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(processedFile);
      setProfilePicFile(processedFile);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openAddAddressModal = () => {
    setIsEditMode(false);
    setEditingAddress(null);
    setAddressForm({
      name: '',
      city: '',
      area: '',
      block: '',
      street: '',
      building: '',
      floor_apartment: '',
      lat: '',
      long: '',
      is_default: false,
    });
    setSelectedLocation(null);
    setShowAddressModal(true);
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  };

  const openEditAddressModal = (address) => {
    console.log('Opening edit modal for address:', address); // Debug log
    setIsEditMode(true);
    setEditingAddress(address);
    setAddressForm({
      name: address.name || '',
      city: address.city || '',
      area: address.area || '',
      block: address.block || '',
      street: address.street || '',
      building: address.building || '',
      floor_apartment: address.floor_apartment || '',
      lat: address.lat !== undefined && address.lat !== null ? address.lat.toString() : '',
      long: address.long !== undefined && address.long !== null ? address.long.toString() : '',
      is_default: address.is_default || false,
    });
    
    // Set selected location for map if coordinates exist
    if (address.lat && address.long && address.lat !== 0 && address.long !== 0) {
      const lat = typeof address.lat === 'string' ? parseFloat(address.lat) : address.lat;
      const lng = typeof address.long === 'string' ? parseFloat(address.long) : address.long;
      setSelectedLocation({ lat: lat, lng: lng });
    } else {
      setSelectedLocation(null);
    }
    
    setShowAddressModal(true);
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
    setIsEditMode(false);
    setSelectedLocation(null);
    
    // Restore background scrolling
    document.body.style.overflow = 'unset';
  };

  const handleAddressFormChange = (field, value) => {
    setAddressForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationSelect = async (location) => {
    console.log('Location selected:', location); // Debug log
    setSelectedLocation(location);
    
    // Update the form with the coordinates from the map
    setAddressForm((prev) => ({
      ...prev,
      lat: location.lat.toString(),
      long: location.lng.toString(),
    }));

    // Perform reverse geocoding to auto-fill address fields
    try {
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        
        const result = await new Promise((resolve, reject) => {
          geocoder.geocode(
            { location: { lat: location.lat, lng: location.lng } },
            (results, status) => {
              if (status === 'OK' && results && results.length > 0) {
                resolve(results[0]);
              } else {
                reject(new Error('Geocoding failed'));
              }
            }
          );
        });

        // Extract address components from the geocoding result
        const addressComponents = result.address_components || [];
        let city = '';
        let area = '';
        let street = '';
        let building = '';

        // Parse address components
        addressComponents.forEach(component => {
          const types = component.types;
          
          if (types.includes('locality')) {
            city = component.long_name;
          } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
            area = component.long_name;
          } else if (types.includes('administrative_area_level_1') && !area) {
            area = component.long_name;
          } else if (types.includes('route')) {
            street = component.long_name;
          } else if (types.includes('street_number')) {
            building = component.long_name;
          }
        });

        // Auto-fill the address form fields
        setAddressForm((prev) => ({
          ...prev,
          city: city || prev.city,
          area: area || prev.area,
          street: street || prev.street,
          building: building || prev.building,
          name: prev.name || `${city || 'Location'}, ${area || 'Area'}`,
        }));

        console.log('Address fields auto-filled:', { city, area, street, building });
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Don't show error to user, just log it
    }
  };

  const handleSaveAddress = async () => {
    try {
      // Validate required fields
      if (!addressForm.name || !addressForm.city || !addressForm.area || !addressForm.building) {
        showAlert(t('profile.addresses.fillRequiredFields', 'Please fill in all required fields'), 'error');
        return;
      }

      // Validate coordinates if they exist
      if (addressForm.lat && addressForm.long) {
        const lat = parseFloat(addressForm.lat);
        const lng = parseFloat(addressForm.long);
        
        if (isNaN(lat) || isNaN(lng)) {
          showAlert(t('profile.addresses.invalidCoordinates', 'Invalid coordinates. Please select a location on the map.'), 'error');
          return;
        }
        
        if (lat === 0 && lng === 0) {
          showAlert(t('profile.addresses.selectLocation', 'Please select a location on the map.'), 'error');
          return;
        }
      }

      // Prepare form data for API (convert empty strings to 0 for lat/long)
      const formDataForAPI = {
        ...addressForm,
        lat: addressForm.lat === '' || addressForm.lat === '0' ? 0 : parseFloat(addressForm.lat),
        long: addressForm.long === '' || addressForm.long === '0' ? 0 : parseFloat(addressForm.long),
        street: addressForm.street === '' ? 0 : parseInt(addressForm.street)
      };
      
      console.log('Form data for API:', formDataForAPI); // Debug log

      let success = false;
      
    if (isEditMode && editingAddress) {
      // Update existing address
        success = await handleUpdateAddress(editingAddress._id, formDataForAPI);
    } else {
        // Create new address
        success = await handleCreateAddress(formDataForAPI);
      }

      if (success) {
    closeAddressModal();
      }
    } catch (error) {
      console.error('Error saving address:', error);
      showAlert(t('profile.addresses.saveError', 'Failed to save address'), 'error');
    }
  };


  const openAddPaymentModal = () => {
    setIsPaymentEditMode(false);
    setEditingPayment(null);
    setPaymentForm({
      cardNumber: '',
      cardholderName: '',
      cvv: '',
      expirationDate: '',
    });
    setShowPaymentModal(true);
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  };

  const openEditPaymentModal = (payment) => {
    setIsPaymentEditMode(true);
    setEditingPayment(payment);
    setPaymentForm({
      cardNumber: payment.cardNumber,
      cardholderName: payment.cardholderName,
      cvv: payment.cvv,
      expirationDate: payment.expirationDate,
    });
    setShowPaymentModal(true);
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setEditingPayment(null);
    setIsPaymentEditMode(false);
    
    // Restore background scrolling
    document.body.style.overflow = 'unset';
  };

  const handlePaymentFormChange = (field, value) => {
    setPaymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSavePayment = () => {
    if (isPaymentEditMode && editingPayment) {
      setPaymentMethods((prev) =>
        prev.map((payment) =>
          payment.id === editingPayment.id ? { ...payment, ...paymentForm } : payment
        )
      );
    } else {
      const newPayment = {
        id: Date.now(),
        type: 'visa',
        name: t('profile.paymentMethods.visaCard'),
        cardNumber: paymentForm.cardNumber,
        cardholderName: paymentForm.cardholderName,
        cvv: paymentForm.cvv,
        expirationDate: paymentForm.expirationDate,
      };
      setPaymentMethods((prev) => [...prev, newPayment]);
    }
    closePaymentModal();
  };

  const handleDeletePayment = (paymentId) => {
    setPaymentMethods((prev) => prev.filter((payment) => payment.id !== paymentId));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    showAlert(t('profile.sidebar.logout'), 'success');
  };

  // Helper function to parse category names
  const parseCategory = (catStr) => {
    try {
      return Function('"use strict";return (' + catStr + ')')();
    } catch {
      return {};
    }
  };

  return (
    <div className="profile-page">
      <div>
        <img className="side-pattern" src={SidePattern} alt="" />
      </div>
      <div className="profile-container container-md">
        <div className="profile-header">
          <div className="container-md">
            <div className="header-row">
              <h1 className="header-title ar-heading-bold ps-3">
              
                Profile
              </h1>
            </div>
          </div>
        </div>
        {/* Header */}

        {/* Main Content */}
        <div className="profile-content">
          {/* Sidebar */}
          <div className="sidebar">
  {sidebarItems.map((item) => {
    const Icon = item.icon; // Capitalize to treat as component
    return (
              <div
                key={item.id}
                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleTabClick(item.id)}
              >
                <div className="sidebar-icon">
          {item.id === 'logout' ? (
            <Icon sx={{ fontSize: 24 }} className={item.id === 'favorites' ? 'heart-black' : ''} />
          ) : (
            <img
              src={item.icon}
              alt={item.text}
              className={item.id === 'favorites' ? 'heart-black' : ''}
            />
          )}
                </div>
                <span className="sidebar-text pt-2">{item.text}</span>
              </div>
    );
  })}
          </div>

          {/* Main Content Area */}
          <div className="main-content">
            {activeTab === 'profile' && (
              <>
                {/* Profile Picture Section */}
               

              

            

                <div className="profile-picture-section">
  <div
    className="profile-picture-container"
    style={{ cursor: isEditingProfile ? "pointer" : "default" }}
    onClick={isEditingProfile ? handleProfilePictureChange : undefined}
  >
                    {profileImage ? (
      <div className="image-wrapper" style={{position: 'relative'}}>
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="profile-picture"
                      />
     
                      </div>
    ) : (
      <Avatar className="profile-picture default-avatar">
        {profileData.name?.charAt(0).toUpperCase()}
      </Avatar>
    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
      style={{ display: "none" }}
      disabled={!isEditingProfile}
                    />
                  </div>
                </div>




                {/* Form Section */}
                <div className="form-section">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">{t('profile.content.nameLabel')}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditingProfile}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('profile.content.emailLabel')}</label>
                      <input
                        type="email"
                        className="form-input"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditingProfile}
                      />
                    </div>
                  </div>
                  <div className="form-row full-width">
                    <div className="form-group">
                      <label className="form-label">{t('profile.content.phoneNumberLabel')}</label>
                      <div className="input-with-icon">
                        {/* <img src={PhoneIcon} alt="" className="input-icon" /> */}
                        <input
                          type="tel"
                          className={`form-input ${phoneValid ? 'is-valid' : phoneError ? 'is-invalid' : ''}`}
                          value={profileData.phone}
                          onChange={(e) => {
                            handleInputChange('phone', e.target.value);
                            setPhoneError(''); // Clear error when typing
                          }}
                          disabled={!isEditingProfile}
                          placeholder={t('profile.phoneVerification.phonePlaceholder', 'Kuwait Phone (e.g., 51234567)')}
                        />
                      </div>
                      {phoneError && (
                        <div className="invalid-feedback d-block">
                          {phoneError}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Button Section */}
                <div className="button-section d-flex gap-3">
                  {isEditingProfile ? (
                    <>
                      <button 
                        className="btn btn-secondary d-flex align-items-center justify-content-center" 
                        onClick={() => {
                          setIsEditingProfile(false);
                          setPhoneError('');
                          setPhoneValid(false);
                          setPendingPhoneUpdate('');
                          // Reset profile data to original values
                          if (userProfile) {
                            setProfileData({
                              name: userProfile.name || '',
                              email: userProfile.email || '',
                              phone: userProfile.phoneNo || '',
                            });
                          }
                        }}
                        disabled={profileLoading}
                      >
                        {t('common.cancel', 'Cancel')}
                      </button>
                      <button className="btn btn-primary d-flex align-items-center justify-content-center" onClick={handleEditProfile} disabled={profileLoading}>
                        {profileLoading ? t('common.saving') : t('common.save')}
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-secondary d-flex align-items-center justify-content-center" onClick={() => setActiveTab('change-password')}>
                        {t('profile.content.changePasswordButton')}
                      </button>
                      <button className="btn btn-primary d-flex align-items-center justify-content-center" onClick={handleEditProfile}>
                        {t('profile.content.editProfileButton')}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {activeTab === 'addresses' && (
              <div className="addresses-section">
                {/* Add New Address Button */}
                <div className="add-address-button-container">
                  <button className="btn btn-primary add-address-btn d-flex align-items-center justify-content-center" onClick={openAddAddressModal}>
                    <span className="pt-1">
                    {t('profile.addresses.addNewAddress')}
                    </span>
                   
                  </button>
                </div>

                {/* Loading State */}
                {loadingAddresses && (
                  <div className="loading-spinner text-center py-5">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">{t('common.loading')}</span>
                    </div>
                    <p className="mt-2">{t('common.loading')}</p>
                  </div>
                )}

                {/* Error State */}
                {addressesError && (
                  <div className="error-message alert alert-danger">{addressesError}</div>
                )}

                {/* Addresses List */}
                {!loadingAddresses && !addressesError && (
                <div className="addresses-list">
                    {addresses.length > 0 ? (
                      addresses.map((address) => (
                        <div key={address._id} className="address-item">
                      <div className="address-content">
                            <div className="address-header">
                              <h3 className="address-street">{address.name}</h3>
                            
                            </div>
                            <p className="address-full mt-2 mb-1">
                              {`${address.building}, ${address.floor_apartment}, ${address.street}, ${address.block}, ${address.area}, ${address.city}`}
                            </p>
                        <div className="address-phone">
                          <img src={PhoneIcon} alt="" />
  <span className="pt-1">{localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).phoneNo : ''}</span>
                        
                        </div>
                      </div>
                      <div className="address-actions">
                        <button
                          className="btn btn-primary pt-3  edit-btn d-flex align-items-center justify-content-center"
                          onClick={() => openEditAddressModal(address)}
                        >
                          <img src={''} alt="" />
                          {t('profile.addresses.edit')}
                        </button>
                        <button
                          className="btn btn-danger delete-btn d-flex align-items-center justify-content-center"
                              onClick={() => handleDeleteAddress(address._id)}
                        >
                          <img src={Bin} alt="" />
                          <span className="pt-2">
                          {t('profile.addresses.delete')}
                          </span>
                          
                        </button>
                      </div>
                    </div>
                      ))
                    ) : (
                      <div className="no-addresses text-center py-5">
                        <div className="mb-3">
                          <i className="fas fa-map-marker-alt" style={{ fontSize: '48px', color: '#ccc' }}></i>
                </div>
                        <h5 className="text-muted">{t('profile.addresses.noAddresses')}</h5>
                        <p className="text-muted">{t('profile.addresses.noAddressesDescription')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="notifications-section">
                <div className="notifications-header mb-4">
                  <h3 className="ar-heading-bold">{t('profile.sidebar.notifications')}</h3>
                  <div className="notifications-actions">
                    {notificationsCount > 0 && (
                      <div className="pt-2">
                        <span className="pt-2">
                          {loadingCount ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            notificationsCount
                            )} {t('profile.notifications.unreadNotifications')}
                        </span>
              </div>
            )}
                    <div className="action-buttons">
                      {notificationsCount > 0 && (
                        <button 
                          className="btn btn-success btn-sm d-flex align-items-center justify-content-center"
                          onClick={markAllNotificationsAsRead}
                          disabled={markingAllAsRead || loadingNotifications}
                        >
                          {markingAllAsRead ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-check-double"></i>
                          )}
                        <span className="pt-2">
                        {t('profile.notifications.markAllAsRead')}
                        </span>
                         
                        </button>
                      )}
                      <button 
                        className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center"
                        onClick={() => {
                          fetchNotifications(currentNotificationsPage);
                          fetchNotificationCount();
                        }}
                        disabled={loadingNotifications || loadingCount}
                      >
                        <i className="fas fa-sync-alt"></i>
                        <span className="pt-2">
                        {t('profile.notifications.refresh')}
                        </span>
                      
                      </button>
                    </div>
                  </div>
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
                              <h5 className="notification-title">
                                {i18n.language === 'ar' ? notification.title_ar : notification.title_en}
                              </h5>
                              <span className="notification-time">
                                {new Date(notification.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="notification-message">
                              {i18n.language === 'ar' ? notification.message_ar : notification.message_en}
                            </p>
                            {notification.category && (
                           <>
                           </>
                            )}
                          </div>
                          <div className="notification-indicator">
                            {!notification.isRead ? (
                              <div className="unread-dot"></div>
                            ) : (
                              <div className="read-indicator">
                                <i className="fas fa-check-circle"></i>
                              </div>
                            )}
                            {markingAsRead === notification._id && (
                              <div className="loading-indicator">
                                <i className="fas fa-spinner fa-spin"></i>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination Info */}
                    {notificationsCount > 0 && (
                      <div className="pagination-info text-center mb-3">
                        <small className="text-muted">
                          {t('profile.notifications.showing')} {((currentNotificationsPage - 1) * notificationsPagination.limit) + 1} - {Math.min(currentNotificationsPage * notificationsPagination.limit, notificationsCount)} {t('profile.notifications.of')} {notificationsCount} {t('profile.notifications.totalNotifications')}
                        </small>
                      </div>
                    )}

                    {/* Pagination */}
                    {notificationsPagination.totalPages > 1 && (
                      <div className="notifications-pagination mt-4">
                        <Pagination
                          currentPage={currentNotificationsPage}
                          totalPages={notificationsPagination.totalPages}
                          onPageChange={handleNotificationsPageChange}
                          hideNavigation={false}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-notifications text-center py-5">
                    <div className="mb-3">
                      <i className="fas fa-bell" style={{ fontSize: '48px', color: '#ccc' }}></i>
                    </div>
                    <h5 className="text-muted">{t('profile.notifications.noNotifications')}</h5>
                    <p className="text-muted">{t('profile.notifications.noNotificationsDescription')}</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'orders' && (
              <div className="orders-section">
                <h3 className="orders-title ar-heading-bold">{t('profile.orders.title')}</h3>
                {loadingOrders ? (
                  <div className="loading-spinner text-center py-5">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">{t('common.loading')}</span>
                    </div>
                    <p className="mt-2">{t('common.loading')}</p>
                  </div>
                ) : ordersError ? (
                  <div className="error-message alert alert-danger">{ordersError}</div>
                ) : orders.length > 0 ? (
                  <>
                <div className="orders-list">
                  {orders.map((order) => (
                        <OrderCard key={order.parentOrderId} order={order} />
                  ))}
                </div>
                    
                    {/* Pagination */}
                    {ordersPagination.totalPages > 1 && (
                      <div className="orders-pagination mt-4">
                        <Pagination
                          currentPage={currentOrdersPage}
                          totalPages={ordersPagination.totalPages}
                          onPageChange={handleOrdersPageChange}
                          hideNavigation={false}
                        />
                        
                        {/* Pagination Info */}
                     
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-orders text-center py-5">
                    <div className="mb-3">
                      <i className="fas fa-shopping-bag" style={{ fontSize: '48px', color: '#ccc' }}></i>
                    </div>
                    <h5 className="text-muted">{t('profile.orders.noOrders')}</h5>
                    <p className="text-muted">{t('profile.orders.noOrdersDescription')}</p>
                    <button 
                      className="btn btn-primary mt-3 d-flex align-items-center justify-content-center"
                      onClick={() => navigate('/products')}
                    >
                      {t('profile.orders.startShopping')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="payment-methods-section">
                <div className="payment-header">
                 <div></div>
                  <button className="add-payment-btn d-flex align-items-center justify-content-center" onClick={openAddPaymentModal}>
                    {t('profile.paymentMethods.addNewPaymentMethod')}
                  </button>
                </div>

                <div className="payment-methods-list">
                  {paymentMethods.map((payment) => (
                    <div key={payment.id} className="payment-method-item">
                      <div className="payment-info">
                        <div className="card-icon">
                          {payment.type === 'mastercard' ? (
                            <div className="mastercard-icon">
                              <div className="mastercard-circle red"></div>
                              <div className="mastercard-circle orange"></div>
                            </div>
                          ) : (
                            <div className="visa-icon">VISA</div>
                          )}
                        </div>
                        <div className="card-details">
                          <h4 className="card-name">{payment.name}</h4>
                          <p className="card-number">{payment.cardNumber}</p>
                        </div>
                      </div>
                      <button
                        className="delete-payment-btn d-flex align-items-center justify-content-center"
                        onClick={() => handleDeletePayment(payment.id)}
                      >
                        <img src={Bin} alt="Delete" />
                        {t('profile.paymentMethods.delete')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="favorites-section">
                <h3 className="ar-heading-bold mb-4">{t('profile.sidebar.favorites')}</h3>
                {loadingLikedProducts ? (
                  <div className="loading-spinner text-center py-5">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">{t('common.loading')}</span>
                    </div>
                    <p className="mt-2">{t('common.loading')}</p>
                  </div>
                ) : likedProductsError ? (
                  <div className="error-message alert alert-danger">
                    {likedProductsError}
                  </div>
                ) : likedProducts.length > 0 ? (
                  <div className="row">
                    {likedProducts.map((product) => (
                      <ProductCard 
                        key={product._id}
                        product={{
                          id: product._id,
                          name: i18n.language === 'ar' ? product.name_ar : product.name_en,
                          categoryName: parseCategory(product?.categoryName)?.[i18n.language] 
                                        || parseCategory(product?.categoryName)?.en 
                                        || "",
                          price: product.price,
                          measurementUnit: product?.measurementUnit,
                          image: product.images?.[0],
                          isSkeleton: false,
                          isLiked: true // Since these are from liked products API
                        }} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="no-favorites text-center py-5">
                    <div className="mb-3">
                      <i className="fas fa-heart" style={{ fontSize: '48px', color: '#ccc' }}></i>
                </div>
                    <h5 className="text-muted">{t('profile.favorites.noFavorites')}</h5>
                    <p className="text-muted">{t('profile.favorites.noFavoritesDescription')}</p>
                    <button 
                      className="btn btn-primary mt-3 d-flex align-items-center justify-content-center"
                      onClick={() => navigate('/products')}
                    >
                      {t('profile.favorites.browseProducts')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'liked-services' && (
              
              <div className="liked-services-section">
                <h3 className="ar-heading-bold mb-4">{t('profile.sidebar.likedServices')}</h3>
                {loadingLikedServices ? (
                  <div className="loading-spinner text-center py-5">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">{t('common.loading')}</span>
                    </div>
                    <p className="mt-2">{t('common.loading')}</p>
                  </div>
                ) : likedServicesError ? (
                  <div className="error-message alert alert-danger">
                    {likedServicesError}
                  </div>
                ) : likedServices.length > 0 ? (
                  <div className="row g-4">
                    {likedServices.map((service) => (
                      <div
                        key={service._id}
                        className="col-lg-6 col-md-6"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/service/${service._id}`)}
                      >
                        <div className="service-provider-card">
              <div>
                            {(() => {
                              const profileImage = service.profileImage || service.pic;
                              
                              if (profileImage) {
                                return (
                                  <img 
                                    className='top-img' 
                                    src={profileImage} 
                                    alt={service.name}
                                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                                  />
                                );
                              } else {
                                return (
                                  <div 
                                    className='top-img avatar-fallback'
                                    style={{ 
                                      width: '100%', 
                                      height: '180px',
                                      backgroundColor: '#e0e0e0',
                                      color: '#666',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '48px',
                                      fontWeight: 'bold',
                                      textTransform: 'uppercase'
                                    }}
                                  >
                                    {service.name ? service.name.charAt(0) : 'P'}
                                  </div>
                                );
                              }
                            })()}
                          </div>
                          
                          <div className='d-flex align-items-center justify-content-between py-3'>
                            <div className='d-flex align-items-center gap-3'>
                              <img src={BallPattern} alt="" width="40" height="40"/>
                              <div className='d-flex align-items-start gap-3'>
                                <div>
                                  <h6 className="fs-14 ar-heading-bold">
                                    {service.name
                                      ?.split(" ")
                                      .slice(0, 2)                // take first 2 words
                                      .join(" ") + 
                                      (service.name?.split(" ").length > 2 ? " ..." : "")}
                                  </h6>
                                  <p className='fs-12'>{service.bio || t('pages.home.servicesSection.serviceProvider.description')}</p>
                                </div>
                                <div className="ratings d-flex align-items-center gap-1">
                                  {[...Array(5)].map((_, index) => {
                                    const starValue = index + 1;
                                    const rating = service.averageRating || 0;

                                    if (starValue <= Math.floor(rating)) {
                                      // Full star
                                      return <Star key={index} sx={{ color: "#FFD700", fontSize: 18 }} />;
                                    } else if (starValue - 0.5 <= rating) {
                                      // Half star
                                      return <StarHalf key={index} sx={{ color: "#FFD700", fontSize: 18 }} />;
                                    } else {
                                      // Empty star
                                      return <StarBorder key={index} sx={{ color: "#FFD700", fontSize: 18 }} />;
                                    }
                                  })}
                                  <span className='pt-1' style={{ marginLeft: 4, fontWeight: "bold", color: "#000" }}>
                                    {service.averageRating?.toFixed(1) || "0.0"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className='d-flex align-items-end flex-column gap-3'>
                              <FontAwesomeIcon
                                icon={likedProfessionals[service._id] ? solidHeart : regularHeart}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await toggleProfessionalLike(service._id);
                                  } catch (error) {
                                    console.error('Error toggling like:', error);
                                  }
                                }}
                                style={{
                                  cursor: 'pointer',
                                  color: likedProfessionals[service._id] ? 'red' : 'gray',
                                  fontSize: '24px',
                                  transition: '0.2s ease-in-out',
                                }}
                              />
                              <button className='btn outlined-btn  fs-12 d-flex align-items-center justify-content-center'>

                                <span className='pt-1'>

                                  {service.specialization || t('pages.home.servicesSection.serviceProvider.category')}
                                </span>

                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-liked-services text-center py-5">
                    <div className="mb-3">
                      <i className="fas fa-heart" style={{ fontSize: '48px', color: '#ccc' }}></i>
                    </div>
                    <h5 className="text-muted">{likedServicesTranslations.noLikedServices}</h5>
                    <p className="text-muted">{likedServicesTranslations.noLikedServicesDescription}</p>
                    <button 
                      className="btn btn-primary mt-3 d-flex align-items-center justify-content-center"
                      onClick={() => navigate('/service-list')}
                    >
                      {likedServicesTranslations.browseServices}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'change-password' && (
              <div className="change-password-section">
                <h3 className="ar-heading-bold mb-4">{t('profile.changePassword.title', 'Change Password')}</h3>
                
                <div className="form-section">
                  <form onSubmit={(e) => { e.preventDefault(); handleSaveChangePassword(); }}>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">
                          {t('profile.changePassword.currentPassword', 'Current Password')} *
                        </label>
                        <div className="position-relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            className={`form-input ${changePasswordErrors.currentPassword ? 'is-invalid' : ''}`}
                            value={changePasswordForm.currentPassword}
                            onChange={(e) => handleChangePasswordFormChange('currentPassword', e.target.value)}
                            placeholder={t('profile.changePassword.currentPasswordPlaceholder', 'Enter your current password')}
                            style={{ paddingRight: '45px' }}
                          />
                          <button
                            type="button"
                            className="position-absolute top-50 translate-middle-y end-0 me-3 bg-transparent border-0"
                            onClick={toggleCurrentPasswordVisibility}
                            style={{ cursor: 'pointer', zIndex: 10 }}
                          >
                            <img 
                              src={EyeIcon} 
                              alt="Toggle password visibility"
                              style={{ width: '20px', height: '20px', opacity: showCurrentPassword ? 1 : 0.6 }}
                            />
                          </button>
                        </div>
                        {changePasswordErrors.currentPassword && (
                          <div className="text-danger mt-1">{changePasswordErrors.currentPassword}</div>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">
                          {t('profile.changePassword.newPassword', 'New Password')} *
                        </label>
                        <div className="position-relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            className={`form-input ${changePasswordErrors.newPassword ? 'is-invalid' : ''}`}
                            value={changePasswordForm.newPassword}
                            onChange={(e) => handleChangePasswordFormChange('newPassword', e.target.value)}
                            placeholder={t('profile.changePassword.newPasswordPlaceholder', 'Enter your new password')}
                            style={{ paddingRight: '45px' }}
                          />
                          <button
                            type="button"
                            className="position-absolute top-50 translate-middle-y end-0 me-3 bg-transparent border-0"
                            onClick={toggleNewPasswordVisibility}
                            style={{ cursor: 'pointer', zIndex: 10 }}
                          >
                            <img 
                              src={EyeIcon} 
                              alt="Toggle password visibility"
                              style={{ width: '20px', height: '20px', opacity: showNewPassword ? 1 : 0.6 }}
                            />
                          </button>
                        </div>
                        {changePasswordErrors.newPassword && (
                          <div className="text-danger mt-1">{changePasswordErrors.newPassword}</div>
                        )}
                      </div>
                    </div>

                    <div className="button-section d-flex gap-3">
                      <button
                        type="submit"
                        className="btn btn-primary d-flex align-items-center justify-content-center"
                        disabled={changingPassword}
                      >
                        {changingPassword ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            {t('common.changing', 'Changing...')}
                          </>
                        ) : (
                          t('profile.changePassword.saveChanges', 'Save Changes')
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={closeAddressModal}>
          <div className="address-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title ar-heading-bold">
                {isEditMode ? t('profile.addresses.editAddress') : t('profile.addresses.addNewAddress')}
              </h2>
              <button className="modal-close-btn" onClick={closeAddressModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-section">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{textAlign: "left"}}>{t('profile.addresses.name')} *    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={addressForm.name}
                      onChange={(e) => handleAddressFormChange('name', e.target.value)}
                      placeholder={t('profile.addresses.namePlaceholder')}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{textAlign: "left"}}>{t('profile.addresses.city')} *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={addressForm.city}
                      onChange={(e) => handleAddressFormChange('city', e.target.value)}
                      placeholder={t('profile.addresses.cityPlaceholder')}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{textAlign: "left"}}>{t('profile.addresses.area')} *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={addressForm.area}
                      onChange={(e) => handleAddressFormChange('area', e.target.value)}
                      placeholder={t('profile.addresses.areaPlaceholder')}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{textAlign: "left"}}>{t('profile.addresses.block')}* </label>
                    <input
                      type="text"
                      className="form-input"
                      value={addressForm.block}
                      onChange={(e) => handleAddressFormChange('block', e.target.value)}
                      placeholder={t('profile.addresses.blockPlaceholder')}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{textAlign: "left"}}>{t('profile.addresses.street')} * </label>
                    <input
                      type="number"
                      className="form-input"
                      value={addressForm.street}
                      onChange={(e) => handleAddressFormChange('street', parseInt(e.target.value) || '')}
                      placeholder={t('profile.addresses.streetPlaceholder')}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{textAlign: "left"}}>{t('profile.addresses.building')} *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={addressForm.building}
                      onChange={(e) => handleAddressFormChange('building', e.target.value)}
                      placeholder={t('profile.addresses.buildingPlaceholder')}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{textAlign: "left"}}>{t('profile.addresses.floorApartment')} * </label>
                    <input
                      type="text"
                      className="form-input"
                      value={addressForm.floor_apartment}
                      onChange={(e) => handleAddressFormChange('floor_apartment', e.target.value)}
                      placeholder={t('profile.addresses.floorApartmentPlaceholder')}
                    />
                  </div>
                  <div className="form-group">
                    {/* <label className="form-label" style={{textAlign: "left"}}>{t('profile.addresses.setAsDefault')}</label> */}
                    <div className="checkbox-container">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={addressForm.is_default}
                          onChange={(e) => handleAddressFormChange('is_default', e.target.checked)}
                        />
                        <span className="checkmark"></span>
                        {t('profile.addresses.setAsDefault')}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ width: '100%' }}>
                  
                    <GoogleMapAddressPicker
                      onLocationSelect={handleLocationSelect}
                      initialLocation={selectedLocation}
                      height="300px"
                      key={selectedLocation ? `${selectedLocation.lat}-${selectedLocation.lng}` : 'new-address'}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
            <button
                className="btn btn-primary rounded-1 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#21395D' }}
                onClick={handleSaveAddress}
              >
                {t('profile.addresses.saveChanges')}
              </button>
              <button className="btn btn-secondary rounded-1 d-flex align-items-center justify-content-center" onClick={closeAddressModal}>
                {t('profile.addresses.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={closePaymentModal}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title ar-heading-bold">
                {isPaymentEditMode
                  ? t('profile.paymentMethods.editPaymentMethod')
                  : t('profile.paymentMethods.addNewPaymentMethod')}
              </h2>
              <button className="modal-close-btn" onClick={closePaymentModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-section">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{textAlign:"left"}}>{t('profile.paymentMethods.cardNumber')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paymentForm.cardNumber}
                      onChange={(e) => handlePaymentFormChange('cardNumber', e.target.value)}
                      placeholder={t('profile.paymentMethods.cardNumber')}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('profile.paymentMethods.cardholderName')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paymentForm.cardholderName}
                      onChange={(e) => handlePaymentFormChange('cardholderName', e.target.value)}
                      placeholder={t('profile.paymentMethods.cardholderName')}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('profile.paymentMethods.cardCode')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paymentForm.cvv}
                      onChange={(e) => handlePaymentFormChange('cvv', e.target.value)}
                      placeholder={t('profile.paymentMethods.cvv', 'CVV')}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('profile.paymentMethods.expirationDate')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paymentForm.expirationDate}
                      onChange={(e) => handlePaymentFormChange('expirationDate', e.target.value)}
                      placeholder={t('profile.paymentMethods.expirationPlaceholder', 'MM/YY')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
                <button
                    className="btn btn-primary rounded-1"
                style={{ backgroundColor: '#21395D' }}
                    onClick={handleSavePayment}
                >
                    {t('profile.paymentMethods.saveChanges')}
                </button>
              <button className="btn btn-secondary rounded-1" onClick={closePaymentModal}>
                {t('profile.paymentMethods.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{t('otp.title')}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeOtpModal}
                ></button>
              </div>
              <div className="modal-body">
                <p>{t('otp.description')}</p>
                <div className="otp-input-container">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      className="form-control otp-input"
                      maxLength="1"
                      value={otpValues[index] || ''}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      disabled={isVerifyingPhone}
                    />
                  ))}
                </div>
                {timer > 0 && (
                  <p className="text-muted mt-2">
                    {t('otp.timerPrefix')} {formattedTime()}
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeOtpModal}
                  disabled={isVerifyingPhone}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleOtpSubmit}
                  disabled={isVerifyingPhone || otpValues.some(val => !val)}
                >
                  {isVerifyingPhone ? t('otp.verifying') : t('otp.submit')}
                </button>
                {timer === 0 && (
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleResend}
                    disabled={isVerifyingPhone}
                  >
                    {t('otp.resend')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;