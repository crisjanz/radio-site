import { FaPlay, FaPause, FaMusic, FaSpinner } from 'react-icons/fa';
import type { Station } from '../types/Station';

interface MobilePlayerProps {
  station: Station;
  isPlaying: boolean;
  isLoading?: boolean;
  onPlayPause: () => void;
  onStationInfo?: (station: Station) => void;
}

export default function MobilePlayer({ 
  station, 
  isPlaying, 
  isLoading = false,
  onPlayPause, 
  onStationInfo 
}: MobilePlayerProps) {
  return (
    <div className="lg:hidden fixed left-0 right-0 bg-white z-30" style={{ bottom: '3.25rem' }}>
        <div className="flex items-center px-4 py-3">
          {/* Station Logo */}
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 mr-3">
            {station.favicon ? (
              <img
                src={station.favicon}
                alt={`${station.name} logo`}
                className="w-full h-full object-fill"
                style={{ width: '100%', height: '100%' }}
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
            <div className={`favicon-fallback w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm ${station.favicon ? 'hidden' : ''}`}>
              <FaMusic />
            </div>
          </div>

        {/* Station Info */}
        <div className="flex-1 min-w-0 mr-3" onClick={() => onStationInfo?.(station)}>
          <h3 className="text-sm font-medium text-gray-900 truncate">{station.name}</h3>
          <p className="text-xs text-gray-600 truncate">
            {station.city ? `${station.city}, ${station.country}` : station.country}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPlayPause}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            {isLoading ? (
              <FaSpinner className="text-sm animate-spin" />
            ) : isPlaying ? (
              <FaPause className="text-sm" />
            ) : (
              <FaPlay className="text-sm ml-0.5" />
            )}
          </button>
          
          {onStationInfo && (
            <button
              onClick={() => onStationInfo(station)}
              className="w-8 h-8 bg-white text-black hover:text-gray-700 flex items-center justify-center transition-all duration-200 rounded-full shadow-sm font-bold text-sm border border-gray-200"
              title="Station Info"
            >
              i
            </button>
          )}
        </div>
      </div>
    </div>
  );
}