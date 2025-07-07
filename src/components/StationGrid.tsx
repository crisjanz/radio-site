import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlay, FaGlobe, FaMusic, FaInfoCircle } from "react-icons/fa";
import { apiRequest, API_CONFIG, getFaviconUrl } from "../config/api";
import type { Station } from "../types/Station";

interface StationGridProps {
  onPlayStation: (station: Station) => void;
  searchTerm: string;
  selectedCountry: string;
  selectedGenre: string;
  selectedType: string;
}

const StationGrid: React.FC<StationGridProps> = ({ 
  onPlayStation, 
  searchTerm, 
  selectedCountry, 
  selectedGenre, 
  selectedType 
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiRequest(API_CONFIG.ENDPOINTS.STATIONS);
        setStations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stations');
        console.error('Failed to load stations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Filter stations based on props
  const filteredStations = stations.filter((station) => {
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = !selectedCountry || station.country === selectedCountry;
    const matchesGenre = !selectedGenre || station.genre === selectedGenre;
    const matchesType = !selectedType || station.type === selectedType;
    
    return matchesSearch && matchesCountry && matchesGenre && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <FaGlobe className="text-4xl mx-auto mb-2 opacity-50" />
          <p className="font-medium">Failed to connect to backend</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
        </div>
        <p className="text-sm text-gray-500">Backend server: {API_CONFIG.BASE_URL}</p>
      </div>
    );
  }

  if (filteredStations.length === 0) {
    return (
      <div className="text-center py-12">
        <FaMusic className="text-4xl text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">No stations found</p>
        <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredStations.map((station) => {
        return (
          <div
            key={station.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate text-lg">
                    {station.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {station.country}
                  </p>
                </div>
                <StationLogo station={station} />
              </div>
              
              {(station.genre || station.type) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {station.genre && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                      {station.genre}
                    </span>
                  )}
                  {station.type && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {station.type}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => onPlayStation(station)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 group-hover:bg-blue-700"
                >
                  <FaPlay className="text-sm" />
                  Listen Now
                </button>
                
                <Link
                  to={`/station/${station.id}`}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                  title="Station Details"
                >
                  <FaInfoCircle className="text-sm" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Separate component for station logo with error handling
const StationLogo: React.FC<{ station: Station }> = ({ station }) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="w-12 h-12 rounded-xl ml-3 flex-shrink-0 overflow-hidden border border-gray-200">
      {getFaviconUrl(station, { width: 48, height: 48, quality: 90 }) && !logoError ? (
        <img
          src={getFaviconUrl(station, { width: 48, height: 48, quality: 90 })!}
          alt={`${station.name} logo`}
          className="w-full h-full object-fill"
          style={{ width: '100%', height: '100%' }}
          onError={() => setLogoError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <img src="/streemr-play.png" alt="Streemr" className="w-8 h-8 object-contain" />
        </div>
      )}
    </div>
  );
};

export default StationGrid;