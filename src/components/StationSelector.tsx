import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import type { Station } from '../types/Station';

interface StationSelectorProps {
  stations: Station[];
  selectedStation: Station | null;
  filters: {
    search: string;
    country: string;
  };
  onStationSelect: (station: Station | null) => void;
  onFilterUpdate: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export default function StationSelector({
  stations,
  selectedStation,
  filters,
  onStationSelect,
  onFilterUpdate,
  onClearFilters,
}: StationSelectorProps) {
  const uniqueCountries = [...new Set(stations.map(s => s.country).filter(Boolean))].sort();
  
  const filteredStations = stations.filter(station => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        station.name.toLowerCase().includes(searchTerm) ||
        station.country.toLowerCase().includes(searchTerm) ||
        (station.city && station.city.toLowerCase().includes(searchTerm)) ||
        (station.type && station.type.toLowerCase().includes(searchTerm)) ||
        (station.genre && station.genre.toLowerCase().includes(searchTerm));
      
      if (!matchesSearch) return false;
    }
    
    if (filters.country && station.country !== filters.country) return false;
    
    return true;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Select Station</h2>
      
      {/* Station Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search stations by name, country, city..."
              value={filters.search}
              onChange={(e) => onFilterUpdate('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          
          <select
            value={filters.country}
            onChange={(e) => onFilterUpdate('country', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          >
            <option value="">All Countries</option>
            {uniqueCountries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          
          {(filters.search || filters.country) && (
            <button
              onClick={onClearFilters}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          Showing {filteredStations.length} of {stations.length} stations
        </div>
      </div>
      
      <select
        value={selectedStation?.id || ''}
        onChange={(e) => {
          const station = filteredStations.find(s => s.id === Number(e.target.value));
          onStationSelect(station || null);
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      >
        <option value="">Choose a station to update...</option>
        {filteredStations.map(station => (
          <option key={station.id} value={station.id}>
            {station.name} - {station.city ? `${station.city}, ${station.country}` : station.country}
          </option>
        ))}
      </select>

      {selectedStation && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Current Station Info</h3>
            <span className="text-xs text-gray-500">What you're updating</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 text-gray-900">{selectedStation.name}</span>
            </div>
            
            <div>
              <span className="text-gray-600">Location:</span>
              <span className="ml-2 text-gray-900">
                {selectedStation.city ? `${selectedStation.city}, ${selectedStation.country}` : selectedStation.country}
              </span>
            </div>

            <div>
              <span className="text-gray-600">Phone:</span>
              <span className={`ml-2 ${selectedStation.phone ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                {selectedStation.phone || 'Not set'}
              </span>
            </div>

            <div>
              <span className="text-gray-600">Email:</span>
              <span className={`ml-2 ${selectedStation.email ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                {selectedStation.email || 'Not set'}
              </span>
            </div>

            <div>
              <span className="text-gray-600">Address:</span>
              <span className={`ml-2 ${selectedStation.address ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                {selectedStation.address || 'Not set'}
              </span>
            </div>

            <div>
              <span className="text-gray-600">Coordinates:</span>
              <span className={`ml-2 ${selectedStation.latitude && selectedStation.longitude ? 'text-green-600' : 'text-gray-400 italic'}`}>
                {selectedStation.latitude && selectedStation.longitude 
                  ? `${selectedStation.latitude.toFixed(4)}, ${selectedStation.longitude.toFixed(4)}` 
                  : 'Not set'}
              </span>
            </div>

            {selectedStation.homepage && (
              <div className="md:col-span-2">
                <span className="text-gray-600">Website:</span>
                <a 
                  href={selectedStation.homepage} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-700 text-sm break-all"
                >
                  {selectedStation.homepage}
                </a>
              </div>
            )}

            {selectedStation.description && (
              <div className="md:col-span-2">
                <span className="text-gray-600">Description:</span>
                <p className="ml-2 text-gray-900 text-sm mt-1 line-clamp-2">
                  {selectedStation.description}
                </p>
              </div>
            )}

            {/* Social Media Links */}
            {(selectedStation.facebookUrl || selectedStation.twitterUrl || selectedStation.instagramUrl || selectedStation.youtubeUrl) && (
              <div className="md:col-span-2">
                <span className="text-gray-600">Social Media:</span>
                <div className="ml-2 flex gap-2 mt-1">
                  {selectedStation.facebookUrl && (
                    <a href={selectedStation.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                      <FaFacebook />
                    </a>
                  )}
                  {selectedStation.twitterUrl && (
                    <a href={selectedStation.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500">
                      <FaTwitter />
                    </a>
                  )}
                  {selectedStation.instagramUrl && (
                    <a href={selectedStation.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
                      <FaInstagram />
                    </a>
                  )}
                  {selectedStation.youtubeUrl && (
                    <a href={selectedStation.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">
                      <FaYoutube />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Has data
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                Missing data
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}