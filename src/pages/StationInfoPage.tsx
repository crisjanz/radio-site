import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import { 
  FaArrowLeft, 
  FaPlay, 
  FaPause, 
  FaMusic, 
  FaGlobe, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaClock,
  FaBuilding,
  FaCalendarAlt,
  FaTags,
  FaSignal
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

  const isCurrentlyPlaying = currentStation?.id === station.id && isPlaying;

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <h1 className="font-semibold text-gray-900">Station Details</h1>
          <div className="w-16"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6" style={{ 
        paddingBottom: currentStation ? '8.5rem' : '4rem' 
      }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Station Header */}
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                {station.favicon && station.favicon.trim() !== '' ? (
                  <img
                    src={station.favicon}
                    alt={station.name}
                    className="max-w-full max-h-full object-contain"
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
              
              <button
                onClick={() => onPlayStation(station)}
                className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors mx-auto text-lg font-medium"
              >
                {isCurrentlyPlaying ? <FaPause /> : <FaPlay />}
                {isCurrentlyPlaying ? 'Pause Station' : 'Play Station'}
              </button>
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
                      <div className="w-4 h-4 text-gray-400 flex items-center justify-center text-xs font-bold">📻</div>
                      <div>
                        <p className="font-medium text-gray-900">Frequency</p>
                        <p className="text-gray-600">{station.frequency}</p>
                      </div>
                    </div>
                  )}
                  {station.language && (
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 text-gray-400 flex items-center justify-center text-xs font-bold">🗣</div>
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
                  {station.description && (
                    <div>
                      <p className="font-medium text-gray-900 mb-2">About</p>
                      <p className="text-gray-600 leading-relaxed">{station.description}</p>
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
                        <div className="w-4 h-4 text-gray-400 flex items-center justify-center text-xs font-bold">🎵</div>
                        <div>
                          <p className="font-medium text-gray-900">Bitrate</p>
                          <p className="text-gray-600">{station.bitrate} kbps</p>
                        </div>
                      </div>
                    )}
                    {station.codec && (
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 text-gray-400 flex items-center justify-center text-xs font-bold">🔧</div>
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
                      <div className="flex items-center gap-3">
                        <FaGlobe className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Website</p>
                          <a 
                            href={station.homepage} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 underline"
                          >
                            {station.homepage}
                          </a>
                        </div>
                      </div>
                    )}
                    {station.email && (
                      <div className="flex items-center gap-3">
                        <FaEnvelope className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <a 
                            href={`mailto:${station.email}`}
                            className="text-blue-600 hover:text-blue-700 underline"
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
                            className="text-blue-600 hover:text-blue-700 underline"
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
            </div>
          </div>

          {/* Additional Content - Full Width */}
          <div className="space-y-6">
            {/* Social Media */}
            {(station.facebookUrl || station.twitterUrl || station.instagramUrl || station.youtubeUrl) && (
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
                <div className="space-y-4">
                  {station.facebookUrl && (
                    <div className="flex items-center gap-3">
                      <FaFacebook className="text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Facebook</p>
                        <a 
                          href={station.facebookUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          {station.facebookUrl}
                        </a>
                      </div>
                    </div>
                  )}
                  {station.twitterUrl && (
                    <div className="flex items-center gap-3">
                      <FaTwitter className="text-blue-400" />
                      <div>
                        <p className="font-medium text-gray-900">Twitter</p>
                        <a 
                          href={station.twitterUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          {station.twitterUrl}
                        </a>
                      </div>
                    </div>
                  )}
                  {station.instagramUrl && (
                    <div className="flex items-center gap-3">
                      <FaInstagram className="text-pink-500" />
                      <div>
                        <p className="font-medium text-gray-900">Instagram</p>
                        <a 
                          href={station.instagramUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          {station.instagramUrl}
                        </a>
                      </div>
                    </div>
                  )}
                  {station.youtubeUrl && (
                    <div className="flex items-center gap-3">
                      <FaYoutube className="text-red-500" />
                      <div>
                        <p className="font-medium text-gray-900">YouTube</p>
                        <a 
                          href={station.youtubeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          {station.youtubeUrl}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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

            {/* Metadata API */}
            {(station.metadataApiType || station.metadataFormat || station.metadataFields) && (
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata API</h3>
                <div className="space-y-4">
                  {station.metadataApiType && (
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 text-gray-400 flex items-center justify-center text-xs font-bold">🔗</div>
                      <div>
                        <p className="font-medium text-gray-900">API Type</p>
                        <p className="text-gray-600">{station.metadataApiType}</p>
                      </div>
                    </div>
                  )}
                  {station.metadataFormat && (
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 text-gray-400 flex items-center justify-center text-xs font-bold">📄</div>
                      <div>
                        <p className="font-medium text-gray-900">Format</p>
                        <p className="text-gray-600">{station.metadataFormat}</p>
                      </div>
                    </div>
                  )}
                  {station.metadataFields && (
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 text-gray-400 flex items-center justify-center text-xs font-bold">🏷</div>
                      <div>
                        <p className="font-medium text-gray-900">Field Mappings</p>
                        <pre className="text-gray-600 text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto mt-1">
                          {station.metadataFields}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}