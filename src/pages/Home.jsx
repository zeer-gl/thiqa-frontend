import {useTranslation} from 'react-i18next';
import {useEffect, useState} from "react";
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
    const { isServiceProvider, userProfile } = useUser();
    
    // Service management state
    const [services, setServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(false);
    const [servicesError, setServicesError] = useState(null);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [serviceForm, setServiceForm] = useState({
        name: '',
        nameEn: '',
        nameAr: '',
        price: '',
        unit: '',
        deliveryTime: '',
        image: null
    });
    
    // Pagination states for professionals
    const [currentProfessionalsPage, setCurrentProfessionalsPage] = useState(1);
    const [totalProfessionalsPages, setTotalProfessionalsPages] = useState(1);
    const professionalsPerPage = 3;
    const [allProfessionals, setAllProfessionals] = useState([]); // Store all professionals
    
    // Filtering states
    const [currentFilter, setCurrentFilter] = useState(null); // 'interactive', 'nearby', or null
    const [isFilterActive, setIsFilterActive] = useState(false);
    const toggleHeart = () => {
        setLiked(!liked);
    };

    // Service management functions
    const fetchServices = async () => {
        try {
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
            
            const response = await fetch(`${BaseUrl}/professional/getAllServices/${professionalId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch services: ${response.status}`);
            }

            const data = await response.json();
            console.log('Services API Response:', data);
            
            if (data.success && Array.isArray(data.services)) {
                setServices(data.services);
            } else {
                setServices([]);
            }
        } catch (error) {
            setServicesError(error.message);
            console.error('Error fetching services:', error);
        } finally {
            setLoadingServices(false);
        }
    };

    const createService = async (serviceData) => {
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

            const formData = new FormData();
            formData.append('name', serviceData.name);
            formData.append('nameEn', serviceData.nameEn);
            formData.append('nameAr', serviceData.nameAr);
            formData.append('price', serviceData.price);
            formData.append('unit', serviceData.unit);
            formData.append('deliveryTime', serviceData.deliveryTime);
            
            if (serviceData.image) {
                formData.append('image', serviceData.image);
            }

            const response = await fetch(`${BaseUrl}/professional/add-service/${professionalId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Failed to create service: ${response.status}`);
            }

            const data = await response.json();
            console.log('Create Service API Response:', data);
            
            if (data.success) {
                // Refresh services list
                await fetchServices();
                return { success: true, data: data.service };
            } else {
                throw new Error(data.message || 'Failed to create service');
            }
        } catch (error) {
            console.error('Error creating service:', error);
            throw error;
        }
    };

    const updateService = async (serviceId, serviceData) => {
        try {
            const token = localStorage.getItem('token-sp');
            if (!token) {
                throw new Error('Please login again');
            }

            const formData = new FormData();
            formData.append('name', serviceData.name);
            formData.append('nameEn', serviceData.nameEn);
            formData.append('nameAr', serviceData.nameAr);
            formData.append('price', serviceData.price);
            formData.append('unit', serviceData.unit);
            formData.append('deliveryTime', serviceData.deliveryTime);
            
            if (serviceData.image) {
                formData.append('image', serviceData.image);
            }

            const response = await fetch(`${BaseUrl}/professional/update-service/${serviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Failed to update service: ${response.status}`);
            }

            const data = await response.json();
            console.log('Update Service API Response:', data);
            
            if (data.success) {
                // Refresh services list
                await fetchServices();
                return { success: true, data: data.service };
            } else {
                throw new Error(data.message || 'Failed to update service');
            }
        } catch (error) {
            console.error('Error updating service:', error);
            throw error;
        }
    };

    const deleteService = async (serviceId) => {
        try {
            const token = localStorage.getItem('token-sp');
            if (!token) {
                throw new Error('Please login again');
            }

            const response = await fetch(`${BaseUrl}/professional/delete-service/${serviceId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to delete service: ${response.status}`);
            }

            const data = await response.json();
            console.log('Delete Service API Response:', data);
            
            if (data.success) {
                // Refresh services list
                await fetchServices();
                return { success: true };
            } else {
                throw new Error(data.message || 'Failed to delete service');
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            throw error;
        }
    };

    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingService) {
                await updateService(editingService._id, serviceForm);
                alert('Service updated successfully!');
            } else {
                await createService(serviceForm);
                alert('Service created successfully!');
            }
            
            // Reset form and close modal
            setServiceForm({
                name: '',
                nameEn: '',
                nameAr: '',
                price: '',
                unit: '',
                deliveryTime: '',
                image: null
            });
            setEditingService(null);
            setShowServiceModal(false);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleEditService = (service) => {
        setEditingService(service);
        setServiceForm({
            name: service.name || '',
            nameEn: service.nameEn || '',
            nameAr: service.nameAr || '',
            price: service.price || '',
            unit: service.unit || '',
            deliveryTime: service.deliveryTime || '',
            image: null
        });
        setShowServiceModal(true);
    };

    const handleDeleteService = async (serviceId) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                await deleteService(serviceId);
                alert('Service deleted successfully!');
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
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

    // Fetch services for service providers with active subscription
    useEffect(() => {
        if (isServiceProvider && userProfile?.hasActiveSubscription) {
            fetchServices();
        }
    }, [isServiceProvider, userProfile?.hasActiveSubscription]);
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


     
    // Check if service provider has no active subscription
    const shouldShowUpgradeOnly = isServiceProvider && !userProfile?.hasActiveSubscription;

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
                                    <Link to={'/profile-sp?tab=packages'}>
                                        <button className='btn hero-btn'>
                                            {t('pages.home.heroSection.upgradePackage', 'Upgrade Package')}
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                // Show full content for customers and service providers with active subscription
                <>
                    {/* Service Management Section for Service Providers with Active Subscription */}
                    {isServiceProvider && userProfile?.hasActiveSubscription && (
                        <section className="service-management-section py-5" style={{backgroundColor: '#f8f9fa'}}>
                            <div className="container">
                                <div className="row">
                                    <div className="col-12">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h2 className="ar-heading-bold">{t('pages.home.serviceManagement.title', 'My Services')}</h2>
                                            <button 
                                                className="btn btn-primary"
                                                onClick={() => setShowServiceModal(true)}
                                            >
                                                <i className="fas fa-plus me-2"></i>
                                                {t('pages.home.serviceManagement.addService', 'Add Service')}
                                            </button>
                                        </div>
                                        
                                        {loadingServices ? (
                                            <div className="text-center py-5">
                                                <div className="spinner-border" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <p className="mt-3">Loading services...</p>
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
                                                                    <strong>Price:</strong> {service.price} {service.unit}
                                                                </div>
                                                                <div className="mb-3">
                                                                    <strong>Delivery:</strong> {service.deliveryTime}
                                                                </div>
                                                                <div className="mt-auto">
                                                                    <div className="btn-group w-100" role="group">
                                                                        <button 
                                                                            className="btn btn-outline-primary btn-sm"
                                                                            onClick={() => handleEditService(service)}
                                                                        >
                                                                            <i className="fas fa-edit me-1"></i>
                                                                            Edit
                                                                        </button>
                                                                        <button 
                                                                            className="btn btn-outline-danger btn-sm"
                                                                            onClick={() => handleDeleteService(service._id)}
                                                                        >
                                                                            <i className="fas fa-trash me-1"></i>
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-5">
                                                <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                                                <h5 className="text-muted">No services yet</h5>
                                                <p className="text-muted">Start by adding your first service</p>
                                                <button 
                                                    className="btn btn-primary"
                                                    onClick={() => setShowServiceModal(true)}
                                                >
                                                    <i className="fas fa-plus me-2"></i>
                                                    Add Your First Service
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

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
                                    // Show upgrade package button for service providers with no active subscription
                                    (!userProfile?.hasActiveSubscription && (
                                        <Link to={'/profile-sp?tab=packages'}>
                                            <button className='btn hero-btn'>
                                                {t('pages.home.heroSection.upgradePackage', 'Upgrade Package')}
                                            </button>
                                        </Link>
                                    ))
                                ) : (
                                    // Show regular button for customers
                                    <Link to={'/products'}>
                                        <button className='btn hero-btn'>
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
                                    <button
                                        className={`nav-link ${activeCategoryId === cat._id ? 'active' : ''}`}
                                        id={`pills-${cat._id}-tab`}
                                        data-bs-toggle="pill"
                                        data-bs-target={`#pills-${cat._id}`}
                                        type="button"
                                        role="tab"
                                        aria-controls={`pills-${cat._id}`}
                                        aria-selected={activeCategoryId === cat._id}
                                        onClick={() => setActiveCategoryId(cat._id)}
                                    >
                                        {(i18n.language === 'ar' ? cat?.name?.ar : cat?.name?.en) || ''}
                                    </button>
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
          <h2 className='ar-heading-bold'>
            {t('pages.home.servicesSection.title')}
          </h2>
          <div className='d-flex align-items-center gap-2 services-buttons-container'>
            <div className="d-flex align-items-center gap-2 main-buttons-group">
              <Link to={'service-list'}>
                <button className='btn nearby-btn'>
                  {t('pages.home.servicesSection.buttons.seeAll', 'See All')}
                </button>
              </Link>
       
              <button 
                className={`btn mi-btn ${isFilterActive && currentFilter === 'interactive' ? 'active' : ''}`}
                onClick={handleMostInteractiveClick}
              >
                <img src={MIP} alt="Most Interactive Professionals"/>{t('pages.home.servicesSection.buttons.mostInteractive')}
              </button>
              <button 
                className={`btn nearby-btn ${isFilterActive && currentFilter === 'nearby' ? 'active' : ''}`}
                onClick={handleNearbyClick}
              >
                <img src={NearbyIcon} alt="Nearby Professionals"/>{t('pages.home.servicesSection.buttons.nearby')}
              </button>
            </div>
            
            {/* Pagination Arrows for Professionals - Side by Side */}
            {totalProfessionalsPages > 1 && (
              <div className="d-flex align-items-center gap-2 ms-3 pagination-buttons-group">
                <button
                  className="btn pagination-arrow-btn"
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
                  className="btn pagination-arrow-btn"
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
              className="btn btn-outline-secondary btn-sm"
              onClick={clearAllFilters}
            >
              <i className="fas fa-times me-1"></i>
              Clear Filters
            </button>
          </div>
        )}
      </div>
      
      <div className="container">

        <div className="row g-3">
            
          {professionals.map(professional => (
        <div
        key={professional._id}
        className="col-lg-4 col-md-6"
        style={{ cursor: "pointer" }}
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
                
                <div className='d-flex align-items-center justify-content-between py-3'>
                  <div className='d-flex align-items-center gap-3'>
                    <img src={BallPattern} alt="" width="40" height="40"/>
                    <div className='d-flex align-items-start gap-3'>
                      <div>
                      <h6 className="fs-14 ar-heading-bold">
  {professional.name
    ?.split(" ")
    .slice(0, 2)                // take first 2 words
    .join(" ") + 
    (professional.name?.split(" ").length > 2 ? " ..." : "")}
</h6>
                        <p className='fs-12'>{professional.bio || t('pages.home.servicesSection.serviceProvider.description')}</p>
                      </div>
                      <div className="ratings d-flex align-items-center gap-1">
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
  <span style={{ marginLeft: 4, fontWeight: "bold", color: "#000" }}>
    {professional.averageRating?.toFixed(1) || "0.0"}
  </span>
</div>
                    </div>
                  </div>
                  
                  <div className='d-flex align-items-end flex-column gap-3'>
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
    }}
  />
                    <button className='btn outlined-btn fs-12'>
                      {professional.specialization || t('pages.home.servicesSection.serviceProvider.category')}
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
            <section className='customer-section'>
                <div className="container">
                    <div className="row g-5">
                        <div className="col-lg-6 col-12 position-relative">
                            <h5 className='mb-3 ar-heading-bold'>{t('pages.home.customerSection.subtitle')}</h5>
                            <h1 className='mb-3 ar-heading-bold'>
                                {t('pages.home.customerSection.title')}
                            </h1>
                            <div id="carouselExampleIndicators" className="carousel position-static slide">
                                <div className="carousel-indicators mb-0">
                                    <button type="button" data-bs-target="#carouselExampleIndicators"
                                            data-bs-slide-to="0" className="active" aria-current="true"
                                            aria-label="Slide 1"></button>
                                    <button type="button" data-bs-target="#carouselExampleIndicators"
                                            data-bs-slide-to="1" aria-label="Slide 2"></button>
                                    <button type="button" data-bs-target="#carouselExampleIndicators"
                                            data-bs-slide-to="2" aria-label="Slide 3"></button>
                                </div>
                                <div className="carousel-inner">
                                    <div className="carousel-item active">
                                        <div className='customer-content'>
                                            <p>
                                                {t('pages.home.customerSection.testimonial.text')}
                                            </p>
                                            <div className='quote'>
                                                <img src={QuoteImg} alt=""/>
                                            </div>
                                            <div className='customer-profile'>
                                                <img src={CustomerImg2} alt=""/>
                                                <div>
                                                    <h5 className='fw-semibold ar-heading-bold'>
                                                        {t('pages.home.customerSection.testimonial.customerName')}
                                                    </h5>
                                                    <h5 className='ar-heading-bold'>
                                                        {t('pages.home.customerSection.testimonial.customerType')}
                                                    </h5>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="carousel-item">
                                        <div className='customer-content'>
                                            <p>
                                                {t('pages.home.customerSection.testimonial.text')}
                                            </p>
                                            <div className='quote'>
                                                <img src={QuoteImg} alt=""/>
                                            </div>
                                            <div className='customer-profile'>
                                                <img src={CustomerImg2} alt=""/>
                                                <div>
                                                    <h5 className='fw-semibold ar-heading-bold'>
                                                        {t('pages.home.customerSection.testimonial.customerName')}
                                                    </h5>
                                                    <h5 className='ar-heading-bold'>
                                                        {t('pages.home.customerSection.testimonial.customerType')}
                                                    </h5>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="carousel-item">
                                        <div className='customer-content'>
                                            <p>
                                                {t('pages.home.customerSection.testimonial.text')}
                                            </p>
                                            <div className='quote'>
                                                <img src={QuoteImg} alt=""/>
                                            </div>

                                            <div className='customer-profile'>
                                                <img src={CustomerImg2} alt=""/>
                                                <div>
                                                    <h5 className='fw-semibold ar-heading-bold'>
                                                        {t('pages.home.customerSection.testimonial.customerName')}
                                                    </h5>
                                                    <h5 className='ar-heading-bold'>
                                                        {t('pages.home.customerSection.testimonial.customerType')}
                                                    </h5>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
            )}

            {/* Service Modal */}
            {showServiceModal && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingService ? 'Edit Service' : 'Add New Service'}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
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
                                            image: null
                                        });
                                    }}
                                ></button>
                            </div>
                            <form onSubmit={handleServiceSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Service Name (English)</label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                value={serviceForm.nameEn}
                                                onChange={(e) => setServiceForm({...serviceForm, nameEn: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Service Name (Arabic)</label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                value={serviceForm.nameAr}
                                                onChange={(e) => setServiceForm({...serviceForm, nameAr: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Price</label>
                                            <input 
                                                type="number" 
                                                className="form-control"
                                                value={serviceForm.price}
                                                onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Unit</label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                value={serviceForm.unit}
                                                onChange={(e) => setServiceForm({...serviceForm, unit: e.target.value})}
                                                placeholder="e.g., Kg, Ltr, Hour"
                                                required
                                            />
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="form-label">Delivery Time</label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                value={serviceForm.deliveryTime}
                                                onChange={(e) => setServiceForm({...serviceForm, deliveryTime: e.target.value})}
                                                placeholder="e.g., 3-5 business days"
                                                required
                                            />
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="form-label">Service Image</label>
                                            <input 
                                                type="file" 
                                                className="form-control"
                                                accept="image/*"
                                                onChange={(e) => setServiceForm({...serviceForm, image: e.target.files[0]})}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
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
                                                image: null
                                            });
                                        }}
                                    >
                                        {t('common.cancel', 'Cancel')}
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingService ? 'Update Service' : 'Add Service'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;