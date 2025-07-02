import React, { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface RadioPlayerProps {
  streamUrl: string;
  name: string;
  genre?: string;
  type?: string;
  onMetadataUpdate?: (metadata: { title?: string; artist?: string; song?: string }) => void;
}

const RadioPlayer: React.FC<RadioPlayerProps> = ({ streamUrl, name }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const howlRef = useRef<Howl | null>(null);

  useEffect(() => {
    // Cleanup previous howl instance
    if (howlRef.current) {
      howlRef.current.unload();
    }

    // Reset state
    setError(null);
    setIsPlaying(false);

    // Create new howl instance
    howlRef.current = new Howl({
      src: [streamUrl],
      html5: true,
      format: ['mp3', 'aac', 'mpeg', 'ogg'],
      volume: isMuted ? 0 : volume,
      onload: () => {
        console.log('✅ Stream loaded successfully:', name);
        setLoading(false);
        setError(null);
      },
      onloaderror: (_id, error) => {
        console.error('❌ Failed to load stream:', name, streamUrl, error);
        setLoading(false);
        setError('Stream unavailable');
        setIsPlaying(false);
      },
      onplay: () => {
        console.log('▶️ Stream playing:', name);
        setIsPlaying(true);
        setLoading(false);
        setError(null);
      },
      onpause: () => {
        console.log('⏸️ Stream paused:', name);
        setIsPlaying(false);
      },
      onstop: () => {
        console.log('⏹️ Stream stopped:', name);
        setIsPlaying(false);
      },
      onplayerror: (_id, error) => {
        console.error('❌ Play error:', name, error);
        setError('Playback failed');
        setIsPlaying(false);
        setLoading(false);
      }
    });

    // Auto-play when a new station is selected
    console.log('🎵 Starting stream:', name, streamUrl);
    setLoading(true);
    howlRef.current.play();

    return () => {
      if (howlRef.current) {
        howlRef.current.unload();
      }
    };
  }, [streamUrl]);

  // Separate effect for volume/mute changes to avoid recreating the player
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!howlRef.current) return;

    if (isPlaying) {
      howlRef.current.pause();
    } else {
      setLoading(true);
      howlRef.current.play();
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (howlRef.current) {
      howlRef.current.volume(isMuted ? 0 : newVolume);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (howlRef.current) {
      howlRef.current.volume(newMuted ? 0 : volume);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={togglePlay}
        disabled={loading || !!error}
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
          error 
            ? 'bg-red-500 text-white cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
        }`}
        title={error || undefined}
      >
        {loading ? (
          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
        ) : error ? (
          <span className="text-xs">✕</span>
        ) : isPlaying ? (
          <FaPause className="text-xs" />
        ) : (
          <FaPlay className="text-xs ml-0.5" />
        )}
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <button onClick={toggleMute} className="text-gray-600 hover:text-gray-800">
          {isMuted ? <FaVolumeMute className="text-sm" /> : <FaVolumeUp className="text-sm" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-16 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};

export default RadioPlayer;