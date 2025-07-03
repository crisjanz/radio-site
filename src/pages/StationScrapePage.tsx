import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { API_CONFIG } from '../config/api';
import type { Station } from '../types/Station';
import StationSelector from '../components/StationSelector';
import ScrapingInput from '../components/ScrapingInput';
import ScrapeResults from '../components/ScrapeResults';
import FieldSelector from '../components/FieldSelector';
import StationPreview from '../components/StationPreview';

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
  suggestion?: string;
}

const StationScrapePage: React.FC = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [secondaryUrl, setSecondaryUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const [secondaryResult, setSecondaryResult] = useState<ScrapeResult | null>(null);
  const [previewData, setPreviewData] = useState<Partial<Station> | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDataSelector, setShowDataSelector] = useState(false);
  
  // Station filtering state
  const [stationFilter, setStationFilter] = useState({
    search: '',
    country: '',
  });

  const API_BASE = API_CONFIG.BASE_URL;

  // Load stations for selection
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch(`${API_BASE}/stations`);
        if (response.ok) {
          const data = await response.json();
          setStations(data);
        }
      } catch (err) {
        console.error('Failed to load stations:', err);
      }
    };
    fetchStations();
  }, []);

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) return;

    setScraping(true);
    setScrapeResult(null);
    setSecondaryResult(null);
    setPreviewData(null);

    try {
      // Scrape primary URL
      const response = await fetch(`${API_BASE}/scrape/business`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl })
      });

      const result = await response.json();
      setScrapeResult(result);

      // Scrape secondary URL if provided
      let secondaryData = null;
      if (secondaryUrl.trim()) {
        try {
          const secondaryResponse = await fetch(`${API_BASE}/scrape/business`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: secondaryUrl })
          });
          
          const secondaryResult = await secondaryResponse.json();
          setSecondaryResult(secondaryResult);
          
          if (secondaryResult.success && secondaryResult.data) {
            secondaryData = secondaryResult.data;
          }
        } catch (err) {
          console.error('Secondary scrape failed:', err);
        }
      }

      // Show data selector if both sources have data
      if ((result.success && result.data) && secondaryData) {
        setShowDataSelector(true);
      } else if ((result.success && result.data) || secondaryData) {
        // Auto-use single source data
        const sourceData = result.success ? result.data : secondaryData;
        const merged: Partial<Station> = {
          ...selectedStation,
          description: sourceData.description || selectedStation?.description,
          address: sourceData.address || selectedStation?.address,
          phone: sourceData.phone || selectedStation?.phone,
          email: sourceData.email || selectedStation?.email,
          homepage: sourceData.website || selectedStation?.homepage,
          favicon: sourceData.favicon || selectedStation?.favicon,
          logo: sourceData.logo || selectedStation?.logo,
          facebookUrl: sourceData.socialMedia?.facebook || selectedStation?.facebookUrl,
          twitterUrl: sourceData.socialMedia?.twitter || selectedStation?.twitterUrl,
          instagramUrl: sourceData.socialMedia?.instagram || selectedStation?.instagramUrl,
          youtubeUrl: sourceData.socialMedia?.youtube || selectedStation?.youtubeUrl,
        };

        // Add coordinates if found
        if (sourceData.coordinates) {
          merged.latitude = sourceData.coordinates.latitude;
          merged.longitude = sourceData.coordinates.longitude;
        }

        setPreviewData(merged);
      }
    } catch (err) {
      setScrapeResult({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to scrape data'
      });
    } finally {
      setScraping(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedStation || !previewData) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/stations/${selectedStation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(previewData)
      });

      if (response.ok) {
        // Update the local stations list
        setStations(prev => prev.map(s => 
          s.id === selectedStation.id ? { ...s, ...previewData } : s
        ));
        
        // Reset state
        setScrapeResult(null);
        setSecondaryResult(null);
        setPreviewData(null);
        setScrapeUrl('');
        setSecondaryUrl('');
        
        alert('Station updated successfully!');
      } else {
        throw new Error('Failed to update station');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const updatePreviewField = (field: keyof Station, value: any) => {
    if (!previewData) return;
    setPreviewData(prev => ({ ...prev, [field]: value }));
  };

  const [fieldSelections, setFieldSelections] = useState<{[key: string]: 'primary' | 'secondary'}>({});

  const handleFieldSelection = (field: string, source: 'primary' | 'secondary') => {
    setFieldSelections(prev => ({ ...prev, [field]: source }));
  };

  const applyFieldSelections = () => {
    if (!scrapeResult?.data && !secondaryResult?.data) return;

    const primaryData = scrapeResult?.success ? scrapeResult.data : null;
    const secondaryData = secondaryResult?.success ? secondaryResult.data : null;

    const merged: Partial<Station> = {
      ...selectedStation,
    };

    // Apply field selections
    Object.entries(fieldSelections).forEach(([field, source]) => {
      const sourceData = source === 'primary' ? primaryData : secondaryData;
      if (!sourceData) return;

      switch (field) {
        case 'description':
          merged.description = sourceData.description || selectedStation?.description;
          break;
        case 'phone':
          merged.phone = sourceData.phone || selectedStation?.phone;
          break;
        case 'email':
          merged.email = sourceData.email || selectedStation?.email;
          break;
        case 'address':
          merged.address = sourceData.address || selectedStation?.address;
          break;
        case 'website':
          merged.homepage = sourceData.website || selectedStation?.homepage;
          break;
        case 'favicon':
          merged.favicon = sourceData.favicon || selectedStation?.favicon;
          break;
        case 'logo':
          merged.logo = sourceData.logo || selectedStation?.logo;
          break;
        case 'coordinates':
          if (sourceData.coordinates) {
            merged.latitude = sourceData.coordinates.latitude;
            merged.longitude = sourceData.coordinates.longitude;
          }
          break;
        case 'facebook':
          merged.facebookUrl = sourceData.socialMedia?.facebook || selectedStation?.facebookUrl;
          break;
        case 'twitter':
          merged.twitterUrl = sourceData.socialMedia?.twitter || selectedStation?.twitterUrl;
          break;
        case 'instagram':
          merged.instagramUrl = sourceData.socialMedia?.instagram || selectedStation?.instagramUrl;
          break;
        case 'youtube':
          merged.youtubeUrl = sourceData.socialMedia?.youtube || selectedStation?.youtubeUrl;
          break;
      }
    });

    setPreviewData(merged);
    setShowDataSelector(false);
    setFieldSelections({});
  };

  // Filter functions
  const updateStationFilter = (key: string, value: string) => {
    setStationFilter(prev => ({ ...prev, [key]: value }));
  };

  const clearStationFilter = () => {
    setStationFilter({
      search: '',
      country: '',
    });
  };

  const handleStationSelect = (station: Station | null) => {
    setSelectedStation(station);
    setScrapeResult(null);
    setSecondaryResult(null);
    setPreviewData(null);
    // Auto-populate primary URL with station's homepage if available
    if (station?.homepage) {
      setScrapeUrl(station.homepage);
    } else {
      setScrapeUrl('');
    }
    setSecondaryUrl('');
  };

  const handleManualEntry = () => {
    if (selectedStation) {
      setPreviewData(selectedStation);
      setScrapeResult(null);
      setSecondaryResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            Back to Admin
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Station Information Scraper</h1>
            <p className="text-gray-600 mt-1">Extract business information from Google Maps and websites</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Section */}
          <div className="space-y-6">
            
            {/* Station Selection */}
            <StationSelector
              stations={stations}
              selectedStation={selectedStation}
              filters={stationFilter}
              onStationSelect={handleStationSelect}
              onFilterUpdate={updateStationFilter}
              onClearFilters={clearStationFilter}
            />

            {/* URL Input */}
            <ScrapingInput
              scrapeUrl={scrapeUrl}
              secondaryUrl={secondaryUrl}
              scraping={scraping}
              canScrape={!!selectedStation && !!scrapeUrl.trim()}
              onScrapeUrlChange={setScrapeUrl}
              onSecondaryUrlChange={setSecondaryUrl}
              onScrape={handleScrape}
            />

            {/* Scrape Results */}
            <ScrapeResults
              scrapeResult={scrapeResult}
              secondaryResult={secondaryResult}
              onManualEntry={handleManualEntry}
            />

            {/* Field-by-Field Data Selection */}
            {showDataSelector && scrapeResult?.data && secondaryResult?.data && (
              <FieldSelector
                primaryResult={scrapeResult}
                secondaryResult={secondaryResult}
                selectedStation={selectedStation}
                fieldSelections={fieldSelections}
                onFieldSelection={handleFieldSelection}
                onApplySelections={applyFieldSelections}
                onCancel={() => {
                  setShowDataSelector(false);
                  setFieldSelections({});
                }}
              />
            )}
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            
            {previewData && (
              <StationPreview
                previewData={previewData}
                saving={saving}
                onFieldUpdate={updatePreviewField}
                onSave={handleSaveChanges}
                onCancel={() => setPreviewData(null)}
              />
            )}

            {/* Instructions */}
            {!previewData && (
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                <h3 className="font-semibold text-blue-900 mb-3">How to Use</h3>
                <ol className="space-y-2 text-sm text-blue-800">
                  <li>1. Select a station from the dropdown</li>
                  <li>2. Find the station's Google Maps or business page</li>
                  <li>3. Copy and paste the URL</li>
                  <li>4. Click "Scrape Business Information"</li>
                  <li>5. Review and edit the extracted data</li>
                  <li>6. Save changes to update the station</li>
                </ol>
                
                <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-1">Pro Tip:</p>
                  <p className="text-xs text-blue-600">
                    The scraper works best with Google My Business pages and official station websites. 
                    It can extract contact info, descriptions, social media links, and location data.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationScrapePage;