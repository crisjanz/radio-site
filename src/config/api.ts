// API Configuration
export const API_CONFIG = {
  // Use environment variable if available, otherwise use production URL
  BASE_URL: import.meta.env.VITE_API_URL || 'https://streemr-back.onrender.com',
  
  // Timeout for API requests (in milliseconds)
  TIMEOUT: 10000,
  
  // Endpoints
  ENDPOINTS: {
    STATIONS: '/stations',
    COUNTRIES: '/stations/countries',
    GENRES: '/stations/genres',
    SEARCH: '/stations/search',
    METADATA: '/metadata',
    IMPORT: '/import',
    ADMIN: '/admin',
    HEALTH: '/health',
    SCRAPE: '/scrape'
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string, params?: Record<string, string>) => {
  const url = new URL(endpoint, API_CONFIG.BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  return url.toString();
};

// Helper function for API requests with error handling
export const apiRequest = async (endpoint: string, options?: RequestInit) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  
  try {
    const response = await fetch(buildApiUrl(endpoint), {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// Helper function to get favicon URL - handle both local and external URLs
// Priority: local_image_url -> logo -> favicon
export const getFaviconUrl = (station: { id: number; favicon?: string; logo?: string; local_image_url?: string }, options?: { width?: number; height?: number; quality?: number; cacheBust?: boolean }) => {
  // Use priority: local_image_url -> logo -> favicon
  const imageUrl = station.local_image_url || station.logo || station.favicon;
  
  if (!imageUrl || imageUrl.trim() === '') {
    return null;
  }
  
  // If it's a local path (starts with /station-images/), prepend backend URL
  if (imageUrl.startsWith('/station-images/')) {
    return `${API_CONFIG.BASE_URL}${imageUrl}`;
  }
  
  // If it's a Supabase URL, return as-is (no proxy needed - already fast)
  if (imageUrl.includes('supabase.co')) {
    // Add cache busting if requested (for when images are updated)
    if (options?.cacheBust) {
      return `${imageUrl}?t=${Date.now()}`;
    }
    return imageUrl;
  }
  
  // For external URLs, use image proxy for better performance
  const proxyUrl = new URL('/image-proxy/proxy', API_CONFIG.BASE_URL);
  proxyUrl.searchParams.append('url', imageUrl);
  
  // Add optimization parameters
  if (options?.width) proxyUrl.searchParams.append('w', options.width.toString());
  if (options?.height) proxyUrl.searchParams.append('h', options.height.toString());
  if (options?.quality) proxyUrl.searchParams.append('q', options.quality.toString());
  
  // Default optimization for images if no options provided
  if (!options) {
    proxyUrl.searchParams.append('w', '512');
    proxyUrl.searchParams.append('h', '512');
    proxyUrl.searchParams.append('q', '85');
  }
  
  return proxyUrl.toString();
};

// Preload critical images for performance
export const preloadStationImages = (stations: { id: number; favicon?: string; logo?: string; local_image_url?: string }[]) => {
  stations.slice(0, 10).forEach(station => { // Preload first 10 images
    const imageUrl = getFaviconUrl(station);
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
    }
  });
};

