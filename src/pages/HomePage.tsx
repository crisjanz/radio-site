// src/pages/HomePage.tsx
import { useEffect, useState } from 'react';
import { FaMusic } from 'react-icons/fa';
import RadioPlayer from '../components/RadioPlayer';
import { API_CONFIG } from '../config/api';


type Station = {
  id: number;
  name: string;
  country: string;
  genre?: string;
  type?: string;
  streamUrl: string;
};

export default function HomePage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStream, setCurrentStream] = useState<string | null>(null);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);

  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterType, setFilterType] = useState('');

  const API_BASE = API_CONFIG.BASE_URL;

  useEffect(() => {
    fetch(`${API_BASE}/stations`)
      .then((res) => res.json())
      .then((data) => {
        setStations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load stations', err);
        setLoading(false);
      });
  }, []);


  const playStation = (station: Station) => {
    setCurrentStream(station.streamUrl);
    setCurrentStation(station);
  };

  const filtered = stations.filter((s) => {
    return (
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterCountry === '' || s.country === filterCountry) &&
      (filterGenre === '' || s.genre === filterGenre) &&
      (filterType === '' || s.type === filterType)
    );
  });

  // Get unique values for dropdowns
  const countries = [...new Set(stations.map((s) => s.country))];
  const genres = [...new Set(stations.map((s) => s.genre).filter(Boolean))];
  const types = [...new Set(stations.map((s) => s.type).filter(Boolean))];

  return (
    <div className="min-h-screen bg-white pb-32 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">🌍 Global Radio</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search stations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/4"
        />
        <select
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/4"
        >
          <option value="">All Countries</option>
          {countries.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/4"
        >
          <option value="">All Genres</option>
          {genres.map((g, i) => (
            <option key={i} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/4"
        >
          <option value="">All Types</option>
          {types.map((t, i) => (
            <option key={i} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Station Cards */}
{loading && <p>Loading stations...</p>}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {filtered.length === 0 && <p className="text-gray-500">No stations match your filters.</p>}
        {filtered.map((station, index) => (
          <div
            key={index}
            className="bg-gray-100 p-4 rounded-lg shadow hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold">{station.name}</h2>
            <p className="text-sm text-gray-600">{station.country}</p>
            <button
              className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              onClick={() => playStation(station)}
            >
              ▶️ Listen
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Player */}
      {currentStream && currentStation && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg px-4 py-3 flex items-center justify-between gap-4 z-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded overflow-hidden">
              <img src="/streemr-play.png" alt="Streemr" className="w-8 h-8 object-contain" />
            </div>
            <div className="text-sm">
              <div className="font-medium">{currentStation.name}</div>
              <div className="text-gray-500 text-xs">{currentStation.genre ?? 'N/A'} · {currentStation.type}</div>
            </div>
          </div>
{currentStream && currentStation && (
  <RadioPlayer
    streamUrl={currentStream}
    name={currentStation.name}
    genre={currentStation.genre}
    type={currentStation.type}
  />
)}

        </div>
      )}
    </div>
  );
}
