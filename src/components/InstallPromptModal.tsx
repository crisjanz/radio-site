import React, { useState } from 'react';
import { FaDownload, FaTimes, FaMobile } from 'react-icons/fa';

interface InstallPromptModalProps {
  onInstall: () => Promise<boolean>;
  onDismiss: () => void;
}

const InstallPromptModal: React.FC<InstallPromptModalProps> = ({ onInstall, onDismiss }) => {
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await onInstall();
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    onDismiss();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <FaMobile className="text-blue-600 text-lg" />
            <h3 className="text-lg font-semibold text-gray-900">
              Install Streemr
            </h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
              <img 
                src="/app-icon-192x192.png" 
                alt="Streemr" 
                className="w-12 h-12 rounded-lg"
              />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Get the full Streemr experience! Install our app for:
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700">Faster loading & offline access</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700">Home screen shortcut</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700">Full-screen experience</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isInstalling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Installing...
                </>
              ) : (
                <>
                  <FaDownload className="text-sm" />
                  Install App
                </>
              )}
            </button>
            
            <button
              onClick={handleDismiss}
              className="w-full text-gray-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPromptModal;