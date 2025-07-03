import { FaHeart, FaMusic, FaInfoCircle, FaRegHeart } from 'react-icons/fa';
import type { Station } from '../types/Station';

interface FavoritesContentProps {
  favorites: Station[];
  onPlayStation: (station: Station) => void;
  onStationInfo: (station: Station) => void;
  onToggleFavorite: (station: Station) => void;
  isLoggedIn: boolean;
}

export default function FavoritesContent({ 
  favorites, 
  onPlayStation, 
  onStationInfo, 
  onToggleFavorite,
  isLoggedIn 
}: FavoritesContentProps) {
  if (!isLoggedIn) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❤️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Your Favorites
        </h3>
        <p className="text-gray-600 mb-6">
          Sign in to save your favorite stations and sync them across devices.
        </p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❤️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Favorites Yet
        </h3>
        <p className="text-gray-600">
          Start adding stations to your favorites by clicking the heart icon on any station.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaHeart className="text-red-500" />
          Your Favorites ({favorites.length})
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {favorites.map((station) => (
          <StationCard 
            key={station.id} 
            station={station} 
            onPlay={() => onPlayStation(station)}
            onInfo={onStationInfo}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}

// Station Card Component for Favorites
interface StationCardProps {
  station: Station;
  onPlay: () => void;
  onInfo: (station: Station) => void;
  onToggleFavorite: (station: Station) => void;
}

function StationCard({ station, onPlay, onInfo, onToggleFavorite }: StationCardProps) {
  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInfo(station);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(station);
  };

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
        
        {/* Favorite button - top left */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 left-2 w-8 h-8 text-red-500 hover:text-red-600 flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200"
          title="Remove from favorites"
        >
          <FaHeart className="text-sm" />
        </button>
        
        {/* Info button */}
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
          {station.city ? `${station.city}, ${station.country}` : station.country}
        </p>
      </div>
    </div>
  );
}