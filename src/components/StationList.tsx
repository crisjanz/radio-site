import { FaMusic, FaGlobe, FaTags, FaMapMarkerAlt, FaPlay, FaEdit, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import type { Station } from '../types/Station';

interface StationListProps {
  stations: Station[];
  loading: boolean;
  onEditStation: (station: Station) => void;
  onDeleteStation: (id: number, name: string) => void;
}

export default function StationList({
  stations,
  loading,
  onEditStation,
  onDeleteStation,
}: StationListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaMusic />
            Radio Stations
          </h2>
        </div>
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading stations...</p>
        </div>
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaMusic />
            Radio Stations
          </h2>
        </div>
        <div className="p-8 text-center">
          <FaMusic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No stations match your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FaMusic />
          Radio Stations
        </h2>
      </div>

      <div className="overflow-y-auto">
        <div className="divide-y divide-gray-200">
          {stations.map((station) => (
            <div key={station.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Station Logo */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    {station.favicon ? (
                      <img
                        src={station.favicon}
                        alt={`${station.name} logo`}
                        className="w-full h-full object-fill"
                        style={{ width: '100%', height: '100%' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${station.favicon ? 'hidden' : ''}`}>
                      <img src="/streemr-play.png" alt="Streemr" className="w-8 h-8 object-contain" />
                    </div>
                  </div>

                  {/* Station Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{station.name}</h3>
                      {station.homepage && (
                        <a
                          href={station.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <FaExternalLinkAlt className="text-xs" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FaGlobe className="text-xs" />
                        {station.city ? `${station.city}, ${station.country}` : station.country}
                      </span>
                      {station.type && (
                        <span className="flex items-center gap-1">
                          <FaTags className="text-xs" />
                          {station.type}
                        </span>
                      )}
                      {station.latitude && station.longitude && (
                        <span className="flex items-center gap-1 text-green-600">
                          <FaMapMarkerAlt className="text-xs" />
                          Located
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const audio = new Audio(station.streamUrl);
                      audio.play().catch(err => console.error('Failed to play:', err));
                    }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Test stream"
                  >
                    <FaPlay className="text-sm" />
                  </button>
                  
                  <button
                    onClick={() => onEditStation(station)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit station"
                  >
                    <FaEdit className="text-sm" />
                  </button>
                  
                  <button
                    onClick={() => onDeleteStation(station.id, station.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete station"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}