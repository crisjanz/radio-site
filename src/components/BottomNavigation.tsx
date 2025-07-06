import { FaHouse, FaList, FaGlobe, FaHeart, FaEllipsis } from 'react-icons/fa6';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: FaHouse },
    { id: 'browse', label: 'Browse', icon: FaList },
    { id: 'discover', label: 'Discover', icon: FaGlobe },
    { id: 'favorites', label: 'Favorites', icon: FaHeart },
    { id: 'more', label: 'More', icon: FaEllipsis },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 px-1 ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className={`text-lg mb-1 ${isActive ? 'text-blue-600' : ''}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}