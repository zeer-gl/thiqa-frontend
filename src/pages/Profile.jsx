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

import OrderCard from '../components/OrderCard';
import ServiceCard from '../components/ServiceCard';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { BaseUrl } from '../assets/BaseUrl.jsx';
import { useAlert } from '../context/AlertContext';
import { useUser } from '../context/Profile.jsx';
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
    address: '',
    phone: '',
    isDefault: false
  });
  
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardholderName: '',
    expirationDate: '',
    cvv: '',
    type: 'visa'
  });
  
  // Sample profile data - in a real app, this would come from an API or context
  const [profileData, setProfileData] = useState({
    name: t('profile.content.nameValue'),
    email: t('profile.content.emailValue'),
    phone: t('profile.content.phoneNumberValue'),
  });
  
  // Context hooks
  const { showAlert } = useAlert();
  const { userProfile, fetchUserProfile, updateUserProfile, logout } = useUser();
  const { likedProfessionals, toggleProfessionalLike } = useLikes();

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
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleEditProfile = async () => {
    if (!isEditingProfile) {
      setIsEditingProfile(true);
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
  
      let res;
  
      if (profilePicFile) {
        // Case 1: New image file selected
        const formData = new FormData();
        formData.append("name", profileData.name || "");
        formData.append("email", profileData.email || "");
        formData.append("phoneNo", profileData.phone || "");
        formData.append("pic", profilePicFile);
  
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
          method: "PUT",
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
          method: "PUT",
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
        throw new Error(err?.message || `Failed to update profile (${res.status})`);
      }
    } catch (e) {
      console.error(e?.message || "Unable to update profile");
      showAlert(e?.message || "Unable to update profile", "error");
    } finally {
      setUpdatingProfile(false);
      setProfileLoading(false);
    }
  };
  

  const handleChangePassword = () => {
    console.log('Change password clicked');
  };

  const handleProfilePictureChange = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
      setProfilePicFile(file);
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

  const handleLocationSelect = (location) => {
    console.log('Location selected:', location); // Debug log
    setSelectedLocation(location);
    // Update the form with the coordinates from the map
    setAddressForm((prev) => ({
      ...prev,
      lat: location.lat.toString(),
      long: location.lng.toString(),
    }));
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
              <h1 className="header-title ar-heading-bold">
                <i className="fas fa-home home-icon"></i>
                                {t('personalProfile.header.title', 'الملف الشخصي')}
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
                <span className="sidebar-text">{item.text}</span>
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
                      <input
                        type="tel"
                        className="form-input"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditingProfile}
                      />
                    </div>
                  </div>
                </div>

                {/* Button Section */}
                <div className="button-section">
                  {/* <button className="btn btn-secondary" onClick={handleChangePassword} disabled={isEditingProfile}>
                    {t('profile.content.changePasswordButton')}
                  </button> */}
                  <button className="btn btn-primary" onClick={handleEditProfile}>
                    {profileLoading ? t('common.saving') : isEditingProfile ? t('common.save') : t('profile.content.editProfileButton')}
                  </button>
                </div>
              </>
            )}

            {activeTab === 'addresses' && (
              <div className="addresses-section">
                {/* Add New Address Button */}
                <div className="add-address-button-container">
                  <button className="btn btn-primary add-address-btn" onClick={openAddAddressModal}>
                    {t('profile.addresses.addNewAddress')}
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
  <span>{localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).phoneNo : ''}</span>
                        
                        </div>
                      </div>
                      <div className="address-actions">
                        <button
                          className="btn btn-primary edit-btn"
                          onClick={() => openEditAddressModal(address)}
                        >
                          <img src={''} alt="" />
                          {t('profile.addresses.edit')}
                        </button>
                        <button
                          className="btn btn-danger delete-btn"
                              onClick={() => handleDeleteAddress(address._id)}
                        >
                          <img src={Bin} alt="" />
                          {t('profile.addresses.delete')}
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
                      <div className="">
                        <span className="">
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
                          className="btn btn-success btn-sm"
                          onClick={markAllNotificationsAsRead}
                          disabled={markingAllAsRead || loadingNotifications}
                        >
                          {markingAllAsRead ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-check-double"></i>
                          )}
                          {t('profile.notifications.markAllAsRead')}
                        </button>
                      )}
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => {
                          fetchNotifications(currentNotificationsPage);
                          fetchNotificationCount();
                        }}
                        disabled={loadingNotifications || loadingCount}
                      >
                        <i className="fas fa-sync-alt"></i>
                        {t('profile.notifications.refresh')}
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
                      className="btn btn-primary mt-3"
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
                  <button className="add-payment-btn" onClick={openAddPaymentModal}>
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
                        className="delete-payment-btn"
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
                      className="btn btn-primary mt-3"
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
                                  <span style={{ marginLeft: 4, fontWeight: "bold", color: "#000" }}>
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
                              <button className='btn outlined-btn fs-12'>
                                {service.specialization || t('pages.home.servicesSection.serviceProvider.category')}
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
                      className="btn btn-primary mt-3"
                      onClick={() => navigate('/service-list')}
                    >
                      {likedServicesTranslations.browseServices}
                    </button>
                  </div>
                )}
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
                    <label className="form-label" style={{textAlign: "left"}}>{t('profile.addresses.name')} *</label>
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
                    <label className="form-label" style={{textAlign: "left"}}>{t('profile.addresses.block')}</label>
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
                    <label className="form-label" style={{textAlign: "left"}}>{t('profile.addresses.street')}</label>
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
                    <label className="form-label" style={{textAlign: "left"}}>{t('profile.addresses.floorApartment')}</label>
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
                className="btn btn-primary rounded-1"
                style={{ backgroundColor: '#21395D' }}
                onClick={handleSaveAddress}
              >
                {t('profile.addresses.saveChanges')}
              </button>
              <button className="btn btn-secondary rounded-1" onClick={closeAddressModal}>
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
    </div>
  );
};

export default Profile;