import { useState, useEffect } from 'react';
import { FaPlay, FaFire, FaGlobe, FaMusic, FaInfoCircle } from 'react-icons/fa';
import type { Station } from '../types/Station';

interface HomeContentProps {
  searchTerm: string;
  onPlayStation: (station: Station) => void;
  onNavigateToDiscover: () => void;
  onStationInfo?: (station: Station) => void;
  isLoggedIn?: boolean;
}

export default function HomeContent({ 
  searchTerm, 
  onPlayStation,
  onNavigateToDiscover,
  onStationInfo,
  isLoggedIn = false
}: HomeContentProps) {
  const [trendingStations, setTrendingStations] = useState<Station[]>([]);
  const [recentStations, setRecentStations] = useState<Station[]>([]);
  const [favoriteStations, setFavoriteStations] = useState<Station[]>([]);
  const [searchResults, setSearchResults] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('http://192.168.1.69:3001/stations');
        if (response.ok) {
          const stations = await response.json();
          // For now, simulate trending by taking random subset
          const shuffled = stations.sort(() => 0.5 - Math.random());
          setTrendingStations(shuffled.slice(0, 8));
          setRecentStations(shuffled.slice(8, 16));
          
          // Simulate favorite stations for logged in users
          if (isLoggedIn) {
            setFavoriteStations(shuffled.slice(16, 20)); // Simulate 4 favorites
          }
        }
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
        const response = await fetch(`http://192.168.1.69:3001/stations/search?q=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        } else {
          console.error('Search request failed:', response.status, response.statusText);
          setSearchResults([]);
        }
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
    <div className="space-y-8">
      {/* Hero Section */}
      {!searchTerm && (
        <div className="text-center py-4 lg:py-8">
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
                  onPlay={() => onPlayStation(station)}
                  onInfo={onStationInfo}
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

      {/* Your Favorites - Only show for logged in users */}
      {isLoggedIn && favoriteStations.length > 0 && !showSearchResults && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">❤️</span>
              Your Favorites
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Manage
            </button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {favoriteStations.map((station) => (
              <StationCard 
                key={station.id} 
                station={station} 
                onPlay={() => onPlayStation(station)}
                onInfo={onStationInfo}
              />
            ))}
          </div>
        </section>
      )}

      {/* Trending This Week */}
      {filteredTrending.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaFire className="text-orange-500" />
              Trending This Week
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
                onPlay={() => onPlayStation(station)}
                onInfo={onStationInfo}
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
                onPlay={() => onPlayStation(station)}
                onInfo={onStationInfo}
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
  );
}

// Station Card Component
interface StationCardProps {
  station: Station;
  onPlay: () => void;
  onInfo?: (station: Station) => void;
}

function StationCard({ station, onPlay, onInfo }: StationCardProps) {
  console.log('Station data:', station.name, 'favicon:', station.favicon);
  
  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onPlay
    onInfo?.(station);
  };
  
  return (
    <div 
      className="group cursor-pointer"
      onClick={onPlay}
    >
      {/* Icon */}
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        {station.favicon && station.favicon.trim() !== '' ? (
          <img
            src={station.favicon}
            alt={station.name}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              console.log('Favicon failed to load:', station.favicon);
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = target.parentElement?.querySelector('.favicon-fallback') as HTMLElement;
              if (fallback) {
                fallback.classList.remove('hidden');
              }
            }}
          />
        ) : null}
        <div className={`favicon-fallback flex items-center justify-center text-gray-500 text-2xl ${station.favicon && station.favicon.trim() !== '' ? 'hidden' : ''}`}>
          <FaMusic />
        </div>
        
        {/* Info button - always visible on mobile, hover on desktop */}
        <button
          onClick={handleInfoClick}
          className="absolute top-2 right-2 w-8 h-8 text-gray-600 hover:text-gray-800 flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200"
          title="Station Info"
        >
          <FaInfoCircle className="text-sm" />
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