import React, { useEffect, useState } from 'react';
import usePWAInstall from './Components/usePWAInstall';

export default function InstallBanner() {
  const [isInstallable, triggerInstall] = usePWAInstall();
  const [showBanner, setShowBanner] = useState(false);

  // Show banner after 5 seconds if installable
  useEffect(() => {
    if (!isInstallable) return;
    
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isInstallable]);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 z-50 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h3 className="font-bold">Install Our App</h3>
          <p>Get the best experience by installing to your home screen</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowBanner(false)}
            className="px-4 py-2 bg-white text-blue-600 rounded"
          >
            Later
          </button>
          <button 
            onClick={triggerInstall}
            className="px-4 py-2 bg-white text-blue-600 rounded font-bold"
          >
            Install Now
          </button>
        </div>
      </div>
    </div>
  );
}