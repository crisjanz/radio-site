import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_CONFIG, getFaviconUrl } from '../config/api';
// import AdBanner from '../components/AdBanner';
import { 
  FaMusic, 
  FaGlobe, 
  FaTags,
  FaEnvelope, 
  FaPhone, 
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaClock,
  FaBuilding,
  FaSignal,
  FaLanguage,
  FaRadio,
  FaGaugeHigh,
  FaGear,
  FaThumbsUp,
  FaThumbsDown,
  FaPlay,
  FaStop
} from 'react-icons/fa6';
import FeedbackModal from '../components/FeedbackModal';
import RecentlyPlayed from '../components/RecentlyPlayed';
import { submitFeedback } from '../utils/feedbackApi';
import { 
  FaMapMarkerAlt,
  FaCalendarAlt
} from 'react-icons/fa';
import type { Station } from '../types/Station';

interface StationInfoPageProps {
  currentStation?: Station | null;
  isPlaying?: boolean;
  onPlayStation: (station: Station) => void;
}

export default function StationInfoPage({ 
  currentStation: _currentStation, 
  isPlaying: _isPlaying = false, 
  onPlayStation: _onPlayStation 
}: StationInfoPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Feedback system state  
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const API_BASE = API_CONFIG.BASE_URL;

  const handleThumbsUp = async () => {
    if (!station) return;
    try {
      setIsSubmittingFeedback(true);
      await submitFeedback(station.nanoid || station.id, { type: 'great_station' });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleThumbsDown = () => {
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async (feedback: { type: string; details?: string }) => {
    if (!station) return;
    setIsSubmittingFeedback(true);
    try {
      await submitFeedback(station.nanoid || station.id, feedback);
      setShowFeedbackModal(false);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    const fetchStation = async () => {
      try {
        const response = await fetch(`${API_BASE}/stations/${id}`);
        if (response.ok) {
          const data = await response.json();
          setStation(data);
        }
      } catch (err) {
        console.error('Failed to load station:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStation();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Station not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700"
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="p-6 overflow-x-hidden">
        <div className="max-w-4xl mx-auto">

          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column - Station Header (Bigger) */}
            <div className="lg:col-span-3 bg-white rounded-xl p-8">
              {/* Centered Header Design - Mimicking FullScreenPlayer */}
              <div className="text-center mb-8">
                {/* Station Logo - Centered and Square */}
                <div className="w-48 h-48 mx-auto mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg flex items-center justify-center">
                  {getFaviconUrl(station, { width: 512, height: 512, quality: 90, cacheBust: true }) ? (
                    <img
                      src={getFaviconUrl(station, { width: 512, height: 512, quality: 90, cacheBust: true })!}
                      alt={station.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img src="/streemr-play.png" alt="Streemr" className="w-24 h-24 object-contain" />
                  )}
                </div>
                
                {/* Station Name */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{station.name}</h1>
                
                {/* City/Country */}
                <p className="text-lg text-gray-600 mb-2">
                  {station.city ? `${station.city}, ${station.country}` : station.country}
                </p>

                {/* See on Map - Centered below controls */}
<div className="flex items-center justify-center gap-6 mb-6">
                {(station.latitude && station.longitude) && (
                  <button
                    onClick={() => navigate(`/?tab=discover&lat=${station.latitude}&lng=${station.longitude}`)}
                    className="text-gray-600 hover:text-blue-700 text-sm flex items-center gap-1 justify-center"
                  >
                    <FaMapMarkerAlt className="text-xs" />
                    See on Map
                  </button>
                )}
</div>
                
                {/* Controls - Mimicking FullScreenPlayer Layout */}
                <div className="flex items-center justify-center gap-6 mb-6">
                  {/* Thumbs Up */}
                  <button
                    onClick={handleThumbsUp}
                    disabled={isSubmittingFeedback}
                    className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full hover:text-green-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                    title="Great station"
                  >
                    <FaThumbsUp className="text-lg" />
                  </button>

                  {/* Play/Stop Button - Round like FullScreenPlayer */}
                  {(() => {
                    const isCurrentStationPlaying = _currentStation && 
                      ((_currentStation.nanoid && _currentStation.nanoid === station.nanoid) || 
                       (_currentStation.id === station.id)) && 
                      _isPlaying;

                    return (
                      <button
                        onClick={() => _onPlayStation(station)}
                        className={`w-18 h-18 rounded-full transition-colors flex items-center justify-center shadow-lg ${
                          isCurrentStationPlaying
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isCurrentStationPlaying ? (
                          <FaStop className="text-2xl" />
                        ) : (
                          <FaPlay className="text-2xl ml-1" />
                        )}
                      </button>
                    );
                  })()}

                  {/* Thumbs Down */}
                  <button
                    onClick={handleThumbsDown}
                    disabled={isSubmittingFeedback}
                    className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full hover:text-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                    title="Report issue"
                  >
                    <FaThumbsDown className="text-lg" />
                  </button>
                </div>
                

              </div>
              
              {/* About Content */}
              {station.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-700 leading-relaxed">{station.description}</p>
                </div>
              )}
              
              {/* Recently Played Section - Now inside main card */}
              <RecentlyPlayed 
                stationId={station.nanoid || station.id} 
                stationName={station.name} 
              />
            </div>
          {/* Ad Banner - Top of page */}
          <div className="mb-6">
            {/* Mobile Ad */}
            <div className="block md:hidden">
              <div 
                style={{
                  height: '50px',
                  backgroundColor: '#f8f9fa',
                  border: '1px dashed #e9ecef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#6c757d'
                }}
              >
                Mobile Station Ad
              </div>
            </div>
            
            {/* Desktop Ad */}
            <div className="hidden md:block">
              <div 
                style={{
                  height: '90px',
                  backgroundColor: '#f8f9fa',
                  border: '1px dashed #e9ecef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#6c757d'
                }}
              >
                Desktop Station Ad
              </div>
            </div>
          </div>

            {/* Right Column - Station Info, Technical Details, Contact (Smaller) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Station Information */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Station Information</h3>
                <div className="space-y-4">
                  {station.genre && (
                    <div className="flex items-center gap-3">
                      <FaMusic className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Genre</p>
                        <p className="text-gray-600">{station.genre}</p>
                      </div>
                    </div>
                  )}
                  {station.type && (
                    <div className="flex items-center gap-3">
                      <FaSignal className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Type</p>
                        <p className="text-gray-600">{station.type}</p>
                      </div>
                    </div>
                  )}
                  {station.frequency && (
                    <div className="flex items-center gap-3">
                      <FaRadio className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Frequency</p>
                        <p className="text-gray-600">{station.frequency}</p>
                      </div>
                    </div>
                  )}
                  {station.language && (
                    <div className="flex items-center gap-3">
                      <FaLanguage className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Language</p>
                        <p className="text-gray-600">{station.language}</p>
                      </div>
                    </div>
                  )}
                  {station.owner && (
                    <div className="flex items-center gap-3">
                      <FaBuilding className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Owner</p>
                        <p className="text-gray-600">{station.owner}</p>
                      </div>
                    </div>
                  )}
                  {station.establishedYear && (
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Established</p>
                        <p className="text-gray-600">{station.establishedYear}</p>
                      </div>
                    </div>
                  )}
                  {station.timezone && (
                    <div className="flex items-center gap-3">
                      <FaClock className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Timezone</p>
                        <p className="text-gray-600">{station.timezone}</p>
                      </div>
                    </div>
                  )}
                  {station.tags && (
                    <div className="flex items-center gap-3">
                      <FaTags className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Tags</p>
                        <p className="text-gray-600">{station.tags}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Details */}
              {(station.bitrate || station.codec) && (
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h3>
                  <div className="space-y-4">
                    {station.bitrate && (
                      <div className="flex items-center gap-3">
                        <FaGaugeHigh className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Bitrate</p>
                          <p className="text-gray-600">{station.bitrate} kbps</p>
                        </div>
                      </div>
                    )}
                    {station.codec && (
                      <div className="flex items-center gap-3">
                        <FaGear className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Codec</p>
                          <p className="text-gray-600">{station.codec}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {(station.homepage || station.email || station.phone || station.address) && (
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                  <div className="space-y-4">
                    {station.homepage && (
                      <div className="flex items-center gap-3 min-w-0">
                        <FaGlobe className="text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900">Website</p>
                          <a 
                            href={station.homepage} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-800 break-all cursor-pointer transition-colors"
                          >
                            {station.homepage}
                          </a>
                        </div>
                      </div>
                    )}
                    {station.email && (
                      <div className="flex items-center gap-3 min-w-0">
                        <FaEnvelope className="text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900">Email</p>
                          <a 
                            href={`mailto:${station.email}`}
                            className="text-gray-600 hover:text-gray-800 break-all cursor-pointer transition-colors"
                          >
                            {station.email}
                          </a>
                        </div>
                      </div>
                    )}
                    {station.phone && (
                      <div className="flex items-center gap-3">
                        <FaPhone className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Phone</p>
                          <a 
                            href={`tel:${station.phone}`}
                            className="text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
                          >
                            {station.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    {station.address && (
                      <div className="flex items-center gap-3">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Address</p>
                          <p className="text-gray-600">{station.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Social Media */}
              {(station.facebookUrl || station.twitterUrl || station.instagramUrl || station.youtubeUrl) && (
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
                  <div className="space-y-4">
                    {station.facebookUrl && (
                      <div className="flex items-center gap-3 min-w-0">
                        <FaFacebook className="text-blue-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900">Facebook</p>
                          <a 
                            href={station.facebookUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-800 break-all cursor-pointer transition-colors"
                          >
                            {station.facebookUrl}
                          </a>
                        </div>
                      </div>
                    )}
                    {station.twitterUrl && (
                      <div className="flex items-center gap-3 min-w-0">
                        <FaTwitter className="text-blue-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900">Twitter</p>
                          <a 
                            href={station.twitterUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-800 break-all cursor-pointer transition-colors"
                          >
                            {station.twitterUrl}
                          </a>
                        </div>
                      </div>
                    )}
                    {station.instagramUrl && (
                      <div className="flex items-center gap-3 min-w-0">
                        <FaInstagram className="text-pink-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900">Instagram</p>
                          <a 
                            href={station.instagramUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-800 break-all cursor-pointer transition-colors"
                          >
                            {station.instagramUrl}
                          </a>
                        </div>
                      </div>
                    )}
                    {station.youtubeUrl && (
                      <div className="flex items-center gap-3 min-w-0">
                        <FaYoutube className="text-red-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900">YouTube</p>
                          <a 
                            href={station.youtubeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-800 break-all cursor-pointer transition-colors"
                          >
                            {station.youtubeUrl}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Content - Full Width */}
          <div className="space-y-6">

            {/* Programs & Schedule */}
            {(station.programs || station.schedule) && (
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Programs & Schedule</h3>
                <div className="space-y-4">
                  {station.programs && (
                    <div>
                      <p className="font-medium text-gray-900 mb-2">Programs</p>
                      <pre className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg overflow-x-auto">
                        {station.programs}
                      </pre>
                    </div>
                  )}
                  {station.schedule && (
                    <div>
                      <p className="font-medium text-gray-900 mb-2">Schedule</p>
                      <pre className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg overflow-x-auto">
                        {station.schedule}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Feedback Modal */}
        {station && (
          <FeedbackModal
            isOpen={showFeedbackModal}
            onClose={() => setShowFeedbackModal(false)}
            onSubmit={handleFeedbackSubmit}
            stationName={station.name}
            isSubmitting={isSubmittingFeedback}
          />
        )}
    </div>
  );
}