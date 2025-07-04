import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Station } from '../types/Station';
import { API_CONFIG, getFaviconUrl } from '../config/api';
import { 
  FaPlay, 
  FaPause, 
  FaGlobe, 
  FaMapMarkerAlt, 
  FaSignal,
  FaLanguage,
  FaClock,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaArrowLeft,
  FaMusic,
  FaBroadcastTower,
  FaInfoCircle
} from 'react-icons/fa';

interface StationDetailPageProps {
  currentStation: Station | null;
  onPlayStation: (station: Station) => void;
  isPlaying?: boolean;
}

const StationDetailPage: React.FC<StationDetailPageProps> = ({
  currentStation,
  onPlayStation,
  isPlaying = false
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSong, setCurrentSong] = useState<string | null>(null);

  const API_BASE = API_CONFIG.BASE_URL;

  useEffect(() => {
    const fetchStation = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/stations/${id}`);
        if (!response.ok) throw new Error('Station not found');
        
        const stationData = await response.json();
        setStation(stationData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load station');
      } finally {
        setLoading(false);
      }
    };

    fetchStation();
  }, [id]);

  // Fetch current song if station is playing
  useEffect(() => {
    if (!station || !isPlaying || currentStation?.id !== station.id) return;

    const fetchCurrentSong = async () => {
      try {
        const response = await fetch(`${API_BASE}/metadata?stream=${encodeURIComponent(station.streamUrl)}`);
        if (response.ok) {
          const data = await response.json();
          setCurrentSong(data.title || data.song || null);
        }
      } catch (err) {
        console.error('Failed to fetch current song:', err);
      }
    };

    fetchCurrentSong();
    const interval = setInterval(fetchCurrentSong, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [station, isPlaying, currentStation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading station details...</p>
        </div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaBroadcastTower className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">{error || 'Station not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isCurrentlyPlaying = currentStation?.id === station.id && isPlaying;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            Back to Radio Stations
          </button>
          
          <div className="flex items-start gap-6">
            {/* Station Logo */}
            <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 bg-white">
              {getFaviconUrl(station) ? (
                <img
                  src={getFaviconUrl(station)!}
                  alt={station.name}
                  className="w-full h-full object-fill"
                  style={{ width: '100%', height: '100%' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.favicon-fallback') as HTMLElement;
                    if (fallback) {
                      fallback.classList.remove('hidden');
                    }
                  }}
                />
              ) : null}
              <div className={`favicon-fallback w-full h-full flex items-center justify-center ${getFaviconUrl(station) ? 'hidden' : ''}`}>
                <img src="/streemr-play.png" alt="Streemr" className="w-24 h-24 object-contain" />
              </div>
            </div>

            {/* Station Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{station.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-xs" />
                  {station.city ? `${station.city}, ${station.country}` : station.country}
                </div>
                
                {station.frequency && (
                  <div className="flex items-center gap-1">
                    <FaSignal className="text-xs" />
                    {station.frequency}
                  </div>
                )}
                
                {station.language && (
                  <div className="flex items-center gap-1">
                    <FaLanguage className="text-xs" />
                    {station.language}
                  </div>
                )}
                
                {station.type && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {station.type}
                  </span>
                )}
              </div>

              {station.description && (
                <p className="text-gray-700 mb-4">{station.description}</p>
              )}

              {/* Play Button */}
              <button
                onClick={() => onPlayStation(station)}
                className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-colors font-medium ${
                  isCurrentlyPlaying
                    ? 'bg-green-100 text-green-800 border-2 border-green-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCurrentlyPlaying ? <FaPause /> : <FaPlay />}
                {isCurrentlyPlaying ? 'Now Playing' : 'Play Station'}
              </button>

              {/* Now Playing */}
              {isCurrentlyPlaying && currentSong && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <FaMusic className="text-xs" />
                  <span className="font-medium">Now Playing:</span>
                  <span>{currentSong}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Technical Details */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-blue-600" />
                Technical Details
              </h2>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {station.bitrate && (
                  <div>
                    <span className="text-gray-600">Bitrate:</span>
                    <span className="ml-2 font-medium">{station.bitrate} kbps</span>
                  </div>
                )}
                
                {station.codec && (
                  <div>
                    <span className="text-gray-600">Codec:</span>
                    <span className="ml-2 font-medium">{station.codec}</span>
                  </div>
                )}
                
                {station.genre && (
                  <div>
                    <span className="text-gray-600">Genre:</span>
                    <span className="ml-2 font-medium">{station.genre}</span>
                  </div>
                )}
                
                {station.establishedYear && (
                  <div>
                    <span className="text-gray-600">Established:</span>
                    <span className="ml-2 font-medium">{station.establishedYear}</span>
                  </div>
                )}
                
                {station.owner && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Owner:</span>
                    <span className="ml-2 font-medium">{station.owner}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule/Programs */}
            {(station.schedule || station.programs) && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaClock className="text-blue-600" />
                  Programming
                </h2>
                
                {station.programs && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Shows</h3>
                    <div className="text-sm text-gray-600">
                      {/* TODO: Parse JSON programs and display them nicely */}
                      <pre className="whitespace-pre-wrap">{station.programs}</pre>
                    </div>
                  </div>
                )}
                
                {station.schedule && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Schedule</h3>
                    <div className="text-sm text-gray-600">
                      {/* TODO: Parse JSON schedule and display it nicely */}
                      <pre className="whitespace-pre-wrap">{station.schedule}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                {station.homepage && (
                  <a
                    href={station.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FaGlobe className="text-sm" />
                    Visit Website
                  </a>
                )}
                
                {station.latitude && station.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${station.latitude},${station.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FaMapMarkerAlt className="text-sm" />
                    View on Map
                  </a>
                )}
              </div>
            </div>

            {/* Social Media */}
            {(station.facebookUrl || station.twitterUrl || station.instagramUrl || station.youtubeUrl) && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Social Media</h3>
                
                <div className="space-y-3">
                  {station.facebookUrl && (
                    <a
                      href={station.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FaFacebook className="text-sm" />
                      Facebook
                    </a>
                  )}
                  
                  {station.twitterUrl && (
                    <a
                      href={station.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FaTwitter className="text-sm" />
                      Twitter
                    </a>
                  )}
                  
                  {station.instagramUrl && (
                    <a
                      href={station.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FaInstagram className="text-sm" />
                      Instagram
                    </a>
                  )}
                  
                  {station.youtubeUrl && (
                    <a
                      href={station.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FaYoutube className="text-sm" />
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Contact Info */}
            {(station.email || station.phone || station.address) && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                
                <div className="space-y-3 text-sm">
                  {station.email && (
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-gray-400 text-xs" />
                      <a href={`mailto:${station.email}`} className="text-blue-600 hover:text-blue-700">
                        {station.email}
                      </a>
                    </div>
                  )}
                  
                  {station.phone && (
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-400 text-xs" />
                      <a href={`tel:${station.phone}`} className="text-blue-600 hover:text-blue-700">
                        {station.phone}
                      </a>
                    </div>
                  )}
                  
                  {station.address && (
                    <div className="flex items-start gap-2">
                      <FaMapMarkerAlt className="text-gray-400 text-xs mt-1" />
                      <span className="text-gray-700">{station.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default StationDetailPage;