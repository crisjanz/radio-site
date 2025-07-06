// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

export const analytics = {
  // Check if Google Analytics is connected
  isConnected: () => {
    return typeof window !== 'undefined' && 
           window.gtag && 
           window.dataLayer && 
           window.dataLayer.length > 0;
  },

  // Get connection status with details
  getConnectionStatus: () => {
    if (typeof window === 'undefined') return { connected: false, reason: 'Not in browser' };
    if (!window.gtag) return { connected: false, reason: 'gtag not loaded' };
    if (!window.dataLayer) return { connected: false, reason: 'dataLayer not initialized' };
    return { connected: true, reason: 'Google Analytics connected' };
  },

  // Track page views
  trackPageView: (pageName: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
  },

  // Track station plays
  trackStationPlay: (stationName: string, country: string, genre: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'station_play', {
        station_name: stationName,
        station_country: country,
        station_genre: genre,
        custom_parameter: 'radio_interaction'
      });
    }
  },

  // Track station favorites
  trackStationFavorite: (stationName: string, country: string, action: 'add' | 'remove') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'station_favorite', {
        station_name: stationName,
        station_country: country,
        favorite_action: action,
        custom_parameter: 'user_engagement'
      });
    }
  },

  // Track search usage
  trackSearch: (searchQuery: string, resultsCount: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: searchQuery,
        results_count: resultsCount,
        custom_parameter: 'search_behavior'
      });
    }
  },

  // Track filter usage
  trackFilter: (filterType: string, filterValue: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'filter_use', {
        filter_type: filterType,
        filter_value: filterValue,
        custom_parameter: 'browse_behavior'
      });
    }
  },

  // Track map interactions
  trackMapInteraction: (action: 'zoom' | 'pan' | 'marker_click', country?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'map_interaction', {
        interaction_type: action,
        country: country || 'unknown',
        custom_parameter: 'map_usage'
      });
    }
  },

  // Track user authentication
  trackAuth: (action: 'login' | 'logout' | 'register') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'auth_action', {
        auth_type: action,
        custom_parameter: 'user_account'
      });
    }
  },

  // Track listening session duration
  trackListeningSession: (stationName: string, durationMinutes: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'listening_session', {
        station_name: stationName,
        duration_minutes: durationMinutes,
        custom_parameter: 'engagement_time'
      });
    }
  }
};