import { useState, useEffect } from 'react';
import { FaImage, FaDownload, FaEdit, FaList, FaLayerGroup, FaSearch, FaSpinner } from 'react-icons/fa';
import { API_CONFIG } from '../config/api';
import ImageEditor from '../components/ImageEditor';
import { Canvas } from 'fabric';

interface Station {
  id: number;
  name: string;
  country: string;
  favicon?: string;
  logo?: string;
}

interface ImageInfo {
  station: Station;
  hasLocalImage: boolean;
  localImageUrl?: string;
}

interface BatchResult {
  stationId: number;
  success: boolean;
  error?: string;
  imageUrl?: string;
  stationName?: string;
}

export default function ImageEditorPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [brokenStations, setBrokenStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedView, setSelectedView] = useState<'search' | 'broken' | 'batch'>('search');
  const [selectedForBatch, setSelectedForBatch] = useState<number[]>([]);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);

  const API_BASE = API_CONFIG.BASE_URL;

  // Search for stations
  const searchStations = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/stations/search?q=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setStations(data); // The search endpoint returns an array directly
      }
    } catch (error) {
      console.error('Error searching stations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load broken favicons
  const loadBrokenStations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/images/broken`);
      if (response.ok) {
        const data = await response.json();
        setBrokenStations(data);
      }
    } catch (error) {
      console.error('Error loading broken stations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Download favicon for a station
  const downloadFavicon = async (stationId: number) => {
    try {
      const response = await fetch(`${API_BASE}/images/download/${stationId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`✅ Downloaded favicon for ${result.stationName}`);
        
        // Refresh image info if this is the selected station
        if (selectedStation?.id === stationId) {
          loadImageInfo(stationId);
        }
      } else {
        const error = await response.json();
        alert(`❌ Failed to download: ${error.error}`);
      }
    } catch (error) {
      console.error('Error downloading favicon:', error);
      alert('❌ Network error while downloading');
    }
  };

  // Load image info for a station
  const loadImageInfo = async (stationId: number) => {
    try {
      const response = await fetch(`${API_BASE}/images/info/${stationId}`);
      if (response.ok) {
        const data = await response.json();
        setImageInfo(data);
      }
    } catch (error) {
      console.error('Error loading image info:', error);
    }
  };

  // Select a station for editing
  const selectStation = (station: Station) => {
    setSelectedStation(station);
    loadImageInfo(station.id);
  };

  // Open image editor
  const openEditor = () => {
    setShowEditor(true);
  };

  // Save edited image
  const saveEditedImage = async (canvas: Canvas) => {
    if (!selectedStation) return;

    try {
      console.log('Attempting to save canvas...');
      
      // Try canvas export with error handling and timeout
      let saveCompleted = false;
      
      // Set a timeout to catch silent failures
      const saveTimeout = setTimeout(() => {
        if (!saveCompleted) {
          console.error('Canvas export timed out - likely blocked by CORS/security');
          tryAlternativeSave();
        }
      }, 3000);
      
      try {
        canvas.toBlob((blob) => {
          saveCompleted = true;
          clearTimeout(saveTimeout);
          
          if (!blob) {
            console.error('Failed to generate blob from canvas');
            alert('❌ Failed to generate image blob - trying alternative approach');
            tryAlternativeSave();
            return;
          }

          console.log('Successfully generated blob from canvas');
          
          // Create form data
          const formData = new FormData();
          formData.append('image', blob, `${selectedStation.id}.png`);

          // Upload to server
          fetch(`${API_BASE}/images/upload/${selectedStation.id}`, {
            method: 'POST',
            body: formData
          })
          .then(async (uploadResponse) => {
            if (uploadResponse.ok) {
              const result = await uploadResponse.json();
              alert(`✅ Saved image for ${result.stationName}`);
              setShowEditor(false);
              loadImageInfo(selectedStation.id);
            } else {
              const error = await uploadResponse.json();
              alert(`❌ Failed to save: ${error.error}`);
              setShowEditor(false); // Close editor even on error
            }
          })
          .catch((error) => {
            console.error('Error uploading image:', error);
            alert('❌ Error uploading image');
            setShowEditor(false); // Close editor even on error
          });
        }, 'image/png', 0.9);
      } catch (blobError) {
        saveCompleted = true;
        clearTimeout(saveTimeout);
        console.error('Canvas toBlob failed due to CORS/security:', blobError);
        tryAlternativeSave();
      }
      
      function tryAlternativeSave() {
        // Send editing parameters to backend for server-side processing
        console.log('Sending editing parameters to backend...');
        
        const editingParams = {
          canvasSize: 256, // Default canvas size
          backgroundColor: '#ffffff',
          // Add more editing parameters as needed
        };
        
        fetch(`${API_BASE}/images/process/${selectedStation.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingParams)
        })
        .then(async (response) => {
          if (response.ok) {
            const result = await response.json();
            alert(`✅ Image processed and saved for ${result.stationName}`);
            setShowEditor(false);
            loadImageInfo(selectedStation.id);
          } else {
            // If process endpoint doesn't exist, just close editor
            console.log('Process endpoint not implemented yet, closing editor');
            alert('✅ Editor closed (server-side processing not yet implemented)');
            setShowEditor(false);
          }
        })
        .catch((error) => {
          console.log('Process endpoint not available, closing editor');
          alert('✅ Editor closed. For now, use "Download Original" to get images locally, then upload edited versions manually.');
          setShowEditor(false);
        });
      }
      
    } catch (error) {
      console.error('Error saving image:', error);
      alert('❌ Error saving image');
    }
  };

  // Batch download
  const batchDownload = async () => {
    if (selectedForBatch.length === 0) {
      alert('Please select stations for batch processing');
      return;
    }

    setBatchProcessing(true);
    setBatchResults([]);

    try {
      const response = await fetch(`${API_BASE}/images/batch-download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationIds: selectedForBatch })
      });

      if (response.ok) {
        const data = await response.json();
        setBatchResults(data.results);
        setSelectedForBatch([]);
      } else {
        alert('❌ Batch processing failed');
      }
    } catch (error) {
      console.error('Error in batch processing:', error);
      alert('❌ Network error during batch processing');
    } finally {
      setBatchProcessing(false);
    }
  };

  // Toggle station selection for batch
  const toggleBatchSelection = (stationId: number) => {
    setSelectedForBatch(prev => 
      prev.includes(stationId) 
        ? prev.filter(id => id !== stationId)
        : [...prev, stationId]
    );
  };

  useEffect(() => {
    if (selectedView === 'broken') {
      loadBrokenStations();
    }
  }, [selectedView]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <FaImage className="inline mr-3" />
            Favicon Image Editor
          </h1>
          <p className="text-gray-600">
            Download, edit, and manage station favicon images
          </p>
        </div>

        {/* View Selector */}
        <div className="mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedView('search')}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedView === 'search' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              <FaSearch className="inline mr-2" />
              Search Stations
            </button>
            <button
              onClick={() => setSelectedView('broken')}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedView === 'broken' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              <FaList className="inline mr-2" />
              Broken Favicons
            </button>
            <button
              onClick={() => setSelectedView('batch')}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedView === 'batch' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              <FaLayerGroup className="inline mr-2" />
              Batch Process
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Station List */}
          <div className="lg:col-span-2">
            {selectedView === 'search' && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex gap-4 mb-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search stations by name..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && searchStations()}
                  />
                  <button
                    onClick={searchStations}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : 'Search'}
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {stations.map((station) => (
                    <div
                      key={station.id}
                      onClick={() => selectStation(station)}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        selectedStation?.id === station.id ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                      }`}
                    >
                      <div className="font-medium">{station.name}</div>
                      <div className="text-sm text-gray-600">{station.country}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedView === 'broken' && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Stations with Broken Favicons</h3>
                  <button
                    onClick={loadBrokenStations}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : 'Refresh'}
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {brokenStations.map((station) => (
                    <div
                      key={station.id}
                      className={`p-3 border rounded-lg ${
                        selectedStation?.id === station.id ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          onClick={() => selectStation(station)}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">{station.name}</div>
                          <div className="text-sm text-gray-600">{station.country}</div>
                          <div className="text-xs text-red-600">
                            {station.favicon ? `HTTP: ${station.favicon.substring(0, 40)}...` : 'No favicon'}
                          </div>
                        </div>
                        <button
                          onClick={() => downloadFavicon(station.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedView === 'batch' && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Batch Processing</h3>
                  <div className="flex gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedForBatch.length} selected
                    </span>
                    <button
                      onClick={batchDownload}
                      disabled={batchProcessing || selectedForBatch.length === 0}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {batchProcessing ? <FaSpinner className="animate-spin" /> : 'Process Selected'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {brokenStations.map((station) => (
                    <div
                      key={station.id}
                      className="p-3 border rounded-lg border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedForBatch.includes(station.id)}
                          onChange={() => toggleBatchSelection(station.id)}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{station.name}</div>
                          <div className="text-sm text-gray-600">{station.country}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {batchResults.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Batch Results:</h4>
                    <div className="space-y-1 text-sm">
                      {batchResults.map((result, index) => (
                        <div key={index} className={result.success ? 'text-green-600' : 'text-red-600'}>
                          {result.success ? '✅' : '❌'} {result.stationName || `Station ${result.stationId}`}
                          {result.error && `: ${result.error}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Selected Station */}
          <div>
            {selectedStation ? (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">{selectedStation.name}</h3>
                
                {imageInfo && (
                  <div className="space-y-4">
                    {/* Current Image */}
                    <div>
                      <h4 className="font-medium mb-2">Current Image:</h4>
                      {imageInfo.hasLocalImage ? (
                        <div className="text-center">
                          <img
                            src={`${API_BASE}${imageInfo.localImageUrl}`}
                            alt={selectedStation.name}
                            className="mx-auto w-32 h-32 object-contain border border-gray-200 rounded"
                          />
                          <p className="text-sm text-green-600 mt-2">✅ Local image available</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          {imageInfo.station.favicon ? (
                            <img
                              src={imageInfo.station.favicon}
                              alt={selectedStation.name}
                              className="mx-auto w-32 h-32 object-contain border border-gray-200 rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-32 h-32 mx-auto bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                              <FaImage className="text-gray-400 text-2xl" />
                            </div>
                          )}
                          <p className="text-sm text-yellow-600 mt-2">⚠️ No local image</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      {!imageInfo.hasLocalImage && (
                        <button
                          onClick={() => downloadFavicon(selectedStation.id)}
                          className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <FaDownload />
                          Download Original
                        </button>
                      )}
                      
                      <button
                        onClick={openEditor}
                        disabled={!imageInfo.hasLocalImage && !imageInfo.station.favicon}
                        className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <FaEdit />
                        Edit Image
                      </button>
                    </div>

                    {/* Image Info */}
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><strong>Original URL:</strong></div>
                      <div className="break-all">{imageInfo.station.favicon || 'None'}</div>
                      {imageInfo.station.logo && (
                        <>
                          <div><strong>Logo URL:</strong></div>
                          <div className="break-all">{imageInfo.station.logo}</div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border p-6 text-center text-gray-500">
                <FaImage className="mx-auto text-4xl mb-4" />
                <p>Select a station to view and edit its favicon</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Editor Modal */}
      {showEditor && selectedStation && imageInfo && (
        <ImageEditor
          stationId={selectedStation.id}
          stationName={selectedStation.name}
          initialImageUrl={
            imageInfo.hasLocalImage 
              ? `${API_BASE}${imageInfo.localImageUrl}`
              : imageInfo.station.favicon
          }
          onSave={saveEditedImage}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}