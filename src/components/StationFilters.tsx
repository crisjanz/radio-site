import { FaSearch } from 'react-icons/fa';

interface StationFiltersProps {
  filters: {
    search: string;
    country: string;
    type: string;
    geoStatus: string;
    cityStatus: string;
  };
  uniqueCountries: string[];
  uniqueTypes: string[];
  onFilterUpdate: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export default function StationFilters({
  filters,
  uniqueCountries,
  uniqueTypes,
  onFilterUpdate,
  onClearFilters,
}: StationFiltersProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-4 border-b bg-white">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <FaSearch className="text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search stations..."
            value={filters.search}
            onChange={(e) => onFilterUpdate('search', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64"
          />
        </div>
        
        <select
          value={filters.country}
          onChange={(e) => onFilterUpdate('country', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">All Countries</option>
          {uniqueCountries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
        
        <select
          value={filters.type}
          onChange={(e) => onFilterUpdate('type', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">All Types</option>
          {uniqueTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        
        <select
          value={filters.geoStatus}
          onChange={(e) => onFilterUpdate('geoStatus', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">All Locations</option>
          <option value="with-geo">With Coordinates</option>
          <option value="without-geo">Without Coordinates</option>
        </select>
        
        <select
          value={filters.cityStatus}
          onChange={(e) => onFilterUpdate('cityStatus', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">All Cities</option>
          <option value="with-city">With City</option>
          <option value="without-city">Without City</option>
        </select>
        
        <button
          onClick={onClearFilters}
          className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}