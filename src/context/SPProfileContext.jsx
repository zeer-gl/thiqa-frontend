// context/SPProfileContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { BaseUrl } from "../assets/BaseUrl";

const SPProfileContext = createContext();

export const SPProfileProvider = ({ children }) => {
  const [spProfile, setSpProfile] = useState(null);
  const [loadingSpProfile, setLoadingSpProfile] = useState(false);
  const [spProfileError, setSpProfileError] = useState("");
  const [isFetchingSpProfile, setIsFetchingSpProfile] = useState(false);

  // Function to fetch SP profile data
  const fetchSPProfile = async () => {
    // Prevent multiple simultaneous calls
    if (isFetchingSpProfile) {
      console.log('SP Profile fetch already in progress, skipping...');
      return spProfile;
    }
    
    try {
      setIsFetchingSpProfile(true);
      setLoadingSpProfile(true);
      setSpProfileError('');
      
      // Check if user is logged in as SP
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const userRole = localStorage.getItem("userRole");
      
      if (!isLoggedIn || userRole !== "sp") {
        console.log('User not logged in as SP, clearing profile data');
        setSpProfile(null);
        return null;
      }

      // Get professional ID from spUserData first, then fallback to serviceProviderId
      let professionalId = null;
      try {
        const spUserData = localStorage.getItem('spUserData');
        if (spUserData) {
          const userData = JSON.parse(spUserData);
          professionalId = userData._id;
          console.log('Professional ID from localStorage spUserData:', professionalId);
        }
      } catch (error) {
        console.error('Error parsing spUserData:', error);
      }
      
      // Fallback to serviceProviderId if spUserData doesn't have _id
      if (!professionalId) {
        professionalId = localStorage.getItem('serviceProviderId');
        console.log('Using fallback serviceProviderId:', professionalId);
      }
      
      const token = localStorage.getItem('token-sp');
      
      if (!professionalId || !token) {
        console.warn('Professional ID or token not found');
        setSpProfile(null);
        return null;
      }

      const apiUrl = `${BaseUrl}/professional/get-professsional/${professionalId}`;
      
      console.log('Fetching SP profile:', {
        professionalId,
        apiUrl,
        hasToken: !!token
      });

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`SP Profile API error (${response.status}):`, errorData);
        
        // Handle 404 specifically - use localStorage data as fallback
        if (response.status === 404) {
          console.warn('SP not found in API, using localStorage data as fallback');
          const spUserData = localStorage.getItem('spUserData');
          if (spUserData) {
            try {
              const fallbackData = JSON.parse(spUserData);
              console.log('Using localStorage fallback data:', fallbackData);
              setSpProfile(fallbackData);
              return fallbackData;
            } catch (parseError) {
              console.error('Failed to parse localStorage spUserData:', parseError);
            }
          }
        }
        
        throw new Error(errorData?.message || `Failed to load SP profile (${response.status})`);
      }
      
      const data = await response.json();
      console.log('SP Profile API response:', data);
      
      // Handle different response structures
      let profileData = {};
      if (data?.professional) {
        // Handle the actual API response structure: { message: "...", professional: {...} }
        profileData = data.professional;
        console.log('✅ Using professional data from API response');
      } else if (data?.success && data?.data) {
        profileData = data.data;
        console.log('✅ Using data from success response');
      } else if (data?._id) {
        profileData = data;
        console.log('✅ Using direct profile data');
      } else {
        console.warn('Unexpected SP API response structure:', data);
        profileData = data || {};
      }
      
      console.log('Processed SP profile data:', profileData);
      
      // Update the SP profile state
      setSpProfile(profileData);
      console.log('✅ SP Profile updated in context:', {
        name: profileData.name,
        pic: profileData.pic,
        timestamp: new Date().toISOString()
      });
      return profileData;
    } catch (error) {
      console.error('Error fetching SP profile:', error);
      setSpProfileError(error?.message || 'Unable to load SP profile');
      throw error;
    } finally {
      setLoadingSpProfile(false);
      setIsFetchingSpProfile(false);
    }
  };

  // Function to update SP profile data locally (useful after profile updates)
  const updateSPProfile = (updatedData) => {
    setSpProfile(prev => ({ ...prev, ...updatedData }));
  };

  // Function to refresh SP profile data (useful after profile updates)
  const refreshSPProfile = async () => {
    try {
      console.log('🔄 Refreshing SP profile data...');
      const updatedProfile = await fetchSPProfile();
      console.log('✅ SP profile data refreshed successfully:', {
        name: updatedProfile?.name,
        pic: updatedProfile?.pic,
        timestamp: new Date().toISOString()
      });
      return updatedProfile;
    } catch (error) {
      console.error('❌ Failed to refresh SP profile data:', error);
      throw error;
    }
  };

  // Function to clear SP profile data (useful on logout)
  const clearSPProfile = () => {
    setSpProfile(null);
    setSpProfileError("");
  };

  // Auto-fetch profile when component mounts if user is logged in as SP
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userRole = localStorage.getItem("userRole");
    
    if (isLoggedIn && userRole === "sp" && !spProfile && !loadingSpProfile) {
      console.log('Auto-fetching SP profile on mount');
      fetchSPProfile().catch(error => {
        console.error('Failed to auto-fetch SP profile:', error);
      });
    }
  }, []);

  // Listen for localStorage changes to detect login/logout
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'isLoggedIn' || e.key === 'userRole') {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const userRole = localStorage.getItem("userRole");
        
        if (!isLoggedIn || userRole !== "sp") {
          console.log('User logged out or not SP, clearing profile');
          clearSPProfile();
        } else if (isLoggedIn && userRole === "sp" && !spProfile) {
          console.log('User logged in as SP, fetching profile');
          fetchSPProfile().catch(error => {
            console.error('Failed to fetch SP profile after login:', error);
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [spProfile]);

  return (
    <SPProfileContext.Provider
      value={{
        spProfile,
        loadingSpProfile,
        spProfileError,
        fetchSPProfile,
        updateSPProfile,
        refreshSPProfile,
        clearSPProfile
      }}
    >
      {children}
    </SPProfileContext.Provider>
  );
};

export const useSPProfile = () => {
  const context = useContext(SPProfileContext);
  if (!context) {
    console.warn('useSPProfile called outside of SPProfileProvider, returning fallback values');
    return {
      spProfile: null,
      loadingSpProfile: false,
      spProfileError: "",
      fetchSPProfile: () => Promise.resolve(null),
      updateSPProfile: () => {},
      refreshSPProfile: () => Promise.resolve(null),
      clearSPProfile: () => {}
    };
  }
  return context;
};
