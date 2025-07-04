import { FaPlay, FaPause, FaSpinner } from 'react-icons/fa';
import { getFaviconUrl, getProxyFaviconUrl } from '../config/api';
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
            {getFaviconUrl(station) ? (
              <img
                src={getFaviconUrl(station)!}
                alt={`${station.name} logo`}
                className="w-full h-full object-fill"
                style={{ width: '100%', height: '100%' }}
                data-original-url={station.favicon}
                data-attempt="https"
                onError={(e) => {
                  const target = e.currentTarget;
                  const attempt = target.getAttribute('data-attempt');
                  const originalUrl = target.getAttribute('data-original-url');
                  
                  // If this was the HTTPS attempt and original was HTTP, try the proxy
                  if (attempt === 'https' && originalUrl?.startsWith('http://')) {
                    target.src = getProxyFaviconUrl(station.id);
                    target.setAttribute('data-attempt', 'proxy');
                    return;
                  }
                  
                  // Otherwise, show fallback
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.favicon-fallback') as HTMLElement;
                  if (fallback) {
                    fallback.classList.remove('hidden');
                  }
                }}
              />
            ) : null}
            <div className={`favicon-fallback w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${getFaviconUrl(station) ? 'hidden' : ''}`}>
              <img src="/streemr-play.png" alt="Streemr" className="w-16 h-16 object-contain" />
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
              className="w-8 h-8 bg-white text-black hover:text-gray-700 flex items-center justify-center transition-all duration-200 rounded-full shadow-sm text-sm"
              title="Station Info"
              style={{ fontFamily: 'Times, serif', fontStyle: 'italic', fontWeight: 'bold' }}
            >
              i
            </button>
          )}
        </div>
      </div>
    </div>
  );
}