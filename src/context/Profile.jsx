// context/Profile.jsx
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { BaseUrl } from "../assets/BaseUrl";
import { getProfessionalId, cleanAndValidateProfessionalId } from "../utils/professionalIdUtils";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const toggleRef = useRef();

  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isServiceProvider, setIsServiceProvider] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  // Function to check and update login status
  const checkLoginStatus = () => {
    try {
      const login = localStorage.getItem("isLoggedIn") === "true";
      const role = localStorage.getItem("userRole");
      setIsLoggedIn(login);
      setIsServiceProvider(role === "sp"); // Fixed: service provider role is 'sp', not 'user'
      
      console.log('🔍 Profile Context Debug:', {
        login,
        role,
        isServiceProvider: role === "sp",
        timestamp: new Date().toISOString()
      });
      
      return login;
    } catch (e) {
      console.error("Error reading auth state:", e);
      return false;
    }
  };

  const fetchUserProfile = async () => {
    // Prevent multiple simultaneous calls
    if (isFetchingProfile) {
      console.log('Profile fetch already in progress, skipping...');
      return;
    }
    
    try {
      setIsFetchingProfile(true);
      setLoadingProfile(true);
      setProfileError('');
      
      // Check if user is logged in first
      const loggedIn = checkLoginStatus();
      if (!loggedIn) {
        setUserProfile(null);
        return;
      }

      const role = localStorage.getItem("userRole");
      let userId = null;
      let apiUrl = '';
      let token = '';

      // Handle different user types
      if (role === 'sp') {
        // Service Provider - Get professional ID from spUserData first, then fallback to serviceProviderId
        try {
          const spUserData = localStorage.getItem('spUserData');
          if (spUserData) {
            const userData = JSON.parse(spUserData);
            userId = userData._id;
            console.log('Professional ID from localStorage spUserData:', userId);
          }
        } catch (error) {
          console.error('Error parsing spUserData:', error);
        }
        
        // Fallback to serviceProviderId if spUserData doesn't have _id
        if (!userId) {
          userId = localStorage.getItem('serviceProviderId');
          console.log('Using fallback serviceProviderId:', userId);
        }
        
        token = localStorage.getItem('token-sp');
        if (userId) {
          apiUrl = `${BaseUrl}/professional/get-professsional/${userId}`;
        }
      } else {
        // Regular Customer
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
        token = localStorage.getItem('token');
        if (userId) {
          apiUrl = `${BaseUrl}/customer/${userId}/getProfile`;
        }
      }

      if (!userId || !apiUrl) {
        console.warn('User not found in local storage or API URL not available');
        setUserProfile(null);
        return;
      }

      console.log(`Fetching profile for ${role === 'sp' ? 'Service Provider' : 'Customer'}:`, {
        userId,
        apiUrl,
        hasToken: !!token
      });

      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        }
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(`Profile API error (${res.status}):`, err);
        
        // Handle 404 specifically for service providers
        if (res.status === 404 && role === 'sp') {
          console.warn('Service provider not found in API, using localStorage data as fallback');
          // Try to use localStorage data as fallback
          const spUserData = localStorage.getItem('spUserData');
          if (spUserData) {
            try {
              const fallbackData = JSON.parse(spUserData);
              console.log('Using localStorage fallback data:', fallbackData);
              setUserProfile(fallbackData);
              return fallbackData;
            } catch (parseError) {
              console.error('Failed to parse localStorage spUserData:', parseError);
            }
          }
        }
        
        throw new Error(err?.message || `Failed to load profile (${res.status})`);
      }
      
      const data = await res.json();
      console.log('Profile API response:', data);
      
      // Handle different response structures based on role
      let profileData = {};
      if (role === 'sp') {
        // Service Provider API response handling
        if (data?.success && data?.data) {
          profileData = data.data;
        } else if (data?.professional) {
          profileData = data.professional;
        } else if (data?._id) {
          profileData = data;
        } else {
          console.warn('Unexpected service provider API response structure:', data);
          profileData = data || {};
        }
      } else {
        // Regular Customer API response handling
        if (data?.customer) {
          profileData = data.customer;
        } else if (data?._id) {
          profileData = data;
        } else {
          profileData = data || {};
        }
      }
      
      console.log('Processed profile data:', profileData);
      
      // Update the user profile state
      setUserProfile(profileData);
      return profileData;
    } catch (e) {
      setProfileError(e?.message || 'Unable to load profile');
      throw e;
    } finally {
      setLoadingProfile(false);
      setIsFetchingProfile(false);
    }
  };

  const updateUserProfile = (updatedData) => {
    setUserProfile(prev => ({ ...prev, ...updatedData }));
  };

  // Function to specifically fetch service provider profile
  const fetchServiceProviderProfile = async (professionalId) => {
    try {
      setLoadingProfile(true);
      setProfileError('');
      
      const token = localStorage.getItem('token-sp');
      if (!token) {
        throw new Error('Service provider token not found');
      }
      
      const apiUrl = `${BaseUrl}/professional/get-professsional/${professionalId}`;
      console.log('Fetching service provider profile:', { professionalId, apiUrl });
      
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(`Service Provider Profile API error (${res.status}):`, err);
        throw new Error(err?.message || `Failed to load service provider profile (${res.status})`);
      }
      
      const data = await res.json();
      console.log('Service Provider Profile API response:', data);
      
      // Handle service provider API response
      let profileData = {};
      if (data?.success && data?.data) {
        profileData = data.data;
      } else if (data?.professional) {
        profileData = data.professional;
      } else if (data?._id) {
        profileData = data;
      } else {
        profileData = data || {};
      }
      
      console.log('Processed service provider profile data:', profileData);
      
      // Update the user profile state
      setUserProfile(profileData);
      return profileData;
    } catch (e) {
      setProfileError(e?.message || 'Unable to load service provider profile');
      throw e;
    } finally {
      setLoadingProfile(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("token-sp");
    localStorage.removeItem("serviceProviderId");
    localStorage.removeItem("spUserData");
    localStorage.removeItem("registrationData");
    setIsLoggedIn(false);
    setIsServiceProvider(false);
    setUserProfile(null);
  };

  useEffect(() => {
    // Check login status on mount
    checkLoginStatus();
    
    // Set up an interval to check for login status changes
    const intervalId = setInterval(() => {
      checkLoginStatus();
    }, 1000); // Check every second

    // If logged in, fetch profile (but only if not already fetching)
    if (isLoggedIn && !userProfile && !isFetchingProfile) {
      fetchUserProfile();
    }

    return () => clearInterval(intervalId);
  }, [isLoggedIn]); // Removed i18n.language to prevent repeated API calls on language change

  // Separate useEffect for language changes - only updates UI, no API calls
  useEffect(() => {
    if (toggleRef.current) {
      toggleRef.current.checked = i18n.language === "ar";
    }
  }, [i18n.language]);

  // Function to refresh profile data (useful after profile updates)
  const refreshProfile = async () => {
    try {
      console.log('🔄 Refreshing profile data...');
      await fetchUserProfile();
      console.log('✅ Profile data refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh profile data:', error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userProfile,
        loadingProfile,
        profileError,
        isLoggedIn,
        isServiceProvider,
        fetchUserProfile,
        fetchServiceProviderProfile,
        updateUserProfile,
        refreshProfile,
        logout,
        checkLoginStatus
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};