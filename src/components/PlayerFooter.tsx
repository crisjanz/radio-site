import React, { useState, useEffect } from "react";
import { FaGlobe } from "react-icons/fa";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import RadioPlayer from "./RadioPlayer";
import { fetchStreamMetadata } from "../utils/streamMetadata";
import { getFaviconUrl } from "../config/api";

interface Station {
  id: number;
  name: string;
  country: string;
  genre?: string;
  type?: string;
  streamUrl: string;
  favicon?: string;
  logo?: string;
  local_image_url?: string;
  homepage?: string;
}

interface PlayerFooterProps {
  currentStation: Station | null;
}

const PlayerFooter: React.FC<PlayerFooterProps> = ({ currentStation }) => {
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [stationLogo, setStationLogo] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [metadataChecked, setMetadataChecked] = useState(false);
  const [isRequestingMetadata, setIsRequestingMetadata] = useState(false);

  useEffect(() => {
    if (!currentStation) return;

    // Set station logo using priority logic with optimization and cache busting
    setStationLogo(getFaviconUrl(currentStation, { width: 48, height: 48, quality: 90, cacheBust: true }));
    setLogoError(false);
    
    // Reset metadata state
    setCurrentSong(null);
    setMetadataChecked(false);

    // Try to fetch stream metadata
    const fetchMetadata = async () => {
      if (isRequestingMetadata) {
        console.log('🔄 Metadata request already in progress, skipping');
        return;
      }
      
      try {
        setIsRequestingMetadata(true);
        console.log('🎵 Fetching metadata for:', currentStation.name);
        const metadata = await fetchStreamMetadata(currentStation.id);
        console.log('🎵 Metadata response:', metadata);
        
        setMetadataChecked(true);
        
        if (metadata?.song || metadata?.title) {
          console.log('🎵 Setting current song:', metadata.song || metadata.title);
          setCurrentSong(metadata.song || metadata.title || null);
        } else {
          console.log('🎵 No song data in metadata response');
          setCurrentSong(null);
        }
      } catch (error) {
        console.debug('Failed to fetch metadata:', error);
        setMetadataChecked(true);
        setCurrentSong(null);
      } finally {
        setIsRequestingMetadata(false);
      }
    };

    fetchMetadata();

    // Poll for metadata updates every 60 seconds (reduced to minimize backend calls)
    const metadataInterval = setInterval(fetchMetadata, 10000); // 10 seconds for faster updates

    return () => {
      clearInterval(metadataInterval);
    };
  }, [currentStation]);

  if (!currentStation) {
    return null;
  }

  const handleLogoError = () => {
    setLogoError(true);
  };

  return (
    <footer className="bg-white border-t border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
      <div className="flex items-center justify-between gap-2 lg:gap-4">
        {/* Station info */}
        <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden border border-gray-200">
            {stationLogo && !logoError ? (
              <img
                src={stationLogo}
                alt={`${currentStation.name} logo`}
                className="w-full h-full object-fill"
                style={{ width: '100%', height: '100%' }}
                onError={handleLogoError}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <img src="/streemr-play.png" alt="Streemr" className="w-8 h-8 object-contain" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 lg:gap-2 mb-1">
              <h3 className="font-semibold text-sm lg:text-base text-gray-900 truncate">
                {currentStation.name}
              </h3>
              <span className="text-red-500 text-xs font-medium bg-red-50 px-1.5 lg:px-2 py-0.5 rounded-full flex-shrink-0">
                LIVE
              </span>
              {currentStation.homepage && (
                <a
                  href={currentStation.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors hidden sm:block"
                >
                  <FaArrowUpRightFromSquare className="text-xs" />
                </a>
              )}
            </div>
            
            {/* Current song info */}
            {currentSong ? (
              <div className="text-xs lg:text-sm font-medium text-blue-600 mb-1 truncate bg-blue-50 px-2 py-1 rounded">
                ♪ {currentSong}
              </div>
            ) : metadataChecked ? (
              <div className="text-xs text-gray-500 mb-1 italic">
                🎵 Live radio stream
              </div>
            ) : (
              <div className="text-xs text-gray-400 mb-1">
                🎵 Detecting song info...
              </div>
            )}
            
            <div className="flex items-center gap-1 lg:gap-3 text-xs lg:text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <FaGlobe className="text-xs" />
                <span>{currentStation.country}</span>
              </div>
              
              {currentStation.genre && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>{currentStation.genre}</span>
                </>
              )}
              
              {currentStation.type && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="capitalize">{currentStation.type}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Player controls */}
        <div className="flex-shrink-0">
          <RadioPlayer
            streamUrl={currentStation.streamUrl}
            name={currentStation.name}
            genre={currentStation.genre}
            type={currentStation.type}
            onMetadataUpdate={(metadata) => {
              if (metadata.title || metadata.song) {
                setCurrentSong(metadata.title || metadata.song || null);
              }
            }}
          />
        </div>
      </div>
    </footer>
  );
};

export default PlayerFooter;