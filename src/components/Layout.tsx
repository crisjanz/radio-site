import React, { useRef, useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { FaX } from 'react-icons/fa6';
import TopNavigation from './TopNavigation';
import BottomNavigation from './BottomNavigation';
import MobilePlayer from './MobilePlayer';
import DesktopPlayer from './DesktopPlayer';
import type { Station } from '../types/Station';
import type { User } from '../services/auth';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  searchTerm: string;
  onTabChange: (tab: string) => void;
  onSearchChange: (term: string) => void;
  onLogin: () => void;
  isLoggedIn: boolean;
  user?: User | null;
  currentStation?: Station | null;
  isPlaying?: boolean;
  isLoading?: boolean;
  onPlayPause?: () => void;
  onStationInfo?: (station: Station) => void;
  volume?: number;
  isMuted?: boolean;
  onVolumeChange?: (volume: number) => void;
  onToggleMute?: () => void;
  mobileSearchOpen: boolean;
  setMobileSearchOpen: (open: boolean) => void;
}

export default function Layout({
  children,
  activeTab,
  searchTerm,
  onTabChange,
  onSearchChange,
  onLogin,
  isLoggedIn,
  currentStation,
  isPlaying = false,
  isLoading = false,
  onPlayPause,
  onStationInfo,
  volume = 80,
  isMuted = false,
  onVolumeChange,
  onToggleMute,
  mobileSearchOpen,
  setMobileSearchOpen
}: LayoutProps) {
  const bottomNavRef = useRef<HTMLDivElement>(null);
  const mobilePlayerRef = useRef<HTMLDivElement>(null);
  const [bottomNavHeight, setBottomNavHeight] = useState(64); // Default fallback
  const [mobilePlayerHeight, setMobilePlayerHeight] = useState(80); // Default fallback
  const [isMobile, setIsMobile] = useState(true);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Measure actual component heights
  useEffect(() => {
    const measureHeights = () => {
      if (bottomNavRef.current) {
        const height = bottomNavRef.current.getBoundingClientRect().height;
        setBottomNavHeight(height);
      }
      if (mobilePlayerRef.current && currentStation) {
        const height = mobilePlayerRef.current.getBoundingClientRect().height;
        setMobilePlayerHeight(height);
      }
    };

    // Initial measurement immediately with fallbacks handling early renders
    measureHeights();

    // Create ResizeObserver to watch for size changes
    const resizeObserver = new ResizeObserver(measureHeights);
    
    if (bottomNavRef.current) {
      resizeObserver.observe(bottomNavRef.current);
    }
    if (mobilePlayerRef.current && currentStation) {
      resizeObserver.observe(mobilePlayerRef.current);
    }

    // Also measure on window resize (fallback)
    window.addEventListener('resize', measureHeights);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measureHeights);
    };
  }, [currentStation]); // Re-run when currentStation changes

  // Calculate total bottom padding needed
  const calculateBottomPadding = () => {
    let totalPadding = bottomNavHeight || 64; // Fallback for bottom nav
    if (currentStation) {
      totalPadding += mobilePlayerHeight || 80; // Fallback for mobile player
    }
    // Add 16px buffer for safety
    const finalPadding = totalPadding + 16;
    
    // Debug logging to track what's happening
    console.log('🔧 Layout Debug:', {
      bottomNavHeight,
      mobilePlayerHeight,
      currentStation: !!currentStation,
      finalPadding,
      isMobile
    });
    
    return finalPadding;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      
      {/* Top Navigation (Desktop) */}
      <TopNavigation
        activeTab={activeTab}
        searchTerm={searchTerm}
        onTabChange={onTabChange}
        onSearchChange={onSearchChange}
        onLogin={onLogin}
        isLoggedIn={isLoggedIn}
      />

      {/* Mobile Header with Branding */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/streemr-main.png" alt="Streemr" className="w-35 h-10" />
          </div>
          <button
            onClick={() => {
              if (mobileSearchOpen && !searchTerm) {
                // If search is open and empty, close it
                setMobileSearchOpen(false);
              } else {
                // Otherwise toggle
                setMobileSearchOpen(!mobileSearchOpen);
              }
            }}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaSearch />
          </button>
        </div>
        
        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="mt-3 pb-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search stations..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <button
                onClick={() => {
                  if (searchTerm) {
                    onSearchChange('');
                  } else {
                    setMobileSearchOpen(false);
                  }
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <FaX className="text-sm" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div 
          className="lg:pb-20"
          style={{ 
            paddingBottom: isMobile ? `${calculateBottomPadding()}px` : undefined 
          }}
        >
          {children}
        </div>
      </div>

      {/* Desktop Player (when playing) */}
      {currentStation && onPlayPause && onVolumeChange && onToggleMute && (
        <DesktopPlayer
          station={currentStation}
          isPlaying={isPlaying}
          isLoading={isLoading}
          onPlayPause={onPlayPause}
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={onVolumeChange}
          onToggleMute={onToggleMute}
        />
      )}

      {/* Mobile Player */}
      {currentStation && onPlayPause && onStationInfo && (
        <div ref={mobilePlayerRef}>
          <MobilePlayer
            station={currentStation}
            isPlaying={isPlaying}
            isLoading={isLoading}
            onPlayPause={onPlayPause}
            onStationInfo={onStationInfo}
          />
        </div>
      )}

      {/* Bottom Navigation (Mobile) */}
      <div ref={bottomNavRef}>
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      </div>
    </div>
  );
}