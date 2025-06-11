import React, { useEffect, useState } from 'react';
import usePWAInstall from '../Components/usePWAInstall';
import { FiX, FiDownload } from 'react-icons/fi';

export default function InstallPrompt() {
  const [isReady, triggerInstall] = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check localStorage for previous dismissal
  useEffect(() => {
    const wasDismissed = localStorage.getItem('pwaPromptDismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  // Show prompt after delay if installable and not dismissed
  useEffect(() => {
    if (!isReady || dismissed) return;
    
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 10000); // 10 second delay

    return () => clearTimeout(timer);
  }, [isReady, dismissed]);

  const handleInstall = () => {
    triggerInstall();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div 
      className="fixed inset-x-0 bottom-0 sm:bottom-4 sm:left-4 sm:right-auto z-[100] animate-fade-in-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-heading"
    >
      <div className="bg-white dark:bg-gray-800 p-4 rounded-t-lg sm:rounded-lg shadow-xl max-w-md mx-auto sm:mx-0 border border-gray-200 dark:border-gray-700 sm:max-w-xs w-full">
        <div className="flex items-start">
          <div className="mr-3 mt-0.5">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <FiDownload size={18} aria-hidden="true" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 id="pwa-install-heading" className="font-semibold text-gray-900 dark:text-white">
                Install App
              </h3>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 ml-2"
                aria-label="Close install prompt"
              >
                <FiX size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Add this app to your home screen for better experience
            </p>
            
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleDismiss}
                className="flex-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                Later
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                autoFocus
              >
                Install
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}