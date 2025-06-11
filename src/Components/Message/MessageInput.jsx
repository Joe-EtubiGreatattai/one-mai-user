import React from 'react';
import { FiPaperclip, FiMic, FiSend } from 'react-icons/fi';

const MessageInput = ({ 
  message, 
  setMessage, 
  handleSendMessage, 
  isSending,
  isConnected
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-3 sm:p-4">
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Attachment Button */}
        <button 
          className="text-gray-500 hover:text-gray-700 p-1 sm:p-2 transition-colors"
          aria-label="Attach file"
        >
          <FiPaperclip size={18} className="sm:w-5 sm:h-5" />
        </button>
        
        {/* Message Input */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          className={`flex-1 border border-gray-300 rounded-full py-2 px-3 sm:py-2 sm:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
            !isConnected ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          onKeyPress={handleKeyPress}
          disabled={!isConnected || isSending}
          aria-label="Message input"
        />
        
        {/* Microphone Button */}
        <button 
          className="text-gray-500 hover:text-gray-700 p-1 sm:p-2 transition-colors"
          aria-label="Voice message"
        >
          <FiMic size={18} className="sm:w-5 sm:h-5" />
        </button>
        
        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || !isConnected || isSending}
          className={`rounded-full p-1 sm:p-2 transition-colors ${
            !message.trim() || !isConnected || isSending
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          aria-label="Send message"
        >
          <FiSend size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>
      
      {/* Connection Status */}
      {!isConnected && (
        <div className="text-xs text-red-500 mt-1 animate-pulse">
          Connecting to chat service...
        </div>
      )}
    </div>
  );
};

export default MessageInput;