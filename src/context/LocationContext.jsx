import React, { createContext, useContext, useState, useEffect } from 'react';
import { BaseUrl } from '../assets/BaseUrl.jsx';

const LocationContext = createContext();

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};

export const LocationProvider = ({ children }) => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [addresses, setAddresses] = useState([]);

    // Fetch user addresses
    const fetchAddresses = async () => {
        try {
            setLoadingLocation(true);
            setLocationError(null);
            
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('No token found for fetching addresses');
                return [];
            }

            const response = await fetch(`${BaseUrl}/customer/address/list`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch addresses: ${response.status}`);
            }

            const data = await response.json();
            if (data.success && data.data && Array.isArray(data.data.addresses)) {
                setAddresses(data.data.addresses);
                return data.data.addresses;
            } else {
                setAddresses([]);
                return [];
            }
        } catch (error) {
            setLocationError(error.message);
            console.error('Error fetching addresses:', error);
            return [];
        } finally {
            setLoadingLocation(false);
        }
    };

    // Get default address
    const fetchDefaultAddress = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('No token found for fetching default address');
                return null;
            }

            const response = await fetch(`${BaseUrl}/customer/address/default`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
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

    // Set current location from addresses
    const setLocationFromAddresses = (addressList) => {
        if (addressList && addressList.length > 0) {
            // First try to find default address
            const defaultAddress = addressList.find(addr => addr.is_default);
            const selectedAddress = defaultAddress || addressList[0];
            
            if (selectedAddress) {
                const locationText = `${selectedAddress.city}, ${selectedAddress.area}`;
                setCurrentLocation({
                    id: selectedAddress._id,
                    text: locationText,
                    fullAddress: `${selectedAddress.building}, ${selectedAddress.floor_apartment}, ${selectedAddress.street}, ${selectedAddress.block}, ${selectedAddress.area}, ${selectedAddress.city}`,
                    city: selectedAddress.city,
                    area: selectedAddress.area,
                    isDefault: selectedAddress.is_default || false
                });
                console.log('📍 Location set from addresses:', locationText);
            }
        } else {
            // No addresses found, set static location
            setCurrentLocation({
                id: 'static',
                text: 'Kuwait City, Kuwait',
                fullAddress: 'Kuwait City, Kuwait',
                city: 'Kuwait City',
                area: 'Kuwait',
                isDefault: false,
                isStatic: true
            });
            console.log('📍 No addresses found, using static location');
        }
    };

    // Initialize location on mount
    const initializeLocation = async () => {
        try {
            setLoadingLocation(true);
            
            // First try to get default address
            const defaultAddress = await fetchDefaultAddress();
            if (defaultAddress) {
                const locationText = `${defaultAddress.city}, ${defaultAddress.area}`;
                setCurrentLocation({
                    id: defaultAddress._id,
                    text: locationText,
                    fullAddress: `${defaultAddress.building}, ${defaultAddress.floor_apartment}, ${defaultAddress.street}, ${defaultAddress.block}, ${defaultAddress.area}, ${defaultAddress.city}`,
                    city: defaultAddress.city,
                    area: defaultAddress.area,
                    isDefault: true
                });
                console.log('📍 Default address found:', locationText);
            } else {
                // If no default address, fetch all addresses and use first one
                const addressList = await fetchAddresses();
                setLocationFromAddresses(addressList);
            }
        } catch (error) {
            console.error('Error initializing location:', error);
            // Fallback to static location
            setCurrentLocation({
                id: 'static',
                text: 'Kuwait City, Kuwait',
                fullAddress: 'Kuwait City, Kuwait',
                city: 'Kuwait City',
                area: 'Kuwait',
                isDefault: false,
                isStatic: true
            });
        } finally {
            setLoadingLocation(false);
        }
    };

    // Update location when addresses change
    const updateLocation = async () => {
        const addressList = await fetchAddresses();
        setLocationFromAddresses(addressList);
    };

    // Set specific location
    const setSpecificLocation = (address) => {
        if (address) {
            const locationText = `${address.city}, ${address.area}`;
            setCurrentLocation({
                id: address._id,
                text: locationText,
                fullAddress: `${address.building}, ${address.floor_apartment}, ${address.street}, ${address.block}, ${address.area}, ${address.city}`,
                city: address.city,
                area: address.area,
                isDefault: address.is_default || false
            });
            console.log('📍 Location updated to:', locationText);
        }
    };

    // Initialize location when component mounts
    useEffect(() => {
        // Only initialize for customers (not service providers)
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'sp') {
            initializeLocation();
        }
    }, []);

    const value = {
        currentLocation,
        loadingLocation,
        locationError,
        addresses,
        fetchAddresses,
        updateLocation,
        setSpecificLocation,
        initializeLocation
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};

export default LocationContext;
