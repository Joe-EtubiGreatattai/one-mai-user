import React, { useEffect, useRef, useState } from 'react';
import { FiShield, FiTrash2, FiChevronDown } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';

const MessageList = ({ groupMessages, currentUser, onDeleteMessage }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // Sort messages by creation date to ensure proper order (oldest first)
  const sortedMessages = groupMessages?.data 
    ? [...groupMessages.data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    : [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (sortedMessages.length > 0 && !isAutoScrolling) {
      scrollToBottom();
    }
  }, [sortedMessages.length]);

  // Check if user has scrolled up to show/hide scroll button
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isAtBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    setIsAutoScrolling(true);
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
    
    // Reset auto-scrolling flag after animation
    setTimeout(() => {
      setIsAutoScrolling(false);
    }, 500);
  };

  const handleScrollButtonClick = () => {
    scrollToBottom();
    setShowScrollButton(false);
  };

  if (!groupMessages?.data || !Array.isArray(groupMessages.data)) {
    return (
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 w-full max-w-sm">
        <div className="text-center px-2">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm font-medium">No messages yet</p>
          <p className="text-gray-400 text-xs mt-1">Start chatting!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-gray-100 w-full max-w-sm">
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        {sortedMessages.map((msg) => {
          const isCurrentUser = msg.sender?._id === currentUser?._id;

          return (
            <div
              key={msg._id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-3 shadow-md hover:shadow-lg transition-all duration-200 relative ${
                  isCurrentUser
                    ? 'bg-[#3390d5] text-white'
                    : 'bg-white text-gray-800 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Sender Info */}
                {!isCurrentUser && msg.sender && (
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-700 truncate">
                      {msg.sender.name || msg.sender.email || 'Unknown User'}
                    </span>

                    {msg.sender.role === 'admin' && (
                      <span className="flex items-center gap-1 text-amber-700 text-xs bg-gradient-to-r from-amber-100 to-yellow-100 px-1.5 py-0.5 rounded-full border border-amber-200">
                        <FaCrown className="text-amber-600 h-2.5 w-2.5" />
                        <span className="hidden sm:inline">Admin</span>
                      </span>
                    )}

                    {msg.sender.role === 'moderator' && (
                      <span className="flex items-center gap-1 text-emerald-700 text-xs bg-gradient-to-r from-emerald-100 to-teal-100 px-1.5 py-0.5 rounded-full border border-emerald-200">
                        <FiShield className="text-emerald-600 h-2.5 w-2.5" />
                        <span className="hidden sm:inline">Mod</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Message Text */}
                <div className={`text-xs leading-relaxed break-words ${
                  isCurrentUser ? 'text-white' : 'text-gray-800'
                }`}>
                  {msg.text}
                </div>

                {/* Timestamp + Delete */}
                <div className="flex justify-between items-center mt-2 text-xs">
                  <span className={`${
                    isCurrentUser ? 'text-white/80' : 'text-gray-500'
                  } font-medium text-xs`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>

                  {/* Uncomment to enable delete functionality */}
                  {/* {isCurrentUser && !msg.isSending && (
                    <button
                      onClick={() => onDeleteMessage && onDeleteMessage(msg._id)}
                      className="flex items-center gap-1 text-white/80 hover:text-white text-xs hover:bg-white/10 px-2 py-1 rounded-md transition-all duration-200"
                      aria-label="Delete message"
                    >
                      <FiTrash2 className="h-3 w-3" />
                      Delete
                    </button>
                  )} */}
                </div>

                {/* Message tail for speech bubble effect */}
                <div className={`absolute top-4 ${
                  isCurrentUser 
                    ? '-right-2 border-l-8 border-l-[#3390d5] border-t-4 border-b-4 border-t-transparent border-b-transparent' 
                    : '-left-2 border-r-8 border-r-white border-t-4 border-b-4 border-t-transparent border-b-transparent'
                } w-0 h-0`}></div>
              </div>
            </div>
          );
        })}
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Back to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={handleScrollButtonClick}
          className="absolute bottom-4 right-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-10 flex items-center justify-center animate-in slide-in-from-bottom-4"
          aria-label="Scroll to bottom"
        >
          <FiChevronDown className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default MessageList;