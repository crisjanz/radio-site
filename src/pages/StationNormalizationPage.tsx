import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaSpinner, FaEye, FaSave, FaUndo } from 'react-icons/fa';

interface Station {
  id: number;
  name: string;
  genre: string | null;
  type: string | null;
  country: string;
}

interface NormalizationRule {
  original: string;
  normalized: string;
  type: 'genre' | 'type';
}

interface PendingChange {
  stationId: number;
  field: 'genre' | 'type';
  original: string;
  suggested: string;
  status: 'pending' | 'approved' | 'rejected';
}

const MUSIC_GENRES = [
  { value: 'rock', label: 'Rock' },
  { value: 'country', label: 'Country' },
  { value: 'pop', label: 'Pop' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'blues', label: 'Blues' },
  { value: 'classical', label: 'Classical' },
  { value: 'electronic', label: 'Electronic/Dance' },
  { value: 'hip-hop', label: 'Hip-Hop' },
  { value: 'alternative', label: 'Alternative/Indie' },
  { value: 'folk', label: 'Folk' },
  { value: 'christian', label: 'Christian/Religious' },
  { value: 'oldies', label: 'Oldies/Classic Hits' },
  { value: 'other', label: 'Other' }
];

const STATION_TYPES = [
  { value: 'music', label: 'Music' },
  { value: 'news', label: 'News' },
  { value: 'talk', label: 'Talk' },
  { value: 'sport', label: 'Sports' }
];

export default function StationNormalizationPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [rules, setRules] = useState<NormalizationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });

  useEffect(() => {
    fetchStations();
    fetchRules();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await fetch('http://192.168.1.69:3001/admin/stations/normalize');
      if (response.ok) {
        const data = await response.json();
        setStations(data.stations);
        setPendingChanges(data.pendingChanges || []);
        updateStats(data.pendingChanges || []);
      }
    } catch (error) {
      console.error('Failed to fetch stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await fetch('http://192.168.1.69:3001/admin/normalization-rules');
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    }
  };

  const updateStats = (changes: PendingChange[]) => {
    const stats = {
      total: changes.length,
      pending: changes.filter(c => c.status === 'pending').length,
      approved: changes.filter(c => c.status === 'approved').length
    };
    setStats(stats);
  };

  const analyzeStations = async () => {
    setProcessing(true);
    try {
      const response = await fetch('http://192.168.1.69:3001/admin/stations/analyze', {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setPendingChanges(data.pendingChanges);
        updateStats(data.pendingChanges);
      }
    } catch (error) {
      console.error('Failed to analyze stations:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleApproval = (changeId: number, status: 'approved' | 'rejected', customValue?: string) => {
    setPendingChanges(prev => prev.map(change => {
      if (change.stationId === changeId) {
        return {
          ...change,
          status,
          suggested: customValue || change.suggested
        };
      }
      return change;
    }));
    
    updateStats(pendingChanges.map(change => 
      change.stationId === changeId 
        ? { ...change, status }
        : change
    ));
  };

  const applyChanges = async () => {
    const approvedChanges = pendingChanges.filter(c => c.status === 'approved');
    
    if (approvedChanges.length === 0) {
      alert('No approved changes to apply');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('http://192.168.1.69:3001/admin/stations/apply-normalization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ changes: approvedChanges })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully updated ${result.updated} stations!`);
        fetchStations(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to apply changes:', error);
      alert('Failed to apply changes');
    } finally {
      setProcessing(false);
    }
  };

  const filteredChanges = pendingChanges.filter(change => {
    if (filter === 'all') return true;
    return change.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Station Normalization</h1>
          <p className="text-gray-600 mb-4">
            Clean up and normalize station genres and types. The system will suggest changes for inconsistent data.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stations.length}</div>
              <div className="text-sm text-blue-800">Total Stations</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-yellow-800">Pending Review</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-green-800">Approved Changes</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{rules.length}</div>
              <div className="text-sm text-gray-800">Saved Rules</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={analyzeStations}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {processing ? <FaSpinner className="animate-spin" /> : <FaEye />}
              Analyze Stations
            </button>
            
            <button
              onClick={applyChanges}
              disabled={processing || stats.approved === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {processing ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Apply Changes ({stats.approved})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filter === 'pending' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filter === 'approved' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved ({stats.approved})
            </button>
          </div>
        </div>

        {/* Changes List */}
        <div className="space-y-4">
          {filteredChanges.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <p className="text-gray-500">
                {filter === 'pending' 
                  ? 'No pending changes. Click "Analyze Stations" to find inconsistencies.'
                  : `No ${filter} changes found.`
                }
              </p>
            </div>
          ) : (
            filteredChanges.map((change) => {
              const station = stations.find(s => s.id === change.stationId);
              return (
                <ChangeCard
                  key={`${change.stationId}-${change.field}`}
                  change={change}
                  station={station}
                  onApprove={(customValue) => handleApproval(change.stationId, 'approved', customValue)}
                  onReject={() => handleApproval(change.stationId, 'rejected')}
                  onReset={() => handleApproval(change.stationId, 'pending')}
                  genres={MUSIC_GENRES}
                  types={STATION_TYPES}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

interface ChangeCardProps {
  change: PendingChange;
  station?: Station;
  onApprove: (customValue?: string) => void;
  onReject: () => void;
  onReset: () => void;
  genres: Array<{ value: string; label: string }>;
  types: Array<{ value: string; label: string }>;
}

function ChangeCard({ change, station, onApprove, onReject, onReset, genres, types }: ChangeCardProps) {
  const [customValue, setCustomValue] = useState(change.suggested);

  const options = change.field === 'genre' ? genres : types;

  return (
    <div className={`bg-white rounded-xl p-6 border-2 transition-colors ${
      change.status === 'approved' ? 'border-green-200 bg-green-50' :
      change.status === 'rejected' ? 'border-red-200 bg-red-50' :
      'border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{station?.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Country</p>
              <p className="font-medium">{station?.country}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Field</p>
              <p className="font-medium capitalize">{change.field}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Value</p>
              <p className="font-medium">{change.original || 'null'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Suggested Value</label>
              <select
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={change.status !== 'pending'}
              >
                {options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {change.status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(customValue)}
                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaCheck className="text-sm" />
                Approve
              </button>
              <button
                onClick={onReject}
                className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaTimes className="text-sm" />
                Reject
              </button>
            </>
          )}
          
          {change.status !== 'pending' && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaUndo className="text-sm" />
              Reset
            </button>
          )}
          
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
            change.status === 'approved' ? 'bg-green-100 text-green-800' :
            change.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {change.status === 'approved' ? 'Approved' :
             change.status === 'rejected' ? 'Rejected' :
             'Pending'}
          </div>
        </div>
      </div>
    </div>
  );
}