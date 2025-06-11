import React from 'react';
import { FiUser, FiShield } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';

const MessageList = ({ groupMessages, currentUser, onDeleteMessage }) => {
  if (!groupMessages?.data || !Array.isArray(groupMessages.data)) {
    return (
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50">
      {groupMessages.data.map((msg) => {
        const isCurrentUser = msg.sender?._id === currentUser?._id;
        
        return (
          <div 
            key={msg._id} 
            className={`mb-3 sm:mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[75%] sm:max-w-xs md:max-w-md rounded-lg p-2 sm:p-3 ${
                isCurrentUser 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              {/* Sender Info */}
              {!isCurrentUser && msg.sender && (
                <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                  <div className="font-semibold text-xs sm:text-sm truncate">
                    {msg.sender.name || msg.sender.email || 'Unknown User'}
                  </div>
                  {msg.sender.role === 'admin' && (
                    <span className="bg-purple-100 text-purple-800 text-2xs sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex items-center">
                      <FaCrown className="inline mr-0.5 sm:mr-1 w-2 h-2 sm:w-3 sm:h-3" /> 
                      <span>Admin</span>
                    </span>
                  )}
                  {msg.sender.role === 'moderator' && (
                    <span className="bg-blue-100 text-blue-800 text-2xs sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex items-center">
                      <FiShield className="inline mr-0.5 sm:mr-1 w-2 h-2 sm:w-3 sm:h-3" /> 
                      <span>Moderator</span>
                    </span>
                  )}
                </div>
              )}

              {/* Message Text */}
              <div className="text-xs sm:text-sm break-words">{msg.text}</div>

              {/* Message Meta */}
              <div className={`flex items-center text-2xs sm:text-xs mt-1 ${
                isCurrentUser ? 'text-blue-100' : 'text-gray-500'
              }`}>
                <span>
                  {new Date(msg.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    ...(window.innerWidth < 640 ? {} : {
                      day: 'numeric',
                      month: 'short'
                    })
                  })}
                </span>
                
                {/* Delete Button */}
                {isCurrentUser && !msg.isSending && (
                  <button 
                    onClick={() => onDeleteMessage && onDeleteMessage(msg._id)}
                    className={`ml-2 hover:underline ${
                      isCurrentUser ? 'hover:text-blue-200' : 'hover:text-gray-600'
                    }`}
                    aria-label="Delete message"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;