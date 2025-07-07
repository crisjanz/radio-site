import { useState, useEffect, useRef } from 'react';
import { FaFire, FaHeart, FaRegHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { apiRequest, API_CONFIG, buildApiUrl, getFaviconUrl } from '../config/api';
import type { Station } from '../types/Station';

interface HomeContentProps {
  searchTerm: string;
  onPlayStation: (station: Station) => void;
  onNavigateToDiscover: () => void;
  onStationInfo?: (station: Station) => void;
  isLoggedIn?: boolean;
  favorites?: Station[];
  onToggleFavorite?: (station: Station) => void;
}

export default function HomeContent({ 
  searchTerm, 
  onPlayStation,
  onStationInfo,
  isLoggedIn = false,
  favorites = [],
  onToggleFavorite
}: HomeContentProps) {
  
  // Combined function to both play station and navigate to info page
  const handleStationClick = (station: Station) => {
    onPlayStation(station);
    onStationInfo?.(station);
  };
  const [trendingStations, setTrendingStations] = useState<Station[]>([]);
  const [recentStations, setRecentStations] = useState<Station[]>([]);
  const [searchResults, setSearchResults] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const favoritesScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const stations = await apiRequest(API_CONFIG.ENDPOINTS.STATIONS);
        
        // Sort by Radio Browser popularity (clickcount + votes)
        const popularStations = [...stations].sort((a, b) => {
          const aScore = (a.clickcount || 0) + (a.votes || 0) * 2; // Weight votes higher
          const bScore = (b.clickcount || 0) + (b.votes || 0) * 2;
          return bScore - aScore;
        });
        
        // Sort by most recent (createdAt)
        const recentStations = [...stations].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setTrendingStations(popularStations.slice(0, 8));
        setRecentStations(recentStations.slice(0, 8));
        
        // Favorites are now managed globally in App.tsx
      } catch (err) {
        console.error('Failed to load stations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [isLoggedIn]);

  // Search entire database when searchTerm changes
  useEffect(() => {
    const searchStations = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const data = await apiRequest(buildApiUrl(API_CONFIG.ENDPOINTS.SEARCH, { q: searchTerm }));
        setSearchResults(data);
      } catch (err) {
        console.error('Failed to search stations:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    // Debounce search requests
    const timeoutId = setTimeout(searchStations, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const isFavorite = (stationId: number) => {
    return favorites.some(fav => fav.id === stationId);
  };

  const scrollFavorites = (direction: 'left' | 'right') => {
    if (favoritesScrollRef.current) {
      const scrollAmount = 280; // Approximate width of 2 cards
      const currentScroll = favoritesScrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      favoritesScrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  // Use search results if searching, otherwise use default content
  const showSearchResults = searchTerm.trim() !== '';
  const filteredTrending = showSearchResults ? [] : trendingStations;
  const filteredRecent = showSearchResults ? [] : recentStations;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .favorites-scroll::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <div className="p-6 space-y-8">
      {/* Hero Section - Desktop Only */}
      {!searchTerm && (
        <div className="hidden lg:block text-center py-4 lg:py-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            {isLoggedIn ? 'Welcome Back!' : 'Discover Radio Stations'}
          </h1>
          {isLoggedIn && (
            <p className="text-gray-600 mt-2">Your favorite stations and trending music</p>
          )}
        </div>
      )}

      {/* Search Results */}
      {showSearchResults && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              Search Results
              {searchResults.length > 0 && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({searchResults.length} stations)
                </span>
              )}
            </h2>
            {searching && (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          
          {searching ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {searchResults.map((station) => (
                <StationCard 
                  key={station.id} 
                  station={station} 
                  onPlay={() => handleStationClick(station)}
                  onInfo={onStationInfo}
                  isFavorite={isFavorite(station.id)}
                  onToggleFavorite={isLoggedIn ? onToggleFavorite : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No stations found
              </h3>
              <p className="text-gray-600">
                Try different keywords or check your spelling.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Your Favorites - Horizontal scrolling row */}
      {isLoggedIn && favorites.length > 0 && !showSearchResults && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaHeart className="text-2xl text-red-500" />
              Your Favorites
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              See All
            </button>
          </div>
          
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => scrollFavorites('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all duration-200"
            >
              <FaChevronLeft className="text-sm" />
            </button>
            
            {/* Right Arrow */}
            <button
              onClick={() => scrollFavorites('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all duration-200"
            >
              <FaChevronRight className="text-sm" />
            </button>
            
            <div 
              ref={favoritesScrollRef}
              className="flex gap-4 overflow-x-auto pb-4 px-10 favorites-scroll"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {favorites.slice(0, 8).map((station) => (
                <div key={station.id} className="flex-shrink-0 w-32">
                  <StationCard 
                    station={station} 
                    onPlay={() => handleStationClick(station)}
                    onInfo={onStationInfo}
                    isFavorite={true}
                    onToggleFavorite={onToggleFavorite}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending This Week */}
      {filteredTrending.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaFire className="text-orange-500" />
              Most Popular
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              See All
            </button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {filteredTrending.map((station) => (
              <StationCard 
                key={station.id} 
                station={station} 
                onPlay={() => handleStationClick(station)}
                onInfo={onStationInfo}
                isFavorite={isFavorite(station.id)}
                onToggleFavorite={isLoggedIn ? onToggleFavorite : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recently Added */}
      {filteredRecent.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              Recently Added
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              See All
            </button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {filteredRecent.map((station) => (
              <StationCard 
                key={station.id} 
                station={station} 
                onPlay={() => handleStationClick(station)}
                onInfo={onStationInfo}
                isFavorite={isFavorite(station.id)}
                onToggleFavorite={isLoggedIn ? onToggleFavorite : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* No Results - Only show when not searching */}
      {!showSearchResults && searchTerm && filteredTrending.length === 0 && filteredRecent.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📻</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No stations found
          </h3>
          <p className="text-gray-600">
            Try searching with different keywords or explore our categories.
          </p>
        </div>
      )}
    </div>
    </>
  );
}

// Station Card Component
interface StationCardProps {
  station: Station;
  onPlay: () => void;
  onInfo?: (station: Station) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (station: Station) => void;
}

function StationCard({ station, onPlay, onInfo, isFavorite = false, onToggleFavorite }: StationCardProps) {
  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onPlay
    onInfo?.(station);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onPlay
    onToggleFavorite?.(station);
  };
  
  return (
    <div 
      className="group cursor-pointer"
      onClick={onPlay}
    >
      {/* Icon */}
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        {getFaviconUrl(station, { width: 256, height: 256, quality: 85 }) ? (
          <img
            src={getFaviconUrl(station, { width: 256, height: 256, quality: 85 })!}
            alt={station.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = target.parentElement?.querySelector('.favicon-fallback') as HTMLElement;
              if (fallback) {
                fallback.classList.remove('hidden');
              }
            }}
          />
        ) : null}
        <div className={`favicon-fallback w-full h-full flex items-center justify-center ${getFaviconUrl(station, { width: 256, height: 256, quality: 85 }) ? 'hidden' : ''}`}>
          <img src="/streemr-play.png" alt="Streemr" className="w-24 h-24 object-contain" />
        </div>
        
        {/* Favorite button - top left */}
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 left-2 w-7 h-7 bg-white/80 text-red-500 hover:text-red-600 flex items-center justify-center opacity-100 transition-all duration-200 rounded-full shadow-sm"
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? <FaHeart className="text-xs" /> : <FaRegHeart className="text-xs" />}
          </button>
        )}
        
        {/* Info button - always visible on mobile, hover on desktop */}
        <button
          onClick={handleInfoClick}
          className="absolute top-2 right-2 w-7 h-7 bg-white text-black hover:text-gray-700 flex items-center justify-center opacity-100 transition-all duration-200 rounded-full shadow-sm text-sm"
          title="Station Info"
          style={{ fontFamily: 'Times, serif', fontStyle: 'italic', fontWeight: 'bold' }}
        >
          i
        </button>
      </div>
      
      {/* Title below icon */}
      <div className="mt-2">
        <h3 className="font-medium text-gray-900 text-xs text-center truncate">
          {station.name}
        </h3>
        <p className="text-xs text-gray-500 text-center truncate mt-0.5">
          {station.country}
        </p>
      </div>
    </div>
  );
}