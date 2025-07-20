import { buildMetadataUrl, API_CONFIG } from '../config/api';

// Utility to fetch stream metadata
interface StreamMetadata {
  title?: string;
  artist?: string;
  song?: string;
  hasMetadataSupport?: boolean;
  message?: string;
  artwork?: string | ArtworkInfo; // Legacy string support + new structured artwork
}

interface ArtworkInfo {
  small?: string;   // 100x100
  medium?: string;  // 300x300
  large?: string;   // 600x600
  xlarge?: string;  // 1000x1000
  source?: string;  // 'itunes', 'spotify', 'manual', etc.
  affiliateUrl?: string; // iTunes affiliate link when available
}

// Frontend request deduplication - prevent multiple components from requesting same stream
const activeMetadataRequests = new Map<string, Promise<StreamMetadata | null>>();
const REQUEST_DEDUPE_DURATION = 10000; // 10 seconds

// Try to fetch metadata from backend using station ID or nanoid
export const fetchStreamMetadata = async (station: { id: number; nanoid?: string }): Promise<StreamMetadata | null> => {
  const stationId = station.nanoid || station.id;
  const stationKey = `station-${stationId}`;
  
  // Check if we already have an active request for this station
  const existingRequest = activeMetadataRequests.get(stationKey);
  if (existingRequest) {
    console.log('🔄 Reusing active frontend metadata request for station', stationId);
    return existingRequest;
  }
  
  // Create new request and track it
  const requestPromise = performMetadataRequest(station);
  activeMetadataRequests.set(stationKey, requestPromise);
  
  // Clean up tracking after completion
  requestPromise.finally(() => {
    setTimeout(() => {
      activeMetadataRequests.delete(stationKey);
    }, REQUEST_DEDUPE_DURATION);
  });
  
  return requestPromise;
};

// Actual metadata request implementation using station ID or nanoid
const performMetadataRequest = async (station: { id: number; nanoid?: string }): Promise<StreamMetadata | null> => {
  const stationId = station.nanoid || station.id;
  
  // Try local metadata server first (enhanced features)
  try {
    console.log('🏠 Trying local metadata server for station:', stationId);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout for local server
    
    const response = await fetch(buildMetadataUrl(station), {
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('🏠 Local metadata server response:', data);
      
      // Handle successful metadata from local server
      if (data.title || data.song || data.artist) {
        console.log('✅ Found enhanced metadata from local server');
        const metadata: StreamMetadata = {
          title: data.title,
          artist: data.artist,
          song: data.song || data.title,
        };
        
        // Include artwork if available
        if (data.artwork) {
          metadata.artwork = data.artwork;
          console.log('🎨 Enhanced metadata includes artwork from:', 
            typeof data.artwork === 'object' ? data.artwork.source : 'legacy');
        }
        
        return metadata;
      }
      
      // Handle "metadata support but no current track" from local server
      if (data.hasMetadataSupport || data.error?.includes('metadata but no current track')) {
        console.log('📻 Local server: Stream supports metadata but no current song');
        return {
          hasMetadataSupport: true,
          message: data.error || 'Stream supports metadata but no current track'
        };
      }
    }
  } catch (error) {
    console.log('⚠️ Local metadata server unavailable, trying fallback...');
  }
  
  // Fallback to main backend (basic functionality)
  try {
    console.log('☁️ Trying main backend fallback for station:', stationId);
    
    const fallbackUrl = `${API_CONFIG.BASE_URL}/metadata/${stationId}`;
    const response = await fetch(fallbackUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('☁️ Fallback response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('☁️ Fallback response data:', data);
      
      if (data.success) {
        if (data.title || data.song || data.artist) {
          console.log('✅ Found basic metadata from fallback');
          return {
            title: data.title,
            artist: data.artist,
            song: data.song || data.title,
          };
        } else if (data.hasMetadataSupport) {
          console.log('📻 Stream supports metadata but no current song');
          return {
            hasMetadataSupport: true,
            message: data.message
          };
        }
      }
      
      console.log('❌ No metadata available:', data.message || 'Unknown error');
    } else {
      console.log('❌ Fallback response not OK:', response.status);
    }
  } catch (error) {
    console.error('❌ Error calling fallback metadata endpoint:', error);
  }

  return null;
};

// Get best artwork URL from structured artwork info
export const getBestArtwork = (artwork: string | ArtworkInfo | undefined, preferredSize: 'small' | 'medium' | 'large' | 'xlarge' = 'medium'): string | null => {
  if (!artwork) return null;
  
  // Handle legacy string artwork
  if (typeof artwork === 'string') {
    return artwork;
  }
  
  // Handle structured artwork - try preferred size first
  const sizeMap = {
    small: artwork.small,
    medium: artwork.medium,
    large: artwork.large,
    xlarge: artwork.xlarge
  };
  
  // Return preferred size if available
  if (sizeMap[preferredSize]) {
    return sizeMap[preferredSize];
  }
  
  // Fallback to any available size (prefer larger)
  return artwork.xlarge || artwork.large || artwork.medium || artwork.small || null;
};

// Attempt to get station favicon/logo
export const getStationLogo = (station: { favicon?: string; logo?: string; homepage?: string; name: string }): string | null => {
  // Return provided favicon or logo
  if (station.favicon) return station.favicon;
  if (station.logo) return station.logo;
  
  // Try to construct favicon URL from homepage
  if (station.homepage) {
    try {
      const url = new URL(station.homepage);
      return `${url.protocol}//${url.host}/favicon.ico`;
    } catch {
      // Invalid homepage URL
    }
  }
  
  // Use a radio icon generator service as fallback
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(station.name)}&backgroundColor=3b82f6&textColor=ffffff`;
};