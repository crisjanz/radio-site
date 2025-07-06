import { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight, FaFilter, FaX, FaHeart, FaRegHeart, FaGlobe, FaRadio, FaMusic, FaSignal } from 'react-icons/fa6';
import { API_CONFIG, getFaviconUrl } from '../config/api';
import type { Station } from '../types/Station';

interface BrowseAllContentProps {
  onPlayStation: (station: Station) => void;
  onStationInfo?: (station: Station) => void;
  onBack: () => void;
  searchTerm?: string;
  favorites?: Station[];
  onToggleFavorite?: (station: Station) => void;
  isLoggedIn?: boolean;
}

const STATIONS_PER_PAGE = 20;

// Normalized categories based on database analysis
const STATION_TYPES = [
  { value: 'music', label: 'Music' },
  { value: 'news', label: 'News' },
  { value: 'talk', label: 'Talk' },
  { value: 'sport', label: 'Sports' }
];

const MUSIC_GENRES = [
  { value: 'rock', label: 'Rock', keywords: ['rock', 'alternative rock', 'classic rock', 'active rock', 'modern rock'] },
  { value: 'country', label: 'Country', keywords: ['country'] },
  { value: 'pop', label: 'Pop', keywords: ['pop', 'adult contemporary', 'hot adult contemporary', 'adult hits', 'top 40'] },
  { value: 'jazz', label: 'Jazz', keywords: ['jazz', 'smooth jazz'] },
  { value: 'blues', label: 'Blues', keywords: ['blues'] },
  { value: 'classical', label: 'Classical', keywords: ['classical', 'classical music'] },
  { value: 'electronic', label: 'Electronic/Dance', keywords: ['electronic', 'dance', 'edm', 'techno', 'house'] },
  { value: 'hip-hop', label: 'Hip-Hop', keywords: ['hip-hop', 'hip hop', 'rap', 'urban'] },
  { value: 'alternative', label: 'Alternative/Indie', keywords: ['alternative', 'indie', 'independent'] },
  { value: 'folk', label: 'Folk', keywords: ['folk', 'folk music'] },
  { value: 'christian', label: 'Christian/Religious', keywords: ['christian', 'religious', 'gospel'] },
  { value: 'oldies', label: 'Oldies/Classic Hits', keywords: ['oldies', 'classic hits', '60s', '70s', '80s', 'retro'] }
];

interface FilterState {
  sortBy: string;
  country: string;
  genre: string;
  type: string;
  quality: string;
  liveOnly: boolean;
}

export default function BrowseAllContent({ 
  onPlayStation, 
  onStationInfo,
  onBack,
  searchTerm = '',
  favorites = [],
  onToggleFavorite,
  isLoggedIn = false
}: BrowseAllContentProps) {
  
  // Combined function to both play station and navigate to info page
  const handleStationClick = (station: Station) => {
    onPlayStation(station);
    onStationInfo?.(station);
  };
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStations, setTotalStations] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'popular',
    country: '',
    genre: '',
    type: '',
    quality: '',
    liveOnly: false
  });

  const API_BASE = API_CONFIG.BASE_URL;

  // Check if this is the main browse page (no back functionality)
  const isMainBrowsePage = !onBack || onBack.toString() === '() => {}';

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        let url;
        if (searchTerm.trim()) {
          // Use search endpoint if there's a search term
          url = `${API_BASE}/stations/search?q=${encodeURIComponent(searchTerm)}`;
        } else {
          // Use regular stations endpoint with pagination
          url = `${API_BASE}/stations?page=${currentPage}&limit=${STATIONS_PER_PAGE}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (searchTerm.trim()) {
            // Search returns an array directly
            setStations(data);
            setTotalStations(data.length);
          } else {
            // Regular endpoint returns paginated data
            setStations(data.stations || data);
            setTotalStations(data.total || data.length);
          }
        }
      } catch (err) {
        console.error('Failed to load stations:', err);
      } finally {
        setLoading(false);
      }
    };

    // Reset to page 1 when search term or filters change
    if ((searchTerm.trim() && currentPage !== 1) || (filters && currentPage !== 1)) {
      setCurrentPage(1);
    } else {
      fetchStations();
    }
  }, [currentPage, searchTerm, filters]);

  // Apply client-side filtering and sorting
  const getFilteredAndSortedStations = (stations: Station[]) => {
    let filtered = [...stations];

    // Apply filters
    if (filters.country) {
      filtered = filtered.filter(station => 
        station.country?.toLowerCase().includes(filters.country.toLowerCase())
      );
    }

    if (filters.genre) {
      filtered = filtered.filter(station => {
        if (!station.genre) return false;
        const stationGenre = station.genre.toLowerCase();
        
        // Find the selected genre configuration
        const selectedGenre = MUSIC_GENRES.find(g => g.value === filters.genre);
        if (selectedGenre) {
          // Check if any of the keywords match
          return selectedGenre.keywords.some(keyword => 
            stationGenre.includes(keyword.toLowerCase())
          );
        }
        
        // Fallback to direct match
        return stationGenre.includes(filters.genre.toLowerCase());
      });
    }

    if (filters.type) {
      filtered = filtered.filter(station => {
        if (!station.type) return false;
        return station.type.toLowerCase().includes(filters.type.toLowerCase());
      });
    }

    if (filters.quality) {
      const minBitrate = parseInt(filters.quality);
      filtered = filtered.filter(station => 
        station.bitrate && parseInt(station.bitrate.toString()) >= minBitrate
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'alphabetical-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'recent':
        // For now, reverse the array to simulate recent (would need actual timestamp)
        filtered.reverse();
        break;
      case 'bitrate':
        filtered.sort((a, b) => {
          const bitrateA = parseInt(a.bitrate?.toString() || '0');
          const bitrateB = parseInt(b.bitrate?.toString() || '0');
          return bitrateB - bitrateA;
        });
        break;
      case 'popular':
      default:
        // Keep default order (simulate popularity)
        break;
    }

    return filtered;
  };

  // Get filtered and sorted stations
  const filteredStations = !searchTerm.trim() ? getFilteredAndSortedStations(stations) : stations;
  const displayStations = filteredStations;
  const actualTotal = searchTerm.trim() ? totalStations : filteredStations.length;
  
  const totalPages = searchTerm.trim() ? 1 : Math.ceil(actualTotal / STATIONS_PER_PAGE);
  const showPagination = !searchTerm.trim() && totalPages > 1 && !filters.country && !filters.genre && !filters.type && !filters.quality;

  const handleInfoClick = (e: React.MouseEvent, station: Station) => {
    e.stopPropagation();
    onStationInfo?.(station);
  };

  // Helper function to check if station is favorite
  const isFavorite = (stationId: number) => {
    return favorites.some(fav => fav.id === stationId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        {!isMainBrowsePage && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
          >
            <FaArrowLeft />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {searchTerm.trim() ? `Search: "${searchTerm}"` : 'Browse Stations'}
          </h2>
          {isMainBrowsePage && (
            <p className="text-gray-600 text-sm mt-1">
              Explore our complete collection of radio stations
            </p>
          )}
        </div>
        {isMainBrowsePage && (
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); /* TODO: Show categories modal */ }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium hidden sm:block"
          >
            Browse Categories
          </a>
        )}
      </div>

      {/* Filters */}
      {!searchTerm.trim() && (
        <>
          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Sort:</span>
                <select 
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="recent">Recently Added</option>
                  <option value="alphabetical">A-Z</option>
                  <option value="alphabetical-desc">Z-A</option>
                  <option value="bitrate">Highest Quality</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Country:</span>
                <select 
                  value={filters.country}
                  onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Countries</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <select 
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  {STATION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Genre:</span>
                <select 
                  value={filters.genre}
                  onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Genres</option>
                  {MUSIC_GENRES.map(genre => (
                    <option key={genre.value} value={genre.value}>{genre.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Quality:</span>
                <select 
                  value={filters.quality}
                  onChange={(e) => setFilters(prev => ({ ...prev, quality: e.target.value }))}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Quality</option>
                  <option value="128">High (128kbps+)</option>
                  <option value="320">Premium (320kbps)</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={() => setFilters({ sortBy: 'popular', country: '', genre: '', type: '', quality: '', liveOnly: false })}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Clear Filters
            </button>
          </div>

          {/* Mobile Filters */}
          <div className="lg:hidden bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium text-gray-700">Sort:</span>
                <select 
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1"
                >
                  <option value="popular">Most Popular</option>
                  <option value="recent">Recently Added</option>
                  <option value="alphabetical">A-Z</option>
                  <option value="alphabetical-desc">Z-A</option>
                  <option value="bitrate">Highest Quality</option>
                </select>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaFilter className="text-xs" />
                Filters {(filters.country || filters.genre || filters.type || filters.quality) && '(•)'}
              </button>
            </div>
            
            {/* Active Filter Chips */}
            {(filters.country || filters.genre || filters.type || filters.quality) && (
              <div className="flex flex-wrap gap-2">
                {filters.country && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    <FaGlobe className="text-xs" /> {filters.country}
                    <button onClick={() => setFilters(prev => ({ ...prev, country: '' }))}>
                      <FaX className="text-xs" />
                    </button>
                  </span>
                )}
                {filters.type && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    <FaRadio className="text-xs" /> {STATION_TYPES.find(t => t.value === filters.type)?.label || filters.type}
                    <button onClick={() => setFilters(prev => ({ ...prev, type: '' }))}>
                      <FaX className="text-xs" />
                    </button>
                  </span>
                )}
                {filters.genre && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    <FaMusic className="text-xs" /> {MUSIC_GENRES.find(g => g.value === filters.genre)?.label || filters.genre}
                    <button onClick={() => setFilters(prev => ({ ...prev, genre: '' }))}>
                      <FaX className="text-xs" />
                    </button>
                  </span>
                )}
                {filters.quality && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    <FaSignal className="text-xs" /> {filters.quality === '128' ? 'High Quality' : 'Premium'}
                    <button onClick={() => setFilters(prev => ({ ...prev, quality: '' }))}>
                      <FaX className="text-xs" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Stats */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <p className="text-gray-600 text-sm">
          {searchTerm.trim() ? (
            `Found ${totalStations} stations matching "${searchTerm}"`
          ) : (
            <>
              <span className="hidden sm:inline">
                {(filters.country || filters.genre || filters.type || filters.quality) ? (
                  `Showing ${actualTotal} filtered stations`
                ) : (
                  `Showing ${((currentPage - 1) * STATIONS_PER_PAGE) + 1}-${Math.min(currentPage * STATIONS_PER_PAGE, actualTotal)} of ${actualTotal} stations`
                )}
              </span>
              <span className="sm:hidden">
                {(filters.country || filters.genre || filters.type || filters.quality) ? (
                  `${actualTotal} stations`
                ) : (
                  `Page ${currentPage} of ${Math.ceil(actualTotal / STATIONS_PER_PAGE)} • ${actualTotal} total`
                )}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Stations Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayStations.map((station) => (
          <StationCard 
            key={station.id} 
            station={station} 
            onPlay={() => handleStationClick(station)}
            onInfo={onStationInfo ? (e) => handleInfoClick(e, station) : undefined}
            isFavorite={isFavorite(station.id)}
            onToggleFavorite={isLoggedIn ? onToggleFavorite : undefined}
          />
        ))}
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-center gap-2 sm:gap-4 py-8 px-4 overflow-x-auto">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <FaArrowLeft className="text-sm" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              const startPage = Math.max(1, currentPage - 1);
              const pageNum = startPage + i;
              
              if (pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <span className="hidden sm:inline">Next</span>
            <FaArrowRight className="text-sm" />
          </button>
        </div>
      )}

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white rounded-t-xl w-full max-h-[70vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <FaX />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select 
                  value={filters.country}
                  onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Countries</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select 
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  {STATION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                <select 
                  value={filters.genre}
                  onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Genres</option>
                  {MUSIC_GENRES.map(genre => (
                    <option key={genre.value} value={genre.value}>{genre.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Audio Quality</label>
                <select 
                  value={filters.quality}
                  onChange={(e) => setFilters(prev => ({ ...prev, quality: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Quality Levels</option>
                  <option value="128">High Quality (128kbps+)</option>
                  <option value="320">Premium Quality (320kbps)</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setFilters({ sortBy: filters.sortBy, country: '', genre: '', type: '', quality: '', liveOnly: false });
                    setShowFilters(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Station Card Component
interface StationCardProps {
  station: Station;
  onPlay: () => void;
  onInfo?: (e: React.MouseEvent) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (station: Station) => void;
}

function StationCard({ station, onPlay, onInfo, isFavorite = false, onToggleFavorite }: StationCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(station);
  };
  return (
    <div 
      className="group cursor-pointer"
      onClick={onPlay}
    >
      {/* Icon */}
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        {getFaviconUrl(station) ? (
          <img
            src={getFaviconUrl(station)!}
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
        <div className={`favicon-fallback w-full h-full flex items-center justify-center ${getFaviconUrl(station) ? 'hidden' : ''}`}>
          <img src="/streemr-play.png" alt="Streemr" className="w-24 h-24 object-contain" />
        </div>
        
        {/* Favorite button - top left */}
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 left-2 w-8 h-8 text-red-500 hover:text-red-600 flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200"
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? <FaHeart className="text-sm" /> : <FaRegHeart className="text-sm" />}
          </button>
        )}
        
        {/* Info button */}
        {onInfo && (
          <button
            onClick={onInfo}
            className="absolute top-2 right-2 w-7 h-7 bg-white text-black hover:text-gray-700 flex items-center justify-center opacity-100 transition-all duration-200 rounded-full shadow-sm text-xs"
            title="Station Info"
            style={{ fontFamily: 'Times, serif', fontStyle: 'italic', fontWeight: 'bold' }}
          >
            i
          </button>
        )}
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