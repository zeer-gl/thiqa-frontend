import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import '../css/pages/service-list.scss';
import '../css/components/page-header.scss';
import '../css/components/pagination.scss';
import { Link } from 'react-router-dom';
import Avatar from "@mui/material/Avatar";
import { BaseUrl } from '../assets/BaseUrl.jsx';
import { useLikes } from '../context/LikesContext.jsx';

const ServiceList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const itemsPerPage = 9;

    // Providers from API
    const [serviceProviders, setServiceProviders] = useState([]);
    const [allServiceProviders, setAllServiceProviders] = useState([]); // Store all professionals for filtering
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [likedStates, setLikedStates] = useState({});
    const { likedProfessionals, toggleProfessionalLike } = useLikes();
    const [serviceCategories, setServiceCategories] = useState([]);
    const [categoryCurrentPage, setCategoryCurrentPage] = useState(1); // For categories
    const [categoryTotalPages, setCategoryTotalPages] = useState(1); // For categories
    const categoryItemsPerPage = 10; // For categories

  const fetchCategories = async (page = 1) => {
    try {
      const res = await fetch(
        `${BaseUrl}/admin/getAll-professional-categories?page=${page}&limit=${categoryItemsPerPage}`
      );
      if (!res.ok) {
        throw new Error(`Failed to load categories (${res.status})`);
      }
      const { data, pagination } = await res.json();

      const categories = data.map((category) => ({
        id: category._id,
        name: category.name,
        icon: 'fas fa-th',
      }));

      const updatedCategories =
        page === 1
          ? [{ id: 'all', name: t('service-list.all-services'), icon: 'fas fa-th' }, ...categories]
          : categories;

      setServiceCategories(updatedCategories);
      setCategoryCurrentPage(pagination.currentPage);
      setCategoryTotalPages(pagination.totalPages);
    } catch (e) {
      console.error('Error loading categories:', e);
      setServiceCategories([
        { id: 'all', name: t('service-list.all-services'), icon: 'fas fa-th' },
        { id: 'building', name: t('service-list.building'), icon: 'fas fa-hammer' },
        { id: 'design', name: t('service-list.design'), icon: 'fas fa-palette' },
        { id: 'electrical', name: t('service-list.electrical'), icon: 'fas fa-bolt' },
        { id: 'plumbing', name: t('service-list.plumbing'), icon: 'fas fa-faucet' },
        { id: 'carpentry', name: t('service-list.carpentry'), icon: 'fas fa-tools' },
        { id: 'painting', name: t('service-list.painting'), icon: 'fas fa-paint-brush' },
      ]);
      setCategoryTotalPages(1);
    }
  };

  // Fetch all professionals for search and filtering
  const fetchAllProfessionals = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all professionals with a high limit to get all data
      const res = await fetch(`${BaseUrl}/professional/get-all-professsional?page=1&limit=1000`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `Failed to load professionals (${res.status})`);
      }
      const data = await res.json();
      
      const list = Array.isArray(data?.data) ? data.data : [];
      
      // Map all professionals
      const mapped = list.map((p, idx) => ({
        id: p._id || idx,
        name: p.name || t('service-list.company-1-name'),
        service: p.workTitle || (p.specializations && p.specializations[0]?.name) || t('service-list.company-1-service'),
        category: p.specializations && p.specializations[0] ? p.specializations[0].name : t('service-list.building'),
        categoryId: p.specializations && p.specializations[0] ? p.specializations[0]._id : null,
        specializations: p.specializations || [], // Store all specializations
        rating: typeof p.averageRating === 'number' ? p.averageRating : 0,
        image: p.image || p.pic,
        isFavorite: !!p.isLiked
      }));
      console.log('mapped', mapped)
      
      setAllServiceProviders(mapped);
      setServiceProviders(mapped);
      setTotalPages(Math.ceil(mapped.length / itemsPerPage));
    } catch (e) {
      setError(e?.message || 'Unable to load professionals');
      setAllServiceProviders([]);
      setServiceProviders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Search professionals from backend API
  const searchProfessionals = async (searchQuery) => {
    try {
      console.log('Starting API search for:', searchQuery); // Debug log
      setLoading(true);
      setError('');
      
      // Call backend API with search parameter
      const apiUrl = `${BaseUrl}/professional/get-all-professsional?search=${encodeURIComponent(searchQuery)}&page=1&limit=1000`;
      console.log('Calling API:', apiUrl); // Debug log
      
      const res = await fetch(apiUrl);
      console.log('API response status:', res.status); // Debug log
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `Failed to search professionals (${res.status})`);
      }
      const data = await res.json();
      console.log('API response data:', data); // Debug log
      
      const list = Array.isArray(data?.data) ? data.data : [];
      
      // Map search results
      const mapped = list.map((p, idx) => ({
        id: p._id || idx,
        name: p.name || t('service-list.company-1-name'),
        service: p.workTitle || (p.specializations && p.specializations[0]?.name) || t('service-list.company-1-service'),
        category: p.specializations && p.specializations[0] ? p.specializations[0].name : t('service-list.building'),
        categoryId: p.specializations && p.specializations[0] ? p.specializations[0]._id : null,
        specializations: p.specializations || [], // Store all specializations
        rating: typeof p.averageRating === 'number' ? p.averageRating : 0,
        image: p.image || p.pic,
        isFavorite: !!p.isLiked
      }));
      
      console.log('Mapped search results:', mapped); // Debug log
      setServiceProviders(mapped);
      setTotalPages(Math.ceil(mapped.length / itemsPerPage));
      setCurrentPage(1); // Reset to first page when searching
    } catch (e) {
      console.error('Search API error:', e); // Debug log
      setError(e?.message || 'Unable to search professionals');
      setServiceProviders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Apply search filtering only (category filtering is handled by API)
  const applyFilters = () => {
    let filtered = [...allServiceProviders];
    
    // Apply search filter only
    if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(provider => 
        provider.name.toLowerCase().includes(query) ||
        provider.service.toLowerCase().includes(query) ||
        provider.category.toLowerCase().includes(query)
      );
    }
    
    console.log('Search filtered results:', filtered.length, 'providers');
    setServiceProviders(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle search change with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    console.log('Search value received:', value); // Debug log
    setSearchQuery(value);
    
    // Clear previous timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    // If search query is empty, show all professionals immediately
    if (!value || !value.trim()) {
      console.log('Empty search, showing all professionals'); // Debug log
      setServiceProviders(allServiceProviders);
      setTotalPages(Math.ceil(allServiceProviders.length / itemsPerPage));
      setCurrentPage(1);
      return;
    }
    
    // Set new timeout for API call (500ms delay)
    window.searchTimeout = setTimeout(() => {
      console.log('Calling backend API with search:', value.trim()); // Debug log
      searchProfessionals(value.trim());
    }, 500);
  };

  // Fetch professionals by category using API
  const fetchProfessionalsByCategory = async (categoryId) => {
    try {
      console.log('Fetching professionals for category ID:', categoryId);
      setLoading(true);
      setError('');
      
      // Call backend API with specialization parameter
      const apiUrl = `${BaseUrl}/professional/get-all-professsional?specialization=${encodeURIComponent(categoryId)}&page=1&limit=1000`;
      console.log('Category API URL:', apiUrl);
      
      const res = await fetch(apiUrl);
      console.log('Category API response status:', res.status);
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `Failed to fetch professionals by category (${res.status})`);
      }
      const data = await res.json();
      console.log('Category API response data:', data);
      console.log('Total professionals returned:', data?.data?.length);
      
      const list = Array.isArray(data?.data) ? data.data : [];
      
      // Map category results
      const mapped = list.map((p, idx) => ({
        id: p._id || idx,
        name: p.name || t('service-list.company-1-name'),
        service: p.workTitle || (p.specializations && p.specializations[0]?.name) || t('service-list.company-1-service'),
        category: p.specializations && p.specializations[0] ? p.specializations[0].name : t('service-list.building'),
        categoryId: p.specializations && p.specializations[0] ? p.specializations[0]._id : null,
        specializations: p.specializations || [], // Store all specializations
        rating: typeof p.averageRating === 'number' ? p.averageRating : 0,
        image: p.image || p.pic,
        isFavorite: !!p.isLiked
      }));
      
      // If API returned all professionals (not filtered), apply client-side filtering
      if (mapped.length === allServiceProviders.length) {
        console.log('API returned all professionals, applying client-side filtering for category:', categoryId);
        const filtered = allServiceProviders.filter(provider => {
          const hasSpecialization = provider.specializations.some(spec => spec._id === categoryId);
          console.log(`Provider ${provider.name} has specialization ${categoryId}:`, hasSpecialization);
          return hasSpecialization;
        });
        console.log('Client-side filtered results:', filtered.length, 'providers');
        setServiceProviders(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
      } else {
        console.log('API returned filtered results:', mapped.length, 'providers');
        setServiceProviders(mapped);
        setTotalPages(Math.ceil(mapped.length / itemsPerPage));
      }
      
      setCurrentPage(1); // Reset to first page when filtering
    } catch (e) {
      console.error('Category API error:', e);
      // Fallback to client-side filtering if API fails
      console.log('API failed, using client-side filtering for category:', categoryId);
      const filtered = allServiceProviders.filter(provider => {
        const hasSpecialization = provider.specializations.some(spec => spec._id === categoryId);
        return hasSpecialization;
      });
      console.log('Fallback filtered results:', filtered.length, 'providers');
      setServiceProviders(filtered);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  // Handle category filter change
  const handleFilterChange = (filterId) => {
    console.log('Category filter changed to:', filterId);
    setActiveFilter(filterId);
    
    // If a specific category is selected, fetch from API
    if (filterId !== 'all') {
      const selectedCategory = serviceCategories.find(cat => cat.id === filterId);
      if (selectedCategory) {
        console.log('Fetching professionals for category:', selectedCategory.name, 'ID:', selectedCategory.id);
        fetchProfessionalsByCategory(selectedCategory.id);
      }
    } else {
      // If 'all' is selected, show all professionals
      console.log('Showing all professionals');
      setServiceProviders(allServiceProviders);
      setTotalPages(Math.ceil(allServiceProviders.length / itemsPerPage));
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    fetchCategories(categoryCurrentPage);
  }, [categoryCurrentPage]);

  useEffect(() => {
    fetchAllProfessionals();
    
    // Add debug function to window for testing
    window.debugCategoryFiltering = () => {
      console.log('=== Category Filtering Debug ===');
      console.log('All Service Providers:', allServiceProviders.length);
      console.log('Service Categories:', serviceCategories);
      console.log('Current Active Filter:', activeFilter);
      
      // Test filtering for each category
      serviceCategories.forEach(category => {
        if (category.id !== 'all') {
          const filtered = allServiceProviders.filter(provider => {
            return provider.specializations.some(spec => spec._id === category.id);
          });
          console.log(`Category "${category.name}" (${category.id}): ${filtered.length} providers`);
          console.log('Providers:', filtered.map(p => p.name));
        }
      });
    };
  }, []);

  // Apply filters whenever search query changes (category filtering is handled in handleFilterChange)
  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      applyFilters();
    } else if (activeFilter === 'all') {
      // If no search and 'all' is selected, show all professionals
      setServiceProviders(allServiceProviders);
      setTotalPages(Math.ceil(allServiceProviders.length / itemsPerPage));
      setCurrentPage(1);
    }
  }, [searchQuery, allServiceProviders]);

  const handleCategoryPageChange = (page) => {
    setCategoryCurrentPage(page);
  };

  // Pagination settings from filtered results
    const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProviders = serviceProviders.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleCreateServiceClick = () => {
    navigate('/service-request');
  };

  const toggleFavorite = async (providerId, e) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      await toggleProfessionalLike(providerId);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Helper function to render star rating
  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;
    
    // Render full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <i key={i} className="fas fa-star" style={{ color: '#fbbf24' }}></i>
      );
    }
    
    // Render half star if needed
    if (hasHalfStar) {
      stars.push(
        <i key="half" className="fas fa-star-half-alt" style={{ color: '#fbbf24' }}></i>
      );
    }
    
    // Render empty stars
    const emptyStars = 5 - Math.ceil(rating || 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <i key={`empty-${i}`} className="far fa-star" style={{ color: '#d1d5db' }}></i>
      );
    }
    
    return stars;
  };

    return (
        <div className="service-list-page">
            <PageHeader 
                title={t("service-list.service-providers")}
                subtitle={t("service-list.find-the-best-service-providers")}
                createButtonText={t("service-list.request-service")}
                searchPlaceholder={t("service-list.search-placeholder")}
                onCreateClick={handleCreateServiceClick}
                onSearchChange={handleSearchChange}
                searchValue={searchQuery}
                createType="service"   
            />

            <div className="main-content">
                <div className="container">
                    <div className="row">
                        {/* Sidebar - Service Categories */}
                        <div className="col-lg-2">
                            <div className="sidebar-section">
                                <h3 className="sidebar-title fw-bold">{t("service-list.all-services")}</h3>

                                <div className="service-categories">
                                    {serviceCategories.map((category) => (
                                        <div 
                                            key={category.id} 
                                            className={`category-item ${activeFilter === category.id ? 'active' : ''}`}
                                            onClick={() => handleFilterChange(category.id)}
                                        >
                                            <i className={category.icon}></i>
                                            <span>{category.name}</span>
                                        </div>
                                    ))}
                                </div>
                
                <Pagination
                  currentPage={categoryCurrentPage}
                  totalPages={categoryTotalPages}
                  onPageChange={handleCategoryPageChange}
                  hideNavigation={false}
                  showArrows={true}
                  className="sidebar-pagination"
                />

                                <div className="decorative-elements">
                                    <div className="circle"></div>
                                    <div className="rings"></div>
                                    <div className="partial-circle"></div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content - Service Providers Grid */}
                        <div className="col-lg-10">
                            <div className="service-providers-section">
                {/* Search Results Info */}
                {searchQuery && searchQuery.trim() && (
                  <div className="search-results-info mb-3">
                    <p className="text-muted">
                      Search results for "{searchQuery}" - {serviceProviders.length} professionals found
                    </p>
                  </div>
                )}

                {/* Category Filter Info */}
                {activeFilter !== 'all' && (
                  <div className="category-filter-info mb-3">
                    <p className="text-muted">
                      Filtered by: {serviceCategories.find(cat => cat.id === activeFilter)?.name} - {serviceProviders.length} professionals found
                    </p>
                  </div>
                )}

                                <div className="providers-grid">
                  {loading ? (
                    <div className="text-center">
                      <p>Loading professionals...</p>
                    </div>
                  ) : currentProviders.length === 0 ? (
                    <div className='text-center'>
                      <h6 style={{textAlign:"center",margin:"auto",textWrap:"nowrap"}}>
                        {searchQuery && searchQuery.trim() 
                          ? `No professionals found for "${searchQuery}"` 
                          : activeFilter !== 'all'
                          ? `No professionals found in ${serviceCategories.find(cat => cat.id === activeFilter)?.name} category`
                          : 'No providers found'}
                      </h6>
                    </div>
                  ) : (
                    currentProviders.map((provider) => (
                                        <Link 
                                            key={provider.id} 
                                            to={`/service/${provider.id}`}
                                            className="provider-card-link"
                                        >
                                            <div className="provider-card">
                                                {/* Card Image Section */}
                                                <div className="card-image-section">
                            {provider.image ? (
                              <img
                                src={provider.image}
                                alt={provider.name}
                                className="provider-image"
                              />
                            ) : (
                              <Avatar
                                alt={provider.name || "Provider"}
                                className="provider-image"
                                sx={{ width: "100%", height: "100%" }}
                              >
                                {provider.name?.[0]?.toUpperCase() || "P"}
                              </Avatar>
                            )}
                                                    <button
                              className={`favorite-btn ${likedProfessionals[provider.id] ? 'active' : ''}`}
                              onClick={(e) => toggleFavorite(provider.id, e)}
                            >
                              <i className={likedProfessionals[provider.id] ? 'fas fa-heart' : 'far fa-heart'}></i>
                                                    </button>
                                                </div>

                                                {/* Card Info Section */}
                                                <div className="card-info-section d-flex align-items-center justify-content-between">
                                                    <div className="company-info d-flex align-items-center justify-conten-between">
                                                        <img src="/src/assets/payment/servicelist-card-img.svg" alt="" />
                                                        <div className='company-info-text ms-2'>
                                                            <div className='d-flex align-items-center justify-content-between'>
                                                                <h3 className="company-name fw-bold">{provider.name}</h3>
                                                                <div className="rating-section">
                                                                    <div className="stars">
                                                                        {renderStarRating(provider.rating)}
                                                                    </div>
                  
                                                                </div>
                                                            </div>
                                                            <p className="company-slogan">{provider.service}</p>
                                                        </div>
                                                    </div>

                                                    <div className="category-button-section">
                                                        <button className="category-btn">
                                                            {provider.category}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                    ))
                  )}
                                </div>

                {/* Pagination - Only show if there are multiple pages */}
                {totalPages > 1 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                    hideNavigation={false}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceList;
