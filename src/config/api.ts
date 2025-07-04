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
export const getFaviconUrl = (station: { id: number; favicon?: string; logo?: string }) => {
  // Use favicon first, fallback to logo
  const imageUrl = station.favicon || station.logo;
  
  if (!imageUrl || imageUrl.trim() === '') {
    return null;
  }
  
  // If it's a local path (starts with /station-images/), prepend backend URL
  if (imageUrl.startsWith('/station-images/')) {
    return `${API_CONFIG.BASE_URL}${imageUrl}`;
  }
  
  // Otherwise return as-is (external URL)
  return imageUrl;
};

