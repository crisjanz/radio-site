import { FaHeart, FaUser } from 'react-icons/fa6';
import { getFaviconUrl } from '../config/api';
import type { Station } from '../types/Station';

interface FavoritesContentProps {
  favorites: Station[];
  onPlayStation: (station: Station) => void;
  onStationInfo: (station: Station) => void;
  onToggleFavorite: (station: Station) => void;
  isLoggedIn: boolean;
  onLogin?: () => void;
  user?: { email: string } | null;
}

export default function FavoritesContent({ 
  favorites, 
  onPlayStation, 
  onStationInfo, 
  onToggleFavorite,
  isLoggedIn,
  onLogin,
  user
}: FavoritesContentProps) {
  
  // Combined function to both play station and navigate to info page
  const handleStationClick = (station: Station) => {
    onPlayStation(station);
    onStationInfo(station);
  };
  if (!isLoggedIn) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
        <div className="text-6xl mb-4 text-red-500"><FaHeart /></div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Your Favorites
        </h3>
        <p className="text-gray-600 mb-6">
          Sign in to save your favorite stations and sync them across devices.
        </p>
        <button 
          onClick={onLogin}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
        <div className="text-6xl mb-4 text-red-500"><FaHeart /></div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Favorites Yet
        </h3>
        <p className="text-gray-600">
          Start adding stations to your favorites by clicking the heart icon on any station.
        </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaHeart className="text-red-500" />
          Your Favorites ({favorites.length})
        </h2>
        
        {/* Login/Logout Button - Mobile & Desktop */}
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-600 hidden sm:block">
              {user.email}
            </span>
          )}
          <button
            onClick={onLogin}
            className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg transition-colors text-red-600 border-red-300 hover:bg-red-50"
          >
            <FaUser className="text-xs" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {favorites.map((station) => (
          <StationCard 
            key={station.id} 
            station={station} 
            onPlay={() => handleStationClick(station)}
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
        {getFaviconUrl(station, { width: 128, height: 128, quality: 85 }) ? (
          <img
            src={getFaviconUrl(station, { width: 128, height: 128, quality: 85 })!}
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
        <div className={`favicon-fallback w-full h-full flex items-center justify-center ${getFaviconUrl(station, { width: 128, height: 128, quality: 85 }) ? 'hidden' : ''}`}>
          <img src="/streemr-play.png" alt="Streemr" className="w-24 h-24 object-contain" />
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
          className="absolute top-2 right-2 w-7 h-7 bg-white text-black hover:text-gray-700 flex items-center justify-center opacity-100 transition-all duration-200 rounded-full shadow-sm text-xs"
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
          {station.city ? `${station.city}, ${station.country}` : station.country}
        </p>
      </div>
    </div>
  );
}