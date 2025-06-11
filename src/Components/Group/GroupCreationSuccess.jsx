import React, { useState, useEffect } from 'react';
import { FiCheck, FiCopy, FiShare2, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const GroupCreationSuccess = ({ groupData }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join/${groupData.inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareGroup = async () => {
    try {
      const shareData = {
        title: `Join my savings group: ${groupData.name}`,
        text: `I've created a new savings group "${groupData.name}". Join me using this link:`,
        url: `${window.location.origin}/join/${groupData.inviteCode}`
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        copyInviteLink();
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  return (
    <div className={`bg-gray-50 flex items-center justify-center ${isMobile ? 'p-4 min-h-screen' : 'p-6 min-h-screen'}`}>
      <div className={`bg-white rounded-xl shadow-md overflow-hidden ${isMobile ? 'w-full p-6' : 'max-w-md w-full p-8'} text-center`}>
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <FiCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'} text-gray-800 mb-3`}>
          Group Created Successfully!
        </h1>
        <p className="text-gray-600 mb-6">
          Your new group <span className="font-medium text-blue-600">"{groupData.name}"</span> is ready to use.
        </p>

        {/* Group Info Card */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-center mb-3">
            <FiUsers className="text-blue-500 mr-2" />
            <span className="font-medium text-gray-700">Invite Code:</span>
          </div>
          <div className="flex justify-between items-center bg-white rounded-md p-2 border border-gray-200">
            <code className="text-sm font-mono text-gray-800 overflow-x-auto">
              {groupData.inviteCode}
            </code>
            <button 
              onClick={copyInviteLink}
              className="ml-2 p-1 text-blue-500 hover:text-blue-600 rounded hover:bg-blue-100 transition-colors"
              aria-label="Copy invite code"
            >
              <FiCopy size={18} />
            </button>
          </div>
          {copied && (
            <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            className={`w-full flex items-center justify-center py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
              isMobile ? 'text-sm' : ''
            }`}
            onClick={() => navigate(`/groups/${groupData.inviteCode}`)}
          >
            Go to Group Dashboard
          </button>
          
          <button
            className={`w-full flex items-center justify-center py-3 px-4 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors ${
              isMobile ? 'text-sm' : ''
            }`}
            onClick={shareGroup}
          >
            <FiShare2 className="mr-2" size={18} />
            Share Invite Link
          </button>
        </div>

        {/* Next Steps */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Next Steps:</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Invite members using the share button</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Set up your first savings target</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Schedule your first contribution</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GroupCreationSuccess;