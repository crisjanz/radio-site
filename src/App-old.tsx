import { useState, useEffect, useCallback, memo } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import StationGrid from "./components/StationGrid";
import PlayerFooter from "./components/PlayerFooter";
import AdminPage from "./pages/AdminPage";
import StationDetailPage from "./pages/StationDetailPage";
import StationScrapePage from "./pages/StationScrapePage";
import { FaSearch, FaCog, FaBars, FaTh, FaMap } from "react-icons/fa";
import StationMap from "./components/StationMap";
import type { Station } from "./types/Station";

function App() {
  const navigate = useNavigate();
  
  const [stations, setStations] = useState<Station[]>([]);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Fetch stations for filter options
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('http://192.168.1.69:3001/stations');
        if (response.ok) {
          const data = await response.json();
          setStations(data);
        }
      } catch (err) {
        console.error('Failed to load stations for filters:', err);
      }
    };

    fetchStations();
  }, []);

  // Get unique values for filter dropdowns
  const countries = [...new Set(stations.map(s => s.country).filter(Boolean))].sort();
  const genres = [...new Set(stations.map(s => s.genre).filter(Boolean))].sort() as string[];
  const types = [...new Set(stations.map(s => s.type).filter(Boolean))].sort() as string[];

  const handlePlayStation = useCallback((station: Station) => {
    setCurrentStation(station);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCountry("");
    setSelectedGenre("");
    setSelectedType("");
  }, []);

  // Memoized handlers to prevent re-renders
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleCountryChange = useCallback((country: string) => {
    setSelectedCountry(country);
  }, []);

  const handleGenreChange = useCallback((genre: string) => {
    setSelectedGenre(genre);
  }, []);

  const handleTypeChange = useCallback((type: string) => {
    setSelectedType(type);
  }, []);

  const handleViewModeChange = useCallback((mode: 'grid' | 'map') => {
    setViewMode(mode);
  }, []);

  const handleSidebarToggle = useCallback((open: boolean) => {
    setSidebarOpen(open);
  }, []);

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <HomePage 
            countries={countries}
            genres={genres}
            types={types}
            searchTerm={searchTerm}
            selectedCountry={selectedCountry}
            selectedGenre={selectedGenre}
            selectedType={selectedType}
            sidebarOpen={sidebarOpen}
            viewMode={viewMode}
            currentStation={currentStation}
            onPlayStation={handlePlayStation}
            onSearchChange={handleSearchChange}
            onCountryChange={handleCountryChange}
            onGenreChange={handleGenreChange}
            onTypeChange={handleTypeChange}
            onClearFilters={clearFilters}
            onViewModeChange={handleViewModeChange}
            onSidebarToggle={handleSidebarToggle}
            onNavigateToAdmin={() => navigate('/admin')}
          />
        } 
      />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/scrape" element={<StationScrapePage />} />
      <Route 
        path="/station/:id" 
        element={
          <StationDetailPage 
            currentStation={currentStation}
            onPlayStation={handlePlayStation}
            isPlaying={!!currentStation}
          />
        } 
      />
    </Routes>
  );
}

interface HomePageProps {
  countries: string[];
  genres: string[];
  types: string[];
  searchTerm: string;
  selectedCountry: string;
  selectedGenre: string;
  selectedType: string;
  sidebarOpen: boolean;
  viewMode: 'grid' | 'map';
  currentStation: Station | null;
  onPlayStation: (station: Station) => void;
  onSearchChange: (value: string) => void;
  onCountryChange: (country: string) => void;
  onGenreChange: (genre: string) => void;
  onTypeChange: (type: string) => void;
  onClearFilters: () => void;
  onViewModeChange: (mode: 'grid' | 'map') => void;
  onSidebarToggle: (open: boolean) => void;
  onNavigateToAdmin: () => void;
}

// Home Page Component - Memoized to prevent unnecessary re-renders
const HomePage = memo(({
  countries,
  genres,
  types,
  searchTerm,
  selectedCountry,
  selectedGenre,
  selectedType,
  sidebarOpen,
  viewMode,
  currentStation,
  onPlayStation,
  onSearchChange,
  onCountryChange,
  onGenreChange,
  onTypeChange,
  onClearFilters,
  onViewModeChange,
  onSidebarToggle,
  onNavigateToAdmin
}: HomePageProps) => (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        countries={countries}
        genres={genres}
        types={types}
        selectedCountry={selectedCountry}
        selectedGenre={selectedGenre}
        selectedType={selectedType}
        onCountryChange={onCountryChange}
        onGenreChange={onGenreChange}
        onTypeChange={onTypeChange}
        onClearFilters={onClearFilters}
        isOpen={sidebarOpen}
        onClose={() => onSidebarToggle(false)}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden lg:ml-0">
        {/* Header with search - Fixed at top */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => onSidebarToggle(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                <FaBars />
              </button>
              
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">World Radio</h1>
                <p className="text-xs lg:text-sm text-gray-600 mt-1">Discover radio stations from around the globe</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => onViewModeChange('grid')}
                  className={`flex items-center gap-1 px-2 lg:px-3 py-1 rounded-md text-sm transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FaTh className="text-xs" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => onViewModeChange('map')}
                  className={`flex items-center gap-1 px-2 lg:px-3 py-1 rounded-md text-sm transition-colors ${
                    viewMode === 'map' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FaMap className="text-xs" />
                  <span className="hidden sm:inline">Map</span>
                </button>
              </div>

              <div className="relative w-32 sm:w-48 lg:max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
              
              <button
                onClick={onNavigateToAdmin}
                className="flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Admin Panel"
              >
                <FaCog className="text-sm" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main content - Scrollable between header and player */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6" style={{ paddingBottom: currentStation ? '80px' : '0' }}>
          {viewMode === 'grid' ? (
            <StationGrid 
              onPlayStation={onPlayStation}
              searchTerm={searchTerm}
              selectedCountry={selectedCountry}
              selectedGenre={selectedGenre}
              selectedType={selectedType}
            />
          ) : (
            <StationMap 
              onPlayStation={onPlayStation}
              searchTerm={searchTerm}
              selectedCountry={selectedCountry}
              selectedGenre={selectedGenre}
              selectedType={selectedType}
            />
          )}
        </main>

        {/* Player footer - Fixed at bottom */}
        {currentStation && (
          <div className="fixed bottom-0 left-0 right-0 z-30 lg:left-80">
            <PlayerFooter currentStation={currentStation} />
          </div>
        )}
      </div>
    </div>
));

export default App;