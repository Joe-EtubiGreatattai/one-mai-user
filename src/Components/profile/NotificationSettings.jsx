import React from "react";

const NotificationSettings = ({ darkMode }) => {
  return (
    <div className="px-2 py-4 md:px-6 md:py-8">
      <h2 className={`text-xl md:text-2xl font-bold mb-4 md:mb-8 text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Notification Settings
      </h2>
      
      <div className="w-full md:max-w-lg md:mx-auto space-y-4 md:space-y-8">
        {/* Push Notifications Card */}
        <div className={`p-4 md:p-8 rounded-lg md:shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`font-semibold mb-3 md:mb-6 text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Push Notifications
          </h3>
          
          <div className="space-y-3 md:space-y-6">
            {/* App Announcements */}
            <div className="flex justify-between items-center">
              <div className="mr-4">
                <span className={`block font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  App Announcements
                </span>
                <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Important updates about the app
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  defaultChecked 
                  aria-label="Toggle App Announcements"
                />
                <div className={`w-11 h-6 md:w-12 md:h-7 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 md:after:h-6 md:after:w-6 after:transition-all ${
                  darkMode 
                    ? 'bg-gray-700 peer-checked:bg-[#3390d5] after:border-gray-600' 
                    : 'bg-gray-200 peer-checked:bg-[#3390d5] after:border-gray-300'
                }`}></div>
              </label>
            </div>

            {/* Payment Alerts */}
            <div className="flex justify-between items-center">
              <div className="mr-4">
                <span className={`block font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Payment Alerts
                </span>
                <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Instant notifications for payments
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  defaultChecked 
                  aria-label="Toggle Payment Alerts"
                />
                <div className={`w-11 h-6 md:w-12 md:h-7 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 md:after:h-6 md:after:w-6 after:transition-all ${
                  darkMode 
                    ? 'bg-gray-700 peer-checked:bg-[#3390d5] after:border-gray-600' 
                    : 'bg-gray-200 peer-checked:bg-[#3390d5] after:border-gray-300'
                }`}></div>
              </label>
            </div>

            {/* Group Notifications */}
            <div className="flex justify-between items-center">
              <div className="mr-4">
                <span className={`block font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Group Notifications
                </span>
                <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Updates from your groups
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  defaultChecked 
                  aria-label="Toggle Group Notifications"
                />
                <div className={`w-11 h-6 md:w-12 md:h-7 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 md:after:h-6 md:after:w-6 after:transition-all ${
                  darkMode 
                    ? 'bg-gray-700 peer-checked:bg-[#3390d5] after:border-gray-600' 
                    : 'bg-gray-200 peer-checked:bg-[#3390d5] after:border-gray-300'
                }`}></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Preferences Card */}
        <div className={`p-4 md:p-8 rounded-lg md:shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`font-semibold mb-3 md:mb-6 text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Notification Preferences
          </h3>
          
          <div className="space-y-3 md:space-y-6">
            {/* Sound Alerts */}
            <div className="flex justify-between items-center">
              <div className="mr-4">
                <span className={`block font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sound Alerts
                </span>
                <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Play sound for notifications
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  aria-label="Toggle Sound Alerts"
                />
                <div className={`w-11 h-6 md:w-12 md:h-7 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 md:after:h-6 md:after:w-6 after:transition-all ${
                  darkMode 
                    ? 'bg-gray-700 peer-checked:bg-[#3390d5] after:border-gray-600' 
                    : 'bg-gray-200 peer-checked:bg-[#3390d5] after:border-gray-300'
                }`}></div>
              </label>
            </div>

            {/* Vibration */}
            <div className="flex justify-between items-center">
              <div className="mr-4">
                <span className={`block font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Vibration
                </span>
                <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Vibrate for important notifications
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  defaultChecked 
                  aria-label="Toggle Vibration"
                />
                <div className={`w-11 h-6 md:w-12 md:h-7 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 md:after:h-6 md:after:w-6 after:transition-all ${
                  darkMode 
                    ? 'bg-gray-700 peer-checked:bg-[#3390d5] after:border-gray-600' 
                    : 'bg-gray-200 peer-checked:bg-[#3390d5] after:border-gray-300'
                }`}></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;