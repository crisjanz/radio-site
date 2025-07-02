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
          <h2 className="text-lg font-semibold text-gray-900">Preview Changes</h2>
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

        <div className="space-y-4">
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={previewData.description || ''}
              onChange={(e) => onFieldUpdate('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Station description..."
            />
          </div>

          {/* Contact Info */}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={previewData.city || ''}
                onChange={(e) => onFieldUpdate('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Springfield"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={previewData.address || ''}
                onChange={(e) => onFieldUpdate('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="123 Radio St, City, State"
              />
            </div>
          </div>

          {/* Social Media */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Social Media</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FaFacebook className="text-blue-600" />
                <input
                  type="url"
                  value={previewData.facebookUrl || ''}
                  onChange={(e) => onFieldUpdate('facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/station"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <FaTwitter className="text-blue-400" />
                <input
                  type="url"
                  value={previewData.twitterUrl || ''}
                  onChange={(e) => onFieldUpdate('twitterUrl', e.target.value)}
                  placeholder="https://twitter.com/station"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <FaInstagram className="text-pink-600" />
                <input
                  type="url"
                  value={previewData.instagramUrl || ''}
                  onChange={(e) => onFieldUpdate('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/station"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <FaYoutube className="text-red-600" />
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

          {/* Coordinates */}
          {previewData.latitude && previewData.longitude && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coordinates</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  value={previewData.latitude}
                  onChange={(e) => onFieldUpdate('latitude', parseFloat(e.target.value))}
                  placeholder="Latitude"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <input
                  type="number"
                  step="any"
                  value={previewData.longitude}
                  onChange={(e) => onFieldUpdate('longitude', parseFloat(e.target.value))}
                  placeholder="Longitude"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Station Detail */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaEye className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Station Preview</h3>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">{previewData.name}</span>
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