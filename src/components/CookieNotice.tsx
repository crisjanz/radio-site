import React, { useState, useEffect } from 'react';
import { FaX } from 'react-icons/fa6';

export default function CookieNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookies-accepted');
    if (!hasAccepted) {
      // Show notice after a small delay
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookies-accepted', 'true');
    setIsVisible(false);
  };

  const handleClose = () => {
    // Treat close as acceptance (less intrusive)
    handleAccept();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 lg:left-4 lg:right-auto lg:max-w-md z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 leading-relaxed">
              We use cookies to enhance your experience and show relevant ads. 
              <button 
                onClick={() => window.open('/privacy-policy', '_blank')}
                className="text-blue-600 hover:text-blue-700 underline ml-1"
              >
                Privacy Policy
              </button>
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleAccept}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              OK
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaX className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}