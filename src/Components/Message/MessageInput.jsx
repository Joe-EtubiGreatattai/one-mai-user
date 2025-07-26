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
    <div className="bg-white border-t border-gray-200 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-center gap-3 bg-gray-50 rounded-2xl p-3 border border-gray-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-200">
          {/* Attachment Button */}
         
          
          {/* Message Input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            className={`flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-base ${
              !isConnected ? 'cursor-not-allowed' : ''
            }`}
            onKeyPress={handleKeyPress}
            disabled={!isConnected || isSending}
            aria-label="Message input"
          />
          
          {/* Microphone Button */}
         
          
          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || !isConnected || isSending}
            className={`p-2.5 rounded-xl transition-all duration-200 transform ${
              !message.trim() || !isConnected || isSending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 shadow-lg hover:shadow-xl'
            } ${isSending ? 'animate-pulse' : ''}`}
            aria-label="Send message"
          >
            <FiSend size={18} />
          </button>
        </div>
        
        {/* Connection Status */}
        {!isConnected && (
          <div className="flex items-center justify-center mt-3">
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              Connecting to chat service...
            </div>
          </div>
        )}
        
        {/* Typing Indicator (when sending) */}
        {isSending && isConnected && (
          <div className="flex items-center justify-center mt-3">
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              Sending message...
            </div>
          </div>
        )}
        
        {/* Character Count (optional) */}
        {message.length > 0 && (
          <div className="text-xs text-gray-400 text-right mt-2">
            {message.length} characters
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInput;