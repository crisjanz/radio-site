import { API_CONFIG } from '../config/api';

export interface FeedbackSubmission {
  type: string;
  details?: string;
}

export interface FeedbackSummary {
  feedbackSummary: Record<string, number>;
  qualityScore?: number;
  totalFeedback: number;
}

const API_BASE = API_CONFIG.BASE_URL;

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Submit feedback for a station
export const submitFeedback = async (stationId: number, feedback: FeedbackSubmission): Promise<void> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/api/feedback/stations/${stationId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: JSON.stringify({
      feedbackType: feedback.type,
      details: feedback.details
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit feedback');
  }
};

// Get feedback summary for a station
export const getFeedbackSummary = async (stationId: number): Promise<FeedbackSummary> => {
  const response = await fetch(`${API_BASE}/api/feedback/stations/${stationId}/summary`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch feedback summary');
  }

  return response.json();
};

// Get user's feedback history (requires login)
export const getUserFeedbackHistory = async (): Promise<any[]> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE}/api/feedback/user/history`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch feedback history');
  }

  return response.json();
};

// Auto-submit positive feedback when user adds to favorites
export const submitFavoriteVote = async (stationId: number): Promise<void> => {
  try {
    await submitFeedback(stationId, { type: 'great_station' });
  } catch (error) {
    // Silently fail for auto-votes to avoid disrupting the favorite action
    console.log('Auto-vote failed:', error);
  }
};