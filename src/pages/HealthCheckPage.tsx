import { useState, useEffect } from 'react';
import { FaHeartPulse, FaPlay, FaCheck, FaX, FaTriangleExclamation, FaClock, FaSpinner, FaArrowLeft, FaGear } from 'react-icons/fa6';
import { API_CONFIG } from '../config/api';



interface HealthCheckResult {
  id: number;
  name: string;
  streamUrl: string;
  isWorking?: boolean;
  consecutiveFailures?: number;
  error?: string;
}

interface HealthSummary {
  totalChecked: number;
  working: number;
  failed: number;
  availableForCheck: number;
}

interface ProblematicStation {
  id: number;
  name: string;
  country: string;
  city: string;
  streamUrl: string;
  isActive: boolean;
  consecutiveFailures: number;
  userReports: number;
  lastPingCheck: string;
  lastPingSuccess: boolean;
  adminNotes: string;
}

export default function HealthCheckPage() {
  const [results, setResults] = useState<HealthCheckResult[]>([]);
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [problematicStations, setProblematicStations] = useState<ProblematicStation[]>([]);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maxStations, setMaxStations] = useState(25);
  const [retesting, setRetesting] = useState<Set<number>>(new Set());

  const API_BASE = API_CONFIG.BASE_URL;

  // Load problematic stations on mount
  useEffect(() => {
    fetchProblematicStations();
  }, []);

  const fetchProblematicStations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/health/problematic?limit=50`);
      if (!response.ok) throw new Error('Failed to fetch problematic stations');
      const data = await response.json();
      setProblematicStations(data.stations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch problematic stations');
    } finally {
      setLoading(false);
    }
  };

  const runBatchHealthCheck = async () => {
    try {
      setChecking(true);
      setError(null);
      setResults([]);
      setSummary(null);

      const response = await fetch(`${API_BASE}/health/check-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxStations })
      });

      if (!response.ok) throw new Error('Failed to run health check');
      
      const data = await response.json();
      setResults(data.results || []);
      setSummary(data.summary || null);
      
      // Refresh problematic stations after check
      await fetchProblematicStations();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Health check failed');
    } finally {
      setChecking(false);
    }
  };

  const toggleStationStatus = async (stationId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_BASE}/admin/stations/${stationId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) throw new Error('Failed to toggle station status');
      
      // Refresh problematic stations
      await fetchProblematicStations();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle station status');
    }
  };

  const retestSingleStation = async (stationId: number) => {
    try {
      setRetesting(prev => new Set(prev).add(stationId));
      setError(null);

      const response = await fetch(`${API_BASE}/health/force-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationIds: [stationId] })
      });

      if (!response.ok) throw new Error('Failed to retest station');
      
      const data = await response.json();
      
      // Show result briefly
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const status = result.error ? 'error' : result.isWorking ? 'working' : 'failed';
        console.log(`Retest result for station ${stationId}: ${status}`);
      }
      
      // Refresh problematic stations and recent results
      await fetchProblematicStations();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retest station');
    } finally {
      setRetesting(prev => {
        const newSet = new Set(prev);
        newSet.delete(stationId);
        return newSet;
      });
    }
  };

  const formatLastCheck = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/admin"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaArrowLeft />
                Back to Admin
              </a>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FaHeartPulse className="text-red-600" />
                  Stream Health Check
                </h1>
                <p className="text-gray-600 mt-1">Monitor and manage station stream health</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Max stations:</label>
                <select
                  value={maxStations}
                  onChange={(e) => setMaxStations(parseInt(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              <button
                onClick={runBatchHealthCheck}
                disabled={checking}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {checking ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPlay />
                )}
                {checking ? 'Checking...' : 'Run Health Check'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="bg-white rounded-lg shadow-sm border mb-8 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Health Check Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{summary.totalChecked}</div>
                <div className="text-sm text-blue-600">Stations Checked</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{summary.working}</div>
                <div className="text-sm text-green-600">Working</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{summary.availableForCheck}</div>
                <div className="text-sm text-gray-600">Available to Check</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Check Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Recent Check Results</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {results.map((result, index) => (
                <div key={index} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      result.error 
                        ? 'bg-yellow-500' 
                        : result.isWorking 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="font-medium text-gray-900">{result.name}</div>
                      <div className="text-sm text-gray-500">{result.streamUrl}</div>
                      {result.error && (
                        <div className="text-xs text-red-600 mt-1">{result.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {result.consecutiveFailures !== undefined && result.consecutiveFailures > 0 && (
                      <div className="text-sm text-orange-600">
                        {result.consecutiveFailures} failures
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {result.error ? (
                        <FaTriangleExclamation className="text-yellow-500" />
                      ) : result.isWorking ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaX className="text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Problematic Stations */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Stations Needing Attention ({problematicStations.length})
              </h2>
              <button
                onClick={fetchProblematicStations}
                disabled={loading}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaSpinner className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <FaSpinner className="animate-spin mx-auto mb-2" />
              Loading problematic stations...
            </div>
          ) : problematicStations.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <FaCheck className="mx-auto mb-2 text-green-500" />
              No problematic stations found! All systems healthy.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {problematicStations.map((station) => (
                <div key={station.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${
                          !station.isActive ? 'bg-gray-400' : 
                          station.consecutiveFailures >= 3 ? 'bg-red-500' : 
                          station.userReports >= 2 ? 'bg-orange-500' : 
                          'bg-yellow-500'
                        }`} />
                        <div className="font-medium text-gray-900">{station.name}</div>
                        <div className="text-sm text-gray-500">
                          {station.city && `${station.city}, `}{station.country}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">{station.streamUrl}</div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        {station.consecutiveFailures > 0 && (
                          <div className="flex items-center gap-1 text-red-600">
                            <FaX />
                            {station.consecutiveFailures} failures
                          </div>
                        )}
                        
                        {station.userReports > 0 && (
                          <div className="flex items-center gap-1 text-orange-600">
                            <FaTriangleExclamation />
                            {station.userReports} user reports
                          </div>
                        )}
                        
                        {station.lastPingCheck && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <FaClock />
                            Last checked: {formatLastCheck(station.lastPingCheck)}
                          </div>
                        )}
                      </div>
                      
                      {station.adminNotes && (
                        <div className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded">
                          {station.adminNotes}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => retestSingleStation(station.id)}
                        disabled={retesting.has(station.id)}
                        className="flex items-center gap-1 px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 transition-colors"
                      >
                        {retesting.has(station.id) ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaHeartPulse />
                        )}
                        {retesting.has(station.id) ? 'Testing...' : 'Re-test'}
                      </button>
                      
                      <button
                        onClick={() => toggleStationStatus(station.id, station.isActive)}
                        className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                          station.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        <FaGear />
                        {station.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}