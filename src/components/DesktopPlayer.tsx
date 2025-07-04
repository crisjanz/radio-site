import { FaPlay, FaPause, FaVolumeUp, FaVolumeDown, FaVolumeMute, FaMusic, FaSpinner } from 'react-icons/fa';
import type { Station } from '../types/Station';

interface DesktopPlayerProps {
  station: Station;
  isPlaying: boolean;
  isLoading?: boolean;
  onPlayPause: () => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export default function DesktopPlayer({ 
  station, 
  isPlaying, 
  isLoading = false,
  onPlayPause,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute
}: DesktopPlayerProps) {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    onVolumeChange(newVolume);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return FaVolumeMute;
    if (volume < 50) return FaVolumeDown;
    return FaVolumeUp;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div className="hidden lg:flex items-center justify-between bg-white border-t border-gray-200 px-6 py-3">
      {/* Station Info & Controls */}
      <div className="flex items-center gap-4 flex-1">
        {/* Station Logo */}
        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
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
          <div className={`favicon-fallback w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${station.favicon ? 'hidden' : ''}`}>
            <img src="/streemr-play.png" alt="Streemr" className="w-8 h-8 object-contain" />
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={onPlayPause}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          {isLoading ? (
            <FaSpinner className="text-lg animate-spin" />
          ) : isPlaying ? (
            <FaPause className="text-lg" />
          ) : (
            <FaPlay className="text-lg ml-0.5" />
          )}
        </button>

        {/* Station Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{station.name}</h3>
          <p className="text-xs text-gray-600 truncate">
            {station.city ? `${station.city}, ${station.country}` : station.country}
            {station.genre && ` • ${station.genre}`}
          </p>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <VolumeIcon className="text-sm" />
          </button>
          
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* Streemr Branding */}
      <div className="ml-6 flex-shrink-0">
        <div className="w-60 h-12 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg flex items-center justify-center gap-2">
          <img src="/streemr-play.png" alt="Streemr" className="w-6 h-6" />
          <span className="text-xs font-medium text-gray-700">Powered by Streemr</span>
        </div>
      </div>
    </div>
  );
}