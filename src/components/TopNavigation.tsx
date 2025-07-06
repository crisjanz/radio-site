import { FaHouse, FaList, FaGlobe, FaHeart, FaEllipsis, FaUser, FaX } from 'react-icons/fa6';
import { FaSearch } from 'react-icons/fa';

interface TopNavigationProps {
  activeTab: string;
  searchTerm: string;
  onTabChange: (tab: string) => void;
  onSearchChange: (value: string) => void;
  onLogin: () => void;
  isLoggedIn?: boolean;
}

export default function TopNavigation({ 
  activeTab, 
  searchTerm,
  onTabChange, 
  onSearchChange,
  onLogin,
  isLoggedIn = false
}: TopNavigationProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: FaHouse },
    { id: 'browse', label: 'Browse', icon: FaList },
    { id: 'discover', label: 'Discover', icon: FaGlobe },
    { id: 'favorites', label: 'Favorites', icon: FaHeart },
    { id: 'more', label: 'More', icon: FaEllipsis },
  ];

  return (
    <div className="hidden lg:block bg-white border-b border-gray-200">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/streemr-main.png" alt="Streemr" className="w-41 h-12" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-96">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search for stations, genres, countries..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-10 py-2 w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear search"
                >
                  <FaX className="text-sm" />
                </button>
              )}
            </div>
            
            {/* Login Button */}
            <button
              onClick={onLogin}
              className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-lg transition-colors ${
                isLoggedIn 
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                  : 'text-gray-700 hover:text-gray-900 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FaUser className="text-xs" />
              {isLoggedIn ? 'Sign Out' : 'Sign In'}
            </button>
            
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 py-4 border-b-2 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="text-sm" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}