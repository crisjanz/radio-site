import { useState } from 'react';
import { FaThumbsUp, FaThumbsDown, FaHeart, FaRegHeart } from 'react-icons/fa6';
import FeedbackModal from './FeedbackModal';
import { submitFeedback } from '../utils/feedbackApi';
import type { Station } from '../types/Station';

interface StationVotingProps {
  station: Station;
  isLoggedIn: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (station: Station) => void;
  compact?: boolean; // For smaller displays
}

export default function StationVoting({
  station,
  isLoggedIn,
  isFavorite = false,
  onToggleFavorite,
  compact = false
}: StationVotingProps) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleThumbsUp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isLoggedIn) {
      // For non-logged users, show feedback modal with thumbs up pre-selected
      setShowFeedbackModal(true);
      return;
    }

    // For logged-in users, thumbs up = add to favorites
    if (onToggleFavorite) {
      onToggleFavorite(station);
    }
  };

  const handleThumbsDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async (feedback: { type: string; details?: string }) => {
    setIsSubmitting(true);
    try {
      await submitFeedback(station.id, feedback);
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setShowFeedbackModal(false);
        setFeedbackSubmitted(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-1">
          {isLoggedIn ? (
            // Logged-in users: Heart for favorites
            <button
              onClick={handleThumbsUp}
              className="w-7 h-7 bg-white/80 text-red-500 hover:text-red-600 flex items-center justify-center rounded-full shadow-sm transition-colors"
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? <FaHeart className="text-xs" /> : <FaRegHeart className="text-xs" />}
            </button>
          ) : (
            // Non-logged users: Thumbs up/down
            <button
              onClick={handleThumbsUp}
              className="w-7 h-7 bg-white/80 text-green-500 hover:text-green-600 flex items-center justify-center rounded-full shadow-sm transition-colors"
              title="Great station"
            >
              <FaThumbsUp className="text-xs" />
            </button>
          )}
          
          <button
            onClick={handleThumbsDown}
            className="w-7 h-7 bg-white/80 text-red-500 hover:text-red-600 flex items-center justify-center rounded-full shadow-sm transition-colors"
            title="Report issue"
          >
            <FaThumbsDown className="text-xs" />
          </button>
        </div>

        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={handleFeedbackSubmit}
          stationName={station.name}
          isSubmitting={isSubmitting}
        />
      </>
    );
  }

  // Full size version for desktop
  return (
    <>
      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          // Logged-in users: Heart for favorites + thumbs down for issues
          <>
            <button
              onClick={handleThumbsUp}
              className="flex items-center gap-1 px-3 py-2 bg-white/90 text-red-500 hover:text-red-600 rounded-full shadow-sm transition-colors text-sm"
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? <FaHeart className="text-sm" /> : <FaRegHeart className="text-sm" />}
              <span className="hidden sm:inline">{isFavorite ? 'Favorited' : 'Favorite'}</span>
            </button>
            <button
              onClick={handleThumbsDown}
              className="flex items-center gap-1 px-3 py-2 bg-white/90 text-gray-600 hover:text-red-500 rounded-full shadow-sm transition-colors text-sm"
              title="Report issue"
            >
              <FaThumbsDown className="text-sm" />
              <span className="hidden sm:inline">Report</span>
            </button>
          </>
        ) : (
          // Non-logged users: Thumbs up/down voting
          <>
            <button
              onClick={handleThumbsUp}
              className="flex items-center gap-1 px-3 py-2 bg-white/90 text-green-500 hover:text-green-600 rounded-full shadow-sm transition-colors text-sm"
              title="Great station"
            >
              <FaThumbsUp className="text-sm" />
              <span className="hidden sm:inline">Great</span>
            </button>
            <button
              onClick={handleThumbsDown}
              className="flex items-center gap-1 px-3 py-2 bg-white/90 text-red-500 hover:text-red-600 rounded-full shadow-sm transition-colors text-sm"
              title="Report issue"
            >
              <FaThumbsDown className="text-sm" />
              <span className="hidden sm:inline">Report</span>
            </button>
          </>
        )}
      </div>

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
        stationName={station.name}
        isSubmitting={isSubmitting}
      />
    </>
  );
}