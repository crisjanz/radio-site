import React, { useRef } from 'react';
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
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Shared Audio Element */}
      <audio 
        ref={audioRef} 
        preload="none"
        crossOrigin="anonymous"
        controls={false}
      />
      
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
      <div className="flex-1 overflow-y-auto" style={{ 
        paddingBottom: currentStation ? '8.5rem' : '4rem' 
      }}>
        {children}
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
        <MobilePlayer
          station={currentStation}
          isPlaying={isPlaying}
          isLoading={isLoading}
          onPlayPause={onPlayPause}
          onStationInfo={onStationInfo}
        />
      )}

      {/* Bottom Navigation (Mobile) */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
    </div>
  );
}