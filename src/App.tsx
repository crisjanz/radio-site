import { useState, useCallback, useRef, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { FaHeart } from 'react-icons/fa6';
import { authService, type User } from './services/auth';
import { favoritesService } from './services/favorites';
import { analytics } from './utils/analytics';
// import AdBanner from './components/AdBanner';
import Layout from './components/Layout';
import StationInfoPage from "./pages/StationInfoPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import SubmitStationPage from "./pages/SubmitStationPage";
import AboutPage from "./pages/AboutPage";
import HomeContent from "./components/HomeContent";
import StationMap from "./components/StationMap";
import BrowseAllContent from "./components/BrowseAllContent";
import FavoritesContent from "./components/FavoritesContent";
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
  const [showFullScreenPlayer, setShowFullScreenPlayer] = useState(false);

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
      
      let streamUrl = currentStation.streamUrl;
      if (streamUrl.startsWith('http://') && window.location.protocol === 'https:') {
        console.log('⚠️ HTTP stream on HTTPS site, attempting workaround');
        audioRef.current.setAttribute('src', streamUrl);
      } else {
        audioRef.current.src = streamUrl;
      }
      
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
  }, [currentStation]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handlePlayStation = useCallback((station: Station) => {
    if (currentStation && currentStation.id === station.id) {
      setIsPlaying(!isPlaying);
      // If on mobile and not already showing full-screen player, show it
      if (window.innerWidth < 1024 && !showFullScreenPlayer) {
        setShowFullScreenPlayer(true);
      }
    } else {
      setCurrentStation(station);
      setIsPlaying(true);
      
      // Show full-screen player on mobile when a new station starts
      if (window.innerWidth < 1024) {
        setShowFullScreenPlayer(true);
      }
      
      analytics.trackStationPlay(station.name, station.country || 'unknown', station.genre || 'unknown');
    }
  }, [currentStation, isPlaying, showFullScreenPlayer]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    // Navigate to home if we're on any page other than home
    if (window.location.pathname !== '/') {
      navigate('/');
    }
    
    analytics.trackPageView(tab);
  }, [navigate]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    
    // If user starts typing a search term, automatically switch to browse tab
    if (term.trim() && activeTab !== 'browse') {
      setActiveTab('browse');
      // Navigate to home if we're on any page other than home
      if (window.location.pathname !== '/') {
        navigate('/');
      }
    }
  }, [activeTab, navigate]);

  const handleLogin = useCallback(() => {
    if (user) {
      authService.logout();
      setUser(null);
      setFavorites([]);
      
      analytics.trackAuth('logout');
    } else {
      setShowLoginModal(true);
    }
  }, [user]);

  const handleLoginSubmit = useCallback(async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    const userFavorites = await favoritesService.getFavorites();
    setFavorites(userFavorites);
    
    analytics.trackAuth('login');
  }, []);

  const handleSignupSubmit = useCallback(async (email: string, password: string) => {
    const response = await authService.signup(email, password);
    setUser(response.user);
    setFavorites([]);
    
    analytics.trackAuth('register');
  }, []);

  const handlePasswordReset = useCallback(async (email: string) => {
    await authService.resetPassword(email);
  }, []);

  const handleToggleFavorite = useCallback(async (station: Station) => {
    if (!user) {
      return;
    }
    
    const result = await favoritesService.toggleFavorite(station);
    setFavorites(result.favorites);
    
    const action = result.favorites.some(f => f.id === station.id) ? 'add' : 'remove';
    analytics.trackStationFavorite(station.name, station.country || 'unknown', action);
  }, [user]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleMinimizePlayer = useCallback(() => {
    setShowFullScreenPlayer(false);
  }, []);

  const handleExpandPlayer = useCallback(() => {
    setShowFullScreenPlayer(true);
  }, []);

  const handleStationInfo = useCallback((station: Station) => {
    // Hide full-screen player when navigating to station info
    setShowFullScreenPlayer(false);
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
            onBack={() => {}}
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
            <div className="text-center py-12 px-6">
              <div className="text-6xl mb-4 text-red-500 flex justify-center"><FaHeart /></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Your Favorites
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
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
          <div className="p-6 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
              </div>
              <div className="p-6 space-y-4">
                <button 
                  onClick={() => navigate('/submit-station')}
                  className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Submit a Station
                </button>
                <button 
                  onClick={() => navigate('/privacy-policy')}
                  className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => navigate('/terms-of-service')}
                  className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Terms of Service
                </button>
                <button 
                  onClick={() => navigate('/about')}
                  className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  About
                </button>
                <button className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  Help & Support
                </button>
              </div>
            </div>
            
            <div className="lg:hidden bg-white rounded-xl border border-gray-200 p-6">
              <div 
                style={{
                  height: '96px',
                  backgroundColor: '#f8f9fa',
                  border: '1px dashed #e9ecef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#6c757d'
                }}
              >
                Mobile Ad Space
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
    {/* Audio Element */}
    <audio 
      ref={audioRef} 
      preload="none"
      crossOrigin="anonymous"
      controls={false}
    />
    
    <Routes>
      <Route 
        path="/" 
        element={
          <Layout
            activeTab={activeTab}
            searchTerm={searchTerm}
            onTabChange={handleTabChange}
            onSearchChange={handleSearchChange}
            onLogin={handleLogin}
            isLoggedIn={!!user}
            user={user}
            currentStation={currentStation}
            isPlaying={isPlaying}
            isLoading={isLoading}
            onPlayPause={handlePlayPause}
            onStationInfo={handleStationInfo}
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            mobileSearchOpen={mobileSearchOpen}
            setMobileSearchOpen={setMobileSearchOpen}
            showFullScreenPlayer={showFullScreenPlayer}
            onMinimizePlayer={handleMinimizePlayer}
            onExpandPlayer={handleExpandPlayer}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          >
            {renderTabContent()}
          </Layout>
        } 
      />
      <Route 
        path="/privacy-policy" 
        element={
          <Layout
            activeTab="more"
            searchTerm={searchTerm}
            onTabChange={handleTabChange}
            onSearchChange={handleSearchChange}
            onLogin={handleLogin}
            isLoggedIn={!!user}
            user={user}
            currentStation={currentStation}
            isPlaying={isPlaying}
            isLoading={isLoading}
            onPlayPause={handlePlayPause}
            onStationInfo={handleStationInfo}
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            mobileSearchOpen={mobileSearchOpen}
            setMobileSearchOpen={setMobileSearchOpen}
            showFullScreenPlayer={showFullScreenPlayer}
            onMinimizePlayer={handleMinimizePlayer}
            onExpandPlayer={handleExpandPlayer}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          >
            <PrivacyPolicyPage />
          </Layout>
        } 
      />
      <Route 
        path="/terms-of-service" 
        element={
          <Layout
            activeTab="more"
            searchTerm={searchTerm}
            onTabChange={handleTabChange}
            onSearchChange={handleSearchChange}
            onLogin={handleLogin}
            isLoggedIn={!!user}
            user={user}
            currentStation={currentStation}
            isPlaying={isPlaying}
            isLoading={isLoading}
            onPlayPause={handlePlayPause}
            onStationInfo={handleStationInfo}
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            mobileSearchOpen={mobileSearchOpen}
            setMobileSearchOpen={setMobileSearchOpen}
            showFullScreenPlayer={showFullScreenPlayer}
            onMinimizePlayer={handleMinimizePlayer}
            onExpandPlayer={handleExpandPlayer}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          >
            <TermsOfServicePage />
          </Layout>
        } 
      />
      <Route 
        path="/submit-station" 
        element={
          <Layout
            activeTab="more"
            searchTerm={searchTerm}
            onTabChange={handleTabChange}
            onSearchChange={handleSearchChange}
            onLogin={handleLogin}
            isLoggedIn={!!user}
            user={user}
            currentStation={currentStation}
            isPlaying={isPlaying}
            isLoading={isLoading}
            onPlayPause={handlePlayPause}
            onStationInfo={handleStationInfo}
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            mobileSearchOpen={mobileSearchOpen}
            setMobileSearchOpen={setMobileSearchOpen}
            showFullScreenPlayer={showFullScreenPlayer}
            onMinimizePlayer={handleMinimizePlayer}
            onExpandPlayer={handleExpandPlayer}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          >
            <SubmitStationPage />
          </Layout>
        } 
      />
      <Route 
        path="/station/:id" 
        element={
          <Layout
            activeTab="home"
            searchTerm={searchTerm}
            onTabChange={handleTabChange}
            onSearchChange={handleSearchChange}
            onLogin={handleLogin}
            isLoggedIn={!!user}
            user={user}
            currentStation={currentStation}
            isPlaying={isPlaying}
            isLoading={isLoading}
            onPlayPause={handlePlayPause}
            onStationInfo={handleStationInfo}
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            mobileSearchOpen={mobileSearchOpen}
            setMobileSearchOpen={setMobileSearchOpen}
            showFullScreenPlayer={showFullScreenPlayer}
            onMinimizePlayer={handleMinimizePlayer}
            onExpandPlayer={handleExpandPlayer}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          >
            <StationInfoPage 
              currentStation={currentStation}
              onPlayStation={handlePlayStation}
              isPlaying={isPlaying}
            />
          </Layout>
        } 
      />
      <Route 
        path="/station/:id/info" 
        element={
          <Layout
            activeTab="home"
            searchTerm={searchTerm}
            onTabChange={handleTabChange}
            onSearchChange={handleSearchChange}
            onLogin={handleLogin}
            isLoggedIn={!!user}
            user={user}
            currentStation={currentStation}
            isPlaying={isPlaying}
            isLoading={isLoading}
            onPlayPause={handlePlayPause}
            onStationInfo={handleStationInfo}
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            mobileSearchOpen={mobileSearchOpen}
            setMobileSearchOpen={setMobileSearchOpen}
            showFullScreenPlayer={showFullScreenPlayer}
            onMinimizePlayer={handleMinimizePlayer}
            onExpandPlayer={handleExpandPlayer}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          >
            <StationInfoPage 
              currentStation={currentStation}
              onPlayStation={handlePlayStation}
              isPlaying={isPlaying}
            />
          </Layout>
        } 
      />
      <Route 
        path="/about" 
        element={
          <Layout
            activeTab="more"
            searchTerm={searchTerm}
            onTabChange={handleTabChange}
            onSearchChange={handleSearchChange}
            onLogin={handleLogin}
            isLoggedIn={!!user}
            user={user}
            currentStation={currentStation}
            isPlaying={isPlaying}
            isLoading={isLoading}
            onPlayPause={handlePlayPause}
            onStationInfo={handleStationInfo}
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            mobileSearchOpen={mobileSearchOpen}
            setMobileSearchOpen={setMobileSearchOpen}
            showFullScreenPlayer={showFullScreenPlayer}
            onMinimizePlayer={handleMinimizePlayer}
            onExpandPlayer={handleExpandPlayer}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          >
            <AboutPage />
          </Layout>
        } 
      />
    </Routes>

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