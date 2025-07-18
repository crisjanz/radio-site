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
  FaGear
} from 'react-icons/fa6';
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
  currentStation, 
  isPlaying = false, 
  onPlayStation 
}: StationInfoPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = API_CONFIG.BASE_URL;

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Station Header */}
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                {getFaviconUrl(station, { width: 512, height: 512, quality: 90, cacheBust: true }) ? (
                  <img
                    src={getFaviconUrl(station, { width: 512, height: 512, quality: 90, cacheBust: true })!}
                    alt={station.name}
                    className="max-w-full max-h-full object-contain rounded-xl"
                  />
                ) : (
                  <img src="/streemr-play.png" alt="Streemr" className="w-16 h-16 object-contain" />
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{station.name}</h2>
              <p className="text-gray-600 mb-4">
                {station.city ? `${station.city}, ${station.country}` : station.country}
              </p>
              
              {(station.latitude && station.longitude) && (
                <button
                  onClick={() => navigate(`/?tab=discover&lat=${station.latitude}&lng=${station.longitude}`)}
                  className="text-blue-600 hover:text-blue-700 text-sm mb-6 flex items-center gap-1 mx-auto"
                >
                  <FaMapMarkerAlt className="text-xs" />
                  See on Map
                </button>
              )}
              
              
              {/* About Content */}
              {station.description && (
                <div className="mt-6 bg-white rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                  <p className="text-gray-600 leading-relaxed">{station.description}</p>
                </div>
              )}
            </div>

            {/* Right Column - Station Info, Technical Details, Contact */}
            <div className="space-y-6">
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
    </div>
  );
}