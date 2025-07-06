import { useState, useCallback, useRef, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { FaX, FaUser, FaHeart } from 'react-icons/fa6';
import { FaSearch } from 'react-icons/fa';
import { authService, type User } from './services/auth';
import { favoritesService } from './services/favorites';
import AdminPage from "./pages/AdminPage";
import StationInfoPage from "./pages/StationInfoPage";
import StationScrapePage from "./pages/StationScrapePage";
import TopNavigation from "./components/TopNavigation";
import BottomNavigation from "./components/BottomNavigation";
import MobilePlayer from "./components/MobilePlayer";
import DesktopPlayer from "./components/DesktopPlayer";
import HomeContent from "./components/HomeContent";
//import PopularContent from "./components/PopularContent";
import StationMap from "./components/StationMap";
//import BrowseContent from "./components/BrowseContent";
import BrowseAllContent from "./components/BrowseAllContent";
import FavoritesContent from "./components/FavoritesContent";
import StationNormalizationPage from "./pages/StationNormalizationPage";
import HealthCheckPage from "./pages/HealthCheckPage";
import LoginModal from "./components/LoginModal";
import type { Station } from "./types/Station";

function App() {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState<User | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [favorites, setFavorites] = useState<Station[]>([]);

  // Initialize authentication and favorites
  useEffect(() => {
    const initAuth = async () => {
      const user = await authService.verifyToken();
      setUser(user);
      
      // Load favorites from database
      if (user) {
        const userFavorites = await favoritesService.getFavorites();
        setFavorites(userFavorites);
      } else {
        setFavorites([]);
      }
    };
    initAuth();
  }, []);

  // No longer need to save to localStorage - favorites are now stored in database

  // Handle audio playback
  useEffect(() => {
    if (audioRef.current && currentStation) {
      if (isPlaying) {
        setIsLoading(true);
        audioRef.current.play()
          .then(() => setIsLoading(false))
          .catch(err => {
            console.error('Failed to play:', err);
            setIsLoading(false);
          });
      } else {
        audioRef.current.pause();
        setIsLoading(false);
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current && currentStation) {
      setIsLoading(true);
      audioRef.current.src = currentStation.streamUrl;
      audioRef.current.volume = isMuted ? 0 : volume / 100;
      audioRef.current.addEventListener('loadstart', () => setIsLoading(true));
      audioRef.current.addEventListener('canplay', () => setIsLoading(false));
      audioRef.current.addEventListener('error', () => setIsLoading(false));
      
      if (isPlaying) {
        audioRef.current.play()
          .then(() => setIsLoading(false))
          .catch(err => {
            console.error('Failed to play:', err);
            setIsLoading(false);
          });
      }
    }
  }, [currentStation, isPlaying]);

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);



  const handlePlayStation = useCallback((station: Station) => {
    // If it's the same station, just toggle play/pause
    if (currentStation && currentStation.id === station.id) {
      setIsPlaying(!isPlaying);
    } else {
      // Different station - set it and start playing
      setCurrentStation(station);
      setIsPlaying(true);
    }
  }, [currentStation, isPlaying]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTabChange = useCallback((tab: string) => {
    console.log('Tab changing to:', tab, 'Current station playing:', !!currentStation, 'isPlaying:', isPlaying);
    setActiveTab(tab);
    // Navigate to home if we're currently on a station detail page
    if (window.location.pathname.startsWith('/station/')) {
      navigate('/');
    }
  }, [navigate, currentStation, isPlaying]);

  const handleLogin = useCallback(() => {
    if (user) {
      // User is logged in, so log them out
      authService.logout();
      setUser(null);
      setFavorites([]); // Clear favorites on logout
    } else {
      // User is not logged in, show login modal
      setShowLoginModal(true);
    }
  }, [user]);

  const handleLoginSubmit = useCallback(async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    // Load user's favorites after login
    const userFavorites = await favoritesService.getFavorites();
    setFavorites(userFavorites);
  }, []);

  const handleSignupSubmit = useCallback(async (email: string, password: string) => {
    const response = await authService.signup(email, password);
    setUser(response.user);
    // New users start with empty favorites
    setFavorites([]);
  }, []);

  const handlePasswordReset = useCallback(async (email: string) => {
    await authService.resetPassword(email);
  }, []);

  const handleToggleFavorite = useCallback(async (station: Station) => {
    if (!user) {
      console.log('No user logged in');
      return;
    }
    
    console.log('Toggling favorite for station:', station.name, station.id);
    const result = await favoritesService.toggleFavorite(station);
    console.log('Toggle result:', result);
    setFavorites(result.favorites);
  }, [user]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);


  const handleStationInfo = useCallback((station: Station) => {
    navigate(`/station/${station.id}/info`);
  }, [navigate]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeContent
            searchTerm={searchTerm}
            onPlayStation={handlePlayStation}
            onNavigateToDiscover={() => setActiveTab('discover')}
            onStationInfo={handleStationInfo}
            isLoggedIn={!!user}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        );
      case 'browse':
        return (
          <BrowseAllContent
            searchTerm={searchTerm}
            onPlayStation={handlePlayStation}
            onStationInfo={handleStationInfo}
            onBack={() => {}} // No back button needed since this is the main Browse page
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            isLoggedIn={!!user}
          />
        );
      case 'discover':
        return (
          <StationMap 
            onPlayStation={handlePlayStation}
            searchTerm={searchTerm}
            selectedCountry=""
            selectedGenre=""
            selectedType=""
          />
        );
      case 'favorites':
        if (!user) {
          return (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 text-red-500"><FaHeart /></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Your Favorites
              </h3>
              <p className="text-gray-600 mb-6">
                Sign in to save your favorite stations and sync them across devices.
              </p>
              <button 
                onClick={handleLogin}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          );
        }
        return (
          <FavoritesContent
            favorites={favorites}
            onPlayStation={handlePlayStation}
            onStationInfo={handleStationInfo}
            onToggleFavorite={handleToggleFavorite}
            isLoggedIn={!!user}
            onLogin={handleLogin}
            user={user}
          />
        );
      case 'more':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
              </div>
              <div className="p-6 space-y-4">
                <button className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  About
                </button>
                <button className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  Help & Support
                </button>
              </div>
            </div>
            
            {/* Mobile Ad Space */}
            <div className="lg:hidden bg-white rounded-xl border border-gray-200 p-6">
              <div className="h-24 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-500">
                Advertisement Space
              </div>
            </div>
          </div>
        );
      default:
        return (
          <HomeContent 
            searchTerm={searchTerm} 
            onPlayStation={handlePlayStation} 
            onNavigateToDiscover={() => setActiveTab('discover')}
            onStationInfo={handleStationInfo}
            isLoggedIn={!!user}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        );
    }
  };

  return (
    <>
    <Routes>
      <Route 
        path="/" 
        element={
          <div className="flex flex-col h-screen bg-gray-50">
            {/* Shared Audio Element */}
            <audio 
              ref={audioRef} 
              preload="none"
              crossOrigin="anonymous"
            />
            
            {/* Top Navigation (Desktop) */}
            <TopNavigation
              activeTab={activeTab}
              searchTerm={searchTerm}
              onTabChange={handleTabChange}
              onSearchChange={setSearchTerm}
              onLogin={handleLogin}
              isLoggedIn={!!user}
            />

            {/* Mobile Header with Branding */}
            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/streemr-main.png" alt="Streemr" className="w-35 h-10" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FaUser className="text-lg" />
                  </button>
                  <button
                    onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                    className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FaSearch className="text-lg" />
                  </button>
                </div>
              </div>
              
              {mobileSearchOpen && (
                <div className="mt-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search stations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-4 pr-10 py-2 w-full text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      style={{ fontSize: '16px' }}
                      autoFocus
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <FaX className="text-sm" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <main className={`flex-1 overflow-y-auto p-4 lg:p-6 ${
              currentStation 
                ? 'pb-40 lg:pb-6' // Bottom padding when player + nav are visible (mobile)
                : 'pb-24 lg:pb-6' // Bottom padding when only nav is visible (mobile)
            }`}>
              {renderTabContent()}
            </main>

            {/* Desktop Player */}
            {currentStation && (
              <DesktopPlayer
                station={currentStation}
                isPlaying={isPlaying}
                isLoading={isLoading}
                onPlayPause={handlePlayPause}
                volume={volume}
                isMuted={isMuted}
                onVolumeChange={handleVolumeChange}
                onToggleMute={handleToggleMute}
              />
            )}

            {/* Mobile Player */}
            {currentStation && (
              <MobilePlayer
                station={currentStation}
                isPlaying={isPlaying}
                isLoading={isLoading}
                onPlayPause={handlePlayPause}
                onStationInfo={handleStationInfo}
              />
            )}

            {/* Bottom Navigation (Mobile) */}
            <BottomNavigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />

          </div>
        } 
      />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/normalize" element={<StationNormalizationPage />} />
      <Route path="/admin/health" element={<HealthCheckPage />} />
      <Route path="/scrape" element={<StationScrapePage />} />
      <Route 
        path="/station/:id" 
        element={
          <div className={`min-h-screen bg-gray-50 ${
            currentStation 
              ? 'pb-32 lg:pb-0' // Bottom padding when player + nav are visible (mobile)
              : 'pb-20 lg:pb-0' // Bottom padding when only nav is visible (mobile)
          }`}>
            <StationInfoPage 
              currentStation={currentStation}
              onPlayStation={handlePlayStation}
              isPlaying={isPlaying}
            />
            
            {/* Mobile Player (when playing) */}
            {currentStation && (
              <MobilePlayer
                station={currentStation}
                isPlaying={isPlaying}
                isLoading={isLoading}
                onPlayPause={handlePlayPause}
                onStationInfo={handleStationInfo}
              />
            )}

            {/* Bottom Navigation (Mobile) */}
            <BottomNavigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />

          </div>
        } 
      />
      <Route 
        path="/station/:id/info" 
        element={
          <div className="flex flex-col h-screen bg-gray-50">
            {/* Shared Audio Element */}
            <audio 
              ref={audioRef} 
              preload="none"
              crossOrigin="anonymous"
            />
            
            {/* Top Navigation (Desktop) */}
            <TopNavigation
              activeTab={activeTab}
              searchTerm={searchTerm}
              onTabChange={handleTabChange}
              onSearchChange={setSearchTerm}
              onLogin={handleLogin}
              isLoggedIn={!!user}
            />

 {/* Mobile Header with Branding */}
            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/streemr-main.png" alt="Streemr" className="w-35 h-10" />

                </div>
                <button
                  onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaSearch className="text-lg" />
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search stations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-2 w-full text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  style={{ fontSize: '16px' }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaX className="text-sm" />
                  </button>
                )}
              </div>
            </div>

            {/* Station Info Page Content */}
            <StationInfoPage 
              currentStation={currentStation}
              onPlayStation={handlePlayStation}
              isPlaying={isPlaying}
            />

            {/* Desktop Player */}
            {currentStation && (
              <DesktopPlayer
                station={currentStation}
                isPlaying={isPlaying}
                isLoading={isLoading}
                onPlayPause={handlePlayPause}
                volume={volume}
                isMuted={isMuted}
                onVolumeChange={handleVolumeChange}
                onToggleMute={handleToggleMute}
              />
            )}

            {/* Mobile Player */}
            {currentStation && (
              <MobilePlayer
                station={currentStation}
                isPlaying={isPlaying}
                isLoading={isLoading}
                onPlayPause={handlePlayPause}
                onStationInfo={handleStationInfo}
              />
            )}

            {/* Bottom Navigation (Mobile) */}
            <BottomNavigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>
        } 
      />
    </Routes>

    {/* Login Modal */}
    <LoginModal
      isOpen={showLoginModal}
      onClose={() => setShowLoginModal(false)}
      onLogin={handleLoginSubmit}
      onSignup={handleSignupSubmit}
      onPasswordReset={handlePasswordReset}
    />
    </>
  );
}

export default App;