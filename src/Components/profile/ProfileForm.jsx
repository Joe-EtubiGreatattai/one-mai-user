import React, { useState, useEffect, useRef } from "react";
import { FiUpload } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";

const ProfileForm = ({ user, updateProfile, darkMode, setError, setSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [avatar, setAvatar] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
      });
      
      // Reset image states when user changes
      setImageError(false);
      setAvatar("");
      
      if (user.image) {
        determineImageUrl(user.image);
      }
    }
  }, [user]);

  // Reset file input when selection is cleared
  useEffect(() => {
    if (!selectedFile && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [selectedFile]);

  const determineImageUrl = (url) => {
    if (!url) return;

    // If it's already a full URL, use it directly
    if (url.startsWith('http')) {
      setAvatar(url);
      return;
    }

    // Check both possible paths
    const baseUrl = 'https://api.joinonemai.com';
    const possibleUrls = [];

    if (url.startsWith('/')) {
      // Handle both /upload and /uploads prefixes
      if (url.startsWith('/uploads/')) {
        possibleUrls.push(`${baseUrl}${url}`);
        possibleUrls.push(`${baseUrl}${url.replace('/uploads/', '/upload/')}`);
      } else if (url.startsWith('/upload/')) {
        possibleUrls.push(`${baseUrl}${url}`);
        possibleUrls.push(`${baseUrl}${url.replace('/upload/', '/uploads/')}`);
      } else {
        // If path starts with / but not with upload(s), try both
        possibleUrls.push(`${baseUrl}/uploads${url}`);
        possibleUrls.push(`${baseUrl}/upload${url}`);
      }
    } else {
      // If it's not a path, just use as is
      setAvatar(url);
      return;
    }

    // Try to find the first valid URL
    for (const testUrl of possibleUrls) {
      const img = new Image();
      img.onload = () => {
        setAvatar(testUrl);
        return;
      };
      img.onerror = () => {};
      img.src = testUrl;
    }

    // If none worked, mark as error to show fallback
    setImageError(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError("");
    setImageError(false);

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setFileError("Please select an image file (JPG, JPEG, PNG)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFileError("Image must be less than 2MB");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = new FormData();
      data.append('firstName', formData.firstName.trim());
      data.append('lastName', formData.lastName.trim());
      data.append('phoneNumber', formData.phoneNumber.trim());

      if (selectedFile) {
        data.append('profileImage', selectedFile);
      }

      await updateProfile(data);
      setSuccess("Profile updated successfully!");
      setSelectedFile(null);
    } catch (error) {
      setError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4 px-4 py-6">
      <h2 className={`text-center text-xl md:text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Profile Information
      </h2>

      {/* Profile Picture */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative group">
          {!imageError && avatar ? (
            <img
              src={avatar}
              alt="Profile"
              className="h-24 w-24 rounded-full object-cover border-2 border-indigo-100 dark:border-gray-600"
              onError={() => setImageError(true)}
            />
          ) : (
            <FaUserCircle className="h-24 w-24 text-gray-400 dark:text-gray-300" />
          )}
          <div className={`absolute inset-0 rounded-full flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition ${darkMode ? 'text-white' : 'text-white'}`}>
            <FiUpload className="h-6 w-6" />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <label className={`cursor-pointer ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} text-sm md:text-base flex items-center transition`}>
            <FiUpload className="mr-1 h-4 w-4" />
            <span>Change Photo</span>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg, image/png, image/jpg"
              onChange={handleFileChange}
              ref={fileInputRef}
              key={selectedFile ? 'file-selected' : 'file-empty'}
            />
          </label>
          {fileError && (
            <p className="mt-1 text-xs text-red-500">{fileError}</p>
          )}
        </div>
      </div>

      {/* First Name */}
      <div>
        <label className={`block mb-2 text-sm md:text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          First Name*
        </label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          required
          minLength="2"
          maxLength="50"
        />
      </div>

      {/* Last Name */}
      <div>
        <label className={`block mb-2 text-sm md:text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Last Name*
        </label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          required
          minLength="2"
          maxLength="50"
        />
      </div>

      {/* Phone Number */}
      <div>
        <label className={`block mb-2 text-sm md:text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Phone Number*
        </label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          pattern="^[\d\s\+\-\(\)]{10,15}$"
          title="10-15 digits with optional + - () symbols"
          required
        />
        <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Format: 123-456-7890 or +1 (123) 456-7890
        </p>
      </div>

      {/* Save Button */}
      <button
        type="submit"
        className={`w-full mt-6 py-3 px-4 rounded-lg font-medium shadow transition flex items-center justify-center ${darkMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${darkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </button>
    </form>
  );
};

export default ProfileForm;