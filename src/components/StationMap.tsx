import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaPlay, FaGlobe, FaMusic, FaInfoCircle, FaLocationArrow } from 'react-icons/fa';
import { FaGlobe as FaGlobe6 } from 'react-icons/fa6';
import type { Station } from '../types/Station';
import { API_CONFIG } from '../config/api';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface StationMapProps {
  onPlayStation: (station: Station) => void;
  searchTerm: string;
  selectedCountry: string;
  selectedGenre: string;
  selectedType: string;
  initialCoordinates?: {lat: number; lng: number} | null;
}

// Custom radio station icon with Streemr play logo
const createRadioIcon = (count: number = 1) => {
  const size = count > 1 ? 20 : 20;
  const logoSize = count > 1 ? 14 : 14;
  
  return L.divIcon({
    className: 'custom-radio-marker',
    html: `
      <div style="

        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
 

        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        ${count > 1 ? `
          <div style="
            position: absolute;
            top: -8px;
            right: -8px;
            background-color: #ffffff;
            color: black;
            border-radius: 50%;
            width: 14px;
            height: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            border: 0.25px solid #494949;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          ">${count}</div>
        ` : ''}
        <img 
          src="/streemr-play.png" 
          alt="Streemr" 
          style="
            width: ${logoSize}px;
            height: ${logoSize}px;
            object-fit: contain;
          "
        />
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

// Create user location icon
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-user-location-marker',
    html: `
      <div style="
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: #3b82f6;
        border: 3px solid #ffffff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: rgba(59, 130, 246, 0.2);
          top: -7px;
          left: -7px;
          animation: pulse 2s infinite;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 0.4; }
          100% { transform: scale(0.8); opacity: 0.8; }
        }
      </style>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
  });
};

// Component to fit map bounds to stations
const FitBounds: React.FC<{ 
  stations: Station[]; 
  initialCoordinates?: {lat: number; lng: number} | null;
  userLocation?: {lat: number; lng: number} | null;
}> = ({ stations, initialCoordinates, userLocation }) => {
  const map = useMap();

  useEffect(() => {
    // Priority 1: Use initial coordinates if provided (from URL)
    if (initialCoordinates) {
      map.setView([initialCoordinates.lat, initialCoordinates.lng], 12);
      return;
    }

    // Priority 2: Use user's current location if available
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 10);
      return;
    }

    // Priority 3: Fit to stations if no coordinates available
    if (stations.length === 0) return;

    const validStations = stations.filter(s => s.latitude && s.longitude);
    if (validStations.length === 0) return;

    if (validStations.length === 1) {
      // Single station - center on it
      const station = validStations[0];
      map.setView([station.latitude!, station.longitude!], 10);
    } else {
      // Multiple stations - fit to bounds
      const bounds = L.latLngBounds(
        validStations.map(s => [s.latitude!, s.longitude!])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [stations, map, initialCoordinates, userLocation]);

  return null;
};

const StationMap: React.FC<StationMapProps> = ({
  onPlayStation,
  searchTerm,
  selectedCountry,
  selectedGenre,
  selectedType,
  initialCoordinates
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [showLocationSuccess, setShowLocationSuccess] = useState(false);

  const API_BASE = API_CONFIG.BASE_URL;

  // Function to request user's current location
  const requestLocation = () => {
    // Only try to get location if we don't have initial coordinates from URL
    if (initialCoordinates) {
      return;
    }

    setIsRequestingLocation(true);
    setLocationPermissionDenied(false);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationPermissionDenied(false);
          setIsRequestingLocation(false);
          setShowLocationSuccess(true);
          
          // Hide success notification after 3 seconds
          setTimeout(() => setShowLocationSuccess(false), 3000);
          
          console.log('✅ User location obtained:', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('⚠️ Geolocation error:', error.message);
          setLocationPermissionDenied(true);
          setIsRequestingLocation(false);
          
          // Log specific error types for debugging
          switch(error.code) {
            case error.PERMISSION_DENIED:
              console.log('📍 User denied location permission');
              break;
            case error.POSITION_UNAVAILABLE:
              console.log('📍 Location information is unavailable');
              break;
            case error.TIMEOUT:
              console.log('📍 Location request timed out');
              break;
          }
        },
        {
          enableHighAccuracy: false, // Use less battery
          timeout: 10000, // 10 second timeout
          maximumAge: 300000 // Use cached location if less than 5 minutes old
        }
      );
    } else {
      console.log('📍 Geolocation is not supported by this browser');
      setLocationPermissionDenied(true);
      setIsRequestingLocation(false);
    }
  };

  // Get user's current location on mount
  useEffect(() => {
    requestLocation();
  }, [initialCoordinates]);

  // Fetch stations with coordinates
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/stations`);
        if (!response.ok) throw new Error('Failed to fetch stations');

        const data = await response.json();
        
        // Filter stations with coordinates
        const stationsWithCoords = data.filter((s: Station) => 
          s.latitude && s.longitude && s.latitude !== 0 && s.longitude !== 0
        );

        setStations(stationsWithCoords);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stations');
        console.error('Failed to fetch stations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Filter stations based on search criteria
  const filteredStations = stations.filter(station => {
    const matchesSearch = !searchTerm || 
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = !selectedCountry || station.country === selectedCountry;
    const matchesGenre = !selectedGenre || station.genre === selectedGenre;
    const matchesType = !selectedType || station.type === selectedType;

    return matchesSearch && matchesCountry && matchesGenre && matchesType;
  });

  // Group stations by coordinates to handle overlapping markers
  const groupedStations = filteredStations.reduce((groups, station) => {
    const key = `${station.latitude},${station.longitude}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(station);
    return groups;
  }, {} as Record<string, Station[]>);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading map...</p>
        </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <FaGlobe className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Failed to load map</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
        </div>
      </div>
    );
  }

  if (filteredStations.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <FaMusic className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No stations with coordinates found</p>
          <p className="text-sm text-gray-500 mt-1">
            {stations.length === 0 
              ? "Import stations with geographic data to see them on the map"
              : "Try adjusting your search or filters"
            }
          </p>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="h-[600px] w-full rounded-lg overflow-hidden border border-gray-200 bg-white">
      <div className="h-full relative">
        <MapContainer
          center={[40.7128, -74.0060]} // Default to NYC
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          
          <FitBounds 
            stations={filteredStations} 
            initialCoordinates={initialCoordinates} 
            userLocation={userLocation} 
          />
          
          {/* User location marker */}
          {userLocation && !initialCoordinates && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserLocationIcon()}
              zIndexOffset={1000} // Ensure it appears on top
            >
              <Popup>
                <div className="text-center p-2">
                  <p className="font-semibold text-blue-600 mb-1">Your Location</p>
                  <p className="text-sm text-gray-600">
                    Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {Object.entries(groupedStations).map(([key, stationsAtLocation]) => {
            const [lat, lng] = key.split(',').map(Number);
            const stationCount = stationsAtLocation.length;
            
            return (
              <Marker
                key={key}
                position={[lat, lng]}
                icon={createRadioIcon(stationCount)}
              >
                <Popup className="station-popup" maxWidth={400}>
                  <div className="p-2 min-w-[300px] max-w-[380px]">
                    {stationCount > 1 && (
                      <div className="mb-3 pb-2 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900 text-center">
                          {stationCount} Stations at this location
                        </h3>
                        <p className="text-sm text-gray-600 text-center">
                          {stationsAtLocation[0].city ? `${stationsAtLocation[0].city}, ${stationsAtLocation[0].country}` : stationsAtLocation[0].country}
                        </p>
                      </div>
                    )}
                    
                    <div className={`space-y-3 ${stationCount > 1 ? 'max-h-80 overflow-y-auto' : ''}`}>
                      {stationsAtLocation.map((station, index) => (
                        <div key={station.id} className={`${index > 0 && stationCount > 1 ? 'pt-3 border-t border-gray-100' : ''}`}>
                          <div className="flex items-center gap-3 mb-2">
                            {(station.local_image_url || station.logo) && (
                              <img
                                src={station.local_image_url || station.logo}
                                alt={station.name}
                                className="w-8 h-8 rounded border flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate text-sm">
                                {station.name}
                              </h4>
                              {stationCount === 1 && (
                                <p className="text-sm text-gray-600">
                                  {station.city ? `${station.city}, ${station.country}` : station.country}
                                </p>
                              )}
                            </div>
                          </div>

                          {station.genre && (
                            <div className="flex items-center gap-1 mb-2 text-sm text-gray-600">
                              <FaMusic className="text-xs" />
                              <span>{station.genre}</span>
                              {station.type && station.type !== 'music' && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded ml-2">
                                  {station.type}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => onPlayStation(station)}
                              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              <FaPlay className="text-xs" />
                              Play
                            </button>
                            
                            <Link
                              to={`/station/${station.id}`}
                              className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                              title="Station Details"
                            >
                              <FaInfoCircle className="text-xs" />
                            </Link>
                            
                            {station.homepage && (
                              <a
                                href={station.homepage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                title="Visit Website"
                              >
                                <FaGlobe6 className="text-xs" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Station count overlay */}
        <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md border z-10">
          <p className="text-sm font-medium text-gray-900">
            {filteredStations.length} station{filteredStations.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Location permission notification */}
        {!initialCoordinates && locationPermissionDenied && !userLocation && (
          <div className="absolute top-4 left-4 bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg shadow-md z-10 max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <FaLocationArrow className="text-blue-600 text-sm" />
              <p className="text-sm font-medium text-blue-900">Find stations near you</p>
            </div>
            <p className="text-xs text-blue-700 mb-3">
              Allow location access to see radio stations in your area
            </p>
            <button
              onClick={requestLocation}
              disabled={isRequestingLocation}
              className="w-full bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRequestingLocation ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  Getting location...
                </span>
              ) : (
                'Enable Location'
              )}
            </button>
          </div>
        )}

        {/* User location success notification */}
        {!initialCoordinates && userLocation && showLocationSuccess && (
          <div className="absolute top-4 left-4 bg-green-50 border border-green-200 px-4 py-3 rounded-lg shadow-md z-10 max-w-xs">
            <div className="flex items-center gap-2">
              <FaLocationArrow className="text-green-600 text-sm" />
              <p className="text-sm font-medium text-green-900">Location found!</p>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Map centered on your location
            </p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default StationMap;