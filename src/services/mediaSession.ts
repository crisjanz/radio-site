import type { Station } from '../types/Station';

class MediaSessionService {
  constructor() {
    this.setupMediaSession();
  }

  private setupMediaSession(): void {
    // Check if Media Session API is supported
    if (!('mediaSession' in navigator)) {
      console.warn('Media Session API not supported');
      return;
    }

    console.log('🎵 Media Session API initialized');
  }

  updateMetadata(station: Station | null, isPlaying: boolean): void {

    if (!('mediaSession' in navigator) || !station) {
      return;
    }

    // Set media metadata for lock screen
    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'Live Radio',
      artist: station.name,
      album: station.city ? `${station.city}, ${station.country}` : station.country,
      artwork: [
        {
          src: station.favicon || '/streemr-play.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    });

    // Update playback state
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    console.log(`🎵 Media Session updated: ${station.name} (${isPlaying ? 'playing' : 'paused'})`);
  }

  updateWithMetadata(station: Station | null, isPlaying: boolean, songInfo?: { title?: string; artist?: string; artwork?: string }): void {

    if (!('mediaSession' in navigator) || !station) {
      return;
    }

    // Use song metadata if available, otherwise fall back to station info
    const title = songInfo?.title || 'Live Radio';
    const artist = songInfo?.artist || station.name;
    const album = station.city ? `${station.city}, ${station.country}` : station.country;
    const artwork = songInfo?.artwork || station.favicon || '/streemr-play.png';

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album,
      artwork: [
        {
          src: artwork,
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    console.log(`🎵 Media Session updated with metadata: ${title} by ${artist}`);
  }

  setActionHandlers(
    onPlay: () => void,
    onPause: () => void,
    onPreviousTrack?: () => void,
    onNextTrack?: () => void
  ): void {
    if (!('mediaSession' in navigator)) {
      return;
    }

    // Set action handlers for lock screen controls
    navigator.mediaSession.setActionHandler('play', () => {
      console.log('🎵 Media Session: Play action');
      onPlay();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      console.log('🎵 Media Session: Pause action');
      onPause();
    });

    if (onPreviousTrack) {
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        console.log('🎵 Media Session: Previous track action');
        onPreviousTrack();
      });
    }

    if (onNextTrack) {
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        console.log('🎵 Media Session: Next track action');
        onNextTrack();
      });
    }

    // Handle stop action
    navigator.mediaSession.setActionHandler('stop', () => {
      console.log('🎵 Media Session: Stop action');
      onPause();
    });

    console.log('🎵 Media Session action handlers configured');
  }

  clearMetadata(): void {
    if (!('mediaSession' in navigator)) {
      return;
    }

    navigator.mediaSession.metadata = null;
    navigator.mediaSession.playbackState = 'none';
    console.log('🎵 Media Session metadata cleared');
  }

  isSupported(): boolean {
    return 'mediaSession' in navigator;
  }
}

// Export singleton instance
export const mediaSessionService = new MediaSessionService();