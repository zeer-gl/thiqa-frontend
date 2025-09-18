import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../css/pages/offers.scss';
import '../css/components/pagination.scss';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import ServiceProjectCard from '../components/ServiceProjectCard';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BaseUrl } from '../assets/BaseUrl';

const ProjectOffers = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState('all');
    const itemsPerPage = 8;

    const [expandedItems, setExpandedItems] = useState({});
    const [projectOffers, setProjectOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleAccordion = (itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    // Debug function to check authentication and data
    const debugAuthAndData = () => {
        console.log('=== DEBUG AUTHENTICATION AND DATA ===');
        console.log('User Role:', localStorage.getItem('userRole'));
        console.log('Customer Token:', localStorage.getItem('token'));
        console.log('Customer Data:', localStorage.getItem('userData'));
        console.log('Professional Token:', localStorage.getItem('token-sp'));
        console.log('Professional Data:', localStorage.getItem('spUserData'));
        
        const customerData = localStorage.getItem('userData');
        if (customerData) {
            try {
                const customer = JSON.parse(customerData);
                console.log('Parsed Customer ID:', customer._id);
                console.log('Customer Role:', customer.role);
                console.log('Customer Name:', customer.name);
                console.log('Customer Email:', customer.email);
            } catch (error) {
                console.error('Error parsing customer data:', error);
            }
        }
        
        console.log('Current Project Offers:', projectOffers);
        
        // Check if customer created the projects
        if (customerData && projectOffers.length > 0) {
            try {
                const customer = JSON.parse(customerData);
                console.log('=== PROJECT OWNERSHIP CHECK ===');
                projectOffers.forEach((project, index) => {
                    console.log(`Project ${index + 1}:`, {
                        projectId: project.id,
                        customerId: project.customerId,
                        currentCustomerId: customer._id,
                        isOwner: project.customerId === customer._id
                    });
                });
            } catch (error) {
                console.error('Error checking project ownership:', error);
            }
        }
    };

    // Check user role for authorization
    const userRole = localStorage.getItem('userRole');
    const isCustomer = userRole === 'customer' || userRole === 'user';

    // Fetch project offers from API
    const fetchProjectOffers = async (page = 1, limit = 8, search = '') => {
        try {
            setLoading(true);
            setError('');
            
            const token = localStorage.getItem('token');
            const customerId = JSON.parse(localStorage.getItem('userData'))?._id;
            
            if (!token || !customerId) {
                setError('Authentication required');
                return;
            }

            // Build URL with search parameter
            let apiUrl = `${BaseUrl}/customer/get-demand-quote/${customerId}?page=${page}&limit=${limit}`;
            if (search.trim()) {
                apiUrl += `&search=${encodeURIComponent(search.trim())}`;
            }
            
            console.log('API URL:', apiUrl);
            console.log('Search parameter:', search);
            console.log('Search parameter length:', search.length);

            const response = await axios.get(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.message === "Demand quotes retrieved successfully") {
                const data = response.data.data;
                const pagination = response.data.pagination;
                
                // Transform API data to match component structure
                const transformedOffers = data.map(offer => ({
                    id: offer._id,
                    title: offer.projectName || offer.address || t('project-offers.project-title'),
                    subtitle: offer.typeOfProject || t('project-offers.project-category'),
                    offers: offer.proposals?.length || 0,
                    status: offer.status,
                    area: offer.area,
                    price: offer.price,
                    description: offer.description,
                    dateOfRequest: offer.dateOfRequest,
                    projectDesign: offer.projectDesign,
                    proposals: (offer.proposals || []).map(proposal => {
                        console.log('=== PROPOSAL TRANSFORMATION DEBUG ===');
                        console.log('Original proposal:', proposal);
                        console.log('proposal.professionalId:', proposal.professionalId);
                        console.log('proposal.professional:', proposal.professional);
                        console.log('proposal.professional?._id:', proposal.professional?._id);
                        
                        // Extract professional ID properly
                        let professionalId = proposal.professionalId;
                        
                        // If professionalId is an object, extract the _id
                        if (typeof professionalId === 'object' && professionalId._id) {
                            professionalId = professionalId._id;
                        }
                        
                        // If no professionalId, try to get it from professional object
                        if (!professionalId && proposal.professional) {
                            professionalId = proposal.professional._id;
                        }
                        
                        console.log('Final professionalId:', professionalId);
                        console.log('ProfessionalId type:', typeof professionalId);
                        
                        return {
                            ...proposal,
                            professionalId: professionalId,
                            isAccepted: proposal.isAccepted || false
                        };
                    }),
                    isAccepted: offer.isAccepted,
                    address: offer.address,
                    customerId: offer.customerId
                }));

                console.log('API returned offers:', transformedOffers.length);
                console.log('Search query was:', search);
                console.log('Transformed offers:', transformedOffers);
                
                setProjectOffers(transformedOffers);
                setTotalPages(pagination.totalPages);
                setTotalCount(pagination.totalCount);
                setCurrentPage(pagination.currentPage);
            } else {
                setError('Failed to fetch project offers');
            }
        } catch (err) {
            console.error('Error fetching project offers:', err);
            setError(err.response?.data?.message || 'Failed to fetch project offers');
        } finally {
            setLoading(false);
        }
    };

    // Handle search with debouncing
    const handleSearch = (e) => {
        const query = e.target.value;
        console.log('Search query changed:', query);
        setSearchQuery(query);
        setCurrentPage(1); // Reset to first page when searching
    };

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            console.log('Fetching with search query:', searchQuery, 'page:', currentPage);
            fetchProjectOffers(currentPage, itemsPerPage, searchQuery);
        }, 500); // 500ms delay

        return () => clearTimeout(timeoutId);
    }, [searchQuery, currentPage]);

    // Fetch data on component mount
    useEffect(() => {
        fetchProjectOffers(currentPage, itemsPerPage, searchQuery);
        
        // Add debug function to window for console access
        window.debugProjectOffers = debugAuthAndData;
    }, []); // Only run on mount

    // Filter logic - apply both API and client-side filtering
    const filteredOffers = projectOffers.filter((offer) => {
        // Apply search filter (client-side fallback in case API doesn't filter properly)
        if (searchQuery.trim()) {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = 
                (offer.title && offer.title.toLowerCase().includes(searchLower)) ||
                (offer.subtitle && offer.subtitle.toLowerCase().includes(searchLower)) ||
                (offer.description && offer.description.toLowerCase().includes(searchLower)) ||
                (offer.address && offer.address.toLowerCase().includes(searchLower));
            
            if (!matchesSearch) return false;
        }
        
        // Apply category filter
        if (activeFilter === 'all') return true;
        return offer.subtitle === activeFilter;
    });
    
    console.log('Filtered offers for display:', filteredOffers.length);
    console.log('Search query:', searchQuery);
    console.log('Active filter:', activeFilter);
    console.log('Total project offers:', projectOffers.length);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // The useEffect will handle the API call with the new page and current search query
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <PageHeader 
                        title={t('project-offers.page-title')}
                        subtitle={t('project-offers.your-special-price-offers')}
                        createButtonText={t('project-offers.create-new-quote-request')}
                        searchPlaceholder={t('project-offers.search')}
                        onCreateClick={() => navigate('/request-quote/create')}
                        onSearchChange={handleSearch}
                        createType="quote"
                        searchValue={searchQuery}
                    />
                    
                    {/* Role Indicator */}
                    {!isCustomer && (
                        <div className="alert alert-warning mt-3" role="alert">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            <strong>Notice:</strong> You are logged in as a <strong>{userRole}</strong>. 
                            Only customers can accept proposals. 
                            <a href="/login" className="alert-link ms-2">Login as Customer</a>
                        </div>
                    )}
                </div>
            </div>

            {/* Project Offers List */}
            <div className="projects-section">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">{t('common.loading', 'Loading...')}</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-5">
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                        <button 
                            className="btn btn-primary mt-3" 
                            onClick={() => fetchProjectOffers(currentPage, itemsPerPage, searchQuery)}
                        >
                            {t('common.retry', 'Retry')}
                        </button>
                    </div>
                ) : filteredOffers.length === 0 ? (
                    <div className="text-center py-5">
                        <p className="text-muted">{t('project-offers.noOffers', 'No project offers found')}</p>
                    </div>
                ) : (
                    filteredOffers.map((project) => (
                    <ServiceProjectCard
                        key={project.id}
                        project={project}
                        offers={project.proposals}
                        isExpanded={expandedItems[project.id]}
                        onToggle={toggleAccordion}
                        onProposalAccepted={() => fetchProjectOffers(currentPage, itemsPerPage, searchQuery)}
                    />
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="row my-4">
                <div className="col-12">
                    <div className="pagination-section">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectOffers;
