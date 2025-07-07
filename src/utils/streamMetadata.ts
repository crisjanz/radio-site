import { buildApiUrl, API_CONFIG } from '../config/api';

// Utility to fetch stream metadata
interface StreamMetadata {
  title?: string;
  artist?: string;
  song?: string;
  hasMetadataSupport?: boolean;
  message?: string;
}

// Frontend request deduplication - prevent multiple components from requesting same stream
const activeMetadataRequests = new Map<string, Promise<StreamMetadata | null>>();
const REQUEST_DEDUPE_DURATION = 30000; // 30 seconds

// Try to fetch metadata from backend proxy endpoint
export const fetchStreamMetadata = async (streamUrl: string): Promise<StreamMetadata | null> => {
  // Check if we already have an active request for this stream
  const existingRequest = activeMetadataRequests.get(streamUrl);
  if (existingRequest) {
    console.log('🔄 Reusing active frontend metadata request for stream');
    return existingRequest;
  }
  
  // Create new request and track it
  const requestPromise = performMetadataRequest(streamUrl);
  activeMetadataRequests.set(streamUrl, requestPromise);
  
  // Clean up tracking after completion
  requestPromise.finally(() => {
    setTimeout(() => {
      activeMetadataRequests.delete(streamUrl);
    }, REQUEST_DEDUPE_DURATION);
  });
  
  return requestPromise;
};

// Actual metadata request implementation
const performMetadataRequest = async (streamUrl: string): Promise<StreamMetadata | null> => {
  try {
    console.log('📡 Calling backend metadata API for:', streamUrl);
    
    // First, try to get metadata from your backend if it provides it
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.METADATA, { stream: streamUrl }), {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('📡 Backend response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📡 Backend response data:', data);
      
      if (data.success) {
        if (data.title || data.song || data.artist) {
          console.log('✅ Found metadata:', { title: data.title, song: data.song, artist: data.artist });
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
      console.log('❌ Backend response not OK:', response.status);
    }
  } catch (error) {
    console.error('❌ Error calling backend metadata endpoint:', error);
  }

  return null;
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