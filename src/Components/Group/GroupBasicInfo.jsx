import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiUpload, FiX, FiImage } from "react-icons/fi";

const GroupBasicInfo = ({
  groupData,
  setGroupData,
  previewImage,
  setPreviewImage,
  setCurrentStep,
  handleFileChange,
  removeImage,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isImageHovered, setIsImageHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={`  flex items-center justify-center`}>
      <div className={`bg-white rounded-xl  overflow-hidden w-[60%] `}>
        {/* Header Section */}
        <div className="flex items-center mb-2">
          <button
            onClick={() => setCurrentStep(1)}
            className="text-gray-500 hover:text-gray-700 mr-2 transition-colors duration-200"
            aria-label="Go back"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Create Group</h1>
        </div>

        <p className="sm-para ">
          Your new group where you and your friends can start saving.
        </p>

        {/* Image Upload Section */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="relative mb-4 cursor-pointer"
            onMouseEnter={() => setIsImageHovered(true)}
            onMouseLeave={() => setIsImageHovered(false)}
            onClick={() =>
              document.getElementById("group-image-upload").click()
            }
          >
            {previewImage ? (
              <div className="relative group">
                <img
                  src={previewImage}
                  alt="Group preview"
                  className={`w-24 h-24 rounded-full object-cover border-2 ${
                    isImageHovered ? "border-blue-400" : "border-gray-200"
                  } transition-all duration-200`}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200"
                  aria-label="Remove image"
                >
                  <FiX size={14} />
                </button>
                {isImageHovered && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center">
                    <FiUpload className="text-white" size={20} />
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`w-24 h-24 rounded-full ${
                  isImageHovered ? "bg-blue-100" : "bg-gray-100"
                } flex items-center justify-center transition-colors duration-200 border-2 ${
                  isImageHovered ? "border-blue-400" : "border-gray-200"
                }`}
              >
                <FiImage className="text-gray-400" size={24} />
              </div>
            )}
            <input
              id="group-image-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>

          {/* Group Name Input */}
          <div className="w-full mb-4">
            <label
              htmlFor="group-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Group Name*
            </label>
            <input
              id="group-name"
              type="text"
              name="name"
              value={groupData.name}
              onChange={handleInputChange}
              placeholder="e.g., Family Savings"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition"
              required
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {groupData.name.length}/50
            </p>
          </div>

          {/* Group Description Input */}
          {/* <div className="w-full">
            <label
              htmlFor="group-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (optional)
            </label>
            <textarea
              id="group-description"
              name="description"
              value={groupData.description}
              onChange={handleInputChange}
              placeholder="What's this group about?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition"
              rows="3"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {groupData.description.length}/200
            </p>
          </div> */}
        </div>

        {/* Navigation Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 ${
              isMobile ? "text-sm" : ""
            }`}
          >
            Back
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            className={`flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 ${
              isMobile ? "text-sm" : ""
            } ${!groupData.name ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!groupData.name}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupBasicInfo;
