import { useState, useEffect } from 'react';
import { FaPlay, FaStop, FaSpinner, FaChevronDown, FaHeart, FaRegHeart, FaInfo, FaVolumeHigh, FaVolumeLow, FaVolumeOff, FaMusic, FaRadio } from 'react-icons/fa6';
import { getFaviconUrl } from '../config/api';
import { fetchStreamMetadata, getBestArtwork } from '../utils/streamMetadata';
import type { Station } from '../types/Station';

interface FullScreenPlayerProps {
  station: Station;
  isPlaying: boolean;
  isLoading?: boolean;
  volume: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onMinimize: () => void;
  onStationInfo: (station: Station) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (station: Station) => void;
  isLoggedIn?: boolean;
}

export default function FullScreenPlayer({
  station,
  isPlaying,
  isLoading = false,
  volume,
  isMuted,
  onPlayPause,
  onMinimize,
  onStationInfo,
  onVolumeChange,
  onToggleMute,
  isFavorite = false,
  onToggleFavorite,
  isLoggedIn = false
}: FullScreenPlayerProps) {
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [currentArtwork, setCurrentArtwork] = useState<string | null>(null);
  const [metadataChecked, setMetadataChecked] = useState(false);
  const [isRequestingMetadata, setIsRequestingMetadata] = useState(false);

  // Fetch metadata when station changes or starts playing
  useEffect(() => {
    if (!station || !isPlaying) {
      setCurrentSong(null);
      setCurrentArtwork(null);
      setMetadataChecked(false);
      return;
    }

    // Reset metadata state for new station
    setCurrentSong(null);
    setCurrentArtwork(null);
    setMetadataChecked(false);

    // Fetch metadata
    const fetchMetadata = async () => {
      if (isRequestingMetadata) {
        return;
      }
      
      try {
        setIsRequestingMetadata(true);
        const metadata = await fetchStreamMetadata(station.id);
        
        setMetadataChecked(true);
        
        if (metadata?.song || metadata?.title) {
          setCurrentSong(metadata.song || metadata.title || null);
          
          // Set artwork if available
          if (metadata.artwork) {
            const artworkUrl = getBestArtwork(metadata.artwork, 'large'); // Full screen uses large images
            setCurrentArtwork(artworkUrl);
          } else {
            setCurrentArtwork(null);
          }
        } else if (metadata?.hasMetadataSupport) {
          setCurrentSong('METADATA_SUPPORTED');
          setCurrentArtwork(null);
        } else {
          setCurrentSong(null);
          setCurrentArtwork(null);
        }
      } catch (error) {
        setMetadataChecked(true);
        setCurrentSong(null);
        setCurrentArtwork(null);
      } finally {
        setIsRequestingMetadata(false);
      }
    };

    fetchMetadata();

    // Poll for metadata updates every 15 seconds while playing
    const metadataInterval = setInterval(() => {
      if (isPlaying) {
        fetchMetadata();
      }
    }, 15000);

    return () => {
      clearInterval(metadataInterval);
    };
  }, [station, isPlaying]);

  const handleFavoriteClick = () => {
    if (isLoggedIn && onToggleFavorite) {
      onToggleFavorite(station);
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return FaVolumeOff;
    if (volume < 50) return FaVolumeLow;
    return FaVolumeHigh;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div className="lg:hidden fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="w-10"></div> {/* Spacer for centering */}
        
        <button 
          onClick={onMinimize}
          className="text-center flex flex-col items-center p-2 hover:text-gray-600 transition-colors"
        >
          <FaChevronDown className="text-gray-400 text-sm" />
          <FaChevronDown className="text-gray-400 text-sm -mt-1" />
        </button>
        
        <div className="flex items-center gap-2">
          {isLoggedIn && onToggleFavorite && (
            <button
              onClick={handleFavoriteClick}
              className="p-2 text-red-500 hover:text-red-600 transition-colors"
            >
              {isFavorite ? <FaHeart className="text-lg" /> : <FaRegHeart className="text-lg" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-8 py-6">
        {/* Station/Track Artwork */}
        <div className="w-80 h-80 mx-auto mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg relative">
          {/* Track artwork (highest priority) */}
          {currentArtwork ? (
            <img
              src={currentArtwork}
              alt="Track artwork"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                // Show station logo fallback
                const stationLogo = target.parentElement?.querySelector('.station-logo') as HTMLElement;
                if (stationLogo) {
                  stationLogo.classList.remove('hidden');
                }
              }}
            />
          ) : null}
          
          {/* Station logo (medium priority) */}
          {getFaviconUrl(station, { width: 320, height: 320, quality: 90, cacheBust: true }) ? (
            <img
              src={getFaviconUrl(station, { width: 320, height: 320, quality: 90, cacheBust: true })!}
              alt={`${station.name} logo`}
              className={`station-logo w-full h-full object-cover ${currentArtwork ? 'hidden' : ''}`}
            />
          ) : null}
          
          {/* Streemr logo fallback (lowest priority) */}
          <div className={`streemr-fallback w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${(currentArtwork || getFaviconUrl(station, { width: 320, height: 320, quality: 90, cacheBust: true })) ? 'hidden' : ''}`}>
            <img src="/streemr-play.png" alt="Streemr" className="w-32 h-32 object-contain" />
          </div>
        </div>

        {/* Track/Station Info */}
        <div className="text-center mb-8">
          {/* Current song/metadata info */}
          {currentSong && currentSong !== 'METADATA_SUPPORTED' ? (
            <div className="mb-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <FaMusic className="text-blue-600 text-sm" />
                <span className="text-sm font-medium text-blue-600">Now Playing</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 leading-tight px-4">
                {currentSong}
              </h2>
            </div>
          ) : (isPlaying && (metadataChecked || currentSong === 'METADATA_SUPPORTED')) ? (
            <div className="mb-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <FaRadio className="text-blue-600 text-sm" />
                <span className="text-sm font-medium text-blue-600">Live Radio</span>
              </div>
            </div>
          ) : null}
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
            {station.name}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {station.city ? `${station.city}, ${station.country}` : station.country}
          </p>
          
          {/* More Info Link */}
          <button
            onClick={() => onStationInfo(station)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mx-auto text-sm font-medium"
          >
            <FaInfo className="text-xs" />
            More Info
          </button>
        </div>

        {/* Volume Control */}
        <div className="mb-8">
          <div className="flex items-center gap-4 max-w-xs mx-auto">
            <button
              onClick={onToggleMute}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <VolumeIcon className="text-lg" />
            </button>
            
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  '--slider-percent': `${isMuted ? 0 : volume}%`
                } as React.CSSProperties}
              />
            </div>
            
            <span className="text-sm text-gray-500 w-8 text-right">
              {isMuted ? 0 : volume}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center">
          <button
            onClick={onPlayPause}
            className="w-20 h-20 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg"
          >
            {isLoading && isPlaying ? (
              <FaSpinner className="text-2xl animate-spin" />
            ) : isPlaying ? (
              <FaStop className="text-2xl" />
            ) : (
              <FaPlay className="text-2xl ml-1" />
            )}
          </button>
        </div>

        {/* Ad Space Placeholder */}
        <div className="mt-8">
          <div 
            className="h-12 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center"
            style={{ display: 'none' }} // Hidden for now
          >
            <span className="text-xs text-gray-400">Ad Space</span>
          </div>
        </div>
      </div>
    </div>
  );
}