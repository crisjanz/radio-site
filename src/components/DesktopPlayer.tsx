import { useState, useEffect } from 'react';
import { FaPlay, FaStop, FaSpinner, FaMusic, FaRadio, FaThumbsUp, FaThumbsDown } from 'react-icons/fa6';
import { FaVolumeUp, FaVolumeDown, FaVolumeMute, FaInfoCircle } from 'react-icons/fa';
import FeedbackModal from './FeedbackModal';
import { submitFeedback } from '../utils/feedbackApi';
import type { Station } from '../types/Station';
import { fetchStreamMetadata, getBestArtwork } from '../utils/streamMetadata';
import { decodeHtmlEntities } from '../utils/htmlDecoding';
import { API_CONFIG } from '../config/api';
// import AdBanner from './AdBanner';

interface DesktopPlayerProps {
  station: Station;
  isPlaying: boolean;
  isLoading?: boolean;
  onPlayPause: () => void;
  onStationInfo?: (station: Station) => void;
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
  onStationInfo,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute
}: DesktopPlayerProps) {
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [currentArtwork, setCurrentArtwork] = useState<string | null>(null);
  const [metadataChecked, setMetadataChecked] = useState(false);
  
  // Feedback system state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Music service click handlers
  const handleAppleMusicClick = async (songTitle: string) => {
    // Extract artist and title from the song string (usually "Artist - Title" format)
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
      try {
        console.log('🎵 Fetching metadata for station:', station.id, station.name);
        const metadata = await fetchStreamMetadata(station);
        console.log('🎵 Metadata response:', metadata);
        
        setMetadataChecked(true);
        
        if (metadata?.song || metadata?.title) {
          console.log('🎵 Setting current song:', metadata.song || metadata.title);
          setCurrentSong(metadata.song || metadata.title || null);
          
          // Set artwork if available
          if (metadata.artwork) {
            const artworkUrl = getBestArtwork(metadata.artwork, 'medium');
            console.log('🎨 Setting current artwork:', artworkUrl);
            setCurrentArtwork(artworkUrl);
          } else {
            setCurrentArtwork(null);
          }
        } else if (metadata?.hasMetadataSupport) {
          console.log('🎵 Stream supports metadata but no current song');
          setCurrentSong('METADATA_SUPPORTED'); // Special marker for metadata support
          setCurrentArtwork(null);
        } else {
          console.log('🎵 No song data in metadata response');
          setCurrentSong(null);
          setCurrentArtwork(null);
        }
      } catch (error) {
        console.debug('Failed to fetch metadata:', error);
        setMetadataChecked(true);
        setCurrentSong(null);
        setCurrentArtwork(null);
      }
    };

    fetchMetadata();

    // Poll for metadata updates every 30 seconds while playing
    const metadataInterval = setInterval(() => {
      if (isPlaying) {
        fetchMetadata();
      }
    }, 10000); // 10 seconds for faster artwork updates

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

  const handleThumbsUp = async () => {
    try {
      setIsSubmittingFeedback(true);
      await submitFeedback(station.nanoid || station.id, { type: 'great_station' });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmittingFeedback(false);
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

  return (
    <>
      <div className="hidden lg:flex fixed bottom-0 left-0 right-0 items-center bg-white border-t border-gray-200 px-4 py-3 z-30">
        {/* Left: Larger Artwork */}
        <div className="flex items-center gap-4 flex-1">
          {/* Station/Track Artwork - Larger */}
          <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 relative">
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
            {station.logo ? (
              <img
                src={station.logo}
                alt={`${station.name} logo`}
                className={`station-logo w-full h-full object-fill ${currentArtwork ? 'hidden' : ''}`}
                style={{ width: '100%', height: '100%' }}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.streemr-fallback') as HTMLElement;
                  if (fallback) {
                    fallback.classList.remove('hidden');
                  }
                }}
              />
            ) : null}
            
            {/* Streemr logo fallback (lowest priority) */}
            <div className={`streemr-fallback w-full h-full bg-white flex items-center justify-center ${(currentArtwork || station.logo) ? 'hidden' : ''}`}>
              <img src="/streemr-play.png" alt="Streemr" className="w-12 h-12 object-contain" />
            </div>
          </div>

          {/* Station Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{station.name}</h3>
              {onStationInfo && (
                <button
                  onClick={() => onStationInfo(station)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                  title="Station Info"
                >
                  <FaInfoCircle className="text-sm" />
                </button>
              )}
            </div>
            
            {/* Current song/metadata info - Larger and darker */}
            {currentSong && currentSong !== 'METADATA_SUPPORTED' ? (
              <div className="text-sm font-medium text-gray-700 mb-1 truncate">
                {decodeHtmlEntities(currentSong)}
              </div>
            ) : (isPlaying && (metadataChecked || currentSong === 'METADATA_SUPPORTED')) ? (
              <div className="text-sm text-gray-500 mb-1 italic">
                Live Radio
              </div>
            ) : null}
            
            {/* Music Service Links - only show when track is playing */}
            {currentSong && currentSong !== 'METADATA_SUPPORTED' && 
             !currentSong.toLowerCase().includes('live radio') &&
             !currentSong.toLowerCase().includes('stream') &&
             currentSong.toLowerCase() !== 'live' && (
              <div className="flex gap-1">
                <button 
                  onClick={() => handleAppleMusicClick(currentSong)}
                  className="hover:opacity-80 transition-opacity"
                  title="Find on Apple Music"
                >
                  <img src="/apple.png" alt="Apple Music" className="h-6" />
                </button>
                <button 
                  onClick={() => handleSpotifyClick(currentSong)}
                  className="hover:opacity-80 transition-opacity"
                  title="Find on Spotify"
                >
                  <img src="/spotify.png" alt="Spotify" className="h-6" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center: Play Button with Feedback on sides */}
        <div className="flex items-center gap-6">
          {/* Thumbs Up */}
          <button
            onClick={handleThumbsUp}
            disabled={isSubmittingFeedback}
            className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full hover:text-green-600 transition-colors disabled:opacity-50 flex items-center justify-center"
            title="Great station"
          >
            <FaThumbsUp className="text-sm" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={onPlayPause}
            className="w-16 h-16 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg"
          >
            {isLoading && isPlaying ? (
              <FaSpinner className="text-xl animate-spin" />
            ) : isPlaying ? (
              <FaStop className="text-xl" />
            ) : (
              <FaPlay className="text-xl ml-0.5" />
            )}
          </button>

          {/* Thumbs Down */}
          <button
            onClick={handleThumbsDown}
            disabled={isSubmittingFeedback}
            className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full hover:text-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
            title="Report issue"
          >
            <FaThumbsDown className="text-sm" />
          </button>
        </div>

        {/* Right: Volume Controls */}
        <div className="flex items-center gap-2 flex-1 justify-end">
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