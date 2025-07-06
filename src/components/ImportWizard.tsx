import React, { useState, useEffect } from 'react';
import { FaDownload, FaGlobe, FaFilter, FaCheck, FaX, FaEye, FaSpinner } from 'react-icons/fa6';
import { API_CONFIG } from '../config/api';

interface ImportFilters {
  country: string;
  state: string;
  minVotes: number;
  minBitrate: number;
  hasGeo: boolean;
  hidebroken: boolean;
  order: 'clickcount' | 'votes' | 'name';
  limit: number;
}

interface PreviewStation {
  changeuuid: string;
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  country: string;
  countrycode: string;
  state: string;
  language: string;
  votes: number;
  clickcount: number;
  codec: string;
  bitrate: number;
  geo_lat: number;
  geo_long: number;
  tags: string;
  selected?: boolean;
}

interface ImportWizardProps {
  onClose: () => void;
  onImportComplete: () => void;
}

const ImportWizard: React.FC<ImportWizardProps> = ({ onClose, onImportComplete }) => {
  const [step, setStep] = useState(1);
  const [filters, setFilters] = useState<ImportFilters>({
    country: '',
    state: '',
    minVotes: 1,
    minBitrate: 64,
    hasGeo: false,
    hidebroken: true,
    order: 'clickcount',
    limit: 100
  });
  
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [previewStations, setPreviewStations] = useState<PreviewStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = API_CONFIG.BASE_URL;

  // Load countries on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (filters.country) {
      fetchStates(filters.country);
    } else {
      setStates([]);
      updateFilter('state', '');
    }
  }, [filters.country]);

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${API_BASE}/import/countries`);
      if (response.ok) {
        const data = await response.json();
        setCountries(data.countries || []);
      }
    } catch (err) {
      console.error('Failed to fetch countries:', err);
    }
  };

  const fetchStates = async (country: string) => {
    try {
      const response = await fetch(`${API_BASE}/import/states/${encodeURIComponent(country)}`);
      if (response.ok) {
        const data = await response.json();
        setStates(data.states || []);
      }
    } catch (err) {
      console.error('Failed to fetch states:', err);
    }
  };

  const updateFilter = (key: keyof ImportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const fetchPreviewStations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters.country) params.append('country', filters.country);
      if (filters.state) params.append('state', filters.state);
      if (filters.minVotes > 0) params.append('minVotes', filters.minVotes.toString());
      if (filters.minBitrate > 0) params.append('minBitrate', filters.minBitrate.toString());
      if (filters.hasGeo) params.append('hasGeo', 'true');
      if (filters.hidebroken) params.append('hidebroken', 'true');
      params.append('order', filters.order);
      params.append('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE}/import/preview?${params}`);
      if (!response.ok) throw new Error('Failed to preview stations');
      
      const data = await response.json();
      const stationsWithSelection = data.stations.map((station: PreviewStation) => ({
        ...station,
        selected: true // Default all to selected
      }));
      
      setPreviewStations(stationsWithSelection);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview stations');
    } finally {
      setLoading(false);
    }
  };

  const toggleStationSelection = (stationuuid: string) => {
    setPreviewStations(prev => 
      prev.map(station => 
        station.stationuuid === stationuuid 
          ? { ...station, selected: !station.selected }
          : station
      )
    );
  };

  const toggleSelectAll = () => {
    const allSelected = previewStations.every(s => s.selected);
    setPreviewStations(prev => 
      prev.map(station => ({ ...station, selected: !allSelected }))
    );
  };

  const importSelectedStations = async () => {
    const selectedStations = previewStations.filter(s => s.selected);
    if (selectedStations.length === 0) {
      setError('Please select at least one station to import');
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/import/stations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stations: selectedStations })
      });

      if (!response.ok) throw new Error('Failed to import stations');
      
      const result = await response.json();
      let message = `Successfully imported ${result.imported} stations!`;
      if (result.duplicates && result.duplicates > 0) {
        message += ` (${result.duplicates} duplicates skipped)`;
      }
      if (result.errors && result.errors.length > 0) {
        message += `\n\nSome stations failed to import:\n${result.errors.slice(0, 5).join('\n')}`;
        if (result.errors.length > 5) {
          message += `\n... and ${result.errors.length - 5} more`;
        }
      }
      alert(message);
      onImportComplete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import stations');
    } finally {
      setImporting(false);
    }
  };

  const selectedCount = previewStations.filter(s => s.selected).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaDownload className="text-blue-600" />
                Station Import Wizard
              </h2>
              <p className="text-sm text-gray-600 mt-1">Import radio stations from Radio Browser</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <FaX />
            </button>
          </div>
          
          {/* Step indicator */}
          <div className="flex items-center gap-4 mt-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-8 h-0.5 ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaGlobe />
                  Step 1: Choose Location
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      value={filters.country}
                      onChange={(e) => updateFilter('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Countries</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province
                    </label>
                    <select
                      value={filters.state}
                      onChange={(e) => updateFilter('state', e.target.value)}
                      disabled={!filters.country}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">All States/Provinces</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next: Filters
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaFilter />
                  Step 2: Quality Filters
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Votes: {filters.minVotes}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={filters.minVotes}
                        onChange={(e) => updateFilter('minVotes', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Bitrate: {filters.minBitrate} kbps
                      </label>
                      <input
                        type="range"
                        min="32"
                        max="320"
                        step="32"
                        value={filters.minBitrate}
                        onChange={(e) => updateFilter('minBitrate', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Limit Results: {filters.limit}
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="500"
                        step="10"
                        value={filters.limit}
                        onChange={(e) => updateFilter('limit', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort Order
                      </label>
                      <select
                        value={filters.order}
                        onChange={(e) => updateFilter('order', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="clickcount">Most Popular</option>
                        <option value="votes">Most Voted</option>
                        <option value="name">Alphabetical</option>
                      </select>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.hasGeo}
                          onChange={(e) => updateFilter('hasGeo', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Has Geographic Coordinates</span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.hidebroken}
                          onChange={(e) => updateFilter('hidebroken', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Hide Broken Streams</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={fetchPreviewStations}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaEye />}
                  Preview Stations
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaCheck />
                  Step 3: Select Stations ({selectedCount}/{previewStations.length})
                </h3>
                
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={toggleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {previewStations.every(s => s.selected) ? 'Deselect All' : 'Select All'}
                  </button>
                  
                  <div className="text-sm text-gray-600">
                    Found {previewStations.length} stations
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  {previewStations.map((station) => (
                    <div
                      key={station.stationuuid}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                        station.selected ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={station.selected || false}
                          onChange={() => toggleStationSelection(station.stationuuid)}
                          className="rounded"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {station.name}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>{station.country}</span>
                            {station.state && <span>• {station.state}</span>}
                            <span>• {station.codec} {station.bitrate}kbps</span>
                            <span>• {station.votes} votes</span>
                            <span>• {station.clickcount} clicks</span>
                            {station.geo_lat && station.geo_long && (
                              <span>• 📍 {station.geo_lat.toFixed(2)}, {station.geo_long.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={importSelectedStations}
                  disabled={importing || selectedCount === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {importing ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                  Import {selectedCount} Stations
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportWizard;