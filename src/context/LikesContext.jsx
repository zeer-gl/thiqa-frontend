import React, { createContext, useContext, useState, useEffect } from 'react';
import { BaseUrl } from '../assets/BaseUrl';

const LikesContext = createContext();

export const useLikes = () => {
  const context = useContext(LikesContext);
  if (!context) {
    throw new Error('useLikes must be used within a LikesProvider');
  }
  return context;
};

export const LikesProvider = ({ children }) => {
  const [likedProfessionals, setLikedProfessionals] = useState({});
  const [likedProducts, setLikedProducts] = useState({});
  const [likedServices, setLikedServices] = useState({});

  // Fetch liked professionals on app load
  useEffect(() => {
    const fetchLikedProfessionals = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${BaseUrl}/customer/customer-liked-professionals`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            const likedStates = {};
            data.data.forEach(prof => {
              likedStates[prof._id] = true;
            });
            setLikedProfessionals(likedStates);
          }
        }
      } catch (error) {
        console.error('Error fetching liked professionals:', error);
      }
    };
    
    fetchLikedProfessionals();
  }, []);
  const fetchLikedProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${BaseUrl}/customer/customer-liked-products`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const likedStates = {};
          data.data.forEach(product => {
            likedStates[product._id] = true;
          });
          setLikedProducts(likedStates);
        }
      }
    } catch (error) {
      console.error('Error fetching liked products:', error);
    }
  };

  // Fetch liked products on app load
  useEffect(() => {
    fetchLikedProducts();
  }, []);

  // Fetch liked services on app load
  useEffect(() => {
    const fetchLikedServices = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${BaseUrl}/customer/customer-liked-professionals`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            const likedStates = {};
            data.data.forEach(service => {
              likedStates[service._id] = true;
            });
            setLikedServices(likedStates);
          }
        }
      } catch (error) {
        console.error('Error fetching liked services:', error);
      }
    };
    
    fetchLikedServices();
  }, []);

  const toggleProfessionalLike = async (professionalId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }

      const response = await fetch(`${BaseUrl}/customer/toggle-professional-like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          professionalId: professionalId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle professional like');
      }

      const data = await response.json();
      
      setLikedProfessionals(prev => ({
        ...prev,
        [professionalId]: data.isLiked
      }));

      return data.isLiked;
    } catch (error) {
      console.error('Error toggling professional like:', error);
      throw error;
    }
  };

  const toggleProductLike = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }

      const response = await fetch(`${BaseUrl}/customer/toggle-product-like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: productId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle product like');
      }

      const data = await response.json();
      
      setLikedProducts(prev => ({
        ...prev,
        [productId]: data.isLiked
      }));

      return data.isLiked;
    } catch (error) {
      console.error('Error toggling product like:', error);
      throw error;
    }
  };

  const toggleServiceLike = async (serviceId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }

      const response = await fetch(`${BaseUrl}/customer/toggle-professional-like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          professionalId: serviceId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle service like');
      }

      const data = await response.json();
      
      setLikedServices(prev => ({
        ...prev,
        [serviceId]: data.isLiked
      }));

      return data.isLiked;
    } catch (error) {
      console.error('Error toggling service like:', error);
      throw error;
    }
  };

  const value = {
    likedProfessionals,
    likedProducts,
    likedServices,
    toggleProfessionalLike,
    toggleProductLike,
    toggleServiceLike,
    toggleLike: toggleProfessionalLike, // Alias for backward compatibility
    fetchLikedProducts,
    setLikedProducts,
  };

  return (
    <LikesContext.Provider value={value}>
      {children}
    </LikesContext.Provider>
  );
};

export default LikesContext;