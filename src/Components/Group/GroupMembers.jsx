import React, { useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiCopy,
  FiShare2,
  FiUserPlus,
  FiCheck,
} from "react-icons/fi";

const GroupMembers = ({
  groupData,
  setCurrentStep,
  handleCreateGroup,
  loading,
  copyToClipboard,
  shareLink,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [copied, setCopied] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCopy = () => {
    copyToClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await shareLink();
    } catch (error) {
      console.error("Sharing failed:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
    // Filter members logic would go here
  };

  const handleAddMember = () => {
    // Implementation for adding members would go here
    console.log("Add member functionality");
  };

  return (
    <div className={`flex items-center justify-center w-[60%] m-auto`}>
      <div className={`bg-white rounded-xl  overflow-hidden`}>
        {/* Header Section */}
        <div className="flex items-center mb-2">
          <button
            onClick={() => setCurrentStep(3)}
            className="text-gray-500 hover:text-gray-700 mr-2 transition-colors duration-200"
            aria-label="Go back"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1
            className={`font-bold ${
              isMobile ? "text-xl" : "text-2xl"
            } text-gray-800`}
          >
            Add Group Members
          </h1>
        </div>

        <p className="sm-para">
          Invite friends to join your group by sharing the invite code
        </p>

        {/* Invite Code Section */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Group Invite Code
              </h3>
              <p className="text-xs text-gray-500">
                Share this code to invite members
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-[#3390d5] hover:text-[#3390d5] rounded-full hover:bg-[#3390d5] transition-colors"
                aria-label="Share invite link"
              >
                <FiShare2 size={18} />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 text-[#3390d5] hover:text-[#3390d5] rounded-full hover:bg-[#3390d5] transition-colors"
                aria-label="Copy invite code"
              >
                {copied ? (
                  <FiCheck size={18} className="text-green-500" />
                ) : (
                  <FiCopy size={18} />
                )}
              </button>
            </div>
          </div>
          <div className="bg-white rounded-md p-3 border border-gray-200 flex justify-between items-center">
            <code className="font-mono font-bold text-gray-800 truncate">
              {groupData.inviteCode}
            </code>
            {copied && (
              <span className="text-xs text-green-600 ml-2">Copied!</span>
            )}
          </div>
        </div>

        {/* Member Search/Add Section */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">Add Members</h3>
            <span className="ml-auto text-xs text-gray-500">
              {members.length} member{members.length !== 1 ? "s" : ""} added
            </span>
          </div>
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchInput}
              onChange={handleSearch}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition"
            />
            <button
              onClick={handleAddMember}
              className="p-2 bg-[#3390d5] text-white rounded-lg hover:bg-[#3390d5] transition-colors"
              aria-label="Add member"
            >
              <FiUserPlus size={18} />
            </button>
          </div>
          {/* Member list would be rendered here */}
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-500">
              Members you add will appear here
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep(3)}
            className={`flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors ${
              isMobile ? "text-sm" : ""
            }`}
          >
            Back
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={loading}
            className={`flex-1 bg-[#3390d5] text-white py-2 rounded-lg hover:bg-[#3390d5] transition-colors ${
              isMobile ? "text-sm" : ""
            } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating...
              </span>
            ) : (
              "Create Group"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupMembers;
