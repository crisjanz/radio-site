import { useState } from 'react';
import { FaX, FaThumbsUp, FaThumbsDown, FaTriangleExclamation, FaCircleInfo, FaMusic, FaCheck } from 'react-icons/fa6';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: { type: string; details?: string }) => void;
  stationName: string;
  isSubmitting?: boolean;
}

const FEEDBACK_OPTIONS = [
  {
    type: 'stream_not_working',
    label: 'Stream Not Working',
    description: 'Dead or broken stream',
    icon: FaTriangleExclamation,
    color: 'text-red-500',
    bgColor: 'bg-red-50 hover:bg-red-100'
  },
  {
    type: 'poor_audio_quality', 
    label: 'Poor Audio Quality',
    description: 'Low bitrate, static, cuts out',
    icon: FaThumbsDown,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 hover:bg-orange-100'
  },
  {
    type: 'wrong_information',
    label: 'Wrong Information', 
    description: 'Incorrect name, genre, or details',
    icon: FaCircleInfo,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 hover:bg-yellow-100'
  },
  {
    type: 'song_info_missing',
    label: 'Song Info Missing',
    description: 'No "Now Playing" metadata',
    icon: FaMusic,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 hover:bg-blue-100'
  },
  {
    type: 'great_station',
    label: 'Great Station',
    description: 'Positive feedback',
    icon: FaThumbsUp,
    color: 'text-green-500',
    bgColor: 'bg-green-50 hover:bg-green-100'
  }
];

export default function FeedbackModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  stationName, 
  isSubmitting = false 
}: FeedbackModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [showDetailsInput, setShowDetailsInput] = useState(false);

  const handleOptionClick = (type: string) => {
    if (type === 'wrong_information' || type === 'stream_not_working') {
      setSelectedType(type);
      setShowDetailsInput(true);
    } else {
      // One-click submission for other options
      onSubmit({ type });
    }
  };

  const handleSubmitWithDetails = () => {
    if (selectedType) {
      onSubmit({
        type: selectedType,
        details: details.trim() || undefined
      });
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedType(null);
    setDetails('');
    setShowDetailsInput(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Station Feedback</h3>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <FaX className="text-sm" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Help us improve <span className="font-medium">"{stationName}"</span>
          </p>

          {!showDetailsInput ? (
            /* Quick Feedback Options */
            <div className="space-y-2">
              {FEEDBACK_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.type}
                    onClick={() => handleOptionClick(option.type)}
                    disabled={isSubmitting}
                    className={`w-full text-left p-3 rounded-lg border border-gray-200 transition-colors ${option.bgColor} disabled:opacity-50`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`${option.color} text-lg flex-shrink-0`} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                        <div className="text-gray-600 text-xs">{option.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Details Input */
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                {(() => {
                  const option = FEEDBACK_OPTIONS.find(opt => opt.type === selectedType);
                  if (!option) return null;
                  const IconComponent = option.icon;
                  return (
                    <>
                      <IconComponent className={option.color} />
                      <span className="font-medium">{option.label}</span>
                    </>
                  );
                })()}
              </div>
              
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please provide more details (optional)..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                maxLength={200}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">{details.length}/200 characters</p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDetailsInput(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitWithDetails}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaCheck className="text-sm" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}