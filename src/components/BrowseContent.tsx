import { useState } from 'react';
import { FaList, FaGlobe, FaMusic, FaSignal } from 'react-icons/fa6';
import type { Station } from '../types/Station';
import BrowseAllContent from './BrowseAllContent';
import CountryContent from './CountryContent';
import GenreContent from './GenreContent';

interface BrowseContentProps {
  searchTerm: string;
  onPlayStation: (station: Station) => void;
  onStationInfo?: (station: Station) => void;
}

type BrowseView = 'main' | 'browse-all' | 'country' | 'genre' | 'type';

export default function BrowseContent({ 
  searchTerm, 
  onPlayStation, 
  onStationInfo 
}: BrowseContentProps) {
  const [currentView, setCurrentView] = useState<BrowseView>('main');

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  // If we're in a sub-view, render the appropriate component
  if (currentView === 'browse-all') {
    return (
      <BrowseAllContent
        onPlayStation={onPlayStation}
        onStationInfo={onStationInfo}
        onBack={handleBackToMain}
        searchTerm={searchTerm}
      />
    );
  }

  if (currentView === 'country') {
    return (
      <CountryContent
        onPlayStation={onPlayStation}
        onStationInfo={onStationInfo}
        onBack={handleBackToMain}
      />
    );
  }

  if (currentView === 'genre') {
    return (
      <GenreContent
        onPlayStation={onPlayStation}
        onStationInfo={onStationInfo}
        onBack={handleBackToMain}
      />
    );
  }

  // Main browse view - show all options
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center py-4 lg:py-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
          Browse Stations
        </h1>
        <p className="text-gray-600 mt-2">
          Explore radio stations by category, country, or genre
        </p>
      </div>

      {/* Browse Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Browse All Stations */}
        <button
          onClick={() => setCurrentView('browse-all')}
          className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left group"
        >
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <FaList className="text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Browse All Stations
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Explore our complete collection of radio stations with pagination
              </p>
              <div className="text-blue-600 text-sm font-medium">
                View all stations →
              </div>
            </div>
          </div>
        </button>

        {/* Browse by Country */}
        <button
          onClick={() => setCurrentView('country')}
          className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left group"
        >
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <FaGlobe className="text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Browse by Country
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Discover radio stations from different countries around the world
              </p>
              <div className="text-blue-600 text-sm font-medium">
                Explore countries →
              </div>
            </div>
          </div>
        </button>

        {/* Browse by Genre */}
        <button
          onClick={() => setCurrentView('genre')}
          className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left group"
        >
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <FaMusic className="text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Browse by Genre
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Find stations by music genre - rock, jazz, classical, and more
              </p>
              <div className="text-blue-600 text-sm font-medium">
                Explore genres →
              </div>
            </div>
          </div>
        </button>

        {/* Browse by Type */}
        <button
          onClick={() => setCurrentView('type')}
          className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left group"
        >
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <FaSignal className="text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Browse by Type
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Filter stations by broadcast type - AM, FM, or Web Radio
              </p>
              <div className="text-blue-600 text-sm font-medium">
                Explore types →
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">15,000+</div>
            <div className="text-sm text-gray-600">Total Stations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">150+</div>
            <div className="text-sm text-gray-600">Countries</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">50+</div>
            <div className="text-sm text-gray-600">Genres</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">24/7</div>
            <div className="text-sm text-gray-600">Live Streaming</div>
          </div>
        </div>
      </div>

      {/* Search Hint */}
      {searchTerm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <p className="text-blue-800">
            <strong>Tip:</strong> Use the search above to find specific stations, or choose a browse option to explore by category.
          </p>
        </div>
      )}
    </div>
  );
}