import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';
import { FaMusic, FaSpinner, FaCalendarDay, FaClock, FaClockRotateLeft } from 'react-icons/fa6';
import { decodeHtmlEntities } from '../utils/htmlDecoding';

interface Track {
  id: string;
  playedAt: string;
  source: string;
  showName?: string;
  djName?: string;
  track: {
    id: string;
    title: string;
    artist?: string;
    album?: string;
    artwork?: string;
    duration?: number;
  };
}

interface RecentlyPlayedProps {
  stationId: string | number;
  stationName: string;
}


export default function RecentlyPlayed({ stationId, stationName }: RecentlyPlayedProps) {
  const [todayTracks, setTodayTracks] = useState<Track[]>([]);
  const [pastTracks, setPastTracks] = useState<Record<string, Track[]>>({});
  const [selectedDate, setSelectedDate] = useState('today');
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTracks, setTotalTracks] = useState(0);
  const tracksPerPage = 15;

  const API_BASE = API_CONFIG.BASE_URL;

  // Load today's data immediately on mount
  useEffect(() => {
    setCurrentPage(1);
    setTodayTracks([]);
    loadTodayTracks(1);
    loadAvailableDays();
  }, [stationId]);

  // Auto-refresh today's tracks every 30 seconds when viewing today
  useEffect(() => {
    if (selectedDate !== 'today') return;

    const interval = setInterval(() => {
      loadTodayTracks(1, true); // Silent refresh - no loading indicators
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [selectedDate]);

  const loadTodayTracks = async (page: number = 1, silent: boolean = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const offset = (page - 1) * tracksPerPage;
      const response = await fetch(`${API_BASE}/stations/${stationId}/recently-played?limit=${tracksPerPage}&offset=${offset}`);
      if (response.ok) {
        const data = await response.json();
        const rawTracks = Array.isArray(data) ? data : data.tracks || [];
        // Filter out generic live radio entries
        const tracks = rawTracks.filter(track => {
          const title = track.track?.title?.toLowerCase() || '';
          return !title.includes('live radio') && 
                 !title.includes('stream') && 
                 title !== 'live' &&
                 title.trim() !== '';
        });
        const total = data.total || tracks.length;
        
        if (page === 1) {
          setTodayTracks(tracks);
        } else {
          setTodayTracks(prev => [...prev, ...tracks]);
        }
        setTotalTracks(total);
      } else if (!silent) {
        setError('Failed to load recent tracks');
      }
    } catch (err) {
      console.error('Failed to load today tracks:', err);
      if (!silent) {
        setError('Failed to load recent tracks');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const loadAvailableDays = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/tracks/stations/${stationId}/available-days`);
      if (response.ok) {
        const dates = await response.json();
        setAvailableDays(dates.slice(0, 6)); // Show only last 6 days
      }
    } catch (err) {
      console.error('Failed to load available days:', err);
    }
  };

  const loadPastDay = async (date: string) => {
    if (pastTracks[date]) {
      setSelectedDate(date);
      setCurrentPage(1);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/tracks/stations/${stationId}/tracks/${date}`);
      if (response.ok) {
        const tracks = await response.json();
        setPastTracks(prev => ({ ...prev, [date]: tracks }));
        setSelectedDate(date);
        setCurrentPage(1);
      } else {
        setError('No track data available for this date');
      }
    } catch (err) {
      console.error('Failed to load past day:', err);
      setError('Failed to load historical tracks');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTracks = selectedDate === 'today' ? todayTracks : (pastTracks[selectedDate] || []);
  const displayedTracks = selectedDate === 'today' ? currentTracks : currentTracks.slice(0, currentPage * tracksPerPage);
  const hasAnyTracks = todayTracks.length > 0 || availableDays.length > 0;
  const hasMoreTracks = selectedDate === 'today' ? todayTracks.length < totalTracks : currentTracks.length > currentPage * tracksPerPage;
  
  const loadMoreTracks = () => {
    if (selectedDate === 'today') {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadTodayTracks(nextPage);
    } else {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Music service click handlers
  const handleAppleMusicClick = async (artist: string, title: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/music-links/itunes?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
      const data = await response.json();
      
      if (data.found && data.trackId) {
        // Try to open directly in Apple Music app
        const appUrl = `music://music.apple.com/us/song/${data.trackId}`;
        window.location.href = appUrl;
      } else {
        // Fallback to search
        window.open(`https://music.apple.com/search?term=${encodeURIComponent(`${artist} ${title}`)}`, '_blank');
      }
    } catch (error) {
      console.error('Error fetching iTunes link:', error);
      // Fallback to search on error
      window.open(`https://music.apple.com/search?term=${encodeURIComponent(`${artist} ${title}`)}`, '_blank');
    }
  };

  const handleSpotifyClick = async (artist: string, title: string) => {
    // Try to open directly in Spotify app
    const searchQuery = encodeURIComponent(`${artist} ${title}`);
    const spotifyAppUrl = `spotify:search:${searchQuery}`;
    window.location.href = spotifyAppUrl;
  };

  if (!hasAnyTracks && !loading) {
    return null; // Don't show component if no track data available
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <FaMusic className="text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Recently Played</h3>
        <span className="text-sm text-gray-500">on {stationName}</span>
      </div>

  

      {/* Track List */}
      <div className="space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600">Loading tracks...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-gray-600">{error}</p>
          </div>
        )}

        {!loading && !error && displayedTracks.length === 0 && (
          <div className="text-center py-8">
            <FaMusic className="text-gray-300 text-2xl mx-auto mb-2" />
            <p className="text-gray-600">
              {selectedDate === 'today' 
                ? 'No tracks played today yet' 
                : 'No tracks available for this date'
              }
            </p>
          </div>
        )}

        {!loading && !error && displayedTracks.map((play) => (
          <div key={play.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            {/* Artwork or Music Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
              {play.track.artwork ? (
                <img
                  src={play.track.artwork}
                  alt={play.track.title}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="text-blue-600"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clip-rule="evenodd"></path></svg></div>';
                    }
                  }}
                />
              ) : (
                <FaMusic className="text-blue-600" />
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {decodeHtmlEntities(play.track.title)}
                  </h4>
                  {(play.track.artist || play.track.album) && (
                    <p className="text-sm text-gray-600 truncate">
                      {play.track.artist && play.track.album 
                        ? `${decodeHtmlEntities(play.track.artist)} - ${decodeHtmlEntities(play.track.album)}`
                        : decodeHtmlEntities(play.track.artist || play.track.album || '')
                      }
                    </p>
                  )}
                </div>

                {/* Time and Duration */}
                <div className="flex flex-col items-end text-xs text-gray-500 ml-3">
                  <div className="flex items-center gap-1">
                    <FaClock className="text-xs" />
                    {formatTime(play.playedAt)}
                  </div>
                  {play.track.duration && (
                    <div className="mt-1">
                      {formatDuration(play.track.duration)}
                    </div>
                  )}
                  
                  {/* Music Service Links */}
                  {(play.track.title && play.track.artist) && (
                    <div className="flex gap-1 mt-2">
                      <button 
                        onClick={() => handleAppleMusicClick(play.track.artist!, play.track.title)}
                        className="hover:opacity-80 transition-opacity"
                        title="Find on Apple Music"
                      >
                        <img src="/apple.png" alt="Apple Music" className="h-6" />
                      </button>
                      <button 
                        onClick={() => handleSpotifyClick(play.track.artist!, play.track.title)}
                        className="hover:opacity-80 transition-opacity"
                        title="Find on Spotify"
                      >
                        <img src="/spotify.png" alt="Spotify" className="h-6" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Show more button */}
        {!loading && !error && hasMoreTracks && (
          <div className="text-center pt-4">
            <button
              onClick={loadMoreTracks}
              className="flex items-center gap-2 mx-auto px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <FaMusic className="text-xs" />
              Load more tracks...
            </button>
          </div>
        )}
        
        {/* Track count info */}
        {!loading && !error && displayedTracks.length > 0 && (
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              {selectedDate === 'today' 
                ? `Showing ${displayedTracks.length}${totalTracks > 0 ? ` of ${totalTracks}` : ''} tracks`
                : `Showing ${displayedTracks.length} of ${currentTracks.length} tracks`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}