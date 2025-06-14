import React, { useState } from 'react';
import { FiX, FiSave, FiImage } from 'react-icons/fi';

const GroupSettingsModal = ({ currentSettings, onClose, onSave }) => {
  const [settings, setSettings] = useState(currentSettings);
  const [imagePreview, setImagePreview] = useState(currentSettings.image);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setSettings(prev => ({ ...prev, image: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(settings);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-md mx-auto shadow-2xl transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4 sm:p-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-t-lg">
          <h3 className="text-xl sm:text-2xl font-semibold">Group Settings</h3>
          <button 
            onClick={onClose} 
            className="text-gray-200 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <FiX size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-800 mb-2 sm:mb-3">
              Group Name
            </label>
            <input
              type="text"
              name="name"
              value={settings.name}
              onChange={handleChange}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-800 mb-2 sm:mb-3">
              Description
            </label>
            <textarea
              name="description"
              value={settings.description}
              onChange={handleChange}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              rows="3"
            />
          </div>

          {/* Group Image */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-800 mb-2 sm:mb-3">
              Group Image
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src={imagePreview || "https://via.placeholder.com/100"} 
                  alt="Group" 
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover border-2 sm:border-4 border-white shadow-md"
                />
                <label 
                  className="absolute -bottom-1 -right-1 bg-white p-1 sm:p-2 rounded-full shadow-md cursor-pointer hover:shadow-lg transition"
                  aria-label="Change group image"
                >
                  <FiImage className="text-gray-600 w-3 h-3 sm:w-4 sm:h-4" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Frequency and Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-800 mb-2 sm:mb-3">
                Frequency
              </label>
              <select
                name="frequency"
                value={settings.frequency}
                onChange={handleChange}
                className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-800 mb-2 sm:mb-3">
                Amount ($)
              </label>
              <input
                type="number"
                name="savingsAmount"
                value={settings.savingsAmount}
                onChange={handleChange}
                min="1"
                className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 sm:pt-6 border-t flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 transition"
            >
              <FiSave size={16} className="sm:w-5 sm:h-5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupSettingsModal;