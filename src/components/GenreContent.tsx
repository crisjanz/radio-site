import { useState, useEffect } from 'react';
import { FaMusic, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';
import type { Station } from '../types/Station';
import { API_CONFIG } from '../config/api';



interface GenreContentProps {
  onPlayStation: (station: Station) => void;
  onStationInfo?: (station: Station) => void;
  onBack: () => void;
}

interface GenreGroup {
  genre: string;
  count: number;
  stations: Station[];
}

export default function GenreContent({ 
  onPlayStation, 
  onStationInfo,
  onBack 
}: GenreContentProps) {
  const [genres, setGenres] = useState<GenreGroup[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stationsLoading, setStationsLoading] = useState(false);

  const API_BASE = API_CONFIG.BASE_URL;

  useEffect(() => {
    const fetchGenres = async () => {
      setLoading(true);
      try {
        const response = await fetch('${API_BASE}/stations/genres');
        if (response.ok) {
          const data = await response.json();
          setGenres(data);
        }
      } catch (err) {
        console.error('Failed to load genres:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  const handleGenreSelect = async (genre: string) => {
    setSelectedGenre(genre);
    setStationsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/stations?genre=${encodeURIComponent(genre)}`);
      if (response.ok) {
        const stations = await response.json();
        setGenres(prev => prev.map(g => 
          g.genre === genre ? { ...g, stations } : g
        ));
      }
    } catch (err) {
      console.error('Failed to load stations for genre:', err);
    } finally {
      setStationsLoading(false);
    }
  };

  const handleInfoClick = (e: React.MouseEvent, station: Station) => {
    e.stopPropagation();
    onStationInfo?.(station);
  };

  const selectedGenreData = genres.find(g => g.genre === selectedGenre);

  const getGenreIcon = (genre: string) => {
    const lowerGenre = genre.toLowerCase();
    if (lowerGenre.includes('rock')) return '🎸';
    if (lowerGenre.includes('jazz')) return '🎺';
    if (lowerGenre.includes('classical')) return '🎼';
    if (lowerGenre.includes('pop')) return '🎤';
    if (lowerGenre.includes('hip hop') || lowerGenre.includes('rap')) return '🎤';
    if (lowerGenre.includes('country')) return '🤠';
    if (lowerGenre.includes('electronic') || lowerGenre.includes('dance')) return '🎛️';
    if (lowerGenre.includes('blues')) return '🎵';
    if (lowerGenre.includes('reggae')) return '🌴';
    if (lowerGenre.includes('folk')) return '🪕';
    if (lowerGenre.includes('latin')) return '💃';
    if (lowerGenre.includes('world')) return '🌍';
    if (lowerGenre.includes('news') || lowerGenre.includes('talk')) return '📻';
    return '🎵';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={selectedGenre ? () => setSelectedGenre(null) : onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {selectedGenre ? `${selectedGenre} Stations` : 'Browse by Genre'}
        </h2>
      </div>

      {!selectedGenre ? (
        <>
          {/* Stats */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-gray-600">
              {genres.length} genres available
            </p>
          </div>

          {/* Genres Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <button
                key={genre.genre}
                onClick={() => handleGenreSelect(genre.genre)}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform text-xl">
                    {getGenreIcon(genre.genre)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {genre.genre}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {genre.count} station{genre.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Selected Genre Header */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {getGenreIcon(selectedGenre)}
              </div>
              <p className="text-gray-600">
                {selectedGenreData?.count || 0} {selectedGenre.toLowerCase()} stations
              </p>
            </div>
          </div>

          {/* Stations Grid */}
          {stationsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {(selectedGenreData?.stations || []).map((station) => (
                <StationCard 
                  key={station.id} 
                  station={station} 
                  onPlay={() => onPlayStation(station)}
                  onInfo={onStationInfo ? (e) => handleInfoClick(e, station) : undefined}
                />
              ))}
            </div>
          )}

          {selectedGenreData?.stations?.length === 0 && !stationsLoading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No stations found
              </h3>
              <p className="text-gray-600">
                No {selectedGenre.toLowerCase()} stations available
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Station Card Component
interface StationCardProps {
  station: Station;
  onPlay: () => void;
  onInfo?: (e: React.MouseEvent) => void;
}

function StationCard({ station, onPlay, onInfo }: StationCardProps) {
  return (
    <div 
      className="group cursor-pointer"
      onClick={onPlay}
    >
      {/* Icon */}
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        {station.favicon && station.favicon.trim() !== '' ? (
          <img
            src={station.favicon}
            alt={station.name}
            className="w-full h-full object-cover"
            onLoad={(e) => {
              const img = e.currentTarget;
              const aspectRatio = img.naturalWidth / img.naturalHeight;
              
              // If image is very wide or very tall, use contain with padding
              if (aspectRatio > 2 || aspectRatio < 0.5) {
                img.className = "w-full h-full object-contain p-2";
              } else {
                // For roughly square images, use cover to fill
                img.className = "w-full h-full object-cover";
              }
            }}
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
        <div className={`favicon-fallback flex items-center justify-center text-gray-500 text-2xl ${station.favicon && station.favicon.trim() !== '' ? 'hidden' : ''}`}>
          <FaMusic />
        </div>
        
        {/* Info button */}
        {onInfo && (
          <button
            onClick={onInfo}
            className="absolute top-2 right-2 w-8 h-8 text-gray-600 hover:text-gray-800 flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200"
            title="Station Info"
          >
            <FaInfoCircle className="text-sm" />
          </button>
        )}
      </div>
      
      {/* Title below icon */}
      <div className="mt-2">
        <h3 className="font-medium text-gray-900 text-xs text-center truncate">
          {station.name}
        </h3>
        <p className="text-xs text-gray-500 text-center truncate mt-0.5">
          {station.genre || station.country}
        </p>
      </div>
    </div>
  );
}