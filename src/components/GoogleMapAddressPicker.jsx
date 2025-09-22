import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { useTranslation } from 'react-i18next';

const GoogleMapAddressPicker = ({ onLocationSelect, initialLocation = null, height = '300px' }) => {
  const { t } = useTranslation();
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef(null);

  // Default center (Kuwait City)
  const defaultCenter = { lat: 29.3759, lng: 47.9774 };
  const defaultZoom = 12;

  // Helper function to create markers (works with or without Advanced Markers)
  const createMarker = (position, map, title, draggable = true) => {
    try {
      // Try to use Advanced Marker Element first
      if (window.google && window.google.maps && window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
        console.log('Creating Advanced Marker Element');
        return new window.google.maps.marker.AdvancedMarkerElement({
          position,
          map,
          title,
          gmpDraggable: draggable
        });
      } else {
        // Fallback to regular Marker
        console.log('Creating regular Marker (Advanced Markers not available)');
        return new window.google.maps.Marker({
          position,
          map,
          title,
          draggable
        });
      }
    } catch (error) {
      console.warn('Error creating Advanced Marker, falling back to regular Marker:', error);
      // Fallback to regular Marker
      return new window.google.maps.Marker({
        position,
        map,
        title,
        draggable
      });
    }
  };

  const render = (status) => {
    // Debug: Log Google Maps status (reduced logging - only on failure)
    if (status === Status.FAILURE) {
      console.log('=== GOOGLE MAPS STATUS DEBUG ===');
    console.log('Google Maps Status:', status);
    console.log('API Key available:', !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
      console.log('API Key length:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.length || 0);
      console.log('API Key starts with:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.substring(0, 10) || 'N/A');
      console.log('Map ID available:', !!import.meta.env.VITE_GOOGLE_MAPS_MAP_ID);
      console.log('Current URL:', window.location.href);
      console.log('User Agent:', navigator.userAgent);
    }
    
    switch (status) {
      case Status.LOADING:
        return (
          <div className="map-loading" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">{t('common.loading')}</span>
            </div>
            <p className="mt-2 text-muted">Loading Google Maps...</p>
            <small className="text-muted">This may take a few moments</small>
          </div>
        );
      case Status.FAILURE:
        return (
          <div className="map-error" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '20px' }}>
            <i className="fas fa-exclamation-triangle text-danger mb-3" style={{ fontSize: '3rem' }}></i>
            <h5 className="text-danger mb-3">Google Maps Failed to Load</h5>
            <div className="text-start" style={{ maxWidth: '400px' }}>
              <p className="text-muted mb-2">This error usually occurs due to:</p>
              <ul className="text-muted small">
                <li>Invalid or missing API key</li>
                <li>API key not enabled for required services</li>
                <li>Billing not set up in Google Cloud Console</li>
                <li>Domain restrictions on the API key</li>
                <li>API quotas exceeded</li>
              </ul>
            </div>
            <div className="mt-3">
              <button 
                className="btn btn-outline-primary btn-sm me-2"
                onClick={() => window.open('https://console.cloud.google.com/google/maps-apis', '_blank')}
              >
                <i className="fas fa-external-link-alt me-1"></i>
                Google Cloud Console
              </button>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => window.location.reload()}
              >
                <i className="fas fa-refresh me-1"></i>
                Retry
              </button>
            </div>
            <small className="text-muted mt-3">
              Check browser console for detailed error information
            </small>
          </div>
        );
      default:
        return null;
    }
  };

  const onMapLoad = useCallback((map) => {
    setMap(map);
    setIsMapReady(true);
    
    // Add click listener to map - only when user actually clicks
    const clickListener = map.addListener('click', (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      console.log('Map clicked at coordinates:', { lat, lng });
      
      // Remove existing marker
      if (marker) {
        marker.setMap(null);
      }
      
      // Add new marker using helper function
      const newMarker = createMarker(
        { lat, lng },
        map,
        t('profile.addresses.selectedLocation', 'Selected Location'),
        true
      );
      
      // Add drag end listener to marker - only when user finishes dragging
      newMarker.addListener('dragend', () => {
        let newLat, newLng;
        
        // Handle different marker types
        if (newMarker.position && typeof newMarker.position.lat === 'function') {
          // Regular Marker
          newLat = newMarker.position.lat();
          newLng = newMarker.position.lng();
        } else if (newMarker.position) {
          // Advanced Marker Element
          newLat = newMarker.position.lat;
          newLng = newMarker.position.lng;
        }
        
        console.log('Marker dragged to new position:', { lat: newLat, lng: newLng });
        setSelectedLocation({ lat: newLat, lng: newLng });
        
        // Get address for new position
        getAddressFromCoordinates(newLat, newLng);
      });
      
      setMarker(newMarker);
      setSelectedLocation({ lat, lng });
      
      // Get address for clicked location
      getAddressFromCoordinates(lat, lng);
    });
    
    // Store listener for cleanup
    map.clickListener = clickListener;
    
    // Search box removed - users click on map to select location
  }, [marker, onLocationSelect, t]);

  // Search box functionality removed - users click on map to select location

  // Debounced geocoding function to prevent too many API calls
  const debouncedGeocoding = useMemo(() => {
    let timeoutId;
    return (lat, lng) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          
          // Only make geocoding request if coordinates are valid
          if (lat && lng && lat !== 0 && lng !== 0) {
            // console.log('Starting geocoding for coordinates:', { lat, lng });
            const geocodeRequest = { 
              location: { lat, lng },
              language: 'en' // Ensure English results
            };
            
            // console.log('Geocoding request:', geocodeRequest);
            
            // Add timeout to geocoding request
            const geocodeTimeout = setTimeout(() => {
              // console.log('Geocoding timeout - calling onLocationSelect with coordinates only');
              if (onLocationSelect) {
                onLocationSelect({ lat, lng, address: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}` });
              }
            }, 5000); // 5 second timeout
            
            geocoder.geocode(geocodeRequest, (results, status) => {
              clearTimeout(geocodeTimeout); // Clear timeout if geocoding completes
              // console.log('Geocoding response:', { status, results });
              
              if (status === 'OK' && results && results.length > 0) {
                const result = results[0];
                const address = result.formatted_address;
                
                // console.log('Geocoding successful:', address);
                
                if (onLocationSelect) {
                  // console.log('Geocoding - calling onLocationSelect with address:', { 
                  //   lat, 
                  //   lng, 
                  //   address 
                  // });
                  onLocationSelect({ 
                    lat, 
                    lng, 
                    address
                  });
                }
              } else {
                console.log('Geocoding failed:', status, results);
                
                // Still call onLocationSelect with coordinates if geocoding fails
                    if (onLocationSelect) {
                  console.log('Geocoding failed - calling onLocationSelect with coordinates only:', { lat, lng });
                  onLocationSelect({ 
                    lat, 
                    lng, 
                    address: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}` 
                  });
                }
              }
            });
          } else {
            console.log('Invalid coordinates for geocoding:', { lat, lng });
          }
        } else {
          console.log('Google Maps API not available for geocoding');
        }
      }, 300); // 300ms delay
    };
  }, [onLocationSelect]);

  const getAddressFromCoordinates = (lat, lng) => {
    debouncedGeocoding(lat, lng);
  };

  // Debounced marker update to prevent rapid re-creation
  const debouncedMarkerUpdate = useMemo(() => {
    let timeoutId;
    return (lat, lng, map) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Only update if coordinates are valid and different from current
        if (lat && lng && lat !== 0 && lng !== 0) {
          // Remove existing marker
          if (marker) {
            marker.setMap(null);
          }
          
          // Create new marker with stable configuration
          const newMarker = createMarker(
            { lat, lng },
            map,
            t('profile.addresses.selectedLocation', 'Selected Location'),
            true
          );
          
          // Add drag end listener
          newMarker.addListener('dragend', () => {
            let newLat, newLng;
            
            // Handle different marker types
            if (newMarker.position && typeof newMarker.position.lat === 'function') {
              // Regular Marker
              newLat = newMarker.position.lat();
              newLng = newMarker.position.lng();
            } else if (newMarker.position) {
              // Advanced Marker Element
              newLat = newMarker.position.lat;
              newLng = newMarker.position.lng;
            }
            
            console.log('Debounced marker dragged to new position:', { lat: newLat, lng: newLng });
            setSelectedLocation({ lat: newLat, lng: newLng });
            getAddressFromCoordinates(newLat, newLng);
            
            // Don't call onLocationSelect here - let the geocoding function handle it
            // This prevents duplicate calls and ensures address is included
          });
          
          setMarker(newMarker);
          setSelectedLocation({ lat, lng });
        }
      }, 100); // 100ms delay
    };
  }, [marker, onLocationSelect, t]);

  useEffect(() => {
    if (initialLocation && map) {
      const { lat, lng } = initialLocation;
      
      // Only update if coordinates are different from current location
      if (!selectedLocation || 
          Math.abs(selectedLocation.lat - lat) > 0.0001 || 
          Math.abs(selectedLocation.lng - lng) > 0.0001) {
        
        // Remove existing marker
        if (marker) {
          marker.setMap(null);
        }
        
        // Add marker for initial location with stable configuration
        const newMarker = createMarker(
          { lat, lng },
          map,
          t('profile.addresses.selectedLocation', 'Selected Location'),
          true
        );
        
        setMarker(newMarker);
        setSelectedLocation({ lat, lng });
        
        // Center map on initial location
        map.setCenter({ lat, lng });
        map.setZoom(16);
      }
    }
  }, [initialLocation, map, marker, t, selectedLocation]);

  // Search box functionality removed

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      // Autocomplete cleanup removed (search functionality removed)
      
      // Clean up map listeners
      if (map && map.clickListener) {
        try {
          if (window.google && window.google.maps && window.google.maps.event) {
            window.google.maps.event.removeListener(map.clickListener);
          }
        } catch (error) {
          console.warn('Error cleaning up map listener:', error);
        }
      }
      
      // Clean up marker
      if (marker) {
        try {
          marker.setMap(null);
        } catch (error) {
          console.warn('Error cleaning up marker:', error);
        }
      }
    };
  }, [map, marker]);

  return (
    <div className="google-map-address-picker">
      {/* Search Input - Only show if Places API is available and map is ready */}
      {/* Instructions for users */}
      <div className="mb-3 p-3 bg-info bg-opacity-10 border border-info rounded">
        <small className="text-info">
          <i className="fas fa-info-circle me-2"></i>
          {t('profile.addresses.clickMapInstruction', 'Click anywhere on the map to select your location. The address fields will be automatically filled.')}
        </small>
      </div>
      
      {/* Fallback message if Places API is not available or map not ready */}
      {(!isMapReady || !window.google || !window.google.maps || !window.google.maps.places) && (
        <div className="mb-3 p-3 bg-warning bg-opacity-10 border border-warning rounded">
          <small className="text-warning">
            <i className="fas fa-info-circle me-2"></i>
            {t('profile.addresses.searchNotAvailable', 'Search functionality will be available once the map loads. You can still click on the map to select a location.')}
          </small>
        </div>
      )}
      
      {/* Map Container */}
      <div className="map-container" style={{ height, border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
        {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
          <Wrapper 
            apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} 
            libraries={['places', 'marker']}
            render={render}
            callback={(status) => {
              // Only log on failure to reduce console spam
              if (status === Status.FAILURE) {
                console.log('Google Maps Wrapper Callback:', status);
                console.error('Google Maps failed to load. Check the following:');
                console.error('1. API Key is valid and active');
                console.error('2. Required APIs are enabled (Maps JavaScript API, Places API, Geocoding API)');
                console.error('3. Billing is set up in Google Cloud Console');
                console.error('4. Domain restrictions allow this domain');
                console.error('5. API quotas are not exceeded');
              }
            }}
          >
            <MapComponent
              center={selectedLocation || defaultCenter}
              zoom={selectedLocation ? 16 : defaultZoom}
              onLoad={onMapLoad}
            />
          </Wrapper>
        ) : (
          <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '20px' }}>
            <i className="fas fa-key text-warning mb-3" style={{ fontSize: '3rem' }}></i>
            <h5 className="text-warning mb-3">Google Maps API Key Missing</h5>
            <div className="text-start" style={{ maxWidth: '400px' }}>
              <p className="text-muted mb-2">To use Google Maps, you need to:</p>
              <ol className="text-muted small">
                <li>Get a Google Maps API key from Google Cloud Console</li>
                <li>Enable the required APIs (Maps JavaScript API, Places API, Geocoding API)</li>
                <li>Set up billing in Google Cloud Console</li>
                <li>Add the API key to your .env file as VITE_GOOGLE_MAPS_API_KEY</li>
              </ol>
            </div>
            <div className="mt-3">
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => window.open('https://console.cloud.google.com/google/maps-apis', '_blank')}
              >
                <i className="fas fa-external-link-alt me-1"></i>
                Get API Key
              </button>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

// Map Component
const MapComponent = ({ center, zoom, onLoad }) => {
  const ref = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (ref.current && !mapRef.current) {
      // Try to get Map ID from environment or use default
      const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
      
      const mapOptions = {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        disableDefaultUI: false,
        gestureHandling: 'greedy',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      };

      // Add mapId if it's not the demo ID
      if (mapId && mapId !== 'DEMO_MAP_ID') {
        mapOptions.mapId = mapId;
        console.log('Using Map ID:', mapId);
      } else {
        // console.log('No valid Map ID provided, using default map configuration');
      }

      const map = new window.google.maps.Map(ref.current, mapOptions);
      
      mapRef.current = map;
      
      if (onLoad) {
        onLoad(map);
      }
    }
  }, [center, zoom, onLoad]);

  // Update map center and zoom when props change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(zoom);
    }
  }, [center, zoom]);

  return <div ref={ref} style={{ width: '100%', height: '100%', minHeight: '300px' }} />;
};

export default GoogleMapAddressPicker;
