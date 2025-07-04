import { FaSpinner, FaSave, FaEye, FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import type { Station } from '../types/Station';

interface StationPreviewProps {
  previewData: Partial<Station>;
  saving: boolean;
  onFieldUpdate: (field: keyof Station, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function StationPreview({
  previewData,
  saving,
  onFieldUpdate,
  onSave,
  onCancel,
}: StationPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Edit Station Information</h2>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Save Changes
            </button>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Basic Information */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Station Name</label>
                <input
                  type="text"
                  value={previewData.name || ''}
                  onChange={(e) => onFieldUpdate('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Station Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={previewData.country || ''}
                  onChange={(e) => onFieldUpdate('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Canada"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={previewData.city || ''}
                  onChange={(e) => onFieldUpdate('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Toronto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                <input
                  type="text"
                  value={previewData.genre || ''}
                  onChange={(e) => onFieldUpdate('genre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Pop, Rock, News, Talk"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <input
                  type="text"
                  value={previewData.type || ''}
                  onChange={(e) => onFieldUpdate('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="music, talk, news"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <input
                  type="text"
                  value={previewData.language || ''}
                  onChange={(e) => onFieldUpdate('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="english, french, spanish"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={previewData.description || ''}
                onChange={(e) => onFieldUpdate('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Station description and programming information..."
              />
            </div>
          </div>

          {/* URLs and Media */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-3">URLs and Media</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stream URL</label>
                <input
                  type="url"
                  value={previewData.streamUrl || ''}
                  onChange={(e) => onFieldUpdate('streamUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="https://stream.station.com/live"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Homepage</label>
                <input
                  type="url"
                  value={previewData.homepage || ''}
                  onChange={(e) => onFieldUpdate('homepage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="https://station.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Favicon URL 
                    <span className="text-xs text-blue-600">(used on front page)</span>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={previewData.favicon || ''}
                      onChange={(e) => onFieldUpdate('favicon', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="https://station.com/favicon.ico"
                    />
                    {previewData.favicon && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                          <img
                            src={previewData.favicon}
                            alt="Favicon preview"
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<span class="text-xs text-red-500">❌</span>';
                                parent.title = 'Failed to load';
                              }
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">Preview</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL
                    <span className="text-xs text-gray-500">(for future use)</span>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={previewData.logo || ''}
                      onChange={(e) => onFieldUpdate('logo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="https://station.com/logo.png"
                    />
                    {previewData.logo && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                        <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                          <img
                            src={previewData.logo}
                            alt="Logo preview"
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<span class="text-xs text-red-500">❌</span>';
                                parent.title = 'Failed to load';
                              }
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">Preview</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={previewData.phone || ''}
                  onChange={(e) => onFieldUpdate('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={previewData.email || ''}
                  onChange={(e) => onFieldUpdate('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="contact@station.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={previewData.address || ''}
                  onChange={(e) => onFieldUpdate('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="123 Radio St, City, State, Postal Code"
                />
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-3">Technical Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <input
                  type="text"
                  value={previewData.frequency || ''}
                  onChange={(e) => onFieldUpdate('frequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="101.5 FM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bitrate (kbps)</label>
                <input
                  type="number"
                  value={previewData.bitrate || ''}
                  onChange={(e) => onFieldUpdate('bitrate', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="128"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Codec</label>
                <input
                  type="text"
                  value={previewData.codec || ''}
                  onChange={(e) => onFieldUpdate('codec', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="MP3, AAC, OGG"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-3">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={previewData.latitude || ''}
                  onChange={(e) => onFieldUpdate('latitude', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="43.6532"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={previewData.longitude || ''}
                  onChange={(e) => onFieldUpdate('longitude', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="-79.3832"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <input
                  type="text"
                  value={previewData.timezone || ''}
                  onChange={(e) => onFieldUpdate('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="America/Toronto"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-3">Social Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <FaFacebook className="text-blue-600 flex-shrink-0" />
                <input
                  type="url"
                  value={previewData.facebookUrl || ''}
                  onChange={(e) => onFieldUpdate('facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/station"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <FaTwitter className="text-blue-400 flex-shrink-0" />
                <input
                  type="url"
                  value={previewData.twitterUrl || ''}
                  onChange={(e) => onFieldUpdate('twitterUrl', e.target.value)}
                  placeholder="https://twitter.com/station"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <FaInstagram className="text-pink-600 flex-shrink-0" />
                <input
                  type="url"
                  value={previewData.instagramUrl || ''}
                  onChange={(e) => onFieldUpdate('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/station"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <FaYoutube className="text-red-600 flex-shrink-0" />
                <input
                  type="url"
                  value={previewData.youtubeUrl || ''}
                  onChange={(e) => onFieldUpdate('youtubeUrl', e.target.value)}
                  placeholder="https://youtube.com/station"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-3">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
                <input
                  type="number"
                  value={previewData.establishedYear || ''}
                  onChange={(e) => onFieldUpdate('establishedYear', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="1995"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                <input
                  type="text"
                  value={previewData.owner || ''}
                  onChange={(e) => onFieldUpdate('owner', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Media Company Inc."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={previewData.tags || ''}
                  onChange={(e) => onFieldUpdate('tags', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="rock, local, morning show, indie"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Station Card Preview */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaEye className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">How it appears on front page</h3>
        </div>
        
        {/* Station card preview */}
        <div className="flex justify-center mb-6">
          <div className="w-32">
            {/* Icon - matches HomeContent StationCard */}
            <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-xl shadow-sm">
              {previewData.favicon && previewData.favicon.trim() !== '' ? (
                <img
                  src={previewData.favicon}
                  alt={previewData.name}
                  className="max-w-full max-h-full object-contain"
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
              <div className={`favicon-fallback flex items-center justify-center ${previewData.favicon && previewData.favicon.trim() !== '' ? 'hidden' : ''}`}>
                <img src="/streemr-play.png" alt="Streemr" className="w-8 h-8 object-contain" />
              </div>
            </div>
            
            {/* Title below icon */}
            <div className="mt-2">
              <h3 className="font-medium text-gray-900 text-xs text-center truncate">
                {previewData.name || 'Station Name'}
              </h3>
              <p className="text-xs text-gray-500 text-center truncate mt-0.5">
                {previewData.country || 'Country'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Station details */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">{previewData.name || 'Not set'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Country:</span>
            <span className="font-medium">{previewData.country || 'Not set'}</span>
          </div>
          
          {previewData.description && (
            <div className="flex justify-between">
              <span className="text-gray-600">Description:</span>
              <span className="font-medium text-right max-w-xs truncate">{previewData.description}</span>
            </div>
          )}
          
          {previewData.phone && (
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{previewData.phone}</span>
            </div>
          )}
          
          {previewData.email && (
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{previewData.email}</span>
            </div>
          )}

          <div className="pt-2 border-t">
            <span className="text-gray-600 text-xs">Social Media Links:</span>
            <div className="flex gap-2 mt-1">
              {previewData.facebookUrl && <FaFacebook className="text-blue-600" />}
              {previewData.twitterUrl && <FaTwitter className="text-blue-400" />}
              {previewData.instagramUrl && <FaInstagram className="text-pink-600" />}
              {previewData.youtubeUrl && <FaYoutube className="text-red-600" />}
              {!previewData.facebookUrl && !previewData.twitterUrl && !previewData.instagramUrl && !previewData.youtubeUrl && (
                <span className="text-gray-400 text-xs">None found</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}