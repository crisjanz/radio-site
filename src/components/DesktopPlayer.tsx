import { useState, useEffect } from 'react';
import { FaPlay, FaStop, FaSpinner, FaMusic, FaRadio } from 'react-icons/fa6';
import { FaVolumeUp, FaVolumeDown, FaVolumeMute } from 'react-icons/fa';
import type { Station } from '../types/Station';
import { fetchStreamMetadata } from '../utils/streamMetadata';
import AdBanner from './AdBanner';

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
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [metadataChecked, setMetadataChecked] = useState(false);

  // Fetch metadata when station changes or starts playing
  useEffect(() => {
    if (!station || !isPlaying) {
      setCurrentSong(null);
      setMetadataChecked(false);
      return;
    }

    // Reset metadata state for new station
    setCurrentSong(null);
    setMetadataChecked(false);

    // Fetch metadata
    const fetchMetadata = async () => {
      try {
        console.log('🎵 Fetching metadata for:', station.name);
        const metadata = await fetchStreamMetadata(station.streamUrl);
        console.log('🎵 Metadata response:', metadata);
        
        setMetadataChecked(true);
        
        if (metadata?.song || metadata?.title) {
          console.log('🎵 Setting current song:', metadata.song || metadata.title);
          setCurrentSong(metadata.song || metadata.title || null);
        } else if (metadata?.hasMetadataSupport) {
          console.log('🎵 Stream supports metadata but no current song');
          setCurrentSong('METADATA_SUPPORTED'); // Special marker for metadata support
        } else {
          console.log('🎵 No song data in metadata response');
          setCurrentSong(null);
        }
      } catch (error) {
        console.debug('Failed to fetch metadata:', error);
        setMetadataChecked(true);
        setCurrentSong(null);
      }
    };

    fetchMetadata();

    // Poll for metadata updates every 30 seconds while playing
    const metadataInterval = setInterval(() => {
      if (isPlaying) {
        fetchMetadata();
      }
    }, 30000);

    return () => {
      clearInterval(metadataInterval);
    };
  }, [station, isPlaying]);

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
            <img src="/streemr-play.png" alt="Streemr" className="w-12 h-12 object-contain" />
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={onPlayPause}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          {isLoading && isPlaying ? (
            <FaSpinner className="text-lg animate-spin" />
          ) : isPlaying ? (
            <FaStop className="text-lg" />
          ) : (
            <FaPlay className="text-lg ml-0.5" />
          )}
        </button>

        {/* Station Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{station.name}</h3>
          
          {/* Current song/metadata info */}
          {currentSong && currentSong !== 'METADATA_SUPPORTED' ? (
            <div className="text-xs font-medium text-blue-600 mb-1 truncate flex items-center gap-1">
              <FaMusic className="text-xs" />
              {currentSong}
            </div>
          ) : (isPlaying && (metadataChecked || currentSong === 'METADATA_SUPPORTED')) ? (
            <div className="text-xs text-gray-500 mb-1 italic flex items-center gap-1">
              <FaRadio className="text-xs" />
              Live Radio
            </div>
          ) : null}
          
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

      {/* Ad Banner - Desktop Player */}
      <div className="ml-6 flex-shrink-0">
        <AdBanner 
          adSlot="DESKTOP_PLAYER_BANNER"
          className="w-60 h-12"
          style={{ minWidth: '240px', minHeight: '48px' }}
        />
      </div>
    </div>
  );
}