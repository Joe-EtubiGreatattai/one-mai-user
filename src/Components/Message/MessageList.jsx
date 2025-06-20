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
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-gray-50 rounded-md">
        <p className="text-gray-400 text-sm">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col">
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        {sortedMessages.map((msg) => {
          const isCurrentUser = msg.sender?._id === currentUser?._id;

          return (
            <div
              key={msg._id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] sm:max-w-[70%] md:max-w-[60%] rounded-xl p-3 shadow-sm relative ${
                  isCurrentUser
                    ? 'bg-[#3390d5] text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                {/* Sender Info */}
                {!isCurrentUser && msg.sender && (
                  <div className="flex items-center gap-2 mb-1 flex-wrap text-sm font-semibold">
                    <span className="truncate">{msg.sender.name || msg.sender.email || 'Unknown User'}</span>

                    {msg.sender.role === 'admin' && (
                      <span className="flex items-center gap-1 text-purple-700 text-xs bg-purple-100 px-2 py-0.5 rounded-full">
                        <FaCrown className="text-purple-500 h-3 w-3" />
                        Admin
                      </span>
                    )}

                    {msg.sender.role === 'moderator' && (
                      <span className="flex items-center gap-1 text-blue-700 text-xs bg-blue-100 px-2 py-0.5 rounded-full">
                        <FiShield className="text-blue-500 h-3 w-3" />
                        Moderator
                      </span>
                    )}
                  </div>
                )}

                {/* Message Text */}
                <div className="text-sm break-words">{msg.text}</div>

                {/* Timestamp + Delete */}
                <div className="flex justify-between items-center mt-2 text-xs opacity-80">
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      ...(window.innerWidth >= 640 && {
                        day: 'numeric',
                        month: 'short',
                      }),
                    })}
                  </span>

                  {/* Uncomment to enable delete functionality */}
                  {/* {isCurrentUser && !msg.isSending && (
                    <button
                      onClick={() => onDeleteMessage && onDeleteMessage(msg._id)}
                      className="flex items-center gap-1 text-white text-xs hover:underline"
                      aria-label="Delete message"
                    >
                      <FiTrash2 className="h-3 w-3" />
                      Delete
                    </button>
                  )} */}
                </div>
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
          className="absolute bottom-4 right-4 bg-[#3390d5] text-white p-3 rounded-full shadow-lg hover:bg-[#2c7bb8] transition-all duration-200 z-10 flex items-center justify-center"
          aria-label="Scroll to bottom"
        >
          <FiChevronDown className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default MessageList;