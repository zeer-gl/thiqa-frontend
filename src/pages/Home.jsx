import {useTranslation} from 'react-i18next';
import {useEffect, useState} from "react";
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import '../css/pages/home.scss';
import ProductCard from '../components/ProductCard';
import HeroImg from '/public/images/home/hero-img.png';
import HeroPattern from '/public/images/home/hero-pattern.svg';
import HeroPattern2 from '/public/images/home/pattern-dark.svg';
import Return from '/public/images/home/return.svg';
import Sheild from '/public/images/home/shield-chekmark.svg';
import Truck from '/public/images/home/truck-2.svg';
import NearbyIcon from '/public/images/home/nearby-icon.svg';
import MIP from '/public/images/home/mi-icon.svg';
import ProductPattern from '/public/images/home/product-graphic.svg';
import MockupMob from '/public/images/home/mobile-mockup.png';
import Logo from '/public/images/logo-white.svg';
import CustomerImg from '/public/images/home/customer-img.png';
import CustomerImg2 from '/public/images/home/customer-profile.png';
import QuoteImg from '/public/images/home/quote-up.svg';
import SPImg from '/public/images/home/sp-card-img.jpg';
import BallPattern from '/public/images/home/ball-pattern.svg';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faStar as faStarSolid} from '@fortawesome/free-solid-svg-icons';
import {faStar as faStarRegular} from '@fortawesome/free-regular-svg-icons';
import {faHeart as regularHeart} from '@fortawesome/free-regular-svg-icons';
import {faHeart as solidHeart} from '@fortawesome/free-solid-svg-icons';
import { BaseUrl } from '../assets/BaseUrl.jsx';
import { Link, useNavigate } from 'react-router-dom';
import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";
import StarHalf from "@mui/icons-material/StarHalf";
import {useLikes} from '../context/LikesContext.jsx'
import { Avatar } from '@mui/material';
import { useUser } from '../context/Profile.jsx';


const Home = () => {
    const {t, i18n} = useTranslation();
    const { showAlert } = useAlert();

    const [liked, setLiked] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [categoriesError, setCategoriesError] = useState("");
    const [activeCategoryId, setActiveCategoryId] = useState(null);
    const [productsByCategory, setProductsByCategory] = useState({}); // { [categoryId]: Product[] }
    const [productsLoading, setProductsLoading] = useState(false);
    const [productsError, setProductsError] = useState("");
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [likedStates, setLikedStates] = useState({});
    const navigate=useNavigate();
    
    const { likedProfessionals, toggleProfessionalLike } = useLikes();
    const { isServiceProvider, userProfile, fetchUserProfile } = useUser();
    
    // Service management state
    const [services, setServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(false);
    const [servicesError, setServicesError] = useState(null);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [serviceFormLoading, setServiceFormLoading] = useState(false);
    const [serviceForm, setServiceForm] = useState({
        name: '',
        nameEn: '',
        nameAr: '',
        price: '',
        unit: '',
        deliveryTime: '',
        image: null,
        existingImage: null
    });
    const [imageError, setImageError] = useState('');
    
    // Pagination states for professionals
    const [currentProfessionalsPage, setCurrentProfessionalsPage] = useState(1);
    const [totalProfessionalsPages, setTotalProfessionalsPages] = useState(1);
    const professionalsPerPage = 3;
    const [allProfessionals, setAllProfessionals] = useState([]); // Store all professionals
    
    // Filtering states
    const [currentFilter, setCurrentFilter] = useState(null); // 'interactive', 'nearby', or null
    const [isFilterActive, setIsFilterActive] = useState(false);
    
    // Customer reviews states
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError] = useState(null);
    
    // Lock/unlock body scroll when modal is open/closed
    useEffect(() => {
        if (showServiceModal) {
            // Lock body scroll
            document.body.style.overflow = 'hidden';
        } else {
            // Unlock body scroll
            document.body.style.overflow = 'unset';
        }
        
        // Cleanup function to restore scroll when component unmounts
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showServiceModal]);
    
    const toggleHeart = () => {
        setLiked(!liked);
    };

    // Service management functions
    const fetchServices = async () => {
        try {
            console.log('🔄 Fetching services...');
            setLoadingServices(true);
            setServicesError(null);
            
            const token = localStorage.getItem('token-sp');
            if (!token) {
                throw new Error('Please login again');
            }
            
            // Get professional ID from localStorage
            let professionalId = null;
            try {
                const spUserData = localStorage.getItem('spUserData');
                if (spUserData) {
                    const userData = JSON.parse(spUserData);
                    professionalId = userData._id;
                }
            } catch (error) {
                console.error('Error parsing spUserData:', error);
            }
            
            if (!professionalId) {
                professionalId = localStorage.getItem('serviceProviderId');
            }
            
            if (!professionalId) {
                throw new Error('Professional ID not found');
            }
            
            const response = await axios.get(`${BaseUrl}/professional/${professionalId}/services`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Services API Response:', response.data);
            
            if (response.data && response.data.services) {
                setServices(response.data.services);
                console.log('✅ Services fetched successfully:', response.data.services);
                console.log('📊 Total services:', response.data.services.length);
                
                // Debug: Log service IDs and structure
                response.data.services.forEach((service, index) => {
                    console.log(`🔍 Service ${index + 1}:`, {
                        _id: service._id,
                        name: service.name,
                        nameEn: service.nameEn,
                        nameAr: service.nameAr,
                        admin: service.admin,
                        hasAdmin: !!service.admin
                    });
                });
            } else {
                setServices([]);
                console.warn('⚠️ No services data in response');
            }
        } catch (error) {
            setServicesError(error.response?.data?.message || error.message || 'Failed to fetch services');
            console.error('❌ Error fetching services:', error);
        } finally {
            setLoadingServices(false);
        }
    };

    // Get single service by ID
    const getSingleService = async (serviceId) => {
        try {
            const token = localStorage.getItem('token-sp');
            if (!token) {
                throw new Error('Please login again');
            }

            console.log('🔍 Get Single Service Debug:', {
                serviceId,
                token: token ? 'Present' : 'Missing',
                url: `${BaseUrl}/professional/getSingleService/${serviceId}`
            });

            const response = await axios.get(`${BaseUrl}/professional/getSingleService/${serviceId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Get Single Service API Response:', response.data);
            
            // Check if response has service data (either directly or wrapped in success object)
            if (response.data && (response.data.success || response.data._id || response.data.nameEn)) {
                // If response has success field, use the service from it, otherwise use the response directly
                const serviceData = response.data.success ? response.data.service : response.data;
                return { success: true, data: serviceData };
            } else {
                throw new Error(response.data?.message || 'Failed to get service details');
            }
        } catch (error) {
            console.error('❌ Error getting single service:', error);
            console.error('❌ Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw new Error(error.response?.data?.message || error.message || 'Failed to get service details');
        }
    };

    // Unified function to handle both create and update service
    const saveService = async (serviceData, serviceId = null) => {
        console.log('🔄 Saving service',serviceId);
        try {
            const token = localStorage.getItem('token-sp');
            if (!token) {
                throw new Error('Please login again');
            }
            
            // Get professional ID from localStorage
            let professionalId = null;
            try {
                const spUserData = localStorage.getItem('spUserData');
                if (spUserData) {
                    const userData = JSON.parse(spUserData);
                    professionalId = userData._id;
                }
            } catch (error) {
                console.error('Error parsing spUserData:', error);
            }
            
            if (!professionalId) {
                professionalId = localStorage.getItem('serviceProviderId');
            }
            
            if (!professionalId) {
                throw new Error('Professional ID not found');
            }

            // Determine if this is create or update operation
            const isUpdate = serviceId && serviceId.trim() !== '';
            
            console.log(`🔍 ${isUpdate ? 'Update' : 'Create'} Service Debug:`, {
                serviceId: serviceId || 'N/A',
                isUpdate,
                serviceData,
                token: token ? 'Present' : 'Missing'
            });

            const formData = new FormData();
            
            // Debug: Log the serviceData being sent
            console.log('🔍 Service data being sent:', {
                name: serviceData.name,
                nameEn: serviceData.nameEn,
                nameAr: serviceData.nameAr,
                price: serviceData.price,
                unit: serviceData.unit,
                deliveryTime: serviceData.deliveryTime,
                hasImage: !!serviceData.image
            });
            
            // Only append name if it exists and is not empty
            if (serviceData.name && serviceData.name.trim() !== '') {
            formData.append('name', serviceData.name);
            }
            formData.append('nameEn', serviceData.nameEn);
            formData.append('nameAr', serviceData.nameAr);
            formData.append('price', serviceData.price);
            formData.append('unit', serviceData.unit);
            formData.append('deliveryTime', serviceData.deliveryTime);
            
            if (serviceData.image) {
                formData.append('serviceImages', serviceData.image);
            }

            // Debug: Log all form data fields being sent
            console.log(`🔍 ${isUpdate ? 'Update' : 'Create'} Service - FormData fields being sent to API:`);
            const formDataEntries = [];
            for (let [key, value] of formData.entries()) {
                formDataEntries.push({ key, value: value instanceof File ? `File: ${value.name}` : value });
            }
            console.table(formDataEntries);

            // Choose the appropriate API endpoint and method
            let response;
            if (isUpdate) {
                // Update existing service
                response = await axios.post(`${BaseUrl}/professional/update-service/${serviceId}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            } else {
                // Create new service
                response = await axios.post(`${BaseUrl}/professional/add-service/${professionalId}`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            console.log(`✅ ${isUpdate ? 'Update' : 'Create'} Service API Response:`, response.data);

            // Debug: Compare sent data with received data
            if (isUpdate && response.data && response.data.service) {
                console.log('🔍 Data comparison:');
                console.log('📤 Sent data:', {
                    nameEn: serviceData.nameEn,
                    nameAr: serviceData.nameAr,
                    price: serviceData.price,
                    unit: serviceData.unit,
                    deliveryTime: serviceData.deliveryTime
                });
                console.log('📥 Received data:', {
                    nameEn: response.data.service.nameEn,
                    nameAr: response.data.service.nameAr,
                    price: response.data.service.price,
                    unit: response.data.service.unit,
                    deliveryTime: response.data.service.deliveryTime
                });
            }

            // Check for various success response formats
            const isSuccess = response.data && (
                response.data.success || 
                response.data.message?.includes('successfully') ||
                response.data.message?.includes('updated') ||
                response.data.message === 'Service added successfully' ||
                response.data._id // If response has service ID, it's likely successful
            );

            if (isSuccess) {
                console.log(`✅ Service ${isUpdate ? 'updated' : 'created'} successfully, refreshing services...`);
                // Refresh services list
                await fetchServices();
                
                // Return appropriate data based on operation
                const serviceData = response.data.service || response.data.updatedService || response.data.newService || response.data;
                console.log('📊 Returned service data:', serviceData);
                return { success: true, data: serviceData };
            } else {
                console.log(`❌ Service ${isUpdate ? 'update' : 'creation'} failed:`, response.data);
                throw new Error(response.data?.message || `Failed to ${isUpdate ? 'update' : 'create'} service`);
            }
        } catch (error) {
            console.error(`❌ Error ${serviceId ? 'updating' : 'creating'} service:`, error);
            console.error('❌ Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw new Error(error.response?.data?.message || error.message || `Failed to ${serviceId ? 'update' : 'create'} service`);
        }
    };

    const deleteService = async (serviceId) => {
        try {
            const token = localStorage.getItem('token-sp');
            if (!token) {
                throw new Error('Please login again');
            }

            console.log('🔍 Delete Service Debug:', {
                serviceId,
                token: token ? 'Present' : 'Missing',
                url: `${BaseUrl}/professional/delete-service/${serviceId}`
            });

            const response = await axios.delete(`${BaseUrl}/professional/delete-service/${serviceId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Delete Service API Response:', response.data);

            if (response.data && (response.data.success || response.data.message?.includes('successfully'))) {
                // Refresh services list
                await fetchServices();
                return { success: true };
            } else {
                throw new Error(response.data?.message || 'Failed to delete service');
            }
        } catch (error) {
            console.error('❌ Error deleting service:', error);
            console.error('❌ Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw new Error(error.response?.data?.message || error.message || 'Failed to delete service');
        }
    };

    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        
        // Validate image before submission
        if (serviceForm.image && !validateImage(serviceForm.image)) {
            return; // Stop submission if image validation fails
        }
        
        try {
            setServiceFormLoading(true);
            
            if (editingService) {
                console.log('🔄 Updating service...');
                const updateResult = await saveService(serviceForm, editingService._id);
                console.log('✅ Service updated successfully');
                
                // Update the editingService with fresh data from API
                if (updateResult.success && updateResult.data) {
                    setEditingService(updateResult.data);
                    console.log('🔄 Updated editingService with fresh data:', updateResult.data);
                    
                    // Update the form with the fresh data from API
                    setServiceForm({
                        name: updateResult.data.name || '',
                        nameEn: updateResult.data.nameEn || '',
                        nameAr: updateResult.data.nameAr || '',
                        price: updateResult.data.price || '',
                        unit: updateResult.data.unit || '',
                        deliveryTime: updateResult.data.deliveryTime || '',
                        image: null, // Reset new image selection
                        existingImage: updateResult.data.image || null // Update with fresh image URL
                    });
                    console.log('🔄 Updated form with fresh data from API');
                }
                
                showAlert(t('pages.home.serviceManagement.serviceUpdated', 'Service updated successfully!'), 'success');
                setShowServiceModal(false);
            } else {
                console.log('🔄 Creating service...');
                await saveService(serviceForm);
                console.log('✅ Service created successfully');
                showAlert(t('pages.home.serviceManagement.serviceCreated', 'Service created successfully!'), 'success');
                setShowServiceModal(false);
            
                // Reset form and close modal for create operation
                console.log('🔄 Resetting form and closing modal...');
            setServiceForm({
                name: '',
                nameEn: '',
                nameAr: '',
                price: '',
                unit: '',
                deliveryTime: '',
                    image: null,
                    existingImage: null
            });
            setEditingService(null);
            setShowServiceModal(false);
                console.log('✅ Modal closed and form reset');
            }
        } catch (error) {
            showAlert(t('pages.home.serviceManagement.serviceError', 'Error') + `: ${error.message}`, 'error');
        } finally {
            setServiceFormLoading(false);
        }
    };

    const handleEditService = async (service) => {
        try {
            // Fetch fresh service data from API
            const serviceResponse = await getSingleService(service._id);
            
            if (serviceResponse.success) {
                const freshService = serviceResponse.data;
                setEditingService(freshService);
        setServiceForm({
                    name: freshService.name || '',
                    nameEn: freshService.nameEn || '',
                    nameAr: freshService.nameAr || '',
                    price: freshService.price || '',
                    unit: freshService.unit || '',
                    deliveryTime: freshService.deliveryTime || '',
                    image: null, // New image file (if user selects one)
                    existingImage: freshService.image || null // Keep reference to existing image
        });
        setImageError(''); // Clear any previous image errors
        setShowServiceModal(true);
            } else {
                showAlert(t('pages.home.serviceManagement.serviceError', 'Error') + ': Failed to load service details', 'error');
            }
        } catch (error) {
            console.error('Error loading service for editing:', error);
            showAlert(t('pages.home.serviceManagement.serviceError', 'Error') + `: ${error.message}`, 'error');
        }
    };

    const handleDeleteService = (service) => {
        setServiceToDelete(service);
        setShowDeleteModal(true);
    };

    const confirmDeleteService = async () => {
        if (!serviceToDelete) return;
        
        try {
            await deleteService(serviceToDelete._id);
            showAlert(t('pages.home.serviceManagement.serviceDeleted', 'Service deleted successfully!'), 'success');
            } catch (error) {
            showAlert(t('pages.home.serviceManagement.serviceError', 'Error') + `: ${error.message}`, 'error');
        } finally {
            setShowDeleteModal(false);
            setServiceToDelete(null);
        }
    };

    const cancelDeleteService = () => {
        setShowDeleteModal(false);
        setServiceToDelete(null);
    };

    // Image validation function
    const validateImage = (file) => {
        if (!file) {
            setImageError('');
            return true;
        }

        // Check file size (1MB = 1024 * 1024 bytes)
        const maxSize = 1024 * 1024; // 1MB in bytes
        if (file.size > maxSize) {
            setImageError(t('pages.home.serviceManagement.imageSizeError', 'Image size must be less than 1MB'));
            return false;
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setImageError(t('pages.home.serviceManagement.imageTypeError', 'Please select a valid image file (JPEG, PNG, GIF, WebP)'));
            return false;
        }

        setImageError('');
        return true;
    };

    // Mock product data
    const products = [
        { id: 1, price: 20 },
        { id: 2, price: 20 },
        { id: 3, price: 20 },
        { id: 4, price: 20 },
        { id: 5, price: 20 },
        { id: 6, price: 20 },
    ];
    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);
            setCategoriesError("");
            const res = await fetch(`${BaseUrl}/customer/getCategories`);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message || `Failed to load categories (${res.status})`);
            }
            const responseData = await res.json();
            console.log('responseData', responseData);
            
            // Access the data array from the response
            const list = Array.isArray(responseData.data) ? responseData.data : [];
            console.log('list', list);
            
            setCategories(list);
            if (list.length > 0) {
                setActiveCategoryId(list[0]._id);
            }
        } catch (e) {
            setCategoriesError(e?.message || 'Unable to load categories');
        } finally {
            setCategoriesLoading(false);
        }
    };

    // Fetch categories
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch services for service providers
    useEffect(() => {
        if (isServiceProvider) {
            fetchServices();
        }
    }, [isServiceProvider]);

    // Fetch all customer reviews on component mount
    useEffect(() => {
        fetchAllCustomerReviews();
    }, []);

    // Function to refresh reviews (can be called manually if needed)
    const refreshReviews = () => {
        fetchAllCustomerReviews();
    };

    // Refresh profile data when component mounts (useful after subscription changes)
    useEffect(() => {
        if (isServiceProvider) {
            // Only refresh once on mount, not repeatedly
            const timer = setTimeout(async () => {
                try {
                    console.log('🔄 Refreshing profile data on Home page mount...');
                    await fetchUserProfile();
                    console.log('✅ Profile data refreshed successfully');
                } catch (error) {
                    console.error('❌ Error refreshing profile data:', error);
                }
            }, 1000);
            
            return () => clearTimeout(timer);
        }
    }, [isServiceProvider]); // Removed fetchUserProfile from dependencies to prevent repeated calls

    // Manual refresh function for debugging
    const handleManualRefresh = async () => {
        try {
            console.log('🔄 Manual profile refresh triggered...');
            
            // Clear any cached profile data
            setUserProfile(null);
            
            // Force refresh profile data
            await fetchUserProfile();
            
            // Also check localStorage for subscription status
            const spUserData = localStorage.getItem('spUserData');
            if (spUserData) {
                try {
                    const spData = JSON.parse(spUserData);
                    console.log('📋 Current localStorage spUserData:', {
                        hasActiveSubscription: spData.hasActiveSubscription,
                        subscriptionStatus: spData.subscriptionStatus,
                        name: spData.name
                    });
                } catch (error) {
                    console.error('Error parsing localStorage spUserData:', error);
                }
            }
            
            console.log('✅ Manual profile refresh completed');
        } catch (error) {
            console.error('❌ Error in manual profile refresh:', error);
        }
    };
    useEffect(() => {
        fetchProfessionals();
    }, []);
      
    // Function to handle professional pagination
    const handleProfessionalsPageChange = (direction) => {
        if (direction === 'next' && currentProfessionalsPage < totalProfessionalsPages) {
            const nextPage = currentProfessionalsPage + 1;
            setCurrentProfessionalsPage(nextPage);
            
            // Calculate start and end indices for the new page
            const startIndex = (nextPage - 1) * professionalsPerPage;
            const endIndex = startIndex + professionalsPerPage;
            
            // Get professionals for the new page
            const newProfessionals = allProfessionals.slice(startIndex, endIndex);
            setProfessionals(newProfessionals);
        } else if (direction === 'prev' && currentProfessionalsPage > 1) {
            const prevPage = currentProfessionalsPage - 1;
            setCurrentProfessionalsPage(prevPage);
            
            // Calculate start and end indices for the new page
            const startIndex = (prevPage - 1) * professionalsPerPage;
            const endIndex = startIndex + professionalsPerPage;
            
            // Get professionals for the new page
            const newProfessionals = allProfessionals.slice(startIndex, endIndex);
            setProfessionals(newProfessionals);
        }
    };

    // Function to fetch professionals with optional filtering
    const fetchProfessionals = async (filterType = null, filterValue = null) => {
        try {
            setLoading(true);
            
            // Build API URL with optional filter parameters
            let apiUrl = `${BaseUrl}/professional/get-all-professsional?limit=1000`;
            
            if (filterType === 'interactive') {
                apiUrl += `&interactive=${filterValue}`;
            } else if (filterType === 'nearby') {
                // Add required latitude and longitude parameters for nearby filter
                apiUrl += `&latitude=31.4587108&longitude=74.2757159&nearby=1`;
            }
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error('Failed to fetch professionals');
            }
            
            const data = await response.json();
            
            if (data.message === "All professionals retrieved successfully") {
                // Store all professionals
                setAllProfessionals(data.data);
                
                // Calculate total pages based on 3 professionals per page
                const totalPages = Math.ceil(data.data.length / professionalsPerPage);
                setTotalProfessionalsPages(totalPages);
                
                // Reset to first page when filtering
                setCurrentProfessionalsPage(1);
                
                // Get first 3 professionals for initial display
                const firstThree = data.data.slice(0, professionalsPerPage);
                setProfessionals(firstThree);
                
                // Fetch liked professionals to initialize liked states
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const likedResponse = await fetch(`${BaseUrl}/customer/customer-liked-professionals`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        
                        if (likedResponse.ok) {
                            const likedData = await likedResponse.json();
                            if (likedData.success && Array.isArray(likedData.data)) {
                                const likedProfessionalIds = likedData.data.map(prof => prof._id);
                                
                                // Initialize liked states based on API response
                                const initialLikedStates = {};
                                data.data.forEach(professional => {
                                    initialLikedStates[professional._id] = likedProfessionalIds.includes(professional._id);
                                });
                                setLikedStates(initialLikedStates);
                                return; // Exit early since we set liked states from API
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching liked professionals:', error);
                    }
                }
                
                // Fallback: Initialize liked states to false if API call fails or no token
                const initialLikedStates = {};
                data.data.forEach(professional => {
                    initialLikedStates[professional._id] = false;
                });
                setLikedStates(initialLikedStates);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching professionals:', err);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle Most Interactive button click
    const handleMostInteractiveClick = async () => {
        if (isFilterActive && currentFilter === 'interactive') {
            // If already active, remove filter and show all professionals
            setIsFilterActive(false);
            setCurrentFilter(null);
            await fetchProfessionals();
        } else {
            // Apply interactive filter (interaction score 4)
            setIsFilterActive(true);
            setCurrentFilter('interactive');
            await fetchProfessionals('interactive', 4);
        }
    };

    // Function to handle Nearby button click
    const handleNearbyClick = async () => {
        if (isFilterActive && currentFilter === 'nearby') {
            // If already active, remove filter and show all professionals
            setIsFilterActive(false);
            setCurrentFilter(null);
            await fetchProfessionals();
        } else {
            // Apply nearby filter
            setIsFilterActive(true);
            setCurrentFilter('nearby');
            await fetchProfessionals('nearby');
        }
    };

    // Function to clear all filters
    const clearAllFilters = async () => {
        setIsFilterActive(false);
        setCurrentFilter(null);
        await fetchProfessionals();
    };

    // Function to fetch all customer reviews
    const fetchAllCustomerReviews = async () => {
        try {
            setReviewsLoading(true);
            setReviewsError(null);
            
            // Option 1: Use a specific product ID (replace with actual product ID)
            const productId = '685421475a9d09fcc2379f60'; // Replace with actual product ID
            
            const response = await fetch(`${BaseUrl}/customer/get-product-reviews/${productId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch reviews (${response.status})`);
            }
            
            const data = await response.json();
            
            if (data.success && Array.isArray(data.data)) {
                setReviews(data.data);
                console.log('✅ Product reviews fetched successfully:', data.data);
            } else {
                setReviews([]);
                console.warn('⚠️ No reviews data in response');
            }
        } catch (error) {
            setReviewsError(error.message);
            console.error('❌ Error fetching reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    // Helper function to calculate average rating
    const calculateAverageRating = (review) => {
        const { efficiencyRating, priceRating, deliveryRating } = review;
        return ((efficiencyRating + priceRating + deliveryRating) / 3).toFixed(1);
    };

    // Helper function to render stars
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} sx={{ color: "#FFD700", fontSize: 18 }} />);
        }
        
        if (hasHalfStar) {
            stars.push(<StarHalf key="half" sx={{ color: "#FFD700", fontSize: 18 }} />);
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<StarBorder key={`empty-${i}`} sx={{ color: "#FFD700", fontSize: 18 }} />);
        }
        
        return stars;
    };
    useEffect(() => {
        const fetchProducts = async (categoryId) => {
            if (!categoryId) return;
            
            try {
                setProductsLoading(true);
                setProductsError("");
                const res = await fetch(`${BaseUrl}/customer/products/category/${categoryId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err?.message || `Failed to load products (${res.status})`);
                }
                
                const data = await res.json();
                const list = Array.isArray(data?.products) ? data.products : [];
                
                setProductsByCategory((prev) => ({ 
                    ...prev, 
                    [categoryId]: list 
                }));
            } catch (e) {
                setProductsError(e?.message || 'Unable to load products');
            } finally {
                setProductsLoading(false);
            }
        };
        
        fetchProducts(activeCategoryId);
    }, [activeCategoryId]);

    // Generate skeleton products for loading state
    const skeletonProducts = Array(6).fill(0).map((_, index) => ({
        id: `skeleton-${index}`,
        isSkeleton: true
    }));

    // Fetch products for active category (with simple caching)
    useEffect(() => {
        const fetchProducts = async (categoryId) => {
            if (!categoryId) return;
            // If we already have products for this category, skip fetch
            if (productsByCategory[categoryId]?.length) return;
            try {
                setProductsLoading(true);
                setProductsError("");
                const res = await fetch(`${BaseUrl}/customer/products/category/${categoryId}`,{
                    method:"GET",
                    headers:{
                        "Authorization":`Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err?.message || `Failed to load products (${res.status})`);
                }
                const data = await res.json();
                const list = Array.isArray(data?.products) ? data.products : [];
                setProductsByCategory((prev) => ({ ...prev, [categoryId]: list }));
            } catch (e) {
                setProductsError(e?.message || 'Unable to load products');
            } finally {
                setProductsLoading(false);
            }
        };
        fetchProducts(activeCategoryId);
    }, [activeCategoryId]);
    const parseCategory = (catStr) => {
        try {
          return Function('"use strict";return (' + catStr + ')')();
        } catch {
          return {};
        }
      };
      const getProfileImage = (professional) => {
        // Check if professional.image exists and is a valid URL
        if (professional.image && 
            typeof professional.image === 'string' && 
            professional.image.trim() !== '' && 
            professional.image !== 'null' && 
            professional.image !== 'undefined' &&
            professional.image.startsWith('http')) {
          return professional.image;
        }
        
        // Check if professional.pic exists and is a valid URL
        if (professional.pic && 
            typeof professional.pic === 'string' && 
            professional.pic.trim() !== '' && 
            professional.pic !== 'null' && 
            professional.pic !== 'undefined' &&
            professional.pic.startsWith('http')) {
          return professional.pic;
        }
        
        // Check if portfolio has valid images
        if (professional.portfolio && 
            Array.isArray(professional.portfolio) && 
            professional.portfolio.length > 0 && 
            professional.portfolio[0].images && 
            Array.isArray(professional.portfolio[0].images) && 
            professional.portfolio[0].images.length > 0 &&
            professional.portfolio[0].images[0] &&
            typeof professional.portfolio[0].images[0] === 'string' &&
            professional.portfolio[0].images[0].trim() !== '' &&
            professional.portfolio[0].images[0] !== 'null' &&
            professional.portfolio[0].images[0] !== 'undefined' &&
            professional.portfolio[0].images[0].startsWith('http')) {
          return professional.portfolio[0].images[0];
        }
        
        // Return null to show avatar fallback
        return null;
      };


     
    // Check localStorage for payment status - this takes priority over API data
    const spPaymentStatus = localStorage.getItem('spPaymentStatus');
    const spHasActiveSubscription = localStorage.getItem('spHasActiveSubscription');
    
    // Service providers can now access all features without subscription check
    // But we still check localStorage for payment status
    const shouldShowUpgradeOnly = false;
    
    // Debug: Service provider section visibility
    console.log('🔍 Service Provider Section Debug:', {
        isServiceProvider,
        hasActiveSubscription: userProfile?.hasActiveSubscription,
        shouldShowUpgradeOnly,
        willShowServiceSection: isServiceProvider && userProfile?.hasActiveSubscription,
        localStoragePaymentStatus: spPaymentStatus,
        localStorageHasActiveSubscription: spHasActiveSubscription,
        userProfile: userProfile ? {
            name: userProfile.name,
            hasActiveSubscription: userProfile.hasActiveSubscription,
            subscriptionStatus: userProfile.subscriptionStatus
        } : null
    });
    
    // Debug logging for subscription status
    console.log('🔍 Home Page Debug:', {
        isServiceProvider,
        userProfile: userProfile ? {
            name: userProfile.name,
            hasActiveSubscription: userProfile.hasActiveSubscription,
            subscriptionStatus: userProfile.subscriptionStatus,
            hasActiveSubscription: userProfile.hasActiveSubscription
        } : null,
        shouldShowUpgradeOnly,
        timestamp: new Date().toISOString()
    });

    return (
        <div>
            {shouldShowUpgradeOnly ? (
                // Show only upgrade message for service providers without subscription
                <section className="hero-section">
                    <div className="container">
                        <div className="row align-items-center justify-content-center g-4">
                            <div className="col-lg-8 col-md-12 text-center">
                                <div className='hero-content'>
                                    <h2 className="ar-heading-bold" style={{color: '#FFFFFF'}}>
                                        {t('pages.home.upgradeSection.title', 'Upgrade Your Plan')}
                                    </h2>
                                    <h4 className="ar-heading-bold" style={{color: '#FFFFFF'}}>
                                        {t('pages.home.upgradeSection.subtitle', 'Get access to all features and start receiving project requests')}
                                    </h4>
                                    <div className="d-flex flex-column gap-3 align-items-center">
                                    <Link to={'/profile-sp?tab=packages'}>
                                        <button className='btn hero-btn d-flex align-items-center justify-content-center'>
                                            {t('pages.home.heroSection.upgradePackage', 'Upgrade Package')}
                                        </button>
                                    </Link>
                                    
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                // Show full content for customers and service providers with active subscription
                <>
                    {/* Service Management Section for Service Providers with Active Subscription */}
                  

                    <section className="hero-section">
                <div className="container">
                    <div className="row align-items-center g-4">
                        <div className="col-lg-6 col-md-12">
                            <div className='position-relative text-center'>
                                <div className='hero-img-overlay'></div>
                                <img className='max-100 hero-img' src={HeroImg} alt=""/>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12">
                            <div className='hero-content'>
                                <h2 className="ar-heading-bold" style={{color: '#FFFFFF'}}>
                                    {t('pages.home.heroSection.title')}
                                </h2>
                                <h4 className="ar-heading-bold" style={{color: '#FFFFFF'}}>
                                    {t('pages.home.heroSection.subtitle')}
                                </h4>
                                {isServiceProvider ? (
                                    // Show packages button for service providers
                                        <Link to={'/profile-sp?tab=packages'}>
                                            <button className='btn hero-btn pt-2 d-flex align-items-center justify-content-center'>
                                            {t('pages.home.heroSection.viewPackages', 'View Packages')}
                                            </button>
                                        </Link>
                                ) : (
                                    // Show regular button for customers
                                    <Link to={'/products'} style={{textDecoration: 'none'}}>
                                        <button className='btn hero-btn pt-2 d-flex align-items-center justify-content-center' style={{textDecoration:"none"}}>
                                            {t('pages.home.heroSection.ctaButton')}
                                        </button>
                                    </Link>
                                )}
                              
                            </div>
                        </div>
                    </div>
                </div>
                <div className='hero-pattern-container'>
                    <img className='w-100' src={HeroPattern} alt=""/>
                </div>
            </section>
                    {isServiceProvider && userProfile?.hasActiveSubscription && (
                        <section className="service-management-section py-5" style={{backgroundColor: '#f8f9fa'}}>
                            <div className="container">
                                <div className="row">
                                    <div className="col-12">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            {/* <h2 className="ar-heading-bold">{t('pages.home.serviceManagement.title', 'My Services')}</h2> */}
                                            <button 
                                                className="btn  d-flex align-items-center justify-content-center"
                                                onClick={() => setShowServiceModal(true)}
                                                style={{backgroundColor: '#21395D',color: 'white',width:'100%'}}
                                            >
                                                <i className="fas fa-plus me-2"></i>
                                                <span className="pt-2">
                                                {t('pages.home.serviceManagement.addService', 'Add Service')}
                                                </span>
                                              
                                            </button>
                                        </div>
                                        
                                        {loadingServices ? (
                                            <div className="text-center py-5">
                                                <div className="spinner-border" role="status">
                                                    <span className="visually-hidden">{t('common.loading', 'Loading...')}</span>
                                                </div>
                                                <p className="mt-3">{t('pages.home.serviceManagement.loadingServices', 'Loading services...')}</p>
                                            </div>
                                        ) : servicesError ? (
                                            <div className="alert alert-danger">{servicesError}</div>
                                        ) : services.length > 0 ? (
                                            <div className="row">
                                                {services.map((service) => (
                                                    <div key={service._id} className="col-md-6 col-lg-4 mb-4">
                                                        <div className="card h-100">
                                                            {service.image && (
                                                                <img 
                                                                    src={service.image} 
                                                                    className="card-img-top" 
                                                                    alt={service.name || service.nameEn}
                                                                    style={{height: '200px', objectFit: 'cover'}}
                                                                />
                                                            )}
                                                            <div className="card-body d-flex flex-column">
                                                                <h5 className="card-title">
                                                                    {service.nameEn || service.name || 'Service'}
                                                                </h5>
                                                                {service.nameAr && (
                                                                    <p className="card-text text-muted">{service.nameAr}</p>
                                                                )}
                                                                <div className="mb-2">
                                                                    <strong>{t('pages.home.serviceManagement.price', 'Price')}:</strong> {service.price} {service.unit}
                                                                </div>
                                                                <div className="mb-3">
                                                                    <strong>{t('pages.home.serviceManagement.delivery', 'Delivery')}:</strong> {service.deliveryTime}
                                                                </div>
                                                                <div className="mt-auto">
                                                                    <div className="btn-group w-100" role="group" style={{display: 'flex', justifyContent: 'center',alignItems: 'center',gap: '10px'}}>
                                                                        <button 
                                                                            className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center"
                                                                            onClick={() => handleEditService(service)}
                                                                        >
                                                                            <i className="fas fa-edit "></i>
                                                                            <span className="pt-2">
                                                                            {t('common.edit', 'Edit')}
                                                                            </span>
                                                                           
                                                                        </button>
                                                                        <button 
                                                                            className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                                                                            onClick={() => handleDeleteService(service)}
                                                                        >
                                                                            <i className="fas fa-trash me-1"></i>
                                                                            <span className="pt-2">
                                                                            {t('common.delete', 'Delete')}
                                                                            </span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="d-flex flex-column align-items-center justify-content-center text-center py-5" style={{minHeight: '300px'}}>
                                                <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                                                <h5 className="text-muted mb-3">{t('pages.home.serviceManagement.noServices', 'No services yet')}</h5>
                                                <p className="text-muted mb-4">{t('pages.home.serviceManagement.startAdding', 'Start by adding your first service')}</p>
                                             
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

            <section className="feature-section">
                <div className="container">
                    <div className="row g-3">
                        <div className="col-lg-4 col-md-6">
                            <div className='text-center feature-item'>
                                <img src={Truck} alt=""/>
                                <h4 className='pb-3 ar-heading-bold'>
                                    {t('pages.home.featureSection.customerSupport.title')}
                                </h4>
                                <p>
                                    {t('pages.home.featureSection.customerSupport.description')}
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className='text-center feature-item'>
                                <img src={Sheild} alt=""/>
                                <h4 className='pb-3 ar-heading-bold'>
                                    {t('pages.home.featureSection.securePayment.title')}
                                </h4>
                                <p>
                                    {t('pages.home.featureSection.securePayment.description')}
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-12">
                            <div className='text-center feature-item'>
                                <img src={Return} alt=""/>
                                <h4 className='pb-3 ar-heading-bold'>
                                    {t('pages.home.featureSection.freeReturns.title')}
                                </h4>
                                <p>
                                    {t('pages.home.featureSection.freeReturns.description')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='hero-dark-pattern-container'>
                    <img className='w-100' src={HeroPattern2} alt=""/>
                </div>
            </section>
         
            {
                !isServiceProvider &&(
                    <>
                       <section className='product-section'>
            <div className="container">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-3 mb-lg-5 gap-3">
                    <div className="w-100">
                        <ul className="nav nav-pills product-list-tabs mb-3 flex-wrap" id="pills-tab" role="tablist">
                            {categoriesLoading && (
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link active" type="button" disabled>
                                        {t('common.loading') || 'Loading...'}
                                    </button>
                                </li>
                            )}
                            {!categoriesLoading && categoriesError && (
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link active" type="button" disabled>
                                        {categoriesError}
                                    </button>
                                </li>
                            )}
                            {!categoriesLoading && !categoriesError && categories.map((cat) => (
                                <li className="nav-item" role="presentation" key={cat._id}>
                                    <div
                                        className={`nav-link d-flex align-items-center justify-content-center ${activeCategoryId === cat._id ? 'active' : ''}`}
                                        id={`pills-${cat._id}-tab`}
                                        data-bs-toggle="pill"
                                        data-bs-target={`#pills-${cat._id}`}
                                        type="button"
                                        role="tab"
                                        aria-controls={`pills-${cat._id}`}
                                        aria-selected={activeCategoryId === cat._id}
                                        onClick={() => setActiveCategoryId(cat._id)}
                                        style={{minWidth:'130px'}}
                                    >
                                        <p className='m-0 pt-1'>
                                        {(i18n.language === 'ar' ? cat?.name?.ar : cat?.name?.en) || ''}</p>

                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-100">
                        <div className='d-flex flex-column flex-md-row align-items-start justify-content-end align-items-md-center gap-3'>
                            <h4 className="mb-0 ar-heading-bold">
                                {t('pages.home.productSection.title')}
                            </h4>
                            {/* <div className='d-flex align-items-center gap-2 flex-wrap'>
                                <button className='btn mi-btn'>
                                    <img src={MIP} alt=""/>{t('pages.home.productSection.buttons.mostInteractive')}
                                </button>
                                <button className='btn nearby-btn'>
                                    <img src={NearbyIcon} alt=""/>{t('pages.home.productSection.buttons.nearby')}
                                </button>
                            </div> */}
                        </div>
                    </div>
                </div>
                <div className="tab-content" id="pills-tabContent">
                    {!categoriesLoading && !categoriesError && categories.map((cat) => (
                        <div
                            className={`tab-pane fade ${activeCategoryId === cat._id ? 'show active' : ''}`}
                            id={`pills-${cat._id}`}
                            role="tabpanel"
                            aria-labelledby={`pills-${cat._id}-tab`}
                            key={cat._id}
                        >
                          <div className='row'>
  {productsByCategory[cat._id]?.length > 0 ? (
    productsByCategory[cat._id].map((product) => (
        <ProductCard 
        key={`${cat._id}-${product._id}`} 
        product={{
          id: product._id,
          name: i18n.language === 'ar' ? product.name_ar : product.name_en,
          categoryName: parseCategory(product?.categoryName)?.[i18n.language] 
                       || parseCategory(product?.categoryName)?.en 
                       || "",
          price: product.price,
          measurementUnit: product?.measurementUnit,
          image: product.images?.[0],
          isSkeleton: false
        }} 
      />
    ))
  ) : (
    // Show empty state message
    <div className="col-12 text-center py-5">
      <h5>{t('No products available in this category')}</h5>
    </div>
  )}
</div>

                        </div>
                    ))}
                    {(categoriesLoading || categoriesError || categories.length === 0) && (
                        <div className="tab-pane fade show active" id="pills-placeholder" role="tabpanel">
                            <div className='row'>
                                {skeletonProducts.map((product) => (
                                    <ProductCard key={`placeholder-${product.id}`} product={product} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className='text-center mt-5'>
                    <img className='max-100' src={ProductPattern} alt=""/>
                </div>
            </div>
        </section>
        <section className='services-section'>
      <div className="container">
        <div className='d-flex align-items-center justify-content-between mb-5'>
          <h2 className='ar-heading-bold' style={{fontSize:'24px'}}>
            {t('pages.home.servicesSection.title')}
          </h2>
          <div className='d-flex align-items-center gap-2 services-buttons-container'>
            <div className="d-flex align-items-center gap-2 main-buttons-group">
              <Link to={'service-list'} className='text-decoration-none'>
                <button className='btn nearby-btn p-3 text-decoration-none d-flex align-items-center justify-content-center'>
                  <p className='m-0 '>
                  {t('pages.home.servicesSection.buttons.seeAll', 'See All')}
                  </p>
                </button>
              </Link>
       
              <button 
                className={`btn mi-btn p-3 d-flex align-items-center justify-content-center ${isFilterActive && currentFilter === 'interactive' ? 'active' : ''}`}
                onClick={handleMostInteractiveClick}
              >
                <img src={MIP} className='pb-1' alt="Most Interactive Professionals"/>
                <p className='m-0'>{t('pages.home.servicesSection.buttons.mostInteractive')}</p>
              </button>
              <button 
                className={`btn p-3 nearby-btn d-flex align-items-center justify-content-center ${isFilterActive && currentFilter === 'nearby' ? 'active' : ''}`}
                onClick={handleNearbyClick}
              >
                <img src={NearbyIcon}  className='pb-1' alt="Nearby Professionals"/> {t('pages.home.servicesSection.buttons.nearby')}
              </button>
            </div>
            
            {/* Pagination Arrows for Professionals - Side by Side */}
            {totalProfessionalsPages > 1 && (
              <div className="d-flex align-items-center gap-2 ms-3 pagination-buttons-group">
                <button
                  className="btn pagination-arrow-btn d-flex align-items-center justify-content-center"
                  onClick={() => handleProfessionalsPageChange('prev')}
                  disabled={currentProfessionalsPage === 1}
                  style={{
                    opacity: currentProfessionalsPage === 1 ? 0.5 : 1,
                    cursor: currentProfessionalsPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                <button
                  className="btn pagination-arrow-btn d-flex align-items-center justify-content-center"
                  onClick={() => handleProfessionalsPageChange('next')}
                  disabled={currentProfessionalsPage === totalProfessionalsPages}
                  style={{
                    opacity: currentProfessionalsPage === totalProfessionalsPages ? 0.5 : 1,
                    cursor: currentProfessionalsPage === totalProfessionalsPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Filter Status and Clear Button */}
        {isFilterActive && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="filter-status">
              <span className="badge bg-primary me-2">
                <i className="fas fa-filter me-1"></i>
                {currentFilter === 'interactive' ? 'Most Interactive (Score: 4)' : 
                 currentFilter === 'nearby' ? 'Nearby Professionals' : 'Filtered'}
              </span>
              <span className="text-muted">
                Showing {allProfessionals.length} professionals
              </span>
            </div>
            <button 
              className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center"
              onClick={clearAllFilters}
            >
              <i className="fas fa-times me-1"></i>
              <span className='pt-1'>
              Clear Filters
              </span>
             
            </button>
          </div>
        )}
      </div>
      
      <div className="container">

        <div className="row g-4">
            
          {professionals.map(professional => (
        <div
        key={professional._id}
        className="col-lg-4 col-md-6 col-sm-6"
        style={{ 
          cursor: "pointer",
          border: "1px solid lightgray",
          marginBottom: "20px"
        }}
        onClick={() => navigate(`/service/${professional._id}`)}
      >
              <div className="service-provider-card">
                <div>
                  {(() => {
                    const profileImage = getProfileImage(professional);
                    console.log(`Professional: ${professional.name}, Has Image: ${!!profileImage}, Image: ${profileImage}`);
                    
                    if (profileImage) {
                      return (
                        <img 
                          className='top-img' 
                          src={profileImage} 
                          alt={professional.name}
                          style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                        />
                      );
                    } else {
                      return (
                        <div 
                          className='top-img avatar-fallback'
                          style={{ 
                            width: '100%', 
                            height: '150px',
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
                          {professional.name ? professional.name.charAt(0) : 'P'}
                        </div>
                      );
                    }
                  })()}
                </div>
                
                <div className='d-flex  justify-content-between py-3'>
                  <div className='d-flex align-items-center gap-3'>
                    {/* <img src={BallPattern} alt="" width="40" height="40"/> */}
                    <div className='d-flex align-items-start gap-3 flex-column '>
                      <div>
                      <h6 className="fs-14 ar-heading-bold">
  {professional.name
    ?.split(" ")
    .slice(0, 2)                // take first 2 words
    .join(" ") + 
    (professional.name?.split(" ").length > 2 ? " ." : "")
    
    }
</h6>
                        <p className='fs-12'>{ professional.bio?.split(" ")
    .slice(0, 4)                // take first 2 words
    .join(" ") + 
    (professional.bio?.split(" ").length > 5 ? " ." : "")|| t('pages.home.servicesSection.serviceProvider.description')}</p>
                      </div>
                      <div className="ratings d-flex align-items-center">
  {[...Array(5)].map((_, index) => {
    const starValue = index + 1;
    const rating = professional.averageRating || 0;

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
    {professional.averageRating?.toFixed(1) || "0.0"}
  </span>
</div>
                    </div>
                  </div>
                  
                  <div className='d-flex align-items-end flex-column gap-3 justify-content-between'>
                  <FontAwesomeIcon
    icon={likedProfessionals[professional._id] ? solidHeart : regularHeart}
    onClick={async (e) => {
      e.stopPropagation();
      try {
        await toggleProfessionalLike(professional._id);
      } catch (error) {
        console.error('Error toggling like:', error);
      }
    }}
    style={{
      cursor: 'pointer',
      color: likedProfessionals[professional._id] ? 'red' : 'gray',
      fontSize: '24px',
      transition: '0.2s ease-in-out',
      paddingRight:"20px"
    }}
  />
                    <button className='btn outlined-btn fs-12 d-flex align-items-center justify-content-center'>
                    <span className='pt-1'>
                      {professional.specialization || t('pages.home.servicesSection.serviceProvider.category')}
                    </span>
        

                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        
      </div>
    </section>
  
            <section className='about-section'>
                <div className="container">
                    <div className="row">
                        <div className="col-md-6">
                            <div className='text-white'>
                                <img className='pb-5' src={Logo} alt=""/>
                                <h2 className='pb-5 ar-heading-bold'>
                                    {t('pages.home.aboutSection.title')}
                                </h2>
                                <p>
                                    {t('pages.home.aboutSection.description')}
                                </p>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className='mockup-mobile'>
                                <img className='max-100' src={MockupMob} alt=""/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='hero-pattern-container'>
                    <img className='w-100' src={HeroPattern} alt=""/>
                </div>
            </section>
                    </>
                )  
            }
       


        {
            !isServiceProvider && (
                <>
                  <section className='customer-section'>
                <div className="container">
                    <div className="row g-5">
                        <div className="col-lg-6 col-12 position-relative">
                            <h5 className='mb-3 ar-heading-bold'>{t('pages.home.customerSection.subtitle')}</h5>
                            <h1 className='mb-3 ar-heading-bold'>
                                {t('pages.home.customerSection.title')}
                            </h1>
                            {!reviewsLoading && !reviewsError && reviews.length > 0 && (
                                <div className="mb-3" style={{ fontSize: '14px', color: '#666' }}>
                                    <span>Showing {reviews.length} customer review{reviews.length !== 1 ? 's' : ''}</span>
                                </div>
                            )}
                            {reviewsLoading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">{t('common.loading', 'Loading...')}</span>
                                    </div>
                                    <p className="mt-3">{t('pages.home.customerSection.loadingReviews', 'Loading reviews...')}</p>
                                </div>
                            ) : reviewsError ? (
                                <div className="alert alert-danger">{reviewsError}</div>
                            ) : reviews.length > 0 ? (
                            <div id="carouselExampleIndicators" className="carousel position-static slide">
                                <div className="carousel-indicators mb-0">
                                        {reviews.map((_, index) => (
                                            <button 
                                                key={index}
                                                type="button" 
                                                data-bs-target="#carouselExampleIndicators"
                                                data-bs-slide-to={index} 
                                                className={index === 0 ? "active" : ""} 
                                                aria-current={index === 0 ? "true" : "false"}
                                                aria-label={`Slide ${index + 1}`}
                                            ></button>
                                        ))}
                                </div>
                                <div className="carousel-inner">
                                        {reviews.map((review, index) => {
                                            const averageRating = calculateAverageRating(review);
                                            const customerName = review.customerId?.name || 'Customer';
                                            const customerPic = review.customerId?.pic || null;
                                            
                                            return (
                                                <div 
                                                    key={review._id}
                                                    className={`carousel-item ${index === 0 ? 'active' : ''}`}
                                                >
                                        <div className='customer-content'>
                                            <p>
                                                            {review.additionalNotes && review.additionalNotes.trim() !== '' 
                                                                ? review.additionalNotes 
                                                                : `Customer rated this product ${calculateAverageRating(review)}/5 stars based on efficiency, price, and delivery.`
                                                            }
                                            </p>
                                                        <div className="review-product-info" style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                                                            <small>Product ID: {review.productId}</small>
                                            </div>
                                            <div className='quote'>
                                                <img src={QuoteImg} alt=""/>
                                            </div>
                                            <div className='customer-profile'>
                                                            {customerPic ? (
                                                                <img 
                                                                    src={customerPic} 
                                                                    alt={customerName}
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div 
                                                                    className="customer-avatar-fallback"
                                                                    style={{
                                                                        width: '60px',
                                                                        height: '60px',
                                                                        borderRadius: '50%',
                                                                        backgroundColor: '#e0e0e0',
                                                                        color: '#666',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: '24px',
                                                                        fontWeight: 'bold',
                                                                        textTransform: 'uppercase'
                                                                    }}
                                                                >
                                                                    {customerName.charAt(0)}
                                                </div>
                                                            )}
                                                <div>
                                                    <h5 className='fw-semibold ar-heading-bold'>
                                                                    {customerName}
                                                    </h5>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <div className="ratings d-flex align-items-center">
                                                                        {renderStars(parseFloat(averageRating))}
                                                </div>
                                                                    <span className='pt-1' style={{ marginLeft: 4, fontWeight: "bold", color: "#000" }}>
                                                                        {averageRating}
                                                                    </span>
                                            </div>
                                                                <div className="mt-2" style={{ fontSize: '12px', color: '#666' }}>
                                                                    <div className="d-flex justify-content-between mb-1">
                                                                        <span>Efficiency: {review.efficiencyRating}/5</span>
                                                                        <span>Price: {review.priceRating}/5</span>
                                                                        <span>Delivery: {review.deliveryRating}/5</span>
                                        </div>
                                                                    <div className="text-center" style={{ fontSize: '11px', color: '#999' }}>
                                                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </div>
                                            </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                            );
                                        })}
                                </div>
                            </div>
                            ) : (
                                <div className="text-center py-5">
                                    <h5 className="text-muted mb-3">{t('pages.home.customerSection.noReviews', 'No reviews available')}</h5>
                                    <p className="text-muted">{t('pages.home.customerSection.noReviewsDescription', 'Be the first to review our products')}</p>
                            </div>
                            )}

                        </div>
                        <div className="col-lg-6 col-12">
                            <div className='main-img'>
                                <img className='max-100' src={CustomerImg}/>
                            </div>
                        </div>
                    </div>
                </div>
                    </section>
                
                </>
            )
        }
     
          
                </>
            )}

            {/* Service Modal */}
            {showServiceModal && (
                <div className="modal show d-block" 
                
                style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    zIndex: '1050',
                    display: 'block',
                    padding: '20px',
                    overflow: 'auto',
                    width: '100%',
                    height: '100%'
                }}
                
                >
                    <div className="modal-dialog modal-lg service-modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid #dee2e6',
                                padding: '1rem',
                                direction: i18n.language === 'ar' ? 'rtl' : 'ltr'
                            }}>
                                <h5 className="modal-title" style={{
                                    margin: '0',
                                    textAlign: i18n.language === 'ar' ? 'right' : 'left',
                                    fontWeight: '600',
                                    color: '#333',
                                    fontSize: '1.25rem',
                                    lineHeight: '1.4'
                                }}>
                                    {editingService ? t('pages.home.serviceManagement.editService', 'Edit Service') : t('pages.home.serviceManagement.addService', 'Add New Service')}
                                </h5>
                          
                            </div>
                            <form onSubmit={handleServiceSubmit}>
                                <div className="modal-body" style={{
                                    padding: '1.5rem',
                                    direction: i18n.language === 'ar' ? 'rtl' : 'ltr'
                                }}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label" style={{
                                                textAlign: i18n.language === 'ar' ? 'right' : 'left',
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '500',
                                                color: '#333',
                                                fontSize: '0.95rem'
                                            }}>
                                                {t('pages.home.serviceManagement.serviceNameEn', 'Service Name (English)')}
                                            </label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                value={serviceForm.nameEn}
                                                onChange={(e) => setServiceForm({...serviceForm, nameEn: e.target.value})}
                                                disabled={serviceFormLoading}
                                                required
                                                style={{textAlign: i18n.language === 'ar' ? 'right' : 'left'}}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label" style={{
                                                textAlign: i18n.language === 'ar' ? 'right' : 'left',
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '500',
                                                color: '#333',
                                                fontSize: '0.95rem'
                                            }}>
                                                {t('pages.home.serviceManagement.serviceNameAr', 'Service Name (Arabic)')}
                                            </label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                value={serviceForm.nameAr}
                                                onChange={(e) => setServiceForm({...serviceForm, nameAr: e.target.value})}
                                                disabled={serviceFormLoading}
                                                style={{textAlign: i18n.language === 'ar' ? 'right' : 'left'}}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label" style={{
                                                textAlign: i18n.language === 'ar' ? 'right' : 'left',
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '500',
                                                color: '#333',
                                                fontSize: '0.95rem'
                                            }}>
                                                {t('pages.home.serviceManagement.price', 'Price')}
                                            </label>
                                            <input 
                                                type="number" 
                                                className="form-control"
                                                value={serviceForm.price}
                                                onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                                                disabled={serviceFormLoading}
                                                required
                                                style={{textAlign: i18n.language === 'ar' ? 'right' : 'left'}}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label" style={{
                                                textAlign: i18n.language === 'ar' ? 'right' : 'left',
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '500',
                                                color: '#333',
                                                fontSize: '0.95rem'
                                            }}>
                                                {t('pages.home.serviceManagement.unit', 'Unit')}
                                            </label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                value={serviceForm.unit}
                                                onChange={(e) => setServiceForm({...serviceForm, unit: e.target.value})}
                                                placeholder={t('pages.home.serviceManagement.unitPlaceholder', 'e.g., Kg, Ltr, Hour')}
                                                disabled={serviceFormLoading}
                                                required
                                                style={{textAlign: i18n.language === 'ar' ? 'right' : 'left'}}
                                            />
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="form-label" style={{
                                                textAlign: i18n.language === 'ar' ? 'right' : 'left',
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '500',
                                                color: '#333',
                                                fontSize: '0.95rem'
                                            }}>
                                                {t('pages.home.serviceManagement.deliveryTime', 'Delivery Time')}
                                            </label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                value={serviceForm.deliveryTime}
                                                onChange={(e) => setServiceForm({...serviceForm, deliveryTime: e.target.value})}
                                                placeholder={t('pages.home.serviceManagement.deliveryTimePlaceholder', 'e.g., 3-5 business days')}
                                                disabled={serviceFormLoading}
                                                required
                                                style={{textAlign: i18n.language === 'ar' ? 'right' : 'left'}}
                                            />
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="form-label" style={{
                                                textAlign: i18n.language === 'ar' ? 'right' : 'left',
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '500',
                                                color: '#333',
                                                fontSize: '0.95rem'
                                            }}>
                                                {t('pages.home.serviceManagement.serviceImage', 'Service Image')}
                                            </label>
                                            {serviceForm.existingImage && (
                                                <div className="mb-2">
                                                    <small className="text-muted">{t('pages.home.serviceManagement.currentImage', 'Current Image')}:</small>
                                                    <div className="mt-1">
                                                        <img 
                                                            src={serviceForm.existingImage} 
                                                            alt={t('pages.home.serviceManagement.currentServiceImage', 'Current service image')} 
                                                            style={{maxWidth: '200px', maxHeight: '150px', objectFit: 'cover'}}
                                                            className="img-thumbnail"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                className={`form-control ${imageError ? 'is-invalid' : ''}`}
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    setServiceForm({...serviceForm, image: file});
                                                    validateImage(file);
                                                }}
                                                disabled={serviceFormLoading}
                                            />
                                            {imageError && (
                                                <div className="invalid-feedback d-block" style={{
                                                    color: '#dc3545',
                                                    fontSize: '0.875rem',
                                                    marginTop: '0.25rem',
                                                    textAlign: i18n.language === 'ar' ? 'right' : 'left'
                                                }}>
                                                    {imageError}
                                        </div>
                                            )}
                                            <small className="form-text text-muted" style={{
                                                textAlign: i18n.language === 'ar' ? 'right' : 'left', 
                                                display: 'block', 
                                                marginTop: '0.5rem',
                                                color: '#666',
                                                fontSize: '0.875rem'
                                            }}>
                                                {serviceForm.existingImage ? t('pages.home.serviceManagement.replaceImage', 'Select a new image to replace the current one, or leave empty to keep the current image.') : t('pages.home.serviceManagement.selectImage', 'Select an image for your service.')}
                                            </small>
                                    </div>
                                </div>
                                </div>
                                <div className="" style={{
                                    display: 'flex',
                                    justifyContent: i18n.language === 'ar' ? 'flex-start' : 'flex-end',
                                    gap: '0.75rem',
                                    padding: '1rem 1.5rem',
                                    borderTop: '1px solid #dee2e6',
                                    backgroundColor: '#f8f9fa',
                                    direction: i18n.language === 'ar' ? 'rtl' : 'ltr'
                                }}>
                                          <button 
                                        type="submit" 
                                        className="btn  pt-2 d-flex align-items-center justify-content-center" 
                                        disabled={serviceFormLoading}
                                        style={{
                                            minWidth: '120px',
                                            opacity: serviceFormLoading ? 0.6 : 1,
                                            backgroundColor: '#21395D',color: 'white',width:'100%'
                                        }}
                                    >
                                        {serviceFormLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                {t('common.saving', 'Saving...')}
                                            </>
                                        ) : (
                                            editingService ? t('pages.home.serviceManagement.updateService', 'Update Service') : t('pages.home.serviceManagement.addService', 'Add Service')
                                        )}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary pt-2 d-flex align-items-center justify-content-center" 
                                        disabled={serviceFormLoading}
                                        onClick={() => {
                                            setShowServiceModal(false);
                                            setEditingService(null);
                                            setServiceForm({
                                                name: '',
                                                nameEn: '',
                                                nameAr: '',
                                                price: '',
                                                unit: '',
                                                deliveryTime: '',
                                                image: null,
                                                existingImage: null
                                            });
                                            setImageError('');
                                        }}
                                        style={{
                                            minWidth: '100px',
                                            opacity: serviceFormLoading ? 0.6 : 1
                                        }}
                                    >
                                        {t('common.cancel', 'Cancel')}
                                    </button>
                              
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Simple Delete Confirmation Modal */}
            {showDeleteModal && serviceToDelete && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-body text-center py-4">
                                <h5 className="mb-3">{t('pages.home.serviceManagement.confirmDelete', 'Are you sure you want to delete this service?')}</h5>
                                <p className="text-muted mb-0">
                                    {serviceToDelete.nameEn || serviceToDelete.name || 'This service'} will be permanently deleted.
                                </p>
                            </div>
                            <div className="modal-footer justify-content-center">
                                <button 
                                    type="button" 
                                    className="btn btn-danger d-flex align-items-center justify-content-center" 
                                    onClick={confirmDeleteService}
                                    style={{width: '100%'}}
                                >
                                    {t('pages.home.serviceManagement.deleteService', 'Delete')}
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary d-flex align-items-center justify-content-center" 
                                    onClick={cancelDeleteService}
                                    style={{width: '100%'}}
                                >
                                    {t('common.cancel', 'Cancel')}
                                </button>
                             
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;