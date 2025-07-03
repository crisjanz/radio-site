import { useEffect, useState } from 'react';
import { FaPlus, FaMagic, FaRobot, FaCogs, FaHeartbeat } from 'react-icons/fa';
import ImportWizard from '../components/ImportWizard';
import StationFormModal from '../components/StationFormModal';
import StationFilters from '../components/StationFilters';
import StationList from '../components/StationList';
import { API_CONFIG } from '../config/api';
import type { Station } from '../types/Station';

export default function AdminPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImportWizard, setShowImportWizard] = useState(false);
  
  // Station form modal state
  const [showStationModal, setShowStationModal] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [stationForm, setStationForm] = useState<Partial<Station>>({});
  
  // Filtering state
  const [filters, setFilters] = useState({
    search: '',
    country: '',
    type: '',
    geoStatus: '', // 'with-geo', 'without-geo', or ''
    cityStatus: '', // 'with-city', 'without-city', or ''
  });

  const API = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STATIONS}`;

  // Load stations from backend
  const fetchStations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API);
      if (!response.ok) throw new Error('Failed to fetch stations');
      const data = await response.json();
      setStations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stations');
      console.error('Failed to fetch stations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // Modal functions
  const openAddStationModal = () => {
    setEditingStation(null);
    setStationForm({
      name: '',
      country: '',
      streamUrl: '',
      genre: '',
      type: '',
      favicon: '',
      logo: '',
      homepage: '',
      city: '',
      description: '',
      language: '',
      frequency: '',
      bitrate: undefined,
      codec: '',
      latitude: undefined,
      longitude: undefined,
      email: '',
      phone: '',
      address: '',
      facebookUrl: '',
      twitterUrl: '',
      instagramUrl: '',
      youtubeUrl: '',
      establishedYear: undefined,
      owner: '',
      timezone: '',
      tags: '',
      metadataApiUrl: '',
      metadataApiType: '',
      metadataFormat: '',
      metadataFields: '',
    });
    setShowStationModal(true);
  };

  const openEditStationModal = (station: Station) => {
    setEditingStation(station);
    setStationForm(station);
    setShowStationModal(true);
  };

  const closeStationModal = () => {
    setShowStationModal(false);
    setEditingStation(null);
    setStationForm({});
  };

  const updateStationField = (key: keyof Station, value: any) => {
    setStationForm(prev => ({ ...prev, [key]: value }));
  };

  const saveStationFromModal = async () => {
    if (!stationForm.name?.trim() || !stationForm.streamUrl?.trim()) {
      setError('Name and stream URL are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const url = editingStation ? `${API}/${editingStation.id}` : API;
      const method = editingStation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stationForm),
      });
      
      if (!response.ok) throw new Error(`Failed to ${editingStation ? 'update' : 'add'} station`);
      
      closeStationModal();
      await fetchStations();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${editingStation ? 'update' : 'add'} station`);
    } finally {
      setSaving(false);
    }
  };

  const deleteStation = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete station');
      
      await fetchStations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete station');
    } finally {
      setSaving(false);
    }
  };


  // Filter functions
  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      country: '',
      type: '',
      geoStatus: '',
      cityStatus: '',
    });
  };

  // Get unique values for filter dropdowns
  const uniqueCountries = [...new Set(stations.map(s => s.country).filter(Boolean))].sort();
  const uniqueTypes = [...new Set(stations.map(s => s.type).filter((type): type is string => Boolean(type)))].sort();

  // Apply filters to stations
  const filteredStations = stations.filter(station => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        station.name.toLowerCase().includes(searchTerm) ||
        station.country.toLowerCase().includes(searchTerm) ||
        (station.city && station.city.toLowerCase().includes(searchTerm)) ||
        (station.type && station.type.toLowerCase().includes(searchTerm)) ||
        (station.genre && station.genre.toLowerCase().includes(searchTerm));
      
      if (!matchesSearch) return false;
    }
    
    // Country filter
    if (filters.country && station.country !== filters.country) return false;
    
    // Type filter
    if (filters.type && station.type !== filters.type) return false;
    
    // Geo status filter
    if (filters.geoStatus) {
      const hasGeo = station.latitude && station.longitude;
      if (filters.geoStatus === 'with-geo' && !hasGeo) return false;
      if (filters.geoStatus === 'without-geo' && hasGeo) return false;
    }
    
    // City status filter
    if (filters.cityStatus) {
      const hasCity = station.city && station.city.trim();
      if (filters.cityStatus === 'with-city' && !hasCity) return false;
      if (filters.cityStatus === 'without-city' && hasCity) return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Radio Station Admin</h1>
              <p className="text-gray-600 mt-1">Manage your radio station database</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={openAddStationModal}
                className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
              >
                <FaPlus className="text-sm" />
                Add Station
              </button>
              
              <a
                href="/scrape"
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FaRobot className="text-sm" />
                Web Scraper
              </a>
              
              <a
                href="/admin/normalize"
                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <FaCogs className="text-sm" />
                Normalize Data
              </a>
              
              <button
                onClick={() => setShowImportWizard(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaMagic className="text-sm" />
                Import Wizard
              </button>
              
              <a
                href="/admin/health"
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaHeartbeat className="text-sm" />
                Health Check
              </a>
              
              <div className="text-sm text-gray-600">
                {filteredStations.length} of {stations.length} station{stations.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <StationFilters
        filters={filters}
        uniqueCountries={uniqueCountries}
        uniqueTypes={uniqueTypes}
        onFilterUpdate={updateFilter}
        onClearFilters={clearFilters}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <StationList
          stations={filteredStations}
          loading={loading}
          onEditStation={openEditStationModal}
          onDeleteStation={deleteStation}
        />
      </div>

      {/* Import Wizard Modal */}
      {showImportWizard && (
        <ImportWizard
          onClose={() => setShowImportWizard(false)}
          onImportComplete={() => {
            setShowImportWizard(false);
            fetchStations(); // Refresh the station list
          }}
        />
      )}

      {/* Station Form Modal */}
      <StationFormModal
        show={showStationModal}
        editingStation={editingStation}
        stationForm={stationForm}
        saving={saving}
        error={error}
        onClose={closeStationModal}
        onSave={saveStationFromModal}
        onFieldUpdate={updateStationField}
      />
    </div>
  );
}