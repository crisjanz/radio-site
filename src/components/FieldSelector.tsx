import type { Station } from '../types/Station';

interface ScrapedData {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  favicon?: string;
  logo?: string;
  hours?: string;
  category?: string;
  rating?: number;
  photos?: string[];
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface ScrapeResult {
  success: boolean;
  data?: ScrapedData;
  error?: string;
  source?: string;
}

interface FieldSelectorProps {
  primaryResult: ScrapeResult;
  secondaryResult: ScrapeResult;
  selectedStation: Station | null;
  fieldSelections: {[key: string]: 'primary' | 'secondary'};
  onFieldSelection: (field: string, source: 'primary' | 'secondary') => void;
  onApplySelections: () => void;
  onCancel: () => void;
}

export default function FieldSelector({
  primaryResult,
  secondaryResult,
  selectedStation,
  fieldSelections,
  onFieldSelection,
  onApplySelections,
  onCancel,
}: FieldSelectorProps) {
  const primaryData = primaryResult.data;
  const secondaryData = secondaryResult.data;
  
  const fields = [
    { key: 'phone', label: 'Phone Number', primary: primaryData?.phone, secondary: secondaryData?.phone },
    { key: 'email', label: 'Email', primary: primaryData?.email, secondary: secondaryData?.email },
    { key: 'description', label: 'Description', primary: primaryData?.description, secondary: secondaryData?.description },
    { key: 'address', label: 'Address', primary: primaryData?.address, secondary: secondaryData?.address },
    { key: 'website', label: 'Website', primary: primaryData?.website, secondary: secondaryData?.website },
    { key: 'favicon', label: 'Favicon', primary: primaryData?.favicon, secondary: secondaryData?.favicon },
    { key: 'logo', label: 'Logo', primary: primaryData?.logo, secondary: secondaryData?.logo },
    { key: 'coordinates', label: 'Coordinates', primary: primaryData?.coordinates ? `${primaryData.coordinates.latitude}, ${primaryData.coordinates.longitude}` : null, secondary: secondaryData?.coordinates ? `${secondaryData.coordinates.latitude}, ${secondaryData.coordinates.longitude}` : null },
    { key: 'facebook', label: 'Facebook', primary: primaryData?.socialMedia?.facebook, secondary: secondaryData?.socialMedia?.facebook },
    { key: 'twitter', label: 'Twitter', primary: primaryData?.socialMedia?.twitter, secondary: secondaryData?.socialMedia?.twitter },
    { key: 'instagram', label: 'Instagram', primary: primaryData?.socialMedia?.instagram, secondary: secondaryData?.socialMedia?.instagram },
    { key: 'youtube', label: 'YouTube', primary: primaryData?.socialMedia?.youtube, secondary: secondaryData?.socialMedia?.youtube },
  ];

  const availableFields = fields.filter(field => field.primary || field.secondary);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Choose Data for Each Field</h2>
      <p className="text-sm text-gray-600 mb-6">
        Select which source to use for each piece of information:
      </p>

      <div className="space-y-4 mb-6">
        {availableFields.map(field => {
          // Get current station value for this field
          let currentValue;
          switch (field.key) {
            case 'phone': currentValue = selectedStation?.phone; break;
            case 'email': currentValue = selectedStation?.email; break;
            case 'description': currentValue = selectedStation?.description; break;
            case 'address': currentValue = selectedStation?.address; break;
            case 'website': currentValue = selectedStation?.homepage; break;
            case 'favicon': currentValue = selectedStation?.favicon; break;
            case 'logo': currentValue = selectedStation?.logo; break;
            case 'coordinates': 
              currentValue = selectedStation?.latitude && selectedStation?.longitude 
                ? `${selectedStation.latitude}, ${selectedStation.longitude}` 
                : null; 
              break;
            case 'facebook': currentValue = selectedStation?.facebookUrl; break;
            case 'twitter': currentValue = selectedStation?.twitterUrl; break;
            case 'instagram': currentValue = selectedStation?.instagramUrl; break;
            case 'youtube': currentValue = selectedStation?.youtubeUrl; break;
          }

          return (
            <div key={field.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{field.label}</h4>
                <span className="text-xs text-gray-500">
                  {currentValue ? '🔄 Will replace existing' : '✨ Will add new'}
                </span>
              </div>

              {/* Show current value if exists */}
              {currentValue && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs font-medium text-yellow-800">Current Value</span>
                  </div>
                  <p className="text-xs text-yellow-900 break-all">{currentValue}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Primary Source Option */}
              {field.primary && (
                <div className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  fieldSelections[field.key] === 'primary' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onFieldSelection(field.key, 'primary')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      fieldSelections[field.key] === 'primary' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">Primary URL</span>
                  </div>
                  
                  {/* Image preview for favicon/logo fields */}
                  {(field.key === 'favicon' || field.key === 'logo') && field.primary && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`${field.key === 'favicon' ? 'w-6 h-6' : 'w-8 h-6'} bg-gray-100 rounded border flex items-center justify-center overflow-hidden`}>
                        <img
                          src={field.primary}
                          alt={`${field.key} preview`}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<span class="text-xs text-red-400">❌</span>';
                            }
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">Preview</span>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-900 break-all">{field.primary}</p>
                </div>
              )}

              {/* Secondary Source Option */}
              {field.secondary && (
                <div className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  fieldSelections[field.key] === 'secondary' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onFieldSelection(field.key, 'secondary')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      fieldSelections[field.key] === 'secondary' ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">Secondary URL</span>
                  </div>
                  
                  {/* Image preview for favicon/logo fields */}
                  {(field.key === 'favicon' || field.key === 'logo') && field.secondary && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`${field.key === 'favicon' ? 'w-6 h-6' : 'w-8 h-6'} bg-gray-100 rounded border flex items-center justify-center overflow-hidden`}>
                        <img
                          src={field.secondary}
                          alt={`${field.key} preview`}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<span class="text-xs text-red-400">❌</span>';
                            }
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">Preview</span>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-900 break-all">{field.secondary}</p>
                </div>
              )}

              {/* Show placeholder if only one source has data */}
              {!field.primary && field.secondary && (
                <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-500">Primary URL</span>
                  </div>
                  <p className="text-sm text-gray-500 italic">No data found</p>
                </div>
              )}
              
              {!field.secondary && field.primary && (
                <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-500">Secondary URL</span>
                  </div>
                  <p className="text-sm text-gray-500 italic">No data found</p>
                </div>
              )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onApplySelections}
          disabled={Object.keys(fieldSelections).length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Apply Selections ({Object.keys(fieldSelections).length} fields)
        </button>
      </div>
    </div>
  );
}