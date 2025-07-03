import { useState, useEffect } from 'react';
import { FaFire, FaPlay, FaChartLine, FaMusic } from 'react-icons/fa';
import type { Station } from '../types/Station';
import { API_CONFIG } from '../config/api';

interface PopularContentProps {
  searchTerm: string;
  onPlayStation: (station: Station) => void;
}

export default function PopularContent({ 
  searchTerm, 
  onPlayStation 
}: PopularContentProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'all'>('week');

  const API_BASE = API_CONFIG.BASE_URL;

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch(`${API_BASE}/stations`);
        if (response.ok) {
          const data = await response.json();
          // For now, simulate popularity by randomizing order
          const shuffled = data.sort(() => 0.5 - Math.random());
          setStations(shuffled);
        }
      } catch (err) {
        console.error('Failed to load stations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [timeFrame]);

  // Filter stations based on search
  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (station.genre && station.genre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FaFire className="text-orange-500" />
            Popular Stations
          </h1>
          <p className="text-gray-600 mt-1">
            Most listened stations {timeFrame === 'week' ? 'this week' : timeFrame === 'month' ? 'this month' : 'of all time'}
          </p>
        </div>

        {/* Time Frame Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'week', label: 'Week' },
            { key: 'month', label: 'Month' },
            { key: 'all', label: 'All Time' }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setTimeFrame(option.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeFrame === option.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Station List */}
      {filteredStations.length > 0 ? (
        <div className="space-y-2">
          {filteredStations.slice(0, 50).map((station, index) => (
            <div
              key={station.id}
              className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              onClick={() => onPlayStation(station)}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-8 text-center">
                  <span className={`text-lg font-bold ${
                    index < 3 ? 'text-yellow-500' : 'text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                </div>

                {/* Station Logo */}
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                  {station.favicon ? (
                    <img
                      src={station.favicon}
                      alt={station.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.favicon-fallback') as HTMLElement;
                        if (fallback) {
                          fallback.classList.remove('hidden');
                        }
                      }}
                    />
                  ) : null}
                  <div className={`favicon-fallback w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 ${station.favicon ? 'hidden' : ''}`}>
                    <FaMusic />
                  </div>
                </div>

                {/* Station Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {station.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      {station.city ? `${station.city}, ${station.country}` : station.country}
                    </span>
                    {station.genre && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600">{station.genre}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Fake Stats */}
                <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FaChartLine className="text-xs" />
                    <span>{Math.floor(Math.random() * 10000) + 1000} plays</span>
                  </div>
                </div>

                {/* Play Button - only visible on desktop hover */}
                <div className="hidden lg:block p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors opacity-0 group-hover:opacity-100">
                  <FaPlay className="text-sm ml-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No stations found
          </h3>
          <p className="text-gray-600">
            Try searching with different keywords.
          </p>
        </div>
      )}
    </div>
  );
}