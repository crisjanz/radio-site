import React from "react";
import { FaGlobe, FaMusic, FaTags, FaFilter, FaTimes } from "react-icons/fa";

interface SidebarProps {
  countries: string[];
  genres: string[];
  types: string[];
  selectedCountry: string;
  selectedGenre: string;
  selectedType: string;
  onCountryChange: (country: string) => void;
  onGenreChange: (genre: string) => void;
  onTypeChange: (type: string) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  countries,
  genres,
  types,
  selectedCountry,
  selectedGenre,
  selectedType,
  onCountryChange,
  onGenreChange,
  onTypeChange,
  onClearFilters,
  isOpen,
  onClose
}) => {
  const hasActiveFilters = selectedCountry || selectedGenre || selectedType;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 
        w-80 bg-white border-r border-gray-200 flex flex-col h-full
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaGlobe className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Radio World</h2>
                <p className="text-sm text-gray-500">Global Stations</p>
              </div>
            </div>
            {/* Mobile close button */}
            <button 
              onClick={onClose}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex-1 px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <FaTimes className="text-xs" />
              Clear
            </button>
          )}
        </div>

        {/* Country filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FaGlobe className="text-gray-400 text-xs" />
            Country
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            <option value="">All Countries ({countries.length})</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Genre filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FaMusic className="text-gray-400 text-xs" />
            Genre
          </label>
          <select
            value={selectedGenre}
            onChange={(e) => onGenreChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            <option value="">All Genres ({genres.length})</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        {/* Type filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FaTags className="text-gray-400 text-xs" />
            Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            <option value="">All Types ({types.length})</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Active Filters:</h4>
            <div className="space-y-1">
              {selectedCountry && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">Country:</span>
                  <span className="font-medium text-blue-900">{selectedCountry}</span>
                </div>
              )}
              {selectedGenre && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">Genre:</span>
                  <span className="font-medium text-blue-900">{selectedGenre}</span>
                </div>
              )}
              {selectedType && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">Type:</span>
                  <span className="font-medium text-blue-900">{selectedType}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Powered by Radio Browser API
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;