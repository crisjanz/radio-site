import { useState, useEffect } from 'react';
import { FaCircleInfo, FaArrowLeft, FaGlobe } from 'react-icons/fa6';
import type { Station } from '../types/Station';
import { API_CONFIG, getFaviconUrl } from '../config/api';



interface CountryContentProps {
  onPlayStation: (station: Station) => void;
  onStationInfo?: (station: Station) => void;
  onBack: () => void;
}

interface CountryGroup {
  country: string;
  count: number;
  stations: Station[];
}

export default function CountryContent({ 
  onPlayStation, 
  onStationInfo,
  onBack 
}: CountryContentProps) {
  const [countries, setCountries] = useState<CountryGroup[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stationsLoading, setStationsLoading] = useState(false);

  const API_BASE = API_CONFIG.BASE_URL;

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      try {
        const response = await fetch('${API_BASE}/stations/countries');
        if (response.ok) {
          const data = await response.json();
          setCountries(data);
        }
      } catch (err) {
        console.error('Failed to load countries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleCountrySelect = async (country: string) => {
    setSelectedCountry(country);
    setStationsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/stations?country=${encodeURIComponent(country)}`);
      if (response.ok) {
        const stations = await response.json();
        setCountries(prev => prev.map(c => 
          c.country === country ? { ...c, stations } : c
        ));
      }
    } catch (err) {
      console.error('Failed to load stations for country:', err);
    } finally {
      setStationsLoading(false);
    }
  };

  const handleInfoClick = (e: React.MouseEvent, station: Station) => {
    e.stopPropagation();
    onStationInfo?.(station);
  };

  const selectedCountryData = countries.find(c => c.country === selectedCountry);

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
      <div className="flex items-center gap-4">
        <button
          onClick={selectedCountry ? () => setSelectedCountry(null) : onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {selectedCountry ? `Stations in ${selectedCountry}` : 'Browse by Country'}
        </h2>
      </div>

      {!selectedCountry ? (
        <>
          {/* Stats */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-gray-600">
              {countries.length} countries with radio stations
            </p>
          </div>

          {/* Countries Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {countries.map((country) => (
              <button
                key={country.country}
                onClick={() => handleCountrySelect(country.country)}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <FaGlobe />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {country.country}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {country.count} station{country.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Selected Country Header */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-gray-600">
              {selectedCountryData?.count || 0} stations in {selectedCountry}
            </p>
          </div>

          {/* Stations Grid */}
          {stationsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {(selectedCountryData?.stations || []).map((station) => (
                <StationCard 
                  key={station.id} 
                  station={station} 
                  onPlay={() => onPlayStation(station)}
                  onInfo={onStationInfo ? (e) => handleInfoClick(e, station) : undefined}
                />
              ))}
            </div>
          )}

          {selectedCountryData?.stations?.length === 0 && !stationsLoading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No stations found
              </h3>
              <p className="text-gray-600">
                No stations available for {selectedCountry}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Station Card Component
interface StationCardProps {
  station: Station;
  onPlay: () => void;
  onInfo?: (e: React.MouseEvent) => void;
}

function StationCard({ station, onPlay, onInfo }: StationCardProps) {
  return (
    <div 
      className="group cursor-pointer"
      onClick={onPlay}
    >
      {/* Icon */}
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        {getFaviconUrl(station, { width: 256, height: 256, quality: 85 }) ? (
          <img
            src={getFaviconUrl(station, { width: 256, height: 256, quality: 85 })!}
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
        <div className={`favicon-fallback w-full h-full flex items-center justify-center ${getFaviconUrl(station, { width: 256, height: 256, quality: 85 }) ? 'hidden' : ''}`}>
          <img src="/streemr-play.png" alt="Streemr" className="w-24 h-24 object-contain" />
        </div>
        
        {/* Info button */}
        {onInfo && (
          <button
            onClick={onInfo}
            className="absolute top-2 right-2 w-8 h-8 text-gray-600 hover:text-gray-800 flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200"
            title="Station Info"
          >
            <FaCircleInfo className="text-sm" />
          </button>
        )}
      </div>
      
      {/* Title below icon */}
      <div className="mt-2">
        <h3 className="font-medium text-gray-900 text-xs text-center truncate">
          {station.name}
        </h3>
        <p className="text-xs text-gray-500 text-center truncate mt-0.5">
          {station.city || station.country}
        </p>
      </div>
    </div>
  );
}