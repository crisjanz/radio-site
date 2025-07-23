import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaStop, FaSpinner, FaChevronDown, FaHeart, FaRegHeart, FaVolumeHigh, FaVolumeLow, FaVolumeOff, FaMusic, FaRadio, FaThumbsUp, FaThumbsDown } from 'react-icons/fa6';
import FeedbackModal from './FeedbackModal';
import { submitFeedback } from '../utils/feedbackApi';
import { getFaviconUrl, API_CONFIG } from '../config/api';
import { fetchStreamMetadata, getBestArtwork } from '../utils/streamMetadata';
import { decodeHtmlEntities } from '../utils/htmlDecoding';
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
  const [shouldScroll, setShouldScroll] = useState(false);
  const [showScrolling, setShowScrolling] = useState(false);
  const trackTextRef = useRef<HTMLHeadingElement>(null);
  const trackContainerRef = useRef<HTMLDivElement>(null);

  // Music service click handlers
  const handleAppleMusicClick = async (songTitle: string) => {
    const parts = songTitle.split(' - ');
    const artist = parts.length > 1 ? parts[0].trim() : '';
    const title = parts.length > 1 ? parts.slice(1).join(' - ').trim() : songTitle.trim();
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/music-links/itunes?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
      const data = await response.json();
      
      if (data.found && data.trackId) {
        // Try to open directly in Apple Music app
        const appUrl = `music://music.apple.com/us/song/${data.trackId}`;
        window.location.href = appUrl;
      }
    } catch (error) {
      console.error('Error fetching iTunes link:', error);
    }
  };

  const handleSpotifyClick = async (songTitle: string) => {
    // Try to open directly in Spotify app
    const searchQuery = encodeURIComponent(songTitle);
    const spotifyAppUrl = `spotify:search:${searchQuery}`;
    window.location.href = spotifyAppUrl;
  };
  
  // Feedback system state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

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
        const metadata = await fetchStreamMetadata(station);
        
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
      } catch {
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

  // Check if track text needs scrolling and handle delay
  useEffect(() => {
    if (!currentSong || currentSong === 'METADATA_SUPPORTED') {
      setShouldScroll(false);
      setShowScrolling(false);
      return;
    }

    // Reset scrolling state
    setShowScrolling(false);
    setShouldScroll(false);

    // Check if text overflows after a small delay to ensure DOM is updated
    const checkOverflow = () => {
      if (trackTextRef.current && trackContainerRef.current) {
        const textWidth = trackTextRef.current.scrollWidth;
        const containerWidth = trackContainerRef.current.clientWidth;
        
        if (textWidth > containerWidth) {
          setShouldScroll(true);
          // Wait 3 seconds before starting scroll animation
          setTimeout(() => {
            setShowScrolling(true);
          }, 3000);
        }
      }
    };

    setTimeout(checkOverflow, 100);
  }, [currentSong]);

  const handleFavoriteClick = () => {
    if (isLoggedIn && onToggleFavorite) {
      onToggleFavorite(station);
    }
  };

  const handleThumbsUp = async () => {
    if (isLoggedIn && onToggleFavorite && !isFavorite) {
      // For logged-in users, thumbs up = add to favorites (which auto-votes)
      onToggleFavorite(station);
    } else if (!isLoggedIn) {
      // For anonymous users, show feedback modal with positive feedback
      try {
        setIsSubmittingFeedback(true);
        await submitFeedback(station.nanoid || station.id, { type: 'great_station' });
      } catch (error) {
        console.error('Failed to submit feedback:', error);
      } finally {
        setIsSubmittingFeedback(false);
      }
    }
  };

  const handleThumbsDown = () => {
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async (feedback: { type: string; details?: string }) => {
    setIsSubmittingFeedback(true);
    try {
      await submitFeedback(station.nanoid || station.id, feedback);
      setShowFeedbackModal(false);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return FaVolumeOff;
    if (volume < 50) return FaVolumeLow;
    return FaVolumeHigh;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <>
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee {
            animation: marquee 12s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
          .track-text {
            transition: transform 0.3s ease;
          }
        `}
      </style>
      <div className="lg:hidden fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-100 relative z-10">
        {/* Left spacer */}
        <div className="flex-1"></div>
        
        {/* Centered minimize button */}
        <button 
          onClick={onMinimize}
          className="text-center flex flex-col items-center p-2 hover:text-gray-600 transition-colors absolute left-1/2 transform -translate-x-1/2 z-20"
        >
          <FaChevronDown className="text-gray-400 text-sm" />
          <FaChevronDown className="text-gray-400 text-sm -mt-1" />
        </button>
        
        {/* Right side - favorite button */}
        <div className="flex-1 flex justify-end">
          {isLoggedIn && onToggleFavorite && (
            <button
              onClick={handleFavoriteClick}
              className="p-2 text-red-500 hover:text-red-600 transition-colors z-20 relative"
            >
              {isFavorite ? <FaHeart className="text-lg" /> : <FaRegHeart className="text-lg" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-8 py-6 min-h-0 relative z-0">
        {/* Station/Track Artwork */}
        <div className="w-80 h-80 mx-auto mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg relative flex-shrink-0">
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
        <div className="text-center mb-6 flex-shrink-0">
          {/* Track info section - Always reserve space */}
          <div className="mb-3 h-[60px] flex flex-col justify-center">
            {currentSong && currentSong !== 'METADATA_SUPPORTED' ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FaMusic className="text-gray-600 text-sm" />
                  <span className="text-sm font-medium text-gray-600">Now Playing</span>
                </div>
                <div 
                  ref={trackContainerRef}
                  className="relative overflow-hidden max-w-[320px] mx-auto z-0"
                >
                  <h2 
                    ref={trackTextRef}
                    className={`text-lg font-semibold text-gray-900 px-4 whitespace-nowrap track-text ${shouldScroll && showScrolling ? 'animate-marquee' : ''}`}
                  >
                    {decodeHtmlEntities(currentSong)}
                  </h2>
                </div>
              </>
            ) : (isPlaying && (metadataChecked || currentSong === 'METADATA_SUPPORTED')) ? (
              <div className="flex items-center justify-center gap-2">
                <FaRadio className="text-blue-600 text-sm" />
                <span className="text-sm font-medium text-blue-600">Live Radio</span>
              </div>
            ) : (
              // Empty space to maintain layout consistency
              <div></div>
            )}
          </div>
          
          {/* Music Service Links - only show when track is playing */}
          {currentSong && currentSong !== 'METADATA_SUPPORTED' && 
           !currentSong.toLowerCase().includes('live radio') &&
           !currentSong.toLowerCase().includes('stream') &&
           currentSong.toLowerCase() !== 'live' && (
            <div className="flex justify-center gap-2 mb-4">
              <button 
                onClick={() => handleAppleMusicClick(currentSong)}
                className="hover:opacity-80 transition-opacity"
                title="Find on Apple Music"
              >
                <img src="/apple.png" alt="Apple Music" className="h-8" />
              </button>
              <button 
                onClick={() => handleSpotifyClick(currentSong)}
                className="hover:opacity-80 transition-opacity"
                title="Find on Spotify"
              >
                <img src="/spotify.png" alt="Spotify" className="h-8" />
              </button>
            </div>
          )}
          
          {/* Station name with info button - Single line truncated */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-xl font-bold text-gray-900 truncate max-w-[250px]">
              {station.name}
            </h1>
            <button
              onClick={() => onStationInfo(station)}
              className="w-6 h-6 bg-white text-black hover:text-gray-700 flex items-center justify-center rounded-full shadow-sm text-xs flex-shrink-0"
              title="Station Info"
              style={{ fontFamily: 'Times, serif', fontStyle: 'italic', fontWeight: 'bold' }}
            >
              i
            </button>
          </div>
          
        </div>

        {/* Volume Control */}
        <div className="mb-6 flex-shrink-0">
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

        {/* Controls - Fixed position */}
        <div className="flex items-center justify-center gap-6 flex-shrink-0 relative z-10">
          {/* Thumbs Up */}
          <button
            onClick={handleThumbsUp}
            disabled={isSubmittingFeedback}
            className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full hover:text-green-600 transition-colors disabled:opacity-50 flex items-center justify-center"
            title={isLoggedIn && !isFavorite ? "Add to favorites" : "Great station"}
          >
            <FaThumbsUp className="text-lg" />
          </button>

          {/* Play/Stop Button */}
          <button
            onClick={onPlayPause}
            className="w-20 h-20 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg relative z-20"
          >
            {isLoading && isPlaying ? (
              <FaSpinner className="text-2xl animate-spin" />
            ) : isPlaying ? (
              <FaStop className="text-2xl" />
            ) : (
              <FaPlay className="text-2xl ml-1" />
            )}
          </button>

          {/* Thumbs Down */}
          <button
            onClick={handleThumbsDown}
            disabled={isSubmittingFeedback}
            className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full hover:text-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
            title="Report issue"
          >
            <FaThumbsDown className="text-lg" />
          </button>
        </div>

        {/* Ad Space Placeholder */}
        <div className="mt-6 flex-shrink-0">
          <div 
            className="h-12 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center"
            style={{ display: 'none' }} // Hidden for now
          >
            <span className="text-xs text-gray-400">Ad Space</span>
          </div>
        </div>
      </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
        stationName={station.name}
        isSubmitting={isSubmittingFeedback}
      />
    </>
  );
}