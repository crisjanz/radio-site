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

// Helper function to get safe favicon URL - uses proxy for HTTP URLs on .app domains
export const getFaviconUrl = (station: { id: number; favicon?: string; logo?: string }) => {
  // Use favicon first, fallback to logo
  const imageUrl = station.favicon || station.logo;
  
  if (!imageUrl || imageUrl.trim() === '') {
    console.log('No favicon or logo for station:', station.id);
    return null;
  }
  
  // If image is already HTTPS, use it directly
  if (imageUrl.startsWith('https://')) {
    console.log('Using HTTPS image directly:', imageUrl);
    return imageUrl;
  }
  
  // For HTTP images on .app domains, use proxy immediately
  if (imageUrl.startsWith('http://') && window.location.hostname.endsWith('.app')) {
    console.log('Using proxy for HTTP image on .app domain:', imageUrl);
    return getProxyFaviconUrl(station.id);
  }
  
  // For HTTP images on other domains, try HTTPS version first
  if (imageUrl.startsWith('http://')) {
    const httpsUrl = imageUrl.replace('http://', 'https://');
    console.log('Converting HTTP to HTTPS:', imageUrl, '->', httpsUrl);
    return httpsUrl;
  }
  
  console.log('Using image as-is:', imageUrl);
  return imageUrl;
};

// Helper function to get proxy favicon URL as fallback
export const getProxyFaviconUrl = (stationId: number) => {
  return `${API_CONFIG.BASE_URL}/favicon/${stationId}`;
};