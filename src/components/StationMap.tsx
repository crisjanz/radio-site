import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaPlay, FaGlobe, FaMusic, FaInfoCircle } from 'react-icons/fa';
import type { Station } from '../types/Station';

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
}

// Custom radio station icon
const createRadioIcon = (color: string = '#3b82f6', count: number = 1) => {
  return L.divIcon({
    className: 'custom-radio-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${count > 1 ? '32px' : '24px'};
        height: ${count > 1 ? '32px' : '24px'};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: ${count > 1 ? '12px' : '10px'};
        font-weight: bold;
      ">
        ${count > 1 ? count : '📻'}
      </div>
    `,
    iconSize: [count > 1 ? 32 : 24, count > 1 ? 32 : 24],
    iconAnchor: [count > 1 ? 16 : 12, count > 1 ? 16 : 12],
    popupAnchor: [0, count > 1 ? -16 : -12]
  });
};

// Component to fit map bounds to stations
const FitBounds: React.FC<{ stations: Station[] }> = ({ stations }) => {
  const map = useMap();

  useEffect(() => {
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
  }, [stations, map]);

  return null;
};

const StationMap: React.FC<StationMapProps> = ({
  onPlayStation,
  searchTerm,
  selectedCountry,
  selectedGenre,
  selectedType
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = 'http://192.168.1.69:3001';

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
      <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <FaGlobe className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Failed to load map</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (filteredStations.length === 0) {
    return (
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
    );
  }

  return (
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
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <FitBounds stations={filteredStations} />
          
          {Object.entries(groupedStations).map(([key, stationsAtLocation]) => {
            const [lat, lng] = key.split(',').map(Number);
            const stationCount = stationsAtLocation.length;
            
            return (
              <Marker
                key={key}
                position={[lat, lng]}
                icon={createRadioIcon('#3b82f6', stationCount)}
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
                            {station.favicon && (
                              <img
                                src={station.favicon}
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
                                🌐
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
      </div>
    </div>
  );
};

export default StationMap;