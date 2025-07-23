// ChatLayout.jsx
import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import RecentActivity from './RecentActivity';

const ChatLayout = ({ currentGroup, ...props }) => {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <ChatHeader currentGroup={currentGroup} {...props} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Recent Activity - Main Section (takes 70% width) */}
        <div className="w-full md:w-7/12 lg:w-8/12 border-r border-gray-200 overflow-y-auto">
          <RecentActivity />
        </div>

        {/* Messaging - Side Section (takes 30% width) */}
        <div className="hidden md:flex flex-col w-5/12 lg:w-4/12 bg-gray-50">
          <div className="flex-1 overflow-y-auto">
            <MessageList {...props} />
          </div>
          <MessageInput {...props} />
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;