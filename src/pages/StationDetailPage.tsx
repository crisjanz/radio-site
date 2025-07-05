import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlay, FaPause, FaSpinner } from 'react-icons/fa';
import type { Station } from '../types/Station';

interface StationDetailPageProps {
  currentStation: Station | null;
  onPlayStation: (station: Station) => void;
  isPlaying: boolean;
}

const StationDetailPage = ({ currentStation, onPlayStation, isPlaying }: StationDetailPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No station ID provided');
      setLoading(false);
      return;
    }

    const fetchStation = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/stations/${id}`);
        if (!response.ok) {
          throw new Error(`Station not found: ${response.status}`);
        }
        const stationData = await response.json();
        setStation(stationData);
      } catch (err) {
        console.error('Error fetching station:', err);
        setError(err instanceof Error ? err.message : 'Failed to load station');
      } finally {
        setLoading(false);
      }
    };

    fetchStation();
  }, [id]);

  const isCurrentStation = currentStation?.id === station?.id;
  const showPlayButton = !isCurrentStation || !isPlaying;
  const showPauseButton = isCurrentStation && isPlaying;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-2xl text-blue-600" />
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Station Not Found</h2>
        <p className="text-gray-600 mb-4">{error || 'The requested station could not be found.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>
        
        <div className="flex items-start gap-6">
          {/* Station Image */}
          <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {station.favicon || station.logo ? (
              <img
                src={station.favicon || station.logo}
                alt={station.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <i className="fas fa-radio text-3xl"></i>
              </div>
            )}
          </div>

          {/* Station Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{station.name}</h1>
            <p className="text-lg text-gray-600 mb-4">
              {station.country}{station.city ? `, ${station.city}` : ''}
            </p>
            
            {/* Play/Pause Button */}
            <button
              onClick={() => onPlayStation(station)}
              className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showPlayButton && <FaPlay />}
              {showPauseButton && <FaPause />}
              <span>
                {showPlayButton && 'Play Station'}
                {showPauseButton && 'Pause'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Station Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Station Information</h3>
          <div className="space-y-3">
            {station.genre && (
              <div>
                <span className="text-sm font-medium text-gray-500">Genre:</span>
                <span className="ml-2 text-sm text-gray-900">{station.genre}</span>
              </div>
            )}
            {station.type && (
              <div>
                <span className="text-sm font-medium text-gray-500">Type:</span>
                <span className="ml-2 text-sm text-gray-900">{station.type}</span>
              </div>
            )}
            {station.language && (
              <div>
                <span className="text-sm font-medium text-gray-500">Language:</span>
                <span className="ml-2 text-sm text-gray-900">{station.language}</span>
              </div>
            )}
            {station.bitrate && (
              <div>
                <span className="text-sm font-medium text-gray-500">Bitrate:</span>
                <span className="ml-2 text-sm text-gray-900">{station.bitrate} kbps</span>
              </div>
            )}
            {station.codec && (
              <div>
                <span className="text-sm font-medium text-gray-500">Codec:</span>
                <span className="ml-2 text-sm text-gray-900">{station.codec}</span>
              </div>
            )}
          </div>
        </div>

        {/* Links */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
          <div className="space-y-3">
            {station.homepage && (
              <div>
                <span className="text-sm font-medium text-gray-500">Website:</span>
                <a
                  href={station.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  {station.homepage}
                </a>
              </div>
            )}
            {station.streamUrl && (
              <div>
                <span className="text-sm font-medium text-gray-500">Stream URL:</span>
                <a
                  href={station.streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-sm text-blue-600 hover:text-blue-800 break-all"
                >
                  {station.streamUrl}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {station.tags && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {station.tags.split(',').map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {station.description && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-700">{station.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationDetailPage;