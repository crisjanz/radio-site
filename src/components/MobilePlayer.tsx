import { useState, useEffect } from 'react';
import { FaPlay, FaStop, FaSpinner, FaMusic, FaRadio } from 'react-icons/fa6';
import { getFaviconUrl } from '../config/api';
import { fetchStreamMetadata, getBestArtwork } from '../utils/streamMetadata';
import type { Station } from '../types/Station';

interface MobilePlayerProps {
  station: Station;
  isPlaying: boolean;
  isLoading?: boolean;
  onPlayPause: () => void;
  onStationInfo?: (station: Station) => void;
  onExpand?: () => void;
}

export default function MobilePlayer({ 
  station, 
  isPlaying, 
  isLoading = false,
  onPlayPause, 
  onStationInfo,
  onExpand
}: MobilePlayerProps) {
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
        const metadata = await fetchStreamMetadata(station);
        
        setMetadataChecked(true);
        
        if (metadata?.song || metadata?.title) {
          setCurrentSong(metadata.song || metadata.title || null);
          
          // Set artwork if available
          if (metadata.artwork) {
            const artworkUrl = getBestArtwork(metadata.artwork, 'small'); // Mobile uses smaller images
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
  return (
    <div className="lg:hidden fixed left-0 right-0 bg-white z-30 mobile-player-bottom">
        <div className="flex items-center px-4 py-3">
          {/* Station/Track Artwork */}
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 mr-3 relative">
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
            {getFaviconUrl(station, { width: 40, height: 40, quality: 90, cacheBust: true }) ? (
              <img
                src={getFaviconUrl(station, { width: 40, height: 40, quality: 90, cacheBust: true })!}
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
            <div className={`streemr-fallback w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${(currentArtwork || getFaviconUrl(station, { width: 40, height: 40, quality: 90, cacheBust: true })) ? 'hidden' : ''}`}>
              <img src="/streemr-play.png" alt="Streemr" className="w-16 h-16 object-contain" />
            </div>
          </div>

        {/* Station Info */}
        <div 
          className="flex-1 min-w-0 mr-3 cursor-pointer" 
          onClick={() => onExpand ? onExpand() : onStationInfo?.(station)}
        >
          <h3 className="text-sm font-medium text-gray-900 truncate">{station.name}</h3>
          
          {/* Current song/metadata info */}
          {currentSong && currentSong !== 'METADATA_SUPPORTED' ? (
            <div className="text-xs font-medium text-blue-600 truncate flex items-center gap-1">
              <FaMusic className="text-xs" />
              {currentSong}
            </div>
          ) : (isPlaying && (metadataChecked || currentSong === 'METADATA_SUPPORTED')) ? (
            <div className="text-xs text-gray-500 italic flex items-center gap-1">
              <FaRadio className="text-xs" />
              Live Radio
            </div>
          ) : (
            <p className="text-xs text-gray-600 truncate">
              {station.city ? `${station.city}, ${station.country}` : station.country}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPlayPause}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            {isLoading && isPlaying ? (
              <FaSpinner className="text-sm animate-spin" />
            ) : isPlaying ? (
              <FaStop className="text-sm" />
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