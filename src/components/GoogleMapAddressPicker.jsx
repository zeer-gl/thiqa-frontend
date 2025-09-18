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
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Default center (Kuwait City)
  const defaultCenter = { lat: 29.3759, lng: 47.9774 };
  const defaultZoom = 12;

  const render = (status) => {
    console.log('Google Maps Status:', status);
    console.log('API Key available:', !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
    
    switch (status) {
      case Status.LOADING:
        return (
          <div className="map-loading" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">{t('common.loading')}</span>
            </div>
            <p className="mt-2 text-muted">Loading Google Maps...</p>
          </div>
        );
      case Status.FAILURE:
        return (
          <div className="map-error" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <i className="fas fa-exclamation-triangle text-warning mb-2" style={{ fontSize: '2rem' }}></i>
            <p className="text-muted">{t('profile.addresses.mapLoadError', 'Failed to load map')}</p>
            <small className="text-muted">Please check your Google Maps API key configuration</small>
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
      
      // Remove existing marker
      if (marker) {
        marker.setMap(null);
      }
      
      // Add new marker using AdvancedMarkerElement (recommended)
      const newMarker = new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat, lng },
        map: map,
        title: t('profile.addresses.selectedLocation', 'Selected Location'),
        gmpDraggable: true, // Use gmpDraggable for AdvancedMarkerElement
      });
      
      // Add drag end listener to marker - only when user finishes dragging
      newMarker.addListener('dragend', () => {
        const newPosition = newMarker.position;
        const newLat = newPosition.lat;
        const newLng = newPosition.lng;
        
        console.log('Marker dragged to new position:', { lat: newLat, lng: newLng });
        setSelectedLocation({ lat: newLat, lng: newLng });
        
        // Only make API call when user finishes dragging
        getAddressFromCoordinates(newLat, newLng);
        
        // Don't call onLocationSelect here - let the geocoding function handle it
        // This prevents duplicate calls and ensures address is included
      });
      
      setMarker(newMarker);
      setSelectedLocation({ lat, lng });
      
      // Only get address when user actually selects a location
      getAddressFromCoordinates(lat, lng);
      
      // Don't call onLocationSelect here - let the geocoding function handle it
      // This prevents duplicate calls and ensures address is included
    });
    
    // Store listener for cleanup
    map.clickListener = clickListener;
    
    // Initialize search box with a small delay to ensure Places API is loaded
    setTimeout(() => {
      initializeSearchBox(map);
    }, 100);
  }, [marker, onLocationSelect, t]);

  const initializeSearchBox = (map) => {
    if (!searchInputRef.current) {
      console.warn('Search input ref not available');
      return;
    }
    
    if (window.google && window.google.maps && window.google.maps.places) {
      try {
        // Use the new PlaceAutocompleteElement instead of deprecated Autocomplete
        if (window.google.maps.places.PlaceAutocompleteElement) {
          // Create the new autocomplete element
          const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
            types: ['address'],
            componentRestrictions: { country: 'kw' } // Restrict to Kuwait
          });
          
          // Replace the input with the new element
          const inputContainer = searchInputRef.current?.parentNode;
          if (inputContainer && searchInputRef.current) {
            inputContainer.replaceChild(autocompleteElement, searchInputRef.current);
          } else {
            console.warn('Input container or search input ref not found');
            return;
          }
          
          // Store reference
          autocompleteRef.current = autocompleteElement;
          
          // Add event listener for place selection
          autocompleteElement.addEventListener('gmp-placeselect', (event) => {
            const place = event.place;
            
            if (!place.geometry || !place.geometry.location) {
              console.log('No details available for input: ' + place.name);
              return;
            }
            
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            // Remove existing marker
            if (marker) {
              marker.setMap(null);
            }
            
            // Add new marker with stable configuration
            const newMarker = new window.google.maps.marker.AdvancedMarkerElement({
              position: { lat, lng },
              map: map,
        gmpDraggable: true, // Use gmpDraggable for AdvancedMarkerElement
        title: place.name || t('profile.addresses.selectedLocation', 'Selected Location')
            });
            
            // Add drag end listener to marker
            newMarker.addListener('dragend', () => {
              const newPosition = newMarker.position;
              const newLat = newPosition.lat;
              const newLng = newPosition.lng;
              
              console.log('Marker dragged to new position:', { lat: newLat, lng: newLng });
              setSelectedLocation({ lat: newLat, lng: newLng });
              
              // Only make API call when user finishes dragging
              getAddressFromCoordinates(newLat, newLng);
              
              // Don't call onLocationSelect here - let the geocoding function handle it
              // This prevents duplicate calls and ensures address is included
            });
            
            setMarker(newMarker);
            setSelectedLocation({ lat, lng });
            
            // Call parent callback with address from search
            if (onLocationSelect) {
              console.log('Search selection - calling onLocationSelect with:', { lat, lng, address: place.formattedAddress });
              onLocationSelect({ lat, lng, address: place.formattedAddress });
            }
            
            // Center map on selected location
            map.setCenter({ lat, lng });
            map.setZoom(16);
          });
        } else {
          // Fallback to old Autocomplete if new API is not available
          console.warn('New PlaceAutocompleteElement not available, using legacy Autocomplete');
          autocompleteRef.current = new window.google.maps.places.Autocomplete(searchInputRef.current, {
            types: ['address'],
            componentRestrictions: { country: 'kw' }
          });
          
          autocompleteRef.current.bindTo('bounds', map);
          
          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current.getPlace();
            
            if (!place.geometry || !place.geometry.location) {
              console.log('No details available for input: ' + place.name);
              return;
            }
            
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            // Remove existing marker
            if (marker) {
              marker.setMap(null);
            }
            
            // Add new marker with stable configuration
            const newMarker = new window.google.maps.marker.AdvancedMarkerElement({
              position: { lat, lng },
              map: map,
        gmpDraggable: true, // Use gmpDraggable for AdvancedMarkerElement
        title: place.name || t('profile.addresses.selectedLocation', 'Selected Location')
            });
            
            // Add drag end listener to marker
            newMarker.addListener('dragend', () => {
              const newPosition = newMarker.position;
              const newLat = newPosition.lat;
              const newLng = newPosition.lng;
              
              console.log('Marker dragged to new position:', { lat: newLat, lng: newLng });
              setSelectedLocation({ lat: newLat, lng: newLng });
              
              // Only make API call when user finishes dragging
              getAddressFromCoordinates(newLat, newLng);
              
              // Don't call onLocationSelect here - let the geocoding function handle it
              // This prevents duplicate calls and ensures address is included
            });
            
            setMarker(newMarker);
            setSelectedLocation({ lat, lng });
            
            // Call parent callback with address from search
            if (onLocationSelect) {
              console.log('Legacy search selection - calling onLocationSelect with:', { lat, lng, address: place.formatted_address });
              onLocationSelect({ lat, lng, address: place.formatted_address });
            }
            
            // Center map on selected location
            map.setCenter({ lat, lng });
            map.setZoom(16);
          });
        }
      } catch (error) {
        console.error('Error initializing search box:', error);
      }
    } else {
      console.warn('Google Maps Places API not loaded yet');
    }
  };

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
            console.log('Starting geocoding for coordinates:', { lat, lng });
            const geocodeRequest = { 
              location: { lat, lng },
              language: 'en' // Ensure English results
            };
            
            console.log('Geocoding request:', geocodeRequest);
            
            // Add timeout to geocoding request
            const geocodeTimeout = setTimeout(() => {
              console.log('Geocoding timeout - calling onLocationSelect with coordinates only');
              if (onLocationSelect) {
                onLocationSelect({ lat, lng });
              }
            }, 10000); // 10 second timeout
            
            geocoder.geocode(geocodeRequest, (results, status) => {
              clearTimeout(geocodeTimeout); // Clear timeout if geocoding completes
              console.log('Geocoding response:', { status, results });
              if (status === 'OK' && results && results.length > 0) {
                const result = results[0];
                const address = result.formatted_address;
                
                // Extract detailed address components
                const addressComponents = {
                  street_number: '',
                  route: '',
                  neighborhood: '',
                  sublocality: '',
                  locality: '',
                  administrative_area_level_1: '',
                  country: '',
                  postal_code: ''
                };
                
                // Parse address components
                if (result.address_components) {
                  result.address_components.forEach(component => {
                    const types = component.types;
                    if (types.includes('street_number')) {
                      addressComponents.street_number = component.long_name;
                    }
                    if (types.includes('route')) {
                      addressComponents.route = component.long_name;
                    }
                    if (types.includes('neighborhood')) {
                      addressComponents.neighborhood = component.long_name;
                    }
                    if (types.includes('sublocality')) {
                      addressComponents.sublocality = component.long_name;
                    }
                    if (types.includes('locality')) {
                      addressComponents.locality = component.long_name;
                    }
                    if (types.includes('administrative_area_level_1')) {
                      addressComponents.administrative_area_level_1 = component.long_name;
                    }
                    if (types.includes('country')) {
                      addressComponents.country = component.long_name;
                    }
                    if (types.includes('postal_code')) {
                      addressComponents.postal_code = component.long_name;
                    }
                  });
                }
                
                console.log('Geocoding successful:', address);
                console.log('Address components:', addressComponents);
                
                if (onLocationSelect) {
                  console.log('Geocoding - calling onLocationSelect with detailed info:', { 
                    lat, 
                    lng, 
                    address, 
                    addressComponents 
                  });
                  onLocationSelect({ 
                    lat, 
                    lng, 
                    address, 
                    addressComponents 
                  });
                }
              } else {
                console.log('Geocoding failed:', status, results);
                
                // Try a simpler geocoding request as fallback
                console.log('Trying fallback geocoding...');
                geocoder.geocode({ location: { lat, lng } }, (fallbackResults, fallbackStatus) => {
                  console.log('Fallback geocoding response:', { fallbackStatus, fallbackResults });
                  if (fallbackStatus === 'OK' && fallbackResults && fallbackResults.length > 0) {
                    const fallbackAddress = fallbackResults[0].formatted_address;
                    console.log('Fallback geocoding successful:', fallbackAddress);
                    if (onLocationSelect) {
                      onLocationSelect({ lat, lng, address: fallbackAddress });
                    }
                  } else {
                    console.log('Fallback geocoding also failed');
                    // Still call onLocationSelect with coordinates only if geocoding fails
                    if (onLocationSelect) {
                      console.log('All geocoding failed - calling onLocationSelect with coordinates only:', { lat, lng });
                      onLocationSelect({ lat, lng });
                    }
                  }
                });
              }
            });
          } else {
            console.log('Invalid coordinates for geocoding:', { lat, lng });
          }
        } else {
          console.log('Google Maps API not available for geocoding');
        }
      }, 500); // 500ms delay
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
          const newMarker = new window.google.maps.marker.AdvancedMarkerElement({
            position: { lat, lng },
            map: map,
              gmpDraggable: true, // Use gmpDraggable for AdvancedMarkerElement
              title: t('profile.addresses.selectedLocation', 'Selected Location')
          });
          
          // Add drag end listener
          newMarker.addListener('dragend', () => {
            const newPosition = newMarker.position;
            const newLat = newPosition.lat;
            const newLng = newPosition.lng;
            
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
        const newMarker = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat, lng },
          map: map,
              gmpDraggable: true, // Use gmpDraggable for AdvancedMarkerElement
              title: t('profile.addresses.selectedLocation', 'Selected Location')
        });
        
        setMarker(newMarker);
        setSelectedLocation({ lat, lng });
        
        // Center map on initial location
        map.setCenter({ lat, lng });
        map.setZoom(16);
      }
    }
  }, [initialLocation, map, marker, t, selectedLocation]);

  // Reinitialize search box when Google Maps API is available
  useEffect(() => {
    if (map && window.google && window.google.maps && window.google.maps.places) {
      initializeSearchBox(map);
    }
  }, [map]);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up autocomplete
      if (autocompleteRef.current) {
        try {
          if (window.google && window.google.maps && window.google.maps.event) {
            window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
          }
        } catch (error) {
          console.warn('Error cleaning up autocomplete:', error);
        }
      }
      
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
      {isMapReady && window.google && window.google.maps && window.google.maps.places && (
        <div className="mb-3">
          <label className="form-label">
            <i className="fas fa-search me-2"></i>
            {t('profile.addresses.searchLocation', 'Search Location')}
          </label>
          <input
            ref={searchInputRef}
            type="text"
            className="form-control"
            placeholder={t('profile.addresses.searchPlaceholder', 'Type address to search...')}
          />
        </div>
      )}
      
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
          >
            <MapComponent
              center={selectedLocation || defaultCenter}
              zoom={selectedLocation ? 16 : defaultZoom}
              onLoad={onMapLoad}
            />
          </Wrapper>
        ) : (
          <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <i className="fas fa-exclamation-triangle text-warning mb-2" style={{ fontSize: '2rem' }}></i>
            <p className="text-muted">Google Maps API key not configured</p>
            <small className="text-muted">Please add VITE_GOOGLE_MAPS_API_KEY to your .env file</small>
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
      const map = new window.google.maps.Map(ref.current, {
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
      });
      
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
