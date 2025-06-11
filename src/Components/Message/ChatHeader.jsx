import React from 'react';
import { FiMoreVertical, FiBell, FiLink, FiLogOut } from 'react-icons/fi';

const ChatHeader = ({ currentGroup, showMoreOptions, setShowMoreOptions, copyGroupLink, leaveGroup }) => {
  console.log("currentGroup chatheadr",currentGroup);
  return (
    <div className="bg-white border-b border-gray-100 px-3 sm:px-4 md:px-6 py-3 flex justify-between items-center">
      {/* Group Info Section */}
      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 overflow-hidden">
        <div className="relative flex-shrink-0">
          <img 
        src={`https://api.joinonemai.com${currentGroup?.image}`} 
            alt={currentGroup?.name} 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
          />
          <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"></span>
        </div>
        
        <div className="min-w-0">
          <h2 className="font-semibold text-sm sm:text-base truncate">
            {currentGroup?.name || 'Loading...'}
          </h2>
          
          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
            <p className="text-xs text-gray-500 whitespace-nowrap">
              {currentGroup?.members?.filter(m => m.isActive).length || 0} active
            </p>
            
            {currentGroup?.admin?.email && (
              <p className="hidden xs:inline-block text-xs text-gray-400 truncate max-w-[120px] sm:max-w-[160px]">
                Admin: {currentGroup.admin.email.split('@')[0]}
              </p>
            )}
            
            {currentGroup?.description && (
              <p className="hidden sm:inline-block text-xs text-gray-400 truncate max-w-[120px] md:max-w-[200px]">
                {currentGroup.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 relative">
        <button 
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Notifications"
        >
          <FiBell size={18} className="sm:w-5 sm:h-5" />
        </button>
        
        <div className="relative">
          <button 
            className="text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            aria-label="More options"
            aria-expanded={showMoreOptions}
          >
            <FiMoreVertical size={18} className="sm:w-5 sm:h-5" />
          </button>
          
          {showMoreOptions && (
            <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
              <button
                onClick={copyGroupLink}
                className="flex items-center px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                aria-label="Copy group link"
              >
                <FiLink className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                Copy Group Link
              </button>
              <button
                onClick={leaveGroup}
                className="flex items-center px-3 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                aria-label="Leave group"
              >
                <FiLogOut className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                Leave Group
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;